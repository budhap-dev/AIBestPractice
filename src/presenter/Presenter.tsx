import { useEffect, useEffectEvent, useRef, useState, type CSSProperties } from 'react'
import { meta, sections } from '../content'
import { ThemeMenu } from '../components/ThemeMenu'
import { navigate } from '../router'
import { deck, deckSeconds, formatDuration, secondsFrom, slideSeconds } from './deck'
import { SlideView } from './Slide'
import './presenter.css'

const TRANSITIONS = [
  { id: 'slide', label: 'Slide' },
  { id: 'fade', label: 'Fade' },
  { id: 'zoom', label: 'Zoom' },
  { id: 'flip', label: 'Flip' },
] as const

type Transition = (typeof TRANSITIONS)[number]['id']
type Overlay = 'none' | 'overview' | 'help'

const TRANSITION_KEY = 'cfg-transition'
const LAST = deck.length - 1
const clamp = (n: number) => Math.min(Math.max(n, 0), LAST)
const navOf = (id?: string) => sections.find((s) => s.id === id)?.nav

const SHORTCUTS: [string, string][] = [
  ['→  Space  PgDn', 'Next point or slide'],
  ['←  Shift+Space  PgUp', 'Previous point or slide'],
  ['Home  End', 'First or last slide'],
  ['O', 'Overview of all slides'],
  ['F', 'Fullscreen'],
  ['T', 'Next transition style'],
  ['B', 'Blank the screen'],
  ['?', 'Show these shortcuts'],
  ['Esc', 'Close a panel, or leave presenter mode'],
]

function readTransition(): Transition {
  try {
    const t = localStorage.getItem(TRANSITION_KEY)
    return TRANSITIONS.some((x) => x.id === t) ? (t as Transition) : 'slide'
  } catch {
    return 'slide'
  }
}

export function Presenter({ slide }: { slide: number }) {
  const index = clamp(slide - 1)
  const [pos, setPos] = useState({ index, step: 0, dir: 1 })
  const [leaving, setLeaving] = useState<{ index: number; step: number; key: number } | null>(null)
  const [overlay, setOverlay] = useState<Overlay>('none')
  const [blank, setBlank] = useState(false)
  const [transition, setTransition] = useState<Transition>(readTransition)
  const [idle, setIdle] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const leaveKey = useRef(0)
  const swipe = useRef<{ x: number; y: number } | null>(null)

  // The URL changed from outside (typed, or the back button): show that slide from its first step.
  if (pos.index !== index) setPos({ index, step: 0, dir: index > pos.index ? 1 : -1 })

  const current = deck[index]
  const step = Math.min(pos.step, current.steps)

  function go(to: number, toStep: number) {
    to = clamp(to)
    setBlank(false)
    if (to === index) {
      setPos({ index, step: toStep, dir: pos.dir })
      return
    }
    leaveKey.current += 1
    setLeaving({ index, step, key: leaveKey.current })
    setPos({ index: to, step: toStep, dir: to > index ? 1 : -1 })
    navigate({ kind: 'present', slide: to + 1 }, { replace: true })
  }

  const next = () => (step < current.steps ? go(index, step + 1) : index < LAST && go(index + 1, 0))
  const prev = () => (step > 0 ? go(index, step - 1) : index > 0 && go(index - 1, deck[index - 1].steps))

  function exit() {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    navigate(current.section ? { kind: 'section', id: current.section } : { kind: 'home' })
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    else void document.documentElement.requestFullscreen?.().catch(() => {})
  }

  function cycleTransition() {
    const i = TRANSITIONS.findIndex((t) => t.id === transition)
    chooseTransition(TRANSITIONS[(i + 1) % TRANSITIONS.length].id)
  }

  function chooseTransition(t: Transition) {
    setTransition(t)
    try {
      localStorage.setItem(TRANSITION_KEY, t)
    } catch {
      // Storage blocked: the choice lasts for this visit.
    }
  }

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const el = e.target as HTMLElement
    if (/^(input|select|textarea)$/i.test(el.tagName)) return
    // Space and Enter already "click" a focused button; don't double up.
    const onButton = el.closest('button, a, summary') !== null

    if (overlay !== 'none') {
      if (e.key === 'Escape' || (overlay === 'overview' && /^[og]$/i.test(e.key)) || (overlay === 'help' && e.key === '?')) {
        e.preventDefault()
        setOverlay('none')
      }
      return
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
        e.preventDefault()
        next()
        break
      case ' ':
        if (onButton) return
        e.preventDefault()
        if (e.shiftKey) prev()
        else next()
        break
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault()
        prev()
        break
      case 'Home':
        e.preventDefault()
        go(0, 0)
        break
      case 'End':
        e.preventDefault()
        go(LAST, deck[LAST].steps)
        break
      case 'o':
      case 'O':
      case 'g':
        setOverlay('overview')
        break
      case 'f':
      case 'F':
        toggleFullscreen()
        break
      case 't':
      case 'T':
        cycleTransition()
        break
      case 'b':
      case 'B':
      case '.':
        setBlank((b) => !b)
        break
      case '?':
        setOverlay('help')
        break
      case 'Escape':
        if (blank) setBlank(false)
        else exit()
        break
    }
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e)
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Hide the toolbar and cursor after a few seconds without mouse movement.
  useEffect(() => {
    let timer = window.setTimeout(() => setIdle(true), 2500)
    const wake = () => {
      setIdle(false)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setIdle(true), 2500)
    }
    window.addEventListener('pointermove', wake)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('pointermove', wake)
    }
  }, [])

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement !== null)
    document.addEventListener('fullscreenchange', onChange)
    document.documentElement.classList.add('presenting')
    root.current?.focus({ preventScroll: true })
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.documentElement.classList.remove('presenting')
    }
  }, [])

  useEffect(() => {
    document.title = `${index + 1}/${deck.length} · ${current.title} · ${meta.product}`
  }, [index, current.title])

  const progress = (index + (current.steps ? step / (current.steps + 1) : 0)) / LAST

  return (
    <div
      ref={root}
      className={`presenter${idle && overlay === 'none' ? ' is-idle' : ''}`}
      data-transition={transition}
      style={{ '--dir': pos.dir } as CSSProperties}
      tabIndex={-1}
      role="region"
      aria-label="Presenter mode"
      aria-roledescription="slide deck"
      onPointerDown={(e) => {
        if (e.pointerType !== 'mouse') swipe.current = { x: e.clientX, y: e.clientY }
      }}
      onPointerUp={(e) => {
        const start = swipe.current
        swipe.current = null
        if (!start) return
        const dx = e.clientX - start.x
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - start.y)) {
          if (dx < 0) next()
          else prev()
        }
      }}
    >
      <div className="presenter__bar presenter__bar--top">
        <p className="presenter__where">
          <span className="presenter__product">{meta.product}</span>
          {current.section && <span className="presenter__section">{navOf(current.section)}</span>}
        </p>
        <div className="presenter__tools">
          <label className="presenter__select">
            <span className="visually-hidden">Transition</span>
            <select value={transition} onChange={(e) => chooseTransition(e.target.value as Transition)} title="Transition (T)">
              {TRANSITIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <ThemeMenu />
          <button type="button" className="btn btn--icon" onClick={() => setOverlay('overview')} aria-label="Overview of all slides (O)" title="Overview (O)">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </button>
          <button type="button" className="btn btn--icon" onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'} title="Fullscreen (F)">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {fullscreen ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
            </svg>
          </button>
          <button type="button" className="btn btn--icon" onClick={() => setOverlay('help')} aria-label="Keyboard shortcuts (?)" title="Shortcuts (?)">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
            </svg>
          </button>
          <button type="button" className="btn btn--outline btn--sm presenter__exit" onClick={exit}>
            Exit
            <kbd>Esc</kbd>
          </button>
        </div>
      </div>

      <div className="presenter__stage">
        {leaving && (
          <section
            key={`leave-${leaving.key}`}
            className="slide slide--leave"
            aria-hidden="true"
            inert
            onAnimationEnd={(e) => e.target === e.currentTarget && setLeaving(null)}
          >
            <SlideView slide={deck[leaving.index]} step={leaving.step} />
          </section>
        )}
        <section key={index} className="slide slide--enter" aria-roledescription="slide" aria-label={`${index + 1} of ${deck.length}: ${current.title}`}>
          <SlideView slide={current} step={step} />
        </section>
        {blank && <div className="presenter__blank" onClick={() => setBlank(false)} aria-hidden="true" />}
      </div>

      <p className="visually-hidden" aria-live="polite">
        Slide {index + 1} of {deck.length}: {current.title}. About {formatDuration(slideSeconds(current))} to read
        {current.steps > 0 && step < current.steps ? `. ${current.steps - step} more points.` : ''}
      </p>

      <div className="presenter__bar presenter__bar--bottom">
        <div className="presenter__progress" aria-hidden="true">
          <span className="presenter__progress-fill" style={{ transform: `scaleX(${progress})` }} />
          {sections.map((s) => {
            const at = deck.findIndex((d) => d.kind === 'section' && d.section === s.id)
            return <span key={s.id} className="presenter__tick" style={{ left: `${(at / LAST) * 100}%` }} />
          })}
        </div>
        <div className="presenter__nav">
          <span className="presenter__time" title={`Estimated time to read this slide. About ${formatDuration(secondsFrom(index))} of reading left.`}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            <span>{formatDuration(slideSeconds(current))} read</span>
            <span className="presenter__left">· {formatDuration(secondsFrom(index))} left</span>
          </span>
          <button type="button" className="btn btn--icon" onClick={prev} disabled={index === 0 && step === 0} aria-label="Previous">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <span className="presenter__count">
            {index + 1} / {deck.length}
          </span>
          <button type="button" className="btn btn--icon" onClick={next} disabled={index === LAST && step === current.steps} aria-label="Next">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {overlay === 'overview' && (
        <Overview
          current={index}
          onPick={(i) => {
            setOverlay('none')
            go(i, 0)
            root.current?.focus({ preventScroll: true })
          }}
          onClose={() => {
            setOverlay('none')
            root.current?.focus({ preventScroll: true })
          }}
        />
      )}
      {overlay === 'help' && (
        <div className="presenter__overlay" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" onClick={() => setOverlay('none')}>
          <div className="presenter__help" onClick={(e) => e.stopPropagation()}>
            <h2>Keyboard shortcuts</h2>
            <dl>
              {SHORTCUTS.map(([keys, what]) => (
                <div key={keys}>
                  <dt>
                    {keys.split('  ').map((k) => (
                      <kbd key={k}>{k}</kbd>
                    ))}
                  </dt>
                  <dd>{what}</dd>
                </div>
              ))}
            </dl>
            <p className="muted">On a touch screen, swipe left or right.</p>
            <button type="button" className="btn btn--primary" onClick={() => setOverlay('none')} autoFocus>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Overview({ current, onPick, onClose }: { current: number; onPick: (i: number) => void; onClose: () => void }) {
  const active = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    active.current?.focus({ preventScroll: true })
    active.current?.scrollIntoView({ block: 'center' })
  }, [])

  return (
    <div className="presenter__overlay presenter__overlay--overview" role="dialog" aria-modal="true" aria-label="All slides">
      <div className="overview__head">
        <h2>
          All slides <span className="overview__total">· about {formatDuration(deckSeconds)} to read</span>
        </h2>
        <button type="button" className="btn btn--outline btn--sm" onClick={onClose}>
          Close
          <kbd>Esc</kbd>
        </button>
      </div>
      <ol className="overview">
        {deck.map((s, i) => (
          <li key={s.id} style={{ '--i': Math.min(i, 30) } as CSSProperties}>
            <button
              ref={i === current ? active : undefined}
              type="button"
              className={`overview__card overview__card--${s.kind}${i === current ? ' is-current' : ''}`}
              aria-current={i === current ? 'true' : undefined}
              onClick={() => onPick(i)}
            >
              <span className="overview__meta">
                <span className="overview__num">{i + 1}</span>
                <span className="overview__time">
                  <span className="visually-hidden">Time to read: </span>
                  {formatDuration(slideSeconds(s))}
                </span>
              </span>
              <span className="overview__section">{navOf(s.section) ?? meta.product}</span>
              <span className="overview__title">{s.title}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
