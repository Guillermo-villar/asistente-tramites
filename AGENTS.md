# Asistente de trámites

- La raíz contiene la extensión de navegador. La aplicación React/Vite está en `web/` y tiene su propio `package.json` y archivo de bloqueo.
- Para trabajar en la web, instala con `npm --prefix web ci` y arranca con `npm --prefix web run dev`. Comprueba los cambios con `npm --prefix web run build` y `npm --prefix web run lint`.
- Para cambios en la extensión, usa los comandos de la raíz `npm run typecheck`, `npm test` y `npm run build` según el alcance.
- El asistente orienta y puede guiar la navegación. La persona escribe sus datos y confirma cualquier presentación, firma o pago.
- Si trabajas en la voz de la web, consulta la [skill de voz](.agents/skills/asistente-tramites-voz/SKILL.md). Mantén las credenciales en `web/.env` o en variables del servidor.
