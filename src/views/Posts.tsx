import { useMemo, useState } from 'react'
import { PLATFORMS, PLATFORM_LIST, STATUSES } from '../platforms'
import { TEAM } from '../config'
import { nowIso, uid, useStore } from '../store'
import type { Content, Platform, Post } from '../types'
import { fmtDateTime, suggestSlots } from '../utils'
import { Empty, Modal, PlatformBadge, StatusPill } from '../components/ui'
import { PostEditor, newPost } from './PostEditor'

export function PostRow({ p, onOpen }: { p: Post; onOpen: () => void }) {
  const { data } = useStore()
  const done = p.checklist.filter((c) => c.done).length
  const content = data.contents.find((c) => c.id === p.content_id)
  return (
    <button className="post-row" onClick={onOpen}>
      <PlatformBadge platform={p.platform} />
      <span className="post-main">
        <span className="post-title">{p.title || p.caption.split('\n')[0] || <em className="muted">Untitled {p.format.toLowerCase()}</em>}</span>
        <span className="post-sub muted">{p.format}{content ? ` · ${content.title}` : ''} · {p.assignee}</span>
      </span>
      <span className="post-when">{p.status === 'posted' ? fmtDateTime(p.posted_at) : fmtDateTime(p.scheduled_at)}</span>
      <span className="post-check muted" title="Checklist">{done}/{p.checklist.length}</span>
      <StatusPill status={p.status} />
    </button>
  )
}

export function PostsView() {
  const { data } = useStore()
  const [editing, setEditing] = useState<Post | null>(null)
  const [crossPost, setCrossPost] = useState(false)
  const [platform, setPlatform] = useState<Platform | ''>('')
  const [status, setStatus] = useState<string>('')
  const [content, setContent] = useState('')
  const [who, setWho] = useState('')
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return data.posts
      .filter((p) => (!platform || p.platform === platform) && (!status || p.status === status) && (!content || p.content_id === content) && (!who || p.assignee === who))
      .filter((p) => !s || [p.title, p.caption, p.notes, ...p.hashtags].join(' ').toLowerCase().includes(s))
      .sort((a, b) => {
        const ka = a.status === 'posted' ? '2' + (b.posted_at ?? '') : a.scheduled_at ? '0' + a.scheduled_at : '1' + a.updated_at
        const kb = b.status === 'posted' ? '2' + (a.posted_at ?? '') : b.scheduled_at ? '0' + b.scheduled_at : '1' + b.updated_at
        return ka.localeCompare(kb)
      })
  }, [data.posts, platform, status, content, who, q])

  return (
    <div className="view">
      <div className="view-head">
        <h1>Posts</h1>
        <div className="row">
          <button className="btn" onClick={() => setCrossPost(true)}>Cross-post set</button>
          <button className="btn primary" onClick={() => setEditing(newPost('youtube'))}>New post</button>
        </div>
      </div>

      <div className="filters">
        <input type="search" placeholder="Search captions, titles, hashtags" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform | '')} aria-label="Platform">
          <option value="">All platforms</option>
          {PLATFORM_LIST.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select value={content} onChange={(e) => setContent(e.target.value)} aria-label="Content">
          <option value="">All content</option>
          {data.contents.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <select value={who} onChange={(e) => setWho(e.target.value)} aria-label="Assigned to">
          <option value="">Everyone</option>
          {TEAM.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      {list.length ? (
        <div className="post-list">{list.map((p) => <PostRow key={p.id} p={p} onOpen={() => setEditing(p)} />)}</div>
      ) : <Empty>No posts match. Create one, or build a cross-post set from an episode.</Empty>}

      {editing && <PostEditor post={editing} onClose={() => setEditing(null)} />}
      {crossPost && <CrossPostModal onClose={() => setCrossPost(false)} />}
    </div>
  )
}

const DEFAULT_SET: Platform[] = ['youtube', 'youtube_shorts', 'tiktok', 'instagram', 'facebook', 'x']

function CrossPostModal({ onClose }: { onClose: () => void }) {
  const { data, upsert, upsertMany } = useStore()
  const [contentId, setContentId] = useState(data.contents[0]?.id ?? '__new')
  const [newTitle, setNewTitle] = useState('')
  const [kind, setKind] = useState<Content['kind']>('episode')
  const [picked, setPicked] = useState<Platform[]>(DEFAULT_SET)
  const [caption, setCaption] = useState('')
  const [autoSchedule, setAutoSchedule] = useState(true)
  const [assignee, setAssignee] = useState(TEAM[0])

  async function create() {
    let cid = contentId
    if (cid === '__new') {
      if (!newTitle.trim()) return
      const c: Content = { id: uid(), title: newTitle.trim(), kind, notes: '', created_at: nowIso() }
      await upsert('contents', c); cid = c.id
    }
    const title = data.contents.find((c) => c.id === cid)?.title ?? newTitle
    const used: string[] = data.posts.filter((p) => p.scheduled_at).map((p) => p.scheduled_at!)
    const brand = data.hashtag_sets.find((s) => s.name.startsWith('Brand'))?.tags ?? []
    const rows = picked.map((pl) => {
      const p = newPost(pl, cid)
      const slot = autoSchedule ? suggestSlots(pl, used, 1)[0] : undefined
      if (slot) used.push(slot)
      return { ...p, title: PLATFORMS[pl].titleLimit ? title : '', caption, hashtags: brand.slice(0, PLATFORMS[pl].hashtags.recommended[1]),
        scheduled_at: slot ?? null, status: slot ? 'scheduled' as const : 'draft' as const, assignee }
    })
    await upsertMany('posts', rows)
    onClose()
  }

  return (
    <Modal title="Cross-post set" onClose={onClose}>
      <p className="muted">One piece of content → a draft for each platform, each with its own checklist{autoSchedule ? ' and the next best-time slot' : ''}.</p>
      <label className="field">
        <span>Content</span>
        <select value={contentId} onChange={(e) => setContentId(e.target.value)}>
          {data.contents.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          <option value="__new">+ New content…</option>
        </select>
      </label>
      {contentId === '__new' && (
        <div className="row wrap">
          <label className="field grow"><span>Title</span><input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Episode 3: Alamin Kung Nasaan Ka Ngayon" /></label>
          <label className="field"><span>Type</span>
            <select value={kind} onChange={(e) => setKind(e.target.value as Content['kind'])}>
              <option value="episode">Episode</option><option value="reel">Reel</option><option value="promo">Promo</option><option value="other">Other</option>
            </select>
          </label>
        </div>
      )}
      <fieldset className="field">
        <legend>Platforms</legend>
        <div className="chips">
          {PLATFORM_LIST.map((p) => (
            <label key={p.id} className={`chip toggle ${picked.includes(p.id) ? 'on' : ''}`}>
              <input type="checkbox" checked={picked.includes(p.id)} onChange={() => setPicked((x) => (x.includes(p.id) ? x.filter((y) => y !== p.id) : [...x, p.id]))} />
              <PlatformBadge platform={p.id} full />
            </label>
          ))}
        </div>
      </fieldset>
      <label className="field"><span>Base caption (edit per platform later)</span><textarea rows={4} value={caption} onChange={(e) => setCaption(e.target.value)} /></label>
      <div className="row wrap">
        <label className="field"><span>Assigned to</span>
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>{TEAM.map((t) => <option key={t}>{t}</option>)}</select>
        </label>
        <label className="check-inline"><input type="checkbox" checked={autoSchedule} onChange={(e) => setAutoSchedule(e.target.checked)} /> Schedule each in its next best-time slot</label>
      </div>
      <footer className="modal-foot">
        <span className="spacer" />
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn primary" disabled={!picked.length || (contentId === '__new' && !newTitle.trim())} onClick={create}>Create {picked.length} drafts</button>
      </footer>
    </Modal>
  )
}
