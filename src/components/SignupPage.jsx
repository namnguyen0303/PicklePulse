import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const submitSignup = async (event) => {
    event.preventDefault()
    setLoading(true)
    setNotice('')

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setNotice(error.message)
    } else {
      navigate('/auth', { replace: true })
    }
    setLoading(false)
  }

  return (
    <main className="auth-shell">
      <div className="auth-gradient" />
      <div className="auth-card-wrap">
        <form className="panel auth-panel" onSubmit={submitSignup}>
          <div className="auth-logo-wrap">
            <img className="auth-logo" src="/pickleball-icon.jpg" alt="PicklePulse icon" />
          </div>
          <p className="auth-eyebrow">PicklePulse</p>
          <h2>Create Account</h2>
          <p className="auth-subtitle">Create your account to start posting in the pickleball forum.</p>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label>
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} required />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
          <p className="auth-toggle">
            Already have an account? <Link className="link-btn" to="/auth">Log in</Link>
          </p>
          {notice && <p className="notice">{notice}</p>}
        </form>
      </div>
    </main>
  )
}

export default SignupPage
