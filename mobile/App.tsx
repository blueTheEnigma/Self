import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  ActivityIndicator, 
  Text, 
  TouchableOpacity,
  ImageBackground 
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from './src/theme/colors';
import { Typography } from './src/theme/typography';
import { SelfAppState, DayPhase } from './src/types';
import { 
  storage, 
  getCurrentDayPhase,
  isRunDay 
} from './src/services/storage';
import { notificationService } from './src/services/notifications';
import { Header } from './src/components/Header';
import { BottomNavBar, NavTabId } from './src/components/BottomNavBar';
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
  const [statsViewMode, setStatsViewMode] = useState<'daily' | 'weekly'>('daily');

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

  const handleDeleteSpend = async (id: string) => {
    const updated = await storage.deleteTransaction(id);
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

  // Sunday & Expense calculations
  const isSunday = new Date().getDay() === 0;
  const hasLoggedMetricsToday = appState.bodyMetricsHistory.some(m => m.date === appState.currentDate);
  const todayStr = appState.currentDate;
  const todayTransactions = appState.transactions.filter(t => t.timestamp.startsWith(todayStr));
  const todaySpent = todayTransactions.reduce((acc, t) => acc + t.amount, 0);
  const isRunningDay = isRunDay();

  // Executive Daily & Weekly Calculations
  const totalFocusMinutesToday = appState.focusBlocks.reduce((acc, b) => acc + b.durationMinutes, 0);
  const setsDoneCount = appState.workout.exercises.reduce((acc, ex) => acc + ex.completedSets.filter(s => s > 0).length, 0);
  const totalSetsTarget = appState.workout.exercises.length * 3;
  const waterPercent = Math.min(Math.round((appState.integrity.waterMl / appState.integrity.waterGoalMl) * 100), 100);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyTransactions = appState.transactions.filter(t => new Date(t.timestamp) >= sevenDaysAgo);
  const weeklyTotalSpent = weeklyTransactions.reduce((acc, t) => acc + t.amount, 0);
  const weeklyFocusBlocks = appState.focusBlocks.filter(b => new Date(b.timestamp) >= sevenDaysAgo);
  const weeklyFocusMinutes = weeklyFocusBlocks.reduce((acc, b) => acc + b.durationMinutes, 0);

  const prevMetric = appState.bodyMetricsHistory.length > 1 ? appState.bodyMetricsHistory[1] : null;
  const weightDelta = prevMetric ? (appState.bodyWeightKg - prevMetric.weightKg).toFixed(1) : null;
  const waistDelta = prevMetric ? (appState.waistCircumferenceCm - prevMetric.waistCm).toFixed(1) : null;
  const tummyDelta = prevMetric ? (appState.tummyCircumferenceCm - prevMetric.tummyCm).toFixed(1) : null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <ExpoStatusBar style="dark" />

        <ImageBackground
          source={require('./assets/texture.jpg')}
          style={styles.canvasBackground}
          imageStyle={styles.textureOverlay}
          resizeMode="repeat"
        >
          {/* Top Clean Monochromatic Header */}
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
          />

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ======================================================== */}
            {/* TAB 1: TODAY (PROPORTIONED, NO SLIM BOX, NO RAINBOW)     */}
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

                {/* 24-HOUR RHYTHM STRIP (INTERACTIVE & VISIBLE DAY TRANSITION) */}
                <View style={styles.rhythmSection}>
                  <View style={styles.rhythmHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="time-outline" size={13} color={Colors.primary} />
                      <Text style={styles.rhythmSectionTitle}>24-HOUR RHYTHM</Text>
                      {previewPhase ? (
                        <View style={styles.previewActiveBadge}>
                          <Text style={styles.previewActiveBadgeText}>Previewing</Text>
                        </View>
                      ) : (
                        <View style={styles.liveClockBadge}>
                          <View style={styles.livePulseDot} />
                          <Text style={styles.liveClockBadgeText}>Live Clock</Text>
                        </View>
                      )}
                    </View>

                    {previewPhase && (
                      <TouchableOpacity 
                        style={styles.returnToLiveButton}
                        onPress={() => {
                          safeHaptics.light();
                          setPreviewPhase(null);
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="refresh-outline" size={12} color={Colors.primary} />
                        <Text style={styles.returnToLiveText}>Return to Live</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.rhythmScrollContent}
                  >
                    {RHYTHM_BLOCKS.map(block => {
                      const isLive = dayPhase === block.id;
                      const isSelected = activePhase === block.id;
                      return (
                        <TouchableOpacity
                          key={block.id}
                          style={[
                            styles.rhythmPill,
                            isSelected && styles.rhythmPillSelected,
                            isLive && !isSelected && styles.rhythmPillLiveBorder,
                          ]}
                          onPress={() => {
                            safeHaptics.light();
                            setPreviewPhase(block.id === dayPhase ? null : block.id);
                          }}
                          activeOpacity={0.75}
                        >
                          <View style={styles.rhythmPillTop}>
                            <Ionicons 
                              name={block.icon} 
                              size={12} 
                              color={isSelected ? Colors.primary : Colors.textMuted} 
                            />
                            <Text style={[
                              styles.rhythmPillTime,
                              isSelected && styles.rhythmPillTimeSelected
                            ]}>
                              {block.time}
                            </Text>
                            {isLive && <View style={styles.liveSmallDot} />}
                          </View>
                          <Text style={[
                            styles.rhythmPillName,
                            isSelected && styles.rhythmPillNameSelected
                          ]}>
                            {block.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* CURRENT FOCUS HERO CARD (COMFORTABLE FULL WIDTH) */}
                <View style={styles.heroWrapper}>
                  <View style={styles.heroHeaderRow}>
                    <Text style={styles.sectionHeaderLabel}>CURRENT FOCUS</Text>
                    {previewPhase && (
                      <TouchableOpacity 
                        onPress={() => {
                          safeHaptics.light();
                          setPreviewPhase(null);
                        }}
                      >
                        <Text style={styles.previewSubhint}>• Preview active (Tap to return)</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* 1. Morning Ritual Active Phase */}
                  {activePhase === 'MORNING_RITUAL' && (
                    <View>
                      <SpiritualAnchorCard
                        spiritual={appState.spiritual}
                        onToggle={handleToggleSpiritual}
                      />

                      {/* Movement Hub Transition Prompt */}
                      <TouchableOpacity 
                        style={styles.movementPromptCard}
                        onPress={() => {
                          safeHaptics.light();
                          setActiveNavTab('movement');
                        }}
                        activeOpacity={0.8}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <View style={styles.promptIconCircle}>
                            <Ionicons name="barbell-outline" size={20} color={Colors.primary} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.promptCardTitle}>
                              {isRunningDay ? '2.5km Run & Calisthenics' : 'Active Recovery & Ankle Prehab'}
                            </Text>
                            <Text style={styles.promptCardDesc}>
                              Open Movement Hub to log sets, rest timer & form guides ➔
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* 2. Deep Work Active Phase */}
                  {(activePhase === 'DEEP_WORK_1' || activePhase === 'DEEP_WORK_2' || activePhase === 'DEEP_WORK_3') && (
                    <FocusTimerCard
                      onCompleteBlock={handleCompleteFocusBlock}
                    />
                  )}

                  {/* 3. Midday / Afternoon Buffer & Satiety Expansive Hero */}
                  {(activePhase === 'MIDDAY_BUFFER' || activePhase === 'AFTERNOON_BUFFER') && (
                    <View style={styles.satietyExpansiveCard}>
                      {/* Top Header */}
                      <View style={styles.cardHeaderRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <View style={styles.satietyIconPill}>
                            <Ionicons name="restaurant-outline" size={18} color={Colors.primary} />
                          </View>
                          <View>
                            <Text style={styles.contentCardTitle}>Mindful Satiety & Temperance</Text>
                            <Text style={styles.cardSubhead}>80% Fullness Gauge (Hara Hachi Bu)</Text>
                          </View>
                        </View>
                        <View style={styles.goldenZonePill}>
                          <Text style={styles.goldenZoneText}>Zone: Level 3</Text>
                        </View>
                      </View>

                      {/* 1–5 Visual Fullness Spectrum */}
                      <View style={styles.spectrumContainer}>
                        <Text style={styles.subCardHeader}>HOW FULL DO YOU FEEL RIGHT NOW?</Text>
                        <View style={styles.spectrumRow}>
                          {[
                            { level: 1, label: 'Empty' },
                            { level: 2, label: 'Light' },
                            { level: 3, label: '80% Full', golden: true },
                            { level: 4, label: 'Stuffed' },
                            { level: 5, label: 'Overfull' },
                          ].map(item => (
                            <TouchableOpacity
                              key={item.level}
                              style={[
                                styles.spectrumItem,
                                item.golden && styles.spectrumItemGolden,
                              ]}
                              onPress={() => {
                                safeHaptics.light();
                                setActiveMealModal({
                                  meal: activePhase === 'MIDDAY_BUFFER' ? 'Breakfast' : (activePhase === 'AFTERNOON_BUFFER' ? 'Lunch' : 'Dinner'),
                                  rating: item.level,
                                });
                              }}
                              activeOpacity={0.7}
                            >
                              <Text style={[
                                styles.spectrumNumber,
                                item.golden && styles.spectrumNumberGolden,
                              ]}>
                                {item.level}
                              </Text>
                              <Text style={[
                                styles.spectrumLabel,
                                item.golden && styles.spectrumLabelGolden,
                              ]}>
                                {item.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>

                      {/* Today's Meals Audit Matrix */}
                      <View style={styles.mealsMatrixContainer}>
                        <Text style={styles.subCardHeader}>TODAY'S MEAL AUDIT</Text>
                        <View style={styles.mealsList}>
                          {(['Breakfast', 'Lunch', 'Dinner'] as const).map(meal => {
                            const log = appState.integrity.fullnessLogs.find(l => l.meal === meal);
                            return (
                              <TouchableOpacity
                                key={meal}
                                style={styles.mealAuditRow}
                                onPress={() => {
                                  safeHaptics.light();
                                  setActiveMealModal({
                                    meal,
                                    rating: log ? log.rating : 3,
                                  });
                                }}
                                activeOpacity={0.7}
                              >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                  <Ionicons 
                                    name={log ? "checkmark-circle" : "ellipse-outline"} 
                                    size={16} 
                                    color={log ? (log.rating <= 3 ? Colors.primary : Colors.ruby) : Colors.textMuted} 
                                  />
                                  <Text style={styles.mealRowName}>{meal}</Text>
                                  {log?.description ? (
                                    <Text style={styles.mealRowDesc} numberOfLines={1}>
                                      • {log.description}
                                    </Text>
                                  ) : null}
                                </View>

                                {log ? (
                                  <View style={[
                                    styles.loggedRatingPill,
                                    log.rating <= 3 ? styles.loggedRatingTeal : styles.loggedRatingRuby
                                  ]}>
                                    <Text style={[
                                      styles.loggedRatingText,
                                      log.rating <= 3 ? styles.loggedTextTeal : styles.loggedTextRuby
                                    ]}>
                                      Level {log.rating} {log.rating === 3 ? '✓ 80%' : (log.rating < 3 ? 'Light' : 'Over')}
                                    </Text>
                                  </View>
                                ) : (
                                  <Text style={styles.unloggedActionText}>+ Rate Meal</Text>
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>

                      {/* Fasting Unlock Progress Bar */}
                      <View style={styles.fastingProgressBox}>
                        <View style={styles.fastingHeader}>
                          <Text style={styles.fastingTitle}>
                            {appState.integrity.fastingModeUnlocked 
                              ? '🎉 INTERMITTENT FASTING UNLOCKED' 
                              : 'INTERMITTENT FASTING MILESTONE'}
                          </Text>
                          <Text style={styles.fastingCount}>
                            {appState.integrity.consecutiveControlledSatietyDays} / 14 Days
                          </Text>
                        </View>
                        <View style={styles.fastingProgressBar}>
                          <View 
                            style={[
                              styles.fastingProgressFill, 
                              { width: `${Math.min((appState.integrity.consecutiveControlledSatietyDays / 14) * 100, 100)}%` }
                            ]} 
                          />
                        </View>
                        <Text style={styles.fastingHint}>
                          Maintain satiety at Level 3 (80% Full) or below for 14 consecutive days to unlock Intermittent Fasting mode.
                        </Text>
                      </View>

                      {/* Mindful Eating Neuroscience Cue */}
                      <View style={styles.neuroscienceTipBox}>
                        <Ionicons name="bulb-outline" size={15} color={Colors.primary} />
                        <Text style={styles.neuroscienceTipText}>
                          <Text style={{ fontWeight: '600' }}>20-Minute Leptin Lag:</Text> Your brain requires 20 minutes from the first bite to register fullness. Put the fork down between bites, hydrate, and stop before stuffed.
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* 4. Evening Sanctuary */}
                  {activePhase === 'EVENING_SANCTUARY' && (
                    <EveningSanctuaryCard
                      sanctuary={appState.sanctuary}
                      onAddGuitarMinutes={handleAddGuitar}
                      onLogHobby={handleLogHobby}
                      onSaveJournal={handleSaveJournal}
                    />
                  )}

                  {/* 5. Night Rest / Life Buffer */}
                  {(activePhase === 'NIGHT_REST' || activePhase === 'LIFE_BUFFER') && (
                    <View style={styles.contentCard}>
                      <View style={{ alignItems: 'center', paddingVertical: Spacing.md }}>
                        <Ionicons name="moon-outline" size={28} color={Colors.primary} />
                        <Text style={[styles.contentCardTitle, { marginTop: Spacing.sm }]}>
                          {activePhase === 'NIGHT_REST' ? 'Sabbath Night Rest' : 'Guilt-Free Life Buffer'}
                        </Text>
                        <Text style={[styles.cardDescriptionText, { textAlign: 'center', marginTop: Spacing.xs }]}>
                          {activePhase === 'NIGHT_REST'
                            ? '7 hours of deep restorative sleep enables neuroplastic consolidation and tendon repair for your left ankle.'
                            : 'Open life buffer for errands, reflection, and quiet reading without guilt.'}
                        </Text>
                        <View style={styles.quietAnchorBox}>
                          <Text style={styles.quietAnchorLabel}>TOMORROW'S ANCHOR</Text>
                          <Text style={styles.quietAnchorValue}>{appState.sanctuary.tomorrowAnchor}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>

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
                      {isRunningDay ? 'Run Day: 2.5km + Home Calisthenics' : 'Recovery Day: Ankle Prehab & Stretches'}
                    </Text>
                  </View>
                  <View style={styles.statusChip}>
                    <Text style={styles.statusChipText}>Ankle Strain: {appState.anklePainRating}/5</Text>
                  </View>
                </View>

                {/* Workout Card */}
                <WorkoutCard
                  workout={appState.workout}
                  overloadConfig={appState.overloadConfig}
                  onToggleSet={handleToggleSet}
                  onAcceptOverload={handleAcceptOverload}
                  onOpenGuide={(guide) => setSelectedGuide(guide)}
                  onUpdateRpe={handleUpdateWorkoutRpe}
                />
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

                {/* 24-Hour Visual Schedule Strip */}
                <TimeBlocksBar
                  currentPhase={dayPhase}
                  onSelectBlock={(phase) => setDayPhase(phase)}
                />

                {/* 90-Minute Timer Card */}
                <FocusTimerCard
                  onCompleteBlock={handleCompleteFocusBlock}
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

                {/* 1. Integrity Card (Purity Shield, Battle Counter, Fall Reset) */}
                <IntegrityCard
                  integrity={appState.integrity}
                  onAddWater={handleAddWater}
                  onOpenMealModal={(meal, rating) => setActiveMealModal({ meal, rating })}
                  onOpenUrgeDefeater={() => setShowUrgeModal(true)}
                  onOpenRelapseModal={() => setShowRelapseModal(true)}
                />

                {/* 2. Morning Spiritual Grounding Card */}
                <SpiritualAnchorCard
                  spiritual={appState.spiritual}
                  onToggle={handleToggleSpiritual}
                />

                {/* 3. Evening Sanctuary (Guitar & Reflection) */}
                <EveningSanctuaryCard
                  sanctuary={appState.sanctuary}
                  onAddGuitarMinutes={handleAddGuitar}
                  onLogHobby={handleLogHobby}
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
                    <Text style={styles.tabBannerTitle}>STATS & MIRROR</Text>
                    <Text style={styles.tabBannerSubtitle}>Quantified Self: Daily Pulse & 7-Day Sabbath Review</Text>
                  </View>
                </View>

                {/* Segmented Daily / Weekly Selector */}
                <View style={styles.statsSegmentContainer}>
                  <TouchableOpacity
                    style={[
                      styles.statsSegmentButton,
                      statsViewMode === 'daily' && styles.statsSegmentButtonActive,
                    ]}
                    onPress={() => {
                      safeHaptics.light();
                      setStatsViewMode('daily');
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name="today-outline" 
                      size={15} 
                      color={statsViewMode === 'daily' ? Colors.primary : Colors.textMuted} 
                    />
                    <Text style={[
                      styles.statsSegmentText,
                      statsViewMode === 'daily' && styles.statsSegmentTextActive,
                    ]}>
                      Daily Rundown
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statsSegmentButton,
                      statsViewMode === 'weekly' && styles.statsSegmentButtonActive,
                    ]}
                    onPress={() => {
                      safeHaptics.light();
                      setStatsViewMode('weekly');
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name="calendar-outline" 
                      size={15} 
                      color={statsViewMode === 'weekly' ? Colors.primary : Colors.textMuted} 
                    />
                    <Text style={[
                      styles.statsSegmentText,
                      statsViewMode === 'weekly' && styles.statsSegmentTextActive,
                    ]}>
                      Weekly Review
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* VIEW 1: DAILY RUNDOWN */}
                {statsViewMode === 'daily' && (
                  <View style={{ gap: 12 }}>
                    {/* Executive Daily Matrix Card */}
                    <View style={styles.contentCard}>
                      <View style={styles.cardHeaderRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Ionicons name="flash-outline" size={18} color={Colors.primary} />
                          <Text style={styles.contentCardTitle}>Today's Executive Rundown</Text>
                        </View>
                        <View style={styles.goldenZonePill}>
                          <Text style={styles.goldenZoneText}>Live Pulse</Text>
                        </View>
                      </View>

                      {/* 6-Pillar Summary Grid */}
                      <View style={styles.rundownGrid}>
                        {/* 1. Hydration */}
                        <View style={styles.rundownGridItem}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name="water-outline" size={15} color={Colors.primary} />
                            <Text style={styles.rundownItemLabel}>Hydration</Text>
                          </View>
                          <Text style={styles.rundownItemValue}>{appState.integrity.waterMl} ml</Text>
                          <Text style={styles.rundownItemSub}>{waterPercent}% of 3L goal</Text>
                        </View>

                        {/* 2. Purity & Shield */}
                        <View style={styles.rundownGridItem}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name="shield-checkmark-outline" size={15} color={Colors.primary} />
                            <Text style={styles.rundownItemLabel}>Integrity</Text>
                          </View>
                          <Text style={styles.rundownItemValue}>Day {appState.integrity.purityStreakDays} Clean</Text>
                          <Text style={styles.rundownItemSub}>{appState.integrity.urgeDivertedCount} Urges Defeated</Text>
                        </View>

                        {/* 3. Satiety */}
                        <View style={styles.rundownGridItem}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name="restaurant-outline" size={15} color={Colors.primary} />
                            <Text style={styles.rundownItemLabel}>Satiety</Text>
                          </View>
                          <Text style={styles.rundownItemValue}>Zone 3 (80%)</Text>
                          <Text style={styles.rundownItemSub}>{appState.integrity.fullnessLogs.length}/3 Meals Audited</Text>
                        </View>

                        {/* 4. Deep Work */}
                        <View style={styles.rundownGridItem}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name="timer-outline" size={15} color={Colors.primary} />
                            <Text style={styles.rundownItemLabel}>Deep Focus</Text>
                          </View>
                          <Text style={styles.rundownItemValue}>{totalFocusMinutesToday} mins</Text>
                          <Text style={styles.rundownItemSub}>{appState.focusBlocks.length} Sessions Done</Text>
                        </View>

                        {/* 5. Movement */}
                        <View style={styles.rundownGridItem}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name="barbell-outline" size={15} color={Colors.primary} />
                            <Text style={styles.rundownItemLabel}>Movement</Text>
                          </View>
                          <Text style={styles.rundownItemValue}>
                            {appState.workout.completed ? 'Complete ✓' : `${setsDoneCount}/${totalSetsTarget} Sets`}
                          </Text>
                          <Text style={styles.rundownItemSub}>
                            {isRunningDay ? '2.5km Run Day' : 'Recovery & Prehab'}
                          </Text>
                        </View>

                        {/* 6. Sanctuary */}
                        <View style={styles.rundownGridItem}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Ionicons name="musical-notes-outline" size={15} color={Colors.primary} />
                            <Text style={styles.rundownItemLabel}>Sanctuary</Text>
                          </View>
                          <Text style={styles.rundownItemValue}>{appState.sanctuary.guitarMinutesToday} mins</Text>
                          <Text style={styles.rundownItemSub}>Acoustic Guitar</Text>
                        </View>
                      </View>
                    </View>

                    {/* Today's Expense Ledger */}
                    <View style={styles.contentCard}>
                      <View style={styles.cardHeaderRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Ionicons name="wallet-outline" size={18} color={Colors.primary} />
                          <Text style={styles.contentCardTitle}>Today's Expense Ledger</Text>
                        </View>
                        <Text style={[styles.contentCardTitle, { color: Colors.primary }]}>
                          ₦{todaySpent.toLocaleString()}
                        </Text>
                      </View>

                      {todayTransactions.length === 0 ? (
                        <Text style={[styles.cardDescriptionText, { fontStyle: 'italic', marginVertical: Spacing.sm }]}>
                          No expenses recorded yet today.
                        </Text>
                      ) : (
                        <View style={styles.ledgerList}>
                          {todayTransactions.map(tx => {
                            const timeStr = new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            return (
                              <View key={tx.id} style={styles.ledgerRow}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                  <Text style={styles.ledgerCategory}>{tx.category}</Text>
                                  <Text style={styles.ledgerTime}>{timeStr}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                  <Text style={styles.ledgerAmount}>₦{tx.amount.toLocaleString()}</Text>
                                  <TouchableOpacity 
                                    onPress={() => {
                                      safeHaptics.warning();
                                      handleDeleteSpend(tx.id);
                                    }}
                                  >
                                    <Ionicons name="trash-outline" size={15} color={Colors.ruby} />
                                  </TouchableOpacity>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      )}

                      <TouchableOpacity 
                        style={styles.outlineActionButton}
                        onPress={() => {
                          safeHaptics.light();
                          setShowSpendModal(true);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.outlineActionText}>+ Log Expense with NumPad</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* VIEW 2: WEEKLY REVIEW */}
                {statsViewMode === 'weekly' && (
                  <View style={{ gap: 12 }}>
                    {/* Weekly Body Composition & Ankle Prehab Audit */}
                    <TouchableOpacity 
                      style={styles.contentCard}
                      onPress={() => {
                        safeHaptics.light();
                        setShowBodyModal(true);
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.cardHeaderRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Ionicons name="scale-outline" size={18} color={Colors.primary} />
                          <Text style={styles.contentCardTitle}>Sunday Sabbath Physical Audit</Text>
                        </View>
                        <Text style={styles.cardActionLink}>Log Audit ➔</Text>
                      </View>

                      <View style={styles.statsSummaryGrid}>
                        <View style={styles.statMetricItem}>
                          <Text style={styles.statMetricValue}>{appState.bodyWeightKg} kg</Text>
                          <Text style={styles.statMetricLabel}>Weight</Text>
                          {weightDelta && (
                            <Text style={[styles.deltaText, Number(weightDelta) <= 0 ? styles.deltaGood : styles.deltaWarn]}>
                              {Number(weightDelta) > 0 ? `+${weightDelta}` : weightDelta} kg
                            </Text>
                          )}
                        </View>

                        <View style={styles.statMetricItem}>
                          <Text style={styles.statMetricValue}>{appState.waistCircumferenceCm} cm</Text>
                          <Text style={styles.statMetricLabel}>Waist</Text>
                          {waistDelta && (
                            <Text style={[styles.deltaText, Number(waistDelta) <= 0 ? styles.deltaGood : styles.deltaWarn]}>
                              {Number(waistDelta) > 0 ? `+${waistDelta}` : waistDelta} cm
                            </Text>
                          )}
                        </View>

                        <View style={styles.statMetricItem}>
                          <Text style={styles.statMetricValue}>{appState.tummyCircumferenceCm} cm</Text>
                          <Text style={styles.statMetricLabel}>Tummy</Text>
                          {tummyDelta && (
                            <Text style={[styles.deltaText, Number(tummyDelta) <= 0 ? styles.deltaGood : styles.deltaWarn]}>
                              {Number(tummyDelta) > 0 ? `+${tummyDelta}` : tummyDelta} cm
                            </Text>
                          )}
                        </View>

                        <View style={styles.statMetricItem}>
                          <Text style={[styles.statMetricValue, { color: Colors.amber }]}>
                            Level {appState.anklePainRating}
                          </Text>
                          <Text style={styles.statMetricLabel}>Ankle Strain</Text>
                          <Text style={styles.deltaNeutral}>Target: 0/5</Text>
                        </View>
                      </View>

                      {appState.bodyMetricsHistory.length > 1 && (
                        <View style={{ marginTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.xs }}>
                          <Text style={styles.subCardHeader}>PREVIOUS AUDIT ({appState.bodyMetricsHistory[1].date})</Text>
                          <Text style={styles.cardDescriptionText}>
                            {appState.bodyMetricsHistory[1].weightKg}kg • {appState.bodyMetricsHistory[1].waistCm}cm waist • {appState.bodyMetricsHistory[1].tummyCm}cm tummy
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* 7-Day Cumulative Volume & Discipline */}
                    <View style={styles.contentCard}>
                      <View style={styles.cardHeaderRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Ionicons name="analytics-outline" size={18} color={Colors.primary} />
                          <Text style={styles.contentCardTitle}>7-Day Cumulative Progress</Text>
                        </View>
                      </View>

                      <View style={styles.weeklyDisciplineRow}>
                        <View style={styles.disciplineStatBox}>
                          <Text style={styles.disciplineValue}>{(weeklyFocusMinutes / 60).toFixed(1)} hrs</Text>
                          <Text style={styles.disciplineLabel}>Deep Work (7 Days)</Text>
                        </View>
                        <View style={styles.disciplineStatBox}>
                          <Text style={styles.disciplineValue}>₦{weeklyTotalSpent.toLocaleString()}</Text>
                          <Text style={styles.disciplineLabel}>Total Spending</Text>
                        </View>
                      </View>

                      <View style={styles.weeklyDisciplineRow}>
                        <View style={styles.disciplineStatBox}>
                          <Text style={styles.disciplineValue}>{appState.integrity.consecutiveControlledSatietyDays}/14 Days</Text>
                          <Text style={styles.disciplineLabel}>Satiety Streak</Text>
                        </View>
                        <View style={styles.disciplineStatBox}>
                          <Text style={styles.disciplineValue}>{appState.integrity.purityStreakDays} Days</Text>
                          <Text style={styles.disciplineLabel}>Purity Shield</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}

            <View style={{ height: 36 }} />
          </ScrollView>

          {/* 5-Tab Native Navigation Bar */}
          <BottomNavBar
            activeTab={activeNavTab}
            onSelectTab={setActiveNavTab}
            showSundayBadge={isSunday && !hasLoggedMetricsToday}
          />
        </ImageBackground>

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
