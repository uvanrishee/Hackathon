import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Upload, FileText, Tag, X, CheckCircle, Cloud } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import TopBar  from '../../components/TopBar'
import { GlassCard, LoadingSpinner } from '../../components/UI'
import { useAuth } from '../../contexts/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function UploadContent() {
  const { getToken } = useAuth()
  const [params] = useSearchParams()
  const [classrooms, setClassrooms] = useState([])
  const [selectedClass, setSelectedClass] = useState(params.get('classroom') || '')
  const [file, setFile]           = useState(null)
  const [title, setTitle]         = useState('')
  const [tags, setTags]           = useState([])
  const [tagInput, setTagInput]   = useState('')
  const [progress, setProgress]   = useState(0)
  const [uploading, setUploading] = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    const load = async () => {
      const token = await getToken()
      const res   = await fetch(`${API}/classrooms`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setClassrooms((await res.json()).classrooms || [])
    }
    load()
  }, [])

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      setTags(p => [...new Set([...p, tagInput.trim()])])
      setTagInput('')
    }
  }

  const handleUpload = async () => {
    if (!file || !selectedClass || !title) return setError('Please fill all required fields.')
    setError(''); setUploading(true); setProgress(10)

    try {
      const token = await getToken()

      // Upload file as multipart form data directly to Flask backend
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('classroom_id', selectedClass)
      formData.append('topic_tags', JSON.stringify(tags))

      setProgress(40)

      const res = await fetch(`${API}/classrooms/${selectedClass}/materials/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      setProgress(90)

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Upload failed on server')
      }

      setProgress(100)
      setDone(true)
    } catch (err) {
      setError('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const reset = () => { setFile(null); setTitle(''); setTags([]); setProgress(0); setDone(false); setError('') }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>
        <TopBar title="Upload Content" subtitle="Share learning materials with your students" />
        <main style={{ flex: 1, padding: '2rem', maxWidth: 760, width: '100%' }}>

          {done ? (
            <div className="glass-card animate-slide-up" style={{ padding: '3rem', textAlign: 'center' }}>
              <CheckCircle size={52} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
              <h2 style={{ fontFamily: 'Clash Display', fontSize: 24, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Uploaded Successfully!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{title} is now available to students.</p>
              <button className="btn-primary" onClick={reset}>Upload Another</button>
            </div>
          ) : (
            <GlassCard>
              {/* Classroom selector */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Classroom *</label>
                <select className="input-field" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} required>
                  <option value="">Select a classroom</option>
                  {classrooms.map(c => <option key={c.id} value={c.id}>{c.name} — {c.subject}</option>)}
                </select>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { setFile(f); setTitle(prev => prev || f.name.replace(/\.[^.]+$/, '')) } }}
                onClick={() => document.getElementById('fileInput').click()}
                style={{
                  border: `2px dashed ${file ? 'var(--success)' : 'rgba(99,102,241,0.4)'}`,
                  borderRadius: 16, padding: '2.5rem', textAlign: 'center', cursor: 'pointer',
                  background: file ? 'rgba(34,197,94,0.05)' : 'var(--bg-tertiary)',
                  transition: 'all 0.2s', marginBottom: '1.25rem',
                }}
              >
                <input id="fileInput" type="file" accept=".pdf,.pptx,.docx,.jpg,.jpeg,.png,.gif,.txt" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) { setFile(f); setTitle(prev => prev || f.name.replace(/\.[^.]+$/, '')) } }} />
                {file ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                    <FileText size={28} color="var(--success)" />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{Math.round(file.size / 1024)} KB</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setFile(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><X size={16} /></button>
                  </div>
                ) : (
                  <>
                    <Cloud size={40} color="var(--indigo-soft)" style={{ margin: '0 auto 0.75rem' }} />
                    <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>Drag files here or <span style={{ color: 'var(--indigo-soft)' }}>click to browse</span></p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: '0.5rem' }}>PDF, PPTX, DOCX, JPG, PNG — Max 50MB</p>
                  </>
                )}
              </div>

              {/* Title */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Material Title *</label>
                <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Chapter 5 — Newton's Laws" required />
              </div>

              {/* Tags */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Topic Tags</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.5rem' }}>
                  {tags.map(tag => (
                    <span key={tag} className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {tag} <button onClick={() => setTags(p => p.filter(t => t !== tag))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <div style={{ position: 'relative' }}>
                  <Tag size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="input-field" style={{ paddingLeft: '2.25rem' }} value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Type a topic and press Enter..." />
                </div>
              </div>

              {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: '1rem' }}>{error}</p>}

              {uploading && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    <span>Uploading...</span><span>{progress}%</span>
                  </div>
                  <div className="xp-bar-track"><div className="xp-bar-fill" style={{ width: `${progress}%`, transition: 'width 0.4s' }} /></div>
                </div>
              )}

              <button className="btn-primary" onClick={handleUpload} disabled={uploading || !file || !selectedClass || !title} style={{ justifyContent: 'center', width: '100%' }}>
                {uploading ? <LoadingSpinner size={18} /> : <><Upload size={16} /> Upload Material</>}
              </button>
            </GlassCard>
          )}
        </main>
      </div>
    </div>
  )
}
