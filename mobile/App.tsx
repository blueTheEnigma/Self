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

export default function App() {
  const [appState, setAppState] = useState<SelfAppState | null>(null);
  const [dayPhase, setDayPhase] = useState<DayPhase>('MORNING_RITUAL');
  const [loading, setLoading] = useState(true);

  // 5 Dedicated Bottom Tabs (Vault & Stats Separated)
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
          {/* Top Clean Monochromatic Header */}
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

                {/* CURRENT FOCUS HERO CARD (COMFORTABLE FULL WIDTH) */}
                <View style={styles.heroWrapper}>
                  <Text style={styles.sectionHeaderLabel}>CURRENT FOCUS</Text>

                  {/* 1. Morning Ritual Active Phase */}
                  {dayPhase === 'MORNING_RITUAL' && (
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
                  {(dayPhase === 'DEEP_WORK_1' || dayPhase === 'DEEP_WORK_2' || dayPhase === 'DEEP_WORK_3') && (
                    <FocusTimerCard
                      onCompleteBlock={handleCompleteFocusBlock}
                    />
                  )}

                  {/* 3. Midday / Afternoon Buffer & Satiety */}
                  {(dayPhase === 'MIDDAY_BUFFER' || dayPhase === 'AFTERNOON_BUFFER') && (
                    <View style={styles.contentCard}>
                      <View style={styles.cardHeaderRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Ionicons name="restaurant-outline" size={18} color={Colors.primary} />
                          <Text style={styles.contentCardTitle}>Mindful Satiety Check</Text>
                        </View>
                        <Text style={styles.cardSubBadge}>Target: Level 3</Text>
                      </View>
                      <Text style={styles.cardDescriptionText}>
                        Eat to 80% fullness (Hara Hachi Bu). Stop when satiety is reached; avoid stuffed Level 4 or 5.
                      </Text>
                      <TouchableOpacity 
                        style={styles.primaryActionButton}
                        onPress={() => {
                          safeHaptics.light();
                          setActiveMealModal({
                            meal: dayPhase === 'MIDDAY_BUFFER' ? 'Breakfast' : 'Lunch',
                            rating: 3,
                          });
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.primaryActionText}>
                          Rate {dayPhase === 'MIDDAY_BUFFER' ? 'Breakfast' : 'Lunch'} Satiety ➔
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* 4. Evening Sanctuary */}
                  {dayPhase === 'EVENING_SANCTUARY' && (
                    <EveningSanctuaryCard
                      sanctuary={appState.sanctuary}
                      onAddGuitarMinutes={handleAddGuitar}
                      onLogHobby={handleLogHobby}
                      onSaveJournal={handleSaveJournal}
                    />
                  )}

                  {/* 5. Night Rest / Life Buffer */}
                  {(dayPhase === 'NIGHT_REST' || dayPhase === 'LIFE_BUFFER') && (
                    <View style={styles.contentCard}>
                      <View style={{ alignItems: 'center', paddingVertical: Spacing.md }}>
                        <Ionicons name="moon-outline" size={28} color={Colors.primary} />
                        <Text style={[styles.contentCardTitle, { marginTop: Spacing.sm }]}>
                          {dayPhase === 'NIGHT_REST' ? 'Sabbath Night Rest' : 'Guilt-Free Life Buffer'}
                        </Text>
                        <Text style={[styles.cardDescriptionText, { textAlign: 'center', marginTop: Spacing.xs }]}>
                          {dayPhase === 'NIGHT_REST'
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
                    <Text style={styles.tabBannerSubtitle}>Physical Trends, Financial Ledger & Analytics</Text>
                  </View>
                </View>

                {/* 1. Weekly Body Composition & Left Ankle Status */}
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
                      <Text style={styles.contentCardTitle}>Body Composition & Ankle</Text>
                    </View>
                    <Text style={styles.cardActionLink}>Log Audit ➔</Text>
                  </View>

                  <View style={styles.statsSummaryGrid}>
                    <View style={styles.statMetricItem}>
                      <Text style={styles.statMetricValue}>{appState.bodyWeightKg} kg</Text>
                      <Text style={styles.statMetricLabel}>Weight</Text>
                    </View>
                    <View style={styles.statMetricItem}>
                      <Text style={styles.statMetricValue}>{appState.waistCircumferenceCm} cm</Text>
                      <Text style={styles.statMetricLabel}>Waist</Text>
                    </View>
                    <View style={styles.statMetricItem}>
                      <Text style={styles.statMetricValue}>{appState.tummyCircumferenceCm} cm</Text>
                      <Text style={styles.statMetricLabel}>Tummy</Text>
                    </View>
                    <View style={styles.statMetricItem}>
                      <Text style={[styles.statMetricValue, { color: Colors.amber }]}>
                        Level {appState.anklePainRating}
                      </Text>
                      <Text style={styles.statMetricLabel}>Ankle Strain</Text>
                    </View>
                  </View>

                  {/* History Preview */}
                  {appState.bodyMetricsHistory.length > 1 && (
                    <View style={{ marginTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.xs }}>
                      <Text style={styles.subCardHeader}>PREVIOUS AUDIT ({appState.bodyMetricsHistory[1].date})</Text>
                      <Text style={styles.cardDescriptionText}>
                        {appState.bodyMetricsHistory[1].weightKg}kg • {appState.bodyMetricsHistory[1].waistCm}cm waist • {appState.bodyMetricsHistory[1].tummyCm}cm tummy
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* 2. Financial Expense Ledger */}
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

            <View style={{ height: 36 }} />
          </ScrollView>

          {/* 5-Tab Native Navigation Bar */}
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
});
