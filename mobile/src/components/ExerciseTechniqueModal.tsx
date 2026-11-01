import React, { useEffect, useRef } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Animated, 
  Linking 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme/colors';
import { ExerciseGuide } from '../services/exerciseData';
import { safeHaptics } from '../services/haptics';

interface TechniqueModalProps {
  visible: boolean;
  guide: ExerciseGuide | null;
  onClose: () => void;
}

export const ExerciseTechniqueModal: React.FC<TechniqueModalProps> = ({
  visible,
  guide,
  onClose,
}) => {
  const animValue = useRef(new Animated.Value(0)).current;

  // Visual Form Loop Animation
  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      animValue.setValue(0);
    }
  }, [visible]);

  if (!guide) return null;

  const handleOpenVideo = () => {
    safeHaptics.light();
    Linking.openURL(guide.videoDemoUrl);
  };

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 24],
  });

  const scale = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.08, 1],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header Bar */}
          <View style={styles.header}>
            <View>
              <View style={styles.badgeRow}>
                <Text style={styles.categoryBadge}>{guide.category}</Text>
                <Text style={styles.tempoBadge}>{guide.animationFrames.tempo}</Text>
              </View>
              <Text style={styles.title}>{guide.name}</Text>
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

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Visual Movement Animation Card */}
            <View style={styles.animationCard}>
              <View style={styles.animHeader}>
                <Ionicons name="body-outline" size={16} color={Colors.primary} />
                <Text style={styles.animTitle}>FORM & MOTION LOOP</Text>
              </View>
              
              <View style={styles.stageContainer}>
                {/* Visual Position Nodes */}
                <View style={styles.nodeTop}>
                  <Text style={styles.nodeLabel}>{guide.animationFrames.startLabel}</Text>
                </View>

                {/* Animated Form Indicator Pulse */}
                <Animated.View 
                  style={[
                    styles.movingIndicator, 
                    { 
                      transform: [{ translateY }, { scale }] 
                    }
                  ]}
                >
                  <View style={styles.pulseCore} />
                  <Ionicons name="arrow-down" size={16} color="#ffffff" />
                </Animated.View>

                <View style={styles.nodeBottom}>
                  <Text style={styles.nodeLabel}>{guide.animationFrames.peakLabel}</Text>
                </View>
              </View>

              <Text style={styles.musclesText}>
                🎯 <Text style={styles.boldText}>Targets:</Text> {guide.primaryMuscles}
              </Text>
            </View>

            {/* Step-by-Step Form Cues */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>PERFECT FORM CUES</Text>
              {guide.cues.map((cue, idx) => (
                <View key={idx} style={styles.cueRow}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.emerald} style={{ marginTop: 2 }} />
                  <Text style={styles.cueText}>{cue}</Text>
                </View>
              ))}
            </View>

            {/* Mistakes to Avoid */}
            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: Colors.ruby }]}>COMMON MISTAKES TO AVOID</Text>
              {guide.mistakesToAvoid.map((mistake, idx) => (
                <View key={idx} style={styles.cueRow}>
                  <Ionicons name="alert-circle" size={16} color={Colors.ruby} style={{ marginTop: 2 }} />
                  <Text style={styles.cueText}>{mistake}</Text>
                </View>
              ))}
            </View>

            {/* Kaizen Insight */}
            <View style={styles.kaizenCard}>
              <Ionicons name="sparkles" size={18} color={Colors.amber} />
              <View style={{ flex: 1 }}>
                <Text style={styles.kaizenTitle}>KAIZEN FORM TIP</Text>
                <Text style={styles.kaizenText}>{guide.kaizenTip}</Text>
              </View>
            </View>

            {/* Watch Video Demo Button */}
            <TouchableOpacity 
              style={styles.videoButton} 
              onPress={handleOpenVideo}
              activeOpacity={0.8}
            >
              <Ionicons name="play-circle" size={20} color="#ffffff" />
              <Text style={styles.videoButtonText}>Watch Curated Video Demonstration</Text>
            </TouchableOpacity>

            <View style={{ height: Spacing.xl }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    backgroundColor: Colors.primaryGlow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    textTransform: 'uppercase',
  },
  tempoBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.amber,
    backgroundColor: Colors.amberMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.lg,
  },
  animationCard: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  animHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  animTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
  },
  stageContainer: {
    height: 110,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginVertical: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nodeTop: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
  },
  nodeBottom: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
  },
  nodeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  movingIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  pulseCore: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  musclesText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  cueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  cueText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 19,
  },
  kaizenCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.amberMuted,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.amber + '40',
    marginBottom: Spacing.lg,
  },
  kaizenTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.amber,
    letterSpacing: 1,
    marginBottom: 2,
  },
  kaizenText: {
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  videoButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  videoButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

