import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
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
  onOpenGuide?: (guide: ExerciseGuide) => void;
  onUpdateRpe?: (rpe: number, notes?: string) => void;
  onUpdateExerciseDifficulty?: (exerciseIndex: number, difficulty: number) => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  overloadConfig,
  onToggleSet,
  onAcceptOverload,
  onUpdateRpe,
  onUpdateExerciseDifficulty,
}) => {
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [rpe, setRpe] = useState(workout.rpeRating || 3);
  const [notes, setNotes] = useState(workout.notes || '');
  const [notesSaved, setNotesSaved] = useState(false);
  const [expandedGuideKey, setExpandedGuideKey] = useState<string | null>(null);

  // Sync state if props change (e.g. date rollover or parent state reload)
  useEffect(() => {
    setNotes(workout.notes || '');
  }, [workout.notes]);

  useEffect(() => {
    setRpe(workout.rpeRating || 3);
  }, [workout.rpeRating]);

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

  const handleExerciseDifficulty = (exIndex: number, diff: number) => {
    safeHaptics.light();
    if (onUpdateExerciseDifficulty) {
      onUpdateExerciseDifficulty(exIndex, diff);
    }
  };

  const handleRpeSelect = (val: number) => {
    safeHaptics.light();
    setRpe(val);
    if (onUpdateRpe) onUpdateRpe(val, notes);
  };

  const handleSaveNotes = () => {
    safeHaptics.success();
    if (onUpdateRpe) onUpdateRpe(rpe, notes);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2500);
  };

  const toggleGuide = (key: string) => {
    safeHaptics.light();
    setExpandedGuideKey(prev => (prev === key ? null : key));
  };

  const pendingOverload = overloadConfig.pendingSuggestion;
  const isAllSetsDone = workout.exercises.every(e => e.completedSets.every(s => s >= e.target));

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: isAllSetsDone ? Colors.mint : Colors.honey }]}>
            <Ionicons 
              name={isAllSetsDone ? "trophy" : "barbell"} 
              size={20} 
              color={isAllSetsDone ? Colors.primary : Colors.honeyDark} 
            />
          </View>
          <View>
            <Text style={styles.cardTitle}>KAIZEN MOVEMENT</Text>
            <Text style={styles.cardSubtitle}>
              {workout.isRunDay 
                ? `2.5 km Run + Track Calisthenics` 
                : `Home Calisthenics & Ankle Prehab`}
            </Text>
          </View>
        </View>

        {isAllSetsDone ? (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-done" size={14} color={Colors.primary} />
            <Text style={styles.completedText}>SEALED ✓</Text>
          </View>
        ) : (
          <Text style={styles.progressCounter}>
            {workout.exercises.reduce((acc, ex) => acc + ex.completedSets.filter(s => s > 0).length, 0)} / 12 Sets
          </Text>
        )}
      </View>

      {/* Kaizen Progressive Overload Banner */}
      {pendingOverload && (
        <View style={styles.overloadBanner}>
          <Ionicons name="trending-up" size={18} color={Colors.honeyDark} />
          <View style={{ flex: 1 }}>
            <Text style={styles.overloadTitle}>KAIZEN PROGRESSION UNLOCKED</Text>
            <Text style={styles.overloadDesc}>
              You nailed 3 clean sessions of {pendingOverload.exercise}! Step up to{' '}
              <Text style={{ fontWeight: '800', color: Colors.honeyDark }}>
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
      {restSeconds !== null && !isAllSetsDone && (
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

          const guide = EXERCISE_GUIDES[guideKey];
          const isGuideOpen = expandedGuideKey === guideKey;
          const isExerciseCompleted = ex.completedSets.every(s => s >= ex.target);
          const hasAnySetsDone = ex.completedSets.some(s => s > 0);

          return (
            <View key={ex.name} style={styles.exerciseBlock}>
              {/* Exercise Header Row */}
              <View style={styles.exerciseRow}>
                <View style={styles.exerciseInfo}>
                  <View style={styles.titleWithGuide}>
                    <Text style={styles.exerciseName}>{ex.name}</Text>
                    <TouchableOpacity 
                      style={[styles.infoBadge, isGuideOpen && styles.infoBadgeActive]}
                      onPress={() => toggleGuide(guideKey)}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={isGuideOpen ? "chevron-up" : "play-circle"} 
                        size={13} 
                        color={isGuideOpen ? '#ffffff' : Colors.primary} 
                      />
                      <Text style={[styles.infoText, isGuideOpen && styles.infoTextActive]}>
                        {isGuideOpen ? 'Close' : 'Guide'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.targetLabel}>
                    Target: 3 × {ex.target} {ex.type === 'HOLD_SECONDS' ? 'sec hold' : 'reps'}
                  </Text>
                </View>

                {/* Set Buttons */}
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

              {/* Per-Exercise Difficulty Selector */}
              {(isExerciseCompleted || hasAnySetsDone) && (
                <View style={styles.perExerciseDiffRow}>
                  <Text style={styles.perExerciseDiffLabel}>DIFFICULTY:</Text>
                  <View style={styles.diffPillsWrap}>
                    {[
                      { val: 1, label: '1 Easy' },
                      { val: 2, label: '2 Light' },
                      { val: 3, label: '3 Optimal' },
                      { val: 4, label: '4 Hard' },
                      { val: 5, label: '5 Max' },
                    ].map(d => {
                      const active = ex.difficultyRating === d.val;
                      return (
                        <TouchableOpacity
                          key={d.val}
                          style={[styles.diffPill, active && styles.diffPillActive]}
                          onPress={() => handleExerciseDifficulty(exIndex, d.val)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.diffPillText, active && styles.diffPillTextActive]}>
                            {d.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* In-Place Expandable Technique Guide */}
              {isGuideOpen && guide && (
                <View style={styles.expandableGuideCard}>
                  {/* Form Cues */}
                  <View style={styles.guideContentSection}>
                    <View style={styles.tempoRow}>
                      <Text style={styles.guideBadge}>{guide.category}</Text>
                      <Text style={styles.guideTempoText}>{guide.animationFrames.tempo}</Text>
                    </View>

                    <Text style={styles.guideSectionTitle}>PERFECT FORM CUES</Text>
                    {guide.cues.map((c, i) => (
                      <View key={i} style={styles.cueRow}>
                        <Ionicons name="checkmark-circle" size={14} color={Colors.primary} style={{ marginTop: 2 }} />
                        <Text style={styles.cueText}>{c}</Text>
                      </View>
                    ))}

                    {/* Mistakes to Avoid */}
                    <Text style={[styles.guideSectionTitle, { color: Colors.ruby, marginTop: 10 }]}>
                      MISTAKES TO AVOID
                    </Text>
                    {guide.mistakesToAvoid.map((m, i) => (
                      <View key={i} style={styles.cueRow}>
                        <Ionicons name="alert-circle" size={14} color={Colors.ruby} style={{ marginTop: 2 }} />
                        <Text style={styles.cueText}>{m}</Text>
                      </View>
                    ))}

                    {/* Kaizen Tip */}
                    <View style={styles.kaizenTipBox}>
                      <Ionicons name="sparkles" size={15} color={Colors.honeyDark} />
                      <Text style={styles.kaizenTipText}>
                        <Text style={{ fontWeight: '700' }}>Form Tip: </Text>{guide.kaizenTip}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Ankle Prehab Section */}
      <View style={styles.prehabContainer}>
        <View style={styles.prehabHeader}>
          <Ionicons name="shield-checkmark" size={15} color={Colors.primary} />
          <Text style={styles.prehabTitle}>LEFT ANKLE PREHAB & TENDON REPAIR</Text>
        </View>
        <View style={styles.prehabButtonsRow}>
          {[
            { key: 'tibialisWallRaises', label: 'Tibialis Raises' },
            { key: 'eccentricCalfRaises', label: 'Eccentric Calves' },
            { key: 'couchStretch', label: 'Couch Stretch' },
            { key: 'hipFlow9090', label: '90-90 Hip Flow' },
          ].map(item => {
            const isPrehabOpen = expandedGuideKey === item.key;
            return (
              <TouchableOpacity 
                key={item.key}
                style={[styles.prehabPill, isPrehabOpen && styles.prehabPillActive]}
                onPress={() => toggleGuide(item.key)}
              >
                <Text style={[styles.prehabPillText, isPrehabOpen && styles.prehabPillTextActive]}>
                  {item.label} {isPrehabOpen ? '▲' : 'ℹ️'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Expandable Prehab Guide */}
        {expandedGuideKey && EXERCISE_GUIDES[expandedGuideKey]?.category.includes('Ankle') && (
          <View style={[styles.expandableGuideCard, { marginTop: 12 }]}>
            <View style={styles.guideContentSection}>
              <Text style={styles.guideSectionTitle}>THERAPEUTIC CUES</Text>
              {EXERCISE_GUIDES[expandedGuideKey].cues.map((c, i) => (
                <View key={i} style={styles.cueRow}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.primary} style={{ marginTop: 2 }} />
                  <Text style={styles.cueText}>{c}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* CELEBRATION SUMMARY WHEN ALL SETS ARE DONE */}
      {isAllSetsDone && (
        <View style={styles.celebrationCard}>
          <View style={styles.celebHeader}>
            <Ionicons name="sparkles" size={18} color={Colors.primary} />
            <Text style={styles.celebTitle}>SESSION COMPLETED & REPUTATION SEALED</Text>
          </View>
          <Text style={styles.celebDesc}>
            All 4 disciplines completed. Progressive overload evaluated.
          </Text>

          {/* Overall Session Exertion Rating */}
          <Text style={styles.rpeLabel}>RATE OVERALL SESSION EFFORT (1 TO 5):</Text>
          <View style={styles.rpeRow}>
            {[
              { val: 1, label: 'Easy' },
              { val: 2, label: 'Light' },
              { val: 3, label: 'Optimal' },
              { val: 4, label: 'Hard' },
              { val: 5, label: 'Max' },
            ].map(item => (
              <TouchableOpacity
                key={item.val}
                style={[styles.rpeBtn, rpe === item.val && styles.rpeBtnActive]}
                onPress={() => handleRpeSelect(item.val)}
              >
                <Text style={[styles.rpeDigit, rpe === item.val && styles.rpeDigitActive]}>
                  {item.val}
                </Text>
                <Text style={[styles.rpeWord, rpe === item.val && styles.rpeWordActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Workout Observation Notes */}
          <View style={styles.notesContainer}>
            <View style={styles.notesHeaderRow}>
              <Text style={styles.notesLabel}>SESSION OBSERVATIONS & ANKLE FEELING</Text>
              {notes.trim().length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    safeHaptics.light();
                    setNotes('');
                    if (onUpdateRpe) onUpdateRpe(rpe, '');
                    setNotesSaved(true);
                    setTimeout(() => setNotesSaved(false), 2000);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.clearNotesText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={styles.notesInput}
              placeholder="How did your left ankle and endurance feel today? (Optional)"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
              onBlur={handleSaveNotes}
            />
            <TouchableOpacity
              style={[styles.saveNotesBtn, notesSaved && styles.saveNotesBtnSaved]}
              onPress={handleSaveNotes}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={notesSaved ? "checkmark-circle" : "save-outline"} 
                size={14} 
                color="#ffffff" 
              />
              <Text style={styles.saveNotesBtnText}>
                {notesSaved ? 'Session Notes Saved ✓' : 'Save Session Notes'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
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
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  completedText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressCounter: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  overloadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.honey,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.honeyBorder,
  },
  overloadTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.honeyDark,
    letterSpacing: 0.5,
  },
  overloadDesc: {
    fontSize: 12,
    color: Colors.textPrimary,
    marginTop: 2,
    lineHeight: 16,
  },
  overloadBtn: {
    backgroundColor: Colors.honeyDark,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  overloadBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  restTimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cyanMuted,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  restTimerText: {
    fontSize: 13,
    color: Colors.textPrimary,
  },
  timerBold: {
    fontWeight: '800',
    color: Colors.cyan,
  },
  skipRestBtn: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  skipRestText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.cyan,
  },
  exerciseList: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  exerciseBlock: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  titleWithGuide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  infoBadgeActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  infoText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  infoTextActive: {
    color: '#ffffff',
  },
  targetLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  setButtonGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  setButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setButtonDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  setButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  setButtonTextDone: {
    color: '#ffffff',
  },
  perExerciseDiffRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  perExerciseDiffLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  diffPillsWrap: {
    flexDirection: 'row',
    gap: 4,
  },
  diffPill: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  diffPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  diffPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  diffPillTextActive: {
    color: '#ffffff',
  },
  expandableGuideCard: {
    marginTop: 12,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  videoPlayerWrapper: {
    width: '100%',
    height: 200,
    backgroundColor: '#000000',
  },
  webView: {
    flex: 1,
  },
  guideContentSection: {
    padding: Spacing.md,
  },
  tempoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  guideBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  guideTempoText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  guideSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cueRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  cueText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 16,
  },
  kaizenTipBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.honey,
    padding: 10,
    borderRadius: BorderRadius.sm,
    marginTop: 10,
  },
  kaizenTipText: {
    flex: 1,
    fontSize: 11,
    color: Colors.honeyDark,
    lineHeight: 15,
  },
  prehabContainer: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  prehabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  prehabTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  prehabButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  prehabPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  prehabPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  prehabPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  prehabPillTextActive: {
    color: '#ffffff',
  },
  celebrationCard: {
    marginTop: Spacing.md,
    backgroundColor: Colors.mint,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.mintBorder,
  },
  celebHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  celebTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.mintDark,
    letterSpacing: 0.5,
  },
  celebDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  rpeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  rpeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  rpeBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rpeBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rpeDigit: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  rpeDigitActive: {
    color: '#ffffff',
  },
  rpeWord: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  rpeWordActive: {
    color: '#ffffff',
  },
  notesContainer: {
    marginTop: 4,
    gap: 6,
  },
  notesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  clearNotesText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.ruby,
  },
  notesInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 12,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 64,
  },
  saveNotesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    marginTop: 2,
    ...Shadows.soft,
  },
  saveNotesBtnSaved: {
    backgroundColor: Colors.emerald,
  },
  saveNotesBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  notesSavedNotice: {
    fontSize: 11,
    color: Colors.primary,
    marginTop: 4,
    fontWeight: '600',
  },
});
