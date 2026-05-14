import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { supabase } from './lib/supabase'
import AuthPage from './components/AuthPage'
import CreatePostPage from './components/CreatePostPage'
import ForgotPasswordPage from './components/ForgotPasswordPage'
import HomePage from './components/HomePage'
import LoadingIndicator from './components/LoadingIndicator'
import PostPage from './components/PostPage'
import ResetPasswordPage from './components/ResetPasswordPage'
import SignupPage from './components/SignupPage'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [bootstrapping, setBootstrapping] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (!mounted) return
      if (error) {
        console.error(error)
      } else {
        setSession(data.session)
      }
      setBootstrapping(false)
    }

    loadSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  if (bootstrapping) {
    return <LoadingIndicator label="Loading PicklePulse..." />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage session={session} />} />
        <Route path="/auth" element={session ? <Navigate to="/" replace /> : <AuthPage />} />
        <Route path="/signup" element={session ? <Navigate to="/" replace /> : <SignupPage />} />
        <Route path="/forgot-password" element={session ? <Navigate to="/" replace /> : <ForgotPasswordPage />} />
        <Route path="/" element={session ? <HomePage /> : <Navigate to="/auth" replace />} />
        <Route path="/create" element={session ? <CreatePostPage session={session} /> : <Navigate to="/auth" replace />} />
        <Route path="/posts/:postId" element={session ? <PostPage session={session} /> : <Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
