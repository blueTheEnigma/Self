import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { ProjectFocusTag, DayPhase, ActiveFocusSession } from '../types';
import { safeHaptics } from '../services/haptics';

interface FocusTimerCardProps {
  currentPhase?: DayPhase;
  onSelectPhase?: (phase: DayPhase) => void;
  onCompleteBlock: (project: ProjectFocusTag, durationMinutes: number) => void;
  activeFocusSession?: ActiveFocusSession;
  onUpdateFocusSession?: (session: Partial<ActiveFocusSession>) => void;
}

const PROJECTS: { tag: ProjectFocusTag; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { tag: 'Quant Bot', icon: 'code-slash', label: 'Quant Bot' },
  { tag: 'MIT OCW Calc', icon: 'calculator', label: 'MIT Calc' },
  { tag: 'Paper Thoughts', icon: 'bulb', label: 'Paper Ideas' },
  { tag: 'Fellowships', icon: 'school', label: 'Fellowships' },
  { tag: 'Technical Paper', icon: 'document-text', label: 'Tech Paper' },
];

interface RhythmBlock {
  id: DayPhase;
  time: string;
  name: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const RHYTHM_BLOCKS: RhythmBlock[] = [
  { id: 'MORNING_RITUAL', time: '05:30 - 08:30', name: 'Morning Ritual', desc: 'Prayer, Run & Audiobook', icon: 'sunny-outline' },
  { id: 'DEEP_WORK_1', time: '08:30 - 10:15', name: 'Focus 1: Quant Bot', desc: 'Code Engine & Research', icon: 'code-slash-outline' },
  { id: 'MIDDAY_BUFFER', time: '10:15 - 11:30', name: 'Midday Reset', desc: '500ml Water & Eye Reset', icon: 'water-outline' },
  { id: 'DEEP_WORK_2', time: '11:30 - 13:00', name: 'Focus 2: MIT Calc', desc: 'Multivariable Math Sprint', icon: 'calculator-outline' },
  { id: 'AFTERNOON_BUFFER', time: '13:00 - 14:30', name: 'Lunch & Life', desc: '80% Fullness Hara Hachi Bu', icon: 'restaurant-outline' },
  { id: 'DEEP_WORK_3', time: '14:30 - 15:45', name: 'Focus 3: Papers', desc: 'Fellowships & Research', icon: 'rocket-outline' },
  { id: 'LIFE_BUFFER', time: '15:45 - 20:00', name: 'Life Buffer', desc: 'Guilt-Free Life & Errands', icon: 'leaf-outline' },
  { id: 'EVENING_SANCTUARY', time: '20:00 - 21:30', name: 'Sanctuary', desc: 'Guitar 15m & Reflection', icon: 'musical-notes-outline' },
  { id: 'NIGHT_REST', time: '21:30 - 05:30', name: 'Night Rest', desc: '8h Neuroplastic Sleep', icon: 'moon-outline' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DIAL_SIZE = Math.min(Math.round(SCREEN_WIDTH * 0.76), 304);
const STROKE_WIDTH = 10;
const RADIUS = (DIAL_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const INNER_SIZE = DIAL_SIZE - STROKE_WIDTH * 2 - 20;

export const FocusTimerCard: React.FC<FocusTimerCardProps> = ({
  currentPhase = 'DEEP_WORK_1',
  onSelectPhase,
  onCompleteBlock,
  activeFocusSession,
  onUpdateFocusSession,
}) => {
  // Session parameters derived from persistent state or clean defaults
  const isRestCooldown = Boolean(activeFocusSession?.isRestCooldown);
  const targetMinutes = isRestCooldown ? 15 : (activeFocusSession?.targetMinutes || 90);
  const selectedProject = activeFocusSession?.project || 'Quant Bot';
  const isActive = Boolean(activeFocusSession?.isActive);

  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showFullScheduleModal, setShowFullScheduleModal] = useState(false);

  // Derive remaining seconds accurately from wall-clock time
  const calculateRemainingSeconds = (): number => {
    const totalSec = targetMinutes * 60;
    if (isActive && activeFocusSession?.startTime) {
      const liveElapsed = (activeFocusSession.elapsedSeconds || 0) + 
        Math.floor((Date.now() - activeFocusSession.startTime) / 1000);
      return Math.max(0, totalSec - liveElapsed);
    }
    return Math.max(0, totalSec - (activeFocusSession?.elapsedSeconds || 0));
  };

  const [secondsRemaining, setSecondsRemaining] = useState<number>(calculateRemainingSeconds);

  // 1-second interval to update display and detect completion
  useEffect(() => {
    const tick = () => {
      const remaining = calculateRemainingSeconds();
      setSecondsRemaining(remaining);

      // Session completion boundary detected
      if (remaining === 0 && isActive) {
        safeHaptics.heavy();

        if (!isRestCooldown) {
          // Record completed focus session block
          onCompleteBlock(selectedProject, targetMinutes);

          // Transition to 15-minute mandatory reset cooldown
          if (onUpdateFocusSession) {
            onUpdateFocusSession({
              isRestCooldown: true,
              targetMinutes: 15,
              elapsedSeconds: 0,
              startTime: Date.now(),
              isActive: true,
            });
          }
        } else {
          // Rest cooldown complete: reset to standard 90m deep work
          if (onUpdateFocusSession) {
            onUpdateFocusSession({
              isRestCooldown: false,
              targetMinutes: 90,
              elapsedSeconds: 0,
              startTime: null,
              isActive: false,
            });
          }
        }
      }
    };

    tick();
    let interval: any = null;
    if (isActive) {
      interval = setInterval(tick, 1000);
    }
    return () => clearInterval(interval);
  }, [
    isActive, 
    activeFocusSession?.startTime, 
    activeFocusSession?.elapsedSeconds, 
    isRestCooldown, 
    targetMinutes, 
    selectedProject
  ]);

  const toggleTimer = () => {
    safeHaptics.medium();
    if (!onUpdateFocusSession) return;

    if (isActive) {
      // Pause: accumulate elapsed seconds and clear startTime
      const currentElapsed = (activeFocusSession?.elapsedSeconds || 0) + 
        Math.floor((Date.now() - (activeFocusSession?.startTime || Date.now())) / 1000);
      onUpdateFocusSession({
        isActive: false,
        startTime: null,
        elapsedSeconds: currentElapsed,
      });
    } else {
      // Start / Resume: set active and anchor fresh startTime
      onUpdateFocusSession({
        isActive: true,
        startTime: Date.now(),
      });
    }
  };

  const resetTimer = () => {
    safeHaptics.light();
    if (!onUpdateFocusSession) return;
    onUpdateFocusSession({
      isActive: false,
      isRestCooldown: false,
      startTime: null,
      elapsedSeconds: 0,
    });
    setSecondsRemaining(targetMinutes * 60);
  };

  const handleSelectMinutes = (mins: number) => {
    if (isActive) return;
    safeHaptics.light();
    if (!onUpdateFocusSession) return;
    onUpdateFocusSession({
      targetMinutes: mins,
      elapsedSeconds: 0,
      startTime: null,
      isActive: false,
    });
    setSecondsRemaining(mins * 60);
  };

  const handleSelectProject = (proj: ProjectFocusTag) => {
    safeHaptics.light();
    if (onUpdateFocusSession) {
      onUpdateFocusSession({ project: proj });
    }
    setShowProjectPicker(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalSeconds = targetMinutes * 60;
  const remainingFraction = Math.max(0, Math.min(secondsRemaining / totalSeconds, 1));
  const strokeDashoffset = CIRCUMFERENCE * (1 - remainingFraction);

  const activeProjectMeta = PROJECTS.find(p => p.tag === selectedProject) || PROJECTS[0];

  // Ambient Now & Up Next calculation
  const currentIdx = RHYTHM_BLOCKS.findIndex(b => b.id === currentPhase);
  const activeBlock = RHYTHM_BLOCKS[currentIdx >= 0 ? currentIdx : 1];
  const nextBlock = RHYTHM_BLOCKS[(currentIdx + 1) % RHYTHM_BLOCKS.length];

  return (
    <View style={styles.container}>
      {/* 1. Massive Focus Dial with Unified Internal Controls */}
      <View style={styles.dialWrapper}>
        <View style={[styles.ringOuter, { width: DIAL_SIZE, height: DIAL_SIZE, borderRadius: DIAL_SIZE / 2 }]}>
          {/* Native SVG Circular Countdown Ring */}
          <Svg 
            width={DIAL_SIZE} 
            height={DIAL_SIZE} 
            style={styles.svgTrack}
          >
            {/* Background Muted Track */}
            <Circle
              cx={DIAL_SIZE / 2}
              cy={DIAL_SIZE / 2}
              r={RADIUS}
              stroke={Colors.surfaceHighlight}
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
            />
            {/* Active Depleting Countdown Stroke */}
            <Circle
              cx={DIAL_SIZE / 2}
              cy={DIAL_SIZE / 2}
              r={RADIUS}
              stroke={isRestCooldown ? Colors.cyan : Colors.primary}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              origin={`${DIAL_SIZE / 2}, ${DIAL_SIZE / 2}`}
              rotation="-90"
            />
          </Svg>

          {/* Controls Housed Directly Inside the Dial Hub */}
          <View style={[styles.dialInner, { width: INNER_SIZE, height: INNER_SIZE }]}>
            {/* Top Project Selector Pill */}
            <TouchableOpacity 
              style={styles.projectPillInDial}
              onPress={() => {
                safeHaptics.light();
                setShowProjectPicker(true);
              }}
              activeOpacity={0.75}
            >
              <Ionicons name={activeProjectMeta.icon} size={13} color={Colors.primary} />
              <Text style={styles.projectPillInDialText}>{activeProjectMeta.label}</Text>
              <Ionicons name="chevron-down" size={11} color={Colors.primary} />
            </TouchableOpacity>

            {/* Duration Selector Chips (30m, 45m, 60m, 90m) */}
            {!isRestCooldown && (
              <View style={styles.durationRow}>
                {[30, 45, 60, 90].map(mins => (
                  <TouchableOpacity
                    key={mins}
                    style={[
                      styles.durationChip,
                      targetMinutes === mins && styles.durationChipActive,
                    ]}
                    onPress={() => handleSelectMinutes(mins)}
                    disabled={isActive}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.durationChipText,
                      targetMinutes === mins && styles.durationChipTextActive,
                    ]}>
                      {mins}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Giant Digits */}
            <Text style={[styles.timerDigits, isRestCooldown && { color: Colors.cyan }]}>
              {formatTime(secondsRemaining)}
            </Text>

            {/* Status Subtitle */}
            <Text style={styles.stateSubtitle}>
              {isRestCooldown ? 'Cooldown Reset' : (isActive ? 'Deep Work Flow' : 'Ready to Focus')}
            </Text>

            {/* Play/Pause & Reset Controls */}
            <View style={styles.innerControlsRow}>
              <TouchableOpacity
                style={[
                  styles.innerPlayBtn,
                  isActive ? styles.innerPlayBtnActive : styles.innerPlayBtnPaused,
                ]}
                onPress={toggleTimer}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={isActive ? "pause" : "play"} 
                  size={20} 
                  color="#ffffff" 
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.innerResetBtn}
                onPress={resetTimer}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* 2. Ambient "Now & Up Next" Zen Rhythm Card (Zero Clutter, Maximum Space) */}
      <View style={styles.ambientSection}>
        <View style={styles.ambientHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="time-outline" size={14} color={Colors.primary} />
            <Text style={styles.ambientHeaderLabel}>24-HOUR RHYTHM CADENCE</Text>
          </View>
          <TouchableOpacity 
            onPress={() => {
              safeHaptics.light();
              setShowFullScheduleModal(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View Full Day (9) ➔</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ambientDualRow}>
          {/* Block A: Active Phase (NOW) */}
          <TouchableOpacity 
            style={[styles.ambientCard, styles.ambientCardActive]}
            onPress={() => {
              safeHaptics.light();
              if (onSelectPhase) onSelectPhase(activeBlock.id);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.ambientCardTop}>
              <View style={[styles.ambientIconCircle, { backgroundColor: Colors.primary }]}>
                <Ionicons name={activeBlock.icon} size={15} color="#ffffff" />
              </View>
              <View style={styles.liveNowBadge}>
                <View style={styles.liveNowDot} />
                <Text style={styles.liveNowText}>NOW</Text>
              </View>
            </View>

            <Text style={styles.ambientTimeText}>{activeBlock.time}</Text>
            <Text style={styles.ambientNameText} numberOfLines={1}>{activeBlock.name}</Text>
            <Text style={styles.ambientDescText} numberOfLines={2}>{activeBlock.desc}</Text>
          </TouchableOpacity>

          {/* Block B: Immediate Next Rhythm (UP NEXT) */}
          <TouchableOpacity 
            style={styles.ambientCard}
            onPress={() => {
              safeHaptics.light();
              if (onSelectPhase) onSelectPhase(nextBlock.id);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.ambientCardTop}>
              <View style={[styles.ambientIconCircle, { backgroundColor: Colors.surfaceHighlight }]}>
                <Ionicons name={nextBlock.icon} size={15} color={Colors.textSecondary} />
              </View>
              <View style={styles.upNextBadge}>
                <Text style={styles.upNextText}>UP NEXT</Text>
              </View>
            </View>

            <Text style={styles.ambientTimeText}>{nextBlock.time}</Text>
            <Text style={styles.ambientNameText} numberOfLines={1}>{nextBlock.name}</Text>
            <Text style={styles.ambientDescText} numberOfLines={2}>{nextBlock.desc}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Project Selector Modal Sheet */}
      <Modal
        visible={showProjectPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProjectPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowProjectPicker(false)}
        >
          <View style={styles.pickerModalContent}>
            <Text style={styles.pickerModalTitle}>Select Focus Discipline</Text>
            {PROJECTS.map(item => {
              const isSelected = selectedProject === item.tag;
              return (
                <TouchableOpacity
                  key={item.tag}
                  style={[styles.pickerItem, isSelected && styles.pickerItemActive]}
                  onPress={() => handleSelectProject(item.tag)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Ionicons 
                      name={item.icon} 
                      size={18} 
                      color={isSelected ? Colors.primary : Colors.textSecondary} 
                    />
                    <Text style={[styles.pickerItemLabel, isSelected && styles.pickerItemLabelActive]}>
                      {item.label}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Full 24-Hour Rhythm Inspection Modal Sheet */}
      <Modal
        visible={showFullScheduleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFullScheduleModal(false)}
      >
        <View style={styles.scheduleModalOverlay}>
          <View style={styles.scheduleModalSheet}>
            <View style={styles.scheduleModalHeader}>
              <View>
                <Text style={styles.scheduleModalTitle}>24-HOUR RHYTHM ARCHITECTURE</Text>
                <Text style={styles.scheduleModalSubtitle}>Kaizen Spacing & Deep Work Compressions</Text>
              </View>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setShowFullScheduleModal(false)}
              >
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xl }}>
              {RHYTHM_BLOCKS.map(block => {
                const isLive = currentPhase === block.id;
                return (
                  <TouchableOpacity
                    key={block.id}
                    style={[styles.fullScheduleRow, isLive && styles.fullScheduleRowLive]}
                    onPress={() => {
                      safeHaptics.light();
                      if (onSelectPhase) onSelectPhase(block.id);
                      setShowFullScheduleModal(false);
                    }}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.fullScheduleIconCircle, isLive && { backgroundColor: Colors.primary }]}>
                      <Ionicons name={block.icon} size={18} color={isLive ? '#ffffff' : Colors.primary} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.fullScheduleTime}>{block.time}</Text>
                        {isLive && (
                          <View style={styles.liveTag}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveTagText}>NOW</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.fullScheduleName, isLive && { color: Colors.primary }]}>
                        {block.name}
                      </Text>
                      <Text style={styles.fullScheduleDesc}>{block.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  dialWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
  },
  ringOuter: {
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
    position: 'relative',
  },
  svgTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  dialInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  projectPillInDial: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    marginBottom: 6,
  },
  projectPillInDialText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  durationChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceHighlight,
  },
  durationChipActive: {
    backgroundColor: Colors.primary,
  },
  durationChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  durationChipTextActive: {
    color: '#ffffff',
  },
  timerDigits: {
    fontSize: 42,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -1,
    marginVertical: 0,
    lineHeight: 48,
  },
  stateSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  innerControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  innerPlayBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.soft,
  },
  innerPlayBtnActive: {
    backgroundColor: Colors.ruby,
  },
  innerPlayBtnPaused: {
    backgroundColor: Colors.primary,
  },
  innerResetBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Ambient Now & Up Next Section
  ambientSection: {
    marginTop: Spacing.lg,
  },
  ambientHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  ambientHeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  ambientDualRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ambientCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    ...Shadows.card,
  },
  ambientCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  ambientCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ambientIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveNowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.emeraldMuted,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.full,
  },
  liveNowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.emerald,
  },
  liveNowText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.emerald,
  },
  upNextBadge: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  upNextText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  ambientTimeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  ambientNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 17,
  },
  ambientDescText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },

  // Modal Sheet Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  pickerModalContent: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  pickerModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    marginBottom: 4,
  },
  pickerItemActive: {
    backgroundColor: Colors.primaryMuted,
  },
  pickerItemLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  pickerItemLabelActive: {
    color: Colors.primary,
    fontWeight: '800',
  },

  // Full Schedule Bottom Sheet
  scheduleModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  scheduleModalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '80%',
    ...Shadows.card,
  },
  scheduleModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
  },
  scheduleModalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  scheduleModalSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    marginBottom: 6,
  },
  fullScheduleRowLive: {
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  fullScheduleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScheduleTime: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  fullScheduleName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  fullScheduleDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.emeraldMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.emerald,
  },
  liveTagText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: Colors.emerald,
  },
});
