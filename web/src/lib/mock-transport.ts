import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";
import { buscarEnCatalogo, ficha, type FichaCatalogo } from "@/data/tramites";
import type { Lang } from "@/i18n/langs";
import { messages } from "@/i18n/messages";

/**
 * A local stand-in for the model. It speaks the AI SDK UI-message stream protocol
 * (reasoning, tool calls, text, sources), so `useChat` and the AI Elements render it
 * exactly as they would a real model. To go live, swap it for:
 *
 *   new DefaultChatTransport({ api: "/api/chat" })
 *
 * with a server route that returns `streamText(...).toUIMessageStreamResponse()`.
 */
export class MockTramitesTransport implements ChatTransport<UIMessage> {
  private lang: Lang = "es";

  /** Language of the next replies. The app keeps it in sync with the header's language picker. */
  setLang(lang: Lang) {
    this.lang = lang;
  }

  async sendMessages({
    messages,
    abortSignal,
  }: Parameters<ChatTransport<UIMessage>["sendMessages"]>[0]) {
    const last = messages.at(-1);
    const text =
      last?.parts
        .filter((p) => p.type === "text")
        .map((p) => p.text)
        .join(" ") ?? "";
    return stream(responder(text, this.lang), abortSignal);
  }

  async reconnectToStream() {
    return null;
  }
}

type Step =
  | { kind: "reasoning"; text: string }
  | { kind: "tool"; name: string; input: unknown; output: unknown; ms?: number }
  | { kind: "text"; text: string }
  | { kind: "sources"; items: { url: string; title: string }[] };

// Intent keywords in every supported language (es, ca, eu, gl, en): the user may type in any of them.
const EXTENSION = /(extensi|plugin|complement|panel lateral|luzapen|hedapen|gehigarri)/;
const RESERVA = /(reserv|erreserb|\bbook\b)/;
const ESTADO =
  /(estado|cómo va|como va|mis trámites|mis tramites|expedient|\bestat\b|com van|els meus tràmits|egoera|nire izapide|espediente|os meus trámites|\bstatus\b|my procedures|my applications)/;
const CITA = /(\bcita\b|hitzordu|appointment)/;

function responder(input: string, lang: Lang): Step[] {
  const t = input.toLowerCase();
  const r = messages[lang].replies;

  if (EXTENSION.test(t)) return [{ kind: "text", text: r.extension }];

  if (RESERVA.test(t)) {
    const f = buscarEnCatalogo(t, lang) ?? ficha("nie", lang);
    return [
      { kind: "text", text: r.reserva },
      { kind: "sources", items: [{ url: f.url, title: r.citaSource(f.organismo) }] },
    ];
  }

  // Public site: there is no session, so status questions go to Carpeta Ciudadana.
  if (ESTADO.test(t)) {
    return [
      { kind: "text", text: r.estado },
      { kind: "sources", items: [{ url: "https://carpetaciudadana.gob.es/", title: r.estadoSource }] },
    ];
  }

  if (CITA.test(t)) {
    const f = buscarEnCatalogo(t, lang) ?? ficha("nie", lang);
    return [
      { kind: "reasoning", text: r.citaReasoning(f.titulo) },
      {
        kind: "tool",
        name: "buscar_cita",
        input: { tramite: f.id, provincia: "Madrid" },
        output: { tramite: f.titulo, huecos: huecosPara(f, lang) },
        ms: 1400,
      },
      { kind: "text", text: r.citaFound },
      { kind: "sources", items: [{ url: f.url, title: r.citaSource(f.organismo) }] },
    ];
  }

  const f = buscarEnCatalogo(t, lang);
  if (f) return tramiteSteps(f, lang);

  return [{ kind: "text", text: r.fallback }];
}

const NIE_DIRECCIONES = ["C/ Las Matas, 6", "C/ Fuente Carrantona, 12", "C/ Manuel Luna, 29"];

/** Demo slots (fictional), named after the kind of office that handles the trámite. */
function huecosPara(f: FichaCatalogo, lang: Lang) {
  const oficinas =
    f.id === "nie"
      ? messages[lang].nieOffices.map((oficina, i) => ({ oficina, direccion: NIE_DIRECCIONES[i]! }))
      : ["Centro", "Chamberí", "Arganzuela"].map((zona) => ({
          oficina: `${f.organismo.split(" · ")[0]} · ${zona}`,
          direccion: "Madrid",
        }));
  const slots = [
    { fecha: "2026-11-26", hora: "09:20" },
    { fecha: "2026-11-27", hora: "12:40" },
    { fecha: "2026-12-02", hora: "10:00" },
  ];
  return oficinas.map((o, i) => ({ ...o, ...slots[i]! }));
}

function tramiteSteps(f: FichaCatalogo, lang: Lang): Step[] {
  const r = messages[lang].replies;
  return [
    { kind: "reasoning", text: r.tramiteReasoning(f.titulo, f.organismo) },
    { kind: "tool", name: "buscar_tramite", input: { consulta: f.titulo }, output: f, ms: 1100 },
    { kind: "text", text: r.tramiteText(f) },
    { kind: "sources", items: [{ url: f.url, title: r.tramiteSource(f.organismo) }] },
  ];
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(id);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

let seq = 0;
const nextId = (p: string) => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

function stream(steps: Step[], signal?: AbortSignal): ReadableStream<UIMessageChunk> {
  return new ReadableStream<UIMessageChunk>({
    async start(controller) {
      const emit = (c: UIMessageChunk) => controller.enqueue(c);
      try {
        emit({ type: "start" });
        await sleep(350, signal);
        for (const step of steps) {
          emit({ type: "start-step" });
          if (step.kind === "reasoning") {
            const id = nextId("r");
            emit({ type: "reasoning-start", id });
            for (const w of words(step.text)) {
              emit({ type: "reasoning-delta", id, delta: w });
              await sleep(22, signal);
            }
            emit({ type: "reasoning-end", id });
          } else if (step.kind === "tool") {
            const toolCallId = nextId("call");
            emit({ type: "tool-input-available", toolCallId, toolName: step.name, input: step.input });
            await sleep(step.ms ?? 800, signal);
            emit({ type: "tool-output-available", toolCallId, output: step.output });
          } else if (step.kind === "text") {
            const id = nextId("t");
            emit({ type: "text-start", id });
            for (const w of words(step.text)) {
              emit({ type: "text-delta", id, delta: w });
              await sleep(18, signal);
            }
            emit({ type: "text-end", id });
          } else {
            for (const s of step.items) {
              emit({ type: "source-url", sourceId: nextId("src"), url: s.url, title: s.title });
            }
          }
          emit({ type: "finish-step" });
        }
        emit({ type: "finish" });
        controller.close();
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          emit({ type: "abort" });
          controller.close();
        } else {
          controller.error(err);
        }
      }
    },
  });
}

/** Split into word-sized deltas, keeping the whitespace so markdown survives. */
const words = (s: string) => s.match(/\S+\s*|\s+/g) ?? [];
