// What the panel shows: the person's messages, the assistant's replies, what it did, its questions,
// and notices. The model's own history (with tool calls and thinking) is kept separately in App.

export type Item =
  | { kind: 'user'; id: string; text: string }
  | { kind: 'assistant'; id: string; text: string }
  | { kind: 'tool'; id: string; name: string; label: string; status: 'running' | 'done' | 'error' }
  | { kind: 'ask'; id: string; question: string; options: string[]; answer?: string }
  | { kind: 'notice'; id: string; text: string; tone: 'error' | 'info' }
  /** The assistant wants to open a site that is neither mapped nor a public-administration domain. */
  | { kind: 'site'; id: string; url: string; host: string; reason: string; answer?: 'approved' | 'declined' | 'denied' }
  /** Pages found with web search during a turn. */
  | { kind: 'sources'; id: string; sources: { title: string; url: string }[] }

let counter = 0
export const newId = (prefix: string): string => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`
