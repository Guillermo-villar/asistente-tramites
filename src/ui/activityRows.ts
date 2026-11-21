import { AUTO } from '../agent/conversation'
import type { Item } from '../agent/conversation'

// The transcript shows one line for a run of agent actions, not one line per action. This file folds
// the conversation's items into that shape; `Activity.tsx` draws it.

type ToolItem = Extract<Item, { kind: 'tool' }>
type PromptItem = Extract<Item, { kind: 'prompt' }>

export type ActivityGroup = { kind: 'activity'; id: string; items: (ToolItem | PromptItem)[] }
export type Row = Exclude<Item, ToolItem> | ActivityGroup
export type Entry = { label: string; steps?: string[] }

const TOOL_LABELS: Record<string, string> = {
  browser_read_page: 'Reading the page',
  browser_read_table: 'Reading a table on the page',
  browser_act: 'Acting on the page',
  browser_open: 'Opening a page',
  navigate: 'Opening the platform',
  ask_user: 'Asking you',
  stage_for_import: 'Preparing the records for the platform',
  read_staged_records: 'Reading the staged records',
  api_search: 'Looking up how to do it in the platform',
  api_describe: 'Checking a platform operation',
  api_call: 'Calling the platform',
  metrics_read: 'Reading metrics',
  metrics_catalog: 'Looking up metrics',
  population_read: 'Reading a population',
  run_script: 'Working through the data',
  apply_writes: 'Preparing changes in the platform',
  apply_proposed_writes: 'Preparing changes in the platform',
  render_ui: 'Preparing a card',
  memory: 'Checking notes',
  team_memory: 'Checking team notes',
}

export const toolLabel = (name: string): string => TOOL_LABELS[name] ?? name

/** Page actions that ran without asking: they belong to the activity line, not to a card of their own. */
function isAutoAction(item: Item): item is PromptItem {
  return item.kind === 'prompt' && item.prompt.type === 'page_actions' && item.answer === AUTO
}

/** Fold each run of tool calls and unasked page actions into one row. */
export function toRows(items: Item[]): Row[] {
  const rows: Row[] = []
  for (const item of items) {
    if (item.kind !== 'tool' && !isAutoAction(item)) {
      rows.push(item)
      continue
    }
    const last = rows[rows.length - 1]
    if (last?.kind === 'activity') last.items.push(item)
    else rows.push({ kind: 'activity', id: `activity-${item.id}`, items: [item] })
  }
  return rows
}

/** What the group did, one entry per action. A page action replaces the `browser_act` call that carried it. */
export function entries(group: ActivityGroup): Entry[] {
  const out: Entry[] = []
  group.items.forEach((item, index) => {
    if (item.kind === 'prompt') {
      if (item.prompt.type !== 'page_actions') return
      const { reason, steps, host } = item.prompt.request
      out.push({ label: reason || `Acting on ${host}`, steps })
      return
    }
    const next = group.items[index + 1]
    if (item.name === 'browser_act' && next && isAutoAction(next)) return
    out.push({ label: toolLabel(item.name) })
  })
  return out
}

/** The action in progress, or null when every action in the group has finished. */
export function currentLabel(group: ActivityGroup): string | null {
  for (let index = group.items.length - 1; index >= 0; index--) {
    const item = group.items[index]
    if (item?.kind !== 'tool' || item.status !== 'running') continue
    const next = group.items[index + 1]
    if (next?.kind === 'prompt' && next.prompt.type === 'page_actions' && next.prompt.request.reason) return next.prompt.request.reason
    return toolLabel(item.name)
  }
  return null
}
