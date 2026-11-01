import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme/colors';
import { SpendCategory } from '../types';
import { safeHaptics } from '../services/haptics';

interface QuickSpendProps {
  visible: boolean;
  onSave: (amount: number, category: SpendCategory) => void;
  onClose: () => void;
}

const QUICK_TAGS: { category: SpendCategory; icon: string }[] = [
  { category: 'Food', icon: '🍽' },
  { category: 'Transport', icon: '🚗' },
  { category: 'Data', icon: '📱' },
  { category: 'Gift', icon: '🎁' },
  { category: 'Misc', icon: '🔧' },
];

export const QuickSpendModal: React.FC<QuickSpendProps> = ({
  visible,
  onSave,
  onClose,
}) => {
  const [amountStr, setAmountStr] = useState('');

  const handleDigit = (digit: string) => {
    safeHaptics.light();
    if (amountStr.length >= 7) return; // cap at 9,999,999
    setAmountStr(prev => prev + digit);
  };

  const handleBackspace = () => {
    safeHaptics.light();
    setAmountStr(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    safeHaptics.light();
    setAmountStr('');
  };

  const handleTagPress = (category: SpendCategory) => {
    const num = parseFloat(amountStr);
    if (isNaN(num) || num <= 0) {
      safeHaptics.warning();
      return;
    }
    safeHaptics.success();
    onSave(num, category);
    setAmountStr('');
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
              <Text style={styles.sheetTitle}>INSTANT 3-SECOND LOG</Text>
              <Text style={styles.sheetSubtitle}>Zero-friction micro expense capture</Text>
            </View>
            <TouchableOpacity 
              style={styles.closeBtn}
              onPress={() => {
                safeHaptics.light();
                setAmountStr('');
                onClose();
              }}
            >
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Amount Display */}
          <View style={styles.displayRow}>
            <Text style={styles.currencySymbol}>₦</Text>
            <Text style={styles.amountDisplay}>
              {amountStr ? Number(amountStr).toLocaleString() : '0'}
            </Text>
          </View>

          {/* Quick Category Save Tags */}
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsLabel}>TAP CATEGORY TO SEAL & SAVE:</Text>
            <View style={styles.tagsRow}>
              {QUICK_TAGS.map(t => (
                <TouchableOpacity
                  key={t.category}
                  style={styles.tagBtn}
                  onPress={() => handleTagPress(t.category)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tagEmoji}>{t.icon}</Text>
                  <Text style={styles.tagText}>{t.category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Tactile Mobile NumPad */}
          <View style={styles.numpadGrid}>
            {[
              ['1', '2', '3'],
              ['4', '5', '6'],
              ['7', '8', '9'],
              ['C', '0', '⌫'],
            ].map((row, rIdx) => (
              <View key={rIdx} style={styles.numpadRow}>
                {row.map(key => (
                  <TouchableOpacity
                    key={key}
                    style={styles.numKey}
                    onPress={() => {
                      if (key === 'C') handleClear();
                      else if (key === '⌫') handleBackspace();
                      else handleDigit(key);
                    }}
                    activeOpacity={0.6}
                  >
                    <Text 
                      style={[
                        styles.numKeyText,
                        (key === 'C' || key === '⌫') && styles.specialKeyText,
                      ]}
                    >
                      {key}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
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
  sheetTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
  },
  sheetSubtitle: {
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
  displayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginRight: 6,
  },
  amountDisplay: {
    fontSize: 38,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  tagsContainer: {
    marginBottom: Spacing.md,
  },
  tagsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  tagBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryMuted,
  },
  tagEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  numpadGrid: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  numpadRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  numKey: {
    flex: 1,
    height: 52,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  numKeyText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  specialKeyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '800',
  },
});

