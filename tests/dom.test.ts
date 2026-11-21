// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { Registry, act, describeSteps, readOutline, readTable } from '../src/page/dom'

const PAGE = `
  <h1>Job Requisition R-1042</h1>
  <div style="display:none">secret banner</div>
  <script>var x = 'never shown'</script>
  <form>
    <label for="title">Job title</label><input id="title" value="Store Manager" required />
    <label>Password <input type="password" id="pw" value="hunter2" /></label>
    <label for="country">Country</label>
    <select id="country"><option value="es">Spain</option><option value="pt">Portugal</option></select>
    <label><input type="checkbox" id="remote" /> Remote</label>
    <div role="button" data-automation-id="saveButton">Save</div>
    <a href="/candidates">Candidates</a>
  </form>
  <table aria-label="Candidates">
    <tr><th>Name</th><th>Stage</th></tr>
    <tr><td><a href="/c/1">Ana García</a></td><td>Interview</td></tr>
    <tr><td>Luis Pérez</td><td>Offer</td></tr>
  </table>
`

function refOf(outline: string, text: string): string {
  const match = new RegExp(`\\[([et]\\d+)\\] (?:[a-z ]+ ")?${text}`).exec(outline)
  if (!match?.[1]) throw new Error(`no ref for ${text} in:\n${outline}`)
  return match[1]
}

describe('page outline', () => {
  let registry: Registry
  beforeEach(() => {
    document.body.innerHTML = PAGE
    registry = new Registry()
  })

  it('shows headings, labelled controls with values, and tables, and leaves out hidden content', () => {
    const { outline } = readOutline(document, registry)
    expect(outline).toContain('# Job Requisition R-1042')
    expect(outline).toMatch(/\[e\d+\] textbox "Job title" = "Store Manager" \(required\)/)
    expect(outline).toMatch(/\[e\d+\] select "Country" = "Spain"/)
    expect(outline).toMatch(/\[e\d+\] button "Save"/)
    expect(outline).toMatch(/\[t\d+\] table "Candidates" \(3 rows\)/)
    expect(outline).toMatch(/\[e\d+\] link "Ana García" → \/c\/1 \| Interview/)
    expect(outline).not.toContain('secret banner')
    expect(outline).not.toContain('never shown')
  })

  it('never exposes a password value', () => {
    const { outline } = readOutline(document, registry)
    expect(outline).not.toContain('hunter2')
    expect(outline).toContain('(hidden)')
  })

  it('keeps a ref stable across reads and narrows by query', () => {
    const first = refOf(readOutline(document, registry).outline, 'Job title')
    const narrowed = readOutline(document, registry, { query: 'job title' }).outline
    expect(refOf(narrowed, 'Job title')).toBe(first)
    expect(narrowed).not.toContain('Luis')
  })

  it('reads content inside a clickable card, content marked aria-hidden, and image alt text', () => {
    document.body.innerHTML = `
      <a href="/c/1"><h3>Ana García</h3><p>Store Manager, Madrid. Applied 3 days ago with a referral from Luis.</p><button>Shortlist</button></a>
      <div aria-hidden="true">Offer accepted on 12 May</div>
      <img alt="Org chart for Retail Iberia" src="x.png" />
      <table role="presentation"><tr><td>Layout cell text</td></tr></table>`
    const { outline } = readOutline(document, registry)
    expect(outline).toContain('Applied 3 days ago with a referral from Luis.')
    expect(outline).toMatch(/\[e\d+\] button "Shortlist"/)
    expect(outline).toContain('Offer accepted on 12 May')
    expect(outline).toContain('(image: Org chart for Retail Iberia)')
    expect(outline).toContain('Layout cell text')
    expect(outline).not.toContain('table (')
  })

  it('says when a query matches nothing instead of returning an empty page', () => {
    expect(readOutline(document, registry, { query: 'no such words' })).toMatchObject({ outline: '', matched: false })
  })

  it('reads a table as rows', () => {
    const ref = refOf(readOutline(document, registry).outline, 'table')
    expect(readTable(registry, ref)).toMatchObject({
      columns: ['Name', 'Stage'],
      rows: [
        ['Ana García', 'Interview'],
        ['Luis Pérez', 'Offer'],
      ],
      total_rows: 2,
    })
  })
})

describe('grids drawn with divs', () => {
  it('prints each row on one line and keeps a role="none" button a button', () => {
    document.body.innerHTML = `
      <button role="none"><i class="bi-chevron-left"></i></button>
      <div role="table">
        <div role="row"><div role="columnheader"><div>Vacancy</div></div><div role="columnheader"><div>Candidate</div></div></div>
        <div role="row"><div role="cell"><div>QA Lead</div></div><div role="cell"><div>John Doe</div></div></div>
      </div>
      <p>After</p>`
    const { outline } = readOutline(document, new Registry())
    expect(outline).toContain('  Vacancy | Candidate\n  QA Lead | John Doe\nAfter')
    expect(outline).toMatch(/\[e\d+\] button "Arrow left \(icon\)"/)
  })
})

describe('page actions', () => {
  let registry: Registry
  let outline: string
  const noWait = () => Promise.resolve()
  beforeEach(() => {
    document.body.innerHTML = PAGE
    registry = new Registry()
    outline = readOutline(document, registry).outline
  })

  it('fills, selects, ticks and clicks, firing the events frameworks listen for', async () => {
    const title = document.getElementById('title') as HTMLInputElement
    const events: string[] = []
    title.addEventListener('input', () => events.push('input'))
    title.addEventListener('change', () => events.push('change'))
    let saved = 0
    document.querySelector('[role="button"]')?.addEventListener('click', () => (saved += 1))

    const results = await act(
      registry,
      [
        { action: 'fill', ref: refOf(outline, 'Job title'), value: 'Area Manager' },
        { action: 'select', ref: refOf(outline, 'Country'), value: 'Portugal' },
        { action: 'check', ref: refOf(outline, 'Remote') },
        { action: 'click', ref: refOf(outline, 'Save') },
      ],
      noWait,
    )

    expect(results.filter((r) => !r.ok)).toEqual([])
    expect(title.value).toBe('Area Manager')
    expect(events).toEqual(['input', 'change'])
    expect((document.getElementById('country') as HTMLSelectElement).value).toBe('pt')
    expect((document.getElementById('remote') as HTMLInputElement).checked).toBe(true)
    expect(saved).toBe(1)
  })

  it('refuses password fields and stops before later steps', async () => {
    let saved = 0
    document.querySelector('[role="button"]')?.addEventListener('click', () => (saved += 1))
    const results = await act(
      registry,
      [
        { action: 'fill', ref: refOf(outline, 'Password'), value: 'x' },
        { action: 'click', ref: refOf(outline, 'Save') },
      ],
      noWait,
    )
    expect(results).toHaveLength(1)
    expect(results[0]?.ok).toBe(false)
    expect((document.getElementById('pw') as HTMLInputElement).value).toBe('hunter2')
    expect(saved).toBe(0)
  })

  it('fails a step whose element left the page', async () => {
    const ref = refOf(outline, 'Save')
    document.querySelector('[role="button"]')?.remove()
    const [result] = await act(registry, [{ action: 'click', ref }], noWait)
    expect(result?.ok).toBe(false)
  })

  it('describes steps with the page’s own labels, not the model’s', () => {
    const described = describeSteps(registry, [
      { action: 'fill', ref: refOf(outline, 'Job title'), value: 'Area Manager' },
      { action: 'click', ref: refOf(outline, 'Save') },
      { action: 'click', ref: 'e999' },
    ])
    expect(described[0]?.text).toBe('Fill textbox "Job title" with "Area Manager"')
    expect(described[1]?.text).toBe('Click button "Save"')
    expect(described[2]?.error).toBeTruthy()
  })
})
