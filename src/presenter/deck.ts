// Builds the presenter deck from the guide content. Edit the JSON in src/content, not this file.
import { beyond, commands, contextSources, memoryFiles, meta, modes, quiz, rules, sections, security, templates, workflow } from '../content'
import { ACTION_LABEL, GROUPS, RULE_GROUPS } from '../content/labels'
import type { Command, QuizQuestion, Rule } from '../content/types'

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
}

export type Slide = Base &
  (
    | { kind: 'title' }
    | { kind: 'agenda' }
    | { kind: 'section'; number: number; intro: string }
    | { kind: 'cards'; part?: string; cards: Card[] }
    | { kind: 'detail'; eyebrow: string; body: string; points: { label: string; text: string }[]; code?: { label: string; text: string }; tag?: string }
    | { kind: 'table'; part?: string; group: string; rows: Command[] }
    | { kind: 'steps'; part?: string; start: number; items: Card[] }
    | { kind: 'compare'; part?: string; group: string; dos: Rule[]; donts: Rule[] }
    | { kind: 'quiz'; number: number; total: number; question: QuizQuestion }
    | { kind: 'end' }
  )

function chunk<T>(list: T[], size: number): T[][] {
  // Spread items evenly: 7 in chunks of 4 becomes 4 + 3, 10 in chunks of 4 becomes 4 + 3 + 3.
  const count = Math.ceil(list.length / size)
  const per = Math.ceil(list.length / count)
  return Array.from({ length: count }, (_, i) => list.slice(i * per, (i + 1) * per))
}

const part = (i: number, n: number) => (n > 1 ? `${i + 1} of ${n}` : undefined)

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
    deck.push({ kind: 'section', id: `section-${s.id}`, section: s.id, title: s.title, number: i + 1, intro: s.intro, steps: 1 })

    switch (s.id) {
      case 'mental-model':
        deck.push(...cardSlides(s.id, 'What fills the context', contextSources.map((c) => ({ id: c.id, title: c.title, body: c.body, example: c.example }))))
        break

      case 'modes':
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
        const steps = workflow.steps.map((w) => ({ id: w.id, title: w.title, body: w.body }))
        const parts = chunk(steps, 4)
        let start = 1
        parts.forEach((items, j) => {
          deck.push({ kind: 'steps', id: `workflow-steps-${j}`, section: s.id, title: s.title, part: part(j, parts.length), start, items, steps: items.length })
          start += items.length
        })
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
    }
  })

  deck.push({ kind: 'end', id: 'end', title: 'Questions?', steps: 0 })
  return deck
}

export const deck = build()

export const sectionStart = (id: string) => Math.max(0, deck.findIndex((s) => s.kind === 'section' && s.section === id))
