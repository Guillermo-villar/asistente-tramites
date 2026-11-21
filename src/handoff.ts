// Hand-off from the website to the extension. The website (web/) is where people find out which trámite
// they need; when they press «Hacerlo con la extensión», the extension opens the official site in a new
// tab, opens its panel there and starts the task, so the person lands inside the site with the guide on.
//
//   web page ──postMessage──▶ bridge (content script, only on WEB_ORIGINS)
//            ──runtime.sendMessage──▶ background: checks the URL is a site the assistant may use,
//            opens it in a new tab, opens the panel, and leaves the task in session storage for that tab
//   panel ──on that tab──▶ reads the task and sends it as the first message.

/** Origins of the website that may hand tasks to the extension. build.mjs reads this list for the manifest. */
export const WEB_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']

/** `source` tags on window messages, so neither side reacts to anything else the page posts. */
export const FROM_WEB = 'asistente-tramites-web'
export const FROM_EXTENSION = 'asistente-tramites-extension'

/** What the website asks the extension to do. */
export type HandoffRequest = {
  type: 'handoff'
  /** The trámite, in the person's words or the site map's title («Pedir cita para el DNI o el pasaporte»). */
  text: string
  /** Where to start: the procedure's entry_url on an official site. */
  url: string
}

export type HandoffResponse = { ok: true; panel: boolean } | { ok: false; reason: 'origin' | 'url' | 'tab' }

/** A task waiting for the panel to pick it up on its tab. */
export type PendingTask = { text: string; url: string; at: number }

export const pendingKey = (tabId: number) => `handoff:${tabId}`

/** Tasks older than this are dropped rather than started by surprise. */
export const PENDING_TTL_MS = 10 * 60 * 1000

/** How the panel phrases the hand-off to the assistant. */
export const handoffMessage = (task: PendingTask) =>
  `Vengo de la web del Asistente de trámites. Quiero hacer esto: ${task.text}. Ya estoy en la web oficial (${task.url}); guíame desde aquí.`
