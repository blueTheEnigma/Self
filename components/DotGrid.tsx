import { isScheduledDate } from '@/lib/frequency'

interface CheckIn { date: string; status: string }

interface Props {
  checkIns: CheckIn[]
  frequency?: string
}

function lastNDays(n: number): string[] {
  const days: string[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export function DotGrid({ checkIns, frequency = 'DAILY' }: Props) {
  const map = new Map(checkIns.map((c) => [c.date, c.status]))
  const days = lastNDays(7)

  return (
    <div className="dot-grid" role="img" aria-label="7-day history">
      {days.map((date) => {
        const scheduled = isScheduledDate(date, frequency)
        const s = map.get(date) ?? 'EMPTY'

        // Non-scheduled days get a special "skip" indicator
        if (!scheduled) {
          return (
            <div
              key={date}
              className="dot-grid-dot"
              style={{
                background: 'transparent',
                border: '1.5px solid var(--border)',
                opacity: 0.25,
                width: 10, height: 10,
              }}
              title={`${date}: not scheduled`}
            />
          )
        }

        const cls = s === 'DONE' ? 'done' : s === 'MISSED' ? 'missed' : 'empty'
        return (
          <div
            key={date}
            className={`dot-grid-dot ${cls}`}
            title={`${date}: ${s.toLowerCase()}`}
          />
        )
      })}
    </div>
  )
}
