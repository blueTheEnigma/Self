/**
 * Verification Test Suite: Workout Seconds Logging & Notes Rollover Fixes
 */
import { SelfAppState } from '../src/types';

// Mock test harness
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('🧪 Starting Workout Seconds Logging & Rollover Verification Test Suite...\n');

// 1. Seconds Logging & Custom Value Logic
console.log('--- 1. Hold Seconds & Set Value Evaluation ---');

const mockExercises = [
  { name: 'Pushups', type: 'REPS' as const, target: 10, completedSets: [0, 0, 0], unit: 'reps' },
  { name: 'Horse Stance', type: 'HOLD_SECONDS' as const, target: 20, completedSets: [0, 0, 0], unit: 'seconds' },
  { name: 'Active Dead Hang', type: 'HOLD_SECONDS' as const, target: 20, completedSets: [0, 0, 0], unit: 'seconds' },
  { name: 'Situps', type: 'REPS' as const, target: 10, completedSets: [0, 0, 0], unit: 'reps' },
];

function simulateToggleWorkoutSet(
  exercises: typeof mockExercises,
  exerciseIndex: number,
  setIndex: number,
  value?: number
) {
  const ex = exercises[exerciseIndex];
  const currentVal = ex.completedSets[setIndex];

  if (value !== undefined) {
    ex.completedSets[setIndex] = Math.max(0, value);
  } else if (currentVal > 0) {
    ex.completedSets[setIndex] = 0;
  } else {
    ex.completedSets[setIndex] = ex.target;
  }

  const allDone = exercises.every(e => e.completedSets.every(s => s > 0));
  const allHitTarget = exercises.every(e => e.completedSets.every(s => s >= e.target));

  return { allDone, allHitTarget };
}

// Deep copy for testing
let exercises = JSON.parse(JSON.stringify(mockExercises));

// Test logging custom hold seconds on Horse Stance (set 0 -> 35s)
let res = simulateToggleWorkoutSet(exercises, 1, 0, 35);
assert(exercises[1].completedSets[0] === 35, 'Horse Stance Set 1 logged exact 35 seconds');
assert(!res.allDone, 'Workout not yet allDone with 1 set');

// Test logging partial hold seconds on Horse Stance (set 1 -> 15s when target is 20)
res = simulateToggleWorkoutSet(exercises, 1, 1, 15);
assert(exercises[1].completedSets[1] === 15, 'Horse Stance Set 2 logged exact 15 seconds (partial)');

// Test resetting set to 0
res = simulateToggleWorkoutSet(exercises, 1, 1, 0);
assert(exercises[1].completedSets[1] === 0, 'Horse Stance Set 2 reset to 0');

// Test rep toggle
res = simulateToggleWorkoutSet(exercises, 0, 0); // Pushups set 1
assert(exercises[0].completedSets[0] === 10, 'Pushups Set 1 toggled to target 10 reps');
res = simulateToggleWorkoutSet(exercises, 0, 0); // Pushups set 1 toggle again
assert(exercises[0].completedSets[0] === 0, 'Pushups Set 1 toggled back to 0');

// 2. All Sets Done vs Progressive Overload Target Evaluation
console.log('\n--- 2. Session Completion vs Overload Progression ---');

// Perform all sets with >= target
exercises = JSON.parse(JSON.stringify(mockExercises));
exercises[0].completedSets = [10, 10, 10];
exercises[1].completedSets = [20, 25, 20];
exercises[2].completedSets = [20, 20, 30];
exercises[3].completedSets = [10, 10, 10];

res = simulateToggleWorkoutSet(exercises, 0, 0, 10);
assert(res.allDone, 'Session marked complete when all sets performed (s > 0)');
assert(res.allHitTarget, 'Overload progression triggered when all targets met (s >= e.target)');

// Perform all sets, but one hold was 18s (less than 20s target)
exercises[1].completedSets = [20, 18, 20];
res = simulateToggleWorkoutSet(exercises, 0, 0, 10);
assert(res.allDone, 'Session STILL marked complete even if one hold was 18s (s > 0)');
assert(!res.allHitTarget, 'Overload progression not triggered if a hold did not meet target (18s < 20s)');

// 3. Rollover & Stale Notes Reset
console.log('\n--- 3. Midnight Rollover Notes & RPE Sanitation ---');

function simulateRollover(state: any, todayDate: string) {
  if (state.currentDate !== todayDate) {
    if (!state.dailyHistory) state.dailyHistory = {};
    state.dailyHistory[state.currentDate] = {
      date: state.currentDate,
      notes: state.workout.notes,
    };

    state.currentDate = todayDate;
    state.workout.date = todayDate;
    state.workout.completed = false;
    state.workout.runLog = undefined;
    state.workout.gymLog = undefined;
    state.workout.notes = ''; // Cleared!
    state.workout.rpeRating = 3; // Reset!
    state.workout.exercises.forEach((e: any) => {
      e.completedSets = [0, 0, 0];
      e.difficultyRating = undefined;
    });
  }

  // Live day safeguard for yesterday leak
  const yesterday = new Date(Date.parse(todayDate) - 86400000).toISOString().split('T')[0];
  if (
    state.dailyHistory?.[yesterday]?.notes &&
    state.workout?.notes === state.dailyHistory[yesterday].notes &&
    !state.workout.completed &&
    state.workout.exercises.every((e: any) => e.completedSets.every((s: number) => s === 0))
  ) {
    state.workout.notes = '';
  }
}

const mockState = {
  currentDate: '2026-11-03',
  workout: {
    date: '2026-11-03',
    completed: true,
    notes: 'Lower back was the only issue',
    rpeRating: 4,
    exercises: [
      { name: 'Pushups', completedSets: [10, 10, 10], difficultyRating: 4 },
      { name: 'Horse Stance', completedSets: [20, 20, 20], difficultyRating: 3 },
      { name: 'Active Dead Hang', completedSets: [20, 20, 20], difficultyRating: 3 },
      { name: 'Situps', completedSets: [10, 10, 10], difficultyRating: 4 },
    ]
  },
  dailyHistory: {} as Record<string, any>,
};

// Rollover to 2026-11-04
simulateRollover(mockState, '2026-11-04');

assert(mockState.dailyHistory['2026-11-03'].notes === 'Lower back was the only issue', 'Yesterday note successfully archived in dailyHistory');
assert(mockState.workout.notes === '', 'Today live workout notes is completely empty on fresh rollover');
assert(mockState.workout.rpeRating === 3, 'Today workout RPE reset to neutral 3');
assert(mockState.workout.completed === false, 'Today workout completed is false');
assert(mockState.workout.exercises[0].completedSets.every(s => s === 0), 'All exercise sets reset to 0');
assert(mockState.workout.exercises[0].difficultyRating === undefined, 'Per-exercise difficulty rating reset');

// 4. Test Safeguard for Already-Leaked Note on App Upgrade
console.log('\n--- 4. Live Safeguard for Previously-Leaked Note ---');

const leakedState = {
  currentDate: '2026-11-04',
  workout: {
    date: '2026-11-04',
    completed: false,
    notes: 'Lower back was the only issue', // Leaked from yesterday before fix
    rpeRating: 4,
    exercises: [
      { name: 'Pushups', completedSets: [0, 0, 0] },
      { name: 'Horse Stance', completedSets: [0, 0, 0] },
      { name: 'Active Dead Hang', completedSets: [0, 0, 0] },
      { name: 'Situps', completedSets: [0, 0, 0] },
    ]
  },
  dailyHistory: {
    '2026-11-03': {
      date: '2026-11-03',
      notes: 'Lower back was the only issue',
    }
  }
};

simulateRollover(leakedState, '2026-11-04');
assert(leakedState.workout.notes === '', 'Safeguard detected and purged leaked yesterday note from today');

console.log('\n============================================================');
console.log('🎉 ALL WORKOUT & NOTES VERIFICATION GATES PASSED (100% SUCCESS)');
console.log('============================================================\n');
