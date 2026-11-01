import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  ActivityIndicator,
  Text,
  TouchableOpacity
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from './src/theme/colors';
import { SelfAppState, DayPhase } from './src/types';
import { 
  storage, 
  getCurrentDayPhase 
} from './src/services/storage';
import { notificationService } from './src/services/notifications';
import { Header } from './src/components/Header';
import { TimeBlocksBar } from './src/components/TimeBlocksBar';
import { SpiritualAnchorCard } from './src/components/SpiritualAnchorCard';
import { WorkoutCard } from './src/components/WorkoutCard';
import { IntegrityCard } from './src/components/IntegrityCard';
import { FocusTimerCard } from './src/components/FocusTimerCard';
import { EveningSanctuaryCard } from './src/components/EveningSanctuaryCard';
import { QuickSpendModal } from './src/components/QuickSpendModal';
import { UrgeDefeaterModal } from './src/components/UrgeDefeaterModal';
import { ExerciseTechniqueModal } from './src/components/ExerciseTechniqueModal';
import { MealLoggingModal } from './src/components/MealLoggingModal';
import { BodyMetricsModal } from './src/components/BodyMetricsModal';
import { RelapseResetModal } from './src/components/RelapseResetModal';
import { ExerciseGuide } from './src/services/exerciseData';
import { safeHaptics } from './src/services/haptics';

export default function App() {
  const [appState, setAppState] = useState<SelfAppState | null>(null);
  const [dayPhase, setDayPhase] = useState<DayPhase>('MORNING_RITUAL');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showSpendModal, setShowSpendModal] = useState(false);
  const [showUrgeModal, setShowUrgeModal] = useState(false);
  const [showBodyModal, setShowBodyModal] = useState(false);
  const [showRelapseModal, setShowRelapseModal] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<ExerciseGuide | null>(null);
  const [activeMealModal, setActiveMealModal] = useState<{
    meal: 'Breakfast' | 'Lunch' | 'Dinner';
    rating: number;
  } | null>(null);

  // Active view tab filter
  const [activeTab, setActiveTab] = useState<'timeline' | 'workout' | 'focus' | 'integrity'>('timeline');

  useEffect(() => {
    async function init() {
      const state = await storage.loadState();
      setAppState(state);
      setDayPhase(getCurrentDayPhase());
      setLoading(false);

      notificationService.scheduleDailyRitualAlarms();
    }
    init();

    const phaseInterval = setInterval(() => {
      setDayPhase(getCurrentDayPhase());
    }, 60000);

    return () => clearInterval(phaseInterval);
  }, []);

  if (loading || !appState) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>SELF COMPANION</Text>
      </View>
    );
  }

  // --- Handlers ---
  const handleToggleSpiritual = async (item: 'wakeup' | 'track' | 'bible', passage?: string) => {
    const updated = await storage.toggleSpiritual(item, passage);
    setAppState({ ...updated });
  };

  const handleToggleSet = async (exIndex: number, setIndex: number) => {
    const updated = await storage.toggleWorkoutSet(exIndex, setIndex);
    setAppState({ ...updated });
  };

  const handleUpdateWorkoutRpe = async (rpe: number, notes?: string) => {
    const updated = await storage.updateWorkoutRpe(rpe, notes);
    setAppState({ ...updated });
  };

  const handleAcceptOverload = async () => {
    const updated = await storage.acceptOverloadSuggestion();
    setAppState({ ...updated });
  };

  const handleAddWater = async (ml: number) => {
    const updated = await storage.addWater(ml);
    setAppState({ ...updated });
  };

  const handleSaveMealSatiety = async (rating: number, description?: string, trigger?: string) => {
    if (!activeMealModal) return;
    const updated = await storage.logMealFullness(activeMealModal.meal, rating, description, trigger);
    setAppState({ ...updated });
  };

  const handleSaveWeeklyBodyMetrics = async (w: number, wa: number, t: number, a: number) => {
    const updated = await storage.logWeeklyBodyMetrics(w, wa, t, a);
    setAppState({ ...updated });
  };

  const handleQuickSpend = async (amount: number, category: any) => {
    const updated = await storage.recordQuickSpend(amount, category);
    setAppState({ ...updated });
  };

  const handleCompleteFocusBlock = async (project: any, duration: number) => {
    const updated = await storage.recordFocusBlock(project, duration);
    setAppState({ ...updated });
  };

  const handleAddGuitar = async (mins: number, details?: string) => {
    const updated = await storage.addGuitarMinutes(mins, details);
    setAppState({ ...updated });
  };

  const handleLogHobby = async (type: 'photo' | 'novel' | 'writing', details: string) => {
    const updated = await storage.logHobbySession(type, details);
    setAppState({ ...updated });
  };

  const handleSaveJournal = async (wins: string, friction: string, tomorrow: string) => {
    const updated = await storage.saveEveningReflection(wins, friction, tomorrow);
    setAppState({ ...updated });
  };

  const handleUrgeConquered = async () => {
    const updated = await storage.recordUrgeDefeated();
    setAppState({ ...updated });
  };

  const handleRelapseConfirm = async (reflection?: string) => {
    const updated = await storage.recordRelapse(reflection);
    setAppState({ ...updated });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <ExpoStatusBar style="dark" />

        <View style={styles.canvasBackground}>
          {/* Top Header */}
          <Header
            currentDate={appState.currentDate}
            dayPhase={dayPhase}
            waterMl={appState.integrity.waterMl}
            waterGoalMl={appState.integrity.waterGoalMl}
            purityDays={appState.integrity.purityStreakDays}
            urgeDivertedCount={appState.integrity.urgeDivertedCount}
            controlledSatietyDays={appState.integrity.consecutiveControlledSatietyDays}
            fastingUnlocked={appState.integrity.fastingModeUnlocked}
            onOpenSpend={() => setShowSpendModal(true)}
            onOpenBodyMetrics={() => setShowBodyModal(true)}
          />

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. VISUAL TIME-BLOCK SCHEDULE NAVIGATOR */}
            <TimeBlocksBar
              currentPhase={dayPhase}
              onSelectBlock={(phase) => setDayPhase(phase)}
            />

            {/* Filter Navigation Tabs */}
            <View style={styles.filterRow}>
              {[
                { id: 'timeline', label: 'Timeline' },
                { id: 'workout', label: 'Kaizen Movement' },
                { id: 'focus', label: 'Deep Work' },
                { id: 'integrity', label: 'Integrity' },
              ].map(tab => (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.filterTab, 
                    activeTab === tab.id && styles.filterTabActive
                  ]}
                  onPress={() => {
                    safeHaptics.light();
                    setActiveTab(tab.id as any);
                  }}
                >
                  <Text 
                    style={[
                      styles.filterTabText, 
                      activeTab === tab.id && styles.filterTabTextActive
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 2. MORNING SPIRITUAL ANCHOR (Prayer & Scripture) */}
            {(activeTab === 'timeline' || dayPhase === 'MORNING_RITUAL') && (
              <SpiritualAnchorCard
                spiritual={appState.spiritual}
                onToggle={handleToggleSpiritual}
              />
            )}

            {/* 3. KAIZEN WORKOUT MODULE */}
            {(activeTab === 'timeline' || activeTab === 'workout') && (
              <WorkoutCard
                workout={appState.workout}
                overloadConfig={appState.overloadConfig}
                onToggleSet={handleToggleSet}
                onAcceptOverload={handleAcceptOverload}
                onOpenGuide={(guide) => setSelectedGuide(guide)}
                onUpdateRpe={handleUpdateWorkoutRpe}
              />
            )}

            {/* 4. INTEGRITY & TEMPERANCE MODULE */}
            {(activeTab === 'timeline' || activeTab === 'integrity') && (
              <IntegrityCard
                integrity={appState.integrity}
                onAddWater={handleAddWater}
                onOpenMealModal={(meal, rating) => setActiveMealModal({ meal, rating })}
                onOpenUrgeDefeater={() => setShowUrgeModal(true)}
                onOpenRelapseModal={() => setShowRelapseModal(true)}
              />
            )}

            {/* 5. DEEP WORK FOCUS SHIELD */}
            {(activeTab === 'timeline' || activeTab === 'focus') && (
              <FocusTimerCard
                onCompleteBlock={handleCompleteFocusBlock}
              />
            )}

            {/* 6. EVENING SANCTUARY & HOBBIES */}
            {activeTab === 'timeline' && (
              <EveningSanctuaryCard
                sanctuary={appState.sanctuary}
                onAddGuitarMinutes={handleAddGuitar}
                onLogHobby={handleLogHobby}
                onSaveJournal={handleSaveJournal}
              />
            )}

            {/* 7. BODY COMPOSITION & ANKLE HEALTH MIRROR */}
            {activeTab === 'timeline' && (
              <TouchableOpacity 
                style={styles.bodyMetricsCard}
                onPress={() => {
                  safeHaptics.light();
                  setShowBodyModal(true);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.bodyHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="scale" size={16} color={Colors.emerald} />
                    <Text style={styles.bodyTitle}>BODY COMPOSITION & ANKLE STATUS</Text>
                  </View>
                  <Text style={styles.bodyTapPrompt}>Tap to audit weekly ➔</Text>
                </View>

                <View style={styles.statsGrid}>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricVal}>{appState.bodyWeightKg} kg</Text>
                    <Text style={styles.metricLabel}>Weight</Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricVal}>{appState.waistCircumferenceCm} cm</Text>
                    <Text style={styles.metricLabel}>Waist</Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricVal}>{appState.tummyCircumferenceCm} cm</Text>
                    <Text style={styles.metricLabel}>Tummy</Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={[styles.metricVal, { color: Colors.amber }]}>Level {appState.anklePainRating}</Text>
                    <Text style={styles.metricLabel}>Ankle Strain</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            <View style={{ height: 70 }} />
          </ScrollView>

          {/* Floating Quick Spend Dock */}
          <TouchableOpacity 
            style={styles.floatingSpendFab}
            onPress={() => {
              safeHaptics.medium();
              setShowSpendModal(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.fabSymbol}>₦</Text>
            <Text style={styles.fabText}>Quick Log</Text>
          </TouchableOpacity>
        </View>

        {/* Modals */}
        <QuickSpendModal
          visible={showSpendModal}
          onSave={handleQuickSpend}
          onClose={() => setShowSpendModal(false)}
        />

        <UrgeDefeaterModal
          visible={showUrgeModal}
          onConquer={handleUrgeConquered}
          onClose={() => setShowUrgeModal(false)}
        />

        <RelapseResetModal
          visible={showRelapseModal}
          onConfirmReset={handleRelapseConfirm}
          onClose={() => setShowRelapseModal(false)}
        />

        <ExerciseTechniqueModal
          visible={selectedGuide !== null}
          guide={selectedGuide}
          onClose={() => setSelectedGuide(null)}
        />

        {activeMealModal && (
          <MealLoggingModal
            visible={activeMealModal !== null}
            meal={activeMealModal.meal}
            initialRating={activeMealModal.rating}
            onSave={handleSaveMealSatiety}
            onClose={() => setActiveMealModal(null)}
          />
        )}

        <BodyMetricsModal
          visible={showBodyModal}
          currentWeight={appState.bodyWeightKg}
          currentWaist={appState.waistCircumferenceCm}
          currentTummy={appState.tummyCircumferenceCm}
          currentAnkle={appState.anklePainRating}
          history={appState.bodyMetricsHistory}
          onSave={handleSaveWeeklyBodyMetrics}
          onClose={() => setShowBodyModal(false)}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  canvasBackground: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  filterTab: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  bodyMetricsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  bodyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  bodyTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.emerald,
    letterSpacing: 0.5,
  },
  bodyTapPrompt: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  metricBox: {
    flex: 1,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  floatingSpendFab: {
    position: 'absolute',
    bottom: 22,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    ...Shadows.floating,
  },
  fabSymbol: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  fabText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
