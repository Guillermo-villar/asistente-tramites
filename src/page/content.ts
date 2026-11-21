import { clearCursor, pointAt } from './cursor'
import { Registry, guidedClick, readOutline, readTable } from './dom'
import { clearGuide, showGuide } from './guide'
import type { PageRequest } from './messages'
import { policyFor } from '../plugins/registry'
import { isOfficialUrl } from '../policy'

// The page script. The panel injects it into official pages only, and it checks again: on a page that
// is not one of the official sites it refuses everything. The policy it enforces comes from the site maps
// bundled into this script, not from the panel's message, so the panel cannot widen it.

declare global {
  // eslint-disable-next-line no-var
  var __asistenteTramites: { run: (request: PageRequest) => Promise<unknown> } | undefined
}

async function handle(request: PageRequest, registry: Registry): Promise<unknown> {
  const ctx = policyFor(location.href, request.op === 'click' ? request.userOnly : [])
  // The top frame decides: an embedded frame from another host is still read, as the person sees it.
  const pageUrl = window.top === window ? location.href : document.referrer || location.href
  if (request.op !== 'clear' && !isOfficialUrl(location.href, ctx.officialHosts) && !isOfficialUrl(pageUrl, ctx.officialHosts)) {
    return { error: 'Esta página no es una de las sedes oficiales que conoce la extensión.' }
  }
  switch (request.op) {
    case 'outline':
      registry.prefix = request.ref_prefix ?? ''
      return { url: location.href, title: document.title, ...readOutline(document, registry, ctx, request) }
    case 'table':
      return readTable(registry, request.ref, request)
    case 'click': {
      const el = registry.get(request.ref)
      const result = guidedClick(registry, request.ref, ctx)
      if (result.ok && el) {
        clearGuide()
        void pointAt(el, `Abriendo “${result.name.slice(0, 40)}”`, true)
      }
      return result
    }
    case 'point': {
      const el = registry.get(request.ref)
      if (!el) return { ok: false, error: `El elemento ${request.ref} ya no está en la página. Vuelve a leer la página.` }
      await pointAt(el, 'Aquí', false)
      showGuide(el, request.instruction)
      return { ok: true }
    }
    case 'clear':
      clearGuide()
      clearCursor()
      return { ok: true }
    default:
      return { error: 'Petición desconocida.' }
  }
}

if (!globalThis.__asistenteTramites) {
  const registry = new Registry()
  window.addEventListener('pagehide', () => {
    clearGuide()
    clearCursor()
  })
  globalThis.__asistenteTramites = { run: (request) => handle(request, registry) }
}
