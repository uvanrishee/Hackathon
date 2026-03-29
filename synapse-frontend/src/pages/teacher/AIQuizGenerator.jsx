import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Zap, ChevronDown, ChevronUp, Edit2, Trash2, RefreshCw, Check, Send, PenLine, Plus, X } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import TopBar  from '../../components/TopBar'
import { GlassCard, LoadingSpinner } from '../../components/UI'
import { useAuth } from '../../contexts/AuthContext'

const API    = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const LEVELS = ['weak', 'average', 'above_average', 'topper']
const LEVEL_LABELS = { weak: '🔴 Weak', average: '🟡 Average', above_average: '🔵 Above Average', topper: '🏆 Topper' }

const BLANK_Q = () => ({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', explanation: '', topic_tag: '' })

function QuestionCard({ q, index, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const opts = [['A', q.option_a], ['B', q.option_b], ['C', q.option_c], ['D', q.option_d]]
  return (
    <div className="glass-card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', flex: 1, lineHeight: 1.5 }}>
          <span style={{ color: 'var(--indigo-soft)', fontFamily: 'JetBrains Mono', marginRight: '0.5rem' }}>Q{index + 1}.</span>
          {q.question_text}
        </p>
        <div style={{ display: 'flex', gap: '0.375rem', marginLeft: '0.75rem' }}>
          <button onClick={() => setExpanded(e => !e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          {onDelete && <button onClick={() => onDelete(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={14} /></button>}
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: '0.75rem' }}>
          {opts.map(([letter, text]) => (
            <div key={letter} style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0.5rem 0.75rem', borderRadius: 8, marginBottom: '0.375rem',
              background: q.correct_option === letter.toLowerCase() ? 'rgba(34,197,94,0.1)' : 'var(--bg-tertiary)',
              border: `1px solid ${q.correct_option === letter.toLowerCase() ? 'rgba(34,197,94,0.4)' : 'transparent'}`,
            }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--indigo-soft)', width: 20 }}>{letter}</span>
              <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{text}</span>
              {q.correct_option === letter.toLowerCase() && <Check size={13} color="var(--success)" />}
            </div>
          ))}
          {q.explanation && (
            <div style={{ marginTop: '0.625rem', padding: '0.625rem', background: 'rgba(99,102,241,0.08)', borderRadius: 8 }}>
              <p style={{ fontSize: 12, color: 'var(--indigo-soft)', marginBottom: 2 }}>💡 Explanation</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{q.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ManualQuestionEditor({ q, index, onChange, onDelete }) {
  const opts = ['a', 'b', 'c', 'd']
  const optLabels = { a: 'Option A', b: 'Option B', c: 'Option C', d: 'Option D' }
  return (
    <GlassCard style={{ marginBottom: '1rem', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--indigo-soft)', fontWeight: 700 }}>Q{index + 1}</span>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><X size={16} /></button>
      </div>
      <textarea
        className="input-field" rows={2}
        placeholder="Question text..."
        value={q.question_text}
        onChange={e => onChange({ ...q, question_text: e.target.value })}
        style={{ width: '100%', marginBottom: '0.75rem', resize: 'vertical', boxSizing: 'border-box' }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '0.75rem' }}>
        {opts.map(opt => (
          <div key={opt} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => onChange({ ...q, correct_option: opt })}
              style={{
                width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
                background: q.correct_option === opt ? 'var(--success)' : 'var(--bg-tertiary)',
                color: q.correct_option === opt ? '#fff' : 'var(--text-muted)',
                fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title={`Set ${opt.toUpperCase()} as correct`}
            >{opt.toUpperCase()}</button>
            <input
              className="input-field"
              placeholder={optLabels[opt]}
              value={q[`option_${opt}`]}
              onChange={e => onChange({ ...q, [`option_${opt}`]: e.target.value })}
              style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: 13 }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
        <input className="input-field" placeholder="Topic tag (optional)" value={q.topic_tag}
          onChange={e => onChange({ ...q, topic_tag: e.target.value })} style={{ fontSize: 12 }} />
        <input className="input-field" placeholder="Explanation (optional)" value={q.explanation}
          onChange={e => onChange({ ...q, explanation: e.target.value })} style={{ fontSize: 12 }} />
      </div>
    </GlassCard>
  )
}

export default function AIQuizGenerator() {
  const { getToken } = useAuth()
  const [params] = useSearchParams()
  const [mode, setMode] = useState('ai') // 'ai' | 'manual'

  const [classrooms, setClassrooms]   = useState([])
  const [materials, setMaterials]     = useState([])
  const [selectedClass, setSelectedClass] = useState(params.get('classroom') || '')
  const [selectedMaterial, setSelectedMaterial] = useState(params.get('material') || '')
  const [totalQ, setTotalQ]           = useState(20)
  const [perSession, setPerSession]   = useState(10)
  const [guidance, setGuidance]       = useState('')
  const [generating, setGenerating]   = useState(false)
  const [questions, setQuestions]     = useState([])
  const [quizTitle, setQuizTitle]     = useState('')
  const [difficulty, setDifficulty]   = useState('intermediate')
  const [timeLimit, setTimeLimit]     = useState(15)
  const [publishing, setPublishing]   = useState(false)
  const [published, setPublished]     = useState(false)
  const [error, setError]             = useState('')

  // Manual mode state
  const [manualQuestions, setManualQuestions] = useState([BLANK_Q()])

  useEffect(() => {
    const load = async () => {
      const token = await getToken()
      const res = await fetch(`${API}/classrooms`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setClassrooms((await res.json()).classrooms || [])
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedClass) return setMaterials([])
    const load = async () => {
      const token = await getToken()
      const res = await fetch(`${API}/classrooms/${selectedClass}/materials`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        const allMats = (await res.json()).materials || [];
        setMaterials(allMats.filter(m => !m.is_announcement))
      }
    }
    load()
  }, [selectedClass])

  const generate = async () => {
    if (!selectedClass || !selectedMaterial) return setError('Select classroom and material first.')
    setError(''); setGenerating(true); setPublished(false)
    try {
      const token = await getToken()
      const res   = await fetch(`${API}/ai/quiz/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ classroom_id: selectedClass, material_id: selectedMaterial, total_questions: totalQ, per_session: perSession, guidance }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setQuestions(data.questions || [])
      setQuizTitle(data.suggested_title || 'AI Generated Quiz')
    } catch (err) { setError(err.message) }
    finally { setGenerating(false) }
  }

  const publish = async () => {
    if (!quizTitle) return setError('Enter a quiz title.')
    if (!selectedClass) return setError('Select a classroom.')
    setPublishing(true); setError('')
    try {
      const token = await getToken()
      const payload = mode === 'ai'
        ? { classroom_id: selectedClass, material_id: selectedMaterial, title: quizTitle, time_limit: timeLimit, questions, difficulty_level: difficulty, is_published: true }
        : { classroom_id: selectedClass, title: quizTitle, difficulty_level: difficulty, questions: manualQuestions, is_published: true }
      const res = await fetch(`${API}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to publish')
      setPublished(true)
    } catch (err) { setError(err.message) }
    finally { setPublishing(false) }
  }

  const totalGenerated = questions.length
  const hasAIQuestions = mode === 'ai' && totalGenerated > 0
  const hasManualQ     = mode === 'manual' && manualQuestions.length > 0

  const updateManualQ = (i, newQ) => setManualQuestions(prev => prev.map((q, idx) => idx === i ? newQ : q))
  const deleteManualQ = (i) => setManualQuestions(prev => prev.filter((_, idx) => idx !== i))
  const addManualQ    = () => setManualQuestions(prev => [...prev, BLANK_Q()])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>
        <TopBar title="Quiz Creator" subtitle="Generate with AI or write your own questions" />
        <main style={{ flex: 1, padding: '2rem' }}>

          {/* Mode switcher */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--bg-secondary)', borderRadius: 12, padding: '0.25rem', width: 'fit-content' }}>
            {[['ai', <><Zap size={14} /> AI Generate</>, ], ['manual', <><PenLine size={14} /> Write My Own</>, ]].map(([val, label]) => (
              <button key={val} onClick={() => { setMode(val); setPublished(false); setError('') }} style={{
                padding: '0.5rem 1.25rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: mode === val ? 'linear-gradient(135deg, var(--indigo), var(--cyan))' : 'transparent',
                color: mode === val ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}>{label}</button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: hasAIQuestions || hasManualQ ? '380px 1fr' : (mode === 'manual' ? '360px 1fr' : '1fr'), gap: '1.5rem', alignItems: 'start' }}>

            {/* Config / manual panel */}
            <GlassCard style={{ position: 'sticky', top: '1rem' }}>
              <h3 style={{ fontFamily: 'Clash Display', fontSize: 18, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                {mode === 'ai' ? <><Zap size={18} color="var(--cyan)" /> Quiz Setup</> : <><PenLine size={18} color="var(--cyan)" /> Manual Quiz Setup</>}
              </h3>

              {/* Shared: classroom + title + difficulty */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>Classroom *</label>
                <select className="input-field" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                  <option value="">Select classroom...</option>
                  {classrooms.map(c => <option key={c.id} value={c.id}>{c.name} — {c.subject}</option>)}
                </select>
              </div>

              {mode === 'ai' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>Material *</label>
                  <select className="input-field" value={selectedMaterial} onChange={e => setSelectedMaterial(e.target.value)}>
                    <option value="">Select material...</option>
                    {materials.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                {mode === 'ai' && <>
                  <div>
                    <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>Total Questions</label>
                    <input className="input-field" type="number" min={8} max={60} value={totalQ} onChange={e => setTotalQ(+e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>Per Session</label>
                    <input className="input-field" type="number" min={4} max={20} value={perSession} onChange={e => setPerSession(+e.target.value)} />
                  </div>
                </>}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>Difficulty Level</label>
                <select className="input-field" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                  {['basic', 'intermediate', 'advanced', 'expert'].map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
              </div>

              {mode === 'ai' && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>AI Guidance (optional)</label>
                  <textarea className="input-field" rows={3} placeholder="e.g. Focus on Newton's third law..." value={guidance} onChange={e => setGuidance(e.target.value)} style={{ resize: 'vertical' }} />
                </div>
              )}

              {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: '1rem' }}>{error}</p>}

              {mode === 'ai' ? (
                <button className="btn-primary" onClick={generate} disabled={generating} style={{ width: '100%', justifyContent: 'center' }}>
                  {generating ? <><LoadingSpinner size={16} /> Generating...</> : <><Zap size={16} /> Generate Quiz with AI</>}
                </button>
              ) : (
                <div style={{ padding: '0.75rem', background: 'rgba(99,102,241,0.08)', borderRadius: 10, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  ✏️ Add your questions on the right. Click the letter button to mark the correct answer.
                </div>
              )}
            </GlassCard>

            {/* Preview / Edit panel */}
            <div>
              {/* Publish bar — shown when has questions */}
              {(hasAIQuestions || (mode === 'manual')) && (
                <GlassCard style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.75rem', alignItems: 'end' }}>
                    <div>
                      <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>Quiz Title</label>
                      <input className="input-field" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder="Enter quiz title..." />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 5, display: 'block' }}>Time (min)</label>
                      <input className="input-field" type="number" min={5} max={120} value={timeLimit} onChange={e => setTimeLimit(+e.target.value)} style={{ width: 80 }} />
                    </div>
                    <button className="btn-primary" onClick={publish} disabled={publishing || published} style={{ whiteSpace: 'nowrap' }}>
                      {published ? <><Check size={16} /> Published!</> : publishing ? <LoadingSpinner size={16} /> : <><Send size={16} /> Publish</>}
                    </button>
                  </div>
                </GlassCard>
              )}

              {/* AI mode: difficulty tabs + question cards */}
              {hasAIQuestions && (
                <div className="animate-slide-up">
                  {questions.map((q, i) => (
                    <QuestionCard key={i} q={q} index={i}
                      onDelete={idx => setQuestions(prev => prev.filter((_, i) => i !== idx))}
                    />
                  ))}
                </div>
              )}

              {/* Manual mode: editable question list */}
              {mode === 'manual' && (
                <div className="animate-slide-up">
                  {manualQuestions.map((q, i) => (
                    <ManualQuestionEditor
                      key={i} q={q} index={i}
                      onChange={(newQ) => updateManualQ(i, newQ)}
                      onDelete={() => deleteManualQ(i)}
                    />
                  ))}
                  <button className="btn-ghost" onClick={addManualQ} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                    <Plus size={16} /> Add Question
                  </button>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

