import { useCallback, useEffect, useRef, useState } from 'react'

// The website's voice conversation (web/src/components/chat/use-voice-session.ts), in the side panel. The
// local server (web/, npm run dev) holds the ElevenLabs key and hands out a short-lived session token; the
// panel then talks to Eleven Realtime directly over a WebSocket, PCM16 at 24 kHz both ways. The capture
// worklet is the website's own file, copied into the extension by build.mjs.

const SAMPLE_RATE = 24000
const REALTIME_URL = 'wss://api.elevenlabs.io/v1/convai/realtime'
export const LOCAL_VOICE_API = 'http://127.0.0.1:5173/api/voice/session'

export type VoiceStatus = 'idle' | 'connecting' | 'connected'
export type VoiceError = 'unavailable' | 'permission' | 'server' | 'timeout' | 'connection' | 'response' | 'disconnected'
export type VoiceLevels = { input: number; output: number }
type VoiceEvent = { type: string; delta?: string; item_id?: string; response?: { status?: string } }

export const VOICE_MESSAGES: Record<VoiceError, string> = {
  unavailable: 'Este navegador no permite iniciar una conversación de voz.',
  permission: 'Permite el micrófono en la pestaña que se ha abierto y vuelve a pulsar el botón de voz.',
  server: 'No se puede conectar con el servidor local. Ejecuta npm run dev en la carpeta web.',
  timeout: 'La conexión de voz tardó demasiado. Vuelve a intentarlo.',
  connection: 'No se pudo iniciar la voz. Comprueba el micrófono y ELEVENLABS_API_KEY en web/.env.local.',
  response: 'No se pudo completar la respuesta de voz.',
  disconnected: 'Se cerró la conexión de voz.',
}

const SILENT: VoiceLevels = { input: 0, output: 0 }

/** Loudness of what an analyser hears, from 0 (silence) to 1 (clear speech). */
function loudness(analyser: AnalyserNode, samples: Float32Array<ArrayBuffer>): number {
  analyser.getFloatTimeDomainData(samples)
  let sum = 0
  for (const sample of samples) sum += sample * sample
  return Math.min(1, Math.sqrt(sum / samples.length) * 4)
}

/** Whether the extension already may use the microphone. Unknown (no Permissions API for it) counts as yes. */
async function microphoneAllowed(): Promise<boolean> {
  try {
    return (await navigator.permissions.query({ name: 'microphone' as PermissionName })).state === 'granted'
  } catch {
    return true
  }
}

/**
 * A side panel cannot show Chrome's microphone prompt (getUserMedia there just waits, or is refused), so
 * until the extension has the permission the panel opens an extension page in a tab that asks for it. Once
 * the person allows it there, the whole extension (and the panel) has it.
 */
function askForMicrophoneInATab(): void {
  try {
    void chrome.tabs.create({ url: chrome.runtime.getURL('microphone.html') })
  } catch {
    // Outside the extension (tests): nothing to open.
  }
}

export function useVoiceSession() {
  const active = useRef<(() => void) | null>(null)
  const meter = useRef<(() => VoiceLevels) | null>(null)
  /** Live microphone and assistant loudness, for the orb. Safe to call every frame. */
  const getLevels = useCallback(() => meter.current?.() ?? SILENT, [])
  const [status, setStatus] = useState<VoiceStatus>('idle')
  const [error, setError] = useState<VoiceError | null>(null)

  useEffect(() => () => active.current?.(), [])

  const stop = useCallback(() => {
    active.current?.()
    setStatus('idle')
    setError(null)
  }, [])

  const start = useCallback(async () => {
    if (active.current) return
    setError(null)
    if (!navigator.mediaDevices?.getUserMedia || typeof AudioWorkletNode === 'undefined') {
      setError('unavailable')
      return
    }

    const abort = new AbortController()
    const playback = new Set<AudioBufferSourceNode>()
    let socket: WebSocket | undefined
    let context: AudioContext | undefined
    let microphone: MediaStream | undefined
    let capture: AudioWorkletNode | undefined
    let timeout: ReturnType<typeof setTimeout> | undefined
    let nextAudioTime = 0
    let speakingItem: string | undefined
    let interruptedItem: string | undefined
    let ready = false

    const stopPlayback = () => {
      for (const source of playback) source.stop()
      playback.clear()
      nextAudioTime = 0
    }
    const dispose = () => {
      clearTimeout(timeout)
      abort.abort()
      active.current = null
      meter.current = null
      microphone?.getTracks().forEach((track) => track.stop())
      capture?.disconnect()
      capture?.port.close()
      stopPlayback()
      socket?.close()
      if (context && context.state !== 'closed') void context.close()
    }
    const finish = (reason: VoiceError) => {
      if (abort.signal.aborted) return
      dispose()
      setStatus('idle')
      setError(reason)
    }

    active.current = dispose
    setStatus('connecting')
    // From the start: any step that hangs (the microphone, the server, ElevenLabs) ends in a clear message.
    timeout = setTimeout(() => finish('timeout'), 25000)

    if (!(await microphoneAllowed())) {
      askForMicrophoneInATab()
      finish('permission')
      return
    }

    try {
      const audio = (context = new AudioContext({ sampleRate: SAMPLE_RATE }))
      const resumed = audio.resume().then(() => true, () => false)
      try {
        microphone = await navigator.mediaDevices.getUserMedia({
          audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
        })
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === 'NotAllowedError') {
          askForMicrophoneInATab()
          finish('permission')
          return
        }
        throw cause
      }
      if (abort.signal.aborted) {
        microphone.getTracks().forEach((track) => track.stop())
        return
      }
      if (!(await resumed) || audio.sampleRate !== SAMPLE_RATE) throw new Error('Audio incompatible')
      await audio.audioWorklet.addModule(chrome.runtime.getURL('voice-capture.js'))
      abort.signal.throwIfAborted()

      let response: Response
      try {
        response = await fetch(LOCAL_VOICE_API, { method: 'POST', signal: abort.signal })
      } catch {
        finish('server')
        return
      }
      const session = (await response.json().catch(() => ({}))) as { token?: string }
      if (!response.ok || !session.token) {
        finish('connection')
        return
      }
      abort.signal.throwIfAborted()

      const connection = (socket = new WebSocket(REALTIME_URL, ['realtime', `openai-insecure-api-key.${session.token}`]))
      capture = new AudioWorkletNode(audio, 'voice-capture', { channelCount: 1 })
      capture.port.onmessage = ({ data }: MessageEvent<ArrayBuffer>) => {
        if (!ready || connection.readyState !== WebSocket.OPEN) return
        if (connection.bufferedAmount > 256 * 1024) {
          finish('connection')
          return
        }
        const pcm = btoa(String.fromCharCode(...new Uint8Array(data)))
        connection.send(JSON.stringify({ type: 'input_audio_buffer.append', audio: pcm }))
      }
      const input = audio.createMediaStreamSource(microphone)
      input.connect(capture)
      const inputMeter = audio.createAnalyser()
      const outputMeter = audio.createAnalyser()
      inputMeter.fftSize = outputMeter.fftSize = 512
      input.connect(inputMeter)
      const output = audio.createGain()
      output.connect(outputMeter)
      output.connect(audio.destination)
      const samples = new Float32Array(inputMeter.fftSize)
      meter.current = () => ({ input: loudness(inputMeter, samples), output: loudness(outputMeter, samples) })
      // The worklet must reach the destination to run, but the person must not hear their own microphone.
      const silentOutput = audio.createGain()
      silentOutput.gain.value = 0
      capture.connect(silentOutput).connect(audio.destination)

      connection.onmessage = ({ data }) => {
        if (abort.signal.aborted) return
        const event = JSON.parse(data) as VoiceEvent
        if (event.type === 'session.created' && !ready) {
          // Eleven Realtime needs an input turn before it can generate the opening reply.
          connection.send(JSON.stringify({
            type: 'conversation.item.create',
            item: {
              type: 'message',
              role: 'user',
              content: [{ type: 'input_text', text: 'Empieza la conversación. Saluda en castellano de España y di únicamente: «Hola, ¿qué trámite necesitas?»' }],
            },
          }))
          connection.send(JSON.stringify({ type: 'response.create' }))
          ready = true
          clearTimeout(timeout)
          setStatus('connected')
        } else if (event.type === 'input_audio_buffer.speech_started') {
          // The person talks over the assistant: stop its current answer.
          interruptedItem = playback.size ? speakingItem : undefined
          stopPlayback()
        } else if (event.type === 'response.output_audio.delta' && event.delta && (!interruptedItem || event.item_id !== interruptedItem)) {
          speakingItem = event.item_id
          const bytes = Uint8Array.from(atob(event.delta), (byte) => byte.charCodeAt(0))
          const pcm = new DataView(bytes.buffer)
          const buffer = audio.createBuffer(1, bytes.length / 2, SAMPLE_RATE)
          const channel = buffer.getChannelData(0)
          for (let index = 0; index < channel.length; index++) channel[index] = pcm.getInt16(index * 2, true) / 32768
          const source = audio.createBufferSource()
          source.buffer = buffer
          source.connect(output)
          source.onended = () => {
            source.disconnect()
            playback.delete(source)
          }
          playback.add(source)
          const startTime = Math.max(audio.currentTime, nextAudioTime)
          source.start(startTime)
          nextAudioTime = startTime + buffer.duration
        } else if (event.type === 'error' || (event.type === 'response.done' && event.response?.status === 'failed')) {
          if (ready) setError('response')
          else finish('connection')
        }
      }
      connection.onerror = () => finish('connection')
      connection.onclose = () => finish('disconnected')
    } catch {
      finish('connection')
    }
  }, [])

  return { status, error, start, stop, getLevels }
}
