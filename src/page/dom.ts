// What the agent sees of a page and how it acts on one. Runs in the page's isolated world
// (content.ts) and under jsdom in the tests, so it touches nothing but the DOM.

export type StepAction = 'fill' | 'select' | 'check' | 'uncheck' | 'click' | 'press'
export type Step = { action: StepAction; ref: string; value?: string }
export type StepResult = { ref: string; action: StepAction; ok: boolean; error?: string }

export type Outline = { outline: string; elements: number; matched: boolean; busy: boolean }
export type TableData = {
  columns: string[]
  rows: string[][]
  total_rows: number
  offset: number
  note?: string
}

const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'HEAD', 'META', 'LINK', 'SVG', 'CANVAS', 'VIDEO', 'AUDIO'])
const BLOCK = new Set([
  'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'BODY', 'DD', 'DETAILS', 'DIV', 'DL', 'DT', 'FIELDSET', 'FIGURE',
  'FOOTER', 'FORM', 'HEADER', 'HR', 'LI', 'MAIN', 'NAV', 'OL', 'P', 'PRE', 'SECTION', 'TABLE', 'TBODY', 'THEAD',
  'TFOOT', 'TR', 'UL', 'BR', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LABEL',
])
const INTERACTIVE_ROLES = new Set([
  'button', 'link', 'textbox', 'searchbox', 'combobox', 'checkbox', 'radio', 'switch', 'tab', 'menuitem',
  'menuitemcheckbox', 'menuitemradio', 'option', 'spinbutton', 'slider',
])
const TABLE_ROLES = new Set(['table', 'grid', 'treegrid'])
const CELL_SELECTOR = 'td, th, [role="cell"], [role="gridcell"], [role="columnheader"], [role="rowheader"]'
const ROW_SELECTOR = 'tr, [role="row"]'
const OUTLINE_TABLE_ROWS = 25
const NAME_CHARS = 90
const VALUE_CHARS = 300
const OUTLINE_CAP = 200_000
const FORM_TAGS = new Set(['INPUT', 'SELECT', 'TEXTAREA'])
const NESTED = 'a[href], button, input, select, textarea, [role="button"], [role="link"], table, p, li, h1, h2, h3, h4'
const SECRET_AUTOCOMPLETE = /^(cc-|current-password|new-password|one-time-code)/

export class Registry {
  private refs = new Map<string, WeakRef<Element>>()
  private ids = new WeakMap<Element, string>()
  private next = 1
  /** Set per read so a ref says which tab and frame own it: `f3:e12`, or `bg:e12` in the background tab. */
  prefix = ''

  idFor(el: Element, prefix: 'e' | 't'): string {
    const known = this.ids.get(el)
    if (known) return this.prefix + known
    const id = `${prefix}${this.next}`
    this.next += 1
    this.ids.set(el, id)
    this.refs.set(id, new WeakRef(el))
    return this.prefix + id
  }

  get(ref: string): Element | null {
    const el = this.refs.get(ref.replace(/^\[|\]$/g, '').replace(/^(bg:)?(f\d+:)?/, ''))?.deref()
    return el && el.isConnected ? el : null
  }
}

function squash(text: string | null | undefined): string {
  return (text ?? '').replace(/\s+/g, ' ').trim()
}

/** Text as rendered: innerText skips hidden menus (OrangeHRM puts "Ascending Descending" in every header). jsdom has no innerText. */
function shownText(el: Element): string {
  const inner = (el as HTMLElement).innerText
  return squash(typeof inner === 'string' ? inner : el.textContent)
}

/** A label that sits beside the field instead of naming it (OrangeHRM's oxd-input-group, many JSP forms). */
function nearbyLabel(el: Element): string | null {
  let node: Element | null = el
  for (let depth = 0; node && depth < 4; depth++, node = node.parentElement) {
    const label = node.parentElement?.querySelector(':scope > label, :scope > * > label, :scope > [class*="label" i]')
    if (label && !label.contains(el) && !label.querySelector('input, select, textarea, button')) {
      const text = squash(label.textContent)
      if (text && text.length < 60) return text
    }
  }
  return null
}

/** Custom dropdowns drawn as focusable divs (oxd-select, many design systems). */
function isCustomSelect(el: Element): boolean {
  const tab = el.getAttribute('tabindex')
  return tab !== null && Number(tab) >= 0 && /select|dropdown|combo/i.test(el.getAttribute('class') ?? '') && !el.querySelector('input, select, textarea, button, a[href]')
}

function clip(text: string, max = NAME_CHARS): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function role(el: Element): string {
  return (el.getAttribute('role') ?? '').trim().toLowerCase()
}

function isHidden(el: Element): boolean {
  if (el.hasAttribute('hidden')) return true
  if (el instanceof HTMLInputElement && el.type === 'hidden') return true
  const style = el.ownerDocument.defaultView?.getComputedStyle(el)
  return !!style && (style.display === 'none' || style.visibility === 'hidden' || style.visibility === 'collapse')
}

export function isSecret(el: Element): boolean {
  if (!(el instanceof HTMLInputElement)) return false
  return el.type === 'password' || SECRET_AUTOCOMPLETE.test(el.autocomplete ?? '')
}

function isInteractive(el: Element): boolean {
  const tag = el.tagName
  if (tag === 'A') return el.hasAttribute('href')
  if (tag === 'BUTTON' || tag === 'SELECT' || tag === 'TEXTAREA' || tag === 'SUMMARY') return true
  if (tag === 'INPUT') return (el as HTMLInputElement).type !== 'hidden'
  if (INTERACTIVE_ROLES.has(role(el))) return true
  if (isCustomSelect(el)) return true
  return el.getAttribute('contenteditable') === 'true'
}

function isTable(el: Element): boolean {
  if (TABLE_ROLES.has(role(el))) return true
  if (el.tagName !== 'TABLE' || role(el) === 'presentation' || role(el) === 'none') return false
  // A table holding other tables and no header cells is page layout, not data.
  return !(el.querySelector('table') && !el.querySelector('th'))
}

function kind(el: Element): string {
  const r = role(el)
  // role="none" on a button (OrangeHRM's menu toggle) says nothing about what it is.
  if (r && r !== 'none' && r !== 'presentation') return r
  if (isCustomSelect(el)) return 'combobox'
  const tag = el.tagName
  if (tag === 'A') return 'link'
  if (tag === 'BUTTON' || tag === 'SUMMARY') return 'button'
  if (tag === 'SELECT') return 'select'
  if (tag === 'TEXTAREA') return 'textbox'
  if (tag === 'INPUT') {
    const type = (el as HTMLInputElement).type
    if (type === 'checkbox' || type === 'radio') return type
    if (type === 'submit' || type === 'button' || type === 'reset') return 'button'
    if (type === 'file') return 'file input'
    return type === 'text' ? 'textbox' : `${type} input`
  }
  return 'textbox'
}

function labelledBy(el: Element): string {
  const ids = (el.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean)
  return squash(ids.map((id) => el.ownerDocument.getElementById(id)?.textContent ?? '').join(' '))
}

// Icon-only controls (pagination arrows, row actions) carry their meaning only in an icon's class.
const ICON_HINTS: [RegExp, string][] = [
  [/chevron-right|arrow-right|caret-right|\bnext\b|--next/i, 'Next'],
  [/chevron-left|arrow-left|caret-left|\bprev(ious)?\b|--previous/i, 'Previous'],
  [/trash|delete|\bbin\b/i, 'Delete'],
  [/pencil|\bedit\b/i, 'Edit'],
  [/\beye\b|bi-eye|\bview\b/i, 'View'],
  [/\bplus\b|bi-plus|\badd\b/i, 'Add'],
  [/search|magnif/i, 'Search'],
  [/download/i, 'Download'],
  [/three-dots|kebab|ellipsis|\bmore\b/i, 'More'],
  [/x-lg|\bclose\b|\bx\b/i, 'Close'],
]

function iconHint(el: Element): string | null {
  const icon = el.querySelector('i, svg, [class*="icon" i]')
  // The icon says more than the button: OrangeHRM's previous and next buttons share one class.
  for (const classes of [icon?.getAttribute('class') ?? '', el.getAttribute('class') ?? '']) {
    const hit = classes.trim() ? ICON_HINTS.find(([pattern]) => pattern.test(classes)) : undefined
    if (!hit) continue
    // An arrow means next/previous page only in a pager; elsewhere it expands or collapses something.
    if ((hit[1] === 'Next' || hit[1] === 'Previous') && !el.closest('[class*="pagin" i], [class*="pager" i], nav[aria-label*="pagin" i]')) {
      return `${hit[1] === 'Next' ? 'Arrow right' : 'Arrow left'} (icon)`
    }
    return `${hit[1]} (icon)`
  }
  return null
}

export function accessibleName(el: Element, useText = true): string {
  const candidates = [
    el.getAttribute('aria-label'),
    labelledBy(el),
    el.id ? Array.from(el.ownerDocument.querySelectorAll('label')).find((label) => label.htmlFor === el.id)?.textContent : null,
    el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA' ? el.closest('label')?.textContent : null,
    FORM_TAGS.has(el.tagName) || isCustomSelect(el) ? nearbyLabel(el) : null,
    el.getAttribute('placeholder'),
    el.getAttribute('title'),
    el.getAttribute('alt'),
    el instanceof HTMLInputElement && ['submit', 'button', 'reset'].includes(el.type) ? el.value : null,
    FORM_TAGS.has(el.tagName) || !useText ? null : el.textContent,
    el.getAttribute('data-automation-id'),
    el.getAttribute('name'),
    isInteractive(el) ? iconHint(el) : null,
  ]
  for (const candidate of candidates) {
    const text = squash(candidate)
    if (text) return clip(text)
  }
  return ''
}

function currentValue(el: Element): string | null {
  if (isSecret(el)) return (el as HTMLInputElement).value ? '(hidden)' : null
  if (el instanceof HTMLInputElement) {
    if (el.type === 'checkbox' || el.type === 'radio') return el.checked ? 'checked' : 'unchecked'
    if (el.type === 'file') return null
    return el.value ? clip(el.value, VALUE_CHARS) : null
  }
  if (el instanceof HTMLTextAreaElement) return el.value ? clip(squash(el.value), VALUE_CHARS) : null
  if (el instanceof HTMLSelectElement) return clip(squash(el.selectedOptions[0]?.textContent)) || null
  const checked = el.getAttribute('aria-checked') ?? el.getAttribute('aria-selected')
  if (checked === 'true' || checked === 'false') return checked === 'true' ? 'checked' : 'unchecked'
  if (el.getAttribute('contenteditable') === 'true') return clip(squash(el.textContent)) || null
  if (isCustomSelect(el)) return clip(squash(el.textContent)) || null
  return el.getAttribute('aria-valuetext') ?? el.getAttribute('aria-valuenow')
}

/** Where a link leads, so the agent can open it: a path on this site, a full url elsewhere. */
function linkAddress(el: Element): string | null {
  if (!(el instanceof HTMLAnchorElement)) return null
  const raw = el.getAttribute('href') ?? ''
  if (!raw || raw.startsWith('#') || /^(javascript|mailto|tel):/i.test(raw)) return null
  try {
    const url = new URL(el.href)
    const here = url.origin === el.ownerDocument.location.origin
    return clip(here ? url.pathname + url.search : url.href, 160)
  } catch {
    return null
  }
}

function token(el: Element, registry: Registry, useText = true): string {
  const name = accessibleName(el, useText)
  const value = currentValue(el)
  const flags: string[] = []
  if ((el as HTMLInputElement).disabled || el.getAttribute('aria-disabled') === 'true') flags.push('disabled')
  if ((el as HTMLInputElement).required || el.getAttribute('aria-required') === 'true') flags.push('required')
  if (el.getAttribute('aria-expanded') === 'true') flags.push('expanded')
  if (el.getAttribute('aria-invalid') === 'true') flags.push('invalid')
  let text = `[${registry.idFor(el, 'e')}] ${kind(el)}`
  if (name) text += ` "${name}"`
  if (value && value !== name) text += ` = "${value}"`
  if (flags.length) text += ` (${flags.join(', ')})`
  const address = linkAddress(el)
  if (address) text += ` → ${address}`
  return text
}

function tableRows(table: Element): Element[] {
  return Array.from(table.querySelectorAll(ROW_SELECTOR)).filter((row) => closestTable(row) === table)
}

function closestTable(el: Element): Element | null {
  for (let node = el.parentElement; node; node = node.parentElement) if (isTable(node)) return node
  return null
}

function rowCells(row: Element): Element[] {
  return Array.from(row.querySelectorAll(CELL_SELECTOR)).filter((cell) => cell.closest(ROW_SELECTOR) === row)
}

class Writer {
  lines: string[] = []
  elements = 0
  private buf: string[] = []
  /** Inside a table row: block elements in a cell do not break the row's line. */
  row = false

  push(text: string): void {
    if (text) this.buf.push(text)
  }

  flush(prefix = '', endRow = false): void {
    if (this.row && !endRow) return
    const line = squash(this.buf.join(' '))
    this.buf = []
    if (line) this.lines.push(prefix + line)
  }
}

function walkChildren(parent: Node, out: Writer, registry: Registry): void {
  for (const child of Array.from(parent.childNodes)) {
    if (child.nodeType === 3) out.push(squash(child.textContent))
    else if (child.nodeType === 1) walk(child as Element, out, registry)
  }
}

function walkTable(table: Element, out: Writer, registry: Registry): void {
  const rows = tableRows(table)
  const name = accessibleName(table.querySelector('caption') ?? table)
  const caption = table.querySelector('caption') || table.getAttribute('aria-label') || labelledBy(table) ? ` "${name}"` : ''
  const outer = out.row
  out.row = false
  out.flush()
  out.lines.push(`[${registry.idFor(table, 't')}] table${caption} (${rows.length} rows)`)
  for (const row of rows.slice(0, OUTLINE_TABLE_ROWS)) {
    if (isHidden(row)) continue
    const cells = rowCells(row)
    out.row = true
    cells.forEach((cell, index) => {
      if (index) out.push('|')
      walkChildren(cell, out, registry)
    })
    out.flush('  ', true)
    out.row = false
  }
  if (rows.length > OUTLINE_TABLE_ROWS) {
    out.lines.push(`  … ${rows.length - OUTLINE_TABLE_ROWS} more rows: read them with browser_read_table`)
  }
  out.row = outer
}

function walk(el: Element, out: Writer, registry: Registry): void {
  if (SKIP.has(el.tagName.toUpperCase()) || isHidden(el)) return
  // Each frame is read by its own copy of this script (see tools.ts), never through its parent.
  if (el.tagName === 'IFRAME' || el.tagName === 'FRAME') return
  if (el.tagName === 'IMG') {
    const alt = squash(el.getAttribute('alt'))
    if (alt) out.push(`(image: ${clip(alt)})`)
    return
  }
  if (isTable(el)) {
    walkTable(el, out, registry)
    return
  }
  if (isInteractive(el)) {
    out.elements += 1
    // A card or row that is itself a link holds more than a name: keep its contents readable.
    const holdsContent = !FORM_TAGS.has(el.tagName) && (squash(el.textContent).length > NAME_CHARS || !!el.querySelector(NESTED))
    out.push(token(el, registry, !holdsContent))
    if (holdsContent) {
      out.push(':')
      walkChildren(el, out, registry)
    }
    return
  }
  const heading = /^H([1-6])$/.exec(el.tagName)
  if (heading || role(el) === 'heading') {
    const level = Number(heading?.[1] ?? el.getAttribute('aria-level') ?? 2)
    out.flush()
    out.push(squash(el.textContent))
    out.flush(`${'#'.repeat(Math.min(Math.max(level, 1), 6))} `)
    return
  }
  const block = BLOCK.has(el.tagName)
  if (block) out.flush()
  walkChildren(el, out, registry)
  if (el.shadowRoot) walkChildren(el.shadowRoot, out, registry)
  if (block) out.flush()
}

/** A spinner or progress bar is on screen: the page is still fetching what it will show. */
function isBusy(doc: Document): boolean {
  for (const el of Array.from(doc.querySelectorAll('[aria-busy="true"], [role="progressbar"], [class*="spinner" i], [class*="loading-" i]')).slice(0, 20)) {
    const box = (el as HTMLElement).getBoundingClientRect?.()
    if (box && box.width > 0 && box.height > 0 && !isHidden(el)) return true
  }
  // A type-ahead that has not answered yet shows one placeholder option ("Searching....").
  for (const el of Array.from(doc.querySelectorAll('[role="option"], [role="listbox"]')).slice(0, 20)) {
    if (/^(searching|loading|cargando|buscando|caricamento)\b[\s.…]*$/i.test(squash(el.textContent))) return true
  }
  return false
}

export function readOutline(doc: Document, registry: Registry, opts: { query?: string } = {}): Outline {
  const out = new Writer()
  if (doc.body) walk(doc.body, out, registry)
  out.flush()
  let lines = out.lines
  const query = opts.query?.trim().toLowerCase()
  if (query) {
    const keep = new Set<number>()
    lines.forEach((line, index) => {
      if (!line.toLowerCase().includes(query)) return
      for (const near of [index - 1, index, index + 1]) keep.add(near)
    })
    lines = lines.filter((_, index) => keep.has(index))
  }
  return { outline: lines.join('\n').slice(0, OUTLINE_CAP), elements: out.elements, matched: lines.length > 0, busy: isBusy(doc) }
}

export function readTable(
  registry: Registry,
  ref: string,
  opts: { offset?: number; max_rows?: number } = {},
): TableData | { error: string } {
  const table = registry.get(ref)
  if (!table || !isTable(table)) return { error: `No table ${ref} on the page. Read the page again for current refs.` }
  const rows = tableRows(table)
  const headerRow = rows.find((row) => row.querySelector('th, [role="columnheader"]'))
  const columns = headerRow ? rowCells(headerRow).map(shownText) : []
  const body = rows.filter((row) => row !== headerRow)
  const offset = Math.max(opts.offset ?? 0, 0)
  const count = Math.min(Math.max(opts.max_rows ?? 100, 1), 500)
  const data: TableData = {
    columns,
    rows: body.slice(offset, offset + count).map((row) => rowCells(row).map(shownText)),
    total_rows: body.length,
    offset,
  }
  if (role(table) !== '' && table.tagName !== 'TABLE') {
    data.note = 'This grid may render only the rows scrolled into view; total_rows counts what is on the page now.'
  }
  return data
}

function target(registry: Registry, step: Step): Element | string {
  const el = registry.get(step.ref)
  if (!el) return `No element ${step.ref} on the page any more. Read the page again for current refs.`
  if (isSecret(el)) return 'Password and payment fields are never filled by the assistant.'
  if (el instanceof HTMLInputElement && el.type === 'file') return 'File inputs cannot be filled by the assistant.'
  if ((el as HTMLInputElement).disabled || el.getAttribute('aria-disabled') === 'true') return 'The element is disabled.'
  return el
}

/** Each step in words taken from the page itself, for the approval card. */
export function describeSteps(registry: Registry, steps: Step[]): { text: string; error?: string }[] {
  return steps.map((step) => {
    const el = target(registry, step)
    if (typeof el === 'string') return { text: `${step.action} ${step.ref}`, error: el }
    const what = `${kind(el)} "${accessibleName(el) || step.ref}"`
    const value = clip(step.value ?? '', 200)
    switch (step.action) {
      case 'fill':
        return { text: `Fill ${what} with "${value}"` }
      case 'select':
        return { text: `Choose "${value}" in ${what}` }
      case 'check':
        return { text: `Tick ${what}` }
      case 'uncheck':
        return { text: `Untick ${what}` }
      case 'press':
        return { text: `Press ${value || 'Enter'} in ${what}` }
      default:
        return { text: `Click ${what}` }
    }
  })
}

function fire(el: Element, type: string, init: EventInit = {}): void {
  el.dispatchEvent(new Event(type, { bubbles: true, cancelable: true, ...init }))
}

function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string): void {
  // Frameworks that own the input (React, UI5) only notice a value set through the prototype's setter.
  const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value')?.set
  if (setter) setter.call(el, value)
  else el.value = value
}

function editable(el: Element): Element {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return el
  return el.querySelector('input:not([type="hidden"]), textarea') ?? el
}

function fill(el: Element, value: string): string | null {
  const field = editable(el)
  if (isSecret(field)) return 'Password and payment fields are never filled by the assistant.'
  if (field instanceof HTMLSelectElement) return select(field, value)
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    field.focus()
    setNativeValue(field, value)
    field.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }))
    fire(field, 'change')
    return null
  }
  if (field.getAttribute('contenteditable') === 'true') {
    ;(field as HTMLElement).focus()
    field.textContent = value
    field.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }))
    return null
  }
  return 'This element takes no text. Click it instead.'
}

function select(el: Element, value: string): string | null {
  if (!(el instanceof HTMLSelectElement)) {
    return 'Not a native select. Click it to open the list, read the page, then click the option.'
  }
  const wanted = value.trim().toLowerCase()
  const option = Array.from(el.options).find(
    (o) => squash(o.textContent).toLowerCase() === wanted || o.value.toLowerCase() === wanted,
  )
  if (!option) {
    const offered = Array.from(el.options, (o) => squash(o.textContent)).slice(0, 30).join(', ')
    return `No option "${value}". Options: ${offered}`
  }
  setNativeValue(el, option.value)
  fire(el, 'input')
  fire(el, 'change')
  return null
}

function isChecked(el: Element): boolean {
  if (el instanceof HTMLInputElement) return el.checked
  return el.getAttribute('aria-checked') === 'true'
}

function click(el: Element, onClick?: () => void): void {
  const node = el as HTMLElement
  node.scrollIntoView?.({ block: 'center' })
  const view = el.ownerDocument.defaultView
  const Pointer = view?.PointerEvent ?? view?.MouseEvent
  const Mouse = view?.MouseEvent
  if (Pointer && Mouse) {
    const rect = el.getBoundingClientRect?.()
    const init = { bubbles: true, cancelable: true, composed: true, button: 0, buttons: 1, clientX: rect ? rect.left + rect.width / 2 : 0, clientY: rect ? rect.top + rect.height / 2 : 0 }
    el.dispatchEvent(new Pointer('pointerdown', init))
    el.dispatchEvent(new Mouse('mousedown', init))
    el.dispatchEvent(new Pointer('pointerup', init))
    el.dispatchEvent(new Mouse('mouseup', init))
  }
  if (!onClick) return node.click()
  node.addEventListener('click', onClick, { capture: true, once: true })
  try {
    node.click()
  } finally {
    node.removeEventListener('click', onClick, true)
  }
}

function press(el: Element, key: string): void {
  const node = editable(el) as HTMLElement
  node.focus?.()
  const view = el.ownerDocument.defaultView
  if (!view) return
  for (const type of ['keydown', 'keypress', 'keyup']) {
    node.dispatchEvent(new view.KeyboardEvent(type, { key, code: key, bubbles: true, cancelable: true }))
  }
}

function runStep(registry: Registry, step: Step, onClick?: () => void): string | null {
  const el = target(registry, step)
  if (typeof el === 'string') return el
  switch (step.action) {
    case 'fill':
      return fill(el, step.value ?? '')
    case 'select':
      return select(el, step.value ?? '')
    case 'check':
    case 'uncheck':
      if (isChecked(el) !== (step.action === 'check')) click(el, onClick)
      return null
    case 'press':
      press(el, step.value || 'Enter')
      return null
    case 'click':
      click(el, onClick)
      return null
    default:
      return `Unknown action ${String(step.action)}.`
  }
}

export const ACTION_SETTLE_MS: Record<StepAction, number> = { fill: 60, select: 60, check: 60, uncheck: 60, click: 700, press: 350 }

/** Runs the steps in order and stops at the first that fails, so nothing later acts on a wrong page. */
export type Pointer = (el: Element, label: string, clicking: boolean) => Promise<void>

const POINTER_LABEL: Record<StepAction, string> = { fill: 'Typing', select: 'Choosing', check: 'Ticking', uncheck: 'Unticking', click: 'Clicking', press: 'Pressing' }

export async function act(
  registry: Registry,
  steps: Step[],
  wait: (ms: number) => Promise<void> = (ms) => new Promise((done) => setTimeout(done, ms)),
  pointer?: Pointer,
  onClick?: () => void,
): Promise<StepResult[]> {
  const results: StepResult[] = []
  for (const step of steps) {
    let error: string | null
    try {
      if (pointer) {
        try {
          const el = target(registry, step)
          if (typeof el !== 'string') {
            const name = accessibleName(el)
            await pointer(el, name ? `${POINTER_LABEL[step.action]} “${clip(name, 40)}”` : POINTER_LABEL[step.action], (step.action === 'click' || (step.action === 'check' && !isChecked(el)) || (step.action === 'uncheck' && isChecked(el))))
          }
        } catch {
          // The pointer is decoration: it never stops the step.
        }
      }
      error = runStep(registry, step, onClick)
    } catch (e) {
      error = e instanceof Error ? e.message : String(e)
    }
    results.push(error ? { ref: step.ref, action: step.action, ok: false, error } : { ref: step.ref, action: step.action, ok: true })
    if (error) break
    // A click can unload this document. Return the last result immediately; the
    // panel owns the final settling delay and survives full-page navigations.
    if (results.length < steps.length) await wait(ACTION_SETTLE_MS[step.action])
  }
  return results
}
