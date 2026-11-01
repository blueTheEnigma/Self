import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { SpiritualAnchorState } from '../types';
import { safeHaptics } from '../services/haptics';

interface SpiritualProps {
  spiritual: SpiritualAnchorState;
  onToggle: (item: 'wakeup' | 'track' | 'bible', passage?: string) => void;
}

export const SpiritualAnchorCard: React.FC<SpiritualProps> = ({
  spiritual,
  onToggle,
}) => {
  const [passageText, setPassageText] = useState(spiritual.scripturePassage || '');
  const [showPassageInput, setShowPassageInput] = useState(false);

  const handleToggle = (item: 'wakeup' | 'track' | 'bible') => {
    safeHaptics.success();
    onToggle(item, item === 'bible' ? passageText : undefined);
    if (item === 'bible' && !spiritual.bibleReadingDone) {
      setShowPassageInput(true);
    }
  };

  const handleSavePassage = () => {
    safeHaptics.light();
    onToggle('bible', passageText);
    setShowPassageInput(false);
  };

  const allDone = spiritual.wakeupPrayerDone && spiritual.trackPrayerDone && spiritual.bibleReadingDone;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: Colors.amberMuted }]}>
            <Ionicons name="sunny" size={20} color={Colors.amber} />
          </View>
          <View>
            <Text style={styles.cardTitle}>SPIRITUAL GROUNDING</Text>
            <Text style={styles.cardSubtitle}>Morning Prayer & Daily Scripture</Text>
          </View>
        </View>

        {allDone && (
          <View style={styles.sealedBadge}>
            <Ionicons name="checkmark-done" size={13} color={Colors.emerald} />
            <Text style={styles.sealedText}>SEALED</Text>
          </View>
        )}
      </View>

      {/* Checklist items */}
      <View style={styles.checklist}>
        {/* Wake-up Prayer */}
        <TouchableOpacity
          style={[styles.checkRow, spiritual.wakeupPrayerDone && styles.checkRowDone]}
          onPress={() => handleToggle('wakeup')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={spiritual.wakeupPrayerDone ? "checkbox" : "square-outline"}
            size={22}
            color={spiritual.wakeupPrayerDone ? Colors.emerald : Colors.textMuted}
          />
          <View style={styles.textGroup}>
            <Text style={[styles.checkTitle, spiritual.wakeupPrayerDone && styles.checkTitleDone]}>
              05:30 AM Wake-Up Prayer
            </Text>
            <Text style={styles.checkDesc}>Short thanksgiving before stepping out to run</Text>
          </View>
        </TouchableOpacity>

        {/* Track Walking Prayer */}
        <TouchableOpacity
          style={[styles.checkRow, spiritual.trackPrayerDone && styles.checkRowDone]}
          onPress={() => handleToggle('track')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={spiritual.trackPrayerDone ? "checkbox" : "square-outline"}
            size={22}
            color={spiritual.trackPrayerDone ? Colors.emerald : Colors.textMuted}
          />
          <View style={styles.textGroup}>
            <Text style={[styles.checkTitle, spiritual.trackPrayerDone && styles.checkTitleDone]}>
              15-Minute Track Walking Prayer
            </Text>
            <Text style={styles.checkDesc}>Walking round gym tracks praying before workout</Text>
          </View>
        </TouchableOpacity>

        {/* Bible & Scripture */}
        <TouchableOpacity
          style={[styles.checkRow, spiritual.bibleReadingDone && styles.checkRowDone]}
          onPress={() => handleToggle('bible')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={spiritual.bibleReadingDone ? "checkbox" : "square-outline"}
            size={22}
            color={spiritual.bibleReadingDone ? Colors.emerald : Colors.textMuted}
          />
          <View style={styles.textGroup}>
            <Text style={[styles.checkTitle, spiritual.bibleReadingDone && styles.checkTitleDone]}>
              Scripture / Bible Reading
            </Text>
            <Text style={styles.checkDesc}>
              {spiritual.scripturePassage 
                ? `Read: ${spiritual.scripturePassage}` 
                : 'Feeding the spirit before the day’s work begins'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Optional Passage Input */}
        {(showPassageInput || spiritual.bibleReadingDone) && (
          <View style={styles.passageInputBox}>
            <TextInput
              style={styles.passageInput}
              placeholder="What passage did you read? (e.g. Psalm 1, Romans 12)"
              placeholderTextColor={Colors.textMuted}
              value={passageText}
              onChangeText={setPassageText}
              onBlur={handleSavePassage}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sealedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.emeraldMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  sealedText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.emerald,
  },
  checklist: {
    gap: Spacing.xs,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkRowDone: {
    backgroundColor: Colors.emeraldMuted,
    borderColor: Colors.emerald + '30',
  },
  textGroup: {
    flex: 1,
  },
  checkTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  checkTitleDone: {
    color: Colors.emerald,
  },
  checkDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  passageInputBox: {
    marginTop: Spacing.xs,
  },
  passageInput: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: 12,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

