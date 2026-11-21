import type { IncomingMessage, ServerResponse } from "node:http"
import type { Plugin } from "vite"

const voiceInstructions = [
  'Eres un asistente de IA no oficial que orienta sobre trámites en España. Responde con frases breves y claras y remite a la sede oficial para confirmar requisitos y plazos. No solicites credenciales ni afirmes tener acceso a expedientes, poder reservar citas o presentar solicitudes.',
  'Responde en el idioma de la última intervención clara, desde el primer turno. Cambia si el usuario cambia claramente de idioma o pide otro, incluso dentro de una llamada. Conserva el idioma anterior ante un nombre, sigla, número o palabra aislada ambigua.',
  'En castellano usa acento peninsular del centro y norte de España, con distinción entre ese y zeta o ce ante e o i. Habla en català central y galego estándar cuando corresponda. Si entiendes una petición en euskara y no puedes responder con claridad, explica la limitación y ofrece continuar en castellano.',
].join('\n')

export function voiceSession(apiKey: string | undefined, voiceId: string): Plugin {
  return {
    name: 'local-voice-session',
    configureServer(server) {
      server.middlewares.use('/api/voice/session', (request, response) => {
        void createVoiceSession(request, response, apiKey, voiceId)
      })
    },
  }
}

async function createVoiceSession(
  request: IncomingMessage,
  response: ServerResponse,
  apiKey: string | undefined,
  voiceId: string,
) {
  const sendJson = (status: number, data: { error: string } | { token: string }) => {
    response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
    response.end(JSON.stringify(data))
  }

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return sendJson(405, { error: 'Usa POST para iniciar una sesión de voz.' })
  }
  const host = request.headers.host ?? ''
  if (!/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host) ||
      request.headers.origin !== `http://${host}`) {
    return sendJson(403, { error: 'La sesión de voz solo está disponible desde esta web local.' })
  }
  if (!apiKey) return sendJson(503, { error: 'Falta ELEVENLABS_API_KEY en el servidor.' })

  const disconnect = new AbortController()
  response.once('close', () => disconnect.abort())
  try {
    const upstream = await fetch('https://api.elevenlabs.io/v1/convai/realtime/client_secrets', {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      signal: AbortSignal.any([disconnect.signal, AbortSignal.timeout(15000)]),
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: 'eleven_realtime_v1_max',
          instructions: voiceInstructions,
          output_modalities: ['audio'],
          audio: {
            input: {
              format: { type: 'audio/pcm', rate: 24000 },
              turn_detection: { type: 'semantic_vad', eagerness: 'medium' },
            },
            output: { format: { type: 'audio/pcm', rate: 24000 }, voice: voiceId },
          },
        },
      }),
    })
    if (!upstream.ok) {
      console.error(`ElevenLabs rechazó la sesión de voz (${upstream.status}).`)
      await upstream.body?.cancel()
      return sendJson(502, { error: 'ElevenLabs no pudo iniciar la sesión de voz.' })
    }
    const result = await upstream.json() as { value?: string }
    if (!result.value) return sendJson(502, { error: 'ElevenLabs no devolvió un token de voz.' })
    sendJson(200, { token: result.value })
  } catch {
    if (!disconnect.signal.aborted) sendJson(502, { error: 'No se pudo conectar con ElevenLabs.' })
  }
}
