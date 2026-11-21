// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Registry, guidedClick, readOutline, readTable, redact } from '../src/page/dom'
import { clearGuide, guideShown, showGuide } from '../src/page/guide'
import type { PolicyContext } from '../src/policy'

const CTX: PolicyContext = { officialHosts: ['citapreviadnie.es', 'casa47.es'], userOnly: ['Reservar'] }

const PAGE = `
  <h1>Cita previa DNI</h1>
  <div style="display:none">texto oculto</div>
  <script>var x = 'nunca'</script>
  <p>Titular: 12345678Z · NIE X1234567L · IBAN ES91 2100 0418 4502 0005 1332 · NUSS 28/12345678/90</p>
  <p>Contacto: ana.garcia@example.com, móvil 612 345 678. Información: 060 o 900 123 456.</p>
  <nav>
    <a id="ayuda" href="https://www.citapreviadnie.es/citaPreviaDni/ayuda.jsp">Ayuda</a>
    <a id="fuera" href="https://www.example.com/gestoria">Gestoría que te lo hace</a>
    <button id="menu" aria-expanded="false" aria-controls="m1">Menú</button>
  </nav>
  <form action="/reservar">
    <label for="dni">Número de DNI</label><input id="dni" value="12345678Z" required />
    <label for="fecha">Fecha de validez</label><input id="fecha" value="" />
    <label for="prov">Provincia</label>
    <select id="prov"><option value="">Elige</option><option value="m" selected>Madrid</option></select>
    <label><input type="checkbox" id="acepto" checked /> Acepto las condiciones</label>
    <button id="tipo" type="button">Cambiar tipo de documento</button>
    <a id="dentro" href="https://www.citapreviadnie.es/citaPreviaDni/oficinas.jsp">Ver oficinas</a>
    <button id="enviar">Reservar</button>
  </form>
  <button id="pagar">Pagar tasa</button>
  <table aria-label="Oficinas">
    <tr><th>Oficina</th><th>Teléfono</th></tr>
    <tr><td>Centro</td><td>612 000 111</td></tr>
  </table>
`

function refOf(outline: string, name: string): string {
  const match = new RegExp(`\\[([et]\\d+)\\] [a-z ]+ "${name}`).exec(outline)
  if (!match?.[1]) throw new Error(`no ref for ${name} in:\n${outline}`)
  return match[1]
}

describe('redact', () => {
  it('masks Spanish identifiers, e-mails and mobile numbers, and keeps public help lines', () => {
    const text = redact('DNI 12345678-Z, NIE Y-1234567-X, CIF B12345678, IBAN ES9121000418450200051332, NUSS 281234567890, a@b.es, +34 612 345 678, 060, 900 123 456')
    expect(text).not.toMatch(/12345678|1234567|ES91|281234567890|a@b\.es|612/)
    expect(text).toContain('[DNI oculto]')
    expect(text).toContain('[NIE oculto]')
    expect(text).toContain('[CIF oculto]')
    expect(text).toContain('[IBAN oculto]')
    expect(text).toContain('[NUSS oculto]')
    expect(text).toContain('[email oculto]')
    expect(text).toContain('[teléfono oculto]')
    expect(text).toContain('060')
    expect(text).toContain('900 123 456')
  })
})

describe('page outline', () => {
  let registry: Registry
  beforeEach(() => {
    document.body.innerHTML = PAGE
    registry = new Registry()
  })

  it('never contains what the person typed or chose, only the field state', () => {
    const { outline } = readOutline(document, registry, CTX)
    expect(outline).toMatch(/textbox "Número de DNI" \(rellenado, obligatorio\)/)
    expect(outline).toMatch(/textbox "Fecha de validez" \(vacío\)/)
    expect(outline).toMatch(/select "Provincia" \(elegido\)/)
    expect(outline).toMatch(/checkbox "Acepto las condiciones" \(marcado\)/)
    expect(outline).not.toContain('Madrid')
    expect(outline).not.toContain('12345678')
  })

  it('masks personal data in the page text and tables, and leaves out hidden content', () => {
    const { outline } = readOutline(document, registry, CTX)
    for (const secret of ['12345678Z', 'X1234567L', 'ES91', '28/12345678/90', 'ana.garcia', '612 345 678', '612 000 111']) expect(outline).not.toContain(secret)
    expect(outline).toContain('[DNI oculto]')
    expect(outline).toContain('# Cita previa DNI')
    expect(outline).not.toContain('texto oculto')
    expect(outline).not.toContain('nunca')
    const table = readTable(registry, refOf(outline, 'Oficinas'))
    expect(JSON.stringify(table)).not.toContain('612 000 111')
  })

  it('tags every control with its class', () => {
    const { outline, classes } = readOutline(document, registry, CTX)
    expect(classes[refOf(outline, 'Ayuda')]).toBe('nav')
    expect(classes[refOf(outline, 'Menú')]).toBe('nav')
    expect(classes[refOf(outline, 'Gestoría')]).toBe('external')
    expect(classes[refOf(outline, 'Número de DNI')]).toBe('field')
    expect(classes[refOf(outline, 'Provincia')]).toBe('field')
    expect(classes[refOf(outline, 'Reservar')]).toBe('action')
    expect(classes[refOf(outline, 'Cambiar tipo')]).toBe('action')
    expect(classes[refOf(outline, 'Pagar tasa')]).toBe('action')
    expect(outline).toMatch(/link "Ayuda" → \S*\/citaPreviaDni\/ayuda\.jsp \{nav\}/)
    expect(outline).toContain('móvil [teléfono oculto]')
    expect(outline).toMatch(/"Reservar" \{acción: la pulsa la persona\}/)
  })

  it('keeps refs stable across reads and filters by query without accents', () => {
    const first = refOf(readOutline(document, registry, CTX).outline, 'Número de DNI')
    const narrowed = readOutline(document, registry, CTX, { query: 'numero de dni' }).outline
    expect(refOf(narrowed, 'Número de DNI')).toBe(first)
    expect(narrowed).not.toContain('Oficinas')
  })
})

describe('guided click (page side)', () => {
  let registry: Registry
  let outline: string
  beforeEach(() => {
    document.body.innerHTML = PAGE
    registry = new Registry()
    outline = readOutline(document, registry, CTX).outline
  })

  it('presses a control that only moves around the site', () => {
    const clicked = vi.fn()
    document.getElementById('menu')?.addEventListener('click', clicked)
    expect(guidedClick(registry, refOf(outline, 'Menú'), CTX)).toEqual({ ok: true, name: 'Menú' })
    expect(clicked).toHaveBeenCalledOnce()
  })

  it.each([
    ['Número de DNI', 'field'],
    ['Acepto las condiciones', 'field'],
    ['Reservar', 'action'],
    ['Cambiar tipo', 'action'],
    ['Pagar tasa', 'action'],
    ['Gestoría', 'external'],
  ])('refuses %s (%s) and never dispatches a click', (name, cls) => {
    const ref = refOf(outline, name)
    const el = registry.get(ref) as HTMLElement
    const clicked = vi.fn()
    el.addEventListener('click', clicked)
    const result = guidedClick(registry, ref, CTX)
    expect(result.ok).toBe(false)
    expect(result).toMatchObject({ refused: cls })
    expect(clicked).not.toHaveBeenCalled()
  })

  it('checks the live element, so a link turned into a submit button after the read is refused', () => {
    const ref = refOf(outline, 'Ayuda')
    const link = registry.get(ref) as HTMLElement
    link.textContent = 'Enviar solicitud'
    expect(guidedClick(registry, ref, CTX)).toMatchObject({ ok: false, refused: 'action' })
  })

  it('refuses names the site map reserves for the person', () => {
    document.body.insertAdjacentHTML('beforeend', '<a id="x" href="https://www.casa47.es/solicitud">Reservar ahora</a>')
    const fresh = readOutline(document, registry, CTX).outline
    expect(guidedClick(registry, refOf(fresh, 'Reservar ahora'), CTX)).toMatchObject({ ok: false, refused: 'action' })
  })

  it('reports a ref that is gone', () => {
    expect(guidedClick(registry, 'e999', CTX)).toMatchObject({ ok: false })
  })
})

describe('guide highlight', () => {
  it('shows one highlight at a time, outside the outline, and clears it', () => {
    document.body.innerHTML = PAGE
    const field = document.getElementById('dni') as Element
    showGuide(field, 'Escribe aquí tu número de DNI')
    showGuide(field, 'Otra instrucción')
    expect(document.querySelectorAll('#asistente-tramites-guide')).toHaveLength(1)
    expect(guideShown()).toBe(true)
    const { outline } = readOutline(document, new Registry(), CTX)
    expect(outline).not.toContain('Otra instrucción')
    clearGuide()
    expect(document.getElementById('asistente-tramites-guide')).toBeNull()
    expect(guideShown()).toBe(false)
  })
})
