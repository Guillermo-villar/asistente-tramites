// What the panel asks the page script to do. There is no fill, select, type or submit: the page script
// can read, press a control that only moves around the site, and point at a control for the person.
// `approved` carries the hosts the person approved in this session, on top of the built-in trusted ones.

export type PageRequest =
  | { op: 'outline'; query?: string; ref_prefix?: string; approved?: string[] }
  | { op: 'table'; ref: string; offset?: number; max_rows?: number; approved?: string[] }
  | { op: 'click'; ref: string; approved?: string[] }
  | { op: 'point'; ref: string; instruction: string; approved?: string[] }
  | { op: 'clear' }
  // The "assistant at work" border (frame.ts). `on: false` hides it on any page, like `clear`.
  | { op: 'frame'; on: boolean; label?: string; approved?: string[] }
