import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  SelfAppState, 
  DayPhase, 
  WorkoutSession, 
  SpendCategory, 
  ProjectFocusTag 
} from '../types';

const STORAGE_KEY = '@self_companion_state_v1';

export function getTodayDateString(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
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

export function isRunDay(date: Date = new Date()): boolean {
  const day = date.getDay(); // 0 is Sun, 1 is Mon, 3 is Wed, 5 is Fri
  return day === 1 || day === 3 || day === 5;
}

export function isSabbathDay(date: Date = new Date()): boolean {
  return date.getDay() === 0;
}

export function getInitialState(): SelfAppState {
  const today = getTodayDateString();
  const runDay = isRunDay();

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
    integrity: {
      waterMl: 500, // Morning 500ml water anchor
      waterGoalMl: 3000,
      fullnessLogs: [],
      purityStreakDays: 1, // Day 1 of No Nut November
      lastPurityCheckDate: today
    },
    transactions: [],
    focusBlocks: [],
    sanctuary: {
      guitarMinutesToday: 0,
      photoEditingThisWeek: false,
      novelReadingThisWeek: false,
      poemStoryThisWeek: false,
      microJournalWins: '',
      microJournalFriction: '',
      tomorrowAnchor: 'Quant Bot & Multivariable Calculus',
      lastSavedDate: today
    },
    bodyWeightKg: 96.5,
    waistCircumferenceCm: 90,
    tummyCircumferenceCm: 100,
    anklePainRating: 2 // slight ache from recent runs
  };
}

class StorageService {
  private cache: SelfAppState | null = null;

  async loadState(): Promise<SelfAppState> {
    if (this.cache) return this.cache;

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: SelfAppState = JSON.parse(raw);
        const today = getTodayDateString();
        
        // Reset daily metrics if day changed
        if (parsed.currentDate !== today) {
          parsed.currentDate = today;
          parsed.workout.date = today;
          parsed.workout.isRunDay = isRunDay();
          parsed.workout.completed = false;
          parsed.workout.exercises.forEach(e => {
            e.completedSets = [0, 0, 0];
          });
          parsed.integrity.waterMl = 500; // Fresh 500ml upon wake
          parsed.integrity.fullnessLogs = [];
          parsed.sanctuary.guitarMinutesToday = 0;
          parsed.sanctuary.microJournalWins = '';
          parsed.sanctuary.microJournalFriction = '';
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

  // --- Kaizen Workout Actions ---
  async toggleWorkoutSet(exerciseIndex: number, setIndex: number, value?: number): Promise<SelfAppState> {
    const state = await this.loadState();
    const ex = state.workout.exercises[exerciseIndex];
    if (!ex) return state;

    const currentVal = ex.completedSets[setIndex];
    if (currentVal > 0) {
      ex.completedSets[setIndex] = 0; // untoggle
    } else {
      ex.completedSets[setIndex] = value !== undefined ? value : ex.target;
    }

    // Check if entire workout completed
    const allDone = state.workout.exercises.every(e => e.completedSets.every(s => s >= e.target));
    if (allDone && !state.workout.completed) {
      state.workout.completed = true;
      state.overloadConfig.consecutiveCleanSessions += 1;

      // 3-Session Kaizen Overload Rule trigger!
      if (state.overloadConfig.consecutiveCleanSessions >= 3) {
        state.overloadConfig.pendingSuggestion = {
          exercise: 'Pushups',
          oldTarget: state.overloadConfig.pushupsTarget,
          newTarget: state.overloadConfig.pushupsTarget + 1,
          unit: 'reps'
        };
      }
    }

    await this.saveState(state);
    return state;
  }

  async acceptOverloadSuggestion(): Promise<SelfAppState> {
    const state = await this.loadState();
    const suggestion = state.overloadConfig.pendingSuggestion;
    if (suggestion) {
      if (suggestion.exercise === 'Pushups') {
        state.overloadConfig.pushupsTarget = suggestion.newTarget;
      } else if (suggestion.exercise === 'Horse Stance') {
        state.overloadConfig.horseStanceSeconds = suggestion.newTarget;
      } else if (suggestion.exercise === 'Active Dead Hang') {
        state.overloadConfig.activeHangSeconds = suggestion.newTarget;
      } else if (suggestion.exercise === 'Situps') {
        state.overloadConfig.situpsTarget = suggestion.newTarget;
      }
      
      // Update targets on active exercises
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

  // --- Integrity & Habit Actions ---
  async addWater(ml: number = 500): Promise<SelfAppState> {
    const state = await this.loadState();
    state.integrity.waterMl = Math.min(state.integrity.waterMl + ml, 5000);
    await this.saveState(state);
    return state;
  }

  async logMealFullness(meal: 'Breakfast' | 'Lunch' | 'Dinner', rating: number): Promise<SelfAppState> {
    const state = await this.loadState();
    const existing = state.integrity.fullnessLogs.findIndex(f => f.meal === meal);
    const newLog = { meal, rating, timestamp: new Date().toISOString() };
    if (existing >= 0) {
      state.integrity.fullnessLogs[existing] = newLog;
    } else {
      state.integrity.fullnessLogs.push(newLog);
    }
    await this.saveState(state);
    return state;
  }

  async recordUrgeDefeated(): Promise<SelfAppState> {
    const state = await this.loadState();
    state.integrity.lastUrgeDefeatedTimestamp = new Date().toISOString();
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

  // --- Deep Work Focus Block Actions ---
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

  // --- Evening Sanctuary Actions ---
  async addGuitarMinutes(mins: number = 15): Promise<SelfAppState> {
    const state = await this.loadState();
    state.sanctuary.guitarMinutesToday += mins;
    await this.saveState(state);
    return state;
  }

  async toggleCreativeQuest(quest: 'photo' | 'novel' | 'writing'): Promise<SelfAppState> {
    const state = await this.loadState();
    if (quest === 'photo') state.sanctuary.photoEditingThisWeek = !state.sanctuary.photoEditingThisWeek;
    if (quest === 'novel') state.sanctuary.novelReadingThisWeek = !state.sanctuary.novelReadingThisWeek;
    if (quest === 'writing') state.sanctuary.poemStoryThisWeek = !state.sanctuary.poemStoryThisWeek;
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
}

export const storage = new StorageService();

