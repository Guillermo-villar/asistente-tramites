# Web front-end: context

A React web app for the trámites assistant. It has a chatbot, the person's open trámites and their status, and a history of past actions. It sits next to the browser extension (repo root), which is a separate thing.

**Status: work in progress, stopped mid-build.** It typechecks and builds (`npm run build`), but it has not been reviewed in a browser yet.

## Run

```sh
cd web
npm install
npm run dev
```

## Stack and where the pieces come from

| Piece | Source | Where |
|---|---|---|
| Chat UI (Conversation, Message, PromptInput, Reasoning, Tool, Sources, Shimmer) | Vercel **AI Elements** (`npx ai-elements add …`), shadcn-based. Copied into the repo, so editing is expected. UI strings translated to Spanish. | `src/components/ai-elements/` |
| Chat state | AI SDK `useChat` (`ai` v7, `@ai-sdk/react` v4) | `src/components/chat/chat.tsx` |
| Primitives (button, sheet, tabs, card…) | shadcn/ui, Radix base, Nova preset | `src/components/ui/` |
| Styling | Tailwind v4, tokens in `src/index.css` | |
| Live government data | BOE open-data API, daily sumario, CORS-enabled, no key | `src/lib/boe.ts`, shown in the right rail |

Other sources looked at: datos.gob.es `apidata` (CORS `*`, works, not used yet). There's no official React design system for the central government; the closest is Aragón's DESY. No public API for the SIA procedures catalogue was found.

## The model is mocked

`src/lib/mock-transport.ts` implements the AI SDK `ChatTransport`. It streams real UI-message chunks: reasoning, tool calls, text and sources, based on keyword intents (NIE, padrón, renta, paro, cita, "cómo van mis trámites"). To go live, replace it with `new DefaultChatTransport({ api: "/api/chat" })` and a server route that returns `streamText(...).toUIMessageStreamResponse()`.

Tool results render as UI ("generative UI") in `src/components/chat/tool-cards.tsx`:

- `buscar_tramite`: a procedure card with a requirements checklist.
- `consultar_expedientes`: a list of open expedientes.
- `buscar_cita`: selectable appointment slots.

## Data

`src/data/tramites.ts`: the catalogue links point to the real official portals. The person's expedientes, references, dates and activity are **fictional demo data**.

## Brand

The visual direction comes from Samuel Mòdol and Manu Homie's 2019 redesign study of the escudo (https://graficatessen.es/rediseno-del-escudo-del-gobierno-de-espana-por-samuel-modol-y-manu-homie/). It's a red monoline style with dots and ≈ waves, a wide-tracked slab serif (Arvo here), and red `#F20D0D` / yellow `#FFE500` / black on white.

The mark in `src/components/brand/logo.tsx` is **original**: a "talking shield" with three typing dots. We deliberately do not use their escudo or the «Gobierno de España» lockup, for two reasons:

- It's their work, with no license.
- An escudo on an unofficial service would make it look like the Government's own.

To use their artwork, get the designers' permission and keep the "no oficial" disclaimer. Swap the logo in that one component.

## Layout

- Left nav: Asistente / Mis trámites / Actividad.
- Main: the chat, or the selected view.
- Right rail, on xl screens in the Asistente view: En curso, Próximos plazos, BOE en directo.
- Trámite detail opens in a sheet.

`src/App.tsx` is a first, minimal shell.

## Next steps

- Review it in the browser and polish the layout, mobile and the empty state.
- Hook up a real model (Claude) via `/api/chat`, with these tools defined server-side.
- Replace the mock expedientes with real data (from the extension / Carpeta Ciudadana).
- Code-split: the bundle is about 1.9 MB because of Streamdown and Shiki in AI Elements.
- Remove unused AI Elements (`task`, `suggestion`, `code-block` if unneeded).
