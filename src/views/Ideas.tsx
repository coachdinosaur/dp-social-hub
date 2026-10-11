import { useState } from 'react'
import { nowIso, uid, useStore } from '../store'
import type { Idea } from '../types'
import { Empty } from '../components/ui'

const KINDS: { id: Idea['kind']; label: string; hint: string }[] = [
  { id: 'question', label: 'Viewer questions', hint: 'Questions from comments, saved for the episode that answers them' },
  { id: 'idea', label: 'Content ideas', hint: 'Episode, reel and post ideas' },
  { id: 'commenter', label: 'Best commenters', hint: 'Shortlist for each episode\'s shoutout (name + how to say it + their comment)' },
]
const PHASES = ['', 'Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Reels', 'Community']
const NEXT: Record<Idea['status'], Idea['status']> = { open: 'planned', planned: 'used', used: 'open' }

export function IdeasView() {
  const { data, upsert, remove } = useStore()
  const [kind, setKind] = useState<Idea['kind']>('question')
  const [text, setText] = useState('')
  const [source, setSource] = useState('')
  const [phase, setPhase] = useState('')
  const [hideUsed, setHideUsed] = useState(true)
  const list = data.ideas.filter((i) => i.kind === kind && (!hideUsed || i.status !== 'used')).sort((a, b) => a.phase.localeCompare(b.phase) || b.created_at.localeCompare(a.created_at))

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    await upsert('ideas', { id: uid(), kind, text: text.trim(), source: source.trim(), phase, status: 'open', created_at: nowIso() })
    setText(''); setSource('')
  }

  return (
    <div className="view">
      <div className="view-head"><h1>Ideas & questions</h1></div>
      <div className="tabs" role="tablist">
        {KINDS.map((k) => (
          <button key={k.id} role="tab" aria-selected={kind === k.id} className={kind === k.id ? 'on' : ''} onClick={() => setKind(k.id)}>
            {k.label} <span className="muted">{data.ideas.filter((i) => i.kind === k.id && i.status !== 'used').length}</span>
          </button>
        ))}
      </div>
      <p className="muted">{KINDS.find((k) => k.id === kind)?.hint}</p>

      <form className="quick-add" onSubmit={add}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={kind === 'commenter' ? 'Name (say it as: …): their comment' : kind === 'question' ? 'Ano ang Investa?' : 'Idea…'} aria-label="Text" />
        <input value={source} onChange={(e) => setSource(e.target.value)} placeholder={kind === 'commenter' ? 'Episode' : 'Source (e.g. YT comment)'} aria-label="Source" />
        <select value={phase} onChange={(e) => setPhase(e.target.value)} aria-label="Phase">{PHASES.map((p) => <option key={p} value={p}>{p || 'No phase'}</option>)}</select>
        <button className="btn primary">Add</button>
      </form>

      {list.length ? (
        <ul className="ideas">
          {list.map((i) => (
            <li key={i.id} className={`idea st-${i.status}`}>
              <div>
                <div>{i.text}</div>
                <div className="muted small">{[i.phase, i.source].filter(Boolean).join(' · ')}</div>
              </div>
              <div className="row tight">
                <button className={`tag status-${i.status}`} title="Click to change: open → planned → used" onClick={() => upsert('ideas', { ...i, status: NEXT[i.status] })}>{i.status}</button>
                <button className="icon-btn tiny" aria-label="Delete" onClick={() => { if (confirm('Delete?')) remove('ideas', i.id) }}>✕</button>
              </div>
            </li>
          ))}
        </ul>
      ) : <Empty>Nothing here yet.</Empty>}
      <label className="check-inline"><input type="checkbox" checked={hideUsed} onChange={(e) => setHideUsed(e.target.checked)} /> Hide used</label>
    </div>
  )
}
