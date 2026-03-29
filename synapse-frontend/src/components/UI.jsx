/* ── StatCard ── */
export function StatCard({ icon: Icon, label, value, color = 'var(--cyan)', trend }) {
  return (
    <div className="glass-card animate-slide-up" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: `${color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {Icon && <Icon size={22} color={color} />}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 2 }}>{label}</p>
        <p style={{ fontFamily: 'Clash Display', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>{value ?? '—'}</p>
        {trend && <p style={{ fontSize: 11, color: trend > 0 ? 'var(--success)' : 'var(--danger)', marginTop: 2 }}>
          {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}% vs last week
        </p>}
      </div>
    </div>
  )
}

/* ── ProgressRing ── */
export function ProgressRing({ percent = 0, size = 64, stroke = 5, color = 'var(--cyan)' }) {
  const r   = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      <text
        x="50%" y="50%"
        textAnchor="middle" dominantBaseline="middle"
        fill="var(--text-primary)"
        fontSize={size * 0.2}
        fontFamily="JetBrains Mono"
        transform={`rotate(90 ${size/2} ${size/2})`}
      >{percent}%</text>
    </svg>
  )
}

/* ── LoadingSpinner ── */
export function LoadingSpinner({ size = 24 }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid rgba(99,102,241,0.2)`,
      borderTop: `2px solid var(--cyan)`,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  )
}

/* ── GlassCard ── */
export function GlassCard({ children, style = {}, className = '', onClick }) {
  return (
    <div
      className={`glass-card ${className}`}
      style={{ padding: '1.25rem', ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

/* ── Badge ── */
export function Badge({ type = 'cyan', children }) {
  const classMap = { weak: 'badge-weak', average: 'badge-average', 'above average': 'badge-above', topper: 'badge-topper', cyan: 'badge-cyan' }
  return <span className={`badge ${classMap[type] || 'badge-cyan'}`}>{children}</span>
}
