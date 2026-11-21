# Web front-end: context

A simple public landing page. The chatbot is the main thing, followed by one section explaining how the browser extension works. There's no login and no personal area. It sits next to the browser extension (repo root), which is a separate thing.

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

Other sources looked at: the BOE open-data API (CORS-enabled, no key; a live feed was built and removed to keep the page simple, see git history) and datos.gob.es `apidata` (CORS `*`, not used). There's no official React design system for the central government; the closest is Aragón's DESY. No public API for the SIA procedures catalogue was found.

## The model is mocked

`src/lib/mock-transport.ts` implements the AI SDK `ChatTransport`. It streams real UI-message chunks: reasoning, tool calls, text and sources, based on keyword intents (extensión, NIE, padrón, renta, paro, certificado, cita, reserva). Asked about the extension, it explains how it works. "¿Cómo van mis trámites?" gets pointed to Carpeta Ciudadana, because the site has no session. To go live, replace it with `new DefaultChatTransport({ api: "/api/chat" })` and a server route that returns `streamText(...).toUIMessageStreamResponse()`.

Tool results render as UI ("generative UI") in `src/components/chat/tool-cards.tsx`:

- `buscar_tramite`: a procedure card with a requirements checklist.
- `buscar_cita`: selectable appointment slots (fictional demo slots).

Card buttons send follow-ups to the chat through `AskContext`.

## Data

`src/data/tramites.ts`: a catalogue of 8 common trámites. The links point to the real official portals; the summaries are a simplified guide. The earlier logged-in demo data (expedientes, activity) was removed and is in git history (commit a58f9e5).

## Brand

The visual direction comes from Samuel Mòdol and Manu Homie's 2019 redesign study of the escudo (https://graficatessen.es/rediseno-del-escudo-del-gobierno-de-espana-por-samuel-modol-y-manu-homie/). It's a red monoline style with dots and ≈ waves, a wide-tracked slab serif (Arvo here), and red `#F20D0D` / yellow `#FFE500` / black on white.

The logo **is their escudo**, at the user's request. It's traced to SVG from their published artwork (`src/components/brand/escudo-paths.ts`) and drawn in `currentColor`, so it can be red, black or white.

Next to it, the wordmark is ours («Asistente de Trámites»), not «Gobierno de España», and every screen keeps a "Servicio no oficial" notice.

**Before any public release:**

- Get Mòdol and Homie's permission. It's their work, with no license.
- Check the rules on using the escudo for a non-official service (Ley 33/1981).

## Layout (landing)

`src/App.tsx` holds the `useChat`. The sections are in `src/components/landing/sections.tsx`:

1. Header: logo and a link to "La extensión".
2. Hero (`#asistente`): one question as the headline, with `ChatPanel` (`src/components/chat/chat.tsx`) centred below it.
3. La extensión (`#extension`): a browser mock with a highlighted field and the side panel, 4 steps, and "what it does / what it never does" (mirrors `src/policy.ts` in the extension). It's marked "Próximamente para Chrome y Safari".
4. Red footer: yellow escudo, short disclaimer and credit.

## Next steps

- Review it in the browser and polish the layout and mobile.
- Hook up a real model (Claude) via `/api/chat`, with these tools defined server-side.
- Code-split: the bundle is about 1.9 MB because of Streamdown and Shiki in AI Elements.
- Remove unused AI Elements (`task`, `suggestion`, `code-block` if unneeded).
