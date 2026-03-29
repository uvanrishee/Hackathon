import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FileText, Megaphone, MessageCircle, Users, UserPlus, Check, Clock, ChevronRight, Sword } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import TopBar  from '../../components/TopBar'
import { GlassCard, LoadingSpinner, Badge } from '../../components/UI'
import { useAuth } from '../../contexts/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const TABS = ['Feed', 'Materials', 'Forum', 'Classmates']

export default function ClassroomView() {
  const { id } = useParams()
  const { getToken, userProfile } = useAuth()
  const [tab, setTab] = useState('Feed')
  const [classroom, setClassroom] = useState(null)
  const [feed, setFeed] = useState([])
  const [materials, setMaterials] = useState([])
  const [classmates, setClassmates] = useState([])
  const [classmatesLoading, setClassmatesLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [friendStatuses, setFriendStatuses] = useState({}) // userId -> 'pending' | 'accepted' | null
  const [sendingReq, setSendingReq] = useState({})         // userId -> true/false

  useEffect(() => {
    const load = async () => {
      const token = await getToken()
      const [cRes, mRes] = await Promise.all([
        fetch(`${API}/student/classrooms/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/student/classrooms/${id}/materials`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (cRes.ok) setClassroom((await cRes.json()).classroom)
      if (mRes.ok) {
        const mats = (await mRes.json()).materials || []
        setMaterials(mats)
        setFeed(mats.filter(m => m.is_announcement).map(m => ({ ...m, type: 'announcement' })))
      }
      setLoading(false)
    }
    load()
  }, [id])

  // Lazy-load classmates only when that tab is opened
  useEffect(() => {
    if (tab !== 'Classmates' || classmates.length > 0) return
    const fetchClassmates = async () => {
      setClassmatesLoading(true)
      try {
        const token = await getToken()
        const [cmRes, friendsRes] = await Promise.all([
          fetch(`${API}/student/classrooms/${id}/classmates`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/social/friends`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        const cmData = cmRes.ok ? (await cmRes.json()).classmates || [] : []
        setClassmates(cmData)

        if (friendsRes.ok) {
          const fData = await friendsRes.json()
          const statuses = {}
          // Mark accepted friends
          for (const f of (fData.friends || [])) statuses[f.id] = 'accepted'
          // Mark where you sent a pending request (outgoing — we need to infer from classmate IDs)
          // We don't have outgoing requests from backend, so we'll track them locally after send
          setFriendStatuses(statuses)
        }
      } catch {}
      finally { setClassmatesLoading(false) }
    }
    fetchClassmates()
  }, [tab, id])

  const handleSendFriendReq = async (classmate) => {
    setSendingReq(p => ({ ...p, [classmate.id]: true }))
    try {
      const token = await getToken()
      const res = await fetch(`${API}/social/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ friend_user_id: classmate.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setFriendStatuses(p => ({ ...p, [classmate.id]: 'pending' }))
      } else {
        alert(data.error || 'Could not send request.')
      }
    } catch {
      alert('Network error.')
    } finally {
      setSendingReq(p => ({ ...p, [classmate.id]: false }))
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

  if (!classroom) return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 260, padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>Classroom not found.</h2>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>
        <TopBar title={classroom.name} subtitle={`Taught by ${classroom.teacher_name}`} />
        <main style={{ flex: 1, padding: '2rem', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
          
          {/* Header Banner */}
          <GlassCard style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(34,211,238,0.05))', padding: '2rem' }}>
            <h1 style={{ fontFamily: 'Clash Display', fontSize: 28, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{classroom.subject}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: '1.25rem' }}>{classroom.description || 'Welcome to the classroom.'}</p>
            <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: 13 }}>
              <span>👨‍🏫 {classroom.teacher_name}</span>
              <span>👥 {classroom.student_count || 0} enrolled</span>
              <span>📚 {materials.length} materials</span>
            </div>
          </GlassCard>

          {/* Tabs */}
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

          {/* Feed Content */}
          {tab === 'Feed' && (
            <div className="animate-fade-in">
              <h3 style={{ fontFamily: 'Clash Display', fontSize: 18, color: 'var(--text-primary)', marginBottom: '1rem' }}>Announcements &amp; Updates</h3>
              {feed.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No recent activity.</p> : feed.map(item => (
                <GlassCard key={item.id} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Megaphone size={16} color="var(--indigo)" />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Teacher Announcement</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>{item.announcement_text}</p>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Materials Content */}
          {tab === 'Materials' && (
            <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {materials.filter(m => !m.is_announcement).length === 0 ? (
                <p style={{ color: 'var(--text-muted)', padding: '2rem' }}>No materials uploaded yet.</p>
              ) : materials.filter(m => !m.is_announcement).map(m => (
                <GlassCard key={m.id}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={22} color="var(--indigo-soft)" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{m.title}</h4>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.file_type?.toUpperCase()} • {Math.round(m.size_kb)} KB</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {(m.topic_tags || []).map(t => <span key={t} className="badge badge-cyan" style={{ fontSize: 11 }}>{t}</span>)}
                  </div>
                  <a href={m.file_url?.startsWith('http') ? m.file_url : `${API}${m.file_url}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', width: '100%' }}>
                    <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: '0.5rem', fontSize: 13 }}>
                      View Material
                    </button>
                  </a>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Forum Shortcut */}
          {tab === 'Forum' && (
            <div className="animate-fade-in">
              <GlassCard style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <MessageCircle size={48} color="var(--cyan)" style={{ margin: '0 auto 1.5rem' }} />
                <h3 style={{ fontFamily: 'Clash Display', fontSize: 20, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Anonymous Discussion</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
                  Ask questions without hesitation. The forum is completely anonymous between students.
                </p>
                <Link to={`/student/forum/${id}`}>
                  <button className="btn-primary">Open Forum <ChevronRight size={16} /></button>
                </Link>
              </GlassCard>
            </div>
          )}

          {/* Classmates — List View with Friend Request */}
          {tab === 'Classmates' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'Clash Display', fontSize: 18, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Your Classmates</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {classroom.student_count || 0} students are studying with you. Send friend requests to battle bosses together!
                  </p>
                </div>
                <Link to="/student/social">
                  <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 13, padding: '0.5rem 1rem' }}>
                    <Sword size={14} /> View Battles
                  </button>
                </Link>
              </div>

              {classmatesLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><LoadingSpinner size={36} /></div>
              ) : classmates.length === 0 ? (
                <GlassCard style={{ textAlign: 'center', padding: '3rem' }}>
                  <Users size={40} color="var(--indigo-soft)" style={{ margin: '0 auto 1rem' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No classmates found.</p>
                </GlassCard>
              ) : (
                <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
                  {classmates
                    .filter(cm => cm.id !== userProfile?.id) // don't show self
                    .map((cm, i, arr) => {
                      const colors = ['#6366f1','#22d3ee','#f59e0b','#22c55e','#ec4899','#8b5cf6','#f97316','#14b8a6']
                      const color = colors[i % colors.length]
                      const initials = cm.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                      const status = friendStatuses[cm.id] // 'accepted' | 'pending' | undefined
                      const isSending = sendingReq[cm.id]

                      return (
                        <div key={cm.id} style={{
                          display: 'flex', alignItems: 'center', gap: '1rem',
                          padding: '1rem 1.5rem',
                          borderBottom: i < arr.length - 1 ? '1px solid rgba(99,102,241,0.08)' : 'none',
                          transition: 'background 0.15s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.05)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* Avatar */}
                          <div style={{
                            width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                            background: `linear-gradient(135deg, ${color}, ${color}99)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 15, fontWeight: 700, color: '#fff',
                            boxShadow: `0 3px 12px ${color}44`,
                          }}>
                            {initials}
                          </div>

                          {/* Name + tag */}
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{cm.name}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Student • {classroom.name}</p>
                          </div>

                          {/* Friend Request Button */}
                          {status === 'accepted' ? (
                            <span style={{
                              display: 'flex', alignItems: 'center', gap: '0.3rem',
                              fontSize: 12, color: 'var(--success)', fontWeight: 600,
                              background: 'rgba(34,197,94,0.1)', padding: '0.35rem 0.75rem', borderRadius: 8,
                            }}>
                              <Check size={13} /> Friends
                            </span>
                          ) : status === 'pending' ? (
                            <span style={{
                              display: 'flex', alignItems: 'center', gap: '0.3rem',
                              fontSize: 12, color: 'var(--warning)', fontWeight: 600,
                              background: 'rgba(245,158,11,0.1)', padding: '0.35rem 0.75rem', borderRadius: 8,
                            }}>
                              <Clock size={13} /> Pending
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSendFriendReq(cm)}
                              disabled={isSending}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '0.35rem',
                                fontSize: 12, fontWeight: 600, padding: '0.4rem 0.9rem',
                                borderRadius: 8, border: '1px solid rgba(99,102,241,0.4)',
                                background: 'rgba(99,102,241,0.08)', color: 'var(--indigo-soft)',
                                cursor: isSending ? 'wait' : 'pointer',
                                transition: 'all 0.15s',
                                opacity: isSending ? 0.6 : 1,
                              }}
                              onMouseEnter={e => !isSending && (e.currentTarget.style.background = 'rgba(99,102,241,0.2)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.08)')}
                            >
                              <UserPlus size={13} /> {isSending ? 'Sending…' : 'Add Friend'}
                            </button>
                          )}
                        </div>
                      )
                    })}
                </GlassCard>
              )}

              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
                💡 Add friends here, then head to Social Hub to launch a Boss Battle together!
              </p>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
