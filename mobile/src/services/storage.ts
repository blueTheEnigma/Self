import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  SelfAppState, 
  DayPhase, 
  WorkoutSession, 
  SpendCategory, 
  ProjectFocusTag,
  BodyMetricLog,
  HobbyLogEntry,
  SpiritualAnchorState,
  DailySnapshot,
  AppSettings,
  GymLog,
  ActiveFocusSession,
  ScholarshipOutreachRecord
} from '../types';

const STORAGE_KEY = '@self_companion_state_v3';

export function getTodayDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getCurrentDayPhase(): DayPhase {
  const now = new Date();
  const hours = now.getHours();
  const mins = now.getMinutes();
  const time = hours + mins / 60;

  if (time >= 5.5 && time < 8.5) return 'MORNING_RITUAL';
  if (time >= 8.5 && time < 10.25) return 'DEEP_WORK_1';
  if (time >= 10.25 && time < 11.5) return 'MIDDAY_BUFFER';
  if (time >= 11.5 && time < 13.0) return 'DEEP_WORK_2';
  if (time >= 13.0 && time < 14.5) return 'AFTERNOON_BUFFER';
  if (time >= 14.5 && time < 15.75) return 'DEEP_WORK_3';
  if (time >= 15.75 && time < 20.0) return 'LIFE_BUFFER';
  if (time >= 20.0 && time < 21.5) return 'EVENING_SANCTUARY';
  return 'NIGHT_REST';
}

export function isRunDay(date: Date = new Date(), customRunDays: number[] = [1, 3, 5]): boolean {
  const day = date.getDay();
  return customRunDays.includes(day);
}

export function getInitialState(): SelfAppState {
  const today = getTodayDateString();
  const defaultRunDays = [1, 3, 5]; // Mon, Wed, Fri
  const runDay = isRunDay(new Date(), defaultRunDays);

  return {
    currentDate: today,
    workout: {
      date: today,
      isRunDay: runDay,
      runDistanceKm: runDay ? 2.5 : 0,
      rpeRating: 3,
      completed: false,
      consecutiveTargetHits: 0,
      exercises: [
        {
          name: 'Pushups',
          type: 'REPS',
          target: 10,
          completedSets: [0, 0, 0],
          unit: 'reps'
        },
        {
          name: 'Horse Stance',
          type: 'HOLD_SECONDS',
          target: 20,
          completedSets: [0, 0, 0],
          unit: 'seconds'
        },
        {
          name: 'Active Dead Hang',
          type: 'HOLD_SECONDS',
          target: 20,
          completedSets: [0, 0, 0],
          unit: 'seconds'
        },
        {
          name: 'Situps',
          type: 'REPS',
          target: 10,
          completedSets: [0, 0, 0],
          unit: 'reps'
        }
      ]
    },
    overloadConfig: {
      pushupsTarget: 10,
      horseStanceSeconds: 20,
      activeHangSeconds: 20,
      situpsTarget: 10,
      consecutiveCleanSessions: 0
    },
    spiritual: {
      wakeupPrayerDone: false,
      trackPrayerDone: false,
      bibleReadingDone: false,
      scripturePassage: '',
      audiobookDone: false,
      audiobookTitle: ''
    },
    integrity: {
      waterMl: 500,
      waterGoalMl: 3000,
      fullnessLogs: [],
      purityStreakDays: 1,
      urgeDivertedCount: 0,
      relapseHistory: [],
      consecutiveControlledSatietyDays: 1,
      fastingModeUnlocked: false,
      lastPurityCheckDate: today
    },
    transactions: [],
    focusBlocks: [],
    sanctuary: {
      guitarMinutesToday: 0,
      photoEditingThisWeek: false,
      novelReadingThisWeek: false,
      poemStoryThisWeek: false,
      hobbyLogs: [],
      microJournalWins: '',
      microJournalFriction: '',
      tomorrowAnchor: 'Quant Bot & Multivariable Calculus',
      lastSavedDate: today
    },
    scholarshipOutreachDone: false,
    scholarshipOutreachNotes: '',
    scholarshipOutreachHistory: [],
    settings: {
      runDays: [1, 3, 5],
      nonRunDayPreference: 'gym',
      waterGoalMl: 3000,
      deepWorkGoalMinutes: 90,
      exerciseVariants: {
        pushupsName: 'Pushups',
        horseStanceName: 'Horse Stance',
        activeHangName: 'Active Dead Hang',
        situpsName: 'Situps',
      },
    },
    activeFocusSession: {
      startTime: null,
      targetMinutes: 90,
      elapsedSeconds: 0,
      isActive: false,
      isRestCooldown: false,
      project: 'Quant Bot',
    },
    bodyWeightKg: 96.5,
    waistCircumferenceCm: 90,
    tummyCircumferenceCm: 100,
    anklePainRating: 2,
    bodyMetricsHistory: [
      {
        date: today,
        weightKg: 96.5,
        waistCm: 90,
        tummyCm: 100,
        ankleStrain: 2
      }
    ],
    dailyHistory: {}
  };
}

class StorageService {
  private cache: SelfAppState | null = null;

  private buildSnapshot(state: SelfAppState): DailySnapshot {
    const movementSets = state.workout.exercises.reduce(
      (acc, e) => acc + e.completedSets.filter(s => s > 0).length, 0
    );
    const focusMinutes = state.focusBlocks
      .filter(b => b.timestamp.startsWith(state.currentDate))
      .reduce((acc, b) => acc + b.durationMinutes, 0);
    const todaySpend = state.transactions
      .filter(t => t.timestamp.startsWith(state.currentDate))
      .reduce((acc, t) => acc + t.amount, 0);

    const isRunDayToday = state.workout.isRunDay;
    const isMovementComplete = isRunDayToday
      ? (Boolean(state.workout.runLog) && (state.workout.completed || movementSets >= 12))
      : (Boolean(state.workout.gymLog) || state.workout.completed || movementSets >= 12);

    const items = [
      Boolean(state.spiritual.wakeupPrayerDone),
      Boolean(state.spiritual.trackPrayerDone),
      Boolean(state.spiritual.bibleReadingDone),
      Boolean(state.spiritual.audiobookDone),
      Boolean(state.scholarshipOutreachDone),
      isMovementComplete,
      state.integrity.fullnessLogs.length >= 2,
      focusMinutes >= 90,
      (state.sanctuary.guitarMinutesToday || 0) >= 15,
      Boolean(state.sanctuary.microJournalWins),
    ];
    const totalDone = items.filter(Boolean).length;
    const scorePercent = Math.round((totalDone / 10) * 100);

    return {
      date: state.currentDate,
      checklist: {
        wakeupPrayerDone: Boolean(state.spiritual.wakeupPrayerDone),
        trackPrayerDone: Boolean(state.spiritual.trackPrayerDone),
        bibleReadingDone: Boolean(state.spiritual.bibleReadingDone),
        audiobookDone: Boolean(state.spiritual.audiobookDone),
        scholarshipOutreachDone: Boolean(state.scholarshipOutreachDone),
        movementSetsDone: movementSets,
        movementCompleted: isMovementComplete,
        gymLogged: Boolean(state.workout.gymLog),
        satietyMealsLogged: state.integrity.fullnessLogs.length,
        focusMinutes,
        guitarMinutes: state.sanctuary.guitarMinutesToday || 0,
        microJournalDone: Boolean(state.sanctuary.microJournalWins),
        waterMl: state.integrity.waterMl,
        totalCompletedItems: totalDone,
        completionScorePercent: scorePercent,
      },
      focusSessionsCount: state.focusBlocks.filter(b => b.timestamp.startsWith(state.currentDate)).length,
      totalSpendNgn: todaySpend,
      runLog: state.workout.runLog,
      gymLog: state.workout.gymLog,
      bodyWeightKg: state.bodyWeightKg,
      ankleStrainRating: state.anklePainRating,
      tomorrowAnchor: state.sanctuary.tomorrowAnchor,
      notes: state.workout.notes,
    };
  }

  async loadState(): Promise<SelfAppState> {
    if (this.cache) return this.cache;

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: SelfAppState = JSON.parse(raw);
        const today = getTodayDateString();
        
        if (parsed.currentDate !== today) {
          if (!parsed.dailyHistory) {
            parsed.dailyHistory = {};
          }
          // Build and persist snapshot of previous day before resetting
          parsed.dailyHistory[parsed.currentDate] = this.buildSnapshot(parsed);

          parsed.currentDate = today;
          parsed.workout.date = today;
          const userRunDays = parsed.settings?.runDays || [1, 3, 5];
          parsed.workout.isRunDay = isRunDay(new Date(), userRunDays);
          parsed.workout.completed = false;
          parsed.workout.runLog = undefined; // Reset run log for fresh day
          parsed.workout.gymLog = undefined; // Reset gym log for fresh day
          parsed.workout.notes = ''; // Reset notes for fresh day
          parsed.workout.rpeRating = 3; // Reset rpe to default
          parsed.workout.exercises.forEach(e => {
            e.completedSets = [0, 0, 0];
            e.difficultyRating = undefined;
          });
          parsed.spiritual.wakeupPrayerDone = false;
          parsed.spiritual.trackPrayerDone = false;
          parsed.spiritual.bibleReadingDone = false;
          if (parsed.spiritual) {
            parsed.spiritual.audiobookDone = false;
          }
          parsed.scholarshipOutreachDone = false;
          parsed.integrity.waterMl = 500;
          parsed.integrity.fullnessLogs = [];
          parsed.sanctuary.guitarMinutesToday = 0;
          parsed.sanctuary.microJournalWins = '';
          parsed.sanctuary.microJournalFriction = '';
          parsed.integrity.purityStreakDays += 1;
          parsed.activeFocusSession = {
            startTime: null,
            targetMinutes: parsed.settings?.deepWorkGoalMinutes || 90,
            elapsedSeconds: 0,
            isActive: false,
            isRestCooldown: false,
            project: parsed.activeFocusSession?.project || 'Quant Bot',
          };
        }

        // Live day safeguard: If runLog exists without today's timestamp, clear it from today's live session
        if (parsed.workout?.runLog && (!parsed.workout.runLog.timestamp || !parsed.workout.runLog.timestamp.startsWith(today))) {
          parsed.workout.runLog = undefined;
        }
        // Live day safeguard for gymLog
        if (parsed.workout?.gymLog && (!parsed.workout.gymLog.timestamp || !parsed.workout.gymLog.timestamp.startsWith(today))) {
          parsed.workout.gymLog = undefined;
        }

        // Live day safeguard for workout date and stale notes carried over before fix
        if (parsed.workout?.date && parsed.workout.date !== today) {
          parsed.workout.date = today;
          parsed.workout.completed = false;
          parsed.workout.runLog = undefined;
          parsed.workout.gymLog = undefined;
          parsed.workout.notes = '';
          parsed.workout.rpeRating = 3;
          parsed.workout.exercises.forEach(e => {
            e.completedSets = [0, 0, 0];
            e.difficultyRating = undefined;
          });
        }

        // Wipe leaked yesterday notes if today's workout has 0 completed sets and is incomplete
        const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (
          parsed.dailyHistory?.[yesterdayDate]?.notes &&
          parsed.workout?.notes === parsed.dailyHistory[yesterdayDate].notes &&
          !parsed.workout.completed &&
          parsed.workout.exercises.every(e => e.completedSets.every(s => s === 0))
        ) {
          parsed.workout.notes = '';
        }

        // Ensure backward compatibility
        if (parsed.integrity.urgeDivertedCount === undefined) {
          parsed.integrity.urgeDivertedCount = 0;
        }
        if (!parsed.integrity.relapseHistory) {
          parsed.integrity.relapseHistory = [];
        }
        if (!parsed.dailyHistory) {
          parsed.dailyHistory = {};
        }
        if (parsed.scholarshipOutreachDone === undefined) {
          parsed.scholarshipOutreachDone = false;
        }
        if (!parsed.settings) {
          parsed.settings = getInitialState().settings;
        }
        if (!parsed.activeFocusSession) {
          parsed.activeFocusSession = getInitialState().activeFocusSession!;
        }

        // Apply custom exercise names if saved in settings
        if (parsed.settings?.exerciseVariants) {
          const v = parsed.settings.exerciseVariants;
          if (v.pushupsName && parsed.workout.exercises[0]) parsed.workout.exercises[0].name = v.pushupsName;
          if (v.horseStanceName && parsed.workout.exercises[1]) parsed.workout.exercises[1].name = v.horseStanceName;
          if (v.activeHangName && parsed.workout.exercises[2]) parsed.workout.exercises[2].name = v.activeHangName;
          if (v.situpsName && parsed.workout.exercises[3]) parsed.workout.exercises[3].name = v.situpsName;
        }

        this.cache = parsed;
        return parsed;
      }
    } catch (e) {
      console.warn('Storage read failed, using initial state:', e);
    }

    const init = getInitialState();
    this.cache = init;
    await this.saveState(init);
    return init;
  }

  async saveState(state: SelfAppState): Promise<void> {
    this.cache = state;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('AsyncStorage write error:', e);
    }
  }

  // --- Spiritual Anchor Actions ---
  async toggleSpiritual(item: 'wakeup' | 'track' | 'bible' | 'audiobook', passage?: string, takeaway?: string): Promise<SelfAppState> {
    const state = await this.loadState();
    if (item === 'wakeup') state.spiritual.wakeupPrayerDone = !state.spiritual.wakeupPrayerDone;
    if (item === 'track') state.spiritual.trackPrayerDone = !state.spiritual.trackPrayerDone;
    if (item === 'bible') {
      state.spiritual.bibleReadingDone = !state.spiritual.bibleReadingDone;
      if (passage !== undefined) state.spiritual.scripturePassage = passage;
    }
    if (item === 'audiobook') {
      state.spiritual.audiobookDone = !state.spiritual.audiobookDone;
      if (passage !== undefined) state.spiritual.audiobookTitle = passage;
      if (takeaway !== undefined) state.spiritual.audiobookTakeaway = takeaway;
    }
    await this.saveState(state);
    return state;
  }

  // --- Scholarship Outreach Actions (10th Covenant Pillar) ---
  async toggleScholarshipOutreach(notes?: string): Promise<SelfAppState> {
    const state = await this.loadState();
    state.scholarshipOutreachDone = !state.scholarshipOutreachDone;
    if (notes !== undefined) state.scholarshipOutreachNotes = notes;
    await this.saveState(state);
    return state;
  }

  async saveScholarshipOutreach(entry: {
    professorName: string;
    university: string;
    researchTopic?: string;
    notes?: string;
  }): Promise<SelfAppState> {
    const state = await this.loadState();
    if (!state.scholarshipOutreachHistory) {
      state.scholarshipOutreachHistory = [];
    }
    const newRecord: ScholarshipOutreachRecord = {
      id: `outreach_${Date.now()}`,
      timestamp: new Date().toISOString(),
      professorName: entry.professorName.trim(),
      university: entry.university.trim(),
      researchTopic: entry.researchTopic?.trim(),
      notes: entry.notes?.trim(),
    };
    state.scholarshipOutreachHistory.unshift(newRecord);
    state.scholarshipOutreachDone = true;
    state.scholarshipOutreachNotes = `${entry.professorName} • ${entry.university}${entry.researchTopic ? ` (${entry.researchTopic})` : ''}`;
    await this.saveState(state);
    return state;
  }

  // --- Gym Workout Recall Superpower ---
  async getLastGymWorkout(matchingSplit?: string): Promise<GymLog | null> {
    const state = await this.loadState();
    // 1. Check if today already has a gymLog
    if (state.workout?.gymLog && (!matchingSplit || state.workout.gymLog.split === matchingSplit)) {
      return state.workout.gymLog;
    }
    // 2. Search daily history in reverse chronological order
    const history = state.dailyHistory || {};
    const sortedDates = Object.keys(history).sort().reverse();
    for (const d of sortedDates) {
      const snap = history[d];
      if (snap?.gymLog) {
        if (!matchingSplit || snap.gymLog.split === matchingSplit) {
          return snap.gymLog;
        }
      }
    }
    // 3. If matchingSplit was provided but no split-matched log was found, fallback to any most recent gym log
    if (matchingSplit) {
      for (const d of sortedDates) {
        const snap = history[d];
        if (snap?.gymLog) return snap.gymLog;
      }
    }
    return null;
  }

  // --- Kaizen Workout & Running Actions ---
  async toggleWorkoutSet(exerciseIndex: number, setIndex: number, value?: number): Promise<SelfAppState> {
    const state = await this.loadState();
    const ex = state.workout.exercises[exerciseIndex];
    if (!ex) return state;

    const currentVal = ex.completedSets[setIndex];
    if (value !== undefined) {
      ex.completedSets[setIndex] = Math.max(0, value);
    } else if (currentVal > 0) {
      ex.completedSets[setIndex] = 0;
    } else {
      ex.completedSets[setIndex] = ex.target;
    }

    const allDone = state.workout.exercises.every(e => e.completedSets.every(s => s > 0));
    if (allDone) {
      state.workout.completed = true;
      const allHitTarget = state.workout.exercises.every(e => e.completedSets.every(s => s >= e.target));
      if (allHitTarget) {
        state.overloadConfig.consecutiveCleanSessions += 1;

        if (state.overloadConfig.consecutiveCleanSessions >= 3) {
          state.overloadConfig.pendingSuggestion = {
            exercise: state.workout.exercises[0]?.name || 'Pushups',
            oldTarget: state.overloadConfig.pushupsTarget,
            newTarget: state.overloadConfig.pushupsTarget + 1,
            unit: 'reps'
          };
        }
      }
    } else {
      state.workout.completed = false;
    }

    await this.saveState(state);
    return state;
  }

  async saveRunLog(distanceKm: number, pace?: string, durationMinutes?: number, feelingSummary?: string): Promise<SelfAppState> {
    const state = await this.loadState();
    state.workout.runLog = {
      distanceKm,
      paceMinPerKm: pace,
      durationMinutes,
      feelingSummary,
      timestamp: new Date().toISOString()
    };
    await this.saveState(state);
    return state;
  }

  async saveGymLog(split: string, exercisesSummary: string, durationMinutes?: number, feelingSummary?: string): Promise<SelfAppState> {
    const state = await this.loadState();
    state.workout.gymLog = {
      split,
      exercisesSummary,
      durationMinutes,
      feelingSummary,
      timestamp: new Date().toISOString()
    };
    await this.saveState(state);
    return state;
  }

  async updateExerciseDifficulty(exerciseIndex: number, difficultyRating: number): Promise<SelfAppState> {
    const state = await this.loadState();
    if (state.workout.exercises[exerciseIndex]) {
      state.workout.exercises[exerciseIndex].difficultyRating = difficultyRating;
      await this.saveState(state);
    }
    return state;
  }

  async updateWorkoutRpe(rpe: number, notes?: string): Promise<SelfAppState> {
    const state = await this.loadState();
    state.workout.rpeRating = rpe;
    if (notes !== undefined) state.workout.notes = notes;
    await this.saveState(state);
    return state;
  }

  async acceptOverloadSuggestion(): Promise<SelfAppState> {
    const state = await this.loadState();
    const suggestion = state.overloadConfig.pendingSuggestion;
    if (suggestion) {
      const ex0Name = state.workout.exercises[0]?.name || 'Pushups';
      const ex1Name = state.workout.exercises[1]?.name || 'Horse Stance';
      const ex2Name = state.workout.exercises[2]?.name || 'Active Dead Hang';
      const ex3Name = state.workout.exercises[3]?.name || 'Situps';

      if (suggestion.exercise === ex0Name || suggestion.exercise === 'Pushups') {
        state.overloadConfig.pushupsTarget = suggestion.newTarget;
      } else if (suggestion.exercise === ex1Name || suggestion.exercise === 'Horse Stance') {
        state.overloadConfig.horseStanceSeconds = suggestion.newTarget;
      } else if (suggestion.exercise === ex2Name || suggestion.exercise === 'Active Dead Hang') {
        state.overloadConfig.activeHangSeconds = suggestion.newTarget;
      } else if (suggestion.exercise === ex3Name || suggestion.exercise === 'Situps') {
        state.overloadConfig.situpsTarget = suggestion.newTarget;
      }
      
      state.workout.exercises.forEach(e => {
        if (e.name === suggestion.exercise) {
          e.target = suggestion.newTarget;
        }
      });

      state.overloadConfig.consecutiveCleanSessions = 0;
      state.overloadConfig.pendingSuggestion = undefined;
    }
    await this.saveState(state);
    return state;
  }

  // --- Settings & Protocol Customization ---
  async updateSettings(newSettings: Partial<AppSettings>): Promise<SelfAppState> {
    const state = await this.loadState();
    const current = state.settings || getInitialState().settings!;
    const updated: AppSettings = {
      ...current,
      ...newSettings,
      exerciseVariants: {
        ...current.exerciseVariants,
        ...(newSettings.exerciseVariants || {}),
      },
    };
    state.settings = updated;

    if (newSettings.runDays) {
      state.workout.isRunDay = isRunDay(new Date(), newSettings.runDays);
    }
    if (newSettings.waterGoalMl) {
      state.integrity.waterGoalMl = newSettings.waterGoalMl;
    }
    if (newSettings.exerciseVariants) {
      const v = newSettings.exerciseVariants;
      if (v.pushupsName && state.workout.exercises[0]) state.workout.exercises[0].name = v.pushupsName;
      if (v.horseStanceName && state.workout.exercises[1]) state.workout.exercises[1].name = v.horseStanceName;
      if (v.activeHangName && state.workout.exercises[2]) state.workout.exercises[2].name = v.activeHangName;
      if (v.situpsName && state.workout.exercises[3]) state.workout.exercises[3].name = v.situpsName;
    }

    await this.saveState(state);
    return state;
  }

  async updateKaizenTargets(targets: {
    pushupsTarget?: number;
    horseStanceSeconds?: number;
    activeHangSeconds?: number;
    situpsTarget?: number;
  }): Promise<SelfAppState> {
    const state = await this.loadState();
    if (targets.pushupsTarget !== undefined) {
      state.overloadConfig.pushupsTarget = targets.pushupsTarget;
      if (state.workout.exercises[0]) state.workout.exercises[0].target = targets.pushupsTarget;
    }
    if (targets.horseStanceSeconds !== undefined) {
      state.overloadConfig.horseStanceSeconds = targets.horseStanceSeconds;
      if (state.workout.exercises[1]) state.workout.exercises[1].target = targets.horseStanceSeconds;
    }
    if (targets.activeHangSeconds !== undefined) {
      state.overloadConfig.activeHangSeconds = targets.activeHangSeconds;
      if (state.workout.exercises[2]) state.workout.exercises[2].target = targets.activeHangSeconds;
    }
    if (targets.situpsTarget !== undefined) {
      state.overloadConfig.situpsTarget = targets.situpsTarget;
      if (state.workout.exercises[3]) state.workout.exercises[3].target = targets.situpsTarget;
    }
    await this.saveState(state);
    return state;
  }

  // --- Integrity, Hydration & Satiety Actions ---
  async addWater(ml: number = 500): Promise<SelfAppState> {
    const state = await this.loadState();
    state.integrity.waterMl = Math.min(state.integrity.waterMl + ml, 5000);
    await this.saveState(state);
    return state;
  }

  async logMealFullness(
    meal: 'Breakfast' | 'Lunch' | 'Dinner', 
    rating: number,
    description?: string,
    trigger?: string
  ): Promise<SelfAppState> {
    const state = await this.loadState();
    const existing = state.integrity.fullnessLogs.findIndex(f => f.meal === meal);
    const newLog = { 
        meal, 
        rating, 
        description,
        trigger,
        timestamp: new Date().toISOString() 
    };

    if (existing >= 0) {
      state.integrity.fullnessLogs[existing] = newLog;
    } else {
      state.integrity.fullnessLogs.push(newLog);
    }

    const allControlled = state.integrity.fullnessLogs.every(l => l.rating <= 3);
    if (allControlled && state.integrity.fullnessLogs.length >= 2) {
      state.integrity.consecutiveControlledSatietyDays += 1;
      if (state.integrity.consecutiveControlledSatietyDays >= 14) {
        state.integrity.fastingModeUnlocked = true;
      }
    } else if (rating > 3) {
      state.integrity.consecutiveControlledSatietyDays = Math.max(state.integrity.consecutiveControlledSatietyDays - 1, 0);
    }

    await this.saveState(state);
    return state;
  }

  async recordUrgeDefeated(): Promise<SelfAppState> {
    const state = await this.loadState();
    state.integrity.urgeDivertedCount += 1;
    state.integrity.lastUrgeDefeatedTimestamp = new Date().toISOString();
    await this.saveState(state);
    return state;
  }

  async recordRelapse(reflection?: string): Promise<SelfAppState> {
    const state = await this.loadState();
    state.integrity.relapseHistory.unshift({
      date: getTodayDateString(),
      reflection
    });
    // Reset active streak to Day 0 (Day 1 starts fresh)
    state.integrity.purityStreakDays = 0;
    await this.saveState(state);
    return state;
  }

  // --- Fast 3-Second Spend Action ---
  async recordQuickSpend(amount: number, category: SpendCategory, note?: string): Promise<SelfAppState> {
    const state = await this.loadState();
    const newTx = {
      id: 'tx-' + Date.now().toString(36),
      amount,
      currency: 'NGN' as const,
      category,
      note,
      timestamp: new Date().toISOString()
    };
    state.transactions.unshift(newTx);
    await this.saveState(state);
    return state;
  }

  async deleteTransaction(id: string): Promise<SelfAppState> {
    const state = await this.loadState();
    state.transactions = state.transactions.filter(t => t.id !== id);
    await this.saveState(state);
    return state;
  }

  // --- Deep Work Focus Block Actions ---
  async updateActiveFocusSession(session: Partial<ActiveFocusSession>): Promise<SelfAppState> {
    const state = await this.loadState();
    const current = state.activeFocusSession || getInitialState().activeFocusSession!;
    state.activeFocusSession = {
      ...current,
      ...session,
    };
    await this.saveState(state);
    return state;
  }

  async recordFocusBlock(project: ProjectFocusTag, durationMinutes: number): Promise<SelfAppState> {
    const state = await this.loadState();
    const newBlock = {
      id: 'focus-' + Date.now().toString(36),
      project,
      durationMinutes,
      completedMinutes: durationMinutes,
      timestamp: new Date().toISOString(),
      completed: true
    };
    state.focusBlocks.unshift(newBlock);
    await this.saveState(state);
    return state;
  }

  // --- Evening Sanctuary & Hobbies Actions ---
  async addGuitarMinutes(mins: number = 15, details?: string): Promise<SelfAppState> {
    const state = await this.loadState();
    state.sanctuary.guitarMinutesToday += mins;
    if (details) {
      state.sanctuary.hobbyLogs.unshift({
        type: 'guitar',
        details,
        timestamp: new Date().toISOString()
      });
    }
    await this.saveState(state);
    return state;
  }

  async logGuitarPractice(mins: number = 15, notes?: string): Promise<SelfAppState> {
    const state = await this.loadState();
    state.sanctuary.guitarMinutesToday += mins;
    if (notes) state.sanctuary.guitarNotesToday = notes;
    state.sanctuary.hobbyLogs.unshift({
      id: 'hobby-' + Date.now().toString(36),
      type: 'guitar',
      details: notes || `${mins}m acoustic guitar session`,
      durationMinutes: mins,
      timestamp: new Date().toISOString()
    });
    await this.saveState(state);
    return state;
  }

  async logReadingSession(mins: number, title?: string, notes?: string): Promise<SelfAppState> {
    const state = await this.loadState();
    state.sanctuary.readingMinutesToday = (state.sanctuary.readingMinutesToday || 0) + mins;
    if (notes) state.sanctuary.readingNotesToday = notes;
    state.sanctuary.novelReadingThisWeek = true;
    state.sanctuary.hobbyLogs.unshift({
      id: 'hobby-' + Date.now().toString(36),
      type: 'reading',
      title,
      details: notes || `Read for ${mins}m`,
      durationMinutes: mins,
      timestamp: new Date().toISOString()
    });
    await this.saveState(state);
    return state;
  }

  async logWritingSession(notes: string, title?: string): Promise<SelfAppState> {
    const state = await this.loadState();
    state.sanctuary.writingNotesToday = notes;
    state.sanctuary.poemStoryThisWeek = true;
    state.sanctuary.hobbyLogs.unshift({
      id: 'hobby-' + Date.now().toString(36),
      type: 'writing',
      title,
      details: notes,
      timestamp: new Date().toISOString()
    });
    await this.saveState(state);
    return state;
  }

  async logOtherActivity(activity: string, notes?: string): Promise<SelfAppState> {
    const state = await this.loadState();
    state.sanctuary.otherActivityToday = activity;
    state.sanctuary.hobbyLogs.unshift({
      id: 'hobby-' + Date.now().toString(36),
      type: 'other',
      title: activity,
      details: notes || activity,
      timestamp: new Date().toISOString()
    });
    await this.saveState(state);
    return state;
  }

  async logHobbySession(type: 'photo' | 'novel' | 'writing', details: string): Promise<SelfAppState> {
    const state = await this.loadState();
    if (type === 'photo') state.sanctuary.photoEditingThisWeek = true;
    if (type === 'novel') state.sanctuary.novelReadingThisWeek = true;
    if (type === 'writing') state.sanctuary.poemStoryThisWeek = true;

    state.sanctuary.hobbyLogs.unshift({
      type,
      details,
      timestamp: new Date().toISOString()
    });

    await this.saveState(state);
    return state;
  }

  async saveEveningReflection(wins: string, friction: string, tomorrow: string): Promise<SelfAppState> {
    const state = await this.loadState();
    state.sanctuary.microJournalWins = wins;
    state.sanctuary.microJournalFriction = friction;
    state.sanctuary.tomorrowAnchor = tomorrow;
    await this.saveState(state);
    return state;
  }

  // --- Weekly Body Metrics Logging ---
  async logWeeklyBodyMetrics(
    weightKg: number, 
    waistCm: number, 
    tummyCm: number, 
    ankleStrain: number
  ): Promise<SelfAppState> {
    const state = await this.loadState();
    state.bodyWeightKg = weightKg;
    state.waistCircumferenceCm = waistCm;
    state.tummyCircumferenceCm = tummyCm;
    state.anklePainRating = ankleStrain;

    const newLog: BodyMetricLog = {
      date: getTodayDateString(),
      weightKg,
      waistCm,
      tummyCm,
      ankleStrain
    };

    state.bodyMetricsHistory.unshift(newLog);
    await this.saveState(state);
    return state;
  }
}

export const storage = new StorageService();
