import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Zap, BookOpen, Users, Brain, Trophy, Calendar, ArrowRight, GraduationCap, Network } from 'lucide-react'

import SynapticCanvas from '../components/SynapticCanvas'

const FEATURES = [
  { icon: Zap,      title: 'AI Notes Refiner',       desc: 'Turn rough notes into structured summaries, flashcards, and key points in seconds.' },
  { icon: BookOpen, title: 'Adaptive Quizzes',        desc: 'Questions auto-tailored to each student\'s performance level — invisibly.' },
  { icon: Users,    title: 'Anonymous Forum',         desc: 'Ask doubts without fear. Anonymous by default, visible only to classmates.' },
  { icon: Brain,    title: 'AI Chatbot Tutor',        desc: 'Chat with an AI tutor trained on your actual classroom materials.' },
  { icon: Trophy,   title: 'Gamified Leaderboards',   desc: 'XP, badges, streaks and 1v1 quiz battles to make revision addictive.' },
  { icon: Calendar, title: 'Exam-Aware Planner',      desc: 'Spaced-repetition schedule tailored to your weak topics before every exam.' },
]

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', overflow: 'hidden' }}>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem 3rem',
        background: 'rgba(5,8,22,0.6)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(99,102,241,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 34, height: 34,
            background: 'linear-gradient(135deg, var(--indigo), var(--cyan))',
            borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Network size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: 'Clash Display', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
            Synapse <span className="gradient-text">Classroom</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/login"><button className="btn-ghost" style={{ padding: '0.5rem 1.25rem', fontSize: 14 }}>Login</button></Link>
          <Link to="/signup"><button className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: 14 }}>Sign Up Free</button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 1.5rem' }}>
        <SynapticCanvas />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, animate: 'fadeIn' }} className="animate-fade-in">
          <div style={{ marginBottom: '1.25rem' }}>
            <span className="badge badge-cyan" style={{ fontSize: 13, padding: '0.3rem 1rem' }}>
              🚀 Built for the future of learning
            </span>
          </div>
          <h1 style={{ fontFamily: 'Clash Display', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 700, lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Where Notes Become{' '}
            <span className="gradient-text">Knowledge</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            AI-powered adaptive learning for students who want to study smarter, not harder — with anonymous peer collaboration built in.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup">
              <button className="btn-primary" style={{ fontSize: 16, padding: '0.875rem 2rem' }}>
                Get Started Free <ArrowRight size={18} />
              </button>
            </Link>
            <a href="#features">
              <button className="btn-ghost" style={{ fontSize: 16, padding: '0.875rem 2rem' }}>
                See How It Works
              </button>
            </a>
          </div>
          {/* Floating stat chips */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '3rem', flexWrap: 'wrap' }}>
            {[['🎓', 'Adaptive Quizzes'], ['🧠', 'AI Notes Refiner'], ['🔒', 'Anonymous Forum'], ['🏆', 'Gamified Learning']].map(([e, l]) => (
              <div key={l} className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 999 }}>
                <span>{e}</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '6rem 3rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontFamily: 'Clash Display', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Everything you need to <span className="gradient-text">learn better</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Six intelligent layers working seamlessly together</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card animate-slide-up" style={{ padding: '1.75rem' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'rgba(34,211,238,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                <Icon size={26} color="var(--cyan)" />
              </div>
              <h3 style={{ fontFamily: 'Clash Display', fontSize: 18, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        margin: '0 3rem 6rem',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(34,211,238,0.08) 100%)',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: 24,
        padding: '4rem 2rem',
        textAlign: 'center',
      }}>
        <h2 style={{ fontFamily: 'Clash Display', fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Ready to transform how you learn?
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: 16 }}>
          Join students and teachers already using Synapse Classroom
        </p>
        <Link to="/signup">
          <button className="btn-primary" style={{ fontSize: 16, padding: '0.875rem 2.5rem' }}>
            Create Your Free Account →
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(99,102,241,0.1)', padding: '1.5rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>© 2026 Synapse Classroom. Built for the hackathon.</span>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Features', 'Login', 'Sign Up'].map(l => (
            <Link key={l} to={l === 'Features' ? '#features' : `/${l.toLowerCase().replace(' ', '')}`}
              style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
              {l}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  )
}
