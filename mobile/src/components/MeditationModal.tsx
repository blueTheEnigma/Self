import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { safeHaptics } from '../services/haptics';
import { MeditationState } from '../types';

interface MeditationModalProps {
  visible: boolean;
  onClose: () => void;
  meditationState: MeditationState;
  onSaveSession: (minutes: number) => void;
  onAcceptKaizen: () => void;
  onDismissKaizen: () => void;
}

export const MeditationModal: React.FC<MeditationModalProps> = ({
  visible,
  onClose,
  meditationState,
  onSaveSession,
  onAcceptKaizen,
  onDismissKaizen,
}) => {
  const targetMinutes = meditationState.targetMinutes || 10;
  const [secondsRemaining, setSecondsRemaining] = useState(targetMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  // Sync timer when targetMinutes changes or modal becomes visible
  useEffect(() => {
    if (visible) {
      setSecondsRemaining(targetMinutes * 60);
      setIsActive(false);
    }
  }, [visible, targetMinutes]);

  // Breathing pulse animation loop
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (isActive) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => {
      if (loop) loop.stop();
    };
  }, [isActive, pulseAnim]);

  // Countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
    } else if (isActive && secondsRemaining === 0) {
      safeHaptics.heavy();
      setIsActive(false);
      onSaveSession(targetMinutes);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining, targetMinutes, onSaveSession]);

  const toggleTimer = () => {
    safeHaptics.medium();
    setIsActive(prev => !prev);
  };

  const resetTimer = () => {
    safeHaptics.light();
    setIsActive(false);
    setSecondsRemaining(targetMinutes * 60);
  };

  const handleManualComplete = () => {
    safeHaptics.success();
    onSaveSession(targetMinutes);
    onClose();
  };

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const isCompletedToday = meditationState.completedToday;
  const pendingKaizen = meditationState.pendingKaizenElevation;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleWrap}>
              <View style={styles.iconCircle}>
                <Ionicons name="sparkles" size={18} color={Colors.lavenderDark} />
              </View>
              <View>
                <Text style={styles.modalTitle}>DAILY STILLNESS</Text>
                <Text style={styles.modalSub}>{targetMinutes} Minutes Breath & Presence</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Pending Kaizen Elevation Banner */}
          {pendingKaizen && (
            <View style={styles.kaizenBanner}>
              <View style={styles.kaizenIconWrap}>
                <Ionicons name="trending-up" size={18} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.kaizenTitle}>KAIZEN ELEVATION EARNED</Text>
                <Text style={styles.kaizenSub}>
                  You consecrated {pendingKaizen.daysCompletedLastWeek}/7 days of stillness! Step up to{' '}
                  <Text style={{ fontWeight: '800', color: Colors.lavenderDark }}>
                    {pendingKaizen.suggestedMinutes} minutes
                  </Text>{' '}
                  daily?
                </Text>
                <View style={styles.kaizenActionsRow}>
                  <TouchableOpacity 
                    style={styles.kaizenAcceptBtn}
                    onPress={() => {
                      safeHaptics.success();
                      onAcceptKaizen();
                    }}
                  >
                    <Text style={styles.kaizenAcceptText}>Accept +2m</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.kaizenDismissBtn}
                    onPress={() => {
                      safeHaptics.light();
                      onDismissKaizen();
                    }}
                  >
                    <Text style={styles.kaizenDismissText}>Maintain {targetMinutes}m</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Breathing Circle & Countdown Timer */}
          <View style={styles.timerCenterWrap}>
            <Animated.View style={[styles.breathingCircle, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.innerTimerBox}>
                <Text style={styles.timerNumbers}>{timeFormatted}</Text>
                <Text style={styles.timerStateLabel}>
                  {isActive ? 'Breathe Deeply' : isCompletedToday ? 'Sealed Today ✓' : 'Ready'}
                </Text>
              </View>
            </Animated.View>
          </View>

          {/* Timer Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity 
              style={[styles.mainTimerBtn, isActive && styles.mainTimerBtnActive]}
              onPress={toggleTimer}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={isActive ? "pause" : "play"} 
                size={20} 
                color="#ffffff" 
              />
              <Text style={styles.mainTimerBtnText}>
                {isActive ? 'Pause Stillness' : 'Begin Stillness'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.resetBtn}
              onPress={resetTimer}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Offline / Quick Complete Button */}
          <TouchableOpacity 
            style={[styles.quickCompleteBtn, isCompletedToday && styles.quickCompleteBtnDone]}
            onPress={handleManualComplete}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isCompletedToday ? "checkmark-circle" : "checkmark-circle-outline"} 
              size={16} 
              color={isCompletedToday ? Colors.mintDark : Colors.lavenderDark} 
            />
            <Text style={[styles.quickCompleteText, isCompletedToday && styles.quickCompleteTextDone]}>
              {isCompletedToday ? 'Stillness Sealed for Today ✓' : 'Mark Completed Offline'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.floating,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  modalSub: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 1,
  },
  closeBtn: {
    padding: Spacing.xs,
  },

  // Kaizen Banner
  kaizenBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.lavender,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.lavenderBorder,
  },
  kaizenIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.lavenderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kaizenTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.lavenderDark,
  },
  kaizenSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
    marginTop: 2,
  },
  kaizenActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  kaizenAcceptBtn: {
    backgroundColor: Colors.lavenderDark,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
  },
  kaizenAcceptText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff',
  },
  kaizenDismissBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  kaizenDismissText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },

  // Timer Circle
  timerCenterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.lg,
  },
  breathingCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.lavender,
    borderWidth: 3,
    borderColor: Colors.lavenderBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerTimerBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerNumbers: {
    fontSize: 38,
    fontWeight: '900',
    color: Colors.lavenderDark,
    letterSpacing: 1,
  },
  timerStateLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 4,
  },

  // Controls
  controlsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  mainTimerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.lavenderDark,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    ...Shadows.soft,
  },
  mainTimerBtnActive: {
    backgroundColor: Colors.primary,
  },
  mainTimerBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  resetBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Quick Complete
  quickCompleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickCompleteBtnDone: {
    backgroundColor: Colors.mint,
    borderColor: Colors.mintBorder,
  },
  quickCompleteText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.lavenderDark,
  },
  quickCompleteTextDone: {
    color: Colors.mintDark,
  },
});
