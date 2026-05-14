import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const requestReset = async (event) => {
    event.preventDefault()
    setLoading(true)
    setNotice('')

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setNotice('If an account exists for this email, a password reset link will be sent.')
    setLoading(false)
  }

  return (
    <main className="auth-shell">
      <div className="auth-gradient" />
      <div className="auth-card-wrap">
        <form className="panel auth-panel" onSubmit={requestReset}>
          <div className="auth-logo-wrap">
            <img className="auth-logo" src="/pickleball-icon.jpg" alt="PicklePulse icon" />
          </div>
          <p className="auth-eyebrow">PicklePulse</p>
          <h2>Forgot Password</h2>
          <p className="auth-subtitle">Enter your email and we will send reset instructions if an account exists.</p>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
          <p className="auth-toggle">
            Back to <Link className="link-btn" to="/auth">Log in</Link>
          </p>
          {notice && <p className="notice notice-success">{notice}</p>}
        </form>
      </div>
    </main>
  )
}

export default ForgotPasswordPage
