import { useRef, useState } from 'react'
import { DEMO_MODE } from '../config'
import { PLATFORM_LIST } from '../platforms'
import { COLLECTIONS, nowIso, uid, useStore } from '../store'
import type { Content, Goal, Platform } from '../types'
import { download, toCsv, todayKey } from '../utils'
import { seedData } from '../seed'

export function SettingsView() {
  const store = useStore()
  const { data, upsert, remove, replaceAll, session, signOut } = store
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<Content['kind']>('episode')
  const fileRef = useRef<HTMLInputElement>(null)

  function exportJson() {
    download(`dp-social-hub-backup-${todayKey()}.json`, JSON.stringify(data, null, 2))
  }
  function exportCsv() {
    const rows = data.posts.map((p) => ({
      platform: p.platform, format: p.format, status: p.status, scheduled_at: p.scheduled_at, posted_at: p.posted_at,
      title: p.title, caption: p.caption, hashtags: p.hashtags.join(' '), link: p.link, assignee: p.assignee,
      content: data.contents.find((c) => c.id === p.content_id)?.title ?? '', views: p.metrics.views, likes: p.metrics.likes,
      comments: p.metrics.comments, shares: p.metrics.shares, saves: p.metrics.saves, follows: p.metrics.follows,
    }))
    download(`dp-posts-${todayKey()}.csv`, toCsv(rows), 'text/csv')
  }
  async function importJson(f: File) {
    try {
      const parsed = JSON.parse(await f.text())
      if (!COLLECTIONS.every((c) => Array.isArray(parsed[c] ?? []))) throw new Error('Not a backup file')
      if (!confirm('Import this backup? Items with the same id are overwritten; nothing is deleted.')) return
      const merged = Object.fromEntries(COLLECTIONS.map((c) => {
        const incoming: { id: string }[] = parsed[c] ?? []
        const ids = new Set(incoming.map((r) => r.id))
        return [c, [...(data[c] as { id: string }[]).filter((r) => !ids.has(r.id)), ...incoming]]
      }))
      await replaceAll(merged as typeof data)
    } catch (e) {
      alert(`Import failed: ${(e as Error).message}`)
    }
  }

  return (
    <div className="view">
      <div className="view-head"><h1>Settings</h1></div>

      <section className="panel">
        <h2>Connection</h2>
        {DEMO_MODE ? (
          <p><span className="tag warn">Demo mode</span> Data is saved in this browser only. Connect Supabase (see the README) so you and JB share the same data.</p>
        ) : (
          <div className="row between wrap">
            <p><span className="tag ok">Shared</span> Signed in as <strong>{session?.user.email}</strong>. Changes sync live between you and JB.</p>
            <button className="btn" onClick={signOut}>Sign out</button>
          </div>
        )}
        {!DEMO_MODE && COLLECTIONS.every((c) => data[c].length === 0) && (
          <div className="row wrap">
            <p className="muted grow">The shared database is empty. Load the starter hashtag sets, goals (3,000 subscribers), viewer questions and to-dos?</p>
            <button className="btn primary" onClick={() => replaceAll(seedData())}>Load starter data</button>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>Content & episodes</h2>
        <ul className="plain">
          {data.contents.slice().sort((a, b) => a.created_at.localeCompare(b.created_at)).map((c) => (
            <li key={c.id} className="row between">
              <input className="grow" defaultValue={c.title} aria-label="Title" onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== c.title) upsert('contents', { ...c, title: v }) }} />
              <span className="muted small">{data.posts.filter((p) => p.content_id === c.id).length} posts</span>
              <button className="icon-btn tiny" aria-label="Delete" onClick={() => { if (confirm(`Delete "${c.title}"? Its posts stay, unlinked.`)) remove('contents', c.id) }}>✕</button>
            </li>
          ))}
        </ul>
        <form className="quick-add" onSubmit={async (e) => { e.preventDefault(); if (!title.trim()) return; await upsert('contents', { id: uid(), title: title.trim(), kind, notes: '', created_at: nowIso() }); setTitle('') }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Episode 3: Alamin Kung Nasaan Ka Ngayon" aria-label="New content title" />
          <select value={kind} onChange={(e) => setKind(e.target.value as Content['kind'])} aria-label="Type">
            <option value="episode">Episode</option><option value="reel">Reel</option><option value="promo">Promo</option><option value="other">Other</option>
          </select>
          <button className="btn primary">Add</button>
        </form>
      </section>

      <section className="panel">
        <h2>Goals</h2>
        {data.goals.map((g) => <GoalEdit key={g.id} g={g} onSave={(x) => upsert('goals', x)} onDelete={() => remove('goals', g.id)} />)}
        <button className="btn" onClick={() => upsert('goals', { id: uid(), label: 'New goal', platform: 'all', target: 1000, current: 0, updated_at: nowIso() })}>Add goal</button>
      </section>

      <section className="panel">
        <h2>Backup</h2>
        <p className="muted">Download everything as a JSON backup, or the posts as a spreadsheet (CSV).</p>
        <div className="row wrap">
          <button className="btn" onClick={exportJson}>Download backup (JSON)</button>
          <button className="btn" onClick={exportCsv}>Export posts (CSV)</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Import backup…</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = '' }} />
        </div>
      </section>
    </div>
  )
}

function GoalEdit({ g, onSave, onDelete }: { g: Goal; onSave: (g: Goal) => void; onDelete: () => void }) {
  return (
    <div className="row wrap goal-edit">
      <input className="grow" defaultValue={g.label} aria-label="Goal" onBlur={(e) => { if (e.target.value !== g.label) onSave({ ...g, label: e.target.value }) }} />
      <select value={g.platform} aria-label="Platform" onChange={(e) => onSave({ ...g, platform: e.target.value as Platform | 'all' })}>
        <option value="all">All</option>{PLATFORM_LIST.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
      </select>
      <label className="row tight">Target <input className="num" type="number" min={0} defaultValue={g.target} onBlur={(e) => { const v = Number(e.target.value) || 0; if (v !== g.target) onSave({ ...g, target: v }) }} /></label>
      <button className="icon-btn tiny" aria-label="Delete goal" onClick={() => { if (confirm('Delete this goal?')) onDelete() }}>✕</button>
    </div>
  )
}
