import { useState } from "react";
import { ArrowUpRightIcon, CalendarIcon, CheckIcon, ClockIcon, EuroIcon, MapPinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EstadoBadge, PasosBarra, pasosResumen } from "@/components/tramites/estado";
import { cn } from "@/lib/utils";
import type { FichaCatalogo, Tramite } from "@/data/tramites";

/** A tool result rendered as UI: the "generative" part of the chat. */
export function ToolResultCard({ name, output }: { name: string; output: unknown }) {
  switch (name) {
    case "buscar_tramite":
      return <FichaCard ficha={output as FichaCatalogo} />;
    case "consultar_expedientes":
      return <ExpedientesCard tramites={(output as { tramites: Tramite[] }).tramites} />;
    case "buscar_cita":
      return <CitaCard {...(output as CitaOutput)} />;
    default:
      return null;
  }
}

export const toolLabels: Record<string, { running: string; done: string }> = {
  buscar_tramite: { running: "Buscando en el catálogo de trámites…", done: "Catálogo de trámites" },
  consultar_expedientes: { running: "Consultando tus expedientes…", done: "Tus expedientes" },
  buscar_cita: { running: "Buscando huecos de cita previa…", done: "Cita previa" },
};

function Shell({ eyebrow, children, className }: { eyebrow: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full overflow-hidden rounded-xl border bg-card", className)}>
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <span className="font-slab text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{eyebrow}</span>
      </div>
      {children}
    </div>
  );
}

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

        <div className="flex flex-wrap gap-2">
          <Button size="sm">Empezar con el asistente</Button>
          <Button asChild size="sm" variant="outline">
            <a href={ficha.url} rel="noreferrer" target="_blank">
              Ficha oficial <ArrowUpRightIcon />
            </a>
          </Button>
        </div>
      </div>
    </Shell>
  );
}

function ExpedientesCard({ tramites }: { tramites: Tramite[] }) {
  return (
    <Shell eyebrow="Tus expedientes abiertos">
      <ul className="divide-y">
        {tramites.map((t) => (
          <li key={t.id} className="space-y-2 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{t.titulo}</p>
                <p className="truncate text-xs text-muted-foreground">{t.organismo}</p>
              </div>
              <EstadoBadge estado={t.estado} />
            </div>
            <PasosBarra pasos={t.pasos} />
            <p className="text-xs text-muted-foreground">
              {pasosResumen(t.pasos)} · {t.siguientePaso}
            </p>
          </li>
        ))}
      </ul>
    </Shell>
  );
}

type CitaOutput = {
  tramite: string;
  huecos: { oficina: string; direccion: string; fecha: string; hora: string }[];
};

const fechaLarga = new Intl.DateTimeFormat("es-ES", { weekday: "short", day: "numeric", month: "short" });

function CitaCard({ tramite, huecos }: CitaOutput) {
  const [elegido, setElegido] = useState<number | null>(null);
  return (
    <Shell eyebrow={`Cita previa · ${tramite}`}>
      <div className="space-y-2 p-3">
        {huecos.map((h, i) => (
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
              <span className="text-[10px] uppercase text-muted-foreground">
                {fechaLarga.format(new Date(h.fecha)).split(" ")[0]}
              </span>
              <span className="text-sm font-semibold">{new Date(h.fecha).getDate()}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{h.oficina}</span>
              <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <MapPinIcon className="size-3" /> {h.direccion}
              </span>
            </span>
            <span className="text-sm tabular-nums">{h.hora}</span>
          </button>
        ))}
        <div className="flex items-center justify-between gap-2 pt-1">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarIcon className="size-3.5" /> La confirmación final la haces tú en la sede.
          </p>
          <Button disabled={elegido === null} size="sm">
            Reservar este hueco
          </Button>
        </div>
      </div>
    </Shell>
  );
}
