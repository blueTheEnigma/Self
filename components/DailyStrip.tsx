'use client'
import { useMemo } from 'react'
import styles from './DailyStrip.module.css'

interface DailyStripProps {
  todayStr: string;
  goals: any[];
}

export function DailyStrip({ todayStr, goals }: DailyStripProps) {
  const days = useMemo(() => {
    const list = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(now.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
      const dayNum = d.getDate()
      
      // Calculate progress percentage for this day
      const activeGoals = goals.length
      const completed = goals.filter(g => 
        g.checkIns.find((c: any) => c.date === dateStr && c.status === 'DONE')
      ).length
      const progress = activeGoals > 0 ? (completed / activeGoals) * 100 : 0

      list.push({ dateStr, dayName, dayNum, progress })
    }
    return list
  }, [goals])

  return (
    <div className={styles.container}>
      {days.map((day) => (
        <div 
          key={day.dateStr} 
          className={`${styles.day} ${day.dateStr === todayStr ? styles.today : ''}`}
        >
          <span className={styles.dayName}>{day.dayName}</span>
          <div className={styles.circleContainer}>
            <div 
              className={styles.progressFill} 
              style={{ height: `${day.progress}%` }} 
            />
            <span className={styles.dayNum}>{day.dayNum}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
