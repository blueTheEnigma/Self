import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { 
  WorkoutSession, 
  KaizenOverloadConfig, 
  WorkoutPhaseGroup, 
  TrainingWeekTier, 
  WeightsVariant, 
  RoutineMode 
} from '../types';
import { safeHaptics } from '../services/haptics';
import { EXERCISE_GUIDES } from '../services/exerciseData';

interface WorkoutCardProps {
  workout: WorkoutSession;
  overloadConfig: KaizenOverloadConfig;
  phases?: WorkoutPhaseGroup[];
  trainingWeekTier?: TrainingWeekTier;
  weightsVariant?: WeightsVariant;
  routineMode?: RoutineMode;
  onTogglePhaseSet: (phaseIndex: number, exerciseIndex: number, setIndex: number) => void;
  onChangeRoutineMode: (mode: RoutineMode) => void;
  onChangeTrainingWeekTier: (tier: TrainingWeekTier) => void;
  onChangeWeightsVariant: (variant: WeightsVariant) => void;
  onAcceptOverload: () => void;
  onUpdateRpe?: (rpe: number, notes?: string) => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  overloadConfig,
  phases = [],
  trainingWeekTier = 'WEEKS_1_2',
  weightsVariant = 'WORKOUT_A',
  routineMode = 'STANDARD',
  onTogglePhaseSet,
  onChangeRoutineMode,
  onChangeTrainingWeekTier,
  onChangeWeightsVariant,
  onAcceptOverload,
  onUpdateRpe,
}) => {
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [rpe, setRpe] = useState(workout.rpeRating || 3);
  const [notes, setNotes] = useState(workout.notes || '');
  const [notesSaved, setNotesSaved] = useState(false);
  const [expandedPhaseIds, setExpandedPhaseIds] = useState<Record<string, boolean>>({});
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null);

  // Initialize expanded phases (all expanded by default)
  useEffect(() => {
    if (phases.length > 0) {
      const initial: Record<string, boolean> = {};
      phases.forEach(p => {
        initial[p.id] = true;
      });
      setExpandedPhaseIds(prev => ({ ...initial, ...prev }));
    }
  }, [phases]);

  // Sync state if props change
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

  const togglePhaseExpanded = (phaseId: string) => {
    safeHaptics.light();
    setExpandedPhaseIds(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  };

  const handleSetPress = (phaseIndex: number, exIndex: number, setIndex: number) => {
    safeHaptics.medium();
    const phase = phases[phaseIndex];
    const ex = phase?.exercises[exIndex];
    const currentVal = ex?.completedSets[setIndex] || 0;

    onTogglePhaseSet(phaseIndex, exIndex, setIndex);

    // If starting a set, trigger rest timer
    if (currentVal === 0) {
      // 60s for calisthenics & conditioning, 45s for standard
      const isCircuitOrCrawl = phase?.id.includes('calisthenics') || phase?.id.includes('bear_crawl');
      setRestSeconds(isCircuitOrCrawl ? 60 : 45);
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

  const toggleGuide = (guideId: string) => {
    safeHaptics.light();
    setExpandedGuideId(prev => (prev === guideId ? null : guideId));
  };

  const totalExercises = phases.reduce((acc, p) => acc + p.exercises.length, 0);
  const completedExercises = phases.reduce(
    (acc, p) => acc + p.exercises.filter(e => e.completedSets.every(s => s > 0)).length, 
    0
  );
  const isAllPhasesDone = totalExercises > 0 && completedExercises === totalExercises;
  const isFloorMode = routineMode === 'FLOOR_EXPRESS';

  return (
    <View style={styles.card}>
      {/* Header HUD */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: isAllPhasesDone ? Colors.mint : Colors.honey }]}>
            <Ionicons 
              name={isAllPhasesDone ? "trophy" : "barbell"} 
              size={20} 
              color={isAllPhasesDone ? Colors.primary : Colors.honeyDark} 
            />
          </View>
          <View>
            <Text style={styles.cardTitle}>
              {workout.isRunDay ? 'RUN DAY PROTOCOL' : 'MOBILITY & PREHAB FLOW'}
            </Text>
            <Text style={styles.cardSubtitle}>
              {workout.isRunDay 
                ? (isFloorMode ? 'Floor Express: Field Walk & Calisthenics' : `2km Run • Calisthenics • Weights ${weightsVariant === 'WORKOUT_A' ? 'A' : 'B'}`)
                : (isFloorMode ? 'Floor Express: 4-Min Essential Mobility' : '19 Movements across 4 Anatomical Clusters')}
            </Text>
          </View>
        </View>

        {isAllPhasesDone ? (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-done" size={14} color={Colors.primary} />
            <Text style={styles.completedText}>SEALED ✓</Text>
          </View>
        ) : (
          <Text style={styles.progressCounter}>
            {completedExercises} / {totalExercises} Done
          </Text>
        )}
      </View>

      {/* Routine Mode Switcher (Standard Protocol vs Floor Express) */}
      <View style={styles.modeSwitcherContainer}>
        <TouchableOpacity
          style={[styles.modePill, !isFloorMode && styles.modePillActive]}
          onPress={() => {
            safeHaptics.light();
            onChangeRoutineMode('STANDARD');
          }}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="flame" 
            size={13} 
            color={!isFloorMode ? '#ffffff' : Colors.textMuted} 
          />
          <Text style={[styles.modePillText, !isFloorMode && styles.modePillTextActive]}>
            Standard Protocol
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modePill, isFloorMode && styles.modePillFloorActive]}
          onPress={() => {
            safeHaptics.light();
            onChangeRoutineMode('FLOOR_EXPRESS');
          }}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="leaf" 
            size={13} 
            color={isFloorMode ? '#ffffff' : Colors.textMuted} 
          />
          <Text style={[styles.modePillText, isFloorMode && styles.modePillTextActive]}>
            Floor Express (Low Energy)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Week Tier & Weights Selector Toolbar (Only in Standard Mode) */}
      {!isFloorMode && (
        <View style={styles.toolbarContainer}>
          {/* Training Week Tiers */}
          <View style={styles.weekTierRow}>
            <Text style={styles.toolbarLabel}>WEEK TIER:</Text>
            <View style={styles.tierPillsWrap}>
              {(['WEEKS_1_2', 'WEEKS_3_4', 'WEEKS_5_PLUS'] as TrainingWeekTier[]).map(tier => {
                const isSelected = trainingWeekTier === tier;
                const label = tier === 'WEEKS_1_2' ? 'Wk 1-2' : tier === 'WEEKS_3_4' ? 'Wk 3-4' : 'Wk 5+';
                return (
                  <TouchableOpacity
                    key={tier}
                    style={[styles.tierPill, isSelected && styles.tierPillActive]}
                    onPress={() => {
                      safeHaptics.light();
                      onChangeTrainingWeekTier(tier);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.tierPillText, isSelected && styles.tierPillTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* If Run Day, offer Weights Workout A vs B selector */}
          {workout.isRunDay && (
            <View style={styles.weightsVariantRow}>
              <Text style={styles.toolbarLabel}>WEIGHTS SPLIT:</Text>
              <View style={styles.tierPillsWrap}>
                {(['WORKOUT_A', 'WORKOUT_B'] as WeightsVariant[]).map(v => {
                  const isSelected = weightsVariant === v;
                  const label = v === 'WORKOUT_A' ? 'Workout A (Squat/Bench)' : 'Workout B (RDL/Press)';
                  return (
                    <TouchableOpacity
                      key={v}
                      style={[styles.weightsPill, isSelected && styles.weightsPillActive]}
                      onPress={() => {
                        safeHaptics.light();
                        onChangeWeightsVariant(v);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.weightsPillText, isSelected && styles.weightsPillTextActive]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Active Rest Countdown Banner */}
      {restSeconds !== null && !isAllPhasesDone && (
        <View style={styles.restTimerBanner}>
          <Ionicons name="timer" size={16} color={Colors.primary} />
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

      {/* Phased Routine Deck */}
      <View style={styles.phasesDeck}>
        {phases.map((phase, phaseIndex) => {
          const isExpanded = expandedPhaseIds[phase.id] ?? true;
          const phaseCompletedExercises = phase.exercises.filter(
            e => e.completedSets.every(s => s > 0)
          ).length;
          const isPhaseDone = phase.exercises.length > 0 && phaseCompletedExercises === phase.exercises.length;

          return (
            <View key={phase.id} style={styles.phaseCard}>
              {/* Phase Header */}
              <TouchableOpacity
                style={styles.phaseHeader}
                onPress={() => togglePhaseExpanded(phase.id)}
                activeOpacity={0.7}
              >
                <View style={styles.phaseHeaderLeft}>
                  <View style={[styles.phaseDot, isPhaseDone && styles.phaseDotDone]} />
                  <View>
                    <Text style={styles.phaseTitle}>{phase.title}</Text>
                    {phase.durationLabel && (
                      <Text style={styles.phaseDuration}>{phase.durationLabel}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.phaseHeaderRight}>
                  {isPhaseDone ? (
                    <View style={styles.phaseDoneBadge}>
                      <Ionicons name="checkmark" size={12} color={Colors.mintDark} />
                      <Text style={styles.phaseDoneText}>SEALED</Text>
                    </View>
                  ) : (
                    <Text style={styles.phaseCounterText}>
                      {phaseCompletedExercises}/{phase.exercises.length}
                    </Text>
                  )}
                  <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color={Colors.textMuted} 
                  />
                </View>
              </TouchableOpacity>

              {/* Phase Exercises (When Expanded) */}
              {isExpanded && (
                <View style={styles.phaseBody}>
                  {phase.exercises.map((ex, exIndex) => {
                    const isExDone = ex.completedSets.every(s => s > 0);
                    const guide = EXERCISE_GUIDES[ex.id] || EXERCISE_GUIDES[ex.name.toLowerCase().replace(/[^a-z]/g, '')];
                    const isGuideOpen = expandedGuideId === ex.id;

                    return (
                      <View key={ex.id} style={styles.exerciseItem}>
                        <View style={styles.exerciseMainRow}>
                          <View style={styles.exerciseTextWrap}>
                            <View style={styles.nameRow}>
                              <Text style={[styles.exerciseNameText, isExDone && styles.exerciseNameTextDone]}>
                                {ex.name}
                              </Text>
                              {ex.unlockWeek && (
                                <View style={styles.unlockBadge}>
                                  <Text style={styles.unlockBadgeText}>Week {ex.unlockWeek}+</Text>
                                </View>
                              )}
                              {guide && (
                                <TouchableOpacity 
                                  style={styles.guideMiniBtn}
                                  onPress={() => toggleGuide(ex.id)}
                                  activeOpacity={0.7}
                                >
                                  <Ionicons 
                                    name={isGuideOpen ? "chevron-up-circle" : "information-circle-outline"} 
                                    size={14} 
                                    color={Colors.primary} 
                                  />
                                </TouchableOpacity>
                              )}
                            </View>

                            <Text style={styles.targetDescText}>{ex.targetDesc}</Text>

                            {/* Caution Alert (e.g. Crab hold left shoulder) */}
                            {ex.cautionNote && (
                              <View style={styles.cautionBanner}>
                                <Ionicons name="warning-outline" size={12} color={Colors.amber} />
                                <Text style={styles.cautionText}>{ex.cautionNote}</Text>
                              </View>
                            )}
                          </View>

                          {/* Set Check Buttons */}
                          <View style={styles.setButtonGroup}>
                            {ex.completedSets.map((val, setIndex) => {
                              const isSetDone = val > 0;
                              return (
                                <TouchableOpacity
                                  key={setIndex}
                                  style={[styles.setBtn, isSetDone && styles.setBtnDone]}
                                  onPress={() => handleSetPress(phaseIndex, exIndex, setIndex)}
                                  activeOpacity={0.7}
                                >
                                  <Text style={[styles.setBtnText, isSetDone && styles.setBtnTextDone]}>
                                    {isSetDone ? '✓' : `S${setIndex + 1}`}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>

                        {/* Guide Panel Details */}
                        {isGuideOpen && guide && (
                          <View style={styles.guideDetailBox}>
                            <Text style={styles.guideMuscles}>🎯 {guide.primaryMuscles}</Text>
                            {guide.cues.map((cue, cIdx) => (
                              <Text key={cIdx} style={styles.guideCue}>• {cue}</Text>
                            ))}
                            {guide.kaizenTip && (
                              <Text style={styles.guideKaizen}>💡 {guide.kaizenTip}</Text>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* RPE Rating Selector */}
      <View style={styles.rpeSection}>
        <Text style={styles.rpeSectionTitle}>SESSION INTENSITY (RPE):</Text>
        <View style={styles.rpePillsWrap}>
          {[
            { val: 1, label: '1 Very Light' },
            { val: 2, label: '2 Light' },
            { val: 3, label: '3 Moderate' },
            { val: 4, label: '4 Hard' },
            { val: 5, label: '5 All-Out' },
          ].map(item => {
            const isRpeActive = rpe === item.val;
            return (
              <TouchableOpacity
                key={item.val}
                style={[styles.rpePill, isRpeActive && styles.rpePillActive]}
                onPress={() => handleRpeSelect(item.val)}
                activeOpacity={0.7}
              >
                <Text style={[styles.rpePillText, isRpeActive && styles.rpePillTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Movement Reflection Notes */}
      <View style={styles.notesSection}>
        <View style={styles.notesHeaderRow}>
          <Text style={styles.notesLabel}>MOVEMENT & ANKLE REFLECTION</Text>
          {notes.length > 0 && (
            <TouchableOpacity onPress={() => setNotes('')}>
              <Text style={styles.clearNotesText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Ankle stability, knee tracking, breathing cadence, energy..."
          placeholderTextColor={Colors.textMuted}
          multiline
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
            {notesSaved ? 'Notes Saved!' : 'Save Session Notes'}
          </Text>
        </TouchableOpacity>
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
    marginBottom: Spacing.lg,
    ...Shadows.soft,
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
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  completedText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  progressCounter: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },

  // Mode Switcher
  modeSwitcherContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: 3,
    marginBottom: Spacing.md,
    gap: 4,
  },
  modePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
  },
  modePillActive: {
    backgroundColor: Colors.primary,
    ...Shadows.soft,
  },
  modePillFloorActive: {
    backgroundColor: Colors.mintDark,
    ...Shadows.soft,
  },
  modePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  modePillTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },

  // Toolbar
  toolbarContainer: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  weekTierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weightsVariantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  toolbarLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  tierPillsWrap: {
    flexDirection: 'row',
    gap: 6,
  },
  tierPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tierPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tierPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tierPillTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  weightsPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  weightsPillActive: {
    backgroundColor: Colors.honeyDark,
    borderColor: Colors.honeyDark,
  },
  weightsPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  weightsPillTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },

  // Rest Timer Banner
  restTimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  restTimerText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  timerBold: {
    fontWeight: '800',
    color: Colors.primary,
  },
  skipRestBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  skipRestText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },

  // Phases Deck
  phasesDeck: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  phaseCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  phaseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
  },
  phaseDotDone: {
    backgroundColor: Colors.mintDark,
  },
  phaseTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  phaseDuration: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  phaseHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  phaseDoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.mint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  phaseDoneText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.mintDark,
  },
  phaseCounterText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },

  // Phase Body & Exercises
  phaseBody: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  exerciseItem: {
    paddingVertical: Spacing.xs,
  },
  exerciseMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseTextWrap: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exerciseNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  exerciseNameTextDone: {
    color: Colors.mintDark,
    textDecorationLine: 'line-through',
  },
  unlockBadge: {
    backgroundColor: Colors.lavender,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  unlockBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.lavenderDark,
  },
  guideMiniBtn: {
    padding: 2,
  },
  targetDescText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 1,
  },
  cautionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.amberMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 3,
  },
  cautionText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.amber,
  },

  // Set Buttons
  setButtonGroup: {
    flexDirection: 'row',
    gap: 5,
  },
  setBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setBtnDone: {
    backgroundColor: Colors.mintDark,
    borderColor: Colors.mintDark,
  },
  setBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  setBtnTextDone: {
    color: '#ffffff',
  },

  // Guide Detail Box
  guideDetailBox: {
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 2,
  },
  guideMuscles: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 2,
  },
  guideCue: {
    fontSize: 10,
    color: Colors.textSecondary,
    lineHeight: 14,
  },
  guideKaizen: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.honeyDark,
    marginTop: 2,
  },

  // RPE Section
  rpeSection: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  rpeSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  rpePillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  rpePill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rpePillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rpePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  rpePillTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },

  // Notes Section
  notesSection: {
    marginTop: Spacing.md,
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
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 12,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 56,
  },
  saveNotesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    ...Shadows.soft,
  },
  saveNotesBtnSaved: {
    backgroundColor: Colors.mintDark,
  },
  saveNotesBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
});
