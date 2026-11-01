import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme/colors';
import { DayPhase } from '../types';

interface HeaderProps {
  currentDate: string;
  dayPhase: DayPhase;
  waterMl: number;
  waterGoalMl: number;
  purityDays: number;
  onOpenSpend: () => void;
}

const PHASE_NAMES: Record<DayPhase, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  MORNING_RITUAL: { label: 'Morning Ritual', icon: 'sunny-outline', color: Colors.amber },
  DEEP_WORK_1: { label: 'Focus 1: Code Engine', icon: 'code-slash-outline', color: Colors.primary },
  MIDDAY_BUFFER: { label: 'Midday Reset & Hydrate', icon: 'water-outline', color: Colors.cyan },
  DEEP_WORK_2: { label: 'Focus 2: Math Sprint', icon: 'calculator-outline', color: Colors.primary },
  AFTERNOON_BUFFER: { label: 'Lunch & Life Buffer', icon: 'restaurant-outline', color: Colors.textSecondary },
  DEEP_WORK_3: { label: 'Focus 3: Fellowships', icon: 'school-outline', color: Colors.violet },
  LIFE_BUFFER: { label: 'Open Life Buffer', icon: 'walk-outline', color: Colors.textSecondary },
  EVENING_SANCTUARY: { label: 'Evening Sanctuary', icon: 'moon-outline', color: Colors.violet },
  NIGHT_REST: { label: 'Sabbath / Night Rest', icon: 'bed-outline', color: Colors.textMuted },
};

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  dayPhase,
  waterMl,
  waterGoalMl,
  purityDays,
  onOpenSpend,
}) => {
  const phaseInfo = PHASE_NAMES[dayPhase];
  const waterPct = Math.min(Math.round((waterMl / waterGoalMl) * 100), 100);

  // Format date nicely: e.g. "Sunday, Nov 1"
  const dateObj = new Date(currentDate);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.appName}>SELF</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        <View style={styles.statsRow}>
          {/* Water Mini Pill */}
          <View style={styles.statPill}>
            <Ionicons name="water" size={14} color={Colors.cyan} />
            <Text style={styles.statPillText}>{waterMl}ml</Text>
          </View>

          {/* Purity Mini Pill */}
          <View style={[styles.statPill, styles.purityPill]}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.emerald} />
            <Text style={[styles.statPillText, { color: Colors.emerald }]}>Day {purityDays}</Text>
          </View>

          {/* Quick Spend Button */}
          <TouchableOpacity 
            style={styles.spendButton} 
            onPress={onOpenSpend}
            activeOpacity={0.8}
          >
            <Text style={styles.spendButtonText}>₦</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dynamic Contextual Phase Banner */}
      <View style={[styles.phaseBanner, { borderColor: phaseInfo.color + '40' }]}>
        <View style={styles.phaseLeft}>
          <Ionicons name={phaseInfo.icon} size={18} color={phaseInfo.color} />
          <View style={styles.phaseTextGroup}>
            <Text style={styles.phaseTitle}>ACTIVE PHASE</Text>
            <Text style={[styles.phaseLabel, { color: phaseInfo.color }]}>{phaseInfo.label}</Text>
          </View>
        </View>
        <View style={styles.phaseRight}>
          <Text style={styles.waterPctText}>{waterPct}% Water</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 2,
  },
  dateText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  purityPill: {
    borderColor: Colors.emerald + '40',
  },
  statPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  spendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  spendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  phaseBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  phaseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  phaseTextGroup: {
    flexDirection: 'column',
  },
  phaseTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  phaseLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  phaseRight: {
    alignItems: 'flex-end',
  },
  waterPctText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.cyan,
  },
});

