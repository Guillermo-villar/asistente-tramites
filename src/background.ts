import { detectSystem } from './sites'

// The extension is for the other HR systems. On the platform's own pages (its domain and subdomains, and
// the local app) it is switched off: the toolbar button is greyed and the side panel is not offered.

const OFF_KEY = 'tabsSwitchedOff'

// Safari has no side panel (no `chrome.sidePanel`): the toolbar button opens the UI in a narrow window
// of its own instead (`openPanelWindow`). Chrome keeps the side panel exactly as before.
const hasSidePanel = typeof chrome.sidePanel !== 'undefined'
const PANEL_WINDOW_KEY = 'panelWindowId'
const PANEL_WIDTH = 420
const PANEL_HEIGHT = 800

async function openPanelWindow(fromWindowId: number | undefined): Promise<void> {
  const stored = (await chrome.storage.session.get(PANEL_WINDOW_KEY))[PANEL_WINDOW_KEY] as number | undefined
  if (stored !== undefined) {
    const open = await chrome.windows.get(stored, { populate: true }).catch(() => undefined)
    if (open?.tabs?.some(tab => tab.url?.startsWith(chrome.runtime.getURL('sidepanel.html')))) {
      await chrome.windows.update(stored, { focused: true })
      return
    }
  }
  const from = fromWindowId !== undefined ? await chrome.windows.get(fromWindowId).catch(() => undefined) : undefined
  // Two overlapping Safari windows swap z-order when the recruiter clicks the page.
  // Reserve space inside the original window bounds so both stay visible.
  const canTile = from?.state === 'normal' && from.width !== undefined && from.width >= PANEL_WIDTH + 640
  const height = from?.height ?? PANEL_HEIGHT
  const left = from?.left !== undefined && from.width !== undefined ? from.left + from.width - PANEL_WIDTH : undefined
  const url = chrome.runtime.getURL(`sidepanel.html${from?.id !== undefined ? `?window=${from.id}` : ''}`)
  const created = await chrome.windows.create({ url, type: 'popup', width: PANEL_WIDTH, height, left, top: from?.top, focused: true })
    .catch(() => chrome.windows.create({ url, type: 'popup', width: PANEL_WIDTH, focused: true }))
  if (created?.id === undefined) return
  await chrome.storage.session.set({ [PANEL_WINDOW_KEY]: created.id })
  if (canTile && from?.id !== undefined && from.width !== undefined) {
    const narrowed = await chrome.windows.update(from.id, { width: from.width - PANEL_WIDTH }).catch(() => undefined)
    if (narrowed?.width !== undefined) {
      await chrome.storage.session.set({ panelLayout: { panelId: created.id, sourceId: from.id, original: from.width, tiled: narrowed.width } })
    }
  }
}

if (!hasSidePanel) {
  chrome.action.onClicked.addListener((tab) => void openPanelWindow(tab.windowId))
  chrome.windows.onRemoved.addListener((windowId) => {
    void chrome.storage.session.get([PANEL_WINDOW_KEY, 'panelLayout']).then(async (stored) => {
      if (stored[PANEL_WINDOW_KEY] === windowId) await chrome.storage.session.remove(PANEL_WINDOW_KEY)
      const layout = stored.panelLayout as { panelId: number; sourceId: number; tiled: number; original: number } | undefined
      if (layout?.panelId !== windowId) return
      await chrome.storage.session.remove('panelLayout')
      const source = await chrome.windows.get(layout.sourceId).catch(() => undefined)
      if (source?.state === 'normal' && source.width === layout.tiled) {
        await chrome.windows.update(layout.sourceId, { width: layout.original }).catch(() => undefined)
      }
    })
  })
}

async function switchedOff(): Promise<number[]> {
  const stored = await chrome.storage.session.get(OFF_KEY)
  return (stored[OFF_KEY] as number[] | undefined) ?? []
}

async function apply(tabId: number, url: string | undefined): Promise<void> {
  const off = detectSystem(url) === 'platform'
  const before = await switchedOff()
  const was = before.includes(tabId)
  try {
    if (off) {
      await chrome.action.disable(tabId)
      if (hasSidePanel) await chrome.sidePanel.setOptions({ tabId, enabled: false })
    } else {
      await chrome.action.enable(tabId)
      // Only undo our own switch-off, so other tabs keep sharing the one panel and its conversation.
      if (was && hasSidePanel) await chrome.sidePanel.setOptions({ tabId, enabled: true })
    }
  } catch {
    return // the tab closed meanwhile
  }
  if (off !== was) await chrome.storage.session.set({ [OFF_KEY]: off ? [...before, tabId] : before.filter((id) => id !== tabId) })
}

async function applyAll(): Promise<void> {
  for (const tab of await chrome.tabs.query({})) if (tab.id !== undefined) await apply(tab.id, tab.url)
}

chrome.runtime.onInstalled.addListener(() => {
  if (hasSidePanel) void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  void applyAll()
})
chrome.runtime.onStartup.addListener(() => void applyAll())
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.url !== undefined || info.status === 'loading') void apply(tabId, info.url ?? tab.url)
})
chrome.tabs.onRemoved.addListener((tabId) => {
  void switchedOff().then((ids) => {
    if (ids.includes(tabId)) void chrome.storage.session.set({ [OFF_KEY]: ids.filter((id) => id !== tabId) })
  })
})
