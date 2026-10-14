// Every piece of guide content shares these fields so search, source links and
// "needs verification" badges work the same way everywhere.
export interface Item {
  id: string
  title: string
  body: string
  tags: string[]
  sourceUrl?: string
  verify?: boolean
}

export interface Meta {
  product: string
  headline: string
  tagline: string
  // Last line of the presenter deck.
  closing: string
  company: string
  owner: string
  lastReviewed: string
  policyUrl: string
  copilotVersionNote: string
}

export interface SectionInfo {
  id: string
  nav: string
  title: string
  intro: string
}

export interface ContextSource extends Item {
  example: string
}

export interface Mode extends Item {
  useWhen: string
  example: string
}

export type CommandGroup = 'slash' | 'participant' | 'context' | 'shortcut' | 'setting'

export interface Command extends Item {
  group: CommandGroup
  code: string
  mac?: string
  win?: string
}

export interface WorkflowStep extends Item {
  prompt?: string
}

export interface Decision extends Item {
  action: 'new-chat' | 'summarise' | 'continue'
  signals: string[]
}

export type RuleGroup = 'Context & cost' | 'Prompting' | 'Reviewing' | 'Security'

export interface Rule extends Item {
  kind: 'do' | 'dont'
  group: RuleGroup
}

export interface MemoryFile extends Item {
  path: string
  when: string
  example: string
}

export interface Template extends Item {
  mode: string
  prompt: string
}

export interface ChecklistItem {
  id: string
  label: string
  phase: 'Start' | 'During' | 'Finish'
}

export interface QuizOption {
  text: string
  correct: boolean
}

export interface QuizQuestion {
  id: string
  scenario: string
  options: QuizOption[]
  why: string
  tags: string[]
}

export type MeterKind = 'instructions' | 'history' | 'files' | 'tools'

export interface MeterAction {
  id: string
  label: string
  detail: string
  kind: MeterKind
  tokens: number
  // Model calls this action makes. Each call re-sends the whole context, so it is billed on all of it.
  calls: number
  drift?: boolean
}

export interface ModelTier {
  id: string
  label: string
  // Illustrative price per token relative to a standard model.
  relativeCost: number
}
