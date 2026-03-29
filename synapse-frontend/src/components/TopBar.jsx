import { useState, useRef, useEffect } from 'react'
import { Bell, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default function TopBar({ title, subtitle }) {
  const { userProfile, logout, getToken } = useAuth()
  const navigate = useNavigate()
  const [showNotif, setShowNotif]     = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [notifications, setNotifications] = useState([])
  const notifRef   = useRef(null)
  const profileRef = useRef(null)

  // Persist read IDs in localStorage so they survive re-fetches
  const getReadIds = () => {
    try { return new Set(JSON.parse(localStorage.getItem('synapse_read_notifs') || '[]')) }
    catch { return new Set() }
  }
  const saveReadIds = (set) => {
    localStorage.setItem('synapse_read_notifs', JSON.stringify([...set]))
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const unreadCount = notifications.filter(n => n.unread).length

  // ── Fetch real notifications from backend ──────────────────────────
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = await getToken()
        // Get classrooms (works for both teacher and student)
        const cRes = await fetch(`${API}/classrooms`, { headers: { Authorization: `Bearer ${token}` } })
        if (!cRes.ok) return
        const { classrooms = [] } = await cRes.json()

        const notifs = []

        // For each classroom, fetch materials/announcements
        for (const cls of classrooms.slice(0, 5)) { // limit to 5 classrooms to avoid flooding
          const mRes = await fetch(`${API}/classrooms/${cls.id}/materials`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (!mRes.ok) continue
          const { materials = [] } = await mRes.json()

          for (const mat of materials.slice(0, 3)) {
            const isAnn = mat.is_announcement === 1 || mat.is_announcement === true
            const timeAgo = getTimeAgo(mat.created_at)
            notifs.push({
              id: mat.id,
              text: isAnn
                ? `📢 Announcement in "${cls.name}": ${mat.announcement_text?.slice(0, 60) || 'New announcement'}...`
                : `📄 New document in "${cls.name}": ${mat.title}`,
              time: timeAgo,
              unread: isWithinLast24h(mat.created_at),
            })
          }
        }

        // Mark already-read IDs from localStorage
        const readIds = getReadIds()
        const finalNotifs = notifs.slice(0, 10).map(n => ({
          ...n,
          unread: n.unread && !readIds.has(n.id),
        }))
        setNotifications(finalNotifs)
      } catch (e) {
        // silently fail for notifications
      }
    }
    if (userProfile) fetchNotifications()
  }, [userProfile])

  // ── Close dropdowns on outside click ──────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = () => {
    const readIds = getReadIds()
    notifications.forEach(n => readIds.add(n.id))
    saveReadIds(readIds)
    setNotifications(n => n.map(x => ({ ...x, unread: false })))
  }

  const markOneRead = (id) => {
    const readIds = getReadIds()
    readIds.add(id)
    saveReadIds(readIds)
    setNotifications(n => n.map(x => x.id === id ? { ...x, unread: false } : x))
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const goToProfile  = () => { navigate('/profile'); setShowProfile(false) }
  const goToSettings = () => { navigate('/settings'); setShowProfile(false) }

  const dropdownStyle = {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    background: 'var(--bg-secondary)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: 14,
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
    zIndex: 100,
    minWidth: 300,
    overflow: 'hidden',
  }

  return (
    <header style={{
      height: 68,
      background: 'var(--topbar-bg, rgba(8,13,42,0.92))',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(99,102,241,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div>
        <h2 style={{ fontFamily: 'Clash Display', fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>
          {title || `${greeting}, ${userProfile?.name?.split(' ')[0] || 'there'} 👋`}
        </h2>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

        {/* ── Notification Bell ── */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowNotif(p => !p); setShowProfile(false) }}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 10, padding: '0.5rem',
              color: 'var(--text-secondary)', cursor: 'pointer',
              display: 'flex', position: 'relative', transition: 'all 0.2s',
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: 'var(--danger)', color: '#fff',
                borderRadius: '50%', width: 16, height: 16,
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{unreadCount}</span>
            )}
          </button>

          {showNotif && (
            <div style={{ ...dropdownStyle, maxHeight: 380, overflowY: 'auto' }}>
              <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid rgba(99,102,241,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-secondary)' }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>Notifications {unreadCount > 0 && <span style={{ fontSize: 11, color: 'var(--indigo-soft)' }}>({unreadCount} new)</span>}</span>
                {unreadCount > 0 && <button onClick={markAllRead} style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--indigo-soft)', cursor: 'pointer' }}>Mark all read</button>}
              </div>
              {notifications.length === 0 ? (
                <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No notifications yet</p>
              ) : notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => markOneRead(n.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid rgba(99,102,241,0.06)',
                    background: n.unread ? 'rgba(99,102,241,0.06)' : 'transparent',
                    display: 'flex', gap: '0.625rem', alignItems: 'flex-start',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = n.unread ? 'rgba(99,102,241,0.06)' : 'transparent'}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.unread ? 'var(--indigo)' : 'transparent', border: '2px solid rgba(99,102,241,0.4)', flexShrink: 0, marginTop: 5 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4 }}>{n.text}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{n.time}</p>
                  </div>
                  {n.unread && <span style={{ fontSize: 9, background: 'var(--indigo)', color: '#fff', borderRadius: 4, padding: '1px 5px', alignSelf: 'center', flexShrink: 0 }}>NEW</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Account Avatar ── */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowProfile(p => !p); setShowNotif(false) }}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--indigo), var(--cyan))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 14, color: '#fff',
              border: showProfile ? '2px solid var(--cyan)' : '2px solid transparent',
              cursor: 'pointer', transition: 'border 0.2s',
            }}
          >
            {userProfile?.name?.[0]?.toUpperCase() || 'U'}
          </button>

          {showProfile && (
            <div style={dropdownStyle}>
              {/* Profile header */}
              <div style={{ padding: '1rem', borderBottom: '1px solid rgba(99,102,241,0.1)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--indigo), var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#fff', flexShrink: 0 }}>
                  {userProfile?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userProfile?.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userProfile?.email}</p>
                  <span style={{ fontSize: 10, background: 'rgba(99,102,241,0.2)', color: 'var(--indigo-soft)', borderRadius: 4, padding: '1px 6px', textTransform: 'capitalize' }}>{userProfile?.role}</span>
                </div>
              </div>

              {/* Menu items */}
              {[
                { icon: User,     label: 'My Profile', action: goToProfile },
                { icon: Settings, label: 'Settings',   action: goToSettings },
              ].map(({ icon: Icon, label, action }) => (
                <button key={label} onClick={action} style={{
                  width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontSize: 14,
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <Icon size={15} /> {label}
                </button>
              ))}

              <div style={{ borderTop: '1px solid rgba(239,68,68,0.15)', padding: '0.25rem 0' }}>
                <button onClick={handleLogout} style={{
                  width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--danger)', fontSize: 14,
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// Helpers
function getTimeAgo(dateStr) {
  if (!dateStr) return 'Recently'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2)  return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function isWithinLast24h(dateStr) {
  if (!dateStr) return false
  return Date.now() - new Date(dateStr).getTime() < 86400000
}
