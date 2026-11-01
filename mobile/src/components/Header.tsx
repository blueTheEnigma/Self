import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { Typography } from '../theme/typography';
import { DayPhase } from '../types';
import { safeHaptics } from '../services/haptics';

interface HeaderProps {
  currentDate: string;
  dayPhase: DayPhase;
  waterMl: number;
  waterGoalMl: number;
  purityDays: number;
  urgeDivertedCount: number;
  controlledSatietyDays: number;
  fastingUnlocked: boolean;
  todaySpent?: number;
  onOpenSpend: () => void;
  onOpenBodyMetrics: () => void;
}

const PHASE_LABELS: Record<DayPhase, string> = {
  MORNING_RITUAL: 'Morning Ritual',
  DEEP_WORK_1: 'Focus 1: Code Engine',
  MIDDAY_BUFFER: 'Midday Reset',
  DEEP_WORK_2: 'Focus 2: Math Sprint',
  AFTERNOON_BUFFER: 'Lunch & Life Buffer',
  DEEP_WORK_3: 'Focus 3: Fellowships',
  LIFE_BUFFER: 'Open Life Buffer',
  EVENING_SANCTUARY: 'Evening Sanctuary',
  NIGHT_REST: 'Sabbath Night Rest',
};

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  dayPhase,
  waterMl,
  waterGoalMl,
  purityDays,
  urgeDivertedCount,
  controlledSatietyDays,
  fastingUnlocked,
  todaySpent = 0,
  onOpenSpend,
  onOpenBodyMetrics,
}) => {
  const phaseLabel = PHASE_LABELS[dayPhase];
  const waterPct = Math.min(Math.round((waterMl / waterGoalMl) * 100), 100);

  const dateObj = new Date(currentDate);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.appName}>SELF</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        <View style={styles.topRightRow}>
          {/* Active Phase Quiet Pill */}
          <View style={styles.phasePill}>
            <View style={styles.phaseDot} />
            <Text style={styles.phasePillText}>{phaseLabel}</Text>
          </View>

          {/* Quick Spend Live Badge */}
          <TouchableOpacity 
            style={styles.spendPill} 
            onPress={() => {
              safeHaptics.medium();
              onOpenSpend();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.spendSymbol}>₦</Text>
            {todaySpent > 0 && (
              <Text style={styles.spendAmount}>
                {todaySpent >= 1000 ? `${(todaySpent / 1000).toFixed(1)}k` : todaySpent}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Unified Monochromatic Metric Strip (Zero Rainbow Pollution) */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
      >
        {/* Purity Chip */}
        <View style={styles.metricChip}>
          <Ionicons name="shield-checkmark" size={13} color={Colors.primary} />
          <Text style={styles.metricChipText}>Day {purityDays} Clean</Text>
        </View>

        {/* Urges Diverted Chip */}
        <View style={styles.metricChip}>
          <Ionicons name="flash-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.metricChipText}>{urgeDivertedCount} Diverted</Text>
        </View>

        {/* Hydration Chip */}
        <View style={styles.metricChip}>
          <Ionicons name="water-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.metricChipText}>{waterMl}ml ({waterPct}%)</Text>
        </View>

        {/* Satiety Discipline Chip */}
        <View style={styles.metricChip}>
          <Ionicons name="restaurant-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.metricChipText}>
            {controlledSatietyDays}/14d {fastingUnlocked ? '• Fasting' : 'Satiety'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  appName: {
    ...Typography.title1,
    letterSpacing: 1.5,
  },
  dateText: {
    ...Typography.caption,
    marginTop: 1,
  },
  topRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  phasePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  phaseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  phasePillText: {
    ...Typography.micro,
    color: Colors.textSecondary,
    textTransform: 'none',
  },
  spendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  spendSymbol: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  spendAmount: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  chipsScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 6,
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});
