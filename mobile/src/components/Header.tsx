import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
  controlledSatietyDays: number;
  fastingUnlocked: boolean;
  onOpenSpend: () => void;
  onOpenBodyMetrics: () => void;
}

const PHASE_NAMES: Record<DayPhase, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; desc: string }> = {
  MORNING_RITUAL: { label: 'Morning Ritual', icon: 'sunny', color: Colors.amber, desc: 'Hydrate, Prayer & 2.5km Movement' },
  DEEP_WORK_1: { label: 'Focus 1: Code Engine', icon: 'code-slash', color: Colors.primary, desc: 'Quant Bot / Paper Thoughts (90m Cap)' },
  MIDDAY_BUFFER: { label: 'Midday Reset & Hydrate', icon: 'water', color: Colors.cyan, desc: 'Step Away from Screens & Breathe' },
  DEEP_WORK_2: { label: 'Focus 2: Math Sprint', icon: 'calculator', color: Colors.primary, desc: 'MIT OCW Multivariable Calculus' },
  AFTERNOON_BUFFER: { label: 'Lunch & Life Buffer', icon: 'restaurant', color: Colors.emerald, desc: 'Mindful Satiety (Level 3 Target)' },
  DEEP_WORK_3: { label: 'Focus 3: Fellowships', icon: 'school', color: Colors.violet, desc: 'Applications & Technical Paper' },
  LIFE_BUFFER: { label: 'Open Life Buffer', icon: 'walk', color: Colors.textSecondary, desc: 'Zero Guilt Life & Errands Buffer' },
  EVENING_SANCTUARY: { label: 'Evening Sanctuary', icon: 'moon', color: Colors.violet, desc: '15m Guitar, Novels & Creative Art' },
  NIGHT_REST: { label: 'Sabbath / Night Rest', icon: 'bed', color: Colors.textMuted, desc: '7 Hours Deep Restorative Sleep' },
};

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  dayPhase,
  waterMl,
  waterGoalMl,
  purityDays,
  controlledSatietyDays,
  fastingUnlocked,
  onOpenSpend,
  onOpenBodyMetrics,
}) => {
  const phaseInfo = PHASE_NAMES[dayPhase];
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

        <View style={styles.topButtonsRow}>
          {/* Body Metrics Button */}
          <TouchableOpacity 
            style={styles.headerIconBtn} 
            onPress={() => {
              safeHaptics.light();
              onOpenBodyMetrics();
            }}
          >
            <Ionicons name="scale-outline" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Quick Spend ₦ Button */}
          <TouchableOpacity 
            style={styles.spendButton} 
            onPress={() => {
              safeHaptics.medium();
              onOpenSpend();
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.spendButtonText}>₦</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PROMINENT INTEGRITY STREAK BANNER */}
      <View style={styles.integrityBanner}>
        <View style={styles.streakCol}>
          <View style={styles.streakLabelRow}>
            <Ionicons name="shield-checkmark" size={15} color={Colors.emerald} />
            <Text style={styles.streakLabel}>CELIBACY & PURITY</Text>
          </View>
          <Text style={styles.streakCount}>Day {purityDays} Clean</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.streakCol}>
          <View style={styles.streakLabelRow}>
            <Ionicons name="restaurant" size={14} color={Colors.emerald} />
            <Text style={styles.streakLabel}>SATIETY DISCIPLINE</Text>
          </View>
          <Text style={styles.streakCount}>
            {controlledSatietyDays} / 14d {fastingUnlocked ? '⚡ Fasting Unlocked' : 'to Fasting'}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.streakCol}>
          <View style={styles.streakLabelRow}>
            <Ionicons name="water" size={14} color={Colors.cyan} />
            <Text style={styles.streakLabel}>HYDRATION</Text>
          </View>
          <Text style={[styles.streakCount, { color: Colors.cyan }]}>{waterMl}ml ({waterPct}%)</Text>
        </View>
      </View>

      {/* Dynamic Contextual Phase Card */}
      <View style={[styles.phaseBanner, { borderLeftColor: phaseInfo.color }]}>
        <View style={styles.phaseLeft}>
          <View style={[styles.phaseIconBox, { backgroundColor: phaseInfo.color + '15' }]}>
            <Ionicons name={phaseInfo.icon} size={18} color={phaseInfo.color} />
          </View>
          <View style={styles.phaseTextGroup}>
            <Text style={styles.phaseTitle}>CURRENT FOCUS PHASE</Text>
            <Text style={[styles.phaseLabel, { color: phaseInfo.color }]}>{phaseInfo.label}</Text>
            <Text style={styles.phaseDesc}>{phaseInfo.desc}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  appName: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 2,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 1,
  },
  topButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.soft,
  },
  spendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.soft,
  },
  spendButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  integrityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    ...Shadows.soft,
  },
  streakCol: {
    flex: 1,
    alignItems: 'center',
  },
  streakLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  streakLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  streakCount: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  phaseBanner: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    ...Shadows.soft,
  },
  phaseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  phaseIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseTextGroup: {
    flexDirection: 'column',
  },
  phaseTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.8,
  },
  phaseLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  phaseDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
});
