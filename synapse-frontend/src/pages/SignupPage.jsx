import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, BookOpen, User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { LoadingSpinner } from '../components/UI'
import SynapticCanvas from '../components/SynapticCanvas'

function PasswordStrength({ password }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length
  const colors = ['#ef4444', '#f59e0b', '#22c55e', '#06b6d4']
  const labels = ['Weak', 'Fair', 'Good', 'Strong']
  if (!password) return null
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < score ? colors[score - 1] : 'rgba(99,102,241,0.2)', transition: 'background 0.3s' }} />
        ))}
      </div>
      <p style={{ fontSize: 11, color: score > 0 ? colors[score - 1] : 'var(--text-muted)' }}>{labels[score - 1] || ''}</p>
    </div>
  )
}

export default function SignupPage() {
  const { register, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]         = useState(1) // 1: role, 2: details
  const [role, setRole]         = useState('')
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const redirect = (r) => navigate(r === 'teacher' ? '/teacher/dashboard' : '/student/dashboard')

  const handleSignup = async (e) => {
    e.preventDefault()
    if (password !== confirmPw) return setError('Passwords do not match.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    setError(''); setLoading(true)
    try {
      const user = await register(email, password, name, role)
      redirect(user?.role || role)
    } catch (err) {
      setError(err.code === 'auth/email-already-in-use' ? 'An account with this email already exists.' : 'Sign up failed. Please try again.')
    } finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    if (!role) return setError('Please select your role first.')
    setError(''); setLoading(true)
    try {
      const user = await loginWithGoogle(role)
      redirect(user?.role || role)
    } catch { setError('Google sign-in failed.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Left decorative panel */}
      <div style={{
        flex: '0 0 42%', background: 'var(--bg-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }} className="hidden md:flex">
        <SynapticCanvas />
        <div style={{ textAlign: 'center', padding: '2rem', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'Clash Display', fontSize: 24, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Join <span className="gradient-text">Synapse Classroom</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 280, lineHeight: 1.7 }}>
            Start your journey toward smarter, collaborative, AI-powered learning today.
          </p>
          {/* Step indicator */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '2.5rem' }}>
            {[1,2].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: step >= s ? 'linear-gradient(135deg, var(--indigo), var(--cyan))' : 'var(--bg-tertiary)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 600, color: '#fff',
                  transition: 'background 0.3s',
                }}>
                  {step > s ? <Check size={14} /> : s}
                </div>
                {s < 2 && <div style={{ width: 40, height: 1, background: step > s ? 'var(--cyan)' : 'rgba(99,102,241,0.2)', transition: 'background 0.3s' }} />}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            Step {step} of 2: {step === 1 ? 'Choose your role' : 'Create your account'}
          </p>
        </div>
        <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <div style={{ width: '100%', maxWidth: 420 }} className="animate-slide-up">

          {/* Step 1: Role selection */}
          {step === 1 && (
            <div>
              <h1 style={{ fontFamily: 'Clash Display', fontSize: 28, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>I am a...</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: '2rem' }}>Select your role to get the right experience</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                  { r: 'student', icon: BookOpen, emoji: '📚', label: 'Student', desc: 'Learn, take quizzes, collaborate with peers' },
                  { r: 'teacher', icon: GraduationCap, emoji: '🎓', label: 'Teacher', desc: 'Create classrooms, upload content, track progress' },
                ].map(({ r, icon: Icon, emoji, label, desc }) => (
                  <button key={r} onClick={() => setRole(r)} style={{
                    background: role === r ? 'rgba(99,102,241,0.15)' : 'var(--bg-secondary)',
                    border: role === r ? '2px solid var(--indigo)' : '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 16, padding: '1.25rem', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.2s',
                    boxShadow: role === r ? '0 0 20px rgba(99,102,241,0.2)' : 'none',
                  }}>
                    <span style={{ fontSize: 28, display: 'block', marginBottom: '0.5rem' }}>{emoji}</span>
                    <p style={{ fontFamily: 'Clash Display', fontSize: 16, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{label}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</p>
                    {role === r && <div style={{ marginTop: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--indigo-soft)', fontSize: 12 }}><Check size={12} /> Selected</div>}
                  </button>
                ))}
              </div>
              {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: '1rem' }}>{error}</p>}
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                disabled={!role} onClick={() => role && setStep(2)}>
                Continue <ArrowRight size={16} />
              </button>
              <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 14, color: 'var(--text-secondary)' }}>
                Already have an account? <Link to="/login" style={{ color: 'var(--indigo-soft)', textDecoration: 'none' }}>Login</Link>
              </p>
            </div>
          )}

          {/* Step 2: Account details */}
          {step === 2 && (
            <div>
              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: 13, marginBottom: '1.5rem' }}>
                <ArrowLeft size={14} /> Back
              </button>
              <h1 style={{ fontFamily: 'Clash Display', fontSize: 26, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Create your account</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: '1.5rem' }}>
                Signing up as a <span className={`badge ${role === 'teacher' ? 'badge-above' : 'badge-cyan'}`}>{role === 'teacher' ? '🎓 Teacher' : '📚 Student'}</span>
              </p>

              {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1rem', color: '#f87171', fontSize: 14 }}>{error}</div>}

              <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[
                  { icon: User, label: 'Full Name', type: 'text', val: name, set: setName, placeholder: 'Your full name' },
                  { icon: Mail, label: 'Email', type: 'email', val: email, set: setEmail, placeholder: 'you@example.com' },
                ].map(({ icon: Icon, label, type, val, set, placeholder }) => (
                  <div key={label}>
                    <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>{label}</label>
                    <div style={{ position: 'relative' }}>
                      <Icon size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input className="input-field" style={{ paddingLeft: '2.5rem' }} type={type} value={val} onChange={e => set(e.target.value)} placeholder={placeholder} required />
                    </div>
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input-field" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                      type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required />
                    <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <PasswordStrength password={password} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input-field" style={{ paddingLeft: '2.5rem' }}
                      type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat password" required />
                  </div>
                </div>
                <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.25rem', justifyContent: 'center' }}>
                  {loading ? <LoadingSpinner size={18} /> : <><span>Create Account</span><ArrowRight size={16} /></>}
                </button>
              </form>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(99,102,241,0.2)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>OR</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(99,102,241,0.2)' }} />
              </div>
              <button onClick={handleGoogle} disabled={loading} className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Continue with Google
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
