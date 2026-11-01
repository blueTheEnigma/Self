export type DayPhase = 
  | 'MORNING_RITUAL'      // 05:30 - 08:30
  | 'DEEP_WORK_1'         // 08:30 - 10:15 (Quant Bot / Paper Thoughts)
  | 'MIDDAY_BUFFER'       // 10:15 - 11:30 (Hydration, Reset)
  | 'DEEP_WORK_2'         // 11:30 - 13:00 (MIT OCW Multivariable Calc)
  | 'AFTERNOON_BUFFER'    // 13:00 - 14:30 (Lunch, Life, Errands)
  | 'DEEP_WORK_3'         // 14:30 - 15:45 (Fellowships / Technical Paper)
  | 'LIFE_BUFFER'         // 15:45 - 20:00 (Errands, Family, Unplanned)
  | 'EVENING_SANCTUARY'   // 20:00 - 21:30 (Guitar 15m, Creative Joy)
  | 'NIGHT_REST';         // 21:30 - 05:30

export interface ExerciseTarget {
  name: string;
  type: 'REPS' | 'HOLD_SECONDS';
  target: number;
  completedSets: number[];
  unit: string;
}

export interface WorkoutSession {
  date: string; // YYYY-MM-DD
  isRunDay: boolean; // Mon/Wed/Fri
  runDistanceKm: number;
  exercises: ExerciseTarget[];
  rpeRating: number; // 1-5
  notes?: string;
  completed: boolean;
  consecutiveTargetHits: number;
}

export interface KaizenOverloadConfig {
  pushupsTarget: number;
  horseStanceSeconds: number;
  activeHangSeconds: number;
  situpsTarget: number;
  consecutiveCleanSessions: number;
  pendingSuggestion?: {
    exercise: string;
    oldTarget: number;
    newTarget: number;
    unit: string;
  };
}

export interface FullnessLog {
  meal: 'Breakfast' | 'Lunch' | 'Dinner';
  rating: number; // 1-5 (3 is optimal 80%)
  timestamp: string;
}

export interface HabitIntegrityState {
  waterMl: number;
  waterGoalMl: number;
  fullnessLogs: FullnessLog[];
  purityStreakDays: number;
  lastPurityCheckDate: string;
  lastUrgeDefeatedTimestamp?: string;
}

export type SpendCategory = 'Food' | 'Transport' | 'Data' | 'Gift' | 'Misc';

export interface SpendTransaction {
  id: string;
  amount: number;
  currency: 'NGN' | 'USD';
  category: SpendCategory;
  note?: string;
  timestamp: string;
}

export type ProjectFocusTag = 
  | 'Quant Bot' 
  | 'Paper Thoughts' 
  | 'MIT OCW Calc' 
  | 'Control Engineering'
  | 'Fellowships' 
  | 'Technical Paper';

export interface FocusBlockSession {
  id: string;
  project: ProjectFocusTag;
  durationMinutes: number;
  completedMinutes: number;
  timestamp: string;
  completed: boolean;
}

export interface EveningSanctuaryState {
  guitarMinutesToday: number;
  photoEditingThisWeek: boolean;
  novelReadingThisWeek: boolean;
  poemStoryThisWeek: boolean;
  microJournalWins: string;
  microJournalFriction: string;
  tomorrowAnchor: string;
  lastSavedDate: string;
}

export interface SelfAppState {
  currentDate: string;
  workout: WorkoutSession;
  overloadConfig: KaizenOverloadConfig;
  integrity: HabitIntegrityState;
  transactions: SpendTransaction[];
  focusBlocks: FocusBlockSession[];
  sanctuary: EveningSanctuaryState;
  bodyWeightKg: number;
  waistCircumferenceCm: number;
  tummyCircumferenceCm: number;
  anklePainRating: number; // 0-10
}

