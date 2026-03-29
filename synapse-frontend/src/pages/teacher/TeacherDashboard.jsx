import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Users, Zap, BarChart2, Plus, Copy, Check, Clock, UserPlus, FileText } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import TopBar  from '../../components/TopBar'
import { StatCard, GlassCard, LoadingSpinner } from '../../components/UI'
import { useAuth } from '../../contexts/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function CreateClassroomModal({ onClose, onCreated }) {
  const { getToken } = useAuth()
  const [name, setName]     = useState('')
  const [subject, setSubject] = useState('')
  const [desc, setDesc]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const token = await getToken()
      const res   = await fetch(`${API}/classrooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, subject, description: desc }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      onCreated(data.classroom)
      onClose()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div className="glass-card animate-slide-up" style={{ width: '100%', maxWidth: 480, padding: '2rem' }}>
        <h2 style={{ fontFamily: 'Clash Display', fontSize: 22, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Create New Classroom</h2>
        {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: '1rem' }}>{error}</p>}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { label: 'Classroom Name *', val: name, set: setName, ph: 'e.g. Physics — Batch A', req: true },
            { label: 'Subject *', val: subject, set: setSubject, ph: 'e.g. Physics', req: true },
            { label: 'Description', val: desc, set: setDesc, ph: 'Optional description', req: false },
          ].map(({ label, val, set, ph, req }) => (
            <div key={label}>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>{label}</label>
              <input className="input-field" value={val} onChange={e => set(e.target.value)} placeholder={ph} required={req} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
              {loading ? <LoadingSpinner size={16} /> : 'Create Classroom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ClassroomCard({ classroom }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(classroom.join_code); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const colors = ['#6366f1', '#22d3ee', '#f59e0b', '#22c55e', '#ec4899', '#8b5cf6']
  const accent = colors[classroom.id % colors.length]

  return (
    <div className="glass-card animate-slide-up" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ height: 5, background: accent }} />
      <div style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <h3 style={{ fontFamily: 'Clash Display', fontSize: 17, color: 'var(--text-primary)' }}>{classroom.name}</h3>
          <span className="badge badge-cyan" style={{ fontSize: 11 }}>{classroom.subject}</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', margin: '0.75rem 0', fontSize: 13, color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={13} /> {classroom.student_count || 0} students</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FileText size={13} /> {classroom.material_count || 0} materials</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Zap size={13} /> {classroom.quiz_count || 0} quizzes</span>
        </div>
        {/* Join code */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: 10, padding: '0.5rem 0.875rem', marginBottom: '0.75rem' }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 15, fontWeight: 600, color: 'var(--cyan)', flex: 1, letterSpacing: '0.15em' }}>
            {classroom.join_code}
          </span>
          <button onClick={copy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--success)' : 'var(--text-muted)' }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/teacher/classroom/${classroom.id}`} style={{ flex: 1 }}>
            <button className="btn-ghost" style={{ width: '100%', fontSize: 12, padding: '0.4rem 0.75rem', justifyContent: 'center' }}>Manage</button>
          </Link>
          <Link to={`/teacher/quiz-generator?classroom=${classroom.id}`} style={{ flex: 1 }}>
            <button className="btn-primary" style={{ width: '100%', fontSize: 12, padding: '0.4rem 0.75rem', justifyContent: 'center' }}>
              <Zap size={12} /> Quiz
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function TeacherDashboard() {
  const { getToken, userProfile } = useAuth()
  const [classrooms, setClassrooms] = useState([])
  const [stats, setStats]           = useState({ classrooms: 0, students: 0, quizzes: 0, avg_score: 0 })
  const [activity, setActivity]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)

  const load = async () => {
    try {
      const token = await getToken()
      const [cRes, sRes] = await Promise.all([
        fetch(`${API}/classrooms`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/analytics/summary`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (cRes.ok) setClassrooms((await cRes.json()).classrooms || [])
      if (sRes.ok) { const d = await sRes.json(); setStats(d.stats || {}); setActivity(d.recent || []) }
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const statsRow = [
    { icon: BookOpen, label: 'Classrooms', value: stats.classrooms ?? classrooms.length, color: 'var(--indigo)' },
    { icon: Users,    label: 'Total Students', value: stats.students ?? 0, color: 'var(--cyan)' },
    { icon: Zap,      label: 'Quizzes Created', value: stats.quizzes ?? 0, color: 'var(--warning)' },
    { icon: BarChart2,label: 'Avg Quiz Score', value: stats.avg_score ? `${Math.round(stats.avg_score)}%` : '—', color: 'var(--success)' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>
        <TopBar />
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {statsRow.map(s => <StatCard key={s.label} {...s} />)}
          </div>

          {/* Main layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

            {/* Classrooms grid */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontFamily: 'Clash Display', fontSize: 20, color: 'var(--text-primary)' }}>Active Classrooms</h2>
                <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: 13 }} onClick={() => setShowModal(true)}>
                  <Plus size={15} /> New Classroom
                </button>
              </div>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><LoadingSpinner size={36} /></div>
              ) : classrooms.length === 0 ? (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                  <BookOpen size={40} color="var(--indigo-soft)" style={{ margin: '0 auto 1rem' }} />
                  <h3 style={{ fontFamily: 'Clash Display', fontSize: 18, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No classrooms yet</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: '1.5rem' }}>Create your first classroom to get started</p>
                  <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Create Classroom</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {classrooms.map(c => <ClassroomCard key={c.id} classroom={c} />)}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div>
              <h2 style={{ fontFamily: 'Clash Display', fontSize: 20, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Recent Activity</h2>
              <GlassCard style={{ padding: '1rem' }}>
                {activity.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '1rem' }}>No recent activity</p>
                ) : activity.map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem 0', borderBottom: i < activity.length - 1 ? '1px solid rgba(99,102,241,0.1)' : 'none' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan)', flexShrink: 0, marginTop: 6 }} />
                    <div>
                      <p style={{ fontSize: 13, color: 'var(--text-primary)' }}>{a.text}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={11} /> {a.time_ago}
                      </p>
                    </div>
                  </div>
                ))}
              </GlassCard>
            </div>
          </div>
        </main>
      </div>
      {showModal && <CreateClassroomModal onClose={() => setShowModal(false)} onCreated={c => setClassrooms(p => [c, ...p])} />}
    </div>
  )
}
