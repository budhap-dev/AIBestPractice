import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { diagrams, promptCost } from '../content'
import { ACTION_LABEL } from '../content/labels'
import { costRows, costTotal, formatTokens, type DiagramId } from './diagramData'
import { RichText } from './RichText'
import { CopyButton } from './ui'

// Diagrams reveal one part per step. In the deck the presenter's → sets `step`;
// on a guide page every part shows, staggered, once the diagram scrolls into view.
const ALL = Number.POSITIVE_INFINITY
const reveal = (step: number, k: number, cls: string) => `${cls} dg-r${step > k ? ' is-in' : ''}`
const at = (k: number, extra?: Record<string, number | string>) => ({ '--i': k, ...extra }) as CSSProperties

const reduceMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

function useInView<T extends Element>() {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setSeen(true)
        io.disconnect()
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [seen])

  return [ref, seen] as const
}

// Counts up to a total when it appears, so the big number lands with a little drama.
function CountUp({ to, active }: { to: number; active: boolean }) {
  const [n, setN] = useState<number | null>(null)

  useEffect(() => {
    if (!active || reduceMotion()) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1100)
      setN(Math.round(to * (1 - (1 - p) ** 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      setN(null)
    }
  }, [active, to])

  const shown = !active ? 0 : (n ?? (reduceMotion() ? to : 0))
  return (
    <>
      <span aria-hidden="true">{formatTokens(shown)}</span>
      <span className="visually-hidden">{formatTokens(to)}</span>
    </>
  )
}

const SEGMENTS = [
  { id: 'instructions', label: 'Instruction files' },
  { id: 'history', label: 'History re-sent' },
  { id: 'added', label: 'New this round' },
] as const

function RequestFlow({ step }: { step: number }) {
  const r = diagrams.request
  return (
    <figure className="dg dg-req">
      <ol className="dg-req__steps">
        {r.steps.map((s, i) => (
          <li key={s.title} className={reveal(step, i, 'dg-req__step')} style={at(i)}>
            <span className="dg-req__num" aria-hidden="true">
              {i + 1}
            </span>
            <strong className="dg-req__title">{s.title}</strong>
            <span className="dg-req__body">{s.body}</span>
            {s.show === 'packed' && (
              <ul className="dg-req__packed">
                {r.packed.map((p, j) => (
                  <li key={p} style={{ '--j': j } as CSSProperties}>
                    {p}
                  </li>
                ))}
              </ul>
            )}
            {s.show === 'tokens' && (
              <span className="dg-req__tokens" role="img" aria-label={`“${r.tokens.join('')}” split into ${r.tokens.length} tokens`}>
                {r.tokens.map((t, j) => (
                  <span key={j} className="dg-req__tok" style={{ '--j': j } as CSSProperties} aria-hidden="true">
                    {t.replace(/^ /, '·')}
                  </span>
                ))}
              </span>
            )}
          </li>
        ))}
      </ol>
      <p className={reveal(step, r.steps.length - 1, 'dg-req__loop')} style={at(r.steps.length)}>
        <span aria-hidden="true">↻ </span>
        {r.loop}
      </p>
      <figcaption className="dg__note">{r.tokensNote}</figcaption>
    </figure>
  )
}

function Snowball({ step, compact }: { step: number; compact?: boolean }) {
  const scenarios = promptCost.scenarios
  const max = Math.max(...scenarios.flatMap((s) => costRows(s).map((r) => r.total)))
  const offsets = scenarios.map((_, i) => scenarios.slice(0, i).reduce((n, s) => n + s.rounds.length, 0))
  const totalsAt = scenarios.reduce((n, s) => n + s.rounds.length, 0)
  const [first, second] = scenarios
  const ratio = second ? Math.round(costTotal(first) / costTotal(second)) : 1

  return (
    <figure className={`dg dg-snow${compact ? ' dg--compact' : ''}`}>
      <ul className="dg-legend" aria-hidden="true">
        {SEGMENTS.map((s) => (
          <li key={s.id}>
            <span className={`dg-seg dg-seg--${s.id}`} />
            {s.label}
          </li>
        ))}
      </ul>
      <div className="dg-snow__cols">
        {scenarios.map((s, si) => (
          <section key={s.id} className={`dg-snow__col dg-snow__col--${s.id}`} aria-label={s.label}>
            <h4 className="dg-snow__label">{s.label}</h4>
            <p className="dg-snow__prompt">
              <code>{s.prompt}</code>
            </p>
            <ol className="dg-snow__rows">
              {costRows(s).map((r, i) => {
                const k = offsets[si] + i
                const tip = `Round ${r.round}: ${formatTokens(r.total)} tokens (instructions ${formatTokens(r.instructions)}, history ${formatTokens(r.history)}, new ${formatTokens(r.added)})`
                return (
                  <li key={r.round} className={reveal(step, k, 'dg-snow__row')} style={at(k)} title={tip}>
                    <span className="dg-snow__round" aria-hidden="true">
                      {r.round}
                    </span>
                    <span className="dg-snow__you">“{r.you}”</span>
                    <span className="dg-snow__track" aria-hidden="true">
                      <span className="dg-snow__bar" style={{ '--w': r.total / max } as CSSProperties}>
                        <span className="dg-seg dg-seg--instructions" style={{ flexGrow: r.instructions }} />
                        {r.history > 0 && <span className="dg-seg dg-seg--history" style={{ flexGrow: r.history }} />}
                        <span className="dg-seg dg-seg--added" style={{ flexGrow: r.added }} />
                      </span>
                      <span className="dg-snow__val">{formatTokens(r.total)}</span>
                    </span>
                    {!compact && <span className="dg-snow__copilot">{r.copilot}</span>}
                  </li>
                )
              })}
            </ol>
            <p className={reveal(step, totalsAt, 'dg-snow__total')} style={at(totalsAt)}>
              <strong>
                <CountUp to={costTotal(s)} active={step > totalsAt} />
              </strong>{' '}
              tokens in total. {s.outcome}
            </p>
          </section>
        ))}
      </div>
      {second && (
        <p className={reveal(step, totalsAt + 1, 'dg-snow__verdict')} style={at(totalsAt + 1)}>
          Same fix, about <strong>{ratio}×</strong> the tokens.
        </p>
      )}
      <figcaption className="dg__note">{promptCost.note}</figcaption>
      <table className="visually-hidden">
        <caption>Input tokens sent in each round</caption>
        <thead>
          <tr>
            <th scope="col">Prompt</th>
            <th scope="col">Round</th>
            <th scope="col">Instruction files</th>
            <th scope="col">History re-sent</th>
            <th scope="col">New this round</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {scenarios.flatMap((s) =>
            costRows(s).map((r) => (
              <tr key={`${s.id}-${r.round}`}>
                <th scope="row">{s.label}</th>
                <td>{r.round}</td>
                <td>{r.instructions}</td>
                <td>{r.history}</td>
                <td>{r.added}</td>
                <td>{r.total}</td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </figure>
  )
}

function Anatomy({ step, compact }: { step: number; compact?: boolean }) {
  const parts = promptCost.anatomy
  return (
    <figure className={`dg dg-anatomy${compact ? ' dg--compact' : ''}`}>
      <div className="dg-anatomy__prompt">
        {parts.map((p, i) => (
          <span key={p.kind} className={reveal(step, i, `dg-anatomy__part dg-anatomy__part--${p.kind}`)} style={at(i)}>
            <span className="dg-anatomy__label">{p.label}</span>
            <span className="dg-anatomy__text">
              <RichText text={p.text} />
            </span>
          </span>
        ))}
      </div>
      {!compact && (
        <div className="dg-anatomy__copy">
          <CopyButton text={parts.map((p) => p.text).join('\n')} label="Copy prompt" />
        </div>
      )}
    </figure>
  )
}

function ModesLadder({ step }: { step: number }) {
  const rungs = diagrams.modes
  return (
    <figure className="dg dg-modes">
      <ol className="dg-modes__list">
        {rungs.map((m, i) => (
          <li key={m.mode} className={reveal(step, i, 'dg-modes__rung')} style={at(i, { '--lvl': (i + 1) / rungs.length })}>
            <span className="dg-modes__name">{m.mode}</span>
            <span className="dg-modes__does">{m.does}</span>
            <span className="dg-modes__changes">
              <span className="dg-modes__key">Changes</span> {m.changes}
            </span>
            <span className="dg-modes__cost">
              <span className="dg-modes__meter" aria-hidden="true">
                <span />
              </span>
              {m.cost} cost
            </span>
          </li>
        ))}
      </ol>
    </figure>
  )
}

function ChatFlow({ step }: { step: number }) {
  const f = diagrams.chatFlow
  const last = f.questions.length * 2
  return (
    <figure className="dg dg-flow">
      <p className="dg-flow__start">{f.start}</p>
      <ol className="dg-flow__list">
        {f.questions.map((q, i) => (
          <li key={q.question} className="dg-flow__row">
            <p className={reveal(step, i * 2, 'dg-flow__q')} style={at(i * 2)}>
              <span className="dg-flow__diamond" aria-hidden="true" />
              {q.question}
              {i > 0 && <span className="dg-flow__no">No</span>}
            </p>
            <p className={reveal(step, i * 2 + 1, `dg-flow__out dg-flow__out--${q.yes}`)} style={at(i * 2 + 1)}>
              <span className="dg-flow__yes">Yes</span>
              <strong>{ACTION_LABEL[q.yes]}</strong>
              <span className="dg-flow__detail">
                <RichText text={q.yesDetail} />
              </span>
            </p>
          </li>
        ))}
      </ol>
      <p className={reveal(step, last, `dg-flow__out dg-flow__out--${f.otherwise} dg-flow__out--last`)} style={at(last)}>
        <span className="dg-flow__yes">No</span>
        <strong>{ACTION_LABEL[f.otherwise]}</strong>
        <span className="dg-flow__detail">{f.otherwiseDetail}</span>
      </p>
    </figure>
  )
}

function MemoryLanes({ step }: { step: number }) {
  const m = diagrams.memory
  return (
    <figure className="dg dg-memory">
      <div className="table-wrap">
        <table>
          <caption className="visually-hidden">Which instruction and prompt files are sent with each request</caption>
          <thead>
            <tr>
              <th scope="col">
                <span className="visually-hidden">File</span>
              </th>
              {m.requests.map((r, i) => (
                <th key={r} scope="col" className={reveal(step, i, 'dg-memory__req')} style={at(i)}>
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          {m.lanes.map((lane, li) => (
            <tbody key={lane.label} className={`dg-memory__lane dg-memory__lane--${li + 1}`}>
              <tr>
                <th colSpan={m.requests.length + 1} scope="colgroup" className="dg-memory__lane-label">
                  {lane.label}
                </th>
              </tr>
              {lane.files.map((f) => (
                <tr key={f.name}>
                  <th scope="row">
                    <code>{f.name}</code>
                  </th>
                  {f.on.map((on, i) => (
                    <td key={i} className={reveal(step, i, `dg-memory__cell${on ? ' is-on' : ''}`)} style={at(i)}>
                      <span className="dg-memory__dot" aria-hidden="true" />
                      <span className="visually-hidden">{on ? 'Sent' : 'Not sent'}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
      <figcaption className="dg__note">{m.note}</figcaption>
    </figure>
  )
}

export function DiagramView({ id, step = ALL, compact }: { id: DiagramId; step?: number; compact?: boolean }) {
  switch (id) {
    case 'request':
      return <RequestFlow step={step} />
    case 'snowball':
      return <Snowball step={step} compact={compact} />
    case 'anatomy':
      return <Anatomy step={step} compact={compact} />
    case 'modes':
      return <ModesLadder step={step} />
    case 'chat-flow':
      return <ChatFlow step={step} />
    case 'memory':
      return <MemoryLanes step={step} />
  }
}

// On a guide page: hold the diagram back until it scrolls into view, then play it.
export function Diagram({ id }: { id: DiagramId }) {
  const [ref, seen] = useInView<HTMLDivElement>()
  return (
    <div ref={ref} className={`dg-host${seen ? ' is-seen' : ''}`}>
      <DiagramView id={id} step={seen ? ALL : 0} />
    </div>
  )
}
