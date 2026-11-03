import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '../theme/colors';
import { HabitIntegrityState, SpiritualAnchorState, EveningSanctuaryState } from '../types';
import { safeHaptics } from '../services/haptics';

interface VaultPortalsProps {
  integrity: HabitIntegrityState;
  spiritual: SpiritualAnchorState;
  sanctuary: EveningSanctuaryState;
  onToggleSpiritual: (item: 'wakeup' | 'track' | 'bible' | 'audiobook', passage?: string, takeaway?: string) => void;
  onAddWater: (ml: number) => void;
  onOpenMealModal: (meal: 'Breakfast' | 'Lunch' | 'Dinner', currentRating: number) => void;
  onOpenUrgeDefeater: () => void;
  onOpenRelapseModal: () => void;
  onLogGuitar: (mins: number, notes?: string) => void;
  onLogReading: (mins: number, title?: string, notes?: string) => void;
  onLogWriting: (notes: string, title?: string) => void;
  onSaveJournal: (wins: string, friction: string, tomorrow: string) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const VaultPortals: React.FC<VaultPortalsProps> = ({
  integrity,
  spiritual,
  sanctuary,
  onToggleSpiritual,
  onAddWater,
  onOpenMealModal,
  onOpenUrgeDefeater,
  onOpenRelapseModal,
  onLogGuitar,
  onLogReading,
  onLogWriting,
  onSaveJournal,
}) => {
  // Modal states for the 5 centered pop-out overlays (Urge Defeater style)
  const [activePortal, setActivePortal] = useState<'purity' | 'spiritual' | 'satiety' | 'guitar' | 'journal' | null>(null);

  // Spiritual Modal local state
  const [scriptureText, setScriptureText] = useState(spiritual.scripturePassage || '');
  const [scriptureSaved, setScriptureSaved] = useState(false);
  const [audiobookTitle, setAudiobookTitle] = useState(spiritual.audiobookTitle || '');
  const [audiobookTakeaway, setAudiobookTakeaway] = useState(spiritual.audiobookTakeaway || '');
  const [audiobookSaved, setAudiobookSaved] = useState(false);

  // Satiety in-place logging state
  const [selectedMeal, setSelectedMeal] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Lunch');
  const [mealRating, setMealRating] = useState<number>(3);
  const [mealDesc, setMealDesc] = useState('');
  const [mealSaved, setMealSaved] = useState(false);

  // Acoustic Guitar local state
  const [guitarMins, setGuitarMins] = useState('15');
  const [guitarNotes, setGuitarNotes] = useState(sanctuary.guitarNotesToday || '');
  const [guitarSaved, setGuitarSaved] = useState(false);

  const [readingNotes, setReadingNotes] = useState(sanctuary.readingNotesToday || '');
  const [wins, setWins] = useState(sanctuary.microJournalWins || '');
  const [friction, setFriction] = useState(sanctuary.microJournalFriction || '');
  const [tomorrow, setTomorrow] = useState(sanctuary.tomorrowAnchor || 'Quant Bot & Multivariable Calculus');
  const [journalSaved, setJournalSaved] = useState(false);

  const handleSaveScripture = () => {
    safeHaptics.success();
    onToggleSpiritual('bible', scriptureText.trim() || undefined);
    setScriptureSaved(true);
    setTimeout(() => setScriptureSaved(false), 2000);
  };

  const handleSaveMealInPlace = () => {
    safeHaptics.success();
    onOpenMealModal(selectedMeal, mealRating);
    setMealSaved(true);
    setTimeout(() => setMealSaved(false), 2000);
  };

  const handleSaveGuitarLocal = () => {
    safeHaptics.success();
    const mins = parseInt(guitarMins, 10) || 15;
    onLogGuitar(mins, guitarNotes.trim() || undefined);
    setGuitarSaved(true);
    setTimeout(() => setGuitarSaved(false), 2000);
  };

  const handleSaveJournalLocal = () => {
    safeHaptics.success();
    if (readingNotes.trim()) {
      onLogReading(20, undefined, readingNotes.trim());
    }
    onSaveJournal(wins, friction, tomorrow);
    setJournalSaved(true);
    setTimeout(() => setJournalSaved(false), 2000);
  };

  const spiritualCompletedCount = [
    spiritual.wakeupPrayerDone,
    spiritual.trackPrayerDone,
    spiritual.bibleReadingDone,
    Boolean(spiritual.audiobookDone),
  ].filter(Boolean).length;

  return (
    <View style={styles.container}>
      {/* 4 Full-Width Vertical Portal Cards — Fills space beautifully with zero empty void */}
      <View style={styles.portalsList}>
        {/* PORTAL 1: SOVEREIGN PURITY FORTRESS */}
        <TouchableOpacity
          style={[styles.portalRowCard, { borderColor: Colors.primaryBorder }]}
          onPress={() => {
            safeHaptics.light();
            setActivePortal('purity');
          }}
          activeOpacity={0.82}
        >
          <View style={styles.portalCardLeft}>
            <View style={[styles.portalIconBadge, { backgroundColor: Colors.primaryMuted }]}>
              <Ionicons name="shield-checkmark" size={24} color={Colors.primary} />
            </View>
          </View>

          <View style={styles.portalCardBody}>
            <View style={styles.portalTitleRow}>
              <Text style={styles.portalSectionLabel}>INNER DEFENSE</Text>
              <View style={styles.pillBadge}>
                <Ionicons name="flash" size={11} color={Colors.amber} />
                <Text style={styles.pillBadgeText}>{integrity.urgeDivertedCount} Diverted</Text>
              </View>
            </View>
            <Text style={styles.portalCardTitle}>Sovereign Purity Fortress</Text>
            <Text style={[styles.portalCardHighlight, { color: Colors.primary }]}>
              Day {integrity.purityStreakDays} Clean & Sovereign
            </Text>
            <Text style={styles.portalCardSub}>
              Sexual temperance, mental grounding & urge protocol
            </Text>
          </View>

          <View style={styles.portalCardArrow}>
            <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
          </View>
        </TouchableOpacity>

        {/* PORTAL 2: SPIRITUAL ANCHORS */}
        <TouchableOpacity
          style={[styles.portalRowCard, { borderColor: Colors.lavenderBorder }]}
          onPress={() => {
            safeHaptics.light();
            setActivePortal('spiritual');
          }}
          activeOpacity={0.82}
        >
          <View style={styles.portalCardLeft}>
            <View style={[styles.portalIconBadge, { backgroundColor: Colors.lavender }]}>
              <Ionicons name="sunny" size={24} color={Colors.lavenderDark} />
            </View>
          </View>

          <View style={styles.portalCardBody}>
            <View style={styles.portalTitleRow}>
              <Text style={styles.portalSectionLabel}>DAILY CONSECRATION</Text>
              <View style={[styles.pillBadge, { backgroundColor: Colors.lavender }]}>
                <Text style={[styles.pillBadgeText, { color: Colors.lavenderDark }]}>
                  {spiritualCompletedCount}/4 Sealed
                </Text>
              </View>
            </View>
            <Text style={styles.portalCardTitle}>Spiritual Anchors</Text>
            <Text style={[styles.portalCardHighlight, { color: Colors.lavenderDark }]}>
              {spiritualCompletedCount === 4 ? 'All Anchors Consecrated ✓' : 'Daily Morning Alignment'}
            </Text>
            <Text style={styles.portalCardSub}>
              05:30 Prayer, Track Contemplation, Scripture & Audiobook
            </Text>
          </View>

          <View style={styles.portalCardArrow}>
            <Ionicons name="chevron-forward" size={18} color={Colors.lavenderDark} />
          </View>
        </TouchableOpacity>

        {/* PORTAL 3: MINDFUL SATIETY (HARA HACHI BU) */}
        <TouchableOpacity
          style={[styles.portalRowCard, { borderColor: Colors.peachBorder }]}
          onPress={() => {
            safeHaptics.light();
            setActivePortal('satiety');
          }}
          activeOpacity={0.82}
        >
          <View style={styles.portalCardLeft}>
            <View style={[styles.portalIconBadge, { backgroundColor: Colors.peach }]}>
              <Ionicons name="restaurant" size={24} color={Colors.peachDark} />
            </View>
          </View>

          <View style={styles.portalCardBody}>
            <View style={styles.portalTitleRow}>
              <Text style={styles.portalSectionLabel}>TEMPERANCE & ENERGY</Text>
              <View style={[styles.pillBadge, { backgroundColor: Colors.peach }]}>
                <Text style={[styles.pillBadgeText, { color: Colors.peachDark }]}>
                  {integrity.fullnessLogs.length}/3 Meals Audited
                </Text>
              </View>
            </View>
            <Text style={styles.portalCardTitle}>Mindful Satiety (80%)</Text>
            <Text style={[styles.portalCardHighlight, { color: Colors.peachDark }]}>
              Hara Hachi Bu • Zero Food Comas
            </Text>
            <Text style={styles.portalCardSub}>
              {integrity.consecutiveControlledSatietyDays} consecutive days controlled eating
            </Text>
          </View>

          <View style={styles.portalCardArrow}>
            <Ionicons name="chevron-forward" size={18} color={Colors.peachDark} />
          </View>
        </TouchableOpacity>

        {/* PORTAL 4: ACOUSTIC GUITAR SANCTUARY */}
        <TouchableOpacity
          style={[styles.portalRowCard, { borderColor: Colors.honeyBorder }]}
          onPress={() => {
            safeHaptics.light();
            setActivePortal('guitar');
          }}
          activeOpacity={0.82}
        >
          <View style={styles.portalCardLeft}>
            <View style={[styles.portalIconBadge, { backgroundColor: Colors.honey }]}>
              <Ionicons name="musical-notes" size={24} color={Colors.honeyDark} />
            </View>
          </View>

          <View style={styles.portalCardBody}>
            <View style={styles.portalTitleRow}>
              <Text style={styles.portalSectionLabel}>TACTILE ACOUSTIC ANCHOR</Text>
              <View style={[styles.pillBadge, { backgroundColor: Colors.honey }]}>
                <Text style={[styles.pillBadgeText, { color: Colors.honeyDark }]}>
                  {sanctuary.guitarMinutesToday}m Logged
                </Text>
              </View>
            </View>
            <Text style={styles.portalCardTitle}>Acoustic Guitar Sanctuary</Text>
            <Text style={[styles.portalCardHighlight, { color: Colors.honeyDark }]}>
              {sanctuary.guitarMinutesToday >= 15 ? 'Target Reached (15m+) ✓' : 'Daily 15m Practice'}
            </Text>
            <Text style={styles.portalCardSub}>
              Fingerstyle, rhythm drills & non-screen acoustic joy
            </Text>
          </View>

          <View style={styles.portalCardArrow}>
            <Ionicons name="chevron-forward" size={18} color={Colors.honeyDark} />
          </View>
        </TouchableOpacity>

        {/* PORTAL 5: EVENING MICRO-REFLECTION */}
        <TouchableOpacity
          style={[styles.portalRowCard, { borderColor: Colors.primaryBorder }]}
          onPress={() => {
            safeHaptics.light();
            setActivePortal('journal');
          }}
          activeOpacity={0.82}
        >
          <View style={styles.portalCardLeft}>
            <View style={[styles.portalIconBadge, { backgroundColor: Colors.primaryMuted }]}>
              <Ionicons name="journal" size={24} color={Colors.primary} />
            </View>
          </View>

          <View style={styles.portalCardBody}>
            <View style={styles.portalTitleRow}>
              <Text style={styles.portalSectionLabel}>DAILY CLOSING SYNTHESIS</Text>
              <View style={[styles.pillBadge, { backgroundColor: sanctuary.microJournalWins ? '#ECFDF5' : Colors.surfaceHighlight }]}>
                <Text style={[styles.pillBadgeText, { color: sanctuary.microJournalWins ? Colors.emerald : Colors.textMuted }]}>
                  {sanctuary.microJournalWins ? 'Sealed ✓' : 'Pending'}
                </Text>
              </View>
            </View>
            <Text style={styles.portalCardTitle}>Evening Micro-Reflection</Text>
            <Text style={[styles.portalCardHighlight, { color: Colors.primary }]}>
              {sanctuary.microJournalWins ? 'Wins & Friction Consecrated' : '60s Reflection & Tomorrow Anchor'}
            </Text>
            <Text style={styles.portalCardSub}>
              Daily wins, resistance friction & tomorrow's morning anchor
            </Text>
          </View>

          <View style={styles.portalCardArrow}>
            <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Hero Stoic Wisdom & Covenant Anchor Card (Fills bottom space with feeling & dignity) */}
      <View style={styles.wisdomCard}>
        <View style={styles.wisdomHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="sparkles" size={16} color={Colors.primary} />
            <Text style={styles.wisdomHeaderTitle}>THE SOVEREIGN SANCTUARY</Text>
          </View>
          <View style={styles.wisdomBadge}>
            <Text style={styles.wisdomBadgeText}>Stoic Shield</Text>
          </View>
        </View>

        <Text style={styles.wisdomQuote}>
          "No man is free who is not master of himself. Guard your gates: what enters your eyes, your mind, and your appetite determines your future sovereignty."
        </Text>
        <Text style={styles.wisdomAuthor}>— Epictetus • Discourses</Text>

        <View style={styles.wisdomPillarsRow}>
          <View style={styles.miniPillarPill}>
            <Ionicons name="shield-checkmark" size={12} color={Colors.primary} />
            <Text style={styles.miniPillarText}>Purity Unbroken</Text>
          </View>
          <View style={styles.miniPillarPill}>
            <Ionicons name="sunny" size={12} color={Colors.lavenderDark} />
            <Text style={styles.miniPillarText}>Mind Consecrated</Text>
          </View>
          <View style={styles.miniPillarPill}>
            <Ionicons name="restaurant" size={12} color={Colors.peachDark} />
            <Text style={styles.miniPillarText}>80% Fullness</Text>
          </View>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 1. PURITY CENTERED MODAL OVERLAY (URGE DEFEATER PATTERN) */}
      {/* ======================================================== */}
      <Modal
        visible={activePortal === 'purity'}
        transparent
        animationType="fade"
        onRequestClose={() => setActivePortal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.centeredCard, { borderColor: Colors.primaryBorder }]}>
            {/* Header */}
            <View style={styles.centeredHeader}>
              <View style={[styles.centeredIconCircle, { backgroundColor: Colors.primary }]}>
                <Ionicons name="shield-checkmark" size={24} color="#ffffff" />
              </View>
              <Text style={styles.centeredTitle}>SOVEREIGN PURITY FORTRESS</Text>
              <Text style={[styles.centeredSubtitle, { color: Colors.primary }]}>
                Sexual Temperance & Dopamine Mastery
              </Text>
            </View>

            {/* Streak Hero Banner */}
            <View style={styles.purityHeroBox}>
              <Text style={styles.purityHeroNumber}>Day {integrity.purityStreakDays}</Text>
              <Text style={styles.purityHeroLabel}>Clean, Grounded & Unbroken</Text>
            </View>

            {/* Metric Counters */}
            <View style={styles.metricDualRow}>
              <View style={styles.metricBox}>
                <Text style={styles.metricVal}>{integrity.urgeDivertedCount}</Text>
                <Text style={styles.metricLbl}>Urges Diverted</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={styles.metricVal}>{integrity.relapseHistory.length}</Text>
                <Text style={styles.metricLbl}>Falls Recorded</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.urgeRedButton}
              onPress={() => {
                setActivePortal(null);
                setTimeout(() => onOpenUrgeDefeater(), 250);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="flash" size={18} color="#ffffff" />
              <Text style={styles.urgeRedButtonText}>Launch Urge Defeater Protocol</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.relapseMutedButton}
              onPress={() => {
                setActivePortal(null);
                setTimeout(() => onOpenRelapseModal(), 250);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.relapseMutedButtonText}>Log Fall & Reset Streak</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.centeredDismissBtn}
              onPress={() => setActivePortal(null)}
            >
              <Text style={styles.centeredDismissText}>Close Fortress</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* 2. SPIRITUAL CENTERED MODAL OVERLAY                      */}
      {/* ======================================================== */}
      <Modal
        visible={activePortal === 'spiritual'}
        transparent
        animationType="fade"
        onRequestClose={() => setActivePortal(null)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.modalOverlay}
        >
          <View style={[styles.centeredCard, { borderColor: Colors.lavenderBorder }]}>
            {/* Header */}
            <View style={styles.centeredHeader}>
              <View style={[styles.centeredIconCircle, { backgroundColor: Colors.lavenderDark }]}>
                <Ionicons name="sunny" size={24} color="#ffffff" />
              </View>
              <Text style={styles.centeredTitle}>SPIRITUAL ANCHORS</Text>
              <Text style={[styles.centeredSubtitle, { color: Colors.lavenderDark }]}>
                Daily Alignment & Eternal Truth
              </Text>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: SCREEN_HEIGHT * 0.55 }}
            >
              {/* Anchor 1: Wakeup */}
              <TouchableOpacity
                style={[styles.anchorCardItem, spiritual.wakeupPrayerDone && styles.anchorCardItemDone]}
                onPress={() => {
                  safeHaptics.light();
                  onToggleSpiritual('wakeup');
                }}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={spiritual.wakeupPrayerDone ? "checkmark-circle" : "ellipse-outline"} 
                  size={22} 
                  color={spiritual.wakeupPrayerDone ? Colors.primary : Colors.textMuted} 
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.anchorItemTitle, spiritual.wakeupPrayerDone && styles.anchorItemTitleDone]}>
                    05:30 Wakeup Prayer & Dedication
                  </Text>
                  <Text style={styles.anchorItemSubtitle}>
                    {spiritual.wakeupPrayerDone ? 'Surrendered & Grounded ✓' : 'First breath surrendered to purpose'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Anchor 2: Track Walking Prayer */}
              <TouchableOpacity
                style={[styles.anchorCardItem, spiritual.trackPrayerDone && styles.anchorCardItemDone]}
                onPress={() => {
                  safeHaptics.light();
                  onToggleSpiritual('track');
                }}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={spiritual.trackPrayerDone ? "checkmark-circle" : "ellipse-outline"} 
                  size={22} 
                  color={spiritual.trackPrayerDone ? Colors.primary : Colors.textMuted} 
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.anchorItemTitle, spiritual.trackPrayerDone && styles.anchorItemTitleDone]}>
                    15-Min Track Walking Prayer
                  </Text>
                  <Text style={styles.anchorItemSubtitle}>
                    {spiritual.trackPrayerDone ? 'Mind Contemplated & Clear ✓' : 'Walking meditation round physical tracks'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Anchor 3: Scripture */}
              <View style={styles.scriptureCardItem}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}
                  onPress={() => {
                    safeHaptics.light();
                    onToggleSpiritual('bible');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name={spiritual.bibleReadingDone ? "checkmark-circle" : "ellipse-outline"} 
                    size={22} 
                    color={spiritual.bibleReadingDone ? Colors.primary : Colors.textMuted} 
                  />
                  <Text style={[styles.anchorItemTitle, spiritual.bibleReadingDone && styles.anchorItemTitleDone]}>
                    Scripture Reading & Passage
                  </Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.centeredTextInput}
                  value={scriptureText}
                  onChangeText={setScriptureText}
                  placeholder="Today's passage (e.g. Proverbs 3:5-6) or takeaway..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={2}
                />

                <TouchableOpacity 
                  style={[styles.centeredSaveBtn, scriptureSaved && styles.centeredSaveBtnDone]}
                  onPress={handleSaveScripture}
                  activeOpacity={0.8}
                >
                  <Text style={styles.centeredSaveBtnText}>
                    {scriptureSaved ? '✓ Passage Saved' : 'Save Scripture Note'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Anchor 4: Daily Audiobook Summary */}
              <TouchableOpacity
                style={[styles.anchorCardItem, spiritual.audiobookDone && styles.anchorCardItemDone]}
                onPress={() => {
                  safeHaptics.light();
                  onToggleSpiritual('audiobook', audiobookTitle.trim() || undefined, audiobookTakeaway.trim() || undefined);
                }}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={spiritual.audiobookDone ? "checkmark-circle" : "ellipse-outline"} 
                  size={22} 
                  color={spiritual.audiobookDone ? Colors.primary : Colors.textMuted} 
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.anchorItemTitle, spiritual.audiobookDone && styles.anchorItemTitleDone]}>
                    Daily Audiobook Summary
                  </Text>
                  <Text style={styles.anchorItemSubtitle}>
                    {spiritual.audiobookDone ? 'Completed • Strategic insights absorbed ✓' : 'Listen to at least 1 book summary (15m)'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Optional Audiobook Title & Key Takeaway Input */}
              <View style={[styles.scriptureCardItem, { marginTop: 6 }]}>
                <Text style={styles.inputMicroLabel}>BOOK TITLE & 1-LINE KEY TAKEAWAY</Text>
                <TextInput
                  style={styles.centeredTextInput}
                  placeholder="Book Title (e.g. Thinking, Fast and Slow)"
                  placeholderTextColor={Colors.textDisabled}
                  value={audiobookTitle}
                  onChangeText={setAudiobookTitle}
                />
                <TextInput
                  style={[styles.centeredTextInput, { marginTop: 4 }]}
                  placeholder="1 Key Takeaway (e.g. System 2 deliberate thinking overrides impulses)"
                  placeholderTextColor={Colors.textDisabled}
                  value={audiobookTakeaway}
                  onChangeText={setAudiobookTakeaway}
                />
                <TouchableOpacity
                  style={styles.centeredSaveBtn}
                  onPress={() => {
                    safeHaptics.success();
                    onToggleSpiritual('audiobook', audiobookTitle.trim() || undefined, audiobookTakeaway.trim() || undefined);
                    setAudiobookSaved(true);
                    setTimeout(() => setAudiobookSaved(false), 2000);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.centeredSaveBtnText}>
                    {audiobookSaved ? '✓ Takeaway Saved' : 'Save Audiobook Note'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={styles.centeredDismissBtn}
              onPress={() => setActivePortal(null)}
            >
              <Text style={styles.centeredDismissText}>Close Anchors</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ======================================================== */}
      {/* 3. SATIETY CENTERED MODAL OVERLAY (IN-PLACE AUDIT)        */}
      {/* ======================================================== */}
      <Modal
        visible={activePortal === 'satiety'}
        transparent
        animationType="fade"
        onRequestClose={() => setActivePortal(null)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.modalOverlay}
        >
          <View style={[styles.centeredCard, { borderColor: Colors.peachBorder }]}>
            {/* Header */}
            <View style={styles.centeredHeader}>
              <View style={[styles.centeredIconCircle, { backgroundColor: Colors.peachDark }]}>
                <Ionicons name="restaurant" size={24} color="#ffffff" />
              </View>
              <Text style={styles.centeredTitle}>MINDFUL SATIETY</Text>
              <Text style={[styles.centeredSubtitle, { color: Colors.peachDark }]}>
                Hara Hachi Bu • Eat Until 80% Full
              </Text>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: SCREEN_HEIGHT * 0.55 }}
            >
              {/* Meal Selector Tabs */}
              <View style={styles.mealTabRow}>
                {(['Breakfast', 'Lunch', 'Dinner'] as const).map(m => {
                  const isSel = selectedMeal === m;
                  const log = integrity.fullnessLogs.find(l => l.meal === m);
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[styles.mealTabChip, isSel && styles.mealTabChipActive]}
                      onPress={() => {
                        safeHaptics.light();
                        setSelectedMeal(m);
                        if (log) setMealRating(log.rating);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.mealTabChipText, isSel && styles.mealTabChipTextActive]}>
                        {m} {log ? `(${log.rating})` : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Fullness Rating 1 to 5 Selector */}
              <Text style={styles.subFieldLabel}>HOW FULL ARE YOU? (TARGET LEVEL 3)</Text>
              <View style={styles.ratingBar}>
                {[
                  { val: 1, label: 'Hungry' },
                  { val: 2, label: 'Light' },
                  { val: 3, label: '80% Full ✓' },
                  { val: 4, label: 'Full' },
                  { val: 5, label: 'Stuffed' },
                ].map(r => {
                  const isSel = mealRating === r.val;
                  const isTarget = r.val === 3;
                  return (
                    <TouchableOpacity
                      key={r.val}
                      style={[
                        styles.ratingTile,
                        isSel && (isTarget ? styles.ratingTileTarget : (r.val >= 4 ? styles.ratingTileRed : styles.ratingTileBlue)),
                      ]}
                      onPress={() => {
                        safeHaptics.light();
                        setMealRating(r.val);
                      }}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.ratingTileDigit, isSel && styles.ratingTileDigitActive]}>
                        {r.val}
                      </Text>
                      <Text style={[styles.ratingTileLabel, isSel && styles.ratingTileLabelActive]}>
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Hara Hachi Bu Philosophy Callout */}
              {mealRating === 3 ? (
                <View style={styles.satietyBenefitBox}>
                  <Ionicons name="sparkles" size={15} color={Colors.emerald} />
                  <Text style={styles.satietyBenefitText}>
                    <Text style={{ fontWeight: '800' }}>80% Satiety Mastered:</Text> Prevents insulin spikes, protects deep work cognitive stamina, and halts digestive lethargy.
                  </Text>
                </View>
              ) : mealRating >= 4 ? (
                <View style={styles.satietyWarningBox}>
                  <Ionicons name="alert-circle" size={15} color={Colors.ruby} />
                  <Text style={styles.satietyWarningText}>
                    <Text style={{ fontWeight: '800' }}>Heavy Zone:</Text> Overeating triggers mental fatigue and dopamine cravings. Note triggers to stay sovereign.
                  </Text>
                </View>
              ) : null}

              {/* Optional Food Note */}
              <Text style={[styles.subFieldLabel, { marginTop: 8 }]}>WHAT DID YOU EAT? (OPTIONAL)</Text>
              <TextInput
                style={styles.centeredTextInput}
                value={mealDesc}
                onChangeText={setMealDesc}
                placeholder="e.g. Rice, grilled chicken, plantain, greens..."
                placeholderTextColor={Colors.textMuted}
              />

              <TouchableOpacity 
                style={[styles.centeredSaveBtn, mealSaved && styles.centeredSaveBtnDone]}
                onPress={handleSaveMealInPlace}
                activeOpacity={0.8}
              >
                <Text style={styles.centeredSaveBtnText}>
                  {mealSaved ? `✓ ${selectedMeal} Satiety Recorded` : `Log ${selectedMeal} Satiety`}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity 
              style={styles.centeredDismissBtn}
              onPress={() => setActivePortal(null)}
            >
              <Text style={styles.centeredDismissText}>Close Satiety</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ======================================================== */}
      {/* 4. GUITAR SANCTUARY CENTERED MODAL                       */}
      {/* ======================================================== */}
      <Modal
        visible={activePortal === 'guitar'}
        transparent
        animationType="fade"
        onRequestClose={() => setActivePortal(null)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.modalOverlay}
        >
          <View style={[styles.centeredCard, { borderColor: Colors.honeyBorder }]}>
            {/* Header */}
            <View style={styles.centeredHeader}>
              <View style={[styles.centeredIconCircle, { backgroundColor: Colors.honeyDark }]}>
                <Ionicons name="musical-notes" size={24} color="#ffffff" />
              </View>
              <Text style={styles.centeredTitle}>ACOUSTIC GUITAR SANCTUARY</Text>
              <Text style={[styles.centeredSubtitle, { color: Colors.honeyDark }]}>
                Tactile Non-Screen Acoustic Joy & Drills
              </Text>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: SCREEN_HEIGHT * 0.52 }}
            >
              <Text style={styles.subFieldLabel}>DURATION (MINUTES)</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                {['15', '25', '35', '45'].map(mins => (
                  <TouchableOpacity
                    key={mins}
                    style={[
                      styles.minuteChip,
                      guitarMins === mins && styles.minuteChipActive
                    ]}
                    onPress={() => {
                      safeHaptics.light();
                      setGuitarMins(mins);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.minuteChipText, guitarMins === mins && styles.minuteChipTextActive]}>
                      {mins}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.subFieldLabel}>CHORDS, SONGS & PROGRESS</Text>
              <TextInput
                style={styles.centeredTextInput}
                value={guitarNotes}
                onChangeText={setGuitarNotes}
                placeholder="Chords practiced, fingerstyle, rhythm drills..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={2}
              />

              <TouchableOpacity 
                style={[styles.centeredSaveBtn, guitarSaved && styles.centeredSaveBtnDone]}
                onPress={handleSaveGuitarLocal}
                activeOpacity={0.8}
              >
                <Text style={styles.centeredSaveBtnText}>
                  {guitarSaved ? '✓ Guitar Session Logged' : 'Save Guitar Session'}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity 
              style={styles.centeredDismissBtn}
              onPress={() => setActivePortal(null)}
            >
              <Text style={styles.centeredDismissText}>Close Guitar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ======================================================== */}
      {/* 5. EVENING MICRO-REFLECTION CENTERED MODAL               */}
      {/* ======================================================== */}
      <Modal
        visible={activePortal === 'journal'}
        transparent
        animationType="fade"
        onRequestClose={() => setActivePortal(null)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.modalOverlay}
        >
          <View style={[styles.centeredCard, { borderColor: Colors.primaryBorder }]}>
            {/* Header */}
            <View style={styles.centeredHeader}>
              <View style={[styles.centeredIconCircle, { backgroundColor: Colors.primary }]}>
                <Ionicons name="journal" size={24} color="#ffffff" />
              </View>
              <Text style={styles.centeredTitle}>EVENING MICRO-REFLECTION</Text>
              <Text style={[styles.centeredSubtitle, { color: Colors.primary }]}>
                60-Second Wins, Friction & Tomorrow's Anchor
              </Text>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: SCREEN_HEIGHT * 0.52 }}
            >
              <Text style={styles.subFieldLabel}>TODAY'S WINS</Text>
              <TextInput
                style={styles.centeredTextInput}
                value={wins}
                onChangeText={setWins}
                placeholder="What went exceptionally well today?"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={[styles.subFieldLabel, { marginTop: 8 }]}>FRICTION & LESSONS</Text>
              <TextInput
                style={styles.centeredTextInput}
                value={friction}
                onChangeText={setFriction}
                placeholder="Where was there drift or resistance?"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={[styles.subFieldLabel, { marginTop: 8 }]}>TOMORROW'S FIRST ANCHOR</Text>
              <TextInput
                style={styles.centeredTextInput}
                value={tomorrow}
                onChangeText={setTomorrow}
                placeholder="e.g. Quant Bot & Multivariable Calculus"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={[styles.subFieldLabel, { marginTop: 8 }]}>READING TAKEAWAY (OPTIONAL)</Text>
              <TextInput
                style={styles.centeredTextInput}
                value={readingNotes}
                onChangeText={setReadingNotes}
                placeholder="Quiet reading insights, book chapter..."
                placeholderTextColor={Colors.textMuted}
              />

              <TouchableOpacity 
                style={[styles.centeredSaveBtn, { marginTop: 12 }, journalSaved && styles.centeredSaveBtnDone]}
                onPress={handleSaveJournalLocal}
                activeOpacity={0.8}
              >
                <Text style={styles.centeredSaveBtnText}>
                  {journalSaved ? '✓ Journal Reflection Sealed' : 'Seal Evening Reflection'}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity 
              style={styles.centeredDismissBtn}
              onPress={() => setActivePortal(null)}
            >
              <Text style={styles.centeredDismissText}>Close Reflection</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
    gap: 14,
  },
  portalsList: {
    gap: 12,
  },
  portalRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1.5,
    ...Shadows.card,
  },
  portalCardLeft: {
    marginRight: 12,
  },
  portalIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  portalCardBody: {
    flex: 1,
  },
  portalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  portalSectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.6,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  pillBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  portalCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  portalCardHighlight: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  portalCardSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  portalCardArrow: {
    paddingLeft: 8,
  },

  // Wisdom Hero Card
  wisdomCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    ...Shadows.soft,
  },
  wisdomHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  wisdomHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  wisdomBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  wisdomBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  wisdomQuote: {
    fontSize: 13,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 2,
  },
  wisdomAuthor: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 6,
    textAlign: 'right',
  },
  wisdomPillarsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  miniPillarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  miniPillarText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },

  // Centered Modal Overlays (Pattern from UrgeDefeaterModal)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  centeredCard: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.84,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1.5,
    ...Shadows.card,
  },
  centeredHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  centeredIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    ...Shadows.soft,
  },
  centeredTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 0.8,
  },
  centeredSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },

  // Purity Modal Elements
  purityHeroBox: {
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    marginBottom: Spacing.md,
  },
  purityHeroNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.primary,
  },
  purityHeroLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  metricDualRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: Spacing.lg,
  },
  metricBox: {
    flex: 1,
    backgroundColor: Colors.surfaceHighlight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  metricLbl: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 2,
  },
  urgeRedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.ruby,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    marginBottom: 8,
    ...Shadows.soft,
  },
  urgeRedButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  relapseMutedButton: {
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    backgroundColor: Colors.rubyMuted,
    borderWidth: 1,
    borderColor: Colors.rubyBorder,
  },
  relapseMutedButtonText: {
    color: Colors.ruby,
    fontSize: 12,
    fontWeight: '700',
  },

  // Anchors Elements
  anchorCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceHighlight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 8,
  },
  anchorCardItemDone: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primaryBorder,
  },
  anchorItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  anchorItemTitleDone: {
    color: Colors.primary,
  },
  anchorItemSubtitle: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  scriptureCardItem: {
    backgroundColor: Colors.surfaceHighlight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 8,
  },
  inputMicroLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  // Satiety Elements
  mealTabRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.md,
  },
  mealTabChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  mealTabChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  mealTabChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  mealTabChipTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  subFieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  ratingBar: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  ratingTile: {
    flex: 1,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  ratingTileTarget: {
    backgroundColor: Colors.emeraldMuted,
    borderColor: Colors.emerald,
  },
  ratingTileBlue: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  ratingTileRed: {
    backgroundColor: Colors.rubyMuted,
    borderColor: Colors.ruby,
  },
  ratingTileDigit: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  ratingTileDigitActive: {
    color: Colors.textPrimary,
  },
  ratingTileLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 2,
  },
  ratingTileLabelActive: {
    color: Colors.textPrimary,
  },
  satietyBenefitBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.emeraldMuted,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: 8,
  },
  satietyBenefitText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textPrimary,
    lineHeight: 15,
  },
  satietyWarningBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Colors.rubyMuted,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: 8,
  },
  satietyWarningText: {
    flex: 1,
    fontSize: 11,
    color: Colors.ruby,
    lineHeight: 15,
  },

  // Sanctuary Elements
  minuteChip: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  minuteChipActive: {
    backgroundColor: Colors.honey,
    borderColor: Colors.honeyDark,
  },
  minuteChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  minuteChipTextActive: {
    color: Colors.honeyDark,
    fontWeight: '800',
  },

  // Inputs & Save Buttons
  centeredTextInput: {
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: 12,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 8,
  },
  centeredSaveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: 4,
    ...Shadows.soft,
  },
  centeredSaveBtnDone: {
    backgroundColor: Colors.emerald,
  },
  centeredSaveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  centeredDismissBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
  },
  centeredDismissText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
});
