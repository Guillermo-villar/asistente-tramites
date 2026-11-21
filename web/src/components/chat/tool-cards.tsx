import { createContext, useContext, useMemo, useState } from "react";
import { ArrowUpRightIcon, CalendarIcon, CheckIcon, ClockIcon, EuroIcon, MapPinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FichaCatalogo } from "@/data/tramites";
import { useI18n } from "@/i18n/i18n";

/** Lets a card send a follow-up message to the chat (e.g. "búscame cita"). */
export const AskContext = createContext<(text: string) => void>(() => {});

/** A tool result rendered as UI: the "generative" part of the chat. */
export function ToolResultCard({ name, output }: { name: string; output: unknown }) {
  switch (name) {
    case "buscar_tramite":
      return <FichaCard ficha={output as FichaCatalogo} />;
    case "buscar_cita":
      return <CitaCard {...(output as CitaOutput)} />;
    default:
      return null;
  }
}

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

function FichaCard({ ficha }: { ficha: FichaCatalogo }) {
  const ask = useContext(AskContext);
  const c = useI18n().t.cards;
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
            {c.needs(hechos.size, ficha.requisitos.length)}
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

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => ask(c.askCita(ficha.titulo))} size="sm">
            {c.bookCta}
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href={ficha.url} rel="noreferrer" target="_blank">
              {c.official} <ArrowUpRightIcon />
            </a>
          </Button>
        </div>
      </div>
    </Shell>
  );
}

type CitaOutput = {
  tramite: string;
  huecos: { oficina: string; direccion: string; fecha: string; hora: string }[];
};

function CitaCard({ tramite, huecos }: CitaOutput) {
  const ask = useContext(AskContext);
  const { t, locale } = useI18n();
  const c = t.cards;
  const [diaSemana, fechaCorta] = useMemo(
    () => [
      new Intl.DateTimeFormat(locale, { weekday: "short" }),
      new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }),
    ],
    [locale]
  );
  const [elegido, setElegido] = useState<number | null>(null);
  const h = elegido === null ? null : huecos[elegido];

  return (
    <Shell eyebrow={c.citaEyebrow(tramite)}>
      <div className="space-y-2 p-3">
        {huecos.map((x, i) => (
          <button
            key={i}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
              elegido === i ? "border-brand-red bg-brand-red/5" : "hover:bg-muted"
            )}
            onClick={() => setElegido(i)}
            type="button"
          >
            <span className="grid w-12 shrink-0 place-items-center rounded-md border bg-background py-1 text-center leading-tight">
              <span className="text-[10px] uppercase text-muted-foreground">{diaSemana.format(new Date(x.fecha))}</span>
              <span className="text-sm font-semibold">{new Date(x.fecha).getDate()}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{x.oficina}</span>
              <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <MapPinIcon className="size-3" /> {x.direccion}
              </span>
            </span>
            <span className="text-sm tabular-nums">{x.hora}</span>
          </button>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarIcon className="size-3.5" /> {c.confirmNote}
          </p>
          <Button
            disabled={!h}
            onClick={() =>
              h &&
              ask(c.askReserve(tramite, h.oficina, fechaCorta.format(new Date(h.fecha)), h.hora))
            }
            size="sm"
          >
            {c.reserveCta}
          </Button>
        </div>
      </div>
    </Shell>
  );
}
