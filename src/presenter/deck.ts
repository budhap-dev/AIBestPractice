// Builds the presenter deck from the guide content. Edit the JSON in src/content, not this file.
import { beyond, commands, contextSources, facts, glossary, memoryFiles, meta, modes, quiz, rules, sections, security, takeaways, templates, termsIn, workflow } from '../content'
import { ACTION_LABEL, GROUPS, RULE_GROUPS } from '../content/labels'
import type { Command, FunFact, QuizQuestion, Rule, Takeaway } from '../content/types'
import { diagramSteps, diagramText, type DiagramId } from '../components/diagramData'

export interface Card {
  id: string
  title: string
  body: string
  kicker?: string
  example?: string
  code?: string
  list?: string[]
}

interface Base {
  id: string
  // Section this slide belongs to; exiting the presenter returns to its page.
  section?: string
  title: string
  // Number of reveal steps: each press of → shows one more fragment before moving on.
  steps: number
  // Estimated time to read the slide once every step is shown, in seconds. Filled in by timed().
  readSeconds?: number
}

export type Slide = Base &
  (
    | { kind: 'title' }
    | { kind: 'agenda' }
    | { kind: 'section'; number: number; intro: string; terms: string[] }
    | { kind: 'cards'; part?: string; cards: Card[] }
    | { kind: 'detail'; eyebrow: string; body: string; points: { label: string; text: string }[]; code?: { label: string; text: string }; tag?: string }
    | { kind: 'table'; part?: string; group: string; rows: Command[] }
    | { kind: 'steps'; part?: string; start: number; items: Card[] }
    | { kind: 'compare'; part?: string; group: string; dos: Rule[]; donts: Rule[] }
    | { kind: 'quiz'; number: number; total: number; question: QuizQuestion }
    | { kind: 'diagram'; eyebrow: string; diagram: DiagramId }
    | { kind: 'facts'; facts: FunFact[] }
    | { kind: 'summary'; items: Takeaway[] }
    | { kind: 'end' }
  )

function chunk<T>(list: T[], size: number): T[][] {
  // Spread items evenly: 7 in chunks of 3 becomes 3 + 2 + 2, 10 in chunks of 4 becomes 4 + 3 + 3.
  const count = Math.ceil(list.length / size)
  const base = Math.floor(list.length / count)
  const extra = list.length % count
  const out: T[][] = []
  let at = 0
  for (let i = 0; i < count; i++) {
    const n = base + (i < extra ? 1 : 0)
    out.push(list.slice(at, at + n))
    at += n
  }
  return out
}

const part = (i: number, n: number) => (n > 1 ? `${i + 1} of ${n}` : undefined)

function diagramSlide(section: string, eyebrow: string, title: string, diagram: DiagramId): Slide {
  return { kind: 'diagram', id: `diagram-${diagram}`, section, eyebrow, title, diagram, steps: diagramSteps(diagram) }
}

function cardSlides(section: string, title: string, cards: Card[], size = 3): Slide[] {
  const parts = chunk(cards, size)
  return parts.map((c, i) => ({ kind: 'cards', id: `${section}-cards-${i}`, section, title, part: part(i, parts.length), cards: c, steps: c.length }))
}

function build(): Slide[] {
  const deck: Slide[] = [
    { kind: 'title', id: 'title', title: meta.headline, steps: 0 },
    { kind: 'agenda', id: 'agenda', title: 'In this session', steps: sections.length },
  ]

  sections.forEach((s, i) => {
    const terms = s.id === 'key-terms' ? [] : termsIn(`${s.title} ${s.intro}`).map((t) => t.title)
    deck.push({ kind: 'section', id: `section-${s.id}`, section: s.id, title: s.title, number: i + 1, intro: s.intro, terms, steps: 1 })

    switch (s.id) {
      case 'key-terms':
        deck.push(diagramSlide(s.id, s.nav, 'What happens when you press Enter', 'request'))
        deck.push(...cardSlides(s.id, 'The words, in plain English', glossary.map((t) => ({ id: t.id, title: t.title, body: t.body, example: `Think of it as: ${t.analogy}` }))))
        break

      case 'mental-model':
        deck.push(...cardSlides(s.id, 'What fills the context', contextSources.map((c) => ({ id: c.id, title: c.title, body: c.body, example: c.example }))))
        break

      case 'prompt-cost':
        deck.push(diagramSlide(s.id, s.nav, 'Same bug, two prompts', 'snowball'), diagramSlide(s.id, s.nav, 'Anatomy of a prompt that lands', 'anatomy'))
        break

      case 'modes':
        deck.push(diagramSlide(s.id, s.nav, 'More power, more cost', 'modes'))
        for (const m of modes) {
          deck.push({
            kind: 'detail',
            id: m.id,
            section: s.id,
            eyebrow: s.nav,
            title: m.title,
            body: m.body,
            points: [{ label: 'Use it when', text: m.useWhen }],
            code: { label: 'Example', text: m.example },
            steps: 2,
          })
        }
        break

      case 'cheat-sheet':
        for (const g of GROUPS) {
          const rows = commands.filter((c) => c.group === g.id)
          const parts = chunk(rows, 5)
          parts.forEach((r, j) =>
            deck.push({ kind: 'table', id: `cheat-${g.id}-${j}`, section: s.id, title: g.label, group: g.id, part: part(j, parts.length), rows: r, steps: r.length }),
          )
        }
        break

      case 'workflow': {
        const steps = workflow.steps.map((w) => ({ id: w.id, title: w.title, body: w.body, code: w.prompt }))
        // Three per slide: steps with a "Try" prompt need the room.
        const parts = chunk(steps, 3)
        let start = 1
        parts.forEach((items, j) => {
          deck.push({ kind: 'steps', id: `workflow-steps-${j}`, section: s.id, title: s.title, part: part(j, parts.length), start, items, steps: items.length })
          start += items.length
        })
        deck.push(diagramSlide(s.id, s.nav, 'When the chat gets long', 'chat-flow'))
        deck.push(
          ...cardSlides(
            s.id,
            'When the chat gets long',
            workflow.decisions.map((d) => ({ id: d.id, title: d.title, body: d.body, kicker: ACTION_LABEL[d.action], list: d.signals })),
          ),
        )
        break
      }

      case 'dos-donts':
        for (const g of RULE_GROUPS) {
          const dos = rules.filter((r) => r.group === g && r.kind === 'do')
          const donts = rules.filter((r) => r.group === g && r.kind === 'dont')
          // At most four per column, so long groups split over two slides.
          const n = Math.max(Math.ceil(dos.length / 4), Math.ceil(donts.length / 4))
          const split = <T,>(list: T[], i: number) => list.slice(Math.ceil((list.length * i) / n), Math.ceil((list.length * (i + 1)) / n))
          for (let i = 0; i < n; i++) {
            const d = split(dos, i)
            const x = split(donts, i)
            deck.push({ kind: 'compare', id: `dd-${g}-${i}`, section: s.id, title: g, part: part(i, n), group: g, dos: d, donts: x, steps: d.length + x.length })
          }
        }
        break

      case 'team-memory':
        deck.push(diagramSlide(s.id, s.nav, 'What gets sent, and when', 'memory'))
        deck.push(...cardSlides(s.id, s.nav, memoryFiles.map((m) => ({ id: m.id, title: m.title, body: m.when, code: m.path }))))
        break

      case 'templates':
        for (const t of templates) {
          deck.push({
            kind: 'detail',
            id: t.id,
            section: s.id,
            eyebrow: s.nav,
            title: t.title,
            body: t.body,
            tag: t.mode,
            points: [],
            code: { label: 'Prompt', text: t.prompt },
            steps: 1,
          })
        }
        break

      case 'quiz':
        quiz.forEach((q, j) =>
          deck.push({ kind: 'quiz', id: q.id, section: s.id, title: q.scenario, number: j + 1, total: quiz.length, question: q, steps: q.options.length + 1 }),
        )
        break

      case 'security':
        deck.push(...cardSlides(s.id, s.nav, security.map((c) => ({ id: c.id, title: c.title, body: c.body }))))
        break

      case 'beyond':
        deck.push(...cardSlides(s.id, s.nav, beyond.map((c) => ({ id: c.id, title: c.title, body: c.body }))))
        break

      case 'wrap-up':
        deck.push({ kind: 'summary', id: 'summary', section: s.id, title: s.title, items: takeaways, steps: takeaways.length })
        break
    }

    // A "Did you know?" break at the end of each section that has facts.
    const own = facts.filter((f) => f.section === s.id)
    if (own.length) deck.push({ kind: 'facts', id: `facts-${s.id}`, section: s.id, title: 'Did you know?', facts: own, steps: own.length })
  })

  deck.push({ kind: 'end', id: 'end', title: 'Questions?', steps: 0 })
  return deck
}

// ---------- Time to read ----------
// Keys that hold ids, links or flags rather than words shown on the slide.
const NOT_TEXT = new Set(['id', 'section', 'kind', 'group', 'steps', 'tags', 'sourceUrl', 'verify', 'number', 'total', 'start', 'part', 'correct', 'readSeconds', 'diagram'])

function countWords(value: unknown): number {
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean).length
  if (Array.isArray(value)) return value.reduce((n: number, v) => n + countWords(v), 0)
  if (value && typeof value === 'object') return Object.entries(value).reduce((n, [k, v]) => (NOT_TEXT.has(k) ? n : n + countWords(v)), 0)
  return 0
}

// Text a slide shows that lives outside its own data (meta.json, section names).
function sharedText(slide: Slide): string[] {
  switch (slide.kind) {
    case 'title':
      return [meta.company, meta.headline, meta.tagline, meta.demoAudience, meta.product, meta.owner]
    case 'agenda':
      return [meta.product, meta.demoAudience, ...sections.map((s) => s.nav)]
    case 'end':
      return [meta.closing, meta.product, meta.lastReviewed, meta.owner]
    case 'diagram':
      return diagramText(slide.diagram)
    default:
      return [sections.find((s) => s.id === slide.section)?.nav ?? '']
  }
}

function timed(slides: Slide[]): Slide[] {
  const wpm = meta.readingWordsPerMinute > 0 ? meta.readingWordsPerMinute : 200
  return slides.map((slide) => {
    const words = countWords(slide) + countWords(sharedText(slide))
    // Round up to the nearest 5 seconds; nothing reads in under 5.
    const readSeconds = Math.max(5, Math.ceil(((words / wpm) * 60) / 5) * 5)
    return { ...slide, readSeconds }
  })
}

export const deck = timed(build())

export const slideSeconds = (slide: Slide) => slide.readSeconds ?? 0

export const deckSeconds = deck.reduce((n, s) => n + slideSeconds(s), 0)

// Reading time left from this slide (included) to the end.
export const secondsFrom = (index: number) => deck.slice(index).reduce((n, s) => n + slideSeconds(s), 0)

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} s`
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  if (seconds >= 600) return `${Math.round(seconds / 60)} min`
  return sec ? `${min} min ${sec} s` : `${min} min`
}

export const sectionStart = (id: string) => Math.max(0, deck.findIndex((s) => s.kind === 'section' && s.section === id))
