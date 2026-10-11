import { useState } from 'react'
import { PLATFORMS, PLATFORM_LIST, STATUSES } from '../platforms'
import { TEAM } from '../config'
import { nowIso, uid, useStore } from '../store'
import type { Metrics, Platform, Post, Task } from '../types'
import { checkCaption, composeCaption, fmtDateTime, fromLocalInput, inBestWindow, parseTags, suggestSlots, toLocalInput, todayKey, addDays } from '../utils'
import { CopyButton, Modal, PlatformBadge } from '../components/ui'

export function newPost(platform: Platform, content_id: string | null = null): Post {
  const info = PLATFORMS[platform]
  return {
    id: uid(), content_id, platform, format: info.formats[0], title: '', caption: '', hashtags: [], link: '',
    scheduled_at: null, posted_at: null, status: 'draft', assignee: TEAM[0],
    checklist: info.checklist.map((label) => ({ label, done: false })), metrics: {}, notes: '', updated_at: nowIso(),
  }
}

export function PostEditor({ post, onClose }: { post: Post; onClose: () => void }) {
  const { data, upsert, upsertMany, remove } = useStore()
  const [p, setP] = useState<Post>(post)
  const [tagText, setTagText] = useState(post.hashtags.join(' '))
  const [newItem, setNewItem] = useState('')
  const info = PLATFORMS[p.platform]
  const isNew = !data.posts.some((x) => x.id === post.id)
  const set = (patch: Partial<Post>) => setP((x) => ({ ...x, ...patch }))

  const taken = data.posts.filter((x) => x.platform === p.platform && x.id !== p.id && x.scheduled_at).map((x) => x.scheduled_at!)
  const slots = suggestSlots(p.platform, taken)
  const sets = data.hashtag_sets.filter((s) => s.platform === 'all' || s.platform === p.platform)
  const done = p.checklist.filter((c) => c.done).length

  function changePlatform(platform: Platform) {
    const i = PLATFORMS[platform]
    const kept = p.checklist.filter((c) => c.done)
    set({ platform, format: i.formats.includes(p.format) ? p.format : i.formats[0],
      checklist: [...kept, ...i.checklist.filter((l) => !kept.some((k) => k.label === l)).map((label) => ({ label, done: false }))] })
  }

  function addTags(tags: string[]) {
    const next = [...new Set([...parseTags(tagText), ...tags])]
    setTagText(next.join(' ')); set({ hashtags: next })
  }

  async function save(extra: Partial<Post> = {}) {
    const row = { ...p, ...extra, hashtags: parseTags(tagText), updated_at: nowIso() }
    if (row.scheduled_at && row.status !== 'posted' && (row.status === 'draft' || row.status === 'idea')) row.status = 'scheduled'
    await upsert('posts', row)
    return row
  }

  async function markPosted() {
    const posted_at = p.posted_at ?? nowIso()
    const row = await save({ status: 'posted', posted_at })
    // reminders to log results after 24 hours and 7 days
    const label = `${info.label}: ${row.title || row.caption.slice(0, 40) || 'post'}`
    const tasks: Task[] = [1, 7].map((d) => ({
      id: uid(), title: `Log ${d === 1 ? '24-hour' : '7-day'} results: ${label}`, done: false,
      due_date: addDays(todayKey(), d), assignee: row.assignee, priority: 'normal', post_id: row.id, notes: '', created_at: nowIso(),
    }))
    await upsertMany('tasks', tasks)
    onClose()
  }

  async function duplicateTo(platform: Platform) {
    await save()
    const base = { ...newPost(platform, p.content_id), title: p.title, caption: p.caption, hashtags: parseTags(tagText), link: p.link, notes: p.notes }
    await upsert('posts', base)
  }

  const metric = (k: keyof Metrics) => (
    <label className="field small">
      <span>{k}</span>
      <input type="number" min={0} inputMode="numeric" value={(p.metrics[k] as number | undefined) ?? ''}
        onChange={(e) => set({ metrics: { ...p.metrics, [k]: e.target.value === '' ? undefined : Number(e.target.value), checked_at: nowIso() } })} />
    </label>
  )

  return (
    <Modal title={isNew ? 'New post' : 'Edit post'} onClose={onClose} wide>
      <div className="editor">
        <div className="editor-main">
          <div className="row wrap">
            <label className="field">
              <span>Platform</span>
              <select value={p.platform} onChange={(e) => changePlatform(e.target.value as Platform)}>
                {PLATFORM_LIST.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Format</span>
              <select value={p.format} onChange={(e) => set({ format: e.target.value })}>
                {info.formats.map((f) => <option key={f}>{f}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Status</span>
              <select value={p.status} onChange={(e) => set({ status: e.target.value as Post['status'] })}>
                {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Assigned to</span>
              <select value={p.assignee} onChange={(e) => set({ assignee: e.target.value })}>
                {TEAM.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
          </div>

          <label className="field">
            <span>Content / episode</span>
            <select value={p.content_id ?? ''} onChange={(e) => set({ content_id: e.target.value || null })}>
              <option value="">— none —</option>
              {data.contents.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </label>

          <div className="field">
            <span>Schedule (Philippine time)</span>
            <div className="row wrap">
              <input type="datetime-local" value={toLocalInput(p.scheduled_at)} onChange={(e) => set({ scheduled_at: fromLocalInput(e.target.value) })} />
              {p.scheduled_at && (inBestWindow(p.platform, p.scheduled_at)
                ? <span className="hint ok">✓ In a best-time window</span>
                : <span className="hint warn">Outside the usual best times</span>)}
            </div>
            {slots.length > 0 && (
              <div className="chips">
                <span className="muted">Suggested:</span>
                {slots.map((s) => <button type="button" key={s} className="chip" onClick={() => set({ scheduled_at: s })}>{fmtDateTime(s)}</button>)}
              </div>
            )}
          </div>

          {info.titleLimit !== undefined && (
            <label className="field">
              <span>Title</span>
              <input value={p.title} maxLength={info.titleLimit + 50} onChange={(e) => set({ title: e.target.value })} />
            </label>
          )}

          <label className="field">
            <span>{info.captionLabel}</span>
            <textarea rows={7} value={p.caption} onChange={(e) => set({ caption: e.target.value })} />
          </label>

          <label className="field">
            <span>Hashtags</span>
            <input value={tagText} placeholder="#IponTips #DigitalProfitsPH" onChange={(e) => setTagText(e.target.value)} onBlur={() => set({ hashtags: parseTags(tagText) })} />
          </label>
          {sets.length > 0 && (
            <div className="chips">
              <span className="muted">Add set:</span>
              {sets.map((s) => <button type="button" key={s.id} className="chip" title={s.tags.join(' ')} onClick={() => addTags(s.tags)}>+ {s.name}</button>)}
            </div>
          )}
          <p className="hint">{info.hashtags.tip}</p>

          <label className="field">
            <span>Link</span>
            <input value={p.link} placeholder="https://" onChange={(e) => set({ link: e.target.value })} />
          </label>

          <div className="preview">
            <div className="row between">
              <strong>Ready-to-paste {info.captionLabel.toLowerCase()}</strong>
              <CopyButton text={composeCaption({ ...p, hashtags: parseTags(tagText) })} />
            </div>
            <pre>{composeCaption({ ...p, hashtags: parseTags(tagText) }) || '—'}</pre>
            <ul className="checks">
              {checkCaption({ ...p, hashtags: parseTags(tagText) }).map((c, i) => <li key={i} className={c.level}>{c.text}</li>)}
            </ul>
          </div>

          <label className="field">
            <span>Notes</span>
            <textarea rows={2} value={p.notes} onChange={(e) => set({ notes: e.target.value })} />
          </label>
        </div>

        <aside className="editor-side">
          <section>
            <h3>Checklist <span className="muted">{done}/{p.checklist.length}</span></h3>
            <ul className="checklist">
              {p.checklist.map((c, i) => (
                <li key={i}>
                  <label>
                    <input type="checkbox" checked={c.done} onChange={() => set({ checklist: p.checklist.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) })} />
                    <span>{c.label}</span>
                  </label>
                  <button className="icon-btn tiny" aria-label="Remove item" onClick={() => set({ checklist: p.checklist.filter((_, j) => j !== i) })}>✕</button>
                </li>
              ))}
            </ul>
            <form className="row" onSubmit={(e) => { e.preventDefault(); if (newItem.trim()) { set({ checklist: [...p.checklist, { label: newItem.trim(), done: false }] }); setNewItem('') } }}>
              <input value={newItem} placeholder="Add item" onChange={(e) => setNewItem(e.target.value)} />
              <button className="btn small">Add</button>
            </form>
          </section>

          <section>
            <h3>Tips for {info.label}</h3>
            <ul className="tips">{info.tips.map((t) => <li key={t}>{t}</li>)}</ul>
          </section>

          {(p.status === 'posted' || p.posted_at) && (
            <section>
              <h3>Results</h3>
              <div className="metrics">{(['views', 'likes', 'comments', 'shares', 'saves', 'follows'] as const).map(metric)}</div>
              {p.metrics.checked_at && <p className="hint">Updated {fmtDateTime(p.metrics.checked_at)}</p>}
            </section>
          )}

          <section>
            <h3>Cross-post</h3>
            <div className="chips">
              {PLATFORM_LIST.filter((x) => x.id !== p.platform).map((x) => (
                <button key={x.id} type="button" className="chip" onClick={() => duplicateTo(x.id)} title={`Copy to a new ${x.label} draft`}>
                  <PlatformBadge platform={x.id} /> copy
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <footer className="modal-foot">
        {!isNew && <button className="btn danger" onClick={async () => { if (confirm('Delete this post?')) { await remove('posts', p.id); onClose() } }}>Delete</button>}
        <span className="spacer" />
        {p.status !== 'posted' && <button className="btn" onClick={markPosted}>Mark as posted</button>}
        <button className="btn primary" onClick={async () => { await save(); onClose() }}>Save</button>
      </footer>
    </Modal>
  )
}
