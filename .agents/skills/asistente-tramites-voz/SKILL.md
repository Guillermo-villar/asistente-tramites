---
name: asistente-tramites-voz
description: Configura y comprueba la entrada y salida por voz del chat en la web y la extensión de Asistente de trámites.
---

# Voz de Asistente de trámites

- La voz es una interfaz del chat. La transcripción se envía por `sendMessage` en la web y `send`/`runTurn` en la extensión. No uses un agente conversacional independiente ni dupliques la lógica o las herramientas del chat.
- `src/voice/use-speech.ts` comparte captura, transcripción, cola de turnos y lectura entre las dos interfaces. Scribe v3 Live transcribe PCM16 a 24 kHz con detección automática de idioma y VAD. Las respuestas finales del chat se leen con Eleven v4. Las preguntas de las herramientas pueden leerse mientras el agente espera respuesta.
- `web/server/voice.ts` emite un token temporal para Scribe y convierte texto del chat en audio. Configura `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` (voz castellana peninsular) y opcionalmente `ELEVENLABS_TTS_MODEL` en variables del servidor. Mantén las claves fuera del cliente y Git.
- Colgar detiene captura y reproducción y descarta entradas pendientes, conservando el historial del chat. «Nueva» detiene la voz antes de limpiar el historial. No se leen mensajes de antes de abrir el micrófono.
- Comprueba con audio de prueba que la transcripción dispara el envío normal del chat una sola vez, que el texto enviado a síntesis procede de esa respuesta y que no se pierde el contexto al alternar voz y teclado. Verifica los idiomas, la interrupción de reproducción y la liberación del micrófono.
- Referencias: [Scribe Realtime](https://elevenlabs.io/docs/api-reference/speech-to-text/v-1-speech-to-text-realtime), [síntesis de voz](https://elevenlabs.io/docs/api-reference/text-to-speech/convert).
