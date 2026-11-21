import { useState } from "react";
import { ArrowUpRightIcon, ChevronRightIcon, MessageSquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EstadoBadge, PasosBarra, PasosLista, pasosResumen } from "@/components/tramites/estado";
import {
  actividad,
  estadoLabel,
  formatFecha,
  formatFechaHora,
  misTramites,
  type EstadoTramite,
  type Tramite,
} from "@/data/tramites";

type Filtro = "todos" | EstadoTramite;
const filtros: Filtro[] = ["todos", "accion", "curso", "borrador", "completado"];

export function TramitesView({ onOpen }: { onOpen: (t: Tramite) => void }) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const lista = filtro === "todos" ? misTramites : misTramites.filter((t) => t.estado === filtro);
  const count = (f: Filtro) => (f === "todos" ? misTramites.length : misTramites.filter((t) => t.estado === f).length);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8">
      <PageTitle eyebrow="Expedientes" title="Mis trámites" />

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["accion", "curso", "borrador", "completado"] as const).map((e) => (
          <button
            key={e}
            className="rounded-xl border bg-card p-4 text-left transition-colors hover:border-foreground/20 data-[on=true]:border-foreground"
            data-on={filtro === e}
            onClick={() => setFiltro(filtro === e ? "todos" : e)}
            type="button"
          >
            <p className="font-slab text-3xl">{count(e)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{estadoLabel[e]}</p>
          </button>
        ))}
      </div>

      <Tabs className="mt-8" onValueChange={(v) => setFiltro(v as Filtro)} value={filtro}>
        <TabsList className="max-w-full overflow-x-auto">
          {filtros.map((f) => (
            <TabsTrigger key={f} value={f}>
              {f === "todos" ? "Todos" : estadoLabel[f]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ul className="mt-4 divide-y rounded-xl border bg-card">
        {lista.map((t) => (
          <li key={t.id}>
            <button
              className="grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-4 text-left transition-colors hover:bg-muted/40 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto_auto]"
              onClick={() => onOpen(t)}
              type="button"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{t.titulo}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {t.organismo} · {t.referencia}
                </span>
              </span>
              <span className="hidden min-w-0 space-y-1.5 sm:block">
                <PasosBarra pasos={t.pasos} />
                <span className="block text-xs text-muted-foreground">{pasosResumen(t.pasos)}</span>
              </span>
              <EstadoBadge estado={t.estado} />
              <ChevronRightIcon className="hidden size-4 text-muted-foreground sm:block" />
            </button>
          </li>
        ))}
        {lista.length === 0 && <li className="px-4 py-10 text-center text-sm text-muted-foreground">Nada por aquí.</li>}
      </ul>
    </div>
  );
}

export function PageTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="font-slab text-[11px] uppercase tracking-[0.28em] text-brand-red">{eyebrow}</p>
      <h1 className="mt-2 font-slab text-3xl tracking-tight">{title}</h1>
    </div>
  );
}

export function TramiteSheet({
  tramite,
  onClose,
  onAsk,
}: {
  tramite: Tramite | null;
  onClose: () => void;
  onAsk: () => void;
}) {
  const eventos = tramite ? actividad.filter((a) => a.tramiteId === tramite.id) : [];
  return (
    <Sheet onOpenChange={(o) => !o && onClose()} open={tramite !== null}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        {tramite && (
          <>
            <SheetHeader className="border-b p-6">
              <p className="font-slab text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                {tramite.organismo}
              </p>
              <SheetTitle className="font-slab text-2xl font-normal">{tramite.titulo}</SheetTitle>
              <SheetDescription className="sr-only">Detalle del trámite</SheetDescription>
              <div className="flex items-center gap-2 pt-1">
                <EstadoBadge estado={tramite.estado} />
                <span className="text-xs text-muted-foreground">Ref. {tramite.referencia}</span>
              </div>
            </SheetHeader>

            <div className="space-y-8 p-6">
              <div
                className={
                  tramite.estado === "accion"
                    ? "rounded-xl bg-brand-gold p-4"
                    : "rounded-xl border bg-muted/40 p-4"
                }
              >
                <p className="text-xs font-medium uppercase tracking-wide opacity-70">Siguiente paso</p>
                <p className="mt-1 text-sm font-medium">{tramite.siguientePaso}</p>
                {tramite.plazo && <p className="mt-1 text-xs opacity-70">Antes del {formatFecha(tramite.plazo)}</p>}
              </div>

              <div>
                <h3 className="mb-4 text-sm font-semibold">Progreso</h3>
                <PasosLista pasos={tramite.pasos} />
              </div>

              {eventos.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold">Historial</h3>
                  <ul className="space-y-3">
                    {eventos.map((e) => (
                      <li key={e.id} className="text-sm">
                        <p>{e.titulo}</p>
                        <p className="text-xs text-muted-foreground">{formatFechaHora(e.fecha)}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button onClick={onAsk}>
                  <MessageSquareIcon /> Preguntar al asistente
                </Button>
                <Button asChild variant="outline">
                  <a href={tramite.url} rel="noreferrer" target="_blank">
                    Sede electrónica <ArrowUpRightIcon />
                  </a>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
