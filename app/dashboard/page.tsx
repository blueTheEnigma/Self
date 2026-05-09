'use client'
import { useEffect, useState, useCallback } from 'react'
import { NavBar } from '@/components/NavBar'
import { GoalRing } from '@/components/GoalRing'
import { calculateStreak, today } from '@/lib/streak'
import styles from './dashboard.module.css'

interface CheckIn { id: string; goalId: string; date: string; status: string }
interface Goal {
  id: string; type: string; title: string | null; color: string
  frequency: string; reminderTime: string | null; checkIns: CheckIn[]
}

export default function DashboardPage() {
  const [goals, setGoals]       = useState<Goal[]>([])
  const [loading, setLoading]   = useState(true)
  const [streakMsg, setStreakMsg] = useState<string | null>(null)
  const todayStr = today()

  useEffect(() => {
    fetch('/api/goals')
      .then(r => r.json())
      .then(data => { setGoals(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const handleToggle = useCallback(async (goalId: string, status: 'DONE' | 'MISSED') => {
    const prev = goals.find(g => g.id === goalId)
    const prevStatus = prev?.checkIns.find(c => c.date === todayStr)?.status ?? null
    const prevStreak = prev ? calculateStreak(prev.checkIns) : 0

    const res = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalId, status, date: todayStr }),
    })
    if (!res.ok) return
    const newCheckIn: CheckIn = await res.json()

    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g
      const filtered = g.checkIns.filter(c => c.date !== todayStr)
      const updated = { ...g, checkIns: [...filtered, newCheckIn] }
      const newStreak = calculateStreak(updated.checkIns)

      // Show streak reset message when marking as MISSED and had a streak
      if (status === 'MISSED' && prevStreak > 0) {
        setStreakMsg(`Streak reset. Start again.`)
        setTimeout(() => setStreakMsg(null), 3500)
      }
      return updated
    }))
  }, [goals, todayStr])

  const allDone = goals.length > 0 && goals.every(g =>
    g.checkIns.find(c => c.date === todayStr)?.status === 'DONE'
  )

  const dateLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  return (
    <div className="app-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">Today</h1>
          <p className="page-subtitle">{dateLabel}</p>
        </div>
        {allDone && <span className={styles.allDone}>All done ✓</span>}
      </div>

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
                streak={streak}
                onToggle={handleToggle}
              />
            )
          })}
        </div>
      )}

      <NavBar />
    </div>
  )
}
