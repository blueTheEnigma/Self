import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  SafeAreaView, 
  ActivityIndicator,
  Text,
  TouchableOpacity
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from './src/theme/colors';
import { SelfAppState, DayPhase } from './src/types';
import { 
  storage, 
  getCurrentDayPhase, 
  getTodayDateString 
} from './src/services/storage';
import { Header } from './src/components/Header';
import { WorkoutCard } from './src/components/WorkoutCard';
import { IntegrityCard } from './src/components/IntegrityCard';
import { FocusTimerCard } from './src/components/FocusTimerCard';
import { EveningSanctuaryCard } from './src/components/EveningSanctuaryCard';
import { QuickSpendModal } from './src/components/QuickSpendModal';
import { UrgeDefeaterModal } from './src/components/UrgeDefeaterModal';
import { ExerciseTechniqueModal } from './src/components/ExerciseTechniqueModal';
import { ExerciseGuide } from './src/services/exerciseData';
import { safeHaptics } from './src/services/haptics';

export default function App() {
  const [appState, setAppState] = useState<SelfAppState | null>(null);
  const [dayPhase, setDayPhase] = useState<DayPhase>('MORNING_RITUAL');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showSpendModal, setShowSpendModal] = useState(false);
  const [showUrgeModal, setShowUrgeModal] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<ExerciseGuide | null>(null);

  // Active view tab filter (Timeline vs Focused Mode)
  const [activeTab, setActiveTab] = useState<'timeline' | 'workout' | 'focus' | 'integrity'>('timeline');

  useEffect(() => {
    async function init() {
      const state = await storage.loadState();
      setAppState(state);
      setDayPhase(getCurrentDayPhase());
      setLoading(false);
    }
    init();

    // Check phase every minute
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
  const handleToggleSet = async (exIndex: number, setIndex: number) => {
    const updated = await storage.toggleWorkoutSet(exIndex, setIndex);
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

  const handleLogFullness = async (meal: 'Breakfast' | 'Lunch' | 'Dinner', rating: number) => {
    const updated = await storage.logMealFullness(meal, rating);
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

  const handleAddGuitar = async (mins: number) => {
    const updated = await storage.addGuitarMinutes(mins);
    setAppState({ ...updated });
  };

  const handleToggleCreative = async (quest: 'photo' | 'novel' | 'writing') => {
    const updated = await storage.toggleCreativeQuest(quest);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="light" />

      {/* Top Header */}
      <Header
        currentDate={appState.currentDate}
        dayPhase={dayPhase}
        waterMl={appState.integrity.waterMl}
        waterGoalMl={appState.integrity.waterGoalMl}
        purityDays={appState.integrity.purityStreakDays}
        onOpenSpend={() => setShowSpendModal(true)}
      />

      {/* Main Scrollable Timeline */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Filters */}
        <View style={styles.filterRow}>
          {[
            { id: 'timeline', label: 'Timeline' },
            { id: 'workout', label: 'Kaizen Workout' },
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

        {/* 1. KAIZEN WORKOUT MODULE */}
        {(activeTab === 'timeline' || activeTab === 'workout') && (
          <WorkoutCard
            workout={appState.workout}
            overloadConfig={appState.overloadConfig}
            onToggleSet={handleToggleSet}
            onAcceptOverload={handleAcceptOverload}
            onOpenGuide={(guide) => setSelectedGuide(guide)}
          />
        )}

        {/* 2. INTEGRITY & TEMPERANCE MODULE */}
        {(activeTab === 'timeline' || activeTab === 'integrity') && (
          <IntegrityCard
            integrity={appState.integrity}
            onAddWater={handleAddWater}
            onLogFullness={handleLogFullness}
            onOpenUrgeDefeater={() => setShowUrgeModal(true)}
          />
        )}

        {/* 3. DEEP WORK FOCUS SHIELD */}
        {(activeTab === 'timeline' || activeTab === 'focus') && (
          <FocusTimerCard
            onCompleteBlock={handleCompleteFocusBlock}
          />
        )}

        {/* 4. EVENING SANCTUARY & HOBBIES */}
        {activeTab === 'timeline' && (
          <EveningSanctuaryCard
            sanctuary={appState.sanctuary}
            onAddGuitarMinutes={handleAddGuitar}
            onToggleCreativeQuest={handleToggleCreative}
            onSaveJournal={handleSaveJournal}
          />
        )}

        {/* 5. BODY STATS & ANKLE HEALTH MIRROR */}
        {activeTab === 'timeline' && (
          <View style={styles.bodyMetricsCard}>
            <View style={styles.bodyHeader}>
              <Ionicons name="fitness-outline" size={16} color={Colors.emerald} />
              <Text style={styles.bodyTitle}>BODY COMPOSITION & ANKLE HEALTH</Text>
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
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Floating Action Quick Spend Dock */}
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

      <ExerciseTechniqueModal
        visible={selectedGuide !== null}
        guide={selectedGuide}
        onClose={() => setSelectedGuide(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterTabActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  bodyMetricsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  bodyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  bodyTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.emerald,
    letterSpacing: 0.5,
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
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  floatingSpendFab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
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
