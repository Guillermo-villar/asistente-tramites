// What the panel asks the page script to do. There is no fill, select, type or submit: the page script
// can read, press a control that only moves around the site, and point at a control for the person.

export type PageRequest =
  | { op: 'outline'; query?: string; ref_prefix?: string }
  | { op: 'table'; ref: string; offset?: number; max_rows?: number }
  | { op: 'click'; ref: string; userOnly?: string[] }
  | { op: 'point'; ref: string; instruction: string }
  | { op: 'clear' }
