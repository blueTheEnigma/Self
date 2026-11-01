import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme/colors';
import { EveningSanctuaryState } from '../types';
import { safeHaptics } from '../services/haptics';

interface SanctuaryCardProps {
  sanctuary: EveningSanctuaryState;
  onAddGuitarMinutes: (mins: number) => void;
  onToggleCreativeQuest: (quest: 'photo' | 'novel' | 'writing') => void;
  onSaveJournal: (wins: string, friction: string, tomorrow: string) => void;
}

export const EveningSanctuaryCard: React.FC<SanctuaryCardProps> = ({
  sanctuary,
  onAddGuitarMinutes,
  onToggleCreativeQuest,
  onSaveJournal,
}) => {
  const [wins, setWins] = useState(sanctuary.microJournalWins);
  const [friction, setFriction] = useState(sanctuary.microJournalFriction);
  const [tomorrow, setTomorrow] = useState(sanctuary.tomorrowAnchor);
  const [journalSaved, setJournalSaved] = useState(false);

  const handleSaveJournal = () => {
    safeHaptics.success();
    onSaveJournal(wins, friction, tomorrow);
    setJournalSaved(true);
    setTimeout(() => setJournalSaved(false), 3000);
  };

  const handleCompleteGuitar = () => {
    safeHaptics.success();
    onAddGuitarMinutes(15);
  };

  const guitarDone = sanctuary.guitarMinutesToday >= 15;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: Colors.violetMuted }]}>
            <Ionicons name="moon-outline" size={20} color={Colors.violet} />
          </View>
          <View>
            <Text style={styles.cardTitle}>EVENING SANCTUARY & HOBBIES</Text>
            <Text style={styles.cardSubtitle}>Decompression, Art & Micro-Reflection</Text>
          </View>
        </View>

        <View style={styles.guiltFreeBadge}>
          <Text style={styles.guiltFreeText}>Guilt-Free Rule</Text>
        </View>
      </View>

      {/* 15-Minute Guitar Anchor */}
      <View style={styles.guitarBox}>
        <View style={styles.guitarInfo}>
          <Ionicons name="musical-notes-outline" size={20} color={Colors.violet} />
          <View>
            <Text style={styles.guitarTitle}>Acoustic Guitar Anchor</Text>
            <Text style={styles.guitarSubtitle}>15 minutes daily tactile play</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.guitarBtn, guitarDone && styles.guitarBtnDone]}
          onPress={handleCompleteGuitar}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={guitarDone ? "checkmark-circle" : "play"} 
            size={16} 
            color="#ffffff" 
          />
          <Text style={styles.guitarBtnText}>
            {guitarDone ? '15m Completed ✓' : 'Log 15m Practice'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Weekly Rule of 1 Creative Checklist */}
      <View style={styles.creativeSection}>
        <View style={styles.creativeHeader}>
          <Text style={styles.creativeTitle}>WEEKLY CREATIVE QUESTS (RULE OF 1)</Text>
          <Text style={styles.creativeDesc}>Target: At least 1 session of each this week</Text>
        </View>

        <View style={styles.questRow}>
          {/* Photo Editing */}
          <TouchableOpacity 
            style={[styles.questCard, sanctuary.photoEditingThisWeek && styles.questCardDone]}
            onPress={() => {
              safeHaptics.light();
              onToggleCreativeQuest('photo');
            }}
          >
            <Ionicons 
              name="camera-outline" 
              size={18} 
              color={sanctuary.photoEditingThisWeek ? Colors.emerald : Colors.textSecondary} 
            />
            <Text style={[styles.questName, sanctuary.photoEditingThisWeek && styles.questTextDone]}>
              Photo Editing
            </Text>
            <Text style={styles.questStatus}>
              {sanctuary.photoEditingThisWeek ? '1/1 Done ✓' : '0/1 Done'}
            </Text>
          </TouchableOpacity>

          {/* Novel Reading */}
          <TouchableOpacity 
            style={[styles.questCard, sanctuary.novelReadingThisWeek && styles.questCardDone]}
            onPress={() => {
              safeHaptics.light();
              onToggleCreativeQuest('novel');
            }}
          >
            <Ionicons 
              name="book-outline" 
              size={18} 
              color={sanctuary.novelReadingThisWeek ? Colors.emerald : Colors.textSecondary} 
            />
            <Text style={[styles.questName, sanctuary.novelReadingThisWeek && styles.questTextDone]}>
              Novel Reading
            </Text>
            <Text style={styles.questStatus}>
              {sanctuary.novelReadingThisWeek ? '1/1 Done ✓' : '0/1 Done'}
            </Text>
          </TouchableOpacity>

          {/* Poem / Story */}
          <TouchableOpacity 
            style={[styles.questCard, sanctuary.poemStoryThisWeek && styles.questCardDone]}
            onPress={() => {
              safeHaptics.light();
              onToggleCreativeQuest('writing');
            }}
          >
            <Ionicons 
              name="create-outline" 
              size={18} 
              color={sanctuary.poemStoryThisWeek ? Colors.emerald : Colors.textSecondary} 
            />
            <Text style={[styles.questName, sanctuary.poemStoryThisWeek && styles.questTextDone]}>
              Poem / Story
            </Text>
            <Text style={styles.questStatus}>
              {sanctuary.poemStoryThisWeek ? '1/1 Done ✓' : '0/1 Done'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 60-Second Micro-Journal */}
      <View style={styles.journalSection}>
        <Text style={styles.journalHeader}>60-SECOND EVENING MIRROR</Text>

        <TextInput
          style={styles.inputField}
          placeholder="What went well today? (Wins)"
          placeholderTextColor={Colors.textMuted}
          value={wins}
          onChangeText={setWins}
        />

        <TextInput
          style={styles.inputField}
          placeholder="Where was the friction? (Observations)"
          placeholderTextColor={Colors.textMuted}
          value={friction}
          onChangeText={setFriction}
        />

        <TextInput
          style={styles.inputField}
          placeholder="Tomorrow's #1 Anchor Block..."
          placeholderTextColor={Colors.textMuted}
          value={tomorrow}
          onChangeText={setTomorrow}
        />

        <TouchableOpacity 
          style={[styles.saveJournalBtn, journalSaved && styles.saveJournalBtnDone]}
          onPress={handleSaveJournal}
        >
          <Text style={styles.saveJournalText}>
            {journalSaved ? 'Reflection Sealed ✓' : 'Save Evening Reflection'}
          </Text>
        </TouchableOpacity>
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
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  guiltFreeBadge: {
    backgroundColor: Colors.violetMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  guiltFreeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.violet,
  },
  guitarBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceHighlight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  guitarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  guitarTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  guitarSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  guitarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.violet,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
  },
  guitarBtnDone: {
    backgroundColor: Colors.emerald,
  },
  guitarBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  creativeSection: {
    marginBottom: Spacing.lg,
  },
  creativeHeader: {
    marginBottom: Spacing.sm,
  },
  creativeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  creativeDesc: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  questRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  questCard: {
    flex: 1,
    backgroundColor: Colors.surfaceHighlight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  questCardDone: {
    borderColor: Colors.emerald + '80',
    backgroundColor: Colors.emeraldMuted,
  },
  questName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
    textAlign: 'center',
  },
  questTextDone: {
    color: Colors.emerald,
  },
  questStatus: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
  },
  journalSection: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  journalHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  inputField: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: 12,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
  },
  saveJournalBtn: {
    backgroundColor: Colors.surfaceElevated,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveJournalBtnDone: {
    backgroundColor: Colors.emerald,
    borderColor: Colors.emerald,
  },
  saveJournalText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});

