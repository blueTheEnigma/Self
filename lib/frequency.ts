/** Maps a frequency key to the UTC day-of-week numbers it applies to (0=Sun) */
export const FREQUENCY_DAYS: Record<string, number[]> = {
  DAILY:        [0, 1, 2, 3, 4, 5, 6],
  WEEKDAYS:     [1, 2, 3, 4, 5],
  WEEKENDS:     [0, 6],
  MON_WED_FRI:  [1, 3, 5],
  TUE_THU_SAT:  [2, 4, 6],
}

export const FREQUENCY_LABELS: Record<string, string> = {
  DAILY:       'Every day',
  WEEKDAYS:    'Weekdays',
  WEEKENDS:    'Weekends',
  MON_WED_FRI: 'Mon · Wed · Fri',
  TUE_THU_SAT: 'Tue · Thu · Sat',
}

/** Returns true if today (local) is a scheduled day for this frequency */
export function isScheduledToday(frequency: string): boolean {
  const days = FREQUENCY_DAYS[frequency] ?? FREQUENCY_DAYS.DAILY
  return days.includes(new Date().getDay())
}

/** Returns true if a given ISO date string falls on a scheduled day */
export function isScheduledDate(dateStr: string, frequency: string): boolean {
  const days = FREQUENCY_DAYS[frequency] ?? FREQUENCY_DAYS.DAILY
  return days.includes(new Date(dateStr + 'T00:00:00').getDay())
}
