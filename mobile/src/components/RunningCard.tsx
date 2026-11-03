import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { RunLog } from '../types';
import { safeHaptics } from '../services/haptics';

interface RunningCardProps {
  runLog?: RunLog;
  defaultDistance?: number;
  onSaveRun: (distanceKm: number, pace?: string, durationMins?: number, reflection?: string) => void;
}

export const RunningCard: React.FC<RunningCardProps> = ({
  runLog,
  defaultDistance = 2.5,
  onSaveRun,
}) => {
  const [distance, setDistance] = useState(
    runLog?.distanceKm !== undefined ? runLog.distanceKm.toString() : defaultDistance.toString()
  );
  const [pace, setPace] = useState(runLog?.paceMinPerKm || '5:45');
  const [duration, setDuration] = useState(
    runLog?.durationMinutes ? runLog.durationMinutes.toString() : '16'
  );
  const [reflection, setReflection] = useState(runLog?.feelingSummary || '');
  const [isSaved, setIsSaved] = useState(Boolean(runLog));

  useEffect(() => {
    if (runLog) {
      setDistance(runLog.distanceKm !== undefined ? runLog.distanceKm.toString() : defaultDistance.toString());
      setPace(runLog.paceMinPerKm || '5:45');
      setDuration(runLog.durationMinutes ? runLog.durationMinutes.toString() : '16');
      setReflection(runLog.feelingSummary || '');
      setIsSaved(true);
    } else {
      setDistance(defaultDistance.toString());
      setPace('5:45');
      setDuration('16');
      setReflection('');
      setIsSaved(false);
    }
  }, [runLog, defaultDistance]);

  const handleSave = () => {
    safeHaptics.success();
    const distNum = parseFloat(distance) || defaultDistance;
    const durNum = parseInt(duration, 10) || undefined;
    onSaveRun(distNum, pace.trim() || undefined, durNum, reflection.trim() || undefined);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBox}>
            <Ionicons name="trail-sign" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.cardTitle}>RUNNING & TRACK SESSION</Text>
            <Text style={styles.cardSubtitle}>Aerobic Base & Ankle Pre-Conditioning</Text>
          </View>
        </View>

        {runLog ? (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-done" size={13} color={Colors.primary} />
            <Text style={styles.completedBadgeText}>Logged</Text>
          </View>
        ) : (
          <View style={styles.dueBadge}>
            <Text style={styles.dueBadgeText}>2.5km Target</Text>
          </View>
        )}
      </View>

      {/* Metrics Row (Distance, Pace, Duration) */}
      <View style={styles.metricsRow}>
        <View style={styles.metricInputBox}>
          <Text style={styles.metricLabel}>DISTANCE</Text>
          <View style={styles.metricValRow}>
            <TextInput
              style={styles.metricInput}
              keyboardType="decimal-pad"
              value={distance}
              onChangeText={setDistance}
              placeholder="2.5"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.metricUnit}>km</Text>
          </View>
        </View>

        <View style={styles.metricInputBox}>
          <Text style={styles.metricLabel}>PACE</Text>
          <View style={styles.metricValRow}>
            <TextInput
              style={styles.metricInput}
              value={pace}
              onChangeText={setPace}
              placeholder="5:45"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.metricUnit}>/km</Text>
          </View>
        </View>

        <View style={styles.metricInputBox}>
          <Text style={styles.metricLabel}>DURATION</Text>
          <View style={styles.metricValRow}>
            <TextInput
              style={styles.metricInput}
              keyboardType="number-pad"
              value={duration}
              onChangeText={setDuration}
              placeholder="16"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.metricUnit}>min</Text>
          </View>
        </View>
      </View>

      {/* Feeling & Ankle Summary Input */}
      <View style={styles.reflectionWrapper}>
        <Text style={styles.inputLabel}>HOW DID YOU FEEL? (ANKLE, BREATHING & CADENCE)</Text>
        <TextInput
          style={styles.reflectionInput}
          multiline
          placeholder="e.g. Ankle tendon felt 100% stable, breathing was rhythmic, pushed pace on final 400m."
          placeholderTextColor={Colors.textMuted}
          value={reflection}
          onChangeText={setReflection}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity 
        style={[styles.saveBtn, isSaved && styles.saveBtnDone]}
        onPress={handleSave}
        activeOpacity={0.8}
      >
        <Ionicons 
          name={isSaved ? "checkmark-circle" : "save-outline"} 
          size={16} 
          color="#ffffff" 
        />
        <Text style={styles.saveBtnText}>
          {isSaved ? 'Run Session Logged ✓' : (runLog ? 'Update Run Log' : 'Save Run Log')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
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
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.mint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  dueBadge: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dueBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.md,
  },
  metricInputBox: {
    flex: 1,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricValRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  metricInput: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    minWidth: 42,
    padding: 0,
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  reflectionWrapper: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  reflectionInput: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 13,
    color: Colors.textPrimary,
    minHeight: 64,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    ...Shadows.soft,
  },
  saveBtnDone: {
    backgroundColor: Colors.primaryDark,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});

