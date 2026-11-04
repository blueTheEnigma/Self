import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { RunLog } from '../types';
import { safeHaptics } from '../services/haptics';

interface RunningCardProps {
  runLog?: RunLog;
  defaultDistance?: number;
  onSaveRun: (
    distanceKm: number, 
    pace?: string, 
    durationMinutes?: number, 
    reflection?: string,
    durationSeconds?: number
  ) => void;
}

export const RunningCard: React.FC<RunningCardProps> = ({
  runLog,
  defaultDistance = 2.5,
  onSaveRun,
}) => {
  const [distance, setDistance] = useState(
    runLog?.distanceKm !== undefined ? runLog.distanceKm.toString() : defaultDistance.toString()
  );
  const [durationMinutes, setDurationMinutes] = useState(
    runLog?.durationMinutes !== undefined ? runLog.durationMinutes.toString() : '15'
  );
  const [durationSeconds, setDurationSeconds] = useState(
    runLog?.durationSeconds !== undefined 
      ? runLog.durationSeconds.toString().padStart(2, '0') 
      : '00'
  );
  const [pace, setPace] = useState(runLog?.paceMinPerKm || '6:00');
  const [reflection, setReflection] = useState(runLog?.feelingSummary || '');
  const [isSaved, setIsSaved] = useState(Boolean(runLog));

  // Auto-pace calculator based on Distance (km) and Total Elapsed Time (mins + secs)
  const calcPace = (distKmStr: string, minsStr: string, secsStr: string): string => {
    const dist = parseFloat(distKmStr);
    const mins = parseInt(minsStr, 10) || 0;
    const secs = parseInt(secsStr, 10) || 0;
    if (!dist || dist <= 0) return '';
    const totalSeconds = mins * 60 + secs;
    if (totalSeconds <= 0) return '';
    const paceTotalSec = Math.round(totalSeconds / dist);
    const paceM = Math.floor(paceTotalSec / 60);
    const paceS = paceTotalSec % 60;
    return `${paceM}:${paceS.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (runLog) {
      const d = runLog.distanceKm !== undefined ? runLog.distanceKm.toString() : defaultDistance.toString();
      const m = runLog.durationMinutes !== undefined ? runLog.durationMinutes.toString() : '15';
      const s = runLog.durationSeconds !== undefined ? runLog.durationSeconds.toString().padStart(2, '0') : '00';
      setDistance(d);
      setDurationMinutes(m);
      setDurationSeconds(s);
      setPace(runLog.paceMinPerKm || calcPace(d, m, s) || '6:00');
      setReflection(runLog.feelingSummary || '');
      setIsSaved(true);
    } else {
      setDistance(defaultDistance.toString());
      setDurationMinutes('15');
      setDurationSeconds('00');
      setPace(calcPace(defaultDistance.toString(), '15', '00') || '6:00');
      setReflection('');
      setIsSaved(false);
    }
  }, [runLog, defaultDistance]);

  const handleDistanceChange = (val: string) => {
    setDistance(val);
    const autoPace = calcPace(val, durationMinutes, durationSeconds);
    if (autoPace) setPace(autoPace);
  };

  const handleMinutesChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setDurationMinutes(cleaned);
    const autoPace = calcPace(distance, cleaned, durationSeconds);
    if (autoPace) setPace(autoPace);
  };

  const handleSecondsChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    let secNum = parseInt(cleaned, 10);
    if (!isNaN(secNum) && secNum > 59) {
      secNum = 59;
    }
    const finalSec = isNaN(secNum) ? '' : secNum.toString();
    setDurationSeconds(finalSec);
    const autoPace = calcPace(distance, durationMinutes, finalSec);
    if (autoPace) setPace(autoPace);
  };

  const handleSecondsBlur = () => {
    if (durationSeconds.length === 1) {
      setDurationSeconds(durationSeconds.padStart(2, '0'));
    }
  };

  const handleSave = () => {
    safeHaptics.success();
    const distNum = parseFloat(distance) || defaultDistance;
    const minsNum = parseInt(durationMinutes, 10) || 0;
    const secsNum = parseInt(durationSeconds, 10) || 0;
    const computedPace = pace.trim() || calcPace(distance, durationMinutes, durationSeconds) || undefined;
    onSaveRun(distNum, computedPace, minsNum, reflection.trim() || undefined, secsNum);
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
            <Text style={styles.completedBadgeText}>
              {runLog.distanceKm}km in {runLog.durationMinutes || 0}m{runLog.durationSeconds ? ` ${runLog.durationSeconds}s` : ''}
            </Text>
          </View>
        ) : (
          <View style={styles.dueBadge}>
            <Text style={styles.dueBadgeText}>{defaultDistance}km Target</Text>
          </View>
        )}
      </View>

      {/* Metrics Row (Distance, Pace, Time Elapsed) */}
      <View style={styles.metricsRow}>
        {/* Distance */}
        <View style={styles.metricInputBox}>
          <Text style={styles.metricLabel}>DISTANCE</Text>
          <View style={styles.metricValRow}>
            <TextInput
              style={styles.metricInput}
              keyboardType="decimal-pad"
              value={distance}
              onChangeText={handleDistanceChange}
              placeholder="2.5"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.metricUnit}>km</Text>
          </View>
        </View>

        {/* Pace (Auto-computed or user adjusted) */}
        <View style={styles.metricInputBox}>
          <Text style={styles.metricLabel}>PACE</Text>
          <View style={styles.metricValRow}>
            <TextInput
              style={styles.metricInput}
              value={pace}
              onChangeText={setPace}
              placeholder="6:00"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.metricUnit}>/km</Text>
          </View>
        </View>

        {/* Time Elapsed (Minutes & Seconds) */}
        <View style={[styles.metricInputBox, styles.timeInputBox]}>
          <Text style={styles.metricLabel}>TIME ELAPSED</Text>
          <View style={styles.timeValRow}>
            <TextInput
              style={styles.timeInput}
              keyboardType="number-pad"
              value={durationMinutes}
              onChangeText={handleMinutesChange}
              placeholder="15"
              maxLength={3}
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={styles.timeColon}>:</Text>
            <TextInput
              style={styles.timeInput}
              keyboardType="number-pad"
              value={durationSeconds}
              onChangeText={handleSecondsChange}
              onBlur={handleSecondsBlur}
              placeholder="00"
              maxLength={2}
              placeholderTextColor={Colors.textMuted}
            />
          </View>
          <Text style={styles.timeSubtext}>min : sec</Text>
        </View>
      </View>

      {/* Feeling & Ankle Summary Input */}
      <View style={styles.reflectionWrapper}>
        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>HOW DID YOU FEEL? (ANKLE, BREATHING & CADENCE)</Text>
          {reflection.trim().length > 0 && (
            <TouchableOpacity
              onPress={() => {
                safeHaptics.light();
                setReflection('');
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        <TextInput
          style={styles.reflectionInput}
          multiline
          scrollEnabled={false}
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
  timeInputBox: {
    minWidth: 95,
  },
  timeValRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 1,
  },
  timeInput: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    minWidth: 24,
    textAlign: 'center',
    padding: 0,
  },
  timeColon: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginHorizontal: 1,
  },
  timeSubtext: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  reflectionWrapper: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.ruby,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.4,
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
