import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { GlassCard } from '../components/UI'
import { useAuth } from '../contexts/AuthContext'
import { Bell, Moon, Globe, Shield } from 'lucide-react'

export default function SettingsPage() {
  const { userProfile } = useAuth()
  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif]   = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('synapse_theme') !== 'light')
  const [lang, setLang]             = useState('English')

  const toggleTheme = (dark) => {
    setIsDarkMode(dark)
    const theme = dark ? 'dark' : 'light'
    localStorage.setItem('synapse_theme', theme)
    if (dark) document.documentElement.classList.remove('light-theme')
    else document.documentElement.classList.add('light-theme')
  }

  const Toggle = ({ value, onChange }) => (
    <label style={{ position: 'relative', width: 44, height: 24, cursor: 'pointer', flexShrink: 0 }}>
      <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} checked={value} onChange={e => onChange(e.target.checked)} />
      <span style={{ position: 'absolute', inset: 0, background: value ? 'var(--indigo)' : 'var(--bg-tertiary)', borderRadius: 24, transition: '0.3s', border: '1px solid rgba(99,102,241,0.4)' }}>
        <span style={{ position: 'absolute', top: 3, left: value ? 22 : 3, width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: '0.3s' }} />
      </span>
    </label>
  )

  const Row = ({ icon: Icon, label, desc, control }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 0', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
      <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color="var(--indigo-soft)" />
        </div>
        <div>
          <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{label}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</p>
        </div>
      </div>
      {control}
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>
        <TopBar title="Settings" subtitle="Customize your Synapse experience" />
        <main style={{ flex: 1, padding: '2rem', maxWidth: 640 }}>

          <GlassCard style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Clash Display', fontSize: 15, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Notifications</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Control how you receive updates</p>
            <Row icon={Bell} label="Push Notifications" desc="In-app alerts for announcements & marks" control={<Toggle value={pushNotif} onChange={setPushNotif} />} />
            <Row icon={Bell} label="Email Notifications" desc="Get key updates delivered to your inbox" control={<Toggle value={emailNotif} onChange={setEmailNotif} />} />
          </GlassCard>

          <GlassCard style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Clash Display', fontSize: 15, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Appearance</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Personalize your interface</p>
            <Row icon={Moon} label="Dark Mode" desc="Enable high-contrast dark theme" control={<Toggle value={isDarkMode} onChange={toggleTheme} />} />
            <Row icon={Globe} label="Language" desc="Choose your display language" control={
              <select className="input-field" style={{ width: 120, padding: '0.3rem 0.5rem', fontSize: 13 }} value={lang} onChange={e => setLang(e.target.value)}>
                <option>English</option>
                <option>Tamil</option>
                <option>Hindi</option>
              </select>
            } />
          </GlassCard>

          <GlassCard>
            <h3 style={{ fontFamily: 'Clash Display', fontSize: 15, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Privacy & Security</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Manage your data and account</p>
            <Row icon={Shield} label="Account Security" desc="Protected by Firebase Authentication" control={
              <span style={{ fontSize: 11, color: 'var(--success)', background: 'rgba(34,197,94,0.1)', padding: '3px 10px', borderRadius: 6 }}>Secure ✓</span>
            } />
          </GlassCard>
        </main>
      </div>
    </div>
  )
}
