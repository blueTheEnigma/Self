import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { safeHaptics } from '../services/haptics';

interface UrgeDefeaterProps {
  visible: boolean;
  onConquer: () => void;
  onClose: () => void;
}

export const UrgeDefeaterModal: React.FC<UrgeDefeaterProps> = ({
  visible,
  onConquer,
  onClose,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerActive) {
      safeHaptics.heavy();
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const handleStartStep = () => {
    safeHaptics.medium();
    setTimerSeconds(30);
    setTimerActive(true);
  };

  const handleNextStep = () => {
    safeHaptics.light();
    setTimerActive(false);
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    setTimerSeconds(30);
  };

  const handleConquerVictory = () => {
    safeHaptics.success();
    onConquer();
    onClose();
    setStep(1);
    setTimerSeconds(30);
    setTimerActive(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="flash" size={24} color="#ffffff" />
            </View>
            <Text style={styles.title}>EMERGENCY URGE DEFEATER</Text>
            <Text style={styles.subtitle}>Neurological Pattern Interrupt</Text>
          </View>

          {/* Step Progress Indicators */}
          <View style={styles.stepsRow}>
            {[1, 2, 3].map(s => (
              <View 
                key={s} 
                style={[
                  styles.stepDot, 
                  step === s && styles.stepDotActive,
                  step > s && styles.stepDotDone,
                ]} 
              />
            ))}
          </View>

          {/* STEP 1: Cold Water Shock */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>STEP 1: COLD WATER SHOCK</Text>
              <Text style={styles.stepInstruction}>
                Go to the sink right now. Splash ice-cold water onto your face for 30 seconds or drink a cold 300ml glass of water.
              </Text>
              <Text style={styles.stepScience}>
                🧠 <Text style={{ fontWeight: '800' }}>Neuroscience:</Text> Activates the mammalian dive reflex, immediately lowering heart rate and shattering the dopamine craving loop.
              </Text>

              <View style={styles.timerBox}>
                <Text style={styles.timerDisplay}>{timerSeconds}s</Text>
                {!timerActive ? (
                  <TouchableOpacity style={styles.timerBtn} onPress={handleStartStep}>
                    <Text style={styles.timerBtnText}>Start 30s Countdown</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.nextBtn} onPress={handleNextStep}>
                    <Text style={styles.nextBtnText}>Done → Go to Step 2</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* STEP 2: Somatic Horse Stance Transmutation */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>STEP 2: SOMATIC TRANSMUTATION</Text>
              <Text style={styles.stepInstruction}>
                Drop into a deep Horse Stance immediately. Grip the floor with your toes. Take 5 slow, deep nasal breaths into your lower belly.
              </Text>
              <Text style={styles.stepScience}>
                ⚡ <Text style={{ fontWeight: '800' }}>Physiology:</Text> Channels the adrenaline rush away from the brain craving center into your large leg muscles.
              </Text>

              <View style={styles.timerBox}>
                <Text style={styles.timerDisplay}>{timerSeconds}s</Text>
                {!timerActive ? (
                  <TouchableOpacity style={styles.timerBtn} onPress={handleStartStep}>
                    <Text style={styles.timerBtnText}>Start 30s Stance Hold</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.nextBtn} onPress={handleNextStep}>
                    <Text style={styles.nextBtnText}>Done → Go to Step 3</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* STEP 3: Identity Grounding & Prayer */}
          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>STEP 3: GROUNDING PRAYER</Text>
              <View style={styles.prayerCard}>
                <Text style={styles.prayerText}>
                  "Lord, grant me temperance and strength. I run my body; my flesh does not run me. I am building discipline for my calling, my mind, and my future."
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.conquerBtn} 
                onPress={handleConquerVictory}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-done" size={20} color="#ffffff" />
                <Text style={styles.conquerBtnText}>Urge Conquered (Log Victory)</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Cancel */}
          <TouchableOpacity 
            style={styles.cancelBtn} 
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Dismiss</Text>
          </TouchableOpacity>
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
  container: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.ruby + '40',
    alignItems: 'center',
    ...Shadows.card,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.ruby,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.soft,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.ruby,
    fontWeight: '700',
    marginTop: 2,
  },
  stepsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  stepDot: {
    width: 30,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surfaceHighlight,
  },
  stepDotActive: {
    backgroundColor: Colors.ruby,
    width: 45,
  },
  stepDotDone: {
    backgroundColor: Colors.emerald,
  },
  stepContent: {
    width: '100%',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  stepInstruction: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: Spacing.md,
  },
  stepScience: {
    fontSize: 11,
    color: Colors.textSecondary,
    backgroundColor: Colors.surfaceHighlight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    lineHeight: 16,
    marginBottom: Spacing.lg,
    width: '100%',
  },
  timerBox: {
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.md,
  },
  timerDisplay: {
    fontSize: 38,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  timerBtn: {
    backgroundColor: Colors.ruby,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  timerBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  nextBtn: {
    backgroundColor: Colors.emerald,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  nextBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  prayerCard: {
    backgroundColor: Colors.surfaceHighlight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginVertical: Spacing.md,
  },
  prayerText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  conquerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.emerald,
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    ...Shadows.soft,
  },
  conquerBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  cancelBtn: {
    marginTop: Spacing.md,
    padding: Spacing.xs,
  },
  cancelText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
