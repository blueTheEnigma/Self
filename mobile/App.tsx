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

export default function App() {
  const [appState, setAppState] = useState<SelfAppState | null>(null);
  const [dayPhase, setDayPhase] = useState<DayPhase>('MORNING_RITUAL');
  const [loading, setLoading] = useState(true);

  // 4 Primary Navigation Tabs
  const [activeNavTab, setActiveNavTab] = useState<NavTabId>('today');

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

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <ExpoStatusBar style="dark" />

        <View style={styles.canvasBackground}>
          {/* Top Decluttered Header with Compact Chips & Live Spend */}
          <Header
            currentDate={appState.currentDate}
            dayPhase={dayPhase}
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
            {/* SCREEN 1: TODAY (CONTEXTUAL ACTIVE PHASE HERO)            */}
            {/* ======================================================== */}
            {activeNavTab === 'today' && (
              <View style={styles.screenContainer}>
                {/* SUNDAY BODY METRIC AUDIT BANNER */}
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
                    <View style={styles.sundayHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons 
                          name={hasLoggedMetricsToday ? "checkmark-circle" : "scale"} 
                          size={16} 
                          color={hasLoggedMetricsToday ? Colors.emerald : Colors.amber} 
                        />
                        <Text style={[
                          styles.sundayTitle, 
                          { color: hasLoggedMetricsToday ? Colors.emerald : Colors.amber }
                        ]}>
                          {hasLoggedMetricsToday 
                            ? '✓ SUNDAY SABBATH AUDIT LOGGED' 
                            : '⚡ SUNDAY BODY METRICS AUDIT DUE'}
                        </Text>
                      </View>
                      <Text style={styles.sundayActionPill}>
                        {hasLoggedMetricsToday ? 'Review ➔' : 'Record Now ➔'}
                      </Text>
                    </View>

                    <Text style={styles.sundayDesc}>
                      {hasLoggedMetricsToday
                        ? `Logged: ${appState.bodyWeightKg}kg • ${appState.waistCircumferenceCm}cm waist • ${appState.tummyCircumferenceCm}cm tummy • Level ${appState.anklePainRating} ankle.`
                        : 'Today is Sunday Sabbath. Measure your weight, waist, tummy, and left ankle recovery.'}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* CONTEXTUAL ACTIVE PHASE HERO CARD */}
                <View style={styles.heroSection}>
                  <Text style={styles.sectionEyebrow}>CURRENT TIME FOCUS</Text>

                  {/* Phase 1: Morning Ritual */}
                  {dayPhase === 'MORNING_RITUAL' && (
                    <View>
                      <SpiritualAnchorCard
                        spiritual={appState.spiritual}
                        onToggle={handleToggleSpiritual}
                      />

                      {/* Movement Jump Prompt */}
                      <TouchableOpacity 
                        style={styles.movementJumpCard}
                        onPress={() => {
                          safeHaptics.light();
                          setActiveNavTab('movement');
                        }}
                        activeOpacity={0.8}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <View style={styles.jumpIconCircle}>
                            <Ionicons name="barbell" size={18} color="#ffffff" />
                          </View>
                          <View>
                            <Text style={styles.jumpCardTitle}>
                              {isRunningDay ? '🏃 2.5km Run & Calisthenics' : '🧘 Active Recovery & Ankle Prehab'}
                            </Text>
                            <Text style={styles.jumpCardSubtitle}>
                              Open Movement Hub to log sets & form guides ➔
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Phase 2: Deep Work 1 / 2 / 3 */}
                  {(dayPhase === 'DEEP_WORK_1' || dayPhase === 'DEEP_WORK_2' || dayPhase === 'DEEP_WORK_3') && (
                    <FocusTimerCard
                      onCompleteBlock={handleCompleteFocusBlock}
                    />
                  )}

                  {/* Phase 3: Midday / Afternoon Buffer & Satiety */}
                  {(dayPhase === 'MIDDAY_BUFFER' || dayPhase === 'AFTERNOON_BUFFER') && (
                    <View style={styles.satietyHeroCard}>
                      <View style={styles.satietyHeroHeader}>
                        <Ionicons name="restaurant" size={20} color={Colors.emerald} />
                        <Text style={styles.satietyHeroTitle}>MINDFUL SATIETY CHECK</Text>
                      </View>
                      <Text style={styles.satietyHeroDesc}>
                        Target Level 3 (80% full — Hara Hachi Bu). Never eat to stuffed level 4 or 5.
                      </Text>
                      <TouchableOpacity 
                        style={styles.rateMealBtn}
                        onPress={() => {
                          safeHaptics.light();
                          setActiveMealModal({
                            meal: dayPhase === 'MIDDAY_BUFFER' ? 'Breakfast' : 'Lunch',
                            rating: 3,
                          });
                        }}
                      >
                        <Text style={styles.rateMealBtnText}>
                          Rate {dayPhase === 'MIDDAY_BUFFER' ? 'Breakfast' : 'Lunch'} Satiety ➔
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Phase 4: Evening Sanctuary */}
                  {dayPhase === 'EVENING_SANCTUARY' && (
                    <EveningSanctuaryCard
                      sanctuary={appState.sanctuary}
                      onAddGuitarMinutes={handleAddGuitar}
                      onLogHobby={handleLogHobby}
                      onSaveJournal={handleSaveJournal}
                    />
                  )}

                  {/* Phase 5: Night Rest / Life Buffer */}
                  {(dayPhase === 'NIGHT_REST' || dayPhase === 'LIFE_BUFFER') && (
                    <View style={styles.restHeroCard}>
                      <Ionicons name="moon" size={24} color={Colors.violet} />
                      <Text style={styles.restTitle}>
                        {dayPhase === 'NIGHT_REST' ? 'Sabbath Night Rest' : 'Guilt-Free Life Buffer'}
                      </Text>
                      <Text style={styles.restDesc}>
                        {dayPhase === 'NIGHT_REST'
                          ? 'Deep restorative sleep allows neural consolidation and tissue repair for your left ankle.'
                          : 'Zero-guilt buffer for errands, rest, reading, or family. Clear mind for tomorrow.'}
                      </Text>
                      <View style={styles.tomorrowBox}>
                        <Text style={styles.tomorrowLabel}>TOMORROW ANCHOR:</Text>
                        <Text style={styles.tomorrowText}>{appState.sanctuary.tomorrowAnchor}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* QUICK-ACTION MICRO DOCK (1-TAP CAPTURE) */}
                <View style={styles.dockSection}>
                  <Text style={styles.sectionEyebrow}>QUICK ACTIONS</Text>
                  <View style={styles.dockRow}>
                    {/* Water +500ml */}
                    <TouchableOpacity 
                      style={[styles.dockBtn, { borderColor: Colors.cyan + '40', backgroundColor: Colors.cyanMuted }]}
                      onPress={() => {
                        safeHaptics.medium();
                        handleAddWater(500);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="water" size={18} color={Colors.cyan} />
                      <Text style={[styles.dockBtnText, { color: Colors.cyan }]}>+500ml</Text>
                    </TouchableOpacity>

                    {/* Urge Defeater Emergency */}
                    <TouchableOpacity 
                      style={[styles.dockBtn, { borderColor: Colors.ruby + '40', backgroundColor: Colors.rubyMuted }]}
                      onPress={() => {
                        safeHaptics.warning();
                        setShowUrgeModal(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="flash" size={18} color={Colors.ruby} />
                      <Text style={[styles.dockBtnText, { color: Colors.ruby }]}>Urge Defeater</Text>
                    </TouchableOpacity>

                    {/* Quick Spend */}
                    <TouchableOpacity 
                      style={[styles.dockBtn, { borderColor: Colors.primary + '40', backgroundColor: Colors.primaryMuted }]}
                      onPress={() => {
                        safeHaptics.medium();
                        setShowSpendModal(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.dockBtnText, { color: Colors.primary, fontWeight: '900', fontSize: 16 }]}>₦</Text>
                      <Text style={[styles.dockBtnText, { color: Colors.primary }]}>Log Spend</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* ======================================================== */}
            {/* SCREEN 2: MOVEMENT (KAIZEN WORKOUT & LEFT ANKLE HUB)      */}
            {/* ======================================================== */}
            {activeNavTab === 'movement' && (
              <View style={styles.screenContainer}>
                {/* Movement Status Header */}
                <View style={styles.tabBanner}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="barbell" size={20} color={Colors.primary} />
                    <View>
                      <Text style={styles.tabBannerTitle}>KAIZEN MOVEMENT HUB</Text>
                      <Text style={styles.tabBannerSubtitle}>
                        {isRunningDay ? 'Run Day: 2.5km + Calisthenics' : 'Recovery Day: Ankle Prehab & Stretches'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.ankleStatusPill}>
                    <Text style={styles.ankleStatusText}>Ankle Pain: {appState.anklePainRating}/5</Text>
                  </View>
                </View>

                {/* Full Kaizen Workout Card */}
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
            {/* SCREEN 3: DEEP WORK (90M TIMERS & DAILY RHYTHM STRIP)    */}
            {/* ======================================================== */}
            {activeNavTab === 'focus' && (
              <View style={styles.screenContainer}>
                <View style={styles.tabBanner}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="timer" size={20} color={Colors.primary} />
                    <View>
                      <Text style={styles.tabBannerTitle}>DEEP WORK COMPRESSIONS</Text>
                      <Text style={styles.tabBannerSubtitle}>90-Minute Hard-Cap Engine & 15m Cooldowns</Text>
                    </View>
                  </View>
                </View>

                {/* 24-Hour Visual Schedule Rhythm Strip */}
                <TimeBlocksBar
                  currentPhase={dayPhase}
                  onSelectBlock={(phase) => setDayPhase(phase)}
                />

                {/* Focus Timer Card */}
                <FocusTimerCard
                  onCompleteBlock={handleCompleteFocusBlock}
                />

                {/* Completed Focus Blocks History */}
                {appState.focusBlocks.length > 0 && (
                  <View style={styles.historyCard}>
                    <Text style={styles.historyTitle}>TODAY'S COMPLETED SESSIONS</Text>
                    {appState.focusBlocks.map(block => (
                      <View key={block.id} style={styles.focusBlockRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Ionicons name="checkmark-circle" size={16} color={Colors.emerald} />
                          <Text style={styles.focusProjectText}>{block.project}</Text>
                        </View>
                        <Text style={styles.focusDurationText}>{block.durationMinutes} mins</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* ======================================================== */}
            {/* SCREEN 4: VAULT & STATS (INTEGRITY, FINANCES & BODY)     */}
            {/* ======================================================== */}
            {activeNavTab === 'vault' && (
              <View style={styles.screenContainer}>
                <View style={styles.tabBanner}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="shield-checkmark" size={20} color={Colors.emerald} />
                    <View>
                      <Text style={styles.tabBannerTitle}>INTEGRITY & BODY MIRROR</Text>
                      <Text style={styles.tabBannerSubtitle}>Purity Shield, Expenses & Physical Trends</Text>
                    </View>
                  </View>
                </View>

                {/* 1. Integrity Card (Purity, Battle Log, Urge Counter, Relapse Reset) */}
                <IntegrityCard
                  integrity={appState.integrity}
                  onAddWater={handleAddWater}
                  onOpenMealModal={(meal, rating) => setActiveMealModal({ meal, rating })}
                  onOpenUrgeDefeater={() => setShowUrgeModal(true)}
                  onOpenRelapseModal={() => setShowRelapseModal(true)}
                />

                {/* 2. Financial Ledger Card */}
                <View style={styles.ledgerCard}>
                  <View style={styles.ledgerHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 16 }}>💳</Text>
                      <Text style={styles.ledgerTitle}>FINANCIAL LEDGER (TODAY)</Text>
                    </View>
                    <Text style={styles.ledgerTotalText}>₦{todaySpent.toLocaleString()}</Text>
                  </View>

                  {todayTransactions.length === 0 ? (
                    <Text style={styles.emptyLedgerText}>No expenses logged yet today.</Text>
                  ) : (
                    <View style={styles.txWrap}>
                      {todayTransactions.map(tx => (
                        <View key={tx.id} style={styles.txMiniRow}>
                          <Text style={styles.txCategoryTag}>{tx.category}</Text>
                          <Text style={styles.txAmountText}>₦{tx.amount.toLocaleString()}</Text>
                          <TouchableOpacity 
                            onPress={() => {
                              safeHaptics.warning();
                              handleDeleteSpend(tx.id);
                            }}
                          >
                            <Ionicons name="trash-outline" size={15} color={Colors.ruby} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity 
                    style={styles.openSpendBtn}
                    onPress={() => {
                      safeHaptics.light();
                      setShowSpendModal(true);
                    }}
                  >
                    <Text style={styles.openSpendBtnText}>+ Log Expense with NumPad</Text>
                  </TouchableOpacity>
                </View>

                {/* 3. Body Metrics Card */}
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
                      <Text style={styles.bodyTitle}>WEEKLY BODY COMPOSITION & ANKLE STATUS</Text>
                    </View>
                    <Text style={styles.bodyTapPrompt}>Tap to audit ➔</Text>
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

                {/* 4. Evening Sanctuary & Hobbies (if user wants to log early) */}
                <EveningSanctuaryCard
                  sanctuary={appState.sanctuary}
                  onAddGuitarMinutes={handleAddGuitar}
                  onLogHobby={handleLogHobby}
                  onSaveJournal={handleSaveJournal}
                />
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Bottom Native Navigation Bar */}
          <BottomNavBar
            activeTab={activeNavTab}
            onSelectTab={setActiveNavTab}
            showSundayBadge={isSunday && !hasLoggedMetricsToday}
          />
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
    paddingTop: Spacing.md,
  },
  screenContainer: {
    gap: Spacing.sm,
  },
  sectionEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
    marginLeft: 2,
  },
  heroSection: {
    marginBottom: Spacing.sm,
  },
  sundayCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  sundayCardPending: {
    backgroundColor: '#fffbeb',
    borderColor: Colors.amber,
  },
  sundayCardDone: {
    backgroundColor: Colors.surface,
    borderColor: Colors.emerald,
  },
  sundayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sundayTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sundayActionPill: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  sundayDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  movementJumpCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
    ...Shadows.soft,
  },
  jumpIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jumpCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  jumpCardSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  satietyHeroCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  satietyHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.xs,
  },
  satietyHeroTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.emerald,
    letterSpacing: 0.5,
  },
  satietyHeroDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: Spacing.md,
  },
  rateMealBtn: {
    backgroundColor: Colors.emerald,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    ...Shadows.soft,
  },
  rateMealBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  restHeroCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    textAlign: 'center',
    ...Shadows.card,
  },
  restTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  restDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: Spacing.xs,
  },
  tomorrowBox: {
    marginTop: Spacing.md,
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tomorrowLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  tomorrowText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 2,
  },
  dockSection: {
    marginTop: Spacing.sm,
  },
  dockRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  dockBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Shadows.soft,
  },
  dockBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  tabBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
    ...Shadows.soft,
  },
  tabBannerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  tabBannerSubtitle: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  ankleStatusPill: {
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ankleStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.amber,
  },
  historyCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
  },
  historyTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  focusBlockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  focusProjectText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  focusDurationText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  ledgerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  ledgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  ledgerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  ledgerTotalText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.primary,
  },
  emptyLedgerText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginVertical: Spacing.sm,
    fontStyle: 'italic',
  },
  txWrap: {
    gap: 6,
    marginVertical: Spacing.xs,
  },
  txMiniRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: BorderRadius.sm,
  },
  txCategoryTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  txAmountText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  openSpendBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.surfaceHighlight,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  openSpendBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  bodyMetricsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
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
});
