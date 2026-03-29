import { useState, useEffect, useCallback } from 'react'
import { Trophy, Users, Sword, Flame, Crown, Check, X, Shield, PlusCircle, Zap, Star, AlertTriangle, ChevronRight } from 'lucide-react'
import Sidebar from '../../components/Sidebar'
import TopBar  from '../../components/TopBar'
import { GlassCard, LoadingSpinner, Badge } from '../../components/UI'
import { useAuth } from '../../contexts/AuthContext'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const TABS = ['Leaderboards', 'Friends', 'Battles']

// ─── Boss Battle Arena Modal ─────────────────────────────────────────────────
function BossArena({ battle, myId, onClose, onSubmitScore }) {
  const [phase, setPhase] = useState('intro')   // intro | fighting | result
  const [score, setScore]   = useState(0)
  const [round, setRound]   = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const { getToken } = useAuth()
  const [questions, setQuestions] = useState([])
  const [loadingQs, setLoadingQs] = useState(false)

  // Fetch questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingQs(true)
      try {
        const token = await getToken()
        const res = await fetch(`${API}/social/battles/questions`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setQuestions(data.questions || [])
        }
      } catch (err) {
        console.error("Failed to fetch battle questions", err)
      } finally {
        setLoadingQs(false)
      }
    }
    fetchQuestions()
  }, [getToken])

  const TOTAL_ROUNDS = questions.length > 0 ? questions.length : 5 // fallback

  const BOSS_ATTACKS = ['🔥 Fire Blast', '⚡ Thunder Strike', '❄️ Ice Shard', '☠️ Dark Energy', '🌊 Tidal Wave']
  const [bossAttack, setBossAttack] = useState('')
  const [feedback, setFeedback] = useState(null)

  const isChallenger = battle.player1_id === myId
  const opponentName = isChallenger ? battle.player2_name : battle.player1_name

  const launchFight = () => {
    setPhase('fighting')
    setBossAttack(BOSS_ATTACKS[Math.floor(Math.random() * BOSS_ATTACKS.length)])
  }

  const answerQuestion = (selectedOption) => {
    if (round >= TOTAL_ROUNDS) return
    const currentQ = questions[round]
    
    // Check if correct
    const isCorrect = currentQ && selectedOption === currentQ.correct_option
    
    // hit deals 1 dmg for this version
    const dmg = isCorrect ? 1 : 0
    const newScore = score + dmg
    const newRound = round + 1
    
    setScore(newScore)
    setRound(newRound)
    
    if (isCorrect) {
       setFeedback({ msg: '💥 GREAT HIT! Correct Answer!', ok: true })
    } else {
       setFeedback({ msg: '❌ Miss! Wrong Answer.', ok: false })
    }
    
    setBossAttack(BOSS_ATTACKS[Math.floor(Math.random() * BOSS_ATTACKS.length)])
    
    setTimeout(() => setFeedback(null), 800)
    
    if (newRound >= TOTAL_ROUNDS) {
      setTimeout(() => {
        setPhase('result')
      }, 1000)
    }
  }

  const handleSubmit = async () => {
    if (submitted) return
    setSubmitted(true)
    await onSubmitScore(battle.id, score)
  }

  const scorePercent = (score / TOTAL_ROUNDS) * 100
  const bossHp = Math.max(0, 100 - scorePercent * 2) // scale so boss dies at 50% hit rate or so (configurable)
  const isWinner = score >= (TOTAL_ROUNDS / 2) // simple win condition

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        width: '100%', maxWidth: 640,
        background: 'linear-gradient(135deg, #0d1117, #0f172a)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 0 60px rgba(99,102,241,0.15)',
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sword size={20} color="#6366f1" />
            <span style={{ fontFamily: 'Clash Display', fontSize: 16, color: '#fff' }}>Boss Raid Arena</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'rgba(99,102,241,0.1)', padding: '0.25rem 0.75rem', borderRadius: 20 }}>vs {opponentName}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* INTRO PHASE */}
          {phase === 'intro' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 72, marginBottom: '1rem', animation: 'pulse 2s infinite' }}>🐉</div>
              <h2 style={{ fontFamily: 'Clash Display', fontSize: 24, color: '#fff', marginBottom: '0.5rem' }}>The Ancient Boss Awakes!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: '0.5rem' }}>
                You and <strong style={{ color: 'var(--cyan)' }}>{opponentName}</strong> have summoned a boss.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: '2rem' }}>
                Answer questions from your loaded subjects to attack the boss!
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '0.75rem 1.25rem', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Questions</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 18, fontWeight: 700, color: 'var(--indigo-soft)' }}>
                    {loadingQs ? '...' : TOTAL_ROUNDS}
                  </p>
                </div>
                <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '0.75rem 1.25rem', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>XP Reward</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 18, fontWeight: 700, color: 'var(--warning)' }}>50+</p>
                </div>
                <div style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: 10, padding: '0.75rem 1.25rem', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Badge</p>
                  <p style={{ fontSize: 18 }}>🛡️</p>
                </div>
              </div>
              <button 
                className="btn-primary" 
                onClick={launchFight} 
                disabled={loadingQs || questions.length === 0}
                style={{ fontSize: 15, padding: '0.75rem 2rem', opacity: (loadingQs || questions.length===0) ? 0.6 : 1 }}
              >
                {loadingQs ? 'Loading Questions...' : '⚔️ Enter Battle'}
              </button>
            </div>
          )}

          {/* FIGHTING PHASE */}
          {phase === 'fighting' && (
            <div>
              {/* Boss HP Bar */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#ff4444' }}>🐉 Boss HP</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--text-muted)' }}>{Math.round(bossHp)}%</span>
                </div>
                <div style={{ height: 10, background: 'rgba(255,68,68,0.15)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${bossHp}%`, background: 'linear-gradient(90deg, #ff4444, #ff8800)', borderRadius: 5, transition: 'width 0.4s ease' }} />
                </div>
              </div>

              {/* Boss */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem', minHeight: 100 }}>
                {!feedback ? (
                  <>
                    <div style={{ fontSize: 56, marginBottom: '0.5rem' }}>🐉</div>
                    {bossAttack && (
                      <div style={{ fontSize: 13, color: '#ff6666', fontWeight: 600, background: 'rgba(255,68,68,0.08)', padding: '0.4rem 1rem', borderRadius: 20, display: 'inline-block' }}>
                        {bossAttack}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%',
                    fontSize: 20, fontWeight: 700, 
                    color: feedback.ok ? '#4ade80' : '#f87171', 
                    animation: 'scaleIn 0.3s ease-out' 
                  }}>
                    {feedback.msg}
                  </div>
                )}
              </div>

              {/* Score & Round */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Question {round+1} of {TOTAL_ROUNDS}</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 15, color: 'var(--cyan)', fontWeight: 700 }}>⚔️ {score} dmg</span>
              </div>

              {/* Round progress */}
              <div style={{ height: 5, background: 'rgba(99,102,241,0.15)', borderRadius: 5, marginBottom: '1.5rem', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(round / TOTAL_ROUNDS) * 100}%`, background: 'linear-gradient(90deg, var(--indigo), var(--cyan))', borderRadius: 5, transition: 'width 0.3s' }} />
              </div>

              {/* Question & Attack Buttons */}
              {questions[round] && (
                <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: 12, border: '1px solid rgba(99,102,241,0.15)' }}>
                  <h4 style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                     {questions[round].question_text}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {['a', 'b', 'c', 'd'].map((opt) => (
                      <button key={opt} onClick={() => answerQuestion(opt)} style={{
                        padding: '1rem', borderRadius: 12, border: '1px solid rgba(99,102,241,0.3)',
                        background: 'rgba(99,102,241,0.08)', color: 'var(--text-primary)', cursor: 'pointer',
                        fontWeight: 500, fontSize: 14, transition: 'all 0.15s', textAlign: 'left',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
                      >
                        <span style={{ background: 'rgba(255,255,255,0.1)', width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
                          {opt}
                        </span>
                        {questions[round][`option_${opt}`]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}


          {/* RESULT PHASE */}
          {phase === 'result' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 64, marginBottom: '1rem' }}>{isWinner ? '🏆' : '💀'}</div>
              <h2 style={{ fontFamily: 'Clash Display', fontSize: 22, color: '#fff', marginBottom: '0.5rem' }}>
                {isWinner ? 'Boss Defeated!' : 'You Were Defeated...'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: '1.5rem' }}>
                {isWinner
                  ? `Amazing! You scored ${score}/${TOTAL_ROUNDS}. Your battle partner ${opponentName} is also fighting — you both earn rewards!`
                  : `You scored ${score}/${TOTAL_ROUNDS}. Don't give up — study up and challenge your friend again!`}
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 12, padding: '1rem 1.5rem', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Questions Correct</p>
                  <p style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 700, color: 'var(--cyan)' }}>{score}</p>
                </div>
                {isWinner && (
                  <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '1rem 1.5rem', textAlign: 'center' }}>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>XP Earned</p>
                    <p style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 700, color: 'var(--warning)' }}>50+</p>
                  </div>
                )}
              </div>
              {!submitted ? (
                <button className="btn-primary" onClick={handleSubmit} style={{ fontSize: 14, padding: '0.75rem 2rem' }}>
                  Submit Score &amp; Claim Rewards
                </button>
              ) : (
                <div style={{ color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Check size={18} /> Score submitted! Badges on the way 🛡️
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FriendsLeaderboard() {
  const { getToken, userProfile } = useAuth()
  const [tab, setTab] = useState('Leaderboards')
  
  const [leaderboard, setLeaderboard] = useState([])
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [battles, setBattles] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [addEmail, setAddEmail] = useState('')
  const [addMsg, setAddMsg]     = useState({ text: '', type: '' })

  // Boss Battle Arena state
  const [activeBattle, setActiveBattle] = useState(null) // battle object for the modal

  const loadAll = useCallback(async () => {
    try {
      const token = await getToken()
      const [lRes, fRes, bRes] = await Promise.all([
        fetch(`${API}/social/leaderboard`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/social/friends`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/social/battles`, { headers: { Authorization: `Bearer ${token}` } })
      ])
      if (lRes.ok) setLeaderboard((await lRes.json()).leaderboard || [])
      if (fRes.ok) {
        const data = await fRes.json()
        setFriends(data.friends || [])
        setRequests(data.requests || [])
      }
      if (bRes.ok) setBattles((await bRes.json()).battles || [])
    } catch (e) { console.error('Error fetching social data', e) }
    finally { setLoading(false) }
  }, [getToken])

  useEffect(() => { loadAll() }, [loadAll])

  const handleAddFriend = async (e) => {
    e.preventDefault()
    if (!addEmail) return
    try {
      const token = await getToken()
      const res = await fetch(`${API}/social/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ friend_email: addEmail })
      })
      const data = await res.json()
      if (res.ok) {
        setAddMsg({ text: 'Friend request sent!', type: 'success' })
        setAddEmail('')
      } else {
        setAddMsg({ text: data.error || 'Failed to send request.', type: 'error' })
      }
    } catch { setAddMsg({ text: 'Network error.', type: 'error' }) }
  }

  const handleRequestAction = async (regId, action) => {
    try {
      const token = await getToken()
      await fetch(`${API}/social/friends/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ request_id: regId, action })
      })
      loadAll()
    } catch (e) { console.error('Error responding to request', e) }
  }

  const handleChallenge = async (friendId) => {
    try {
      const token = await getToken()
      const res = await fetch(`${API}/social/battles/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ target_user_id: friendId })
      })
      const data = await res.json()
      if (res.ok) {
        await loadAll()
        setTab('Battles')
      } else {
        alert(data.error || 'Could not start battle.')
      }
    } catch (e) { console.error('Challenge failed', e) }
  }

  const handleAcceptBattle = async (battleId) => {
    try {
      const token = await getToken()
      await fetch(`${API}/social/battles/${battleId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      await loadAll()
    } catch (e) { console.error(e) }
  }

  const handleEnterArena = (battle) => {
    setActiveBattle(battle)
  }

  const handleSubmitScore = async (battleId, score) => {
    try {
      const token = await getToken()
      await fetch(`${API}/social/battles/${battleId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ score })
      })
      await loadAll()
    } catch (e) { console.error(e) }
  }

  const handleRemoveBattle = async (battleId) => {
    if (!window.confirm("Are you sure you want to remove this battle?")) return;
    try {
      const token = await getToken();
      await fetch(`${API}/social/battles/${battleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      await loadAll();
    } catch (e) {
      console.error('Failed to remove battle', e);
    }
  }

  const myId = userProfile?.id

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {activeBattle && (
        <BossArena
          battle={activeBattle}
          myId={myId}
          onClose={() => { setActiveBattle(null); loadAll() }}
          onSubmitScore={handleSubmitScore}
        />
      )}

      <Sidebar />
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>
        <TopBar title="Social Hub" subtitle="Compete, connect, and raid bosses together." />
        <main style={{ flex: 1, padding: '2rem', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
          
          <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-secondary)', borderRadius: 12, padding: '0.25rem', marginBottom: '2rem', width: 'fit-content' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '0.5rem 1.25rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                background: tab === t ? 'linear-gradient(135deg, var(--indigo), var(--cyan))' : 'transparent',
                color: tab === t ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                {t === 'Leaderboards' && <Trophy size={16} />}
                {t === 'Friends' && <Users size={16} />}
                {t === 'Battles' && <Sword size={16} />}
                {t}
                {t === 'Battles' && battles.filter(b => b.status === 'pending' && !b.is_challenger).length > 0 && (
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#ef4444', fontSize: 10, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {battles.filter(b => b.status === 'pending' && !b.is_challenger).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}><LoadingSpinner size={40} /></div>
          ) : (
            <>
              {/* ─── Leaderboards ─── */}
              {tab === 'Leaderboards' && (
                <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
                  <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(99,102,241,0.1)', background: 'rgba(8,13,42,0.6)' }}>
                      <h3 style={{ fontFamily: 'Clash Display', fontSize: 18, color: 'var(--text-primary)' }}>Global Rank</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Top students across all classrooms</p>
                    </div>
                    {leaderboard.length === 0 ? <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No data available.</p> : (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          {leaderboard.map((u, i) => (
                            <tr key={u.id} style={{ 
                              background: u.id === userProfile?.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                              borderBottom: i < leaderboard.length - 1 ? '1px solid rgba(99,102,241,0.08)' : 'none' 
                            }}>
                              <td style={{ padding: '1rem', width: 60, textAlign: 'center' }}>
                                {i === 0 ? <Crown size={22} color="var(--warning)" /> : 
                                 i === 1 ? <Crown size={22} color="#94a3b8" /> : 
                                 i === 2 ? <Crown size={22} color="#b45309" /> : 
                                 <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-muted)' }}>#{i + 1}</span>}
                              </td>
                              <td style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{u.name[0]}</div>
                                  <div>
                                    <p style={{ fontSize: 14, fontWeight: 600, color: u.id === userProfile?.id ? 'var(--cyan)' : 'var(--text-primary)' }}>{u.name}</p>
                                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Level {Math.floor(u.xp / 500) + 1}</p>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <Badge type="topper">{u.streak} 🔥</Badge>
                              </td>
                              <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'JetBrains Mono', fontSize: 15, color: 'var(--text-primary)', fontWeight: 600 }}>
                                {u.xp} XP
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </GlassCard>

                  <GlassCard style={{ textAlign: 'center', padding: '2rem' }}>
                    <Shield size={48} color="var(--indigo-soft)" style={{ margin: '0 auto 1.5rem' }} />
                    <h4 style={{ fontFamily: 'Clash Display', fontSize: 18, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Your Current Standing</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: '2rem' }}>Keep completing quizzes and logging reading hours to rise up the board!</p>
                    <div style={{ background: 'var(--bg-tertiary)', borderRadius: 12, padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Total XP</p>
                        <p style={{ fontFamily: 'JetBrains Mono', fontSize: 20, fontWeight: 700, color: 'var(--cyan)' }}>{userProfile?.xp || 0}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Streak</p>
                        <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 4 }}>{userProfile?.streak || 0} <Flame size={18} /></p>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              )}

              {/* ─── Friends ─── */}
              {tab === 'Friends' && (
                <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 300px', gap: '1.5rem', alignItems: 'start' }}>
                  
                  <div>
                    <GlassCard style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ fontFamily: 'Clash Display', fontSize: 18, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Your Friends ({friends.length})</h3>
                      {friends.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>You haven't added any friends yet. Go to a Classroom → Classmates tab to add them!</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {friends.map(f => (
                            <div key={f.id} style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--indigo), var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>{f.name[0]}</div>
                                <div>
                                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{f.name}</p>
                                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.xp || 0} XP • {f.streak || 0} 🔥</p>
                                </div>
                              </div>
                              <button className="btn-ghost" onClick={() => handleChallenge(f.id)} style={{ padding: '0.4rem 0.75rem', fontSize: 12, display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--indigo-soft)', border: '1px solid rgba(99,102,241,0.3)' }}>
                                <Sword size={13} /> 🐉 Boss Battle
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </GlassCard>
                  </div>

                  <div>
                    <GlassCard style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ fontFamily: 'Clash Display', fontSize: 16, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PlusCircle size={16} color="var(--cyan)" /> Add a Friend
                      </h3>
                      <form onSubmit={handleAddFriend} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <input className="input-field" placeholder="Friend's email address..." value={addEmail} onChange={e => setAddEmail(e.target.value)} required type="email" />
                        <button className="btn-primary" type="submit" style={{ justifyContent: 'center', fontSize: 13, padding: '0.625rem' }}>Send Request</button>
                      </form>
                      {addMsg.text && <p style={{ fontSize: 12, marginTop: '0.75rem', color: addMsg.type === 'error' ? 'var(--danger)' : 'var(--success)' }}>{addMsg.text}</p>}
                    </GlassCard>

                    <GlassCard>
                      <h3 style={{ fontFamily: 'Clash Display', fontSize: 16, color: 'var(--text-primary)', marginBottom: '1rem' }}>Pending Requests ({requests.length})</h3>
                      {requests.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No pending requests.</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {requests.map(r => (
                            <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 8 }}>
                              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{r.from_name}</span>
                              <div style={{ display: 'flex', gap: '0.375rem' }}>
                                <button onClick={() => handleRequestAction(r.id, 'accept')} style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: 'none', color: 'var(--success)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={14} /></button>
                                <button onClick={() => handleRequestAction(r.id, 'reject')} style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </GlassCard>
                  </div>

                </div>
              )}

              {/* ─── Battles ─── */}
              {tab === 'Battles' && (
                <div className="animate-fade-in">
                  {/* Info Banner */}
                  <GlassCard style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(34,211,238,0.04))', border: '1px solid rgba(99,102,241,0.2)', padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ fontSize: 32, flexShrink: 0 }}>🐉</div>
                      <div>
                        <h4 style={{ fontFamily: 'Clash Display', fontSize: 15, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Boss Raid System</h4>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          When you challenge a friend, a <strong style={{ color: 'var(--cyan)' }}>private boss</strong> spawns — only the two of you can join. Fight independently, and if you both defeat it, <strong style={{ color: 'var(--warning)' }}>BOTH earn XP and a badge</strong>. No teacher involved!
                        </p>
                      </div>
                    </div>
                  </GlassCard>

                  {battles.filter(b => b.status !== 'completed').length === 0 ? (
                    <GlassCard style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: 600, margin: '0 auto' }}>
                      <Sword size={48} color="var(--indigo-soft)" style={{ margin: '0 auto 1.5rem' }} />
                      <h3 style={{ fontFamily: 'Clash Display', fontSize: 20, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No Active Raids</h3>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Challenge a friend to spawn a private boss battle. Your teacher stays out of it!</p>
                      <button className="btn-primary" onClick={() => setTab('Friends')}>Find an Opponent <ChevronRight size={16} /></button>
                    </GlassCard>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                      {battles.filter(b => b.status !== 'completed').map(b => {
                        const isChallenger = b.player1_id === myId
                        const myScore = isChallenger ? b.challenger_score : b.opponent_score
                        const opponentScore = isChallenger ? b.opponent_score : b.challenger_score
                        const opponentName = isChallenger ? b.player2_name : b.player1_name

                        return (
                          <GlassCard key={b.id} style={{ border: `1px solid ${b.status === 'active' ? 'rgba(34,211,238,0.3)' : b.status === 'completed' ? 'rgba(34,197,94,0.2)' : 'rgba(99,102,241,0.3)'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                              <Badge type={b.status === 'completed' ? 'topper' : b.status === 'active' ? 'cyan' : 'default'}>
                                {b.status === 'completed' ? '✅ Raid Complete' : b.status === 'active' ? '⚔️ Active Raid' : '⏳ Pending'}
                              </Badge>
                              <span style={{ fontSize: 12, color: 'var(--warning)', fontWeight: 600 }}>🏅 +50 XP Reward</span>
                            </div>

                            {/* Players */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-tertiary)', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
                              <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 auto 0.5rem' }}>
                                  {b.player1_name[0]}
                                </div>
                                <p style={{ fontSize: 12, color: isChallenger ? 'var(--cyan)' : 'var(--text-primary)', fontWeight: 600 }}>{b.player1_name}</p>
                                {b.status !== 'pending' && <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>⚔️ {b.challenger_score >= 0 ? b.challenger_score : 0} dmg</p>}
                              </div>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 1rem' }}>
                                <span style={{ fontSize: 24, marginBottom: 2 }}>🐉</span>
                                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 1 }}>VS BOSS</span>
                              </div>

                              <div style={{ textAlign: 'center', flex: 1 }}>
                                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 auto 0.5rem' }}>
                                  {b.player2_name[0]}
                                </div>
                                <p style={{ fontSize: 12, color: !isChallenger ? 'var(--cyan)' : 'var(--text-primary)', fontWeight: 600 }}>{b.player2_name}</p>
                                {b.status !== 'pending' && <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>⚔️ {b.opponent_score >= 0 ? b.opponent_score : 0} dmg</p>}
                              </div>
                            </div>

                            {/* Badge earned */}
                            {b.status === 'completed' && b.badge_awarded === 1 && (
                              <div style={{ textAlign: 'center', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '0.6rem', marginBottom: '1rem' }}>
                                <span style={{ fontSize: 13, color: 'var(--success)', fontWeight: 700 }}>🛡️ Raid Badge Earned by Both Warriors!</span>
                              </div>
                            )}

                            {/* Action Button & Remove */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <div style={{ flex: 1 }}>
                                {b.status === 'pending' && !isChallenger && (
                                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleAcceptBattle(b.id)}>
                                    ⚔️ Accept
                                  </button>
                                )}
                                {b.status === 'pending' && isChallenger && (
                                  <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', padding: '0.5rem' }}>
                                    ⏳ Waiting for {opponentName}...
                                  </div>
                                )}
                                {b.status === 'active' && (
                                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }} onClick={() => handleEnterArena(b)}>
                                    🐉 Enter Boss Arena
                                  </button>
                                )}
                                {b.status === 'completed' && (
                                  <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>
                                    Raid concluded • {b.winner_id === myId ? '👑 You won!' : `${opponentName} won`}
                                  </div>
                                )}
                              </div>
                              <button 
                                onClick={() => handleRemoveBattle(b.id)} 
                                style={{ 
                                  background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', 
                                  color: '#f87171', padding: '0.5rem', borderRadius: 8, cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                }}
                                title="Remove Battle"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </GlassCard>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  )
}
