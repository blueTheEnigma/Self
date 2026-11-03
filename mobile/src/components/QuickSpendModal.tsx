import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { SpendCategory, SpendTransaction } from '../types';
import { safeHaptics } from '../services/haptics';

interface QuickSpendProps {
  visible: boolean;
  transactions?: SpendTransaction[];
  onSave: (amount: number, category: SpendCategory) => void;
  onDelete?: (id: string) => void;
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
  transactions = [],
  onSave,
  onDelete,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'log' | 'history'>('log');
  const [amountStr, setAmountStr] = useState('');

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  const todayTransactions = transactions.filter(t => t.timestamp.startsWith(todayStr));
  const todayTotal = todayTransactions.reduce((acc, t) => acc + t.amount, 0);

  const handleDigit = (digit: string) => {
    safeHaptics.light();
    if (amountStr.length >= 7) return;
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
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.sheetTitle}>INSTANT 3-SECOND EXPENSE LOG</Text>
              <Text style={styles.sheetSubtitle}>
                {todayTransactions.length > 0
                  ? `₦${todayTotal.toLocaleString()} logged today across ${todayTransactions.length} items`
                  : 'Zero-friction micro capture & full audit'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.closeBtn}
              onPress={() => {
                safeHaptics.light();
                setAmountStr('');
                setActiveTab('log');
                onClose();
              }}
            >
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Mode Switcher Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity 
              style={[styles.modeTab, activeTab === 'log' && styles.modeTabActive]} 
              onPress={() => {
                safeHaptics.light();
                setActiveTab('log');
              }}
            >
              <Text style={[styles.modeTabText, activeTab === 'log' && styles.modeTabTextActive]}>
                + Log Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modeTab, activeTab === 'history' && styles.modeTabActive]} 
              onPress={() => {
                safeHaptics.light();
                setActiveTab('history');
              }}
            >
              <Text style={[styles.modeTabText, activeTab === 'history' && styles.modeTabTextActive]}>
                Today's History ({todayTransactions.length})
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'log' ? (
            <>
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

              {/* High-Velocity 1-Tap Preset Buttons */}
              <View style={styles.presetsRow}>
                {[500, 1000, 2000, 5000].map(val => (
                  <TouchableOpacity
                    key={val}
                    style={styles.presetChip}
                    onPress={() => {
                      safeHaptics.light();
                      const current = parseFloat(amountStr) || 0;
                      setAmountStr((current + val).toString());
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.presetChipText}>+₦{val.toLocaleString()}</Text>
                  </TouchableOpacity>
                ))}
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
            </>
          ) : (
            /* History & Audit Tab */
            <View style={styles.historyContainer}>
              <View style={styles.historyHeader}>
                <Text style={styles.historySummaryText}>
                  TODAY'S TOTAL: <Text style={{ color: Colors.primary, fontWeight: '900' }}>₦{todayTotal.toLocaleString()}</Text>
                </Text>
              </View>

              {todayTransactions.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="receipt-outline" size={32} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>No expenses logged yet today.</Text>
                </View>
              ) : (
                <View style={styles.txList}>
                  {todayTransactions.map(tx => {
                    const timeStr = new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const tagIcon = QUICK_TAGS.find(q => q.category === tx.category)?.icon || '💳';
                    return (
                      <View key={tx.id} style={styles.txRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <Text style={{ fontSize: 20 }}>{tagIcon}</Text>
                          <View>
                            <Text style={styles.txCategory}>{tx.category}</Text>
                            <Text style={styles.txTime}>{timeStr}</Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <Text style={styles.txAmount}>₦{tx.amount.toLocaleString()}</Text>
                          {onDelete && (
                            <TouchableOpacity 
                              style={styles.deleteTxBtn}
                              onPress={() => {
                                safeHaptics.warning();
                                onDelete(tx.id);
                              }}
                            >
                              <Ionicons name="trash-outline" size={16} color={Colors.ruby} />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </View>
      </View>
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
  sheetContainer: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    maxHeight: '90%',
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sheetTitle: {
    fontSize: 11,
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
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.md,
    padding: 3,
    marginBottom: Spacing.md,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: Colors.surface,
    ...Shadows.soft,
  },
  modeTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  modeTabTextActive: {
    color: Colors.textPrimary,
    fontWeight: '800',
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
    backgroundColor: Colors.surfaceHighlight,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
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
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  presetChip: {
    flex: 1,
    backgroundColor: Colors.surfaceHighlight,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderFocus,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
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
  historyContainer: {
    paddingVertical: Spacing.sm,
    minHeight: 220,
  },
  historyHeader: {
    backgroundColor: Colors.surfaceHighlight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historySummaryText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: Spacing.xs,
  },
  emptyText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  txList: {
    gap: Spacing.xs,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  txCategory: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  txTime: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  deleteTxBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.ruby + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
