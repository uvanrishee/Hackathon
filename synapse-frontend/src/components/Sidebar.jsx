import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Home, BookOpen, Brain, FileText, Zap, BarChart2,
  ClipboardList, MessageCircle, Users, Trophy, Settings, LogOut,
  GraduationCap, Sparkles, AlertCircle, Network
} from 'lucide-react'

const TEACHER_NAV = [
  { icon: Home,          label: 'Dashboard',       to: '/teacher/dashboard' },
  { icon: BookOpen,      label: 'My Classrooms',   to: '/teacher/dashboard' },
  { icon: FileText,      label: 'Upload Content',  to: '/teacher/upload' },
  { icon: Zap,           label: 'AI Quiz Gen',     to: '/teacher/quiz-generator' },
  { icon: ClipboardList, label: 'Test Marks',      to: '/teacher/marks' },
  { icon: BarChart2,     label: 'Analytics',       to: '/teacher/analytics' },
]

const STUDENT_NAV = [
  { icon: Home,          label: 'Dashboard',       to: '/student/dashboard' },
  { icon: BookOpen,      label: 'My Classrooms',   to: '/student/dashboard' },
  { icon: Brain,         label: 'Learn',           to: '/student/learn' },
  { icon: Zap,           label: 'Quizzes',         to: '/student/quizzes' },
  { icon: Sparkles,      label: 'Note Hub',        to: '/student/notes' },
  { icon: MessageCircle, label: 'AI Chatbot',      to: '/student/chatbot' },
  { icon: AlertCircle,   label: 'Mistake Corner',  to: '/student/mistakes' },
  { icon: Users,         label: 'Forum',           to: '/student/forum/all' },
  { icon: Trophy,        label: 'Friends & LB',    to: '/student/social' },
]

export default function Sidebar() {
  const { userProfile, logout } = useAuth()
  const navigate = useNavigate()
  const isTeacher = userProfile?.role === 'teacher'
  const navItems  = isTeacher ? TEACHER_NAV : STUDENT_NAV

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside style={{
      width: 260,
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid rgba(99,102,241,0.15)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, var(--indigo), var(--cyan))',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Network size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Clash Display', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Synapse
            </h1>
            <p style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'DM Sans' }}>Classroom</p>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div style={{ padding: '0.75rem 1.25rem' }}>
        <span className={`badge ${isTeacher ? 'badge-above' : 'badge-cyan'}`}>
          {isTeacher ? '🎓 Teacher' : '📚 Student'}
        </span>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '0.5rem 0.75rem', overflowY: 'auto' }}>
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to + label}
            to={to}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            style={{ marginBottom: 4, textDecoration: 'none' }}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(99,102,241,0.1)' }}>
        {/* User info */}
        {userProfile && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.625rem 0.75rem', marginBottom: 8,
            background: 'var(--bg-tertiary)', borderRadius: 12,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--indigo), var(--cyan))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff',
            }}>
              {userProfile.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userProfile.name}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {isTeacher ? '🎓 Educator' : `${userProfile.xp || 0} XP`}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-item"
          style={{ width: '100%', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
