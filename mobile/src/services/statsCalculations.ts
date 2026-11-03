import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { SpendCategory, SpendTransaction } from '../types';

export const PILLARS: { 
  id: string; 
  name: string; 
  shortName: string;
  icon: keyof typeof Ionicons.glyphMap; 
  color: string; 
  bgColor: string;
}[] = [
  { id: 'wakeup', name: '05:30 Morning Prayer', shortName: '05:30', icon: 'sunny', color: Colors.primary, bgColor: Colors.primaryMuted },
  { id: 'track_prayer', name: '15m Track Walking Prayer', shortName: 'Track', icon: 'walk', color: Colors.lavenderDark, bgColor: Colors.lavender },
  { id: 'bible', name: 'Scripture Reading', shortName: 'Scripture', icon: 'book', color: Colors.lavenderDark, bgColor: Colors.lavender },
  { id: 'audiobook', name: 'Daily Audiobook Summary', shortName: 'Audiobook', icon: 'headset', color: Colors.primary, bgColor: Colors.primaryMuted },
  { id: 'scholarship', name: '1 Scholarship Cold Email', shortName: 'Email', icon: 'mail', color: Colors.primaryDark, bgColor: Colors.primaryMuted },
  { id: 'movement', name: 'Kaizen Movement & Run', shortName: 'Kaizen', icon: 'barbell', color: Colors.mintDark, bgColor: Colors.mint },
  { id: 'satiety', name: 'Mindful Satiety (80%)', shortName: 'Satiety', icon: 'restaurant', color: Colors.peachDark, bgColor: Colors.peach },
  { id: 'focus', name: '90m Deep Work Session', shortName: 'Focus', icon: 'code-slash', color: Colors.primary, bgColor: Colors.primaryMuted },
  { id: 'guitar', name: '15m Acoustic Guitar', shortName: 'Guitar', icon: 'musical-notes', color: Colors.honeyDark, bgColor: Colors.honey },
  { id: 'journal', name: 'Evening Micro-Reflection', shortName: 'Journal', icon: 'journal', color: Colors.primaryDark, bgColor: Colors.primaryMuted },
];

export const CATEGORY_ICONS: Record<SpendCategory, string> = {
  Food: '🍽',
  Transport: '🚗',
  Data: '📱',
  Gift: '🎁',
  Misc: '🔧',
};

// =========================================================================
// MATHEMATICAL & DATE CALCULATION HELPERS
// =========================================================================

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function getDaysInQuarter(year: number, quarterNum: number): number {
  const startMonth = (quarterNum - 1) * 3;
  return (
    getDaysInMonth(year, startMonth) +
    getDaysInMonth(year, startMonth + 1) +
    getDaysInMonth(year, startMonth + 2)
  );
}

export function getDaysInYear(year: number): number {
  const start = new Date(year, 0, 1).getTime();
  const end = new Date(year, 11, 31).getTime();
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

export function formatCovenantPercent(value: number): string {
  if (value <= 0) return '0%';
  if (value < 0.1) return value.toFixed(2) + '%';
  if (value < 1) return value.toFixed(2) + '%';
  if (value < 10) {
    const rounded = Math.round(value);
    if (Math.abs(value - rounded) < 0.35) {
      return `${rounded}%`;
    }
    return value.toFixed(1) + '%';
  }
  return Math.round(value) + '%';
}

export function getActiveDailyData(baseDateStr: string, offset: number) {
  const base = parseLocalDate(baseDateStr);
  const active = new Date(base);
  active.setDate(base.getDate() + offset);
  const dateStr = formatLocalDate(active);
  const isCurrent = offset === 0;

  let label = '';
  if (offset === 0) {
    label = `Today, ${active.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
  } else if (offset === -1) {
    label = `Yesterday, ${active.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  } else {
    label = active.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  return { dateStr, label, isCurrent, activeDate: active };
}

export function getActiveWeekData(baseDateStr: string, offset: number) {
  const base = parseLocalDate(baseDateStr);
  const day = base.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(base);
  monday.setDate(base.getDate() + diffToMon + offset * 7);

  const days = [];
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = formatLocalDate(d);
    days.push({
      dateStr,
      label: dayLabels[i],
      name: dayNames[i],
      dayNumber: d.getDate(),
      month: d.toLocaleString('en-US', { month: 'short' }),
      isToday: dateStr === baseDateStr,
      isPast: dateStr < baseDateStr,
      isFuture: dateStr > baseDateStr,
    });
  }

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const monMonth = monday.toLocaleString('en-US', { month: 'short' });
  const sunMonth = sunday.toLocaleString('en-US', { month: 'short' });
  const rangeStr = monMonth === sunMonth
    ? `${monMonth} ${monday.getDate()} – ${sunday.getDate()}`
    : `${monMonth} ${monday.getDate()} – ${sunMonth} ${sunday.getDate()}`;

  const label = offset === 0 ? `This Week (${rangeStr})` : rangeStr;
  const isCurrent = offset === 0;

  return { days, monday, sunday, label, isCurrent };
}

export function getActiveMonthData(baseDateStr: string, offset: number) {
  const base = parseLocalDate(baseDateStr);
  const target = new Date(base.getFullYear(), base.getMonth() + offset, 1, 12, 0, 0);
  const targetYear = target.getFullYear();
  const targetMonthIndex = target.getMonth();
  const daysCount = getDaysInMonth(targetYear, targetMonthIndex);
  const prefix = `${targetYear}-${(targetMonthIndex + 1).toString().padStart(2, '0')}`;
  const monthName = target.toLocaleString('en-US', { month: 'long' });
  const isCurrent = offset === 0;
  const label = isCurrent ? `This Month (${monthName} ${targetYear})` : `${monthName} ${targetYear}`;

  return { targetYear, targetMonthIndex, daysCount, prefix, monthName, label, isCurrent };
}

export function getActiveQuarterData(baseDateStr: string, offset: number) {
  const base = parseLocalDate(baseDateStr);
  const baseY = base.getFullYear();
  const baseM = base.getMonth() + 1;
  const baseQuarter = Math.ceil(baseM / 3);

  const totalQuarters = (baseY * 4) + (baseQuarter - 1) + offset;
  const targetYear = Math.floor(totalQuarters / 4);
  const targetQuarterNum = (totalQuarters % 4) + 1;
  const daysCount = getDaysInQuarter(targetYear, targetQuarterNum);
  const isCurrent = offset === 0;
  const label = isCurrent ? `This Quarter (Q${targetQuarterNum} ${targetYear})` : `Q${targetQuarterNum} ${targetYear}`;

  return { targetYear, targetQuarterNum, daysCount, label, isCurrent };
}

export function getActiveYearData(baseDateStr: string, offset: number) {
  const base = parseLocalDate(baseDateStr);
  const targetYear = base.getFullYear() + offset;
  const daysCount = getDaysInYear(targetYear);
  const isCurrent = offset === 0;
  const label = isCurrent ? `This Year (${targetYear})` : `${targetYear}`;

  return { targetYear, daysCount, label, isCurrent };
}

export function computeFinancialSummary(transactions: SpendTransaction[], daysCount: number) {
  const totalSpend = transactions.reduce((acc, t) => acc + t.amount, 0);
  const dailyBurn = Math.round(totalSpend / Math.max(1, daysCount));

  const categoryTotals: Record<SpendCategory, number> = {
    Food: 0,
    Transport: 0,
    Data: 0,
    Gift: 0,
    Misc: 0,
  };

  transactions.forEach(t => {
    if (categoryTotals[t.category] !== undefined) {
      categoryTotals[t.category] += t.amount;
    }
  });

  const categoriesWithSpend = (Object.keys(categoryTotals) as SpendCategory[])
    .map(cat => ({
      category: cat,
      amount: categoryTotals[cat],
      percent: totalSpend > 0 ? Math.round((categoryTotals[cat] / totalSpend) * 100) : 0,
      icon: CATEGORY_ICONS[cat],
    }))
    .sort((a, b) => b.amount - a.amount);

  return { totalSpend, dailyBurn, categoryTotals, categoriesWithSpend };
}

