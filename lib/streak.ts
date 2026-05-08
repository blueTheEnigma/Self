interface CheckIn { date: string; status: string }

/** Returns YYYY-MM-DD for a given Date */
export function toDateString(d: Date): string {
  return d.toISOString().split("T")[0]
}

/** Today's date string in local-ish time (UTC) */
export function today(): string {
  return toDateString(new Date())
}

/**
 * Calculate the current streak for a goal given its check-ins.
 * Streak = consecutive DONE days going backwards from today.
 * A MISSED day resets the streak to 0.
 * Days with no check-in are treated as not-yet-recorded (don't break streak if they are in the future or today-not-yet-checked).
 */
export function calculateStreak(checkIns: CheckIn[] | undefined): number {
  if (!checkIns) return 0
  const doneSet = new Set(
    checkIns.filter((c) => c.status === "DONE").map((c) => c.date)
  )
  const missedSet = new Set(
    checkIns.filter((c) => c.status === "MISSED").map((c) => c.date)
  )

  let streak = 0
  const now = new Date()

  for (let i = 0; i < 365; i++) {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() - i)
    const ds = toDateString(d)

    if (doneSet.has(ds)) {
      streak++
    } else if (missedSet.has(ds)) {
      break
    } else {
      // No record yet — if it's today, skip; otherwise stop
      if (i === 0) continue
      break
    }
  }

  return streak
}

/**
 * Return the last N days as date strings (newest last).
 */
export function lastNDays(n: number): string[] {
  const days: string[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() - i)
    days.push(toDateString(d))
  }
  return days
}

/**
 * Build a 7-day status array for display.
 * Returns array of { date, status: "DONE" | "MISSED" | "EMPTY" }
 */
export function sevenDayHistory(checkIns: CheckIn[]): Array<{ date: string; status: string }> {
  const map = new Map(checkIns.map((c) => [c.date, c.status]))
  return lastNDays(7).map((date) => ({
    date,
    status: map.get(date) ?? "EMPTY",
  }))
}
