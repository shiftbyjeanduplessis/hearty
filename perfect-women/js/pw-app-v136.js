(function () {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  let selectedDuration = 20;
  let activeRecipeFilter = 'All';
  let compareAngle = 'front';
  let compareDateAId = null;
  let compareDateBId = null;
  let mealSpinRotation = 0;
  let mealIdeasVisible = false;
  let deferredInstallPrompt = null;
  let focusedProgramKey = null;
  let foundationWorkoutRuntime = null;
  let foundationWorkoutTimer = null;
  let foundationLastPersistSecond = -1;

  const pageTitles = {
    home: 'Today',
    track: 'Track',
    programs: 'Programs',
    progress: 'Progress',
    photos: 'Photos',
    recipes: 'Recipes',
    settings: 'Settings'
  };


  const ICONS = {
    settings: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.04.04a2.1 2.1 0 0 1-2.97 2.97l-.04-.04a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.08 1.65V21a2.1 2.1 0 0 1-4.2 0v-.06A1.8 1.8 0 0 0 8.4 19.3a1.8 1.8 0 0 0-2 .36l-.04.04a2.1 2.1 0 0 1-2.97-2.97l.04-.04a1.8 1.8 0 0 0 .36-2 1.8 1.8 0 0 0-1.65-1.08H2.1a2.1 2.1 0 0 1 0-4.2h.06A1.8 1.8 0 0 0 3.8 8.4a1.8 1.8 0 0 0-.36-2l-.04-.04A2.1 2.1 0 0 1 6.37 3.4l.04.04a1.8 1.8 0 0 0 2 .36 1.8 1.8 0 0 0 1.08-1.65V2.1a2.1 2.1 0 0 1 4.2 0v.06A1.8 1.8 0 0 0 14.8 3.8a1.8 1.8 0 0 0 2-.36l.04-.04a2.1 2.1 0 0 1 2.97 2.97l-.04.04a1.8 1.8 0 0 0-.36 2c.26.67.9 1.1 1.62 1.1h.07a2.1 2.1 0 0 1 0 4.2h-.06a1.8 1.8 0 0 0-1.65 1.08z"></path>',
    water: '<path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z"></path><path d="M9.5 14.6a2.9 2.9 0 0 0 4.4 2.4"></path>',
    walk: '<circle cx="12" cy="5" r="2"></circle><path d="M10.5 9.2 8.8 13l-2.3 2.2"></path><path d="M11.2 9.2h2.2l2.1 3.2"></path><path d="M11.6 13.2 13 16l.8 4"></path><path d="M9.2 20l2.3-3.8"></path>',
    run: '<circle cx="12" cy="4.5" r="2"></circle><path d="M10 8.5 7.5 12 5 13"></path><path d="M11.5 8.2 15 10l2.2 2.4"></path><path d="M12.4 12.1 10.5 16.3 7.4 20"></path><path d="M13.1 13.1 16.2 16l2.4 4"></path>',
    check: '<path d="M20 6 9 17l-5-5"></path>',
    workout: '<path d="M3 9v6"></path><path d="M7 7v10"></path><path d="M17 7v10"></path><path d="M21 9v6"></path><path d="M7 12h10"></path>',
    strength: '<path d="M3 9v6"></path><path d="M7 7v10"></path><path d="M17 7v10"></path><path d="M21 9v6"></path><path d="M7 12h10"></path><path d="M9.5 5.5h5"></path><path d="M9.5 18.5h5"></path>',
    chart: '<path d="M4 19V5"></path><path d="M4 19h16"></path><path d="m7 15 3-4 3 2 5-7"></path><path d="M18 6h-4"></path><path d="M18 6v4"></path>',
    ruler: '<path d="M4 17 17 4l3 3L7 20l-3-3z"></path><path d="m14 7 3 3"></path><path d="m11 10 2 2"></path><path d="m8 13 3 3"></path>',
    camera: '<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.7l1.1-1.6h5.4L15.8 6h1.7A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8z"></path><circle cx="12" cy="12.5" r="3.2"></circle>',
    upload: '<path d="M12 16V5"></path><path d="m7 10 5-5 5 5"></path><path d="M5 19h14"></path>',
    home: '<path d="m3 11 9-8 9 8"></path><path d="M5.5 10.5V21h13V10.5"></path><path d="M9.5 21v-6h5v6"></path>',
    plate: '<circle cx="12" cy="12" r="7"></circle><circle cx="12" cy="12" r="3.5"></circle><path d="M3.5 4.5v15"></path><path d="M20.5 4.5v15"></path>',
    program: '<path d="M5 4h14a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 19 20H5a1.5 1.5 0 0 1-1.5-1.5v-13A1.5 1.5 0 0 1 5 4z"></path><path d="M8 8h8"></path><path d="M8 12h8"></path><path d="M8 16h5"></path>',
    spark: '<path d="M12 2.8 13.7 8l5.4 1.4-5.4 1.4L12 16l-1.7-5.2-5.4-1.4L10.3 8 12 2.8z"></path><path d="M18.5 14.5l.8 2.3 2.3.7-2.3.7-.8 2.3-.8-2.3-2.3-.7 2.3-.7.8-2.3z"></path><path d="M5.5 15.5l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6.6-1.8z"></path>',
    heart: '<path d="M20.8 5.8a5.2 5.2 0 0 0-7.4 0L12 7.2l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 22l8.8-8.8a5.2 5.2 0 0 0 0-7.4z"></path>'
  };

  function icon(name) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.check}</svg>`;
  }

  const JOGGING_PLAN = [
    { week: 1, sessions: [
      { key: 'foundation', label: 'Foundation run', targetKm: 1.5, note: 'Easy pace. Keep it comfortable.' },
      { key: 'form', label: 'Form focus', targetKm: 1.0, note: 'Easy run plus 4 short relaxed stride-outs.' },
      { key: 'long', label: 'Long slow run', targetKm: 2.0, note: 'Conversational pace.' },
      { key: 'optional', label: 'Optional easy jog', targetKm: 1.0, optional: true, note: 'Only if you feel fresh.' }
    ]},
    { week: 2, sessions: [
      { key: 'foundation', label: 'Foundation run', targetKm: 1.5, note: 'Easy pace. Repeat the baseline.' },
      { key: 'form', label: 'Form focus', targetKm: 1.0, note: 'Easy run plus 4 short relaxed stride-outs.' },
      { key: 'long', label: 'Long slow run', targetKm: 2.5, note: 'Slow and steady.' },
      { key: 'optional', label: 'Optional easy jog', targetKm: 1.0, optional: true, note: 'Only if you feel fresh.' }
    ]},
    { week: 3, sessions: [
      { key: 'foundation', label: 'Foundation run', targetKm: 2.5, note: 'Easy pace. Do not chase speed.' },
      { key: 'form', label: 'Form focus', targetKm: 2.0, note: 'Relaxed form and quick light steps.' },
      { key: 'long', label: 'Long slow run', targetKm: 3.0, note: 'Comfortable pace.' },
      { key: 'optional', label: 'Optional easy jog', targetKm: 1.5, optional: true, note: 'Keep it very easy.' }
    ]},
    { week: 4, sessions: [
      { key: 'foundation', label: 'Foundation run', targetKm: 2.5, note: 'Easy controlled effort.' },
      { key: 'form', label: 'Form focus', targetKm: 2.0, note: 'Add relaxed stride-outs if you feel good.' },
      { key: 'long', label: 'Long slow run', targetKm: 3.5, note: 'Build distance gently.' },
      { key: 'optional', label: 'Optional easy jog', targetKm: 1.5, optional: true, note: 'Skip if tired.' }
    ]},
    { week: 5, sessions: [
      { key: 'foundation', label: 'Foundation run', targetKm: 3.5, note: 'Easy pace. Stay patient.' },
      { key: 'form', label: 'Form focus', targetKm: 2.5, note: 'Focus on posture and light feet.' },
      { key: 'long', label: 'Long slow run', targetKm: 4.0, note: 'Comfort over speed.' },
      { key: 'optional', label: 'Optional easy jog', targetKm: 2.0, optional: true, note: 'Only if recovered.' }
    ]},
    { week: 6, sessions: [
      { key: 'foundation', label: 'Foundation run', targetKm: 3.5, note: 'Easy steady effort.' },
      { key: 'form', label: 'Form focus', targetKm: 2.5, note: 'Controlled stride-outs if fresh.' },
      { key: 'long', label: 'Long slow run', targetKm: 4.5, note: 'Slow enough to finish well.' },
      { key: 'optional', label: 'Optional easy jog', targetKm: 2.0, optional: true, note: 'Skip if legs feel heavy.' }
    ]},
    { week: 7, sessions: [
      { key: 'foundation', label: 'Foundation run', targetKm: 4.0, note: 'Easy and confident.' },
      { key: 'form', label: 'Form focus', targetKm: 3.0, note: 'Relaxed form, no sprinting.' },
      { key: 'long', label: 'Long slow run', targetKm: 5.0, note: 'First 5 km practice.' },
      { key: 'optional', label: 'Optional easy jog', targetKm: 2.5, optional: true, note: 'Very easy only.' }
    ]},
    { week: 8, sessions: [
      { key: 'foundation', label: 'Foundation run', targetKm: 4.0, note: 'Easy confidence builder.' },
      { key: 'form', label: 'Form focus', targetKm: 3.0, note: 'Light relaxed running.' },
      { key: 'test', label: '5 km run', targetKm: 5.0, note: 'Complete your 5 km at a steady, safe pace.' },
      { key: 'optional', label: 'Optional recovery jog', targetKm: 3.0, optional: true, note: 'Only if you feel good after the 5 km.' }
    ]}
  ];

  const STRENGTH_ORDER = ['squat', 'push', 'pull', 'hinge', 'core'];
  const STRENGTH_MOVEMENTS = {
    squat: {
      title: 'Lower body',
      homeChain: ['Assisted Sit-to-Stand', 'Sit-to-Stand', 'Chair Squat Hover', 'Bodyweight Squat'],
      gymChain: ['Leg Press'],
      homeImages: ['./images/exercises/home/squat/sit_to_stand_assisted.webp', './images/exercises/home/squat/sit_to_stand.webp', './images/exercises/home/squat/chair_squat_hover.webp', './images/exercises/home/squat/bodyweight_squat.webp'],
      gymImages: ['./images/exercises/gym/leg_press.webp'],
      tips: {
        'Assisted Sit-to-Stand': ['Sit on a stable chair with feet flat.', 'Use your hands lightly if needed.', 'Stand up slowly, then sit down with control.'],
        'Sit-to-Stand': ['Sit tall with feet flat.', 'Stand without using your hands if possible.', 'Lower slowly back to the chair.'],
        'Chair Squat Hover': ['Stand in front of the chair.', 'Push hips back and hover just above the chair.', 'Stand back up without fully sitting.'],
        'Bodyweight Squat': ['Stand tall with feet comfortable.', 'Push hips back and bend knees naturally.', 'Lower to a controlled depth, then stand smoothly.'],
        'Leg Press': ['Set your back firmly against the pad.', 'Place both feet flat on the platform.', 'Push without locking your knees, then return slowly.']
      }
    },
    push: {
      title: 'Upper body push',
      homeChain: ['Wall Push-Up — Close', 'Wall Push-Up — Medium', 'Wall Push-Up — Far', 'Incline Push-Up — High', 'Incline Push-Up — Low', 'Floor Push-Up'],
      gymChain: ['Chest Press Machine'],
      homeImages: ['./images/exercises/home/push/wall_pushup_close.webp', './images/exercises/home/push/wall_pushup_medium.webp', './images/exercises/home/push/wall_pushup_far.webp', './images/exercises/home/push/incline_pushup_high.webp', './images/exercises/home/push/incline_pushup_low.webp', './images/exercises/home/push/floor_pushup.webp'],
      gymImages: ['./images/exercises/gym/chest_press.webp'],
      tips: {
        'Wall Push-Up — Close': ['Hands at chest height on a wall.', 'Keep body long from shoulders to heels.', 'Bend elbows slightly, then press back.'],
        'Wall Push-Up — Medium': ['Step a little further from the wall.', 'Keep ribs down and shoulders relaxed.', 'Lower with control, then press back.'],
        'Wall Push-Up — Far': ['Stand further from the wall for more challenge.', 'Keep the body straight.', 'Do not shrug your shoulders.'],
        'Incline Push-Up — High': ['Hands on a sturdy high surface.', 'Keep shoulders-to-heels in a straight line.', 'Lower with control, then press back up.'],
        'Incline Push-Up — Low': ['Use a lower sturdy surface.', 'Keep hips from sagging.', 'Move smoothly through each rep.'],
        'Floor Push-Up': ['Start in a strong plank position.', 'Lower with control.', 'Press back up without letting hips sag.'],
        'Chest Press Machine': ['Sit tall with back supported.', 'Hold handles with shoulders relaxed.', 'Press forward, then return slowly.']
      }
    },
    pull: {
      title: 'Upper body pull',
      homeChain: ['Band Row — Close Stance', 'Band Row — Step Back', 'Band Row — Further Back', 'Band Row — 1-Second Pause'],
      gymChain: ['Seated Row'],
      homeImages: ['./images/exercises/home/pull/band_row_level1.webp', './images/exercises/home/pull/band_row_level2.webp', './images/exercises/home/pull/band_row_level3.webp', './images/exercises/home/pull/band_row_level4.webp'],
      gymImages: ['./images/exercises/gym/seated_row.webp'],
      tips: {
        'Band Row — Close Stance': ['Attach the band securely.', 'Stand close enough that tension feels light.', 'Pull elbows back, then return slowly.'],
        'Band Row — Step Back': ['Take a small step back to increase tension.', 'Pull to the ribs.', 'Control the return.'],
        'Band Row — Further Back': ['Use moderate band tension.', 'Keep chest open and shoulders relaxed.', 'Pause briefly at the back.'],
        'Band Row — 1-Second Pause': ['Pull elbows back and pause one second.', 'Keep shoulders down.', 'Return slowly without snapping the band.'],
        'Seated Row': ['Sit tall with feet braced.', 'Start with arms extended and shoulders relaxed.', 'Pull handles toward lower chest, then return slowly.']
      }
    },
    hinge: {
      title: 'Posterior chain',
      homeChain: ['Glute Bridge', 'Long Lever Glute Bridge', 'Bridge March'],
      gymChain: ['Lat Pulldown'],
      homeImages: ['./images/exercises/home/hinge/glute_bridge.webp', './images/exercises/home/hinge/long_lever_bridge.webp', './images/exercises/home/hinge/bridge_march.webp'],
      gymImages: ['./images/exercises/gym/lat_pulldown.webp'],
      tips: {
        'Glute Bridge': ['Lie on your back with knees bent.', 'Press through heels and lift hips smoothly.', 'Lower back down with control.'],
        'Long Lever Glute Bridge': ['Move feet a little further from your body.', 'Lift hips without over-arching.', 'Lower slowly.'],
        'Bridge March': ['Hold a bridge with hips level.', 'Lift one bent knee slightly.', 'Alternate sides with control.'],
        'Lat Pulldown': ['Sit under the bar and hold wide.', 'Keep chest lifted.', 'Pull to upper chest, then return slowly.']
      }
    },
    core: {
      title: 'Core / shoulder',
      homeChain: ['Seated Core Brace', 'Incline Plank', 'Floor Plank'],
      gymChain: ['Shoulder Press Machine'],
      homeImages: ['./images/exercises/home/core/core_brace.webp', './images/exercises/home/core/incline_plank.webp', './images/exercises/home/core/plank.webp'],
      gymImages: ['./images/exercises/gym/shoulder_press.webp'],
      tips: {
        'Seated Core Brace': ['Sit tall with feet flat.', 'Gently tighten your midsection.', 'Breathe normally while holding the brace.'],
        'Incline Plank': ['Hands on a bench or sturdy surface.', 'Step feet back into a straight line.', 'Hold hips steady and breathe.'],
        'Floor Plank': ['Hands under shoulders.', 'Straight line from shoulders to heels.', 'Do not let hips sag.'],
        'Shoulder Press Machine': ['Sit tall with back supported.', 'Start handles at shoulder height.', 'Press upward, then lower with control.']
      }
    }
  };

  const FOUNDATION_HOME_PROGRAM = {
    totalWeeks: 4,
    weeks: {
      1: {
        targetSessions: 3,
        title: 'Build the foundation',
        note: 'Complete the same guided foundation session three times this week. Try to leave a rest day between sessions.',
        workouts: [{ id: 'foundation-session', title: 'Foundation Session', subtitle: 'Warm-up • strength • mobility • gentle cardio', estimatedMinutes: 34, mode: 'sequence' }]
      },
      2: {
        targetSessions: 3,
        title: 'Repeat and improve',
        note: 'Repeat the foundation session three times. Aim for smoother movement and more control rather than rushing.',
        workouts: [{ id: 'foundation-session', title: 'Foundation Session', subtitle: 'Warm-up • strength • mobility • gentle cardio', estimatedMinutes: 34, mode: 'sequence' }]
      },
      3: {
        targetSessions: 4,
        title: 'Move into 20-minute circuits',
        note: 'Complete each of the four workouts once this week. Use the low-impact option whenever you need it.',
        workouts: [
          { id: 'upper-cardio-circuit', title: 'Workout 1 — Upper Body & Cardio', subtitle: '20-minute guided circuit', estimatedMinutes: 20, mode: 'circuit', overallSeconds: 1200 },
          { id: 'pyramid-circuit', title: 'Workout 2 — Pyramid', subtitle: 'Descending-rep challenge', estimatedMinutes: 20, mode: 'pyramid', overallSeconds: 1200 },
          { id: 'full-body-circuit', title: 'Workout 3 — Full Body', subtitle: '20-minute guided circuit', estimatedMinutes: 20, mode: 'circuit', overallSeconds: 1200 },
          { id: 'strength-intervals', title: 'Workout 4 — Strength Intervals', subtitle: '3 rounds with guided rest', estimatedMinutes: 20, mode: 'rounds', rounds: 3 }
        ]
      },
      4: {
        targetSessions: 4,
        title: 'Build confidence and consistency',
        note: 'Repeat all four workouts. Keep your effort controlled and focus on finishing each session well.',
        workouts: [
          { id: 'upper-cardio-circuit', title: 'Workout 1 — Upper Body & Cardio', subtitle: '20-minute guided circuit', estimatedMinutes: 20, mode: 'circuit', overallSeconds: 1200 },
          { id: 'pyramid-circuit', title: 'Workout 2 — Pyramid', subtitle: 'Descending-rep challenge', estimatedMinutes: 20, mode: 'pyramid', overallSeconds: 1200 },
          { id: 'full-body-circuit', title: 'Workout 3 — Full Body', subtitle: '20-minute guided circuit', estimatedMinutes: 20, mode: 'circuit', overallSeconds: 1200 },
          { id: 'strength-intervals', title: 'Workout 4 — Strength Intervals', subtitle: '3 rounds with guided rest', estimatedMinutes: 20, mode: 'rounds', rounds: 3 }
        ]
      }
    }
  };

  const FOUNDATION_IMAGES = {
    'Chair Squat': './images/exercises/home/squat/sit_to_stand_assisted.webp',
    'Squat / Chair Squat': './images/exercises/home/squat/chair_squat_hover.webp',
    'Bodyweight / Chair Squat': './images/exercises/home/squat/bodyweight_squat.webp',
    'Wall Push-Up': './images/exercises/home/push/wall_pushup_close.webp',
    'Single-Arm Wall Push-Up': './images/exercises/home/push/wall_pushup_far.webp',
    'Bent-Over Towel / Band Row': './images/exercises/home/pull/band_row_level1.webp',
    'Bent-Over Row': './images/exercises/home/pull/band_row_level2.webp',
    'Glute Bridge': './images/exercises/home/hinge/glute_bridge.webp',
    'Plank': './images/exercises/home/core/plank.webp',
    'Plank with Reach': './images/exercises/home/core/incline_plank.webp',
    'Core Brace': './images/exercises/home/core/core_brace.webp'
  };

  const FOUNDATION_BASE_STEPS = [
    {
      name: '5-Minute Warm-Up Flow', phase: 'Warm-up', seconds: 300, type: 'timed',
      target: '5 minutes', cue: 'Cycle through marching in place, large arm circles, hip circles, small arm circles and cross crunches at a comfortable pace.',
      lowImpact: 'Keep the march low and use a chair for balance if needed.'
    },
    { name: 'Chair Squat', key: 'squat', phase: 'Strength', type: 'strength-exercise', sets: 3, targetMin: 8, targetMax: 12, restSeconds: 75, cue: 'Sit back toward a stable chair, lightly touch or sit, then stand tall with control.' },
    { name: 'Wall Push-Up', key: 'push', phase: 'Strength', type: 'strength-exercise', sets: 3, targetMin: 8, targetMax: 12, restSeconds: 75, cue: 'Hands at chest height, body long, lower toward the wall and press back smoothly.' },
    { name: 'Bent-Over Towel / Band Row', key: 'pull', phase: 'Strength', type: 'strength-exercise', sets: 3, targetMin: 8, targetMax: 12, restSeconds: 75, cue: 'Hinge at the hips, pull toward your ribs and squeeze your shoulder blades gently.' },
    { name: 'Glute Bridge', key: 'hinge', phase: 'Strength', type: 'strength-exercise', sets: 3, targetMin: 8, targetMax: 12, restSeconds: 75, cue: 'Press through your heels, lift your hips and lower slowly without over-arching.' },
    { name: 'Seated Leg Extension', key: 'legExtension', phase: 'Strength', type: 'strength-exercise', sets: 3, targetMin: 10, targetMax: 15, restSeconds: 60, cue: 'Sit tall, straighten one leg, pause briefly and lower with control.' },
    { name: 'Plank', phase: 'Core', sets: 2, seconds: 25, restSeconds: 45, cue: 'Hold a strong position and breathe. Stop before your hips sag.', lowImpact: 'Use an incline plank against a sturdy table or wall.' },
    { name: 'Cat-Cow Stretch', phase: 'Mobility', seconds: 60, type: 'timed', target: '1 minute', cue: 'On all fours, gently alternate between rounding and arching your back.' },
    { name: 'Seated Hamstring Stretch', phase: 'Mobility', seconds: 60, type: 'timed', target: '30 seconds per leg', cue: 'Extend one leg and lean forward gently while keeping your back long.' },
    { name: "Child's Pose", phase: 'Mobility', seconds: 60, type: 'timed', target: '1 minute', cue: 'Sit back toward your heels and reach your arms forward comfortably.' },
    { name: 'Gentle Walk', phase: 'Cardio', seconds: 300, type: 'timed', target: '5 minutes', cue: 'Walk in place or around the house at an easy, sustainable pace.', lowImpact: 'This is optional. Skip it if you are tired or sore.' }
  ];

  const FOUNDATION_CIRCUITS = {
    'upper-cardio-circuit': [
      { name: 'Cross Jacks / Step Jacks', phase: 'Cardio', seconds: 30, type: 'timed', cue: 'Move continuously for 30 seconds.', lowImpact: 'Step one foot out at a time instead of jumping.' },
      { name: 'Wall Push-Up', phase: 'Upper Body', reps: '10 reps', cue: 'Keep your body long and press smoothly.' },
      { name: 'Small Arm Circles', phase: 'Shoulders', reps: '30 circles', cue: 'Keep shoulders relaxed and make controlled circles.' },
      { name: 'High Knees / March', phase: 'Cardio', seconds: 30, type: 'timed', cue: 'Lift knees at a pace you can control.', lowImpact: 'March in place and keep the knees lower.' },
      { name: 'Shoulder Press', phase: 'Upper Body', reps: '10 reps', cue: 'Use light dumbbells or household objects. Press overhead without arching your back.' },
      { name: 'Wall Push-Up', phase: 'Upper Body', reps: '10 reps', cue: 'Use the single-arm version only if it feels stable and controlled.' },
      { name: 'Punches', phase: 'Cardio', reps: '50 punches', cue: 'Keep your core gently braced and punch forward with control.' },
      { name: 'Tricep Kickback', phase: 'Upper Body', reps: '10 reps per arm', cue: 'Keep elbows close to your body and straighten the arm behind you.' },
      { name: 'Large Arm Circles', phase: 'Shoulders', reps: '30 circles', cue: 'Move through a comfortable range without shrugging.' }
    ],
    'full-body-circuit': [
      { name: 'Cross Jacks / Step Jacks', phase: 'Cardio', seconds: 30, type: 'timed', cue: 'Move continuously for 30 seconds.', lowImpact: 'Step side to side instead of jumping.' },
      { name: 'Bodyweight / Chair Squat', phase: 'Lower Body', reps: '10 reps', cue: 'Sit back, keep feet planted and stand tall.' },
      { name: 'Superman', phase: 'Back', reps: '10 reps', cue: 'Lift arms and legs only as high as comfortable. Keep your neck relaxed.' },
      { name: 'High Knees / March', phase: 'Cardio', seconds: 30, type: 'timed', cue: 'Keep moving at a controlled pace.', lowImpact: 'March in place.' },
      { name: 'Supported Lunge', phase: 'Lower Body', reps: '10 reps per leg', cue: 'Use a chair for balance and keep the range small.' },
      { name: 'Reverse Crunch', phase: 'Core', reps: '10 reps', cue: 'Move slowly and keep your lower back comfortable.' },
      { name: 'Skaters / Side Steps', phase: 'Cardio', seconds: 30, type: 'timed', cue: 'Move side to side with soft knees.', lowImpact: 'Use simple side steps without hopping.' },
      { name: 'Glute Bridge', phase: 'Lower Body', reps: '10 reps', cue: 'Lift and lower your hips with control.' },
      { name: 'Dead Bug', phase: 'Core', reps: '10 alternating reps', cue: 'Keep your lower back gently supported and move slowly.' }
    ]
  };

  function foundationWeekData(week) {
    return FOUNDATION_HOME_PROGRAM.weeks[Math.min(4, Math.max(1, Number(week || 1)))] || FOUNDATION_HOME_PROGRAM.weeks[1];
  }

  function foundationWorkoutDefinition(week, workoutId) {
    const info = foundationWeekData(week);
    return info.workouts.find((item) => item.id === workoutId) || info.workouts[0];
  }

  function strengthSetPlan(baseWeight, increment, totalSets = 3, targetMin = 8, targetMax = 12) {
    const working = Math.max(0, Number(baseWeight || 0));
    const step = Math.max(0.5, Number(increment || 1));
    const rounded = (value) => working > 0 ? Math.max(0, Math.round(value / step) * step) : 0;
    const standard = [
      { setNumber: 1, setType: 'warmup', label: 'Warm-up set', purpose: 'Easy preparation set', factor: 0.6, targetMin: Math.max(6, targetMin), targetMax: Math.max(8, targetMin + 2) },
      { setNumber: 2, setType: 'build-up', label: 'Build-up set', purpose: 'Slightly heavier than set 1', factor: 0.8, targetMin, targetMax },
      { setNumber: 3, setType: 'working', label: 'Working set', purpose: 'Main progressive-overload set', factor: 1, targetMin, targetMax }
    ];
    return standard.slice(0, Math.max(1, totalSets)).map((item) => ({
      ...item,
      suggestedWeightKg: rounded(working * item.factor)
    }));
  }

  function strengthLoadSuggestion(s, type, key) {
    const clean = type === 'gym' ? 'gym' : 'home';
    const progress = s.strengthProgram?.progress?.[key] || {};
    const next = Number(progress.nextWeightKg?.[clean]);
    const fallback = clean === 'gym' ? Number(progress.gymWeight || 0) : Number(progress.homeWeightKg || 0);
    const workingWeight = Number.isFinite(next) && next >= 0 ? next : Math.max(0, fallback);
    const increment = clean === 'gym' ? (key === 'squat' ? 5 : 2.5) : 1;
    return {
      workingWeight,
      increment,
      previousWeight: Number(progress.lastWorkingWeightKg || 0),
      previousReps: Number(progress.lastWorkingReps || 0),
      recommendation: progress.lastRecommendation || (workingWeight > 0 ? `Start with ${workingWeight} kg and adjust if needed.` : 'Start with bodyweight or light resistance and record what you use.')
    };
  }

  function foundationBaseStepList() {
    const out = [];
    const s = state();
    FOUNDATION_BASE_STEPS.forEach((def) => {
      if (def.type === 'strength-exercise') {
        const load = strengthLoadSuggestion(s, 'home', def.key);
        out.push({
          ...def,
          type: 'strength-exercise',
          totalSets: Math.max(1, Number(def.sets || 3)),
          target: `${def.sets || 3} sets • ${def.targetMin || 8}–${def.targetMax || 12} reps`,
          image: FOUNDATION_IMAGES[def.name] || '',
          baseWorkingWeightKg: load.workingWeight,
          previousWeightKg: load.previousWeight,
          previousReps: load.previousReps,
          priorRecommendation: load.recommendation,
          incrementKg: load.increment,
          setPlan: strengthSetPlan(load.workingWeight, load.increment, def.sets || 3, def.targetMin || 8, def.targetMax || 12),
          setLogs: []
        });
        return;
      }
      const sets = Math.max(1, Number(def.sets || 1));
      for (let set = 1; set <= sets; set += 1) {
        out.push({
          ...def,
          type: def.type || (def.seconds ? 'timed' : 'reps'),
          set,
          totalSets: sets,
          target: def.target || `${def.reps || def.seconds + ' seconds'}${sets > 1 ? ` • Set ${set} of ${sets}` : ''}`,
          image: FOUNDATION_IMAGES[def.name] || ''
        });
        if (set < sets && def.restSeconds) {
          out.push({ name: 'Rest', phase: 'Recovery', type: 'rest', seconds: def.restSeconds, target: `${def.restSeconds} seconds`, cue: 'Breathe, reset your position and get ready for the next set.' });
        }
      }
    });
    return out;
  }

  function foundationCircuitSteps(workoutId) {
    return (FOUNDATION_CIRCUITS[workoutId] || []).map((step) => ({
      ...step,
      type: step.type || (step.seconds ? 'timed' : 'reps'),
      target: step.target || step.reps || `${step.seconds} seconds`,
      image: FOUNDATION_IMAGES[step.name] || ''
    }));
  }

  function foundationPyramidSteps() {
    const bases = [
      ['Squat / Chair Squat', 8, 'Lower Body', 'Sit back with control and stand tall.'],
      ['Star Jumps / Step Jacks', 20, 'Cardio', 'Use step jacks for the low-impact version.'],
      ['Plank with Reach', 10, 'Core', 'Reach one arm at a time while keeping hips steady.'],
      ['Punches', 20, 'Cardio', 'Punch forward with control and keep your shoulders relaxed.'],
      ['Sit-Up / Core Brace', 10, 'Core', 'Use a seated core brace if sit-ups are not comfortable.'],
      ['Heel Taps', 40, 'Core', 'Reach side to side without pulling on your neck.']
    ];
    const out = [];
    for (let round = 1; round <= 10; round += 1) {
      bases.forEach(([name, start, phase, cue]) => {
        const reps = Math.max(1, start - (round - 1));
        out.push({ name, phase, type: 'reps', target: `${reps} reps • Round ${round} of 10`, reps, round, totalRounds: 10, cue, image: FOUNDATION_IMAGES[name] || '' });
      });
    }
    return out;
  }

  function foundationStrengthIntervalSteps() {
    const base = [
      { name: 'High Knees / March', phase: 'Warm-up', type: 'timed', seconds: 30, target: '30 seconds', cue: 'Move at a controlled pace.', lowImpact: 'March in place.' },
      { name: 'Hip Flexor Stretch', phase: 'Mobility', type: 'timed', seconds: 60, target: '30 seconds per leg', cue: 'Keep your torso tall and gently shift forward.' },
      { name: 'Squat / Chair Squat', phase: 'Strength', type: 'reps', target: '10 reps', cue: 'Use a chair for support if needed.', image: FOUNDATION_IMAGES['Squat / Chair Squat'] },
      { name: 'Rest', phase: 'Recovery', type: 'rest', seconds: 60, target: '1 minute', cue: 'Breathe and prepare for glute bridges.' },
      { name: 'Glute Bridge', phase: 'Strength', type: 'reps', target: '12 reps', cue: 'Lift and lower your hips slowly.', image: FOUNDATION_IMAGES['Glute Bridge'] },
      { name: 'Rest', phase: 'Recovery', type: 'rest', seconds: 60, target: '1 minute', cue: 'Breathe and prepare for lunges.' },
      { name: 'Supported Lunge', phase: 'Strength', type: 'reps', target: '10 reps per leg', cue: 'Hold a chair and keep the range comfortable.' },
      { name: 'Rest', phase: 'Recovery', type: 'rest', seconds: 60, target: '1 minute', cue: 'Breathe and prepare for mountain climbers.' },
      { name: 'Mountain Climbers / Standing Knee Drives', phase: 'Cardio', type: 'reps', target: '30 alternating reps', cue: 'Keep your core steady.', lowImpact: 'Use standing knee drives instead.' }
    ];
    const out = [];
    for (let round = 1; round <= 3; round += 1) {
      base.forEach((step) => out.push({ ...step, round, totalRounds: 3, target: `${step.target} • Round ${round} of 3` }));
    }
    return out;
  }

  function buildFoundationWorkoutRuntime(week, workoutId) {
    const workout = foundationWorkoutDefinition(week, workoutId);
    let steps = [];
    let loop = false;
    if (workout.id === 'foundation-session') steps = foundationBaseStepList();
    else if (workout.mode === 'circuit') { steps = foundationCircuitSteps(workout.id); loop = true; }
    else if (workout.mode === 'pyramid') steps = foundationPyramidSteps();
    else if (workout.mode === 'rounds') steps = foundationStrengthIntervalSteps();
    return {
      version: 2,
      programType: 'home',
      workoutId: workout.id,
      workoutTitle: workout.title,
      workoutSubtitle: workout.subtitle,
      week: Number(week),
      mode: workout.mode,
      loop,
      overallSeconds: Number(workout.overallSeconds || 0),
      overallRemaining: Number(workout.overallSeconds || 0),
      elapsedSeconds: 0,
      stepIndex: 0,
      round: 1,
      completedStepCount: 0,
      steps,
      stepRemaining: Number(steps[0]?.seconds || 0),
      currentSet: 1,
      setStage: steps[0]?.type === 'strength-exercise' ? 'ready' : '',
      setElapsedSeconds: 0,
      currentWeightKg: Number(steps[0]?.setPlan?.[0]?.suggestedWeightKg || 0),
      selectedReps: null,
      running: false,
      startedAt: new Date().toISOString(),
      date: window.PWStore.todayKey()
    };
  }

  function buildGymWorkoutRuntime() {
    const s = state();
    const week = strengthWeekNumberForDate(s, 'gym');
    const steps = buildStrengthSessionExercises(s, 'gym').map((exercise) => ({
      key: exercise.key,
      name: exercise.name,
      movement: exercise.movement,
      phase: 'Strength',
      type: 'strength-exercise',
      image: exercise.image,
      cue: exercise.tips.join(' '),
      tips: exercise.tips,
      target: exercise.target,
      targetMin: exercise.targetMin,
      targetMax: exercise.targetMax,
      totalSets: 3,
      restSeconds: 90,
      baseWorkingWeightKg: exercise.workingWeightKg,
      previousWeightKg: exercise.previousWeightKg,
      previousReps: exercise.previousReps,
      priorRecommendation: exercise.recommendation,
      incrementKg: exercise.incrementKg,
      setPlan: strengthSetPlan(exercise.workingWeightKg, exercise.incrementKg, 3, exercise.targetMin, exercise.targetMax),
      setLogs: []
    }));
    return {
      version: 2,
      programType: 'gym',
      workoutId: 'gym-beginner-session',
      workoutTitle: 'Gym Beginner Strength',
      workoutSubtitle: 'Machine-based progressive strength session',
      week,
      mode: 'strength',
      loop: false,
      overallSeconds: 0,
      overallRemaining: 0,
      elapsedSeconds: 0,
      stepIndex: 0,
      round: 1,
      completedStepCount: 0,
      steps,
      stepRemaining: 0,
      currentSet: 1,
      setStage: 'ready',
      setElapsedSeconds: 0,
      currentWeightKg: Number(steps[0]?.setPlan?.[0]?.suggestedWeightKg || 0),
      selectedReps: null,
      running: false,
      startedAt: new Date().toISOString(),
      date: window.PWStore.todayKey()
    };
  }


  function renderStaticIcons() {
    $$('[data-icon]').forEach((el) => {
      el.innerHTML = icon(el.dataset.icon);
    });
  }

  function state() { return window.PWStore.getState(); }
  function fmtDate(dateKey) {
    if (!dateKey) return '—';
    const [y, m, d] = dateKey.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function pct(value, target) {
    if (!target) return 0;
    return Math.min(100, Math.round((value / target) * 100));
  }
  function toast(message) {
    const existing = $('.toast');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }


  function setOnboardingVisible(visible) {
    const overlay = $('#onboardingOverlay');
    if (!overlay) return;
    overlay.classList.toggle('active', !!visible);
    overlay.setAttribute('aria-hidden', visible ? 'false' : 'true');
  }

  function showOnboarding() {
    const s = state();
    $('#onboardName').value = s.client.name || '';
    const weights = window.PWStore.sortedWeights();
    const firstWeight = s.client.startingWeightKg || weights[0]?.kg || '';
    $('#onboardWeight').value = firstWeight || '';
    setOnboardingVisible(true);
  }

  function maybeShowOnboarding() {
    const s = state();
    if (!s.client.onboarded) showOnboarding();
  }

  function scrollToPanel(id) {
    if (!id) return;
    window.setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('attention-target');
      window.setTimeout(() => el.classList.remove('attention-target'), 1300);
    }, 80);
  }

  function programIsStarted(s, key) {
    if (key === 'walking') return !!s.walkingProgram?.started;
    if (key === 'jogging') return !!s.joggingProgram?.started;
    if (key === 'homeStrength') return !!s.strengthProgram?.home?.started;
    if (key === 'gymStrength') return !!s.strengthProgram?.gym?.started;
    return false;
  }

  function focusProgram(key) {
    const allowed = ['walking', 'jogging', 'homeStrength', 'gymStrength'];
    if (!allowed.includes(key)) return;
    const s = state();
    if (programIsStarted(s, key)) {
      window.PWStore.setActiveProgram(key);
    } else {
      focusedProgramKey = key;
    }
  }

  function navigate(page, options = {}) {
    const target = pageTitles[page] ? page : 'home';
    if (options.program) focusProgram(options.program);
    $$('.page').forEach((el) => el.classList.toggle('active', el.dataset.page === target));
    $$('.nav-btn').forEach((el) => el.classList.toggle('active', el.dataset.nav === target));
    $('#pageTitle').textContent = pageTitles[target];
    if (location.hash !== `#${target}`) history.replaceState(null, '', `#${target}`);
    renderAll();
    if (options.scrollTo) scrollToPanel(options.scrollTo);
  }

  function todayStats() {
    const s = state();
    const today = window.PWStore.todayKey();
    const water = s.logs.water[today] || { ml: 0, entries: [] };
    const movement = s.logs.movement[today] || null;
    const weight = s.logs.weights[today] || null;
    return { s, today, water, movement, weight };
  }


  function parseDateKey(dateKey) {
    if (!dateKey) return null;
    const [y, m, d] = String(dateKey).split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  function daysBetween(dateAKey, dateBKey = window.PWStore.todayKey()) {
    const a = parseDateKey(dateAKey);
    const b = parseDateKey(dateBKey);
    if (!a || !b) return null;
    a.setHours(0, 0, 0, 0);
    b.setHours(0, 0, 0, 0);
    return Math.floor((b - a) / 86400000);
  }

  function addDaysToKey(dateKey, amount) {
    const d = parseDateKey(dateKey);
    if (!d) return '';
    d.setDate(d.getDate() + Number(amount || 0));
    return window.PWStore.todayKey(d);
  }

  function dueTextFromLatest(latestDateKey, rhythmDays = 28) {
    if (!latestDateKey) return { due: true, text: 'Due now — start with your first entry.' };
    const elapsed = daysBetween(latestDateKey);
    if (elapsed === null) return { due: true, text: 'Due now.' };
    const remaining = rhythmDays - elapsed;
    if (remaining <= 0) return { due: true, text: `Due now — last done ${elapsed} days ago.` };
    return { due: false, text: `Next due in ${remaining} day${remaining === 1 ? '' : 's'} (${fmtDate(addDaysToKey(latestDateKey, rhythmDays))}).` };
  }

  function currentWeekHasCheckin() {
    const monday = window.PWStore.todayKey(window.PWStore.mondayStart(new Date()));
    return (window.PWStore.sortedCheckins ? window.PWStore.sortedCheckins() : []).some((item) => item.date >= monday);
  }

  function latestPhotoSet(s) {
    return (s.photos?.sets || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || '').localeCompare(a.createdAt || ''))[0] || null;
  }

  function renderNextAction(s, water, movement, weight) {
    const btn = $('#nextActionBtn');
    if (!btn) return;
    const today = new Date();
    const target = s.settings.waterTargetMl || 2000;
    const latestMeasurement = (window.PWStore.sortedMeasurements ? window.PWStore.sortedMeasurements() : []).slice(-1)[0] || null;
    const photoDue = dueTextFromLatest(latestPhotoSet(s)?.date, 28);
    const measureDue = dueTextFromLatest(latestMeasurement?.date, 28);
    let action;

    if (today.getDay() === 1 && !weight) {
      action = { eyebrow: 'Monday routine', title: 'Log your weekly weigh-in', text: 'Do it once this morning, then leave the scale alone for the week.', label: 'Log weight', type: 'nav', page: 'track', scrollTo: 'weightEntryCard' };
    } else if (s.strengthProgram?.home?.activeWorkout) {
      action = { eyebrow: 'Workout in progress', title: 'Resume your Foundation workout', text: 'Your place, weights and completed sets are saved.', label: 'Resume', type: 'nav', page: 'programs', scrollTo: 'homeStrengthProgramCard' };
    } else if (s.strengthProgram?.gym?.activeWorkout) {
      action = { eyebrow: 'Workout in progress', title: 'Resume your gym workout', text: 'Your place, weights and completed sets are saved.', label: 'Resume', type: 'nav', page: 'programs', scrollTo: 'gymStrengthProgramCard' };
    } else if (s.programs?.active === 'homeStrength' && s.strengthProgram?.home?.started) {
      const foundationWeek = strengthWeekNumberForDate(s, 'home');
      const completed = foundationSessionsForCurrentWeek(s, foundationWeek).length;
      const targetSessions = foundationTargetForWeek(foundationWeek);
      if (completed < targetSessions) action = { eyebrow: 'Current program', title: 'Your next Foundation workout is ready', text: `Week ${foundationWeek} of 4 • ${completed}/${targetSessions} sessions completed this week.`, label: 'Open program', type: 'nav', page: 'programs', scrollTo: 'homeStrengthProgramCard' };
    } else if (s.programs?.active === 'gymStrength' && s.strengthProgram?.gym?.started) {
      const gymWeek = strengthWeekNumberForDate(s, 'gym');
      const completed = strengthSessionsForWeek(s, 'gym', gymWeek).length;
      if (completed < 3) action = { eyebrow: 'Current program', title: 'Your next gym workout is ready', text: `Week ${gymWeek} • ${completed}/3 sessions completed this week.`, label: 'Open program', type: 'nav', page: 'programs', scrollTo: 'gymStrengthProgramCard' };
    }
    if (!action && (water.ml || 0) < target) {
      action = { eyebrow: 'Next action', title: 'Add your next water', text: `You’re at ${(water.ml || 0).toLocaleString()} / ${target.toLocaleString()} ml today.`, label: '+250 ml', type: 'water' };
    } else if (!action && !(movement && movement.done)) {
      action = { eyebrow: 'Next action', title: 'Tick off movement', text: 'A walk, home session, gym session, mobility or intentional movement counts.', label: 'Add movement', type: 'nav', page: 'track', scrollTo: 'movementEntryCard' };
    } else if (!action && photoDue.due) {
      action = { eyebrow: 'Progress rhythm', title: 'Progress photos are due', text: 'Take front, side and back photos every 4 weeks so you can compare properly.', label: 'Add photos', type: 'nav', page: 'photos' };
    } else if (!action && measureDue.due) {
      action = { eyebrow: 'Progress rhythm', title: 'Measurements are due', text: 'Update waist and body measurements every 4 weeks to see non-scale progress.', label: 'Add measurements', type: 'nav', page: 'track', scrollTo: 'measurementsCard' };
    } else if (!action && !currentWeekHasCheckin() && today.getDay() >= 5) {
      action = { eyebrow: 'Weekly rhythm', title: 'Complete your weekly check-in', text: 'Save your win, struggle and what you need help with before the week ends.', label: 'Open check-in', type: 'nav', page: 'track', scrollTo: 'weeklyCheckinCard' };
    } else if (!action) {
      action = { eyebrow: 'On track', title: 'You’re in rhythm today', text: 'Water, movement and progress habits are covered. Keep it boring enough to repeat.', label: 'View progress', type: 'nav', page: 'progress' };
    }

    $('#nextActionEyebrow').textContent = action.eyebrow;
    $('#nextActionTitle').textContent = action.title;
    $('#nextActionText').textContent = action.text;
    btn.textContent = action.label;
    btn.dataset.nextAction = action.type;
    btn.dataset.nextPage = action.page || '';
    btn.dataset.nextScrollTo = action.scrollTo || '';
  }

  function renderProgressReminders(s) {
    const latestPhoto = latestPhotoSet(s);
    const latestMeasurement = (window.PWStore.sortedMeasurements ? window.PWStore.sortedMeasurements() : []).slice(-1)[0] || null;
    const photoDue = dueTextFromLatest(latestPhoto?.date, 28);
    const measureDue = dueTextFromLatest(latestMeasurement?.date, 28);

    const photoTitle = $('#photoReminderTitle');
    const photoText = $('#photoReminderText');
    const measureTitle = $('#measurementReminderTitle');
    const measureText = $('#measurementReminderText');
    if (photoTitle && photoText) {
      photoTitle.textContent = photoDue.due ? 'Progress photos due' : 'Progress photos on rhythm';
      photoText.textContent = latestPhoto ? photoDue.text : 'Add your first front, side and back photo set.';
      $('#photoReminderItem')?.classList.toggle('due', photoDue.due);
    }
    if (measureTitle && measureText) {
      measureTitle.textContent = measureDue.due ? 'Measurements due' : 'Measurements on rhythm';
      measureText.textContent = latestMeasurement ? measureDue.text : 'Add your first waist, hips, chest, thigh or arm measurement.';
      $('#measurementReminderItem')?.classList.toggle('due', measureDue.due);
    }
  }

  function renderHome() {
    const { s, water, movement, weight } = todayStats();
    const name = s.client.name ? s.client.name.split(' ')[0] : '';
    $('#homeGreeting').textContent = name ? `Welcome back, ${name}` : 'Welcome back';

    const target = s.settings.waterTargetMl;
    const waterPercent = pct(water.ml, target);
    $('#homeWaterStat').textContent = `${water.ml.toLocaleString()} / ${target.toLocaleString()} ml`;
    $('#homeWaterMeter').style.width = `${waterPercent}%`;

    $('#homeMovementStat').textContent = movement && movement.done ? 'Done' : 'Not done';
    $('#homeMovementDetail').textContent = movement && movement.done
      ? `${movement.type || 'Movement'} • ${movement.duration || 0} min`
      : 'A walk or simple movement counts.';

    const now = new Date();
    const isMonday = now.getDay() === 1;
    if (isMonday && !weight) {
      $('#weighInTitle').textContent = 'Weigh-in due today';
      $('#weighInText').textContent = 'Monday morning is your main scale check. Log it once, then move on with your week.';
    } else if (isMonday && weight) {
      $('#weighInTitle').textContent = 'Weigh-in complete';
      $('#weighInText').textContent = `Saved ${weight.kg} kg for today.`;
    } else {
      $('#weighInTitle').textContent = 'Next weigh-in: Monday';
      $('#weighInText').textContent = 'We track weekly trend instead of daily scale noise.';
    }

    const latestCheckin = (window.PWStore.sortedCheckins ? window.PWStore.sortedCheckins() : []).slice(-1)[0];
    if (latestCheckin) {
      $('#homeCheckinTitle').textContent = `Last check-in: ${fmtDate(latestCheckin.date)}`;
      $('#homeCheckinText').textContent = latestCheckin.help ? `Help needed: ${latestCheckin.help.slice(0, 80)}${latestCheckin.help.length > 80 ? '…' : ''}` : 'Your weekly reflection has been saved.';
    } else {
      $('#homeCheckinTitle').textContent = 'Weekly check-in';
      $('#homeCheckinText').textContent = 'Save your win, struggle and what you need help with.';
    }

    renderWeekStrip();
    renderWalkingHome(s);
    renderNextAction(s, water, movement, weight);
    renderProgressReminders(s);
  }

  function renderWeekStrip() {
    const s = state();
    const keys = window.PWStore.weekKeys();
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const html = keys.map((key, index) => {
      const water = s.logs.water[key]?.ml || 0;
      const movement = s.logs.movement[key]?.done;
      const waterDone = water >= s.settings.waterTargetMl;
      const movementDone = !!movement;
      const done = waterDone || movementDone;
      const icons = `
        <span class="day-icons">
          <span class="day-icon ${waterDone ? 'on' : ''}" title="Water">${icon('water')}</span>
          <span class="day-icon ${movementDone ? 'on' : ''}" title="Movement">${icon('walk')}</span>
        </span>`;
      return `<div class="day-dot ${done ? 'done' : ''}"><strong>${dayLabels[index]}</strong>${icons}</div>`;
    }).join('');
    $('#homeWeekStrip').innerHTML = html;
  }

  function renderTrack() {
    const { s, water, movement } = todayStats();
    const target = s.settings.waterTargetMl;
    const waterPercent = pct(water.ml, target);
    $('#trackWaterTitle').textContent = `${water.ml.toLocaleString()} ml`;
    $('#trackWaterSub').textContent = `Daily target: ${target.toLocaleString()} ml`;
    $('#trackWaterMeter').style.width = `${waterPercent}%`;
    $('#waterRing').textContent = `${waterPercent}%`;
    $('#waterRing').style.setProperty('--pct', `${waterPercent * 3.6}deg`);
    const waterStatus = $('#waterSavedStatus');
    if (waterStatus) {
      waterStatus.textContent = water.ml > 0 ? `Saved today: ${water.ml.toLocaleString()} ml on this device.` : 'Water saves automatically on this device.';
      waterStatus.className = water.ml > 0 ? 'save-status ok' : 'save-status';
    }

    $('#movementSavedStatus').textContent = movement && movement.done
      ? `Saved today: ${movement.type || 'Movement'} • ${movement.duration || 0} min${movement.notes ? ' • ' + movement.notes : ''}`
      : 'No movement saved for today yet.';
    $('#movementSavedStatus').classList.toggle('done', !!(movement && movement.done));

    if (movement) {
      selectedDuration = movement.duration || selectedDuration;
      $('#movementType').value = movement.type || 'Walk';
      $('#movementNotes').value = movement.notes || '';
    }
    $$('#movementOptions button').forEach((btn) => {
      btn.classList.toggle('active', Number(btn.dataset.duration) === Number(selectedDuration));
    });

    $('#weightDate').value = window.PWStore.todayKey();
    if ($('#measurementDate')) $('#measurementDate').value = window.PWStore.todayKey();
    if ($('#checkinDate')) $('#checkinDate').value = window.PWStore.todayKey();
  }


  function activeProgramKey(s) {
    const active = s.programs?.active;
    const started = {
      walking: !!s.walkingProgram?.started,
      jogging: !!s.joggingProgram?.started,
      homeStrength: !!s.strengthProgram?.home?.started,
      gymStrength: !!s.strengthProgram?.gym?.started
    };
    if (started[active]) return active;
    return Object.keys(started).find((key) => started[key]) || null;
  }

  function renderProgramOverview(s) {
    const active = activeProgramKey(s);
    focusedProgramKey = null;
    const keys = ['walking', 'jogging', 'homeStrength', 'gymStrength'];
    const cardIds = {
      walking: 'walkingProgramCard',
      jogging: 'joggingProgramCard',
      homeStrength: 'homeStrengthProgramCard',
      gymStrength: 'gymStrengthProgramCard'
    };
    const cards = {};

    keys.forEach((key) => {
      const card = $(`#${cardIds[key]}`);
      if (!card) return;
      cards[key] = card;
      card.classList.toggle('is-active-program', active === key);
      card.classList.toggle('is-compact-program', active !== key);
      card.dataset.programLabel = active === key ? 'Current program' : '';
    });

    // Keep the current program first and fully open. All others stay as slim rows.
    const programsPage = $('#page-programs');
    const headerCard = programsPage?.querySelector('.programs-header-card');
    const listLabel = $('#programsListLabel');
    if (programsPage && headerCard && listLabel) {
      if (active && cards[active]) {
        headerCard.insertAdjacentElement('afterend', cards[active]);
        cards[active].insertAdjacentElement('afterend', listLabel);
        listLabel.textContent = 'Other programs';
        keys.filter((key) => key !== active).forEach((key) => cards[key] && programsPage.appendChild(cards[key]));
      } else {
        headerCard.insertAdjacentElement('afterend', listLabel);
        listLabel.textContent = 'Choose a program';
        keys.forEach((key) => cards[key] && programsPage.appendChild(cards[key]));
      }
    }

    const banner = $('#currentProgramBanner');
    if (banner) {
      if (active === 'walking') {
        const week = walkingWeekNumberForDate(s);
        const walks = walksForWeek(s, week);
        const targetWalks = Number(s.walkingProgram?.targetWalksPerWeek || 4);
        banner.innerHTML = `${icon('walk')}<div><strong>Current program: 8-week walking</strong><small>Week ${week} of 8 • ${walks.length}/${targetWalks} walks logged this week</small></div>`;
        banner.classList.add('is-active');
      } else if (active === 'jogging') {
        const week = joggingWeekNumberForDate(s);
        const plan = joggingWeekPlan(week);
        const runs = runsForWeek(s, week);
        const targetSessions = plan.sessions.filter((item) => !item.optional).length;
        banner.innerHTML = `${icon('run')}<div><strong>Current program: 5 km jogging</strong><small>Week ${week} of 8 • ${runs.length}/${targetSessions} sessions logged this week</small></div>`;
        banner.classList.add('is-active');
      } else if (active === 'homeStrength') {
        const week = strengthWeekNumberForDate(s, 'home');
        const sessions = strengthSessionsForWeek(s, 'home', week);
        const target = foundationTargetForWeek(week);
        banner.innerHTML = `${icon('strength')}<div><strong>Current program: Foundation Home</strong><small>Week ${week} of 4 • ${sessions.length}/${target} sessions completed this week</small></div>`;
        banner.classList.add('is-active');
      } else if (active === 'gymStrength') {
        const week = strengthWeekNumberForDate(s, 'gym');
        const sessions = strengthSessionsForWeek(s, 'gym', week);
        banner.innerHTML = `${icon('workout')}<div><strong>Current program: Gym beginner strength</strong><small>Week ${week} • ${sessions.length}/3 sessions completed this week</small></div>`;
        banner.classList.add('is-active');
      } else {
        banner.innerHTML = `${icon('program')}<div><strong>No current program</strong><small>Choose one below to start. Only your current program opens fully.</small></div>`;
        banner.classList.remove('is-active');
      }
    }

    const started = {
      walking: !!s.walkingProgram?.started,
      jogging: !!s.joggingProgram?.started,
      homeStrength: !!s.strengthProgram?.home?.started,
      gymStrength: !!s.strengthProgram?.gym?.started
    };
    const buttonMap = {
      walking: $('#openWalkingProgramBtn'),
      jogging: $('#openJoggingProgramBtn'),
      homeStrength: $('#openHomeStrengthProgramBtn'),
      gymStrength: $('#openGymStrengthProgramBtn')
    };
    keys.forEach((key) => {
      if (buttonMap[key]) buttonMap[key].textContent = started[key] ? 'Switch' : 'Start';
    });

    const walkingCompact = $('#walkingCompactPanel small');
    if (walkingCompact) walkingCompact.textContent = started.walking ? `Week ${walkingWeekNumberForDate(s)} • progress saved` : '8 weeks • 4–5 walks/week';
    const joggingCompact = $('#joggingCompactPanel small');
    if (joggingCompact) joggingCompact.textContent = started.jogging ? `Week ${joggingWeekNumberForDate(s)} • progress saved` : '8 weeks • 3 runs/week';
    const homeCompact = $('#homeStrengthCompactPanel small');
    if (homeCompact) homeCompact.textContent = started.homeStrength ? `Week ${strengthWeekNumberForDate(s, 'home')} • progress saved` : '4 weeks • guided timers';
    const gymCompact = $('#gymStrengthCompactPanel small');
    if (gymCompact) gymCompact.textContent = started.gymStrength ? `Week ${strengthWeekNumberForDate(s, 'gym')} • progress saved` : '3 machine sessions/week';
  }

  function renderPrograms() {
    const s = state();
    renderProgramOverview(s);
    renderWalkingTrack(s);
    renderJoggingTrack(s);
    renderStrengthTrack(s, 'home');
    renderStrengthTrack(s, 'gym');
  }

  function revealProgramCard(key) {
    const cardIds = {
      walking: 'walkingProgramCard',
      jogging: 'joggingProgramCard',
      homeStrength: 'homeStrengthProgramCard',
      gymStrength: 'gymStrengthProgramCard'
    };
    const card = document.getElementById(cardIds[key] || '');
    if (!card) return;
    window.setTimeout(() => {
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      card.classList.remove('attention-target');
      void card.offsetWidth;
      card.classList.add('attention-target');
    }, 80);
  }

  function renderAndRevealProgram(key) {
    Promise.resolve(renderAll()).then(() => revealProgramCard(key));
  }

  function renderProgress() {
    const s = state();
    const weights = window.PWStore.sortedWeights();
    const first = weights[0];
    const latest = weights[weights.length - 1];
    $('#startWeight').textContent = first ? `${first.kg.toFixed(1)} kg` : '—';
    $('#latestWeight').textContent = latest ? `${latest.kg.toFixed(1)} kg` : '—';
    $('#weighInCount').textContent = String(weights.length);
    if (first && latest) {
      const change = latest.kg - first.kg;
      $('#totalChange').textContent = `${change > 0 ? '+' : ''}${change.toFixed(1)} kg`;
    } else {
      $('#totalChange').textContent = '—';
    }
    drawWeightChart(weights);
    renderProgressSummary(s);
    renderMeasurementProgress(s);
    renderMonthlyReport(s);
    renderWalkingProgress(s);
    renderJoggingProgress(s);
    renderStrengthProgress(s);
    renderMovementGraph(s);
    renderPhotoCompare();
  }

  function drawWeightChart(weights) {
    const canvas = $('#weightChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.045)';
    ctx.fillRect(0, 0, w, h);

    $('#chartEmpty').style.display = weights.length < 2 ? 'block' : 'none';
    if (weights.length < 2) return;

    const values = weights.map((item) => item.kg);
    const min = Math.min(...values) - 1;
    const max = Math.max(...values) + 1;
    const pad = 36;
    const xFor = (i) => pad + (i / (weights.length - 1)) * (w - pad * 2);
    const yFor = (kg) => h - pad - ((kg - min) / (max - min)) * (h - pad * 2);

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const y = pad + i * ((h - pad * 2) / 3);
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(w - pad, y);
      ctx.stroke();
    }

    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0, '#e80075');
    gradient.addColorStop(1, '#d9a72e');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    weights.forEach((item, i) => {
      const x = xFor(i);
      const y = yFor(item.kg);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    weights.forEach((item, i) => {
      const x = xFor(i);
      const y = yFor(item.kg);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b8bbd0';
      ctx.font = '18px system-ui';
      ctx.fillText(String(item.kg.toFixed(1)), Math.min(x + 8, w - 78), y - 8);
    });
  }

  function renderProgressSummary(s) {
    const keys = window.PWStore.weekKeys();
    const waterDays = keys.filter((key) => (s.logs.water[key]?.ml || 0) >= s.settings.waterTargetMl).length;
    const movementDays = keys.filter((key) => s.logs.movement[key]?.done).length;
    const waterTotal = keys.reduce((sum, key) => sum + (s.logs.water[key]?.ml || 0), 0);
    const waterAvg = Math.round(waterTotal / 7);
    $('#progressSummary').innerHTML = `
      <div class="summary-row"><span>Water target days</span><strong>${waterDays}/7</strong></div>
      <div class="summary-row"><span>Average water</span><strong>${waterAvg.toLocaleString()} ml</strong></div>
      <div class="summary-row"><span>Movement days</span><strong>${movementDays}/7</strong></div>
      <div class="summary-row"><span>Weigh-in rhythm</span><strong>Monday</strong></div>
    `;
  }


  function cmText(value) {
    return typeof value === 'number' && !Number.isNaN(value) ? `${value.toFixed(1)} cm` : '—';
  }

  function measurementDelta(first, latest, key) {
    if (!first || !latest || typeof first[key] !== 'number' || typeof latest[key] !== 'number') return '—';
    const change = latest[key] - first[key];
    return `${change > 0 ? '+' : ''}${change.toFixed(1)} cm`;
  }

  function renderMeasurementProgress(s) {
    const measurements = window.PWStore.sortedMeasurements ? window.PWStore.sortedMeasurements() : [];
    const stats = $('#measurementStats');
    const history = $('#measurementHistory');
    if (!stats || !history) return;

    if (!measurements.length) {
      stats.innerHTML = `
        <article class="mini-stat wide"><span>No measurements yet</span><strong>Save your first set in Track.</strong></article>
      `;
      history.innerHTML = '';
      return;
    }

    const first = measurements[0];
    const latest = measurements[measurements.length - 1];
    stats.innerHTML = `
      <article class="mini-stat"><span>Latest waist</span><strong>${cmText(latest.waist)}</strong></article>
      <article class="mini-stat"><span>Waist change</span><strong>${measurementDelta(first, latest, 'waist')}</strong></article>
      <article class="mini-stat"><span>Latest hips</span><strong>${cmText(latest.hips)}</strong></article>
      <article class="mini-stat"><span>Saved sets</span><strong>${measurements.length}</strong></article>
    `;

    history.innerHTML = measurements.slice(-5).reverse().map((item) => `
      <div class="summary-row">
        <span><strong>${fmtDate(item.date)}</strong><br><small>Waist ${cmText(item.waist)} • Hips ${cmText(item.hips)} • Chest ${cmText(item.chest)}</small></span>
        <strong>${item.notes ? escapeHtml(item.notes).slice(0, 28) : 'Saved'}</strong>
      </div>
    `).join('');
  }

  function dateDaysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return window.PWStore.todayKey(d);
  }

  function renderMonthlyReport(s) {
    const grid = $('#monthlyReportGrid');
    const latestBox = $('#latestCheckinBox');
    if (!grid || !latestBox) return;
    const since = dateDaysAgo(30);
    const weights = window.PWStore.sortedWeights().filter((item) => item.date >= since);
    const measurements = window.PWStore.sortedMeasurements ? window.PWStore.sortedMeasurements().filter((item) => item.date >= since) : [];
    const checkins = window.PWStore.sortedCheckins ? window.PWStore.sortedCheckins() : [];
    const allKeys = Array.from({ length: 30 }, (_, i) => dateDaysAgo(29 - i));
    const waterDays = allKeys.filter((key) => (s.logs.water[key]?.ml || 0) >= s.settings.waterTargetMl).length;
    const movementDays = allKeys.filter((key) => s.logs.movement[key]?.done).length;
    const walks = (s.logs.walks || []).filter((item) => item.date >= since).length;
    const photoSets = (s.photos.sets || []).filter((item) => item.date >= since).length;

    const weightChange = weights.length >= 2 ? `${weights[weights.length - 1].kg - weights[0].kg > 0 ? '+' : ''}${(weights[weights.length - 1].kg - weights[0].kg).toFixed(1)} kg` : '—';
    const waistChange = measurements.length >= 2 ? measurementDelta(measurements[0], measurements[measurements.length - 1], 'waist') : '—';

    grid.innerHTML = `
      <article class="mini-stat"><span>Weight change</span><strong>${weightChange}</strong></article>
      <article class="mini-stat"><span>Waist change</span><strong>${waistChange}</strong></article>
      <article class="mini-stat"><span>Water days</span><strong>${waterDays}/30</strong></article>
      <article class="mini-stat"><span>Movement days</span><strong>${movementDays}/30</strong></article>
      <article class="mini-stat"><span>Walks logged</span><strong>${walks}</strong></article>
      <article class="mini-stat"><span>Photo sets</span><strong>${photoSets}</strong></article>
    `;

    const latest = checkins[checkins.length - 1];
    latestBox.innerHTML = latest ? `
      <p class="eyebrow pink">Latest check-in</p>
      <h3>${fmtDate(latest.date)}</h3>
      <div class="summary-list compact">
        <div class="summary-row"><span>Meals</span><strong>${escapeHtml(latest.meals || '—')}</strong></div>
        <div class="summary-row"><span>Water</span><strong>${escapeHtml(latest.water || '—')}</strong></div>
        <div class="summary-row"><span>Movement</span><strong>${escapeHtml(latest.movement || '—')}</strong></div>
        <div class="summary-row"><span>Energy / Stress</span><strong>${escapeHtml(latest.energy || '—')} / ${escapeHtml(latest.stress || '—')}</strong></div>
      </div>
      ${latest.win ? `<p class="small"><strong>Win:</strong> ${escapeHtml(latest.win)}</p>` : ''}
      ${latest.struggle ? `<p class="small"><strong>Struggle:</strong> ${escapeHtml(latest.struggle)}</p>` : ''}
      ${latest.help ? `<p class="small"><strong>Help needed:</strong> ${escapeHtml(latest.help)}</p>` : ''}
    ` : '<p class="muted">No weekly check-in saved yet. Add one from Track.</p>';
  }

  function dateKeyFromDate(date) {
    return window.PWStore.todayKey(date);
  }

  function addDays(date, amount) {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
  }

  function movementWeekKeys(weekOffset = 0) {
    const start = window.PWStore.mondayStart(new Date());
    start.setDate(start.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, index) => dateKeyFromDate(addDays(start, index)));
  }

  function cleanMovementType(type) {
    const raw = (type || 'Walk').trim();
    if (raw === 'Other') return 'General movement';
    return raw;
  }

  function movementTotalsForKeys(s, keys) {
    return keys.reduce((totals, key) => {
      const entry = s.logs.movement?.[key];
      if (!entry || !entry.done) return totals;
      const type = cleanMovementType(entry.type);
      totals[type] = (totals[type] || 0) + Number(entry.duration || 0);
      return totals;
    }, {});
  }

  function renderMovementGraph(s) {
    const canvas = $('#movementChart');
    const empty = $('#movementChartEmpty');
    const list = $('#movementDeltaList');
    const summary = $('#movementChartSummary');
    if (!canvas || !empty || !list || !summary) return;

    const currentTotals = movementTotalsForKeys(s, movementWeekKeys(0));
    const previousTotals = movementTotalsForKeys(s, movementWeekKeys(-1));
    const preferredTypes = ['Walk', 'Home workout', 'Gym session', 'Mobility', 'General movement'];
    const allTypes = Array.from(new Set([...preferredTypes, ...Object.keys(currentTotals), ...Object.keys(previousTotals)]));
    const rows = allTypes
      .map((type) => ({
        type,
        current: currentTotals[type] || 0,
        previous: previousTotals[type] || 0
      }))
      .filter((row) => row.current > 0 || row.previous > 0);

    const currentTotal = rows.reduce((sum, row) => sum + row.current, 0);
    const previousTotal = rows.reduce((sum, row) => sum + row.previous, 0);
    const totalDelta = currentTotal - previousTotal;
    const deltaText = totalDelta === 0 ? 'same as last week' : `${totalDelta > 0 ? '+' : ''}${totalDelta} min vs last week`;
    summary.textContent = rows.length ? `This week: ${currentTotal} min • ${deltaText}` : 'Save movement this week to see your trend.';
    empty.style.display = rows.length ? 'none' : 'block';

    drawMovementBarChart(rows);
    renderMovementDeltaList(rows, list);
  }

  function renderMovementDeltaList(rows, container) {
    if (!rows.length) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = rows.map((row) => {
      const delta = row.current - row.previous;
      const cls = delta > 0 ? 'up' : delta < 0 ? 'down' : 'same';
      const label = delta > 0 ? `+${delta} min` : delta < 0 ? `${delta} min` : 'same';
      return `
        <div class="summary-row movement-row">
          <span><strong>${escapeHtml(row.type)}</strong><br><small>${row.current} min this week • ${row.previous} min last week</small></span>
          <strong class="delta-pill ${cls}">${label}</strong>
        </div>
      `;
    }).join('');
  }

  function drawMovementBarChart(rows) {
    const canvas = $('#movementChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.045)';
    ctx.fillRect(0, 0, w, h);

    if (!rows.length) return;

    const max = Math.max(30, ...rows.map((row) => Math.max(row.current, row.previous)));
    const left = 150;
    const right = 34;
    const top = 34;
    const bottom = 34;
    const plotW = w - left - right;
    const rowH = (h - top - bottom) / rows.length;
    const barH = Math.min(24, Math.max(15, rowH * 0.38));

    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#b8bbd0';
    ctx.font = '13px system-ui';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 3; i += 1) {
      const x = left + (plotW * i) / 3;
      ctx.beginPath();
      ctx.moveTo(x, top - 8);
      ctx.lineTo(x, h - bottom + 6);
      ctx.stroke();
      ctx.fillText(`${Math.round((max * i) / 3)}m`, x, h - 10);
    }

    rows.forEach((row, index) => {
      const y = top + index * rowH + rowH / 2;
      const currentW = (row.current / max) * plotW;
      const prevX = left + (row.previous / max) * plotW;
      const delta = row.current - row.previous;
      const deltaLabel = delta === 0 ? 'same' : `${delta > 0 ? '+' : ''}${delta}m`;

      ctx.textAlign = 'left';
      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 14px system-ui';
      ctx.fillText(row.type, 14, y + 5);

      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      roundRect(ctx, left, y - barH / 2, plotW, barH, 9);
      ctx.fill();

      if (currentW > 0) {
        const gradient = ctx.createLinearGradient(left, 0, left + plotW, 0);
        gradient.addColorStop(0, '#e80075');
        gradient.addColorStop(1, '#d9a72e');
        ctx.fillStyle = gradient;
        roundRect(ctx, left, y - barH / 2, Math.max(currentW, 8), barH, 9);
        ctx.fill();
      }

      if (row.previous > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.78)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(prevX, y - barH * 0.85);
        ctx.lineTo(prevX, y + barH * 0.85);
        ctx.stroke();
      }

      ctx.fillStyle = delta > 0 ? '#6ee7b7' : delta < 0 ? '#fca5a5' : '#fde68a';
      ctx.font = '800 13px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(`${row.current}m • ${deltaLabel}`, w - 14, y + 5);
    });
  }

  function roundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }




  function strengthState(s, type) {
    const clean = type === 'gym' ? 'gym' : 'home';
    return s.strengthProgram?.[clean] || { started: false, startDate: null };
  }

  function strengthWeekNumberForDate(s, type = 'home', dateKey = window.PWStore.todayKey()) {
    const clean = type === 'gym' ? 'gym' : 'home';
    const program = strengthState(s, clean);
    if (!program.started || !program.startDate) return 1;
    const start = new Date(`${program.startDate}T00:00:00`);
    const date = new Date(`${dateKey}T00:00:00`);
    const diffDays = Math.floor((date - start) / 86400000);
    const maxWeek = clean === 'home' ? 4 : 12;
    return Math.min(maxWeek, Math.max(1, Math.floor(diffDays / 7) + 1));
  }

  function strengthSessionsForWeek(s, type = 'home', week = strengthWeekNumberForDate(s, type)) {
    const clean = type === 'gym' ? 'gym' : 'home';
    return (s.logs.strengthSessions || []).filter((item) => item.programType === clean && Number(item.week) === Number(week));
  }

  function currentStrengthExercise(s, type, key) {
    const clean = type === 'gym' ? 'gym' : 'home';
    const def = STRENGTH_MOVEMENTS[key];
    const progress = s.strengthProgram?.progress?.[key] || {};
    const load = strengthLoadSuggestion(s, clean, key);
    if (clean === 'gym') {
      return {
        key,
        movement: def.title,
        name: def.gymChain[0],
        image: def.gymImages[0],
        target: '3 sets • 8–12 reps',
        targetMin: 8,
        targetMax: 12,
        detail: load.workingWeight > 0 ? `${load.workingWeight} kg suggested working weight` : 'Choose a light starting weight',
        recommendation: load.recommendation,
        workingWeightKg: load.workingWeight,
        incrementKg: load.increment,
        previousWeightKg: load.previousWeight,
        previousReps: load.previousReps,
        tips: def.tips[def.gymChain[0]] || []
      };
    }
    const level = Math.max(1, Number(progress.homeLevel || 1));
    const index = Math.max(0, Math.min(def.homeChain.length - 1, level - 1));
    const name = def.homeChain[index];
    return {
      key,
      movement: def.title,
      name,
      image: def.homeImages[index],
      target: '3 sets • 8–12 reps',
      targetMin: 8,
      targetMax: 12,
      detail: load.workingWeight > 0
        ? `${load.workingWeight} kg suggested working weight`
        : (index < def.homeChain.length - 1 ? `Bodyweight step ${index + 1} of ${def.homeChain.length}` : 'Final bodyweight step'),
      recommendation: load.recommendation,
      workingWeightKg: load.workingWeight,
      incrementKg: load.increment,
      previousWeightKg: load.previousWeight,
      previousReps: load.previousReps,
      tips: def.tips[name] || []
    };
  }

  function buildStrengthSessionExercises(s, type) {
    return STRENGTH_ORDER.map((key) => currentStrengthExercise(s, type, key));
  }

  function strengthExerciseCardsHtml(s, type) {
    return buildStrengthSessionExercises(s, type).map((ex) => `
      <article class="strength-exercise-card">
        <div class="strength-exercise-image">${ex.image ? `<img src="${ex.image}" alt="${escapeHtml(ex.name)}" loading="lazy" decoding="async" />` : icon('strength')}</div>
        <div class="strength-exercise-body">
          <p class="eyebrow ${type === 'gym' ? 'pink' : 'gold'}">${escapeHtml(ex.movement)}</p>
          <h3>${escapeHtml(ex.name)}</h3>
          <div class="strength-meta-row"><span>${escapeHtml(ex.target)}</span><span>${escapeHtml(ex.detail)}</span></div>
          <p class="small progression-note">${escapeHtml(ex.recommendation || '')}</p>
          <ul>${ex.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join('')}</ul>
        </div>
      </article>
    `).join('');
  }

  function foundationTargetForWeek(week) {
    return Number(foundationWeekData(week).targetSessions || 3);
  }

  function foundationSessionsForCurrentWeek(s, week) {
    return (s.logs.strengthSessions || []).filter((item) => item.programType === 'home' && Number(item.week) === Number(week));
  }

  function foundationWorkoutChoicesHtml(s, week) {
    const info = foundationWeekData(week);
    const sessions = foundationSessionsForCurrentWeek(s, week);
    if (week <= 2) {
      const done = sessions.length;
      return `
        <article class="foundation-workout-choice ${done >= info.targetSessions ? 'done' : ''}">
          <div class="foundation-workout-choice-main">
            <span class="foundation-workout-number">${done}/${info.targetSessions}</span>
            <div>
              <p class="eyebrow pink">Guided workout</p>
              <h3>Foundation Session</h3>
              <p class="small muted">5-minute warm-up, six strength movements, mobility and an optional gentle walk.</p>
              <div class="strength-meta-row"><span>±34 minutes</span><span>Warm-up + heavier sets + logged weights</span></div>
            </div>
          </div>
          <button class="primary full" type="button" data-start-foundation-workout="foundation-session">${done ? 'Start another session' : 'Start workout'}</button>
        </article>
      `;
    }
    return info.workouts.map((workout, index) => {
      const completed = sessions.some((item) => item.workoutId === workout.id);
      return `
        <article class="foundation-workout-choice ${completed ? 'done' : ''}">
          <div class="foundation-workout-choice-main">
            <span class="foundation-workout-number">${completed ? '✓' : index + 1}</span>
            <div>
              <p class="eyebrow ${completed ? 'gold' : 'pink'}">${completed ? 'Completed this week' : 'Workout ' + (index + 1)}</p>
              <h3>${escapeHtml(workout.title)}</h3>
              <p class="small muted">${escapeHtml(workout.subtitle)}</p>
              <div class="strength-meta-row"><span>${workout.estimatedMinutes} minutes</span><span>${workout.mode === 'circuit' ? 'Repeating circuit' : workout.mode === 'pyramid' ? '10-round pyramid' : 'Guided sets'}</span></div>
            </div>
          </div>
          <button class="${completed ? 'secondary' : 'primary'} full" type="button" data-start-foundation-workout="${escapeHtml(workout.id)}">${completed ? 'Repeat workout' : 'Start workout'}</button>
        </article>
      `;
    }).join('');
  }

  function renderFoundationHomeTrack(s) {
    const program = strengthState(s, 'home');
    const started = !!program.started;
    const startPanel = $('#homeStrengthStartPanel');
    const activePanel = $('#homeStrengthActivePanel');
    if (!startPanel || !activePanel) return;
    startPanel.hidden = started;
    activePanel.hidden = !started;
    const week = strengthWeekNumberForDate(s, 'home');
    const info = foundationWeekData(week);
    const sessions = foundationSessionsForCurrentWeek(s, week);
    const all = (s.logs.strengthSessions || []).filter((item) => item.programType === 'home');
    const pill = $('#homeStrengthWeekPill');
    if (pill) pill.textContent = started ? `Week ${week} of 4` : 'Not started';
    if ($('#homeStrengthCurrentWeek')) $('#homeStrengthCurrentWeek').textContent = `Week ${week} of 4`;
    if ($('#homeStrengthThisWeekCount')) $('#homeStrengthThisWeekCount').textContent = `${sessions.length}/${info.targetSessions}`;
    if ($('#homeStrengthTotalSessions')) $('#homeStrengthTotalSessions').textContent = String(all.length);
    if ($('#foundationWeekNote')) $('#foundationWeekNote').innerHTML = `<p class="eyebrow gold">${escapeHtml(info.title)}</p><h3>${escapeHtml(info.note)}</h3>`;
    if ($('#foundationWorkoutChoices')) $('#foundationWorkoutChoices').innerHTML = foundationWorkoutChoicesHtml(s, week);

    const activeWorkout = program.activeWorkout;
    const resume = $('#foundationResumeBanner');
    if (resume) {
      resume.hidden = !activeWorkout;
      if (activeWorkout) {
        const def = foundationWorkoutDefinition(activeWorkout.week || week, activeWorkout.workoutId);
        if ($('#foundationResumeTitle')) $('#foundationResumeTitle').textContent = def.title || activeWorkout.workoutTitle || 'Resume workout';
        if ($('#foundationResumeText')) {
          const step = activeWorkout.steps?.[activeWorkout.stepIndex || 0];
          const setText = step?.type === 'strength-exercise' ? ` • Set ${activeWorkout.currentSet || 1} of ${step.totalSets || 3}` : '';
          $('#foundationResumeText').textContent = `${step?.name || `Step ${Number(activeWorkout.stepIndex || 0) + 1}`}${setText} • ${formatWorkoutTime(activeWorkout.elapsedSeconds || 0)} logged so far`;
        }
      }
    }

    const recent = all.slice().sort((a, b) => b.date.localeCompare(a.date) || (b.ts || '').localeCompare(a.ts || '')).slice(0, 5);
    const sessionList = $('#homeStrengthSessionList');
    if (sessionList) {
      sessionList.innerHTML = recent.length ? recent.map((item) => `
        <div class="summary-row">
          <span><strong>${fmtDate(item.date)}</strong><br><small>${escapeHtml(item.workoutTitle || 'Foundation Home workout')}${item.durationSeconds ? ` • ${formatWorkoutTime(item.durationSeconds)}` : ''}${item.notes ? ' • ' + escapeHtml(item.notes) : ''}</small></span>
          <strong>Week ${item.week || 1}</strong>
        </div>
      `).join('') : '<p class="small muted">No Foundation Home sessions logged yet.</p>';
    }
  }

  function formatWorkoutTime(totalSeconds) {
    const seconds = Math.max(0, Math.round(Number(totalSeconds || 0)));
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function currentFoundationStep() {
    if (!foundationWorkoutRuntime?.steps?.length) return null;
    return foundationWorkoutRuntime.steps[Math.max(0, Math.min(foundationWorkoutRuntime.steps.length - 1, foundationWorkoutRuntime.stepIndex || 0))];
  }

  function workoutDefinitionForRuntime(runtime = foundationWorkoutRuntime) {
    if (runtime?.programType === 'gym') {
      return { title: 'Gym Beginner Strength', subtitle: 'Machine-based progressive strength session' };
    }
    return foundationWorkoutDefinition(runtime?.week || 1, runtime?.workoutId || 'foundation-session');
  }

  function foundationProgressPercent(runtime = foundationWorkoutRuntime) {
    if (!runtime) return 0;
    if (runtime.overallSeconds > 0) return Math.min(100, Math.round((runtime.elapsedSeconds / runtime.overallSeconds) * 100));
    const total = Math.max(1, runtime.steps.length);
    let partial = 0;
    const step = runtime.steps[runtime.stepIndex || 0];
    if (step?.type === 'strength-exercise') {
      const logged = Array.isArray(step.setLogs) ? step.setLogs.length : 0;
      partial = Math.min(1, logged / Math.max(1, Number(step.totalSets || 3)));
    }
    return Math.min(100, Math.round(((Number(runtime.completedStepCount || 0) + partial) / total) * 100));
  }

  function prepareRuntimeForCurrentStep(runtime = foundationWorkoutRuntime, preserve = false) {
    if (!runtime) return;
    const step = runtime.steps?.[runtime.stepIndex || 0];
    if (!step) return;
    if (step.type === 'strength-exercise') {
      if (!Array.isArray(step.setLogs)) step.setLogs = [];
      const total = Math.max(1, Number(step.totalSets || step.setPlan?.length || 3));
      const nextSet = Math.min(total, Math.max(1, Number(runtime.currentSet || step.setLogs.length + 1)));
      runtime.currentSet = nextSet;
      if (!preserve || !['ready', 'active', 'log', 'rest', 'complete'].includes(runtime.setStage)) runtime.setStage = step.setLogs.length >= total ? 'complete' : 'ready';
      if (runtime.setStage === 'active') runtime.setStage = 'ready';
      const plan = step.setPlan?.[nextSet - 1] || {};
      if (!preserve || runtime.currentWeightKg === undefined || runtime.currentWeightKg === null) runtime.currentWeightKg = Number(plan.suggestedWeightKg || 0);
      runtime.setElapsedSeconds = Math.max(0, Number(runtime.setElapsedSeconds || 0));
      runtime.selectedReps = runtime.selectedReps || null;
      runtime.stepRemaining = runtime.setStage === 'rest' ? Math.max(0, Number(runtime.stepRemaining || step.restSeconds || 75)) : 0;
    } else {
      runtime.currentSet = 1;
      runtime.setStage = '';
      runtime.setElapsedSeconds = 0;
      runtime.selectedReps = null;
      if (!preserve || runtime.stepRemaining === undefined || runtime.stepRemaining === null) runtime.stepRemaining = Number(step.seconds || 0);
    }
  }

  function normaliseFoundationRuntime(runtime) {
    if (!runtime) return null;
    const isGym = runtime.programType === 'gym';
    const fresh = isGym ? buildGymWorkoutRuntime() : buildFoundationWorkoutRuntime(runtime.week || 1, runtime.workoutId || 'foundation-session');
    const merged = { ...fresh, ...runtime };
    merged.programType = isGym ? 'gym' : 'home';
    merged.steps = Array.isArray(runtime.steps) && runtime.steps.length ? runtime.steps : fresh.steps;
    merged.stepIndex = Math.max(0, Math.min(merged.steps.length - 1, Number(merged.stepIndex || 0)));
    merged.running = false;
    prepareRuntimeForCurrentStep(merged, true);
    return merged;
  }

  function persistFoundationWorkout(force = false) {
    if (!foundationWorkoutRuntime) return;
    const elapsed = Math.floor(foundationWorkoutRuntime.elapsedSeconds || 0);
    if (!force && elapsed === foundationLastPersistSecond) return;
    if (!force && elapsed % 10 !== 0) return;
    foundationLastPersistSecond = elapsed;
    const type = foundationWorkoutRuntime.programType === 'gym' ? 'gym' : 'home';
    window.PWStore.saveStrengthWorkoutProgress(type, { ...foundationWorkoutRuntime, running: false });
  }

  function strengthCurrentPlan(step, runtime = foundationWorkoutRuntime) {
    const setNumber = Math.max(1, Number(runtime?.currentSet || 1));
    return step?.setPlan?.[setNumber - 1] || {
      setNumber,
      setType: setNumber === 1 ? 'warmup' : setNumber === Number(step?.totalSets || 3) ? 'working' : 'build-up',
      label: setNumber === 1 ? 'Warm-up set' : setNumber === Number(step?.totalSets || 3) ? 'Working set' : 'Build-up set',
      purpose: setNumber === 1 ? 'Easy preparation set' : setNumber === Number(step?.totalSets || 3) ? 'Main progressive-overload set' : 'Slightly heavier than set 1',
      suggestedWeightKg: 0,
      targetMin: Number(step?.targetMin || 8),
      targetMax: Number(step?.targetMax || 12)
    };
  }

  function strengthSessionRecommendation(step) {
    const logs = Array.isArray(step?.setLogs) ? step.setLogs : [];
    const working = logs.filter((set) => set.setType === 'working').slice(-1)[0] || logs.slice(-1)[0];
    if (!working) return 'Complete the working set to create a next-session recommendation.';
    const reps = Number(working.reps || 0);
    const weight = Number(working.weightKg || 0);
    const top = Number(step.targetMax || 12);
    const min = Number(step.targetMin || 8);
    const inc = Number(step.incrementKg || 1);
    if (reps >= top && weight > 0) return `Next session: increase to ${Math.round((weight + inc) * 10) / 10} kg.`;
    if (reps < min && weight > 0) return `Next session: keep ${weight} kg and rebuild to ${min}–${top} reps.`;
    if (weight > 0) return `Next session: keep ${weight} kg until you reach ${top} controlled reps.`;
    if (reps >= top) return 'Repeat this once more at the top of the rep range, then use the next bodyweight variation.';
    return `Keep this variation until you reach ${top} controlled reps.`;
  }

  function renderStrengthSetStep(step) {
    const runtime = foundationWorkoutRuntime;
    if (!runtime || !step) return;
    const totalSets = Math.max(1, Number(step.totalSets || 3));
    const plan = strengthCurrentPlan(step, runtime);
    const stage = runtime.setStage || 'ready';
    const setNo = Math.max(1, Number(runtime.currentSet || 1));

    $('#strengthSetLabel').textContent = `Set ${setNo} of ${totalSets} • ${plan.label}`;
    $('#strengthSetPurpose').textContent = plan.purpose || 'Complete the set with control.';
    $('#strengthSetDots').innerHTML = Array.from({ length: totalSets }, (_, index) => {
      const number = index + 1;
      const done = (step.setLogs || []).some((set) => Number(set.setNumber) === number);
      return `<span class="${done ? 'done' : number === setNo ? 'active' : ''}">${done ? '✓' : number}</span>`;
    }).join('');

    const previous = Number(step.previousWeightKg || 0);
    const previousReps = Number(step.previousReps || 0);
    $('#strengthPreviousResult').textContent = previous > 0
      ? `${previous} kg × ${previousReps || '—'} reps`
      : (previousReps ? `Bodyweight × ${previousReps} reps` : 'No previous load');
    $('#strengthRecommendation').textContent = stage === 'complete' ? strengthSessionRecommendation(step) : (step.priorRecommendation || 'Reach the top of the rep range with control.');

    const weightControl = $('#strengthWeightControl');
    const input = $('#strengthWeightInput');
    const stageLocksWeight = ['active', 'rest', 'complete'].includes(stage);
    weightControl.hidden = stage === 'rest' || stage === 'complete';
    input.disabled = stageLocksWeight;
    input.value = Number(runtime.currentWeightKg || 0);
    $('#strengthSuggestedWeight').textContent = Number(plan.suggestedWeightKg || 0) > 0
      ? `Suggested ${plan.suggestedWeightKg} kg • change it to the actual weight you use`
      : '0 kg means bodyweight. Enter dumbbell, band or machine load if used.';

    $('#strengthSetReadyView').hidden = stage !== 'ready';
    $('#strengthSetActiveView').hidden = stage !== 'active';
    $('#strengthSetLogView').hidden = stage !== 'log';
    $('#strengthRestView').hidden = stage !== 'rest';
    $('#strengthExerciseCompleteView').hidden = stage !== 'complete';

    $('#startStrengthSetBtn').textContent = `GO — START ${plan.label.toUpperCase()}`;
    $('#strengthSetStopwatch').textContent = formatWorkoutTime(runtime.setElapsedSeconds || 0);
    $('#strengthRestCount').textContent = formatWorkoutTime(runtime.stepRemaining || 0);
    const nextPlan = step.setPlan?.[setNo] || null;
    $('#strengthRestNext').textContent = nextPlan
      ? `${nextPlan.label} next${Number(nextPlan.suggestedWeightKg || 0) > 0 ? ` • suggested ${nextPlan.suggestedWeightKg} kg` : ''}.`
      : 'Your next exercise is ready after this rest.';

    const reps = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    $('#strengthRepButtons').innerHTML = reps.map((value) => `<button type="button" class="strength-rep-btn ${Number(runtime.selectedReps) === value ? 'active' : ''}" data-strength-reps="${value}">${value}</button>`).join('');
    $('#strengthRepsInput').value = runtime.selectedReps && !reps.includes(Number(runtime.selectedReps)) ? Number(runtime.selectedReps) : '';

    const summary = (step.setLogs || []).map((set) => `<span>Set ${set.setNumber}: ${Number(set.weightKg || 0) > 0 ? `${set.weightKg} kg` : 'Bodyweight'} × ${set.reps} reps</span>`).join('');
    $('#strengthSetSummary').innerHTML = summary || '<span>No sets logged.</span>';
  }

  function renderFoundationWorkoutPlayer() {
    const runtime = foundationWorkoutRuntime;
    if (!runtime) return;
    const step = currentFoundationStep();
    const workout = workoutDefinitionForRuntime(runtime);
    const isStrength = step?.type === 'strength-exercise';
    $('#workoutPlayerModal')?.classList.toggle('is-strength-step', isStrength);
    $('#workoutPlayerProgram').textContent = runtime.programType === 'gym' ? 'Gym Beginner Strength' : 'Foundation Home Program';
    $('#workoutPlayerTitle').textContent = workout.title;
    $('#workoutPlayerMeta').textContent = `${runtime.programType === 'home' ? `Week ${runtime.week} of 4` : `Week ${runtime.week}`} • ${workout.subtitle}`;
    $('#workoutElapsed').textContent = formatWorkoutTime(runtime.elapsedSeconds);
    const pct = foundationProgressPercent(runtime);
    $('#workoutProgressBar').style.width = `${pct}%`;
    if (runtime.overallSeconds > 0) {
      $('#workoutOverallLabel').textContent = 'Time left';
      $('#workoutOverallTime').textContent = formatWorkoutTime(runtime.overallRemaining);
    } else {
      $('#workoutOverallLabel').textContent = 'Progress';
      $('#workoutOverallTime').textContent = `${pct}%`;
    }
    $('#workoutRoundLabel').textContent = runtime.loop || step?.totalRounds ? 'Round' : (isStrength ? 'Set' : 'Step');
    $('#workoutRoundValue').textContent = runtime.loop ? String(runtime.round || 1) : step?.round ? `${step.round}/${step.totalRounds}` : (isStrength ? `${runtime.currentSet || 1}/${step.totalSets || 3}` : `${runtime.stepIndex + 1}`);
    $('#workoutPhase').textContent = step?.phase || 'Workout';
    $('#workoutStepCount').textContent = `${runtime.stepIndex + 1} of ${runtime.steps.length}`;
    $('#workoutExerciseName').textContent = step?.name || 'Workout complete';
    $('#workoutExerciseTarget').textContent = step?.target || (step?.seconds ? `${step.seconds} seconds` : 'Complete with control');
    $('#workoutExerciseCue').textContent = step?.cue || step?.tips?.[0] || 'Move with control and breathe normally.';
    const low = $('#workoutLowImpact');
    if (low) {
      low.hidden = !step?.lowImpact;
      low.textContent = step?.lowImpact ? `Low-impact option: ${step.lowImpact}` : '';
    }
    const visual = $('#workoutExerciseVisual');
    if (visual) {
      if (step?.image) visual.innerHTML = `<img src="${step.image}" alt="${escapeHtml(step.name)}" />`;
      else visual.innerHTML = `<div class="workout-generic-icon">${icon(step?.type === 'rest' ? 'heart' : step?.phase === 'Cardio' ? 'run' : 'strength')}</div>`;
      visual.classList.toggle('is-rest', step?.type === 'rest');
    }

    $('#workoutStrengthSetPanel').hidden = !isStrength;
    $('#workoutGenericControls').hidden = isStrength;
    $('#workoutTimerCard').hidden = isStrength;
    const pauseBtn = $('#workoutPauseBtn');
    pauseBtn.hidden = !isStrength;
    pauseBtn.textContent = runtime.running ? 'Pause workout' : (runtime.elapsedSeconds > 0 ? 'Resume workout' : 'Start workout');

    if (isStrength) {
      renderStrengthSetStep(step);
    } else {
      const timed = step?.type === 'timed' || step?.type === 'rest';
      $('#workoutTimerLabel').textContent = timed ? (step.type === 'rest' ? 'Rest countdown' : 'Exercise countdown') : 'Workout clock';
      $('#workoutStepTimer').textContent = timed ? formatWorkoutTime(runtime.stepRemaining) : 'Tap Done';
      $('#workoutTimerToggleBtn').textContent = runtime.running ? 'Pause' : (runtime.elapsedSeconds > 0 ? 'Resume' : 'Start workout');
      $('#workoutDoneBtn').textContent = step?.type === 'rest' ? 'Skip rest' : 'Done / Next';
      $('#workoutPreviousBtn').disabled = runtime.stepIndex === 0 && Number(runtime.round || 1) <= 1;
    }
  }

  function stopFoundationTimer() {
    if (foundationWorkoutTimer) clearInterval(foundationWorkoutTimer);
    foundationWorkoutTimer = null;
  }

  function finishStrengthRest(auto = false) {
    const runtime = foundationWorkoutRuntime;
    const step = currentFoundationStep();
    if (!runtime || step?.type !== 'strength-exercise') return;
    const total = Math.max(1, Number(step.totalSets || 3));
    if (runtime.currentSet >= total) {
      runtime.setStage = 'complete';
      runtime.stepRemaining = 0;
    } else {
      const previousLog = (step.setLogs || []).slice(-1)[0];
      runtime.currentSet += 1;
      const plan = strengthCurrentPlan(step, runtime);
      const lastWeight = Number(previousLog?.weightKg || 0);
      runtime.currentWeightKg = Math.max(Number(plan.suggestedWeightKg || 0), lastWeight > 0 ? lastWeight + Number(step.incrementKg || 1) : 0);
      runtime.setStage = 'ready';
      runtime.setElapsedSeconds = 0;
      runtime.selectedReps = null;
      runtime.stepRemaining = 0;
      if (auto && navigator.vibrate) navigator.vibrate([100, 80, 100]);
    }
    persistFoundationWorkout(true);
    renderFoundationWorkoutPlayer();
  }

  function startFoundationTimerLoop() {
    if (foundationWorkoutTimer) return;
    foundationWorkoutTimer = window.setInterval(() => {
      const runtime = foundationWorkoutRuntime;
      if (!runtime || !runtime.running) return;
      runtime.elapsedSeconds = Number(runtime.elapsedSeconds || 0) + 1;
      if (runtime.overallSeconds > 0) {
        runtime.overallRemaining = Math.max(0, Number(runtime.overallRemaining || runtime.overallSeconds) - 1);
        if (runtime.overallRemaining <= 0) {
          completeFoundationWorkout();
          return;
        }
      }
      const step = currentFoundationStep();
      if (step?.type === 'strength-exercise') {
        if (runtime.setStage === 'active') runtime.setElapsedSeconds = Number(runtime.setElapsedSeconds || 0) + 1;
        if (runtime.setStage === 'rest') {
          runtime.stepRemaining = Math.max(0, Number(runtime.stepRemaining || 0) - 1);
          if (runtime.stepRemaining <= 0) {
            finishStrengthRest(true);
            return;
          }
        }
      } else if (step && (step.type === 'timed' || step.type === 'rest')) {
        runtime.stepRemaining = Math.max(0, Number(runtime.stepRemaining || step.seconds || 0) - 1);
        if (runtime.stepRemaining <= 0) {
          if (navigator.vibrate) navigator.vibrate(100);
          advanceFoundationWorkoutStep(false);
          return;
        }
      }
      persistFoundationWorkout(false);
      renderFoundationWorkoutPlayer();
    }, 1000);
  }

  function showWorkoutModal(modal) {
    if (!modal) throw new Error('Workout player is missing from this page.');
    if (modal.open) return;
    try {
      if (typeof modal.showModal === 'function') {
        modal.showModal();
      } else {
        modal.setAttribute('open', '');
        modal.classList.add('dialog-fallback-open');
      }
    } catch (err) {
      console.warn('Workout dialog fallback used.', err);
      modal.setAttribute('open', '');
      modal.classList.add('dialog-fallback-open');
    }
  }

  function validSavedWorkout(runtime) {
    return !!(runtime && Array.isArray(runtime.steps) && runtime.steps.length && Number.isFinite(Number(runtime.stepIndex || 0)));
  }

  function openFoundationWorkout(runtime) {
    foundationWorkoutRuntime = normaliseFoundationRuntime(runtime);
    foundationLastPersistSecond = -1;
    const modal = $('#workoutPlayerModal');
    const completedPending = !!foundationWorkoutRuntime.completedPendingSave || (foundationWorkoutRuntime.overallSeconds > 0 && foundationWorkoutRuntime.overallRemaining <= 0);
    $('#workoutActivePanel').hidden = completedPending;
    $('#workoutCompletePanel').hidden = !completedPending;
    $('#workoutFinishNotes').value = '';
    if (completedPending) {
      const rounds = foundationWorkoutRuntime.loop || foundationWorkoutRuntime.steps.some((step) => step.round) ? ` • ${Math.max(1, Number(foundationWorkoutRuntime.round || 1))} rounds` : '';
      $('#workoutCompleteTitle').textContent = foundationWorkoutRuntime.workoutTitle || 'Workout complete';
      $('#workoutCompleteSummary').textContent = `${formatWorkoutTime(foundationWorkoutRuntime.elapsedSeconds)} workout time${rounds}. Save it to your Progress history.`;
    } else {
      renderFoundationWorkoutPlayer();
      startFoundationTimerLoop();
    }
    showWorkoutModal(modal);
  }

  function startFoundationWorkout(workoutId) {
    try {
      const s = state();
      const week = strengthWeekNumberForDate(s, 'home');
      const existing = s.strengthProgram?.home?.activeWorkout;
      if (validSavedWorkout(existing)) {
        const sameWorkout = String(existing.workoutId || '') === String(workoutId || 'foundation-session') && Number(existing.week || week) === Number(week);
        if (sameWorkout) {
          openFoundationWorkout(existing);
          return;
        }
        if (!confirm('You already have a different workout in progress. Start a new one and replace the saved workout?')) return;
      } else if (existing) {
        window.PWStore.clearStrengthWorkoutProgress('home');
      }
      const runtime = buildFoundationWorkoutRuntime(week, workoutId);
      window.PWStore.saveStrengthWorkoutProgress('home', runtime);
      openFoundationWorkout(runtime);
    } catch (err) {
      console.error('Could not start Foundation workout.', err);
      toast('Workout could not open. Refresh once and try again.');
    }
  }

  function startGymWorkout() {
    try {
      const s = state();
      const existing = s.strengthProgram?.gym?.activeWorkout;
      if (validSavedWorkout(existing)) {
        openFoundationWorkout(existing);
        return;
      }
      if (existing) window.PWStore.clearStrengthWorkoutProgress('gym');
      const runtime = buildGymWorkoutRuntime();
      window.PWStore.saveStrengthWorkoutProgress('gym', runtime);
      openFoundationWorkout(runtime);
    } catch (err) {
      console.error('Could not start gym workout.', err);
      toast('Workout could not open. Refresh once and try again.');
    }
  }

  function resumeFoundationWorkout(type = 'home') {
    const clean = type === 'gym' ? 'gym' : 'home';
    const runtime = state().strengthProgram?.[clean]?.activeWorkout;
    if (!runtime) {
      toast('No saved workout to resume');
      return;
    }
    openFoundationWorkout(runtime);
  }

  function toggleFoundationWorkoutTimer() {
    if (!foundationWorkoutRuntime) return;
    foundationWorkoutRuntime.running = !foundationWorkoutRuntime.running;
    persistFoundationWorkout(true);
    renderFoundationWorkoutPlayer();
  }

  function advanceFoundationWorkoutStep(skipped = false) {
    const runtime = foundationWorkoutRuntime;
    if (!runtime) return;
    if (!skipped) runtime.completedStepCount = Number(runtime.completedStepCount || 0) + 1;
    if (runtime.stepIndex >= runtime.steps.length - 1) {
      if (runtime.loop) {
        runtime.stepIndex = 0;
        runtime.round = Number(runtime.round || 1) + 1;
      } else {
        completeFoundationWorkout();
        return;
      }
    } else {
      runtime.stepIndex += 1;
    }
    runtime.currentSet = 1;
    runtime.setStage = '';
    runtime.currentWeightKg = null;
    runtime.selectedReps = null;
    runtime.setElapsedSeconds = 0;
    const next = currentFoundationStep();
    runtime.stepRemaining = Number(next?.seconds || 0);
    prepareRuntimeForCurrentStep(runtime, false);
    persistFoundationWorkout(true);
    renderFoundationWorkoutPlayer();
  }

  function previousFoundationWorkoutStep() {
    const runtime = foundationWorkoutRuntime;
    if (!runtime) return;
    if (runtime.stepIndex > 0) runtime.stepIndex -= 1;
    else if (runtime.loop && runtime.round > 1) {
      runtime.round -= 1;
      runtime.stepIndex = runtime.steps.length - 1;
    }
    runtime.currentSet = 1;
    runtime.setStage = '';
    runtime.currentWeightKg = null;
    const step = currentFoundationStep();
    runtime.stepRemaining = Number(step?.seconds || 0);
    prepareRuntimeForCurrentStep(runtime, false);
    persistFoundationWorkout(true);
    renderFoundationWorkoutPlayer();
  }

  function startStrengthSet() {
    const runtime = foundationWorkoutRuntime;
    const step = currentFoundationStep();
    if (!runtime || step?.type !== 'strength-exercise') return;
    const weightInput = $('#strengthWeightInput');
    runtime.currentWeightKg = Math.max(0, Number(weightInput?.value || runtime.currentWeightKg || 0));
    runtime.running = true;
    runtime.setStage = 'active';
    runtime.setElapsedSeconds = 0;
    persistFoundationWorkout(true);
    renderFoundationWorkoutPlayer();
  }

  function openStrengthSetLog() {
    const runtime = foundationWorkoutRuntime;
    if (!runtime || runtime.setStage !== 'active') return;
    runtime.setStage = 'log';
    runtime.selectedReps = null;
    persistFoundationWorkout(true);
    renderFoundationWorkoutPlayer();
  }

  function selectStrengthReps(value) {
    if (!foundationWorkoutRuntime) return;
    foundationWorkoutRuntime.selectedReps = Math.max(1, Number(value || 0));
    renderFoundationWorkoutPlayer();
  }

  function confirmStrengthSet() {
    const runtime = foundationWorkoutRuntime;
    const step = currentFoundationStep();
    if (!runtime || step?.type !== 'strength-exercise') return;
    const custom = Number($('#strengthRepsInput')?.value || 0);
    const reps = custom > 0 ? custom : Number(runtime.selectedReps || 0);
    if (!reps) {
      toast('Choose or enter the reps completed');
      return;
    }
    const plan = strengthCurrentPlan(step, runtime);
    const log = {
      setNumber: Number(runtime.currentSet || 1),
      setType: plan.setType,
      label: plan.label,
      weightKg: Math.max(0, Number(runtime.currentWeightKg || 0)),
      reps,
      durationSeconds: Math.max(0, Number(runtime.setElapsedSeconds || 0)),
      completedAt: new Date().toISOString()
    };
    if (!Array.isArray(step.setLogs)) step.setLogs = [];
    step.setLogs = step.setLogs.filter((set) => Number(set.setNumber) !== log.setNumber);
    step.setLogs.push(log);
    step.setLogs.sort((a, b) => Number(a.setNumber) - Number(b.setNumber));
    runtime.selectedReps = null;
    const total = Math.max(1, Number(step.totalSets || 3));
    if (runtime.currentSet < total) {
      runtime.setStage = 'rest';
      runtime.stepRemaining = Math.max(15, Number(step.restSeconds || 75));
    } else {
      runtime.setStage = 'complete';
      runtime.stepRemaining = 0;
    }
    persistFoundationWorkout(true);
    renderFoundationWorkoutPlayer();
  }

  function adjustStrengthWeight(direction) {
    const runtime = foundationWorkoutRuntime;
    const step = currentFoundationStep();
    if (!runtime || step?.type !== 'strength-exercise') return;
    const increment = Math.max(0.5, Number(step.incrementKg || 1));
    runtime.currentWeightKg = Math.max(0, Math.round((Number(runtime.currentWeightKg || 0) + increment * direction) * 10) / 10);
    persistFoundationWorkout(true);
    renderFoundationWorkoutPlayer();
  }

  function nextStrengthExercise() {
    const runtime = foundationWorkoutRuntime;
    if (!runtime || runtime.setStage !== 'complete') return;
    advanceFoundationWorkoutStep(false);
  }

  function completeFoundationWorkout() {
    if (!foundationWorkoutRuntime) return;
    foundationWorkoutRuntime.running = false;
    stopFoundationTimer();
    $('#workoutActivePanel').hidden = true;
    $('#workoutCompletePanel').hidden = false;
    const runtime = foundationWorkoutRuntime;
    $('#workoutCompleteTitle').textContent = runtime.workoutTitle || 'Workout complete';
    const rounds = runtime.loop || runtime.steps.some((step) => step.round) ? ` • ${Math.max(1, Number(runtime.round || 1))} round${Number(runtime.round || 1) === 1 ? '' : 's'}` : '';
    $('#workoutCompleteSummary').textContent = `${formatWorkoutTime(runtime.elapsedSeconds)} workout time${rounds}. Save it to your Progress history.`;
    window.PWStore.saveStrengthWorkoutProgress(runtime.programType || 'home', { ...runtime, running: false, completedPendingSave: true });
  }

  function saveCompletedFoundationWorkout() {
    const runtime = foundationWorkoutRuntime;
    if (!runtime) return;
    const unique = [];
    const seen = new Set();
    runtime.steps.forEach((step) => {
      if (!step?.name || step.type === 'rest') return;
      if (step.type === 'strength-exercise') {
        unique.push({
          key: step.key,
          name: step.name,
          target: step.target || '',
          targetMin: Number(step.targetMin || 8),
          targetMax: Number(step.targetMax || 12),
          phase: step.phase || 'Strength',
          sets: Array.isArray(step.setLogs) ? step.setLogs : [],
          nextRecommendation: strengthSessionRecommendation(step)
        });
        return;
      }
      if (seen.has(step.name)) return;
      seen.add(step.name);
      unique.push({ name: step.name, target: step.target || '', phase: step.phase || '' });
    });
    window.PWStore.saveStrengthSession({
      type: runtime.programType === 'gym' ? 'gym' : 'home',
      date: runtime.date || window.PWStore.todayKey(),
      weekOverride: runtime.week,
      workoutId: runtime.workoutId,
      workoutTitle: runtime.workoutTitle,
      durationSeconds: runtime.elapsedSeconds,
      roundsCompleted: runtime.round || 1,
      completionPercent: 100,
      exercises: unique,
      notes: $('#workoutFinishNotes')?.value || ''
    });
    foundationWorkoutRuntime = null;
    stopFoundationTimer();
    $('#workoutPlayerModal')?.close();
    toast('Workout saved with weights and reps');
    renderAll();
  }

  function exitFoundationWorkout(savePlace = true) {
    if (foundationWorkoutRuntime && savePlace) {
      foundationWorkoutRuntime.running = false;
      window.PWStore.saveStrengthWorkoutProgress(foundationWorkoutRuntime.programType || 'home', { ...foundationWorkoutRuntime, running: false });
      toast('Workout place saved');
    }
    stopFoundationTimer();
    $('#workoutPlayerModal')?.close();
    foundationWorkoutRuntime = null;
    renderAll();
  }

  function renderStrengthTrack(s, type = 'home') {
    const clean = type === 'gym' ? 'gym' : 'home';
    if (clean === 'home') {
      renderFoundationHomeTrack(s);
      return;
    }
    const title = 'Gym beginner strength';
    const prefix = 'gymStrength';
    const program = strengthState(s, clean);
    const started = !!program.started;
    const startPanel = $(`#${prefix}StartPanel`);
    const activePanel = $(`#${prefix}ActivePanel`);
    if (!startPanel || !activePanel) return;
    startPanel.hidden = started;
    activePanel.hidden = !started;
    const week = strengthWeekNumberForDate(s, clean);
    const sessions = strengthSessionsForWeek(s, clean, week);
    const pill = $(`#${prefix}WeekPill`);
    if (pill) pill.textContent = started ? `Week ${week}` : 'Not started';
    const weekEl = $(`#${prefix}CurrentWeek`);
    if (weekEl) weekEl.textContent = `Week ${week}`;
    const countEl = $(`#${prefix}ThisWeekCount`);
    if (countEl) countEl.textContent = `${sessions.length}/3`;
    const totalEl = $(`#${prefix}TotalSessions`);
    const all = (s.logs.strengthSessions || []).filter((item) => item.programType === clean);
    if (totalEl) totalEl.textContent = String(all.length);
    const list = $(`#${prefix}ExerciseList`);
    if (list) list.innerHTML = started ? strengthExerciseCardsHtml(s, clean) : '';

    const activeWorkout = program.activeWorkout;
    const resume = $('#gymResumeBanner');
    if (resume) {
      resume.hidden = !activeWorkout;
      if (activeWorkout) {
        const step = activeWorkout.steps?.[activeWorkout.stepIndex || 0];
        $('#gymResumeTitle').textContent = activeWorkout.workoutTitle || 'Resume gym workout';
        $('#gymResumeText').textContent = `${step?.name || 'Next exercise'} • ${formatWorkoutTime(activeWorkout.elapsedSeconds || 0)} logged so far`;
      }
    }
    const startBtn = $('#startGymWorkoutBtn');
    if (startBtn) {
      startBtn.hidden = !!activeWorkout;
      startBtn.textContent = all.length ? 'Start next gym workout' : 'Start first gym workout';
    }

    const advice = $(`#${prefix}Advice`);
    if (advice) advice.textContent = 'Set 1 is your warm-up. Set 2 is slightly heavier. Set 3 is the working set that drives the next-session weight suggestion.';
    const sessionList = $(`#${prefix}SessionList`);
    if (sessionList) {
      const recent = all.slice().sort((a, b) => b.date.localeCompare(a.date) || (b.ts || '').localeCompare(a.ts || '')).slice(0, 4);
      sessionList.innerHTML = recent.length ? recent.map((item) => {
        const loads = (item.exercises || []).map((exercise) => {
          const set = (exercise.sets || []).filter((row) => row.setType === 'working').slice(-1)[0] || (exercise.sets || []).slice(-1)[0];
          if (!set) return '';
          return `${escapeHtml(exercise.name)}: ${Number(set.weightKg || 0) > 0 ? `${set.weightKg} kg` : 'Bodyweight'} × ${set.reps}`;
        }).filter(Boolean).slice(0, 2).join(' • ');
        return `
          <div class="summary-row">
            <span><strong>${fmtDate(item.date)}</strong><br><small>${title}${loads ? ' • ' + loads : ''}${item.notes ? ' • ' + escapeHtml(item.notes) : ''}</small></span>
            <strong>Done</strong>
          </div>
        `;
      }).join('') : '<p class="small muted">No sessions logged yet.</p>';
    }
  }

  function renderStrengthProgress(s) {
    const box = $('#strengthProgressBox');
    if (!box) return;
    const sessions = (s.logs.strengthSessions || []).slice().sort((a, b) => b.date.localeCompare(a.date) || (b.ts || '').localeCompare(a.ts || ''));
    if (!sessions.length) {
      box.innerHTML = '<p class="muted">Start the Foundation Home or Gym Beginner program to see completed sessions here.</p>';
      return;
    }
    const homeSessions = sessions.filter((item) => item.programType === 'home');
    const gymSessions = sessions.filter((item) => item.programType === 'gym');
    const latest = sessions[0];
    const homeWeek = strengthWeekNumberForDate(s, 'home');
    const homeWeekSessions = foundationSessionsForCurrentWeek(s, homeWeek);
    const target = foundationTargetForWeek(homeWeek);
    const totalMinutes = Math.round(homeSessions.reduce((sum, item) => sum + Number(item.durationSeconds || 0), 0) / 60);
    box.innerHTML = `
      <div class="grid three walk-stats-grid">
        <article class="mini-stat"><span>Foundation Home</span><strong>${homeSessions.length}</strong></article>
        <article class="mini-stat"><span>Gym sessions</span><strong>${gymSessions.length}</strong></article>
        <article class="mini-stat"><span>Workout minutes</span><strong>${totalMinutes || 0}</strong></article>
      </div>
      ${s.strengthProgram?.home?.started ? `
        <div class="foundation-progress-summary">
          <div>
            <p class="eyebrow gold">Foundation Home — Week ${homeWeek} of 4</p>
            <h3>${homeWeekSessions.length}/${target} sessions completed this week</h3>
          </div>
          <div class="meter"><span style="width:${Math.min(100, Math.round((homeWeekSessions.length / target) * 100))}%"></span></div>
        </div>
      ` : ''}
      <div class="movement-delta-list">
        ${sessions.slice(0, 5).map((item) => `<div class="summary-row"><span><strong>${escapeHtml(item.workoutTitle || (item.programType === 'gym' ? 'Gym beginner strength' : 'Foundation Home'))}</strong><br><small>${fmtDate(item.date)}${item.durationSeconds ? ' • ' + formatWorkoutTime(item.durationSeconds) : ''}</small></span><strong>Week ${item.week || 1}</strong></div>`).join('')}
      </div>
      <p class="small muted">Latest session: ${fmtDate(latest.date)}</p>
    `;
  }

  function walkingWeekNumberForDate(s, dateKey = window.PWStore.todayKey()) {
    if (!s.walkingProgram?.started || !s.walkingProgram.startDate) return 1;
    const start = new Date(`${s.walkingProgram.startDate}T00:00:00`);
    const date = new Date(`${dateKey}T00:00:00`);
    const diffDays = Math.floor((date - start) / 86400000);
    return Math.min(8, Math.max(1, Math.floor(diffDays / 7) + 1));
  }

  function walksForWeek(s, week) {
    return (s.logs.walks || []).filter((walk) => Number(walk.week) === Number(week));
  }

  function avgSteps(walks) {
    if (!walks.length) return 0;
    return Math.round(walks.reduce((sum, walk) => sum + Number(walk.steps || 0), 0) / walks.length);
  }

  function walkingWeeklyRows(s) {
    const rows = [];
    for (let week = 1; week <= 8; week += 1) {
      const walks = walksForWeek(s, week);
      const average = avgSteps(walks);
      rows.push({
        week,
        walks: walks.length,
        average,
        target: Number(s.walkingProgram?.weeklyTargets?.[String(week)] || 0)
      });
    }
    return rows;
  }

  function renderWalkingHome(s) {
    const title = $('#homeWalkingTitle');
    const text = $('#homeWalkingText');
    const stats = $('#homeWalkingStats');
    if (!title || !text || !stats) return;

    if (!s.walkingProgram?.started) {
      title.textContent = '8-week walking program';
      text.textContent = 'Start when you are ready. Log each 60-minute walk and track your step average.';
      stats.innerHTML = '<span>60-min walks</span><span>4–5/week</span><span>steps per session</span>';
      return;
    }

    const week = walkingWeekNumberForDate(s);
    const walks = walksForWeek(s, week);
    const targetWalks = Number(s.walkingProgram.targetWalksPerWeek || 4);
    const average = avgSteps(walks);
    const targetSteps = Number(s.walkingProgram.weeklyTargets?.[String(week)] || 0);
    title.textContent = `Walking program: Week ${week} of 8`;
    text.textContent = targetSteps
      ? `This week’s target: ${targetSteps.toLocaleString()} steps per 60-minute walk.`
      : 'Log your 60-minute walks and build your weekly average gently.';
    stats.innerHTML = `
      <span>${walks.length}/${targetWalks} walks</span>
      <span>${average ? average.toLocaleString() : '—'} avg steps</span>
      <span>${targetSteps ? targetSteps.toLocaleString() + ' target' : 'target optional'}</span>
    `;
  }

  function suggestedWalkingTarget(rows, currentWeek) {
    const previous = rows.find((row) => row.week === currentWeek - 1);
    if (!previous || !previous.average) return '';
    return Math.round(previous.average * 1.05 / 50) * 50;
  }

  function renderWalkingTrack(s) {
    const startPanel = $('#walkingStartPanel');
    const activePanel = $('#walkingActivePanel');
    if (!startPanel || !activePanel) return;

    const started = !!s.walkingProgram?.started;
    startPanel.hidden = started;
    activePanel.hidden = !started;

    const week = walkingWeekNumberForDate(s);
    const targetWalks = Number(s.walkingProgram?.targetWalksPerWeek || 4);
    const walks = walksForWeek(s, week).sort((a, b) => b.date.localeCompare(a.date) || (b.ts || '').localeCompare(a.ts || ''));
    const average = avgSteps(walks);
    const rows = walkingWeeklyRows(s);
    const targetSteps = Number(s.walkingProgram?.weeklyTargets?.[String(week)] || 0);
    const suggested = suggestedWalkingTarget(rows, week);

    $('#walkingWeekPill').textContent = started ? `Week ${week} of 8` : 'Not started';
    if ($('#walkingCurrentWeek')) $('#walkingCurrentWeek').textContent = `${week} of 8`;
    if ($('#walkingThisWeekCount')) $('#walkingThisWeekCount').textContent = `${walks.length}/${targetWalks}`;
    if ($('#walkingThisWeekAvg')) $('#walkingThisWeekAvg').textContent = average ? average.toLocaleString() : '—';
    if ($('#walkingWeekTarget')) $('#walkingWeekTarget').value = targetSteps || '';
    if ($('#walkDate')) $('#walkDate').value = window.PWStore.todayKey();

    const advice = $('#walkingAdvice');
    if (advice) {
      if (week === 1 && !average) advice.textContent = 'Week 1 is your baseline week. Record your normal 60-minute walks without forcing the pace.';
      else if (week === 1) advice.textContent = `Week 1 baseline average so far: ${average.toLocaleString()} steps.`;
      else if (!targetSteps && suggested) advice.textContent = `Suggested Week ${week} target: about ${suggested.toLocaleString()} steps per 60-minute walk. Save it or adjust it.`;
      else if (targetSteps && average) advice.textContent = average >= targetSteps ? 'You are meeting this week’s walking target. Keep it steady and recover well.' : 'Keep showing up. The goal is steady progress, not perfection.';
      else advice.textContent = 'Log each 60-minute walk after you finish. Only total steps are needed.';
    }

    const list = $('#walkingSessionList');
    if (list) {
      if (!walks.length) {
        list.innerHTML = '<p class="muted">No walks logged for this week yet.</p>';
      } else {
        list.innerHTML = walks.map((walk) => `
          <div class="summary-row movement-row">
            <span><strong>${fmtDate(walk.date)}</strong><br><small>60-minute walk${walk.notes ? ' • ' + escapeHtml(walk.notes) : ''}</small></span>
            <strong>${Number(walk.steps || 0).toLocaleString()} steps</strong>
            <button class="text-button danger-link" data-delete-walk="${escapeHtml(walk.id)}" type="button">Delete</button>
          </div>
        `).join('');
        $$('[data-delete-walk]').forEach((btn) => btn.addEventListener('click', () => {
          if (!confirm('Delete this walk entry?')) return;
          window.PWStore.deleteWalkSession(btn.dataset.deleteWalk);
          toast('Walk deleted');
          renderAll();
        }));
      }
    }
  }

  function renderWalkingProgress(s) {
    const canvas = $('#walkingChart');
    const empty = $('#walkingChartEmpty');
    const summary = $('#walkingChartSummary');
    const list = $('#walkingWeekList');
    if (!canvas || !empty || !summary || !list) return;

    const rows = walkingWeeklyRows(s);
    const activeRows = rows.filter((row) => row.walks > 0 || row.target > 0);
    empty.style.display = activeRows.length ? 'none' : 'block';

    if (!s.walkingProgram?.started) {
      summary.textContent = 'Start the walking program on the Programs page.';
    } else {
      const currentWeek = walkingWeekNumberForDate(s);
      const current = rows.find((row) => row.week === currentWeek);
      const previous = rows.find((row) => row.week === currentWeek - 1);
      const delta = current?.average && previous?.average ? current.average - previous.average : 0;
      const deltaText = delta ? `${delta > 0 ? '+' : ''}${delta.toLocaleString()} vs last week` : 'build your baseline';
      summary.textContent = `Week ${currentWeek} of 8 • ${current?.walks || 0} walks • ${current?.average ? current.average.toLocaleString() + ' avg steps' : deltaText}`;
    }

    drawWalkingChart(rows);
    list.innerHTML = activeRows.length ? activeRows.map((row) => {
      const previous = rows.find((item) => item.week === row.week - 1);
      const delta = row.average && previous?.average ? row.average - previous.average : 0;
      const cls = delta > 0 ? 'up' : delta < 0 ? 'down' : 'same';
      const deltaText = row.average && previous?.average ? `${delta > 0 ? '+' : ''}${delta.toLocaleString()}` : '—';
      return `
        <div class="summary-row movement-row">
          <span><strong>Week ${row.week}</strong><br><small>${row.walks} walk${row.walks === 1 ? '' : 's'} • target ${row.target ? row.target.toLocaleString() : 'not set'}</small></span>
          <strong>${row.average ? row.average.toLocaleString() : '—'} avg</strong>
          <strong class="delta-pill ${cls}">${deltaText}</strong>
        </div>
      `;
    }).join('') : '';
  }

  function drawWalkingChart(rows) {
    const canvas = $('#walkingChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.045)';
    ctx.fillRect(0, 0, w, h);
    const activeRows = rows.filter((row) => row.walks > 0 || row.target > 0);
    if (!activeRows.length) return;

    const max = Math.max(1000, ...activeRows.map((row) => Math.max(row.average || 0, row.target || 0))) * 1.08;
    const left = 54;
    const right = 24;
    const top = 34;
    const bottom = 50;
    const plotW = w - left - right;
    const plotH = h - top - bottom;
    const gap = 10;
    const barW = Math.max(22, (plotW - gap * 7) / 8);

    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#b8bbd0';
    ctx.font = '13px system-ui';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 3; i += 1) {
      const y = top + plotH - (plotH * i) / 3;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(w - right, y);
      ctx.stroke();
      ctx.fillText(Math.round((max * i) / 3).toLocaleString(), left - 8, y + 4);
    }

    rows.forEach((row, index) => {
      const x = left + index * (barW + gap);
      const avgH = row.average ? (row.average / max) * plotH : 0;
      const y = top + plotH - avgH;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      roundRect(ctx, x, top, barW, plotH, 9);
      ctx.fill();

      if (avgH > 0) {
        const gradient = ctx.createLinearGradient(0, y, 0, top + plotH);
        gradient.addColorStop(0, '#d9a72e');
        gradient.addColorStop(1, '#e80075');
        ctx.fillStyle = gradient;
        roundRect(ctx, x, y, barW, Math.max(avgH, 8), 9);
        ctx.fill();
      }

      if (row.target > 0) {
        const targetY = top + plotH - (row.target / max) * plotH;
        ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 2, targetY);
        ctx.lineTo(x + barW + 2, targetY);
        ctx.stroke();
      }

      ctx.textAlign = 'center';
      ctx.fillStyle = '#f8fafc';
      ctx.font = '800 13px system-ui';
      ctx.fillText(`W${row.week}`, x + barW / 2, h - 22);
      ctx.fillStyle = '#b8bbd0';
      ctx.font = '12px system-ui';
      ctx.fillText(`${row.walks || 0}x`, x + barW / 2, h - 7);
    });
  }

  function joggingWeekNumberForDate(s, dateKey = window.PWStore.todayKey()) {
    if (!s.joggingProgram?.started || !s.joggingProgram.startDate) return 1;
    const start = new Date(`${s.joggingProgram.startDate}T00:00:00`);
    const date = new Date(`${dateKey}T00:00:00`);
    const diffDays = Math.floor((date - start) / 86400000);
    return Math.min(8, Math.max(1, Math.floor(diffDays / 7) + 1));
  }

  function joggingWeekPlan(week) {
    return JOGGING_PLAN.find((item) => item.week === Number(week)) || JOGGING_PLAN[0];
  }

  function runsForWeek(s, week) {
    return (s.logs.runs || []).filter((run) => Number(run.week) === Number(week));
  }

  function joggingWeeklyRows(s) {
    return JOGGING_PLAN.map((plan) => {
      const runs = runsForWeek(s, plan.week);
      const completedKm = Math.round(runs.reduce((sum, run) => sum + Number(run.distanceKm || 0), 0) * 100) / 100;
      const plannedKm = Math.round(plan.sessions.filter((item) => !item.optional).reduce((sum, item) => sum + item.targetKm, 0) * 100) / 100;
      return { week: plan.week, runs: runs.length, completedKm, plannedKm };
    });
  }

  function renderJoggingTrack(s) {
    const startPanel = $('#joggingStartPanel');
    const activePanel = $('#joggingActivePanel');
    if (!startPanel || !activePanel) return;

    const started = !!s.joggingProgram?.started;
    startPanel.hidden = started;
    activePanel.hidden = !started;

    const week = joggingWeekNumberForDate(s);
    const plan = joggingWeekPlan(week);
    const runs = runsForWeek(s, week).sort((a, b) => b.date.localeCompare(a.date) || (b.ts || '').localeCompare(a.ts || ''));
    const targetSessions = plan.sessions.filter((item) => !item.optional).length;
    const completedKm = Math.round(runs.reduce((sum, run) => sum + Number(run.distanceKm || 0), 0) * 100) / 100;
    const plannedKm = Math.round(plan.sessions.filter((item) => !item.optional).reduce((sum, item) => sum + item.targetKm, 0) * 100) / 100;

    if ($('#joggingWeekPill')) $('#joggingWeekPill').textContent = started ? `Week ${week} of 8` : 'Not started';
    if ($('#joggingCurrentWeek')) $('#joggingCurrentWeek').textContent = `${week} of 8`;
    if ($('#joggingThisWeekCount')) $('#joggingThisWeekCount').textContent = `${runs.length}/${targetSessions}`;
    if ($('#joggingThisWeekKm')) $('#joggingThisWeekKm').textContent = completedKm ? `${completedKm.toFixed(1)} km` : '—';
    if ($('#runDate')) $('#runDate').value = window.PWStore.todayKey();

    const sessionSelect = $('#runSessionType');
    if (sessionSelect) {
      const current = sessionSelect.value;
      sessionSelect.innerHTML = plan.sessions.map((session) => `<option value="${session.key}">${session.label} • ${session.targetKm} km${session.optional ? ' • optional' : ''}</option>`).join('');
      if (current && plan.sessions.some((session) => session.key === current)) sessionSelect.value = current;
      const selected = plan.sessions.find((session) => session.key === sessionSelect.value) || plan.sessions[0];
      if ($('#runDistance')) $('#runDistance').value = selected?.targetKm || '';
      if ($('#joggingSessionHint')) $('#joggingSessionHint').textContent = selected ? selected.note : 'Choose your session and log what you completed.';
      sessionSelect.onchange = () => {
        const next = plan.sessions.find((session) => session.key === sessionSelect.value) || plan.sessions[0];
        if ($('#runDistance')) $('#runDistance').value = next?.targetKm || '';
        if ($('#joggingSessionHint')) $('#joggingSessionHint').textContent = next ? next.note : '';
      };
    }

    const planList = $('#joggingPlanList');
    if (planList) {
      planList.innerHTML = plan.sessions.map((session) => {
        const done = runs.some((run) => run.sessionKey === session.key);
        return `<div class="program-session ${done ? 'done' : ''}">
          <span><strong>${session.label}</strong><br><small>${session.targetKm} km${session.optional ? ' • optional' : ''} • ${session.note}</small></span>
          <span>${done ? 'Done' : 'To do'}</span>
        </div>`;
      }).join('');
    }

    const advice = $('#joggingAdvice');
    if (advice) {
      if (!started) advice.textContent = 'Start the 8-week 0–5 km plan when you are ready.';
      else if (week === 1 && !runs.length) advice.textContent = 'Week 1 is about easy jogging/walking and building confidence. Keep the pace comfortable.';
      else if (runs.length >= targetSessions) advice.textContent = 'Core sessions completed for this week. Optional session only if you feel fresh.';
      else advice.textContent = `This week: aim for ${targetSessions} core sessions and about ${plannedKm.toFixed(1)} km total.`;
    }

    const list = $('#joggingSessionList');
    if (list) {
      if (!runs.length) {
        list.innerHTML = '<p class="muted">No jogs logged for this week yet.</p>';
      } else {
        list.innerHTML = runs.map((run) => `
          <div class="summary-row movement-row">
            <span><strong>${fmtDate(run.date)} • ${escapeHtml(run.sessionLabel || 'Jogging session')}</strong><br><small>${run.timeMinutes ? run.timeMinutes + ' min • ' : ''}${run.rpe ? 'RPE ' + run.rpe + ' • ' : ''}${run.notes ? escapeHtml(run.notes) : 'Logged run'}</small></span>
            <strong>${Number(run.distanceKm || 0).toFixed(1)} km</strong>
            <button class="text-button danger-link" data-delete-run="${escapeHtml(run.id)}" type="button">Delete</button>
          </div>
        `).join('');
        $$('[data-delete-run]').forEach((btn) => btn.addEventListener('click', () => {
          if (!confirm('Delete this jogging entry?')) return;
          window.PWStore.deleteRunSession(btn.dataset.deleteRun);
          toast('Jogging entry deleted');
          renderAll();
        }));
      }
    }
  }

  function renderJoggingProgress(s) {
    const canvas = $('#joggingChart');
    const empty = $('#joggingChartEmpty');
    const summary = $('#joggingChartSummary');
    const list = $('#joggingWeekList');
    if (!canvas || !empty || !summary || !list) return;

    const rows = joggingWeeklyRows(s);
    const activeRows = rows.filter((row) => row.runs > 0);
    empty.style.display = activeRows.length ? 'none' : 'block';
    if (!s.joggingProgram?.started) {
      summary.textContent = 'Start the 5 km jogging program on the Programs page.';
    } else {
      const week = joggingWeekNumberForDate(s);
      const current = rows.find((row) => row.week === week);
      summary.textContent = `Week ${week} of 8 • ${current?.runs || 0} sessions • ${current?.completedKm ? current.completedKm.toFixed(1) + ' km done' : 'log your first run'}`;
    }

    drawJoggingChart(rows);
    list.innerHTML = activeRows.length ? activeRows.map((row) => {
      const pctDone = row.plannedKm ? Math.round((row.completedKm / row.plannedKm) * 100) : 0;
      return `
        <div class="summary-row movement-row">
          <span><strong>Week ${row.week}</strong><br><small>${row.runs} session${row.runs === 1 ? '' : 's'} • planned ${row.plannedKm.toFixed(1)} km</small></span>
          <strong>${row.completedKm.toFixed(1)} km</strong>
          <strong class="delta-pill ${pctDone >= 100 ? 'up' : pctDone > 0 ? 'same' : 'down'}">${pctDone}%</strong>
        </div>
      `;
    }).join('') : '';
  }

  function drawJoggingChart(rows) {
    const canvas = $('#joggingChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.045)';
    ctx.fillRect(0, 0, w, h);
    const activeRows = rows.filter((row) => row.runs > 0 || row.plannedKm > 0);
    if (!activeRows.length) return;

    const max = Math.max(5, ...activeRows.map((row) => Math.max(row.completedKm || 0, row.plannedKm || 0))) * 1.15;
    const left = 42, right = 22, top = 34, bottom = 50;
    const plotW = w - left - right;
    const plotH = h - top - bottom;
    const gap = 10;
    const barW = Math.max(22, (plotW - gap * 7) / 8);

    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#b8bbd0';
    ctx.font = '13px system-ui';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 3; i += 1) {
      const y = top + plotH - (plotH * i) / 3;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(w - right, y);
      ctx.stroke();
      ctx.fillText(`${Math.round((max * i) / 3)}km`, left - 7, y + 4);
    }

    rows.forEach((row, index) => {
      const x = left + index * (barW + gap);
      const plannedH = row.plannedKm ? (row.plannedKm / max) * plotH : 0;
      const completedH = row.completedKm ? (row.completedKm / max) * plotH : 0;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      roundRect(ctx, x, top + plotH - plannedH, barW, Math.max(plannedH, 8), 9);
      ctx.fill();
      if (completedH > 0) {
        const y = top + plotH - completedH;
        const gradient = ctx.createLinearGradient(0, y, 0, top + plotH);
        gradient.addColorStop(0, '#ec4899');
        gradient.addColorStop(1, '#8b5cf6');
        ctx.fillStyle = gradient;
        roundRect(ctx, x + 4, y, Math.max(8, barW - 8), Math.max(completedH, 8), 8);
        ctx.fill();
      }
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f8fafc';
      ctx.font = '800 13px system-ui';
      ctx.fillText(`W${row.week}`, x + barW / 2, h - 22);
      ctx.fillStyle = '#b8bbd0';
      ctx.font = '12px system-ui';
      ctx.fillText(`${row.runs || 0}x`, x + barW / 2, h - 7);
    });
  }

  function renderMovementHistory(s) {
    const container = $('#movementHistory');
    if (!container) return;
    const entries = Object.values(s.logs.movement || {})
      .filter((entry) => entry && entry.done)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10);

    if (!entries.length) {
      container.innerHTML = '<p class="muted">No movement saved yet. Once a walk or movement session is ticked off, it will appear here.</p>';
      return;
    }

    container.innerHTML = entries.map((entry) => `
      <div class="summary-row movement-row">
        <span><strong>${fmtDate(entry.date)}</strong><br><small>${escapeHtml(entry.type || 'Movement')}${entry.notes ? ' • ' + escapeHtml(entry.notes) : ''}</small></span>
        <strong>${entry.duration || 0} min</strong>
      </div>
    `).join('');
  }


  function sortedPhotoSets(s) {
    return (s.photos.sets || [])
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async function getPhotoUrl(set, kind) {
    const key = set?.photoKeys?.[kind];
    if (!key) return '';
    const blob = await window.PWStore.getPhoto(key);
    return blob ? URL.createObjectURL(blob) : '';
  }

  function renderComparePlaceholder(frame, text) {
    frame.innerHTML = `<div class="compare-placeholder"><span class="ui-icon">${icon('camera')}</span><strong>${escapeHtml(text)}</strong></div>`;
  }

  async function renderPhotoCompare() {
    const s = state();
    const sets = sortedPhotoSets(s);
    const empty = $('#compareEmpty');
    const panel = $('#photoComparePanel');
    const selectA = $('#compareDateA');
    const selectB = $('#compareDateB');
    const frameA = $('#compareFrameA');
    const frameB = $('#compareFrameB');
    const labelA = $('#compareLabelA');
    const labelB = $('#compareLabelB');
    const hint = $('#compareHint');
    if (!empty || !panel || !selectA || !selectB || !frameA || !frameB) return;

    if (!sets.length) {
      empty.style.display = 'grid';
      panel.hidden = true;
      return;
    }

    empty.style.display = 'none';
    panel.hidden = false;

    if (!compareDateAId || !sets.some((set) => set.id === compareDateAId)) compareDateAId = sets[0].id;
    if (!compareDateBId || !sets.some((set) => set.id === compareDateBId)) compareDateBId = sets.length > 1 ? sets[sets.length - 1].id : sets[0].id;

    const options = sets.map((set) => `<option value="${escapeHtml(set.id)}">${fmtDate(set.date)}</option>`).join('');
    selectA.innerHTML = options;
    selectB.innerHTML = options;
    selectA.value = compareDateAId;
    selectB.value = compareDateBId;

    $$('.angle-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.compareAngle === compareAngle));

    const setA = sets.find((set) => set.id === compareDateAId) || sets[0];
    const setB = sets.find((set) => set.id === compareDateBId) || sets[sets.length - 1] || sets[0];
    const angleTitle = compareAngle.charAt(0).toUpperCase() + compareAngle.slice(1);
    if (labelA) labelA.textContent = `${fmtDate(setA.date)} • ${angleTitle}`;
    if (labelB) labelB.textContent = `${fmtDate(setB.date)} • ${angleTitle}`;

    const [urlA, urlB] = await Promise.all([getPhotoUrl(setA, compareAngle), getPhotoUrl(setB, compareAngle)]);
    if (urlA) frameA.innerHTML = `<img src="${urlA}" alt="${angleTitle} progress photo from ${fmtDate(setA.date)}" />`;
    else renderComparePlaceholder(frameA, `No ${compareAngle} photo`);

    if (urlB) frameB.innerHTML = `<img src="${urlB}" alt="${angleTitle} progress photo from ${fmtDate(setB.date)}" />`;
    else renderComparePlaceholder(frameB, `No ${compareAngle} photo`);

    if (hint) {
      hint.textContent = sets.length === 1
        ? 'Only one photo date saved so far. Add another set later to compare change over time.'
        : 'For the best comparison, use the same angle, lighting and distance each time.';
    }
  }

  async function renderLatestPhotoPreview() {
    const s = state();
    const set = s.photos.sets[0];
    const container = $('#latestPhotoPreview');
    if (!set) {
      container.className = 'photo-preview-empty';
      container.innerHTML = 'No photo set saved yet.';
      return;
    }
    container.className = 'photo-grid';
    container.innerHTML = await photoTilesHtml(set, true);
  }

  async function photoTilesHtml(set, compact = false) {
    const kinds = ['front', 'side', 'back'];
    const chunks = [];
    for (const kind of kinds) {
      const key = set.photoKeys?.[kind];
      if (!key) {
        chunks.push(`<div class="photo-tile">${kind}</div>`);
        continue;
      }
      const blob = await window.PWStore.getPhoto(key);
      const url = blob ? URL.createObjectURL(blob) : '';
      chunks.push(`<div class="photo-tile">${url ? `<img src="${url}" alt="${kind} progress photo" />` : kind}</div>`);
    }
    return chunks.join('');
  }

  async function renderPhotos() {
    $('#photoDate').value = window.PWStore.todayKey();
    const s = state();
    const gallery = $('#photoGallery');
    if (!s.photos.sets.length) {
      gallery.innerHTML = `<article class="card photo-set"><p class="muted">No photo sets saved yet.</p></article>`;
      return;
    }
    const cards = [];
    for (const set of s.photos.sets) {
      cards.push(`
        <article class="card photo-set">
          <div class="section-heading">
            <div>
              <p class="eyebrow gold">${fmtDate(set.date)}</p>
              <h3>Progress photo set</h3>
              ${set.notes ? `<p class="muted small">${escapeHtml(set.notes)}</p>` : ''}
            </div>
            <button class="danger" data-delete-photo-set="${set.id}">Delete</button>
          </div>
          <div class="photo-grid">${await photoTilesHtml(set)}</div>
        </article>
      `);
    }
    gallery.innerHTML = cards.join('');
    $$('[data-delete-photo-set]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this photo set from this device?')) return;
        await window.PWStore.deletePhotoSet(btn.dataset.deletePhotoSet);
        toast('Photo set deleted');
        renderAll();
      });
    });
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  }


  function mealIdeas() {
    return window.PW_MEAL_IDEAS || {};
  }

  function mealTypeLabel(type) {
    return { breakfast: 'Breakfast', snack: 'Snack', lunch: 'Lunch', dinner: 'Dinner' }[type] || 'Meal';
  }

  function currentMealType() {
    return $('#mealGeneratorType')?.value || 'breakfast';
  }

  function randomFrom(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function renderMealIdea(idea, type) {
    const result = $('#mealIdeaResult');
    if (!result || !idea) return;
    result.innerHTML = `
      <p class="eyebrow pink">${mealTypeLabel(type)} idea</p>
      <h3>${escapeHtml(idea.title)}</h3>
      <p class="meal-structure">${escapeHtml(idea.structure || '')}</p>
      <p class="muted">${escapeHtml(idea.idea || '')}</p>
      <div class="recipe-tags">${(idea.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
      <p class="small muted"><strong>Coach note:</strong> ${escapeHtml(idea.note || 'Keep portions aligned with the client plan.')}</p>
    `;
  }

  function renderMealIdeaList() {
    const list = $('#mealIdeaList');
    const btn = $('#showAllMealIdeasBtn');
    if (!list || !btn) return;
    const type = currentMealType();
    const items = mealIdeas()[type] || [];
    list.hidden = !mealIdeasVisible;
    btn.textContent = mealIdeasVisible ? 'Hide all ideas' : 'Show all ideas';
    if (!mealIdeasVisible) return;
    list.innerHTML = items.map((idea) => `
      <div class="meal-option-card">
        <div>
          <p class="eyebrow gold">${mealTypeLabel(type)}</p>
          <h3>${escapeHtml(idea.title)}</h3>
          <p class="small muted">${escapeHtml(idea.idea)}</p>
        </div>
        <div class="recipe-tags">${(idea.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
      </div>
    `).join('');
  }

  function resetMealGenerator() {
    const result = $('#mealIdeaResult');
    if (result) {
      result.innerHTML = `
        <p class="eyebrow pink">${mealTypeLabel(currentMealType())}</p>
        <h3>Spin for a fresh idea.</h3>
        <p class="muted">Use this when a client needs a quick option without opening the full recipe book.</p>
      `;
    }
    renderMealIdeaList();
  }

  function spinMealWheel() {
    const type = currentMealType();
    const items = mealIdeas()[type] || [];
    if (!items.length) {
      toast('No meal ideas loaded yet');
      return;
    }
    const wheel = $('#mealWheel');
    const label = $('#mealWheelLabel');
    const btn = $('#spinMealBtn');
    const idea = randomFrom(items);
    mealSpinRotation += 1440 + Math.floor(Math.random() * 720);
    if (wheel) {
      wheel.classList.add('spinning');
      wheel.style.setProperty('--spin', `${mealSpinRotation}deg`);
    }
    if (label) label.textContent = 'SPINNING';
    if (btn) btn.disabled = true;
    setTimeout(() => {
      if (label) label.textContent = mealTypeLabel(type).toUpperCase();
      if (wheel) wheel.classList.remove('spinning');
      if (btn) btn.disabled = false;
      renderMealIdea(idea, type);
      toast('Meal idea generated');
    }, 1900);
  }

  function recipeSearchText(recipe) {
    return [
      recipe.title,
      recipe.summary,
      recipe.planNote,
      ...(recipe.tags || []),
      ...(recipe.ingredients || []),
      ...(recipe.method || []),
      ...(recipe.searchTerms || [])
    ].filter(Boolean).join(' ').toLowerCase();
  }

  function isFavouriteRecipe(id) {
    return !!(state().recipes?.favourites || []).includes(id);
  }

  function bindRecipeFavouriteButtons(root = document) {
    root.querySelectorAll('[data-toggle-recipe-fav]').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const id = btn.dataset.toggleRecipeFav;
        const wasFavourite = isFavouriteRecipe(id);
        window.PWStore.toggleRecipeFavourite(id);
        toast(wasFavourite ? 'Removed from favourites' : 'Saved to favourites');
        renderRecipes();
        const modal = $('#recipeModal');
        if (modal && modal.open && $('#recipeModalContent [data-toggle-recipe-fav]')) openRecipe(id);
      });
    });
  }

  function renderRecipes() {
    const s = state();
    const favs = s.recipes?.favourites || [];
    const priorityTags = ['Fun Meals', 'Sunday Meals', 'Casserole', 'Braai', 'Fakeaway', 'Family Meals', 'Comfort Meals'];
    const tagSet = new Set(window.PW_RECIPES.flatMap((r) => r.tags));
    const priority = priorityTags.filter((tag) => tagSet.has(tag));
    const remaining = Array.from(tagSet).filter((tag) => !priorityTags.includes(tag)).sort();
    const allTags = ['All', 'Favourites', ...priority, ...remaining];
    $('#recipeFilters').innerHTML = allTags.map((tag) => `<button class="${tag === activeRecipeFilter ? 'active' : ''}" data-recipe-filter="${tag}">${tag}${tag === 'Favourites' && favs.length ? ` (${favs.length})` : ''}</button>`).join('');
    $$('[data-recipe-filter]').forEach((btn) => btn.addEventListener('click', () => {
      activeRecipeFilter = btn.dataset.recipeFilter;
      renderRecipes();
    }));

    const q = ($('#recipeSearch').value || '').trim().toLowerCase();
    const recipes = window.PW_RECIPES.filter((recipe) => {
      const isFav = favs.includes(recipe.id);
      const matchesFilter = activeRecipeFilter === 'All' || (activeRecipeFilter === 'Favourites' ? isFav : recipe.tags.includes(activeRecipeFilter));
      return matchesFilter && (!q || recipeSearchText(recipe).includes(q));
    });

    $('#recipeList').innerHTML = recipes.length ? recipes.map((recipe) => {
      const fav = favs.includes(recipe.id);
      return `
      <article class="card recipe-card ${fav ? 'is-favourite' : ''}">
        <div class="recipe-card-top">
          <div>
            <p class="eyebrow pink">${recipe.tags[0] || 'Recipe'}</p>
            <h3>${recipe.title}</h3>
            <p class="muted">${recipe.summary}</p>
          </div>
          <button class="fav-btn ${fav ? 'active' : ''}" data-toggle-recipe-fav="${recipe.id}" aria-label="${fav ? 'Remove from favourites' : 'Save to favourites'}">${icon('heart')}</button>
        </div>
        <div class="macro-row">
          <span><strong>${recipe.calories}</strong><br>kcal</span>
          <span><strong>${recipe.protein}g</strong><br>protein</span>
          <span><strong>${recipe.carbs}g</strong><br>carbs</span>
          <span><strong>${recipe.fat}g</strong><br>fat</span>
        </div>
        <div class="recipe-tags">${recipe.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}</div>
        <button class="secondary full" data-open-recipe="${recipe.id}">View recipe</button>
      </article>`;
    }).join('') : `<article class="card"><p class="muted">No recipes match your search.</p></article>`;

    $$('[data-open-recipe]').forEach((btn) => btn.addEventListener('click', () => openRecipe(btn.dataset.openRecipe)));
    bindRecipeFavouriteButtons($('#recipeList'));
  }

  function openRecipe(id) {
    const recipe = window.PW_RECIPES.find((item) => item.id === id);
    if (!recipe) return;
    const fav = isFavouriteRecipe(recipe.id);
    $('#recipeModalContent').innerHTML = `
      <p class="eyebrow pink">${recipe.tags.join(' • ')}</p>
      <h2>${recipe.title}</h2>
      <p class="muted">${recipe.summary}</p>
      <button class="secondary full with-icon modal-fav-btn ${fav ? 'active' : ''}" data-toggle-recipe-fav="${recipe.id}">${icon('heart')}${fav ? 'Saved to favourites' : 'Save to favourites'}</button>
      <div class="macro-row">
        <span><strong>${recipe.calories}</strong><br>kcal</span>
        <span><strong>${recipe.protein}g</strong><br>protein</span>
        <span><strong>${recipe.carbs}g</strong><br>carbs</span>
        <span><strong>${recipe.fat}g</strong><br>fat</span>
      </div>
      <h3>Ingredients</h3>
      <ul>${recipe.ingredients.map((item) => `<li>${item}</li>`).join('')}</ul>
      <h3>Method</h3>
      <ol>${recipe.method.map((item) => `<li>${item}</li>`).join('')}</ol>
      <p class="muted"><strong>Plan note:</strong> ${recipe.planNote}</p>
    `;
    bindRecipeFavouriteButtons($('#recipeModalContent'));
    const modal = $('#recipeModal');
    if (modal && !modal.open) modal.showModal();
  }

  function renderSettings() {
    const s = state();
    $('#clientName').value = s.client.name || '';
    $('#waterTarget').value = s.settings.waterTargetMl || 2000;
  }


  function photoFile(kind) {
    const cap = kind.charAt(0).toUpperCase() + kind.slice(1);
    return $(`#photo${cap}Camera`)?.files?.[0] || $(`#photo${cap}`)?.files?.[0] || null;
  }

  function updatePhotoSelected(kind) {
    const cap = kind.charAt(0).toUpperCase() + kind.slice(1);
    const file = photoFile(kind);
    const label = $(`#photo${cap}Selected`);
    if (label) label.textContent = file ? `Selected: ${file.name || 'photo'}` : 'No photo chosen';
  }

  function resetPhotoInputs() {
    ['FrontCamera', 'SideCamera', 'BackCamera', 'Front', 'Side', 'Back'].forEach((id) => {
      const input = $(`#photo${id}`);
      if (input) input.value = '';
    });
    ['front', 'side', 'back'].forEach(updatePhotoSelected);
  }

  async function renderAll() {
    renderHome();
    renderTrack();
    renderPrograms();
    renderProgress();
    if ($('#page-photos').classList.contains('active')) await renderPhotos();
    if ($('#page-recipes').classList.contains('active')) {
      renderRecipes();
      renderMealIdeaList();
    }
    renderSettings();
  }


  function isStandaloneApp() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function updateInstallUi() {
    const canPrompt = !!deferredInstallPrompt && !isStandaloneApp();
    ['#installAppBtn', '#onboardingInstallBtn'].forEach((selector) => {
      const btn = $(selector);
      if (btn) btn.hidden = !canPrompt;
    });

    const statusText = isStandaloneApp()
      ? 'App is already installed on this device.'
      : canPrompt
        ? 'Chrome can install the app now. Tap the install button above.'
        : 'Android Chrome: use the browser menu if the install button does not appear. iPhone: open in Safari, tap Share, then Add to Home Screen.';

    ['#installStatusText', '#onboardingInstallStatus'].forEach((selector) => {
      const el = $(selector);
      if (el) el.textContent = statusText;
    });
  }

  function setText(selector, text, className = '') {
    const el = $(selector);
    if (!el) return;
    el.textContent = text;
    el.className = `save-status ${className}`.trim();
  }

  function savedTimeLabel() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  async function promptInstallApp() {
    if (isStandaloneApp()) {
      toast('The app is already installed');
      updateInstallUi();
      return;
    }
    if (!deferredInstallPrompt) {
      toast('Use Chrome menu → Install app, or iPhone Safari → Share → Add to Home Screen');
      updateInstallUi();
      return;
    }
    deferredInstallPrompt.prompt();
    try {
      await deferredInstallPrompt.userChoice;
    } catch (err) {
      console.warn('Install prompt was dismissed or failed.', err);
    }
    deferredInstallPrompt = null;
    updateInstallUi();
  }

  function bindInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
      updateInstallUi();
    });
    window.addEventListener('appinstalled', () => {
      deferredInstallPrompt = null;
      toast('Perfect Women app installed');
      updateInstallUi();
    });
    updateInstallUi();
  }

  let criticalWorkoutLaunchersBound = false;

  function bindCriticalWorkoutLaunchers() {
    if (criticalWorkoutLaunchersBound) return;
    criticalWorkoutLaunchersBound = true;
    document.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      const foundationStart = target.closest('[data-start-foundation-workout]');
      const gymStart = target.closest('#startGymWorkoutBtn');
      const homeResume = target.closest('#resumeFoundationWorkoutBtn');
      const gymResume = target.closest('#resumeGymWorkoutBtn');
      const programOpen = target.closest('#openWalkingProgramBtn, #openJoggingProgramBtn, #openHomeStrengthProgramBtn, #openGymStrengthProgramBtn');
      if (!foundationStart && !gymStart && !homeResume && !gymResume && !programOpen) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (foundationStart) {
        startFoundationWorkout(foundationStart.dataset.startFoundationWorkout || 'foundation-session');
      } else if (gymStart) {
        startGymWorkout();
      } else if (homeResume) {
        resumeFoundationWorkout('home');
      } else if (gymResume) {
        resumeFoundationWorkout('gym');
      } else if (programOpen) {
        const id = programOpen.id;
        const s = state();
        if (id === 'openWalkingProgramBtn') {
          if (!s.walkingProgram?.started) window.PWStore.startWalkingProgram({ targetWalksPerWeek: 4, targetSteps: '' });
          else window.PWStore.setActiveProgram('walking');
          toast('Walking program is now current');
          renderAndRevealProgram('walking');
        } else if (id === 'openJoggingProgramBtn') {
          if (!s.joggingProgram?.started) window.PWStore.startJoggingProgram();
          else window.PWStore.setActiveProgram('jogging');
          toast('5 km jogging program is now current');
          renderAndRevealProgram('jogging');
        } else if (id === 'openHomeStrengthProgramBtn') {
          if (!s.strengthProgram?.home?.started) window.PWStore.startStrengthProgram('home');
          else window.PWStore.setActiveProgram('homeStrength');
          toast('Foundation Home is now current');
          renderAndRevealProgram('homeStrength');
        } else if (id === 'openGymStrengthProgramBtn') {
          if (!s.strengthProgram?.gym?.started) window.PWStore.startStrengthProgram('gym');
          else window.PWStore.setActiveProgram('gymStrength');
          toast('Gym strength is now current');
          renderAndRevealProgram('gymStrength');
        }
      }
    }, true);
  }

  function bindEvents() {
    $$('[data-nav]').forEach((btn) => btn.addEventListener('click', () => navigate(btn.dataset.nav, {
      program: btn.dataset.program || '',
      scrollTo: btn.dataset.scrollTo || ''
    })));
    $('#quickSettings').addEventListener('click', () => navigate('settings'));

    const addWaterAndRefresh = (ml) => {
      window.PWStore.addWater(Number(ml));
      toast(`Added ${Number(ml).toLocaleString()} ml water`);
      renderAll();
    };

    $$('[data-add-water]').forEach((btn) => btn.addEventListener('click', () => {
      addWaterAndRefresh(btn.dataset.addWater);
    }));

    const homeWaterCard = $('#homeWaterCard');
    if (homeWaterCard) {
      homeWaterCard.addEventListener('click', () => addWaterAndRefresh(250));
      homeWaterCard.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          addWaterAndRefresh(250);
        }
      });
    }
    const nextActionBtn = $('#nextActionBtn');
    if (nextActionBtn) nextActionBtn.addEventListener('click', () => {
      const action = nextActionBtn.dataset.nextAction;
      if (action === 'water') {
        addWaterAndRefresh(250);
      } else if (action === 'nav') {
        navigate(nextActionBtn.dataset.nextPage || 'home', { scrollTo: nextActionBtn.dataset.nextScrollTo || '' });
      }
    });

    const waterRingBtn = $('#waterRing');
    if (waterRingBtn) waterRingBtn.addEventListener('click', () => addWaterAndRefresh(250));
    $('#undoWaterBtn').addEventListener('click', () => {
      window.PWStore.undoWater();
      toast('Last water entry removed');
      renderAll();
    });

    $('#homeMovementBtn').addEventListener('click', () => {
      window.PWStore.saveMovement({ done: true, duration: 20, type: 'Walk', notes: '' });
      toast('Movement ticked off');
      renderAll();
    });

    $$('[data-quick-movement]').forEach((btn) => btn.addEventListener('click', () => {
      const label = btn.dataset.quickMovement || 'Movement';
      const duration = Number(btn.dataset.duration || 20);
      const type = label === 'Workout' ? 'Home workout' : label === 'Movement' ? 'General movement' : 'Walk';
      window.PWStore.saveMovement({ done: true, duration, type, notes: label === 'Movement' ? 'General movement done' : '' });
      selectedDuration = duration;
      $('#movementType').value = type;
      $('#movementNotes').value = label === 'Movement' ? 'General movement done' : '';
      toast(`${label} saved`);
      renderAll();
    }));

    $$('#movementOptions button').forEach((btn) => btn.addEventListener('click', () => {
      selectedDuration = Number(btn.dataset.duration);
      renderTrack();
    }));
    $('#saveMovementBtn').addEventListener('click', () => {
      window.PWStore.saveMovement({
        done: true,
        duration: selectedDuration,
        type: $('#movementType').value,
        notes: $('#movementNotes').value
      });
      toast('Movement saved');
      renderAll();
    });
    $('#clearMovementBtn').addEventListener('click', () => {
      window.PWStore.clearMovement();
      $('#movementNotes').value = '';
      toast('Movement cleared');
      renderAll();
    });


    if ($('#openWalkingProgramBtn')) $('#openWalkingProgramBtn').addEventListener('click', () => {
      const s = state();
      if (!s.walkingProgram?.started) {
        window.PWStore.startWalkingProgram({ targetWalksPerWeek: 4, targetSteps: '' });
        toast('Walking program started');
      } else {
        window.PWStore.setActiveProgram('walking');
        toast('Walking program is now current');
      }
      renderAndRevealProgram('walking');
    });

    if ($('#openJoggingProgramBtn')) $('#openJoggingProgramBtn').addEventListener('click', () => {
      const s = state();
      if (!s.joggingProgram?.started) {
        window.PWStore.startJoggingProgram();
        toast('5 km jogging program started');
      } else {
        window.PWStore.setActiveProgram('jogging');
        toast('5 km jogging program is now current');
      }
      renderAndRevealProgram('jogging');
    });

    if ($('#openHomeStrengthProgramBtn')) $('#openHomeStrengthProgramBtn').addEventListener('click', () => {
      const s = state();
      if (!s.strengthProgram?.home?.started) {
        window.PWStore.startStrengthProgram('home');
        toast('Foundation Home Program started');
      } else {
        window.PWStore.setActiveProgram('homeStrength');
        toast('Foundation Home is now current');
      }
      renderAndRevealProgram('homeStrength');
    });

    if ($('#openGymStrengthProgramBtn')) $('#openGymStrengthProgramBtn').addEventListener('click', () => {
      const s = state();
      if (!s.strengthProgram?.gym?.started) {
        window.PWStore.startStrengthProgram('gym');
        toast('Gym beginner strength started');
      } else {
        window.PWStore.setActiveProgram('gymStrength');
        toast('Gym strength is now current');
      }
      renderAndRevealProgram('gymStrength');
    });

    if ($('#startHomeStrengthProgramBtn')) $('#startHomeStrengthProgramBtn').addEventListener('click', () => {
      window.PWStore.startStrengthProgram('home');
      focusedProgramKey = null;
      toast('Foundation Home Program started');
      renderAndRevealProgram('homeStrength');
    });

    if ($('#startGymStrengthProgramBtn')) $('#startGymStrengthProgramBtn').addEventListener('click', () => {
      window.PWStore.startStrengthProgram('gym');
      focusedProgramKey = null;
      toast('Gym beginner strength started');
      renderAndRevealProgram('gymStrength');
    });

    if ($('#saveHomeStrengthBtn')) $('#saveHomeStrengthBtn').addEventListener('click', () => {
      const s = state();
      window.PWStore.saveStrengthSession({
        type: 'home',
        date: window.PWStore.todayKey(),
        exercises: buildStrengthSessionExercises(s, 'home').map((ex) => ({ key: ex.key, name: ex.name, target: ex.target })),
        notes: $('#homeStrengthNotes')?.value || ''
      });
      if ($('#homeStrengthNotes')) $('#homeStrengthNotes').value = '';
      toast('Home workout saved');
      renderAll();
    });

    if ($('#saveGymStrengthBtn')) $('#saveGymStrengthBtn').addEventListener('click', () => {
      const s = state();
      window.PWStore.saveStrengthSession({
        type: 'gym',
        date: window.PWStore.todayKey(),
        exercises: buildStrengthSessionExercises(s, 'gym').map((ex) => ({ key: ex.key, name: ex.name, target: ex.target, detail: ex.detail })),
        notes: $('#gymStrengthNotes')?.value || ''
      });
      if ($('#gymStrengthNotes')) $('#gymStrengthNotes').value = '';
      toast('Gym workout saved');
      renderAll();
    });

    if ($('#startWalkingProgramBtn')) $('#startWalkingProgramBtn').addEventListener('click', () => {
      window.PWStore.startWalkingProgram({
        targetWalksPerWeek: $('#walkingTargetWalks')?.value || 4,
        targetSteps: $('#walkingStartTarget')?.value || ''
      });
      focusedProgramKey = null;
      toast('Walking program started');
      renderAll();
    });

    if ($('#saveWalkingTargetBtn')) $('#saveWalkingTargetBtn').addEventListener('click', () => {
      const s = state();
      const week = walkingWeekNumberForDate(s);
      window.PWStore.saveWalkingTarget({ week, targetSteps: $('#walkingWeekTarget')?.value || '' });
      toast('Walking target saved');
      renderAll();
    });

    if ($('#saveWalkBtn')) $('#saveWalkBtn').addEventListener('click', () => {
      const steps = Number($('#walkSteps')?.value || 0);
      if (!steps || Number.isNaN(steps)) {
        toast('Please enter the steps for this walk');
        return;
      }
      window.PWStore.saveWalkSession({
        date: $('#walkDate')?.value || window.PWStore.todayKey(),
        steps,
        notes: $('#walkNotes')?.value || ''
      });
      $('#walkSteps').value = '';
      $('#walkNotes').value = '';
      toast('Walk saved');
      renderAll();
    });


    if ($('#startJoggingProgramBtn')) $('#startJoggingProgramBtn').addEventListener('click', () => {
      window.PWStore.startJoggingProgram();
      focusedProgramKey = null;
      toast('5 km jogging program started');
      renderAll();
    });

    if ($('#saveRunBtn')) $('#saveRunBtn').addEventListener('click', () => {
      const s = state();
      const week = joggingWeekNumberForDate(s);
      const plan = joggingWeekPlan(week);
      const sessionKey = $('#runSessionType')?.value || plan.sessions[0].key;
      const session = plan.sessions.find((item) => item.key === sessionKey) || plan.sessions[0];
      const distanceKm = Number($('#runDistance')?.value || 0);
      if (!distanceKm || Number.isNaN(distanceKm)) {
        toast('Please enter the distance completed');
        return;
      }
      window.PWStore.saveRunSession({
        date: $('#runDate')?.value || window.PWStore.todayKey(),
        sessionKey: session.key,
        sessionLabel: session.label,
        targetKm: session.targetKm,
        distanceKm,
        timeMinutes: $('#runTime')?.value || '',
        rpe: $('#runRpe')?.value || '',
        notes: $('#runNotes')?.value || ''
      });
      $('#runTime').value = '';
      $('#runRpe').value = '';
      $('#runNotes').value = '';
      toast('Jogging session saved');
      renderAll();
    });

    $('#saveWeightBtn').addEventListener('click', () => {
      const kg = Number($('#weightKg').value);
      if (!kg || Number.isNaN(kg)) {
        toast('Please enter a valid weight');
        return;
      }
      window.PWStore.saveWeight({
        date: $('#weightDate').value || window.PWStore.todayKey(),
        kg,
        waistCm: $('#waistCm').value,
        notes: $('#weightNotes').value
      });
      $('#weightKg').value = '';
      $('#waistCm').value = '';
      $('#weightNotes').value = '';
      toast('Weigh-in saved');
      renderAll();
    });


    if ($('#saveMeasurementsBtn')) $('#saveMeasurementsBtn').addEventListener('click', () => {
      const waist = $('#measureWaist').value;
      const hips = $('#measureHips').value;
      const chest = $('#measureChest').value;
      const thigh = $('#measureThigh').value;
      const arm = $('#measureArm').value;
      if (!waist && !hips && !chest && !thigh && !arm) {
        toast('Add at least one measurement');
        return;
      }
      window.PWStore.saveMeasurements({
        date: $('#measurementDate').value || window.PWStore.todayKey(),
        waist, hips, chest, thigh, arm,
        notes: $('#measurementNotes').value
      });
      ['measureWaist','measureHips','measureChest','measureThigh','measureArm','measurementNotes'].forEach((id) => { const el = $('#' + id); if (el) el.value = ''; });
      toast('Measurements saved');
      renderAll();
    });

    if ($('#saveCheckinBtn')) $('#saveCheckinBtn').addEventListener('click', () => {
      const hasContent = $('#checkinMeals').value || $('#checkinWater').value || $('#checkinMovement').value || $('#checkinEnergy').value || $('#checkinStress').value || $('#checkinWin').value || $('#checkinStruggle').value || $('#checkinHelp').value;
      if (!hasContent) {
        toast('Add a few check-in details first');
        return;
      }
      window.PWStore.saveCheckin({
        date: $('#checkinDate').value || window.PWStore.todayKey(),
        meals: $('#checkinMeals').value,
        water: $('#checkinWater').value,
        movement: $('#checkinMovement').value,
        energy: $('#checkinEnergy').value,
        stress: $('#checkinStress').value,
        win: $('#checkinWin').value,
        struggle: $('#checkinStruggle').value,
        help: $('#checkinHelp').value
      });
      ['checkinMeals','checkinWater','checkinMovement','checkinEnergy','checkinStress','checkinWin','checkinStruggle','checkinHelp'].forEach((id) => { const el = $('#' + id); if (el) el.value = ''; });
      toast('Weekly check-in saved');
      renderAll();
    });

    $('#savePhotoSetBtn').addEventListener('click', async () => {
      const front = photoFile('front');
      const side = photoFile('side');
      const back = photoFile('back');
      if (!front && !side && !back) {
        toast('Choose at least one photo');
        return;
      }
      await window.PWStore.savePhotoSet({
        date: $('#photoDate').value || window.PWStore.todayKey(),
        notes: $('#photoNotes').value,
        front,
        side,
        back
      });
      resetPhotoInputs();
      $('#photoNotes').value = '';
      toast('Photo set saved locally');
      await renderAll();
    });

    ['front', 'side', 'back'].forEach((kind) => {
      const cap = kind.charAt(0).toUpperCase() + kind.slice(1);
      const cameraInput = $(`#photo${cap}Camera`);
      const uploadInput = $(`#photo${cap}`);
      if (cameraInput) cameraInput.addEventListener('change', () => {
        if (cameraInput.files && cameraInput.files[0] && uploadInput) uploadInput.value = '';
        updatePhotoSelected(kind);
      });
      if (uploadInput) uploadInput.addEventListener('change', () => {
        if (uploadInput.files && uploadInput.files[0] && cameraInput) cameraInput.value = '';
        updatePhotoSelected(kind);
      });
    });

    if ($('#compareDateA')) $('#compareDateA').addEventListener('change', async (event) => {
      compareDateAId = event.target.value;
      await renderPhotoCompare();
    });
    if ($('#compareDateB')) $('#compareDateB').addEventListener('change', async (event) => {
      compareDateBId = event.target.value;
      await renderPhotoCompare();
    });
    $$('[data-compare-angle]').forEach((btn) => btn.addEventListener('click', async () => {
      compareAngle = btn.dataset.compareAngle || 'front';
      await renderPhotoCompare();
    }));

    if ($('#spinMealBtn')) $('#spinMealBtn').addEventListener('click', spinMealWheel);
    if ($('#mealGeneratorType')) $('#mealGeneratorType').addEventListener('change', () => {
      mealIdeasVisible = false;
      resetMealGenerator();
    });
    if ($('#showAllMealIdeasBtn')) $('#showAllMealIdeasBtn').addEventListener('click', () => {
      mealIdeasVisible = !mealIdeasVisible;
      renderMealIdeaList();
    });

    $('#recipeSearch').addEventListener('input', renderRecipes);
    $('#closeRecipeModal').addEventListener('click', () => $('#recipeModal').close());

    $('#finishOnboardingBtn').addEventListener('click', () => {
      const name = ($('#onboardName').value || '').trim();
      const kg = Number($('#onboardWeight').value);
      if (!name) {
        toast('Please add your name');
        return;
      }
      if (!kg || Number.isNaN(kg)) {
        toast('Please add a valid starting weight');
        return;
      }
      window.PWStore.completeOnboarding({ name, startingWeightKg: kg });
      setOnboardingVisible(false);
      toast('Tracker set up');
      renderAll();
    });

    $('#skipOnboardingBtn').addEventListener('click', () => {
      window.PWStore.markOnboardingDone();
      setOnboardingVisible(false);
      toast('You can add details in Settings');
      renderAll();
    });

    if ($('#installAppBtn')) $('#installAppBtn').addEventListener('click', promptInstallApp);
    if ($('#onboardingInstallBtn')) $('#onboardingInstallBtn').addEventListener('click', promptInstallApp);
    $('#showOnboardingBtn').addEventListener('click', showOnboarding);

    const saveSettingsNow = (silent = false) => {
      try {
        window.PWStore.saveSettings({ name: $('#clientName').value, waterTargetMl: $('#waterTarget').value });
        setText('#settingsSaveStatus', `Saved on this device at ${savedTimeLabel()}.`, 'ok');
        if (!silent) toast('Settings saved on this device');
        renderAll();
      } catch (err) {
        console.error('Settings save failed', err);
        setText('#settingsSaveStatus', 'Could not save on this device. Open the app in Chrome/Safari and try again.', 'error');
        if (!silent) toast('Settings could not be saved');
      }
    };

    $('#saveSettingsBtn').addEventListener('click', () => saveSettingsNow(false));
    ['#clientName', '#waterTarget'].forEach((selector) => {
      const input = $(selector);
      if (!input) return;
      input.addEventListener('change', () => saveSettingsNow(true));
      input.addEventListener('blur', () => saveSettingsNow(true));
    });

    $('#exportDataBtn').addEventListener('click', async () => {
      try {
        const data = window.PWStore.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `perfect-women-tracker-${window.PWStore.todayKey()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setText('#backupStatus', 'Backup file created. Check Downloads/Files on this device.', 'ok');
        toast('Backup started');
      } catch (err) {
        console.error('Backup export failed', err);
        try {
          await navigator.clipboard.writeText(window.PWStore.exportData());
          setText('#backupStatus', 'Download was blocked, so the backup text was copied instead.', 'ok');
          toast('Backup copied');
        } catch (copyErr) {
          console.error('Backup copy failed', copyErr);
          setText('#backupStatus', 'Could not create backup on this device. Normal tracking can still work.', 'error');
          toast('Backup could not be created');
        }
      }
    });
    $('#resetDataBtn').addEventListener('click', () => {
      if (!confirm('Reset all local tracker data on this device? Photos will remain in browser storage unless deleted from the Photos page first.')) return;
      window.PWStore.resetData();
      toast('Local data reset');
      renderAll();
      navigate('home');
    });

    document.addEventListener('click', (event) => {
      const startBtn = event.target.closest('[data-start-foundation-workout]');
      if (startBtn) {
        event.preventDefault();
        startFoundationWorkout(startBtn.dataset.startFoundationWorkout || 'foundation-session');
      }
    });
    if ($('#resumeFoundationWorkoutBtn')) $('#resumeFoundationWorkoutBtn').addEventListener('click', () => resumeFoundationWorkout('home'));
    if ($('#startGymWorkoutBtn')) $('#startGymWorkoutBtn').addEventListener('click', startGymWorkout);
    if ($('#resumeGymWorkoutBtn')) $('#resumeGymWorkoutBtn').addEventListener('click', () => resumeFoundationWorkout('gym'));
    if ($('#workoutTimerToggleBtn')) $('#workoutTimerToggleBtn').addEventListener('click', toggleFoundationWorkoutTimer);
    if ($('#workoutPauseBtn')) $('#workoutPauseBtn').addEventListener('click', toggleFoundationWorkoutTimer);
    if ($('#workoutDoneBtn')) $('#workoutDoneBtn').addEventListener('click', () => advanceFoundationWorkoutStep(false));
    if ($('#workoutSkipBtn')) $('#workoutSkipBtn').addEventListener('click', () => advanceFoundationWorkoutStep(true));
    if ($('#workoutPreviousBtn')) $('#workoutPreviousBtn').addEventListener('click', previousFoundationWorkoutStep);
    if ($('#startStrengthSetBtn')) $('#startStrengthSetBtn').addEventListener('click', startStrengthSet);
    if ($('#openStrengthSetLogBtn')) $('#openStrengthSetLogBtn').addEventListener('click', openStrengthSetLog);
    if ($('#confirmStrengthSetBtn')) $('#confirmStrengthSetBtn').addEventListener('click', confirmStrengthSet);
    if ($('#skipStrengthRestBtn')) $('#skipStrengthRestBtn').addEventListener('click', () => finishStrengthRest(false));
    if ($('#nextStrengthExerciseBtn')) $('#nextStrengthExerciseBtn').addEventListener('click', nextStrengthExercise);
    if ($('#decreaseStrengthWeightBtn')) $('#decreaseStrengthWeightBtn').addEventListener('click', () => adjustStrengthWeight(-1));
    if ($('#increaseStrengthWeightBtn')) $('#increaseStrengthWeightBtn').addEventListener('click', () => adjustStrengthWeight(1));
    if ($('#strengthWeightInput')) {
      $('#strengthWeightInput').addEventListener('input', (event) => {
        if (foundationWorkoutRuntime) foundationWorkoutRuntime.currentWeightKg = Math.max(0, Number(event.target.value || 0));
      });
      $('#strengthWeightInput').addEventListener('change', () => persistFoundationWorkout(true));
    }
    if ($('#strengthRepsInput')) $('#strengthRepsInput').addEventListener('input', (event) => {
      if (foundationWorkoutRuntime && Number(event.target.value || 0) > 0) foundationWorkoutRuntime.selectedReps = Number(event.target.value);
    });
    document.addEventListener('click', (event) => {
      const repBtn = event.target.closest('[data-strength-reps]');
      if (!repBtn) return;
      selectStrengthReps(repBtn.dataset.strengthReps);
    });
    if ($('#workoutExitBtn')) $('#workoutExitBtn').addEventListener('click', () => exitFoundationWorkout(true));
    if ($('#closeWorkoutPlayerBtn')) $('#closeWorkoutPlayerBtn').addEventListener('click', () => exitFoundationWorkout(true));
    if ($('#saveCompletedWorkoutBtn')) $('#saveCompletedWorkoutBtn').addEventListener('click', saveCompletedFoundationWorkout);
    if ($('#discardCompletedWorkoutBtn')) $('#discardCompletedWorkoutBtn').addEventListener('click', () => {
      const type = foundationWorkoutRuntime?.programType === 'gym' ? 'gym' : 'home';
      window.PWStore.clearStrengthWorkoutProgress(type);
      foundationWorkoutRuntime = null;
      stopFoundationTimer();
      $('#workoutPlayerModal')?.close();
      renderAll();
    });
    if ($('#workoutPlayerModal')) $('#workoutPlayerModal').addEventListener('cancel', (event) => {
      event.preventDefault();
      exitFoundationWorkout(true);
    });

    window.addEventListener('hashchange', () => navigate(location.hash.replace('#', '') || 'home'));
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    if (!location.protocol.startsWith('http')) return;
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch((err) => console.warn('Service worker registration failed:', err));
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderStaticIcons();
    bindCriticalWorkoutLaunchers();
    try {
      bindEvents();
    } catch (err) {
      console.error('A non-workout control failed to initialise.', err);
    }
    bindInstallPrompt();
    registerServiceWorker();
    navigate(location.hash.replace('#', '') || 'home');
    maybeShowOnboarding();
  });
})();
