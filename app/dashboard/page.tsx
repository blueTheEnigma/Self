'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { NavBar } from '@/components/NavBar'
import { GoalRing } from '@/components/GoalRing'
import { DailyStrip } from '@/components/DailyStrip'
import { RecapModal } from '@/components/RecapModal'
import { MomentumFeed } from '@/components/MomentumFeed'
import { EffortHeatmap } from '@/components/EffortHeatmap'
import { calculateStreak, today } from '@/lib/streak'
import styles from './dashboard.module.css'

interface CheckIn { id: string; goalId: string; userId: string; date: string; status: string; reflection?: string; effort?: number; value?: number }
interface Goal {
  id: string; category: string; title: string; color: string
  frequency: string; reminderTime: string | null; checkIns: CheckIn[]
}
interface UserProfile { name: string; xp: number; level: number }

export default function DashboardPage() {
  const { status } = useSession()
  const [goals, setGoals]       = useState<Goal[]>([])
  const [profile, setProfile]   = useState<UserProfile | null>(null)
  const [loading, setLoading]   = useState(true)
  const [streakMsg, setStreakMsg] = useState<string | null>(null)
  const [showRecap, setShowRecap] = useState(false)
  const todayStr = today()

  useEffect(() => {
    // Fetch goals
    fetch('/api/goals')
      .then(r => r.json())
      .then(data => { 
        if (data.error) console.error(data.error)
        setGoals(Array.isArray(data) ? data : [])
      })
      .catch(err => console.error("Dashboard goals fetch error:", err))
      .finally(() => setLoading(false))
    
    // Fetch profile for XP/Level
    fetch('/api/user')
      .then(r => r.json())
      .then(data => {
        if (!data.error) setProfile(data)
      })
      .catch(err => console.error("Dashboard profile fetch error:", err))

    // Monthly Recap Check
    const monthKey = `recap_${new Date().getFullYear()}_${new Date().getMonth()}`
    if (!localStorage.getItem(monthKey)) {
      setShowRecap(true)
      localStorage.setItem(monthKey, 'true')
    }
  }, [])

  const handleToggle = useCallback(async (goalId: string, status: 'DONE' | 'PARTIAL' | 'MISSED', reflection?: string, effort?: number, value?: number) => {
    const prev = goals.find(g => g.id === goalId)
    const prevStatus = prev?.checkIns.find(c => c.date === todayStr)?.status ?? null
    const prevStreak = prev ? calculateStreak(prev.checkIns) : 0

    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalId, status, date: todayStr, reflection, effort, value }),
    })
    if (!res.ok) return
    const newCheckIn: CheckIn = await res.json()

    // Gamification & Celebration
    if (status === 'DONE' && prevStatus !== 'DONE') {
       // Refresh profile for XP
       fetch('/api/user').then(r => r.json()).then(d => setProfile(d))

       // 🎉 High-fidelity celebration
       const confetti = (await import('canvas-confetti')).default
       confetti({
         particleCount: 150,
         spread: 70,
         origin: { y: 0.6 },
         colors: [prev?.color || '#6c9ef8', '#ffffff', '#ffd700']
       })
    }

    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g
      const filtered = g.checkIns.filter(c => c.date !== todayStr)
      const updated = { ...g, checkIns: [...filtered, newCheckIn] }
      
      // Show streak reset message when marking as MISSED and had a streak
      if (status === 'MISSED' && prevStreak > 0) {
        setStreakMsg(`Streak reset. Start again.`)
        setTimeout(() => setStreakMsg(null), 3500)
      }
      return updated
    }))
  }, [goals, todayStr])

  const allDone = goals.length > 0 && goals.every(g =>
    ['DONE', 'PARTIAL'].includes(g.checkIns.find(c => c.date === todayStr)?.status ?? '')
  )

  const dateLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  return (
    <div className="app-shell">
      {status === 'authenticated' && !loading && showRecap && (
        <RecapModal onClose={() => setShowRecap(false)} />
      )}
      <div className="page-header">
        <div>
          <h1 className="page-title">Today</h1>
          <p className="page-subtitle">{dateLabel}</p>
        </div>
        {profile && (
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>LVL</span>
              <span className={styles.statValue}>{profile.level}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>XP</span>
              <span className={styles.statValue}>{profile.xp}</span>
            </div>
          </div>
        )}
      </div>
      
      <MomentumFeed />

      <DailyStrip todayStr={todayStr} goals={goals} />

      {allDone && <div className={styles.allDoneBadge}>All goals completed! 🔥</div>}

      {streakMsg && (
        <div className={styles.streakReset} role="alert">{streakMsg}</div>
      )}

      {loading ? (
        <div className={styles.empty}>Loading…</div>
      ) : goals.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>◎</span>
          <p>No goals yet.</p>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Add one in the Goals tab.</p>
        </div>
      ) : (
        <div className={styles.rings}>
          {goals.map(goal => {
            const todayCI = goal.checkIns.find(c => c.date === todayStr)
            const streak  = calculateStreak(goal.checkIns)
            return (
              <GoalRing
                key={goal.id}
                goal={goal}
                todayStatus={todayCI?.status ?? null}
                todayReflection={todayCI?.reflection ?? null}
                streak={streak}
                onToggle={handleToggle}
              />
            )
          })}
        </div>
      )}

      <EffortHeatmap />

      <NavBar />
    </div>
  )
}
