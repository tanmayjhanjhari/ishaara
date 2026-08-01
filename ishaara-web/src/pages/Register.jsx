import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, Sparkles, AlertCircle } from 'lucide-react'
import { Button, Input } from '../components/ui'
import { useRegister } from '../api/auth'
import { useAuthStore } from '../store/authStore'

const PERKS = [
  'Real-time AI gesture scoring',
  '500+ ISL signs & conversational phrases',
  'XP, streaks, leagues & achievements',
  'No tutor needed, ever',
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_RE = /^[a-zA-Z0-9_]+$/

export default function Register() {
  const navigate      = useNavigate()
  const authStore     = useAuthStore()
  const registerMut   = useRegister()

  const [username,        setUsername]        = useState('')
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors,     setFieldErrors]     = useState({})
  const [serverError,     setServerError]     = useState('')

  function validate() {
    const errors = {}
    if (!username) errors.username = 'Username is required'
    else if (username.length < 3) errors.username = 'Username must be at least 3 characters'
    else if (username.length > 30) errors.username = 'Username must be at most 30 characters'
    else if (!USERNAME_RE.test(username)) errors.username = 'Only letters, numbers, and underscores'

    if (!email) errors.email = 'Email is required'
    else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address'

    if (!password) errors.password = 'Password is required'
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters'

    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password'
    else if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match'

    return errors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')

    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})

    try {
      const res = await registerMut.mutateAsync({
        username,
        email,
        password,
        confirm_password: confirmPassword,
      })
      authStore.login(res.data)
      navigate('/dashboard')
    } catch (err) {
      const msg = err?.response?.data?.message
      if (msg && typeof msg === 'object') {
        // Map DRF field errors to fieldErrors state
        setFieldErrors({
          username:        msg.username?.[0]        || '',
          email:           msg.email?.[0]           || '',
          password:        msg.password?.[0]        || '',
          confirmPassword: msg.confirm_password?.[0] || '',
        })
      } else {
        setServerError('Registration failed. Please try again.')
      }
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070714', display: 'flex', position: 'relative', overflow: 'hidden' }}>

      {/* Blobs */}
      <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', top: '-30%', left: '-15%', background: 'radial-gradient(circle, rgba(124,58,237,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', bottom: '-15%', right: '-5%', background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* ── Form side ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          <Link to="/" className="wordmark" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 40, fontSize: '1.8rem' }}>
            <span className="wordmark-i">i</span>shaara
          </Link>

          {/* Eyebrow */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 20 }}>
            <Sparkles size={12} color="#6EE7B7" />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6EE7B7' }}>Get instant access</span>
          </div>

          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '2rem', color: '#EEE9FF', marginBottom: 8, letterSpacing: '-0.02em' }}>
            Begin your journey
          </h1>
          <p style={{ color: '#7B7BA8', fontSize: '0.95rem', marginBottom: 32 }}>
            Start learning ISL today.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Username"
              name="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="your_username"
              icon={User}
              error={fieldErrors.username}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              icon={Mail}
              error={fieldErrors.email}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              icon={Lock}
              error={fieldErrors.password}
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              icon={Lock}
              error={fieldErrors.confirmPassword}
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
              disabled={registerMut.isPending}
            >
              {registerMut.isPending ? 'Creating account…' : 'Create free account'}
              {!registerMut.isPending && <ArrowRight size={18} className="ml-2" />}
            </Button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: '#7B7BA8' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#A78BFA', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>

      {/* ── Perks panel (right) ── */}
      <div style={{ flex: 1, display: 'none', flexDirection: 'column', justifyContent: 'center', padding: '64px 48px' }} className="md:flex">
        <div style={{ maxWidth: 360 }}>
          <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 800, fontSize: '1.6rem', color: '#EEE9FF', marginBottom: 32, letterSpacing: '-0.02em' }}>
            What you get<br />
            <span style={{ color: '#A78BFA' }}>from day one</span>
          </h2>
          {PERKS.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, animation: `fadeUp 0.6s ${i * 0.1}s ease-out both` }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 13, color: '#6EE7B7' }}>✓</span>
              </div>
              <span style={{ fontSize: '0.95rem', color: '#7B7BA8' }}>{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
