import { createContext, useContext, useState } from "react";
import {
  ArrowUpRightIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  EuroIcon,
  GlobeIcon,
  KeyRoundIcon,
  PuzzleIcon,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { FichaCatalogo } from "@/data/tramites";
import type { ExtensionPlan } from "@/lib/extension-catalog";
import { startInExtension, useExtensionInstalled, type StartResult } from "@/lib/extension-bridge";

/** Lets a card send a follow-up message to the chat. */
export const AskContext = createContext<(text: string) => void>(() => {});

/** A tool result rendered as UI: the "generative" part of the chat. */
export function ToolResultCard({ name, output }: { name: string; output: unknown }) {
  switch (name) {
    case "buscar_tramite":
      return <FichaCard ficha={output as FichaCatalogo} />;
    case "explicar_extension":
      return <ExtensionGuideCard {...(output as GuideOutput)} />;
    case "plan_extension":
      return <PlanCard plan={output as ExtensionPlan} />;
    default:
      return null;
  }
}

export const toolLabels: Record<string, { running: string; done: string }> = {
  buscar_tramite: { running: "Buscando en el catálogo de trámites…", done: "Catálogo de trámites" },
  explicar_extension: { running: "Preparando la guía de la extensión…", done: "Guía de la extensión" },
  plan_extension: { running: "Leyendo el mapa del trámite…", done: "Mapa del trámite en la extensión" },
};

function Shell({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="w-full overflow-hidden rounded-xl border bg-card">
      <div className="border-b px-4 py-2.5">
        <span className="font-slab text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{eyebrow}</span>
      </div>
      {children}
    </div>
  );
}

/* ---------- Hand-off: from this website to the extension ---------- */

const host = (url: string) => new URL(url).hostname.replace(/^www\./, "");

/**
 * The bridge to the extension: opens the official site in a new tab with the assistant's panel,
 * already knowing what the person wants to do. Without the extension, it says how to get it.
 */
function HandoffBox({ text, url, mapped }: { text: string; url: string; mapped: boolean }) {
  const installed = useExtensionInstalled();
  const [state, setState] = useState<"idle" | "opening" | StartResult>("idle");
  const [copiado, setCopiado] = useState(false);

  const start = () => {
    setState("opening");
    void startInExtension(text, url).then(setState);
  };
  const copiar = () =>
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 1600);
      },
      () => {}
    );

  return (
    <div className="rounded-xl bg-brand-red/[0.04] p-4 ring-1 ring-brand-red/15">
      <p className="text-sm font-semibold">Sigue en la web oficial, con la extensión</p>
      <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
        Se abre <b className="font-medium text-foreground">{host(url)}</b> en una pestaña nueva con el asistente al
        lado. Ya sabe qué quieres hacer y te lleva hasta ello{mapped ? "" : ", leyendo la página"}.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {installed ? (
          <Button
            className="bg-brand-red text-white hover:bg-brand-red/90"
            disabled={state === "opening"}
            onClick={start}
            size="sm"
          >
            {state === "opening" ? <Spinner /> : <PuzzleIcon />} Hacerlo con la extensión
          </Button>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed px-2.5 py-1.5 text-xs text-muted-foreground">
            <PuzzleIcon className="size-3.5" /> Instala la extensión para continuar · Próximamente
          </span>
        )}
        <Button asChild size="sm" variant="ghost">
          <a href={url} rel="noreferrer" target="_blank">
            Solo abrir la web <ArrowUpRightIcon />
          </a>
        </Button>
      </div>

      {typeof state === "object" && (
        <p className={cn("mt-3 text-[13px] leading-snug", state.ok ? "text-status-done" : "text-destructive")}>
          {state.ok
            ? state.panel
              ? `Listo: se ha abierto ${host(url)} con el asistente. Sigue allí.`
              : `Se ha abierto ${host(url)}. Pulsa el icono del Asistente de trámites en la barra del navegador (lleva un 1) y empieza solo.`
            : state.reason === "url"
              ? "La extensión no puede abrir esta web: no es una web oficial que conozca."
              : "La extensión no ha respondido. Recarga esta página y vuelve a intentarlo."}
        </p>
      )}

      {installed && (
        <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          ¿Ya tienes la web abierta? Abre el panel y escríbele
          <button
            className="inline-flex items-center gap-1 rounded bg-brand-ink px-1.5 py-0.5 text-[11px] text-white"
            onClick={copiar}
            type="button"
          >
            «{text}» <CopyIcon className="size-3" />
          </button>
          {copiado && <span className="text-status-done">Copiado</span>}
        </p>
      )}
    </div>
  );
}

/* ---------- Cards ---------- */

function FichaCard({ ficha }: { ficha: FichaCatalogo }) {
  const [hechos, setHechos] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setHechos((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <Shell eyebrow={ficha.organismo}>
      <div className="space-y-4 p-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight">{ficha.titulo}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{ficha.resumen}</p>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Qué necesitas · {hechos.size}/{ficha.requisitos.length}
          </p>
          <ul className="space-y-1">
            {ficha.requisitos.map((r, i) => (
              <li key={r}>
                <button
                  className="flex w-full items-start gap-2.5 rounded-md px-1.5 py-1 text-left text-sm hover:bg-muted"
                  onClick={() => toggle(i)}
                  type="button"
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-4 shrink-0 place-items-center rounded border",
                      hechos.has(i) ? "border-brand-red bg-brand-red text-white" : "border-input"
                    )}
                  >
                    {hechos.has(i) && <CheckIcon className="size-3" strokeWidth={3} />}
                  </span>
                  <span className={cn(hechos.has(i) && "text-muted-foreground line-through")}>{r}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ClockIcon className="size-3.5" /> {ficha.duracion}
          </span>
          <span className="flex items-center gap-1.5">
            <EuroIcon className="size-3.5" /> {ficha.coste}
          </span>
        </div>

        <HandoffBox mapped={false} text={ficha.titulo} url={ficha.url} />
      </div>
    </Shell>
  );
}

type Who = "tu" | "extension" | "web";

const laneStyle: Record<Who, { label: string; className: string; icon: typeof UserIcon }> = {
  tu: { label: "Tú", className: "bg-brand-gold text-brand-ink", icon: UserIcon },
  extension: { label: "Extensión", className: "bg-brand-red/10 text-brand-red", icon: PuzzleIcon },
  web: { label: "Esta web", className: "bg-foreground/[0.07] text-foreground/70", icon: GlobeIcon },
};

function Lane({ who, children }: { who: Who; children: React.ReactNode }) {
  const l = laneStyle[who];
  return (
    <div className="flex items-start gap-2 text-[13px] leading-snug">
      <span className="w-[84px] shrink-0">
        <span
          className={cn(
            "mt-px inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            l.className
          )}
        >
          <l.icon className="size-3" />
          {l.label}
        </span>
      </span>
      <span>{children}</span>
    </div>
  );
}

/** The whole journey: discovery here, hand-off to the extension, guidance inside the official site. */
const viaje: { titulo: string; lanes: [Who, string][] }[] = [
  {
    titulo: "Aquí descubres qué trámite es",
    lanes: [
      ["tu", "Cuentas qué necesitas, con tus palabras."],
      ["web", "Te dice qué trámite es, quién lo gestiona, qué tener a mano y cómo se entra."],
    ],
  },
  {
    titulo: "Pulsas «Hacerlo con la extensión»",
    lanes: [
      ["tu", "Un clic."],
      ["extension", "Abre la web oficial en una pestaña nueva, con su panel al lado, y ya sabe qué quieres hacer."],
    ],
  },
  {
    titulo: "Te lleva hasta el trámite",
    lanes: [
      ["tu", "Nada: miras cómo avanza."],
      ["extension", "Sigue enlaces y abre menús y pestañas hasta el formulario. Solo en webs oficiales."],
    ],
  },
  {
    titulo: "Rellenas el formulario",
    lanes: [
      ["tu", "Escribes tus datos y eliges las opciones."],
      ["extension", "Rodea cada campo con un recuadro amarillo y te dice qué poner. No escribe nada por ti."],
    ],
  },
  {
    titulo: "Terminas tú",
    lanes: [
      ["tu", "Revisas, firmas, pagas o presentas, y guardas el justificante."],
      ["extension", "Te señala el botón final y te recuerda revisar. Nunca lo pulsa."],
    ],
  },
];

type GuideOutput = { tramites: { titulo: string; sitio: string }[] };

function ExtensionGuideCard({ tramites }: GuideOutput) {
  const ask = useContext(AskContext);
  const installed = useExtensionInstalled();
  return (
    <Shell eyebrow="De esta web a la web oficial">
      <ol className="divide-y">
        {viaje.map((g, i) => (
          <li key={g.titulo} className="space-y-2 px-4 py-3">
            <p className="text-sm font-semibold">
              <span className="mr-2 font-slab text-brand-red">{i + 1}</span>
              {g.titulo}
            </p>
            {g.lanes.map(([who, text]) => (
              <Lane key={who} who={who}>
                {text}
              </Lane>
            ))}
          </li>
        ))}
      </ol>
      <div className="border-t bg-muted/40 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          {installed ? (
            <span className="font-medium text-status-done">✓ Tienes la extensión instalada en este navegador.</span>
          ) : (
            "Necesitas la extensión instalada (próximamente para Chrome y Safari)."
          )}
        </p>
        <p className="mt-3 text-xs font-medium text-muted-foreground">Ya sabe guiarte en estos trámites</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tramites.map((t) => (
            <button
              key={t.titulo}
              className="rounded-full border bg-background px-2.5 py-1 text-left text-xs transition-colors hover:border-brand-red/40 hover:text-brand-red"
              onClick={() => ask(`¿Cómo hago «${t.titulo}» con la extensión?`)}
              type="button"
            >
              {t.titulo}
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function PlanCard({ plan }: { plan: ExtensionPlan }) {
  return (
    <Shell eyebrow={`${plan.sitio} · la extensión tiene su mapa`}>
      <div className="space-y-4 p-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight">{plan.tramite}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{plan.resumen}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <KeyRoundIcon className="size-3.5" /> Cómo se entra
            </p>
            <p className="mt-1 text-sm first-letter:uppercase">{plan.acceso.join(" o ")}</p>
          </div>
          {plan.necesitas.length > 0 && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground">Ten a mano</p>
              <ul className="mt-1 space-y-1 text-[13px] leading-snug">
                {plan.necesitas.map((n) => (
                  <li key={n}>· {n}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Qué pasará en la web oficial</p>
          <ol className="space-y-3">
            {plan.pasos.map((p, i) => (
              <li key={p.titulo} className="space-y-1.5">
                <p className="text-sm font-semibold">
                  <span className="mr-2 font-slab text-brand-red">{i + 1}</span>
                  {p.titulo}
                </p>
                <Lane who="extension">{p.extension}</Lane>
                {p.tu && <Lane who="tu">{p.tu}</Lane>}
              </li>
            ))}
          </ol>
        </div>

        <HandoffBox mapped text={plan.frase} url={plan.url} />
        {plan.borrador && (
          <p className="text-[11px] text-muted-foreground">
            Mapa en revisión: si la web ha cambiado, la extensión se guía por lo que vea en pantalla.
          </p>
        )}
      </div>
    </Shell>
  );
}
