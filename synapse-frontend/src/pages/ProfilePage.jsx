import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import { GlassCard } from '../components/UI'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Shield, Calendar } from 'lucide-react'

export default function ProfilePage() {
  const { userProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(userProfile?.name || '')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>
        <TopBar title="My Profile" subtitle="Manage your account details" />
        <main style={{ flex: 1, padding: '2rem', maxWidth: 640 }}>
          <GlassCard style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--indigo), var(--cyan))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {userProfile?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 style={{ fontFamily: 'Clash Display', fontSize: 22, color: 'var(--text-primary)', marginBottom: 4 }}>{userProfile?.name}</h2>
              <span style={{ fontSize: 12, background: 'rgba(99,102,241,0.2)', color: 'var(--indigo-soft)', borderRadius: 6, padding: '2px 10px', textTransform: 'capitalize' }}>
                {userProfile?.role}
              </span>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 style={{ fontFamily: 'Clash Display', fontSize: 16, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Account Details</h3>
            {[
              { icon: User,     label: 'Full Name', value: userProfile?.name },
              { icon: Mail,     label: 'Email',     value: userProfile?.email },
              { icon: Shield,   label: 'Role',      value: userProfile?.role },
              { icon: Calendar, label: 'Account ID', value: userProfile?.id?.slice(0, 12) + '...' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.875rem 0',
                borderBottom: '1px solid rgba(99,102,241,0.08)',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color="var(--indigo-soft)" />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</p>
                  <p style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{value || '—'}</p>
                </div>
              </div>
            ))}
          </GlassCard>

          {/* Student Game Profile Stats */}
          {userProfile?.role === 'student' && (
            <GlassCard>
              <h3 style={{ fontFamily: 'Clash Display', fontSize: 16, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Achievements & Stats</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: 12, border: '1px solid rgba(34,211,238,0.2)' }}>
                  <div style={{ fontSize: 28, marginBottom: '0.5rem' }}>🏆</div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total XP</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 20, fontWeight: 700, color: 'var(--cyan)' }}>{userProfile.xp || 0}</p>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: 12, border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div style={{ fontSize: 28, marginBottom: '0.5rem' }}>🔥</div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Daily Streak</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 20, fontWeight: 700, color: 'var(--warning)' }}>{userProfile.streak || 0}</p>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: 12, border: '1px solid rgba(34,197,94,0.2)' }}>
                  <div style={{ fontSize: 28, marginBottom: '0.5rem' }}>🛡️</div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Raid Badges</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>{userProfile.badges || 0}</p>
                </div>
              </div>

              {/* Render visual badges if any */}
              {userProfile?.badges > 0 && (
                <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(34,197,94,0.05)', borderRadius: 12, border: '1px solid rgba(34,197,94,0.15)' }}>
                  <h4 style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={16} color="var(--success)" /> Earned Raid Badges
                  </h4>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {Array.from({ length: userProfile.badges }).map((_, i) => (
                      <div key={i} title="Boss Defeated!" style={{
                        width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e, #10b981)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                        boxShadow: '0 4px 12px rgba(34,197,94,0.3)', border: '2px solid rgba(255,255,255,0.2)'
                      }}>
                        🛡️
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          )}
        </main>
      </div>
    </div>
  )
}
