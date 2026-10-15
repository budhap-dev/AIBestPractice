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
  // Who uses the app day to day.
  endUsers: string
  // Who the live demo or presentation is for.
  demoAudience: string
  // Reading speed used for each slide's "time to read" estimate.
  readingWordsPerMinute: number
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

// "Did you know?" facts, shown on their section's page and as a slide after that section.
export interface FunFact extends Item {
  section: string
}

// One line of the wrap-up, linking back to the section with the detail.
export interface Takeaway extends Item {
  section: string
}

// ---------- Prompt cost ----------
export interface PromptRound {
  you: string
  copilot: string
  // Tokens this round adds: the prompt, anything attached or pasted, and tool output.
  added: number
  // Tokens in Copilot's reply. It joins the history for the next round.
  reply: number
}

export interface PromptScenario {
  id: string
  label: string
  prompt: string
  outcome: string
  rounds: PromptRound[]
}

export type PromptPartKind = 'where' | 'symptom' | 'evidence' | 'limits' | 'done'

export interface PromptPart {
  kind: PromptPartKind
  label: string
  text: string
}

// ---------- Diagrams on the section pages and in the deck ----------
export interface ModeRung {
  mode: string
  does: string
  changes: string
  cost: string
}

export interface FlowQuestion {
  question: string
  yes: Decision['action']
  yesDetail: string
}

export interface MemoryLane {
  label: string
  files: { name: string; on: boolean[] }[]
}

// Plain-English definitions for people new to AI.
export interface GlossaryTerm extends Item {
  // One line, used in tooltips and the term chips under each page intro.
  short: string
  analogy: string
  // Words that mean a page's title or intro uses this term (matched at the start of a word, any case).
  match: string[]
}

export interface RequestFlow {
  // `show` adds the packed context or the token split under a step.
  steps: { title: string; body: string; show?: 'packed' | 'tokens' }[]
  packed: string[]
  tokens: string[]
  tokensNote: string
  loop: string
}
