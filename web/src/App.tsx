import { useState } from "react";
import { ActivityIcon, FolderIcon, MessageSquareIcon } from "lucide-react";
import { ActivityView } from "@/components/activity/activity-view";
import { Logo } from "@/components/brand/logo";
import { Chat } from "@/components/chat/chat";
import { RightRail } from "@/components/rail/right-rail";
import { TramiteSheet, TramitesView } from "@/components/tramites/tramites-view";
import type { Tramite } from "@/data/tramites";
import { cn } from "@/lib/utils";

type Vista = "asistente" | "tramites" | "actividad";

const nav: { id: Vista; label: string; icon: typeof MessageSquareIcon }[] = [
  { id: "asistente", label: "Asistente", icon: MessageSquareIcon },
  { id: "tramites", label: "Mis trámites", icon: FolderIcon },
  { id: "actividad", label: "Actividad", icon: ActivityIcon },
];

export default function App() {
  const [vista, setVista] = useState<Vista>("asistente");
  const [abierto, setAbierto] = useState<Tramite | null>(null);

  return (
    <div className="flex h-dvh flex-col bg-background md:flex-row">
      <aside className="flex shrink-0 items-center justify-between border-b px-4 py-3 md:w-60 md:flex-col md:items-stretch md:justify-start md:border-b-0 md:border-r md:px-3 md:py-5">
        <div className="md:px-2 md:pb-6">
          <Logo />
        </div>
        <nav className="flex gap-1 md:flex-col">
          {nav.map((n) => (
            <button
              key={n.id}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                vista === n.id ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/60"
              )}
              onClick={() => setVista(n.id)}
              type="button"
            >
              <n.icon className={cn("size-4", vista === n.id && "text-brand-red")} />
              <span className="hidden sm:inline">{n.label}</span>
            </button>
          ))}
        </nav>
        <p className="mt-auto hidden px-2 text-[11px] leading-relaxed text-muted-foreground md:block">
          Servicio no oficial. No afiliado al Gobierno de España.
        </p>
      </aside>

      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        {vista === "asistente" && <Chat />}
        {vista === "tramites" && <TramitesView onOpen={setAbierto} />}
        {vista === "actividad" && <ActivityView onOpen={setAbierto} />}
      </main>

      {vista === "asistente" && <RightRail onOpen={setAbierto} />}

      <TramiteSheet
        onAsk={() => {
          setAbierto(null);
          setVista("asistente");
        }}
        onClose={() => setAbierto(null)}
        tramite={abierto}
      />
    </div>
  );
}
