import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PlayCircle, Award, Target, Brain, Flag, ChevronRight, CheckCircle, XCircle } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import TopBar  from '../../components/TopBar'
import { GlassCard, ProgressRing, LoadingSpinner } from '../../components/UI'
import { useAuth } from '../../contexts/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function QuizPage() {
  const { quizId } = useParams()
  const navigate   = useNavigate()
  const { getToken, refreshProfile } = useAuth()
  
  const [quiz, setQuiz]         = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading]   = useState(true)
  
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers]       = useState({}) // qIndex -> option letter (a,b,c,d)
  const [submitting, setSubmitting] = useState(false)
  
  const [result, setResult]     = useState(null)
  const [error, setError]       = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken()
        const res = await fetch(`${API}/student/quizzes/${quizId}`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          const data = await res.json()
          setQuiz(data.quiz)
          setQuestions(data.questions || [])
        } else {
          setError('Failed to load quiz or quiz not found.')
        }
      } catch (err) { setError(err.message) }
      finally { setLoading(false) }
    }
    load()
  }, [quizId])

  const submitQuiz = async () => {
    setSubmitting(true); setError('')
    try {
      const token = await getToken()
      // format answers mapping to id
      const formattedAnswers = questions.map((q, i) => ({
        question_id: q.id,
        selected_option: answers[i] || null
      }))
      
      const res = await fetch(`${API}/student/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ answers: formattedAnswers })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit')
      setResult(data)
      refreshProfile() // Update XP in real-time
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner size={40} />
      </div>
    </div>
  )

  if (error || !quiz) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>
        <TopBar title="Quiz" />
        <main style={{ flex: 1, padding: '2rem', textAlign: 'center' }}>
          <GlassCard style={{ maxWidth: 600, margin: '0 auto', padding: '3rem' }}>
            <p style={{ color: 'var(--danger)', fontSize: 15 }}>{error || 'Quiz not found'}</p>
            <button className="btn-primary" onClick={() => navigate('/student/dashboard')} style={{ marginTop: '1.5rem' }}>Back to Dashboard</button>
          </GlassCard>
        </main>
      </div>
    </div>
  )

  // Start Screen
  if (currentIdx === 0 && Object.keys(answers).length === 0 && !result) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>
          <TopBar title="Quiz Intro" />
          <main style={{ flex: 1, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GlassCard style={{ maxWidth: 540, width: '100%', textAlign: 'center', padding: '3rem 2rem' }}>
              <Brain size={52} color="var(--cyan)" style={{ margin: '0 auto 1.5rem' }} />
              <h1 style={{ fontFamily: 'Clash Display', fontSize: 24, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {quiz.title}
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: 14 }}>
                {questions.length} Questions • Adaptive Difficulty • Points Awarded
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', textAlign: 'left' }}>
                <div style={{ background: 'rgba(99,102,241,0.1)', padding: '1rem', borderRadius: 12 }}>
                  <Award size={20} color="var(--indigo-soft)" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>Earn XP</p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Score &gt;80% for bonus XP</p>
                </div>
                <div style={{ background: 'rgba(34,211,238,0.1)', padding: '1rem', borderRadius: 12 }}>
                  <Target size={20} color="var(--cyan)" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>Mistake Tracking</p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Errors go to Mistake Corner</p>
                </div>
              </div>

              <button className="btn-primary" onClick={() => setAnswers({ _started: true })} style={{ padding: '0.875rem 2.5rem', fontSize: 16 }}>
                <PlayCircle size={18} /> Start Quiz Now
              </button>
            </GlassCard>
          </main>
        </div>
      </div>
    )
  }

  // Active Quiz View
  if (!result) {
    const q = questions[currentIdx]
    const opts = [['a', q.option_a], ['b', q.option_b], ['c', q.option_c], ['d', q.option_d]]
    const progressPct = ((currentIdx) / questions.length) * 100

    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Sidebar />
        <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>
          <TopBar title={quiz.title} subtitle={`Question ${currentIdx + 1} of ${questions.length}`} />
          <main style={{ flex: 1, padding: '2rem', maxWidth: 840, margin: '0 auto', width: '100%' }}>
            
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                <span>Progress</span><span>{Math.round(progressPct)}%</span>
              </div>
              <div className="xp-bar-track"><div className="xp-bar-fill" style={{ width: `${progressPct}%` }} /></div>
            </div>

            <GlassCard className="animate-fade-in" style={{ padding: '2rem 2.5rem', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: 20, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '2rem' }}>
                <span style={{ color: 'var(--indigo-soft)', fontFamily: 'JetBrains Mono', marginRight: '0.75rem', fontSize: 18 }}>Q{currentIdx + 1}.</span>
                {q.question_text}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {opts.map(([letter, text]) => {
                  const selected = answers[currentIdx] === letter
                  return (
                    <button key={letter} onClick={() => setAnswers(p => ({ ...p, [currentIdx]: letter }))} style={{
                      display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', textAlign: 'left',
                      padding: '1rem 1.25rem', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                      background: selected ? 'rgba(99,102,241,0.15)' : 'var(--bg-secondary)',
                      border: `1px solid ${selected ? 'var(--indigo)' : 'rgba(99,102,241,0.2)'}`,
                      boxShadow: selected ? '0 0 12px rgba(99,102,241,0.2)' : 'none',
                    }}>
                      <span style={{ 
                        width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: selected ? 'var(--indigo)' : 'var(--bg-tertiary)',
                        color: selected ? '#fff' : 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 600,
                      }}>{letter.toUpperCase()}</span>
                      <span style={{ fontSize: 16, color: selected ? '#fff' : 'var(--text-primary)' }}>{text}</span>
                    </button>
                  )
                })}
              </div>
            </GlassCard>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-ghost" onClick={() => setCurrentIdx(p => Math.max(0, p - 1))} disabled={currentIdx === 0}>
                Previous
              </button>
              {currentIdx === questions.length - 1 ? (
                <button className="btn-primary" onClick={submitQuiz} disabled={!answers[currentIdx] || submitting}>
                  {submitting ? <LoadingSpinner size={16} /> : 'Submit Quiz'}
                </button>
              ) : (
                <button className="btn-primary" onClick={() => setCurrentIdx(p => p + 1)} disabled={!answers[currentIdx]}>
                  Next <ChevronRight size={16} />
                </button>
              )}
            </div>

          </main>
        </div>
      </div>
    )
  }

  // Results Screen
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>
        <TopBar title="Quiz Results" />
        <main style={{ flex: 1, padding: '2rem', maxWidth: 900, margin: '0 auto', width: '100%' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '1.5rem', marginBottom: '2rem', alignItems: 'start' }}>
            
            {/* Score Ring Summary */}
            <GlassCard style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <h2 style={{ fontFamily: 'Clash Display', fontSize: 22, color: 'var(--text-primary)', marginBottom: '2rem' }}>Quiz Completed!</h2>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                <ProgressRing percent={result.percentage} size={140} stroke={12} color={result.percentage >= 80 ? 'var(--success)' : result.percentage >= 50 ? 'var(--warning)' : 'var(--danger)'} />
              </div>
              <h3 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{result.score} / {result.total} Correct</h3>
              <p style={{ color: 'var(--cyan)', fontWeight: 600, fontSize: 15 }}>+{result.xp_earned} XP Earned</p>
              
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => navigate('/student/dashboard')}>Dashboard</button>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => navigate('/student/mistakes')}>Mistakes</button>
              </div>
            </GlassCard>

            {/* Answer Review List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontFamily: 'Clash Display', fontSize: 18, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Answer Review</h3>
              {result.details.map((d, i) => (
                <GlassCard key={i} style={{ padding: '1.25rem', border: d.is_correct ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(239,68,68,0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ marginTop: 2 }}>{d.is_correct ? <CheckCircle size={20} color="var(--success)" /> : <XCircle size={20} color="var(--danger)" />}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.75rem', lineHeight: 1.5 }}>
                        <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>Q{i + 1}.</span> {d.question_text}
                      </p>
                      
                      {!d.is_correct && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', padding: '0.5rem 0.75rem', borderRadius: 8, marginBottom: '0.5rem', fontSize: 13, color: '#fca5a5' }}>
                          <span style={{ fontWeight: 600 }}>Your Answer:</span> {d.selected}
                        </div>
                      )}
                      
                      <div style={{ background: 'rgba(34,197,94,0.1)', padding: '0.5rem 0.75rem', borderRadius: 8, marginBottom: '0.75rem', fontSize: 13, color: '#86efac' }}>
                        <span style={{ fontWeight: 600 }}>Correct Answer:</span> {d.correct}
                      </div>

                      <div style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 8 }}>
                        <p style={{ fontSize: 12, color: 'var(--indigo-soft)', fontWeight: 600, marginBottom: 4 }}>💡 Explanation</p>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{d.explanation}</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

          </div>

        </main>
      </div>
    </div>
  )
}
