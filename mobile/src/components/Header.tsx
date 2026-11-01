import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
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

const PHASE_TAGS: Record<DayPhase, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  MORNING_RITUAL: { label: 'Morning Ritual', icon: 'sunny', color: Colors.amber },
  DEEP_WORK_1: { label: 'Focus 1: Code Engine', icon: 'code-slash', color: Colors.primary },
  MIDDAY_BUFFER: { label: 'Midday Reset', icon: 'water', color: Colors.cyan },
  DEEP_WORK_2: { label: 'Focus 2: Math Sprint', icon: 'calculator', color: Colors.primary },
  AFTERNOON_BUFFER: { label: 'Lunch & Life Buffer', icon: 'restaurant', color: Colors.emerald },
  DEEP_WORK_3: { label: 'Focus 3: Fellowships', icon: 'school', color: Colors.violet },
  LIFE_BUFFER: { label: 'Life Buffer', icon: 'walk', color: Colors.textSecondary },
  EVENING_SANCTUARY: { label: 'Evening Sanctuary', icon: 'moon', color: Colors.violet },
  NIGHT_REST: { label: 'Night Rest', icon: 'bed', color: Colors.textMuted },
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
  const phaseInfo = PHASE_TAGS[dayPhase];
  const waterPct = Math.min(Math.round((waterMl / waterGoalMl) * 100), 100);

  const dateObj = new Date(currentDate);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
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
          {/* Active Phase Pill */}
          <View style={[styles.phasePill, { backgroundColor: phaseInfo.color + '14', borderColor: phaseInfo.color + '40' }]}>
            <Ionicons name={phaseInfo.icon} size={13} color={phaseInfo.color} />
            <Text style={[styles.phasePillText, { color: phaseInfo.color }]}>
              {phaseInfo.label}
            </Text>
          </View>

          {/* Body Metrics Button */}
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => {
              safeHaptics.light();
              onOpenBodyMetrics();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="scale-outline" size={17} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Quick Spend Live Pill */}
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

      {/* Horizontal Compact Streak Metrics Strip (Zero Clutter) */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
      >
        {/* Purity Chip */}
        <View style={[styles.chip, { borderColor: Colors.emerald + '30', backgroundColor: Colors.emeraldMuted }]}>
          <Ionicons name="shield-checkmark" size={12} color={Colors.emerald} />
          <Text style={[styles.chipText, { color: Colors.emerald }]}>
            Day {purityDays} Clean
          </Text>
        </View>

        {/* Urges Diverted Chip */}
        <View style={[styles.chip, { borderColor: Colors.amber + '30', backgroundColor: Colors.amberMuted }]}>
          <Ionicons name="flash" size={12} color={Colors.amber} />
          <Text style={[styles.chipText, { color: Colors.amber }]}>
            {urgeDivertedCount} Diverted
          </Text>
        </View>

        {/* Hydration Chip */}
        <View style={[styles.chip, { borderColor: Colors.cyan + '30', backgroundColor: Colors.cyanMuted }]}>
          <Ionicons name="water" size={12} color={Colors.cyan} />
          <Text style={[styles.chipText, { color: Colors.cyan }]}>
            {waterMl}ml ({waterPct}%)
          </Text>
        </View>

        {/* Satiety Discipline Chip */}
        <View style={[styles.chip, { borderColor: Colors.primary + '30', backgroundColor: Colors.primaryMuted }]}>
          <Ionicons name="restaurant" size={12} color={Colors.primary} />
          <Text style={[styles.chipText, { color: Colors.primary }]}>
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
    paddingBottom: Spacing.sm,
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
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 2,
  },
  dateText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
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
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  phasePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    ...Shadows.soft,
  },
  spendSymbol: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  spendAmount: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  chipsScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 6,
    paddingBottom: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
