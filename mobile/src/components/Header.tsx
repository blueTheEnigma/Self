import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme/colors';
import { DayPhase } from '../types';
import { safeHaptics } from '../services/haptics';

interface HeaderProps {
  currentDate: string;
  dayPhase: DayPhase;
  isPreviewing?: boolean;
  onResetLive?: () => void;
  waterMl?: number;
  waterGoalMl?: number;
  purityDays?: number;
  urgeDivertedCount?: number;
  controlledSatietyDays?: number;
  fastingUnlocked?: boolean;
  todaySpent?: number;
  onOpenSpend: () => void;
  onOpenBodyMetrics: () => void;
  onOpenSettings?: () => void;
}

const PHASE_LABELS: Record<DayPhase, string> = {
  MORNING_RITUAL: 'Morning',
  DEEP_WORK_1: 'Focus 1',
  MIDDAY_BUFFER: 'Reset',
  DEEP_WORK_2: 'Focus 2',
  AFTERNOON_BUFFER: 'Lunch',
  DEEP_WORK_3: 'Focus 3',
  LIFE_BUFFER: 'Buffer',
  EVENING_SANCTUARY: 'Sanctuary',
  NIGHT_REST: 'Rest',
};

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  dayPhase,
  isPreviewing = false,
  onResetLive,
  todaySpent = 0,
  onOpenSpend,
  onOpenBodyMetrics,
  onOpenSettings,
}) => {
  const phaseLabel = PHASE_LABELS[dayPhase];

  const dateObj = new Date(currentDate);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      {/* Top Airy App Bar */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.appName}>SELF</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        <View style={styles.actionsRow}>
          {/* Active Phase Pill */}
          <TouchableOpacity 
            style={[styles.phasePill, isPreviewing && styles.phasePillPreview]}
            onPress={isPreviewing ? onResetLive : undefined}
            activeOpacity={isPreviewing ? 0.7 : 1}
          >
            <View style={[styles.phaseDot, isPreviewing && styles.phaseDotPreview]} />
            <Text style={[styles.phasePillText, isPreviewing && styles.phasePillTextPreview]}>
              {phaseLabel}{isPreviewing ? ' (Preview)' : ''}
            </Text>
            {isPreviewing && (
              <Ionicons name="close-circle" size={13} color={Colors.primary} style={{ marginLeft: 2 }} />
            )}
          </TouchableOpacity>

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

          {/* Body Metrics / Audit Icon Button */}
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => {
              safeHaptics.light();
              onOpenBodyMetrics();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="scale-outline" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Settings / Protocols Icon Button */}
          {onOpenSettings && (
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => {
                safeHaptics.light();
                onOpenSettings();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={17} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 2,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phasePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 5,
  },
  phasePillPreview: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  phaseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  phaseDotPreview: {
    backgroundColor: Colors.primaryDark,
  },
  phasePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  phasePillTextPreview: {
    color: Colors.primary,
  },
  spendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 3,
  },
  spendSymbol: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  spendAmount: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  settingsBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
