import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Star, BookOpen, ChevronRight, Clock, Zap } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import TopBar  from '../../components/TopBar'
import { GlassCard, ProgressRing, StatCard } from '../../components/UI'
import { useAuth } from '../../contexts/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function StudentDashboard() {
  const { getToken, userProfile } = useAuth()
  const [classrooms, setClassrooms] = useState([])
  const [topics, setTopics]         = useState([])
  const [activity, setActivity]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [joinCode, setJoinCode]     = useState('')
  const [joining, setJoining]       = useState(false)
  const [joinMsg, setJoinMsg]       = useState(null) // { type: 'success'|'error', text }

  useEffect(() => {
    const load = async () => {
      const token = await getToken()
      const [cRes, tRes, aRes] = await Promise.all([
        fetch(`${API}/classrooms`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/student/topics`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/student/activity`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (cRes.ok) setClassrooms((await cRes.json()).classrooms || [])
      if (tRes.ok) setTopics((await tRes.json()).topics || [])
      if (aRes.ok) setActivity((await aRes.json()).activity || [])
      setLoading(false)
    }
    load()
  }, [])

  const joinClassroom = async () => {
    if (!joinCode.trim()) return
    setJoining(true); setJoinMsg(null)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/student/classrooms/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ join_code: joinCode.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (res.ok) {
        setJoinMsg({ type: 'success', text: data.message || 'Joined successfully!' })
        setJoinCode('')
        // Refresh classrooms list
        const cRes = await fetch(`${API}/classrooms`, { headers: { Authorization: `Bearer ${token}` } })
        if (cRes.ok) setClassrooms((await cRes.json()).classrooms || [])
      } else {
        setJoinMsg({ type: 'error', text: data.error || 'Invalid join code. Try again.' })
      }
    } catch (e) {
      setJoinMsg({ type: 'error', text: 'Network error. Make sure backend is running.' })
    }
    setJoining(false)
  }

  const xp     = userProfile?.xp || 0
  const level  = Math.floor(xp / 500) + 1
  const xpNext = level * 500
  const xpPct  = Math.round(((xp % 500) / 500) * 100)
  const streak = userProfile?.streak || 0

  const LEVEL_NAMES = ['Rookie','Explorer','Learner','Scholar','Achiever','Expert','Master','Champion','Legend','Synapse Elite']
  const levelName = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)]

  const colors = ['#6366f1','#22d3ee','#f59e0b','#22c55e','#ec4899','#8b5cf6']

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content">
        <TopBar />
        <main className="page-main">

          {/* Welcome banner */}
          <div className="glass-card animate-slide-up" style={{
            padding: '1.5rem 2rem', marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(34,211,238,0.08) 100%)',
            display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'center',
          }}>
            <div>
              <h2 style={{ fontFamily: 'Clash Display', fontSize: 22, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Hey {userProfile?.name?.split(' ')[0]} 👋
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Level {level} · <span className="gradient-text" style={{ fontWeight: 600 }}>{levelName}</span>
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ flex: 1, maxWidth: 240 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                    <span>{xp} XP</span><span>{xpNext} XP</span>
                  </div>
                  <div className="xp-bar-track"><div className="xp-bar-fill" style={{ width: `${xpPct}%` }} /></div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{xpNext - xp} XP to Level {level + 1}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flex: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 28 }}>🔥</p>
                <p style={{ fontFamily: 'JetBrains Mono', fontSize: 20, fontWeight: 700, color: 'var(--warning)' }}>{streak}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>day streak</p>
              </div>
            </div>
          </div>

          {/* Main grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
            <div>
              {/* ── Join Classroom ── */}
              <GlassCard style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(34,211,238,0.06))' }}>
                <h3 style={{ fontFamily: 'Clash Display', fontSize: 16, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Join a Classroom</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: '0.875rem' }}>Enter the 6-character code your teacher shared</p>
                <div style={{ display: 'flex', gap: '0.625rem' }}>
                  <input
                    className="input-field"
                    style={{ flex: 1, fontFamily: 'JetBrains Mono', letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: 16 }}
                    placeholder="e.g. WM4LXN"
                    maxLength={6}
                    value={joinCode}
                    onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinMsg(null) }}
                    onKeyDown={e => e.key === 'Enter' && joinClassroom()}
                  />
                  <button
                    className="btn-primary"
                    onClick={joinClassroom}
                    disabled={joining || joinCode.length < 3}
                    style={{ flexShrink: 0, fontSize: 14 }}
                  >
                    {joining ? 'Joining...' : '+ Join'}
                  </button>
                </div>
                {joinMsg && (
                  <p style={{
                    marginTop: '0.625rem', fontSize: 13,
                    color: joinMsg.type === 'success' ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {joinMsg.type === 'success' ? '✅' : '❌'} {joinMsg.text}
                  </p>
                )}
              </GlassCard>

              {/* Active Classrooms */}
              <h2 style={{ fontFamily: 'Clash Display', fontSize: 18, color: 'var(--text-primary)', marginBottom: '1rem' }}>My Classrooms</h2>
              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
                {classrooms.map((c, i) => (
                  <Link key={c.id} to={`/student/classroom/${c.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                    <div className="glass-card" style={{ width: 240, padding: 0, overflow: 'hidden', transition: 'transform 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                      <div style={{ height: 4, background: colors[i % colors.length] }} />
                      <div style={{ padding: '1rem' }}>
                        <h3 style={{ fontFamily: 'Clash Display', fontSize: 15, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{c.name}</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>by {c.teacher_name}</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {c.unread_announcements > 0 && <span className="badge badge-cyan" style={{ fontSize: 10 }}>📣 {c.unread_announcements} new</span>}
                          {c.pending_quizzes > 0 && <span className="badge badge-weak" style={{ fontSize: 10 }}>📝 {c.pending_quizzes} quiz</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {classrooms.length === 0 && !loading && (
                  <div className="glass-card" style={{ padding: '2rem', width: '100%', textAlign: 'center' }}>
                    <BookOpen size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No classrooms yet. Ask your teacher for a join code.</p>
                  </div>
                )}
              </div>

              {/* Continue Learning */}
              <h2 style={{ fontFamily: 'Clash Display', fontSize: 18, color: 'var(--text-primary)', marginBottom: '1rem' }}>Continue Learning</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {topics.slice(0, 6).map(t => (
                  <Link key={t.id} to="/student/learn" style={{ textDecoration: 'none' }}>
                    <div className="glass-card" style={{ padding: '1rem', transition: 'transform 0.2s', height: '100%' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                        <ProgressRing percent={t.progress || 0} size={56} stroke={5} />
                      </div>
                      <h4 style={{ fontFamily: 'Clash Display', fontSize: 13, color: 'var(--text-primary)', marginBottom: '0.25rem', textAlign: 'center' }}>{t.topic_name}</h4>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>{t.classroom_name}</p>
                      <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem', fontSize: 12, padding: '0.35rem' }}>
                        Continue <ChevronRight size={13} />
                      </button>
                    </div>
                  </Link>
                ))}
                {topics.length === 0 && !loading && (
                  <div style={{ gridColumn: '1/-1', color: 'var(--text-muted)', fontSize: 14, padding: '1rem 0' }}>Push materials from your classrooms to start learning.</div>
                )}
              </div>
            </div>

            {/* Activity feed */}
            <div>
              <h2 style={{ fontFamily: 'Clash Display', fontSize: 18, color: 'var(--text-primary)', marginBottom: '1rem' }}>Recent Activity</h2>
              <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ maxHeight: 420, overflowY: 'auto', padding: '0.5rem 0' }}>
                  {activity.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '1.5rem 1rem' }}>No recent activity yet</p>
                  ) : activity.map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.625rem 1rem', borderBottom: i < activity.length - 1 ? '1px solid rgba(99,102,241,0.08)' : 'none' }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{a.emoji || '📌'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>{a.text}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Clock size={10} /> {a.time_ago}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
