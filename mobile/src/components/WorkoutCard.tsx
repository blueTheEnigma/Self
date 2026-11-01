import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { WorkoutSession, KaizenOverloadConfig } from '../types';
import { safeHaptics } from '../services/haptics';
import { EXERCISE_GUIDES, ExerciseGuide } from '../services/exerciseData';

interface WorkoutCardProps {
  workout: WorkoutSession;
  overloadConfig: KaizenOverloadConfig;
  onToggleSet: (exerciseIndex: number, setIndex: number) => void;
  onAcceptOverload: () => void;
  onOpenGuide: (guide: ExerciseGuide) => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  overloadConfig,
  onToggleSet,
  onAcceptOverload,
  onOpenGuide,
}) => {
  const [restSeconds, setRestSeconds] = useState<number | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (restSeconds !== null && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds(prev => (prev !== null && prev > 1 ? prev - 1 : null));
      }, 1000);
    } else if (restSeconds === 0) {
      safeHaptics.heavy();
      setRestSeconds(null);
    }
    return () => clearInterval(interval);
  }, [restSeconds]);

  const handleSetPress = (exIndex: number, setIndex: number) => {
    safeHaptics.medium();
    const currentVal = workout.exercises[exIndex].completedSets[setIndex];
    onToggleSet(exIndex, setIndex);

    if (currentVal === 0) {
      setRestSeconds(45);
    }
  };

  const pendingOverload = overloadConfig.pendingSuggestion;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: Colors.amberMuted }]}>
            <Ionicons name="barbell" size={20} color={Colors.amber} />
          </View>
          <View>
            <Text style={styles.cardTitle}>KAIZEN WORKOUT</Text>
            <Text style={styles.cardSubtitle}>
              {workout.isRunDay 
                ? `2.5 km Run + Track Calisthenics` 
                : `Home Calisthenics & Ankle Prehab`}
            </Text>
          </View>
        </View>

        {workout.completed && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-done" size={14} color={Colors.emerald} />
            <Text style={styles.completedText}>ALL SETS DONE</Text>
          </View>
        )}
      </View>

      {/* Kaizen Progressive Overload Banner */}
      {pendingOverload && (
        <View style={styles.overloadBanner}>
          <Ionicons name="trending-up" size={18} color={Colors.amber} />
          <View style={{ flex: 1 }}>
            <Text style={styles.overloadTitle}>KAIZEN PROGRESSION UNLOCKED</Text>
            <Text style={styles.overloadDesc}>
              You nailed 3 clean sessions of {pendingOverload.exercise}! Step up to{' '}
              <Text style={{ fontWeight: '800', color: Colors.amber }}>
                3×{pendingOverload.newTarget} {pendingOverload.unit}
              </Text>{' '}
              today?
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.overloadBtn}
            onPress={() => {
              safeHaptics.success();
              onAcceptOverload();
            }}
          >
            <Text style={styles.overloadBtnText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Active Rest Countdown */}
      {restSeconds !== null && (
        <View style={styles.restTimerBanner}>
          <Ionicons name="timer" size={16} color={Colors.cyan} />
          <Text style={styles.restTimerText}>
            Rest Interval: <Text style={styles.timerBold}>{restSeconds}s</Text>
          </Text>
          <TouchableOpacity 
            onPress={() => setRestSeconds(null)}
            style={styles.skipRestBtn}
          >
            <Text style={styles.skipRestText}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Exercises List */}
      <View style={styles.exerciseList}>
        {workout.exercises.map((ex, exIndex) => {
          let guideKey = 'pushups';
          if (ex.name === 'Horse Stance') guideKey = 'horseStance';
          if (ex.name === 'Active Dead Hang') guideKey = 'activeDeadHang';
          if (ex.name === 'Situps') guideKey = 'situps';

          return (
            <View key={ex.name} style={styles.exerciseRow}>
              <View style={styles.exerciseInfo}>
                <View style={styles.titleWithGuide}>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  <TouchableOpacity 
                    style={styles.infoBadge}
                    onPress={() => {
                      safeHaptics.light();
                      onOpenGuide(EXERCISE_GUIDES[guideKey]);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="play-circle" size={13} color={Colors.primary} />
                    <Text style={styles.infoText}>Guide</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.targetLabel}>
                  Target: 3 × {ex.target} {ex.type === 'HOLD_SECONDS' ? 'sec hold' : 'reps'}
                </Text>
              </View>

              <View style={styles.setButtonGroup}>
                {[0, 1, 2].map(setIndex => {
                  const val = ex.completedSets[setIndex];
                  const isDone = val >= ex.target;

                  return (
                    <TouchableOpacity
                      key={setIndex}
                      style={[
                        styles.setButton,
                        isDone && styles.setButtonDone,
                      ]}
                      onPress={() => handleSetPress(exIndex, setIndex)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.setButtonText, isDone && styles.setButtonTextDone]}>
                        {isDone ? `✓` : `S${setIndex + 1}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>

      {/* Ankle Prehab Section */}
      <View style={styles.prehabContainer}>
        <View style={styles.prehabHeader}>
          <Ionicons name="shield-checkmark" size={15} color={Colors.emerald} />
          <Text style={styles.prehabTitle}>LEFT ANKLE PREHAB & TENDON REPAIR</Text>
        </View>
        <View style={styles.prehabButtonsRow}>
          {[
            { key: 'tibialisWallRaises', label: 'Tibialis Raises' },
            { key: 'eccentricCalfRaises', label: 'Eccentric Calves' },
            { key: 'couchStretch', label: 'Couch Stretch' },
            { key: 'hipFlow9090', label: '90-90 Hip Flow' },
          ].map(item => (
            <TouchableOpacity 
              key={item.key}
              style={styles.prehabPill}
              onPress={() => {
                safeHaptics.light();
                onOpenGuide(EXERCISE_GUIDES[item.key]);
              }}
            >
              <Text style={styles.prehabPillText}>{item.label} ℹ️</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.emeraldMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  completedText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.emerald,
  },
  overloadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.amberMuted,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.amber + '40',
    marginBottom: Spacing.md,
  },
  overloadTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.amber,
    letterSpacing: 0.5,
  },
  overloadDesc: {
    fontSize: 12,
    color: Colors.textPrimary,
    marginTop: 2,
    lineHeight: 16,
  },
  overloadBtn: {
    backgroundColor: Colors.amber,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  overloadBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  restTimerBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cyanMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cyan + '40',
    marginBottom: Spacing.md,
  },
  restTimerText: {
    fontSize: 12,
    color: Colors.cyan,
    fontWeight: '600',
  },
  timerBold: {
    fontWeight: '800',
    fontSize: 14,
  },
  skipRestBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  skipRestText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  exerciseList: {
    gap: Spacing.md,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  exerciseInfo: {
    flex: 1,
  },
  titleWithGuide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  infoText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  targetLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  setButtonGroup: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  setButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setButtonDone: {
    backgroundColor: Colors.emerald,
    borderColor: Colors.emerald,
  },
  setButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  setButtonTextDone: {
    color: '#ffffff',
    fontWeight: '900',
  },
  prehabContainer: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  prehabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  prehabTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.emerald,
    letterSpacing: 0.5,
  },
  prehabButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  prehabPill: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  prehabPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
