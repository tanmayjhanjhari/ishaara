import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import HandConstellation from '../components/ui/HandConstellation'
import { Button, Input } from '../components/ui'
import { useLogin } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { useQueryClient } from '@tanstack/react-query'
import { useSessionStore } from '../store/sessionStore'
import { useStreakStore } from '../store/streakStore'

export default function Login() {
  const navigate    = useNavigate()
  const authStore   = useAuthStore()
  const loginMut    = useLogin()

  const queryClient = useQueryClient()

  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [serverError, setServerError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    try {
      const res = await loginMut.mutateAsync({ email, password })
      
      // Clear React Query cache & session state to prevent cross-account contamination
      queryClient.clear()
      useSessionStore.getState().resetSession()
      useStreakStore.setState({ currentStreak: 0, longestStreak: 0, lastActiveDate: null, isStreakDay: false })

      authStore.login(res.data)
      navigate('/dashboard')
    } catch (err) {
      const data = err?.response?.data
      if (data?.message?.non_field_errors) {
        setServerError(data.message.non_field_errors[0])
      } else if (data?.message?.detail) {
        setServerError(data.message.detail)
      } else {
        setServerError('Invalid email or password. Please try again.')
      }
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070714', display: 'flex', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient blobs */}
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', top: '-20%', right: '-10%', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', bottom: '-10%', left: '-5%', background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* ── Left: decorative panel ── */}
      <div style={{ flex: 1, display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48 }} className="md:flex">
        <HandConstellation size={280} style={{ animation: 'float 5s ease-in-out infinite', marginBottom: 32 }} />
        <p style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.4rem', color: '#EEE9FF', textAlign: 'center' }}>
          Your hands are<br />
          <span style={{ color: '#A78BFA' }}>already the language.</span>
        </p>
      </div>

      {/* ── Right: form ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Wordmark */}
          <Link to="/" className="wordmark" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 40, fontSize: '1.8rem' }}>
            <span className="wordmark-i">i</span>shaara
          </Link>

          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '2rem', color: '#EEE9FF', marginBottom: 8, letterSpacing: '-0.02em' }}>
            Welcome back
          </h1>
          <p style={{ color: '#7B7BA8', fontSize: '0.95rem', marginBottom: 36 }}>
            Sign in to continue learning.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              icon={Mail}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={Lock}
              required
            />

            {serverError && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px', borderRadius: 12,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              }}>
                <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: '#EF4444' }}>{serverError}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              disabled={loginMut.isPending}
            >
              {loginMut.isPending ? 'Signing in…' : 'Sign In'}
              {!loginMut.isPending && <ArrowRight size={18} className="ml-2" />}
            </Button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: '#7B7BA8' }}>
            New to <span style={{ color: '#EEE9FF' }}>ishaara</span>?{' '}
            <Link to="/register" style={{ color: '#A78BFA', fontWeight: 600, textDecoration: 'none' }}>
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
