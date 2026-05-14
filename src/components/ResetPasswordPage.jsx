import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function ResetPasswordPage({ session }) {
  const [password, setPassword] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const updatePassword = async (event) => {
    event.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setNotice(error.message)
    } else {
      setNotice('Password updated. You can now log in.')
      setTimeout(() => navigate(session ? '/' : '/auth'), 900)
    }
    setLoading(false)
  }

  return (
    <main className="page auth-page">
      <form className="panel" onSubmit={updatePassword}>
        <h2>Set a new password</h2>
        <label>
          New password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={6} required />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update password'}
        </button>
        {notice && <p className="notice">{notice}</p>}
      </form>
    </main>
  )
}

export default ResetPasswordPage
