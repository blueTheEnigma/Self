export interface ExerciseGuide {
  id: string;
  name: string;
  category: 'Calisthenics' | 'Isometric Hold' | 'Ankle Prehab' | 'Mobility';
  primaryMuscles: string;
  cues: string[];
  mistakesToAvoid: string[];
  kaizenTip: string;
  youtubeId: string;
  videoDemoUrl: string;
  animationFrames: {
    startLabel: string;
    peakLabel: string;
    tempo: string;
  };
}

export const EXERCISE_GUIDES: Record<string, ExerciseGuide> = {
  pushups: {
    id: 'pushups',
    name: 'Pushups',
    category: 'Calisthenics',
    primaryMuscles: 'Chest (Pectoralis), Triceps, Anterior Deltoids, Core',
    cues: [
      'Hands slightly wider than shoulder-width, fingers splayed.',
      'Screw your hands into the floor to lock shoulders into external rotation.',
      'Maintain an unbroken straight line from crown of head to heels (brace core & glutes).',
      'Lower under control until chest is 1 inch from floor; elbows track at a 45-degree arrow angle, NOT flared out.',
      'Push the ground away explosively to full extension without shrugging shoulders.'
    ],
    mistakesToAvoid: [
      'Sagging lower back (anterior pelvic tilt puts pressure on lumbar spine).',
      'Flaring elbows out at 90 degrees (causes shoulder impingement).',
      'Half reps (skipping the bottom stretch or top lockout).'
    ],
    kaizenTip: 'Aim for a 3-1-1 tempo: 3 seconds down, 1 second pause at bottom, 1 second explosive push.',
    youtubeId: 'IODxDxX7oi4',
    videoDemoUrl: 'https://www.youtube.com/embed/IODxDxX7oi4?playsinline=1&rel=0&modestbranding=1',
    animationFrames: {
      startLabel: 'Plank Lockout',
      peakLabel: 'Chest 1" From Ground',
      tempo: '3s Eccentric / 1s Concentric'
    }
  },
  horseStance: {
    id: 'horseStance',
    name: 'Horse Stance (Ma Bu)',
    category: 'Isometric Hold',
    primaryMuscles: 'Quadriceps, Adductors (Inner Thighs), Glutes, Core',
    cues: [
      'Step feet out to roughly 2 to 2.5 shoulder-widths apart.',
      'Angle toes forward or slightly outward (max 15 degrees).',
      'Sink hips straight down until thighs are parallel to the floor (or as low as comfortable).',
      'Keep knees tracked directly over your toes, never collapsing inward.',
      'Keep torso upright, chest proud, fists chambered at ribs or palms pressed at heart center.',
      'Breathe deeply into your lower abdomen; do not hold breath.'
    ],
    mistakesToAvoid: [
      'Knees caving inward (strains the MCL and ankle arch).',
      'Leaning forward excessively at the torso.',
      'Creeping up out of depth as the burn begins.'
    ],
    kaizenTip: 'When the burn starts at 15s, relax your shoulders and focus on calm nasal exhales to condition mental endurance.',
    youtubeId: '9H0f6sR_MhM',
    videoDemoUrl: 'https://www.youtube.com/embed/9H0f6sR_MhM?playsinline=1&rel=0&modestbranding=1',
    animationFrames: {
      startLabel: 'Standing Wide',
      peakLabel: 'Thighs Parallel to Floor',
      tempo: 'Static Isometric Hold'
    }
  },
  activeDeadHang: {
    id: 'activeDeadHang',
    name: 'Active Dead Hang',
    category: 'Isometric Hold',
    primaryMuscles: 'Latissimus Dorsi, Trapezius, Forearm Grip Flexors, Scapular Stabilizers',
    cues: [
      'Grip the pull-up bar slightly wider than shoulder-width using a full overhand grip.',
      'Do NOT hang passively like a limp rag: pull your shoulder blades down and back away from ears (active scapular depression).',
      'Engage your abdominal wall and glutes, keeping legs straight and toes pointed down.',
      'Keep neck neutral, eyes looking straight ahead, ears clearly visible above shoulders.'
    ],
    mistakesToAvoid: [
      'Passive hanging with shoulders mashed against ears (strains rotator cuff tendons).',
      'Swinging or kicking legs.',
      'Holding breath instead of deep rhythmic breathing.'
    ],
    kaizenTip: 'Decompresses the spine from heavy running while building steel grip and shoulder joint resilience.',
    youtubeId: 'vMhaX_o0l-g',
    videoDemoUrl: 'https://www.youtube.com/embed/vMhaX_o0l-g?playsinline=1&rel=0&modestbranding=1',
    animationFrames: {
      startLabel: 'Passive Hang',
      peakLabel: 'Scapulae Depressed & Lat Engaged',
      tempo: 'Active Hold with Full Scapular Tension'
    }
  },
  situps: {
    id: 'situps',
    name: 'Controlled Situps',
    category: 'Calisthenics',
    primaryMuscles: 'Rectus Abdominis, Transverse Abdominis, Hip Flexors',
    cues: [
      'Lie flat on back with knees bent at 90 degrees and feet flat on floor.',
      'Place fingertips lightly behind ears or cross hands over chest (never yank on neck).',
      'Initiate movement by curling the ribcage down toward the pelvis, contracting abs.',
      'Rise up smoothly until torso is upright; exhale as you reach the top.',
      'Lower down bone by bone under full eccentric control.'
    ],
    mistakesToAvoid: [
      'Yanking violently on the back of the neck (cervical spine compression).',
      'Using bouncing momentum off the floor.',
      'Arching lower back on the way down.'
    ],
    kaizenTip: 'Treat each rep as a slow spinal peel off the carpet. 2 seconds up, 3 seconds descent.',
    youtubeId: '1fbU_MkV7NE',
    videoDemoUrl: 'https://www.youtube.com/embed/1fbU_MkV7NE?playsinline=1&rel=0&modestbranding=1',
    animationFrames: {
      startLabel: 'Supine Ground',
      peakLabel: 'Full Abdominal Contraction',
      tempo: '2s Up / 1s Peak / 3s Lowering'
    }
  },

  // --- Left Ankle Tendon Rehabilitation & Prehab Guides ---
  tibialisWallRaises: {
    id: 'tibialisWallRaises',
    name: 'Tibialis Wall Raises',
    category: 'Ankle Prehab',
    primaryMuscles: 'Tibialis Anterior (Shin Muscle), Ankle Dorsiflexors',
    cues: [
      'Stand with back resting flat against a smooth wall, heels roughly 1 to 2 feet out from the wall.',
      'Keep knees completely locked straight and butt against the wall.',
      'Pull your toes up toward your shins as high as humanly possible (full dorsiflexion).',
      'Hold the top peak contraction for 1 full second.',
      'Lower your forefeet back down slowly under control until feet touch the floor.'
    ],
    mistakesToAvoid: [
      'Bending knees to cheat the range of motion.',
      'Rushing through reps without pausing at the top peak.',
      'Bouncing heels.'
    ],
    kaizenTip: 'The tibialis anterior is the primary decelerator of impact when your foot hits the ground during running. Building this eliminates shin splints and cushions the ankle joint.',
    youtubeId: 'bW_Yt6P4m00',
    videoDemoUrl: 'https://www.youtube.com/embed/bW_Yt6P4m00?playsinline=1&rel=0&modestbranding=1',
    animationFrames: {
      startLabel: 'Flat Foot',
      peakLabel: 'Max Dorsiflexion Hold',
      tempo: '1s Up / 1s Squeeze / 2s Down'
    }
  },
  eccentricCalfRaises: {
    id: 'eccentricCalfRaises',
    name: 'Slow Eccentric Calf Raises',
    category: 'Ankle Prehab',
    primaryMuscles: 'Gastrocnemius, Soleus, Achilles Tendon Complex',
    cues: [
      'Stand on a stair ledge or sturdy step with balls of feet on edge and heels hanging off.',
      'Rise up on both feet to full plantarflexion (top of calf raise).',
      'Shift your weight primarily onto the left leg.',
      'Lower your left heel below step level over a strict 4-second count.',
      'Feel the deep, healing stretch through the Achilles and calf before pushing back up.'
    ],
    mistakesToAvoid: [
      'Dropping down fast (defeats the eccentric tendon-strengthening stimulus).',
      'Rolling ankle outward onto the pinky toe (keep weight through big toe ball).',
      'Skipping the bottom stretch.'
    ],
    kaizenTip: 'Eccentric loading stimulates tenocytes to lay down fresh type-I collagen fibers in strained tendons.',
    youtubeId: 'eW57mKqZ7G8',
    videoDemoUrl: 'https://www.youtube.com/embed/eW57mKqZ7G8?playsinline=1&rel=0&modestbranding=1',
    animationFrames: {
      startLabel: 'Top Calf Raise',
      peakLabel: 'Heel Below Step Level',
      tempo: '4-Second Eccentric Lowering'
    }
  },
  couchStretch: {
    id: 'couchStretch',
    name: 'The Couch Stretch (Psoas & Rectus Femoris)',
    category: 'Mobility',
    primaryMuscles: 'Hip Flexors, Quadriceps (Rectus Femoris), Anterior Hip Capsule',
    cues: [
      'Back your rear knee directly into the corner where wall and floor meet.',
      'Shin should be vertical against the wall, top of foot flat against wall.',
      'Step other foot forward into a lunge position with shin vertical.',
      'Squeeze the glute on the wall-leg side tightly and gently lift torso upright.',
      'Maintain a neutral pelvis—never hyperextend lumbar spine.'
    ],
    mistakesToAvoid: [
      'Arching low back to fake an upright torso.',
      'Letting the back knee slide away from the wall.',
      'Failing to squeeze the glute.'
    ],
    kaizenTip: 'Dismantles 8+ hours of desk sitting and restores pelvic alignment, which relieves knee and ankle torque.',
    youtubeId: 'b1o61-9pB5c',
    videoDemoUrl: 'https://www.youtube.com/embed/b1o61-9pB5c?playsinline=1&rel=0&modestbranding=1',
    animationFrames: {
      startLabel: 'Lunge Set',
      peakLabel: 'Torso Upright & Glute Squeezed',
      tempo: '60-Second Deep Diaphragmatic Hold'
    }
  },
  hipFlow9090: {
    id: 'hipFlow9090',
    name: '90-90 Hip Mobility Flow',
    category: 'Mobility',
    primaryMuscles: 'Internal & External Hip Rotators, Gluteus Medius, Piriformis',
    cues: [
      'Sit on floor with lead leg bent at 90 degrees in front (shin parallel to torso).',
      'Trail leg bent at 90 degrees out to side (shin perpendicular to torso).',
      'Sit tall with proud chest; square ribcage toward lead shin.',
      'Hinge forward from hips with a flat back over the lead knee; hold 30s.',
      'Without using hands, pivot smoothly onto heels to switch legs.'
    ],
    mistakesToAvoid: [
      'Rounding upper back instead of hinging from the hips.',
      'Pushing through sharp joint pain (work in a pain-free range).',
      'Collapsing through torso.'
    ],
    kaizenTip: 'Improves rotational hip range so your left knee and ankle do not have to twist improperly when running.',
    youtubeId: 'o-k7lZ_mHhQ',
    videoDemoUrl: 'https://www.youtube.com/embed/o-k7lZ_mHhQ?playsinline=1&rel=0&modestbranding=1',
    animationFrames: {
      startLabel: '90-90 Base',
      peakLabel: 'Forward Hip Hinge',
      tempo: 'Smooth Alternating Transitions'
    }
  }
};
