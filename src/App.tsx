import { useEffect, useState } from 'react'
import { DEMO_MODE } from './config'
import { useStore } from './store'
import { Dashboard } from './views/Dashboard'
import { PostsView } from './views/Posts'
import { CalendarView } from './views/Calendar'
import { TasksView } from './views/Tasks'
import { HashtagsView } from './views/Hashtags'
import { TimingView } from './views/Timing'
import { IdeasView } from './views/Ideas'
import { HowToView } from './views/HowTo'
import { SettingsView } from './views/Settings'
import { Login } from './views/Login'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { id: 'posts', label: 'Posts', icon: '📝' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'tasks', label: 'To-dos', icon: '✅' },
  { id: 'hashtags', label: 'Hashtags', icon: '#️⃣' },
  { id: 'timing', label: 'Best times', icon: '⏰' },
  { id: 'ideas', label: 'Ideas', icon: '💡' },
  { id: 'howto', label: 'How to post', icon: '📖' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
] as const
type TabId = (typeof TABS)[number]['id']

const fromHash = (): TabId => {
  const h = window.location.hash.replace(/^#\/?/, '')
  return (TABS.find((t) => t.id === h)?.id ?? 'dashboard') as TabId
}

export default function App() {
  const { ready, loading, error, data } = useStore()
  const [tab, setTab] = useState<TabId>(fromHash)

  useEffect(() => {
    const on = () => setTab(fromHash())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const go = (t: string) => { window.location.hash = `/${t}` }

  if (!ready) return <Login />

  const openTasks = data.tasks.filter((t) => !t.done).length

  return (
    <div className="app">
      <nav className="nav" aria-label="Main">
        <div className="brand"><span className="brand-mark">₱</span><span className="brand-text">Digital Profits <strong>Social Hub</strong></span></div>
        {TABS.map((t) => (
          <a key={t.id} href={`#/${t.id}`} className={`nav-item ${tab === t.id ? 'on' : ''}`} aria-current={tab === t.id ? 'page' : undefined}>
            <span className="nav-icon" aria-hidden>{t.icon}</span>
            <span className="nav-label">{t.label}</span>
            {t.id === 'tasks' && openTasks > 0 && <span className="count">{openTasks}</span>}
          </a>
        ))}
      </nav>
      <main className="main">
        {DEMO_MODE && <div className="banner">Demo mode: data is saved in this browser only. Connect Supabase to share it with JB.</div>}
        {error && <div className="banner error">{error}</div>}
        {loading ? <div className="empty">Loading…</div> : (
          <>
            {tab === 'dashboard' && <Dashboard go={go} />}
            {tab === 'posts' && <PostsView />}
            {tab === 'calendar' && <CalendarView />}
            {tab === 'tasks' && <TasksView />}
            {tab === 'hashtags' && <HashtagsView />}
            {tab === 'timing' && <TimingView />}
            {tab === 'ideas' && <IdeasView />}
            {tab === 'howto' && <HowToView />}
            {tab === 'settings' && <SettingsView />}
          </>
        )}
      </main>
    </div>
  )
}
