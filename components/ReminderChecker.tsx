'use client'
import { useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { FREQUENCY_DAYS, FREQUENCY_LABELS } from '@/lib/frequency'
import { today } from '@/lib/streak'

interface CheckIn { date: string; status: string }
interface Goal {
  id: string; type: string; title: string | null; color: string
  frequency: string; reminderTime: string | null; checkIns: CheckIn[]
}

interface Props {
  onReminder: (goalTitle: string, goalId: string) => void
}

export function ReminderChecker({ onReminder }: Props) {
  const { data: session } = useSession()

  const check = useCallback(async () => {
    if (!(session?.user as any)?.pinVerified) return

    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const currentTime = `${hh}:${mm}`
    const currentDay = now.getDay() // 0=Sun

    const res = await fetch('/api/goals')
    if (!res.ok) return
    const goals: Goal[] = await res.json()
    const todayStr = today()

    for (const goal of goals) {
      if (!goal.reminderTime) continue
      if (goal.reminderTime !== currentTime) continue

      // Check if today is a scheduled day
      const days = FREQUENCY_DAYS[goal.frequency] ?? FREQUENCY_DAYS.DAILY
      if (!days.includes(currentDay)) continue

      // Don't remind if already checked in
      const alreadyDone = goal.checkIns?.find(c => c.date === todayStr && c.status === 'DONE')
      if (alreadyDone) continue

      const label = goal.type === 'NAMED' ? goal.title ?? 'Goal' : 'Private goal'
      const freqLabel = FREQUENCY_LABELS[goal.frequency] ?? ''

      onReminder(label, goal.id)

      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification(`SELF — Check in reminder`, {
          body: `${label}${freqLabel ? ` · ${freqLabel}` : ''}`,
          icon: '/icon.png',
          tag: `reminder-${goal.id}`, // prevents duplicates
        })
      }
    }
  }, [session, onReminder])

  useEffect(() => {
    // Request notification permission on mount
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Align to the next minute boundary, then poll every 60s
    const now = new Date()
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()

    const timeout = setTimeout(() => {
      check()
      const interval = setInterval(check, 60_000)
      return () => clearInterval(interval)
    }, msUntilNextMinute)

    return () => clearTimeout(timeout)
  }, [check])

  return null
}
