import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { 
  AppSettings, 
  KaizenOverloadConfig, 
  CovenantTask, 
  LifeDomain, 
  SubDomain, 
  TrainingWeekTier, 
  WeightsVariant, 
  RoutineMode 
} from '../types';
import { safeHaptics } from '../services/haptics';
import { DEFAULT_DECOUPLED_TASKS } from '../services/storage';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  settings?: AppSettings;
  overloadConfig: KaizenOverloadConfig;
  onSaveSettings: (newSettings: Partial<AppSettings>) => void;
  onSaveKaizenTargets: (targets: {
    pushupsTarget?: number;
    horseStanceSeconds?: number;
    activeHangSeconds?: number;
    situpsTarget?: number;
  }) => void;
  onToggleCovenantTask?: (taskId: string) => void;
  onAddCustomTask?: (task: CovenantTask) => void;
  onDeleteCustomTask?: (taskId: string) => void;
  onUpdateTrainingSettings?: (tier: TrainingWeekTier, weightsVariant: 'AUTO' | 'WORKOUT_A' | 'WORKOUT_B', mode: RoutineMode) => void;
}

const DAYS_META = [
  { dayIndex: 1, label: 'M', name: 'Mon' },
  { dayIndex: 2, label: 'T', name: 'Tue' },
  { dayIndex: 3, label: 'W', name: 'Wed' },
  { dayIndex: 4, label: 'T', name: 'Thu' },
  { dayIndex: 5, label: 'F', name: 'Fri' },
  { dayIndex: 6, label: 'S', name: 'Sat' },
  { dayIndex: 0, label: 'S', name: 'Sun' },
];

const DOMAINS: { id: LifeDomain; title: string; icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }[] = [
  { id: 'spirit_intellect', title: 'Spirit & Intellect', icon: 'flame', color: Colors.lavenderDark, bg: Colors.lavender },
  { id: 'physical_sovereignty', title: 'Physical Sovereignty', icon: 'barbell', color: Colors.mintDark, bg: Colors.mint },
  { id: 'craft_sanctuary', title: 'Craft & Sanctuary', icon: 'shield-checkmark', color: Colors.honeyDark, bg: Colors.honey },
];

const SUBDOMAIN_LABELS: Record<SubDomain, { label: string; domain: LifeDomain }> = {
  morning_grounding: { label: 'Morning Grounding', domain: 'spirit_intellect' },
  movement_prayer: { label: 'Movement Prayer', domain: 'spirit_intellect' },
  scripture_study: { label: 'Scripture Study', domain: 'spirit_intellect' },
  intellectual_growth: { label: 'Intellectual Growth', domain: 'spirit_intellect' },
  scholarship_outreach: { label: 'Scholarship Outreach', domain: 'spirit_intellect' },
  mindfulness_stillness: { label: 'Mindfulness & Stillness', domain: 'spirit_intellect' },

  run_day_pre_run_warmup: { label: 'Run Day: Pre-Run Warmup', domain: 'physical_sovereignty' },
  run_day_main_run: { label: 'Run Day: Main Run', domain: 'physical_sovereignty' },
  run_day_post_run_conditioning: { label: 'Run Day: Post-Run Work', domain: 'physical_sovereignty' },
  run_day_calisthenics: { label: 'Run Day: Calisthenics', domain: 'physical_sovereignty' },
  run_day_weights: { label: 'Run Day: Weights Split', domain: 'physical_sovereignty' },
  run_day_cooldown: { label: 'Run Day: Cooldown', domain: 'physical_sovereignty' },
  non_run_activation: { label: 'Non-Run: Activation', domain: 'physical_sovereignty' },
  non_run_mobility_lower: { label: 'Non-Run: Lower Mobility', domain: 'physical_sovereignty' },
  non_run_mobility_upper: { label: 'Non-Run: Upper Mobility', domain: 'physical_sovereignty' },
  non_run_mobility_lateral: { label: 'Non-Run: Lateral Mobility', domain: 'physical_sovereignty' },
  general_movement: { label: 'General Movement', domain: 'physical_sovereignty' },
  nutrition_satiety: { label: 'Nutrition & Satiety', domain: 'physical_sovereignty' },

  deep_work_focus: { label: 'Deep Work Compression', domain: 'craft_sanctuary' },
  acoustic_tactile: { label: 'Acoustic Tactile Play', domain: 'craft_sanctuary' },
  evening_reflection: { label: 'Evening Reflection', domain: 'craft_sanctuary' },
  weekly_sovereign_quest: { label: 'Weekly Sovereign Quest', domain: 'craft_sanctuary' },
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  settings,
  overloadConfig,
  onSaveSettings,
  onSaveKaizenTargets,
  onToggleCovenantTask,
  onAddCustomTask,
  onDeleteCustomTask,
  onUpdateTrainingSettings,
}) => {
  // Running Days
  const [runDays, setRunDays] = useState<number[]>(settings?.runDays || [1, 3, 5]);

  // Non-Run Day Priority
  const [nonRunPref, setNonRunPref] = useState<'gym' | 'calisthenics' | 'hybrid'>(
    settings?.nonRunDayPreference || 'gym'
  );

  // Training Protocol Controls
  const [trainingWeekTier, setTrainingWeekTier] = useState<TrainingWeekTier>(
    settings?.trainingWeekTier || 'WEEKS_1_2'
  );
  const [weightsVariantPref, setWeightsVariantPref] = useState<'AUTO' | 'WORKOUT_A' | 'WORKOUT_B'>(
    settings?.weightsVariantPreference || 'AUTO'
  );
  const [routineModePref, setRoutineModePref] = useState<RoutineMode>(
    settings?.routineModePreference || 'STANDARD'
  );

  // Targets
  const [pushupTarget, setPushupTarget] = useState(overloadConfig.pushupsTarget.toString());
  const [stanceTarget, setStanceTarget] = useState(overloadConfig.horseStanceSeconds.toString());
  const [hangTarget, setHangTarget] = useState(overloadConfig.activeHangSeconds.toString());
  const [situpTarget, setSitupTarget] = useState(overloadConfig.situpsTarget.toString());

  // Goals
  const [waterGoal, setWaterGoal] = useState((settings?.waterGoalMl || 3000).toString());
  const [deepWorkGoal, setDeepWorkGoal] = useState((settings?.deepWorkGoalMinutes || 90).toString());

  // Custom Task Creator Form State
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newDomain, setNewDomain] = useState<LifeDomain>('physical_sovereignty');
  const [newSubdomain, setNewSubdomain] = useState<SubDomain>('run_day_post_run_conditioning');
  const [newCadence, setNewCadence] = useState<'DAILY' | 'WEEKLY_TARGET'>('DAILY');
  const [newTargetVal, setNewTargetVal] = useState('');
  const [newUnit, setNewUnit] = useState('');

  const tasksList = settings?.decoupledTasks || DEFAULT_DECOUPLED_TASKS;

  const toggleRunDay = (dayIndex: number) => {
    safeHaptics.light();
    if (runDays.includes(dayIndex)) {
      if (runDays.length <= 1) return;
      setRunDays(runDays.filter(d => d !== dayIndex));
    } else {
      setRunDays([...runDays, dayIndex].sort());
    }
  };

  const handleSave = () => {
    safeHaptics.success();

    // 1. Save Settings
    onSaveSettings({
      runDays,
      nonRunDayPreference: nonRunPref,
      waterGoalMl: parseInt(waterGoal, 10) || 3000,
      deepWorkGoalMinutes: parseInt(deepWorkGoal, 10) || 90,
      trainingWeekTier,
      weightsVariantPreference: weightsVariantPref,
      routineModePreference: routineModePref,
    });

    // 2. Save Targets
    onSaveKaizenTargets({
      pushupsTarget: parseInt(pushupTarget, 10) || 10,
      horseStanceSeconds: parseInt(stanceTarget, 10) || 20,
      activeHangSeconds: parseInt(hangTarget, 10) || 20,
      situpsTarget: parseInt(situpTarget, 10) || 10,
    });

    // 3. Update Training Settings & Phases
    if (onUpdateTrainingSettings) {
      onUpdateTrainingSettings(trainingWeekTier, weightsVariantPref, routineModePref);
    }

    onClose();
  };

  const handleCreateCustomTask = () => {
    if (!newTitle.trim()) return;
    safeHaptics.success();

    const task: CovenantTask = {
      id: 'custom-' + Date.now().toString(36),
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'Custom covenant discipline',
      domain: newDomain,
      subdomain: newSubdomain,
      category: newDomain === 'spirit_intellect' ? 'spiritual' : newDomain === 'physical_sovereignty' ? 'movement' : 'focus',
      isEnabled: true,
      cadence: newCadence,
      isCustom: true,
      targetValue: newTargetVal ? parseInt(newTargetVal, 10) : undefined,
      unit: newUnit.trim() || undefined,
    };

    if (onAddCustomTask) {
      onAddCustomTask(task);
    }

    // Reset Form
    setNewTitle('');
    setNewSubtitle('');
    setNewTargetVal('');
    setNewUnit('');
    setShowTaskCreator(false);
  };

  // Subdomains filtered by selected domain for custom creator
  const availableSubdomains = (Object.keys(SUBDOMAIN_LABELS) as SubDomain[]).filter(
    k => SUBDOMAIN_LABELS[k].domain === newDomain
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={styles.modalOverlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleBox}>
              <View style={styles.gearIconBox}>
                <Ionicons name="settings" size={18} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>SETTINGS & PROTOCOLS</Text>
                <Text style={styles.headerSubtitle}>Disciplines, Subdomains & Training Controls</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Section 1: Workout & Movement Protocol Controls */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="barbell" size={16} color={Colors.mintDark} />
                <Text style={styles.sectionTitle}>WORKOUT PROTOCOL & PROGRESSION</Text>
              </View>
              <Text style={styles.sectionCaption}>
                Adjust your training progression week, weights rotation, and default routine mode.
              </Text>

              {/* Training Week Tier */}
              <View style={styles.protocolOptionRow}>
                <Text style={styles.optionLabel}>TRAINING PROGRESSION WEEK:</Text>
                <View style={styles.pillsWrap}>
                  {[
                    { id: 'WEEKS_1_2', label: 'Wk 1-2' },
                    { id: 'WEEKS_3_4', label: 'Wk 3-4 (Bear/Crab Unlocked)' },
                    { id: 'WEEKS_5_PLUS', label: 'Wk 5+ (Peak Circuit)' },
                  ].map(tier => {
                    const isSel = trainingWeekTier === tier.id;
                    return (
                      <TouchableOpacity
                        key={tier.id}
                        style={[styles.smallPill, isSel && styles.smallPillActive]}
                        onPress={() => {
                          safeHaptics.light();
                          setTrainingWeekTier(tier.id as TrainingWeekTier);
                        }}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.smallPillText, isSel && styles.smallPillTextActive]}>
                          {tier.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Weights Split Preference */}
              <View style={styles.protocolOptionRow}>
                <Text style={styles.optionLabel}>RUN-DAY WEIGHTS ROTATION:</Text>
                <View style={styles.pillsWrap}>
                  {[
                    { id: 'AUTO', label: 'Auto Alternate' },
                    { id: 'WORKOUT_A', label: 'Workout A (Squat/Bench)' },
                    { id: 'WORKOUT_B', label: 'Workout B (RDL/Press)' },
                  ].map(w => {
                    const isSel = weightsVariantPref === w.id;
                    return (
                      <TouchableOpacity
                        key={w.id}
                        style={[styles.smallPill, isSel && styles.smallPillActive]}
                        onPress={() => {
                          safeHaptics.light();
                          setWeightsVariantPref(w.id as any);
                        }}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.smallPillText, isSel && styles.smallPillTextActive]}>
                          {w.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Routine Mode Preference */}
              <View style={styles.protocolOptionRow}>
                <Text style={styles.optionLabel}>DEFAULT ROUTINE MODE:</Text>
                <View style={styles.pillsWrap}>
                  {[
                    { id: 'STANDARD', label: 'Standard Protocol' },
                    { id: 'FLOOR_EXPRESS', label: 'Floor Express (4-Min)' },
                  ].map(m => {
                    const isSel = routineModePref === m.id;
                    return (
                      <TouchableOpacity
                        key={m.id}
                        style={[styles.smallPill, isSel && styles.smallPillActive]}
                        onPress={() => {
                          safeHaptics.light();
                          setRoutineModePref(m.id as RoutineMode);
                        }}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.smallPillText, isSel && styles.smallPillTextActive]}>
                          {m.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Section 2: Running Days Schedule */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="trail-sign" size={16} color={Colors.primary} />
                <Text style={styles.sectionTitle}>RUNNING DAYS SCHEDULE</Text>
              </View>
              <Text style={styles.sectionCaption}>
                Pick which days you run ({runDays.length} selected). Run days feature 2km + Calisthenics + Weights; Non-Run days feature 19 Mobility movements.
              </Text>

              <View style={styles.daysSelectorRow}>
                {DAYS_META.map(d => {
                  const isSelected = runDays.includes(d.dayIndex);
                  return (
                    <TouchableOpacity
                      key={d.dayIndex}
                      style={[styles.dayPill, isSelected && styles.dayPillActive]}
                      onPress={() => toggleRunDay(d.dayIndex)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.dayPillLetter, isSelected && styles.dayPillTextActive]}>
                        {d.label}
                      </Text>
                      <Text style={[styles.dayPillName, isSelected && styles.dayPillTextActive]}>
                        {d.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 3: Decoupled Disciplines & Subdomain Task Registry */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="layers" size={16} color={Colors.lavenderDark} />
                <Text style={styles.sectionTitle}>COVENANT DISCIPLINE REGISTRY</Text>
              </View>
              <Text style={styles.sectionCaption}>
                Toggle which daily disciplines appear in your Covenant Ring. Add custom tasks directly into designated schema subdomains.
              </Text>

              {/* Tasks Grouped by Domain & Subdomain */}
              {DOMAINS.map(domain => {
                const domainTasks = tasksList.filter(t => t.domain === domain.id);
                if (domainTasks.length === 0) return null;

                return (
                  <View key={domain.id} style={styles.domainGroupWrap}>
                    <View style={styles.domainGroupHeader}>
                      <View style={[styles.domainDot, { backgroundColor: domain.color }]} />
                      <Text style={[styles.domainGroupTitle, { color: domain.color }]}>
                        {domain.title.toUpperCase()}
                      </Text>
                    </View>

                    {domainTasks.map(task => {
                      const subdomainInfo = SUBDOMAIN_LABELS[task.subdomain] || { label: task.subdomain };
                      return (
                        <View key={task.id} style={styles.taskRegistryRow}>
                          <View style={styles.taskInfoCol}>
                            <View style={styles.taskTitleRow}>
                              <Text style={[styles.taskTitleText, !task.isEnabled && styles.taskTitleDisabled]}>
                                {task.title}
                              </Text>
                              <View style={styles.subdomainPill}>
                                <Text style={styles.subdomainPillText}>{subdomainInfo.label}</Text>
                              </View>
                            </View>
                            <Text style={styles.taskSubtitleText}>{task.subtitle}</Text>
                          </View>

                          <View style={styles.taskActionCol}>
                            {task.isCustom && onDeleteCustomTask && (
                              <TouchableOpacity 
                                style={styles.deleteTaskBtn}
                                onPress={() => {
                                  safeHaptics.heavy();
                                  onDeleteCustomTask(task.id);
                                }}
                              >
                                <Ionicons name="trash-outline" size={14} color={Colors.ruby} />
                              </TouchableOpacity>
                            )}

                            <TouchableOpacity
                              style={[styles.toggleSwitch, task.isEnabled && styles.toggleSwitchOn]}
                              onPress={() => {
                                safeHaptics.light();
                                if (onToggleCovenantTask) onToggleCovenantTask(task.id);
                              }}
                              activeOpacity={0.7}
                            >
                              <View style={[styles.toggleKnob, task.isEnabled && styles.toggleKnobOn]} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                );
              })}

              {/* Add Custom Task Button / Form */}
              {!showTaskCreator ? (
                <TouchableOpacity
                  style={styles.openCreatorBtn}
                  onPress={() => setShowTaskCreator(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle" size={16} color={Colors.primary} />
                  <Text style={styles.openCreatorBtnText}>Add Discipline into Subdomain Schema</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.creatorFormCard}>
                  <View style={styles.creatorHeader}>
                    <Text style={styles.creatorTitle}>ADD NEW SUBDOMAIN DISCIPLINE</Text>
                    <TouchableOpacity onPress={() => setShowTaskCreator(false)}>
                      <Ionicons name="close" size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {/* Title */}
                  <Text style={styles.fieldLabel}>DISCIPLINE TITLE</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Post-Run Calf Flossing, Greek Study..."
                    placeholderTextColor={Colors.textMuted}
                    value={newTitle}
                    onChangeText={setNewTitle}
                  />

                  {/* Subtitle */}
                  <Text style={styles.fieldLabel}>SUBTITLE / CUE</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. 5 mins foam roll & flossing"
                    placeholderTextColor={Colors.textMuted}
                    value={newSubtitle}
                    onChangeText={setNewSubtitle}
                  />

                  {/* Domain Picker */}
                  <Text style={styles.fieldLabel}>DOMAIN</Text>
                  <View style={styles.domainPickerRow}>
                    {DOMAINS.map(d => (
                      <TouchableOpacity
                        key={d.id}
                        style={[styles.pickerPill, newDomain === d.id && styles.pickerPillActive]}
                        onPress={() => {
                          setNewDomain(d.id);
                          const firstSub = (Object.keys(SUBDOMAIN_LABELS) as SubDomain[]).find(
                            k => SUBDOMAIN_LABELS[k].domain === d.id
                          );
                          if (firstSub) setNewSubdomain(firstSub);
                        }}
                      >
                        <Text style={[styles.pickerPillText, newDomain === d.id && styles.pickerPillTextActive]}>
                          {d.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Subdomain Picker (Filtered for selected domain) */}
                  <Text style={styles.fieldLabel}>SUBDOMAIN SCHEMA SLOT</Text>
                  <View style={styles.subdomainPickerWrap}>
                    {availableSubdomains.map(sub => (
                      <TouchableOpacity
                        key={sub}
                        style={[styles.subdomainPickerPill, newSubdomain === sub && styles.subdomainPickerPillActive]}
                        onPress={() => setNewSubdomain(sub)}
                      >
                        <Text style={[styles.subdomainPickerText, newSubdomain === sub && styles.subdomainPickerTextActive]}>
                          {SUBDOMAIN_LABELS[sub].label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Cadence */}
                  <Text style={styles.fieldLabel}>CADENCE</Text>
                  <View style={styles.domainPickerRow}>
                    {[
                      { id: 'DAILY', label: 'Daily Discipline' },
                      { id: 'WEEKLY_TARGET', label: 'Weekly Quest' },
                    ].map(c => (
                      <TouchableOpacity
                        key={c.id}
                        style={[styles.pickerPill, newCadence === c.id && styles.pickerPillActive]}
                        onPress={() => setNewCadence(c.id as any)}
                      >
                        <Text style={[styles.pickerPillText, newCadence === c.id && styles.pickerPillTextActive]}>
                          {c.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.submitTaskBtn}
                    onPress={handleCreateCustomTask}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
                    <Text style={styles.submitTaskBtnText}>Save Task to Schema</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Section 4: Daily Targets (Water & Focus) */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="water" size={16} color={Colors.primary} />
                <Text style={styles.sectionTitle}>DAILY TARGETS</Text>
              </View>

              <View style={styles.targetRow}>
                <Text style={styles.targetLabel}>Water Goal (ml):</Text>
                <TextInput
                  style={styles.targetInput}
                  value={waterGoal}
                  onChangeText={setWaterGoal}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.targetRow}>
                <Text style={styles.targetLabel}>Deep Work Focus Goal (minutes):</Text>
                <TextInput
                  style={styles.targetInput}
                  value={deepWorkGoal}
                  onChangeText={setDeepWorkGoal}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Bottom Spacing */}
            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Footer Save Button */}
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
              <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
              <Text style={styles.saveBtnText}>Save All Settings & Protocols</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '92%',
    paddingTop: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  gearIconBox: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  scrollBody: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  sectionCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  sectionCaption: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 15,
    marginBottom: Spacing.md,
  },

  // Protocol Controls
  protocolOptionRow: {
    marginBottom: Spacing.sm,
  },
  optionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    marginBottom: 5,
    letterSpacing: 0.4,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  smallPill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  smallPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  smallPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  smallPillTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },

  // Running Days
  daysSelectorRow: {
    flexDirection: 'row',
    gap: 5,
  },
  dayPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayPillLetter: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  dayPillName: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  dayPillTextActive: {
    color: '#ffffff',
  },

  // Discipline Registry
  domainGroupWrap: {
    marginBottom: Spacing.md,
  },
  domainGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  domainDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  domainGroupTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  taskRegistryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  taskInfoCol: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskTitleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  taskTitleDisabled: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  subdomainPill: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  subdomainPillText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  taskSubtitleText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  taskActionCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deleteTaskBtn: {
    padding: 4,
  },
  toggleSwitch: {
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchOn: {
    backgroundColor: Colors.emerald,
  },
  toggleKnob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  toggleKnobOn: {
    alignSelf: 'flex-end',
  },

  // Custom Task Creator Form
  openCreatorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    marginTop: 4,
  },
  openCreatorBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  creatorFormCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    marginTop: Spacing.sm,
    gap: 6,
  },
  creatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  creatorTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  fieldLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  formInput: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    fontSize: 11,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  domainPickerRow: {
    flexDirection: 'row',
    gap: 4,
  },
  pickerPill: {
    flex: 1,
    paddingVertical: 5,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pickerPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  pickerPillTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  subdomainPickerWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  subdomainPickerPill: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  subdomainPickerPillActive: {
    backgroundColor: Colors.lavenderDark,
    borderColor: Colors.lavenderDark,
  },
  subdomainPickerText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  subdomainPickerTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  submitTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 9,
    borderRadius: BorderRadius.sm,
    marginTop: 6,
    ...Shadows.soft,
  },
  submitTaskBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },

  // Daily Targets
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  targetLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  targetInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    width: 70,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Footer
  footerRow: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    ...Shadows.card,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
});
