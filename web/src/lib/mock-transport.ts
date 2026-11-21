import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";
import { buscarEnCatalogo, type FichaCatalogo } from "@/data/tramites";
import { extensionProcedures, findProcedure, planFor } from "@/lib/extension-catalog";

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

  // A trámite the extension has a site map for: show how to do it with the extension.
  const enMapa = findProcedure(input);
  if (enMapa) {
    const plan = planFor(enMapa.site, enMapa.procedure);
    return [
      {
        kind: "reasoning",
        text: `La extensión tiene mapa de ${plan.sitio}: «${plan.tramite}», ${plan.pasos.length} pasos. Preparo qué hace ella y qué haces tú en cada uno.`,
      },
      { kind: "tool", name: "plan_extension", input: { sitio: enMapa.site.id, tramite: enMapa.procedure.id }, output: plan, ms: 900 },
      {
        kind: "text",
        text:
          "Esto **lo puedes hacer con la extensión**, y tiene el mapa de esta web. Arriba tienes qué tener a mano, cómo se entra y qué pasará en cada paso.\n\n" +
          "Cuando estés listo, pulsa **Hacerlo con la extensión**: se abre la web oficial con el asistente al lado y te lleva hasta el trámite." +
          "",
      },
      { kind: "sources", items: [{ url: plan.url, title: `${plan.sitio} · página de inicio del trámite` }] },
    ];
  }

  if (/(extensi|plugin|complemento|panel lateral)/.test(t)) {
    return [
      {
        kind: "reasoning",
        text: "Explico la extensión paso a paso, separando lo que haces tú de lo que hace ella, y listo los trámites que ya conoce.",
      },
      {
        kind: "tool",
        name: "explicar_extension",
        input: {},
        output: {
          tramites: extensionProcedures.map(({ site, procedure }) => ({ titulo: procedure.title, sitio: site.name })),
        },
        ms: 600,
      },
      {
        kind: "text",
        text:
          "En resumen: **aquí descubres qué trámite es; la extensión te lleva dentro de la web oficial.** Allí navega por ti, te explica cada pantalla y te señala dónde actuar, pero nunca escribe por ti ni pulsa enviar, firmar o pagar.\n\n" +
          "Pulsa cualquiera de los trámites de la lista y te preparo el camino.",
      },
    ];
  }

  // Public site: there is no session, so status questions go to Carpeta Ciudadana.
  if (/(estado|cómo va|como va|mis trámites|mis tramites|expediente)/.test(t)) {
    return [
      {
        kind: "text",
        text:
          "Para ver el estado de **tus** expedientes tienes que identificarte en **Carpeta Ciudadana** con Cl@ve, certificado digital o DNIe: ahí aparecen los trámites abiertos con la Administración General del Estado y sus notificaciones.\n\n" +
          "Si me dices qué trámite es, te explico en qué fase suele estar y cuánto tarda.",
      },
      { kind: "sources", items: [{ url: "https://carpetaciudadana.gob.es/", title: "Carpeta Ciudadana" }] },
    ];
  }

  const ficha = buscarEnCatalogo(t);
  if (ficha) return tramiteSteps(ficha);

  return [
    {
      kind: "text",
      text:
        "Puedo ayudarte a **encontrar el trámite** que necesitas y decirte **qué tener a mano**. Luego la extensión te lleva **dentro de la web oficial**, paso a paso.\n\n" +
        "Cuéntame qué quieres hacer, por ejemplo: *«Renovar el DNI»*, *«Necesito el NIE»* o *«¿Cómo hago la renta?»*.",
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
        "Cuando lo tengas, pulsa **Hacerlo con la extensión**: abre la web oficial con el asistente al lado. Aún no tiene el mapa de esta web, así que se guiará leyendo cada página.",
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
