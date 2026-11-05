import { 
  WorkoutPhaseGroup, 
  PhasedExerciseItem, 
  TrainingWeekTier, 
  WeightsVariant, 
  RoutineMode 
} from '../types';

/**
 * Returns dynamic target values based on the current training week tier.
 */
export function getCalisthenicsTargets(weekTier: TrainingWeekTier) {
  switch (weekTier) {
    case 'WEEKS_3_4':
      return { horseStanceSec: 25, pushupsReps: 10, deadHangSec: 25 };
    case 'WEEKS_5_PLUS':
      return { horseStanceSec: 30, pushupsReps: 12, deadHangSec: 30 };
    case 'WEEKS_1_2':
    default:
      return { horseStanceSec: 20, pushupsReps: 8, deadHangSec: 20 };
  }
}

/**
 * Builds the structured workout phases for a RUN DAY
 */
export function buildRunDayPhases(
  weekTier: TrainingWeekTier = 'WEEKS_1_2',
  weightsVariant: WeightsVariant = 'WORKOUT_A',
  mode: RoutineMode = 'STANDARD'
): WorkoutPhaseGroup[] {
  const isWeek3OrMore = weekTier === 'WEEKS_3_4' || weekTier === 'WEEKS_5_PLUS';
  const cali = getCalisthenicsTargets(weekTier);

  // If in Floor Express Mode (Low-Energy / Short Day)
  if (mode === 'FLOOR_EXPRESS') {
    return [
      {
        id: 'run_floor_walk',
        subdomain: 'run_day_main_run',
        title: 'Floor Express: Field Walk & Setup',
        durationLabel: '5 mins',
        isCompleted: false,
        exercises: [
          {
            id: 'walk_field',
            name: 'Mindful Walk to Field',
            subdomain: 'run_day_main_run',
            targetDesc: 'Brisk walk to track/field',
            setsTarget: 1,
            completedSets: [0],
            unit: 'metres',
            isFloorVersion: true,
          }
        ]
      },
      {
        id: 'run_floor_circuit',
        subdomain: 'run_day_calisthenics',
        title: 'Floor Express: 1 Round Calisthenics',
        durationLabel: '3 mins',
        isCompleted: false,
        exercises: [
          {
            id: 'floor_horse_stance',
            name: 'Horse Stance',
            subdomain: 'run_day_calisthenics',
            targetDesc: `1 x ${cali.horseStanceSec}s`,
            setsTarget: 1,
            completedSets: [0],
            unit: 'seconds',
            isFloorVersion: true,
          },
          {
            id: 'floor_pushups',
            name: 'Push-ups (Full Range)',
            subdomain: 'run_day_calisthenics',
            targetDesc: `1 x ${cali.pushupsReps} reps`,
            setsTarget: 1,
            completedSets: [0],
            unit: 'reps',
            isFloorVersion: true,
          },
          {
            id: 'floor_dead_hang',
            name: 'Dead Hang (Shoulders Down)',
            subdomain: 'run_day_calisthenics',
            targetDesc: `1 x ${cali.deadHangSec}s`,
            setsTarget: 1,
            completedSets: [0],
            unit: 'seconds',
            isFloorVersion: true,
          }
        ]
      }
    ];
  }

  // STANDARD FULL PROTOCOL
  const phases: WorkoutPhaseGroup[] = [
    {
      id: 'warmup',
      subdomain: 'run_day_pre_run_warmup',
      title: '1. Dynamic Warm-Up',
      durationLabel: '4 mins',
      isCompleted: false,
      exercises: [
        {
          id: 'cat_cow_warmup',
          name: 'Cat-Cow',
          subdomain: 'run_day_pre_run_warmup',
          targetDesc: '1 x 10 slow reps',
          setsTarget: 1,
          completedSets: [0],
          unit: 'reps',
          cues: ['Inhale chest open, exhale round spine slowly.'],
        },
        {
          id: 'hip_circles',
          name: 'Hip Circles',
          subdomain: 'run_day_pre_run_warmup',
          targetDesc: '1 x 10 each direction',
          setsTarget: 1,
          completedSets: [0],
          unit: 'reps',
          cues: ['Smooth wide rotation, open the pelvic bowl.'],
        },
        {
          id: 'glute_bridge_warmup',
          name: 'Glute Bridge',
          subdomain: 'run_day_pre_run_warmup',
          targetDesc: '2 x 10 reps',
          setsTarget: 2,
          completedSets: [0, 0],
          unit: 'reps',
          cues: ['Drive through heels, squeeze glutes at apex.'],
        }
      ]
    },
    {
      id: 'run_main',
      subdomain: 'run_day_main_run',
      title: '2. Easy Aerobic Run',
      durationLabel: '2km Easy',
      isCompleted: false,
      exercises: [
        {
          id: 'aerobic_run_2km',
          name: '2km Aerobic Run',
          subdomain: 'run_day_main_run',
          targetDesc: '2km easy pace',
          setsTarget: 1,
          completedSets: [0],
          unit: 'metres',
          cues: ['Tall posture, short quick steps, heel or midfoot landing.'],
        }
      ]
    }
  ];

  // 3. Bear crawl (Conditioning - Added from Week 3)
  phases.push({
    id: 'bear_crawl_post_run',
    subdomain: 'run_day_post_run_conditioning',
    title: '3. Bear Crawl Conditioning',
    durationLabel: isWeek3OrMore ? '2 x 10m' : 'Unlocks Wk 3',
    isCompleted: !isWeek3OrMore,
    exercises: [
      {
        id: 'bear_crawl',
        name: 'Bear Crawl',
        subdomain: 'run_day_post_run_conditioning',
        targetDesc: isWeek3OrMore ? '2 x 10 metres (60s rest)' : 'Locked until Week 3 (2 x 10m, knees 1" off floor)',
        setsTarget: isWeek3OrMore ? 2 : 1,
        completedSets: isWeek3OrMore ? [0, 0] : [1],
        unit: 'metres',
        unlockWeek: 3,
        cues: ['Slow, knees 1" above floor, hips level like a table. Rest 60s.'],
      }
    ]
  });

  // Calisthenics Circuit (3 rounds)
  phases.push({
    id: 'calisthenics_circuit',
    subdomain: 'run_day_calisthenics',
    title: '4. Calisthenics Circuit',
    durationLabel: '3 Rounds • 60s Rest',
    isCompleted: false,
    exercises: [
      {
        id: 'horse_stance',
        name: 'Horse Stance',
        subdomain: 'run_day_calisthenics',
        targetDesc: `3 x ${cali.horseStanceSec}s`,
        setsTarget: 3,
        completedSets: [0, 0, 0],
        unit: 'seconds',
        cues: ['Deep sink, upright spine, calm nasal breathing.'],
      },
      {
        id: 'pushups',
        name: 'Push-ups (Full Range)',
        subdomain: 'run_day_calisthenics',
        targetDesc: `3 x ${cali.pushupsReps} reps`,
        setsTarget: 3,
        completedSets: [0, 0, 0],
        unit: 'reps',
        cues: ['Chest 1" from floor, elbows 45-degree arrow.'],
      },
      {
        id: 'dead_hang',
        name: 'Dead Hang (Shoulders Down)',
        subdomain: 'run_day_calisthenics',
        targetDesc: `3 x ${cali.deadHangSec}s`,
        setsTarget: 3,
        completedSets: [0, 0, 0],
        unit: 'seconds',
        cues: ['Active scapular depression, shoulders away from ears.'],
      }
    ]
  });

  // Weights Section (Workout A or Workout B)
  if (weightsVariant === 'WORKOUT_A') {
    phases.push({
      id: 'weights_split',
      subdomain: 'run_day_weights',
      title: '5. Weights: Workout A',
      durationLabel: 'Strength Hypertrophy',
      isCompleted: false,
      exercises: [
        {
          id: 'squat_a',
          name: 'Squat',
          subdomain: 'run_day_weights',
          targetDesc: '3 x 8 reps',
          setsTarget: 3,
          completedSets: [0, 0, 0],
          unit: 'reps',
          cues: ['Knees track over toes, chest proud, smooth tempo.'],
        },
        {
          id: 'bench_press_a',
          name: 'Bench Press',
          subdomain: 'run_day_weights',
          targetDesc: '3 x 8 reps',
          setsTarget: 3,
          completedSets: [0, 0, 0],
          unit: 'reps',
          cues: ['Retract scapulae, touch lower sternum.'],
        },
        {
          id: 'one_arm_row_a',
          name: 'One-Arm Dumbbell Row',
          subdomain: 'run_day_weights',
          targetDesc: '3 x 10 each side',
          setsTarget: 3,
          completedSets: [0, 0, 0],
          unit: 'reps',
          cues: ['Flat back, pull elbow back toward hip.'],
        },
        {
          id: 'curl_hold_a',
          name: 'Curl Hold (90° Isometric)',
          subdomain: 'run_day_weights',
          targetDesc: '2 x 20s (Light)',
          setsTarget: 2,
          completedSets: [0, 0],
          unit: 'seconds',
          cues: ['Elbow at 90 degrees, light weight, strict hold.'],
        }
      ]
    });
  } else {
    phases.push({
      id: 'weights_split',
      subdomain: 'run_day_weights',
      title: '5. Weights: Workout B',
      durationLabel: 'Posterior & Pull Hypertrophy',
      isCompleted: false,
      exercises: [
        {
          id: 'rdl_b',
          name: 'Romanian Deadlift (Dumbbells)',
          subdomain: 'run_day_weights',
          targetDesc: '3 x 10 reps (Light)',
          setsTarget: 3,
          completedSets: [0, 0, 0],
          unit: 'reps',
          cues: ['Hinge hips back, soft knees, feel hamstring stretch.'],
        },
        {
          id: 'dumbbell_press_b',
          name: 'Dumbbell Press',
          subdomain: 'run_day_weights',
          targetDesc: '3 x 10 reps',
          setsTarget: 3,
          completedSets: [0, 0, 0],
          unit: 'reps',
          cues: ['Control eccentric lowering, press to soft lockout.'],
        },
        {
          id: 'seated_row_b',
          name: 'Seated Cable or DB Row',
          subdomain: 'run_day_weights',
          targetDesc: '3 x 10 reps',
          setsTarget: 3,
          completedSets: [0, 0, 0],
          unit: 'reps',
          cues: ['Keep shoulders depressed, squeeze mid-back.'],
        },
        {
          id: 'dumbbell_curl_b',
          name: 'Dumbbell Curl',
          subdomain: 'run_day_weights',
          targetDesc: '2 x 10 reps',
          setsTarget: 2,
          completedSets: [0, 0],
          unit: 'reps',
          cues: ['Full supination, zero shoulder swing.'],
        }
      ]
    });
  }

  // Cooldown & Mobility (6 minutes)
  const cooldownExercises: PhasedExerciseItem[] = [
    {
      id: 'calf_straight_cooldown',
      name: 'Wall Calf Stretch (Knee Straight)',
      subdomain: 'run_day_cooldown',
      targetDesc: '30s each leg',
      setsTarget: 1,
      completedSets: [0],
      unit: 'seconds',
      cues: ['Back heel pinned flat, knee locked straight.'],
    },
    {
      id: 'hip_flexor_cooldown',
      name: 'Half-Kneeling Hip Flexor Stretch',
      subdomain: 'run_day_cooldown',
      targetDesc: '30s each side',
      setsTarget: 1,
      completedSets: [0],
      unit: 'seconds',
      cues: ['Tuck pelvis (posterior pelvic tilt), gently shift forward.'],
    },
    {
      id: 'hamstring_cooldown',
      name: 'Hamstring Stretch',
      subdomain: 'run_day_cooldown',
      targetDesc: '30s each leg',
      setsTarget: 1,
      completedSets: [0],
      unit: 'seconds',
      cues: ['Hinge at hip, straight spine.'],
    },
    {
      id: 'figure4_cooldown',
      name: 'Figure-4 Glute Stretch',
      subdomain: 'run_day_cooldown',
      targetDesc: '30s each side',
      setsTarget: 1,
      completedSets: [0],
      unit: 'seconds',
      cues: ['Cross ankle over knee, sink back into glute stretch.'],
    },
    {
      id: 'side_bend_cooldown',
      name: 'Standing Side-Bend (Arm Overhead)',
      subdomain: 'run_day_cooldown',
      targetDesc: '30s each side',
      setsTarget: 1,
      completedSets: [0],
      unit: 'seconds',
      cues: ['Reach overhead, open lateral rib cage.'],
    },
    {
      id: 'frog_squat_rock_cooldown',
      name: 'Frog Squat Rock',
      subdomain: 'run_day_cooldown',
      targetDesc: '1 x 8 slow rocks (3s hold back)',
      setsTarget: 1,
      completedSets: [0],
      unit: 'reps',
      cues: ['Deep adductor hip opener, 8 slow rocks with 3s hold at back.'],
    }
  ];

  if (isWeek3OrMore) {
    cooldownExercises.push({
      id: 'toe_sit_kneel_cooldown',
      name: 'Toe Sit Kneel',
      subdomain: 'run_day_cooldown',
      targetDesc: '1 x 20s (building to 60s)',
      setsTarget: 1,
      completedSets: [0],
      unit: 'seconds',
      unlockWeek: 3,
      cues: ['Tuck all 10 toes under, sit back on heels to stretch plantar fascia.'],
    });
  } else {
    cooldownExercises.push({
      id: 'toe_sit_kneel_cooldown',
      name: 'Toe Sit Kneel',
      subdomain: 'run_day_cooldown',
      targetDesc: 'Locked until Week 3 (1 x 20s-60s)',
      setsTarget: 1,
      completedSets: [1],
      unit: 'seconds',
      unlockWeek: 3,
      cues: ['Plantar fascia and toe extension prehab. Begins in Week 3.'],
    });
  }

  phases.push({
    id: 'run_cooldown',
    subdomain: 'run_day_cooldown',
    title: '6. Post-Run Cooldown & Mobility',
    durationLabel: '6 mins',
    isCompleted: false,
    exercises: cooldownExercises
  });

  return phases;
}

/**
 * Builds the structured workout phases for a NON-RUN DAY (19 Movements in 4 Clusters)
 */
export function buildNonRunDayPhases(
  weekTier: TrainingWeekTier = 'WEEKS_1_2',
  mode: RoutineMode = 'STANDARD'
): WorkoutPhaseGroup[] {
  const isWeek3OrMore = weekTier === 'WEEKS_3_4' || weekTier === 'WEEKS_5_PLUS';

  // Floor Express Mode (Low-Energy / Short Day ~ 4 mins)
  if (mode === 'FLOOR_EXPRESS') {
    return [
      {
        id: 'non_run_floor_express',
        subdomain: 'non_run_mobility_lower',
        title: 'Floor Express Mobility',
        durationLabel: '4 mins essential flow',
        isCompleted: false,
        exercises: [
          {
            id: 'floor_wall_calf',
            name: 'Wall Calf Stretch',
            subdomain: 'non_run_mobility_lower',
            targetDesc: '30s each leg',
            setsTarget: 1,
            completedSets: [0],
            unit: 'seconds',
            isFloorVersion: true,
          },
          {
            id: 'floor_hip_flexor',
            name: 'Half-Kneeling Hip Flexor Stretch',
            subdomain: 'non_run_mobility_lateral',
            targetDesc: '30s each side',
            setsTarget: 1,
            completedSets: [0],
            unit: 'seconds',
            isFloorVersion: true,
          },
          {
            id: 'floor_wall_slides',
            name: 'Wall Slides',
            subdomain: 'non_run_mobility_upper',
            targetDesc: '1 x 10 reps',
            setsTarget: 1,
            completedSets: [0],
            unit: 'reps',
            isFloorVersion: true,
          },
          {
            id: 'floor_side_bend',
            name: 'Standing Side-Bend (Arm Overhead)',
            subdomain: 'non_run_mobility_lateral',
            targetDesc: '30s each side',
            setsTarget: 1,
            completedSets: [0],
            unit: 'seconds',
            isFloorVersion: true,
          }
        ]
      }
    ];
  }

  // STANDARD FULL NON-RUN PROTOCOL (4 Anatomical Clusters)
  const phases: WorkoutPhaseGroup[] = [
    // Cluster 1: Core & Posterior Activation
    {
      id: 'cluster_activation',
      subdomain: 'non_run_activation',
      title: 'Cluster 1: Core & Posterior Activation',
      durationLabel: 'Items 1-4 • 2 Rounds',
      isCompleted: false,
      exercises: [
        {
          id: 'dead_bug',
          name: 'Dead Bug',
          subdomain: 'non_run_activation',
          targetDesc: '2 x 8 each side',
          setsTarget: 2,
          completedSets: [0, 0],
          unit: 'reps',
          cues: ['Lower back glued to floor, opposite arm and leg extend.'],
        },
        {
          id: 'bird_dog',
          name: 'Bird Dog',
          subdomain: 'non_run_activation',
          targetDesc: '2 x 8 each side',
          setsTarget: 2,
          completedSets: [0, 0],
          unit: 'reps',
          cues: ['Brace core, reach heel back and hand forward without arching.'],
        },
        {
          id: 'glute_bridge_nonrun',
          name: 'Glute Bridge',
          subdomain: 'non_run_activation',
          targetDesc: '2 x 12 reps',
          setsTarget: 2,
          completedSets: [0, 0],
          unit: 'reps',
          cues: ['Drive through heels, squeeze glutes hard at the top.'],
        },
        {
          id: 'cat_cow_nonrun',
          name: 'Cat-Cow',
          subdomain: 'non_run_activation',
          targetDesc: '1 x 10 slow reps',
          setsTarget: 1,
          completedSets: [0],
          unit: 'reps',
          cues: ['Inhale into cow, exhale into cat, articulate every vertebra.'],
        }
      ]
    },

    // Cluster 2: Lower Body Mobility & Prehab
    {
      id: 'cluster_lower_prehab',
      subdomain: 'non_run_mobility_lower',
      title: 'Cluster 2: Ankle, Calf & Hip Openers',
      durationLabel: 'Items 5-13',
      isCompleted: false,
      exercises: [
        {
          id: 'wall_calf_straight',
          name: 'Wall Calf Stretch (Straight)',
          subdomain: 'non_run_mobility_lower',
          targetDesc: '2 x 30s each leg',
          setsTarget: 2,
          completedSets: [0, 0],
          unit: 'seconds',
          cues: ['Back knee locked, stretches gastrocnemius.'],
        },
        {
          id: 'wall_calf_bent',
          name: 'Wall Calf Stretch (Bent Knee)',
          subdomain: 'non_run_mobility_lower',
          targetDesc: '1 x 30s each leg',
          setsTarget: 1,
          completedSets: [0],
          unit: 'seconds',
          cues: ['Back knee bent, targets soleus and Achilles.'],
        },
        {
          id: 'slow_calf_raises',
          name: 'Slow Calf Raises (3s Eccentric)',
          subdomain: 'non_run_mobility_lower',
          targetDesc: '2 x 12 each leg',
          setsTarget: 2,
          completedSets: [0, 0],
          unit: 'reps',
          cues: ['Rise high on toes, take 3 full seconds to lower heel.'],
        },
        {
          id: 'hamstring_stretch_nonrun',
          name: 'Hamstring Stretch',
          subdomain: 'non_run_mobility_lower',
          targetDesc: '2 x 30s each leg',
          setsTarget: 2,
          completedSets: [0, 0],
          unit: 'seconds',
          cues: ['Chest toward shin, maintain neutral spine.'],
        },
        {
          id: 'deep_squat_hold',
          name: 'Deep Squat Hold',
          subdomain: 'non_run_mobility_lower',
          targetDesc: '2 x 30s hold',
          setsTarget: 2,
          completedSets: [0, 0],
          unit: 'seconds',
          cues: ['Sink to the bottom of squat, elbows gently pressing knees out.'],
        },
        {
          id: 'frog_squat_rock_nonrun',
          name: 'Frog Squat Rock',
          subdomain: 'non_run_mobility_lower',
          targetDesc: '2 x 8 slow rocks (3s hold)',
          setsTarget: 2,
          completedSets: [0, 0],
          unit: 'reps',
          cues: ['Knees wide on floor, rock hips back and hold for 3 seconds.'],
        },
        {
          id: 'toe_sit_kneel_nonrun',
          name: 'Toe Sit Kneel (Item 13)',
          subdomain: 'non_run_mobility_lower' as const,
          targetDesc: isWeek3OrMore ? '1 x 20s (building to 60s)' : 'Locked until Week 3 (1 x 20s-60s)',
          setsTarget: 1,
          completedSets: isWeek3OrMore ? [0] : [1],
          unit: 'seconds' as const,
          unlockWeek: 3,
          cues: ['Tuck all 10 toes under, sit upright on heels. Prehab begins Week 3.'],
        }
      ]
    },

    // Cluster 3: Thoracic & Scapular Prehab
    {
      id: 'cluster_upper_scapular',
      subdomain: 'non_run_mobility_upper',
      title: 'Cluster 3: Thoracic & Scapular Balance',
      durationLabel: 'Items 9-10, 17-19',
      isCompleted: false,
      exercises: [
        {
          id: 'doorway_chest_stretch',
          name: 'Doorway Chest Stretch',
          subdomain: 'non_run_mobility_upper',
          targetDesc: '2 x 30s hold',
          setsTarget: 2,
          completedSets: [0, 0],
          unit: 'seconds',
          cues: ['Forearms on frame, step forward gently into chest stretch.'],
        },
        {
          id: 'wall_slides',
          name: 'Wall Slides',
          subdomain: 'non_run_mobility_upper',
          targetDesc: '2 x 10 reps',
          setsTarget: 2,
          completedSets: [0, 0],
          unit: 'reps',
          cues: ['Wrists and elbows against wall, slide upward without rib flare.'],
        },
        {
          id: 'open_book',
          name: 'Open Book (Thoracic Rotation)',
          subdomain: 'non_run_mobility_upper',
          targetDesc: '1 x 8 each side',
          setsTarget: 1,
          completedSets: [0],
          unit: 'reps',
          cues: ['Side-lying, rotate top arm across to floor, track with eyes.'],
        },
        {
          id: 'prone_y_raises',
          name: 'Prone Y Raises',
          subdomain: 'non_run_mobility_upper',
          targetDesc: '2 x 10 reps',
          setsTarget: 2,
          completedSets: [0, 0],
          unit: 'reps',
          cues: ['Lying face down, arms in Y shape, thumbs up, lift with lower traps.'],
        },
        {
          id: 'crab_hold',
          name: 'Crab Hold (Item 19)',
          subdomain: 'non_run_mobility_upper' as const,
          targetDesc: isWeek3OrMore ? '2 x 15s (building to 30s)' : 'Locked until Week 3 (2 x 15s-30s)',
          setsTarget: isWeek3OrMore ? 2 : 1,
          completedSets: isWeek3OrMore ? [0, 0] : [1],
          unit: 'seconds' as const,
          unlockWeek: 3,
          cautionNote: 'Skip if left shoulder complains',
          cues: ['Hands behind, lift hips, open shoulders. Skip if left shoulder complains.'],
        }
      ]
    },

    // Cluster 4: Hips & Lateral Chain Flexibility
    {
      id: 'cluster_hips_lateral',
      subdomain: 'non_run_mobility_lateral',
      title: 'Cluster 4: Hips & Lateral Chains',
      durationLabel: 'Items 14-16',
      isCompleted: false,
      exercises: [
        {
          id: 'half_kneeling_hip_flexor',
          name: 'Half-Kneeling Hip Flexor',
          subdomain: 'non_run_mobility_lateral',
          targetDesc: '2 x 30s each side',
          setsTarget: 2,
          completedSets: [0, 0],
          unit: 'seconds',
          cues: ['Posterior pelvic tilt, glute squeeze, gentle forward glide.'],
        },
        {
          id: 'figure4_glute_stretch',
          name: 'Figure-4 Glute Stretch',
          subdomain: 'non_run_mobility_lateral',
          targetDesc: '2 x 30s each side',
          setsTarget: 2,
          completedSets: [0, 0],
          unit: 'seconds',
          cues: ['Deep glute release, breathe calmly into tight areas.'],
        },
        {
          id: 'standing_side_bend',
          name: 'Standing Side-Bend (Overhead)',
          subdomain: 'non_run_mobility_lateral',
          targetDesc: '2 x 30s each side',
          setsTarget: 2,
          completedSets: [0, 0],
          unit: 'seconds',
          cues: ['Reach long, lengthen QL and lateral abdominal wall.'],
        }
      ]
    }
  ];

  return phases;
}
