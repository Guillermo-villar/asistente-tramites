import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { estadoLabel, formatFecha, type EstadoTramite, type Paso } from "@/data/tramites";

const estadoStyles: Record<EstadoTramite, string> = {
  accion: "bg-status-action-bg text-status-action",
  curso: "bg-status-progress-bg text-status-progress",
  completado: "bg-status-done-bg text-status-done",
  borrador: "bg-status-draft-bg text-status-draft",
};

const dotStyles: Record<EstadoTramite, string> = {
  accion: "bg-status-action",
  curso: "bg-status-progress",
  completado: "bg-status-done",
  borrador: "bg-status-draft",
};

export function EstadoBadge({ estado, className }: { estado: EstadoTramite; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        estadoStyles[estado],
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", dotStyles[estado])} />
      {estadoLabel[estado]}
    </span>
  );
}

/** Compact horizontal tracker: one segment per step. */
export function PasosBarra({ pasos, className }: { pasos: Paso[]; className?: string }) {
  return (
    <div className={cn("flex gap-1", className)} aria-hidden="true">
      {pasos.map((p, i) => (
        <span
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full",
            p.estado === "hecho" && "bg-foreground/80",
            p.estado === "actual" && "bg-brand-red",
            p.estado === "pendiente" && "bg-border"
          )}
        />
      ))}
    </div>
  );
}

export function pasosResumen(pasos: Paso[]) {
  const hechos = pasos.filter((p) => p.estado === "hecho").length;
  return `${hechos} de ${pasos.length} pasos`;
}

/** Vertical timeline for the detail view. */
export function PasosLista({ pasos }: { pasos: Paso[] }) {
  return (
    <ol className="relative space-y-5">
      {pasos.map((p, i) => (
        <li key={i} className="relative flex gap-3">
          {i < pasos.length - 1 && (
            <span
              className={cn(
                "absolute left-[11px] top-6 h-[calc(100%-4px)] w-px",
                p.estado === "hecho" ? "bg-foreground/30" : "bg-border"
              )}
            />
          )}
          <span
            className={cn(
              "relative z-10 grid size-6 shrink-0 place-items-center rounded-full border text-[11px] font-medium",
              p.estado === "hecho" && "border-foreground bg-foreground text-background",
              p.estado === "actual" && "border-brand-red bg-background text-brand-red ring-4 ring-brand-red/10",
              p.estado === "pendiente" && "border-border bg-background text-muted-foreground"
            )}
          >
            {p.estado === "hecho" ? <CheckIcon className="size-3.5" /> : i + 1}
          </span>
          <div className="pt-0.5">
            <p className={cn("text-sm", p.estado === "pendiente" ? "text-muted-foreground" : "font-medium")}>
              {p.titulo}
            </p>
            {p.fecha && <p className="text-xs text-muted-foreground">{formatFecha(p.fecha)}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
