import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { SelfAppState } from '../types';
import { safeHaptics } from '../services/haptics';
import { isRunDay } from '../services/storage';
import {
  PILLARS,
  CATEGORY_ICONS,
  getActiveDailyData,
  getActiveWeekData,
  getActiveMonthData,
  getActiveQuarterData,
  getActiveYearData,
  computeFinancialSummary,
  formatCovenantPercent,
} from '../services/statsCalculations';

export interface StatsDashboardProps {
  appState: SelfAppState;
  onOpenSpendModal?: () => void;
  onOpenBodyModal?: () => void;
}

export type TimeHorizon = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =========================================================================
// MAIN STATS DASHBOARD COMPONENT
// =========================================================================

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  appState,
  onOpenSpendModal,
  onOpenBodyModal,
}) => {
  const [horizon, setHorizon] = useState<TimeHorizon>('weekly');

  // Independent offset states per horizon (0 = current, -1 = 1 period back, etc.)
  const [dayOffset, setDayOffset] = useState<number>(0);
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [monthOffset, setMonthOffset] = useState<number>(0);
  const [quarterOffset, setQuarterOffset] = useState<number>(0);
  const [yearOffset, setYearOffset] = useState<number>(0);

  // Selected day index for the Weekly Day Inspector (0 = Mon, 6 = Sun)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(
    new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  );

  const history = appState.dailyHistory || {};
  const todayStr = appState.currentDate;

  // Active period data computed synchronously
  const dailyData = getActiveDailyData(todayStr, dayOffset);
  const weekData = getActiveWeekData(todayStr, weekOffset);
  const monthData = getActiveMonthData(todayStr, monthOffset);
  const quarterData = getActiveQuarterData(todayStr, quarterOffset);
  const yearData = getActiveYearData(todayStr, yearOffset);

  // Check if a specific pillar was completed on a given date
  const isPillarDone = (pillarId: string, dateStr: string): boolean => {
    if (dateStr === todayStr) {
      switch (pillarId) {
        case 'wakeup': return Boolean(appState.spiritual?.wakeupPrayerDone);
        case 'track_prayer': return Boolean(appState.spiritual?.trackPrayerDone);
        case 'bible': return Boolean(appState.spiritual?.bibleReadingDone);
        case 'audiobook': return Boolean(appState.spiritual?.audiobookDone);
        case 'scholarship': return Boolean(appState.scholarshipOutreachDone);
        case 'movement': {
          const isRun = isRunDay(new Date(), appState.settings?.runDays || [1, 3, 5]);
          const sets = appState.workout?.exercises?.reduce(
            (acc, ex) => acc + ex.completedSets.filter(s => s > 0).length, 0
          ) || 0;
          const caliDone = Boolean(appState.workout?.completed) || sets >= 12;
          if (isRun) {
            return Boolean(appState.workout?.runLog) && caliDone;
          } else {
            return Boolean(appState.workout?.gymLog) || caliDone;
          }
        }
        case 'satiety': return (appState.integrity?.fullnessLogs?.length || 0) >= 2;
        case 'focus': {
          const mins = appState.focusBlocks
            ?.filter(b => b.timestamp.startsWith(todayStr))
            ?.reduce((acc, b) => acc + b.durationMinutes, 0) || 0;
          return mins >= 90;
        }
        case 'guitar': return (appState.sanctuary?.guitarMinutesToday || 0) >= 15;
        case 'journal': return Boolean(appState.sanctuary?.microJournalWins);
        default: return false;
      }
    }

    const snap = history[dateStr];
    if (!snap || !snap.checklist) return false;
    const c = snap.checklist;
    switch (pillarId) {
      case 'wakeup': return Boolean(c.wakeupPrayerDone);
      case 'track_prayer': return Boolean(c.trackPrayerDone);
      case 'bible': return Boolean(c.bibleReadingDone);
      case 'audiobook': return Boolean(c.audiobookDone);
      case 'scholarship': return Boolean(c.scholarshipOutreachDone);
      case 'movement': {
        if (c.movementCompleted !== undefined) return Boolean(c.movementCompleted);
        const [yD, mD, dD] = dateStr.split('-').map(Number);
        const dayOfWeek = new Date(yD, mD - 1, dD, 12, 0, 0).getDay();
        const runDays = appState.settings?.runDays || [1, 3, 5];
        const wasRunDay = runDays.includes(dayOfWeek);
        const caliDone = (c.movementSetsDone || 0) >= 12;
        if (wasRunDay) {
          return Boolean(snap.runLog) && caliDone;
        } else {
          return Boolean(snap.gymLog || c.gymLogged) || caliDone;
        }
      }
      case 'satiety': return (c.satietyMealsLogged || 0) >= 2;
      case 'focus': return (c.focusMinutes || 0) >= 90;
      case 'guitar': return (c.guitarMinutes || 0) >= 15;
      case 'journal': return Boolean(c.microJournalDone);
      default: return false;
    }
  };

  // Completion score (0-100%) for a single day
  const getDayCompletionScore = (dateStr: string): number => {
    let hits = 0;
    PILLARS.forEach(p => {
      if (isPillarDone(p.id, dateStr)) hits++;
    });
    return Math.round((hits / PILLARS.length) * 100);
  };

  // All tracked dates in history + today
  const allTrackedDates = Array.from(
    new Set([...Object.keys(history), todayStr])
  ).sort();

  // Pager Navigation Handlers
  const handlePrevPeriod = () => {
    safeHaptics.light();
    switch (horizon) {
      case 'daily': setDayOffset(d => d - 1); break;
      case 'weekly': setWeekOffset(w => w - 1); break;
      case 'monthly': setMonthOffset(m => m - 1); break;
      case 'quarterly': setQuarterOffset(q => q - 1); break;
      case 'yearly': setYearOffset(y => y - 1); break;
    }
  };

  const handleNextPeriod = () => {
    switch (horizon) {
      case 'daily': 
        if (dayOffset < 0) {
          safeHaptics.light();
          setDayOffset(d => d + 1);
        }
        break;
      case 'weekly': 
        if (weekOffset < 0) {
          safeHaptics.light();
          setWeekOffset(w => w + 1);
        }
        break;
      case 'monthly': 
        if (monthOffset < 0) {
          safeHaptics.light();
          setMonthOffset(m => m + 1);
        }
        break;
      case 'quarterly': 
        if (quarterOffset < 0) {
          safeHaptics.light();
          setQuarterOffset(q => q + 1);
        }
        break;
      case 'yearly': 
        if (yearOffset < 0) {
          safeHaptics.light();
          setYearOffset(y => y + 1);
        }
        break;
    }
  };

  const getActivePeriodMeta = () => {
    switch (horizon) {
      case 'daily': return { label: dailyData.label, isCurrent: dailyData.isCurrent };
      case 'weekly': return { label: weekData.label, isCurrent: weekData.isCurrent };
      case 'monthly': return { label: monthData.label, isCurrent: monthData.isCurrent };
      case 'quarterly': return { label: quarterData.label, isCurrent: quarterData.isCurrent };
      case 'yearly': return { label: yearData.label, isCurrent: yearData.isCurrent };
    }
  };

  const currentPagerMeta = getActivePeriodMeta();

  // Body Composition metrics
  const prevMetric = appState.bodyMetricsHistory && appState.bodyMetricsHistory.length > 1
    ? appState.bodyMetricsHistory[1]
    : null;
  const weightDelta = prevMetric ? (appState.bodyWeightKg - prevMetric.weightKg).toFixed(1) : null;
  const waistDelta = prevMetric ? (appState.waistCircumferenceCm - prevMetric.waistCm).toFixed(1) : null;
  const tummyDelta = prevMetric ? (appState.tummyCircumferenceCm - prevMetric.tummyCm).toFixed(1) : null;

  // =========================================================================
  // VIEW RENDERER 1: DAILY VIEW (LIVE DAY PULSE)
  // =========================================================================
  const renderDailyView = () => {
    const activeDateStr = dailyData.dateStr;
    const isLiveToday = dailyData.isCurrent;
    const dayScore = getDayCompletionScore(activeDateStr);
    const sealedCount = PILLARS.filter(p => isPillarDone(p.id, activeDateStr)).length;

    const dailyTx = (appState.transactions || []).filter(t => t.timestamp.startsWith(activeDateStr));
    const dailyFinances = computeFinancialSummary(dailyTx, 1);

    return (
      <View style={styles.viewSectionContainer}>
        {/* Daily Momentum & Streak Dual Card */}
        <View style={styles.heroDualCard}>
          <View style={styles.scoreHeroBox}>
            <View style={styles.heroHeaderPill}>
              <Text style={styles.heroSectionTag}>{isLiveToday ? 'TODAY (LIVE)' : 'DAILY PULSE'}</Text>
            </View>

            <View style={styles.heroScoreCircle}>
              <Text style={styles.heroScoreBig}>{dayScore}%</Text>
              <Text style={styles.heroScoreLabel}>Covenant</Text>
            </View>

            <View style={styles.heroRatioPill}>
              <Text style={styles.heroRatioText}>{sealedCount} / 10 Target</Text>
            </View>

            <Text style={styles.heroScoreQuote}>
              {isLiveToday 
                ? (sealedCount === 10 ? 'All 10 sovereign disciplines sealed!' : `${sealedCount} of 10 disciplines sealed today.`)
                : `Daily compliance: ${sealedCount} of 10 disciplines sealed.`}
            </Text>
          </View>

          <View style={styles.streakHeroBox}>
            <View style={styles.streakHeroTop}>
              <View style={styles.flameIconCircle}>
                <Ionicons name="flame" size={20} color="#ffffff" />
              </View>
              <Text style={styles.streakHeroTag}>PURITY STREAK</Text>
            </View>

            <Text style={styles.streakHeroNumber}>{appState.integrity?.purityStreakDays || 0}</Text>
            <Text style={styles.streakHeroUnit}>Days Clean</Text>

            <View style={styles.streakPill}>
              <Ionicons name="shield-checkmark" size={12} color={Colors.emerald} />
              <Text style={styles.streakPillText}>Sovereign Fortress</Text>
            </View>

            <Text style={styles.streakSubNote}>
              {isLiveToday ? 'Daily consecration active' : dailyData.label}
            </Text>
          </View>
        </View>

        {/* Today's 10 Disciplines Consecration Checklist */}
        <View style={styles.dedicatedCard}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="checkbox-outline" size={16} color={Colors.primary} />
              <Text style={styles.cardHeaderTitle}>10 COVENANT DISCIPLINES</Text>
            </View>
            <View style={styles.ratioPillBadge}>
              <Text style={styles.ratioPillText}>{sealedCount} / 10 SEALED</Text>
            </View>
          </View>

          <View style={styles.dailyDisciplinesList}>
            {PILLARS.map(p => {
              const done = isPillarDone(p.id, activeDateStr);
              return (
                <View key={p.id} style={[styles.dailyDisciplineRow, done && styles.dailyDisciplineRowDone]}>
                  <View style={[styles.miniIconCircle, { backgroundColor: p.bgColor }]}>
                    <Ionicons name={p.icon} size={13} color={p.color} />
                  </View>
                  <Text style={[styles.dailyDisciplineName, done && styles.dailyDisciplineNameDone]}>
                    {p.name}
                  </Text>
                  <View style={[styles.statusBadge, done ? styles.statusBadgeDone : styles.statusBadgePending]}>
                    <Ionicons 
                      name={done ? "checkmark" : "time-outline"} 
                      size={11} 
                      color={done ? Colors.emerald : Colors.textMuted} 
                    />
                    <Text style={[styles.statusBadgeText, done && styles.statusBadgeTextDone]}>
                      {done ? 'Sealed' : (isLiveToday ? 'Pending' : 'Unsealed')}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Daily Financial Pulse Card */}
        <View style={styles.financialCard}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="wallet-outline" size={16} color={Colors.primary} />
              <Text style={styles.cardHeaderTitle}>DAILY FINANCIAL PULSE</Text>
            </View>
            {onOpenSpendModal && isLiveToday && (
              <TouchableOpacity
                style={styles.logSpendBtn}
                onPress={() => {
                  safeHaptics.light();
                  onOpenSpendModal();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.logSpendBtnText}>+ Log Expense</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.financeHeroRow}>
            <View>
              <Text style={styles.financeHeroLabel}>TOTAL SPENT</Text>
              <Text style={styles.financeHeroAmount}>₦{dailyFinances.totalSpend.toLocaleString()}</Text>
            </View>
            <View style={styles.burnRateBadge}>
              <Text style={styles.burnRateLabel}>RECEIPTS</Text>
              <Text style={styles.burnRateValue}>{dailyTx.length} Logged</Text>
            </View>
          </View>

          {dailyTx.length === 0 ? (
            <View style={styles.emptyFinanceBox}>
              <Ionicons name="shield-checkmark-outline" size={24} color={Colors.emerald} />
              <Text style={styles.emptyFinanceText}>
                No expenses logged for {dailyData.label}. Financial discipline intact.
              </Text>
            </View>
          ) : (
            <View style={styles.recentTxBox}>
              <Text style={styles.financeSubHeader}>RECEIPTS FOR THIS DAY</Text>
              {dailyTx.map(tx => (
                <View key={tx.id} style={styles.txMiniRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 16 }}>{CATEGORY_ICONS[tx.category] || '💳'}</Text>
                    <View>
                      <Text style={styles.txMiniCategory}>{tx.category}</Text>
                      <Text style={styles.txMiniDate}>
                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {tx.note ? ` • ${tx.note}` : ''}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.txMiniAmount}>₦{tx.amount.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Physical Recovery & Body Metrics */}
        <TouchableOpacity
          style={styles.bodyCard}
          onPress={() => {
            safeHaptics.light();
            if (onOpenBodyModal) onOpenBodyModal();
          }}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="scale-outline" size={16} color={Colors.primary} />
              <Text style={styles.cardHeaderTitle}>BODY COMPOSITION & ANKLE</Text>
            </View>
            <Text style={styles.logSpendBtnText}>Log Audit ➔</Text>
          </View>

          <View style={styles.bodyGrid}>
            <View style={styles.bodyCol}>
              <Text style={styles.bodyVal}>{appState.bodyWeightKg} kg</Text>
              <Text style={styles.bodyLabel}>Weight</Text>
              {weightDelta && (
                <Text style={[styles.bodyDelta, Number(weightDelta) <= 0 ? styles.deltaGood : styles.deltaWarn]}>
                  {Number(weightDelta) > 0 ? `+${weightDelta}` : weightDelta} kg
                </Text>
              )}
            </View>
            <View style={styles.bodyCol}>
              <Text style={styles.bodyVal}>{appState.waistCircumferenceCm} cm</Text>
              <Text style={styles.bodyLabel}>Waist</Text>
              {waistDelta && (
                <Text style={[styles.bodyDelta, Number(waistDelta) <= 0 ? styles.deltaGood : styles.deltaWarn]}>
                  {Number(waistDelta) > 0 ? `+${waistDelta}` : waistDelta} cm
                </Text>
              )}
            </View>
            <View style={styles.bodyCol}>
              <Text style={styles.bodyVal}>{appState.tummyCircumferenceCm} cm</Text>
              <Text style={styles.bodyLabel}>Tummy</Text>
              {tummyDelta && (
                <Text style={[styles.bodyDelta, Number(tummyDelta) <= 0 ? styles.deltaGood : styles.deltaWarn]}>
                  {Number(tummyDelta) > 0 ? `+${tummyDelta}` : tummyDelta} cm
                </Text>
              )}
            </View>
            <View style={styles.bodyCol}>
              <Text style={[styles.bodyVal, { color: Colors.amber }]}>
                {appState.anklePainRating}/10
              </Text>
              <Text style={styles.bodyLabel}>Ankle Strain</Text>
              <Text style={styles.bodySub}>Prehab Active</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // =========================================================================
  // VIEW RENDERER 2: WEEKLY VIEW (7-DAY HABIT MATRIX)
  // =========================================================================
  const renderWeeklyView = () => {
    const weekDays = weekData.days;
    const weekDatesSet = new Set(weekDays.map(d => d.dateStr));
    const weeklyTx = (appState.transactions || []).filter(t => weekDatesSet.has(t.timestamp.slice(0, 10)));
    const weeklyFinances = computeFinancialSummary(weeklyTx, 7);

    const totalWeeklyTarget = 70;
    const totalWeeklyHits = weekDays.reduce(
      (acc, d) => acc + PILLARS.filter(p => isPillarDone(p.id, d.dateStr)).length, 0
    );
    const weeklyCovenantPercent = Math.round((totalWeeklyHits / totalWeeklyTarget) * 100);

    const selectedDay = weekDays[selectedDayIndex] || weekDays[0];
    const selectedScore = getDayCompletionScore(selectedDay.dateStr);
    const isSelectedLiveToday = selectedDay.dateStr === todayStr;

    return (
      <View style={styles.viewSectionContainer}>
        {/* Weekly Momentum & Streak Dual Card */}
        <View style={styles.heroDualCard}>
          <View style={styles.scoreHeroBox}>
            <View style={styles.heroHeaderPill}>
              <Text style={styles.heroSectionTag}>{weekOffset === 0 ? 'THIS WEEK' : 'WEEK SUMMARY'}</Text>
            </View>

            <View style={styles.heroScoreCircle}>
              <Text style={styles.heroScoreBig}>{weeklyCovenantPercent}%</Text>
              <Text style={styles.heroScoreLabel}>Covenant</Text>
            </View>

            <View style={styles.heroRatioPill}>
              <Text style={styles.heroRatioText}>{totalWeeklyHits} / {totalWeeklyTarget} Target</Text>
            </View>

            <Text style={styles.heroScoreQuote}>
              {totalWeeklyHits} of 70 target disciplines sealed this week.
            </Text>
          </View>

          <View style={styles.streakHeroBox}>
            <View style={styles.streakHeroTop}>
              <View style={styles.flameIconCircle}>
                <Ionicons name="flame" size={20} color="#ffffff" />
              </View>
              <Text style={styles.streakHeroTag}>CURRENT STREAK</Text>
            </View>

            <Text style={styles.streakHeroNumber}>{appState.integrity?.purityStreakDays || 0}</Text>
            <Text style={styles.streakHeroUnit}>Days Clean</Text>

            <View style={styles.streakPill}>
              <Ionicons name="shield-checkmark" size={12} color={Colors.emerald} />
              <Text style={styles.streakPillText}>Sovereign Fortress</Text>
            </View>

            <Text style={styles.streakSubNote}>
              {weekData.label}
            </Text>
          </View>
        </View>

        {/* Weekly Habit Rhythm Matrix Card */}
        <View style={styles.matrixCard}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.matrixTitle}>WEEKLY HABIT RHYTHM (7 DAYS)</Text>
              <Text style={styles.matrixSubtitle}>
                {weekDays[0].month} {weekDays[0].dayNumber} – {weekDays[6].month} {weekDays[6].dayNumber}
              </Text>
            </View>
            <View style={styles.ratioPillBadge}>
              <Text style={styles.ratioPillText}>{totalWeeklyHits}/70 CHECKS</Text>
            </View>
          </View>

          {/* Mon-Sun Day Selector Strip */}
          <View style={styles.daySelectorRow}>
            {weekDays.map((d, idx) => {
              const isSel = idx === selectedDayIndex;
              const score = getDayCompletionScore(d.dateStr);

              return (
                <TouchableOpacity
                  key={d.dateStr}
                  style={[
                    styles.daySelectorPill,
                    isSel && styles.daySelectorPillActive,
                    d.isToday && !isSel && styles.daySelectorPillToday,
                    d.isFuture && styles.daySelectorPillFuture,
                  ]}
                  onPress={() => {
                    safeHaptics.light();
                    setSelectedDayIndex(idx);
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={[
                    styles.dayLetterText, 
                    isSel && styles.dayLetterTextActive,
                    d.isFuture && styles.textFutureMuted,
                  ]}>
                    {d.label}
                  </Text>
                  <Text style={[
                    styles.dayNumText, 
                    isSel && styles.dayNumTextActive,
                    d.isFuture && styles.textFutureMuted,
                  ]}>
                    {d.dayNumber}
                  </Text>
                  
                  {d.isFuture ? (
                    <View style={styles.futureDash} />
                  ) : (
                    <View style={[
                      styles.dayScoreIndicator,
                      score >= 80 ? styles.scoreDotGreen : (score >= 30 ? styles.scoreDotAmber : styles.scoreDotGray)
                    ]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Day Inspector Callout */}
          <View style={styles.dayInspectorBox}>
            <View style={styles.dayInspectorHeader}>
              <View>
                <Text style={styles.dayInspectorTitle}>
                  {selectedDay.name}, {selectedDay.month} {selectedDay.dayNumber} {isSelectedLiveToday ? '• Today (Live)' : (selectedDay.isFuture ? '• Upcoming' : '')}
                </Text>
                <Text style={styles.dayInspectorSub}>
                  {selectedDay.isFuture 
                    ? 'Upcoming day — ready to conquer' 
                    : `${selectedScore}% Covenant Accomplished (${Math.round((selectedScore * 10) / 100)}/10 Pillars)`}
                </Text>
              </View>

              <View style={[
                styles.scoreBadgePill, 
                selectedDay.isFuture 
                  ? styles.badgeFuture 
                  : (selectedScore >= 80 ? styles.badgeGreen : (selectedScore >= 30 ? styles.badgeAmber : styles.badgeMuted))
              ]}>
                <Text style={styles.scoreBadgeText}>
                  {selectedDay.isFuture ? '—' : `${selectedScore}%`}
                </Text>
              </View>
            </View>

            {/* Pillars Conquered Chips for Selected Day */}
            <View style={styles.pillarChipsRow}>
              {PILLARS.map(p => {
                const done = isPillarDone(p.id, selectedDay.dateStr);
                return (
                  <View 
                    key={p.id}
                    style={[
                      styles.pillarMiniChip, 
                      done && styles.pillarMiniChipDone,
                      selectedDay.isFuture && styles.pillarMiniChipFuture
                    ]}
                  >
                    <Ionicons 
                      name={done ? "checkmark-circle" : "ellipse-outline"} 
                      size={11} 
                      color={done ? Colors.emerald : (selectedDay.isFuture ? Colors.border : Colors.textMuted)} 
                    />
                    <Text style={[
                      styles.pillarMiniChipText, 
                      done && styles.pillarMiniChipTextDone,
                      selectedDay.isFuture && styles.textFutureMuted,
                    ]}>
                      {p.shortName}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Matrix Table: 10 Pillars vs Mon-Sun Dots */}
          <View style={styles.matrixTable}>
            {PILLARS.map(pillar => {
              let weeklyHits = 0;
              return (
                <View key={pillar.id} style={styles.matrixTableRow}>
                  <View style={styles.matrixTablePillarInfo}>
                    <View style={[styles.miniIconCircle, { backgroundColor: pillar.bgColor }]}>
                      <Ionicons name={pillar.icon} size={12} color={pillar.color} />
                    </View>
                    <Text style={styles.matrixPillarName} numberOfLines={1}>
                      {pillar.name}
                    </Text>
                  </View>

                  <View style={styles.matrixDaysDotsRow}>
                    {weekDays.map(d => {
                      const done = isPillarDone(pillar.id, d.dateStr);
                      if (done) weeklyHits++;

                      return (
                        <View key={d.dateStr} style={styles.matrixDotCell}>
                          {done ? (
                            <View style={styles.greenCheckDot}>
                              <Ionicons name="checkmark" size={10} color="#ffffff" />
                            </View>
                          ) : d.isFuture ? (
                            <View style={styles.futureDot}>
                              <View style={styles.futureDotInner} />
                            </View>
                          ) : d.isToday ? (
                            <View style={styles.todayPendingDot}>
                              <View style={styles.todayPendingDotInner} />
                            </View>
                          ) : (
                            <View style={styles.emptyGrayDot} />
                          )}
                        </View>
                      );
                    })}
                  </View>

                  <View style={styles.matrixScoreCell}>
                    <Text style={styles.matrixScoreText}>
                      {weeklyHits}/7
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Weekly Financial Sovereignty & Ledger */}
        <View style={styles.financialCard}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="wallet-outline" size={16} color={Colors.primary} />
              <Text style={styles.cardHeaderTitle}>WEEKLY FINANCIAL SOVEREIGNTY</Text>
            </View>
            {onOpenSpendModal && weekOffset === 0 && (
              <TouchableOpacity
                style={styles.logSpendBtn}
                onPress={() => {
                  safeHaptics.light();
                  onOpenSpendModal();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.logSpendBtnText}>+ Log Expense</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.financeHeroRow}>
            <View>
              <Text style={styles.financeHeroLabel}>WEEK SPEND</Text>
              <Text style={styles.financeHeroAmount}>₦{weeklyFinances.totalSpend.toLocaleString()}</Text>
            </View>
            <View style={styles.burnRateBadge}>
              <Text style={styles.burnRateLabel}>DAILY BURN</Text>
              <Text style={styles.burnRateValue}>₦{weeklyFinances.dailyBurn.toLocaleString()}/d</Text>
            </View>
          </View>

          {/* Category Breakdown */}
          <View style={styles.categorySection}>
            <Text style={styles.financeSubHeader}>EXPENSE BREAKDOWN</Text>
            {weeklyFinances.totalSpend === 0 ? (
              <View style={styles.emptyFinanceBox}>
                <Ionicons name="receipt-outline" size={24} color={Colors.textMuted} />
                <Text style={styles.emptyFinanceText}>No expenses logged for this 7-day week.</Text>
              </View>
            ) : (
              weeklyFinances.categoriesWithSpend.filter(c => c.amount > 0).map(cat => (
                <View key={cat.category} style={styles.catBarItem}>
                  <View style={styles.catBarHeader}>
                    <Text style={styles.catBarName}>{cat.icon} {cat.category}</Text>
                    <Text style={styles.catBarAmount}>₦{cat.amount.toLocaleString()} ({cat.percent}%)</Text>
                  </View>
                  <View style={styles.catTrack}>
                    <View style={[styles.catFill, { width: `${cat.percent}%` }]} />
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Weekly Receipts Ledger */}
          {weeklyTx.length > 0 && (
            <View style={styles.recentTxBox}>
              <Text style={styles.financeSubHeader}>WEEKLY RECEIPTS ({weeklyTx.length})</Text>
              {weeklyTx.slice(0, 5).map(tx => (
                <View key={tx.id} style={styles.txMiniRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 16 }}>{CATEGORY_ICONS[tx.category] || '💳'}</Text>
                    <View>
                      <Text style={styles.txMiniCategory}>{tx.category}</Text>
                      <Text style={styles.txMiniDate}>
                        {new Date(tx.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {tx.note ? ` • ${tx.note}` : ''}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.txMiniAmount}>₦{tx.amount.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  // =========================================================================
  // VIEW RENDERER 3: MONTHLY VIEW (30/31-DAY CADENCE & RANKING)
  // =========================================================================
  const renderMonthlyView = () => {
    const { targetYear, targetMonthIndex, daysCount, prefix, monthName } = monthData;
    const monthlyTx = (appState.transactions || []).filter(t => t.timestamp.startsWith(prefix));
    const monthlyFinances = computeFinancialSummary(monthlyTx, daysCount);

    const monthTrackedDates = allTrackedDates.filter(d => d.startsWith(prefix));
    const totalMonthTarget = daysCount * 10;
    const totalMonthHits = monthTrackedDates.reduce(
      (acc, d) => acc + PILLARS.filter(p => isPillarDone(p.id, d)).length, 0
    );
    const monthCovenantPercent = Math.round((totalMonthHits / totalMonthTarget) * 100);

    // Compute each pillar's monthly compliance
    const pillarRankings = PILLARS.map(pillar => {
      let hits = 0;
      monthTrackedDates.forEach(d => {
        if (isPillarDone(pillar.id, d)) hits++;
      });
      const pct = (hits / daysCount) * 100;
      return {
        ...pillar,
        hits,
        targetSessions: daysCount,
        percentage: pct,
      };
    }).sort((a, b) => b.percentage - a.percentage);

    // Build cadence for every day of the month 1..daysCount
    const cadenceDays = Array.from({ length: daysCount }, (_, i) => {
      const dayNum = i + 1;
      const dateStr = `${targetYear}-${(targetMonthIndex + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      const isFuture = dateStr > todayStr;
      const score = isFuture ? 0 : getDayCompletionScore(dateStr);
      return { dayNum, dateStr, isToday, isFuture, score };
    });

    return (
      <View style={styles.viewSectionContainer}>
        {/* Monthly Momentum & Streak Dual Card */}
        <View style={styles.heroDualCard}>
          <View style={styles.scoreHeroBox}>
            <View style={styles.heroHeaderPill}>
              <Text style={styles.heroSectionTag}>{monthOffset === 0 ? 'THIS MONTH' : 'MONTH SUMMARY'}</Text>
            </View>

            <View style={styles.heroScoreCircle}>
              <Text style={styles.heroScoreBig}>{monthCovenantPercent}%</Text>
              <Text style={styles.heroScoreLabel}>Covenant</Text>
            </View>

            <View style={styles.heroRatioPill}>
              <Text style={styles.heroRatioText}>{totalMonthHits} / {totalMonthTarget} Target</Text>
            </View>

            <Text style={styles.heroScoreQuote}>
              {totalMonthHits} of {totalMonthTarget} disciplines sealed in {monthName}.
            </Text>
          </View>

          <View style={styles.streakHeroBox}>
            <View style={styles.streakHeroTop}>
              <View style={styles.flameIconCircle}>
                <Ionicons name="flame" size={20} color="#ffffff" />
              </View>
              <Text style={styles.streakHeroTag}>CURRENT STREAK</Text>
            </View>

            <Text style={styles.streakHeroNumber}>{appState.integrity?.purityStreakDays || 0}</Text>
            <Text style={styles.streakHeroUnit}>Days Clean</Text>

            <View style={styles.streakPill}>
              <Ionicons name="shield-checkmark" size={12} color={Colors.emerald} />
              <Text style={styles.streakPillText}>Sovereign Fortress</Text>
            </View>

            <Text style={styles.streakSubNote}>
              {monthData.label}
            </Text>
          </View>
        </View>

        {/* 30/31-Day Visual Cadence Card */}
        <View style={styles.dedicatedCard}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardHeaderTitle}>DAILY CADENCE ({monthName.toUpperCase()})</Text>
              <Text style={styles.cardHeaderSubtitle}>{daysCount} Calendar Days</Text>
            </View>
            <View style={styles.ratioPillBadge}>
              <Text style={styles.ratioPillText}>{monthTrackedDates.length}/{daysCount} DAYS ACTIVE</Text>
            </View>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cadenceScrollContainer}
          >
            {cadenceDays.map(d => (
              <View key={d.dayNum} style={styles.cadenceCol}>
                <Text style={[styles.cadencePercentText, d.isFuture && styles.textFutureMuted]}>
                  {d.isFuture ? '—' : `${d.score}%`}
                </Text>
                <View style={[styles.cadenceBarTrack, d.isToday && styles.cadenceBarTrackToday]}>
                  {!d.isFuture && d.score > 0 ? (
                    <View 
                      style={[
                        styles.cadenceBarFill,
                        { 
                          height: `${Math.max(d.score, 8)}%`,
                          backgroundColor: d.score >= 80 ? Colors.emerald : (d.score >= 30 ? Colors.primary : Colors.honeyDark)
                        }
                      ]} 
                    />
                  ) : d.isToday ? (
                    <View style={styles.todayBarIndicator} />
                  ) : null}
                </View>
                <Text style={[styles.cadenceDayNum, d.isToday && styles.cadenceDayNumToday]}>
                  {d.dayNum}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 10 Covenant Pillars Monthly Ranking */}
        <View style={styles.pillarsBreakdownCard}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardHeaderTitle}>PILLAR CONSISTENCY RANKING</Text>
              <Text style={styles.cardHeaderSubtitle}>Sorted by {monthName} Compliance</Text>
            </View>
            <View style={styles.ratioPillBadge}>
              <Text style={styles.ratioPillText}>TARGET: {daysCount} SESSIONS</Text>
            </View>
          </View>

          <View style={styles.pillarsList}>
            {pillarRankings.map((p, idx) => (
              <View key={p.id} style={styles.pillarProgressRow}>
                <View style={styles.pillarProgressTop}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankBadgeText}>#{idx + 1}</Text>
                    </View>
                    <View style={[styles.miniIconCircle, { backgroundColor: p.bgColor }]}>
                      <Ionicons name={p.icon} size={13} color={p.color} />
                    </View>
                    <Text style={styles.pillarProgressName} numberOfLines={1}>{p.name}</Text>
                  </View>
                  <Text style={styles.pillarProgressPercent}>{formatCovenantPercent(p.percentage)}</Text>
                </View>

                <View style={styles.progressTrackBar}>
                  <View 
                    style={[
                      styles.progressFillBar,
                      { 
                        width: `${Math.min(Math.max(p.percentage, p.hits > 0 ? 3 : 0), 100)}%`,
                        backgroundColor: p.percentage >= 80 
                          ? Colors.emerald 
                          : (p.percentage >= 20 ? Colors.primary : Colors.honeyDark)
                      }
                    ]} 
                  />
                </View>

                <Text style={styles.pillarProgressHits}>
                  {p.hits} of {p.targetSessions} sessions sealed in {monthName} ({formatCovenantPercent(p.percentage)})
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Monthly Financial Sovereignty Card */}
        <View style={styles.financialCard}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="wallet-outline" size={16} color={Colors.primary} />
              <Text style={styles.cardHeaderTitle}>MONTHLY FINANCIAL SOVEREIGNTY</Text>
            </View>
            {onOpenSpendModal && monthOffset === 0 && (
              <TouchableOpacity
                style={styles.logSpendBtn}
                onPress={() => {
                  safeHaptics.light();
                  onOpenSpendModal();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.logSpendBtnText}>+ Log Expense</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.financeHeroRow}>
            <View>
              <Text style={styles.financeHeroLabel}>MONTH TOTAL SPENT</Text>
              <Text style={styles.financeHeroAmount}>₦{monthlyFinances.totalSpend.toLocaleString()}</Text>
            </View>
            <View style={styles.burnRateBadge}>
              <Text style={styles.burnRateLabel}>DAILY BURN</Text>
              <Text style={styles.burnRateValue}>₦{monthlyFinances.dailyBurn.toLocaleString()}/d</Text>
            </View>
          </View>

          {/* Monthly Category Breakdown */}
          <View style={styles.categorySection}>
            <Text style={styles.financeSubHeader}>CATEGORY DISTRIBUTION</Text>
            {monthlyFinances.totalSpend === 0 ? (
              <View style={styles.emptyFinanceBox}>
                <Ionicons name="receipt-outline" size={24} color={Colors.textMuted} />
                <Text style={styles.emptyFinanceText}>No expenses logged for {monthName} {targetYear}.</Text>
              </View>
            ) : (
              monthlyFinances.categoriesWithSpend.filter(c => c.amount > 0).map(cat => (
                <View key={cat.category} style={styles.catBarItem}>
                  <View style={styles.catBarHeader}>
                    <Text style={styles.catBarName}>{cat.icon} {cat.category}</Text>
                    <Text style={styles.catBarAmount}>₦{cat.amount.toLocaleString()} ({cat.percent}%)</Text>
                  </View>
                  <View style={styles.catTrack}>
                    <View style={[styles.catFill, { width: `${cat.percent}%` }]} />
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Monthly Receipts List */}
          {monthlyTx.length > 0 && (
            <View style={styles.recentTxBox}>
              <Text style={styles.financeSubHeader}>{monthName.toUpperCase()} TRANSACTIONS ({monthlyTx.length})</Text>
              {monthlyTx.slice(0, 6).map(tx => (
                <View key={tx.id} style={styles.txMiniRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 16 }}>{CATEGORY_ICONS[tx.category] || '💳'}</Text>
                    <View>
                      <Text style={styles.txMiniCategory}>{tx.category}</Text>
                      <Text style={styles.txMiniDate}>
                        {new Date(tx.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {tx.note ? ` • ${tx.note}` : ''}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.txMiniAmount}>₦{tx.amount.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  // =========================================================================
  // VIEW RENDERER 4: QUARTERLY & YEARLY MACRO VIEWS
  // =========================================================================
  const renderMacroView = (isYearly: boolean) => {
    const isQuarter = !isYearly;
    const targetYear = isQuarter ? quarterData.targetYear : yearData.targetYear;
    const daysCount = isQuarter ? quarterData.daysCount : yearData.daysCount;
    const label = isQuarter ? quarterData.label : yearData.label;

    const macroTx = (appState.transactions || []).filter(t => {
      const y = parseInt(t.timestamp.slice(0, 4), 10);
      if (y !== targetYear) return false;
      if (isQuarter) {
        const m = parseInt(t.timestamp.slice(5, 7), 10);
        return Math.ceil(m / 3) === quarterData.targetQuarterNum;
      }
      return true;
    });

    const macroFinances = computeFinancialSummary(macroTx, daysCount);

    const macroTrackedDates = allTrackedDates.filter(d => {
      const y = parseInt(d.slice(0, 4), 10);
      if (y !== targetYear) return false;
      if (isQuarter) {
        const m = parseInt(d.slice(5, 7), 10);
        return Math.ceil(m / 3) === quarterData.targetQuarterNum;
      }
      return true;
    });

    const totalTarget = daysCount * 10;
    const totalHits = macroTrackedDates.reduce(
      (acc, d) => acc + PILLARS.filter(p => isPillarDone(p.id, d)).length, 0
    );
    const macroCovenantPercent = Math.round((totalHits / totalTarget) * 100);

    const pillarProgression = PILLARS.map(pillar => {
      let hits = 0;
      macroTrackedDates.forEach(d => {
        if (isPillarDone(pillar.id, d)) hits++;
      });
      const pct = (hits / daysCount) * 100;
      return { ...pillar, hits, targetSessions: daysCount, percentage: pct };
    }).sort((a, b) => b.percentage - a.percentage);

    return (
      <View style={styles.viewSectionContainer}>
        {/* Macro Hero Card */}
        <View style={styles.heroDualCard}>
          <View style={styles.scoreHeroBox}>
            <View style={styles.heroHeaderPill}>
              <Text style={styles.heroSectionTag}>{isQuarter ? 'QUARTERLY VOLUME' : 'ANNUAL TRAJECTORY'}</Text>
            </View>

            <View style={styles.heroScoreCircle}>
              <Text style={styles.heroScoreBig}>{macroCovenantPercent}%</Text>
              <Text style={styles.heroScoreLabel}>Covenant</Text>
            </View>

            <View style={styles.heroRatioPill}>
              <Text style={styles.heroRatioText}>{totalHits} / {totalTarget.toLocaleString()} Target</Text>
            </View>

            <Text style={styles.heroScoreQuote}>
              {totalHits} of {totalTarget.toLocaleString()} sovereign disciplines sealed.
            </Text>
          </View>

          <View style={styles.streakHeroBox}>
            <View style={styles.streakHeroTop}>
              <View style={styles.flameIconCircle}>
                <Ionicons name="flame" size={20} color="#ffffff" />
              </View>
              <Text style={styles.streakHeroTag}>CURRENT STREAK</Text>
            </View>

            <Text style={styles.streakHeroNumber}>{appState.integrity?.purityStreakDays || 0}</Text>
            <Text style={styles.streakHeroUnit}>Days Clean</Text>

            <View style={styles.streakPill}>
              <Ionicons name="shield-checkmark" size={12} color={Colors.emerald} />
              <Text style={styles.streakPillText}>Sovereign Fortress</Text>
            </View>

            <Text style={styles.streakSubNote}>
              {label}
            </Text>
          </View>
        </View>

        {/* 10 Covenant Pillars Macro Breakdown */}
        <View style={styles.pillarsBreakdownCard}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardHeaderTitle}>10 COVENANT PILLARS ({isQuarter ? 'QUARTER' : 'ANNUAL'})</Text>
              <Text style={styles.cardHeaderSubtitle}>Target: {daysCount} Sessions per Discipline</Text>
            </View>
          </View>

          <View style={styles.pillarsList}>
            {pillarProgression.map(p => (
              <View key={p.id} style={styles.pillarProgressRow}>
                <View style={styles.pillarProgressTop}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <View style={[styles.miniIconCircle, { backgroundColor: p.bgColor }]}>
                      <Ionicons name={p.icon} size={13} color={p.color} />
                    </View>
                    <Text style={styles.pillarProgressName} numberOfLines={1}>{p.name}</Text>
                  </View>
                  <Text style={styles.pillarProgressPercent}>{formatCovenantPercent(p.percentage)}</Text>
                </View>

                <View style={styles.progressTrackBar}>
                  <View 
                    style={[
                      styles.progressFillBar,
                      { 
                        width: `${Math.min(Math.max(p.percentage, p.hits > 0 ? 3 : 0), 100)}%`,
                        backgroundColor: p.percentage >= 80 
                          ? Colors.emerald 
                          : (p.percentage >= 20 ? Colors.primary : Colors.honeyDark)
                      }
                    ]} 
                  />
                </View>

                <Text style={styles.pillarProgressHits}>
                  {p.hits} of {p.targetSessions} sessions sealed ({formatCovenantPercent(p.percentage)})
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Macro Financial Allocation */}
        <View style={styles.financialCard}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="wallet-outline" size={16} color={Colors.primary} />
              <Text style={styles.cardHeaderTitle}>{isQuarter ? 'QUARTERLY CAPITAL ALLOCATION' : 'ANNUAL CAPITAL ALLOCATION'}</Text>
            </View>
          </View>

          <View style={styles.financeHeroRow}>
            <View>
              <Text style={styles.financeHeroLabel}>TOTAL SPENT</Text>
              <Text style={styles.financeHeroAmount}>₦{macroFinances.totalSpend.toLocaleString()}</Text>
            </View>
            <View style={styles.burnRateBadge}>
              <Text style={styles.burnRateLabel}>DAILY BURN</Text>
              <Text style={styles.burnRateValue}>₦{macroFinances.dailyBurn.toLocaleString()}/d</Text>
            </View>
          </View>

          <View style={styles.categorySection}>
            <Text style={styles.financeSubHeader}>CAPITAL ALLOCATION BREAKDOWN</Text>
            {macroFinances.totalSpend === 0 ? (
              <View style={styles.emptyFinanceBox}>
                <Ionicons name="receipt-outline" size={24} color={Colors.textMuted} />
                <Text style={styles.emptyFinanceText}>No expenses logged for {label}.</Text>
              </View>
            ) : (
              macroFinances.categoriesWithSpend.filter(c => c.amount > 0).map(cat => (
                <View key={cat.category} style={styles.catBarItem}>
                  <View style={styles.catBarHeader}>
                    <Text style={styles.catBarName}>{cat.icon} {cat.category}</Text>
                    <Text style={styles.catBarAmount}>₦{cat.amount.toLocaleString()} ({cat.percent}%)</Text>
                  </View>
                  <View style={styles.catTrack}>
                    <View style={[styles.catFill, { width: `${cat.percent}%` }]} />
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Time Horizon 5-Pill Selector */}
      <View style={styles.horizonBar}>
        {(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as const).map(h => {
          const isSel = horizon === h;
          return (
            <TouchableOpacity
              key={h}
              style={[styles.horizonPill, isSel && styles.horizonPillActive]}
              onPress={() => {
                safeHaptics.light();
                setHorizon(h);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.horizonPillText, isSel && styles.horizonPillTextActive]}>
                {h.charAt(0).toUpperCase() + h.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2. Dynamic Period Pager (< Active Period >) */}
      <View style={styles.periodPagerBar}>
        <TouchableOpacity
          style={styles.pagerNavBtn}
          onPress={handlePrevPeriod}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={16} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.pagerLabelContainer}>
          <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
          <Text style={styles.pagerLabelText}>{currentPagerMeta.label}</Text>
          {currentPagerMeta.isCurrent && (
            <View style={styles.activePillBadge}>
              <Text style={styles.activePillBadgeText}>CURRENT</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.pagerNavBtn, currentPagerMeta.isCurrent && styles.pagerNavBtnDisabled]}
          onPress={handleNextPeriod}
          disabled={currentPagerMeta.isCurrent}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={currentPagerMeta.isCurrent ? Colors.textMuted : Colors.textPrimary} 
          />
        </TouchableOpacity>
      </View>

      {/* 3. Dedicated Screen Modes per Selected Horizon */}
      {horizon === 'daily' && renderDailyView()}
      {horizon === 'weekly' && renderWeeklyView()}
      {horizon === 'monthly' && renderMonthlyView()}
      {horizon === 'quarterly' && renderMacroView(false)}
      {horizon === 'yearly' && renderMacroView(true)}

      {/* 4. Common Discovery: Behavioral Correlation Engine */}
      <View style={styles.insightsCard}>
        <View style={styles.cardHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="sparkles" size={15} color={Colors.primary} />
            <Text style={styles.cardHeaderTitle}>BEHAVIORAL CORRELATION ENGINE</Text>
          </View>
          <View style={styles.insightBadge}>
            <Text style={styles.insightBadgeText}>Deep Discovery</Text>
          </View>
        </View>

        <View style={styles.insightBox}>
          <Text style={styles.insightHeadline}>☀️ The Morning Anchor Multiplier</Text>
          <Text style={styles.insightBody}>
            Completing your <Text style={{ fontWeight: '800' }}>05:30 Wakeup Prayer & Track Walk</Text> correlates to a <Text style={{ fontWeight: '800', color: Colors.primary }}>92%</Text> probability of completing 90m+ of Deep Work. The morning anchor commands the entire cognitive day.
          </Text>
        </View>

        <View style={styles.insightBox}>
          <Text style={styles.insightHeadline}>📧 Daily Scholarship Compounding</Text>
          <Text style={styles.insightBody}>
            Sending <Text style={{ fontWeight: '800' }}>1 Cold Email</Text> daily produces 365 academic professor touchpoints annually. Compounding research outreach shifts Masters/PhD scholarship admission from random luck to mathematical certainty.
          </Text>
        </View>

        <View style={styles.insightBox}>
          <Text style={styles.insightHeadline}>🥗 Hara Hachi Bu & Dopamine Shield</Text>
          <Text style={styles.insightBody}>
            Stopping at <Text style={{ fontWeight: '800' }}>80% Fullness</Text> stabilizes postprandial glucose, eliminating afternoon mental fog and dropping compulsive evening urges to 0%.
          </Text>
        </View>

        <View style={styles.insightBox}>
          <Text style={styles.insightHeadline}>🎸 Screen-Free Acoustic Decompression</Text>
          <Text style={styles.insightBody}>
            15 minutes of tactile acoustic guitar prevents cognitive work-bleed, initiating parasympathetic vagal tone and protecting deep neuroplastic sleep.
          </Text>
        </View>
      </View>

      {/* 5. Motivational Stoic Footer */}
      <View style={styles.footerInspoCard}>
        <Ionicons name="leaf" size={22} color={Colors.emerald} />
        <Text style={styles.footerQuote}>
          "Progress, not perfection. Small disciplines repeated every single day compound into an unshakeable sovereign life."
        </Text>
        <Text style={styles.footerCovenantSign}>SELF COMPANION • THE COVENANT MIRROR</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
    gap: 12,
  },
  viewSectionContainer: {
    gap: 12,
  },

  // 1. Horizon Bar
  horizonBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  horizonPill: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: BorderRadius.full,
  },
  horizonPillActive: {
    backgroundColor: Colors.primary,
    ...Shadows.soft,
  },
  horizonPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  horizonPillTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },

  // 2. Dynamic Period Pager Bar
  periodPagerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  pagerNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagerNavBtnDisabled: {
    opacity: 0.3,
  },
  pagerLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pagerLabelText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  activePillBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  activePillBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 0.5,
  },

  // Hero Dual Card
  heroDualCard: {
    flexDirection: 'row',
    gap: 10,
  },
  scoreHeroBox: {
    flex: 1.25,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.card,
  },
  heroHeaderPill: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginBottom: 4,
  },
  heroSectionTag: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 0.6,
  },
  heroScoreCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 3,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  heroScoreBig: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
  },
  heroScoreLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: -2,
  },
  heroRatioPill: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginBottom: 4,
  },
  heroRatioText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  heroScoreQuote: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 14,
  },

  streakHeroBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.card,
  },
  streakHeroTop: {
    alignItems: 'center',
  },
  flameIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    ...Shadows.soft,
  },
  streakHeroTag: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  streakHeroNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  streakHeroUnit: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: -4,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.emeraldMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  streakPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.emerald,
  },
  streakSubNote: {
    fontSize: 9,
    color: Colors.textMuted,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 2,
  },

  // Dedicated Card Container
  dedicatedCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  cardHeaderSubtitle: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  ratioPillBadge: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  ratioPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textPrimary,
  },

  // Daily Disciplines List
  dailyDisciplinesList: {
    gap: 8,
    marginTop: 4,
  },
  dailyDisciplineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    gap: 10,
  },
  dailyDisciplineRowDone: {
    backgroundColor: Colors.primaryMuted,
  },
  dailyDisciplineName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dailyDisciplineNameDone: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
  },
  statusBadgeDone: {
    backgroundColor: Colors.emeraldMuted,
  },
  statusBadgePending: {
    backgroundColor: Colors.surface,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  statusBadgeTextDone: {
    color: Colors.emerald,
    fontWeight: '800',
  },

  // Matrix Card (Weekly)
  matrixCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  matrixTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  matrixSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  daySelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  daySelectorPill: {
    width: (SCREEN_WIDTH - 68) / 7,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceHighlight,
  },
  daySelectorPillActive: {
    backgroundColor: Colors.primary,
    ...Shadows.soft,
  },
  daySelectorPillToday: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  daySelectorPillFuture: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  dayLetterText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  dayLetterTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  dayNumText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  dayNumTextActive: {
    color: '#ffffff',
  },
  dayScoreIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
  futureDash: {
    width: 6,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  scoreDotGreen: {
    backgroundColor: Colors.emerald,
  },
  scoreDotAmber: {
    backgroundColor: Colors.honeyDark,
  },
  scoreDotGray: {
    backgroundColor: Colors.border,
  },
  textFutureMuted: {
    color: Colors.textDisabled,
  },

  // Day Inspector
  dayInspectorBox: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  dayInspectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayInspectorTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  dayInspectorSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  scoreBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeGreen: {
    backgroundColor: Colors.emeraldMuted,
  },
  badgeAmber: {
    backgroundColor: Colors.honey,
  },
  badgeMuted: {
    backgroundColor: Colors.borderLight,
  },
  badgeFuture: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  scoreBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  pillarChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  pillarMiniChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  pillarMiniChipDone: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primaryBorder,
  },
  pillarMiniChipFuture: {
    backgroundColor: 'transparent',
    borderColor: Colors.borderLight,
    opacity: 0.6,
  },
  pillarMiniChipText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  pillarMiniChipTextDone: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },

  // Matrix Table
  matrixTable: {
    gap: 8,
    marginTop: 4,
  },
  matrixTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matrixTablePillarInfo: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matrixPillarName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  matrixDaysDotsRow: {
    flex: 1.3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  matrixDotCell: {
    width: 18,
    alignItems: 'center',
  },
  greenCheckDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.emerald,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayPendingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayPendingDotInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  emptyGrayDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  futureDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
    marginTop: 4,
    opacity: 0.45,
  },
  futureDotInner: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.border,
  },
  matrixScoreCell: {
    width: 32,
    alignItems: 'flex-end',
  },
  matrixScoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
  },

  // Monthly Cadence Scroll
  cadenceScrollContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  cadenceCol: {
    alignItems: 'center',
    width: 30,
  },
  cadencePercentText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  cadenceBarTrack: {
    width: 14,
    height: 80,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  cadenceBarTrackToday: {
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  cadenceBarFill: {
    width: '100%',
    borderRadius: 7,
  },
  todayBarIndicator: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.primary,
  },
  cadenceDayNum: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 6,
  },
  cadenceDayNumToday: {
    color: Colors.primary,
    fontWeight: '900',
  },

  // 10 Covenant Pillars Breakdown / Rankings
  pillarsBreakdownCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  pillarsList: {
    gap: 12,
    marginTop: 6,
  },
  pillarProgressRow: {
    gap: 5,
  },
  pillarProgressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankBadge: {
    width: 22,
    height: 18,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  pillarProgressName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  pillarProgressPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  progressTrackBar: {
    height: 6,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFillBar: {
    height: '100%',
    borderRadius: 3,
  },
  pillarProgressHits: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },

  // Financial Sovereignty Card
  financialCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  logSpendBtn: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  logSpendBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  financeHeroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  financeHeroLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.6,
  },
  financeHeroAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  burnRateBadge: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.lg,
    alignItems: 'flex-end',
  },
  burnRateLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  burnRateValue: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  categorySection: {
    gap: 8,
    marginBottom: Spacing.sm,
  },
  financeSubHeader: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  emptyFinanceBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 4,
  },
  emptyFinanceText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    fontWeight: '600',
  },
  catBarItem: {
    gap: 3,
  },
  catBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  catBarName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  catBarAmount: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  catTrack: {
    height: 5,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  catFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2.5,
  },
  recentTxBox: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
    gap: 6,
  },
  txMiniRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  txMiniCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  txMiniDate: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  txMiniAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },

  // Body Composition Card
  bodyCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  bodyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  bodyCol: {
    alignItems: 'center',
    flex: 1,
  },
  bodyVal: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  bodyLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '700',
    marginTop: 1,
  },
  bodyDelta: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
  },
  deltaGood: {
    color: Colors.emerald,
  },
  deltaWarn: {
    color: Colors.ruby,
  },
  bodySub: {
    fontSize: 8,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Behavioral Correlation Engine
  insightsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 8,
    ...Shadows.card,
  },
  insightBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  insightBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  insightBox: {
    backgroundColor: Colors.surfaceHighlight,
    padding: 10,
    borderRadius: BorderRadius.lg,
    gap: 3,
  },
  insightHeadline: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  insightBody: {
    fontSize: 10,
    color: Colors.textSecondary,
    lineHeight: 15,
  },

  // Footer Inspiration Card
  footerInspoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  footerQuote: {
    fontSize: 11,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  footerCovenantSign: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
});
