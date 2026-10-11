import { useState } from 'react'
import { useStore } from '../store'
import type { Post } from '../types'
import { addDays, fmtDate, fmtTime, phParts, todayKey, weekKeys } from '../utils'
import { PlatformBadge } from '../components/ui'
import { PostEditor, newPost } from './PostEditor'

export function CalendarView() {
  const { data } = useStore()
  const [anchor, setAnchor] = useState(todayKey())
  const [editing, setEditing] = useState<Post | null>(null)
  const days = weekKeys(anchor)
  const today = todayKey()

  const byDay = (key: string) => data.posts
    .map((p) => ({ p, when: p.status === 'posted' ? p.posted_at : p.scheduled_at }))
    .filter((x) => x.when && phParts(x.when).dateKey === key)
    .sort((a, b) => a.when!.localeCompare(b.when!))

  const unscheduled = data.posts.filter((p) => !p.scheduled_at && p.status !== 'posted').length

  return (
    <div className="view">
      <div className="view-head">
        <h1>Calendar</h1>
        <div className="row">
          <button className="btn" onClick={() => setAnchor(addDays(anchor, -7))} aria-label="Previous week">←</button>
          <button className="btn" onClick={() => setAnchor(today)}>This week</button>
          <button className="btn" onClick={() => setAnchor(addDays(anchor, 7))} aria-label="Next week">→</button>
        </div>
      </div>
      <p className="muted">{fmtDate(days[0])} – {fmtDate(days[6])} · Philippine time{unscheduled ? ` · ${unscheduled} unscheduled draft${unscheduled > 1 ? 's' : ''} in Posts` : ''}</p>

      <div className="week">
        {days.map((key) => (
          <section key={key} className={`day ${key === today ? 'today' : ''}`}>
            <header>
              <span>{fmtDate(key)}</span>
              <button className="icon-btn tiny" aria-label={`Add post on ${fmtDate(key)}`}
                onClick={() => setEditing({ ...newPost('youtube'), scheduled_at: new Date(`${key}T19:00:00+08:00`).toISOString(), status: 'scheduled' })}>＋</button>
            </header>
            {byDay(key).map(({ p, when }) => (
              <button key={p.id} className={`cal-item st-${p.status}`} onClick={() => setEditing(p)}>
                <span className="row tight"><PlatformBadge platform={p.platform} /><span className="muted">{fmtTime(when!)}</span></span>
                <span className="cal-title">{p.title || p.caption.split('\n')[0] || p.format}</span>
              </button>
            ))}
          </section>
        ))}
      </div>
      {editing && <PostEditor post={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
