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
  difficultyRating?: number; // 1-5 (Easy to Max) rated per exercise
}

export interface RunLog {
  distanceKm: number;
  paceMinPerKm?: string; // e.g. "5:30"
  durationMinutes?: number;
  durationSeconds?: number; // 0-59 seconds component of elapsed time
  feelingSummary?: string; // e.g. "Ankle felt solid, breathing controlled"
  timestamp: string;
}

export interface GymLog {
  split: string; // e.g. "Upper Body", "Push", "Legs", "Full Body"
  exercisesSummary: string; // Free-form: sets, reps, lifts (e.g. "Bench Press 3x10 @ 60kg, Cable Rows 4x12")
  durationMinutes?: number;
  feelingSummary?: string;
  timestamp: string;
}

export interface WorkoutSession {
  date: string; // YYYY-MM-DD
  isRunDay: boolean; // configurable via settings
  runDistanceKm: number;
  runLog?: RunLog;
  gymLog?: GymLog;
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

export interface SpiritualAnchorState {
  wakeupPrayerDone: boolean;
  trackPrayerDone: boolean;
  bibleReadingDone: boolean;
  scripturePassage?: string;
  audiobookDone?: boolean;
  audiobookTitle?: string;
  audiobookTakeaway?: string;
}

export interface ScholarshipOutreachRecord {
  id: string;
  timestamp: string;
  professorName: string;
  university: string;
  researchTopic?: string;
  notes?: string;
}

export interface FullnessLog {
  meal: 'Breakfast' | 'Lunch' | 'Dinner';
  rating: number; // 1-5 (3 is optimal 80%)
  description?: string;
  trigger?: string;
  timestamp: string;
}

export interface RelapseRecord {
  date: string;
  reflection?: string;
}

export interface HabitIntegrityState {
  waterMl: number;
  waterGoalMl: number;
  fullnessLogs: FullnessLog[];
  purityStreakDays: number;
  urgeDivertedCount: number; // Cumulative times urge defeater was completed
  relapseHistory: RelapseRecord[];
  consecutiveControlledSatietyDays: number;
  fastingModeUnlocked: boolean;
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

export interface ActiveFocusSession {
  startTime: number | null; // Date.now() timestamp when started (null when paused)
  targetMinutes: number;    // e.g. 90
  elapsedSeconds: number;   // accumulated seconds before pause
  isActive: boolean;
  isRestCooldown: boolean;
  project: ProjectFocusTag;
}

export interface HobbyLogEntry {
  id?: string;
  type: 'guitar' | 'reading' | 'writing' | 'photo' | 'novel' | 'other';
  title?: string;
  details: string;
  durationMinutes?: number;
  timestamp: string;
}

export interface EveningSanctuaryState {
  guitarMinutesToday: number;
  guitarNotesToday?: string;
  readingMinutesToday?: number;
  readingNotesToday?: string;
  writingNotesToday?: string;
  otherActivityToday?: string;
  photoEditingThisWeek: boolean;
  novelReadingThisWeek: boolean;
  poemStoryThisWeek: boolean;
  hobbyLogs: HobbyLogEntry[];
  microJournalWins: string;
  microJournalFriction: string;
  tomorrowAnchor: string;
  lastSavedDate: string;
}

export interface BodyMetricLog {
  date: string;
  weightKg: number;
  waistCm: number;
  tummyCm: number;
  ankleStrain: number; // 0-10
}

export interface DailyChecklistRecord {
  wakeupPrayerDone: boolean;
  trackPrayerDone: boolean;
  bibleReadingDone: boolean;
  audiobookDone?: boolean;
  scholarshipOutreachDone?: boolean;
  movementSetsDone: number;
  movementCompleted: boolean;
  gymLogged?: boolean;
  satietyMealsLogged: number;
  focusMinutes: number;
  guitarMinutes: number;
  microJournalDone: boolean;
  waterMl: number;
  totalCompletedItems: number; // 0-10
  completionScorePercent: number; // 0-100%
}

export interface DailySnapshot {
  date: string; // YYYY-MM-DD
  checklist: DailyChecklistRecord;
  focusSessionsCount: number;
  totalSpendNgn: number;
  runLog?: RunLog;
  gymLog?: GymLog;
  bodyWeightKg?: number;
  ankleStrainRating?: number;
  tomorrowAnchor?: string;
  notes?: string;
}

export interface AppSettings {
  runDays: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat (default: [1, 3, 5])
  nonRunDayPreference: 'gym' | 'calisthenics' | 'hybrid';
  waterGoalMl: number;
  deepWorkGoalMinutes: number;
  exerciseVariants?: {
    pushupsName?: string;
    horseStanceName?: string;
    activeHangName?: string;
    situpsName?: string;
  };
}

export interface SelfAppState {
  currentDate: string;
  workout: WorkoutSession;
  overloadConfig: KaizenOverloadConfig;
  spiritual: SpiritualAnchorState;
  integrity: HabitIntegrityState;
  transactions: SpendTransaction[];
  focusBlocks: FocusBlockSession[];
  sanctuary: EveningSanctuaryState;
  scholarshipOutreachDone?: boolean;
  scholarshipOutreachNotes?: string;
  scholarshipOutreachHistory?: ScholarshipOutreachRecord[];
  settings?: AppSettings;
  activeFocusSession?: ActiveFocusSession;
  bodyWeightKg: number;
  waistCircumferenceCm: number;
  tummyCircumferenceCm: number;
  anklePainRating: number; // 0-10
  bodyMetricsHistory: BodyMetricLog[];
  dailyHistory: Record<string, DailySnapshot>;
}
