import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { BodyMetricLog } from '../types';
import { safeHaptics } from '../services/haptics';

interface BodyModalProps {
  visible: boolean;
  currentWeight: number;
  currentWaist: number;
  currentTummy: number;
  currentAnkle: number;
  history: BodyMetricLog[];
  onSave: (weight: number, waist: number, tummy: number, ankle: number) => void;
  onClose: () => void;
}

export const BodyMetricsModal: React.FC<BodyModalProps> = ({
  visible,
  currentWeight,
  currentWaist,
  currentTummy,
  currentAnkle,
  history,
  onSave,
  onClose,
}) => {
  const [weight, setWeight] = useState(currentWeight.toString());
  const [waist, setWaist] = useState(currentWaist.toString());
  const [tummy, setTummy] = useState(currentTummy.toString());
  const [ankleStrain, setAnkleStrain] = useState(currentAnkle);

  const handleSave = () => {
    const w = parseFloat(weight) || currentWeight;
    const wa = parseFloat(waist) || currentWaist;
    const t = parseFloat(tummy) || currentTummy;
    safeHaptics.success();
    onSave(w, wa, t, ankleStrain);
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
                  <Text style={styles.sheetSubtitle}>KAIZEN PHYSICAL AUDIT</Text>
                  <Text style={styles.sheetTitle}>Weekly Body Metrics</Text>
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
                {/* Input Grid */}
                <View style={styles.inputGrid}>
                  {/* Weight */}
                  <View style={styles.inputCard}>
                    <Text style={styles.fieldLabel}>BODY WEIGHT (KG)</Text>
                    <TextInput
                      style={styles.numericInput}
                      keyboardType="numeric"
                      value={weight}
                      onChangeText={setWeight}
                    />
                    <Text style={styles.hintText}>Target: Progressive Lean Mass</Text>
                  </View>

                  {/* Waist Circumference */}
                  <View style={styles.inputCard}>
                    <Text style={styles.fieldLabel}>WAIST CIRCUMFERENCE (CM)</Text>
                    <TextInput
                      style={styles.numericInput}
                      keyboardType="numeric"
                      value={waist}
                      onChangeText={setWaist}
                    />
                    <Text style={styles.hintText}>At narrowest point</Text>
                  </View>

                  {/* Tummy Circumference */}
                  <View style={styles.inputCard}>
                    <Text style={styles.fieldLabel}>TUMMY CIRCUMFERENCE (CM)</Text>
                    <TextInput
                      style={styles.numericInput}
                      keyboardType="numeric"
                      value={tummy}
                      onChangeText={setTummy}
                    />
                    <Text style={styles.hintText}>Across belly button</Text>
                  </View>

                  {/* Ankle Strain Rating */}
                  <View style={styles.inputCard}>
                    <Text style={styles.fieldLabel}>LEFT ANKLE STRAIN (0 TO 10)</Text>
                    <View style={styles.ankleRow}>
                      {[0, 2, 4, 6, 8, 10].map(val => (
                        <TouchableOpacity
                          key={val}
                          style={[
                            styles.ankleBtn,
                            ankleStrain === val && styles.ankleBtnActive,
                          ]}
                          onPress={() => {
                            safeHaptics.light();
                            setAnkleStrain(val);
                          }}
                        >
                          <Text style={[styles.ankleBtnText, ankleStrain === val && styles.ankleBtnTextActive]}>
                            {val}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text style={styles.hintText}>0 = Pain free | 10 = Severe ache</Text>
                  </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity 
                  style={styles.saveBtn} 
                  onPress={handleSave}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>Log Weekly Measurement</Text>
                </TouchableOpacity>

                {/* History Log */}
                {history.length > 0 && (
                  <View style={styles.historySection}>
                    <Text style={styles.historyTitle}>PROGRESS HISTORY</Text>
                    {history.slice(0, 4).map((item, idx) => (
                      <View key={idx} style={styles.historyRow}>
                        <Text style={styles.historyDate}>{item.date}</Text>
                        <Text style={styles.historyVal}>{item.weightKg} kg</Text>
                        <Text style={styles.historyVal}>{item.waistCm} cm waist</Text>
                        <Text style={styles.historyVal}>{item.tummyCm} cm tummy</Text>
                        <Text style={[styles.historyVal, { color: Colors.amber }]}>Ankle: {item.ankleStrain}</Text>
                      </View>
                    ))}
                  </View>
                )}

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
    borderColor: Colors.borderLight,
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
    color: Colors.primary,
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
  inputGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  inputCard: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  numericInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 4,
  },
  hintText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  ankleRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  ankleBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ankleBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ankleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  ankleBtnTextActive: {
    color: '#ffffff',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.soft,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  historySection: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  historyTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  historyDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  historyVal: {
    fontSize: 11,
    color: Colors.textPrimary,
  },
});
