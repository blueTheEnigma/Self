import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme/colors';
import { HabitIntegrityState } from '../types';
import { safeHaptics } from '../services/haptics';

interface IntegrityCardProps {
  integrity: HabitIntegrityState;
  onAddWater: (ml: number) => void;
  onLogFullness: (meal: 'Breakfast' | 'Lunch' | 'Dinner', rating: number) => void;
  onOpenUrgeDefeater: () => void;
}

export const IntegrityCard: React.FC<IntegrityCardProps> = ({
  integrity,
  onAddWater,
  onLogFullness,
  onOpenUrgeDefeater,
}) => {
  const waterPct = Math.min(Math.round((integrity.waterMl / integrity.waterGoalMl) * 100), 100);

  const getMealRating = (meal: 'Breakfast' | 'Lunch' | 'Dinner'): number | null => {
    const found = integrity.fullnessLogs.find(f => f.meal === meal);
    return found ? found.rating : null;
  };

  const handleWaterTap = () => {
    safeHaptics.medium();
    onAddWater(500);
  };

  const handleFullnessTap = (meal: 'Breakfast' | 'Lunch' | 'Dinner', rating: number) => {
    safeHaptics.light();
    onLogFullness(meal, rating);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: Colors.cyanMuted }]}>
            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.cyan} />
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
            <Text style={styles.pillarLabel}>DAILY HYDRATION</Text>
          </View>
          <Text style={styles.pillarMetric}>
            {integrity.waterMl} / {integrity.waterGoalMl} ml ({waterPct}%)
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${waterPct}%` }]} />
        </View>

        <TouchableOpacity 
          style={styles.waterTapBtn}
          onPress={handleWaterTap}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={16} color={Colors.cyan} />
          <Text style={styles.waterTapText}>Drink 500ml Glass (Anchor)</Text>
        </TouchableOpacity>
      </View>

      {/* PILLAR 2: Satiety & Gluttony Guard (Hara Hachi Bu 80% Rule) */}
      <View style={styles.pillarSection}>
        <View style={styles.pillarHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="restaurant-outline" size={16} color={Colors.emerald} />
            <Text style={styles.pillarLabel}>SATIETY SCALE (80% FULL RULE)</Text>
          </View>
          <Text style={styles.ruleBadge}>Target: Level 3 (Satisfied)</Text>
        </View>

        <View style={styles.mealsContainer}>
          {(['Breakfast', 'Lunch', 'Dinner'] as const).map(meal => {
            const currentRating = getMealRating(meal);

            return (
              <View key={meal} style={styles.mealRow}>
                <Text style={styles.mealName}>{meal}</Text>
                <View style={styles.ratingPillsGroup}>
                  {[1, 2, 3, 4, 5].map(r => {
                    const isSelected = currentRating === r;
                    const isGold = r === 3; // The 80% sweet spot

                    return (
                      <TouchableOpacity
                        key={r}
                        style={[
                          styles.ratingPill,
                          isSelected && (isGold ? styles.goldPill : styles.selectedPill),
                        ]}
                        onPress={() => handleFullnessTap(meal, r)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.ratingPillText,
                            isSelected && styles.selectedPillText,
                            isGold && !isSelected && styles.goldPillTextMuted,
                          ]}
                        >
                          {r}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* PILLAR 3: Discreet Purity Shield */}
      <View style={styles.puritySection}>
        <View style={styles.purityLeft}>
          <Ionicons name="shield" size={18} color={Colors.emerald} />
          <View>
            <Text style={styles.purityTitle}>PURITY & CELIBACY SHIELD</Text>
            <Text style={styles.puritySubtitle}>
              November Standard: <Text style={{ color: Colors.emerald, fontWeight: '700' }}>Day {integrity.purityStreakDays} Clean</Text>
            </Text>
          </View>
        </View>
        <Ionicons name="lock-closed" size={16} color={Colors.textMuted} />
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    shadowColor: Colors.ruby,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  urgeBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  pillarSection: {
    marginBottom: Spacing.lg,
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
    marginVertical: Spacing.xs,
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
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.cyan + '40',
  },
  waterTapText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.cyan,
  },
  ruleBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.emerald,
  },
  mealsContainer: {
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  mealName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  ratingPillsGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  ratingPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldPillTextMuted: {
    color: Colors.emerald,
    fontWeight: '700',
  },
  selectedPill: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  goldPill: {
    backgroundColor: Colors.emerald,
    borderColor: Colors.emerald,
  },
  ratingPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  selectedPillText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  puritySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.emeraldMuted,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.emerald + '40',
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
    marginTop: 2,
  },
});

