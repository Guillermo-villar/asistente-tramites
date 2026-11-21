import type { Step } from './dom'

export type PageRequest =
  | { op: 'outline'; query?: string; ref_prefix?: string }
  | { op: 'table'; ref: string; offset?: number; max_rows?: number }
  | { op: 'describe'; steps: Step[] }
  | { op: 'act'; steps: Step[]; shieldRun?: string }
  | { op: 'entity' }

export type ShieldUpdate = { run: string; activity: string | null }
