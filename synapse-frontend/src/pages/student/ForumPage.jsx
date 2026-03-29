import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { MessageSquare, ThumbsUp, Send, User, Reply, AlertCircle, RefreshCw } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import TopBar  from '../../components/TopBar'
import { GlassCard, LoadingSpinner, Badge } from '../../components/UI'
import { useAuth } from '../../contexts/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function ForumPage() {
  const { classroomId } = useParams()
  const { getToken } = useAuth()
  const [classrooms, setClassrooms] = useState([])
  const [activeClass, setActiveClass] = useState(classroomId === 'all' ? '' : classroomId)
  
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody]   = useState('')
  const [posting, setPosting]   = useState(false)
  
  const [replyText, setReplyText] = useState({})
  
  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken()
        const cRes = await fetch(`${API}/classrooms`, { headers: { Authorization: `Bearer ${token}` } })
        if (cRes.ok) {
          const classData = (await cRes.json()).classrooms || []
          setClassrooms(classData)
          if (!activeClass && classData.length > 0) setActiveClass(classData[0].id)
        }
      } catch (err) { console.error('Error fetching classrooms', err) }
    }
    load()
  }, [])

  const fetchPosts = async () => {
    if (!activeClass) return
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/forum/${activeClass}`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setPosts((await res.json()).posts || [])
    } catch (err) { console.error('Error fetching posts', err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPosts() }, [activeClass])

  const handlePost = async (e) => {
    e.preventDefault()
    if (!newTitle.trim() || !newBody.trim() || !activeClass) return
    setPosting(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/forum/${activeClass}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newTitle, body: newBody })
      })
      if (res.ok) {
        setNewTitle(''); setNewBody('')
        fetchPosts() // refresh
      }
    } catch (err) { console.error('Error creating post', err) }
    finally { setPosting(false) }
  }

  const handleApplyVote = async (postId, num = 1) => {
    try {
      const token = await getToken()
      await fetch(`${API}/forum/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ vote: num }) // mocked backend approach for now
      })
      fetchPosts()
    } catch (err) { console.error(err) }
  }

  const handleReply = async (e, postId) => {
    e.preventDefault()
    const text = replyText[postId]
    if (!text?.trim()) return
    try {
      const token = await getToken()
      await fetch(`${API}/forum/posts/${postId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ body: text })
      })
      setReplyText(p => ({ ...p, [postId]: '' }))
      fetchPosts()
    } catch (err) { console.error(err) }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>
        <TopBar title="Anonymous Forum" subtitle="Ask questions without hesitation. Names are hidden from classmates." />
        <main style={{ flex: 1, padding: '2rem', display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 350px', gap: '2rem', alignItems: 'start' }}>
          
          {/* Main Feed */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <select className="input-field" style={{ width: 250 }} value={activeClass} onChange={e => setActiveClass(e.target.value)}>
                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              
              <button className="btn-ghost" onClick={fetchPosts} style={{ padding: '0.4rem 1rem', fontSize: 13 }}>
                <RefreshCw size={14} style={{ marginRight: 6 }} /> Refresh
              </button>
            </div>

            {loading ? (
              <div style={{ padding: '4rem', textAlign: 'center' }}><LoadingSpinner size={36} /></div>
            ) : posts.length === 0 ? (
              <GlassCard style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <MessageSquare size={48} color="var(--indigo-soft)" style={{ margin: '0 auto 1.5rem' }} />
                <h3 style={{ fontFamily: 'Clash Display', fontSize: 18, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Discussions Yet</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Be the first to ask a question or share a thought.</p>
              </GlassCard>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {posts.map(p => (
                  <GlassCard key={p.id} className="animate-slide-up" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1.25rem' }}>
                      {/* Voting Column */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <button onClick={() => handleApplyVote(p.id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>▲</button>
                        <span style={{ fontSize: 16, fontWeight: 700, color: p.upvotes > 0 ? 'var(--cyan)' : 'var(--text-primary)' }}>{p.upvotes || 0}</span>
                      </div>
                      
                      {/* Content Column */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: p.is_teacher ? 'var(--warning)' : 'var(--indigo-soft)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {p.is_teacher ? <AlertCircle size={12} /> : <User size={12} />}
                            {p.is_teacher ? 'Teacher' : p.author_name || 'Anonymous Student'}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>• {new Date(p.created_at).toLocaleDateString()}</span>
                        </div>
                        <h4 style={{ fontSize: 18, color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 600 }}>{p.title}</h4>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>{p.body}</p>
                        
                        {/* Replies Section */}
                        {p.replies && p.replies.length > 0 && (
                          <div style={{ background: 'var(--bg-tertiary)', borderRadius: 12, padding: '1rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                            {p.replies.map(r => (
                              <div key={r.id} style={{ display: 'flex', gap: '0.75rem', paddingBottom: '0.875rem', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: r.is_teacher ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  {r.is_teacher ? <AlertCircle size={14} color="var(--warning)" /> : <User size={14} color="var(--indigo-soft)" />}
                                </div>
                                <div>
                                  <p style={{ fontSize: 11, fontWeight: 600, color: r.is_teacher ? 'var(--warning)' : 'var(--indigo-soft)', marginBottom: 2 }}>{r.is_teacher ? 'Teacher' : r.author_name || 'Anonymous'}</p>
                                  <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{r.body}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Reply Form */}
                        <form onSubmit={(e) => handleReply(e, p.id)} style={{ display: 'flex', gap: '0.5rem' }}>
                          <input 
                            className="input-field" 
                            style={{ flex: 1, padding: '0.5rem 1rem', fontSize: 13, background: 'var(--bg-tertiary)' }} 
                            placeholder="Write an anonymous reply..."
                            value={replyText[p.id] || ''}
                            onChange={e => setReplyText(prev => ({ ...prev, [p.id]: e.target.value }))}
                          />
                          <button type="submit" className="btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: 13 }} disabled={!replyText[p.id]?.trim()}>
                            <Reply size={14} /> Reply
                          </button>
                        </form>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>

          {/* New Post Panel */}
          <div style={{ position: 'sticky', top: '1rem' }}>
            <GlassCard>
              <h3 style={{ fontFamily: 'Clash Display', fontSize: 18, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={18} color="var(--cyan)" /> Post a Question
              </h3>
              <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Title *</label>
                  <input className="input-field" placeholder="e.g. How does Newton's 3rd Law apply here?" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Details *</label>
                  <textarea className="input-field" rows={5} placeholder="Explain what you are struggling with..." value={newBody} onChange={e => setNewBody(e.target.value)} required style={{ resize: 'vertical' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 8, lineHeight: 1.5 }}>
                  🛡️ <strong style={{ color: 'var(--text-primary)' }}>Safe Space:</strong> Your real name will be completely hidden from classmates. The teacher is the only one who can see who posts.
                </div>
                <button className="btn-primary" type="submit" disabled={posting || !activeClass} style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
                  {posting ? <LoadingSpinner size={16} /> : <><Send size={16} /> Post Anonymously</>}
                </button>
              </form>
            </GlassCard>
          </div>

        </main>
      </div>
    </div>
  )
}
