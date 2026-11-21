export type Settings = {
  envId: string
  clientUuid: string | null
  model: 'sonnet-5-5' | 'opus-5-5'
  effort: 'low' | 'medium' | 'high' | 'xhigh' | 'max'
  theme: 'system' | 'light' | 'dark'
  /** `free`: the agent clicks and fills without asking. `ask`: one approval card per set of steps. */
  pageActions: 'free' | 'ask'
  /** The member's own standing instructions, sent with every message. */
  instructions: string
}

export const DEFAULTS: Settings = { envId: 'staging', clientUuid: null, model: 'sonnet-5-5', effort: 'high', theme: 'system', pageActions: 'free', instructions: '' }
export const MODELS: { id: Settings['model']; label: string }[] = [
  { id: 'sonnet-5-5', label: 'Sonnet 5.5' },
  { id: 'opus-5-5', label: 'Opus 5.5' },
]
export const EFFORTS: Settings['effort'][] = ['low', 'medium', 'high', 'xhigh', 'max']

export const THEMES: Settings['theme'][] = ['system', 'light', 'dark']

const KEY = 'settings'

export async function loadSettings(): Promise<Settings> {
  const stored = (await chrome.storage.local.get(KEY))[KEY] as Partial<Settings> | undefined
  return { ...DEFAULTS, ...stored }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ [KEY]: settings })
}
