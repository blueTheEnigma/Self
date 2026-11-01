export interface ExerciseGuide {
  id: string;
  name: string;
  category: 'Calisthenics' | 'Isometric Hold' | 'Ankle Prehab' | 'Mobility';
  primaryMuscles: string;
  cues: string[];
  mistakesToAvoid: string[];
  kaizenTip: string;
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
    videoDemoUrl: 'https://www.youtube.com/results?search_query=perfect+pushup+form+calisthenics',
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
    videoDemoUrl: 'https://www.youtube.com/results?search_query=proper+horse+stance+form+tutorial',
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
    videoDemoUrl: 'https://www.youtube.com/results?search_query=active+dead+hang+form+tutorial',
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
      'Exhale and curl your spine up vertebra by vertebra, tucking chin slightly to engage abs.',
      'At the top, touch torso near thighs without rounding violently.',
      'Lower down smoothly over 2 full seconds; do not drop back flat.'
    ],
    mistakesToAvoid: [
      'Yanking your neck with hands (cervical spine strain).',
      'Bouncing your back off the floor using momentum.',
      'Arching lower back on the way up.'
    ],
    kaizenTip: 'Think of rolling up like a carpet rather than pivoting like a wooden board.',
    videoDemoUrl: 'https://www.youtube.com/results?search_query=proper+controlled+sit+up+form',
    animationFrames: {
      startLabel: 'Supine on Floor',
      peakLabel: 'Vertebral Curl to Top',
      tempo: '2s Concentric / 2s Controlled Negative'
    }
  },
  tibialisWallRaises: {
    id: 'tibialisWallRaises',
    name: 'Tibialis Wall Raises',
    category: 'Ankle Prehab',
    primaryMuscles: 'Tibialis Anterior (Front Shin Muscle & Ankle Decelerator)',
    cues: [
      'Lean your back flat against a wall with buttocks and upper back touching.',
      'Place your feet 12 to 18 inches out in front of you, legs completely straight.',
      'Keeping heels planted firmly on ground, pull your toes and foot upward as high as humanly possible towards your shins.',
      'Hold the peak contraction for 1 full second (feel the intense burn in front of shins).',
      'Slowly lower feet back down until balls of feet lightly kiss the ground, then immediately pull back up.'
    ],
    mistakesToAvoid: [
      'Bending the knees (keeps tension off the tibialis).',
      'Bouncing feet rapidly off the ground without pausing at top.'
    ],
    kaizenTip: 'The tibialis anterior is the brake system of the lower leg. Strengthening it directly stops left ankle pain and shin splints.',
    videoDemoUrl: 'https://www.youtube.com/results?search_query=tibialis+raises+against+wall+tutorial',
    animationFrames: {
      startLabel: 'Heels Planted / Feet Flat',
      peakLabel: 'Toes Pulled High to Shin (Hold 1s)',
      tempo: '1s Up / 1s Pause / 2s Down'
    }
  },
  eccentricCalfRaises: {
    id: 'eccentricCalfRaises',
    name: 'Slow Eccentric Calf Raises',
    category: 'Ankle Prehab',
    primaryMuscles: 'Gastrocnemius, Soleus, Achilles Tendon & Posterior Tibial Tendon',
    cues: [
      'Stand with balls of both feet on the edge of a step, holding a wall or railing for balance.',
      'Rise up onto balls of both feet into full plantarflexion.',
      'Lift the right foot off the step so only your LEFT leg carries your entire 96.5kg body weight.',
      'Lower your left heel down below the level of the step over a strict 3-to-4-second count.',
      'Feel the deep, restorative eccentric stretch in the Achilles and ankle arch.',
      'Put both feet down to push back up, and repeat.'
    ],
    mistakesToAvoid: [
      'Dropping down fast (the entire tendon-strengthening benefit is in the slow 3-4s lowering phase).',
      'Letting the ankle roll outwards or inwards during the descent.'
    ],
    kaizenTip: 'Eccentric contractions remodel collagen fibers in tendons far faster than static stretching.',
    videoDemoUrl: 'https://www.youtube.com/results?search_query=single+leg+eccentric+calf+raise+achilles',
    animationFrames: {
      startLabel: 'Two-Foot Rise',
      peakLabel: 'Single-Foot 4-Second Deep Drop',
      tempo: '3-4s Controlled Negative'
    }
  },
  couchStretch: {
    id: 'couchStretch',
    name: 'The Couch Stretch',
    category: 'Mobility',
    primaryMuscles: 'Psoas, Rectus Femoris, Hip Flexors',
    cues: [
      'Back up to a wall or couch. Place your left knee in the corner where the floor meets the wall.',
      'Shin should be vertical against the wall, toes pointed up.',
      'Step your right foot out in front into a deep lunge position with knee at 90 degrees.',
      'Squeeze your left glute as hard as possible to lock the pelvis in neutral.',
      'Slowly bring your torso upright. You will feel an intense stretch down the front of the hip and thigh.'
    ],
    mistakesToAvoid: [
      'Arching the lower back to fake upright posture (keep ribs down and glute squeezed).',
      'Letting the front knee collapse inward.'
    ],
    kaizenTip: 'Undo hours of desk sitting and release tension pulling on your lower back and knee joints.',
    videoDemoUrl: 'https://www.youtube.com/results?search_query=couch+stretch+tutorial+kelly+starrett',
    animationFrames: {
      startLabel: 'Lunge Entry',
      peakLabel: 'Glute Squeezed & Torso Upright',
      tempo: '2 Minutes Continuous Deep Breathing'
    }
  },
  hipFlow9090: {
    id: 'hipFlow9090',
    name: '90-90 Hip Switch & Pigeon Pose',
    category: 'Mobility',
    primaryMuscles: 'Gluteus Medius, Piriformis, Hip Rotators',
    cues: [
      'Sit on floor with front leg bent at 90 degrees in front of you, shin perpendicular to torso.',
      'Back leg bent at 90 degrees to the side, thigh pointing directly out and shin pointing back.',
      'Square chest towards front shin with spine tall.',
      'Hinge forward at the hips (not rounding upper back) to load the glute.',
      'Hold 45 seconds, then transition smoothly by rotating knees to the opposite side.'
    ],
    mistakesToAvoid: [
      'Rounding the thoracic spine instead of hinging at the hips.',
      'Forcing knee past pain thresholds.'
    ],
    kaizenTip: 'Directly unlocks pelvic alignment, ensuring even force distribution to both ankles when running.',
    videoDemoUrl: 'https://www.youtube.com/results?search_query=90+90+hip+switch+tutorial',
    animationFrames: {
      startLabel: '90-90 Upright Sit',
      peakLabel: 'Forward Hip Hinge over Shin',
      tempo: '45s Hold per side'
    }
  }
};

