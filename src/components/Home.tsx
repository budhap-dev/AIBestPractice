import { meta, sections } from '../content'
import { href } from '../router'

export function Home() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <p className="eyebrow">{meta.company} · Engineering</p>
      <h1 id="hero-title" tabIndex={-1}>
        Get more from GitHub Copilot, every day.
      </h1>
      <p className="hero__lede">
        Short, practical habits for VS Code: keep the context focused, spend AI credits wisely, write prompts that land, and review everything before it
        ships.
      </p>
      <div className="hero__cta">
        <a className="btn btn--primary" href={href({ kind: 'section', id: 'workflow' })}>
          Start with the daily workflow
        </a>
        <a className="btn btn--outline" href={href({ kind: 'section', id: 'cheat-sheet' })}>
          Open the cheat sheet
        </a>
      </div>
      <h2 className="hero__toc-title">In this guide</h2>
      <ol className="hero__toc">
        {sections.map((s, i) => (
          <li key={s.id} style={{ '--i': i } as React.CSSProperties}>
            <a href={href({ kind: 'section', id: s.id })}>
              <span className="hero__toc-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="hero__toc-nav">{s.nav}</span>
              <span className="hero__toc-title-text">{s.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}
