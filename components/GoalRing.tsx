'use client'
import { useState } from 'react'
import styles from './GoalRing.module.css'
import { FREQUENCY_LABELS, isScheduledToday } from '@/lib/frequency'

interface CheckIn { date: string; status: string }
interface Goal {
  id: string; type: string; title: string | null; color: string
  frequency: string; reminderTime: string | null; checkIns: CheckIn[]
}

interface Props {
  goal: Goal
  todayStatus: string | null
  streak: number
  onToggle: (goalId: string, status: 'DONE' | 'MISSED') => Promise<void>
}

export function GoalRing({ goal, todayStatus, streak, onToggle }: Props) {
  const [status, setStatus] = useState<string | null>(todayStatus)
  const [loading, setLoading] = useState(false)
  const [pulse, setPulse] = useState(false)

  const scheduled = isScheduledToday(goal.frequency)

  async function handleTap() {
    if (loading) return
    const next = status === 'DONE' ? 'MISSED' : 'DONE'
    setLoading(true)
    setPulse(true)
    setTimeout(() => setPulse(false), 700)
    await onToggle(goal.id, next)
    setStatus(next)
    setLoading(false)
  }

  const isDone   = status === 'DONE'
  const isMissed = status === 'MISSED'

  // Format reminder time to 12h for display
  const reminderDisplay = goal.reminderTime
    ? (() => {
        const [hh, mm] = goal.reminderTime.split(':').map(Number)
        const suffix = hh >= 12 ? 'pm' : 'am'
        const hour = hh % 12 || 12
        return `${hour}:${String(mm).padStart(2,'0')}${suffix}`
      })()
    : null

  return (
    <div className={styles.wrap}>
      <button
        id={`goal-ring-${goal.id}`}
        className={`${styles.ring} ${isDone ? styles.done : ''} ${isMissed ? styles.missed : ''} ${!scheduled && !status ? styles.unscheduled : ''} ${pulse ? 'pulse' : ''}`}
        style={{ '--goal-color': goal.color } as React.CSSProperties}
        onClick={handleTap}
        disabled={loading}
        aria-label={`${goal.type === 'NAMED' ? goal.title : 'Private goal'} — ${status ?? 'not checked in'}`}
      >
        {isDone   && <span className={styles.icon}>✓</span>}
        {isMissed && <span className={styles.icon} style={{ color: 'var(--missed-color)' }}>✕</span>}
        {!status  && <div className={styles.dot} style={{ background: goal.color }} />}
      </button>

      <div className={styles.meta}>
        <span className={styles.title}>
          {goal.type === 'NAMED' ? goal.title : <span className={styles.private}>private</span>}
        </span>

        {/* Frequency badge — only show if not daily */}
        {goal.frequency !== 'DAILY' && (
          <span className={styles.freqBadge}>
            {FREQUENCY_LABELS[goal.frequency]}
          </span>
        )}

        {/* Reminder time */}
        {reminderDisplay && (
          <span className={styles.reminderTag}>⏰ {reminderDisplay}</span>
        )}

        {streak > 0 && (
          <span className={styles.streak}>
            {streak}<span className={styles.fire}>🔥</span>
          </span>
        )}

        {/* Not scheduled today indicator */}
        {!scheduled && !status && (
          <span className={styles.offDay}>rest day</span>
        )}
      </div>
    </div>
  )
}
