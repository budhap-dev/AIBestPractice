import { useEffect, useState } from 'react'
import { sections } from '../content'
import { jumpTo } from './Header'

export function Nav({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const [active, setActive] = useState(sections[0].id)

  // The active section is the last one whose top has passed a line 30% down the viewport.
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const line = window.innerHeight * 0.3
      let current = sections[0].id
      for (const s of sections) {
        const el = document.getElementById(s.id)
        if (el && el.getBoundingClientRect().top <= line) current = s.id
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <nav id="site-nav" className={`sidenav${open ? ' sidenav--open' : ''}`} aria-label="Sections">
      <ol>
        {sections.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? 'location' : undefined}
              onClick={(e) => {
                e.preventDefault()
                onNavigate()
                jumpTo(s.id)
              }}
            >
              <span className="sidenav__num">{String(i + 1).padStart(2, '0')}</span>
              {s.nav}
            </a>
          </li>
        ))}
      </ol>
      <button type="button" className="btn btn--ghost btn--sm sidenav__print" onClick={() => printCheatSheet()}>
        Print cheat sheet
      </button>
    </nav>
  )
}

export function printCheatSheet() {
  document.body.classList.add('print-cheatsheet')
  const done = () => {
    document.body.classList.remove('print-cheatsheet')
    window.removeEventListener('afterprint', done)
  }
  window.addEventListener('afterprint', done)
  window.print()
}
