import { useEffect, useState, type ReactNode } from 'react'
import { PLATFORMS, STATUSES } from '../platforms'
import type { Platform, PostStatus } from '../types'
import { copyText } from '../utils'

export function PlatformBadge({ platform, full = false }: { platform: Platform; full?: boolean }) {
  const p = PLATFORMS[platform]
  return (
    <span className="pbadge" style={{ ['--pc' as string]: p.color }}>
      <span className="pdot" />{full ? p.label : p.short}
    </span>
  )
}

export function StatusPill({ status }: { status: PostStatus }) {
  return <span className={`status s-${status}`}>{STATUSES.find((s) => s.id === status)?.label}</span>
}

export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function CopyButton({ text, label = 'Copy', className = '' }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button type="button" className={`btn small ${className}`} onClick={async () => { if (await copyText(text)) { setDone(true); setTimeout(() => setDone(false), 1200) } }}>
      {done ? 'Copied ✓' : label}
    </button>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>
}

export function Progress({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div style={{ width: `${pct}%` }} />
    </div>
  )
}
