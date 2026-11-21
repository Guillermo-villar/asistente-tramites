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

## The flow: discovery on the web, hand-off to the extension

This web is for **discovery**: what trámite it is, what you need, how you sign in. The **extension** then guides you inside the official site. Every trámite card has a «Hacerlo con la extensión» button that hands off. The protocol is in `src/handoff.ts` at the repo root:

1. The web (`src/lib/extension-bridge.ts`) posts `{source: "asistente-tramites-web", type: "start", id, text, url}` to its own window.
2. The extension's **bridge** content script (`src/web/bridge.ts`) only runs on `WEB_ORIGINS`, which is localhost:5173 for now. It forwards the request to the background. On load it also answers `ping` with `ready`, which is how the web knows the extension is installed: the green dot in the header, and the button instead of "Instala la extensión".
3. The **background** checks that the sender is one of the `WEB_ORIGINS` and that the URL is https on a mapped or public-administration site. It tries `sidePanel.open()` while the click still counts as a user gesture, opens the URL in a new tab next to the web, and stores the task in `chrome.storage.session` under `handoff:<tabId>`. If the panel didn't open, it puts a red "1" badge on the toolbar icon for that tab.
4. The **panel** (`src/ui/App.tsx`) sees a pending task for its active tab and sends it as the first message. Tasks older than 10 minutes are dropped. The assistant then uses the site map to take you to the trámite.

**To ship:** add the production origin of this web to `WEB_ORIGINS` (the manifest's `content_scripts` is generated from it in `build.mjs`).

**Not tested end to end yet.** Branded Chrome no longer loads unpacked extensions from the command line, so this needs a manual run: build the extension, load `dist/` unpacked in `chrome://extensions`, open http://localhost:5173 and press the button. The main unknown is whether `sidePanel.open()` accepts the forwarded click; if it doesn't, the badge fallback kicks in.

## What the extension can do: shared site maps

`src/lib/extension-catalog.ts` imports `plugins/index.ts` from the repo root. Those are the same site maps (`plugins/*.json`) the extension loads, so the web always knows which trámites the extension can guide. Add a map there and it shows up on the web.

- `findProcedure(text)` matches a question against each procedure's `keywords` and `title`. A keyword matches when all its words appear in the question; longer keywords win.
- `planFor()` turns a procedure into what the person sees: what to have ready, how to sign in, each step split into "Tú" (from `person_does`) and "Extensión", and how to start (open `entry_url`, open the panel, type the trámite's name).
- `vite.config.ts` allows `..` so the dev server can read `../plugins`, and `tsconfig.app.json` has `resolveJsonModule`.

What the chat does:

- "¿Cómo funciona la extensión?", including from the header button: the `explicar_extension` card. It shows 6 steps, each in two lanes (Tú / Extensión), plus the trámites it already knows; clicking one asks for its plan.
- A trámite that's in a site map: the `plan_extension` card, with the hand-off.
- A trámite that's only in the web catalogue (NIE, renta…): the procedure card, also with the hand-off. All catalogue URLs are on gob.es, so the extension can open them; it guides by reading the page, since it has no map for them. The fake appointment slots (`buscar_cita`) were removed.

`?q=…` in the URL opens the page with that question already asked. Useful for links from the extension or for sharing.

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

1. Header: logo, and a "La extensión" button that asks the chat how the extension works and scrolls to it.
2. Hero (`#asistente`): one question as the headline, with `ChatPanel` (`src/components/chat/chat.tsx`) centred below it.
3. La extensión (`#extension`):
   - A browser mock with a highlighted field and the side panel.
   - 4 steps.
   - "What it does / what it never does" (mirrors `src/policy.ts` in the extension).
   - "Lo que ya sabe hacer": every procedure from the site maps, each one asks the chat for its plan.
   - Marked "Próximamente para Chrome y Safari".
4. Red footer: yellow escudo, short disclaimer and credit.

## Next steps

- Review it in the browser and polish the layout and mobile.
- Hook up a real model (Claude) via `/api/chat`, with these tools defined server-side.
- Code-split: the bundle is about 1.9 MB because of Streamdown and Shiki in AI Elements.
- Remove unused AI Elements (`task`, `suggestion`, `code-block` if unneeded).
