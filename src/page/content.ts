import { detectEntity, pageSigns } from './detect'
import { pointAt, clearCursor, restingCursor } from './cursor'
import { Registry, act, describeSteps, readOutline, readTable } from './dom'
import type { PageRequest, ShieldUpdate } from './messages'
import { hideShield, setShieldActivity, showShield } from './shield'

declare global {
  // eslint-disable-next-line no-var
  var __coworkerPageTools: { read: (request: PageRequest) => Promise<unknown>; shield: (update: ShieldUpdate) => boolean } | undefined
}

async function handle(request: PageRequest, registry: Registry): Promise<unknown> {
  switch (request.op) {
    case 'outline':
      registry.prefix = request.ref_prefix ?? ''
      return {
        url: location.href,
        title: document.title,
        selection: String(getSelection() ?? '').trim().slice(0, 4000),
        ...readOutline(document, registry, request),
      }
    case 'table': {
      const table = registry.get(request.ref)
      if (table) await pointAt(table, 'Reading table', false)
      return readTable(registry, request.ref, request)
    }
    case 'describe':
      return describeSteps(registry, request.steps)
    case 'act':
      return act(registry, request.steps, undefined, pointAt, request.shieldRun ? () => {
        void chrome.runtime.sendMessage({ shieldClick: request.shieldRun }).catch(() => {})
      } : undefined)
    case 'entity':
      return { entity: detectEntity(document, location.href), signs: pageSigns(document) }
    default:
      return { error: 'Unknown page request.' }
  }
}

if (!globalThis.__coworkerPageTools) {
  const registry = new Registry()
  let run = ''
  let expiry: ReturnType<typeof setTimeout> | undefined
  function remove(): void {
    clearTimeout(expiry)
    run = ''
    hideShield()
    clearCursor()
  }
  window.addEventListener('pagehide', remove)
  globalThis.__coworkerPageTools = {
    read: (request) => handle(request, registry),
    shield(update) {
      if (update.activity === null) {
        if (run === update.run) remove()
      } else {
        const first = run !== update.run
        run = update.run
        showShield(() => {
          void chrome.runtime.sendMessage({ stopShield: run }).catch(() => {})
          remove()
        })
        setShieldActivity(update.activity)
        if (first) restingCursor()
        clearTimeout(expiry)
        expiry = setTimeout(remove, 8000)
      }
      return true
    },
  }
}
