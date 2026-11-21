---
name: asistente-tramites-voz
description: Configura y comprueba la conversación multilingüe automática en la web de Asistente de trámites. Úsala para la detección de idioma por voz, Eleven Realtime y las sesiones WebSocket de este repositorio.
---

# Voz de Asistente de trámites

- `web/server/voice.ts` obtiene una credencial de sesión temporal de ElevenLabs. Configura `ELEVENLABS_API_KEY` y, si la cuenta dispone de una voz adecuada, `ELEVENLABS_VOICE_ID` en `web/.env` o en variables del servidor. El middleware se registra en `web/vite.config.ts`.
- `use-voice-session.ts` conecta el navegador directamente a ElevenLabs por WebSocket y libera el micrófono al colgar o salir del chat. El audio usa PCM de 16 bits a 24 kHz en ambos sentidos. El `AudioWorklet` captura el audio sin reproducir el micrófono en los altavoces.
- Eleven Realtime v1 Max sigue el idioma de la última intervención clara. La configuración prioriza castellano peninsular, galego estándar y català central. El euskara queda fuera de la cobertura documentada. Consulta [los modelos de ElevenLabs](https://elevenlabs.io/docs/overview/models) y [su protocolo Realtime](https://elevenlabs.io/docs/eleven-agents/guides/openai-realtime-compatibility) para cambios de modelo o transporte.
- En una prueba de navegador, habla primero en uno de los idiomas y pasa a otro en la misma llamada. Comprueba el idioma de las respuestas, la continuidad de la sesión y que colgar libera la pista de entrada. Puedes usar audio sintético como entrada. Para evaluar el acento, escucha una muestra por idioma.
