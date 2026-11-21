import { cn } from "@/lib/utils";
import { ESCUDO_PATHS, ESCUDO_RATIO, ESCUDO_VIEWBOX } from "@/components/brand/escudo-paths";

/**
 * The escudo from Samuel Mòdol and Manu Homie's monoline redesign (see escudo-paths.ts).
 * `size` is the height in px. It fills with `currentColor` (brand red by default), so it
 * also works in black or white. Swap this component to rebrand.
 */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("shrink-0 text-brand-red", className)}
      fill="currentColor"
      height={size}
      viewBox={ESCUDO_VIEWBOX}
      width={Math.round(size * ESCUDO_RATIO)}
    >
      {ESCUDO_PATHS.map((d, i) => (
        <path key={i} d={d} fillRule="evenodd" />
      ))}
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
    <span className={cn("flex items-center gap-3", className)}>
      <LogoMark size={38} />
      <span className="flex flex-col font-slab leading-none uppercase">
        <span className="text-[10px] tracking-[0.32em] text-foreground/80">Asistente de</span>
        <span className="mt-1 text-[15px] font-bold tracking-[0.2em]">Trámites</span>
      </span>
    </span>
  );
}
