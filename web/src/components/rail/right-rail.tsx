import { ArrowUpRightIcon, ChevronRightIcon } from "lucide-react";
import { Skeleton } from "@/components/rail/skeleton";
import { EstadoBadge, PasosBarra } from "@/components/tramites/estado";
import { diasHasta, formatFecha, misTramites, type Tramite } from "@/data/tramites";
import { useBoe } from "@/lib/boe";
import { cn } from "@/lib/utils";

export function RightRail({ onOpen }: { onOpen: (t: Tramite) => void }) {
  const activos = misTramites.filter((t) => t.estado !== "completado");
  const plazos = misTramites.filter((t) => t.plazo).sort((a, b) => a.plazo!.localeCompare(b.plazo!));

  return (
    <aside className="hidden w-80 shrink-0 flex-col gap-8 overflow-y-auto border-l bg-sidebar px-5 py-6 xl:flex">
      <section>
        <Heading>En curso</Heading>
        <ul className="space-y-2">
          {activos.map((t) => (
            <li key={t.id}>
              <button
                className="w-full space-y-2.5 rounded-xl border bg-card p-3 text-left transition-colors hover:border-foreground/20"
                onClick={() => onOpen(t)}
                type="button"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium leading-snug">{t.titulo}</span>
                  <ChevronRightIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                </div>
                <PasosBarra pasos={t.pasos} />
                <EstadoBadge estado={t.estado} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {plazos.length > 0 && (
        <section>
          <Heading>Próximos plazos</Heading>
          <ul className="space-y-2">
            {plazos.map((t) => {
              const d = diasHasta(t.plazo!);
              return (
                <li key={t.id} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid w-11 shrink-0 place-items-center rounded-lg border py-1 leading-tight",
                      d <= 7 && "border-brand-red/30 bg-brand-red/5 text-brand-red"
                    )}
                  >
                    <span className="text-[10px] uppercase">{formatFecha(t.plazo!).split(" ")[1]}</span>
                    <span className="text-sm font-semibold">{new Date(t.plazo!).getDate()}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{t.titulo}</span>
                    <span className="text-xs text-muted-foreground">
                      {d === 0 ? "Hoy" : d === 1 ? "Mañana" : d > 0 ? `En ${d} días` : `Hace ${-d} días`}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <BoeFeed />
    </aside>
  );
}

function Heading({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 className="font-slab text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{children}</h2>
      {aside}
    </div>
  );
}

const fechaBoe = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" });

function BoeFeed() {
  const { data, loading, error } = useBoe();
  return (
    <section>
      <Heading
        aside={
          <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-status-done" /> En directo
          </span>
        }
      >
        BOE
      </Heading>
      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      )}
      {error && <p className="text-sm text-muted-foreground">No se pudo cargar el BOE ahora mismo.</p>}
      {data && (
        <>
          <p className="mb-3 text-xs text-muted-foreground first-letter:uppercase">
            {fechaBoe.format(new Date(data.fecha))} · nº {data.numero} · {data.total} disposiciones
          </p>
          <ul className="space-y-3">
            {data.items.slice(0, 4).map((it) => (
              <li key={it.id}>
                <a className="group block" href={it.url} rel="noreferrer" target="_blank">
                  <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {it.departamento.toLowerCase()}
                  </span>
                  <span className="mt-0.5 line-clamp-3 text-[13px] leading-snug group-hover:underline">
                    {it.titulo}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <a
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium hover:underline"
            href="https://www.boe.es/"
            rel="noreferrer"
            target="_blank"
          >
            Ver el BOE completo <ArrowUpRightIcon className="size-3" />
          </a>
        </>
      )}
    </section>
  );
}
