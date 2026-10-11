import { useMemo, useState } from 'react'
import { TEAM } from '../config'
import { nowIso, uid, useStore } from '../store'
import type { Task } from '../types'
import { addDays, fmtDate, todayKey, weekKeys } from '../utils'
import { Empty, Modal } from '../components/ui'

// JB's weekly rhythm: 1 long video, 3 reels, community engagement
const WEEKLY: { title: string; day: number; who: string; priority?: Task['priority'] }[] = [
  { title: 'Finalize this week\'s episode (script, audio, build)', day: 0, who: 'Ronaldo', priority: 'high' },
  { title: 'Upload the long video to YouTube (+ FB native)', day: 2, who: 'JB', priority: 'high' },
  { title: 'Reel 1: trailer for the episode (TikTok, IG, Shorts, FB)', day: 1, who: 'Ronaldo' },
  { title: 'Reel 2 (TikTok, IG, Shorts, FB)', day: 3, who: 'Ronaldo' },
  { title: 'Reel 3 (TikTok, IG, Shorts, FB)', day: 5, who: 'Ronaldo' },
  { title: 'Community post / poll using the episode question', day: 4, who: 'JB' },
  { title: 'Reply to comments (all platforms)', day: 3, who: 'JB' },
  { title: 'Reply to comments + save good viewer questions to Ideas', day: 6, who: 'JB' },
  { title: 'Update goals (subscribers / followers) and log results', day: 6, who: 'Ronaldo' },
]

export function TasksView() {
  const { data, upsert, upsertMany, remove } = useStore()
  const [title, setTitle] = useState('')
  const [assignee, setAssignee] = useState(TEAM[0])
  const [due, setDue] = useState('')
  const [who, setWho] = useState('')
  const [showDone, setShowDone] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const today = todayKey()

  const groups = useMemo(() => {
    const open = data.tasks.filter((t) => !t.done && (!who || t.assignee === who))
    const byDue = (a: Task, b: Task) => (a.due_date ?? '9').localeCompare(b.due_date ?? '9') || (a.priority === 'high' ? -1 : 0) - (b.priority === 'high' ? -1 : 0)
    return [
      { name: 'Overdue', cls: 'overdue', items: open.filter((t) => t.due_date && t.due_date < today).sort(byDue) },
      { name: 'Today', cls: 'today', items: open.filter((t) => t.due_date === today).sort(byDue) },
      { name: 'Upcoming', cls: '', items: open.filter((t) => t.due_date && t.due_date > today).sort(byDue) },
      { name: 'No date', cls: '', items: open.filter((t) => !t.due_date).sort(byDue) },
    ]
  }, [data.tasks, who, today])
  const doneList = data.tasks.filter((t) => t.done && (!who || t.assignee === who))

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await upsert('tasks', { id: uid(), title: title.trim(), done: false, due_date: due || null, assignee, priority: 'normal', post_id: null, notes: '', created_at: nowIso() })
    setTitle(''); setDue('')
  }

  async function planWeek() {
    const days = weekKeys(today)
    const existing = new Set(data.tasks.map((t) => `${t.title}|${t.due_date}`))
    const rows: Task[] = WEEKLY.map((w) => ({ id: uid(), title: w.title, done: false, due_date: days[w.day], assignee: w.who, priority: w.priority ?? 'normal', post_id: null, notes: '', created_at: nowIso() }))
      .filter((t) => !existing.has(`${t.title}|${t.due_date}`))
    if (!rows.length) { alert('This week is already planned.'); return }
    await upsertMany('tasks', rows)
  }

  const item = (t: Task) => (
    <li key={t.id} className={`task pr-${t.priority} ${t.done ? 'done' : ''}`}>
      <label>
        <input type="checkbox" checked={t.done} onChange={() => upsert('tasks', { ...t, done: !t.done })} />
        <span>{t.title}</span>
      </label>
      <span className="task-meta">
        {t.priority === 'high' && <span className="tag high">High</span>}
        <span className="tag">{t.assignee}</span>
        {t.due_date && <span className="muted">{t.due_date === today ? 'Today' : t.due_date === addDays(today, 1) ? 'Tomorrow' : fmtDate(t.due_date)}</span>}
        <button className="icon-btn tiny" aria-label="Edit" onClick={() => setEditing(t)}>✎</button>
      </span>
    </li>
  )

  return (
    <div className="view">
      <div className="view-head">
        <h1>To-dos</h1>
        <div className="row">
          <select value={who} onChange={(e) => setWho(e.target.value)} aria-label="Show tasks for">
            <option value="">Everyone</option>{TEAM.map((t) => <option key={t}>{t}</option>)}
          </select>
          <button className="btn" onClick={planWeek} title="Adds the weekly rhythm: 1 long video, 3 reels, community posts">Plan this week</button>
        </div>
      </div>

      <form className="quick-add" onSubmit={add}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a to-do…" aria-label="New to-do" />
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)} aria-label="Assign to">{TEAM.map((t) => <option key={t}>{t}</option>)}</select>
        <input type="date" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due date" />
        <button className="btn primary">Add</button>
      </form>

      {groups.every((g) => !g.items.length) && <Empty>All done. 🎉</Empty>}
      {groups.filter((g) => g.items.length).map((g) => (
        <section key={g.name} className={`task-group ${g.cls}`}>
          <h2>{g.name} <span className="muted">{g.items.length}</span></h2>
          <ul className="tasks">{g.items.map(item)}</ul>
        </section>
      ))}

      <button className="btn ghost" onClick={() => setShowDone(!showDone)}>{showDone ? 'Hide' : 'Show'} completed ({doneList.length})</button>
      {showDone && <ul className="tasks">{doneList.map(item)}</ul>}

      {editing && (
        <Modal title="Edit to-do" onClose={() => setEditing(null)}>
          <TaskForm task={editing} onSave={async (t) => { await upsert('tasks', t); setEditing(null) }} onDelete={async () => { await remove('tasks', editing.id); setEditing(null) }} />
        </Modal>
      )}
    </div>
  )
}

function TaskForm({ task, onSave, onDelete }: { task: Task; onSave: (t: Task) => void; onDelete: () => void }) {
  const [t, setT] = useState(task)
  return (
    <>
      <label className="field"><span>Title</span><input value={t.title} onChange={(e) => setT({ ...t, title: e.target.value })} /></label>
      <div className="row wrap">
        <label className="field"><span>Assigned to</span><select value={t.assignee} onChange={(e) => setT({ ...t, assignee: e.target.value })}>{TEAM.map((x) => <option key={x}>{x}</option>)}</select></label>
        <label className="field"><span>Due</span><input type="date" value={t.due_date ?? ''} onChange={(e) => setT({ ...t, due_date: e.target.value || null })} /></label>
        <label className="field"><span>Priority</span>
          <select value={t.priority} onChange={(e) => setT({ ...t, priority: e.target.value as Task['priority'] })}>
            <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option>
          </select>
        </label>
      </div>
      <label className="field"><span>Notes</span><textarea rows={3} value={t.notes} onChange={(e) => setT({ ...t, notes: e.target.value })} /></label>
      <footer className="modal-foot">
        <button className="btn danger" onClick={() => { if (confirm('Delete this to-do?')) onDelete() }}>Delete</button>
        <span className="spacer" />
        <button className="btn primary" onClick={() => onSave(t)}>Save</button>
      </footer>
    </>
  )
}
