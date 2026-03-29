import { useState, useEffect } from 'react'
import { BarChart2, Users, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Sidebar from '../../components/Sidebar'
import TopBar  from '../../components/TopBar'
import { GlassCard, StatCard, Badge, LoadingSpinner } from '../../components/UI'
import { useAuth } from '../../contexts/AuthContext'

const API          = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const CAT_COLORS   = { weak: '#ef4444', average: '#f59e0b', above_average: '#6366f1', topper: '#fbbf24', new: '#94a3b8' }
const CHART_THEME  = { stroke: '#1a255c', fill: '#0d1539', text: '#94a3b8' }

const TTip = ({ active, payload, label }) => active && payload?.length ? (
  <div style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, padding: '0.625rem 0.875rem' }}>
    {label && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>}
    {payload.map((p, i) => <p key={i} style={{ fontSize: 13, color: p.color || 'var(--text-primary)' }}>{p.name}: <strong>{p.value}</strong></p>)}
  </div>
) : null

export default function StudentAnalytics() {
  const { getToken } = useAuth()
  const [classrooms, setClassrooms] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [analytics, setAnalytics]   = useState(null)
  const [students, setStudents]     = useState([])
  const [loading, setLoading]       = useState(false)
  const [search, setSearch]         = useState('')

  useEffect(() => {
    const load = async () => {
      const token = await getToken()
      const res = await fetch(`${API}/classrooms`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setClassrooms((await res.json()).classrooms || [])
    }
    load()
  }, [])

  useEffect(() => {
    if (!selectedClass) return
    setLoading(true)
    const load = async () => {
      const token = await getToken()
      const [aRes, sRes] = await Promise.all([
        fetch(`${API}/analytics/class/${selectedClass}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/classrooms/${selectedClass}/students`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (aRes.ok) setAnalytics((await aRes.json()).analytics)
      if (sRes.ok) setStudents((await sRes.json()).students || [])
      setLoading(false)
    }
    load()
  }, [selectedClass])

  const pieData = analytics ? Object.entries(analytics.category_counts || {})
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name: name.replace('_', ' '), value, color: CAT_COLORS[name] || '#94a3b8' })) : []
  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>
        <TopBar title="Student Analytics" subtitle="Class-wide performance intelligence at a glance" />
        <main style={{ flex: 1, padding: '2rem' }}>

          {/* Classroom selector */}
          <div style={{ marginBottom: '1.5rem', maxWidth: 380 }}>
            <select className="input-field" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              <option value="">Select a classroom to view analytics...</option>
              {classrooms.map(c => <option key={c.id} value={c.id}>{c.name} — {c.subject}</option>)}
            </select>
          </div>

          {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><LoadingSpinner size={40} /></div>}

          {!loading && analytics && (
            <>
              {/* Summary tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.875rem', marginBottom: '2rem' }}>
                <StatCard icon={Users} label="Total Students" value={analytics.total_students || 0} color="var(--cyan)" />
                {['weak','average','above_average','topper','new'].map(c => (
                  <StatCard key={c} label={c.replace('_',' ').replace(/\b\w/g,l=>l.toUpperCase())} value={analytics.category_counts?.[c] || 0} color={CAT_COLORS[c]} />
                ))}
              </div>

              {/* Charts grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>

                {/* Donut */}
                <GlassCard>
                  <h3 style={{ fontFamily: 'Clash Display', fontSize: 16, color: 'var(--text-primary)', marginBottom: '1rem' }}>Category Distribution</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                        {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip content={<TTip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </GlassCard>

                {/* Quiz trend */}
                <GlassCard>
                  <h3 style={{ fontFamily: 'Clash Display', fontSize: 16, color: 'var(--text-primary)', marginBottom: '1rem' }}>Quiz Performance Trend</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={analytics.quiz_trend || []}>
                      <XAxis dataKey="date" stroke={CHART_THEME.text} tick={{ fontSize: 11 }} />
                      <YAxis stroke={CHART_THEME.text} tick={{ fontSize: 11 }} domain={[0, 100]} />
                      <Tooltip content={<TTip />} />
                      <Line type="monotone" dataKey="avg_score" stroke="var(--cyan)" strokeWidth={2} dot={{ fill: 'var(--cyan)', r: 3 }} name="Avg Score %" />
                    </LineChart>
                  </ResponsiveContainer>
                </GlassCard>

                {/* Topic weakness */}
                <GlassCard>
                  <h3 style={{ fontFamily: 'Clash Display', fontSize: 16, color: 'var(--text-primary)', marginBottom: '1rem' }}>Topic Weakness Heatmap</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analytics.topic_weakness || []} layout="vertical">
                      <XAxis type="number" stroke={CHART_THEME.text} tick={{ fontSize: 11 }} domain={[0, 100]} />
                      <YAxis dataKey="topic" type="category" stroke={CHART_THEME.text} tick={{ fontSize: 11 }} width={100} />
                      <Tooltip content={<TTip />} />
                      <Bar dataKey="weakness_pct" fill="var(--danger)" radius={4} name="% Students Struggling" />
                    </BarChart>
                  </ResponsiveContainer>
                </GlassCard>

                {/* Score histogram */}
                <GlassCard>
                  <h3 style={{ fontFamily: 'Clash Display', fontSize: 16, color: 'var(--text-primary)', marginBottom: '1rem' }}>Real Test Score Distribution</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analytics.score_distribution || []}>
                      <XAxis dataKey="range" stroke={CHART_THEME.text} tick={{ fontSize: 11 }} />
                      <YAxis stroke={CHART_THEME.text} tick={{ fontSize: 11 }} />
                      <Tooltip content={<TTip />} />
                      <Bar dataKey="count" fill="var(--indigo)" radius={4} name="Students" />
                    </BarChart>
                  </ResponsiveContainer>
                </GlassCard>
              </div>

              {/* Student table */}
              <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(99,102,241,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: 'Clash Display', fontSize: 16, color: 'var(--text-primary)' }}>Student Details</h3>
                  <input className="input-field" style={{ width: 220 }} placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                      {['Student', 'Category', 'Quiz Avg', 'Last Real Test', 'Topics', 'Last Active'].map(h => (
                        <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, i) => (
                      <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(99,102,241,0.07)' : 'none' }}>
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--indigo), var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>{s.name[0]}</div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</p>
                              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem' }}><Badge type={s.category}>{s.category || 'new'}</Badge></td>
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 14, color: (s.avg_score || 0) >= 70 ? 'var(--success)' : (s.avg_score || 0) >= 40 ? 'var(--warning)' : 'var(--danger)', fontWeight: 600 }}>
                            {s.avg_score ? `${Math.round(s.avg_score)}%` : '—'}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--text-secondary)' }}>{s.last_real_test_score != null ? `${s.last_real_test_score}` : '—'}</td>
                        <td style={{ padding: '0.875rem 1.25rem', fontSize: 13, color: 'var(--text-secondary)' }}>{s.topic_count || 0}</td>
                        <td style={{ padding: '0.875rem 1.25rem', fontSize: 12, color: 'var(--text-muted)' }}>{s.last_active ? new Date(s.last_active).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                    {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No students found</td></tr>}
                  </tbody>
                </table>
              </GlassCard>
            </>
          )}

          {!loading && !selectedClass && (
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
              <div style={{ textAlign: 'center' }}>
                <BarChart2 size={48} color="var(--indigo-soft)" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Select a classroom to view analytics</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
