import { useMemo, useState } from 'react'
import { DAY_NAMES, PLATFORMS, PLATFORM_LIST } from '../platforms'
import { useStore } from '../store'
import type { Platform } from '../types'
import { HOUR_BLOCKS, engagement, fmtDateTime, hourBlock, phParts, suggestSlots } from '../utils'
import { PlatformBadge } from '../components/ui'

const hourLabel = (h: number) => `${h % 12 || 12}${h < 12 || h === 24 ? 'a' : 'p'}`
const blockLabel = ([a, b]: readonly [number, number]) => `${hourLabel(a)}–${hourLabel(b)}`

export function TimingView() {
  const { data } = useStore()
  const [platform, setPlatform] = useState<Platform | ''>('')
  const [metric, setMetric] = useState<'views' | 'engagement'>('views')

  const posted = data.posts.filter((p) => p.status === 'posted' && p.posted_at && (!platform || p.platform === platform))
  const withData = posted.filter((p) => metric === 'views' ? p.metrics?.views != null : engagement(p) > 0)

  const grid = useMemo(() => {
    const g = Array.from({ length: 7 }, () => HOUR_BLOCKS.map(() => ({ sum: 0, n: 0 })))
    for (const p of withData) {
      const { day, hour } = phParts(p.posted_at!)
      const b = hourBlock(hour)
      if (b < 0) continue
      g[day][b].sum += metric === 'views' ? p.metrics.views ?? 0 : engagement(p)
      g[day][b].n++
    }
    return g
  }, [withData, metric])
  const max = Math.max(1, ...grid.flat().map((c) => (c.n ? c.sum / c.n : 0)))
  const best = grid.flatMap((row, d) => row.map((c, b) => ({ d, b, avg: c.n ? c.sum / c.n : 0, n: c.n }))).filter((x) => x.n).sort((a, b) => b.avg - a.avg).slice(0, 3)
  const order = [1, 2, 3, 4, 5, 6, 0]

  return (
    <div className="view">
      <div className="view-head"><h1>Best times</h1></div>
      <p className="muted">Starting points for a Philippine audience (Philippine time). Your own Insights below replace them once you have a few weeks of results.</p>

      <div className="cards">
        {PLATFORM_LIST.map((p) => (
          <article key={p.id} className="card">
            <header className="row between"><PlatformBadge platform={p.id} full /></header>
            <ul className="slots">
              {p.bestTimes.map((s, i) => (
                <li key={i}>
                  <strong>{s.days.length === 7 ? 'Every day' : s.days.map((d) => DAY_NAMES[d]).join(', ')}</strong> · {s.from}–{s.to}
                  <div className="muted small">{s.why}</div>
                </li>
              ))}
            </ul>
            <div className="muted small">Next open: {suggestSlots(p.id, data.posts.filter((x) => x.platform === p.id && x.scheduled_at).map((x) => x.scheduled_at!), 2).map(fmtDateTime).join(' · ') || '—'}</div>
          </article>
        ))}
      </div>

      <div className="view-head">
        <h2>Your insights</h2>
        <div className="row">
          <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform | '')} aria-label="Platform">
            <option value="">All platforms</option>
            {PLATFORM_LIST.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <select value={metric} onChange={(e) => setMetric(e.target.value as 'views' | 'engagement')} aria-label="Metric">
            <option value="views">Average views</option>
            <option value="engagement">Average engagement</option>
          </select>
        </div>
      </div>

      {withData.length < 3 ? (
        <div className="empty">
          Log results on at least 3 posted {platform ? PLATFORMS[platform].label + ' ' : ''}posts (open a post → Results) to see which days and times work best for you.
          <div className="muted small">{withData.length} of 3 so far. Engagement = likes + 2×comments + 3×shares + 2×saves.</div>
        </div>
      ) : (
        <>
          {best.length > 0 && <p><strong>Your best slots:</strong> {best.map((x) => `${DAY_NAMES[x.d]} ${blockLabel(HOUR_BLOCKS[x.b])} (${Math.round(x.avg).toLocaleString()}, ${x.n} post${x.n > 1 ? 's' : ''})`).join(' · ')}</p>}
          <div className="heat" role="table" aria-label="Average result by day and time">
            <div className="heat-row head" role="row"><span />{HOUR_BLOCKS.map((b) => <span key={b[0]} role="columnheader">{blockLabel(b)}</span>)}</div>
            {order.map((d) => (
              <div className="heat-row" role="row" key={d}>
                <span role="rowheader">{DAY_NAMES[d]}</span>
                {grid[d].map((c, b) => {
                  const avg = c.n ? c.sum / c.n : 0
                  return (
                    <span key={b} role="cell" className="heat-cell" style={{ ['--a' as string]: c.n ? 0.15 + 0.85 * (avg / max) : 0 }}
                      title={c.n ? `${Math.round(avg).toLocaleString()} avg · ${c.n} post(s)` : 'No posts'}>
                      {c.n ? Math.round(avg).toLocaleString() : ''}
                    </span>
                  )
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
