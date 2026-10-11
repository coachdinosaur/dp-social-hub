import { TIMEZONE } from './config'
import { PLATFORMS } from './platforms'
import type { Platform, Post } from './types'

// ---------- Philippine time (UTC+8, no DST) ----------
const PH_OFFSET_MIN = 8 * 60

/** ISO instant -> "YYYY-MM-DDTHH:MM" in PH time, for <input type="datetime-local">. */
export function toLocalInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(new Date(iso).getTime() + PH_OFFSET_MIN * 60000)
  return d.toISOString().slice(0, 16)
}

/** "YYYY-MM-DDTHH:MM" typed in PH time -> ISO instant. */
export function fromLocalInput(v: string): string | null {
  return v ? new Date(`${v}:00+08:00`).toISOString() : null
}

/** Parts of an instant as seen in PH: weekday (0 = Sun), hour, date key. */
export function phParts(iso: string) {
  const d = new Date(new Date(iso).getTime() + PH_OFFSET_MIN * 60000)
  return { day: d.getUTCDay(), hour: d.getUTCHours(), minute: d.getUTCMinutes(), dateKey: d.toISOString().slice(0, 10) }
}

export function todayKey() {
  return phParts(new Date().toISOString()).dateKey
}

export function fmtDateTime(iso: string | null) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-PH', { timeZone: TIMEZONE, weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(iso))
}

export function fmtDate(key: string | null) {
  if (!key) return '—'
  return new Intl.DateTimeFormat('en-PH', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(`${key}T00:00:00Z`))
}

export function fmtTime(iso: string) {
  return new Intl.DateTimeFormat('en-PH', { timeZone: TIMEZONE, hour: 'numeric', minute: '2-digit' }).format(new Date(iso))
}

/** Monday 00:00 PH of the week containing `iso`, as a date key, plus the 7 date keys. */
export function weekKeys(anchorKey: string) {
  const d = new Date(`${anchorKey}T00:00:00Z`)
  const dow = (d.getUTCDay() + 6) % 7 // 0 = Monday
  d.setUTCDate(d.getUTCDate() - dow)
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d); x.setUTCDate(d.getUTCDate() + i)
    return x.toISOString().slice(0, 10)
  })
}

export function addDays(key: string, n: number) {
  const d = new Date(`${key}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

// ---------- best-time suggestions ----------
/** Next few recommended posting slots (start of each window) for a platform, from now on, skipping taken slots. */
export function suggestSlots(platform: Platform, taken: string[] = [], count = 3): string[] {
  const out: string[] = []
  const takenSet = new Set(taken.map((t) => t.slice(0, 16)))
  const start = todayKey()
  const nowMs = Date.now()
  for (let i = 0; i < 14 && out.length < count; i++) {
    const key = addDays(start, i)
    const day = new Date(`${key}T00:00:00Z`).getUTCDay()
    for (const s of PLATFORMS[platform].bestTimes) {
      if (!s.days.includes(day)) continue
      const iso = new Date(`${key}T${s.from}:00+08:00`).toISOString()
      if (new Date(iso).getTime() > nowMs + 30 * 60000 && !takenSet.has(iso.slice(0, 16))) out.push(iso)
      if (out.length >= count) break
    }
  }
  return out.sort()
}

/** Is a scheduled instant inside one of the platform's recommended windows? */
export function inBestWindow(platform: Platform, iso: string) {
  const { day, hour, minute } = phParts(iso)
  const m = hour * 60 + minute
  return PLATFORMS[platform].bestTimes.some((s) => {
    const [fh, fm] = s.from.split(':').map(Number), [th, tm] = s.to.split(':').map(Number)
    return s.days.includes(day) && m >= fh * 60 + fm && m <= th * 60 + tm
  })
}

// ---------- captions & hashtags ----------
export function normalizeTag(t: string) {
  const s = t.trim().replace(/^#+/, '').replace(/\s+/g, '')
  return s ? `#${s}` : ''
}

export function parseTags(text: string) {
  return [...new Set(text.split(/[\s,]+/).map(normalizeTag).filter(Boolean))]
}

/** Caption + hashtags laid out the way each platform expects. */
export function composeCaption(p: Pick<Post, 'platform' | 'caption' | 'hashtags' | 'link'>) {
  const tags = p.hashtags.join(' ')
  const parts = [p.caption.trim()]
  if (p.link && p.platform !== 'instagram' && p.platform !== 'tiktok' && p.platform !== 'x') parts.push(p.link)
  if (tags) parts.push(tags)
  return parts.filter(Boolean).join('\n\n')
}

export interface CaptionCheck { level: 'ok' | 'warn' | 'error'; text: string }

export function checkCaption(p: Pick<Post, 'platform' | 'title' | 'caption' | 'hashtags' | 'link'>): CaptionCheck[] {
  const info = PLATFORMS[p.platform]
  const out: CaptionCheck[] = []
  const full = composeCaption(p)
  const len = [...full].length
  out.push({ level: len > info.captionLimit ? 'error' : 'ok', text: `${info.captionLabel}: ${len.toLocaleString()} / ${info.captionLimit.toLocaleString()} characters` })
  if (info.titleLimit) {
    const tl = [...p.title].length
    out.push({ level: tl > info.titleLimit ? 'error' : tl === 0 ? 'warn' : 'ok', text: `Title: ${tl} / ${info.titleLimit}` })
  }
  const n = p.hashtags.length, [lo, hi] = info.hashtags.recommended
  if (info.hashtags.max && n > info.hashtags.max) out.push({ level: 'error', text: `${n} hashtags: over the limit of ${info.hashtags.max}` })
  else if (n < lo || n > hi) out.push({ level: 'warn', text: `${n} hashtags (recommended ${lo}–${hi})` })
  else out.push({ level: 'ok', text: `${n} hashtags` })
  if (p.platform === 'instagram' && [...p.caption].length > 125) out.push({ level: 'ok', text: 'Only the first 125 characters show before "more": make them the hook' })
  if ((p.platform === 'instagram' || p.platform === 'tiktok') && /https?:\/\//.test(p.caption)) out.push({ level: 'warn', text: 'Links in captions are not clickable here. Use "link in bio".' })
  if (/referral|ref link|promo code|invite code/i.test(full) && !/disclos|may reward|affiliate/i.test(full)) out.push({ level: 'warn', text: 'Referral link mentioned: add a disclosure ("puwede akong makakuha ng reward")' })
  return out
}

// ---------- insights ----------
export function engagement(p: Post) {
  const m = p.metrics || {}
  return (m.likes ?? 0) + (m.comments ?? 0) * 2 + (m.shares ?? 0) * 3 + (m.saves ?? 0) * 2
}

export const HOUR_BLOCKS = [[6, 9], [9, 12], [12, 15], [15, 18], [18, 21], [21, 24]] as const
export function hourBlock(h: number) {
  const i = HOUR_BLOCKS.findIndex(([a, b]) => h >= a && h < b)
  return i
}

// ---------- files ----------
export function download(name: string, text: string, type = 'application/json') {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type }))
  a.download = name; a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return ''
  const cols = Object.keys(rows[0])
  const esc = (v: unknown) => { const s = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s }
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n')
}

export async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); return true } catch { return false }
}
