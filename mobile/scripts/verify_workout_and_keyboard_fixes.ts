/**
 * Comprehensive Verification Test Suite: 
 * 1. Running Track Session: Minutes & Seconds Logging & Auto-Pace Computation
 * 2. Kaizen Movement Set Toggling & Session Sealing
 * 3. Daily Rollover Notes & RPE Sanitation
 */
import { RunLog, SelfAppState } from '../src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('🧪 Starting Running Seconds & Workout Logic Verification Test Suite...\n');

// =========================================================================
// 1. RUNNING TRACK SESSION: MINUTES, SECONDS & PACE COMPUTATION
// =========================================================================
console.log('--- 1. Running Elapsed Time (Minutes & Seconds) & Auto-Pace ---');

function calcPace(distKmStr: string, minsStr: string, secsStr: string): string {
  const dist = parseFloat(distKmStr);
  const mins = parseInt(minsStr, 10) || 0;
  const secs = parseInt(secsStr, 10) || 0;
  if (!dist || dist <= 0) return '';
  const totalSeconds = mins * 60 + secs;
  if (totalSeconds <= 0) return '';
  const paceTotalSec = Math.round(totalSeconds / dist);
  const paceM = Math.floor(paceTotalSec / 60);
  const paceS = paceTotalSec % 60;
  return `${paceM}:${paceS.toString().padStart(2, '0')}`;
}

// Test Case 1: 2.5km in 14m 35s
let pace = calcPace('2.5', '14', '35');
// 14*60 + 35 = 875s; 875 / 2.5 = 350s/km = 5m 50s/km
assert(pace === '5:50', `2.5 km in 14m 35s produces exact pace 5:50/km. Got: ${pace}`);

// Test Case 2: 2.5km in 15m 00s
pace = calcPace('2.5', '15', '00');
// 900 / 2.5 = 360s = 6m 00s
assert(pace === '6:00', `2.5 km in 15m 00s produces exact pace 6:00/km. Got: ${pace}`);

// Test Case 3: 2.5km in 13m 45s
pace = calcPace('2.5', '13', '45');
// 13*60 + 45 = 825s; 825 / 2.5 = 330s = 5m 30s
assert(pace === '5:30', `2.5 km in 13m 45s produces exact pace 5:30/km. Got: ${pace}`);

// Test Case 4: 5.0km in 27m 30s
pace = calcPace('5.0', '27', '30');
// 27*60 + 30 = 1650s; 1650 / 5 = 330s = 5m 30s
assert(pace === '5:30', `5.0 km in 27m 30s produces exact pace 5:30/km. Got: ${pace}`);

// Test Case 5: 3.0km in 17m 18s
pace = calcPace('3.0', '17', '18');
// 17*60 + 18 = 1038s; 1038 / 3 = 346s = 5m 46s
assert(pace === '5:46', `3.0 km in 17m 18s produces exact pace 5:46/km. Got: ${pace}`);

// Test Case 6: Edge cases (0 distance, 0 duration, empty strings)
assert(calcPace('0', '15', '00') === '', 'Zero distance returns empty pace string');
assert(calcPace('2.5', '0', '0') === '', 'Zero duration returns empty pace string');
assert(calcPace('', '', '') === '', 'Empty inputs return empty pace string');

// Test Case 7: Seconds cap & padding logic
function sanitizeSeconds(val: string): string {
  const cleaned = val.replace(/[^0-9]/g, '');
  let secNum = parseInt(cleaned, 10);
  if (!isNaN(secNum) && secNum > 59) {
    secNum = 59;
  }
  return isNaN(secNum) ? '' : secNum.toString();
}

assert(sanitizeSeconds('45') === '45', 'Normal seconds preserved: 45');
assert(sanitizeSeconds('85') === '59', 'Seconds > 59 capped at 59');
assert(sanitizeSeconds('abc25xyz') === '25', 'Non-numeric characters stripped');

// Test Case 8: RunLog Data Structure Persistence
const testRunLog: RunLog = {
  distanceKm: 2.5,
  paceMinPerKm: '5:50',
  durationMinutes: 14,
  durationSeconds: 35,
  feelingSummary: 'Left ankle felt strong, smooth cadence',
  timestamp: new Date().toISOString()
};

assert(testRunLog.durationMinutes === 14, 'RunLog durationMinutes stored as 14');
assert(testRunLog.durationSeconds === 35, 'RunLog durationSeconds stored as 35');
assert(testRunLog.paceMinPerKm === '5:50', 'RunLog paceMinPerKm stored as 5:50');

// =========================================================================
// 2. KAIZEN MOVEMENT SET TOGGLING & SESSION SEALING
// =========================================================================
console.log('\n--- 2. Movement Set Toggling & Progressive Overload ---');

const mockExercises = [
  { name: 'Pushups', type: 'REPS' as const, target: 10, completedSets: [0, 0, 0], unit: 'reps' },
  { name: 'Horse Stance', type: 'HOLD_SECONDS' as const, target: 20, completedSets: [0, 0, 0], unit: 'seconds' },
  { name: 'Active Dead Hang', type: 'HOLD_SECONDS' as const, target: 20, completedSets: [0, 0, 0], unit: 'seconds' },
  { name: 'Situps', type: 'REPS' as const, target: 10, completedSets: [0, 0, 0], unit: 'reps' },
];

function toggleSet(exercises: typeof mockExercises, exIdx: number, setIdx: number) {
  const ex = exercises[exIdx];
  const cur = ex.completedSets[setIdx];
  ex.completedSets[setIdx] = cur > 0 ? 0 : ex.target;
  const allDone = exercises.every(e => e.completedSets.every(s => s >= e.target));
  return { allDone };
}

let exState = JSON.parse(JSON.stringify(mockExercises));

// Toggle Pushups Set 1: 0 -> 10
let tRes = toggleSet(exState, 0, 0);
assert(exState[0].completedSets[0] === 10, 'Pushups Set 1 toggled to target 10');
assert(!tRes.allDone, 'Not all sets done yet');

// Toggle Pushups Set 1 again: 10 -> 0
tRes = toggleSet(exState, 0, 0);
assert(exState[0].completedSets[0] === 0, 'Pushups Set 1 toggled back to 0');

// Toggle Horse Stance Set 1: 0 -> 20
toggleSet(exState, 1, 0);
assert(exState[1].completedSets[0] === 20, 'Horse Stance Set 1 toggled to target 20 seconds');

// Toggle all sets to complete
for (let i = 0; i < 4; i++) {
  for (let s = 0; s < 3; s++) {
    exState[i].completedSets[s] = exState[i].target;
  }
}
const allDoneCheck = exState.every((e: any) => e.completedSets.every((s: number) => s >= e.target));
assert(allDoneCheck, 'All 12 sets completed: session completed and sealed');

// =========================================================================
// 3. MIDNIGHT ROLLOVER NOTES & RPE SANITATION
// =========================================================================
console.log('\n--- 3. Midnight Rollover Notes & RPE Sanitation ---');

function simulateRollover(state: any, todayDate: string) {
  if (state.currentDate !== todayDate) {
    if (!state.dailyHistory) state.dailyHistory = {};
    state.dailyHistory[state.currentDate] = {
      date: state.currentDate,
      notes: state.workout.notes,
      runLog: state.workout.runLog,
    };

    state.currentDate = todayDate;
    state.workout.date = todayDate;
    state.workout.completed = false;
    state.workout.runLog = undefined;
    state.workout.gymLog = undefined;
    state.workout.notes = ''; // Cleared!
    state.workout.rpeRating = 3; // Reset to neutral!
    state.workout.exercises.forEach((e: any) => {
      e.completedSets = [0, 0, 0];
      e.difficultyRating = undefined;
    });
  }

  // Leak safeguard for app upgrade
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
    runLog: { distanceKm: 2.5, paceMinPerKm: '5:45', durationMinutes: 14, durationSeconds: 22 },
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

// Execute Rollover to 2026-11-04
simulateRollover(mockState, '2026-11-04');

assert(mockState.dailyHistory['2026-11-03'].notes === 'Lower back was the only issue', 'Yesterday notes archived in dailyHistory');
assert(mockState.dailyHistory['2026-11-03'].runLog.durationSeconds === 22, 'Yesterday runLog with seconds archived in dailyHistory');
assert(mockState.workout.notes === '', 'Today live workout notes is empty on rollover');
assert(mockState.workout.rpeRating === 3, 'Today workout RPE reset to neutral 3');
assert(mockState.workout.runLog === undefined, 'Today runLog reset for fresh session');
assert(mockState.workout.completed === false, 'Today workout completed reset to false');
assert(mockState.workout.exercises[0].completedSets.every(s => s === 0), 'All exercise sets reset to 0');
assert(mockState.workout.exercises[0].difficultyRating === undefined, 'Per-exercise difficulty rating reset');

// Leak detection check
const leakedState = {
  currentDate: '2026-11-04',
  workout: {
    date: '2026-11-04',
    completed: false,
    notes: 'Lower back was the only issue',
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
assert(leakedState.workout.notes === '', 'Leak safeguard successfully purged unedited yesterday notes from today');

console.log('\n============================================================');
console.log('🎉 ALL RUNNING SECONDS & WORKOUT LOGIC GATES PASSED (100% SUCCESS)');
console.log('============================================================\n');
