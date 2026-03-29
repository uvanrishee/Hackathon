import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, GraduationCap, ArrowRight, Network } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/UI'
import SynapticCanvas from '../components/SynapticCanvas'

export default function LoginPage() {
  const { login, loginWithGoogle, userProfile } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError]     = useState('')

  const redirect = (role) => navigate(role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      // onAuthStateChanged will update userProfile; wait briefly
      setTimeout(() => {
        const role = document.cookie.match(/role=([^;]+)/)?.[1] || 'student'
        navigate('/student/dashboard') // will redirect correctly via ProtectedRoute
      }, 800)
    } catch (err) {
      const msg = err.code === 'auth/wrong-password'     ? 'Incorrect password. Please try again.'
                : err.code === 'auth/user-not-found'     ? 'No account found with this email.'
                : err.code === 'auth/too-many-requests'  ? 'Too many attempts. Please try again later.'
                : err.code === 'auth/invalid-credential' ? 'Invalid email or password.'
                : 'Login failed. Please check your credentials.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      const user = await loginWithGoogle('student')
      redirect(user?.role || 'student')
    } catch (err) {
      setError('Google sign-in failed. Try email login.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Left panel */}
      <div style={{
        flex: '0 0 58%', position: 'relative', overflow: 'hidden',
        background: 'var(--bg-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }} className="hidden md:flex">
        <SynapticCanvas />
        <div style={{ textAlign: 'center', padding: '2rem', zIndex: 1 }}>
          <div style={{
            width: 120, height: 120,
            background: 'linear-gradient(135deg, var(--indigo), var(--cyan))',
            borderRadius: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem',
          }} className="animate-pulse-glow">
            <Network size={56} color="#fff" />
          </div>
          <h2 style={{ fontFamily: 'Clash Display', fontSize: 28, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Synapse <span className="gradient-text">Classroom</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 320, lineHeight: 1.7 }}>
            Where notes become knowledge, and learning becomes a team sport.
          </p>
          {/* Floating decorative cards */}
          <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            {['🧠 AI Notes Refiner', '🏆 Gamified Learning', '🔒 Anonymous Forum'].map(t => (
              <div key={t} className="glass-card animate-float" style={{ padding: '0.625rem 1.25rem', borderRadius: 999, fontSize: 13, color: 'var(--text-secondary)' }}>
                {t}
              </div>
            ))}
          </div>
        </div>
        {/* Gradient sphere */}
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        }} />
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <div style={{ width: '100%', maxWidth: 400 }} className="animate-slide-up">
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'Clash Display', fontSize: 28, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Welcome back</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Sign in to your Synapse account</p>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1.25rem',
              color: '#f87171', fontSize: 14,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input-field" style={{ paddingLeft: '2.5rem' }}
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input-field" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  type={showPw ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
              {loading ? <LoadingSpinner size={18} /> : <><span>Login</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(99,102,241,0.2)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(99,102,241,0.2)' }} />
          </div>

          <button onClick={handleGoogle} disabled={googleLoading} className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
            {googleLoading ? <LoadingSpinner size={18} /> : <>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>Continue with Google</span>
            </>}
          </button>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 14, color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--indigo-soft)', textDecoration: 'none', fontWeight: 500 }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
