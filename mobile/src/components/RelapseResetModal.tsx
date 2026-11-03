import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { safeHaptics } from '../services/haptics';

interface RelapseModalProps {
  visible: boolean;
  onConfirmReset: (reflection?: string) => void;
  onClose: () => void;
}

export const RelapseResetModal: React.FC<RelapseModalProps> = ({
  visible,
  onConfirmReset,
  onClose,
}) => {
  const [reflection, setReflection] = useState('');

  const handleReset = () => {
    safeHaptics.warning();
    onConfirmReset(reflection.trim() ? reflection.trim() : undefined);
    setReflection('');
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="refresh" size={18} color="#ffffff" />
                  </View>
                  <View>
                    <Text style={styles.sheetSubtitle}>INTEGRITY RESTORATION</Text>
                    <Text style={styles.sheetTitle}>Reset Purity Streak</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Ionicons name="close" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                {/* Compassionate Spiritual Anchor */}
                <View style={styles.quoteCard}>
                  <Ionicons name="shield" size={16} color={Colors.amber} />
                  <Text style={styles.quoteText}>
                    "For though a righteous man falls seven times, he rises again." — Proverbs 24:16
                  </Text>
                </View>

                <Text style={styles.guidanceText}>
                  Lapses do not erase your growth. All your previous diverted urges remain credited to your reputation. Acknowledge what happened with radical honesty, reset the clock, and rise immediately.
                </Text>

                {/* Reflection Input */}
                <Text style={styles.fieldLabel}>WHERE WAS THE BREACH? (WHAT TRIGGERED IT?)</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g. Phone in bed past 10pm, stress, unmonitored isolation..."
                  placeholderTextColor={Colors.textMuted}
                  value={reflection}
                  onChangeText={setReflection}
                  multiline
                />

                {/* Reset Button */}
                <TouchableOpacity 
                  style={styles.resetBtn} 
                  onPress={handleReset}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh" size={18} color="#ffffff" />
                  <Text style={styles.resetBtnText}>Log Lapse & Begin Day 1 Fresh</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelText}>Cancel (I did not fall)</Text>
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
    borderColor: Colors.rubyBorder,
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
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.ruby,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.ruby,
    letterSpacing: 1,
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
  quoteCard: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.honey,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.honeyBorder,
  },
  quoteText: {
    flex: 1,
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.honeyDark,
    lineHeight: 16,
  },
  guidanceText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 13,
    color: Colors.textPrimary,
    minHeight: 70,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.lg,
  },
  resetBtn: {
    backgroundColor: Colors.ruby,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
    ...Shadows.soft,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
