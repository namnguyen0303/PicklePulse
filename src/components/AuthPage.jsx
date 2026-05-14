import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const submitAuth = async (event) => {
    event.preventDefault()
    setLoading(true)
    setNotice('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setNotice(error.message)
    } else {
      setNotice('Logged in successfully.')
    }
    setLoading(false)
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) setNotice(error.message)
  }

  return (
    <main className="auth-shell">
      <div className="auth-gradient" />
      <div className="auth-card-wrap">
        <form className="panel auth-panel" onSubmit={submitAuth}>
          <div className="auth-logo-wrap">
            <img className="auth-logo" src="/pickleball-icon.jpg" alt="PicklePulse icon" />
          </div>
          <p className="auth-eyebrow">PicklePulse</p>
          <h2>Log In</h2>
          <p className="auth-subtitle">Share drills, match takeaways, and tips with other pickleball fans.</p>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label>
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} required />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : 'Log in'}
          </button>
          <Link className="subtle-btn auth-forgot" to="/forgot-password">Forgot password?</Link>
          <div className="oauth-row">
            <button type="button" className="oauth-google" onClick={signInWithGoogle}>
              Continue with Google
            </button>
          </div>
          <p className="auth-toggle">
            Need an account? <Link className="link-btn" to="/signup">Sign up</Link>
          </p>
          {notice && <p className="notice">{notice}</p>}
        </form>
      </div>
    </main>
  )
}

export default AuthPage
