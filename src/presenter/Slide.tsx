import type { CSSProperties, ReactNode } from 'react'
import { meta, sections } from '../content'
import { CodeBlock, Kbd } from '../components/ui'
import type { Slide } from './deck'

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
      <h2 className="slide__title intro">{title}</h2>
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
          <p className={frag(step, 0, 'slide__lede')}>{slide.intro}</p>
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
                <h3>{c.title}</h3>
                {c.code && <code className="deck-card__code">{c.code}</code>}
                {c.list && (
                  <ul>
                    {c.list.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                )}
                <p>{c.body}</p>
                {c.example && <p className="deck-card__example">{c.example}</p>}
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
          <p className="slide__lede intro">{slide.body}</p>
          {slide.points.map((p, i) => (
            <p key={p.label} className={frag(step, i, 'detail__point')}>
              <strong>{p.label}</strong> {p.text}
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
                <dd>{r.body}</dd>
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
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
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
                        <strong>{r.title}</strong>
                        <span>{r.body}</span>
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
                <span>{o.text}</span>
                {revealed && o.correct && <span className="visually-hidden"> (correct answer)</span>}
              </li>
            ))}
          </ol>
          <p className={frag(step, q.options.length, 'deck-quiz__why')}>
            <strong>Why:</strong> {q.why}
          </p>
        </>
      )
      break
    }

    case 'end':
      body = (
        <div className="slide__center">
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
