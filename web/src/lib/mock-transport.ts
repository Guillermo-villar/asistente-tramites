import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";
import { buscarEnCatalogo, misTramites, type FichaCatalogo } from "@/data/tramites";

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
    return stream(responder(text), abortSignal);
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

function responder(input: string): Step[] {
  const t = input.toLowerCase();

  if (/(estado|cómo va|como va|mis trámites|mis tramites|expediente|pendiente)/.test(t)) {
    const activos = misTramites.filter((x) => x.estado !== "completado");
    const accion = misTramites.filter((x) => x.estado === "accion");
    return [
      { kind: "reasoning", text: "Consulto tus expedientes abiertos en las sedes conectadas y ordeno por urgencia." },
      {
        kind: "tool",
        name: "consultar_expedientes",
        input: { incluir: "activos" },
        output: { tramites: activos },
        ms: 900,
      },
      {
        kind: "text",
        text:
          `Tienes **${activos.length} trámites abiertos**. ` +
          (accion.length
            ? `El más urgente es **${accion[0]!.titulo}**: ${accion[0]!.siguientePaso.toLowerCase()}.`
            : "Ninguno necesita nada de ti ahora mismo.") +
          "\n\nEl alta en el padrón sigue en revisión; te aviso en cuanto cambie.",
      },
    ];
  }

  if (/\bcita\b/.test(t)) {
    const ficha = buscarEnCatalogo(t) ?? buscarEnCatalogo("nie")!;
    return [
      { kind: "reasoning", text: `Busco huecos libres para «${ficha.titulo}» en las oficinas cercanas.` },
      {
        kind: "tool",
        name: "buscar_cita",
        input: { tramite: ficha.id, provincia: "Madrid" },
        output: {
          tramite: ficha.titulo,
          huecos: [
            { oficina: "Comisaría de Aluche", direccion: "C/ Las Matas, 6", fecha: "2026-11-26", hora: "09:20" },
            { oficina: "Comisaría de Moratalaz", direccion: "C/ Fuente Carrantona, 12", fecha: "2026-11-27", hora: "12:40" },
            { oficina: "Oficina de Extranjería de Madrid", direccion: "C/ Manuel Luna, 29", fecha: "2026-12-02", hora: "10:00" },
          ],
        },
        ms: 1400,
      },
      {
        kind: "text",
        text:
          "He encontrado **3 huecos**. Elige uno y te llevo a la página de cita previa con todo rellenado; **la confirmación la haces tú**.",
      },
      { kind: "sources", items: [{ url: ficha.url, title: "Cita previa · Sede electrónica" }] },
    ];
  }

  const ficha = buscarEnCatalogo(t);
  if (ficha) return tramiteSteps(ficha);

  return [
    {
      kind: "text",
      text:
        "Puedo ayudarte a **encontrar el trámite** que necesitas, **preparar la documentación**, **buscar cita** y **seguir el estado** de tus expedientes.\n\n" +
        "Cuéntame qué quieres hacer, por ejemplo: *«Necesito el NIE»*, *«¿Cómo hago la renta?»* o *«¿Cómo van mis trámites?»*.",
    },
  ];
}

function tramiteSteps(ficha: FichaCatalogo): Step[] {
  return [
    {
      kind: "reasoning",
      text: `La consulta encaja con «${ficha.titulo}» (${ficha.organismo}). Reviso requisitos, coste y canal de presentación.`,
    },
    { kind: "tool", name: "buscar_tramite", input: { consulta: ficha.titulo }, output: ficha, ms: 1100 },
    {
      kind: "text",
      text:
        `**${ficha.titulo}** se gestiona con ${ficha.organismo}. ${ficha.resumen}\n\n` +
        `Necesitarás ${ficha.requisitos.length} cosas; te las dejo arriba como lista. ` +
        "Si quieres, **lo empezamos juntos**: yo navego y relleno, y tú revisas y firmas.",
    },
    { kind: "sources", items: [{ url: ficha.url, title: `${ficha.organismo} · ficha oficial` }] },
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
