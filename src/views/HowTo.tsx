import { useState } from 'react'
import { PLATFORM_LIST, PLATFORMS } from '../platforms'
import { AFTER, ALWAYS, BEFORE, GUIDES, type Guide } from '../howto'
import type { Platform } from '../types'
import { PlatformBadge } from '../components/ui'

export function GuideSteps({ guide }: { guide: Guide }) {
  return (
    <>
      <p className="muted small">{guide.where}</p>
      <ol className="steps">{guide.steps.map((s) => <li key={s}>{s}</li>)}</ol>
      {guide.note && <p className="hint">{guide.note}</p>}
    </>
  )
}

export function HowToView() {
  const [platform, setPlatform] = useState<Platform>('facebook')
  return (
    <div className="view">
      <div className="view-head"><h1>How to post</h1></div>
      <p className="muted">Step by step for each platform. Every post starts and ends the same way in the Hub.</p>

      <div className="cards">
        <article className="card">
          <h3>1 · Before you post</h3>
          <ol className="steps">{BEFORE.map((s) => <li key={s}>{s}</li>)}</ol>
        </article>
        <article className="card">
          <h3>Always</h3>
          <ul className="tips">{ALWAYS.map((s) => <li key={s}>{s}</li>)}</ul>
        </article>
      </div>

      <div className="view-head"><h2>2 · Post it</h2></div>
      <div className="tabs" role="tablist" aria-label="Platform">
        {PLATFORM_LIST.map((p) => (
          <button key={p.id} role="tab" aria-selected={platform === p.id} className={platform === p.id ? 'on' : ''} onClick={() => setPlatform(p.id)}>
            <PlatformBadge platform={p.id} full />
          </button>
        ))}
      </div>
      <div className="cards guides">
        {GUIDES[platform].map((g) => (
          <article key={g.format} className="card">
            <h3>{PLATFORMS[platform].label} · {g.format}</h3>
            <GuideSteps guide={g} />
          </article>
        ))}
      </div>

      <div className="cards">
        <article className="card">
          <h3>3 · After you post</h3>
          <ol className="steps">{AFTER.map((s) => <li key={s}>{s}</li>)}</ol>
        </article>
      </div>
    </div>
  )
}
