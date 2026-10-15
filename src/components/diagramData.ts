// Numbers and reveal steps behind the diagrams, shared by the guide pages and the presenter deck.
import { diagrams, promptCost } from '../content'
import { ACTION_LABEL } from '../content/labels'
import type { PromptScenario } from '../content/types'

export type DiagramId = 'request' | 'snowball' | 'anatomy' | 'modes' | 'chat-flow' | 'memory'

export interface CostRow {
  round: number
  you: string
  copilot: string
  instructions: number
  // Everything earlier in the chat, re-sent with this request.
  history: number
  added: number
  total: number
}

// Each request sends the instructions, the whole history so far and whatever this round adds.
export function costRows(s: PromptScenario): CostRow[] {
  let history = 0
  return s.rounds.map((r, i) => {
    const row = { round: i + 1, you: r.you, copilot: r.copilot, instructions: promptCost.instructions, history, added: r.added, total: promptCost.instructions + history + r.added }
    history += r.added + r.reply
    return row
  })
}

export const costTotal = (s: PromptScenario) => costRows(s).reduce((n, r) => n + r.total, 0)

export const formatTokens = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(n))

// How many presses of → each diagram takes in the deck: one per row, card or column.
export function diagramSteps(id: DiagramId): number {
  switch (id) {
    case 'request':
      return diagrams.request.steps.length
    case 'snowball':
      // Every round of every scenario, then the totals, then the comparison.
      return promptCost.scenarios.reduce((n, s) => n + s.rounds.length, 0) + 2
    case 'anatomy':
      return promptCost.anatomy.length
    case 'modes':
      return diagrams.modes.length
    case 'chat-flow':
      // Each question and its "yes" outcome, then the fallback.
      return diagrams.chatFlow.questions.length * 2 + 1
    case 'memory':
      return diagrams.memory.requests.length
  }
}

// The words a diagram shows, for the deck's time-to-read estimate.
export function diagramText(id: DiagramId): string[] {
  switch (id) {
    case 'request': {
      const r = diagrams.request
      return [...r.steps.flatMap((s) => [s.title, s.body]), ...r.packed, r.tokens.join(''), r.tokensNote, r.loop]
    }
    case 'snowball':
      return [promptCost.note, ...promptCost.scenarios.flatMap((s) => [s.label, s.prompt, s.outcome, ...s.rounds.map((r) => r.you)])]
    case 'anatomy':
      return promptCost.anatomy.flatMap((p) => [p.label, p.text])
    case 'modes':
      return diagrams.modes.flatMap((m) => [m.mode, m.does, m.changes, m.cost])
    case 'chat-flow': {
      const f = diagrams.chatFlow
      return [f.start, ...f.questions.flatMap((q) => [q.question, ACTION_LABEL[q.yes], q.yesDetail]), ACTION_LABEL[f.otherwise], f.otherwiseDetail]
    }
    case 'memory': {
      const m = diagrams.memory
      return [...m.requests, ...m.lanes.flatMap((l) => [l.label, ...l.files.map((f) => f.name)]), m.note]
    }
  }
}
