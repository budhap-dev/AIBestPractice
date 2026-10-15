import type { CSSProperties, ReactNode } from 'react'
import { meta, sections } from '../content'
import { DiagramView } from '../components/Diagrams'
import { BulbIcon, CodeBlock, Kbd } from '../components/ui'
import { deckSeconds, formatDuration, type Slide } from './deck'
import { RichText } from '../components/RichText'

// A fragment is shown once the step count passes its position.
const frag = (step: number, k: number, extra = '') => `frag${step > k ? ' is-in' : ''}${extra ? ` ${extra}` : ''}`

function Head({ eyebrow, title, part }: { eyebrow?: string; title: string; part?: string }) {
  return (
    <header className="slide__head">
      {eyebrow && (
        <p className="slide__eyebrow intro">
          {eyebrow}
          {part && <span className="slide__part"> · {part}</span>}
        </p>
      )}
      <h2 className="slide__title intro">
        <RichText text={title} />
      </h2>
    </header>
  )
}

const navOf = (id?: string) => sections.find((s) => s.id === id)?.nav

export function SlideView({ slide, step }: { slide: Slide; step: number }) {
  let body: ReactNode
  switch (slide.kind) {
    case 'title':
      body = (
        <div className="slide__center slide--title-body">
          <p className="slide__eyebrow intro">{meta.company} · Engineering</p>
          <h1 className="slide__hero intro">{meta.headline}</h1>
          <p className="slide__lede intro">{meta.tagline}</p>
          <p className="slide__audience intro">
            <strong>For</strong> {meta.demoAudience}
          </p>
          <p className="slide__by intro">
            {meta.product} · {meta.owner}
          </p>
        </div>
      )
      break

    case 'agenda':
      body = (
        <>
          <Head eyebrow={meta.product} title={slide.title} />
          <p className="slide__lede agenda__time intro">About {formatDuration(deckSeconds)} to read, one point at a time.</p>
          <ol className="agenda">
            {sections.map((s, i) => (
              <li key={s.id} className={frag(step, i)}>
                <span className="agenda__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="agenda__nav">{s.nav}</span>
              </li>
            ))}
          </ol>
        </>
      )
      break

    case 'section':
      body = (
        <div className="slide__center divider">
          <span className="divider__num intro" aria-hidden="true">
            {String(slide.number).padStart(2, '0')}
          </span>
          <p className="slide__eyebrow intro">{navOf(slide.section)}</p>
          <h2 className="slide__hero intro">{slide.title}</h2>
          <p className={frag(step, 0, 'slide__lede')}>
            <RichText text={slide.intro} />
          </p>
          {slide.terms.length > 0 && (
            <p className={frag(step, 0, 'divider__terms')}>
              <span className="divider__terms-label">Key words</span>
              {slide.terms.map((t) => (
                <span key={t} className="divider__term">
                  {t}
                </span>
              ))}
            </p>
          )}
        </div>
      )
      break

    case 'cards':
      body = (
        <>
          <Head eyebrow={navOf(slide.section)} title={slide.title} part={slide.part} />
          <div className="deck-cards" style={{ '--cols': slide.cards.length } as CSSProperties}>
            {slide.cards.map((c, i) => (
              <article key={c.id} className={frag(step, i, 'deck-card')}>
                {c.kicker && <p className="deck-card__kicker">{c.kicker}</p>}
                <h3>
                  <RichText text={c.title} />
                </h3>
                {c.code && <code className="deck-card__code">{c.code}</code>}
                {c.list && (
                  <ul>
                    {c.list.map((l) => (
                      <li key={l}>
                        <RichText text={l} />
                      </li>
                    ))}
                  </ul>
                )}
                <p>
                  <RichText text={c.body} />
                </p>
                {c.example && (
                  <p className="deck-card__example">
                    <RichText text={c.example} />
                  </p>
                )}
              </article>
            ))}
          </div>
        </>
      )
      break

    case 'detail':
      body = (
        <>
          <Head eyebrow={slide.eyebrow} title={slide.title} />
          {slide.tag && <span className="tag slide__tag intro">{slide.tag}</span>}
          <p className="slide__lede intro">
            <RichText text={slide.body} />
          </p>
          {slide.points.map((p, i) => (
            <p key={p.label} className={frag(step, i, 'detail__point')}>
              <strong>{p.label}</strong> <RichText text={p.text} />
            </p>
          ))}
          {slide.code && (
            <div className={frag(step, slide.points.length, 'detail__code')}>
              <CodeBlock code={slide.code.text} label={slide.code.label} />
            </div>
          )}
        </>
      )
      break

    case 'table':
      body = (
        <>
          <Head eyebrow={navOf(slide.section)} title={slide.title} part={slide.part} />
          <dl className="deck-table">
            {slide.rows.map((r, i) => (
              <div key={r.id} className={frag(step, i, 'deck-table__row')}>
                <dt>
                  {slide.group === 'shortcut' ? (
                    <>
                      <span className="deck-table__action">{r.title}</span>
                      <span className="deck-table__keys">
                        {r.mac && <Kbd keys={r.mac} />}
                        {r.win && <Kbd keys={r.win} />}
                        {!r.mac && !r.win && <code>{r.code}</code>}
                      </span>
                    </>
                  ) : (
                    <code>{r.code}</code>
                  )}
                </dt>
                <dd>
                  <RichText text={r.body} />
                </dd>
              </div>
            ))}
          </dl>
        </>
      )
      break

    case 'steps':
      body = (
        <>
          <Head eyebrow={navOf(slide.section)} title={slide.title} part={slide.part} />
          <ol className="deck-steps" start={slide.start}>
            {slide.items.map((s, i) => (
              <li key={s.id} className={frag(step, i, 'deck-step')}>
                <span className="deck-step__num" aria-hidden="true">
                  {slide.start + i}
                </span>
                <div>
                  <h3>
                    <RichText text={s.title} />
                  </h3>
                  <p>
                    <RichText text={s.body} />
                  </p>
                  {s.code && (
                    <p className="deck-step__try">
                      <span className="deck-step__try-label">Try</span>
                      <code>{s.code}</code>
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </>
      )
      break

    case 'compare':
      body = (
        <>
          <Head eyebrow={navOf(slide.section)} title={slide.title} part={slide.part} />
          <div className="deck-compare">
            {(['do', 'dont'] as const).map((kind) => {
              const list = kind === 'do' ? slide.dos : slide.donts
              const offset = kind === 'do' ? 0 : slide.dos.length
              return (
                <div key={kind} className={`deck-compare__col deck-compare__col--${kind} intro`}>
                  <h3>
                    <span className="dd__icon" aria-hidden="true">
                      {kind === 'do' ? '✓' : '✕'}
                    </span>
                    {kind === 'do' ? 'Do' : 'Don’t'}
                  </h3>
                  <ul>
                    {list.map((r, i) => (
                      <li key={r.id} className={frag(step, offset + i)}>
                        <strong>
                          <RichText text={r.title} />
                        </strong>
                        <span>
                          <RichText text={r.body} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </>
      )
      break

    case 'quiz': {
      const q = slide.question
      const revealed = step > q.options.length
      body = (
        <>
          <Head eyebrow={`${navOf(slide.section)} · Scenario ${slide.number} of ${slide.total}`} title={q.scenario} />
          <ol className="deck-quiz">
            {q.options.map((o, i) => (
              <li key={i} className={frag(step, i, revealed ? (o.correct ? 'is-correct' : 'is-dim') : '')}>
                <span className="deck-quiz__letter" aria-hidden="true">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>
                  <RichText text={o.text} />
                </span>
                {revealed && o.correct && <span className="visually-hidden"> (correct answer)</span>}
              </li>
            ))}
          </ol>
          <p className={frag(step, q.options.length, 'deck-quiz__why')}>
            <strong>Why:</strong> <RichText text={q.why} />
          </p>
        </>
      )
      break
    }

    case 'diagram':
      body = (
        <>
          <Head eyebrow={slide.eyebrow} title={slide.title} />
          <div className="slide__diagram intro">
            <DiagramView id={slide.diagram} step={step} compact />
          </div>
        </>
      )
      break

    case 'facts':
      body = (
        <>
          <Head eyebrow={navOf(slide.section)} title={slide.title} />
          <div className="deck-facts">
            {slide.facts.map((f, i) => (
              <article key={f.id} className={frag(step, i, 'deck-fact')}>
                <span className="deck-fact__icon" aria-hidden="true">
                  <BulbIcon />
                </span>
                <h3>
                  <RichText text={f.title} />
                </h3>
                <p>
                  <RichText text={f.body} />
                </p>
              </article>
            ))}
          </div>
        </>
      )
      break

    case 'summary':
      body = (
        <>
          <Head eyebrow={navOf(slide.section)} title={slide.title} />
          <ol className="deck-summary">
            {slide.items.map((t, i) => (
              <li key={t.id} className={frag(step, i)}>
                <span className="deck-summary__num" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <strong>{t.title}</strong>
                  <span>
                    <RichText text={t.body} />
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </>
      )
      break

    case 'end':
      body = (
        <div className="slide__center">
          <p className="slide__eyebrow intro">You made it</p>
          <h2 className="slide__hero intro">{slide.title}</h2>
          <p className="slide__lede intro">{meta.closing}</p>
          <p className="slide__by intro">
            {meta.product} · Last reviewed {meta.lastReviewed} · Owner {meta.owner}
          </p>
        </div>
      )
      break
  }

  return (
    <div className="slide__frame">
      <div className={`slide__inner slide--${slide.kind}`}>{body}</div>
    </div>
  )
}
