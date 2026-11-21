import { BrandMark } from './Brand'
import { IconCheck } from './Icons'
import { currentLabel, entries } from './activityRows'
import type { ActivityGroup } from './activityRows'

/** The one line that says what the agent is doing now. The text is replaced in place as actions change. */
export function LiveStatus({ label }: { label: string }) {
  return (
    <div className="activity live" role="status">
      <BrandMark size={14} className="activity-mark" />
      {/* keyed so each new label fades in over the old one */}
      <span key={label} className="activity-label">
        {label}
      </span>
    </div>
  )
}

/** A run of actions: live while the agent works, then one closed line that opens to the list. */
export function Activity({ group, live }: { group: ActivityGroup; live: boolean }) {
  const current = currentLabel(group)
  if (live || current) return <LiveStatus label={current ?? 'Thinking'} />
  const done = entries(group)
  return (
    <details className="activity done">
      <summary>
        <IconCheck size={14} />
        <span className="activity-label">{done.length === 1 ? done[0]?.label : `${done.length} steps`}</span>
      </summary>
      <ol>
        {done.map((entry, index) => (
          <li key={index}>
            {entry.label}
            {entry.steps && (
              <ul>
                {entry.steps.map((step, at) => (
                  <li key={at}>{step}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </details>
  )
}
