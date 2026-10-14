// Single entry point for all guide content. Edit the JSON files, not this one.
import metaJson from './meta.json'
import sectionsJson from './sections.json'
import contextJson from './context.json'
import modesJson from './modes.json'
import commandsJson from './commands.json'
import workflowJson from './workflow.json'
import rulesJson from './rules.json'
import memoryJson from './memory.json'
import templatesJson from './templates.json'
import quizJson from './quiz.json'
import meterJson from './meter.json'
import securityJson from './security.json'
import beyondJson from './beyond.json'
import type {
  ChecklistItem,
  Command,
  ContextSource,
  Decision,
  Item,
  MemoryFile,
  Meta,
  MeterAction,
  Mode,
  ModelTier,
  QuizQuestion,
  Rule,
  SectionInfo,
  Template,
  WorkflowStep,
} from './types'

export const meta = metaJson as Meta
export const sections = sectionsJson as SectionInfo[]
export const contextSources = contextJson as ContextSource[]
export const modes = modesJson as Mode[]
export const commands = commandsJson as Command[]
export const workflow = workflowJson as {
  steps: WorkflowStep[]
  decisions: Decision[]
  checklist: ChecklistItem[]
}
export const rules = rulesJson as Rule[]
export const memoryFiles = memoryJson as MemoryFile[]
export const templates = templatesJson as Template[]
export const quiz = quizJson as QuizQuestion[]
export const meter = meterJson as {
  capacity: number
  baseline: number
  actions: MeterAction[]
  models: ModelTier[]
}
export const security = securityJson as Item[]
export const beyond = beyondJson as Item[]

export function section(id: string): SectionInfo {
  const found = sections.find((s) => s.id === id)
  if (!found) throw new Error(`Unknown section "${id}" in sections.json`)
  return found
}

export interface SearchEntry {
  id: string
  title: string
  text: string
  sectionId: string
  sectionNav: string
}

// Flat list of everything searchable, each pointing at the element id it renders with.
export const searchIndex: SearchEntry[] = (() => {
  const entries: SearchEntry[] = []
  const add = (sectionId: string, list: { id: string; title: string; body?: string; tags?: string[] }[], extra?: (i: never) => string) => {
    const nav = section(sectionId).nav
    for (const i of list) {
      entries.push({
        id: i.id,
        title: i.title,
        text: [i.title, i.body ?? '', ...(i.tags ?? []), extra ? extra(i as never) : ''].join(' ').toLowerCase(),
        sectionId,
        sectionNav: nav,
      })
    }
  }
  add('mental-model', contextSources)
  add('modes', modes)
  add('cheat-sheet', commands, (c: Command) => `${c.code} ${c.group}`)
  add('workflow', workflow.steps)
  add('workflow', workflow.decisions)
  add('dos-donts', rules, (r: Rule) => `${r.kind === 'do' ? 'do' : "don't"} ${r.group}`)
  add('team-memory', memoryFiles, (m: MemoryFile) => m.path)
  add('templates', templates, (t: Template) => t.prompt)
  add('security', security)
  add('beyond', beyond)
  for (const s of sections) {
    entries.push({ id: s.id, title: s.title, text: `${s.title} ${s.nav} ${s.intro}`.toLowerCase(), sectionId: s.id, sectionNav: s.nav })
  }
  return entries
})()
