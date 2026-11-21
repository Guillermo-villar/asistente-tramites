// Use the website's mark as the source of truth for both interfaces.
import { ESCUDO_PATHS, ESCUDO_RATIO, ESCUDO_VIEWBOX } from '../../web/src/components/brand/escudo-paths'

export function BrandMark({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={Math.round(size * ESCUDO_RATIO)} height={size} viewBox={ESCUDO_VIEWBOX} fill="currentColor" aria-hidden="true">
      {ESCUDO_PATHS.map((d, i) => <path key={i} fillRule="evenodd" d={d} />)}
    </svg>
  )
}

export function BrandLockup() {
  return (
    <span className="brand-lockup">
      <BrandMark size={38} />
      <span className="brand-name">
        <span className="brand-org">Asistente de</span>
        <span className="brand-product">Trámites</span>
      </span>
    </span>
  )
}
