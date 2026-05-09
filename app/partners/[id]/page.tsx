'use client'
import { useEffect, useState, use } from 'react'
import { NavBar } from '@/components/NavBar'
import { GoalRing } from '@/components/GoalRing'
import { calculateStreak, today } from '@/lib/streak'
import { useRouter } from 'next/navigation'
import styles from './PartnerProfile.module.css'

interface Goal {
  id: string; type: string; title: string | null; color: string
  frequency: string; checkIns: any[]
}
interface PartnerProfile {
  id: string; name: string; xp: number; level: number
}

export default function PartnerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [data, setData] = useState<{ partner: PartnerProfile, goals: Goal[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const todayStr = today()

  useEffect(() => {
    fetch(`/api/partners/${id}/goals`)
      .then(r => r.json())
      .then(res => {
        if (res.error) router.push('/partners')
        else setData(res)
        setLoading(false)
      })
  }, [id, router])

  async function handleNudge(reaction?: string) {
    const res = await fetch('/api/nudge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: id, reaction }),
    })
    if (res.ok) {
      alert(reaction ? `Sent ${reaction}!` : 'Nudge sent!')
    } else {
      const err = await res.json()
      alert(err.error || 'Failed to nudge')
    }
  }

  if (loading) return <div className="app-shell"><div className="page-center">Loading…</div></div>
  if (!data) return null

  return (
    <div className="app-shell">
      <div className={styles.header}>
        <button className={styles.back} onClick={() => router.back()}>←</button>
        <div className={styles.profileInfo}>
          <h1 className={styles.name}>{data.partner.name}</h1>
          <div className={styles.stats}>
            <span className={styles.stat}>LVL {data.partner.level}</span>
            <span className={styles.stat}>{data.partner.xp} XP</span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleNudge()}>
          Send Nudge
        </button>
        <div className={styles.reactions}>
          <button onClick={() => handleNudge('🔥')}>🔥</button>
          <button onClick={() => handleNudge('🙌')}>🙌</button>
          <button onClick={() => handleNudge('😭')}>😭</button>
          <button onClick={() => handleNudge('✨')}>✨</button>
        </div>
      </div>

      <div className="divider" />

      <h2 className={styles.sectionTitle}>Journey Progress</h2>
      <div className={styles.ringsGrid}>
        {data.goals.map(goal => {
          const todayCI = goal.checkIns.find((c: any) => c.date === todayStr)
          const streak  = calculateStreak(goal.checkIns)
          return (
            <div key={goal.id} className={styles.ringCard}>
              <GoalRing
                goal={goal}
                todayStatus={todayCI?.status ?? null}
                todayReflection={null}
                streak={streak}
                onToggle={async () => {}} 
              />
              <div className={styles.goalReactions}>
                <button title="Sparkle" onClick={() => handleNudge('✨')}>✨</button>
                <button title="Cheer" onClick={() => handleNudge('🙌')}>🙌</button>
                <button title="Fire" onClick={() => handleNudge('🔥')}>🔥</button>
                <button title="Nudge (Broken Streak)" onClick={() => handleNudge('😭')}>😭</button>
              </div>
            </div>
          )
        })}
      </div>
      {data.goals.length === 0 && (
        <p className={styles.empty}>No public goals shared.</p>
      )}

      <NavBar />
    </div>
  )
}
