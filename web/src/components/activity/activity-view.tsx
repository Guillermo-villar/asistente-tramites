import { Building2Icon, UserIcon } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { PageTitle } from "@/components/tramites/tramites-view";
import { actividad, misTramites, type Actividad, type Tramite } from "@/data/tramites";
import { cn } from "@/lib/utils";

const actorLabel: Record<Actividad["actor"], string> = {
  asistente: "Asistente",
  tu: "Tú",
  organismo: "Administración",
};

const dia = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" });
const hora = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" });

export function ActivityView({ onOpen }: { onOpen: (t: Tramite) => void }) {
  const grupos = new Map<string, Actividad[]>();
  for (const a of actividad) {
    const k = a.fecha.slice(0, 10);
    grupos.set(k, [...(grupos.get(k) ?? []), a]);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8">
      <PageTitle eyebrow="Historial" title="Actividad" />
      <p className="mt-2 text-sm text-muted-foreground">
        Todo lo que el asistente ha hecho por ti, lo que hiciste tú y lo que respondió la Administración.
      </p>

      <div className="mt-8 space-y-8">
        {[...grupos.entries()].map(([fecha, items]) => (
          <section key={fecha}>
            <h2 className="mb-3 text-xs font-medium text-muted-foreground first-letter:uppercase">
              {dia.format(new Date(fecha))}
            </h2>
            <ol className="space-y-1">
              {items.map((a) => {
                const t = misTramites.find((x) => x.id === a.tramiteId);
                return (
                  <li key={a.id}>
                    <button
                      className="flex w-full gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-muted/50"
                      disabled={!t}
                      onClick={() => t && onOpen(t)}
                      type="button"
                    >
                      <ActorIcon actor={a.actor} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="text-sm font-medium">{a.titulo}</span>
                          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                            {hora.format(new Date(a.fecha))}
                          </span>
                        </span>
                        {a.detalle && <span className="mt-0.5 block text-sm text-muted-foreground">{a.detalle}</span>}
                        <span className="mt-1.5 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                          <span>{actorLabel[a.actor]}</span>
                          {t && <span>· {t.titulo}</span>}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

function ActorIcon({ actor }: { actor: Actividad["actor"] }) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full border",
        actor === "asistente" && "border-brand-red/25 bg-brand-red/5",
        actor === "organismo" && "bg-muted"
      )}
    >
      {actor === "asistente" && <LogoMark size={16} />}
      {actor === "tu" && <UserIcon className="size-4 text-muted-foreground" />}
      {actor === "organismo" && <Building2Icon className="size-4 text-muted-foreground" />}
    </span>
  );
}
