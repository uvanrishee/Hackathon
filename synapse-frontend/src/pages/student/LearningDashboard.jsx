import { useState, useEffect } from 'react'
import { BookOpen, Target, Sparkles } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import TopBar  from '../../components/TopBar'
import { GlassCard, ProgressRing, LoadingSpinner } from '../../components/UI'
import { useAuth } from '../../contexts/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function LearningDashboard() {
  const { getToken } = useAuth()
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false)
  const [activeFlashcards, setActiveFlashcards] = useState(null)
  const [cardIndex, setCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const generateFlashcards = async (topic) => {
    setGeneratingFlashcards(topic.id)
    try {
        const token = await getToken()
        
        // Only call refine to generate flashcards purely in-memory
        const r1 = await fetch(`${API}/ai/notes/refine`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ file_url: topic.file_url, file_type: 'pdf' })
        })
        const d1 = await r1.json()
        if (!r1.ok) throw new Error('AI Refine failed: ' + (d1.error || ''))
        
        const cards = d1.refined.flashcards || []
        if (cards.length === 0) throw new Error('AI did not return any flashcards.')
        
        setActiveFlashcards(cards)
        setCardIndex(0)
        setIsFlipped(false)
    } catch(err) {
        alert('Error generating flashcards: ' + err.message)
    } finally {
        setGeneratingFlashcards(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken()
        const tRes = await fetch(`${API}/student/topics`, { headers: { Authorization: `Bearer ${token}` } })
        if (tRes.ok) setTopics((await tRes.json()).topics || [])
      } catch (e) { console.error('Error fetching data', e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner size={40} />
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>
        <TopBar title="Learning Dashboard" subtitle="Track your progress and take AI-generated quizzes" />
        <main style={{ flex: 1, padding: '2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          
          <h2 style={{ fontFamily: 'Clash Display', fontSize: 22, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Your Topics</h2>

          {topics.length === 0 ? (
            <GlassCard style={{ textAlign: 'center', padding: '4rem' }}>
              <BookOpen size={48} color="var(--indigo-soft)" style={{ margin: '0 auto 1.5rem' }} />
              <h3 style={{ fontFamily: 'Clash Display', fontSize: 20, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>No Learning Topics Yet</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Enroll in classrooms and engage with materials to start building your paths.</p>
            </GlassCard>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
              {topics.map(t => (
                <GlassCard key={t.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                      <h3 style={{ fontFamily: 'Clash Display', fontSize: 18, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{t.topic_name}</h3>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.classroom_name} • {t.subject}</p>
                    </div>
                    <ProgressRing percent={t.progress || 0} size={50} stroke={4} />
                  </div>

                  <div style={{ background: 'var(--bg-tertiary)', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', flex: 1 }}>
                    <h4 style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Subtopics Progress</h4>
                    {(t.subtopics || []).length > 0 ? t.subtopics.map((sub, i) => (
                      <div key={i} style={{ marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                          <span>{sub.name}</span>
                          <span style={{ color: sub.mastery >= 80 ? 'var(--success)' : sub.mastery >= 50 ? 'var(--cyan)' : 'var(--warning)' }}>{sub.mastery}%</span>
                        </div>
                        <div className="xp-bar-track" style={{ height: 4, background: 'rgba(99,102,241,0.1)' }}>
                          <div className="xp-bar-fill" style={{ width: `${sub.mastery}%`, background: sub.mastery >= 80 ? 'var(--success)' : sub.mastery >= 50 ? 'var(--cyan)' : 'var(--warning)' }} />
                        </div>
                      </div>
                    )) : (
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>Keep practicing to reveal detailed insights.</p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn-primary" 
                      onClick={async (e) => {
                        const btn = e.currentTarget; const originalText = btn.innerHTML;
                        btn.innerHTML = 'Generating...'; btn.disabled = true;
                        try {
                          const token = await getToken()
                          const res = await fetch(`${API}/ai/quiz/generate`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ classroom_id: t.classroom_id, save_to_db: true, source_mode: 'url', source_url: t.file_url, difficulty: 'intermediate', title: `AI Quiz: ${t.topic_name}` })
                          })
                          if (res.ok) { window.location.href = `/student/quiz/${(await res.json()).quiz_id}` } 
                          else { alert('Failed to generate quiz'); btn.innerHTML = originalText; btn.disabled = false; }
                        } catch (err) { alert('Error generating quiz'); btn.innerHTML = originalText; btn.disabled = false; }
                      }}
                      style={{ flex: 1, padding: '0.625rem', fontSize: 13, justifyContent: 'center' }}
                    >
                      <Target size={14} /> Take AI Quiz
                    </button>
                    <button className="btn-ghost" onClick={() => generateFlashcards(t)} disabled={generatingFlashcards === t.id} style={{ flex: 1, padding: '0.625rem', fontSize: 13, justifyContent: 'center' }}>
                        {generatingFlashcards === t.id ? <LoadingSpinner size={14} /> : <><Sparkles size={14} /> AI Flashcards</>}
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* FLASHCARD OVERLAY MODAL */}
          {activeFlashcards && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5, 8, 24, 0.85)', backdropFilter: 'blur(8px)' }}>
              <div className="animate-slide-up" style={{ width: '100%', maxWidth: 600, padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontFamily: 'Clash Display', fontSize: 22, color: '#fff' }}>AI Flashcards</h3>
                  <button onClick={() => setActiveFlashcards(null)} className="btn-ghost" style={{ padding: '0.5rem', color: 'var(--danger)' }}>Close (X)</button>
                </div>

                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  style={{ 
                    height: 300, perspective: 1000, cursor: 'pointer', marginBottom: '1.5rem',
                    background: isFlipped ? 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(99,102,241,0.1))' : 'var(--bg-secondary)',
                    borderRadius: 24, padding: '2.5rem', border: '1px solid rgba(99,102,241,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)', transition: 'all 0.4s ease'
                  }}>
                  <p style={{ fontSize: isFlipped ? 18 : 22, color: isFlipped ? 'var(--cyan)' : 'var(--text-primary)', fontWeight: isFlipped ? 400 : 500, lineHeight: 1.6 }}>
                    {isFlipped ? activeFlashcards[cardIndex].answer : activeFlashcards[cardIndex].question}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button 
                    disabled={cardIndex === 0} 
                    onClick={() => { setCardIndex(cardIndex - 1); setIsFlipped(false) }}
                    className="btn-primary" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    &larr; Previous
                  </button>
                  <span style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'JetBrains Mono' }}>
                    {cardIndex + 1} / {activeFlashcards.length}
                  </span>
                  <button 
                    disabled={cardIndex === activeFlashcards.length - 1} 
                    onClick={() => { setCardIndex(cardIndex + 1); setIsFlipped(false) }}
                    className="btn-primary">
                    Next &rarr;
                  </button>
                </div>
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 12, color: 'var(--text-muted)' }}>Click the card to flip</p>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
