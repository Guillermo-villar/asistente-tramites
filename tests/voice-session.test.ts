import { EventEmitter } from 'node:events'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { voiceSession } from '../web/server/voice'

type Handler = (request: IncomingMessage, response: ServerResponse) => void

function handler(apiKey = 'eleven-secret'): Handler {
  let use: Handler | undefined
  const plugin = voiceSession(apiKey, 'brian') as { configureServer: (server: unknown) => void }
  plugin.configureServer({ middlewares: { use: (_path: string, fn: Handler) => { use = fn } } })
  return use!
}

function call(origin: string | undefined): Promise<{ status: number; body: { token?: string; error?: string }; headers: Record<string, string> }> {
  return new Promise((done) => {
    const request = { method: 'POST', headers: { host: '127.0.0.1:5173', ...(origin ? { origin } : {}) } } as unknown as IncomingMessage
    const headers: Record<string, string> = {}
    const response = Object.assign(new EventEmitter(), {
      setHeader: (name: string, value: string) => { headers[name.toLowerCase()] = value },
      writeHead: (status: number) => { (response as unknown as { status: number }).status = status },
      end: (text: string) => done({ status: (response as unknown as { status: number }).status, body: JSON.parse(text), headers }),
    }) as unknown as ServerResponse
    handler()(request, response)
  })
}

describe('voice session for the extension', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('hands a session token to the side panel, and nothing to other sites', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ value: 'short-lived' }))))
    const fromPanel = await call('chrome-extension://abcdefghijklmnopabcdefghijklmnop')
    expect(fromPanel.status).toBe(200)
    expect(fromPanel.body).toEqual({ token: 'short-lived' })
    expect(fromPanel.headers['access-control-allow-origin']).toBe('chrome-extension://abcdefghijklmnopabcdefghijklmnop')
    expect((await call('http://127.0.0.1:5173')).status).toBe(200)
    expect((await call('https://evil.example')).status).toBe(403)
    expect((await call(undefined)).status).toBe(403)
  })
})
