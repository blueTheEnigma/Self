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
import { AppSettings, KaizenOverloadConfig } from '../types';
import { safeHaptics } from '../services/haptics';

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

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  settings,
  overloadConfig,
  onSaveSettings,
  onSaveKaizenTargets,
}) => {
  // Running Days
  const [runDays, setRunDays] = useState<number[]>(settings?.runDays || [1, 3, 5]);

  // Non-Run Day Priority
  const [nonRunPref, setNonRunPref] = useState<'gym' | 'calisthenics' | 'hybrid'>(
    settings?.nonRunDayPreference || 'gym'
  );

  // Exercise Variant Names
  const [pushupName, setPushupName] = useState(settings?.exerciseVariants?.pushupsName || 'Pushups');
  const [stanceName, setStanceName] = useState(settings?.exerciseVariants?.horseStanceName || 'Horse Stance');
  const [hangName, setHangName] = useState(settings?.exerciseVariants?.activeHangName || 'Active Dead Hang');
  const [situpName, setSitupName] = useState(settings?.exerciseVariants?.situpsName || 'Situps');

  // Targets
  const [pushupTarget, setPushupTarget] = useState(overloadConfig.pushupsTarget.toString());
  const [stanceTarget, setStanceTarget] = useState(overloadConfig.horseStanceSeconds.toString());
  const [hangTarget, setHangTarget] = useState(overloadConfig.activeHangSeconds.toString());
  const [situpTarget, setSitupTarget] = useState(overloadConfig.situpsTarget.toString());

  // Goals
  const [waterGoal, setWaterGoal] = useState((settings?.waterGoalMl || 3000).toString());
  const [deepWorkGoal, setDeepWorkGoal] = useState((settings?.deepWorkGoalMinutes || 90).toString());

  const toggleRunDay = (dayIndex: number) => {
    safeHaptics.light();
    if (runDays.includes(dayIndex)) {
      if (runDays.length <= 1) return; // Keep at least 1 run day
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
      exerciseVariants: {
        pushupsName: pushupName.trim() || 'Pushups',
        horseStanceName: stanceName.trim() || 'Horse Stance',
        activeHangName: hangName.trim() || 'Active Dead Hang',
        situpsName: situpName.trim() || 'Situps',
      },
    });

    // 2. Save Targets
    onSaveKaizenTargets({
      pushupsTarget: parseInt(pushupTarget, 10) || 10,
      horseStanceSeconds: parseInt(stanceTarget, 10) || 20,
      activeHangSeconds: parseInt(hangTarget, 10) || 20,
      situpsTarget: parseInt(situpTarget, 10) || 10,
    });

    onClose();
  };

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
                <Text style={styles.headerSubtitle}>Customize Schedule, Gym & Disciplines</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Section 1: Running Days Schedule */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="trail-sign" size={16} color={Colors.primary} />
                <Text style={styles.sectionTitle}>RUNNING DAYS SCHEDULE</Text>
              </View>
              <Text style={styles.sectionCaption}>
                Pick which days you run ({runDays.length} days selected). On non-run days, Gym or Calisthenics takes the spotlight!
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

            {/* Section 2: Non-Run Day Priority */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="barbell" size={16} color={Colors.mintDark} />
                <Text style={styles.sectionTitle}>NON-RUN DAY FOCUS</Text>
              </View>
              <Text style={styles.sectionCaption}>
                How would you prefer to fulfill your Movement covenant on days you don't run?
              </Text>

              <View style={styles.prefButtonsRow}>
                {[
                  { id: 'gym', label: 'Gym Strength Focus' },
                  { id: 'calisthenics', label: 'Home Calisthenics' },
                  { id: 'hybrid', label: 'Hybrid (Either)' },
                ].map(opt => {
                  const isSel = nonRunPref === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.prefPill, isSel && styles.prefPillActive]}
                      onPress={() => {
                        safeHaptics.light();
                        setNonRunPref(opt.id as any);
                      }}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.prefPillText, isSel && styles.prefPillTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 3: Kaizen Discipline Evolution (Quarterly Variants) */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="sparkles" size={16} color={Colors.honeyDark} />
                <Text style={styles.sectionTitle}>KAIZEN PROGRESSION & VARIANTS</Text>
              </View>
              <Text style={styles.sectionCaption}>
                Evolve your disciplines as you get stronger (e.g. Pushups → Archer Pushups, Hang → Pullups).
              </Text>

              {/* 1. Pushup Variant */}
              <View style={styles.variantRow}>
                <View style={styles.variantNameBox}>
                  <Text style={styles.variantInputLabel}>PUSHUP DISCIPLINE</Text>
                  <TextInput
                    style={styles.variantTextInput}
                    value={pushupName}
                    onChangeText={setPushupName}
                    placeholder="e.g. Pushups or Archer Pushups"
                    placeholderTextColor={Colors.textDisabled}
                  />
                </View>
                <View style={styles.variantTargetBox}>
                  <Text style={styles.variantInputLabel}>TARGET (REPS)</Text>
                  <TextInput
                    style={styles.targetTextInput}
                    keyboardType="number-pad"
                    value={pushupTarget}
                    onChangeText={setPushupTarget}
                  />
                </View>
              </View>

              {/* 2. Horse Stance Variant */}
              <View style={styles.variantRow}>
                <View style={styles.variantNameBox}>
                  <Text style={styles.variantInputLabel}>STANCE DISCIPLINE</Text>
                  <TextInput
                    style={styles.variantTextInput}
                    value={stanceName}
                    onChangeText={setStanceName}
                    placeholder="e.g. Horse Stance or Cossack Squats"
                    placeholderTextColor={Colors.textDisabled}
                  />
                </View>
                <View style={styles.variantTargetBox}>
                  <Text style={styles.variantInputLabel}>TARGET (SEC)</Text>
                  <TextInput
                    style={styles.targetTextInput}
                    keyboardType="number-pad"
                    value={stanceTarget}
                    onChangeText={setStanceTarget}
                  />
                </View>
              </View>

              {/* 3. Dead Hang Variant */}
              <View style={styles.variantRow}>
                <View style={styles.variantNameBox}>
                  <Text style={styles.variantInputLabel}>HANG DISCIPLINE</Text>
                  <TextInput
                    style={styles.variantTextInput}
                    value={hangName}
                    onChangeText={setHangName}
                    placeholder="e.g. Active Dead Hang or Pullups"
                    placeholderTextColor={Colors.textDisabled}
                  />
                </View>
                <View style={styles.variantTargetBox}>
                  <Text style={styles.variantInputLabel}>TARGET (SEC)</Text>
                  <TextInput
                    style={styles.targetTextInput}
                    keyboardType="number-pad"
                    value={hangTarget}
                    onChangeText={setHangTarget}
                  />
                </View>
              </View>

              {/* 4. Situps Variant */}
              <View style={styles.variantRow}>
                <View style={styles.variantNameBox}>
                  <Text style={styles.variantInputLabel}>CORE DISCIPLINE</Text>
                  <TextInput
                    style={styles.variantTextInput}
                    value={situpName}
                    onChangeText={setSitupName}
                    placeholder="e.g. Situps or Hanging Leg Raises"
                    placeholderTextColor={Colors.textDisabled}
                  />
                </View>
                <View style={styles.variantTargetBox}>
                  <Text style={styles.variantInputLabel}>TARGET (REPS)</Text>
                  <TextInput
                    style={styles.targetTextInput}
                    keyboardType="number-pad"
                    value={situpTarget}
                    onChangeText={setSitupTarget}
                  />
                </View>
              </View>
            </View>

            {/* Section 4: Daily Goals */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="water" size={16} color={Colors.primary} />
                <Text style={styles.sectionTitle}>DAILY TARGETS</Text>
              </View>

              <View style={styles.goalsRow}>
                <View style={styles.goalFieldBox}>
                  <Text style={styles.variantInputLabel}>WATER GOAL (ML)</Text>
                  <TextInput
                    style={styles.goalTextInput}
                    keyboardType="number-pad"
                    value={waterGoal}
                    onChangeText={setWaterGoal}
                    placeholder="3000"
                    placeholderTextColor={Colors.textDisabled}
                  />
                </View>

                <View style={styles.goalFieldBox}>
                  <Text style={styles.variantInputLabel}>DEEP WORK CAP (MINS)</Text>
                  <TextInput
                    style={styles.goalTextInput}
                    keyboardType="number-pad"
                    value={deepWorkGoal}
                    onChangeText={setDeepWorkGoal}
                    placeholder="90"
                    placeholderTextColor={Colors.textDisabled}
                  />
                </View>
              </View>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Save Button */}
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.saveSettingsBtn} onPress={handleSave} activeOpacity={0.8}>
              <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
              <Text style={styles.saveSettingsBtnText}>Save Preferences & Protocols</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 36 : Spacing.md,
    maxHeight: '90%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gearIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    paddingVertical: Spacing.sm,
  },
  sectionCard: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  sectionCaption: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  daysSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dayPill: {
    width: 40,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  dayPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadows.soft,
  },
  dayPillLetter: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  dayPillName: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 1,
  },
  dayPillTextActive: {
    color: '#ffffff',
  },
  prefButtonsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  prefPill: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  prefPillActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primaryBorder,
  },
  prefPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  prefPillTextActive: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  variantRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  variantNameBox: {
    flex: 1.6,
  },
  variantTargetBox: {
    flex: 1,
  },
  variantInputLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  variantTextInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 7,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  targetTextInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 7,
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    textAlign: 'center',
  },
  goalsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  goalFieldBox: {
    flex: 1,
  },
  goalTextInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 7,
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  footerRow: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  saveSettingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    ...Shadows.soft,
  },
  saveSettingsBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
});

