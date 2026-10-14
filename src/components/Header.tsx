import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { meta, searchIndex, type SearchEntry } from '../content'

type Theme = 'light' | 'dark' | 'system'

function readTheme(): Theme {
  try {
    const t = localStorage.getItem('cfg-theme')
    return t === 'light' || t === 'dark' ? t : 'system'
  } catch {
    return 'system'
  }
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') delete root.dataset.theme
    else root.dataset.theme = theme
    try {
      if (theme === 'system') localStorage.removeItem('cfg-theme')
      else localStorage.setItem('cfg-theme', theme)
    } catch {
      // Storage blocked: the choice still applies for this visit.
    }
  }, [theme])

  const next: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' }
  const label = { system: 'Theme: system', light: 'Theme: light', dark: 'Theme: dark' }[theme]

  return (
    <button type="button" className="btn btn--icon" onClick={() => setTheme(next[theme])} aria-label={`${label}. Change theme`} title={label}>
      {theme === 'light' && (
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
      )}
      {theme === 'dark' && (
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
      )}
      {theme === 'system' && (
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>
      )}
    </button>
  )
}

export function jumpTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  history.replaceState(null, '', `#${id}`)
  el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  el.classList.remove('flash')
  void el.offsetWidth
  el.classList.add('flash')
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}

function Search() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const listId = useId()

  const results = useMemo<SearchEntry[]>(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean)
    if (!words.length) return []
    return searchIndex
      .map((e) => {
        if (!words.every((w) => e.text.includes(w))) return null
        const titleHits = words.filter((w) => e.title.toLowerCase().includes(w)).length
        return { e, score: titleHits }
      })
      .filter((r): r is { e: SearchEntry; score: number } => r !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((r) => r.e)
  }, [query])

  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      const typing = ev.target instanceof HTMLElement && /input|textarea|select/i.test(ev.target.tagName)
      if (ev.key === '/' && !typing) {
        ev.preventDefault()
        input.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function choose(entry: SearchEntry) {
    setOpen(false)
    setQuery('')
    input.current?.blur()
    jumpTo(entry.id)
  }

  function onKeyDown(ev: React.KeyboardEvent) {
    if (ev.key === 'ArrowDown') {
      ev.preventDefault()
      setOpen(true)
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (ev.key === 'Enter' && results[active]) {
      ev.preventDefault()
      choose(results[active])
    } else if (ev.key === 'Escape') {
      setOpen(false)
      input.current?.blur()
    }
  }

  const showList = open && query.trim().length > 0

  return (
    <div className="search" role="search">
      <svg className="search__icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <input
        ref={input}
        type="search"
        placeholder="Search tips, commands, prompts"
        aria-label="Search the guide"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && results[active] ? `${listId}-${active}` : undefined}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setActive(0)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
      />
      <kbd className="search__hint" aria-hidden="true">/</kbd>
      {showList && (
        <ul className="search__list" id={listId} role="listbox" aria-label="Search results">
          {results.length === 0 && <li className="search__empty">No matches. Try “context”, “#file” or “secrets”.</li>}
          {results.map((r, i) => (
            <li
              key={`${r.id}-${i}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'is-active' : undefined}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(r)}
              onMouseEnter={() => setActive(i)}
            >
              <span className="search__title">{r.title}</span>
              <span className="search__section">{r.sectionNav}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function Header({ menuOpen, onMenu }: { menuOpen: boolean; onMenu: () => void }) {
  return (
    <header className="topbar">
      <button type="button" className="btn btn--icon topbar__menu" onClick={onMenu} aria-expanded={menuOpen} aria-controls="site-nav" aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
        <svg viewBox="0 0 24 24" aria-hidden="true">{menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
      </button>
      <a className="brand" href="#top">
        <img src="./favicon.svg" alt="" width="28" height="28" />
        <span>{meta.product}</span>
      </a>
      <Search />
      <ThemeToggle />
    </header>
  )
}
