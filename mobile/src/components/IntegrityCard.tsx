import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { HabitIntegrityState } from '../types';
import { safeHaptics } from '../services/haptics';

interface IntegrityCardProps {
  integrity: HabitIntegrityState;
  onAddWater: (ml: number) => void;
  onOpenMealModal: (meal: 'Breakfast' | 'Lunch' | 'Dinner', currentRating: number) => void;
  onOpenUrgeDefeater: () => void;
}

export const IntegrityCard: React.FC<IntegrityCardProps> = ({
  integrity,
  onAddWater,
  onOpenMealModal,
  onOpenUrgeDefeater,
}) => {
  const waterPct = Math.min(Math.round((integrity.waterMl / integrity.waterGoalMl) * 100), 100);

  const getMealLog = (meal: 'Breakfast' | 'Lunch' | 'Dinner') => {
    return integrity.fullnessLogs.find(f => f.meal === meal);
  };

  const handleWaterTap = () => {
    safeHaptics.medium();
    onAddWater(500);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: Colors.cyanMuted }]}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.cyan} />
          </View>
          <View>
            <Text style={styles.cardTitle}>INTEGRITY & TEMPERANCE</Text>
            <Text style={styles.cardSubtitle}>Hydration, Satiety & Purity Mastery</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.urgeDefeaterBtn}
          onPress={() => {
            safeHaptics.warning();
            onOpenUrgeDefeater();
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="flash" size={13} color="#ffffff" />
          <Text style={styles.urgeBtnText}>Urge Defeater</Text>
        </TouchableOpacity>
      </View>

      {/* PILLAR 1: Hydration Gauge */}
      <View style={styles.pillarSection}>
        <View style={styles.pillarHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="water" size={16} color={Colors.cyan} />
            <Text style={styles.pillarLabel}>DAILY HYDRATION ANCHOR</Text>
          </View>
          <Text style={styles.pillarMetric}>
            {integrity.waterMl} / {integrity.waterGoalMl} ml ({waterPct}%)
          </Text>
        </View>

        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${waterPct}%` }]} />
        </View>

        <TouchableOpacity 
          style={styles.waterTapBtn}
          onPress={handleWaterTap}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={18} color={Colors.cyan} />
          <Text style={styles.waterTapText}>Drink 500ml Glass (Anchor)</Text>
        </TouchableOpacity>
      </View>

      {/* PILLAR 2: Satiety & Gluttony Guard */}
      <View style={styles.pillarSection}>
        <View style={styles.pillarHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="restaurant" size={16} color={Colors.emerald} />
            <Text style={styles.pillarLabel}>SATIETY SCALE (80% FULL RULE)</Text>
          </View>
          <Text style={styles.ruleBadge}>Target: Level 3</Text>
        </View>

        <View style={styles.mealsContainer}>
          {(['Breakfast', 'Lunch', 'Dinner'] as const).map(meal => {
            const log = getMealLog(meal);
            const currentRating = log ? log.rating : 3;

            return (
              <TouchableOpacity 
                key={meal} 
                style={styles.mealRow}
                onPress={() => {
                  safeHaptics.light();
                  onOpenMealModal(meal, currentRating);
                }}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.mealName}>{meal}</Text>
                  {log?.description ? (
                    <Text style={styles.mealDesc} numberOfLines={1}>{log.description}</Text>
                  ) : (
                    <Text style={styles.mealTapPrompt}>Tap to log fullness & food...</Text>
                  )}
                </View>

                {log ? (
                  <View style={[styles.ratingBadge, log.rating === 3 ? styles.goldBadge : (log.rating > 3 ? styles.redBadge : styles.blueBadge)]}>
                    <Text style={styles.ratingBadgeText}>Level {log.rating}</Text>
                  </View>
                ) : (
                  <View style={styles.unloggedBadge}>
                    <Text style={styles.unloggedBadgeText}>+ Rate</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* PILLAR 3: Discreet Purity Shield */}
      <View style={styles.puritySection}>
        <View style={styles.purityLeft}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.emerald} />
          <View>
            <Text style={styles.purityTitle}>CELIBACY & PURITY SHIELD</Text>
            <Text style={styles.puritySubtitle}>
              Standard: <Text style={{ color: Colors.emerald, fontWeight: '800' }}>Day {integrity.purityStreakDays} Clean</Text>
            </Text>
          </View>
        </View>
        <Ionicons name="lock-closed" size={16} color={Colors.emerald} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  urgeDefeaterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.ruby,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    ...Shadows.soft,
  },
  urgeBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  pillarSection: {
    marginBottom: Spacing.md,
  },
  pillarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  pillarLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  pillarMetric: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.cyan,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.cyan,
    borderRadius: 4,
  },
  waterTapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.cyanMuted,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  waterTapText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.cyan,
  },
  ruleBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.emerald,
  },
  mealsContainer: {
    marginTop: Spacing.xs,
    gap: 6,
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mealName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  mealDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  mealTapPrompt: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: 'italic',
    marginTop: 1,
  },
  ratingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  goldBadge: {
    backgroundColor: Colors.emerald,
  },
  redBadge: {
    backgroundColor: Colors.ruby,
  },
  blueBadge: {
    backgroundColor: Colors.primary,
  },
  ratingBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  unloggedBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unloggedBadgeText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  puritySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.emeraldMuted,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.emerald + '30',
  },
  purityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  purityTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.emerald,
    letterSpacing: 0.5,
  },
  puritySubtitle: {
    fontSize: 12,
    color: Colors.textPrimary,
    marginTop: 1,
  },
});
