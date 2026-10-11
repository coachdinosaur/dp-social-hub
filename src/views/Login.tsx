import { useState } from 'react'
import { supabase } from '../store'

export function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setBusy(true); setErr('')
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: window.location.origin + window.location.pathname } })
    setBusy(false)
    if (error) setErr(error.message); else setSent(true)
  }

  return (
    <div className="login">
      <div className="login-card">
        <div className="brand big"><span className="brand-mark">₱</span> Digital Profits <strong>Social Hub</strong></div>
        {sent ? (
          <p>Check <strong>{email}</strong> for a sign-in link. Open it on this device.</p>
        ) : (
          <form onSubmit={send}>
            <label className="field">
              <span>Email</span>
              <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gmail.com" />
            </label>
            <button className="btn primary block" disabled={busy}>{busy ? 'Sending…' : 'Email me a sign-in link'}</button>
            {err && <p className="error">{err}</p>}
            <p className="muted small">Only team members can see the data.</p>
          </form>
        )}
      </div>
    </div>
  )
}
