import { useEffect, useRef, useState } from "react";
import captureModule from "./voice-capture.js?url&no-inline";

const SAMPLE_RATE = 24000;
const REALTIME_URL = "wss://api.elevenlabs.io/v1/convai/realtime";

type VoiceStatus = "idle" | "connecting" | "connected";
type VoiceError = "unavailable" | "permission" | "timeout" | "connection" | "response" | "disconnected";
type VoiceEvent = { type: string; delta?: string; item_id?: string; response?: { status?: string } };

export function useVoiceSession() {
  const active = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [error, setError] = useState<VoiceError | null>(null);

  useEffect(() => () => active.current?.(), []);

  function stop() {
    active.current?.();
    setStatus("idle");
    setError(null);
  }

  async function start() {
    if (active.current) return;
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof AudioWorkletNode === "undefined") {
      setError("unavailable");
      return;
    }

    const abort = new AbortController();
    const playback = new Set<AudioBufferSourceNode>();
    let socket: WebSocket | undefined;
    let context: AudioContext | undefined;
    let microphone: MediaStream | undefined;
    let capture: AudioWorkletNode | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let nextAudioTime = 0;
    let speakingItem: string | undefined;
    let interruptedItem: string | undefined;
    let ready = false;

    const stopPlayback = () => {
      for (const source of playback) source.stop();
      playback.clear();
      nextAudioTime = 0;
    };
    const dispose = () => {
      clearTimeout(timeout);
      abort.abort();
      active.current = null;
      microphone?.getTracks().forEach((track) => track.stop());
      capture?.disconnect();
      capture?.port.close();
      stopPlayback();
      socket?.close();
      if (context && context.state !== "closed") void context.close();
    };
    const finish = (reason: VoiceError) => {
      if (abort.signal.aborted) return;
      dispose();
      setStatus("idle");
      setError(reason);
    };

    active.current = dispose;
    setStatus("connecting");

    try {
      const audio = context = new AudioContext({ sampleRate: SAMPLE_RATE });
      const resumed = audio.resume().then(() => true, () => false);
      microphone = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      if (abort.signal.aborted) {
        microphone.getTracks().forEach((track) => track.stop());
        return;
      }
      timeout = setTimeout(() => finish("timeout"), 25000);
      if (!await resumed || audio.sampleRate !== SAMPLE_RATE) throw new Error("Audio incompatible");
      await audio.audioWorklet.addModule(captureModule);
      abort.signal.throwIfAborted();

      const response = await fetch("/api/voice/session", { method: "POST", signal: abort.signal });
      const session = await response.json() as { token?: string };
      if (!response.ok || !session.token) {
        finish("connection");
        return;
      }
      abort.signal.throwIfAborted();

      const connection = socket = new WebSocket(REALTIME_URL, [
        "realtime",
        `openai-insecure-api-key.${session.token}`,
      ]);
      capture = new AudioWorkletNode(audio, "voice-capture", { channelCount: 1 });
      capture.port.onmessage = ({ data }: MessageEvent<ArrayBuffer>) => {
        if (!ready || connection.readyState !== WebSocket.OPEN) return;
        if (connection.bufferedAmount > 256 * 1024) {
          finish("connection");
          return;
        }
        const pcm = btoa(String.fromCharCode(...new Uint8Array(data)));
        connection.send(JSON.stringify({ type: "input_audio_buffer.append", audio: pcm }));
      };
      audio.createMediaStreamSource(microphone).connect(capture);
      const silentOutput = audio.createGain();
      silentOutput.gain.value = 0;
      capture.connect(silentOutput).connect(audio.destination);

      connection.onmessage = ({ data }) => {
        if (abort.signal.aborted) return;
        const event = JSON.parse(data) as VoiceEvent;
        if (event.type === "session.created" && !ready) {
          // Eleven Realtime needs an input turn before it can generate the opening reply.
          connection.send(JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "message",
              role: "user",
              content: [{
                type: "input_text",
                text: "Empieza la conversación. Saluda en castellano de España y di únicamente: «Hola, ¿qué trámite necesitas?»",
              }],
            },
          }));
          connection.send(JSON.stringify({ type: "response.create" }));
          ready = true;
          clearTimeout(timeout);
          setStatus("connected");
        } else if (event.type === "input_audio_buffer.speech_started") {
          interruptedItem = playback.size ? speakingItem : undefined;
          stopPlayback();
        } else if (event.type === "response.output_audio.delta" && event.delta &&
                   (!interruptedItem || event.item_id !== interruptedItem)) {
          speakingItem = event.item_id;
          const binary = atob(event.delta);
          const bytes = Uint8Array.from(binary, (byte) => byte.charCodeAt(0));
          const pcm = new DataView(bytes.buffer);
          const buffer = audio.createBuffer(1, bytes.length / 2, SAMPLE_RATE);
          const samples = buffer.getChannelData(0);
          for (let index = 0; index < samples.length; index++) {
            samples[index] = pcm.getInt16(index * 2, true) / 32768;
          }
          const source = audio.createBufferSource();
          source.buffer = buffer;
          source.connect(audio.destination);
          source.onended = () => {
            source.disconnect();
            playback.delete(source);
          };
          playback.add(source);
          const startTime = Math.max(audio.currentTime, nextAudioTime);
          source.start(startTime);
          nextAudioTime = startTime + buffer.duration;
        } else if (event.type === "error" ||
                   (event.type === "response.done" && event.response?.status === "failed")) {
          if (ready) setError("response");
          else finish("connection");
        }
      };
      connection.onerror = () => finish("connection");
      connection.onclose = () => finish("disconnected");
    } catch (cause) {
      finish(cause instanceof DOMException && cause.name === "NotAllowedError" ? "permission" : "connection");
    }
  }

  return { status, error, start, stop };
}
