import { CheckIcon, PuzzleIcon, XIcon } from "lucide-react";
import { Logo, LogoMark, Waves } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-6 px-4 sm:px-6">
        <a href="#top">
          <Logo />
        </a>
        <a
          className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors hover:border-foreground/30"
          href="#extension"
        >
          <PuzzleIcon className="size-4 text-brand-red" /> La extensión
        </a>
      </div>
    </header>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("font-slab text-[11px] uppercase tracking-[0.3em] text-brand-red", className)}>{children}</p>
  );
}

export function HeroCopy() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="font-slab text-4xl leading-[1.1] tracking-tight sm:text-5xl">¿Qué trámite tienes que hacer?</h1>
      <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground">
        Pregúntalo con tus palabras. Te decimos qué es, qué necesitas y dónde hacerlo.
      </p>
    </div>
  );
}

const pasos = [
  {
    titulo: "Ábrela junto a la sede",
    texto: "Un panel lateral en tu navegador, al lado de la web oficial: Agencia Tributaria, Seguridad Social, DGT…",
  },
  {
    titulo: "Dile qué quieres hacer",
    texto: "«Quiero ver mi borrador de la renta». No hace falta saber cómo se llama el trámite.",
  },
  {
    titulo: "Te lleva a la página correcta",
    texto: "Navega por ti: sigue enlaces, abre menús y pestañas hasta llegar al formulario.",
  },
  {
    titulo: "Te señala dónde escribir",
    texto: "Marca cada casilla con un recuadro y te dice qué poner. Tú escribes, firmas y presentas.",
  },
];

export function ExtensionSection() {
  return (
    <section className="scroll-mt-16 border-t" id="extension">
      <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <Eyebrow>La extensión</Eyebrow>
          <h2 className="mt-3 font-slab text-3xl tracking-tight sm:text-4xl">Te acompaña dentro de la web oficial.</h2>
          <p className="mt-4 text-muted-foreground">
            El chat te orienta. La extensión va un paso más allá: te guía por la propia sede electrónica, pantalla a
            pantalla, sin hacer nada en tu nombre.
          </p>
        </div>

        <BrowserMock className="mt-12" />

        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {pasos.map((p, i) => (
            <li key={p.titulo} className="border-t-2 border-foreground pt-4">
              <span className="font-slab text-sm font-bold text-brand-red">0{i + 1}</span>
              <h3 className="mt-1.5 font-semibold">{p.titulo}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.texto}</p>
            </li>
          ))}
        </ol>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          <Rule
            items={["Seguir enlaces y abrir menús o pestañas", "Llevarte a la página exacta del trámite", "Señalarte cada campo y explicarte qué poner"]}
            ok
            title="Lo que hace por ti"
          />
          <Rule
            items={["Escribir tus datos o elegir opciones", "Firmar, pagar, guardar o presentar", "Salir de las webs oficiales que conoce"]}
            ok={false}
            title="Lo que nunca hace"
          />
        </div>

        <p className="mt-10 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm">
          <span className="size-1.5 rounded-full bg-brand-red" /> Próximamente para Chrome y Safari
        </p>
      </div>
    </section>
  );
}

function Rule({ title, items, ok }: { title: string; items: string[]; ok: boolean }) {
  return (
    <div className={cn("rounded-2xl p-6", ok ? "border" : "bg-muted")}>
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-sm">
        {items.map((t) => (
          <li key={t} className="flex items-start gap-2.5">
            <span
              className={cn(
                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                ok ? "bg-brand-red/10 text-brand-red" : "bg-foreground/10 text-foreground/60"
              )}
            >
              {ok ? <CheckIcon className="size-3" strokeWidth={3} /> : <XIcon className="size-3" strokeWidth={3} />}
            </span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** An illustration of the extension at work: an official page with a highlighted field, and the side panel. */
function BrowserMock({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-[0_24px_60px_-28px_rgb(0_0_0/0.25)]",
        className
      )}
    >
      <div className="flex items-center gap-3 border-b bg-muted/60 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-foreground/15" />
          <span className="size-2.5 rounded-full bg-foreground/15" />
          <span className="size-2.5 rounded-full bg-foreground/15" />
        </span>
        <span className="truncate rounded-md bg-background px-3 py-1 font-mono text-[11px] text-muted-foreground">
          sede.agenciatributaria.gob.es/Sede/Renta.html
        </span>
      </div>

      <div className="grid md:grid-cols-[1fr_280px]">
        {/* The official site */}
        <div className="relative space-y-5 p-6 sm:p-8">
          <div className="space-y-2">
            <div className="h-2.5 w-24 rounded bg-foreground/10" />
            <div className="h-4 w-56 rounded bg-foreground/20" />
          </div>
          <div className="space-y-2">
            <div className="h-2 w-full rounded bg-foreground/[0.07]" />
            <div className="h-2 w-4/5 rounded bg-foreground/[0.07]" />
          </div>
          <div className="max-w-xs space-y-4 pt-2">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-foreground/60">DNI / NIE</p>
              <div className="relative">
                <div className="h-9 rounded-md border bg-background" />
                <div className="pointer-events-none absolute -inset-1.5 animate-pulse rounded-lg border-[3px] border-brand-gold" />
              </div>
              <div className="relative mt-3 max-w-[250px] rounded-lg bg-brand-ink px-3 py-2.5 text-[13px] leading-snug text-white shadow-lg">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-brand-gold">Escribe tú</span>
                Tu número de DNI, con la letra.
              </div>
            </div>
            <div className="space-y-1.5 opacity-60">
              <p className="text-xs font-medium text-foreground/60">Fecha de validez</p>
              <div className="h-9 rounded-md border bg-background" />
            </div>
            <div className="h-9 w-28 rounded-md bg-foreground/15" />
          </div>
        </div>

        {/* The side panel */}
        <div className="flex flex-col border-t bg-sidebar md:border-l md:border-t-0">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <LogoMark size={20} />
            <span className="text-sm font-semibold">Asistente</span>
          </div>
          <div className="flex-1 space-y-3 p-4 text-[13px] leading-snug">
            <p className="ml-auto w-fit max-w-[85%] rounded-lg bg-secondary px-3 py-2">Quiero ver mi borrador de la renta</p>
            <p className="max-w-[92%]">
              Te he llevado a <b>Renta WEB</b>. Para entrar, escribe tu DNI en el recuadro amarillo.
            </p>
            <p className="max-w-[92%] text-muted-foreground">Cuando lo tengas, pulsa tú «Continuar».</p>
          </div>
          <div className="m-3 rounded-lg border bg-background px-3 py-2 text-xs text-muted-foreground">Escribe aquí…</div>
        </div>
      </div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-brand-red text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-14 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-5">
          <LogoMark className="text-brand-gold" size={72} />
          <div className="font-slab uppercase leading-none">
            <p className="text-[11px] tracking-[0.32em] text-white/80">Asistente de</p>
            <p className="mt-1.5 text-2xl font-bold tracking-[0.2em]">Trámites</p>
            <Waves className="mt-3 text-brand-gold" />
          </div>
        </div>
        <p className="max-w-sm text-xs leading-relaxed text-white/80">
          Servicio no oficial, no afiliado al Gobierno de España. La información es orientativa: consulta siempre la
          sede electrónica antes de presentar. Escudo según el rediseño de Samuel Mòdol y Manu Homie.
        </p>
      </div>
    </footer>
  );
}
