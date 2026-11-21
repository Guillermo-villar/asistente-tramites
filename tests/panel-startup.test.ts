import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { build } from 'esbuild'
import { JSDOM, VirtualConsole } from 'jsdom'

let bundle: string
const panels: JSDOM[] = []
beforeAll(async () => {
  const result = await build({ entryPoints: ['src/ui/main.tsx'], bundle: true, write: false, format: 'iife', target: 'chrome120', define: { 'process.env.NODE_ENV': '"production"' } })
  bundle = result.outputFiles![0]!.text
})
afterEach(() => { for (const panel of panels.splice(0)) panel.window.close() })

function openPanel({ provider = 'openai', failStorage = false, failRender = false } = {}) {
  const panel = new JSDOM('<div id="root"></div>', { url: 'https://extension.test/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: new VirtualConsole() })
  panels.push(panel)
  const event = { addListener() {}, removeListener() {} }
  const get = vi.fn(async () => {
    if (failStorage) throw new Error('Extension context invalidated.')
    return { settings: { provider } }
  })
  Object.assign(panel.window, {
    TextEncoder, TextDecoder, fetch,
    chrome: {
      sidePanel: {},
      storage: { local: { get }, session: { get: async () => ({}) }, onChanged: event },
      tabs: { query: async () => [], onUpdated: event, onActivated: failRender ? { addListener() { throw new Error('Panel lifecycle failed') } } : event },
      windows: { getCurrent: async () => ({ id: 1 }), onFocusChanged: event },
    },
  })
  // Like current Chrome: scrollIntoView returns a Promise (jsdom's returns nothing).
  panel.window.HTMLElement.prototype.scrollIntoView = (() => Promise.resolve()) as unknown as HTMLElement['scrollIntoView']
  panel.window.eval(bundle)
  return { document: panel.window.document, get }
}

describe('built extension panel', () => {
  it('opens the redesigned chat with its logo and send control', async () => {
    const { document } = openPanel()
    await vi.waitFor(() => expect(document.querySelector('textarea')).not.toBeNull())
    expect(document.querySelector('.brand-lockup svg path')).not.toBeNull()
    expect(document.querySelector('button[aria-label="Enviar"]')).not.toBeNull()
  })

  it('keeps the chat open after a starter is clicked', async () => {
    const { document } = openPanel()
    await vi.waitFor(() => expect(document.querySelector('.starters button')).not.toBeNull())
    document.querySelector<HTMLButtonElement>('.starters button')!.click()
    await vi.waitFor(() => expect(document.querySelector('.msg.user')?.textContent).toBe('Quiero renovar el DNI'))
    expect(document.querySelector('[role="alert"]')).toBeNull()
    expect(document.querySelector('textarea')).not.toBeNull()
  })

  it('opens onboarding when no API key is configured', async () => {
    const { document } = openPanel({ provider: 'anthropic' })
    await vi.waitFor(() => expect(document.querySelector('.onboarding input')).not.toBeNull())
    expect(document.querySelector('.brand-lockup')).not.toBeNull()
  })

  it('reports storage failure and retries without leaving a blank panel', async () => {
    const { document, get } = openPanel({ failStorage: true })
    await vi.waitFor(() => expect(document.querySelector('[role="alert"]')?.textContent).toContain('Extension context invalidated.'))
    get.mockResolvedValue({ settings: { provider: 'openai' } })
    document.querySelector<HTMLButtonElement>('button')!.click()
    await vi.waitFor(() => expect(document.querySelector('textarea')).not.toBeNull())
    expect(document.querySelector('[role="alert"]')).toBeNull()
  })

  it('shows a recovery screen for a React lifecycle failure', async () => {
    const { document } = openPanel({ failRender: true })
    await vi.waitFor(() => expect(document.querySelector('[role="alert"]')?.textContent).toContain('Panel lifecycle failed'))
    expect(document.querySelector('button')?.textContent).toBe('Recargar panel')
  })
})
