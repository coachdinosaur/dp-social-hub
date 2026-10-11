import { useMemo, useState } from 'react'
import { PLATFORM_LIST } from '../platforms'
import { uid, useStore } from '../store'
import type { HashtagSet, Platform } from '../types'
import { parseTags } from '../utils'
import { CopyButton, Empty, Modal, PlatformBadge } from '../components/ui'

export function HashtagsView() {
  const { data, upsert, remove } = useStore()
  const [editing, setEditing] = useState<HashtagSet | null>(null)

  // how often each tag was used, and the average views of posts that used it
  const stats = useMemo(() => {
    const m = new Map<string, { n: number; views: number; withViews: number }>()
    for (const p of data.posts) for (const t of p.hashtags) {
      const s = m.get(t.toLowerCase()) ?? { n: 0, views: 0, withViews: 0 }
      s.n++
      if (p.metrics?.views != null) { s.views += p.metrics.views; s.withViews++ }
      m.set(t.toLowerCase(), s)
    }
    return m
  }, [data.posts])
  const top = [...stats.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 15)

  return (
    <div className="view">
      <div className="view-head">
        <h1>Hashtags</h1>
        <button className="btn primary" onClick={() => setEditing({ id: uid(), name: '', platform: 'all', tags: [], notes: '' })}>New set</button>
      </div>
      <p className="muted">Reusable hashtag sets. Add them to a post with one tap in the post editor.</p>

      <div className="cards">
        {data.hashtag_sets.map((s) => (
          <article key={s.id} className="card">
            <header className="row between">
              <h3>{s.name}</h3>
              {s.platform === 'all' ? <span className="tag">All platforms</span> : <PlatformBadge platform={s.platform} full />}
            </header>
            <p className="tags">{s.tags.map((t) => <span key={t} className="htag">{t}</span>)}</p>
            {s.notes && <p className="muted small">{s.notes}</p>}
            <div className="row">
              <CopyButton text={s.tags.join(' ')} />
              <button className="btn small ghost" onClick={() => setEditing(s)}>Edit</button>
            </div>
          </article>
        ))}
      </div>

      <h2>Most used</h2>
      {top.length ? (
        <table className="table">
          <thead><tr><th>Hashtag</th><th>Posts</th><th>Avg views</th></tr></thead>
          <tbody>{top.map(([t, s]) => <tr key={t}><td>{t}</td><td>{s.n}</td><td>{s.withViews ? Math.round(s.views / s.withViews).toLocaleString() : '—'}</td></tr>)}</tbody>
        </table>
      ) : <Empty>Hashtag stats appear once posts have hashtags.</Empty>}

      {editing && (
        <Modal title={data.hashtag_sets.some((s) => s.id === editing.id) ? 'Edit set' : 'New set'} onClose={() => setEditing(null)}>
          <SetForm set={editing}
            onSave={async (s) => { await upsert('hashtag_sets', s); setEditing(null) }}
            onDelete={async () => { await remove('hashtag_sets', editing.id); setEditing(null) }} />
        </Modal>
      )}
    </div>
  )
}

function SetForm({ set, onSave, onDelete }: { set: HashtagSet; onSave: (s: HashtagSet) => void; onDelete: () => void }) {
  const [s, setS] = useState(set)
  const [text, setText] = useState(set.tags.join(' '))
  return (
    <>
      <label className="field"><span>Name</span><input value={s.name} onChange={(e) => setS({ ...s, name: e.target.value })} /></label>
      <label className="field"><span>Platform</span>
        <select value={s.platform} onChange={(e) => setS({ ...s, platform: e.target.value as Platform | 'all' })}>
          <option value="all">All platforms</option>
          {PLATFORM_LIST.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </label>
      <label className="field"><span>Hashtags</span><textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="#IponTips #PersonalFinancePH" /></label>
      <label className="field"><span>Notes</span><input value={s.notes} onChange={(e) => setS({ ...s, notes: e.target.value })} /></label>
      <footer className="modal-foot">
        <button className="btn danger" onClick={() => { if (confirm('Delete this set?')) onDelete() }}>Delete</button>
        <span className="spacer" />
        <button className="btn primary" disabled={!s.name.trim()} onClick={() => onSave({ ...s, tags: parseTags(text) })}>Save</button>
      </footer>
    </>
  )
}
