'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { NavBar } from '@/components/NavBar'
import { DotGrid } from '@/components/DotGrid'
import { calculateStreak } from '@/lib/streak'
import styles from './partner.module.css'

interface CheckIn { id: string; goalId: string; date: string; status: string }
interface Goal { id: string; type: string; title: string | null; color: string; frequency: string; reminderTime: string | null; checkIns: CheckIn[] }
interface Partner { id: string; name: string }

export default function PartnerViewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [goals, setGoals]     = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [nudging, setNudging] = useState(false)
  const [nudgeSent, setNudgeSent] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/partners/${id}/goals`)
      .then(r => {
        if (!r.ok) { router.push('/partners'); return null }
        return r.json()
      })
      .then(data => {
        if (!data) return
        setPartner(data.partner)
        setGoals(data.goals)
        setLoading(false)
      })
  }, [id, router])

  async function handleNudge() {
    setNudging(true); setError(null)
    const res = await fetch('/api/nudge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: id }),
    })
    const data = await res.json()
    setNudging(false)
    if (!res.ok) { setError(data.error); return }
    setNudgeSent(true)
  }

  if (loading) return (
    <div className="app-shell">
      <p style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-3)' }}>Loading…</p>
      <NavBar />
    </div>
  )

  return (
    <div className="app-shell">
      <div className="page-header" style={{ paddingTop: 32 }}>
        <button onClick={() => router.back()}
          className="btn btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}>
          ← Back
        </button>
      </div>

      <div className={styles.profile}>
        <div className={styles.avatar}>{partner?.name[0]?.toUpperCase()}</div>
        <h1 className={styles.name}>{partner?.name}</h1>
        <p className={styles.sub}>{goals.length} active goals</p>
      </div>

      {/* Nudge button */}
      <div className={styles.nudgeWrap}>
        {nudgeSent ? (
          <div className="success-msg" style={{ textAlign: 'center' }}>
            Nudge sent 👋 You can nudge again in 24 hours.
          </div>
        ) : (
          <button id="nudge-btn" className={`btn btn-full ${styles.nudgeBtn}`}
            onClick={handleNudge} disabled={nudging}>
            {nudging ? 'Sending…' : '👋 Nudge ' + partner?.name}
          </button>
        )}
        {error && <p className="error-msg" style={{ marginTop: 10 }}>{error}</p>}
      </div>

      {/* Goals */}
      <div className={styles.goalList}>
        {goals.length === 0 ? (
          <p style={{ color: 'var(--text-3)', fontSize: 14, textAlign: 'center', padding: '30px 0' }}>
            No goals to display.
          </p>
        ) : goals.map(goal => {
          const streak = calculateStreak(goal.checkIns)
          return (
            <div key={goal.id} className={`card ${styles.goalCard}`}>
              <div className={styles.goalRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%',
                    background: goal.color, flexShrink: 0 }} />
                  <div>
                    <p className={styles.goalTitle}>
                      {goal.type === 'NAMED' && goal.title
                        ? goal.title
                        : <em style={{ color: 'var(--text-3)', fontStyle: 'italic', fontSize: 13 }}>Private goal</em>
                      }
                    </p>
                    <p className={styles.streakLine}>
                      {streak > 0 ? `${streak} day streak 🔥` : 'No streak yet'}
                    </p>
                  </div>
                </div>
              </div>
              <DotGrid checkIns={goal.checkIns} frequency={goal.frequency} />
            </div>
          )
        })}
      </div>

      <NavBar />
    </div>
  )
}
