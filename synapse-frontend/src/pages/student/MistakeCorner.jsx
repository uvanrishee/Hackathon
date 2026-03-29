import { useState, useEffect } from 'react'
import { AlertTriangle, Tag, RefreshCw, Star, HelpCircle, Trash2 } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import TopBar  from '../../components/TopBar'
import { GlassCard, LoadingSpinner, Badge } from '../../components/UI'
import { useAuth } from '../../contexts/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function MistakeCorner() {
  const { getToken } = useAuth()
  const [mistakes, setMistakes] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken()
        const res   = await fetch(`${API}/student/mistakes`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) setMistakes((await res.json()).mistakes || [])
      } catch (err) { console.error('Error fetching mistakes', err) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleResolve = async (id) => {
    try {
      const token = await getToken()
      const res = await fetch(`${API}/student/mistakes/${id}/resolve`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        setMistakes(prev => prev.filter(m => m.id !== id))
      }
    } catch (e) { console.error(e) }
  }

  const handleDelete = async (id) => {
    try {
      const token = await getToken()
      const res = await fetch(`${API}/student/mistakes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        setMistakes(prev => prev.filter(m => m.id !== id))
      }
    } catch (e) { console.error(e) }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>
        <TopBar title="Mistake Corner" subtitle="Your customized bank of difficult concepts to conquer." />
        <main style={{ flex: 1, padding: '2rem', maxWidth: 900, margin: '0 auto', width: '100%' }}>

          <GlassCard style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(245,158,11,0.05))', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={32} color="var(--danger)" />
              </div>
              <div>
                <h2 style={{ fontFamily: 'Clash Display', fontSize: 24, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Embrace the Errors</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Every mistake logged here is an opportunity to learn. Review them regularly before real exams.</p>
              </div>
            </div>
          </GlassCard>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><LoadingSpinner size={32} /></div>
          ) : mistakes.length === 0 ? (
            <GlassCard style={{ textAlign: 'center', padding: '4rem' }}>
              <Star size={44} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
              <h3 style={{ fontFamily: 'Clash Display', fontSize: 20, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>You're Perfect (for now)!</h3>
              <p style={{ color: 'var(--text-secondary)' }}>You don't have any logged mistakes yet. Keep crushing those quizzes!</p>
            </GlassCard>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {mistakes.map((m, i) => (
                <GlassCard key={i} className="animate-slide-up">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                        <span style={{ color: 'var(--danger)', marginRight: '0.5rem', fontWeight: 600 }}>Q.</span>
                        {m.question_text}
                      </h4>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                        <Tag size={12} /> {m.error_category || 'Concept'}
                        <span style={{ marginLeft: '1rem' }}>From: {m.classroom_subject}</span>
                      </div>
                    </div>
                    {m.status === 'resolved' ? (
                      <Badge type="cyan">Resolved</Badge>
                    ) : (
                      <Badge type="weak">Needs Review</Badge>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ background: 'rgba(239,68,68,0.1)', padding: '0.875rem', borderRadius: 10, border: '1px solid rgba(239,68,68,0.2)' }}>
                      <p style={{ fontSize: 11, color: '#fca5a5', fontWeight: 600, marginBottom: 4 }}>You Chose:</p>
                      <p style={{ fontSize: 13, color: 'var(--text-primary)' }}>{m.student_input}</p>
                    </div>
                    <div style={{ background: 'rgba(34,197,94,0.1)', padding: '0.875rem', borderRadius: 10, border: '1px solid rgba(34,197,94,0.2)' }}>
                      <p style={{ fontSize: 11, color: '#86efac', fontWeight: 600, marginBottom: 4 }}>Correct Answer:</p>
                      <p style={{ fontSize: 13, color: 'var(--text-primary)' }}>{m.correct_answer}</p>
                    </div>
                  </div>

                  {m.ai_explanation && (
                    <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 12, display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <HelpCircle size={18} color="var(--indigo-soft)" style={{ marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 12, color: 'var(--indigo-soft)', fontWeight: 600, marginBottom: 4 }}>Why you got it wrong:</p>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{m.ai_explanation}</p>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(99,102,241,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button className="btn-ghost" style={{ fontSize: 12, padding: '0.4rem 1rem', color: 'var(--danger)' }} onClick={() => handleDelete(m.id)}>
                      <Trash2 size={14} style={{ marginRight: 6 }} /> Remove Mistake
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
