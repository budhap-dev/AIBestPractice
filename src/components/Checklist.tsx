import { useEffect, useState } from 'react'
import { workflow } from '../content'
import type { ChecklistItem } from '../content/types'

const KEY = 'cfg-checklist'

function load(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function Checklist() {
  const [done, setDone] = useState<string[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(done))
    } catch {
      // Storage blocked: ticks last for this visit only.
    }
  }, [done])

  const toggle = (id: string) => setDone((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]))
  const phases: ChecklistItem['phase'][] = ['Start', 'During', 'Finish']
  const count = workflow.checklist.filter((c) => done.includes(c.id)).length

  return (
    <div className="checklist card">
      <div className="checklist__head">
        <div>
          <h3>Daily checklist</h3>
          <p className="muted">Ticks are saved in this browser only.</p>
        </div>
        <div className="checklist__count">
          <strong>{count}</strong>/{workflow.checklist.length}
        </div>
      </div>
      <div className="checklist__cols">
        {phases.map((p) => (
          <fieldset key={p}>
            <legend>{p} of a task</legend>
            {workflow.checklist
              .filter((c) => c.phase === p)
              .map((c) => (
                <label key={c.id} className="check">
                  <input type="checkbox" checked={done.includes(c.id)} onChange={() => toggle(c.id)} />
                  <span>{c.label}</span>
                </label>
              ))}
          </fieldset>
        ))}
      </div>
      <button type="button" className="btn btn--ghost btn--sm" onClick={() => setDone([])} disabled={!count}>
        Reset for the next task
      </button>
    </div>
  )
}
