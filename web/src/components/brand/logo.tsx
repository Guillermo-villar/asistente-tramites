import { cn } from "@/lib/utils";

/**
 * Original mark in a monoline, Correos-style vocabulary (after Samuel Mòdol and
 * Manu Homie's 2019 escudo redesign study): a shield outline that "talks" (three typing
 * dots) with a dot under the tip. It is NOT the escudo and NOT the «Gobierno de España»
 * lockup: this is an unofficial service and must not look like the Government's own.
 * Swap this component to rebrand; everything else uses <LogoMark /> / <Logo />.
 */
export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("shrink-0 text-brand-red", className)}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3.8}
      viewBox="0 0 48 48"
      width={size}
    >
      <path d="M9 6H39V22C39 31 32.5 36.5 24 40C15.5 36.5 9 31 9 22Z" />
      <g fill="currentColor" stroke="none">
        <circle cx="16.5" cy="20" r="2.7" />
        <circle cx="24" cy="20" r="2.7" />
        <circle cx="31.5" cy="20" r="2.7" />
        <circle cx="24" cy="45.2" r="2.1" />
      </g>
    </svg>
  );
}

/** The ≈ waves: the brand's recurring glyph (dividers, footers). */
export function Waves({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("text-brand-red", className)}
      fill="none"
      height="10"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={2.4}
      viewBox="0 0 22 10"
      width="22"
    >
      <path d="M2 3.5c3-2.4 6-2.4 9 0s6 2.4 9 0M2 8.5c3-2.4 6-2.4 9 0s6 2.4 9 0" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="flex flex-col font-slab leading-none uppercase">
        <span className="text-[10px] tracking-[0.32em] text-foreground/80">Asistente de</span>
        <span className="mt-1 text-[15px] font-bold tracking-[0.2em]">Trámites</span>
      </span>
    </span>
  );
}
