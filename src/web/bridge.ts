// Runs only on the website's own pages (WEB_ORIGINS, declared in the manifest). It tells the page that the
// extension is installed, and passes «Hacerlo con la extensión» requests to the background. It reads
// nothing from the page and accepts only messages the page posts to itself, tagged FROM_WEB.

import { FROM_EXTENSION, FROM_WEB } from '../handoff'
import type { HandoffRequest, HandoffResponse } from '../handoff'

const post = (data: Record<string, unknown>) => window.postMessage({ source: FROM_EXTENSION, ...data }, window.location.origin)
const announce = () => post({ type: 'ready', version: chrome.runtime.getManifest().version })

window.addEventListener('message', (event: MessageEvent) => {
  if (event.source !== window || event.origin !== window.location.origin) return
  const data = event.data as { source?: unknown; type?: unknown; id?: unknown; text?: unknown; url?: unknown } | null
  if (!data || data.source !== FROM_WEB) return
  if (data.type === 'ping') return announce()
  if (data.type !== 'start' || typeof data.text !== 'string' || typeof data.url !== 'string') return
  const id = typeof data.id === 'string' ? data.id.slice(0, 64) : ''
  const request: HandoffRequest = { type: 'handoff', text: data.text.slice(0, 300), url: data.url }
  chrome.runtime
    .sendMessage<HandoffRequest, HandoffResponse>(request)
    .then((response) => post({ type: 'started', id, ...response }))
    .catch(() => post({ type: 'started', id, ok: false, reason: 'tab' }))
})

announce()
