import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { safeHaptics } from '../services/haptics';

interface MealModalProps {
  visible: boolean;
  meal: 'Breakfast' | 'Lunch' | 'Dinner';
  initialRating: number;
  onSave: (rating: number, description?: string, trigger?: string) => void;
  onClose: () => void;
}

const OVEREATING_TRIGGERS = [
  'Post-Smoking Oral Craving',
  'Mental Stress / Fatigue',
  'Rushed / Distracted Eating',
  'Social / Celebration',
  'Boredom / Procrastination',
];

export const MealLoggingModal: React.FC<MealModalProps> = ({
  visible,
  meal,
  initialRating,
  onSave,
  onClose,
}) => {
  const [rating, setRating] = useState(initialRating || 3);
  const [description, setDescription] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState('');

  const isOvereating = rating >= 4;

  const handleSave = () => {
    safeHaptics.success();
    onSave(
      rating,
      description.trim() ? description.trim() : undefined,
      isOvereating && selectedTrigger ? selectedTrigger : undefined
    );
    setDescription('');
    setSelectedTrigger('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}
          >
            <View style={styles.sheetContainer}>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.sheetSubtitle}>SATIETY & APPETITE CHECK-IN</Text>
                  <Text style={styles.sheetTitle}>Log {meal}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.closeBtn}
                  onPress={onClose}
                >
                  <Ionicons name="close" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                {/* Fullness Rating Selector */}
                <Text style={styles.sectionLabel}>HOW FULL ARE YOU? (1 TO 5)</Text>
                <View style={styles.ratingRow}>
                  {[
                    { val: 1, label: 'Hungry' },
                    { val: 2, label: 'Light' },
                    { val: 3, label: '80% Satisfied' },
                    { val: 4, label: 'Full' },
                    { val: 5, label: 'Stuffed' },
                  ].map(item => {
                    const isSelected = rating === item.val;
                    const isGold = item.val === 3;

                    return (
                      <TouchableOpacity
                        key={item.val}
                        style={[
                          styles.ratingBox,
                          isSelected && (isGold ? styles.goldSelectedBox : (item.val >= 4 ? styles.redSelectedBox : styles.selectedBox)),
                        ]}
                        onPress={() => {
                          safeHaptics.light();
                          setRating(item.val);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.ratingDigit, isSelected && styles.selectedDigit]}>
                          {item.val}
                        </Text>
                        <Text style={[styles.ratingWord, isSelected && styles.selectedWord]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Feedback Message */}
                {rating === 3 && (
                  <View style={styles.emeraldFeedbackCard}>
                    <Ionicons name="sparkles" size={16} color={Colors.primary} />
                    <Text style={styles.emeraldFeedbackText}>
                      <Text style={{ fontWeight: '800' }}>Hara Hachi Bu Mastered:</Text> Stopping at 80% fullness stabilizes glucose, sustains mental energy for coding, and resets dopamine.
                    </Text>
                  </View>
                )}

                {/* Compassionate Feedback for Overeating */}
                {isOvereating && (
                  <View style={styles.rubyFeedbackCard}>
                    <View style={styles.rubyHeader}>
                      <Ionicons name="heart-circle-outline" size={18} color={Colors.ruby} />
                      <Text style={styles.rubyTitle}>COMPASSIONATE KAIZEN RESET</Text>
                    </View>
                    <Text style={styles.rubyAdvice}>
                      No guilt or shame. Drink 500ml water and take a 10-minute walk to aid digestion.
                    </Text>

                    <Text style={styles.triggerPrompt}>What triggered the urge to overeat?</Text>
                    <View style={styles.triggersWrap}>
                      {OVEREATING_TRIGGERS.map(t => {
                        const active = selectedTrigger === t;
                        return (
                          <TouchableOpacity
                            key={t}
                            style={[styles.triggerPill, active && styles.triggerPillActive]}
                            onPress={() => {
                              safeHaptics.light();
                              setSelectedTrigger(t);
                            }}
                          >
                            <Text style={[styles.triggerText, active && styles.triggerTextActive]}>
                              {t}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Optional Meal Description */}
                <Text style={styles.sectionLabel}>WHAT DID YOU EAT? (OPTIONAL)</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g. Rice, grilled chicken, plantain (skip if busy)"
                  placeholderTextColor={Colors.textMuted}
                  value={description}
                  onChangeText={setDescription}
                />

                {/* Save Button */}
                <TouchableOpacity 
                  style={styles.saveBtn}
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>Save Meal Satiety</Text>
                </TouchableOpacity>

                <View style={{ height: Spacing.xl }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  keyboardContainer: {
    width: '100%',
    alignItems: 'center',
  },
  sheetContainer: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.peachBorder,
    maxHeight: '90%',
    ...Shadows.card,
  },
  dragBar: {
    display: 'none',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
  },
  sheetSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceHighlight,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.md,
  },
  ratingBox: {
    flex: 1,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  selectedBox: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  goldSelectedBox: {
    backgroundColor: Colors.honey,
    borderColor: Colors.honeyDark,
  },
  redSelectedBox: {
    backgroundColor: Colors.rubyMuted,
    borderColor: Colors.ruby,
  },
  ratingDigit: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  selectedDigit: {
    color: Colors.textPrimary,
  },
  ratingWord: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  selectedWord: {
    color: Colors.textPrimary,
  },
  emeraldFeedbackCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: Colors.mint,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  emeraldFeedbackText: {
    flex: 1,
    fontSize: 12,
    color: Colors.mintDark,
    lineHeight: 16,
  },
  rubyFeedbackCard: {
    backgroundColor: Colors.rubyMuted,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.rubyBorder,
  },
  rubyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  rubyTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.ruby,
    letterSpacing: 0.5,
  },
  rubyAdvice: {
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 16,
    marginBottom: 8,
  },
  triggerPrompt: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  triggersWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  triggerPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  triggerPillActive: {
    backgroundColor: Colors.ruby,
    borderColor: Colors.ruby,
  },
  triggerText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  triggerTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  inputField: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 13,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.lg,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: 14,
    alignItems: 'center',
    ...Shadows.soft,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
