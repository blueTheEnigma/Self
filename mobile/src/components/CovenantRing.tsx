import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { safeHaptics } from '../services/haptics';

interface CovenantRingProps {
  currentPhaseTitle: string;
  currentPhaseSubtitle?: string;
  currentPhaseIcon: keyof typeof Ionicons.glyphMap;
  purityStreakDays: number;
  completionPercent: number;
  completedCount: number;
  totalCount: number;
  onPressAction?: () => void;
  onPressStreak?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RING_SIZE = Math.min(Math.round(SCREEN_WIDTH * 0.82), 314);
const STROKE_WIDTH = 10;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const INNER_SIZE = RING_SIZE - STROKE_WIDTH * 2 - 24;

export const CovenantRing: React.FC<CovenantRingProps> = ({
  currentPhaseTitle,
  currentPhaseSubtitle,
  currentPhaseIcon,
  purityStreakDays,
  completionPercent,
  completedCount,
  totalCount,
  onPressAction,
  onPressStreak,
}) => {
  const isConsecrated = totalCount > 0 && completedCount === totalCount;
  const ringColor = isConsecrated 
    ? Colors.emerald 
    : (completionPercent >= 75 ? Colors.primary : (completionPercent >= 40 ? Colors.honeyDark : Colors.borderFocus));
  const covenantFraction = Math.max(0, Math.min(completionPercent / 100, 1));
  const strokeDashoffset = CIRCUMFERENCE * (1 - covenantFraction);

  return (
    <View style={styles.container}>
      {/* Massive Ring Track with Real SVG Stroke */}
      <View style={[
        styles.ringOuter, 
        { width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2 },
        isConsecrated && styles.ringOuter100
      ]}>
        <Svg width={RING_SIZE} height={RING_SIZE} style={styles.svgTrack}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke={isConsecrated ? '#D1FAE5' : Colors.surfaceHighlight}
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
          />
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            stroke={ringColor}
            strokeWidth={isConsecrated ? STROKE_WIDTH + 1 : STROKE_WIDTH}
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
            rotation="-90"
          />
        </Svg>

        {/* Generous Hub Inside Ring */}
        <TouchableOpacity 
          style={[styles.centerTouchContainer, { width: INNER_SIZE, height: INNER_SIZE }]}
          onPress={() => {
            safeHaptics.light();
            if (onPressAction) onPressAction();
          }}
          activeOpacity={0.85}
        >
          {/* Top: Flame Streak Pill */}
          <TouchableOpacity 
            style={styles.streakPill}
            onPress={() => {
              safeHaptics.light();
              if (onPressStreak) onPressStreak();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="flame" size={13} color="#F97316" />
            <Text style={styles.streakPillText}>{purityStreakDays} Day Streak</Text>
          </TouchableOpacity>

          {/* Center: Phase Icon & Large Phase Title */}
          <View style={[styles.iconCircle, isConsecrated && styles.iconCircle100]}>
            <Ionicons name={isConsecrated ? "sparkles" : currentPhaseIcon} size={26} color={isConsecrated ? "#F59E0B" : Colors.primary} />
          </View>

          <Text style={styles.phaseTitle} numberOfLines={2}>
            {isConsecrated ? "Sovereign Day Consecrated" : currentPhaseTitle}
          </Text>

          {currentPhaseSubtitle ? (
            <Text style={styles.phaseSubtitle} numberOfLines={2}>
              {isConsecrated ? "All 10 daily covenant disciplines complete" : currentPhaseSubtitle}
            </Text>
          ) : null}

          {/* Bottom Inside Ring: Covenant Score Pill */}
          <View style={[styles.covenantMiniBadge, isConsecrated && styles.covenantMiniBadge100]}>
            <View style={[styles.miniDot, { backgroundColor: isConsecrated ? '#10B981' : (completionPercent >= 75 ? Colors.emerald : Colors.primary) }]} />
            <Text style={[styles.covenantMiniText, isConsecrated && styles.covenantMiniText100]}>
              {isConsecrated ? '👑 Consecrated • 10/10 Sealed' : `${completionPercent}% Covenant • ${completedCount}/${totalCount}`}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Underneath Ring: Milestone Pill */}
      <TouchableOpacity 
        style={styles.recordBadge}
        onPress={onPressStreak}
        activeOpacity={0.8}
      >
        <Text style={styles.recordBadgeText}>
          {purityStreakDays >= 14 ? '🛡️ Sovereign Shield Milestone' : `✨ ${14 - (purityStreakDays % 14)} days to next milestone`}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  ringOuter: {
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
    position: 'relative',
  },
  ringOuter100: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#34D399',
  },
  iconCircle100: {
    backgroundColor: '#FEF3C7',
  },
  covenantMiniBadge100: {
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
  },
  covenantMiniText100: {
    color: '#065F46',
    fontWeight: '800',
  },
  svgTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  centerTouchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  streakPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
    paddingHorizontal: 10,
    lineHeight: 22,
  },
  phaseSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  covenantMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginTop: 10,
  },
  miniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  covenantMiniText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  recordBadge: {
    backgroundColor: Colors.honey,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.honeyBorder,
    marginTop: Spacing.sm,
  },
  recordBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.honeyDark,
  },
});
