import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import TopBar  from '../../components/TopBar'
import { GlassCard, LoadingSpinner } from '../../components/UI'
import { useAuth } from '../../contexts/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function ChatbotPage() {
  const { getToken, userProfile } = useAuth()
  const [messages, setMessages] = useState([{ role: 'assistant', text: "Hello! I'm your Synapse AI Tutor. Ask me any conceptual doubt from your currently enrolled classrooms!" }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [contextData, setContextData] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const loadContext = async () => {
      try {
        const token = await getToken()
        const [cRes, tRes] = await Promise.all([
          fetch(`${API}/classrooms`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/student/topics`, { headers: { Authorization: `Bearer ${token}` } }),
        ])
        let ctx = `Student Name: ${userProfile?.name || 'Student'}\n`
        if (cRes.ok) {
           const data = await cRes.json()
           ctx += `Enrolled Classrooms: ${data.classrooms?.map(c => c.name).join(', ') || 'None'}\n`
        }
        if (tRes.ok) {
           const data = await tRes.json()
           ctx += `Currently Learning Topics: ${data.topics?.map(t => t.topic_name).join(', ') || 'None'}\n`
        }
        setContextData(ctx)
      } catch (e) {
        console.error("Failed to load context", e)
      }
    }
    if (userProfile) loadContext()
  }, [userProfile, getToken])

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(() => { scrollToBottom() }, [messages])

  const send = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(p => [...p, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      const token = await getToken()
      const res = await fetch(`${API}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: userMsg, context: contextData })
      })
      const data = await res.json()
      if (res.ok) {
        setMessages(p => [...p, { role: 'assistant', text: data.reply }])
      } else {
        setMessages(p => [...p, { role: 'assistant', text: "Sorry, I couldn't process your request right now." }])
      }
    } catch {
      setMessages(p => [...p, { role: 'assistant', text: "An error occurred connecting to the AI." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>
        <TopBar title="AI Tutor" subtitle="Personalized 1-on-1 contextual help" />
        <main style={{ flex: 1, padding: '2rem', display: 'flex', justifyContent: 'center' }}>
          
          <GlassCard style={{ width: '100%', maxWidth: 800, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(99,102,241,0.15)', background: 'rgba(8,13,42,0.6)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--indigo), var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={22} color="#fff" />
              </div>
              <div>
                <h3 style={{ fontFamily: 'Clash Display', fontSize: 16, color: 'var(--text-primary)' }}>Synapse Tutor</h3>
                <p style={{ fontSize: 12, color: 'var(--cyan)' }}>Online • Trained on your syllabus</p>
              </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 500 }}>
              {messages.map((m, i) => (
                <div key={i} className="animate-fade-in" style={{ display: 'flex', gap: '1rem', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: m.role === 'user' ? 'var(--bg-tertiary)' : 'rgba(34,211,238,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {m.role === 'user' ? <User size={18} color="var(--text-muted)" /> : <Sparkles size={18} color="var(--cyan)" />}
                  </div>
                  <div style={{
                    maxWidth: '75%', padding: '1rem 1.25rem', borderRadius: 16, fontSize: 14, lineHeight: 1.6,
                    background: m.role === 'user' ? 'linear-gradient(135deg, var(--indigo), var(--indigo-dark))' : 'var(--bg-secondary)',
                    color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
                    border: m.role === 'user' ? 'none' : '1px solid rgba(99,102,241,0.15)',
                    borderTopRightRadius: m.role === 'user' ? 4 : 16,
                    borderTopLeftRadius: m.role === 'assistant' ? 4 : 16,
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(34,211,238,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={18} color="var(--cyan)" />
                  </div>
                  <div style={{ padding: '1rem 1.25rem', borderRadius: 16, background: 'var(--bg-secondary)', border: '1px solid rgba(99,102,241,0.15)', borderTopLeftRadius: 4 }}>
                    <LoadingSpinner size={16} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={send} style={{ padding: '1.25rem', borderTop: '1px solid rgba(99,102,241,0.15)', background: 'var(--bg-secondary)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                className="input-field"
                style={{ flex: 1, background: 'var(--bg-primary)', borderRadius: 24, padding: '0.875rem 1.5rem', fontSize: 14 }}
                placeholder="Ask about your syllabus, homework, or doubts..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
              />
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: 44, height: 44, padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                disabled={!input.trim() || loading}>
                <Send size={18} />
              </button>
            </form>
          </GlassCard>

        </main>
      </div>
    </div>
  )
}
