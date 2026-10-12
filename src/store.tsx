import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js'
import { DEMO_MODE, SUPABASE_ANON_KEY, SUPABASE_URL } from './config'
import type { CollectionName, Collections } from './types'
import { seedData } from './seed'

export const COLLECTIONS: CollectionName[] = ['contents', 'posts', 'tasks', 'hashtag_sets', 'ideas', 'goals']

type Data = { [K in CollectionName]: Collections[K][] }
const empty = (): Data => ({ contents: [], posts: [], tasks: [], hashtag_sets: [], ideas: [], goals: [] })

export const supabase: SupabaseClient | null = DEMO_MODE ? null : createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const LS_KEY = 'dp-social-hub:data'
function loadLocal(): Data {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return { ...empty(), ...JSON.parse(raw) }
  } catch { /* storage blocked or corrupt: start from the seed */ }
  return seedData()
}
function saveLocal(d: Data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(d)) } catch { /* ignore */ }
}

export const uid = () => crypto.randomUUID()
export const nowIso = () => new Date().toISOString()

interface StoreValue {
  data: Data
  loading: boolean
  error: string | null
  session: Session | null
  ready: boolean // demo mode, or signed in
  upsert: <K extends CollectionName>(c: K, row: Collections[K]) => Promise<void>
  upsertMany: <K extends CollectionName>(c: K, rows: Collections[K][]) => Promise<void>
  remove: (c: CollectionName, id: string) => Promise<void>
  replaceAll: (d: Data) => Promise<void>
  reload: (quiet?: boolean) => Promise<void>
  signOut: () => Promise<void>
}

const Ctx = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(() => (DEMO_MODE ? loadLocal() : empty()))
  const [loading, setLoading] = useState(!DEMO_MODE)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  // quiet: refetch in the background without swapping the page for "Loading…" (which unmounts the open view)
  const reload = useCallback(async (quiet = false) => {
    if (!supabase) return
    if (!quiet) setLoading(true)
    const next = empty()
    for (const c of COLLECTIONS) {
      const { data: rows, error } = await supabase.from(c).select('*')
      if (error) { setError(`${c}: ${error.message}`); setLoading(false); return }
      ;(next as Record<string, unknown[]>)[c] = rows ?? []
    }
    if (!quiet) setError(null)
    setData(next); setLoading(false)
  }, [])

  // load after sign-in, then keep in sync: realtime changes from the other person + refetch when the tab regains focus
  useEffect(() => {
    if (!supabase || !session) return
    reload()
    const ch = supabase.channel('all-changes')
    for (const c of COLLECTIONS) {
      ch.on('postgres_changes', { event: '*', schema: 'public', table: c }, (p) => {
        setData((d) => {
          const list = d[c] as { id: string }[]
          if (p.eventType === 'DELETE') return { ...d, [c]: list.filter((r) => r.id !== (p.old as { id: string }).id) }
          const row = p.new as { id: string }
          return { ...d, [c]: list.some((r) => r.id === row.id) ? list.map((r) => (r.id === row.id ? row : r)) : [...list, row] }
        })
      })
    }
    ch.subscribe()
    const onFocus = () => reload(true)
    window.addEventListener('focus', onFocus)
    return () => { supabase!.removeChannel(ch); window.removeEventListener('focus', onFocus) }
  }, [session, reload])

  const commitLocal = useCallback((fn: (d: Data) => Data) => {
    setData((d) => { const n = fn(d); if (DEMO_MODE) saveLocal(n); return n })
  }, [])

  const upsertMany = useCallback(async <K extends CollectionName>(c: K, rows: Collections[K][]) => {
    if (!rows.length) return
    commitLocal((d) => {
      const list = d[c] as Collections[K][]
      const ids = new Set(rows.map((r) => r.id))
      return { ...d, [c]: [...list.filter((r) => !ids.has(r.id)), ...rows] }
    })
    if (supabase) {
      const { error } = await supabase.from(c).upsert(rows)
      if (error) { setError(`Save failed (${c}): ${error.message}`); reload(true) }
    }
  }, [commitLocal, reload])

  const upsert = useCallback(<K extends CollectionName>(c: K, row: Collections[K]) => upsertMany(c, [row]), [upsertMany])

  const remove = useCallback(async (c: CollectionName, id: string) => {
    commitLocal((d) => ({ ...d, [c]: (d[c] as { id: string }[]).filter((r) => r.id !== id) }))
    if (supabase) {
      const { error } = await supabase.from(c).delete().eq('id', id)
      if (error) { setError(`Delete failed (${c}): ${error.message}`); reload(true) }
    }
  }, [commitLocal, reload])

  const replaceAll = useCallback(async (d: Data) => {
    if (!supabase) { saveLocal(d); setData(d); return }
    let failed = ''
    for (const c of COLLECTIONS) {
      const rows = (d[c] ?? []) as { id: string }[]
      if (rows.length) {
        const { error } = await supabase.from(c).upsert(rows)
        if (error) { failed = `${c}: ${error.message}`; break }
      }
    }
    if (failed) setError(`Import failed (${failed})`)
    await reload(true)
    if (failed) throw new Error(failed)
  }, [reload])

  const signOut = useCallback(async () => { if (supabase) await supabase.auth.signOut() }, [])

  const value = useMemo<StoreValue>(() => ({
    data, loading, error, session, ready: DEMO_MODE || !!session,
    upsert, upsertMany, remove, replaceAll, reload, signOut,
  }), [data, loading, error, session, upsert, upsertMany, remove, replaceAll, reload, signOut])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore outside StoreProvider')
  return v
}
