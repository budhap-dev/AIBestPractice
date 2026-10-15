import { useState, type CSSProperties, type ReactElement } from 'react'
import { beyond, commands, contextSources, glossary, memoryFiles, meta, modes, rules, section, sections, security, takeaways, templates, workflow } from '../content'
import { ACTION_LABEL, GROUPS, RULE_GROUPS } from '../content/labels'
import type { RuleGroup } from '../content/types'
import { href } from '../router'
import { Checklist } from './Checklist'
import { celebrate } from './confetti'
import { ContextMeter } from './ContextMeter'
import { PromptBuilder } from './PromptBuilder'
import { Quiz } from './Quiz'
import { RichText } from './RichText'
import { Diagram } from './Diagrams'
import { CodeBlock, CopyButton, Kbd, Section, Source, useToast } from './ui'

export function KeyTerms() {
  return (
    <Section info={section('key-terms')}>
      <h3 className="subhead">What happens when you press Enter</h3>
      <Diagram id="request" />
      <h3 className="subhead">The words, in plain English</h3>
      <dl className="terms">
        {glossary.map((t) => (
          <div key={t.id} id={t.id} className="card term">
            <dt>
              <dfn>{t.title}</dfn>
            </dt>
            <dd>
              <p>
                <RichText text={t.body} />
              </p>
              <p className="term__analogy">
                <span>Think of it as</span> {t.analogy}
              </p>
              {t.sourceUrl && <Source item={t} />}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}

export function MentalModel() {
  return (
    <Section info={section('mental-model')}>
      <div className="grid grid--3">
        {contextSources.map((c) => (
          <article key={c.id} id={c.id} className="card card--tight">
            <h3>{c.title}</h3>
            <p>{c.body}</p>
            <p className="example">{c.example}</p>
            <Source item={c} />
          </article>
        ))}
      </div>
      <ContextMeter />
    </Section>
  )
}

export function PromptCost() {
  return (
    <Section info={section('prompt-cost')}>
      <Diagram id="snowball" />
      <h3 className="subhead">Anatomy of a prompt that lands</h3>
      <p className="muted">The focused prompt above, taken apart. Each part saves a round of guessing.</p>
      <Diagram id="anatomy" />
      <p className="callout">
        More fill-in-the-blanks prompts in <a href={href({ kind: 'section', id: 'templates' })}>Prompt templates</a>.
      </p>
    </Section>
  )
}

export function Modes() {
  return (
    <Section info={section('modes')}>
      <Diagram id="modes" />
      <div className="grid grid--2">
        {modes.map((m) => (
          <article key={m.id} id={m.id} className="card mode">
            <h3>{m.title}</h3>
            <p>{m.body}</p>
            <p className="mode__when">
              <strong>Use it when</strong> {m.useWhen}
            </p>
            <CodeBlock code={m.example} label="Example" />
            <Source item={m} />
          </article>
        ))}
      </div>
    </Section>
  )
}

export function CheatSheet() {
  const [os, setOs] = useState<'mac' | 'win'>(() => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? 'mac' : 'win'))
  const present = GROUPS.filter((g) => commands.some((c) => c.group === g.id))

  return (
    <Section info={section('cheat-sheet')}>
      <div className="seg" role="group" aria-label="Keyboard shortcuts for">
        {(['mac', 'win'] as const).map((o) => (
          <button key={o} type="button" aria-pressed={os === o} className={os === o ? 'is-on' : undefined} onClick={() => setOs(o)}>
            {o === 'mac' ? 'macOS' : 'Windows / Linux'}
          </button>
        ))}
      </div>
      {present.map((g) => (
        <div key={g.id} className="cheat">
          <h3>{g.label}</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">{g.id === 'shortcut' ? 'Action' : 'Command'}</th>
                  <th scope="col">What it does</th>
                  <th scope="col" className="cheat__src">
                    <span className="visually-hidden">Source and copy</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {commands
                  .filter((c) => c.group === g.id)
                  .map((c) => {
                    const keys = os === 'mac' ? c.mac : c.win
                    return (
                      <tr key={c.id} id={c.id}>
                        <th scope="row">
                          {g.id === 'shortcut' ? (
                            <>
                              <span className="cheat__action">{c.title}</span>
                              {keys ? <Kbd keys={keys} /> : <span className="muted">Command Palette: {c.code}</span>}
                            </>
                          ) : (
                            <code>{c.code}</code>
                          )}
                        </th>
                        <td>{c.body}</td>
                        <td className="cheat__src">
                          <Source item={c} />
                          {g.id !== 'shortcut' && <CopyButton text={c.code} />}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </Section>
  )
}

export function Workflow() {
  return (
    <Section info={section('workflow')}>
      <ol className="steps">
        {workflow.steps.map((s, i) => (
          <li key={s.id} id={s.id} className="step">
            <span className="step__num" aria-hidden="true">
              {i + 1}
            </span>
            <div className="step__body">
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              {s.prompt && <CodeBlock code={s.prompt} label="Try" />}
              <Source item={s} />
            </div>
          </li>
        ))}
      </ol>

      <h3 className="subhead">When the chat gets long</h3>
      <Diagram id="chat-flow" />
      <div className="grid grid--3">
        {workflow.decisions.map((d) => (
          <article key={d.id} id={d.id} className={`card decision decision--${d.action}`}>
            <p className="decision__action">{ACTION_LABEL[d.action]}</p>
            <h4>{d.title}</h4>
            <ul>
              {d.signals.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="muted">{d.body}</p>
            <Source item={d} />
          </article>
        ))}
      </div>
      <Checklist />
    </Section>
  )
}

export function DosDonts() {
  const [group, setGroup] = useState<RuleGroup | 'All'>('All')
  const shown = rules.filter((r) => group === 'All' || r.group === group)

  return (
    <Section info={section('dos-donts')}>
      <div className="seg seg--wrap" role="group" aria-label="Filter by topic">
        {(['All', ...RULE_GROUPS] as const).map((g) => (
          <button key={g} type="button" aria-pressed={group === g} className={group === g ? 'is-on' : undefined} onClick={() => setGroup(g)}>
            {g}
          </button>
        ))}
      </div>
      <div className="dd">
        {(['do', 'dont'] as const).map((kind) => (
          <div key={kind} className={`dd__col dd__col--${kind}`}>
            <h3>
              <span className="dd__icon" aria-hidden="true">
                {kind === 'do' ? '✓' : '✕'}
              </span>
              {kind === 'do' ? 'Do' : 'Don’t'}
            </h3>
            <ul>
              {shown
                .filter((r) => r.kind === kind)
                .map((r) => (
                  <li key={r.id} id={r.id}>
                    <strong>{r.title}</strong>
                    <span className="dd__why">{r.body}</span>
                    <span className="dd__meta">
                      <span className="tag">{r.group}</span>
                      <Source item={r} />
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}

export function TeamMemory() {
  return (
    <Section info={section('team-memory')}>
      <h3 className="subhead">What gets sent, and when</h3>
      <Diagram id="memory" />
      <div className="stack">
        {memoryFiles.map((m) => (
          <details key={m.id} id={m.id} className="card memory">
            <summary>
              <span>
                <h3>{m.title}</h3>
                <code className="memory__path">{m.path}</code>
              </span>
              <span className="memory__when">{m.when}</span>
            </summary>
            <p>{m.body}</p>
            <CodeBlock code={m.example} label={m.path} />
            <Source item={m} />
          </details>
        ))}
      </div>
    </Section>
  )
}

export function Templates() {
  return (
    <Section info={section('templates')}>
      <div className="grid grid--2">
        {templates.map((t) => (
          <article key={t.id} id={t.id} className="card template">
            <div className="template__head">
              <h3>{t.title}</h3>
              <span className="tag">{t.mode}</span>
            </div>
            <p className="muted">{t.body}</p>
            <CodeBlock code={t.prompt} />
          </article>
        ))}
      </div>
      <PromptBuilder />
    </Section>
  )
}

export function Practice() {
  return (
    <Section info={section('quiz')}>
      <Quiz />
    </Section>
  )
}

export function Security() {
  return (
    <Section info={section('security')}>
      <div className="grid grid--2">
        {security.map((s) => (
          <article key={s.id} id={s.id} className="card card--tight">
            <h3>{s.title}</h3>
            <p>{s.body}</p>
            <Source item={s} />
          </article>
        ))}
      </div>
      <p className="callout">
        Your company policy comes first. Read the{' '}
        {meta.policyUrl ? (
          <a href={meta.policyUrl} target="_blank" rel="noreferrer">
            {meta.company} AI policy
          </a>
        ) : (
          `${meta.company} AI policy`
        )}{' '}
        before using Copilot on client or production code.
      </p>
    </Section>
  )
}

export function Beyond() {
  return (
    <Section info={section('beyond')}>
      <div className="grid grid--3">
        {beyond.map((b) => (
          <article key={b.id} id={b.id} className="card card--tight">
            <h3>{b.title}</h3>
            <p>{b.body}</p>
            <Source item={b} />
          </article>
        ))}
      </div>
    </Section>
  )
}

export function WrapUp() {
  const toast = useToast()
  return (
    <Section info={section('wrap-up')}>
      <ol className="takeaways">
        {takeaways.map((t, i) => (
          <li key={t.id} id={t.id} className="takeaway" style={{ '--i': i } as CSSProperties}>
            <span className="takeaway__num" aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <h3>{t.title}</h3>
              <p>
                <RichText text={t.body} />
              </p>
              <a className="takeaway__more" href={href({ kind: 'section', id: t.section })}>
                Revisit {sections.find((s) => s.id === t.section)?.nav}
                <span aria-hidden="true"> →</span>
              </a>
            </div>
          </li>
        ))}
      </ol>
      <div className="callout wrapup__end">
        <p>{meta.closing}</p>
        <button
          type="button"
          className="btn btn--primary"
          onClick={(e) => {
            celebrate({ size: 'big', from: e.currentTarget })
            toast('Go get them. Start with /clear.')
          }}
        >
          I’m ready
        </button>
      </div>
    </Section>
  )
}

// One page per section, keyed by the ids in sections.json.
export const SECTION_PAGES: Record<string, () => ReactElement> = {
  'key-terms': KeyTerms,
  'mental-model': MentalModel,
  'prompt-cost': PromptCost,
  modes: Modes,
  'cheat-sheet': CheatSheet,
  workflow: Workflow,
  'dos-donts': DosDonts,
  'team-memory': TeamMemory,
  templates: Templates,
  quiz: Practice,
  security: Security,
  beyond: Beyond,
  'wrap-up': WrapUp,
}
