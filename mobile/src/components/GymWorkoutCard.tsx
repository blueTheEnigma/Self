import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { GymLog } from '../types';
import { safeHaptics } from '../services/haptics';

interface GymWorkoutCardProps {
  gymLog?: GymLog;
  lastGymLog?: GymLog | null;
  onSaveGym: (split: string, exercisesSummary: string, durationMinutes?: number, feelingSummary?: string) => void;
}

const COMMON_SPLITS = [
  'Upper Body',
  'Push Day',
  'Pull Day',
  'Legs & Calves',
  'Full Body',
  'Arms & Delts',
  'Core & Prehab',
];

const DURATION_PRESETS = [30, 45, 60, 75, 90];

export const GymWorkoutCard: React.FC<GymWorkoutCardProps> = ({
  gymLog,
  lastGymLog,
  onSaveGym,
}) => {
  const [split, setSplit] = useState(gymLog?.split || 'Upper Body');
  const [customSplit, setCustomSplit] = useState('');
  const [exercisesSummary, setExercisesSummary] = useState(gymLog?.exercisesSummary || '');
  const [duration, setDuration] = useState(gymLog?.durationMinutes ? gymLog.durationMinutes.toString() : '50');
  const [feeling, setFeeling] = useState(gymLog?.feelingSummary || '');
  const [isSaved, setIsSaved] = useState(Boolean(gymLog));

  useEffect(() => {
    if (gymLog) {
      setSplit(gymLog.split);
      setExercisesSummary(gymLog.exercisesSummary);
      setDuration(gymLog.durationMinutes ? gymLog.durationMinutes.toString() : '50');
      setFeeling(gymLog.feelingSummary || '');
      setIsSaved(true);
    } else {
      setSplit('Upper Body');
      setCustomSplit('');
      setExercisesSummary('');
      setDuration('50');
      setFeeling('');
      setIsSaved(false);
    }
  }, [gymLog]);

  const handleSave = () => {
    safeHaptics.success();
    const activeSplit = customSplit.trim() ? customSplit.trim() : split;
    const durNum = parseInt(duration, 10) || 45;
    onSaveGym(activeSplit, exercisesSummary.trim(), durNum, feeling.trim() || undefined);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <Ionicons name="barbell" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.cardTitle}>GYM STRENGTH SESSION</Text>
            <Text style={styles.cardSubtitle}>Free-Form Lifts, Machines & Volume</Text>
          </View>
        </View>

        {gymLog ? (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-done" size={13} color={Colors.primary} />
            <Text style={styles.completedBadgeText}>Logged</Text>
          </View>
        ) : (
          <View style={styles.dueBadge}>
            <Text style={styles.dueBadgeText}>Gym Strength</Text>
          </View>
        )}
      </View>

      {/* Muscle Split Quick Selector */}
      <View style={styles.sectionBlock}>
        <Text style={styles.inputLabel}>FOCUS / MUSCLE SPLIT</Text>
        <View style={styles.splitChipsRow}>
          {COMMON_SPLITS.map(s => {
            const isSel = split === s && !customSplit;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.splitChip, isSel && styles.splitChipActive]}
                onPress={() => {
                  safeHaptics.light();
                  setSplit(s);
                  setCustomSplit('');
                }}
                activeOpacity={0.75}
              >
                <Text style={[styles.splitChipText, isSel && styles.splitChipTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Freeform Exercises, Sets & Reps Text Field */}
      <View style={styles.sectionBlock}>
        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>WHAT DID YOU DO? (EXERCISES, SETS & REPS)</Text>
          {lastGymLog && (
            <TouchableOpacity
              style={styles.recallBtn}
              onPress={() => {
                safeHaptics.medium();
                if (lastGymLog.exercisesSummary) setExercisesSummary(lastGymLog.exercisesSummary);
                if (lastGymLog.split) {
                  setSplit(lastGymLog.split);
                  setCustomSplit('');
                }
                if (lastGymLog.durationMinutes) setDuration(lastGymLog.durationMinutes.toString());
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="flash" size={11} color={Colors.primary} />
              <Text style={styles.recallBtnText}>Recall Last {lastGymLog.split || 'Session'}</Text>
            </TouchableOpacity>
          )}
        </View>
        <TextInput
          style={styles.textAreaExercises}
          placeholder="e.g. Bench Press 3x10 @ 60kg, Incline DB Press 3x12, Lat Pulldown 4x10, Cable Rows 3x12, Lateral Raises 3x15..."
          placeholderTextColor={Colors.textDisabled}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={exercisesSummary}
          onChangeText={setExercisesSummary}
        />
      </View>

      {/* Duration & Intensity / Feeling Row */}
      <View style={styles.metricsRow}>
        {/* Duration Input */}
        <View style={styles.durationInputBox}>
          <Text style={styles.inputLabel}>DURATION (MINS)</Text>
          <View style={styles.durationInputWrapper}>
            <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
            <TextInput
              style={styles.durationInput}
              keyboardType="number-pad"
              value={duration}
              onChangeText={setDuration}
              placeholder="50"
              placeholderTextColor={Colors.textDisabled}
            />
          </View>

          {/* Quick preset chips */}
          <View style={styles.presetChipsRow}>
            {DURATION_PRESETS.map(mins => (
              <TouchableOpacity
                key={mins}
                style={[styles.presetChip, duration === mins.toString() && styles.presetChipActive]}
                onPress={() => {
                  safeHaptics.light();
                  setDuration(mins.toString());
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.presetChipText, duration === mins.toString() && styles.presetChipTextActive]}>
                  {mins}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Feeling / Notes */}
      <View style={styles.sectionBlock}>
        <Text style={styles.inputLabel}>HOW DID YOU FEEL? (ENERGY, PUMPS, ANKLE)</Text>
        <TextInput
          style={styles.textAreaFeeling}
          placeholder="e.g. High energy, good mind-muscle connection. Left ankle had zero pain on leg press."
          placeholderTextColor={Colors.textDisabled}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
          value={feeling}
          onChangeText={setFeeling}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity 
        style={[styles.saveBtn, isSaved && styles.saveBtnDone]}
        onPress={handleSave}
        activeOpacity={0.8}
      >
        <Ionicons 
          name={isSaved ? "checkmark-circle" : "save-outline"} 
          size={16} 
          color="#ffffff" 
        />
        <Text style={styles.saveBtnText}>
          {isSaved ? 'Gym Workout Logged ✓' : (gymLog ? 'Update Gym Workout' : 'Save Gym Workout')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.card,
    gap: 12,
    marginVertical: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  completedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  dueBadge: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  dueBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  sectionBlock: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderFocus,
  },
  recallBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  splitChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  splitChip: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  splitChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  splitChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  splitChipTextActive: {
    color: '#ffffff',
  },
  textAreaExercises: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: 12,
    color: Colors.textPrimary,
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    lineHeight: 18,
  },
  metricsRow: {
    gap: 6,
  },
  durationInputBox: {
    gap: 6,
  },
  durationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 8,
  },
  durationInput: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
    padding: 0,
  },
  presetChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  presetChip: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  presetChipActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primaryBorder,
  },
  presetChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  presetChipTextActive: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  textAreaFeeling: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: 12,
    color: Colors.textPrimary,
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    lineHeight: 16,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    marginTop: 4,
    ...Shadows.soft,
  },
  saveBtnDone: {
    backgroundColor: Colors.emerald,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
});

