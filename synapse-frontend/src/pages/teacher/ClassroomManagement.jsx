import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Users, FileText, Zap, Megaphone, Search, Trash2, Eye, Copy, Check, BarChart2, X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Sidebar from '../../components/Sidebar'
import TopBar  from '../../components/TopBar'
import { GlassCard, Badge, LoadingSpinner } from '../../components/UI'
import { useAuth } from '../../contexts/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const TABS = ['Overview', 'Students', 'Materials', 'Quizzes', 'Announcements']

function StatCard({ label, value, color, icon: Icon }) {
  return (
    <div style={{
      background: 'rgba(99, 102, 241, 0.05)',
      border: `1px solid ${color}33`,
      borderRadius: 14,
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    }}>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ fontFamily: 'Clash Display', fontSize: 28, fontWeight: 700, color }}>{value}</p>
      {Icon && <Icon size={14} color={color} style={{ opacity: 0.7 }} />}
    </div>
  )
}

export default function ClassroomManagement() {
  const { id } = useParams()
  const { getToken } = useAuth()
  const [tab, setTab]           = useState('Overview')
  const [classroom, setClassroom] = useState(null)
  const [students, setStudents]  = useState([])
  const [materials, setMaterials] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading]    = useState(true)
  const [search, setSearch]      = useState('')
  const [copied, setCopied]      = useState(false)
  const [annText, setAnnText]    = useState('')
  const [posting, setPosting]    = useState(false)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [selectedQuizAnalytics, setSelectedQuizAnalytics] = useState(null)

  useEffect(() => {
    const load = async () => {
      const token = await getToken()
      const [cRes, sRes, mRes, qRes] = await Promise.all([
        fetch(`${API}/classrooms/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/classrooms/${id}/students`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/classrooms/${id}/materials`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/classrooms/${id}/quizzes`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (cRes.ok) setClassroom((await cRes.json()).classroom)
      if (sRes.ok) setStudents((await sRes.json()).students || [])
      if (mRes.ok) {
        const mats = (await mRes.json()).materials || []
        setMaterials(mats.filter(m => !m.is_announcement))
        setAnnouncements(mats.filter(m => m.is_announcement))
      }
      if (qRes.ok) setQuizzes((await qRes.json()).quizzes || [])
      setLoading(false)
    }
    load()
  }, [id])

  const postAnnouncement = async () => {
    if (!annText.trim()) return
    setPosting(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/classrooms/${id}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: 'Announcement',
          file_url: '', file_type: 'announcement', size_kb: 0,
          topic_tags: [], is_announcement: true,
          announcement_text: annText,
        }),
      })
      if (res.ok) {
        const newAnn = { id: Date.now(), title: 'Announcement', is_announcement: 1, announcement_text: annText, created_at: new Date().toISOString() }
        setAnnouncements(prev => [newAnn, ...prev])
        setAnnText('')
      }
    } finally { setPosting(false) }
  }

  const copy = () => { navigator.clipboard.writeText(classroom?.join_code || ''); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const deleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return
    try {
      const token = await getToken()
      const res = await fetch(`${API}/classrooms/${id}/materials/${materialId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setMaterials(prev => prev.filter(m => m.id !== materialId))
        setAnnouncements(prev => prev.filter(m => m.id !== materialId))
      }
    } catch (e) {
      console.error('Error deleting material:', e)
    }
  }
  const removeStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to remove ${studentName} from this classroom?`)) return
    try {
      const token = await getToken()
      const res = await fetch(`${API}/classrooms/${id}/students/${studentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setStudents(prev => prev.filter(s => s.id !== studentId))
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to remove student')
      }
    } catch (e) {
      console.error('Error removing student:', e)
      alert('Error removing student')
    }
  }

  const viewQuizAnalytics = async (quizId) => {
    setLoadingAnalytics(true)
    setShowAnalytics(true)
    setSelectedQuizAnalytics(null)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/quizzes/${quizId}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        setSelectedQuizAnalytics(await res.json())
      }
    } catch (e) {
      console.error('Error fetching quiz analytics:', e)
    } finally {
      setLoadingAnalytics(false)
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

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>
        <TopBar title={classroom?.name || 'Classroom'} subtitle={classroom?.subject} />
        <main style={{ flex: 1, padding: '2rem' }}>

          {/* Tab nav */}
          <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-secondary)', borderRadius: 12, padding: '0.25rem', marginBottom: '2rem', width: 'fit-content' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '0.5rem 1.25rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                background: tab === t ? 'linear-gradient(135deg, var(--indigo), var(--cyan))' : 'transparent',
                color: tab === t ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}>{t}</button>
            ))}
          </div>

          {/* Overview */}
          {tab === 'Overview' && classroom && (
            <div className="animate-fade-in">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {[
                  { icon: Users,    label: 'Students',  val: students.length },
                  { icon: FileText, label: 'Materials', val: materials.length },
                  { icon: Zap,      label: 'Quizzes',   val: classroom.quiz_count || 0 },
                ].map(({ icon: Icon, label, val }) => (
                  <GlassCard key={label} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Icon size={24} color="var(--cyan)" />
                    <div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</p>
                      <p style={{ fontFamily: 'Clash Display', fontSize: 24, color: 'var(--text-primary)' }}>{val}</p>
                    </div>
                  </GlassCard>
                ))}
              </div>
              <GlassCard style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Clash Display', fontSize: 16, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Join Code</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 10, padding: '0.75rem 1rem', width: 'fit-content' }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 700, color: 'var(--cyan)', letterSpacing: '0.2em' }}>
                    {classroom.join_code}
                  </span>
                  <button onClick={copy} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--success)' : 'var(--text-muted)' }}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: '0.5rem' }}>Share this code with students to let them enroll</p>
              </GlassCard>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to={`/teacher/upload?classroom=${classroom.id}`}>
                  <button className="btn-primary"><FileText size={16} /> Upload Material</button>
                </Link>
                <Link to={`/teacher/quiz-generator?classroom=${classroom.id}`}>
                  <button className="btn-ghost"><Zap size={16} /> Generate Quiz</button>
                </Link>
              </div>
            </div>
          )}

          {/* Students */}
          {tab === 'Students' && (
            <div className="animate-fade-in">
              <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input-field" style={{ paddingLeft: '2.5rem' }} placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                      {['Student', 'Enrolled', 'Quiz Avg', 'Category', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s, i) => (
                      <tr key={s.id} style={{ borderBottom: i < filteredStudents.length - 1 ? '1px solid rgba(99,102,241,0.07)' : 'none', transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.05)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--indigo), var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>{s.name[0]}</div>
                            <div>
                              <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{s.name}</p>
                              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', fontSize: 13, color: 'var(--text-secondary)' }}>
                          {s.enrolled_at ? new Date(s.enrolled_at).toLocaleDateString() : '—'}
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', minWidth: 140 }}>
                          {(() => {
                            const score = s.last_real_test_score ?? s.avg_score ?? null
                            const pct   = score !== null ? Math.min(100, Math.max(0, Math.round(score))) : null
                            const color = pct === null ? 'var(--text-muted)' : pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)'
                            return pct !== null ? (
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                  <span style={{ color, fontFamily: 'JetBrains Mono', fontWeight: 700 }}>{pct}%</span>
                                </div>
                                <div style={{ height: 6, background: 'rgba(99,102,241,0.12)', borderRadius: 99 }}>
                                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
                                </div>
                              </div>
                            ) : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>
                          })()}
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <Badge type={s.category || 'average'}>{s.category || 'New'}</Badge>
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => removeStudent(s.id, s.name)}
                              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.3rem 0.5rem', cursor: 'pointer', color: 'var(--danger)' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No students found</td></tr>
                    )}
                  </tbody>
                </table>
              </GlassCard>
            </div>
          )}

          {/* Quizzes (teacher-side) */}
          {tab === 'Quizzes' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontFamily: 'Clash Display', fontSize: 20, color: 'var(--text-primary)' }}>Quizzes in this Classroom</h2>
                <Link to={`/teacher/quiz-generator?classroom=${id}`}>
                  <button className="btn-primary" style={{ fontSize: 13 }}><Zap size={14} /> New Quiz</button>
                </Link>
              </div>
              {quizzes.length === 0 ? (
                <GlassCard style={{ textAlign: 'center', padding: '3rem' }}>
                  <Zap size={40} color="var(--indigo-soft)" style={{ margin: '0 auto 1rem' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No quizzes published yet.</p>
                  <Link to={`/teacher/quiz-generator?classroom=${id}`}>
                    <button className="btn-primary" style={{ marginTop: '1rem', fontSize: 13 }}><Zap size={14} /> Create First Quiz</button>
                  </Link>
                </GlassCard>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {quizzes.map(q => {
                    const diffColor = { basic: 'var(--success)', intermediate: 'var(--cyan)', advanced: 'var(--warning)', expert: 'var(--danger)' }[q.difficulty_level] || 'var(--indigo-soft)'
                    return (
                      <GlassCard key={q.id} style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', flex: 1, lineHeight: 1.4 }}>{q.title}</h3>
                          {q.difficulty_level && (
                            <span style={{ fontSize: 10, background: `${diffColor}22`, color: diffColor, borderRadius: 6, padding: '2px 8px', marginLeft: 8, flexShrink: 0, textTransform: 'capitalize' }}>
                              {q.difficulty_level}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: 12, color: 'var(--text-muted)', marginBottom: '1rem' }}>
                          <span>📝 {q.question_count} questions</span>
                          <span>🎯 {q.attempt_count} attempts</span>
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(q.created_at).toLocaleDateString()}</p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn-primary" style={{ flex: 1, fontSize: 12, padding: '0.4rem' }} onClick={() => viewQuizAnalytics(q.id)}>
                            <BarChart2 size={13} /> View Analytics
                          </button>
                        </div>
                      </GlassCard>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Materials */}
          {tab === 'Materials' && (
            <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {materials.map(m => (
                <GlassCard key={m.id} style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={20} color="var(--indigo-soft)" />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{m.title}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.file_type?.toUpperCase()} · {m.size_kb ? `${Math.round(m.size_kb)}KB` : ''}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.75rem' }}>
                    {(m.topic_tags || []).map(tag => <span key={tag} className="badge badge-cyan" style={{ fontSize: 10 }}>{tag}</span>)}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: '0.875rem' }}>{new Date(m.created_at).toLocaleDateString()}</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a href={m.file_url?.startsWith('http') ? m.file_url : `${API}${m.file_url}`} target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: 'none' }}>
                      <button className="btn-ghost" style={{ width: '100%', fontSize: 12, padding: '0.4rem 0.75rem', justifyContent: 'center' }}>
                        <Eye size={12} /> View
                      </button>
                    </a>
                    <Link to={`/teacher/quiz-generator?material=${m.id}&classroom=${id}`} style={{ flex: 1 }}>
                      <button className="btn-primary" style={{ width: '100%', fontSize: 12, padding: '0.4rem 0.75rem', justifyContent: 'center' }}>
                        <Zap size={12} /> Quiz
                      </button>
                    </Link>
                    <button 
                      className="btn-ghost" 
                      style={{ padding: '0.4rem', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', flexShrink: 0 }}
                      onClick={() => deleteMaterial(m.id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </GlassCard>
              ))}
              {materials.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No materials uploaded yet.{' '}
                  <Link to={`/teacher/upload?classroom=${id}`} style={{ color: 'var(--indigo-soft)', textDecoration: 'none' }}>Upload now →</Link>
                </div>
              )}
            </div>
          )}

          {/* Announcements */}
          {tab === 'Announcements' && (
            <div className="animate-fade-in">
              <GlassCard style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Clash Display', fontSize: 16, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  <Megaphone size={18} color="var(--cyan)" /> Post Announcement
                </h3>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Write an announcement for your students..."
                  value={annText}
                  onChange={e => setAnnText(e.target.value)}
                  style={{ resize: 'vertical', marginBottom: '0.75rem' }}
                />
                <button className="btn-primary" style={{ fontSize: 13 }} onClick={postAnnouncement} disabled={posting || !annText.trim()}>
                  <Megaphone size={14} /> {posting ? 'Posting...' : 'Post'}
                </button>
              </GlassCard>
              {announcements.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No announcements yet.</p>
              )}
              {announcements.map(m => (
                <GlassCard key={m.id} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Megaphone size={15} color="var(--cyan)" />
                    <span className="badge badge-cyan" style={{ fontSize: 10 }}>Announcement</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>{new Date(m.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>{m.announcement_text}</p>
                </GlassCard>
              ))}
            </div>
          )}
          {/* Quiz Analytics Modal */}
          {showAnalytics && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'rgba(5, 8, 26, 0.85)', backdropFilter: 'blur(10px)' }}>
              <GlassCard style={{ width: '100%', maxWidth: 900, maxHeight: '90vh', overflowY: 'auto', position: 'relative', border: '1px solid rgba(99, 102, 241, 0.4)', boxShadow: '0 0 50px rgba(99, 102, 241, 0.15)' }}>
                <button onClick={() => setShowAnalytics(false)} style={{ position: 'absolute', right: 20, top: 20, background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.4rem', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={18} />
                </button>
                
                {loadingAnalytics ? (
                  <div style={{ padding: '6rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <LoadingSpinner size={45} />
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Analyzing performance data...</p>
                  </div>
                ) : selectedQuizAnalytics ? (
                  <div className="animate-fade-in">
                    <div style={{ marginBottom: '2.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Zap size={20} color="var(--cyan)" />
                        <h2 style={{ fontFamily: 'Clash Display', fontSize: 26, color: 'var(--text-primary)' }}>{selectedQuizAnalytics.quiz.title}</h2>
                        <Badge type={selectedQuizAnalytics.quiz.difficulty_level}>{selectedQuizAnalytics.quiz.difficulty_level}</Badge>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Comprehensive student performance analytics and score distribution.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
                      <StatCard label="Avg Score" value={`${selectedQuizAnalytics.stats.avg_score_pct}%`} color="var(--cyan)" />
                      <StatCard label="Highest" value={`${selectedQuizAnalytics.stats.max_score_pct}%`} color="var(--success)" />
                      <StatCard label="Students" value={selectedQuizAnalytics.stats.unique_students} icon={Users} color="var(--indigo)" />
                      <StatCard label="Attempts" value={selectedQuizAnalytics.stats.total_attempts} icon={BarChart2} color="var(--warning)" />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                      <GlassCard style={{ background: 'rgba(99, 102, 241, 0.04)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                        <h3 style={{ fontFamily: 'Clash Display', fontSize: 16, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Score Distribution</h3>
                        <ResponsiveContainer width="100%" height={240}>
                          <BarChart data={selectedQuizAnalytics.stats.distribution}>
                            <defs>
                              <linearGradient id="quizBarGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.8}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip
                              cursor={{ fill: 'rgba(99, 102, 241, 0.07)' }}
                              contentStyle={{ background: '#080d2a', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#f1f5f9' }}
                            />
                            <Bar dataKey="count" fill="url(#quizBarGradient)" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </GlassCard>

                      <GlassCard style={{ background: 'rgba(99, 102, 241, 0.04)', border: '1px solid rgba(99, 102, 241, 0.1)', padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(99, 102, 241, 0.1)' }}>
                          <h3 style={{ fontFamily: 'Clash Display', fontSize: 16, color: 'var(--text-primary)' }}>Attempt Log</h3>
                        </div>
                        <div style={{ maxHeight: 260, overflowY: 'auto', padding: '0 1.25rem' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1, borderBottom: '1px solid rgba(99, 102, 241, 0.1)', color: 'var(--text-muted)', fontSize: 10, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <th style={{ padding: '0.75rem 0' }}>Student</th>
                                <th>Score %</th>
                                <th>Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedQuizAnalytics.attempts.map((a, i) => {
                                const score = Math.round(a.score * 100 / a.total_questions)
                                return (
                                  <tr key={i} style={{ borderBottom: '1px solid rgba(99, 102, 241, 0.04)', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '0.875rem 0' }}>
                                      <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{a.student_name}</p>
                                    </td>
                                    <td>
                                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)', fontWeight: 600 }}>{score}%</span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{new Date(a.completed_at).toLocaleDateString()}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                          {selectedQuizAnalytics.attempts.length === 0 && (
                            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No attempts recorded yet.</p>
                          )}
                        </div>
                      </GlassCard>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '6rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Could not load analytics. Please try again.</p>
                    <button className="btn-ghost" onClick={() => setShowAnalytics(false)} style={{ marginTop: '1rem' }}>Close</button>
                  </div>
                )}
              </GlassCard>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
