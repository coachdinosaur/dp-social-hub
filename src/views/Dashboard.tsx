import { useState } from 'react'
import { PLATFORMS } from '../platforms'
import { nowIso, useStore } from '../store'
import type { Goal, Post } from '../types'
import { addDays, fmtDate, phParts, todayKey, weekKeys } from '../utils'
import { Empty, PlatformBadge, Progress } from '../components/ui'
import { PostRow } from './Posts'
import { PostEditor } from './PostEditor'

export function Dashboard({ go }: { go: (tab: string) => void }) {
  const { data, upsert } = useStore()
  const [editing, setEditing] = useState<Post | null>(null)
  const today = todayKey()
  const week = weekKeys(today)
  const inWeek = (iso: string | null) => !!iso && week.includes(phParts(iso).dateKey)

  const upcoming = data.posts.filter((p) => p.status !== 'posted' && p.scheduled_at && p.scheduled_at >= nowIso()).sort((a, b) => a.scheduled_at!.localeCompare(b.scheduled_at!)).slice(0, 6)
  const postedWeek = data.posts.filter((p) => p.status === 'posted' && inWeek(p.posted_at)).length
  const scheduledWeek = data.posts.filter((p) => p.status !== 'posted' && inWeek(p.scheduled_at)).length
  const openTasks = data.tasks.filter((t) => !t.done)
  const dueToday = openTasks.filter((t) => t.due_date && t.due_date <= today)

  // things that need a look
  const soon = new Date(Date.now() + 24 * 3600 * 1000).toISOString()
  const attention = [
    ...data.posts.filter((p) => p.status !== 'posted' && p.scheduled_at && p.scheduled_at < nowIso()).map((p) => ({ p, why: 'Scheduled time has passed. Posted? Mark it.' })),
    ...data.posts.filter((p) => p.status !== 'posted' && p.scheduled_at && p.scheduled_at >= nowIso() && p.scheduled_at <= soon && p.checklist.some((c) => !c.done))
      .map((p) => ({ p, why: `Goes out within 24 h, checklist ${p.checklist.filter((c) => c.done).length}/${p.checklist.length}` })),
    ...data.posts.filter((p) => p.status === 'posted' && p.posted_at && p.posted_at < addDays(today, -1) && p.metrics?.views == null).map((p) => ({ p, why: 'No results logged yet' })),
    ...data.posts.filter((p) => p.status === 'ready' && !p.scheduled_at).map((p) => ({ p, why: 'Ready but not scheduled' })),
  ].slice(0, 6)

  return (
    <div className="view">
      <div className="view-head"><h1>Dashboard</h1><span className="muted">{fmtDate(today)} · Philippine time</span></div>

      <div className="stats">
        <button className="stat" onClick={() => go('calendar')}><span className="stat-n">{scheduledWeek}</span><span>scheduled this week</span></button>
        <button className="stat" onClick={() => go('posts')}><span className="stat-n">{postedWeek}</span><span>posted this week</span></button>
        <button className="stat" onClick={() => go('tasks')}><span className={`stat-n ${dueToday.length ? 'warn' : ''}`}>{dueToday.length}</span><span>to-dos due</span></button>
        <button className="stat" onClick={() => go('tasks')}><span className="stat-n">{openTasks.length}</span><span>open to-dos</span></button>
      </div>

      <div className="grid2">
        <section className="panel">
          <h2>Coming up</h2>
          {upcoming.length ? <div className="post-list">{upcoming.map((p) => <PostRow key={p.id} p={p} onOpen={() => setEditing(p)} />)}</div>
            : <Empty>Nothing scheduled. Use <button className="link" onClick={() => go('posts')}>Cross-post set</button> to plan the next episode.</Empty>}
        </section>

        <section className="panel">
          <h2>Needs attention</h2>
          {attention.length ? (
            <ul className="attention">
              {attention.map(({ p, why }, i) => (
                <li key={i}><button className="link-row" onClick={() => setEditing(p)}><PlatformBadge platform={p.platform} /> <span>{p.title || p.caption.split('\n')[0] || p.format}</span><span className="muted small">{why}</span></button></li>
              ))}
            </ul>
          ) : <Empty>All clear ✓</Empty>}
        </section>

        <section className="panel">
          <h2>Today's to-dos</h2>
          {dueToday.length ? (
            <ul className="tasks">
              {dueToday.map((t) => (
                <li key={t.id} className="task">
                  <label><input type="checkbox" checked={t.done} onChange={() => upsert('tasks', { ...t, done: !t.done })} /><span>{t.title}</span></label>
                  <span className="task-meta"><span className="tag">{t.assignee}</span>{t.due_date! < today && <span className="tag high">Overdue</span>}</span>
                </li>
              ))}
            </ul>
          ) : <Empty>Nothing due today.</Empty>}
        </section>

        <section className="panel">
          <h2>Goals</h2>
          {data.goals.map((g) => <GoalRow key={g.id} g={g} onSave={(x) => upsert('goals', x)} />)}
        </section>
      </div>
      {editing && <PostEditor post={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function GoalRow({ g, onSave }: { g: Goal; onSave: (g: Goal) => void }) {
  const [edit, setEdit] = useState(false)
  const [v, setV] = useState(String(g.current))
  return (
    <div className="goal">
      <div className="row between">
        <span>{g.platform !== 'all' && <PlatformBadge platform={g.platform} />} {g.label}</span>
        {edit ? (
          <form className="row tight" onSubmit={(e) => { e.preventDefault(); onSave({ ...g, current: Number(v) || 0, updated_at: nowIso() }); setEdit(false) }}>
            <input className="num" type="number" min={0} value={v} onChange={(e) => setV(e.target.value)} autoFocus aria-label="Current" />
            <button className="btn small">Save</button>
          </form>
        ) : (
          <button className="link" onClick={() => { setV(String(g.current)); setEdit(true) }} title="Update">
            {g.current.toLocaleString()} / {g.target.toLocaleString()}
          </button>
        )}
      </div>
      <Progress value={g.current} max={g.target} />
      {g.platform !== 'all' && <span className="muted small">{PLATFORMS[g.platform].label} · updated {fmtDate(phParts(g.updated_at).dateKey)}</span>}
    </div>
  )
}
