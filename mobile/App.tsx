import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  ActivityIndicator, 
  Text, 
  TouchableOpacity,
  Keyboard,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from './src/theme/colors';
import { Typography } from './src/theme/typography';
import { SelfAppState, DayPhase, AppSettings, ActiveFocusSession } from './src/types';
import { 
  storage, 
  getCurrentDayPhase,
  isRunDay 
} from './src/services/storage';
import { notificationService } from './src/services/notifications';
import { Header } from './src/components/Header';
import { BottomNavBar, NavTabId } from './src/components/BottomNavBar';
import { WorkoutCard } from './src/components/WorkoutCard';
import { FocusTimerCard } from './src/components/FocusTimerCard';
import { QuickSpendModal } from './src/components/QuickSpendModal';
import { UrgeDefeaterModal } from './src/components/UrgeDefeaterModal';
import { ExerciseTechniqueModal } from './src/components/ExerciseTechniqueModal';
import { MealLoggingModal } from './src/components/MealLoggingModal';
import { BodyMetricsModal } from './src/components/BodyMetricsModal';
import { RelapseResetModal } from './src/components/RelapseResetModal';
import { CovenantRing } from './src/components/CovenantRing';
import { QuickMetricsCards } from './src/components/QuickMetricsCards';
import { TodayChecklist, ChecklistItem } from './src/components/TodayChecklist';
import { RunningCard } from './src/components/RunningCard';
import { VaultPortals } from './src/components/VaultPortals';
import { StatsDashboard } from './src/components/StatsDashboard';
import { GymWorkoutCard } from './src/components/GymWorkoutCard';
import { SettingsModal } from './src/components/SettingsModal';
import { ScholarshipOutreachModal } from './src/components/ScholarshipOutreachModal';
import { ExerciseGuide } from './src/services/exerciseData';
import { safeHaptics } from './src/services/haptics';

const PHASE_META: Record<DayPhase, { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap }> = {
  MORNING_RITUAL: { title: 'Morning Ritual', subtitle: 'Prayer, Track Walk, Movement & Audiobook', icon: 'sunny' },
  DEEP_WORK_1: { title: 'Focus 1: Code Engine', subtitle: 'Quant Bot & Paper Thoughts', icon: 'code-slash' },
  MIDDAY_BUFFER: { title: 'Midday Reset', subtitle: '500ml Water & Eye Reset', icon: 'water' },
  DEEP_WORK_2: { title: 'Focus 2: Math Sprint', subtitle: 'MIT OCW Multivariable Calc', icon: 'calculator' },
  AFTERNOON_BUFFER: { title: 'Lunch & Life Buffer', subtitle: '80% Fullness Hara Hachi Bu', icon: 'restaurant' },
  DEEP_WORK_3: { title: 'Focus 3: Fellowships', subtitle: 'Fellowships & Tech Paper', icon: 'rocket' },
  LIFE_BUFFER: { title: 'Open Life Buffer', subtitle: 'Guilt-Free Life, Family & Errands', icon: 'leaf' },
  EVENING_SANCTUARY: { title: 'Evening Sanctuary', subtitle: 'Acoustic Guitar 15m & Art', icon: 'musical-notes' },
  NIGHT_REST: { title: 'Sabbath Night Rest', subtitle: 'Sleep 8h & Neuroplastic Repair', icon: 'moon' },
};

interface RhythmBlock {
  id: DayPhase;
  time: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const RHYTHM_BLOCKS: RhythmBlock[] = [
  { id: 'MORNING_RITUAL', time: '05:30', name: 'Morning', icon: 'sunny-outline' },
  { id: 'DEEP_WORK_1', time: '08:30', name: 'Focus 1', icon: 'code-slash-outline' },
  { id: 'MIDDAY_BUFFER', time: '10:15', name: 'Reset', icon: 'water-outline' },
  { id: 'DEEP_WORK_2', time: '11:30', name: 'Focus 2', icon: 'calculator-outline' },
  { id: 'AFTERNOON_BUFFER', time: '13:00', name: 'Lunch', icon: 'restaurant-outline' },
  { id: 'DEEP_WORK_3', time: '14:30', name: 'Focus 3', icon: 'rocket-outline' },
  { id: 'LIFE_BUFFER', time: '15:45', name: 'Buffer', icon: 'leaf-outline' },
  { id: 'EVENING_SANCTUARY', time: '20:00', name: 'Sanctuary', icon: 'musical-notes-outline' },
  { id: 'NIGHT_REST', time: '21:30', name: 'Rest', icon: 'moon-outline' },
];

export default function App() {
  const [appState, setAppState] = useState<SelfAppState | null>(null);
  const [dayPhase, setDayPhase] = useState<DayPhase>('MORNING_RITUAL');
  const [previewPhase, setPreviewPhase] = useState<DayPhase | null>(null);
  const [loading, setLoading] = useState(true);

  const activePhase = previewPhase ?? dayPhase;

  // 5 Dedicated Bottom Tabs (Vault & Stats Separated)
  const [activeNavTab, setActiveNavTab] = useState<NavTabId>('today');

  // Modals state
  const [showSpendModal, setShowSpendModal] = useState(false);
  const [showUrgeModal, setShowUrgeModal] = useState(false);
  const [showBodyModal, setShowBodyModal] = useState(false);
  const [showRelapseModal, setShowRelapseModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<ExerciseGuide | null>(null);
  const [activeMealModal, setActiveMealModal] = useState<{
    meal: 'Breakfast' | 'Lunch' | 'Dinner';
    rating: number;
  } | null>(null);

  // Keyboard presentation listener for bottom scroll padding
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
  const handleToggleSpiritual = async (item: 'wakeup' | 'track' | 'bible' | 'audiobook', passage?: string, takeaway?: string) => {
    const updated = await storage.toggleSpiritual(item, passage, takeaway);
    setAppState({ ...updated });
  };

  const handleToggleScholarshipOutreach = async (notes?: string) => {
    if (appState.scholarshipOutreachDone) {
      const updated = await storage.toggleScholarshipOutreach(notes);
      setAppState({ ...updated });
    } else {
      setShowScholarshipModal(true);
    }
  };

  const handleSaveScholarshipOutreach = async (
    professorName: string,
    university: string,
    researchTopic?: string,
    notes?: string
  ) => {
    const updated = await storage.saveScholarshipOutreach({
      professorName,
      university,
      researchTopic,
      notes,
    });
    setAppState({ ...updated });
  };

  const handleToggleSet = async (exIndex: number, setIndex: number, value?: number) => {
    const updated = await storage.toggleWorkoutSet(exIndex, setIndex, value);
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

  const handleDeleteSpend = async (id: string) => {
    const updated = await storage.deleteTransaction(id);
    setAppState({ ...updated });
  };

  const handleCompleteFocusBlock = async (project: any, duration: number) => {
    const updated = await storage.recordFocusBlock(project, duration);
    setAppState({ ...updated });
  };

  const handleUpdateFocusSession = async (session: Partial<ActiveFocusSession>) => {
    const updated = await storage.updateActiveFocusSession(session);
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

  const handleUpdateExerciseDifficulty = async (exIndex: number, diff: number) => {
    const updated = await storage.updateExerciseDifficulty(exIndex, diff);
    setAppState({ ...updated });
  };

  const handleSaveRun = async (dist: number, pace?: string, duration?: number, feeling?: string) => {
    const updated = await storage.saveRunLog(dist, pace, duration, feeling);
    setAppState({ ...updated });
  };

  const handleLogGuitar = async (mins: number, notes?: string) => {
    const updated = await storage.logGuitarPractice(mins, notes);
    setAppState({ ...updated });
  };

  const handleLogReading = async (mins: number, title?: string, notes?: string) => {
    const updated = await storage.logReadingSession(mins, title, notes);
    setAppState({ ...updated });
  };

  const handleLogWriting = async (notes: string, title?: string) => {
    const updated = await storage.logWritingSession(notes, title);
    setAppState({ ...updated });
  };

  const handleLogOtherActivity = async (activity: string, notes?: string) => {
    const updated = await storage.logOtherActivity(activity, notes);
    setAppState({ ...updated });
  };

  const handleSaveGymLog = async (split: string, exercisesSummary: string, durationMinutes?: number, feelingSummary?: string) => {
    const updated = await storage.saveGymLog(split, exercisesSummary, durationMinutes, feelingSummary);
    setAppState({ ...updated });
  };

  const handleSaveSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = await storage.updateSettings(newSettings);
    setAppState({ ...updated });
  };

  const handleSaveKaizenTargets = async (targets: {
    pushupsTarget?: number;
    horseStanceSeconds?: number;
    activeHangSeconds?: number;
    situpsTarget?: number;
  }) => {
    const updated = await storage.updateKaizenTargets(targets);
    setAppState({ ...updated });
  };

  // Sunday & Expense calculations
  const isSunday = new Date().getDay() === 0;
  const hasLoggedMetricsToday = appState.bodyMetricsHistory.some(m => m.date === appState.currentDate);
  const todayStr = appState.currentDate;
  const todayTransactions = appState.transactions.filter(t => t.timestamp.startsWith(todayStr));
  const todaySpent = todayTransactions.reduce((acc, t) => acc + t.amount, 0);
  const isRunningDay = isRunDay(new Date(), appState.settings?.runDays || [1, 3, 5]);

  // Executive Daily & Weekly Calculations
  const totalFocusMinutesToday = appState.focusBlocks.reduce((acc, b) => acc + b.durationMinutes, 0);
  const setsDoneCount = appState.workout.exercises.reduce((acc, ex) => acc + ex.completedSets.filter(s => s > 0).length, 0);
  const totalSetsTarget = appState.workout.exercises.length * 3;
  const waterPercent = Math.min(Math.round((appState.integrity.waterMl / appState.integrity.waterGoalMl) * 100), 100);

  // Movement Covenant Evaluation:
  // On Run Days: Run logged AND Calisthenics (12 sets or completed) sealed
  // On Non-Run Days: Gym logged OR Calisthenics (12 sets or completed) sealed
  const isRunLogged = Boolean(appState.workout.runLog);
  const isGymLogged = Boolean(appState.workout.gymLog);
  const isCalisthenicsDone = setsDoneCount >= 12 || appState.workout.completed;
  const isMovementCovenantDone = isRunningDay
    ? (isRunLogged && isCalisthenicsDone)
    : (isGymLogged || isCalisthenicsDone);

  const lastGymLog = (() => {
    const history = appState.dailyHistory || {};
    const sortedDates = Object.keys(history).sort().reverse();
    for (const d of sortedDates) {
      if (history[d]?.gymLog) return history[d].gymLog;
    }
    return null;
  })();

  // Today's Checklist & Covenant Calculations
  const todayChecklistItems: ChecklistItem[] = [
    {
      id: 'wakeup',
      title: 'Morning Prayer & Dedication',
      subtitle: appState.spiritual.wakeupPrayerDone ? 'Completed at 05:30 • Grounded' : 'Morning waking dedication',
      domain: 'spirit_intellect',
      category: 'spiritual',
      isCompleted: appState.spiritual.wakeupPrayerDone,
      onToggle: () => handleToggleSpiritual('wakeup'),
    },
    {
      id: 'track_prayer',
      title: '15m Track Walking Prayer',
      subtitle: appState.spiritual.trackPrayerDone ? '15m completed round tracks' : 'Walking prayer round tracks',
      domain: 'spirit_intellect',
      category: 'spiritual',
      isCompleted: appState.spiritual.trackPrayerDone,
      onToggle: () => handleToggleSpiritual('track'),
    },
    {
      id: 'bible',
      title: 'Scripture Reading',
      subtitle: appState.spiritual.bibleReadingDone ? 'Completed • Spiritual nourishment' : 'Proverbs / Daily passage',
      domain: 'spirit_intellect',
      category: 'spiritual',
      isCompleted: appState.spiritual.bibleReadingDone,
      onToggle: () => handleToggleSpiritual('bible'),
    },
    {
      id: 'audiobook',
      title: 'Daily Audiobook Summary',
      subtitle: appState.spiritual.audiobookDone ? 'Completed • Strategic & intellectual fuel' : 'Listen to at least 1 book summary (15m)',
      domain: 'spirit_intellect',
      category: 'mind',
      isCompleted: Boolean(appState.spiritual.audiobookDone),
      onToggle: () => handleToggleSpiritual('audiobook'),
    },
    {
      id: 'scholarship_outreach',
      title: '1 Scholarship Cold Email',
      subtitle: appState.scholarshipOutreachDone
        ? 'Completed • Professor contacted for Masters/PhD'
        : 'Send 1 cold email to professor (Masters/PhD)',
      domain: 'spirit_intellect',
      category: 'outreach',
      isCompleted: Boolean(appState.scholarshipOutreachDone),
      onToggle: () => handleToggleScholarshipOutreach(),
    },
    {
      id: 'movement',
      title: isRunningDay 
        ? '2.5km Run & Calisthenics' 
        : (appState.settings?.nonRunDayPreference === 'gym' ? 'Gym Strength Session' : 'Gym Strength or Calisthenics'),
      subtitle: isMovementCovenantDone
        ? (isRunningDay
            ? (isGymLogged ? 'Conquered • 2.5km Run + Calisthenics + Gym' : 'Conquered • 2.5km Run & 12 Sets sealed')
            : (isGymLogged ? `Conquered • ${appState.workout.gymLog?.split || 'Gym'} (${appState.workout.gymLog?.durationMinutes || 45}m)` : 'Conquered • 12/12 Calisthenics Sets sealed'))
        : (isRunningDay
            ? (isRunLogged ? 'Run logged • 12 Calisthenics sets remaining' : '2.5km Run & 12 Calisthenics sets')
            : 'Log Gym session or complete 12 Calisthenics sets'),
      domain: 'physical_sovereignty',
      category: 'movement',
      isCompleted: isMovementCovenantDone,
      onToggle: () => setActiveNavTab('movement'),
    },
    {
      id: 'satiety',
      title: 'Mindful Satiety (Hara Hachi Bu)',
      subtitle: appState.integrity.fullnessLogs.length > 0 ? `${appState.integrity.fullnessLogs.length} meal(s) audited` : 'Stop at 80% fullness',
      domain: 'physical_sovereignty',
      category: 'nutrition',
      isCompleted: appState.integrity.fullnessLogs.length >= 2,
      onToggle: () => setActiveMealModal({ meal: 'Lunch', rating: 3 }),
    },
    {
      id: 'focus',
      title: '90m Deep Work Session',
      subtitle: totalFocusMinutesToday > 0 ? `${totalFocusMinutesToday} mins recorded` : 'Quant Bot / Multivariable Calc',
      domain: 'craft_sanctuary',
      category: 'focus',
      isCompleted: totalFocusMinutesToday >= 90,
      onToggle: () => setActiveNavTab('focus'),
    },
    {
      id: 'guitar',
      title: '15m Acoustic Guitar Anchor',
      subtitle: appState.sanctuary.guitarMinutesToday >= 15 ? `${appState.sanctuary.guitarMinutesToday}m logged • Decompressed` : 'Non-screen tactile acoustic play',
      domain: 'craft_sanctuary',
      category: 'creative',
      isCompleted: appState.sanctuary.guitarMinutesToday >= 15,
      onToggle: () => handleLogGuitar(15),
    },
    {
      id: 'journal',
      title: 'Evening Micro-Reflection',
      subtitle: appState.sanctuary.microJournalWins ? 'Wins & friction sealed' : '60s wins, friction & tomorrow anchor',
      domain: 'craft_sanctuary',
      category: 'spiritual',
      isCompleted: Boolean(appState.sanctuary.microJournalWins),
      onToggle: () => setActiveNavTab('today'),
    },
  ];

  const completedCovenantCount = todayChecklistItems.filter(i => i.isCompleted).length;
  const totalCovenantCount = todayChecklistItems.length;
  const todayCovenantPercent = Math.round((completedCovenantCount / totalCovenantCount) * 100);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyTransactions = appState.transactions.filter(t => new Date(t.timestamp) >= sevenDaysAgo);
  const weeklyTotalSpent = weeklyTransactions.reduce((acc, t) => acc + t.amount, 0);
  const weeklyFocusBlocks = appState.focusBlocks.filter(b => new Date(b.timestamp) >= sevenDaysAgo);
  const weeklyFocusMinutes = weeklyFocusBlocks.reduce((acc, b) => acc + b.durationMinutes, 0);

  const prevMetric = appState.bodyMetricsHistory.length > 1 ? appState.bodyMetricsHistory[1] : null;
  const weightDelta = prevMetric ? (appState.bodyWeightKg - prevMetric.weightKg).toFixed(1) : null;
  const waistDelta = prevMetric ? (appState.waistCircumferenceCm - prevMetric.waistCm).toFixed(1) : null;
  const tummyDelta = prevMetric ? (appState.tummyCircumferenceCm - prevMetric.tummyCm).toFixed(1) : null;
  const currentPhaseMeta = PHASE_META[activePhase] || PHASE_META.MORNING_RITUAL;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <ExpoStatusBar style="dark" />

        <View style={styles.canvasBackground}>
          {/* Top Airy Header */}
          <Header
            currentDate={appState.currentDate}
            dayPhase={activePhase}
            isPreviewing={previewPhase !== null}
            onResetLive={() => setPreviewPhase(null)}
            waterMl={appState.integrity.waterMl}
            waterGoalMl={appState.integrity.waterGoalMl}
            purityDays={appState.integrity.purityStreakDays}
            urgeDivertedCount={appState.integrity.urgeDivertedCount}
            controlledSatietyDays={appState.integrity.consecutiveControlledSatietyDays}
            fastingUnlocked={appState.integrity.fastingModeUnlocked}
            todaySpent={todaySpent}
            onOpenSpend={() => setShowSpendModal(true)}
            onOpenBodyMetrics={() => setShowBodyModal(true)}
            onOpenSettings={() => setShowSettingsModal(true)}
          />

          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 80 : 100 }
              ]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
            >
            {/* ======================================================== */}
            {/* TAB 1: TODAY (AIRY, COVENANT RING & CHECKLIST)           */}
            {/* ======================================================== */}
            {activeNavTab === 'today' && (
              <View style={styles.screenContainer}>
                {/* SUNDAY SABBATH AUDIT CARD */}
                {isSunday && (
                  <TouchableOpacity
                    style={[
                      styles.sundayCard,
                      !hasLoggedMetricsToday ? styles.sundayCardPending : styles.sundayCardDone
                    ]}
                    onPress={() => {
                      safeHaptics.medium();
                      setShowBodyModal(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cardHeaderRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons 
                          name={hasLoggedMetricsToday ? "checkmark-circle" : "scale-outline"} 
                          size={18} 
                          color={hasLoggedMetricsToday ? Colors.primary : Colors.amber} 
                        />
                        <Text style={[
                          styles.sundayTitle, 
                          { color: hasLoggedMetricsToday ? Colors.primary : Colors.amber }
                        ]}>
                          {hasLoggedMetricsToday 
                            ? 'Sunday Sabbath Audit Logged' 
                            : 'Sunday Body Metrics Audit Due'}
                        </Text>
                      </View>
                      <Text style={styles.cardActionLink}>
                        {hasLoggedMetricsToday ? 'Review' : 'Record Now ➔'}
                      </Text>
                    </View>

                    <Text style={styles.cardDescriptionText}>
                      {hasLoggedMetricsToday
                        ? `Logged: ${appState.bodyWeightKg}kg • ${appState.waistCircumferenceCm}cm waist • ${appState.tummyCircumferenceCm}cm tummy • Ankle Level ${appState.anklePainRating}.`
                        : 'Measure weight, waist (cm), tummy (cm), and rate your left ankle strain to verify 7-day progress.'}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* HERO COVENANT & CURRENT FOCUS RING (ENLARGED 240PX HUB) */}
                <CovenantRing
                  currentPhaseTitle={currentPhaseMeta.title}
                  currentPhaseSubtitle={currentPhaseMeta.subtitle}
                  currentPhaseIcon={currentPhaseMeta.icon}
                  purityStreakDays={appState.integrity.purityStreakDays}
                  completionPercent={todayCovenantPercent}
                  completedCount={completedCovenantCount}
                  totalCount={totalCovenantCount}
                  onPressStreak={() => setActiveNavTab('vault')}
                  onPressAction={() => {
                    if (activePhase.startsWith('DEEP_WORK')) setActiveNavTab('focus');
                    else if (activePhase === 'MORNING_RITUAL') setActiveNavTab('movement');
                    else if (activePhase === 'EVENING_SANCTUARY') setActiveNavTab('vault');
                  }}
                />

                {/* 3 QUICK METRIC CARDS (PEACH / MINT / HONEY) */}
                <QuickMetricsCards
                  waterMl={appState.integrity.waterMl}
                  waterGoalMl={appState.integrity.waterGoalMl}
                  onAddWater={handleAddWater}
                  movementSetsDone={setsDoneCount}
                  movementTotalSets={totalSetsTarget}
                  isMovementDone={isMovementCovenantDone}
                  movementLabel={
                    isGymLogged 
                      ? `${appState.workout.gymLog?.split || 'Gym'} (${appState.workout.gymLog?.durationMinutes || 45}m)`
                      : (isRunningDay
                          ? (isRunLogged ? `2.5km Run • ${setsDoneCount}/12` : `${setsDoneCount}/12 sets`)
                          : `${setsDoneCount}/12 sets`)
                  }
                  movementSubtitle={
                    isMovementCovenantDone
                      ? 'Conquered ✓'
                      : (isRunningDay ? 'Run & Sets ➔' : (appState.settings?.nonRunDayPreference === 'gym' ? 'Gym Focus ➔' : 'Movement ➔'))
                  }
                  onOpenMovement={() => setActiveNavTab('movement')}
                  focusMinutesToday={totalFocusMinutesToday}
                  focusGoalMinutes={appState.settings?.deepWorkGoalMinutes || 90}
                  onOpenFocus={() => setActiveNavTab('focus')}
                />

                {/* TODAY'S CHECKLIST (IMAGE 3 INSPIRED) */}
                <TodayChecklist items={todayChecklistItems} />

                {/* UNIFIED TACTILE QUICK ACTION DOCK */}
                <View style={styles.dockWrapper}>
                  <Text style={styles.sectionHeaderLabel}>QUICK CAPTURE</Text>
                  <View style={styles.dockRow}>
                    {/* +500ml Water */}
                    <TouchableOpacity 
                      style={styles.dockButton}
                      onPress={() => {
                        safeHaptics.medium();
                        handleAddWater(500);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="water-outline" size={17} color={Colors.textPrimary} />
                      <Text style={styles.dockButtonText}>+500ml Water</Text>
                    </TouchableOpacity>

                    {/* Urge Defeater */}
                    <TouchableOpacity 
                      style={styles.dockButton}
                      onPress={() => {
                        safeHaptics.warning();
                        setShowUrgeModal(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="flash-outline" size={17} color={Colors.ruby} />
                      <Text style={[styles.dockButtonText, { color: Colors.ruby }]}>Urge Defeater</Text>
                    </TouchableOpacity>

                    {/* Quick Spend */}
                    <TouchableOpacity 
                      style={styles.dockButton}
                      onPress={() => {
                        safeHaptics.medium();
                        setShowSpendModal(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.dockButtonText, { fontWeight: '700' }]}>₦</Text>
                      <Text style={styles.dockButtonText}>Log Spend</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* ======================================================== */}
            {/* TAB 2: MOVEMENT (2.5KM RUN & KAIZEN OVERLOAD ENGINE)     */}
            {/* ======================================================== */}
            {activeNavTab === 'movement' && (
              <View style={styles.screenContainer}>
                {/* Movement Section Header */}
                <View style={styles.tabBannerHeader}>
                  <View>
                    <Text style={styles.tabBannerTitle}>KAIZEN MOVEMENT</Text>
                    <Text style={styles.tabBannerSubtitle}>
                      {isRunningDay 
                        ? 'Run Day: 2.5km Aerobic Base + Calisthenics' 
                        : (appState.settings?.nonRunDayPreference === 'gym' 
                            ? 'Gym Day: Strength Training & Muscle Progression' 
                            : 'Non-Run Day: Gym or Calisthenics & Ankle Prehab')}
                    </Text>
                  </View>
                  <View style={styles.statusChip}>
                    <Text style={styles.statusChipText}>Ankle Strain: {appState.anklePainRating}/10</Text>
                  </View>
                </View>

                {/* Dynamic Movement Dock: Non-Run Day spotlights Gym first; Run Day spotlights Running first */}
                {!isRunningDay ? (
                  <>
                    {/* Gym Workout Card (Hero Spotlight on Non-Run Day) */}
                    <GymWorkoutCard
                      gymLog={appState.workout.gymLog}
                      lastGymLog={lastGymLog}
                      onSaveGym={handleSaveGymLog}
                    />

                    {/* Calisthenics Progression Card */}
                    <WorkoutCard
                      workout={appState.workout}
                      overloadConfig={appState.overloadConfig}
                      onToggleSet={handleToggleSet}
                      onAcceptOverload={handleAcceptOverload}
                      onUpdateRpe={handleUpdateWorkoutRpe}
                      onUpdateExerciseDifficulty={handleUpdateExerciseDifficulty}
                    />

                    {/* Running Tracker Card */}
                    <RunningCard
                      runLog={appState.workout.runLog}
                      defaultDistance={2.5}
                      onSaveRun={handleSaveRun}
                    />
                  </>
                ) : (
                  <>
                    {/* Running Tracker Card (Hero Spotlight on Run Day) */}
                    <RunningCard
                      runLog={appState.workout.runLog}
                      defaultDistance={2.5}
                      onSaveRun={handleSaveRun}
                    />

                    {/* Calisthenics Progression Card */}
                    <WorkoutCard
                      workout={appState.workout}
                      overloadConfig={appState.overloadConfig}
                      onToggleSet={handleToggleSet}
                      onAcceptOverload={handleAcceptOverload}
                      onUpdateRpe={handleUpdateWorkoutRpe}
                      onUpdateExerciseDifficulty={handleUpdateExerciseDifficulty}
                    />

                    {/* Gym Workout Card (Bonus / Dual Session on Run Day) */}
                    <GymWorkoutCard
                      gymLog={appState.workout.gymLog}
                      lastGymLog={lastGymLog}
                      onSaveGym={handleSaveGymLog}
                    />
                  </>
                )}
              </View>
            )}

            {/* ======================================================== */}
            {/* TAB 3: FOCUS (DEEP WORK 90M COMPRESSIONS & SCHEDULE)     */}
            {/* ======================================================== */}
            {activeNavTab === 'focus' && (
              <View style={styles.screenContainer}>
                <View style={styles.tabBannerHeader}>
                  <View>
                    <Text style={styles.tabBannerTitle}>DEEP WORK COMPRESSIONS</Text>
                    <Text style={styles.tabBannerSubtitle}>90-Minute Hard-Cap Engine & 15m Mandatory Cooldowns</Text>
                  </View>
                </View>

                {/* Massive 318px Focus Dial with 24-Hour Rhythm Timeline Grid */}
                <FocusTimerCard
                  currentPhase={dayPhase}
                  onSelectPhase={(phase) => setDayPhase(phase)}
                  onCompleteBlock={handleCompleteFocusBlock}
                  activeFocusSession={appState.activeFocusSession}
                  onUpdateFocusSession={handleUpdateFocusSession}
                />

                {/* Today's Completed Sessions History */}
                {appState.focusBlocks.length > 0 && (
                  <View style={styles.contentCard}>
                    <Text style={styles.subCardHeader}>TODAY'S COMPLETED SESSIONS</Text>
                    {appState.focusBlocks.map(block => (
                      <View key={block.id} style={styles.historyListRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                          <Text style={styles.historyItemTitle}>{block.project}</Text>
                        </View>
                        <Text style={styles.historyItemMeta}>{block.durationMinutes} mins</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* ======================================================== */}
            {/* TAB 4: VAULT (INNER SANCTUM / VIRTUES & INTEGRITY)       */}
            {/* ======================================================== */}
            {activeNavTab === 'vault' && (
              <View style={styles.screenContainer}>
                <View style={styles.tabBannerHeader}>
                  <View>
                    <Text style={styles.tabBannerTitle}>THE VAULT</Text>
                    <Text style={styles.tabBannerSubtitle}>Inner Sanctum: Spiritual Anchor, Purity & Satiety</Text>
                  </View>
                </View>

                {/* 4 Clean Sanctuary Portals with Dedicated Slide-Up Popouts */}
                <VaultPortals
                  integrity={appState.integrity}
                  spiritual={appState.spiritual}
                  sanctuary={appState.sanctuary}
                  onToggleSpiritual={handleToggleSpiritual}
                  onAddWater={handleAddWater}
                  onOpenMealModal={(meal, rating) => setActiveMealModal({ meal, rating })}
                  onOpenUrgeDefeater={() => setShowUrgeModal(true)}
                  onOpenRelapseModal={() => setShowRelapseModal(true)}
                  onLogGuitar={handleLogGuitar}
                  onLogReading={handleLogReading}
                  onLogWriting={handleLogWriting}
                  onSaveJournal={handleSaveJournal}
                />
              </View>
            )}

            {/* ======================================================== */}
            {/* TAB 5: STATS (THE QUANTIFIED SELF / METRICS & LEDGER)    */}
            {/* ======================================================== */}
            {activeNavTab === 'stats' && (
              <View style={styles.screenContainer}>
                <View style={styles.tabBannerHeader}>
                  <View>
                    <Text style={styles.tabBannerTitle}>QUANTIFIED SELF & MIRROR</Text>
                    <Text style={styles.tabBannerSubtitle}>Calendar, 10-Pillar Compliance & Behavioral Correlations</Text>
                  </View>
                </View>

                {/* Advanced Quantified Self & Accountability Dashboard */}
                <StatsDashboard
                  appState={appState}
                  onOpenSpendModal={() => setShowSpendModal(true)}
                  onOpenBodyModal={() => setShowBodyModal(true)}
                />
              </View>
            )}

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* 5-Tab Native Navigation Bar - hidden when typing on mobile to maximize viewport */}
          {keyboardHeight === 0 && (
            <BottomNavBar
              activeTab={activeNavTab}
              onSelectTab={setActiveNavTab}
              showSundayBadge={isSunday && !hasLoggedMetricsToday}
            />
          )}
        </KeyboardAvoidingView>
      </View>

        {/* Global Modals */}
        <QuickSpendModal
          visible={showSpendModal}
          transactions={appState.transactions}
          onSave={handleQuickSpend}
          onDelete={handleDeleteSpend}
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

        <SettingsModal
          visible={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          settings={appState.settings}
          overloadConfig={appState.overloadConfig}
          onSaveSettings={handleSaveSettings}
          onSaveKaizenTargets={handleSaveKaizenTargets}
        />

        <ScholarshipOutreachModal
          visible={showScholarshipModal}
          onSave={handleSaveScholarshipOutreach}
          onClose={() => setShowScholarshipModal(false)}
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
  textureOverlay: {
    opacity: 0.25,
  },
  satietyExpansiveCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  satietyIconPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardSubhead: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 1,
  },
  goldenZonePill: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  goldenZoneText: {
    ...Typography.micro,
    color: Colors.primary,
    fontWeight: '700',
  },
  spectrumContainer: {
    marginTop: 14,
    backgroundColor: Colors.surfaceHighlight,
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  spectrumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 6,
  },
  spectrumItem: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  spectrumItemGolden: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  spectrumNumber: {
    ...Typography.title3,
    color: Colors.textSecondary,
  },
  spectrumNumberGolden: {
    color: Colors.primary,
    fontWeight: '700',
  },
  spectrumLabel: {
    ...Typography.micro,
    fontSize: 8,
    marginTop: 2,
    color: Colors.textMuted,
  },
  spectrumLabelGolden: {
    color: Colors.primary,
    fontWeight: '700',
  },
  mealsMatrixContainer: {
    marginTop: 14,
  },
  mealsList: {
    gap: 6,
    marginTop: 6,
  },
  mealAuditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mealRowName: {
    ...Typography.callout,
    fontWeight: '600',
  },
  mealRowDesc: {
    ...Typography.caption,
    maxWidth: 130,
  },
  loggedRatingPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  loggedRatingTeal: {
    backgroundColor: Colors.primaryMuted,
  },
  loggedRatingRuby: {
    backgroundColor: Colors.rubyMuted,
  },
  loggedRatingText: {
    ...Typography.micro,
    fontWeight: '700',
  },
  loggedTextTeal: {
    color: Colors.primary,
  },
  loggedTextRuby: {
    color: Colors.ruby,
  },
  unloggedActionText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  fastingProgressBox: {
    marginTop: 14,
    backgroundColor: Colors.surfaceHighlight,
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fastingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fastingTitle: {
    ...Typography.micro,
    color: Colors.primary,
  },
  fastingCount: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primary,
  },
  fastingProgressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  fastingProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  fastingHint: {
    ...Typography.caption,
    fontSize: 11,
    lineHeight: 15,
  },
  neuroscienceTipBox: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.primaryMuted,
    padding: 10,
    borderRadius: BorderRadius.sm,
  },
  neuroscienceTipText: {
    ...Typography.caption,
    color: Colors.primary,
    flex: 1,
    lineHeight: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    ...Typography.title2,
    letterSpacing: 1.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16, // Golden 16px measure
    paddingTop: 16,
  },
  screenContainer: {
    gap: 12,
  },
  rhythmSection: {
    marginBottom: 10,
  },
  rhythmHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  rhythmSectionTitle: {
    ...Typography.micro,
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  liveClockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  liveClockBadgeText: {
    ...Typography.micro,
    color: Colors.primary,
    fontSize: 9,
    fontWeight: '700',
  },
  previewActiveBadge: {
    backgroundColor: Colors.amberMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  previewActiveBadgeText: {
    ...Typography.micro,
    color: Colors.amber,
    fontSize: 9,
    fontWeight: '700',
  },
  returnToLiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  returnToLiveText: {
    ...Typography.micro,
    color: Colors.primary,
    fontWeight: '600',
  },
  rhythmScrollContent: {
    gap: 8,
    paddingVertical: 2,
  },
  rhythmPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 84,
  },
  rhythmPillSelected: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  rhythmPillLiveBorder: {
    borderColor: Colors.borderFocus,
  },
  rhythmPillTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  rhythmPillTime: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 10,
  },
  rhythmPillTimeSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  liveSmallDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
    marginLeft: 'auto',
  },
  rhythmPillName: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  rhythmPillNameSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  previewSubhint: {
    ...Typography.micro,
    color: Colors.primary,
    fontWeight: '600',
  },
  sectionHeaderLabel: {
    ...Typography.micro,
    color: Colors.textMuted,
    marginBottom: 6,
    marginLeft: 2,
  },
  heroWrapper: {
    marginBottom: 4,
  },
  contentCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contentCardTitle: {
    ...Typography.title2,
  },
  cardSubBadge: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  cardActionLink: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  cardDescriptionText: {
    ...Typography.body,
    lineHeight: 20,
  },
  sundayCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1.5,
    ...Shadows.card,
  },
  sundayCardPending: {
    borderColor: Colors.amber,
  },
  sundayCardDone: {
    borderColor: Colors.primary,
  },
  sundayTitle: {
    ...Typography.title3,
  },
  movementPromptCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
    ...Shadows.soft,
  },
  promptIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptCardTitle: {
    ...Typography.callout,
    fontWeight: '600',
  },
  promptCardDesc: {
    ...Typography.caption,
    marginTop: 2,
  },
  primaryActionButton: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    ...Shadows.soft,
  },
  primaryActionText: {
    ...Typography.callout,
    color: '#ffffff',
    fontWeight: '600',
  },
  outlineActionButton: {
    marginTop: 10,
    backgroundColor: Colors.surfaceHighlight,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  outlineActionText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  quietAnchorBox: {
    marginTop: 14,
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quietAnchorLabel: {
    ...Typography.micro,
  },
  quietAnchorValue: {
    ...Typography.callout,
    color: Colors.primary,
    marginTop: 2,
  },
  dockWrapper: {
    marginTop: 6,
  },
  dockRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dockButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  dockButtonText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  tabBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  tabBannerTitle: {
    ...Typography.title3,
    letterSpacing: 0.5,
  },
  tabBannerSubtitle: {
    ...Typography.caption,
    marginTop: 1,
  },
  statusChip: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusChipText: {
    ...Typography.micro,
    color: Colors.amber,
  },
  subCardHeader: {
    ...Typography.micro,
    marginBottom: 6,
  },
  historyListRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyItemTitle: {
    ...Typography.callout,
  },
  historyItemMeta: {
    ...Typography.caption,
    fontWeight: '600',
  },
  statsSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 10,
  },
  statMetricItem: {
    flex: 1,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.sm,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statMetricValue: {
    ...Typography.title3,
  },
  statMetricLabel: {
    ...Typography.micro,
    marginTop: 2,
  },
  ledgerList: {
    gap: 6,
    marginVertical: 8,
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ledgerCategory: {
    ...Typography.callout,
    fontSize: 13,
  },
  ledgerTime: {
    ...Typography.caption,
  },
  ledgerAmount: {
    ...Typography.callout,
    fontWeight: '600',
  },
  statsSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    padding: 3,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 4,
  },
  statsSegmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
  },
  statsSegmentButtonActive: {
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  statsSegmentText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  statsSegmentTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  rundownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  rundownGridItem: {
    width: '48%',
    backgroundColor: Colors.surfaceHighlight,
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  rundownItemLabel: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  rundownItemValue: {
    ...Typography.title2,
    fontSize: 16,
    color: Colors.textPrimary,
    marginTop: 4,
    marginBottom: 2,
  },
  rundownItemSub: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 10,
  },
  weeklyDisciplineRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  disciplineStatBox: {
    flex: 1,
    backgroundColor: Colors.surfaceHighlight,
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
  },
  disciplineValue: {
    ...Typography.title2,
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '700',
  },
  disciplineLabel: {
    ...Typography.micro,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  deltaText: {
    ...Typography.micro,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  deltaGood: {
    color: Colors.primary,
  },
  deltaWarn: {
    color: Colors.amber,
  },
  deltaNeutral: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
});
