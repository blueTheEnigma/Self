import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { ProjectFocusTag } from '../types';
import { safeHaptics } from '../services/haptics';

interface FocusTimerCardProps {
  onCompleteBlock: (project: ProjectFocusTag, durationMinutes: number) => void;
}

const PROJECTS: ProjectFocusTag[] = [
  'Quant Bot',
  'Paper Thoughts',
  'MIT OCW Calc',
  'Fellowships',
  'Technical Paper',
];

export const FocusTimerCard: React.FC<FocusTimerCardProps> = ({
  onCompleteBlock,
}) => {
  const [selectedProject, setSelectedProject] = useState<ProjectFocusTag>('Quant Bot');
  const [targetMinutes, setTargetMinutes] = useState(90);
  const [secondsRemaining, setSecondsRemaining] = useState(90 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isRestCooldown, setIsRestCooldown] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(s => s - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      safeHaptics.heavy();
      setIsActive(false);

      if (!isRestCooldown) {
        onCompleteBlock(selectedProject, targetMinutes);
        setIsRestCooldown(true);
        setSecondsRemaining(15 * 60);
      } else {
        setIsRestCooldown(false);
        setSecondsRemaining(targetMinutes * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining, isRestCooldown, selectedProject, targetMinutes]);

  const toggleTimer = () => {
    safeHaptics.medium();
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    safeHaptics.light();
    setIsActive(false);
    setIsRestCooldown(false);
    setSecondsRemaining(targetMinutes * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectMinutes = (mins: number) => {
    if (isActive) return;
    safeHaptics.light();
    setTargetMinutes(mins);
    setSecondsRemaining(mins * 60);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconBox, { backgroundColor: isRestCooldown ? Colors.cyanMuted : Colors.primaryGlow }]}>
            <Ionicons 
              name={isRestCooldown ? "cafe" : "hourglass"} 
              size={20} 
              color={isRestCooldown ? Colors.cyan : Colors.primary} 
            />
          </View>
          <View>
            <Text style={styles.cardTitle}>
              {isRestCooldown ? 'MANDATORY RECOVERY COOLDOWN' : 'DEEP WORK FOCUS SHIELD'}
            </Text>
            <Text style={styles.cardSubtitle}>
              {isRestCooldown ? 'Step away from screen & stretch' : 'Universal 90-Minute Hard-Cap Engine'}
            </Text>
          </View>
        </View>

        {isActive && (
          <View style={styles.pulsingBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.pulseText}>IN THE ZONE</Text>
          </View>
        )}
      </View>

      {/* Project Selector Pills */}
      {!isRestCooldown && (
        <View style={styles.projectPillsRow}>
          {PROJECTS.map(proj => {
            const isSelected = selectedProject === proj;
            return (
              <TouchableOpacity
                key={proj}
                style={[styles.projPill, isSelected && styles.projPillSelected]}
                onPress={() => {
                  safeHaptics.light();
                  setSelectedProject(proj);
                }}
              >
                <Text style={[styles.projPillText, isSelected && styles.projPillTextSelected]}>
                  {proj}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Large Timer Display */}
      <View style={styles.timerDisplayContainer}>
        <Text style={[styles.timerDigits, isRestCooldown && { color: Colors.cyan }]}>
          {formatTime(secondsRemaining)}
        </Text>
        <Text style={styles.timerSubLabel}>
          {isRestCooldown ? '15m Brain & Ankle Reset' : `Hard ceiling: ${targetMinutes} mins maximum`}
        </Text>
      </View>

      {/* Target Presets */}
      {!isActive && !isRestCooldown && (
        <View style={styles.presetsRow}>
          {[90, 75, 60, 45].map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.presetBtn, targetMinutes === m && styles.presetBtnActive]}
              onPress={() => handleSelectMinutes(m)}
            >
              <Text style={[styles.presetText, targetMinutes === m && styles.presetTextActive]}>
                {m}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.mainActionBtn, isActive ? styles.pauseBtn : styles.startBtn]} 
          onPress={toggleTimer}
          activeOpacity={0.8}
        >
          <Ionicons name={isActive ? "pause" : "play"} size={18} color="#ffffff" />
          <Text style={styles.mainActionText}>
            {isActive ? 'Pause Block' : (isRestCooldown ? 'Pause Rest' : 'Begin Deep Work Block')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.resetBtn} 
          onPress={resetTimer}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={18} color={Colors.textSecondary} />
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
  pulsingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  pulseText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
  },
  projectPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  projPill: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  projPillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  projPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  projPillTextSelected: {
    color: '#ffffff',
    fontWeight: '800',
  },
  timerDisplayContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  timerDigits: {
    fontSize: 50,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 2,
  },
  timerSubLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  presetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  presetTextActive: {
    color: '#ffffff',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  mainActionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.soft,
  },
  startBtn: {
    backgroundColor: Colors.primary,
  },
  pauseBtn: {
    backgroundColor: Colors.amber,
  },
  mainActionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  resetBtn: {
    width: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
