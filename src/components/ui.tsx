import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import type { Item, SectionInfo } from '../content/types'

type ShowToast = (message: string) => void

const ToastContext = createContext<ShowToast>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback<ShowToast>((text) => {
    setMessage(text)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMessage(''), 2200)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={`toast${message ? ' toast--on' : ''}`} role="status" aria-live="polite">
        {message}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const toast = useToast()

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      toast('Copied to clipboard')
    } catch {
      toast('Copy failed: select the text and copy it manually')
    }
  }

  return (
    <button type="button" className="btn btn--ghost btn--sm" onClick={copy} aria-label={`${label}: ${text.slice(0, 60)}`}>
      <CopyIcon />
      <span>{label}</span>
    </button>
  )
}

export function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="code">
      <div className="code__bar">
        <span className="code__label">{label ?? 'Prompt'}</span>
        <CopyButton text={code} />
      </div>
      <pre tabIndex={0}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

export function Source({ item }: { item: Pick<Item, 'sourceUrl' | 'verify'> }) {
  return (
    <span className="source">
      {item.verify && (
        <span className="badge badge--warn" title="Not yet confirmed in the official docs. See VERIFY.md.">
          Needs verification
        </span>
      )}
      {item.sourceUrl && (
        <a href={item.sourceUrl} target="_blank" rel="noreferrer">
          Source<span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      )}
    </span>
  )
}

export function Section({ info, children }: { info: SectionInfo; children: ReactNode }) {
  return (
    <section id={info.id} className="section" aria-labelledby={`${info.id}-title`}>
      <header className="section__head">
        <p className="eyebrow">{info.nav}</p>
        <h2 id={`${info.id}-title`} tabIndex={-1}>{info.title}</h2>
        <p className="lede">{info.intro}</p>
      </header>
      {children}
    </section>
  )
}

export function Kbd({ keys }: { keys: string }) {
  return (
    <span className="kbd-group">
      {keys.split('+').map((k, i) => (
        <kbd key={i}>{k.trim()}</kbd>
      ))}
    </span>
  )
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  )
}
