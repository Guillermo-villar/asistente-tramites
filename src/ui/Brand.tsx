import { MARK_BUBBLE, MARK_SPARK } from '../mark'

// The mark fills with `currentColor`, so `--brand-mark` can tint it per theme.
export function BrandMark({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={(size * 82) / 84} viewBox="0 0 84 82" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d={MARK_BUBBLE} />
      <path className="mark-spark" d={MARK_SPARK} />
    </svg>
  )
}

export function BrandLockup() {
  return (
    <span className="brand-lockup">
      <BrandMark />
      <span className="brand-name">
        <span className="brand-org">HR</span>
        <span className="brand-product">Coworker</span>
      </span>
    </span>
  )
}
