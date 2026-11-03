import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { safeHaptics } from '../services/haptics';

interface QuickMetricsCardsProps {
  waterMl: number;
  waterGoalMl: number;
  onAddWater: (ml: number) => void;
  movementSetsDone: number;
  movementTotalSets: number;
  isMovementDone?: boolean;
  movementLabel?: string;
  movementSubtitle?: string;
  onOpenMovement: () => void;
  focusMinutesToday: number;
  focusGoalMinutes?: number;
  onOpenFocus: () => void;
}

export const QuickMetricsCards: React.FC<QuickMetricsCardsProps> = ({
  waterMl,
  waterGoalMl,
  onAddWater,
  movementSetsDone,
  movementTotalSets,
  isMovementDone,
  movementLabel,
  movementSubtitle,
  onOpenMovement,
  focusMinutesToday,
  focusGoalMinutes = 90,
  onOpenFocus,
}) => {
  const isWaterDone = waterMl >= waterGoalMl;
  const isMoveComplete = isMovementDone !== undefined ? isMovementDone : movementSetsDone >= movementTotalSets;
  const isFocusDone = focusMinutesToday >= focusGoalMinutes;

  const formatWater = (ml: number) => {
    return (ml / 1000).toFixed(1) + 'L';
  };

  const formatFocus = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <View style={styles.container}>
      {/* 1. Water Card (Peach Tint) */}
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: Colors.peach, borderColor: Colors.peachBorder }]}
        onPress={() => {
          safeHaptics.light();
          onAddWater(500);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="water-outline" size={20} color={Colors.peachDark} />
          </View>
          <View style={[styles.checkCircle, isWaterDone && { backgroundColor: Colors.peachDark, borderColor: Colors.peachDark }]}>
            {isWaterDone && <Ionicons name="checkmark" size={12} color="#ffffff" />}
          </View>
        </View>
        <Text style={styles.cardTitle}>Water</Text>
        <Text style={styles.cardVal}>{formatWater(waterMl)} / {formatWater(waterGoalMl)}</Text>
        <Text style={styles.cardActionSub}>+500ml Tap</Text>
      </TouchableOpacity>

      {/* 2. Movement Card (Mint Tint) */}
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: Colors.mint, borderColor: Colors.mintBorder }]}
        onPress={() => {
          safeHaptics.light();
          onOpenMovement();
        }}
        activeOpacity={0.8}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="barbell-outline" size={20} color={Colors.mintDark} />
          </View>
          <View style={[styles.checkCircle, isMoveComplete && { backgroundColor: Colors.mintDark, borderColor: Colors.mintDark }]}>
            {isMoveComplete && <Ionicons name="checkmark" size={12} color="#ffffff" />}
          </View>
        </View>
        <Text style={styles.cardTitle}>Movement</Text>
        <Text style={styles.cardVal} numberOfLines={1}>
          {movementLabel || `${movementSetsDone} / ${movementTotalSets} sets`}
        </Text>
        <Text style={styles.cardActionSub}>
          {movementSubtitle || 'Movement ➔'}
        </Text>
      </TouchableOpacity>

      {/* 3. Focus Card (Honey Tint) */}
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: Colors.honey, borderColor: Colors.honeyBorder }]}
        onPress={() => {
          safeHaptics.light();
          onOpenFocus();
        }}
        activeOpacity={0.8}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="timer-outline" size={20} color={Colors.honeyDark} />
          </View>
          <View style={[styles.checkCircle, isFocusDone && { backgroundColor: Colors.honeyDark, borderColor: Colors.honeyDark }]}>
            {isFocusDone && <Ionicons name="checkmark" size={12} color="#ffffff" />}
          </View>
        </View>
        <Text style={styles.cardTitle}>Deep Work</Text>
        <Text style={styles.cardVal} numberOfLines={1}>
          {formatFocus(focusMinutesToday)} / {formatFocus(focusGoalMinutes)}
        </Text>
        <Text style={styles.cardActionSub}>
          {isFocusDone ? 'Sealed ✓' : `Target: ${formatFocus(focusGoalMinutes)} ➔`}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: Spacing.md,
  },
  card: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    minHeight: 114,
    justifyContent: 'space-between',
    ...Shadows.soft,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  cardVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardActionSub: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 4,
  },
});
