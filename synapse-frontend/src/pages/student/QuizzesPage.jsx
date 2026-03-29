import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Brain, CheckCircle, Clock, Search, Filter } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import TopBar  from '../../components/TopBar'
import { GlassCard, LoadingSpinner } from '../../components/UI'
import { useAuth } from '../../contexts/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const DIFF_CONFIG = {
  basic:        { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   label: 'Basic' },
  intermediate: { color: '#22d3ee', bg: 'rgba(34,211,238,0.12)',  label: 'Intermediate' },
  advanced:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'Advanced' },
  expert:       { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: 'Expert' },
}

export default function QuizzesPage() {
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [quizzes, setQuizzes]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filterDiff, setFilterDiff] = useState('all')

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken()
        const res = await fetch(`${API}/student/quizzes`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) setQuizzes((await res.json()).quizzes || [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = quizzes.filter(q => {
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase()) ||
                        q.classroom_name.toLowerCase().includes(search.toLowerCase())
    const matchDiff   = filterDiff === 'all' || q.difficulty_level === filterDiff
    return matchSearch && matchDiff
  })

  const attempted = quizzes.filter(q => q.attempts_made > 0).length
  const pending   = quizzes.filter(q => q.attempts_made === 0).length

  if (loading) return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner size={40} />
      </div>
    </div>
  )

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content">
        <TopBar title="My Quizzes" subtitle="All quizzes assigned across your classrooms" />
        <main className="page-main" style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { icon: Zap,         label: 'Total Quizzes',   value: quizzes.length,  color: 'var(--indigo)' },
              { icon: CheckCircle, label: 'Completed',        value: attempted,        color: 'var(--success)' },
              { icon: Clock,       label: 'Pending',          value: pending,          color: 'var(--warning)' },
            ].map(({ icon: Icon, label, value, color }) => (
              <GlassCard key={label} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color={color} />
                </div>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>{label}</p>
                  <p style={{ fontFamily: 'Clash Display', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</p>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="input-field"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="Search quizzes or classrooms..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              {['all', 'basic', 'intermediate', 'advanced', 'expert'].map(d => (
                <button key={d} onClick={() => setFilterDiff(d)} style={{
                  padding: '0.4rem 0.875rem', borderRadius: 9999, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  background: filterDiff === d ? 'linear-gradient(135deg, var(--indigo), var(--cyan))' : 'var(--bg-secondary)',
                  color: filterDiff === d ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.2s', textTransform: 'capitalize',
                }}>{d === 'all' ? 'All' : d}</button>
              ))}
            </div>
          </div>

          {/* Quiz cards grid */}
          {filtered.length === 0 ? (
            <GlassCard style={{ textAlign: 'center', padding: '4rem' }}>
              <Brain size={52} color="var(--indigo-soft)" style={{ margin: '0 auto 1.5rem' }} />
              <h3 style={{ fontFamily: 'Clash Display', fontSize: 20, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {quizzes.length === 0 ? 'No Quizzes Yet' : 'No Results Found'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                {quizzes.length === 0
                  ? 'Your teachers haven\'t published any quizzes yet. Check back soon!'
                  : 'Try adjusting your search or filter.'}
              </p>
            </GlassCard>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {filtered.map(q => {
                const diff   = DIFF_CONFIG[q.difficulty_level] || DIFF_CONFIG.intermediate
                const done   = q.attempts_made > 0
                return (
                  <GlassCard key={q.id} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {/* Top accent bar */}
                    <div style={{ height: 4, background: done ? 'var(--success)' : `linear-gradient(90deg, var(--indigo), var(--cyan))` }} />

                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <h3 style={{ fontFamily: 'Clash Display', fontSize: 16, color: 'var(--text-primary)', flex: 1, lineHeight: 1.4 }}>{q.title}</h3>
                        {done && (
                          <span style={{ marginLeft: 8, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--success)', background: 'rgba(34,197,94,0.12)', padding: '2px 8px', borderRadius: 99 }}>
                            <CheckCircle size={11} /> Done
                          </span>
                        )}
                      </div>

                      {/* Meta */}
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <span style={{ fontSize: 11, background: diff.bg, color: diff.color, borderRadius: 6, padding: '2px 8px', textTransform: 'capitalize', fontWeight: 600 }}>
                          {diff.label}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Zap size={11} color="var(--indigo-soft)" /> {q.question_count} questions
                        </span>
                      </div>

                      {/* Classroom badge */}
                      <div style={{ marginBottom: '1rem', flex: 1 }}>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          📚 <span style={{ fontWeight: 500 }}>{q.classroom_name}</span> — {q.subject}
                        </p>
                        {q.description && (
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                            {q.description.slice(0, 80)}{q.description.length > 80 ? '...' : ''}
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                        <button
                          className={done ? 'btn-ghost' : 'btn-primary'}
                          style={{ flex: 1, justifyContent: 'center', fontSize: 13, padding: '0.5rem' }}
                          onClick={() => navigate(`/student/quiz/${q.id}`)}
                        >
                          <Brain size={14} />
                          {done ? `Retake (${q.attempts_made}×)` : 'Start Quiz'}
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
