import { useState, useEffect, useRef } from 'react'
import { Sparkles, FileText, BrainCircuit, Users, BookOpen, Save, RefreshCw } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import TopBar  from '../../components/TopBar'
import { GlassCard, LoadingSpinner } from '../../components/UI'
import { useAuth } from '../../contexts/AuthContext'
import { storage } from '../../firebase'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { Upload, Download, FilePlus, X } from 'lucide-react'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function NotesRefiner() {
  const { getToken, userProfile } = useAuth()
  const [topics, setTopics] = useState([])
  const [loadingTopics, setLoadingTopics] = useState(true)
  
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [activeTab, setActiveTab] = useState('my_notes') // 'my_notes' | 'friends'
  
  // My Note State
  const [noteId, setNoteId] = useState(null)
  const [originalText, setOriginalText] = useState('')
  const [lastSavedText, setLastSavedText] = useState('')
  const [refinedSummary, setRefinedSummary] = useState('')
  const [flashcards, setFlashcards] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [isRefining, setIsRefining] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  // Friends Notes State
  const [friendsNotes, setFriendsNotes] = useState([])
  const [loadingFriends, setLoadingFriends] = useState(false)

  // 1. Fetch Classrooms/Topics
  useEffect(() => {
    const loadTopics = async () => {
      setLoadingTopics(true)
      try {
        const token = await getToken()
        const res = await fetch(`${API}/student/topics`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          const data = await res.json()
          setTopics(data.topics || [])
          if (data.topics && data.topics.length > 0) {
            setSelectedTopic(data.topics[0])
          }
        }
      } catch (err) {
        console.error('Failed to load topics', err)
      } finally {
        setLoadingTopics(false)
      }
    }
    loadTopics()
  }, [])

  // Group topics by classroom
  const classrooms = topics.reduce((acc, t) => {
    if (!acc[t.classroom_name]) acc[t.classroom_name] = []
    acc[t.classroom_name].push(t)
    return acc
  }, {})

  // 2. Fetch My Note when Topic changes
  useEffect(() => {
    if (!selectedTopic) return
    const fetchNote = async () => {
      try {
        setFetchError('')
        const token = await getToken()
        const res = await fetch(`${API}/student/notes/topic/${selectedTopic.id}`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          const data = await res.json()
          if (data.note) {
            setNoteId(data.note.id)
            setOriginalText(data.note.original_text || '')
            setLastSavedText(data.note.original_text || '')
            setRefinedSummary(data.note.refined_summary || '')
            setFlashcards(data.note.flashcards || [])
            setFileUrl(data.note.file_url || '')
          } else {
            setNoteId(null)
            setOriginalText('')
            setLastSavedText('')
            setRefinedSummary('')
            setFlashcards([])
            setFileUrl('')
          }
        }
      } catch (err) {
        setFetchError('Failed to load note.')
      }
    }
    
    // Reset and fetch
    setNoteId(null); setOriginalText(''); setRefinedSummary(''); setFlashcards([]); setFileUrl('')
    fetchNote()
    setActiveTab('my_notes')
  }, [selectedTopic])

  // 3. Fetch Friends Notes when Tab switches
  useEffect(() => {
    if (activeTab === 'friends' && selectedTopic) {
      const fetchFriends = async () => {
        setLoadingFriends(true)
        try {
          const token = await getToken()
          const res = await fetch(`${API}/student/notes/friends/${selectedTopic.id}`, { headers: { Authorization: `Bearer ${token}` } })
          if (res.ok) {
            const data = await res.json()
            setFriendsNotes(data.friends_notes || [])
          }
        } catch (err) {
          console.error(err)
        } finally {
          setLoadingFriends(false)
        }
      }
      fetchFriends()
    }
  }, [activeTab, selectedTopic])

  // 4. Auto-save Original Text
  useEffect(() => {
    if (originalText === lastSavedText || !selectedTopic) return
    
    const handler = setTimeout(async () => {
      setIsSaving(true)
      try {
        const token = await getToken()
        const res = await fetch(`${API}/student/notes/topic/${selectedTopic.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            classroom_id: selectedTopic.classroom_id,
            title: `Note: ${selectedTopic.topic_name}`,
            original_text: originalText,
            file_url: fileUrl
          })
        })
        if (res.ok) {
          const data = await res.json()
          setNoteId(data.id) // update note ID in case this was creation
          setLastSavedText(originalText)
        }
      } catch (err) {
        console.error('Auto-save failed', err)
      } finally {
        setIsSaving(false)
      }
    }, 1500)

    return () => clearTimeout(handler)
  }, [originalText, lastSavedText, selectedTopic])

  // 5. Refine Notes Action
  const handleRefine = async () => {
    if (!originalText.trim() && !fileUrl) return alert("Please type your original notes or upload a file first.")
    setIsRefining(true)
    try {
      const token = await getToken()
      // Call AI to refine
      const resAI = await fetch(`${API}/ai/notes/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          text: originalText, 
          file_url: fileUrl, 
          file_type: fileUrl?.endsWith('.pdf') ? 'pdf' : 'text' 
        })
      })
      const aiData = await resAI.json()
      if (!resAI.ok) throw new Error(aiData.error || 'AI processing failed')
      
      const summary = aiData.refined.summary + '\n\nKey Points:\n' + (aiData.refined.key_points || []).join('\n')
      const cards = aiData.refined.flashcards || []
      
      setRefinedSummary(summary)
      setFlashcards(cards)

      // Save the refinement to DB if Note exists
      if (noteId) {
        await fetch(`${API}/student/notes/${noteId}/refine`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            refined_summary: summary,
            flashcards: cards
          })
        })
      }
    } catch (err) {
      alert("Error refining notes: " + err.message)
    } finally {
      setIsRefining(false)
    }
  }

  // 6. Manual Save Action
  const handleManualSave = async () => {
    if (!selectedTopic) return
    setIsSaving(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API}/student/notes/topic/${selectedTopic.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          classroom_id: selectedTopic.classroom_id,
          title: `Note: ${selectedTopic.topic_name}`,
          original_text: originalText,
          file_url: fileUrl
        })
      })
      if (res.ok) {
        const data = await res.json()
        setNoteId(data.id)
        setLastSavedText(originalText)
        alert('Original notes saved successfully!')
      }
    } catch (err) {
      alert("Failed to save notes.")
    } finally {
      setIsSaving(false)
    }
  }

  // 7. Handle File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setIsUploading(true)
    try {
      const token = await getToken()
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`${API}/student/notes/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }, // Form data sets content-type automatically
        body: formData
      })
      if (!res.ok) throw new Error('Upload failed')
      
      const data = await res.json()
      setFileUrl(API + data.file_url)
      alert("File uploaded successfully!")
    } catch (err) {
      console.error(err)
      alert('Error initiating upload.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        <TopBar title="Note Hub" subtitle="Type, structure, and collaborate on your classroom notes" />
        
        <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* LEFT: Topics Sidebar Navigation */}
          <div style={{ width: 280, borderRight: '1px solid var(--bg-tertiary)', background: 'var(--bg-secondary)', overflowY: 'auto', padding: '1.5rem 1rem' }}>
            <h3 style={{ fontFamily: 'Clash Display', fontSize: 16, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={16} /> My Subjects
            </h3>
            
            {loadingTopics ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}><LoadingSpinner size={24} /></div>
            ) : topics.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>No topics found.</p>
            ) : Object.keys(classrooms).map(classroomName => (
              <div key={classroomName} style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
                  {classroomName}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {classrooms[classroomName].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTopic(t)}
                      style={{
                        padding: '0.625rem 0.75rem', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
                        fontSize: 13, transition: '0.2s',
                        background: selectedTopic?.id === t.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                        color: selectedTopic?.id === t.id ? 'var(--cyan)' : 'var(--text-secondary)',
                        fontWeight: selectedTopic?.id === t.id ? 600 : 400
                      }}
                    >
                      <FileText size={14} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle', opacity: 0.7 }} />
                      <span style={{ verticalAlign: 'middle' }}>{t.topic_name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Notes Area */}
          <div style={{ flex: 1, padding: '1.5rem 2rem', overflowY: 'auto' }}>
            {!selectedTopic ? (
               <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                 <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                 <p>Select a topic from the left to view or edit notes.</p>
               </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: 'Clash Display', fontSize: 24, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {selectedTopic.topic_name}
                  </h2>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{selectedTopic.classroom_name}</p>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-secondary)', borderRadius: 12, padding: '0.25rem', marginBottom: '1.5rem', width: 'fit-content' }}>
                  <button onClick={() => setActiveTab('my_notes')} style={{ padding: '0.625rem 1.5rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: activeTab === 'my_notes' ? 'rgba(99,102,241,0.2)' : 'transparent', color: activeTab === 'my_notes' ? 'var(--indigo)' : 'var(--text-secondary)' }}>
                    My Notes
                  </button>
                  <button onClick={() => setActiveTab('friends')} style={{ padding: '0.625rem 1.5rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: activeTab === 'friends' ? 'rgba(99,102,241,0.2)' : 'transparent', color: activeTab === 'friends' ? 'var(--indigo)' : 'var(--text-secondary)' }}>
                    <Users size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} /> Friends' Notes
                  </button>
                </div>

                {fetchError && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: '1rem' }}>{fetchError}</p>}

                {/* Content Area */}
                {activeTab === 'my_notes' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', flex: 1, minHeight: 0, paddingRight: '0.5rem' }}>
                    
                    {/* Raw Notes Pane */}
                    <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(99,102,241,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Original Notes</span>
                        {isSaving ? (
                           <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><RefreshCw size={10} className="animate-spin" /> Saving...</span>
                        ) : originalText === lastSavedText && noteId ? (
                           <span style={{ fontSize: 11, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}><Save size={10} /> Saved</span>
                        ) : null}
                      </div>
                      <textarea
                        style={{ flex: 1, outline: 'none', border: 'none', background: 'transparent', padding: '1rem', resize: 'none', color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6, fontFamily: 'JetBrains Mono' }}
                        placeholder="Type or paste your rough class notes for this topic here..."
                        value={originalText}
                        onChange={e => setOriginalText(e.target.value)}
                      />

                      {/* File Display & Upload Area */}
                      <div style={{ padding: '0 1rem 1rem' }}>
                        {fileUrl ? (
                          <div style={{ background: 'rgba(34,211,238,0.1)', padding: '0.75rem', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', border: '1px solid rgba(34,211,238,0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                               <FileText size={16} color="var(--cyan)" />
                               <span style={{ fontSize: 13, color: 'var(--text-primary)', textDecoration: 'none' }}>Attached Learning File</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <a href={fileUrl} target="_blank" rel="noreferrer" className="btn-ghost" style={{ padding: '0.3rem', borderRadius: 6 }}><Download size={14} /></a>
                                <button onClick={() => setFileUrl('')} className="btn-ghost" style={{ padding: '0.3rem', borderRadius: 6, color: 'var(--danger)' }}><X size={14} /></button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => document.getElementById('noteFileInput').click()}
                            style={{ border: '2px dashed rgba(99,102,241,0.2)', borderRadius: 12, padding: '1rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(99,102,241,0.02)', transition: '0.2s' }}
                          >
                            <input id="noteFileInput" type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
                            {isUploading ? <LoadingSpinner size={20} /> : (
                              <div style={{ color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <FilePlus size={16} /> <span>Upload File Resources</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid rgba(99,102,241,0.1)' }}>
                         <button className="btn-primary" onClick={handleManualSave} disabled={isSaving || (originalText === lastSavedText && !fileUrl)} style={{ width: '100%', justifyContent: 'center', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid rgba(99,102,241,0.2)' }}>
                           <Save size={16} /> Save Original Notes
                         </button>
                         <button className="btn-primary" onClick={handleRefine} disabled={isRefining || !originalText.trim()} style={{ width: '100%', justifyContent: 'center' }}>
                           {isRefining ? <LoadingSpinner size={16} /> : <><Sparkles size={16} /> Refine with AI</>}
                         </button>
                      </div>
                    </div>

                    {/* Refined Summary & Flashcards Pane */}
                    <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid rgba(34,211,238,0.2)', borderRadius: 16, background: 'var(--bg-tertiary)', overflowY: 'auto' }}>
                      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(34,211,238,0.1)', background: 'var(--bg-secondary)', position: 'sticky', top: 0, zIndex: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--cyan)' }}>AI Refined Structured Notes</span>
                      </div>
                      <div style={{ padding: '1.5rem', flex: 1 }}>
                        {!refinedSummary ? (
                          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>
                             <BrainCircuit size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
                             <p style={{ fontSize: 14, maxWidth: 250, margin: '0 auto' }}>Click 'Refine with AI' to transform your raw notes into an organized summary and flashcards.</p>
                          </div>
                        ) : (
                          <div className="animate-fade-in">
                            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Summary & Key Points</h3>
                            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: '2rem' }}>
                              {refinedSummary}
                            </div>
                            
                            {flashcards && flashcards.length > 0 && (
                              <>
                                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--warning)', marginBottom: '1rem' }}>Generated Flashcards</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                  {flashcards.map((fc, i) => (
                                    <div key={i} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.05)' }}>
                                      <p style={{ fontSize: 12, color: 'var(--indigo-soft)', fontWeight: 600, marginBottom: '0.25rem' }}>Q: {fc.question}</p>
                                      <p style={{ fontSize: 13, color: 'var(--text-primary)' }}>A: {fc.answer}</p>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                )}

                {/* Friends Notes Tab */}
                {activeTab === 'friends' && (
                  <div style={{ paddingBottom: '2rem' }}>
                    {loadingFriends ? (
                       <div style={{ textAlign: 'center', padding: '3rem' }}><LoadingSpinner size={32} /></div>
                    ) : friendsNotes.length === 0 ? (
                       <GlassCard style={{ textAlign: 'center', padding: '3rem' }}>
                         <Users size={48} color="var(--indigo-soft)" style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
                         <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>None of your friends have created notes for this topic yet.</p>
                       </GlassCard>
                    ) : (
                       <div style={{ display: 'column', gap: '1.5rem' }}>
                         {friendsNotes.map(n => (
                           <GlassCard key={n.id} style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--cyan)' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                               <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{n.author_name}'s Notes</h3>
                               <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(n.created_at).toLocaleDateString()}</p>
                             </div>
                             
                             {n.refined_summary ? (
                               <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                 {n.refined_summary}
                               </div>
                             ) : (
                               <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                 <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Raw Notes:</span><br/>
                                 {n.original_text || "No content."}
                               </div>
                             )}

                             {n.file_url && (
                               <div style={{ marginTop: '0.75rem' }}>
                                 <a href={n.file_url} target="_blank" rel="noreferrer" className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.5rem 0.75rem', borderRadius: 8, background: 'rgba(34,211,238,0.05)', fontSize: 13, textDecoration: 'none' }}>
                                   <FileText size={14} color="var(--cyan)" />
                                   <span>View Friend's Attached Resource</span>
                                 </a>
                               </div>
                             )}

                             {n.flashcards && n.flashcards.length > 0 && (
                               <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(99,102,241,0.1)' }}>
                                 <h4 style={{ fontSize: 13, color: 'var(--indigo-soft)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.75rem' }}>Flashcards ({n.flashcards.length})</h4>
                                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
                                   {n.flashcards.map((fc, i) => (
                                     <div key={i} style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 8, fontSize: 12 }}>
                                       <strong>Q:</strong> {fc.question}<br/>
                                       <strong style={{ color: 'var(--text-muted)' }}>A:</strong> {fc.answer}
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             )}
                           </GlassCard>
                         ))}
                       </div>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  )
}
