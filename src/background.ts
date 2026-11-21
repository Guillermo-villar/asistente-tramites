// The toolbar button opens the side panel on any tab. The assistant itself only reads and moves on the
// official sites listed in the site maps; elsewhere the panel explains that it cannot help on that page.

// Safari has no side panel (no `chrome.sidePanel`): the toolbar button opens the panel in a narrow window
// of its own instead.
const hasSidePanel = typeof chrome.sidePanel !== 'undefined'
const PANEL_WINDOW_KEY = 'panelWindowId'
const PANEL_WIDTH = 420
const PANEL_HEIGHT = 800

async function openPanelWindow(fromWindowId: number | undefined): Promise<void> {
  const stored = (await chrome.storage.session.get(PANEL_WINDOW_KEY))[PANEL_WINDOW_KEY] as number | undefined
  if (stored !== undefined) {
    const open = await chrome.windows.get(stored, { populate: true }).catch(() => undefined)
    if (open?.tabs?.some((tab) => tab.url?.startsWith(chrome.runtime.getURL('sidepanel.html')))) {
      await chrome.windows.update(stored, { focused: true })
      return
    }
  }
  const from = fromWindowId !== undefined ? await chrome.windows.get(fromWindowId).catch(() => undefined) : undefined
  const left = from?.left !== undefined && from.width !== undefined ? from.left + from.width - PANEL_WIDTH : undefined
  const url = chrome.runtime.getURL(`sidepanel.html${from?.id !== undefined ? `?window=${from.id}` : ''}`)
  const created = await chrome.windows
    .create({ url, type: 'popup', width: PANEL_WIDTH, height: from?.height ?? PANEL_HEIGHT, left, top: from?.top, focused: true })
    .catch(() => chrome.windows.create({ url, type: 'popup', width: PANEL_WIDTH, focused: true }))
  if (created?.id !== undefined) await chrome.storage.session.set({ [PANEL_WINDOW_KEY]: created.id })
}

if (hasSidePanel) {
  const openOnClick = () => void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  chrome.runtime.onInstalled.addListener(openOnClick)
  chrome.runtime.onStartup.addListener(openOnClick)
} else {
  chrome.action.onClicked.addListener((tab) => void openPanelWindow(tab.windowId))
  chrome.windows.onRemoved.addListener((windowId) => {
    void chrome.storage.session.get(PANEL_WINDOW_KEY).then(async (stored) => {
      if (stored[PANEL_WINDOW_KEY] === windowId) await chrome.storage.session.remove(PANEL_WINDOW_KEY)
    })
  })
}
