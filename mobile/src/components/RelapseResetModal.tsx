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
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
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
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.70)',
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
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.amberMuted,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.amber + '40',
    marginBottom: Spacing.md,
  },
  quoteText: {
    flex: 1,
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 18,
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
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
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
    minHeight: 65,
    textAlignVertical: 'top',
    marginBottom: Spacing.lg,
  },
  resetBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.ruby,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.soft,
  },
  resetBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  cancelBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
});

