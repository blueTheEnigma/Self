import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { DayPhase } from '../types';
import { safeHaptics } from '../services/haptics';

interface TimeBlocksProps {
  currentPhase: DayPhase;
  onSelectBlock?: (phase: DayPhase) => void;
}

interface BlockDef {
  phase: DayPhase;
  timeRange: string;
  title: string;
  category: 'Ritual' | 'Code' | 'Math' | 'Fellowship' | 'Life' | 'Sanctuary' | 'Sleep';
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const SCHEDULE_BLOCKS: BlockDef[] = [
  { phase: 'MORNING_RITUAL', timeRange: '05:30 - 08:30', title: 'Morning Ritual & Run', category: 'Ritual', color: Colors.amber, icon: 'sunny' },
  { phase: 'DEEP_WORK_1', timeRange: '08:30 - 10:15', title: 'Focus 1: Code Engine', category: 'Code', color: Colors.primary, icon: 'code-slash' },
  { phase: 'MIDDAY_BUFFER', timeRange: '10:15 - 11:30', title: 'Midday Reset & Water', category: 'Life', color: Colors.cyan, icon: 'water' },
  { phase: 'DEEP_WORK_2', timeRange: '11:30 - 13:00', title: 'Focus 2: MIT OCW Math', category: 'Math', color: Colors.primary, icon: 'calculator' },
  { phase: 'AFTERNOON_BUFFER', timeRange: '13:00 - 14:30', title: 'Lunch & Life Buffer', category: 'Life', color: Colors.emerald, icon: 'restaurant' },
  { phase: 'DEEP_WORK_3', timeRange: '14:30 - 15:45', title: 'Focus 3: Fellowships', category: 'Fellowship', color: Colors.violet, icon: 'school' },
  { phase: 'LIFE_BUFFER', timeRange: '15:45 - 20:00', title: 'Open Buffer (Errands)', category: 'Life', color: Colors.textSecondary, icon: 'walk' },
  { phase: 'EVENING_SANCTUARY', timeRange: '20:00 - 21:30', title: 'Evening Sanctuary', category: 'Sanctuary', color: Colors.violet, icon: 'moon' },
  { phase: 'NIGHT_REST', timeRange: '21:30 - 05:30', title: 'Night Rest / Sleep', category: 'Sleep', color: Colors.textMuted, icon: 'bed' },
];

export const TimeBlocksBar: React.FC<TimeBlocksProps> = ({
  currentPhase,
  onSelectBlock,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="time-outline" size={15} color={Colors.textSecondary} />
          <Text style={styles.headerTitle}>24-HOUR RHYTHM TIMELINE</Text>
        </View>
        <Text style={styles.headerSub}>Kaizen Spacing System</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {SCHEDULE_BLOCKS.map(b => {
          const isActive = currentPhase === b.phase;

          return (
            <TouchableOpacity
              key={b.phase}
              style={[
                styles.blockPill,
                isActive && { borderColor: b.color, backgroundColor: Colors.surfaceHighlight },
              ]}
              onPress={() => {
                safeHaptics.light();
                if (onSelectBlock) onSelectBlock(b.phase);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.pillTop}>
                <Ionicons name={b.icon} size={13} color={isActive ? b.color : Colors.textMuted} />
                <Text style={[styles.timeText, isActive && { color: b.color, fontWeight: '800' }]}>
                  {b.timeRange}
                </Text>
              </View>

              <Text style={[styles.titleText, isActive && { color: Colors.textPrimary, fontWeight: '800' }]} numberOfLines={1}>
                {b.title}
              </Text>

              {isActive && (
                <View style={[styles.activeTag, { backgroundColor: b.color }]}>
                  <Text style={styles.activeTagText}>NOW</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  headerSub: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  scrollList: {
    gap: Spacing.xs,
    paddingVertical: 2,
  },
  blockPill: {
    width: 140,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'space-between',
    ...Shadows.soft,
  },
  pillTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  titleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    lineHeight: 14,
  },
  activeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
    marginTop: 4,
  },
  activeTagText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});

