import type { PageRequest } from '../page/messages'
import { record } from '../ui/debugLog'
import type { Browser, Tab } from './tools'
import { userWindow, userWindowId, windowMode } from './userWindow'

const LOAD_TIMEOUT_MS = 20_000

function toTab(tab: chrome.tabs.Tab | undefined): Tab | null {
  if (!tab || tab.id === undefined || !tab.url) return null
  return { id: tab.id, url: tab.url, title: tab.title ?? '' }
}

export async function activeTab(): Promise<Tab | null> {
  // Chrome: the side panel's window. Safari (window mode): the last focused normal window, not the panel's.
  const windowId = await userWindowId()
  if (windowId === undefined) return null
  const [tab] = await chrome.tabs.query({ active: true, windowId })
  return toTab(tab)
}

function loaded(tabId: number): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      chrome.tabs.onUpdated.removeListener(listener)
      clearTimeout(timer)
      resolve()
    }
    const listener = (id: number, info: { status?: string }) => {
      if (id === tabId && info.status === 'complete') done()
    }
    const timer = setTimeout(done, LOAD_TIMEOUT_MS)
    chrome.tabs.onUpdated.addListener(listener)
  })
}

let workTabId: number | null = null
let workWindowId: number | null = null
/** Set when the work tab had to be a background tab in the user's window (Safari fallback). */
let workIsTab = false

/**
 * The window for the work tab: minimized popup (Chrome). Where a browser refuses that (Safari may), an
 * unfocused normal popup; failing that, null and the caller opens a background tab instead.
 */
async function createWorkWindow(url: string, incognito: boolean | undefined): Promise<chrome.windows.Window | null> {
  try {
    return (await chrome.windows.create({ url, type: 'popup', state: 'minimized', focused: false, incognito })) ?? null
  } catch (e) {
    if (!windowMode()) throw e
    record('background_window_fallback', { step: 'minimized', error: e instanceof Error ? e.message : String(e) })
  }
  try {
    return (await chrome.windows.create({ url, type: 'popup', focused: false, width: 400, height: 300 })) ?? null
  } catch (e) {
    record('background_window_fallback', { step: 'popup', error: e instanceof Error ? e.message : String(e) })
    return null
  }
}

async function liveWorkTab(): Promise<Tab | null> {
  if (workTabId === null) return null
  const tab = toTab(await chrome.tabs.get(workTabId).catch(() => undefined))
  if (!tab) {
    workTabId = workWindowId = null
    workIsTab = false
  }
  return tab
}

export const chromeBrowser: Browser = {
  activeTab,
  hasAccess: (pattern) => chrome.permissions.contains({ origins: [pattern] }),
  async frames(tabId) {
    // Chrome injects only into frames this extension may read, and reports which those were.
    const injected = await chrome.scripting.executeScript({ target: { tabId, allFrames: true }, files: ['content.js'] })
    const ids = injected.map((result) => result.frameId)
    return ids.includes(0) ? [0, ...ids.filter((id) => id !== 0)] : ids
  },
  async page<T>(tabId: number, request: PageRequest, frameId = 0): Promise<T> {
    await chrome.scripting.executeScript({ target: { tabId, frameIds: [frameId] }, files: ['content.js'] })
    const [frame] = await chrome.scripting.executeScript({
      target: { tabId, frameIds: [frameId] },
      func: (operation: PageRequest) => globalThis.__coworkerPageTools?.read(operation),
      args: [request],
    })
    if (frame?.result == null) throw new Error('The document changed during this operation. Read the page again.')
    return frame.result as T
  },
  async navigate(tabId, url) {
    const wait = loaded(tabId)
    await chrome.tabs.update(tabId, { url })
    await wait
    const tab = toTab(await chrome.tabs.get(tabId))
    if (!tab) throw new Error('The tab closed while it was loading.')
    return tab
  },
  workTab: {
    async open(url) {
      const open = await liveWorkTab()
      let tabId: number | undefined
      let wait: Promise<void> | null = null
      if (open) {
        tabId = open.id
        wait = loaded(open.id)
        await chrome.tabs.update(open.id, { url })
      } else {
        // A minimized window of its own, so no tab appears beside the user's. Same profile, so it is
        // signed in as them; the private-window flag is copied because those sessions are separate.
        const mine = (await userWindow()) ?? (await chrome.windows.getCurrent())
        const created = await createWorkWindow(url, mine.incognito)
        let tab = created?.tabs?.[0]
        if (!created && windowMode()) {
          // Last resort (Safari): a background tab in the user's window, closed again at the end.
          tab = await chrome.tabs.create({ url, active: false, windowId: mine.id })
          workIsTab = true
        }
        // Kept in the debug log: whether Chrome really made a separate, minimized window.
        record('background_window', {
          asked: { type: 'popup', state: 'minimized' },
          got: { id: created?.id, type: created?.type, state: created?.state, tabs: created?.tabs?.length },
          user_window: { id: mine.id, type: mine.type, state: mine.state },
        })
        tabId = tab?.id
        workWindowId = created?.id ?? null
        if (tabId !== undefined && tab?.status !== 'complete') wait = loaded(tabId)
      }
      if (tabId === undefined) throw new Error('The background page could not be opened.')
      workTabId = tabId
      await wait
      const ready = toTab(await chrome.tabs.get(tabId))
      if (!ready) throw new Error('The background page closed while it was loading.')
      return ready
    },
    current: () => liveWorkTab(),
    async close() {
      const windowId = workWindowId
      const tabId = workIsTab ? workTabId : null
      workTabId = null
      workWindowId = null
      workIsTab = false
      if (windowId !== null) await chrome.windows.remove(windowId).catch(() => undefined)
      if (tabId !== null) await chrome.tabs.remove(tabId).catch(() => undefined)
    },
  },
  async openTab(url) {
    // In window mode (Safari) a plain create would open the tab in the panel's own window.
    if (windowMode()) await chrome.tabs.create({ url, windowId: await userWindowId() })
    else await chrome.tabs.create({ url })
  },
}
