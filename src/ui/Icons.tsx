import type { ReactNode } from 'react'

/** Small stroke-based inline-SVG icon set.
 *
 *  Replaces OS emoji glyphs (💾 📁 📂 📄 🔗 ☰ ✕ ☀ ☾ …) so iconography is
 *  drawn, theme-aware (via `currentColor`) and renders identically across
 *  platforms instead of depending on the OS emoji font.
 *
 *  Every icon shares the same stroke conventions via `IconBase` — 24x24
 *  viewBox, no fill, `currentColor` stroke — so callers only ever set
 *  `color` (via CSS) and `size` (via the `size` prop) to restyle them.
 */

type IconProps = { size?: number }

function IconBase({ size = 16, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      width={size}
      height={size}
    >
      {children}
    </svg>
  )
}

export function IconPlus({ size = 16 }: IconProps) {
  return (
    <IconBase size={size}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </IconBase>
  )
}

export function IconComment({ size = 16 }: IconProps) {
  return (
    <IconBase size={size}>
      <path d="M4 5.5h16a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1H10l-4 3.3v-3.3H4a1 1 0 0 1-1-1v-9.5a1 1 0 0 1 1-1z" />
    </IconBase>
  )
}

export function IconSliders({ size = 16 }: IconProps) {
  return (
    <IconBase size={size}>
      <line x1="4" y1="6.5" x2="20" y2="6.5" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17.5" x2="20" y2="17.5" />
      <circle cx="9" cy="6.5" r="1.8" />
      <circle cx="15" cy="12" r="1.8" />
      <circle cx="7" cy="17.5" r="1.8" />
    </IconBase>
  )
}

export function IconGlobe({ size = 16 }: IconProps) {
  return (
    <IconBase size={size}>
      <circle cx="12" cy="12" r="9" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <path d="M12 3a13.5 13.5 0 0 1 0 18" />
      <path d="M12 3a13.5 13.5 0 0 0 0 18" />
    </IconBase>
  )
}

export function IconCheck({ size = 16 }: IconProps) {
  return (
    <IconBase size={size}>
      <path d="M4.5 12.5l5 5 10-11" />
    </IconBase>
  )
}

export function IconClose({ size = 16 }: IconProps) {
  return (
    <IconBase size={size}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </IconBase>
  )
}

/** Drawn to the same stroke rules, for the client switcher. */
export function IconChevronsUpDown({ size = 16 }: IconProps) {
  return (
    <IconBase size={size}>
      <polyline points="7 9 12 4 17 9" />
      <polyline points="7 15 12 20 17 15" />
    </IconBase>
  )
}
