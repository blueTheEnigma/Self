import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput 
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
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
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
              <Ionicons name="sparkles" size={16} color={Colors.emerald} />
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
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sheetSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.emerald,
    letterSpacing: 1,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
    marginBottom: Spacing.md,
  },
  ratingBox: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedBox: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  goldSelectedBox: {
    backgroundColor: Colors.emerald,
    borderColor: Colors.emerald,
  },
  redSelectedBox: {
    backgroundColor: Colors.ruby,
    borderColor: Colors.ruby,
  },
  ratingDigit: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  ratingWord: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  selectedDigit: {
    color: '#ffffff',
  },
  selectedWord: {
    color: '#ffffff',
  },
  emeraldFeedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.emeraldMuted,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.emerald + '40',
    marginBottom: Spacing.md,
  },
  emeraldFeedbackText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  rubyFeedbackCard: {
    backgroundColor: Colors.rubyMuted,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.ruby + '40',
    marginBottom: Spacing.md,
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
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  triggerPrompt: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  triggersWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  triggerPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  triggerTextActive: {
    color: '#ffffff',
  },
  inputField: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    ...Shadows.soft,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
