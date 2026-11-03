import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { safeHaptics } from '../services/haptics';

interface ScholarshipOutreachModalProps {
  visible: boolean;
  onSave: (professorName: string, university: string, researchTopic?: string, notes?: string) => void;
  onClose: () => void;
}

export const ScholarshipOutreachModal: React.FC<ScholarshipOutreachModalProps> = ({
  visible,
  onSave,
  onClose,
}) => {
  const [professorName, setProfessorName] = useState('');
  const [university, setUniversity] = useState('');
  const [researchTopic, setResearchTopic] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!professorName.trim()) {
      safeHaptics.warning();
      return;
    }
    safeHaptics.success();
    onSave(
      professorName.trim(),
      university.trim() || 'Target University',
      researchTopic.trim() || undefined,
      notes.trim() || undefined
    );
    setProfessorName('');
    setUniversity('');
    setResearchTopic('');
    setNotes('');
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
            <View style={{ flex: 1 }}>
              <View style={styles.tagBadge}>
                <Ionicons name="school" size={13} color={Colors.primary} />
                <Text style={styles.tagBadgeText}>MASTERS & PHD SCHOLARSHIP</Text>
              </View>
              <Text style={styles.sheetTitle}>Daily Professor Cold Email</Text>
              <Text style={styles.sheetSubtitle}>
                Compounding 1 high-leverage research outreach every single day.
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.closeBtn}
              onPress={() => {
                safeHaptics.light();
                onClose();
              }}
            >
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Professor Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PROFESSOR NAME *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Prof. Michael Jordan / Prof. Pieter Abbeel"
                placeholderTextColor={Colors.textDisabled}
                value={professorName}
                onChangeText={setProfessorName}
              />
            </View>

            {/* University / Lab */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>UNIVERSITY / INSTITUTION</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. UC Berkeley, Oxford, MIT, Cambridge"
                placeholderTextColor={Colors.textDisabled}
                value={university}
                onChangeText={setUniversity}
              />
            </View>

            {/* Research Area / Topic */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>RESEARCH AREA / LAB TOPIC</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Multivariable Control & Stochastic Optimization"
                placeholderTextColor={Colors.textDisabled}
                value={researchTopic}
                onChangeText={setResearchTopic}
              />
            </View>

            {/* Notes / Follow-up */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL NOTES / REFERENCES</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="e.g. Referenced their 2024 paper on algorithmic risk; attached portfolio & CV."
                placeholderTextColor={Colors.textDisabled}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.saveBtn, !professorName.trim() && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!professorName.trim()}
              activeOpacity={0.8}
            >
              <Ionicons name="mail-unread" size={16} color="#ffffff" />
              <Text style={styles.saveBtnText}>Seal Cold Email Sent</Text>
            </TouchableOpacity>
          </View>
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
    padding: Spacing.md,
  },
  sheetContainer: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 4,
  },
  formScroll: {
    marginVertical: Spacing.xs,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 72,
  },
  actionsRow: {
    marginTop: Spacing.sm,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    ...Shadows.card,
  },
  saveBtnDisabled: {
    backgroundColor: Colors.border,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});

