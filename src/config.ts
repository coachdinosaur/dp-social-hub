// Supabase project settings. The anon key is meant to be public: Row Level Security in supabase/schema.sql
// limits every table to the emails in `members`. Leave both empty to run in local demo mode (browser storage only).
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const DEMO_MODE = !SUPABASE_URL || !SUPABASE_ANON_KEY

export const TEAM = ['Ronaldo', 'JB']
export const TIMEZONE = 'Asia/Manila'
