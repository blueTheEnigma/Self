'use client'
import { useState } from 'react'
import styles from './GoalRing.module.css'
import { FREQUENCY_LABELS, isScheduledToday } from '@/lib/frequency'

interface CheckIn { date: string; status: string }
interface Goal {
  id: string; category: string; title: string; color: string
  frequency: string; reminderTime: string | null; checkIns: CheckIn[]
}

interface Props {
  goal: Goal
  todayStatus: string | null
  todayReflection: string | null
  streak: number
  onToggle: (goalId: string, status: 'DONE' | 'PARTIAL' | 'MISSED', reflection?: string) => Promise<void>
}

export function GoalRing({ goal, todayStatus, todayReflection, streak, onToggle }: Props) {
  const [status, setStatus] = useState<string | null>(todayStatus)
  const [reflection, setReflection] = useState(todayReflection ?? '')
  const [loading, setLoading] = useState(false)
  const [pulse, setPulse] = useState(false)
  const [showReflect, setShowReflect] = useState(false)

  const scheduled = isScheduledToday(goal.frequency)

  async function handleTap() {
    if (loading) return
    let next: 'DONE' | 'PARTIAL' | 'MISSED' | null = null
    if (!status) next = 'DONE'
    else if (status === 'DONE') next = 'PARTIAL'
    else if (status === 'PARTIAL') next = 'MISSED'
    else next = null

    if (next === null) {
      // For now, let's just make it cycle back to DONE or just stop at MISSED
      // Or we can allow resetting to NULL by clicking when MISSED
      next = 'DONE' 
    }

    setLoading(true)
    setPulse(true)
    setTimeout(() => setPulse(false), 700)
    await onToggle(goal.id, next as any, reflection)
    setStatus(next)
    setLoading(false)
    if (next === 'DONE' || next === 'PARTIAL') setShowReflect(true)
  }

  async function saveReflection() {
    setLoading(true)
    await onToggle(goal.id, status as any, reflection)
    setLoading(false)
    setShowReflect(false)
  }

  const isDone    = status === 'DONE'
  const isPartial = status === 'PARTIAL'
  const isMissed  = status === 'MISSED'

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
        className={`${styles.ring} ${isDone ? styles.done : ''} ${isPartial ? styles.partial : ''} ${isMissed ? styles.missed : ''} ${!scheduled && !status ? styles.unscheduled : ''} ${pulse ? 'pulse' : ''}`}
        style={{ '--goal-color': goal.color } as React.CSSProperties}
        onClick={handleTap}
        disabled={loading}
        aria-label={`${goal.title} — ${status ?? 'not checked in'}`}
      >
        {isDone   && <span className={styles.icon}>✓</span>}
        {isPartial && <span className={styles.icon} style={{ fontSize: 18 }}>●</span>}
        {isMissed && <span className={styles.icon} style={{ color: 'var(--missed-color)' }}>✕</span>}
        {!status  && <div className={styles.dot} style={{ background: goal.color }} />}
      </button>

      <div className={styles.meta}>
        <span className={styles.title} onClick={() => (isDone || isPartial) && setShowReflect(!showReflect)}>
          {goal.title}
        </span>

        {streak > 0 && (
          <span className={styles.streak}>
            {streak}<span className={styles.fire}>🔥</span>
          </span>
        )}

        {(isDone || isPartial) && showReflect && (
          <div className={styles.reflectBox}>
            <input 
              className={styles.reflectInput}
              placeholder="Any win or reflection?"
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              onBlur={saveReflection}
              autoFocus
            />
          </div>
        )}

        {!isDone && scheduled && !status && (
          <span className={styles.offDay}>tap to check in</span>
        )}
        {!scheduled && !status && (
          <span className={styles.offDay}>rest day</span>
        )}
      </div>
    </div>
  )
}
