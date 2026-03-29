import { useState, useEffect } from 'react'
import { ClipboardList, Upload, Plus, Save } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import TopBar  from '../../components/TopBar'
import { GlassCard, LoadingSpinner } from '../../components/UI'
import { useAuth } from '../../contexts/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function gradeFor(score, max) {
  const pct = (score / max) * 100
  return pct >= 90 ? 'A' : pct >= 75 ? 'B' : pct >= 60 ? 'C' : pct >= 45 ? 'D' : 'F'
}

const gradeColor = { A: 'var(--success)', B: 'var(--cyan)', C: 'var(--warning)', D: '#f97316', F: 'var(--danger)' }

export default function RealTestMarks() {
  const { getToken } = useAuth()
  const [classrooms, setClassrooms] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [tests, setTests]   = useState([])
  const [selectedTest, setSelectedTest] = useState(null)
  const [students, setStudents] = useState([])
  const [marks, setMarks]   = useState({})
  const [tab, setTab]       = useState('manual')
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newTest, setNewTest] = useState({ name: '', max_marks: '', test_date: '' })
  const [summary, setSummary] = useState(null)
  const [error, setError]   = useState('')
  const [saveMsg, setSaveMsg] = useState('')

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
    const load = async () => {
      const token = await getToken()
      const [tRes, sRes] = await Promise.all([
        fetch(`${API}/classrooms/${selectedClass}/real-tests`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/classrooms/${selectedClass}/students`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (tRes.ok) setTests((await tRes.json()).tests || [])
      if (sRes.ok) setStudents((await sRes.json()).students || [])
    }
    load()
  }, [selectedClass])

  // Load saved marks whenever the teacher selects a test
  useEffect(() => {
    if (!selectedTest) return
    const load = async () => {
      const token = await getToken()
      const res = await fetch(`${API}/real-tests/${selectedTest.id}/marks`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        const prefilled = {}
        for (const entry of data.marks || []) {
          prefilled[entry.student_id] = entry.marks_obtained
        }
        setMarks(prefilled)
      }
    }
    load()
  }, [selectedTest?.id])

  const createTest = async () => {
    if (!newTest.name || !newTest.max_marks) return setError('Fill test name and max marks.')
    setCreating(true)
    const token = await getToken()
    const res = await fetch(`${API}/classrooms/${selectedClass}/real-tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newTest),
    })
    const data = await res.json()
    if (res.ok) { setTests(p => [data.test, ...p]); setSelectedTest(data.test); setNewTest({ name: '', max_marks: '', test_date: '' }) }
    setCreating(false)
  }

  const saveMarks = async () => {
    if (!selectedTest) return
    setSaving(true); setSummary(null); setSaveMsg('')
    const token = await getToken()
    const marksArray = students.map(s => ({ student_id: s.id, marks: parseFloat(marks[s.id] ?? '') || 0 }))
    const res = await fetch(`${API}/real-tests/${selectedTest.id}/marks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ marks: marksArray }),
    })
    const data = await res.json()
    if (res.ok) {
      setSummary(data.summary)
      setSaveMsg('✅ Marks saved successfully!')
    } else {
      setSaveMsg('❌ Failed to save marks: ' + (data.error || 'Unknown error'))
    }
    setSaving(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>
        <TopBar title="Real Test Marks" subtitle="Record offline exam results and update student categories" />
        <main style={{ flex: 1, padding: '2rem', display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* Left: test list */}
          <div>
            <GlassCard style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'Clash Display', fontSize: 16, color: 'var(--text-primary)', marginBottom: '1rem' }}>Classroom</h3>
              <select className="input-field" value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedTest(null) }}>
                <option value="">Select classroom...</option>
                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </GlassCard>

            {selectedClass && (
              <GlassCard style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'Clash Display', fontSize: 15, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Create Test</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <input className="input-field" placeholder="Test name *" value={newTest.name} onChange={e => setNewTest(p => ({ ...p, name: e.target.value }))} />
                  <input className="input-field" type="number" placeholder="Max marks *" value={newTest.max_marks} onChange={e => setNewTest(p => ({ ...p, max_marks: e.target.value }))} />
                  <input className="input-field" type="date" value={newTest.test_date} onChange={e => setNewTest(p => ({ ...p, test_date: e.target.value }))} />
                  <button className="btn-primary" onClick={createTest} disabled={creating} style={{ justifyContent: 'center' }}>
                    {creating ? <LoadingSpinner size={16} /> : <><Plus size={15} /> Create Test</>}
                  </button>
                </div>
                {error && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: '0.5rem' }}>{error}</p>}
              </GlassCard>
            )}

            {tests.length > 0 && (
              <GlassCard>
                <h3 style={{ fontFamily: 'Clash Display', fontSize: 15, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Tests</h3>
                {tests.map(t => (
                  <button key={t.id} onClick={() => setSelectedTest(t)} style={{
                    width: '100%', textAlign: 'left', background: selectedTest?.id === t.id ? 'rgba(99,102,241,0.15)' : 'var(--bg-tertiary)',
                    border: `1px solid ${selectedTest?.id === t.id ? 'var(--indigo)' : 'transparent'}`,
                    borderRadius: 10, padding: '0.625rem 0.875rem', cursor: 'pointer', marginBottom: '0.5rem', transition: 'all 0.2s',
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Max: {t.max_marks} pts · {t.test_date || 'No date'}</p>
                  </button>
                ))}
              </GlassCard>
            )}
          </div>

          {/* Right: marks entry */}
          {selectedTest ? (
            <div className="animate-slide-up">
              <GlassCard style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontFamily: 'Clash Display', fontSize: 20, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{selectedTest.name}</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Max: {selectedTest.max_marks} marks · Enter 0 if absent</p>
              </GlassCard>

              <GlassCard style={{ padding: 0, overflow: 'hidden', marginBottom: '1.25rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                      {['Student', 'Marks Obtained', 'Grade'].map(h => (
                        <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => {
                      const m = marks[s.id] ?? ''
                      const grade = m !== '' ? gradeFor(parseFloat(m), selectedTest.max_marks) : '—'
                      return (
                        <tr key={s.id} style={{ borderBottom: i < students.length - 1 ? '1px solid rgba(99,102,241,0.07)' : 'none' }}>
                          <td style={{ padding: '0.75rem 1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--indigo), var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>{s.name[0]}</div>
                              <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{s.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem 1.25rem' }}>
                            <input className="input-field" type="number" min={0} max={selectedTest.max_marks}
                              style={{ width: 100, fontFamily: 'JetBrains Mono' }}
                              value={m} onChange={e => setMarks(p => ({ ...p, [s.id]: e.target.value }))}
                              placeholder="0" />
                          </td>
                          <td style={{ padding: '0.75rem 1.25rem' }}>
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 18, fontWeight: 700, color: gradeColor[grade] || 'var(--text-muted)' }}>{grade}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </GlassCard>

              <button className="btn-primary" onClick={saveMarks} disabled={saving} style={{ fontSize: 15 }}>
                {saving ? <LoadingSpinner size={18} /> : <><Save size={16} /> Save All Marks</>}
              </button>
              {saveMsg && (
                <p style={{ marginTop: '0.75rem', fontSize: 14, color: saveMsg.startsWith('✅') ? 'var(--success)' : 'var(--danger)' }}>{saveMsg}</p>
              )}

              {summary && (
                <GlassCard style={{ marginTop: '1.5rem' }} className="animate-slide-up">
                  <h3 style={{ fontFamily: 'Clash Display', fontSize: 16, color: 'var(--success)', marginBottom: '0.75rem' }}>✅ Marks Saved — Category Update Summary</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                    {Object.entries(summary).map(([cat, count]) => (
                      <div key={cat} style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 10 }}>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 700, color: 'var(--cyan)' }}>{count}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{cat.replace('_', ' ')}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </div>
          ) : (
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
              <div style={{ textAlign: 'center' }}>
                <ClipboardList size={40} color="var(--indigo-soft)" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>Select a classroom and create or choose a test</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
