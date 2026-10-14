import { useEffect, useState } from 'react'
import { meta, sections } from './content'
import { Header, jumpTo } from './components/Header'
import { Nav, printCheatSheet } from './components/Nav'
import { Beyond, CheatSheet, DosDonts, MentalModel, Modes, Practice, Security, Templates, TeamMemory, Workflow } from './components/Sections'
import { ToastProvider } from './components/ui'

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1))
    if (id) window.setTimeout(() => jumpTo(id), 50)
  }, [])

  return (
    <ToastProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header menuOpen={menuOpen} onMenu={() => setMenuOpen((o) => !o)} />
      <div className="layout">
        <Nav open={menuOpen} onNavigate={() => setMenuOpen(false)} />
        {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
        <main id="main" tabIndex={-1}>
          <section className="hero" id="top" aria-labelledby="hero-title">
            <p className="eyebrow">{meta.company} · Engineering</p>
            <h1 id="hero-title">Get more from GitHub Copilot, every day.</h1>
            <p className="hero__lede">
              Short, practical habits for VS Code: keep the context focused, spend AI credits wisely, write prompts that land, and review everything
              before it ships.
            </p>
            <div className="hero__cta">
              <button type="button" className="btn btn--primary" onClick={() => jumpTo('workflow')}>
                Start with the daily workflow
              </button>
              <button type="button" className="btn btn--outline" onClick={() => jumpTo('cheat-sheet')}>
                Open the cheat sheet
              </button>
            </div>
            <ul className="hero__toc" aria-label="In this guide">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      jumpTo(s.id)
                    }}
                  >
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    {s.nav}
                  </a>
                </li>
              ))}
            </ul>
          </section>
          <MentalModel />
          <Modes />
          <CheatSheet />
          <Workflow />
          <DosDonts />
          <TeamMemory />
          <Templates />
          <Practice />
          <Security />
          <Beyond />
          <footer className="footer">
            <p>
              <strong>{meta.product}</strong> · Last reviewed {meta.lastReviewed} · Owner {meta.owner}
            </p>
            <p className="muted">{meta.copilotVersionNote}</p>
            <button type="button" className="btn btn--ghost btn--sm" onClick={printCheatSheet}>
              Print cheat sheet
            </button>
          </footer>
        </main>
      </div>
    </ToastProvider>
  )
}
