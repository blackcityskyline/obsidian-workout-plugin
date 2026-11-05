'use strict';

const { Plugin, ItemView, Modal, PluginSettingTab, Setting } = require('obsidian');

const VIEW_TYPE = 'workout-helper-view';

/* ==========================================================
 * DATA (language-neutral)
 * ========================================================== */

const CATEGORIES = [
  { key: 'legs', icon: '🦵' },
  { key: 'back', icon: '🧍' },
  { key: 'chest', icon: '💪' },
  { key: 'shoulders', icon: '🏋️' },
  { key: 'arms', icon: '💪' },
  { key: 'core', icon: '🎯' },
  { key: 'cardio', icon: '🔥' },
];

// video: YouTube ID (null = no embedded player, a search link is shown instead).
const EXERCISES_DATABASE = [
  { id: 1, category: 'legs', video: 'VDyPdfpOnw0' },
  { id: 2, category: 'legs', video: 'ijcrYaRuZGM' },
  { id: 3, category: 'legs', video: 'bXmYtKlyfwM' },
  { id: 4, category: 'legs', video: '-I9TNqAdEFo' },
  { id: 6, category: 'back', video: 'Fv4-fiwGGVA', tier: 5, src: 'back' },
  { id: 8, category: 'back', video: 'rDF80uDz9gk' },
  { id: 9, category: 'back', video: 'R73Q4uiFJ-Q' },
  { id: 10, category: 'chest', video: 'odsAnZIk58k', tier: 5, src: 'chest' },
  { id: 12, category: 'chest', video: 'LJhN8d7ZAPQ', tier: 3, src: 'back' },
  { id: 13, category: 'shoulders', video: 'jCA_CTIET80' },
  { id: 14, category: 'shoulders', video: 'WnI2hZJ0d9w', tier: 4, src: 'shoulders' },
  { id: 15, category: 'arms', video: 'XblwrlKQReg', tier: 5, src: 'biceps' },
  { id: 16, category: 'arms', video: 'Pd4WUV-boGA' },
  { id: 17, category: 'arms', video: 'QDzbUatc4dg', tier: 2, src: 'biceps' },
  { id: 19, category: 'arms', video: '-RAp7pVpw3s' },
  { id: 21, category: 'arms', video: 'v1K0H8A_AME', tier: 5, src: 'triceps' },
  { id: 22, category: 'core', video: 'CD78fMVLTuo' },
  { id: 24, category: 'cardio', video: null, videoQuery: 'low bounce jump rope tutorial' },
  { id: 25, category: 'cardio', video: null, videoQuery: 'resistance band ski pull down exercise' },
  { id: 26, category: 'cardio', video: null, videoQuery: 'mountain climbers exercise proper form' },
  { id: 27, category: 'cardio', video: null, videoQuery: 'resistance band pull apart exercise' },
  { id: 28, category: 'cardio', video: null, videoQuery: 'plank shoulder taps proper form' },
  { id: 29, category: 'cardio', video: null, videoQuery: 'boxer skip jump rope tutorial' },
  { id: 30, category: 'cardio', video: 'rX4UI71ySxE', videoQuery: 'reverse lunge pulse exercise form' },
  { id: 31, category: 'cardio', video: null, videoQuery: 'banded lateral walk exercise' },
  { id: 32, category: 'cardio', video: null, videoQuery: 'single arm resistance band row chair supported' },
  { id: 33, category: 'cardio', video: null, videoQuery: 'bear plank hold exercise' },
  { id: 34, category: 'cardio', video: null, videoQuery: 'high knees march in place low impact' },
  { id: 35, category: 'cardio', video: null, videoQuery: 'shadow boxing basics for beginners' },

  /* ---------- ATHLEAN-X ranked (tiers 3–5). video: null until a demo is added ---------- */
  { id: 36, category: 'back', video: null, videoQuery: 'tripod row dumbbell', tier: 3, src: 'back' },
  { id: 37, category: 'back', video: null, videoQuery: 'straight arm pushdown resistance band', tier: 3, src: 'back', band: true },
  { id: 38, category: 'back', video: null, videoQuery: 'seated resistance band row', tier: 3, src: 'back', band: true },
  { id: 39, category: 'back', video: null, videoQuery: 'single arm high cable row', tier: 4, src: 'back', band: true },
  { id: 40, category: 'back', video: null, videoQuery: 'resistance band lat pulldown', tier: 4, src: 'back', band: true },
  { id: 41, category: 'back', video: null, videoQuery: 'dead row exercise', tier: 4, src: 'back' },
  { id: 42, category: 'back', video: null, videoQuery: 'farmers carry dumbbells', tier: 3, src: 'traps', neck: true },
  { id: 43, category: 'back', video: null, videoQuery: 'plate trap raise', tier: 3, src: 'traps', neck: true },
  { id: 44, category: 'back', video: null, videoQuery: 'haney shrug', tier: 3, src: 'traps', neck: true },
  { id: 45, category: 'back', video: null, videoQuery: 'face pull with overhead extension', tier: 4, src: 'traps', band: true },
  { id: 46, category: 'back', video: null, videoQuery: 'wrap around row', tier: 4, src: 'traps' },
  { id: 47, category: 'back', video: null, videoQuery: 'dumbbell shrugs form', tier: 4, src: 'traps', neck: true },
  { id: 48, category: 'back', video: null, videoQuery: 'angled cable shrug', tier: 4, src: 'traps', band: true },
  { id: 49, category: 'shoulders', video: null, videoQuery: 'arnold press', tier: 3, src: 'shoulders' },
  { id: 50, category: 'shoulders', video: null, videoQuery: 'abduction row dumbbell', tier: 3, src: 'shoulders' },
  { id: 51, category: 'shoulders', video: null, videoQuery: 'resistance band face pull', tier: 3, src: 'shoulders', band: true },
  { id: 52, category: 'shoulders', video: null, videoQuery: 'dumbbell scoop press', tier: 4, src: 'shoulders' },
  { id: 53, category: 'shoulders', video: null, videoQuery: 'hip huggers rear delt', tier: 4, src: 'shoulders' },
  { id: 54, category: 'shoulders', video: null, videoQuery: 'dumbbell front raise', tier: 5, src: 'shoulders' },
  { id: 55, category: 'shoulders', video: null, videoQuery: 'cable lateral raise', tier: 5, src: 'shoulders', band: true },
  { id: 56, category: 'shoulders', video: null, videoQuery: 'rear delt row dumbbell', tier: 5, src: 'shoulders' },
  { id: 57, category: 'arms', video: null, videoQuery: 'spider curl', tier: 3, src: 'biceps' },
  { id: 58, category: 'arms', video: null, videoQuery: 'drag curl', tier: 3, src: 'biceps' },
  { id: 59, category: 'arms', video: null, videoQuery: 'cable flex curl lip buster curl', tier: 3, src: 'biceps', band: true },
  { id: 60, category: 'arms', video: null, videoQuery: 'waiter curl', tier: 3, src: 'biceps' },
  { id: 61, category: 'arms', video: null, videoQuery: 'incline dumbbell curl', tier: 4, src: 'biceps' },
  { id: 62, category: 'arms', video: null, videoQuery: 'barbell curl form', tier: 4, src: 'biceps' },
  { id: 63, category: 'core', video: null, videoQuery: 'single arm suitcase carry slow', tier: 3, src: 'abs' },
  { id: 64, category: 'core', video: null, videoQuery: 'side bridge twist', tier: 4, src: 'abs' },
  { id: 65, category: 'core', video: null, videoQuery: 'levitation crunch athlean-x', tier: 4, src: 'abs' },
  { id: 66, category: 'core', video: null, videoQuery: 'swiper abs exercise athlean-x', tier: 4, src: 'abs' },
  { id: 67, category: 'core', video: null, videoQuery: 'gymnast tuck abs', tier: 4, src: 'abs' },
  { id: 68, category: 'core', video: null, videoQuery: 'sliding tuck abs towel', tier: 5, src: 'abs' },
  { id: 69, category: 'chest', video: null, videoQuery: 'dumbbell incline squeeze press', tier: 3, src: 'upperchest' },
  { id: 70, category: 'chest', video: null, videoQuery: 'UCV raise upper chest', tier: 3, src: 'upperchest' },
  { id: 71, category: 'chest', video: null, videoQuery: 'underhand dumbbell bench press', tier: 4, src: 'upperchest' },
  { id: 72, category: 'chest', video: null, videoQuery: 'incline dumbbell press', tier: 5, src: 'upperchest' },
  { id: 73, category: 'chest', video: null, videoQuery: 'incline cable press', tier: 4, src: 'upperchest', band: true },
  { id: 74, category: 'chest', video: null, videoQuery: 'low to high cable crossover', tier: 4, src: 'upperchest', band: true },
  { id: 75, category: 'chest', video: null, videoQuery: 'twisting push-ups', tier: 3, src: 'chest' },
  { id: 76, category: 'chest', video: null, videoQuery: 'band chest crossover', tier: 3, src: 'chest', band: true },
  { id: 77, category: 'chest', video: null, videoQuery: 'band bench press', tier: 3, src: 'chest', band: true },
  { id: 78, category: 'arms', video: null, videoQuery: 'cobra push-ups triceps', tier: 3, src: 'triceps' },
  { id: 79, category: 'arms', video: null, videoQuery: 'reverse grip triceps pushdown band', tier: 3, src: 'triceps', band: true },
  { id: 80, category: 'arms', video: null, videoQuery: 'overhead triceps extension band', tier: 3, src: 'triceps', band: true },
  { id: 81, category: 'arms', video: null, videoQuery: 'JM press', tier: 3, src: 'triceps' },
  { id: 82, category: 'arms', video: null, videoQuery: 'triceps kickbacks', tier: 4, src: 'triceps' },
  { id: 83, category: 'arms', video: null, videoQuery: 'incline dumbbell power bomb triceps', tier: 4, src: 'triceps' },
  { id: 84, category: 'arms', video: null, videoQuery: 'rocking triceps pushdown', tier: 4, src: 'triceps', band: true },
  { id: 85, category: 'arms', video: null, videoQuery: 'close grip bench press', tier: 4, src: 'triceps' },
  { id: 86, category: 'back', video: null, videoQuery: 'weighted pull-ups', tier: 5, src: 'back', bar: true },
  { id: 87, category: 'arms', video: null, videoQuery: 'chin-ups', tier: 4, src: 'biceps', bar: true },
  { id: 88, category: 'core', video: null, videoQuery: 'hanging knee raise', tier: 3, src: 'abs', bar: true },
  { id: 89, category: 'core', video: null, videoQuery: 'hanging corkscrew', tier: 3, src: 'abs', bar: true },
  { id: 90, category: 'chest', video: null, videoQuery: 'chest dips', tier: 4, src: 'chest', bar: true },
  { id: 91, category: 'arms', video: null, videoQuery: 'weighted upright dips triceps', tier: 4, src: 'triceps', bar: true },
  { id: 92, category: 'chest', video: null, videoQuery: 'heavy one arm cable crossover', tier: 4, src: 'chest', band: true },
  { id: 93, category: 'chest', video: null, videoQuery: '30 degree incline bench press', tier: 4, src: 'chest' },
  { id: 94, category: 'back', video: null, videoQuery: 'meadows row landmine', tier: 4, src: 'back', gear: 'landmine' },
  { id: 95, category: 'back', video: null, videoQuery: 'trap bar shrugs', tier: 5, src: 'traps', gear: 'trapbar', neck: true },
  { id: 96, category: 'back', video: null, videoQuery: 'below the knee rack pull', tier: 3, src: 'traps', gear: 'rack', neck: true },
  { id: 97, category: 'back', video: null, videoQuery: 'dumbbell high pull', tier: 3, src: 'traps', neck: true, jerk: true },
];

// kind: single | superset | alt. sides: true = the timer signals a side switch.
const WORKOUT_PROGRAM = [
  {
    key: 'A',
    cls: 'wt-day-a',
    icon: '🟢',
    blocks: [
      { kind: 'single', items: [{ id: 1 }] },
      { kind: 'single', items: [{ id: 36 }] },
      { kind: 'single', items: [{ id: 10 }] },
      { kind: 'single', items: [{ id: 27 }] },
      { kind: 'superset', items: [{ id: 15 }, { id: 19 }] },
      { kind: 'superset', items: [{ id: 22 }, { id: 33 }] },
    ],
  },
  {
    key: 'B',
    cls: 'wt-day-b',
    icon: '🔵',
    blocks: [
      { kind: 'single', items: [{ id: 2 }] },
      { kind: 'single', items: [{ id: 6 }] },
      { kind: 'single', items: [{ id: 10 }] },
      { kind: 'single', items: [{ id: 14 }] },
      { kind: 'superset', items: [{ id: 16 }, { id: 19 }] },
      { kind: 'superset', items: [{ id: 9 }, { id: 22 }] },
    ],
  },
  {
    key: 'C',
    cls: 'wt-day-c',
    icon: '🟣',
    blocks: [
      { kind: 'alt', items: [{ id: 3 }, { id: 4 }] },
      { kind: 'single', items: [{ id: 36 }] },
      { kind: 'single', items: [{ id: 12 }] },
      { kind: 'single', items: [{ id: 8 }] },
      { kind: 'single', items: [{ id: 13 }] },
      { kind: 'superset', items: [{ id: 17 }, { id: 21 }] },
      { kind: 'superset', items: [{ id: 33 }, { id: 9 }] },
    ],
  },
  {
    key: 'H1',
    cls: 'wt-day-h1',
    icon: '🟠',
    cardio: true,
    timer: { work: 40, rest: 20, roundRest: 120, rounds: [4, 5] },
    blocks: [
      { kind: 'single', items: [{ id: 24 }] },
      { kind: 'single', items: [{ id: 25 }] },
      { kind: 'single', items: [{ id: 26 }] },
      { kind: 'single', items: [{ id: 27 }] },
      { kind: 'single', items: [{ id: 28 }] },
    ],
  },
  {
    key: 'H2',
    cls: 'wt-day-h2',
    icon: '🔴',
    cardio: true,
    timer: { work: 40, rest: 20, roundRest: 120, rounds: [4, 5] },
    blocks: [
      { kind: 'single', items: [{ id: 29 }] },
      { kind: 'single', items: [{ id: 30, sides: true }] },
      { kind: 'single', items: [{ id: 31, sides: true }] },
      { kind: 'single', items: [{ id: 32, sides: true }] },
      { kind: 'single', items: [{ id: 33 }] },
    ],
  },
  {
    key: 'H3',
    cls: 'wt-day-h3',
    icon: '🟡',
    cardio: true,
    timer: { work: 90, rest: 10, roundRest: 60, rounds: [3, 4] },
    blocks: [
      { kind: 'single', items: [{ id: 34 }] },
      { kind: 'single', items: [{ id: 24 }] },
      { kind: 'single', items: [{ id: 35 }] },
      { kind: 'single', items: [{ id: 27 }] },
    ],
  },
];

/* ==========================================================
 * ENGLISH TEXTS (primary language)
 * ========================================================== */

const EXERCISE_TEXT_EN = {
  "1": {
    "name": "Bulgarian split squats",
    "muscles": "Quadriceps, glutes, hamstrings.",
    "start": "Stand with your back to the sofa/bench (about 60–90 cm away). Place the toe of your rear foot on it. Hold dumbbells at your sides. Keep your torso balanced and chest open.",
    "steps": [
      "On the inhale, lower smoothly by bending the front leg. The lowering (eccentric) phase lasts a strict 3 seconds.",
      "Go down until the thigh is parallel to the floor (or until the rear knee almost touches the floor).",
      "On the exhale, drive up powerfully through the heel of the front foot and return to the start."
    ],
    "safety": "Keep a slight forward lean of the torso (10–15°) to take stress off the lower back with hyperlordosis and to emphasize the glutes. Do not let the knee cave inward.",
    "home": "Use the sofa or a chair seat as support for the rear foot. If the chair slides, push it against a wall.",
    "tips": [
      "Your front knee should track strictly in line with your second toe and not cave inward."
    ],
    "mistakes": [
      "Taking too short a step (excessive stress on the front of the knee).",
      "Shifting your weight onto the back leg.",
      "Fully locking out the working knee with a snap."
    ]
  },
  "2": {
    "name": "Romanian deadlift",
    "muscles": "Hamstrings, glutes, spinal extensors.",
    "start": "Stand upright and hold a 20 kg barbell or dumbbells with an overhand grip. Feet shoulder-width apart, knees slightly bent (\"soft\") with the angle locked.",
    "steps": [
      "Start the movement strictly by pushing the hips back, sliding the weight down along your thighs. Lowering takes 3 seconds.",
      "Lower the weight to mid-shin, feeling a strong stretch in the hamstrings. Pause for 1 second.",
      "On the exhale, squeeze the glutes, drive the hips forward and return to the start."
    ],
    "safety": "Rounding the lower or upper back is strictly forbidden. Keep the spine one rigid straight line. Do not lift the head (look forward and down).",
    "home": "Two dumbbells work instead of a barbell. Stand sideways to a mirror or film yourself on your phone to check that your back stays straight.",
    "tips": [
      "This is a hip hinge movement, not a squat. Your knees do not bend any further as you lower the weight."
    ],
    "mistakes": [
      "Rounding the upper or lower back.",
      "Squatting too deep (turning the deadlift into a squat).",
      "Letting the weight drift away from your legs."
    ]
  },
  "3": {
    "name": "Single-leg Romanian deadlift",
    "muscles": "Glutes, hamstrings, deep pelvic stabilizers.",
    "start": "Hold one dumbbell in the hand opposite to the standing leg. Stand on one leg with the other slightly lifted.",
    "steps": [
      "Lean the torso forward while extending the free leg back in one line with the torso.",
      "Lower the dumbbell to knee level / the upper shin of the standing leg.",
      "Return to the start using the glute of the standing leg."
    ],
    "safety": "A great movement for correcting pelvic asymmetry in scoliosis. Do not let the pelvis rotate sideways while bending.",
    "home": "If balance is hard, lightly touch a chair back or the wall with your free hand.",
    "tips": [
      "Make sure your hips do not rotate toward the raised leg. Both hip bones point straight down at the floor."
    ],
    "mistakes": [
      "Rotating the hips outward.",
      "Losing balance because the tempo is too fast."
    ]
  },
  "4": {
    "name": "Glute bridge",
    "muscles": "Gluteus maximus, hamstrings.",
    "start": "Lie on your back on a mat, knees bent, feet flat on the floor shoulder-width apart.",
    "steps": [
      "On the exhale, squeeze the glutes and push the hips up until knees, hips and shoulders form a straight line.",
      "Hold the top position for 2 seconds, squeezing the glutes as hard as you can.",
      "On the inhale, lower the hips under control, hovering just above the floor."
    ],
    "safety": "No axial load at all. Avoid excessive arching of the lower back when lifting the hips (the hips work, not the lumbar spine).",
    "home": "Done on the floor. To make it harder, place a dumbbell or plate on your hips and hold it with your hands.",
    "tips": [
      "Keep your chin tucked to your chest and your eyes looking straight ahead, not at the ceiling, to avoid hyperextending the lower back."
    ],
    "mistakes": [
      "Overextending the lower back at the top.",
      "Placing your feet too far from your hips (the load shifts to the hamstrings) or too close (the quads take over)."
    ]
  },
  "6": {
    "name": "Bent-over barbell row",
    "muscles": "Lats, trapezius, mid-back.",
    "start": "Hold a 20 kg barbell with an overhand grip slightly wider than shoulders. Lean the torso forward about 45°, knees slightly bent, chest open.",
    "steps": [
      "On the exhale, pull the bar to the lower abdomen / navel, driving the elbows back and up.",
      "At the end point, squeeze the shoulder blades hard and hold for 1–2 seconds.",
      "On the inhale, lower the bar slowly."
    ],
    "safety": "Keep the natural arch in the lower back. When fatigued or if the lower back hurts, reduce the torso angle or switch to a supported dumbbell row.",
    "home": "Just the 20 kg bar: no extra plates are needed at first. When tired, replace this with the dumbbell row supported on the sofa.",
    "tips": [
      "The pull comes from your elbows, not your biceps. Your forearms act merely as hooks."
    ],
    "mistakes": [
      "Using momentum (swinging the torso).",
      "Pulling the bar to your chest instead of your abdomen (this brings in the upper traps and neck)."
    ]
  },
  "8": {
    "name": "Y-T-W raises",
    "muscles": "Lower and middle trapezius, rhomboids, neck and scapular stabilizers.",
    "start": "Lie face down on a mat/sofa. Face looks straight at the floor, neck relaxed.",
    "steps": [
      "Y phase: raise the arms at 45° (thumbs up), squeeze the shoulder blades together, hold for 2 sec.",
      "T phase: spread the arms straight out to the sides, hold for 2 sec.",
      "W phase: bend the elbows to the sides, raise the forearms, squeeze the shoulder blades together as much as possible for 2 sec."
    ],
    "safety": "Completely safe with cervical osteochondrosis and scoliosis. Done without added weight.",
    "home": "A mat on the floor or a sofa works. For neck comfort, put a rolled towel under your forehead.",
    "tips": [
      "Move smoothly and without jerking, driving the motion through deliberate contraction of the mid/lower traps and rhomboids."
    ],
    "mistakes": [
      "Shrugging your shoulders toward your ears (overworking the upper traps)."
    ]
  },
  "9": {
    "name": "Bird-Dog",
    "muscles": "Deep spinal extensors, core, glutes.",
    "start": "Get on all fours (on a mat). Palms directly under the shoulders, knees under the hips. Spine neutral.",
    "steps": [
      "Simultaneously extend the right arm forward and the left leg back until they form one line with the torso.",
      "Hold the top position for 2 seconds, keeping balance and bracing the core.",
      "Return to the start and repeat with the left arm and right leg."
    ],
    "safety": "The gold standard of back rehabilitation. Eliminates rotation and arching of the lower back.",
    "home": "Only a mat is needed. If your knees hurt, put a folded towel under them.",
    "tips": [
      "Your hips should not sag or rotate. Your lower back stays completely still."
    ],
    "mistakes": [
      "Arching the lower back as you lift the leg.",
      "Lifting the leg or arm too high, above the line of your body."
    ]
  },
  "10": {
    "name": "Dumbbell bench press",
    "muscles": "Pectoralis major, front delts, triceps.",
    "start": "Lie on a bench or on the floor (floor press). Take the dumbbells and bend the elbows at 45° to the torso (do not flare the elbows to 90°).",
    "steps": [
      "On the exhale, press the dumbbells up powerfully, bringing them together over the center of the chest.",
      "On the inhale, lower the dumbbells under control over 3 seconds.",
      "Pause for 1 second at the bottom, feeling the stretch in the chest muscles."
    ],
    "safety": "45° elbows protect the shoulder joints. Do not over-arch the lower back into a powerlifter-style bridge.",
    "home": "Without a bench, press from the floor (floor press): the floor limits the range of motion and protects the shoulders. Bend the knees so the lower back stays on the floor.",
    "tips": [
      "Your elbows should not flare out to the sides at 90° (a risk to the shoulder joints)."
    ],
    "mistakes": [
      "Letting your shoulder blades come off the bench as you press."
    ]
  },
  "12": {
    "name": "Dumbbell pullover",
    "muscles": "Intercostals, serratus, lats, lower pecs.",
    "start": "Lie with your upper back across the sofa/bench. Hold one dumbbell with both hands by the upper plate above your chest, arms slightly bent.",
    "steps": [
      "On the inhale, smoothly take the dumbbell behind your head in an arc until the chest is fully stretched.",
      "Hold for 1–2 seconds at the bottom.",
      "On the exhale, use the chest and lats to bring the dumbbell back to the start."
    ],
    "safety": "Expands the rib cage and relieves compression of the thoracic spine.",
    "home": "The sofa supports the upper back. Keep the hips lower than the shoulders and do not arch the lower back when taking the dumbbell behind the head.",
    "tips": [
      "The angle at your elbows stays unchanged throughout the entire set."
    ],
    "mistakes": [
      "Bending and extending your arms at the elbows (turning it into a triceps exercise)."
    ]
  },
  "13": {
    "name": "Dumbbell shoulder press (standing or seated)",
    "muscles": "Front and side delts, triceps.",
    "start": "Sit on a straight-backed chair (to protect the lower back) or stand upright. Dumbbells at the shoulders, palms facing forward or neutral.",
    "steps": [
      "On the exhale, press the dumbbells up along an arc.",
      "On the inhale, lower the dumbbells to the shoulders slowly (3 seconds)."
    ],
    "safety": "The seated version with back support is preferable with hyperlordosis because it prevents leaning back during the press.",
    "home": "A chair with a high back gives support. Press your lower back into the backrest and do not lean back.",
    "tips": [
      "Brace your abs and squeeze your glutes so you don't arch your lower back."
    ],
    "mistakes": [
      "Flaring your elbows straight out to the sides (pathological shoulder impingement)."
    ]
  },
  "14": {
    "name": "Dumbbell lateral raises",
    "muscles": "Side delts (shoulder width).",
    "start": "Stand upright, dumbbells in front of you, elbows slightly bent.",
    "steps": [
      "On the exhale, raise the arms out to the sides up to shoulder level (no higher!). Lead with the elbows.",
      "Pause for 1 second at the top.",
      "On the inhale, lower the arms under control."
    ],
    "safety": "Do not swing the torso. Raising above shoulder level brings in the trapezius and overloads the neck with osteochondrosis: lift strictly to parallel with the floor.",
    "home": "Light dumbbells are enough. You can do it seated on a chair to remove any body swing.",
    "tips": [
      "Isolates the side delts."
    ],
    "mistakes": [
      "Swinging the weight up with momentum (cheating) and raising your hands higher than your elbows."
    ]
  },
  "15": {
    "name": "Standing dumbbell biceps curls",
    "muscles": "Biceps brachii.",
    "start": "Stand upright, dumbbells in hands, elbows pinned to your sides.",
    "steps": [
      "On the exhale, bend the arms at the elbows and raise the dumbbells to the shoulders with supination (turning the palm up).",
      "Squeeze the biceps for 1 second at the top.",
      "On the inhale, lower the weight over 3 seconds."
    ],
    "safety": "Do not swing the torso or lean back: this adds arching in the lower back. If the weight pulls you back, reduce it or do the curl seated on a chair with a backrest.",
    "home": "Any adjustable dumbbells will do. To control your torso, stand with your back against a wall.",
    "tips": [
      "Keep your elbows still and pinned to your torso."
    ],
    "mistakes": [
      "Letting your elbows drift forward or back."
    ]
  },
  "16": {
    "name": "Hammer curls",
    "muscles": "Brachialis, brachioradialis, biceps.",
    "start": "Stand upright, hold the dumbbells with a neutral grip (palms facing each other).",
    "steps": [
      "On the exhale, bend the arm at the elbow and raise the dumbbell to the shoulder without rotating the wrist.",
      "Lower under control on the inhale."
    ],
    "safety": "Keep the torso still and elbows pinned. Do not lean back: arching the lower back is undesirable with hyperlordosis.",
    "home": "You can do it seated on a straight-backed chair, which eliminates cheating with the torso.",
    "tips": [
      "Loads the brachioradialis and the brachialis."
    ],
    "mistakes": [
      "Using momentum from your hips."
    ]
  },
  "17": {
    "name": "Improvised preacher curls",
    "muscles": "Lower biceps and the biceps peak.",
    "start": "Lean over the back of a chair or the edge of the sofa, firmly fixing your triceps and elbows on the support.",
    "steps": [
      "On the exhale, curl the arms, lifting the dumbbells without lifting the elbows off the support.",
      "Peak pause of 1–2 seconds at the top."
    ],
    "safety": "Do not round the back or twist the torso. Make the whole lean from the support, not from the lower back; choose a weight that does not require helping with the torso.",
    "home": "The support is a chair back or the edge of a sofa. For comfort, put a folded towel under the elbows.",
    "tips": [
      "Completely eliminates any chance of cheating."
    ],
    "mistakes": [
      "Dropping the weight abruptly at the bottom."
    ]
  },
  "19": {
    "name": "Lying overhead triceps extension (arms back at 45°)",
    "muscles": "Long head of the triceps.",
    "start": "Lie on your back. Extend your arms with the dumbbells back behind your head at a 45° angle and lock the elbows in that position.",
    "steps": [
      "On the inhale, bend the arms only at the elbows, lowering the dumbbells behind your head.",
      "On the exhale, extend the arms back to the starting 45° angle."
    ],
    "safety": "Do not arch the lower back: press it into the floor or bench and bend your knees. Do not take the arms back farther than 45° so as not to overload the shoulders and neck.",
    "home": "Done on the floor or the sofa. Bend the knees and put your feet on a support so the lower back stays against the surface.",
    "tips": [
      "Keeps constant tension on the long head of the triceps."
    ],
    "mistakes": [
      "Returning your arms to a strictly vertical position."
    ]
  },
  "21": {
    "name": "Lying triceps extension (skull crushers)",
    "muscles": "Lateral and medial heads of the triceps.",
    "start": "Lie on your back, arms with dumbbells extended perpendicular to the floor.",
    "steps": [
      "Bend the arms at the elbows toward the ears/forehead, keeping the elbows still."
    ],
    "safety": "Lower back pressed to the floor or bench, knees bent. Lower the dumbbells slowly and under control without swinging the elbows.",
    "home": "Done on the floor or the sofa. Lower the dumbbells to the sides of your head, not exactly onto the forehead.",
    "tips": [
      "Keep your elbows locked in place and don't let them flare out."
    ],
    "mistakes": [
      "Moving through the entire shoulder joint."
    ]
  },
  "22": {
    "name": "Weighted crunches",
    "muscles": "Rectus abdominis.",
    "start": "Lie on your back, knees bent, a 10 kg weight plate pressed to the chest.",
    "steps": [
      "On the exhale, crunch the upper torso, lifting only the shoulder blades.",
      "The lower back stays firmly pressed to the floor through the whole movement."
    ],
    "safety": "Do not pull on your neck with your hands and do not tuck the chin to the chest: the abs work, not the neck. Keep the range small, just the shoulder blades off the floor.",
    "home": "Instead of a plate, take a dumbbell and press it to your chest with both hands. Do it on a mat.",
    "tips": [
      "It's a curl of the spine, not a lift of the whole straight back."
    ],
    "mistakes": [
      "Lifting your lower back off the floor."
    ]
  },
  "24": {
    "name": "Jump rope: Low Bounce",
    "muscles": "Calves, feet and ankles, cardiovascular system.",
    "start": "Stand upright with the rope behind you, handles in your hands at hip level. Elbows pinned to your sides, eyes forward, neck neutral. Feet together or slightly apart, knees soft.",
    "steps": [
      "Turn the rope with your wrists, not the whole arm: the elbows are almost still, forearms slightly out to the sides.",
      "Jump low: 1–2 cm off the floor, landing on the ball of the foot with soft knees and springy ankles.",
      "Keep a steady rhythm and breathing for all 40 seconds: torso vertical, abs slightly braced, shoulders down."
    ],
    "safety": "Jumping puts impact load on the spine, so keep jumps low and soft, on a mat or springy floor and in cushioned shoes (not on tile or concrete). Do not tilt the head back or lift the chin (neck) and do not arch the lower back with hyperlordosis. If your neck or back hurts, swap the rope for marching in place with high knees or a no-jump step-jack.",
    "home": "You need a jump rope. The length is right if the handles reach your armpits when you stand on the middle of the rope. If space is tight or you have no rope, mimic turning the rope with your wrists without one."
  },
  "25": {
    "name": "Band ski-pole pull-downs",
    "muscles": "Lats, rear delts, triceps, core muscles.",
    "start": "Anchor a long resistance band to a door handle (or a door anchor) at head height or above. Stand facing the door 1–1.5 m away and take the band ends in both hands. Feet shoulder-width apart, knees soft, a slight forward lean from the hips, back straight.",
    "steps": [
      "From the position with arms stretched forward and up, pull the band down and back toward the hips on the exhale, as if pushing off with ski poles; the shoulder blades squeeze together.",
      "At the same time, squat slightly and push the hips back, accelerating the movement. Work in a fast, explosive tempo for all 40 seconds.",
      "Return the arms forward and up under control, not letting the band snap your arms back."
    ],
    "safety": "The lean comes from the hip joints and the back stays straight: do not round the upper or lower back and do not arch backward when the arms go up. Do not shrug toward the ears or push the head forward (neck). Choose band resistance at which the torso stays still and you are not pulled forward.",
    "home": "You need a long band with handles or a loop band and a door anchor (or a sturdy door handle). The door should open away from you: then the tension presses it against the frame and it will not swing open."
  },
  "26": {
    "name": "Mountain climbers",
    "muscles": "Core and abs, front delts, hip flexors; high heart rate.",
    "start": "Get into a high plank: palms under the shoulders, arms straight, body one line from head to heels. Abs and glutes braced, pelvis slightly tucked to remove the arch in the lower back.",
    "steps": [
      "Drive one knee toward the chest without lifting the hips; immediately return the leg and drive the other.",
      "Alternate legs at a fast but controlled pace for 40 seconds, breathing steadily, shoulders over the palms.",
      "If your form falls apart (hips bounce up or sag), slow the pace down but do not stop."
    ],
    "safety": "The main risk with hyperlordosis is the lower back sagging: keep the pelvis slightly tucked and the abs braced. Do not rock the hips up and down or twist the torso. The head continues the spine, eyes on the floor between the palms. If your lower back hurts, slow down or put your palms on a chair seat.",
    "home": "You need a mat. To make it easier, place your palms on the seat of a stable chair or sofa: an incline plank is easier on the lower back and shoulders."
  },
  "27": {
    "name": "Band pull-aparts (horizontal)",
    "muscles": "Rear delts, rhomboids, middle trapezius.",
    "start": "Stand upright and hold a band (loop or tube) with an overhand grip shoulder-width apart. Arms are straight out in front at chest level, elbows slightly bent, shoulder blades down.",
    "steps": [
      "On the exhale, pull the arms apart to the sides, stretching the band to shoulder line or until it touches the chest, squeezing the shoulder blades.",
      "Hold for 1 second at the end point without shrugging toward the ears.",
      "On the inhale, return the arms forward under control (2–3 seconds). Breathe evenly: this exercise helps you recover your breath after hard movements."
    ],
    "safety": "Feet shoulder-width apart, torso still: do not arch the lower back or push the head forward. Chin slightly tucked, neck long. Good for correcting slouching and kyphosis; with cervical osteochondrosis do not tilt the head back.",
    "home": "You need a medium-resistance band. The narrower the grip, the harder it is: start with a wide one."
  },
  "28": {
    "name": "Plank shoulder taps",
    "muscles": "Core muscles (transverse abdominis and obliques), shoulders, scapular stabilizers.",
    "start": "Get into a high plank with the feet set wide (wider than shoulders). Palms under the shoulders; abs, glutes and quads braced; body in a straight line.",
    "steps": [
      "Without changing the pelvis position, lift one palm off the floor and touch the opposite shoulder with it.",
      "Put the hand back on the floor and repeat with the other hand; alternate at a slow, controlled pace.",
      "Make sure the pelvis does not rock side to side: imagine a glass of water on your lower back. Work for 40 seconds."
    ],
    "safety": "The wide foot stance reduces torso rotation, which matters in scoliosis. Do not arch the lower back: keep the abs and glutes braced. Head in line with the spine, eyes on the floor. If your wrists or lower back hurt, do it with your hands on a chair seat or from the knees.",
    "home": "Only a mat is needed. To make it easier, put your palms on a chair seat."
  },
  "29": {
    "name": "Jump rope: Boxer Skip",
    "muscles": "Calves, ankles, coordination; cardiovascular system.",
    "start": "Stand upright with the rope behind you, elbows at your sides, hands at hip level. Weight on the balls of your feet, knees soft.",
    "steps": [
      "Turn the rope with your wrists and skip over it, shifting weight from foot to foot: one foot lands on each turn, like boxing footwork.",
      "Jump low (1–2 cm) and softly, on the ball of the foot; the heels do not touch the floor.",
      "Keep a steady rhythm and breathing for all 40 seconds: torso vertical, eyes forward."
    ],
    "safety": "Land softly and do not jump high: the impact falls on one leg at a time. Use a mat or springy surface and cushioned shoes. Torso vertical, lower back not arched, head not tilted back. If your back or neck hurts, replace it with stepping in place or light boxer footwork without jumping.",
    "home": "You need a jump rope. If the step is hard to get, first just shift your weight from foot to foot without a rope, then add turning the rope with the wrists."
  },
  "30": {
    "name": "Reverse lunges with pulse",
    "muscles": "Glutes, quadriceps, hamstrings.",
    "start": "Stand upright, feet hip-width apart, hands on hips (later you can hold light dumbbells at your sides). Torso vertical, chest open.",
    "steps": [
      "Step one leg back and lower: the front thigh nearly parallel to the floor, the rear knee near the floor, the torso leaning slightly forward (10–15°).",
      "At the bottom, do 2–3 small pulses of 5–10 cm, staying in the lower part of the range.",
      "Push up through the heel of the front foot and return to the start. Work 20 seconds on each leg without a break between them (40 seconds total)."
    ],
    "safety": "A reverse lunge is easier on the knees and spine than a forward lunge. A slight torso lean (10–15°) takes stress off the lower back with hyperlordosis. The front knee does not cave in or travel far past the toes. Do not arch the lower back at the bottom.",
    "home": "Only a mat is needed. If balance is hard, hold the back of a chair with your free hand."
  },
  "31": {
    "name": "Lateral band walks",
    "muscles": "Gluteus medius, hip abductors.",
    "start": "Put a mini loop band above the knees (later, above the ankles for more load). Stand in a light half squat: feet shoulder-width apart, knees slightly bent, torso leaning forward 10–15°, hands in front of the chest.",
    "steps": [
      "Take a step to the side, spreading the legs and not letting the band pull the knees inward.",
      "Bring the other foot in so the distance between the feet stays about shoulder-width and the band is always taut.",
      "Walk 20 seconds in one direction, then 20 seconds in the other (40 seconds total), without standing up."
    ],
    "safety": "Keep the pelvis level and do not sway the torso side to side: this matters in scoliosis so that the glutes, not the lower back, take the load. Knees point the same way as the toes and do not cave in. Back straight.",
    "home": "You need a mini loop band (a fabric one does not slide on your thighs). If the room is tight, step back and forth 3–4 steps."
  },
  "32": {
    "name": "One-arm band row with chair support",
    "muscles": "Lats, rhomboids, rear delts, biceps.",
    "start": "Put a stable chair against a wall. Rest your left hand and left knee on the seat (torso parallel to the floor, back flat). Your right foot stands on the middle of the band to pin it; the right hand holds the band end.",
    "steps": [
      "On the exhale, pull the band in an arc toward the hip (the \"pocket\"), keeping the elbow close to the body.",
      "At the top, squeeze the shoulder blade toward the spine and hold for 1 second.",
      "On the inhale, return the arm down under control (2–3 seconds). Work 20 seconds on each arm (40 seconds total)."
    ],
    "safety": "Three points of support fully unload the lower back, as in the dumbbell row supported on the sofa. Do not twist the torso or yank; back flat, neck continues the spine, eyes on the floor.",
    "home": "Any stable chair pushed against a wall will do. Pick a band so the last reps take effort while your form does not break down."
  },
  "33": {
    "name": "Bear plank",
    "muscles": "Quadriceps, core muscles, shoulders.",
    "start": "Get on all fours on a mat: palms under the shoulders, knees under the hips, feet on the toes. Back flat, neck continues the spine, eyes on the floor.",
    "steps": [
      "On the exhale, brace the abs and quads and lift the knees 2–3 cm off the floor; the back stays parallel to the floor.",
      "Hold the position for 40 seconds, breathing evenly without holding your breath; hips no higher than the shoulders.",
      "To make it harder, add micro-steps: alternately lift and place the palms or feet by 1–2 cm without rocking the pelvis."
    ],
    "safety": "With hyperlordosis make sure the lower back does not arch: slightly tuck the pelvis and keep the abs braced. Do not raise the hips above shoulder line or let them sag. If your lower back hurts or your form falls apart, lower the knees to the floor, rest, then continue. Do not tilt the head back.",
    "home": "You need a mat. To make it harder, hold longer or add micro-steps."
  },
  "34": {
    "name": "High-knee march in place",
    "muscles": "Hip flexors, quadriceps, glutes, cardiovascular system.",
    "start": "Stand upright, feet hip-width apart, arms bent at the elbows by your sides. Torso vertical, neck neutral, eyes forward.",
    "steps": [
      "March in place, raising the knee to hip level; the arms swing opposite the legs, as in walking.",
      "Land on the ball of the foot softly, without slapping. The pace is one where you can still speak in short phrases.",
      "Keep the abs slightly braced, breathe evenly, shoulders down."
    ],
    "safety": "No jumping, so impact on the spine is minimal: this exercise can replace the jump rope when your neck or back hurts. Do not lean back as you raise the knee and do not arch the lower back with hyperlordosis. Head level, chin not lifted.",
    "home": "You only need a free spot on the floor. If balance wobbles, put a chair nearby and hold the backrest."
  },
  "35": {
    "name": "Shadow boxing",
    "muscles": "Shoulders, triceps, core muscles, legs; cardiovascular system.",
    "start": "Stand in a light stance: feet slightly wider than shoulders, one foot slightly forward, knees soft, fists by the chin, elbows tucked to the body.",
    "steps": [
      "Alternate straight punches (jab and cross), turning the hip and foot with each punch. The rotation comes from the hips and feet, not the lower back.",
      "Add light slips and move 1–2 steps, staying on the balls of the feet.",
      "Work at a moderate pace for all 90 seconds, breathing evenly: exhale on every punch."
    ],
    "safety": "Do not lock out the elbow at the end of the punch: the arm stays \"soft\". Do not twist the lower back (scoliosis) and do not lean back. Chin slightly lowered, neck neutral.",
    "home": "You need about 2 × 2 m of free space. Start with no weights in your hands."
  },
  "36": {
    "name": "Tripod row",
    "muscles": "Lats, rhomboids, rear delts, biceps.",
    "start": "Stand beside the sofa or a sturdy chair with your feet on the floor in a split stance (one foot slightly ahead). Rest one hand on the seat/edge for support and hinge forward until your torso is almost parallel to the floor, back flat. The other hand holds a dumbbell hanging straight down.",
    "steps": [
      "On the exhale, row the dumbbell in an arc toward the hip (the \"pocket\"), keeping the elbow close to the body and the torso still.",
      "At the top, squeeze the shoulder blade toward the spine and hold for 1–2 seconds.",
      "On the inhale, lower the dumbbell slowly (3 seconds) until the lat is fully stretched."
    ],
    "safety": "Both feet on the floor plus the supporting hand give three points of contact, which unloads the lower back. Keep the spine neutral: no twisting of the torso and no jerking. The neck continues the spine, eyes on the floor.",
    "home": "Use the edge of the sofa or the seat of a stable chair pushed against a wall as the support. Do the same number of sets on both sides.",
    "tips": [
      "Keep your torso static; do not rotate your shoulders."
    ],
    "mistakes": [
      "Flaring the elbow out to the side instead of driving it toward the hip.",
      "Twisting your torso as you lift a heavy weight."
    ]
  },
  "37": {
    "name": "Straight-arm pushdowns (band)",
    "muscles": "Back (lats and mid-back)",
    "start": "Anchor a resistance band or loop band at a high point (door anchor, pull-up bar). Grab the ends of the band and step back. Lean your torso forward 20–30° with your knees slightly bent. Your arms are extended up and forward, with a minimal bend in the elbows.",
    "steps": [
      "Exhale and, without bending your arms at the elbows, pull the band down in an arc toward your thighs.",
      "At the bottom, squeeze your shoulder blades together as hard as you can and contract your lats.",
      "Inhale and return your arms to the starting position under control."
    ],
    "tips": [
      "Your arms work as rigid levers; there is no bending or extending at the elbow joint."
    ],
    "mistakes": [
      "Bending your arms and turning the exercise into a triceps pushdown."
    ]
  },
  "38": {
    "name": "Seated row (band)",
    "muscles": "Back (lats and mid-back)",
    "start": "Sit on the floor with your legs extended (or slightly bent). Loop the band around your feet and grab its ends. Keep your back upright, chest forward, and shoulders down.",
    "steps": [
      "Exhale and pull the band toward your lower abdomen.",
      "Keep your elbows as close to your torso as possible, focusing on squeezing your shoulder blades together.",
      "Hold the point of peak contraction for 1 second.",
      "Inhale and return smoothly to the starting position."
    ],
    "tips": [
      "Keep good posture and do not lean back excessively as you pull."
    ],
    "mistakes": [
      "Shrugging your shoulders toward your ears.",
      "Rounding your upper back."
    ]
  },
  "39": {
    "name": "1-arm high row (band)",
    "muscles": "Back (lats and mid-back)",
    "start": "Anchor the band overhead. Kneel on one knee (the arm on the same side as the kneeling leg is up) or sit. Extend your arm overhead, holding the band under tension.",
    "steps": [
      "Exhale and pull your elbow straight down to your side.",
      "At the bottom, squeeze your lat and hold the position.",
      "Inhale and return up under control, letting your lat stretch."
    ],
    "tips": [
      "Focus on the movement of your elbow, not your hand."
    ],
    "mistakes": [
      "Leaning your torso toward the working arm."
    ]
  },
  "40": {
    "name": "Lat pulldowns (band)",
    "muscles": "Back (lats and mid-back)",
    "start": "The band is anchored high above your head. Kneel or sit on a chair. Hold the band with a wide grip. Keep your chest up and shoulder blades depressed.",
    "steps": [
      "Exhale and pull the band to your upper chest.",
      "Drive your elbows down and slightly back.",
      "Squeeze your shoulder blades together at the bottom.",
      "Inhale and slowly let the resistance pull your arms back up."
    ],
    "tips": [
      "Do not pull the band behind your head; the pull goes strictly to your chest."
    ],
    "mistakes": [
      "Leaning your torso back more than 20°."
    ]
  },
  "41": {
    "name": "Dead rows",
    "muscles": "Back (lats and mid-back)",
    "start": "The barbell or dumbbells rest on the floor. Set your feet shoulder-width apart. Lower into a deep hinge with a straight back (like the bottom position of a deadlift).",
    "steps": [
      "Every rep starts from a dead stop (the weight rests on the floor).",
      "Exhale and pull the weight toward your waist with an explosive but controlled movement.",
      "Lock in your shoulder blades, then lower the weight back to the floor.",
      "Pause on the floor before the next rep."
    ],
    "tips": [
      "Removes constant tension from the lower back between reps and builds explosive strength."
    ],
    "mistakes": [
      "Yanking the weight off the floor with a rounded back."
    ]
  },
  "42": {
    "name": "Farmer's carries",
    "muscles": "Trapezius",
    "start": "Stand between two heavy dumbbells or kettlebells. Squat down with proper form and a straight back and grab the weights. Stand up tall: chest up, shoulders pulled back and down, abs rock solid.",
    "steps": [
      "Start moving forward with short, controlled steps.",
      "Keep your torso perfectly upright and do not sway from side to side."
    ],
    "tips": [
      "Builds grip, core, and upper trap strength."
    ],
    "mistakes": [
      "Rounding the shoulders and bending the back."
    ]
  },
  "43": {
    "name": "Plate trap raises",
    "muscles": "Trapezius",
    "start": "Stand tall, holding a heavy plate in both hands in front of you by its edges.",
    "steps": [
      "Exhale and raise your shoulders straight up, trying to touch your ears with them.",
      "Pause at the top for 1–2 seconds.",
      "Inhale and lower your shoulders. Your arms do not bend at the elbows."
    ],
    "tips": [
      "The movement goes strictly straight up and down."
    ],
    "mistakes": [
      "Bending your arms at the elbows (bringing in the biceps)."
    ]
  },
  "44": {
    "name": "Haney shrugs",
    "muscles": "Trapezius",
    "start": "Stand tall, holding a barbell behind your back at glute level with an overhand grip.",
    "steps": [
      "Exhale and raise your shoulders up and slightly back, bending your elbows slightly at the same time so the bar slides along your glutes and lower back.",
      "Hold at the peak.",
      "Inhale and return to the starting position."
    ],
    "tips": [
      "Isolates the rear portion of the traps."
    ],
    "mistakes": [
      "Using too much weight, which keeps you from lifting your shoulders."
    ]
  },
  "45": {
    "name": "Face pulls with overhead extension (band)",
    "muscles": "Trapezius",
    "start": "Set the band at face level. Hold the ends with a neutral or overhand grip.",
    "steps": [
      "Pull the band toward your nose/forehead, flaring your elbows out to the sides (Face Pull).",
      "From that position, without lowering your elbows, raise your hands overhead (external rotation and press).",
      "Slowly return to the starting position."
    ],
    "tips": [
      "Excellent for strengthening the rotator cuff and upper back."
    ],
    "mistakes": [
      "Arching the lower back as you raise your arms."
    ]
  },
  "46": {
    "name": "Wrap-around rows",
    "muscles": "Trapezius",
    "start": "The band is anchored to the side at waist or chest height. Stand sideways to the anchor point and grab the band with the hand farthest from it.",
    "steps": [
      "Exhale and pull the band, wrapping your arm around your torso toward the opposite side.",
      "This creates a deep peak contraction in the lat.",
      "Return to the starting position, controlling the tension."
    ],
    "tips": [
      "The range of motion goes past the midline of your body."
    ],
    "mistakes": [
      "Rotating the hips excessively."
    ]
  },
  "47": {
    "name": "Dumbbell/barbell shrugs",
    "muscles": "Trapezius",
    "start": "Stand tall with the barbell in front of you or dumbbells at your sides. Keep your back straight and eyes forward.",
    "steps": [
      "Exhale and deliberately raise your shoulders straight up.",
      "Hold the tension in your traps for 1–2 seconds.",
      "Lower the weight slowly."
    ],
    "tips": [
      "No rotating movements at the shoulder joints (this injures the rotator cuff)."
    ],
    "mistakes": [
      "Rolling your shoulders in circles."
    ]
  },
  "48": {
    "name": "Angled shrugs (band)",
    "muscles": "Trapezius",
    "start": "Anchor the band low in front of you. Grab the ends with your arms extended forward and up at about 45°.",
    "steps": [
      "Pull your shoulder blades and shoulders back and up along the diagonal line of the band's resistance.",
      "Return to the starting position."
    ],
    "tips": [
      "Targets the mid traps."
    ],
    "mistakes": [
      "Bending your arms at the elbows."
    ]
  },
  "49": {
    "name": "Arnold press",
    "muscles": "Front delts",
    "start": "Sit with the dumbbells in front of your chest, palms facing you.",
    "steps": [
      "As you begin pressing up, rotate your forearms outward.",
      "At the top, your palms face forward.",
      "As you lower, reverse the rotation."
    ],
    "tips": [
      "Works the front and side delts."
    ],
    "mistakes": [
      "Rotating too fast right at the start of the movement."
    ]
  },
  "50": {
    "name": "Abduction rows",
    "muscles": "Side delts",
    "start": "Hinge forward to a 45° torso angle. Let the dumbbells hang in your hands.",
    "steps": [
      "Pull the dumbbells up, flaring your elbows wide out to the sides at a 90° angle to your torso."
    ],
    "tips": [
      "Emphasizes the rear delts and rhomboids."
    ],
    "mistakes": [
      "Pinning your elbows to your body."
    ]
  },
  "51": {
    "name": "Face pulls (band)",
    "muscles": "Rear delts",
    "start": "Anchor the band at chest or eye level.",
    "steps": [
      "Pull the band toward your eyes/forehead, actively flaring your elbows out to the sides and rotating your hands back."
    ],
    "tips": [
      "Keeps your shoulder joints healthy and works the rear delts."
    ],
    "mistakes": [
      "Pulling to your stomach or chin."
    ]
  },
  "52": {
    "name": "Dumbbell scoop press",
    "muscles": "Front delts",
    "start": "Hold the dumbbells in front of you with a neutral grip.",
    "steps": [
      "Press the dumbbells up and slightly forward in an arc, as if you were \"scooping\" air with your elbows."
    ],
    "tips": [
      "Keeps the front delt constantly active with no loss of tension."
    ],
    "mistakes": [
      "Drifting the dumbbells far back behind your head."
    ]
  },
  "53": {
    "name": "Hip huggers",
    "muscles": "Rear delts",
    "start": "Stand upright holding heavy dumbbells.",
    "steps": [
      "Pull the dumbbells back along the line of your hips, driving your elbows as far back as possible."
    ],
    "tips": [
      "Works the rear delts from a standing position."
    ],
    "mistakes": [
      "Bending your torso forward."
    ]
  },
  "54": {
    "name": "Dumbbell front raises",
    "muscles": "Front delts",
    "start": "Stand with the dumbbells resting against the front of your thighs.",
    "steps": [
      "Raise the dumbbell in front of you to eye/shoulder level.",
      "Lower it smoothly. Alternate arms or raise both together."
    ],
    "tips": [
      "Isolates the front delt."
    ],
    "mistakes": [
      "Leaning your torso back as you lift."
    ]
  },
  "55": {
    "name": "Band lateral raises (cable-style)",
    "muscles": "Side delts",
    "start": "Step on the band with the opposite foot. Grab the end of the resistance band.",
    "steps": [
      "Raise your arm out to the side. The band provides maximum resistance at the peak of the movement."
    ],
    "tips": [
      "Lets you maintain constant tension."
    ],
    "mistakes": [
      "Shrugging your shoulder (traps) up."
    ]
  },
  "56": {
    "name": "Rear delt rows",
    "muscles": "Rear delts",
    "start": "Hinge forward fully until your torso is parallel to the floor.",
    "steps": [
      "Raise the dumbbells out to the sides, leading with your pinkies and driving the movement with your rear delts."
    ],
    "tips": [
      "Don't squeeze your shoulder blades together too hard, so the tension doesn't shift to your back."
    ],
    "mistakes": [
      "Lifting your torso up out of the hinge."
    ]
  },
  "57": {
    "name": "Spider curls",
    "muscles": "Biceps",
    "start": "Lie chest-down on an incline bench (45°). Let your arms hang straight down vertically, holding a barbell or dumbbells.",
    "steps": [
      "Bend your elbows to curl the weight, without letting your upper arm move out of the vertical position."
    ],
    "tips": [
      "Peak biceps contraction at the top."
    ],
    "mistakes": [
      "Letting your elbows drift back toward the bench."
    ]
  },
  "58": {
    "name": "Drag curls",
    "muscles": "Biceps",
    "start": "Stand holding a barbell or dumbbells.",
    "steps": [
      "Curl the weight, sliding it straight up along your torso (touching your stomach and chest) and driving your elbows back."
    ],
    "tips": [
      "Takes tension off the front delt and isolates the biceps."
    ],
    "mistakes": [
      "Letting the weight travel forward away from your body."
    ]
  },
  "59": {
    "name": "Flex curls / lip buster curls (band)",
    "muscles": "Biceps",
    "start": "Anchor the band at eye level.",
    "steps": [
      "Keeping your elbows up and parallel to the floor, curl your hands toward your lips/forehead."
    ],
    "tips": [
      "Highly isolates the biceps."
    ],
    "mistakes": [
      "Dropping your elbows."
    ]
  },
  "60": {
    "name": "Waiter curls",
    "muscles": "Biceps",
    "start": "Hold one dumbbell vertically with both palms cupped under the top plate (like a tray).",
    "steps": [
      "Curl the dumbbell up to your chin, keeping your palms parallel to the ceiling."
    ],
    "tips": [
      "Loads the long head of the biceps."
    ],
    "mistakes": [
      "Clamping the dumbbell with your fingers."
    ]
  },
  "61": {
    "name": "Incline dumbbell curls",
    "muscles": "Biceps",
    "start": "Sit on a bench set to 45° and let your arms hang down freely, holding the dumbbells.",
    "steps": [
      "From the stretched position, curl your arms, supinating as you go."
    ],
    "tips": [
      "Maximally stretches the long head of the biceps at the bottom."
    ],
    "mistakes": [
      "Lifting your shoulders off the bench."
    ]
  },
  "62": {
    "name": "Barbell curls",
    "muscles": "Biceps",
    "start": "Stand with an underhand grip, shoulder-width apart.",
    "steps": [
      "Curl the bar to the level of your upper chest, then lower it under control."
    ],
    "tips": [
      "The classic foundational exercise for building biceps mass."
    ],
    "mistakes": [
      "Swinging your torso (cheating)."
    ]
  },
  "63": {
    "name": "Single-sided slow carry (suitcase carry)",
    "muscles": "Obliques, deep core, grip",
    "start": "Pick up a heavy dumbbell/kettlebell in one hand.",
    "steps": [
      "Walk slowly in a straight line, resisting the lean of your torso toward the weight."
    ],
    "tips": [
      "Powerful work for the obliques as stabilizers."
    ],
    "mistakes": [
      "Letting your shoulder girdle tilt."
    ]
  },
  "64": {
    "name": "Side bridge twist",
    "muscles": "Obliques",
    "start": "Set up in a side plank on your forearm.",
    "steps": [
      "Thread your top arm under your torso, rotating your chest toward the floor, then return."
    ],
    "tips": [
      "Keep your pelvis stable during the rotation."
    ],
    "mistakes": [
      "Letting your hips sag down."
    ]
  },
  "65": {
    "name": "Levitation crunch",
    "muscles": "Abs (rectus abdominis)",
    "start": "Lie on your back with your arms extended overhead and your legs raised slightly.",
    "steps": [
      "Lift your shoulder blades and legs at the same time, keeping your core as tightly braced as possible."
    ],
    "tips": [
      "Keep your lower back pressed firmly into the floor."
    ],
    "mistakes": [
      "Arching your lower back (dangerous for the spine)."
    ]
  },
  "66": {
    "name": "Swiper",
    "muscles": "Abs and obliques",
    "start": "Lie on your back with your knees bent and your shoulder blades lifted.",
    "steps": [
      "Alternate reaching your right hand to your right heel, then your left hand to your left heel, along the sides."
    ],
    "tips": [
      "Continuous tension on the rectus abdominis and obliques."
    ],
    "mistakes": [
      "Resting your neck on the floor between reps."
    ]
  },
  "67": {
    "name": "Gymnast tuck",
    "muscles": "Lower abs, hip flexors",
    "start": "Support yourself on parallettes, dip bars or the floor with your arms straight.",
    "steps": [
      "Pull your knees up to your chest and hold that position (or perform it dynamically)."
    ],
    "tips": [
      "Strong static-dynamic loading of the abs."
    ],
    "mistakes": [
      "Swinging."
    ]
  },
  "68": {
    "name": "Sliding tuck (towel on the floor)",
    "muscles": "Lower abs, hip flexors",
    "start": "Get into a push-up position with your feet on a towel/sliders on a smooth floor.",
    "steps": [
      "Without hopping, pull your feet toward your hands by curling your abs and sliding."
    ],
    "tips": [
      "A controlled movement with no momentum."
    ],
    "mistakes": [
      "Arching your lower back in the plank position."
    ]
  },
  "69": {
    "name": "Incline dumbbell squeeze press",
    "muscles": "Chest (upper chest)",
    "start": "Set an incline bench (30–45°). Hold the dumbbells in front of your chest so they are pressed tightly against each other.",
    "steps": [
      "Squeeze the dumbbells into each other with maximum force the whole time.",
      "Exhale and press them up without breaking contact.",
      "Inhale and lower them back down."
    ],
    "tips": [
      "Creates massive isometric tension in the inner chest."
    ],
    "mistakes": [
      "Letting up on the pressure between the dumbbells."
    ]
  },
  "70": {
    "name": "UCV raise",
    "muscles": "Chest (upper chest)",
    "start": "Stand tall with a dumbbell in one hand at your hip, palm facing up.",
    "steps": [
      "Exhale and raise your arm from low to high, across your body on a diagonal, to the level of the opposite shoulder.",
      "Squeeze your upper chest. Lower back to the starting position."
    ],
    "tips": [
      "The movement is driven by bringing your arm toward the midline."
    ],
    "mistakes": [
      "Doing the work by curling with your biceps."
    ]
  },
  "71": {
    "name": "Underhand dumbbell bench press",
    "muscles": "Chest (upper chest)",
    "start": "Lie on a flat bench and hold the dumbbells with your palms facing you (supinated grip).",
    "steps": [
      "Press the dumbbells up, keeping your elbows closer to your torso.",
      "Lower them until they lightly touch your thighs/chest."
    ],
    "tips": [
      "Increases upper chest activation even on a flat bench."
    ],
    "mistakes": [
      "Dumbbells slipping out because of the unfamiliar grip (use a moderate weight)."
    ]
  },
  "72": {
    "name": "Incline dumbbell press",
    "muscles": "Chest (upper chest)",
    "start": "Set the bench to an angle of 30–45°. Lie back, squeeze your shoulder blades together, and plant your feet on the floor. Hold the dumbbells at your upper chest.",
    "steps": [
      "Exhale and press the dumbbells straight up.",
      "Inhale and lower them under control until you feel a stretch in your upper chest."
    ],
    "tips": [
      "Emphasis is on the upper (clavicular) portion of the pecs."
    ],
    "mistakes": [
      "Setting the bench angle too high (above 45° the load shifts to the delts)."
    ]
  },
  "73": {
    "name": "Incline press (band, cable-style)",
    "muscles": "Chest (upper chest)",
    "start": "Anchor the band behind you, low. Take a staggered stance or sit.",
    "steps": [
      "Perform pressing movements with your arms forward and slightly upward.",
      "At the end point, bring your hands together for maximum peak contraction."
    ],
    "tips": [
      "The resistance increases as your arms straighten."
    ],
    "mistakes": [
      "Losing tension in the band at the bottom."
    ]
  },
  "74": {
    "name": "Low-to-high crossover (band)",
    "muscles": "Chest (upper chest)",
    "start": "The bands are anchored low behind you. Stand in the center with your arms down at your sides and pulled back.",
    "steps": [
      "Exhale and bring your arms together in front of you in an arc from low to high, up to chin level.",
      "Squeeze your pecs at the top."
    ],
    "tips": [
      "Isolates the upper chest."
    ],
    "mistakes": [
      "Bending your arms at the elbows."
    ]
  },
  "75": {
    "name": "Twisting push-ups",
    "muscles": "Chest, triceps, core",
    "start": "Get into a push-up position.",
    "steps": [
      "Lower into a push-up. As you press back up, twist your hips and torso, driving one knee toward the opposite elbow."
    ],
    "tips": [
      "Combines pec and core work."
    ],
    "mistakes": [
      "Letting your hips sag."
    ]
  },
  "76": {
    "name": "Chest crossover (band)",
    "muscles": "Chest",
    "start": "The bands are anchored at shoulder height. Your arms are spread out to the sides and slightly bent.",
    "steps": [
      "Bring your arms together in front of your chest in an arc, crossing your hands at the end point to increase the contraction."
    ],
    "tips": [
      "Keep the elbow bend angle constant."
    ],
    "mistakes": [
      "Turning the fly into a press."
    ]
  },
  "77": {
    "name": "Bench press (band)",
    "muscles": "Chest, triceps, front delts",
    "start": "Run the band across your upper back and hold its ends in your palms, with or without dumbbells. Lie on a bench or on the floor.",
    "steps": [
      "Perform a classic press. The band adds resistance in the top portion of the movement."
    ],
    "tips": [
      "Lets you keep working the pecs in the fully contracted phase."
    ],
    "mistakes": [
      "Letting the band slide up onto your neck."
    ]
  },
  "78": {
    "name": "Cobra push-ups",
    "muscles": "Triceps (long head)",
    "start": "Lie face-down and place your hands under your chest, close to your body.",
    "steps": [
      "Press your upper body up by straightening your elbows, keeping your hips on the floor."
    ],
    "tips": [
      "Isolated bodyweight triceps work."
    ],
    "mistakes": [
      "Using your lower back muscles."
    ]
  },
  "79": {
    "name": "Reverse-grip pushdowns (band)",
    "muscles": "Triceps (long head)",
    "start": "Anchor the band up high. Use an underhand grip (palms facing up).",
    "steps": [
      "Extend your arms down until your elbows are fully locked out."
    ],
    "tips": [
      "Emphasizes the medial head of the triceps."
    ],
    "mistakes": [
      "Letting your elbows come away from your torso."
    ]
  },
  "80": {
    "name": "Overhead extensions (band)",
    "muscles": "Triceps (long head)",
    "start": "Stand with your back to the band's anchor point (low or behind you). Hold your hands bent behind your head.",
    "steps": [
      "Extend your arms overhead, forward and up."
    ],
    "tips": [
      "Deep stretch on the triceps."
    ],
    "mistakes": [
      "Flaring your elbows out to the sides."
    ]
  },
  "81": {
    "name": "JM press",
    "muscles": "Triceps",
    "start": "Lie on a bench with the bar over your chest.",
    "steps": [
      "Lower the bar on a diagonal path straight toward your neck/upper chest, tucking your elbows forward and down. From that position, press up."
    ],
    "tips": [
      "A hybrid of the close-grip bench press and the skull crusher."
    ],
    "mistakes": [
      "Overextending your wrists."
    ]
  },
  "82": {
    "name": "Triceps kickbacks",
    "muscles": "Triceps",
    "start": "Hinge over with your torso parallel to the floor. Pin your elbow to your side and keep it raised.",
    "steps": [
      "Exhale and extend your arm back until it forms a fully straight line."
    ],
    "tips": [
      "Your elbow doesn't drop during the movement."
    ],
    "mistakes": [
      "Swinging the weight instead of extending under control."
    ]
  },
  "83": {
    "name": "Incline dumbbell power bombs",
    "muscles": "Triceps (long head)",
    "start": "Sit on a bench set to 75° and hold a dumbbell with both hands behind your head.",
    "steps": [
      "Extend your arms up overhead."
    ],
    "tips": [
      "The bench back prevents excess arching in your lower back."
    ],
    "mistakes": [
      "Letting the dumbbell touch your neck."
    ]
  },
  "84": {
    "name": "Rocking pushdowns (band)",
    "muscles": "Triceps",
    "start": "Stand facing the band anchored high, like a cable stack.",
    "steps": [
      "As you extend your arms, lean your torso slightly forward, and on the return, shift your hips back, intensifying the tension at the peak."
    ],
    "tips": [
      "A dynamic adjustment of the biomechanics."
    ],
    "mistakes": [
      "Overly chaotic movements."
    ]
  },
  "85": {
    "name": "Close-grip bench press",
    "muscles": "Triceps, chest",
    "start": "Lie on a bench. Take a shoulder-width grip (or a 20–30 cm gap between your hands).",
    "steps": [
      "Lower the bar to your lower chest, keeping your elbows as close to your torso as possible. Press up."
    ],
    "tips": [
      "A powerful foundational exercise for all three heads of the triceps."
    ],
    "mistakes": [
      "Gripping too narrow (causes wrist pain)."
    ]
  },
  "86": {
    "name": "Weighted pull-ups",
    "muscles": "Lats, biceps, mid-back",
    "start": "Attach a weight (plate or kettlebell) to a dip belt. Grab the pull-up bar with an overhand grip slightly wider than shoulder-width. Hang with straight arms and your core braced.",
    "steps": [
      "Exhale and start the movement by depressing your shoulder blades, then pull yourself up using your back.",
      "Pull until your chin is above the bar and your chest approaches it.",
      "Inhale and lower yourself under control until you reach a full hang with your back fully stretched."
    ],
    "tips": [
      "Avoid jerking and kicking your legs (kipping)."
    ],
    "mistakes": [
      "Incomplete range of motion at the bottom or at the top."
    ]
  },
  "87": {
    "name": "Chin-ups",
    "muscles": "Biceps, lats",
    "start": "Hang from the bar with an underhand grip (palms facing you), shoulder-width apart.",
    "steps": [
      "Pull yourself up, focusing on bending your elbows."
    ],
    "tips": [
      "An excellent compound exercise for the biceps."
    ],
    "mistakes": [
      "Swinging and using an incomplete range of motion."
    ]
  },
  "88": {
    "name": "Hanging knee raise",
    "muscles": "Abs, hip flexors",
    "start": "Hang from a pull-up bar.",
    "steps": [
      "Exhale and pull your knees up to your chest, making sure to curl your pelvis up."
    ],
    "tips": [
      "If your pelvis doesn't curl up, only your hip flexors are working, not your abs."
    ],
    "mistakes": [
      "Raising your legs by swinging."
    ]
  },
  "89": {
    "name": "Hanging corkscrew",
    "muscles": "Abs and obliques",
    "start": "Hang from a pull-up bar.",
    "steps": [
      "Raise your knees while rotating your pelvis to the right and left in alternation."
    ],
    "tips": [
      "Engages the obliques."
    ],
    "mistakes": [
      "Losing control of your shoulder girdle."
    ]
  },
  "90": {
    "name": "Dips (weighted or twisting optional)",
    "muscles": "Chest, triceps, front delts",
    "start": "Support yourself on the dip bars with straight arms.",
    "steps": [
      "Lean your torso forward at about 30° and flare your elbows out slightly.",
      "Lower until you feel a comfortable stretch in your chest (roughly a 90° angle at the elbows).",
      "Press yourself back up."
    ],
    "tips": [
      "The more you lean forward, the more your chest works (rather than your triceps)."
    ],
    "mistakes": [
      "Sinking too deep at the bottom (risk of shoulder injury)."
    ]
  },
  "91": {
    "name": "Weighted upright dips",
    "muscles": "Triceps, chest",
    "start": "Support yourself on the dip bars.",
    "steps": [
      "Keep your torso strictly upright, with your legs straight or bent behind you.",
      "Lower yourself down, driving your elbows back close to your body."
    ],
    "tips": [
      "The upright position puts all the load on the triceps."
    ],
    "mistakes": [
      "Leaning your torso forward (shifts the load to your chest)."
    ]
  },
  "92": {
    "name": "Heavy one-arm crossovers (band)",
    "muscles": "Chest",
    "start": "Stand sideways to the band and grab it with one hand.",
    "steps": [
      "Bring your arm across your whole body, as far as possible past the midline of your torso."
    ],
    "tips": [
      "Maximum range of contraction for one side of the chest."
    ],
    "mistakes": [
      "Turning your entire torso to follow your arm."
    ]
  },
  "93": {
    "name": "30° incline bench press",
    "muscles": "Chest (upper chest)",
    "start": "Set the bench to 30°. Hold the barbell or dumbbells at upper chest level. Keep your shoulder blades squeezed together.",
    "steps": [
      "Press up through the standard range of motion, exhaling on the effort and lowering the weight under control."
    ],
    "tips": [
      "A 30° angle is considered the ideal gold standard for isolating the upper chest."
    ],
    "mistakes": [
      "Lifting your hips off the bench."
    ]
  },
  "94": {
    "name": "Meadows row (landmine)",
    "muscles": "Lats, rhomboids, rear delts",
    "start": "Place one end of the barbell in a landmine (or in a corner). Stand perpendicular to the bar. Take a staggered stance: the leg closest to the bar is set back. Hinge forward and brace your forearm of the front-leg side on your thigh. Grab the end of the bar with a pronated grip (palm facing back).",
    "steps": [
      "Exhale and pull the end of the bar up, driving your elbow high out to the side and back.",
      "Emphasis is on the rear delt, rhomboids, and upper lats.",
      "Inhale and lower under control."
    ],
    "tips": [
      "Your elbow rises above the level of your back."
    ],
    "mistakes": [
      "Helping with the whole body (swinging)."
    ]
  },
  "95": {
    "name": "Trap bar shrugs",
    "muscles": "Trapezius",
    "start": "Step inside the trap bar and grab the handles with a neutral grip.",
    "steps": [
      "Stand up tall. Exhale and raise your shoulders straight up.",
      "Hold the peak contraction. Lower the bar."
    ],
    "tips": [
      "The neutral grip takes unnecessary stress off the shoulder joints."
    ],
    "mistakes": [
      "Tilting your head forward."
    ]
  },
  "96": {
    "name": "Below-the-knee rack pulls",
    "muscles": "Trapezius, lower back, glutes",
    "start": "The barbell is set on pins or safety arms of the rack at just below knee level. Step up close and grab the bar with a shoulder-width grip, keeping your back perfectly straight.",
    "steps": [
      "Pull the bar off the pins with a powerful drive by extending your hips and back, standing up to a fully upright position.",
      "Lower the bar back onto the rack."
    ],
    "tips": [
      "Lets you work with heavy weights and train the spinal erectors and traps."
    ],
    "mistakes": [
      "Overextending (leaning back) at the top."
    ]
  },
  "97": {
    "name": "Dumbbell high pulls",
    "muscles": "Trapezius, rear delts",
    "start": "Stand with the dumbbells hanging in your lowered hands in front of your thighs.",
    "steps": [
      "Exhale and, with a powerful burst (you may dip your knees slightly), pull the dumbbells up along your body.",
      "Your elbows should stay above the level of your hands at all times and travel out to the sides and up.",
      "Lower back to the starting position."
    ],
    "tips": [
      "Works the traps and the mid/rear delts."
    ],
    "mistakes": [
      "Raising your hands higher than your elbows."
    ]
  }
};

const DAY_TEXT_EN = {
  A: {
    title: 'Day A: Base + Arm volume',
    blocks: [
      { label: 'Legs', schemes: ['3 × 10–12 (each leg)'] },
      { label: 'Back', schemes: ['3 × 12 (pause at the top)'] },
      { label: 'Chest', schemes: ['3 × 12 (3-sec eccentric)'] },
      { label: 'Posture', schemes: ['3 × 15'] },
      { label: 'Arms (Volume superset)', schemes: ['3 × 10–12', '3 × 10–12'] },
      { label: 'Core (paired)', schemes: ['3 × 15', '3 × 15'] },
    ],
  },
  B: {
    title: 'Day B: Posterior chain + Arm thickness',
    blocks: [
      { label: 'Legs / Posterior chain', schemes: ['3 × 12 (3-sec lowering)'] },
      { label: 'Back', schemes: ['3 × 12 (pause at the top)'] },
      { label: 'Chest', schemes: ['3 × 10–15 (2-sec pause at the bottom)'] },
      { label: 'Shoulders', schemes: ['3 × 15'] },
      { label: 'Arms (Thickness superset)', schemes: ['3 × 10–12', '3 × 10–12'] },
      { label: 'Core (paired)', schemes: ['3 × 10 (each side)', '3 × 15'] },
    ],
  },
  C: {
    title: 'Day C: Balance + Arm isolation',
    blocks: [
      { label: 'Legs / Balance', schemes: ['3 × 12', '3 × 12'] },
      { label: 'Back', schemes: ['3 × 12'] },
      { label: 'Chest / Stretch', schemes: ['3 × 12'] },
      { label: 'Posture', schemes: ['3 sets of the full Y-T-W cycle'] },
      { label: 'Shoulders', schemes: ['3 × 12'] },
      { label: 'Arms (Peak superset)', schemes: ['3 × 12', '3 × 12'] },
      { label: 'Core (paired)', schemes: ['3 × 15', '3 × 10'] },
    ],
  },
  H1: {
    title: 'Variant 1: Jump rope + Core & Posture (HIIT)',
    meta: 'HIIT · 40/20 sec · 4–5 rounds',
    info: [
      'Focus: maximum heart-rate boost, work on posture, the upper back and the abs in the horizontal plane.',
      'Structure: 40 seconds work / 20 seconds rest, 4–5 rounds, 2 minutes of rest between rounds. About 25–31 minutes in total.',
      'Equipment: jump rope, long resistance band, door anchor or a door handle, mat.',
      'Before you start: 3–5 minutes of easy joint mobility (neck, shoulders, hips); go at a moderate pace for the first two rounds.',
    ],
    note: 'Five exercises in a row make one round. After a round, rest 2 minutes, then start the next.',
    blocks: [
      { label: 'Exercise 1 · warm-up and aerobic base', schemes: ['40 sec / 20 sec rest'] },
      { label: 'Exercise 2 · explosive upper body and back work', schemes: ['40 sec / 20 sec rest'] },
      { label: 'Exercise 3 · high heart rate and abs', schemes: ['40 sec / 20 sec rest'] },
      { label: 'Exercise 4 · posture and breathing recovery', schemes: ['40 sec / 20 sec rest'] },
      { label: 'Exercise 5 · isometric core hold, neutral spine', schemes: ['40 sec / 20 sec rest'] },
    ],
  },
  H2: {
    title: 'Variant 2: Jump rope + Thighs & Glutes (interval strength cardio)',
    meta: 'HIIT · 40/20 sec · 4–5 rounds',
    info: [
      'Focus: lower body, glutes and pelvic stabilization with minimal vertical load on the spine.',
      'Structure: 40 seconds work / 20 seconds rest, 4–5 rounds, 2 minutes of rest between rounds. About 25–31 minutes in total.',
      'Equipment: jump rope, mini loop band, long resistance band, stable chair, mat.',
      'Before you start: 3–5 minutes of easy joint mobility (hips, knees, shoulders); go at a moderate pace for the first two rounds.',
    ],
    note: 'Five exercises in a row make one round. After a round, rest 2 minutes, then start the next. Do this cardio no sooner than 48 hours after a leg workout.',
    blocks: [
      { label: 'Exercise 1 · soft alternating-step landings', schemes: ['40 sec / 20 sec rest'] },
      { label: 'Exercise 2 · glutes and quads', schemes: ['40 sec (20 per leg) / 20 sec rest'] },
      { label: 'Exercise 3 · glute medius and outer hips', schemes: ['40 sec (20 each direction) / 20 sec rest'] },
      { label: 'Exercise 4 · back work with the lower back supported', schemes: ['40 sec (20 per arm) / 20 sec rest'] },
      { label: 'Exercise 5 · isometric hold for core and quads', schemes: ['40 sec / 20 sec rest'] },
    ],
  },
  H3: {
    title: 'Light Cardio: moderate pace (20–30 minutes)',
    meta: 'Light · 90 sec · 3–4 rounds',
    info: [
      'Focus: aerobic base and extra volume at a moderate pace, minimal impact on the spine.',
      'Structure: 90 seconds work, 10 seconds to transition, 3–4 rounds, 1 minute of rest between rounds. About 22–29 minutes in total.',
      'Pace: you should be able to speak in short phrases. If you start gasping, slow down.',
      'Equipment: jump rope, light resistance band, mat.',
    ],
    note: 'An easy workout for extra volume: put it on a free day between strength and HIIT sessions, not right next to two HIIT sessions in a row.',
    restLabel: 'TRANSITION',
    blocks: [
      { label: 'Exercise 1 · warm-up', schemes: ['90 sec, 10 sec transition'] },
      { label: 'Exercise 2 · aerobic work', schemes: ['90 sec, 10 sec transition (easy pace)'] },
      { label: 'Exercise 3 · moderate cardio for the upper body', schemes: ['90 sec, 10 sec transition'] },
      { label: 'Exercise 4 · posture and breathing', schemes: ['90 sec, 10 sec transition'] },
    ],
  },
};
/* ==========================================================
 * RUSSIAN TEXTS (translation)
 * ========================================================== */

const EXERCISE_TEXT_RU = {
  "1": {
    "name": "Болгарские сплит-приседания",
    "muscles": "Квадрицепсы, ягодичные мышцы, бицепс бедра.",
    "start": "Встань спиной к дивану/скамье (расстояние ~60–90 см). Положи носок задней ноги на возвышение. Возьми гантели в руки вдоль корпуса. Корпус сбалансирован, грудь расправлена.",
    "steps": [
      "На вдохе плавно опускайся вниз за счет сгибания передней ноги. Эксцентрическая фаза длится строго 3 секунды.",
      "Опускайся до параллели бедра с полом (или пока колено сзади почти не коснется пола).",
      "На выдохе за счет мощного выталкивания пяткой передней ноги вернись в исходное положение."
    ],
    "safety": "Держи легкий наклон корпуса вперед (10–15°), чтобы снять напряжение с поясницы при гиперлордозе и акцентировать нагрузку на ягодицы. Не допускай заваливания колена внутрь.",
    "home": "Опорой для задней ноги служит диван или сиденье стула. Если стул скользит, прислони его к стене.",
    "tips": [
      "Колено передней ноги должно двигаться строго в направлении второго пальца стопы и не заваливаться внутрь."
    ],
    "mistakes": [
      "Слишком короткий шаг (чрезмерная нагрузка на переднюю часть колена).",
      "Перенос веса на заднюю ногу.",
      "Полное выпрямление опорного колена с «щелчком»."
    ]
  },
  "2": {
    "name": "Румынская тяга",
    "muscles": "Бицепс бедра, ягодичные мышцы, разгибатели позвоночника.",
    "start": "Встань прямо, возьми штангу 20 кг или гантели хватом сверху. Стопы на ширине плеч, колени «мягкие» (слегка согнуты, угол зафиксирован).",
    "steps": [
      "Начни движение строго с отведения таза назад, уводя снаряд вдоль передней поверхности бедер. Опускание — 3 секунды.",
      "Опускай снаряд до середины голени, ощущая сильное растяжение бицепса бедра. Пауза 1 секунда.",
      "На выдохе за счет сокращения ягодиц вытолкни таз вперед и вернись в исходное положение."
    ],
    "safety": "Категорически запрещено округлять поясничный или грудной отдел. Позвоночник — одна жесткая прямая линия. Голова не задирается вверх (взгляд направлен вперед-вниз).",
    "home": "Вместо штанги подойдут две гантели. Стань боком к зеркалу или сними себя на телефон, чтобы контролировать прямую спину.",
    "tips": [
      "Это движение на сгибание/разгибание в тазобедренном суставе, а не приседание. Колени больше не сгибаются во время опускания."
    ],
    "mistakes": [
      "Округление грудного или поясничного отдела спины.",
      "Слишком глубокое приседание (превращение тяги в присед).",
      "Увод снаряда далеко от ног."
    ]
  },
  "3": {
    "name": "Румынская тяга на одной ноге",
    "muscles": "Ягодичные мышцы, бицепс бедра, глубокие стабилизаторы таза.",
    "start": "Возьми одну гантель в руку, противоположную опорной ноге. Встань на одну ногу, вторая слегка приподнята.",
    "steps": [
      "Наклоняй корпус вперед, одновременно отводя свободную ногу назад в одну линию с туловищем.",
      "Опускай гантель до уровня колена/верхней части голени опорной ноги.",
      "Вернись в исходную точку за счет усилия ягодицы опорной ноги."
    ],
    "safety": "Отличное движение для коррекции асимметрии таза при сколиозе. Не допускай разворота таза в сторону во время наклона.",
    "home": "Если трудно держать равновесие, свободной рукой слегка коснись спинки стула или стены.",
    "tips": [
      "Следите за тем, чтобы таз не разворачивался в сторону поднятой ноги. Оба подвздошных гребня смотрят строго в пол."
    ],
    "mistakes": [
      "Разворот таза наружу.",
      "Потеря контроля над балансом из-за слишком быстрого темпа."
    ]
  },
  "4": {
    "name": "Ягодичный мостик",
    "muscles": "Большие ягодичные мышцы, задняя поверхность бедра.",
    "start": "Ляг на спину на коврик, согни ноги в коленях, стопы плотно прижми к полу на ширине плеч.",
    "steps": [
      "На выдохе за счет сокращения ягодиц выталкивай таз вверх до прямой линии между коленями, тазом и плечами.",
      "В верхней точке сделай пиковую паузу на 2 секунды, максимально сжимая ягодицы.",
      "На вдохе подконтрольно опусти таз, не касаясь пола."
    ],
    "safety": "Полное отсутствие осевой нагрузки. При подъеме таза избегай чрезмерного прогиба в пояснице (работает таз, а не поясничный отдел).",
    "home": "Выполняется на полу. Для усложнения положи гантель или блин на таз, придерживая его руками.",
    "tips": [
      "Подбородок прижат к груди, взгляд направлен перед собой, а не в потолок, чтобы избежать гиперэкстензии в пояснице."
    ],
    "mistakes": [
      "Переразогнутая поясница в верхней точке.",
      "Постановка стоп слишком далеко от таза (нагрузка уходит в бицепс бедра) или слишком близко (нагружается квадрицепс)."
    ]
  },
  "6": {
    "name": "Тяга штанги в наклоне",
    "muscles": "Широчайшие, трапециевидные, средняя часть спины.",
    "start": "Возьми штангу 20 кг хватом сверху чуть шире плеч. Наклони корпус вперед под углом ~45°, колени слегка согнуты, грудь расправлена.",
    "steps": [
      "На выдохе тяни штангу к нижней части живота / пупку, направляя локти назад и вверх.",
      "В конечной точке жестко сведи лопатки, сделав паузу на 1–2 секунды.",
      "На вдохе медленно опускай штангу вниз."
    ],
    "safety": "Сохраняй естественный прогиб в пояснице. При утомлении или боли в пояснице снижай угол наклона или переходи на тягу гантели с опорой.",
    "home": "Только гриф 20 кг: дополнительные блины на первых порах не нужны. При усталости заменяй упражнение на тягу гантели с опорой на диван.",
    "tips": [
      "Тяга осуществляется локтями, а не бицепсом. Предплечья выступают лишь в роли «вешалок»."
    ],
    "mistakes": [
      "Использование инерции (раскачка корпуса).",
      "Тяга штанги к груди вместо живота (включается верх трапеции и шея)."
    ]
  },
  "8": {
    "name": "Y-T-W Raises",
    "muscles": "Нижняя и средняя трапеция, ромбовидные, мышцы-стабилизаторы шеи и лопаток.",
    "start": "Ляг животом на коврик/диван. Лицо смотрит строго в пол, шея расслаблена.",
    "steps": [
      "Фаза Y: подними руки под углом 45° (большие пальцы вверх), сведи лопатки, удержание 2 сек.",
      "Фаза T: разведи руки строго в стороны, удержание 2 сек.",
      "Фаза W: согни локти к бокам, подними предплечья вверх, максимальное сведение лопаток на 2 сек."
    ],
    "safety": "Полностью безопасно при шейном остеохондрозе и сколиозе. Выполняется без отягощения.",
    "home": "Подойдет коврик на полу или диван. Для комфорта шеи можно подложить под лоб свернутое полотенце.",
    "tips": [
      "Движения выполняются плавно, без рывков, за счет осознанного сокращения средних/нижних трапеций и ромбовидных мышц."
    ],
    "mistakes": [
      "Поднимание плеч к ушам (перенапряжение верхней трапеции)."
    ]
  },
  "9": {
    "name": "Bird-Dog (Собака-птица)",
    "muscles": "Глубокие разгибатели позвоночника, кор, ягодицы.",
    "start": "Стань на четвереньки (на коврик). Ладони строго под плечами, колени под бедрами. Спина в нейтральном положении.",
    "steps": [
      "Одновременно вытяни правую руку вперед и левую ногу назад до образования единой линии с корпусом.",
      "Зафиксируй положение в верхней точке на 2 секунды, удерживая баланс и напрягая кор.",
      "Вернись в исходное положение и повтори для левой руки и правой ноги."
    ],
    "safety": "Золотой стандарт реабилитации спины. Исключает ротацию и прогиб в пояснице.",
    "home": "Нужен только коврик. Если колени болят, подложи под них сложенное полотенце.",
    "tips": [
      "Таз не должен проваливаться или разворачиваться. Поясница остаётся абсолютно неподвижной."
    ],
    "mistakes": [
      "Прогиб в пояснице при подъёме ноги.",
      "Слишком высокий подъём ноги/руки выше линии тела."
    ]
  },
  "10": {
    "name": "Жим гантелей лежа",
    "muscles": "Большая грудная мышца, передняя дельта, трицепс.",
    "start": "Ляг на скамью или на пол (Floor Press). Возьми гантели, согни локти под углом 45° к туловищу (не разводи локти на 90°).",
    "steps": [
      "На выдохе мощно выжми гантели вверх, сводя их над центром груди.",
      "На вдохе опускай гантели вниз подконтрольно в течение 3 секунд.",
      "В нижней точке сделай паузу 1 секунду, чувствуя растяжение грудных мышц."
    ],
    "safety": "Угол локтей 45° бережет плечевые суставы. Не делай чрезмерный пауэрлифтерский мост в пояснице.",
    "home": "Без скамьи жми с пола (Floor Press): пол ограничивает амплитуду и защищает плечи. Колени можно согнуть, чтобы поясница прилегала к полу.",
    "tips": [
      "Локти не должны расходиться в стороны под 90° (опасность для плечевых суставов)."
    ],
    "mistakes": [
      "Отрыв лопаток от скамьи при жиме."
    ]
  },
  "12": {
    "name": "Пуловер с гантелью",
    "muscles": "Межреберные мышцы, зубчатые, широчайшие, нижний отдел грудных.",
    "start": "Ляг верхней частью спины поперек дивана/скамьи. Возьми одну гантель обеими руками за верхний диск над грудью, руки слегка согнуты в локтях.",
    "steps": [
      "На вдохе плавно заводи гантель за голову по дуге до полного растяжения грудной клетки.",
      "В нижней точке задержись на 1–2 секунды.",
      "На выдохе за счет усилия грудных мышц и широчайших верни гантель в исходное положение."
    ],
    "safety": "Расширяет грудную клетку и снимает компрессию с грудного отдела позвоночника.",
    "home": "Диван служит опорой для верхней части спины. Держи таз ниже уровня плеч и не прогибай поясницу при заведении гантели за голову.",
    "tips": [
      "Угол в локтях остается неизменным на протяжении всего подхода."
    ],
    "mistakes": [
      "Сгибание и разгибание рук в локтях (превращение в трицепс)."
    ]
  },
  "13": {
    "name": "Жим гантелей стоя или сидя",
    "muscles": "Передняя и средняя дельты, трицепс.",
    "start": "Сядь на стул с прямой спинкой (для защиты поясницы) или встань прямо. Гантели у плеч, ладони смотрят вперед или нейтрально.",
    "steps": [
      "На выдохе выжми гантели вверх по дугообразной траектории.",
      "На вдохе медленно (3 секунды) опусти гантели к плечам."
    ],
    "safety": "Вариант сидя с опорой спины предпочтителен при гиперлордозе, так как исключает отклонение корпуса назад при жиме.",
    "home": "Стул с высокой спинкой даёт упор для спины. Прижми поясницу к спинке и не отклоняйся назад.",
    "tips": [
      "Напрягайте пресс и ягодицы, чтобы не прогибаться в пояснице."
    ],
    "mistakes": [
      "Разведение локтей строго в стороны (патологический импинджмент плеча)."
    ]
  },
  "14": {
    "name": "Махи гантелями в стороны",
    "muscles": "Средний пучок дельтовидных мышц (ширина плеч).",
    "start": "Встань прямо, гантели в руках перед собой, локти слегка согнуты.",
    "steps": [
      "На выдохе подними руки через стороны до уровня плеч (не выше!). Веди движение локтями.",
      "В верхней точке пауза 1 секунда.",
      "На вдохе подконтрольно опусти руки вниз."
    ],
    "safety": "Не раскачивай корпус. Подъем выше уровня плеч включает в работу трапецию и перегружает шею при остеохондрозе — поднимай строго до параллели с полом.",
    "home": "Достаточно лёгких гантелей. Можно выполнять сидя на стуле, чтобы исключить раскачку корпусом.",
    "tips": [
      "Изолирует средний пучок дельтовидных мышц."
    ],
    "mistakes": [
      "Махи за счет раскачки (читинг) и поднятие кистей выше локтей."
    ]
  },
  "15": {
    "name": "Подъемы гантелей на бицепс стоя",
    "muscles": "Двуглавая мышца плеча (бицепс).",
    "start": "Встань прямо, гантели в руках, локти прижаты к бокам и зафиксированы.",
    "steps": [
      "На выдохе согни руки в локтях, поднимая гантели к плечам с супинацией (разворотом кисти ладонью вверх).",
      "В верхней точке сожми бицепс на 1 секунду.",
      "На вдохе опускай вес 3 секунды."
    ],
    "safety": "Не раскачивай корпус и не отклоняйся назад: это добавляет прогиб в пояснице. Если вес тянет назад, уменьши его или выполняй сидя на стуле со спинкой.",
    "home": "Подойдут любые разборные гантели. Для контроля корпуса встань спиной к стене.",
    "tips": [
      "Локти неподвижны и прижаты к туловищу."
    ],
    "mistakes": [
      "Увод локтей вперед или назад."
    ]
  },
  "16": {
    "name": "Сгибания «Молот» (Hammer Curls)",
    "muscles": "Брахиалис (плечевая мышца), плечелучевая мышца, бицепс.",
    "start": "Встань прямо, гантели держи нейтральным хватом (ладони смотрят друг на друга).",
    "steps": [
      "На выдохе согни руку в локте, поднимая гантель к плечу без разворота кисти.",
      "Опускай подконтрольно на вдохе."
    ],
    "safety": "Держи корпус неподвижным, локти прижаты. Не отклоняйся назад — прогиб в пояснице при гиперлордозе нежелателен.",
    "home": "Можно выполнять сидя на стуле с прямой спинкой, это исключает читинг корпусом.",
    "tips": [
      "Нагрузка на плечелучевую мышцу (брахиорадиалис) и плечевую мышцу (брахиалис)."
    ],
    "mistakes": [
      "Использование инерции бедер."
    ]
  },
  "17": {
    "name": "Импровизированные сгибания на бицепс (Preacher Curls)",
    "muscles": "Нижняя часть и пик бицепса.",
    "start": "Наклонись через спинку стула или край дивана, жестко зафиксировав трицепсы и локти на опоре.",
    "steps": [
      "На выдохе сгибай руки, подтягивая гантели вверх без отрыва локтей от спинки.",
      "В верхней точке пиковая пауза 1–2 секунды."
    ],
    "safety": "Не округляй спину и не скручивай корпус. Весь наклон делай от опоры, а не от поясницы; вес подбирай так, чтобы не нужно было помогать корпусом.",
    "home": "Опорой служит спинка стула или край дивана. Для мягкости подложи под локти сложенное полотенце.",
    "tips": [
      "Полностью исключает возможность читинга."
    ],
    "mistakes": [
      "Резкое «сбрасывание» веса внизу."
    ]
  },
  "19": {
    "name": "Французский жим с заведением за голову (Skull Crushers with Overhead Shift)",
    "muscles": "Длинная головка трицепса.",
    "start": "Ляг на спину. Отведи прямые руки с гантелями назад за голову под углом 45° и зафиксируй локти в этом положении.",
    "steps": [
      "На вдохе сгибай руки только в локтях, опуская гантели за голову.",
      "На выдохе разгибай руки в исходный угол 45°."
    ],
    "safety": "Не прогибай поясницу: прижми её к полу или скамье, согни колени. Не уводи руки за голову дальше угла 45°, чтобы не перегружать плечи и шею.",
    "home": "Выполняется на полу или на диване. Согни колени и поставь стопы на опору, чтобы поясница прилегала к поверхности.",
    "tips": [
      "Обеспечивает непрерывное натяжение длинной головки трицепса."
    ],
    "mistakes": [
      "Возврат рук в строго вертикальное положение."
    ]
  },
  "21": {
    "name": "Классический французский жим лежа",
    "muscles": "Латеральная и медиальная головки трицепса.",
    "start": "Ляг на спину, руки с гантелями вытянуты перпендикулярно полу.",
    "steps": [
      "Сгибай руки в локтях к ушам/лбу, сохраняя локти неподвижными."
    ],
    "safety": "Поясница прижата к полу или скамье, колени согнуты. Опускай гантели медленно и подконтрольно, не раскачивая локти.",
    "home": "Выполняется на полу или на диване. Гантели опускай по сторонам головы, а не точно на лоб.",
    "tips": [
      "Локти зафиксированы и не разводятся в стороны."
    ],
    "mistakes": [
      "Движение всем плечевым суставом."
    ]
  },
  "22": {
    "name": "Скручивания с дополнительным весом",
    "muscles": "Прямая мышца живота.",
    "start": "Ляг на спину, ноги согнуты, блин 10 кг прижат к груди.",
    "steps": [
      "На выдохе скручивай верх корпуса, отрывая только лопатки.",
      "Поясница жестко прижата к полу на протяжении всего движения."
    ],
    "safety": "Не тяни шею руками и не подбирай подбородок к груди: работает пресс, а не шея. Амплитуда небольшая, только лопатки от пола.",
    "home": "Вместо блина можно взять гантель и прижать её к груди обеими руками. Выполняй на коврике.",
    "tips": [
      "Именно скручивание позвоночника, а не подъём всей прямой спины."
    ],
    "mistakes": [
      "Подъём поясницы от пола."
    ]
  },
  "24": {
    "name": "Скакалка — Низкий пружинящий шаг (Low Bounce)",
    "muscles": "Икроножные, стопы и голеностоп, сердечно-сосудистая система.",
    "start": "Встань прямо, скакалка за спиной, ручки в руках на уровне бёдер. Локти прижаты к бокам, взгляд вперёд, шея нейтральна. Стопы вместе или чуть врозь, колени мягкие.",
    "steps": [
      "Раскручивай скакалку кистями, а не всей рукой: локти почти неподвижны, предплечья слегка отведены в стороны.",
      "Прыгай низко: отрыв от пола 1–2 см, приземление на переднюю часть стопы с мягкими коленями и пружинящей работой голеностопа.",
      "Держи ровный ритм и дыхание все 40 секунд: корпус вертикален, пресс слегка напряжён, плечи опущены."
    ],
    "safety": "Прыжки дают ударную нагрузку на позвоночник, поэтому делай их низкими и мягкими, на коврике или упругом полу и в кроссовках с амортизацией (не на плитке и не на бетоне). Не запрокидывай голову и не задирай подбородок (шея), не прогибай поясницу при гиперлордозе. При боли в шее или спине замени скакалку на ходьбу на месте с высоким подниманием колен или «степ-джек» без прыжка.",
    "home": "Нужна скакалка. Длина подобрана верно, если при наступании на середину шнура ручки доходят до подмышек. Если места мало или скакалки нет, имитируй вращение кистями без шнура."
  },
  "25": {
    "name": "Имитация лыжного хода с резинкой",
    "muscles": "Широчайшие, задние дельты, трицепс, мышцы кора.",
    "start": "Закрепи длинную резинку за ручку двери (или в дверном якоре) на уровне головы или выше. Встань лицом к двери на расстоянии 1–1,5 м, возьми концы резинки в обе руки. Стопы на ширине плеч, колени мягкие, лёгкий наклон корпуса вперёд от таза, спина прямая.",
    "steps": [
      "Из положения с руками, вытянутыми вперёд-вверх, на выдохе резко тяни резинку вниз и назад к бёдрам, как при отталкивании лыжными палками; лопатки сводятся.",
      "Одновременно слегка присядь и отведи таз назад, ускоряя движение. Работай в быстром взрывном темпе все 40 секунд.",
      "Возвращай руки вперёд-вверх подконтрольно, не давая резинке «рвануть» руки назад."
    ],
    "safety": "Наклон идёт от тазобедренных суставов, спина остаётся прямой: не округляй грудной и поясничный отделы и не прогибайся назад, когда руки уходят вверх. Не поднимай плечи к ушам и не выдвигай голову вперёд (шея). Выбери такое сопротивление резинки, при котором корпус остаётся неподвижным и тебя не тянет вперёд.",
    "home": "Нужна длинная резинка с ручками или лента и дверной якорь (или прочная дверная ручка). Дверь должна открываться от тебя: тогда натяжение прижимает её к косяку и она не распахнётся."
  },
  "26": {
    "name": "«Скалолаз» в планке (Mountain Climbers)",
    "muscles": "Мышцы кора и пресса, передние дельты, сгибатели бедра; высокий пульс.",
    "start": "Прими высокую планку: ладони под плечами, руки прямые, тело — одна линия от макушки до пяток. Пресс и ягодицы напряжены, таз слегка подвёрнут, чтобы убрать прогиб в пояснице.",
    "steps": [
      "Подтяни одно колено к груди, не поднимая таз; сразу верни ногу назад и подтяни другое.",
      "Чередуй ноги в быстром, но контролируемом темпе 40 секунд, дыхание ровное, плечи над ладонями.",
      "Если форма разваливается (таз подпрыгивает или провисает), замедли темп, но не останавливайся."
    ],
    "safety": "Главный риск при гиперлордозе — провисание поясницы: держи таз слегка подвёрнутым, пресс напряжённым. Не раскачивай таз вверх-вниз и не скручивай корпус. Голова продолжает позвоночник, взгляд в пол между ладонями. При боли в пояснице снизь темп или поставь ладони на сиденье стула.",
    "home": "Нужен коврик. Для облегчения поставь ладони на сиденье устойчивого стула или дивана: наклонная планка легче для поясницы и плеч."
  },
  "27": {
    "name": "Горизонтальные разведения резинки перед грудью",
    "muscles": "Задние дельты, ромбовидные, средняя часть трапеции.",
    "start": "Встань прямо, возьми резинку (ленту или трубку) хватом сверху на ширине плеч. Руки вытянуты вперёд на уровне груди, локти слегка согнуты, лопатки опущены.",
    "steps": [
      "На выдохе разведи руки в стороны, растягивая резинку до линии плеч или до касания груди, сводя лопатки.",
      "В крайней точке задержись на 1 секунду, не поднимая плечи к ушам.",
      "На вдохе подконтрольно (2–3 секунды) верни руки вперёд. Дыши ровно: это упражнение помогает восстановить дыхание после тяжёлых движений."
    ],
    "safety": "Стопы на ширине плеч, корпус неподвижен: не прогибай поясницу и не выдвигай голову вперёд. Подбородок слегка втянут, шея длинная. Хорошо подходит для коррекции сутулости и кифоза; при шейном остеохондрозе не запрокидывай голову.",
    "home": "Нужна резинка средней жёсткости. Чем уже хват, тем тяжелее: начни с широкого."
  },
  "28": {
    "name": "Динамическая планка с касанием плеч",
    "muscles": "Мышцы кора (поперечная и косые), плечи, стабилизаторы лопаток.",
    "start": "Прими высокую планку с широко расставленными стопами (шире плеч). Ладони под плечами, пресс, ягодицы и квадрицепсы напряжены, тело — прямая линия.",
    "steps": [
      "Не меняя положения таза, оторви одну ладонь от пола и коснись ею противоположного плеча.",
      "Верни руку на пол и повтори другой рукой; чередуй в медленном контролируемом темпе.",
      "Следи, чтобы таз не раскачивался из стороны в сторону: представь стакан воды на пояснице. Работай 40 секунд."
    ],
    "safety": "Широкая постановка стоп снижает ротацию корпуса, что важно при сколиозе. Не прогибай поясницу: пресс и ягодицы в напряжении. Голова на одной линии с позвоночником, взгляд в пол. При боли в запястьях или пояснице выполняй с упором на сиденье стула или с колен.",
    "home": "Нужен только коврик. Для облегчения поставь ладони на сиденье стула."
  },
  "29": {
    "name": "Скакалка — Боксёрский шаг (Boxer Skip)",
    "muscles": "Икроножные, голеностоп, координация; сердечно-сосудистая система.",
    "start": "Встань прямо, скакалка за спиной, локти у корпуса, кисти на уровне бёдер. Вес на передней части стоп, колени мягкие.",
    "steps": [
      "Раскручивай скакалку кистями и перепрыгивай её, перенося вес с ноги на ногу: на каждый оборот приземляется одна нога, как в шаге боксёра.",
      "Прыгай низко (1–2 см) и мягко, на переднюю часть стопы; пятки не касаются пола.",
      "Держи ровный ритм и дыхание все 40 секунд: корпус вертикален, взгляд вперёд."
    ],
    "safety": "Приземляйся мягко и не прыгай высоко: удар приходится на одну ногу за раз. Пол — коврик или упругое покрытие, обувь с амортизацией. Корпус вертикален, поясница не прогибается, голова не запрокидывается. При боли в спине или шее замени шагом на месте или лёгкой «боксёрской» работой ногами без прыжков.",
    "home": "Нужна скакалка. Если шаг не получается, сначала просто переноси вес с ноги на ногу без скакалки, потом добавь вращение кистями."
  },
  "30": {
    "name": "Ревёрс-выпады назад с пульсацией",
    "muscles": "Ягодичные мышцы, квадрицепсы, бицепс бедра.",
    "start": "Встань прямо, стопы на ширине бёдер, руки на поясе (позже можно взять лёгкие гантели вдоль корпуса). Корпус вертикален, грудь расправлена.",
    "steps": [
      "Сделай шаг назад и опустись: переднее бедро почти параллельно полу, заднее колено у пола, корпус слегка наклонён вперёд (10–15°).",
      "В нижней точке сделай 2–3 небольшие пульсации амплитудой 5–10 см, оставаясь в нижней части движения.",
      "Вытолкни себя вверх пяткой передней ноги и вернись в исходное положение. Работай 20 секунд на каждую ногу без паузы между ними (всего 40 секунд)."
    ],
    "safety": "Выпад назад мягче для коленей и позвоночника, чем выпад вперёд. Лёгкий наклон корпуса (10–15°) снимает напряжение с поясницы при гиперлордозе. Колено передней ноги не заваливается внутрь и не уходит далеко за носок. Не прогибай поясницу в нижней точке.",
    "home": "Нужен только коврик. Если трудно держать равновесие, придерживайся свободной рукой за спинку стула."
  },
  "31": {
    "name": "Боковые проходки с резинкой на ногах",
    "muscles": "Средняя ягодичная мышца, отводящие мышцы бедра.",
    "start": "Надень мини-петлю выше колен (позже — выше лодыжек для большей нагрузки). Встань в лёгкий полуприсед: стопы на ширине плеч, колени слегка согнуты, корпус наклонён вперёд на 10–15°, руки перед грудью.",
    "steps": [
      "Сделай шаг в сторону, раздвигая ноги и не давая резинке сводить колени внутрь.",
      "Приставь вторую ногу так, чтобы расстояние между стопами осталось примерно на ширине плеч и резинка всегда была натянута.",
      "Иди 20 секунд в одну сторону, затем 20 секунд в другую (всего 40 секунд), не выпрямляясь."
    ],
    "safety": "Держи таз горизонтально и не раскачивай корпус из стороны в сторону: это важно при сколиозе, чтобы нагрузку брали ягодицы, а не поясница. Колени смотрят туда же, куда носки, и не заваливаются внутрь. Спина прямая.",
    "home": "Нужна мини-петля (тканевая не скользит по бёдрам). Если комната тесная, шагай туда-обратно по 3–4 шага."
  },
  "32": {
    "name": "Тяга резинки одной рукой с опорой на стул",
    "muscles": "Широчайшие, ромбовидные, задняя дельта, бицепс.",
    "start": "Поставь устойчивый стул к стене. Упрись левой рукой и левым коленом в сиденье (корпус параллелен полу, спина ровная). Правая нога стоит на полу и прижимает середину резинки, правая рука держит её конец.",
    "steps": [
      "На выдохе тяни резинку по дуге к тазу (к карману), ведя локоть близко к корпусу.",
      "В верхней точке сведи лопатку к позвоночнику и задержись на 1 секунду.",
      "На вдохе подконтрольно (2–3 секунды) верни руку вниз. Работай 20 секунд на каждую руку (всего 40 секунд)."
    ],
    "safety": "Опора на три точки полностью разгружает поясницу, как в тяге гантели с опорой на диван. Не скручивай корпус и не тяни рывком; спина ровная, шея продолжает позвоночник, взгляд в пол.",
    "home": "Подойдёт любой устойчивый стул, придвинутый к стене. Подбери резинку так, чтобы последние повторения шли с усилием, а техника не ломалась."
  },
  "33": {
    "name": "«Медвежья планка» (Bear Plank)",
    "muscles": "Квадрицепсы, мышцы кора, плечи.",
    "start": "Встань на четвереньки на коврик: ладони под плечами, колени под бёдрами, стопы на носках. Спина плоская, шея продолжает позвоночник, взгляд в пол.",
    "steps": [
      "На выдохе напряги пресс и квадрицепсы и оторви колени от пола на 2–3 см; спина остаётся параллельной полу.",
      "Удерживай положение 40 секунд, дыши ровно, не задерживая дыхание; таз не выше линии плеч.",
      "Усложнение — микро-шаги: поочерёдно на 1–2 см отрывай и ставь ладони или стопы, не раскачивая таз."
    ],
    "safety": "При гиперлордозе следи, чтобы поясница не прогибалась: слегка подверни таз, пресс в напряжении. Не поднимай таз выше линии плеч и не проваливай его вниз. Если появляется боль в пояснице или форма разваливается, опусти колени на пол, отдохни и продолжи. Голову не запрокидывай.",
    "home": "Нужен только коврик. Для усложнения увеличивай время удержания или добавляй микро-шаги."
  },
  "34": {
    "name": "Шаг на месте с высоким подниманием колен",
    "muscles": "Сгибатели бедра, квадрицепсы, ягодицы, сердечно-сосудистая система.",
    "start": "Встань прямо, стопы на ширине бёдер, руки согнуты в локтях у корпуса. Корпус вертикален, шея нейтральна, взгляд вперёд.",
    "steps": [
      "Маршируй на месте, поднимая колено до уровня таза; руки работают навстречу ногам, как при ходьбе.",
      "Приземляйся на переднюю часть стопы мягко, без хлопков. Темп такой, чтобы можно было говорить короткими фразами.",
      "Держи пресс слегка напряжённым, дыши ровно, плечи опущены."
    ],
    "safety": "Без прыжков, поэтому ударная нагрузка на позвоночник минимальна: это упражнение можно ставить вместо скакалки при боли в шее или спине. Не отклоняйся назад при подъёме колена и не прогибай поясницу при гиперлордозе. Голова ровно, подбородок не задран.",
    "home": "Нужен только свободный пятачок пола. Если сбивается равновесие, поставь рядом стул и придерживайся за спинку."
  },
  "35": {
    "name": "Бой с тенью (Shadow Boxing)",
    "muscles": "Плечи, трицепсы, мышцы кора, ноги; сердечно-сосудистая система.",
    "start": "Встань в лёгкую стойку: стопы чуть шире плеч, одна нога слегка впереди, колени мягкие, кулаки у подбородка, локти прижаты к корпусу.",
    "steps": [
      "Наноси прямые удары вперёд поочерёдно, разворачивая бедро и стопу вместе с ударом. Вращение идёт от бёдер и стоп, а не от поясницы.",
      "Добавляй лёгкие уклоны и перемещения на 1–2 шага, оставаясь на передней части стоп.",
      "Работай в умеренном темпе все 90 секунд, дыхание ровное: выдох на каждом ударе."
    ],
    "safety": "Не выпрямляй локоть жёстко в конце удара: рука остаётся «мягкой». Не скручивай поясницу (сколиоз) и не прогибайся назад. Подбородок слегка опущен, шея нейтральна.",
    "home": "Нужно примерно 2 × 2 м свободного места. Начинай без веса в руках."
  },
  "36": {
    "name": "Тяга гантели в трипод-стойке (Tripod Row)",
    "muscles": "Широчайшие мышцы спины, ромбовидные, задняя дельта, бицепс.",
    "start": "Встань сбоку от дивана или устойчивого стула, ноги на полу в шаговой стойке (одна чуть впереди). Обопрись одной рукой о сиденье или край дивана и наклони корпус почти до параллели с полом, спина прямая. В свободной руке гантель висит вертикально вниз.",
    "steps": [
      "На выдохе тяни гантель по дуге к тазу (к карману), ведя локоть близко к корпусу и не двигая корпусом.",
      "В верхней точке сведи лопатку к позвоночнику и задержись на 1–2 секунды.",
      "На вдохе медленно (3 секунды) опусти гантель до полного растяжения широчайшей."
    ],
    "safety": "Обе стопы стоят на полу, плюс опорная рука: три точки опоры разгружают поясницу. Держи позвоночник нейтральным, не скручивай корпус и не работай рывками. Шея продолжает позвоночник, взгляд в пол.",
    "home": "Опорой служит край дивана или сиденье устойчивого стула, придвинутого к стене. Делай одинаковое число подходов на обе стороны.",
    "tips": [
      "Корпус остается статичным, разворот плеч запрещен."
    ],
    "mistakes": [
      "Движение локтя в сторону вместо увода к тазу.",
      "Скручивание корпуса при подъеме heavy-веса."
    ]
  },
  "37": {
    "name": "Тяга прямыми руками вниз (с резинкой)",
    "muscles": "Спина (широчайшие и середина спины)",
    "start": "Закрепите фитнес-резинку или эспандер в верхней точке (дверной анкер, турник). Возьмитесь за концы резинки, сделайте шаг назад. Наклоните корпус вперед на 20–30°, колени слегка согнуты. Руки вытянуты вверх-вперед, в локтях сохранен минимальный изгиб.",
    "steps": [
      "На выдохе, не сгибая руки в локтях, потяните резинку по дугообразной траектории вниз к бедрам.",
      "В нижней точке максимально сведите лопатки и сожмите широчайшие мышцы спины.",
      "На вдохе подконтрольно верните руки в исходное положение."
    ],
    "tips": [
      "Руки работают как жесткие рычаги, сгибание/разгибание в локтевом суставе отсутствует."
    ],
    "mistakes": [
      "Сгибание рук и превращение упражнения в разгибание на трицепс."
    ]
  },
  "38": {
    "name": "Горизонтальная тяга сидя (с резинкой)",
    "muscles": "Спина (широчайшие и середина спины)",
    "start": "Сидя на полу с выпрямленными (или слегка согнутыми) ногами. Накиньте резинку на стопы, возьмитесь за ее края. Спина вертикально, грудь вперед, плечи опущены.",
    "steps": [
      "На выдохе потяните эспандер к нижней части живота.",
      "Ведите локти максимально близко к корпусу, акцентируя внимание на сведении лопаток.",
      "Задержитесь в точке пикового сокращения на 1 секунду.",
      "На вдохе плавно вернитесь в исходное положение."
    ],
    "tips": [
      "Держите осанку, не отклоняйте корпус сильно назад при тяге."
    ],
    "mistakes": [
      "Поднимание плеч к ушам.",
      "Скручивание спины в грудном отделе."
    ]
  },
  "39": {
    "name": "Тяга одной рукой сверху (с резинкой)",
    "muscles": "Спина (широчайшие и середина спины)",
    "start": "Закрепите эспандер наверху. Встаньте на одно колено (одноименная рука вверху) или сядьте. Рука вытянута вверх, держит резинку в натяжении.",
    "steps": [
      "На выдохе тяните локоть строго вниз к боку туловища.",
      "В нижней точке напрягите широчайшую мышцу и зафиксируйте позицию.",
      "На вдохе подконтрольно вернитесь вверх, давая широчайшей мышце растянуться."
    ],
    "tips": [
      "Фокусируйтесь на движении локтя, а не кисти."
    ],
    "mistakes": [
      "Наклон корпуса в сторону рабочей руки."
    ]
  },
  "40": {
    "name": "Тяга верхнего блока к груди (с резинкой)",
    "muscles": "Спина (широчайшие и середина спины)",
    "start": "Резинка зафиксирована высоко над головой. Встаньте на колени или сядьте на стул. Руки удерживают резинку широким хватом. Грудь подана вперед, лопатки опущены.",
    "steps": [
      "На выдохе потяните резинку к верхней части груди.",
      "Локти направляйте вниз и слегка назад.",
      "Сведите лопатки в нижней точке.",
      "На вдохе медленно опустите сопротивление вверх."
    ],
    "tips": [
      "Не заводите резинку за голову — тяга выполняется строго к груди."
    ],
    "mistakes": [
      "Отклонение корпуса назад более чем на 20°."
    ]
  },
  "41": {
    "name": "Тяга с пола в наклоне (Dead Rows)",
    "muscles": "Спина (широчайшие и середина спины)",
    "start": "Штанга или гантели лежат на полу. Стопы на ширине плеч. Опуститесь в глубокий наклон с прямой спиной (как в нижней точке мертвой тяги).",
    "steps": [
      "Каждое повторение начинается из мертвой точки (снаряд лежит на полу).",
      "На выдохе взрывным, но подконтрольным движением потяните снаряд к поясу.",
      "Зафиксируйте лопатки, после чего опушьте снаряд обратно на пол.",
      "Сделайте паузу на полу перед следующим повторением."
    ],
    "tips": [
      "Снимает постоянное напряжение с поясницы между повторами, развивает взрывную силу."
    ],
    "mistakes": [
      "Срыв веса с круглой спиной."
    ]
  },
  "42": {
    "name": "Прогулка фермера",
    "muscles": "Трапециевидные мышцы",
    "start": "Встаньте между двумя тяжелыми гантелями/гирями. Выполните правильный присед с прямой спиной и возьмите снаряды. Выпрямитесь: грудь колесом, плечи отведены назад и опущены, пресс каменный.",
    "steps": [
      "Начинайте движение вперед короткими, размеренными шагами.",
      "Сохраняйте идеально ровное положение корпуса, не раскачивайтесь из стороны в сторону."
    ],
    "tips": [
      "Развивает хват, кор и верх трапециевидных мышц."
    ],
    "mistakes": [
      "Округление плечевого пояса и сгибание спины."
    ]
  },
  "43": {
    "name": "Подъёмы блина на трапеции",
    "muscles": "Трапециевидные мышцы",
    "start": "Стоя прямо, удерживайте тяжелый блин обеими руками перед собой за края.",
    "steps": [
      "На выдохе поднимите плечи строго вверх, стараясь достать ими до ушей.",
      "В верхней точке сделайте паузу на 1–2 секунды.",
      "На вдохе опустите плечи. Руки в локтях не сгибаются."
    ],
    "tips": [
      "Движение идет строго по вертикали."
    ],
    "mistakes": [
      "Сгибание рук в локтях (подключение бицепса)."
    ]
  },
  "44": {
    "name": "Шраги Хейни (Haney Shrugs)",
    "muscles": "Трапециевидные мышцы",
    "start": "Встаньте прямо, удерживая штангу за спиной на уровне ягодиц хватом сверху.",
    "steps": [
      "На выдохе поднимайте плечи вверх и слегка назад, одновременно слегка сгибая локти, чтобы штанга скользила вдоль ягодиц и поясницы.",
      "Задержитесь в пиковой точке.",
      "На вдохе вернитесь в ИП."
    ],
    "tips": [
      "Изолирует заднюю часть трапеций."
    ],
    "mistakes": [
      "Слишком большой вес, не позволяющий поднять плечи."
    ]
  },
  "45": {
    "name": "Тяга к лицу с разгибанием над головой (с резинкой)",
    "muscles": "Трапециевидные мышцы",
    "start": "Резинка на уровне лица. Держите за концы нейтральным или верхним хватом.",
    "steps": [
      "Тяните резинку к носу/лбу, разводя локти в стороны (Face Pull).",
      "Из этого положения, не опуская локти, поднимите кисти над головой (внешняя ротация и подъём).",
      "Медленно вернитесь в ИП."
    ],
    "tips": [
      "Превосходно укрепляет ротаторную манжету и верх спины."
    ],
    "mistakes": [
      "Прогиб в пояснице при подъеме рук."
    ]
  },
  "46": {
    "name": "Тяга «Wrap Around»",
    "muscles": "Трапециевидные мышцы",
    "start": "Резинка зафиксирована сбоку на уровне талии или груди. Встаньте боком к месту крепления, возьмите эспандер дальне стоящей рукой.",
    "steps": [
      "На выдохе потяните резинку, оборачивая руку вокруг корпуса к противоположному боку.",
      "Это создает глубокое пиковое сокращение широчайшей мышцы.",
      "Вернитесь в ИП с контролем натяжения."
    ],
    "tips": [
      "Амплитуда заходит за среднюю линию тела."
    ],
    "mistakes": [
      "Чрезмерный разворот таза."
    ]
  },
  "47": {
    "name": "Шраги с гантелями или штангой",
    "muscles": "Трапециевидные мышцы",
    "start": "Стоя прямо, штанга перед собой или гантели по бокам. Спина прямая, взгляд перед собой.",
    "steps": [
      "На выдохе акцентированно поднимите плечи вверх.",
      "На 1–2 секунды зафиксируйте напряжение в трапециях.",
      "Медленно опустите вес."
    ],
    "tips": [
      "Никаких вращательных движений в плечевых суставах (это травмирует ротаторную манжету)."
    ],
    "mistakes": [
      "Круговые вращения плечами."
    ]
  },
  "48": {
    "name": "Шраги под углом (с резинкой)",
    "muscles": "Трапециевидные мышцы",
    "start": "Закрепите резинку снизу спереди. Возьмитесь за концы, руки вытянуты вперед и вверх под углом ~45°.",
    "steps": [
      "Подтягивайте лопатки и плечи назад-вверх по диагонали сопротивления резинки.",
      "Вернитесь в ИП."
    ],
    "tips": [
      "Нагружает среднюю часть трапеции."
    ],
    "mistakes": [
      "Сгибание рук в локтях."
    ]
  },
  "49": {
    "name": "Жим Арнольда",
    "muscles": "Передняя дельта",
    "start": "Сидя, гантели перед грудью, ладони повернуты к себе.",
    "steps": [
      "Начиная жим вверх, разворачивайте предплечья наружу.",
      "В верхней точке ладони смотрят вперед.",
      "При опускании выполните разворот в обратном порядке."
    ],
    "tips": [
      "Включает в работу передний и средний пучки дельт."
    ],
    "mistakes": [
      "Слишком быстрый разворот в самом начале движения."
    ]
  },
  "50": {
    "name": "Тяга с отведением (Abduction Rows)",
    "muscles": "Средняя дельта",
    "start": "Наклон корпуса 45°. Гантели в опущенных руках.",
    "steps": [
      "Тяните гантели вверх, разводя локти широко в стороны под углом 90° к корпусу."
    ],
    "tips": [
      "Акцент на задний пучок дельт и ромбовидные."
    ],
    "mistakes": [
      "Прижатие локтей к телу."
    ]
  },
  "51": {
    "name": "Тяга к лицу (с резинкой)",
    "muscles": "Задняя дельта",
    "start": "Резинка зафиксирована на уровне груди или глаз.",
    "steps": [
      "Тяните резинку к глазам/лбу, активно разводя локти в стороны и разворачивая кисти назад."
    ],
    "tips": [
      "Оздоровление плечевых суставов и проработка задней дельты."
    ],
    "mistakes": [
      "Тяга к животу или подбородку."
    ]
  },
  "52": {
    "name": "Жим гантелей «Scoop Press»",
    "muscles": "Передняя дельта",
    "start": "Гантели удерживаются перед собой нейтральным хватом.",
    "steps": [
      "Выжимайте гантели по дуге вверх и слегка вперед, словно «черпая» воздух локтями."
    ],
    "tips": [
      "Постоянная активация передней дельты без снятия нагрузки."
    ],
    "mistakes": [
      "Увод гантелей далеко назад за голову."
    ]
  },
  "53": {
    "name": "Hip Huggers (задняя дельта)",
    "muscles": "Задняя дельта",
    "start": "Стоя прямо, тяжелые гантели в руках.",
    "steps": [
      "Тяните гантели назад вдоль линии бедер, уводя локти максимально назад."
    ],
    "tips": [
      "Проработка задней дельты из стоячего положения."
    ],
    "mistakes": [
      "Сгибание корпуса вперед."
    ]
  },
  "54": {
    "name": "Подъёмы гантелей перед собой",
    "muscles": "Передняя дельта",
    "start": "Стоя, гантели на передней поверхности бедер.",
    "steps": [
      "Поднимайте гантель перед собой до уровня глаз/плеч.",
      "Плавно опустите. Выполняйте попеременно или двумя руками."
    ],
    "tips": [
      "Изоляция передней дельты."
    ],
    "mistakes": [
      "Отклонение туловища назад при подъеме."
    ]
  },
  "55": {
    "name": "Махи в стороны с резинкой (как на блоке)",
    "muscles": "Средняя дельта",
    "start": "Наступите на резинку противоположной ногой. Возьмите конец эспандера.",
    "steps": [
      "Выполняйте отведение руки в сторону. Резинка дает максимальное сопротивление в пиковой точке."
    ],
    "tips": [
      "Позволяет поддерживать непрерывное натяжение."
    ],
    "mistakes": [
      "Подъем плеча (трапеции) вверх."
    ]
  },
  "56": {
    "name": "Тяга на заднюю дельту",
    "muscles": "Задняя дельта",
    "start": "Полный наклон корпуса до параллели с полом.",
    "steps": [
      "Разводите гантели в стороны через мизинцы, ведя движение задней дельтой."
    ],
    "tips": [
      "Не сводите лопатки слишком сильно, чтобы нагрузка не ушла в спину."
    ],
    "mistakes": [
      "Подъём корпуса из наклона."
    ]
  },
  "57": {
    "name": "Паучьи сгибания (Spider Curls)",
    "muscles": "Двуглавая мышца плеча (бицепс)",
    "start": "Лягте животом на наклонную скамью (45°). Руки со штангой или гантелями свисают строго вертикально.",
    "steps": [
      "Сгибайте руки в локтях, не смещая плечевую кость из вертикального положения."
    ],
    "tips": [
      "Пиковое сокращение бицепса в верхней точке."
    ],
    "mistakes": [
      "Увод локтей назад к скамье."
    ]
  },
  "58": {
    "name": "Драг-сгибания (Drag Curls)",
    "muscles": "Двуглавая мышца плеча (бицепс)",
    "start": "Стоя со штангой или гантелями.",
    "steps": [
      "Сгибайте руки, скользя снарядом строго вдоль туловища (касаясь живота и груди), уводя локти назад."
    ],
    "tips": [
      "Снимает нагрузку с передней дельты и изолирует бицепс."
    ],
    "mistakes": [
      "Выведение снаряда вперед."
    ]
  },
  "59": {
    "name": "Сгибания «Flex» / «Lip Buster» (с резинкой)",
    "muscles": "Двуглавая мышца плеча (бицепс)",
    "start": "Резинка зафиксирована на уровне глаз.",
    "steps": [
      "Удерживая локти на весу параллельно полу, сгибайте руки к губам/лбу."
    ],
    "tips": [
      "Высокая изоляция двуглавой мышцы."
    ],
    "mistakes": [
      "Опускание локтей вниз."
    ]
  },
  "60": {
    "name": "Сгибания «Официант» (Waiter Curls)",
    "muscles": "Двуглавая мышца плеча (бицепс)",
    "start": "Удерживайте одну гантель вертикально обеими ладонями под верхний диск (словно поднос).",
    "steps": [
      "Поднимайте гантель к подбородку, удерживая ладони параллельно потолку."
    ],
    "tips": [
      "Нагрузка на длинную головку бицепса."
    ],
    "mistakes": [
      "Зажим гантели пальцами."
    ]
  },
  "61": {
    "name": "Сгибания гантелей на наклонной скамье",
    "muscles": "Двуглавая мышца плеча (бицепс)",
    "start": "Сидя на скамье под углом 45°, руки с гантелями свободно свисают вниз.",
    "steps": [
      "Из положения растяжения выполняйте сгибания рук с супинацией."
    ],
    "tips": [
      "Максимально растягивает длинную головку бицепса в нижней точке."
    ],
    "mistakes": [
      "Отрыв плеч от скамьи."
    ]
  },
  "62": {
    "name": "Сгибания со штангой",
    "muscles": "Двуглавая мышца плеча (бицепс)",
    "start": "Стоя, хват снизу на ширине плеч.",
    "steps": [
      "Сгибайте руки до уровня верха груди, подконтрольно опускайте."
    ],
    "tips": [
      "Классическое базовое упражнение для массы бицепса."
    ],
    "mistakes": [
      "Раскачка корпусом (читинг)."
    ]
  },
  "63": {
    "name": "Медленная прогулка с грузом в одной руке",
    "muscles": "Косые мышцы, глубокий кор, хват",
    "start": "Взять тяжелую гантель/гирю в одну руку.",
    "steps": [
      "Идите медленно по прямой линии, противодействуя наклону туловища в сторону тяжести."
    ],
    "tips": [
      "Мощная работа косых мышц-стабилизаторов."
    ],
    "mistakes": [
      "Перекос плечевого пояса."
    ]
  },
  "64": {
    "name": "Боковой мостик с поворотом",
    "muscles": "Косые мышцы живота",
    "start": "Боковая планка на предплечье.",
    "steps": [
      "Скручивайте верхнюю руку под туловище, поворачивая грудную клетку к полу, затем возвращайтесь."
    ],
    "tips": [
      "Стабильность таза во время скручивания."
    ],
    "mistakes": [
      "Провисание таза вниз."
    ]
  },
  "65": {
    "name": "Скручивание «Левитация»",
    "muscles": "Пресс (прямая мышца живота)",
    "start": "Лёжа на спине, руки вытянуты над головой, ноги чуть приподняты.",
    "steps": [
      "Одновременно приподнимайте лопатки и ноги, удерживая кор в максимально сжатом состоянии."
    ],
    "tips": [
      "Поясница плотно прижата к полу."
    ],
    "mistakes": [
      "Прогиб в пояснице (опасность для позвоночника)."
    ]
  },
  "66": {
    "name": "Свайпер (Swiper)",
    "muscles": "Пресс и косые мышцы",
    "start": "Лёжа на спине, колени согнуты, лопатки приподняты.",
    "steps": [
      "Попеременно тянитесь правой рукой к правой пятке, затем левой к левой через стороны."
    ],
    "tips": [
      "Непрерывное напряжение прямой и косых мышц пресса."
    ],
    "mistakes": [
      "Опускание шеи на пол между повторами."
    ]
  },
  "67": {
    "name": "Гимнастический «тук» (Gymnast Tuck)",
    "muscles": "Нижняя часть пресса, сгибатели бедра",
    "start": "Упор на брусьях, упорах или полу на прямых руках.",
    "steps": [
      "Подтягивайте колени к груди и удерживайте это положение (или выполняйте динамически)."
    ],
    "tips": [
      "Силовая статико-динамическая нагрузка на мышцы пресса."
    ],
    "mistakes": [
      "Раскачивание."
    ]
  },
  "68": {
    "name": "Скользящий «тук» (Sliding Tuck, полотенце на полу)",
    "muscles": "Нижняя часть пресса, сгибатели бедра",
    "start": "Упор лежа, стопы стоят на полотенце/слайдерах на гладком полу.",
    "steps": [
      "Не подпрыгивая, подтягивайте стопы к кистям за счет скручивания пресса и скольжения."
    ],
    "tips": [
      "Контролируемое движение без инерции."
    ],
    "mistakes": [
      "Прогиб в пояснице в положении планки."
    ]
  },
  "69": {
    "name": "Жим гантелей на наклонной со сведением (Squeeze Press)",
    "muscles": "Грудь (верх груди)",
    "start": "Наклонная скамья (30–45°). Держите гантели перед грудью так, чтобы они были плотно прижаты друг к другу.",
    "steps": [
      "Постоянно давите гантелями друг на друга с максимальной силой.",
      "На выдохе выжимайте их вверх, не размыкая контакта.",
      "На вдохе опускайте обратно."
    ],
    "tips": [
      "Создает колоссальное изометрическое напряжение во внутренней части груди."
    ],
    "mistakes": [
      "Ослабление давления между гантелями."
    ]
  },
  "70": {
    "name": "Подъём UCV (UCV Raise)",
    "muscles": "Грудь (верх груди)",
    "start": "Стоя прямо, гантель в одной руке у бедра, ладонь развернута вверх.",
    "steps": [
      "На выдохе поднимайте руку снизу вверх и внутрь по диагонали через все тело до уровня противоположного плеча.",
      "Напрягайте верх груди. Опустите в ИП."
    ],
    "tips": [
      "Движение идет за счет приведения руки к средней линии."
    ],
    "mistakes": [
      "Работа за счет сгибания бицепса."
    ]
  },
  "71": {
    "name": "Жим гантелей лёжа обратным хватом",
    "muscles": "Грудь (верх груди)",
    "start": "Лягте на горизонтальную скамью, держите гантели ладонями к себе (супинированный хват).",
    "steps": [
      "Выжимайте гантели вверх, удерживая локти ближе к корпусу.",
      "Опускайте до мягкого касания бедер/груди."
    ],
    "tips": [
      "Увеличивает активацию верхней части груди даже на плоской скамье."
    ],
    "mistakes": [
      "Выскальзывание гантелей из-за непривычного хвата (используйте умеренный вес)."
    ]
  },
  "72": {
    "name": "Жим гантелей на наклонной",
    "muscles": "Грудь (верх груди)",
    "start": "Установите скамью под углом 30–45°. Лягте, сведите лопатки, стопы в полу. Гантели у верхней части груди.",
    "steps": [
      "На выдохе выжмите гантели вертикально вверх.",
      "На вдохе подконтрольно опустите их до растяжения верха груди."
    ],
    "tips": [
      "Акцент на верхний (ключичный) отдел грудных мышц."
    ],
    "mistakes": [
      "Слишком большой угол скамьи (выше 45° нагрузка уходит в дельты)."
    ]
  },
  "73": {
    "name": "Жим на наклонной с резинкой (как на блоке)",
    "muscles": "Грудь (верх груди)",
    "start": "Закрепите резинку за спиной снизу. Встаньте в шаг-разножку или сядьте.",
    "steps": [
      "Выполняйте жимовые движения руками вперед и слегка вверх.",
      "В конечной точке сводите кисти для максимального пикового сокращения."
    ],
    "tips": [
      "Нагрузка возрастает по мере выпрямления рук."
    ],
    "mistakes": [
      "Потеря натяжения резинки в нижней точке."
    ]
  },
  "74": {
    "name": "Сведение с резинкой снизу вверх (Low-to-High Crossover)",
    "muscles": "Грудь (верх груди)",
    "start": "Резинки зафиксированы снизу сзади. Встаньте по центру, руки опущены по бокам и отведены назад.",
    "steps": [
      "На выдохе сводите руки перед собой по дуге снизу вверх до уровня подбородка.",
      "Сожмите грудные мышцы вверху."
    ],
    "tips": [
      "Изоляция верхнего отдела груди."
    ],
    "mistakes": [
      "Сгибание рук в локтях."
    ]
  },
  "75": {
    "name": "Отжимания со скручиванием",
    "muscles": "Грудь, трицепс, кор",
    "start": "Упор лежа.",
    "steps": [
      "Опуститесь в отжимание. При подъеме вверх скрутите таз и корпус, направляя одно колено к противоположному локтю."
    ],
    "tips": [
      "Интеграция работы грудных мышц и кора."
    ],
    "mistakes": [
      "Провисание таза."
    ]
  },
  "76": {
    "name": "Сведение рук с резинкой (кроссовер)",
    "muscles": "Грудь",
    "start": "Резинки зафиксированы на уровне плеч. Руки разведены в стороны и слегка согнуты.",
    "steps": [
      "Сводите руки перед грудью по дуге, перекрещивая кисти в конечной точке для усиления сокращения."
    ],
    "tips": [
      "Постоянный угол сгибания в локтях."
    ],
    "mistakes": [
      "Превращение сведения в жим."
    ]
  },
  "77": {
    "name": "Жим лёжа с резинкой",
    "muscles": "Грудь, трицепс, передние дельты",
    "start": "Пропустите резинку через верх спины и удерживайте ее концы в ладонях вместе с гантелями или без. Лягте на скамью или пол.",
    "steps": [
      "Выполняйте классический жим. Резинка добавляет сопротивление в верхней фазе."
    ],
    "tips": [
      "Позволяет дорабатывать грудные мышцы в фазе полного сокращения."
    ],
    "mistakes": [
      "Смещение эспандера на шею."
    ]
  },
  "78": {
    "name": "Отжимания «Кобра» (Cobra Push-ups)",
    "muscles": "Трицепс (длинная головка)",
    "start": "Лягте на живот, кисти поставьте под грудь близко к телу.",
    "steps": [
      "Выжимайте верхний корпус вверх за счет выпрямления рук в локтях, не отрывая таз от пола."
    ],
    "tips": [
      "Изолированная работа трицепса с собственным весом."
    ],
    "mistakes": [
      "Включение мышц поясницы."
    ]
  },
  "79": {
    "name": "Разгибания обратным хватом с резинкой",
    "muscles": "Трицепс (длинная головка)",
    "start": "Резинка зафиксирована вверху. Хват снизу (ладони смотрят вверх).",
    "steps": [
      "Разгибайте руки вниз до полного выпрямления локтей."
    ],
    "tips": [
      "Акцент на медиальную головку трицепса."
    ],
    "mistakes": [
      "Отрыв локтей от корпуса."
    ]
  },
  "80": {
    "name": "Разгибания над головой с резинкой",
    "muscles": "Трицепс (длинная головка)",
    "start": "Встаньте спиной к месту крепления резинки (внизу или сзади). Руки согнуты за головой.",
    "steps": [
      "Разгибайте руки над головой вперед и вверх."
    ],
    "tips": [
      "Глубокое растяжение трицепса."
    ],
    "mistakes": [
      "Разведение локтей в стороны."
    ]
  },
  "81": {
    "name": "Жим JM (JM Press)",
    "muscles": "Трицепс",
    "start": "Лягте на скамью, штанга над грудью.",
    "steps": [
      "Опускайте гриф по диагонали строго к шее/верхней части груди, складывая локти вперед и вниз. Из этого положения выжимайте вверх."
    ],
    "tips": [
      "Гибрид жима узким хватом и французского жима."
    ],
    "mistakes": [
      "Перерастяжение запястий."
    ]
  },
  "82": {
    "name": "Разгибания руки в наклоне (Kickbacks)",
    "muscles": "Трицепс",
    "start": "Корпус в наклоне параллельно полу. Локоть прижат к боку и поднят вверх.",
    "steps": [
      "На выдохе разогните руку назад до полной прямой линии."
    ],
    "tips": [
      "Локоть не опускается во время движения."
    ],
    "mistakes": [
      "Маховые движения вместо подконтрольного разгибания."
    ]
  },
  "83": {
    "name": "Разгибания гантелей над головой на наклонной (Incline Power Bombs)",
    "muscles": "Трицепс (длинная головка)",
    "start": "Сидя на скамье (75°), гантель удерживается обеими руками за головой.",
    "steps": [
      "Разгибайте руки вверх над головой."
    ],
    "tips": [
      "Спинка скамьи предотвращает лишний прогиб в пояснице."
    ],
    "mistakes": [
      "Касание гантелью шеи."
    ]
  },
  "84": {
    "name": "Разгибания с резинкой с раскачкой (Rocking Pushdowns)",
    "muscles": "Трицепс",
    "start": "Встаньте перед резинкой верхнего блока.",
    "steps": [
      "При разгибании рук слегка подавайте корпус вперед, а при возврате назад — отводите таз, усугубляя пиковое натяжение."
    ],
    "tips": [
      "Динамическая подстройка биомеханики."
    ],
    "mistakes": [
      "Чрезмерно хаотичные движения."
    ]
  },
  "85": {
    "name": "Жим узким хватом",
    "muscles": "Трицепс, грудь",
    "start": "Лёжа на скамье. Хват на ширине плеч (или 20–30 см между кистями).",
    "steps": [
      "Опускайте штангу на низ груди, ведя локти максимально близко к туловищу. Выжмите вверх."
    ],
    "tips": [
      "Базовое мощное упражнение для всех трех головок трицепса."
    ],
    "mistakes": [
      "Слишком узкий хват (вызывает боль в запястьях)."
    ]
  },
  "86": {
    "name": "Подтягивания с отягощением",
    "muscles": "Широчайшие, бицепс, середина спины",
    "start": "Повесьте отягощение (блин/гирю) на специальный пояс. Возьмитесь за перекладину хватом сверху чуточку шире плеч. Свисайте на прямых руках, кор сжат.",
    "steps": [
      "На выдохе начните движение со сведения лопаток вниз, затем потяните себя вверх за счет спины.",
      "Подтягивайтесь до тех пор, пока подбородок не окажется выше перекладины, а грудь не приблизится к ней.",
      "На вдохе подконтрольно опуститесь вниз до полного расправления спины."
    ],
    "tips": [
      "Избегайте рывков и дерганий ногами (киппинга)."
    ],
    "mistakes": [
      "Неполная амплитуда внизу или вверху."
    ]
  },
  "87": {
    "name": "Подтягивания обратным хватом",
    "muscles": "Бицепс, широчайшие",
    "start": "Вис на перекладине, хват снизу (ладони к себе) на ширине плеч.",
    "steps": [
      "Тяните себя вверх, концентрируясь на сгибании рук в локтях."
    ],
    "tips": [
      "Отличное многосуставное упражнение для бицепса."
    ],
    "mistakes": [
      "Раскачивание и неполная амплитуда."
    ]
  },
  "88": {
    "name": "Подъём коленей в висе",
    "muscles": "Пресс, сгибатели бедра",
    "start": "Вис на турнике.",
    "steps": [
      "На выдохе подтягивайте колени к груди, обязательно подкручивая таз вверх."
    ],
    "tips": [
      "Если таз не подкручивается, работают только сгибатели бедра, а не пресс."
    ],
    "mistakes": [
      "Подъем ног за счет раскачки."
    ]
  },
  "89": {
    "name": "Штопор в висе (Hanging Corkscrew)",
    "muscles": "Пресс и косые мышцы",
    "start": "Вис на турнике.",
    "steps": [
      "Поднимайте колени с одновременным поворачиванием таза вправо и влево поочередно."
    ],
    "tips": [
      "Включение косых мышц живота."
    ],
    "mistakes": [
      "Потеря контроля над плечевым поясом."
    ]
  },
  "90": {
    "name": "Отжимания на брусьях (можно с весом или со скручиванием)",
    "muscles": "Грудь, трицепс, передние дельты",
    "start": "Упор на брусьях на прямых руках.",
    "steps": [
      "Наклоните корпус вперед под углом 30°, разведите локти слегка в стороны.",
      "Опуститесь до комфортного растяжения груди (примерно угол 90° в локтях).",
      "Выжмите себя вверх."
    ],
    "tips": [
      "Чем больше наклон вперед, тем больше работает грудь (а не трицепс)."
    ],
    "mistakes": [
      "Слишком глубокий провал вниз (риск травмы плеча)."
    ]
  },
  "91": {
    "name": "Отжимания на брусьях с весом (вертикальный корпус)",
    "muscles": "Трицепс, грудь",
    "start": "Упор на брусьях.",
    "steps": [
      "Держите корпус строго вертикально, ноги прямые или согнуты сзади.",
      "Опускайтесь вниз, ведя локти назад близко к телу."
    ],
    "tips": [
      "Вертикальное положение акцентирует всю нагрузку на трицепсе."
    ],
    "mistakes": [
      "Наклон корпуса вперед (перенос нагрузки на грудь)."
    ]
  },
  "92": {
    "name": "Тяжёлый одноручный кроссовер с резинкой",
    "muscles": "Грудь",
    "start": "Встаньте боком к резинке, возьмитесь одной рукой.",
    "steps": [
      "Сводите руку через все тело максимально далеко за среднюю линию туловища."
    ],
    "tips": [
      "Максимальная амплитуда сокращения одной половиной груди."
    ],
    "mistakes": [
      "Поворот всего корпуса вслед за рукой."
    ]
  },
  "93": {
    "name": "Жим на наклонной скамье 30°",
    "muscles": "Грудь (верх груди)",
    "start": "Скамья 30°. Штанга или гантели на уровне верха груди. Сведенные лопатки.",
    "steps": [
      "Выполняйте жим вверх по стандартной амплитуде с выдохом на усилии и контролируемым опусканием."
    ],
    "tips": [
      "Угол 30° считаются идеальным золотым стандартом для изоляции верха груди."
    ],
    "mistakes": [
      "Отрыв таза от скамьи."
    ]
  },
  "94": {
    "name": "Тяга Медоуса (landmine)",
    "muscles": "Широчайшие, ромбовидные, задние дельты",
    "start": "Гриф вставлен одним концом в лендмайн (или угол). Встаньте перпендикулярно грифу. Сделайте разножку: нога, ближняя к грифу, отведена назад. Наклоните корпус, опритесь предплечьем передней ноги о бедро. Возьмитесь за конец грифа пронированным хватом (ладонь смотрит назад).",
    "steps": [
      "На выдохе потяните конец грифа вверх, уводя локоть высоко в сторону и назад.",
      "Акцент на заднюю дельту, ромбовидные и верх широчайшей.",
      "На вдохе подконтрольно опустите."
    ],
    "tips": [
      "Локоть поднимается выше уровня спины."
    ],
    "mistakes": [
      "Помощь всем телом (раскачка)."
    ]
  },
  "95": {
    "name": "Шраги с трап-грифом",
    "muscles": "Трапециевидные мышцы",
    "start": "Встаньте внутрь трап-грифа, возьмитесь за рукоятки нейтральным хватом.",
    "steps": [
      "Выпрямитесь. На выдохе поднимайте плечи вертикально вверх.",
      "Зафиксируйте пиковое сокращение. Опустите гриф."
    ],
    "tips": [
      "Нейтральный хват снимает лишнее напряжение с плечевых суставов."
    ],
    "mistakes": [
      "Наклон головы вперед."
    ]
  },
  "96": {
    "name": "Тяга со стоек ниже колена",
    "muscles": "Трапеции, поясница, ягодицы",
    "start": "Штанга установлена на плинтах или ограничителях стоек на уровне чуть ниже коленных чашечек. Подойдите вплотную, возьмитесь хватом на ширине плеч, спина идеально прямая.",
    "steps": [
      "Сделайте мощный срыв штанги за счет выпрямления таза и спины, выпрямляясь до полного вертикального положения.",
      "Опустите штангу обратно на стойки."
    ],
    "tips": [
      "Позволяет работать с большими весами и прорабатывать разгибатели позвоночника и трапеции."
    ],
    "mistakes": [
      "Перерастяжение (отклонение) назад в верхней точке."
    ]
  },
  "97": {
    "name": "Высокие тяги гантелей",
    "muscles": "Трапеции, задние дельты",
    "start": "Стоя, гантели в опущенных руках перед бедрами.",
    "steps": [
      "На выдохе мощным импульсом (можно со слегка подсевшими коленами) потяните гантели вверх вдоль тела.",
      "Локти должны постоянно находится выше уровня кистей и уходить в стороны-вверх.",
      "Опустите в ИП."
    ],
    "tips": [
      "Включает трапеции и средние/задние дельты."
    ],
    "mistakes": [
      "Подъём кистей выше локтей."
    ]
  }
};

const DAY_TEXT_RU = {
  A: {
    title: 'День А: База + Объем рук',
    blocks: [
      {
        label: 'Ноги',
        schemes: [
          '3 × 10–12 (на каждую ногу)',
        ],
      },
      {
        label: 'Спина',
        schemes: [
          '3 × 12 (с паузой вверху)',
        ],
      },
      {
        label: 'Грудь',
        schemes: [
          '3 × 12 (3 сек эксцентрика)',
        ],
      },
      {
        label: 'Осанка',
        schemes: [
          '3 × 15',
        ],
      },
      {
        label: 'Руки (Суперсет Volume)',
        schemes: [
          '3 × 10–12',
          '3 × 10–12',
        ],
      },
      {
        label: 'Кор (Связка)',
        schemes: [
          '3 × 15',
          '3 × 15',
        ],
      },
    ],
  },
  B: {
    title: 'День Б: Задняя цепь + Толщина руки',
    blocks: [
      {
        label: 'Ноги / Задняя цепь',
        schemes: [
          '3 × 12 (3 сек вниз)',
        ],
      },
      {
        label: 'Спина',
        schemes: [
          '3 × 12 (пауза вверху)',
        ],
      },
      {
        label: 'Грудь',
        schemes: [
          '3 × 10–15 (пауза внизу 2 сек)',
        ],
      },
      {
        label: 'Плечи',
        schemes: [
          '3 × 15',
        ],
      },
      {
        label: 'Руки (Суперсет Thickness)',
        schemes: [
          '3 × 10–12',
          '3 × 10–12',
        ],
      },
      {
        label: 'Кор (Связка)',
        schemes: [
          '3 × 10 (на каждую сторону)',
          '3 × 15',
        ],
      },
    ],
  },
  C: {
    title: 'День В: Баланс + Изоляция рук',
    blocks: [
      {
        label: 'Ноги / Баланс',
        schemes: [
          '3 × 12',
          '3 × 12',
        ],
      },
      {
        label: 'Спина',
        schemes: [
          '3 × 12',
        ],
      },
      {
        label: 'Грудь / Растяжка',
        schemes: [
          '3 × 12',
        ],
      },
      {
        label: 'Осанка',
        schemes: [
          '3 подхода по полному циклу',
        ],
      },
      {
        label: 'Плечи',
        schemes: [
          '3 × 12',
        ],
      },
      {
        label: 'Руки (Суперсет Peak)',
        schemes: [
          '3 × 12',
          '3 × 12',
        ],
      },
      {
        label: 'Кор (Связка)',
        schemes: [
          '3 × 15',
          '3 × 10',
        ],
      },
    ],
  },
  H1: {
    title: 'Вариант 1: Скакалка + Кор и Осанка (HIIT)',
    meta: 'HIIT · 40/20 сек · 4–5 кругов',
    info: [
      'Направленность: максимальный разгон сердечного ритма, работа над осанкой, верхом спины и прессом в горизонтальной плоскости.',
      'Структура: 40 секунд работы / 20 секунд отдыха, 4–5 кругов, отдых между кругами 2 минуты. Всего примерно 25–31 минута.',
      'Инвентарь: скакалка, длинная резинка, дверной якорь или ручка двери, коврик.',
      'Перед началом: 3–5 минут лёгкой суставной разминки (шея, плечи, таз); первые два круга иди в среднем темпе.',
    ],
    note: 'Пять упражнений подряд — один круг. После круга отдых 2 минуты, затем следующий.',
    blocks: [
      {
        label: 'Упражнение 1 · разогрев и аэробная база',
        schemes: [
          '40 сек / 20 сек отдых',
        ],
      },
      {
        label: 'Упражнение 2 · взрывная нагрузка на верх тела и спину',
        schemes: [
          '40 сек / 20 сек отдых',
        ],
      },
      {
        label: 'Упражнение 3 · высокий пульс и пресс',
        schemes: [
          '40 сек / 20 сек отдых',
        ],
      },
      {
        label: 'Упражнение 4 · осанка и восстановление дыхания',
        schemes: [
          '40 сек / 20 сек отдых',
        ],
      },
      {
        label: 'Упражнение 5 · изометрия кора, нейтральная спина',
        schemes: [
          '40 сек / 20 сек отдых',
        ],
      },
    ],
  },
  H2: {
    title: 'Вариант 2: Скакалка + Бедра и Ягодицы (интервально-силовое кардио)',
    meta: 'HIIT · 40/20 сек · 4–5 кругов',
    info: [
      'Направленность: акцент на нижнюю часть тела, ягодичные мышцы и стабилизацию таза при минимальной вертикальной нагрузке на позвоночник.',
      'Структура: 40 секунд работы / 20 секунд отдыха, 4–5 кругов, отдых между кругами 2 минуты. Всего примерно 25–31 минута.',
      'Инвентарь: скакалка, мини-петля, длинная резинка, устойчивый стул, коврик.',
      'Перед началом: 3–5 минут лёгкой суставной разминки (таз, колени, плечи); первые два круга иди в среднем темпе.',
    ],
    note: 'Пять упражнений подряд — один круг. После круга отдых 2 минуты, затем следующий. Ставь это кардио не раньше чем через 48 часов после тренировки ног.',
    blocks: [
      {
        label: 'Упражнение 1 · мягкая переступающая амортизация',
        schemes: [
          '40 сек / 20 сек отдых',
        ],
      },
      {
        label: 'Упражнение 2 · ягодицы и квадрицепсы',
        schemes: [
          '40 сек (по 20 на ногу) / 20 сек отдых',
        ],
      },
      {
        label: 'Упражнение 3 · средняя ягодичная и боковая линия',
        schemes: [
          '40 сек (по 20 в каждую сторону) / 20 сек отдых',
        ],
      },
      {
        label: 'Упражнение 4 · спина с разгрузкой поясницы',
        schemes: [
          '40 сек (по 20 на руку) / 20 сек отдых',
        ],
      },
      {
        label: 'Упражнение 5 · изометрия на кор и квадрицепсы',
        schemes: [
          '40 сек / 20 сек отдых',
        ],
      },
    ],
  },
  H3: {
    title: 'Кардио лайт: умеренный темп (20–30 минут)',
    meta: 'Лайт · 90 сек · 3–4 круга',
    info: [
      'Направленность: аэробная база и добор объёма в умеренном темпе, минимум ударной нагрузки на позвоночник.',
      'Структура: 90 секунд работы, 10 секунд на переход, 3–4 круга, 1 минута отдыха между кругами. Всего примерно 22–29 минут.',
      'Темп: должен получаться разговор короткими фразами. Если начинаешь задыхаться, замедлись.',
      'Инвентарь: скакалка, лёгкая резинка, коврик.',
    ],
    note: 'Лёгкая тренировка для добора объёма: ставь её в свободный день между силовыми и HIIT, а не вплотную к двум HIIT подряд.',
    restLabel: 'ПЕРЕХОД',
    blocks: [
      {
        label: 'Упражнение 1 · разогрев',
        schemes: [
          '90 сек, переход 10 сек',
        ],
      },
      {
        label: 'Упражнение 2 · аэробная нагрузка',
        schemes: [
          '90 сек, переход 10 сек (лёгкий темп)',
        ],
      },
      {
        label: 'Упражнение 3 · умеренное кардио для верха тела',
        schemes: [
          '90 сек, переход 10 сек',
        ],
      },
      {
        label: 'Упражнение 4 · осанка и дыхание',
        schemes: [
          '90 сек, переход 10 сек',
        ],
      },
    ],
  },
};

/* ==========================================================
 * LOCALIZATION
 * English is the primary language, other languages are overlays.
 * Anything missing in a translation falls back to English.
 * To add a language: add it to SUPPORTED_LANGS, CATEGORY_TITLES,
 * STRINGS, EXERCISE_TEXT and DAY_TEXT, and to the settings dropdown.
 * ========================================================== */

const EXERCISE_TEXT = { en: EXERCISE_TEXT_EN, ru: EXERCISE_TEXT_RU };
const DAY_TEXT = { en: DAY_TEXT_EN, ru: DAY_TEXT_RU };
const SUPPORTED_LANGS = ['en', 'ru'];
const LANG_NAMES = { en: 'English', ru: 'Русский' };

/* ==========================================================
 * RANKING
 * Tiers follow the ATHLEAN-X "Exercises Ranked (BEST TO WORST!)" videos:
 * 1 Worst, 2 Better, 3 Better still, 4 Almost best, 5 Best.
 * Tiers 1–2 are not kept in the vault. Exercises without `tier` are unranked.
 * ========================================================== */
const RANKING_VIDEOS = {
  shoulders: { id: 'tZafawk3arc', title: 'Shoulder Exercises Ranked (BEST TO WORST!)' },
  traps: { id: 'w7OSC-RfKOI', title: 'Trap Exercises Ranked (BEST TO WORST!)' },
  back: { id: 'w4vU3tzVM70', title: 'Back Exercises Ranked (BEST TO WORST!)' },
  biceps: { id: '6g57DJntRXk', title: 'Biceps Exercises Ranked (BEST TO WORST!)' },
  abs: { id: 'TqXwI1MWZks', title: 'Ab Exercises Ranked (BEST TO WORST!)' },
  upperchest: { id: 'YqFfh5IZUBs', title: 'Upper Chest Exercises Ranked (BEST TO WORST!)' },
  chest: { id: 'ykQlXirszbo', title: 'Chest Exercises Ranked (BEST TO WORST!)' },
  triceps: { id: 'ZrAiIvpZvhM', title: 'Triceps Exercises Ranked (BEST TO WORST!)' },
};
const TIER_ORDER = [5, 4, 3, 2, 0]; // best first, unranked (0) last

const CATEGORY_TITLES = {
  en: {
    legs: 'Legs & glutes',
    back: 'Back & posture',
    chest: 'Chest',
    shoulders: 'Shoulders',
    arms: 'Arms (biceps & triceps)',
    core: 'Abs & core',
    cardio: 'Cardio & HIIT',
  },
  ru: {
    legs: 'Ноги и ягодицы',
    back: 'Спина и осанка',
    chest: 'Грудь',
    shoulders: 'Плечи',
    arms: 'Руки (Бицепс и Трицепс)',
    core: 'Пресс и кор',
    cardio: 'Кардио и HIIT',
  },
};

const STRINGS = {
  en: {
    viewName: 'Workout Vault',
    ribbonTitle: 'Open Workout Vault',
    commandOpen: 'Open Workout Vault',
    backHome: '← Home',
    dashSubtitle: 'Home workouts. Pick a strength day, cardio, or a muscle group.',
    strengthSection: 'Strength workouts',
    cardioSection: 'Cardio (HIIT)',
    muscleSection: 'Muscle groups',
    exercisesCount: '{n} exercises',
    categoryCount: 'Exercises: {n}',
    daySubtitle: 'Tap an exercise to see technique, spine safety and video.',
    everyOtherDay: 'Workouts are done every other day (for example Mon / Wed / Fri).',
    orLabel: '— or —',
    supersetBadge: 'superset',
    targetMuscles: 'Target muscles: ',
    startPosition: 'Starting position',
    technique: 'Step-by-step technique',
    spineSafety: '🛡️ Spine safety',
    atHome: '🛋️ At home, with what you have',
    videoTitle: 'Video',
    noVideo: 'No embedded video for this exercise yet.',
    findVideo: 'Find a video on YouTube',
    openYoutube: 'Not loading? Open on YouTube',
    timerTitle: '⏱ Interval timer',
    timerRounds: 'Rounds:',
    timerStart: 'Start',
    timerPause: 'Pause',
    timerResume: 'Resume',
    timerSkip: 'Skip',
    timerReset: 'Reset',
    timerAgain: 'Restart',
    phaseWork: 'WORK',
    phaseRest: 'REST',
    phaseRoundRest: 'REST BETWEEN ROUNDS',
    phaseDone: 'DONE',
    timerFinished: 'Workout complete. Great job!',
    timerNext: 'Next: {name}',
    timerMeta: 'Round {r} of {n} · exercise {i} of {m}',
    timerFirstSide: ' · first side',
    timerSwitchSide: ' · switch sides',
    settingsLanguage: 'Language',
    settingsLanguageDesc:
      'Language of the interface and exercise texts. Command and ribbon names update after the plugin is reloaded.',
    langAuto: 'Auto (follow Obsidian)',
    tier5: 'Best',
    tier4: 'Almost best',
    tier3: 'Better still',
    tier2: 'Better',
    keyPoints: 'Key points',
    commonMistakes: 'Common mistakes',
    formTips: 'Key points (one per line)',
    formMistakes: 'Common mistakes (one per line)',
    addExercise: 'Add exercise',
    btnEdit: 'Edit',
    btnDelete: 'Delete',
    btnReset: 'Reset to default',
    confirmDelete: 'Delete this exercise?',
    confirmYes: 'Yes, delete',
    btnCancel: 'Cancel',
    formAddTitle: 'New exercise',
    formEditTitle: 'Edit exercise',
    formCategory: 'Category',
    formVideo: 'YouTube link or video ID (optional)',
    formName: 'Name',
    formMuscles: 'Target muscles',
    formStart: 'Starting position',
    formSteps: 'Technique (one step per line)',
    formSafety: 'Spine safety',
    formHome: 'At home',
    formSave: 'Save',
    formErrName: 'Fill in the name in both languages.',
    formErrVideo: 'Could not recognize the YouTube link or video ID.',
    settingsRestore: 'Deleted built-in exercises',
    settingsRestoreDesc: 'Bring back built-in exercises you have deleted ({n} deleted).',
    settingsRestoreBtn: 'Restore all',
    gear_landmine: 'Requires a barbell anchored in a corner (landmine setup).',
    gear_trapbar: 'Requires a trap (hex) bar.',
    gear_rack: 'Requires a power rack or stands to set the bar below the knee.',
    jerkNote: 'Explosive movement: keep it controlled and light, no jerking, especially with spine or neck issues.',
    barNote: 'Requires a pull-up bar or parallel bars (dip bars).',
    neckNote: 'Note: this exercise can put a high axial load on the neck and spine. With cervical issues use a light weight or skip it.',
    tierNone: 'Not ranked yet',
    rankLabel: 'ATHLEAN-X ranking: ',
    detailsSoon: 'Technique details for this exercise will be added in the next update.',
    bandNote:
      'In the original this exercise uses a cable machine; here it is done with a resistance band.',
  },
  ru: {
    viewName: 'Workout Vault',
    ribbonTitle: 'Открыть Workout Vault',
    commandOpen: 'Открыть Workout Vault',
    backHome: '← На главную',
    dashSubtitle: 'Домашние тренировки. Выбери силовой день, кардио или группу мышц.',
    strengthSection: 'Силовые тренировки',
    cardioSection: 'Кардио (HIIT)',
    muscleSection: 'Группы мышц',
    exercisesCount: '{n} упражнений',
    categoryCount: 'Упражнений: {n}',
    daySubtitle: 'Нажми на упражнение, чтобы открыть технику, безопасность и видео.',
    everyOtherDay: 'Тренировки проводятся через день (например, Пн / Ср / Пт).',
    orLabel: '— или —',
    supersetBadge: 'суперсет',
    targetMuscles: 'Целевые мышцы: ',
    startPosition: 'Исходное положение',
    technique: 'Пошаговая техника',
    spineSafety: '🛡️ Безопасность для позвоночника',
    atHome: '🛋️ Дома, подручными средствами',
    videoTitle: 'Видео',
    noVideo: 'Встроенное видео для этого упражнения пока не добавлено.',
    findVideo: 'Найти видео на YouTube',
    openYoutube: 'Не загружается? Открыть на YouTube',
    timerTitle: '⏱ Интервальный таймер',
    timerRounds: 'Кругов:',
    timerStart: 'Старт',
    timerPause: 'Пауза',
    timerResume: 'Продолжить',
    timerSkip: 'Пропустить',
    timerReset: 'Сброс',
    timerAgain: 'Заново',
    phaseWork: 'РАБОТА',
    phaseRest: 'ОТДЫХ',
    phaseRoundRest: 'ОТДЫХ МЕЖДУ КРУГАМИ',
    phaseDone: 'ГОТОВО',
    timerFinished: 'Тренировка завершена. Хорошая работа!',
    timerNext: 'Дальше: {name}',
    timerMeta: 'Круг {r} из {n} · упражнение {i} из {m}',
    timerFirstSide: ' · первая сторона',
    timerSwitchSide: ' · смена стороны',
    settingsLanguage: 'Язык',
    settingsLanguageDesc:
      'Язык интерфейса и текстов упражнений. Названия команды и значка обновятся после перезагрузки плагина.',
    langAuto: 'Авто (как в Obsidian)',
    tier5: 'Лучшее',
    tier4: 'Почти лучшее',
    tier3: 'Ещё лучше',
    tier2: 'Лучше',
    keyPoints: 'Ключевые акценты',
    commonMistakes: 'Частые ошибки',
    formTips: 'Ключевые акценты (по одному на строку)',
    formMistakes: 'Частые ошибки (по одной на строку)',
    addExercise: 'Добавить упражнение',
    btnEdit: 'Изменить',
    btnDelete: 'Удалить',
    btnReset: 'Вернуть исходное',
    confirmDelete: 'Удалить это упражнение?',
    confirmYes: 'Да, удалить',
    btnCancel: 'Отмена',
    formAddTitle: 'Новое упражнение',
    formEditTitle: 'Редактирование упражнения',
    formCategory: 'Категория',
    formVideo: 'Ссылка на YouTube или ID видео (необязательно)',
    formName: 'Название',
    formMuscles: 'Работающие мышцы',
    formStart: 'Исходное положение',
    formSteps: 'Техника (один шаг на строку)',
    formSafety: 'Безопасность для позвоночника',
    formHome: 'Дома',
    formSave: 'Сохранить',
    formErrName: 'Заполни название на обоих языках.',
    formErrVideo: 'Не удалось распознать ссылку на YouTube или ID видео.',
    settingsRestore: 'Удалённые встроенные упражнения',
    settingsRestoreDesc: 'Вернуть встроенные упражнения, которые ты удалил (удалено: {n}).',
    settingsRestoreBtn: 'Вернуть все',
    gear_landmine: 'Нужна штанга, закреплённая в углу (landmine).',
    gear_trapbar: 'Нужен трап-гриф (hex-гриф).',
    gear_rack: 'Нужны силовая рама или стойки, чтобы выставить штангу ниже колена.',
    jerkNote: 'Взрывное движение: выполняй контролируемо и с лёгким весом, без рывков, особенно при проблемах со спиной и шеей.',
    barNote: 'Нужны турник или брусья.',
    neckNote: 'Внимание: упражнение может давать высокую осевую нагрузку на шею и позвоночник. При проблемах с шейным отделом используй лёгкий вес или пропусти его.',
    tierNone: 'Пока без рейтинга',
    rankLabel: 'Рейтинг ATHLEAN-X: ',
    detailsSoon: 'Описание техники для этого упражнения появится в следующем обновлении.',
    bandNote: 'В оригинале упражнение выполняется на блоке; здесь — с резинкой.',
  },
};

let LANG = 'en';

function setLang(lang) {
  LANG = SUPPORTED_LANGS.indexOf(lang) !== -1 ? lang : 'en';
}

/** Obsidian's interface language, e.g. "ru"; falls back to "en". */
function detectObsidianLang() {
  try {
    const stored = window.localStorage.getItem('language');
    if (stored) return String(stored).toLowerCase();
    if (window.moment && typeof window.moment.locale === 'function') {
      return String(window.moment.locale()).toLowerCase();
    }
  } catch (e) {
    /* not available: use English */
  }
  return 'en';
}

/** Turns the saved setting ('auto' | 'en' | 'ru') into a supported language code. */
function resolveLang(setting) {
  if (SUPPORTED_LANGS.indexOf(setting) !== -1) return setting;
  const detected = detectObsidianLang();
  for (let i = 0; i < SUPPORTED_LANGS.length; i++) {
    if (detected === SUPPORTED_LANGS[i] || detected.indexOf(SUPPORTED_LANGS[i] + '-') === 0) {
      return SUPPORTED_LANGS[i];
    }
  }
  return 'en';
}

/** UI string by key with {placeholder} substitution. */
function t(key, vars) {
  let s = (STRINGS[LANG] || {})[key];
  if (s === undefined) s = STRINGS.en[key];
  if (s === undefined) return key;
  if (vars) {
    Object.keys(vars).forEach((k) => {
      s = s.split('{' + k + '}').join(String(vars[k]));
    });
  }
  return s;
}

/** Exercise texts in the current language (English fills any gaps). */
function exText(ex) {
  return Object.assign({}, EXERCISE_TEXT.en[ex.id], (EXERCISE_TEXT[LANG] || {})[ex.id]);
}

/** Day/program texts in the current language (English fills any gaps). */
function dayText(day) {
  return Object.assign({}, DAY_TEXT.en[day.key], (DAY_TEXT[LANG] || {})[day.key]);
}

function catTitle(key) {
  return (CATEGORY_TITLES[LANG] || {})[key] || CATEGORY_TITLES.en[key] || key;
}

/* ==========================================================
 * HELPERS
 * ========================================================== */
function getExercise(id) {
  return EXERCISES_DATABASE.find((e) => e.id === id);
}

function getCategory(key) {
  return CATEGORIES.find((c) => c.key === key);
}

function countExercisesInDay(day) {
  const ids = new Set();
  day.blocks.forEach((b) => b.items.forEach((i) => ids.add(i.id)));
  return ids.size;
}

/** Adds the ranking tier pill (Best / Almost best / Better still) after an exercise name. */
function addTierBadge(nameEl, ex) {
  if (ex.tier) nameEl.createSpan({ cls: 'wt-tier wt-tier-' + ex.tier, text: t('tier' + ex.tier) });
  return nameEl;
}

/** Makes an element clickable and keyboard accessible. */
function makeClickable(el, handler) {
  el.setAttr('role', 'button');
  el.setAttr('tabindex', '0');
  el.addEventListener('click', handler);
  el.addEventListener('keydown', (evt) => {
    if (evt.key === 'Enter' || evt.key === ' ') {
      evt.preventDefault();
      handler();
    }
  });
}

/* ==========================================================
 * EXERCISE MODAL
 * ========================================================== */
/* ==========================================================
 * USER DATA
 * Custom exercises, edits and deletions live in plugin settings
 * (settings.user) and are applied on top of the built-in data.
 *   added:   [{ id, category, video, text: { en, ru } }]
 *   edited:  { [id]: { meta: { category, video }, text: { en, ru } } }
 *   deleted: [id]  (built-in exercises only)
 * ========================================================== */
const CUSTOM_ID_START = 1000;
const cloneJSON = (o) => JSON.parse(JSON.stringify(o));
const BASE = {
  db: EXERCISES_DATABASE.map((e) => Object.assign({}, e)),
  text: { en: cloneJSON(EXERCISE_TEXT.en), ru: cloneJSON(EXERCISE_TEXT.ru) },
};

function emptyUserData() {
  return { added: [], edited: {}, deleted: [] };
}

function normalizeUserData(u) {
  const n = Object.assign(emptyUserData(), u || {});
  n.added = Array.isArray(n.added) ? n.added : [];
  n.deleted = Array.isArray(n.deleted) ? n.deleted : [];
  n.edited = n.edited && typeof n.edited === 'object' ? n.edited : {};
  return n;
}

function applyUserData(user) {
  const u = normalizeUserData(user);
  const deleted = new Set(u.deleted);
  EXERCISES_DATABASE.length = 0;
  BASE.db.forEach((e) => {
    if (deleted.has(e.id)) return;
    const ed = u.edited[e.id];
    EXERCISES_DATABASE.push(Object.assign({}, e, ed && ed.meta ? ed.meta : {}));
  });
  u.added.forEach((a) =>
    EXERCISES_DATABASE.push({ id: a.id, category: a.category, video: a.video || null, custom: true })
  );
  SUPPORTED_LANGS.forEach((lang) => {
    const target = EXERCISE_TEXT[lang];
    Object.keys(target).forEach((k) => delete target[k]);
    Object.assign(target, cloneJSON(BASE.text[lang]));
    deleted.forEach((id) => delete target[id]);
    Object.keys(u.edited).forEach((id) => {
      const ed = u.edited[id];
      if (ed && ed.text && ed.text[lang]) target[id] = cloneJSON(ed.text[lang]);
    });
    u.added.forEach((a) => {
      if (a.text && a.text[lang]) target[a.id] = cloneJSON(a.text[lang]);
    });
  });
}

/** Extracts an 11-character YouTube video ID from a link or a bare ID. */
function parseVideoId(input) {
  const s = (input || '').trim();
  if (!s) return '';
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:[?&]v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

class ExerciseFormModal extends Modal {
  /** exercise: existing exercise to edit, or null for a new one. */
  constructor(app, plugin, exercise, category) {
    super(app);
    this.plugin = plugin;
    this.exercise = exercise;
    this.category = category || (exercise && exercise.category) || CATEGORIES[0].key;
    this.f = {};
  }

  field(parent, label, tag, cls) {
    const wrap = parent.createDiv({ cls: 'wt-form-field' });
    wrap.createEl('label', { text: label });
    const el = wrap.createEl(tag, { cls, attr: tag === 'textarea' ? { rows: '3' } : { type: 'text' } });
    return el;
  }

  onOpen() {
    const ex = this.exercise;
    const { contentEl, modalEl, titleEl } = this;
    modalEl.addClass('wt-modal');
    titleEl.setText(t(ex ? 'formEditTitle' : 'formAddTitle'));

    const catWrap = contentEl.createDiv({ cls: 'wt-form-field' });
    catWrap.createEl('label', { text: t('formCategory') });
    const sel = catWrap.createEl('select', { cls: 'wt-f-category' });
    CATEGORIES.forEach((c) => {
      const o = sel.createEl('option', { text: c.icon + ' ' + catTitle(c.key) });
      o.value = c.key;
    });
    sel.value = this.category;
    this.f.category = sel;

    this.f.video = this.field(contentEl, t('formVideo'), 'input', 'wt-f-video');
    this.f.video.value = ex && ex.video ? ex.video : '';

    SUPPORTED_LANGS.forEach((code) => {
      const raw = (ex && EXERCISE_TEXT[code][ex.id]) || {};
      contentEl.createEl('h4', { cls: 'wt-form-lang', text: LANG_NAMES[code] });
      const f = (this.f[code] = {});
      f.name = this.field(contentEl, t('formName'), 'input', 'wt-f-' + code + '-name');
      f.muscles = this.field(contentEl, t('formMuscles'), 'input', 'wt-f-' + code + '-muscles');
      f.start = this.field(contentEl, t('formStart'), 'textarea', 'wt-f-' + code + '-start');
      f.steps = this.field(contentEl, t('formSteps'), 'textarea', 'wt-f-' + code + '-steps');
      f.tips = this.field(contentEl, t('formTips'), 'textarea', 'wt-f-' + code + '-tips');
      f.mistakes = this.field(contentEl, t('formMistakes'), 'textarea', 'wt-f-' + code + '-mistakes');
      f.safety = this.field(contentEl, t('formSafety'), 'textarea', 'wt-f-' + code + '-safety');
      f.home = this.field(contentEl, t('formHome'), 'textarea', 'wt-f-' + code + '-home');
      f.name.value = raw.name || '';
      f.muscles.value = raw.muscles || '';
      f.start.value = raw.start || '';
      f.steps.value = (raw.steps || []).join('\n');
      f.tips.value = (raw.tips || []).join('\n');
      f.mistakes.value = (raw.mistakes || []).join('\n');
      f.safety.value = raw.safety || '';
      f.home.value = raw.home || '';
    });

    this.error = contentEl.createDiv({ cls: 'wt-form-error' });

    const bar = contentEl.createDiv({ cls: 'wt-modal-actions' });
    const save = bar.createEl('button', { cls: 'wt-save mod-cta', text: t('formSave') });
    save.addEventListener('click', () => this.save());
    const cancel = bar.createEl('button', { cls: 'wt-cancel', text: t('btnCancel') });
    cancel.addEventListener('click', () => this.close());
    if (ex && this.plugin.isEditedBuiltin(ex.id)) {
      const reset = bar.createEl('button', { cls: 'wt-reset', text: t('btnReset') });
      reset.addEventListener('click', async () => {
        await this.plugin.resetExercise(ex.id);
        this.close();
      });
    }
  }

  collect() {
    const text = {};
    SUPPORTED_LANGS.forEach((code) => {
      const f = this.f[code];
      const v = (k) => (f[k].value || '').trim();
      const entry = { name: v('name'), muscles: v('muscles') };
      const steps = (f.steps.value || '').split('\n').map((s) => s.trim()).filter(Boolean);
      if (v('start')) entry.start = v('start');
      if (steps.length) entry.steps = steps;
      const lines = (k) => (f[k].value || '').split('\n').map((s) => s.trim()).filter(Boolean);
      if (lines('tips').length) entry.tips = lines('tips');
      if (lines('mistakes').length) entry.mistakes = lines('mistakes');
      if (v('safety')) entry.safety = v('safety');
      if (v('home')) entry.home = v('home');
      text[code] = entry;
    });
    return text;
  }

  async save() {
    const text = this.collect();
    if (SUPPORTED_LANGS.some((code) => !text[code].name)) {
      this.error.setText(t('formErrName'));
      return;
    }
    const video = parseVideoId(this.f.video.value);
    if (video === null) {
      this.error.setText(t('formErrVideo'));
      return;
    }
    const payload = { category: this.f.category.value, video: video || null, text };
    if (this.exercise) await this.plugin.updateExercise(this.exercise.id, payload);
    else await this.plugin.addExercise(payload);
    this.close();
  }

  onClose() {
    this.contentEl.empty();
  }
}

class ExerciseModal extends Modal {
  constructor(app, exercise, plugin) {
    super(app);
    this.exercise = exercise;
    this.plugin = plugin;
  }

  renderActions(bar) {
    const ex = this.exercise;
    bar.empty();
    const edit = bar.createEl('button', { cls: 'wt-edit', text: t('btnEdit') });
    edit.addEventListener('click', () => {
      this.close();
      new ExerciseFormModal(this.app, this.plugin, ex).open();
    });
    const del = bar.createEl('button', { cls: 'wt-delete wt-danger', text: t('btnDelete') });
    del.addEventListener('click', () => {
      bar.empty();
      bar.createSpan({ cls: 'wt-confirm-text', text: t('confirmDelete') });
      const yes = bar.createEl('button', { cls: 'wt-delete-yes wt-danger', text: t('confirmYes') });
      yes.addEventListener('click', async () => {
        await this.plugin.deleteExercise(ex.id);
        this.close();
      });
      const no = bar.createEl('button', { cls: 'wt-delete-no', text: t('btnCancel') });
      no.addEventListener('click', () => this.renderActions(bar));
    });
  }

  onOpen() {
    const ex = this.exercise;
    const tx = exText(ex);
    const { contentEl, modalEl, titleEl } = this;

    modalEl.addClass('wt-modal');
    titleEl.setText(tx.name);

    if (this.plugin) this.renderActions(contentEl.createDiv({ cls: 'wt-modal-actions' }));

    contentEl.createEl('p', {
      cls: 'wt-modal-muscles',
      text: t('targetMuscles') + (tx.muscles || ''),
    });

    const rank = RANKING_VIDEOS[ex.src];
    if (ex.tier && rank) {
      const line = contentEl.createDiv({ cls: 'wt-rank-line' });
      line.createSpan({ cls: 'wt-tier wt-tier-' + ex.tier, text: t('tier' + ex.tier) });
      line.createSpan({ text: ' ' + t('rankLabel') });
      line.createEl('a', { text: rank.title, href: 'https://www.youtube.com/watch?v=' + rank.id });
    }

    if (ex.band) contentEl.createEl('p', { cls: 'wt-note', text: t('bandNote') });
    if (ex.gear) contentEl.createEl('p', { cls: 'wt-note', text: t('gear_' + ex.gear) });
    if (ex.jerk) contentEl.createEl('p', { cls: 'wt-note', text: t('jerkNote') });
    if (ex.bar) contentEl.createEl('p', { cls: 'wt-note', text: t('barNote') });
    if (ex.neck) contentEl.createEl('p', { cls: 'wt-note', text: t('neckNote') });

    const has = (a) => a && a.length;
    const hasDetails = tx.start || has(tx.steps) || tx.safety || tx.home || has(tx.tips) || has(tx.mistakes);
    if (hasDetails) {
      if (tx.start) {
        contentEl.createEl('h4', { text: t('startPosition') });
        contentEl.createEl('p', { text: tx.start });
      }
      if (tx.steps && tx.steps.length) {
        contentEl.createEl('h4', { text: t('technique') });
        const ol = contentEl.createEl('ol');
        tx.steps.forEach((step) => ol.createEl('li', { text: step }));
      }
      if (has(tx.tips)) {
        contentEl.createEl('h4', { text: t('keyPoints') });
        const ul = contentEl.createEl('ul');
        tx.tips.forEach((s) => ul.createEl('li', { text: s }));
      }
      if (has(tx.mistakes)) {
        contentEl.createEl('h4', { text: t('commonMistakes') });
        const ul = contentEl.createEl('ul');
        tx.mistakes.forEach((s) => ul.createEl('li', { text: s }));
      }
      if (tx.safety) {
        const safety = contentEl.createDiv({ cls: 'wt-callout wt-callout-safety' });
        safety.createDiv({ cls: 'wt-callout-title', text: t('spineSafety') });
        safety.createDiv({ text: tx.safety });
      }
      if (tx.home) {
        const home = contentEl.createDiv({ cls: 'wt-callout wt-callout-home' });
        home.createDiv({ cls: 'wt-callout-title', text: t('atHome') });
        home.createDiv({ text: tx.home });
      }
    } else if (!ex.custom) {
      // Ranked entry without a technique description yet.
      contentEl.createEl('p', { cls: 'wt-note', text: t('detailsSoon') });
    }

    contentEl.createEl('h4', { text: t('videoTitle') });

    // No video ID: show a YouTube search link instead of the player.
    if (!ex.video) {
      contentEl.createEl('p', { cls: 'wt-note', text: t('noVideo') });
      contentEl.createEl('a', {
        cls: 'wt-video-link',
        text: t('findVideo'),
        href:
          'https://www.youtube.com/results?search_query=' +
          encodeURIComponent(ex.videoQuery || EXERCISE_TEXT.en[ex.id].name),
      });
      return;
    }

    const videoWrap = contentEl.createDiv({ cls: 'wt-video' });
    videoWrap.createEl('iframe', {
      attr: {
        src: 'https://www.youtube.com/embed/' + ex.video,
        title: tx.name,
        loading: 'lazy',
        allow:
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
        allowfullscreen: 'true',
        referrerpolicy: 'strict-origin-when-cross-origin',
      },
    });
    contentEl.createEl('a', {
      cls: 'wt-video-link',
      text: t('openYoutube'),
      href: 'https://www.youtube.com/watch?v=' + ex.video,
    });
  }

  onClose() {
    // Emptying destroys the iframe and stops playback.
    this.contentEl.empty();
  }
}

/* ==========================================================
 * INTERVAL TIMER (cardio days)
 * cfg: { work, rest, roundRest (sec), rounds: [options], restLabel? }
 * names: [{ name, sides }]; sides = beep on the middle of the work phase.
 * ========================================================== */
class IntervalTimer {
  constructor(container, cfg, names) {
    this.cfg = cfg;
    this.names = names;
    this.rounds = cfg.rounds[0];
    this.handle = null;
    this.audio = null;
    this.build(container);
    this.reset();
  }

  build(container) {
    const box = container.createDiv({ cls: 'wt-timer' });
    this.box = box;
    box.createDiv({ cls: 'wt-timer-title', text: t('timerTitle') });

    const sel = box.createDiv({ cls: 'wt-timer-rounds' });
    sel.createSpan({ text: t('timerRounds') });
    this.roundBtns = this.cfg.rounds.map((n) => {
      const b = sel.createEl('button', { cls: 'wt-timer-round-btn', text: String(n) });
      b.addEventListener('click', () => {
        this.rounds = n;
        this.reset();
      });
      return b;
    });

    this.phaseEl = box.createDiv({ cls: 'wt-timer-phase' });
    this.timeEl = box.createDiv({ cls: 'wt-timer-time' });
    this.exEl = box.createDiv({ cls: 'wt-timer-ex' });
    this.metaEl = box.createDiv({ cls: 'wt-timer-meta' });

    const controls = box.createDiv({ cls: 'wt-timer-controls' });
    this.startBtn = controls.createEl('button', { cls: 'mod-cta', text: t('timerStart') });
    this.skipBtn = controls.createEl('button', { text: t('timerSkip') });
    this.resetBtn = controls.createEl('button', { text: t('timerReset') });
    this.startBtn.addEventListener('click', () => this.toggle());
    this.skipBtn.addEventListener('click', () => this.skip());
    this.resetBtn.addEventListener('click', () => this.reset());
  }

  buildSteps() {
    const { work, rest, roundRest } = this.cfg;
    const n = this.names.length;
    const steps = [];
    for (let r = 1; r <= this.rounds; r++) {
      for (let i = 0; i < n; i++) {
        steps.push({
          type: 'work',
          dur: work,
          round: r,
          ex: i,
          sides: !!this.names[i].sides,
        });
        if (i < n - 1) {
          if (rest > 0) steps.push({ type: 'rest', dur: rest, round: r, ex: i + 1 });
        } else if (r < this.rounds) {
          steps.push({ type: 'roundRest', dur: roundRest, round: r + 1, ex: 0 });
        }
      }
    }
    return steps;
  }

  reset() {
    this.stopTicking();
    this.steps = this.buildSteps();
    this.idx = 0;
    this.running = false;
    this.finished = false;
    this.midDone = false;
    this.remaining = this.steps[0].dur * 1000;
    this.startBtn.setText(t('timerStart'));
    this.roundBtns.forEach((b, i) => {
      if (this.cfg.rounds[i] === this.rounds) b.addClass('is-active');
      else b.removeClass('is-active');
    });
    this.render();
  }

  toggle() {
    if (this.finished) this.reset();
    if (this.running) {
      this.pause();
      return;
    }
    this.unlockAudio();
    this.running = true;
    this.endAt = Date.now() + this.remaining;
    this.handle = setInterval(() => this.tick(), 200);
    this.startBtn.setText(t('timerPause'));
    this.beep(660, 150);
    this.render();
  }

  pause() {
    this.remaining = Math.max(0, this.endAt - Date.now());
    this.running = false;
    this.stopTicking();
    this.startBtn.setText(t('timerResume'));
    this.render();
  }

  skip() {
    if (this.finished) return;
    this.goTo(this.idx + 1, Date.now());
  }

  tick() {
    this.remaining = this.endAt - Date.now();
    const step = this.steps[this.idx];
    if (step.type === 'work' && step.sides && !this.midDone && this.remaining <= step.dur * 500) {
      this.midDone = true;
      this.beep(880, 250);
    }
    if (this.remaining <= 0) {
      this.goTo(this.idx + 1, this.endAt);
      return;
    }
    this.render();
  }

  goTo(idx, startFrom) {
    this.midDone = false;
    if (idx >= this.steps.length) {
      this.finish();
      return;
    }
    this.idx = idx;
    const dur = this.steps[idx].dur * 1000;
    if (this.running) {
      this.endAt = startFrom + dur;
      this.remaining = this.endAt - Date.now();
    } else {
      this.remaining = dur;
    }
    this.beep(this.steps[idx].type === 'work' ? 880 : 440, 300);
    this.render();
  }

  finish() {
    this.stopTicking();
    this.running = false;
    this.finished = true;
    this.remaining = 0;
    this.startBtn.setText(t('timerAgain'));
    this.beep(1000, 600);
    this.render();
  }

  render() {
    this.box.removeClass('is-work');
    this.box.removeClass('is-rest');

    if (this.finished) {
      this.phaseEl.setText(t('phaseDone'));
      this.timeEl.setText('00:00');
      this.exEl.setText(t('timerFinished'));
      this.metaEl.setText('');
      return;
    }

    const step = this.steps[this.idx];
    const secs = Math.max(0, Math.ceil(this.remaining / 1000));
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    this.timeEl.setText(mm + ':' + ss);

    const labels = {
      work: t('phaseWork'),
      rest: this.cfg.restLabel || t('phaseRest'),
      roundRest: t('phaseRoundRest'),
    };
    this.phaseEl.setText(labels[step.type]);

    const cur = this.names[step.ex];
    if (step.type === 'work') {
      let text = cur.name;
      if (cur.sides) text += this.midDone ? t('timerSwitchSide') : t('timerFirstSide');
      this.exEl.setText(text);
    } else {
      this.exEl.setText(t('timerNext', { name: cur.name }));
    }

    this.metaEl.setText(
      t('timerMeta', {
        r: step.round,
        n: this.rounds,
        i: step.ex + 1,
        m: this.names.length,
      })
    );
    this.box.addClass(step.type === 'work' ? 'is-work' : 'is-rest');
  }

  stopTicking() {
    if (this.handle !== null) {
      clearInterval(this.handle);
      this.handle = null;
    }
  }

  destroy() {
    this.stopTicking();
    try {
      if (this.audio) this.audio.close();
    } catch (e) {
      /* audio unavailable */
    }
    this.audio = null;
  }

  unlockAudio() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!this.audio) this.audio = new AC();
      if (this.audio.state === 'suspended') this.audio.resume();
    } catch (e) {
      /* audio unavailable */
    }
  }

  beep(freq, ms) {
    try {
      if (this.audio) {
        const osc = this.audio.createOscillator();
        const gain = this.audio.createGain();
        osc.frequency.value = freq;
        gain.gain.value = 0.15;
        osc.connect(gain);
        gain.connect(this.audio.destination);
        osc.start();
        osc.stop(this.audio.currentTime + ms / 1000);
      }
    } catch (e) {
      /* audio unavailable */
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(Math.min(ms, 300));
      }
    } catch (e) {
      /* vibration unavailable */
    }
  }
}

/* ==========================================================
 * MAIN VIEW
 * ========================================================== */
class WorkoutView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.route = { name: 'dashboard' };
    this.timer = null;
  }

  getViewType() {
    return VIEW_TYPE;
  }

  getDisplayText() {
    return t('viewName');
  }

  getIcon() {
    return 'dumbbell';
  }

  async onOpen() {
    this.contentEl.addClass('wt-root');
    this.render();
  }

  async onClose() {
    this.destroyTimer();
    this.contentEl.empty();
  }

  go(route) {
    this.route = route;
    this.render();
    this.contentEl.scrollTop = 0;
  }

  openExercise(id) {
    const ex = getExercise(id);
    if (ex) new ExerciseModal(this.app, ex, this.plugin).open();
  }

  destroyTimer() {
    if (this.timer) {
      this.timer.destroy();
      this.timer = null;
    }
  }

  render() {
    this.destroyTimer();
    const root = this.contentEl;
    root.empty();

    switch (this.route.name) {
      case 'category':
        this.renderCategory(root, this.route.key);
        break;
      case 'day':
        this.renderDay(root, this.route.key);
        break;
      default:
        this.renderDashboard(root);
    }
  }

  /* ---------- Header ---------- */
  renderHeader(root, title, withBack, addCategory) {
    const header = root.createDiv({ cls: 'wt-header' });
    if (withBack) {
      const back = header.createEl('button', { cls: 'wt-back', text: t('backHome') });
      back.addEventListener('click', () => this.go({ name: 'dashboard' }));
    }
    header.createEl('h1', { text: title });
    const add = header.createEl('button', { cls: 'wt-add', text: '+' });
    add.setAttr('aria-label', t('addExercise'));
    add.setAttr('title', t('addExercise'));
    add.addEventListener('click', () =>
      new ExerciseFormModal(this.app, this.plugin, null, addCategory).open()
    );
    this.renderLangToggle(header);
  }

  /** Compact EN | RU switch; the choice is saved to the plugin settings. */
  renderLangToggle(header) {
    const box = header.createDiv({ cls: 'wt-lang' });
    SUPPORTED_LANGS.forEach((code) => {
      const btn = box.createEl('button', {
        cls: 'wt-lang-btn' + (code === LANG ? ' is-active' : ''),
        text: code.toUpperCase(),
      });
      btn.setAttr('aria-label', LANG_NAMES[code]);
      btn.setAttr('title', LANG_NAMES[code]);
      btn.addEventListener('click', () => this.changeLanguage(code));
    });
  }

  async changeLanguage(code) {
    if (!this.plugin) return;
    if (code === LANG && this.plugin.settings.language === code) return;
    this.plugin.settings.language = code;
    await this.plugin.saveSettings();
    this.plugin.applyLanguage();
  }

  /* ---------- Dashboard ---------- */
  renderDashboard(root) {
    this.renderHeader(root, '🏋️ Workout Vault', false);
    root.createEl('p', { cls: 'wt-subtitle', text: t('dashSubtitle') });

    const renderDayCards = (container, list) => {
      list.forEach((day) => {
        const tx = dayText(day);
        const card = container.createDiv({ cls: 'wt-card wt-day-card ' + day.cls });
        card.createDiv({ cls: 'wt-card-icon', text: day.icon });
        card.createDiv({ cls: 'wt-card-title', text: tx.title });
        card.createDiv({
          cls: 'wt-card-meta',
          text: tx.meta || t('exercisesCount', { n: countExercisesInDay(day) }),
        });
        makeClickable(card, () => this.go({ name: 'day', key: day.key }));
      });
    };

    root.createEl('h2', { cls: 'wt-section-title', text: t('strengthSection') });
    renderDayCards(
      root.createDiv({ cls: 'wt-grid' }),
      WORKOUT_PROGRAM.filter((d) => !d.cardio)
    );

    root.createEl('h2', { cls: 'wt-section-title', text: t('cardioSection') });
    renderDayCards(
      root.createDiv({ cls: 'wt-grid' }),
      WORKOUT_PROGRAM.filter((d) => d.cardio)
    );

    root.createEl('h2', { cls: 'wt-section-title', text: t('muscleSection') });
    const cats = root.createDiv({ cls: 'wt-grid' });
    CATEGORIES.forEach((cat) => {
      const count = EXERCISES_DATABASE.filter((e) => e.category === cat.key).length;
      const card = cats.createDiv({ cls: 'wt-card' });
      card.createDiv({ cls: 'wt-card-icon', text: cat.icon });
      card.createDiv({ cls: 'wt-card-title', text: catTitle(cat.key) });
      card.createDiv({ cls: 'wt-card-meta', text: t('categoryCount', { n: count }) });
      makeClickable(card, () => this.go({ name: 'category', key: cat.key }));
    });
  }

  /* ---------- Category ---------- */
  renderCategory(root, key) {
    const cat = getCategory(key);
    this.renderHeader(root, cat ? cat.icon + ' ' + catTitle(key) : key, true, key);

    const items = EXERCISES_DATABASE.filter((e) => e.category === key);
    const hasRanks = items.some((e) => e.tier);

    // Same template as the ATHLEAN-X rankings: best tier first, unranked last.
    TIER_ORDER.forEach((tier) => {
      const group = items.filter((e) => (e.tier || 0) === tier);
      if (!group.length) return;
      if (hasRanks) {
        root.createEl('h3', {
          cls: 'wt-tier-title',
          text: tier ? '★ ' + t('tier' + tier) : t('tierNone'),
        });
      }
      const list = root.createDiv({ cls: 'wt-list' });
      group.forEach((ex) => {
        const tx = exText(ex);
        const row = list.createDiv({ cls: 'wt-row' });
        const left = row.createDiv();
        addTierBadge(left.createDiv({ cls: 'wt-row-name', text: tx.name }), ex);
        left.createDiv({ cls: 'wt-row-muscles', text: tx.muscles });
        makeClickable(row, () => this.openExercise(ex.id));
      });
    });
  }

  /* ---------- Day ---------- */
  renderDay(root, key) {
    const day = WORKOUT_PROGRAM.find((d) => d.key === key);
    if (!day) {
      this.go({ name: 'dashboard' });
      return;
    }
    const tx = dayText(day);

    this.renderHeader(root, day.icon + ' ' + tx.title, true);
    root.createEl('p', { cls: 'wt-subtitle', text: t('daySubtitle') });

    if (tx.info) {
      const info = root.createDiv({ cls: 'wt-callout wt-callout-info' });
      tx.info.forEach((line) => info.createDiv({ text: line }));
    }

    if (day.timer) {
      const names = [];
      day.blocks.forEach((b) =>
        b.items.forEach((it) => {
          const ex = getExercise(it.id);
          if (ex) names.push({ name: exText(ex).name, sides: !!it.sides });
        })
      );
      const cfg = Object.assign({}, day.timer, { restLabel: tx.restLabel });
      this.timer = new IntervalTimer(root, cfg, names);
    }

    day.blocks.forEach((block, bi) => {
      const bt = (tx.blocks && tx.blocks[bi]) || { label: '', schemes: [] };
      const wrap = root.createDiv({ cls: 'wt-block' });
      const label = wrap.createDiv({ cls: 'wt-block-label' });
      label.createSpan({ text: bt.label });
      if (block.kind === 'superset') label.createSpan({ cls: 'wt-badge', text: t('supersetBadge') });

      const list = wrap.createDiv({ cls: 'wt-list' });
      block.items.forEach((item, idx) => {
        if (block.kind === 'alt' && idx > 0) {
          list.createDiv({ cls: 'wt-or', text: t('orLabel') });
        }
        const ex = getExercise(item.id);
        if (!ex) return;
        const etx = exText(ex);

        const row = list.createDiv({ cls: 'wt-row' });
        const left = row.createDiv();
        addTierBadge(left.createDiv({ cls: 'wt-row-name', text: etx.name }), ex);
        left.createDiv({ cls: 'wt-row-muscles', text: etx.muscles });
        row.createDiv({ cls: 'wt-row-scheme', text: (bt.schemes && bt.schemes[idx]) || '' });
        makeClickable(row, () => this.openExercise(ex.id));
      });
    });

    root.createDiv({ cls: 'wt-note', text: tx.note || t('everyOtherDay') });
  }
}

/* ==========================================================
 * SETTINGS
 * ========================================================== */
class WorkoutSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName(t('settingsLanguage'))
      .setDesc(t('settingsLanguageDesc'))
      .addDropdown((dd) =>
        dd
          .addOption('auto', t('langAuto'))
          .addOption('en', 'English')
          .addOption('ru', 'Русский')
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings.language = value;
            await this.plugin.saveSettings();
            this.plugin.applyLanguage();
            this.display();
          })
      );

    const n = normalizeUserData(this.plugin.settings.user).deleted.length;
    new Setting(containerEl)
      .setName(t('settingsRestore'))
      .setDesc(t('settingsRestoreDesc', { n }))
      .addButton((b) =>
        b.setButtonText(t('settingsRestoreBtn')).onClick(async () => {
          await this.plugin.restoreDeleted();
          this.display();
        })
      );
  }
}

/* ==========================================================
 * PLUGIN
 * ========================================================== */
module.exports = class WorkoutHelperPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({ language: 'auto' }, await this.loadData());
    this.settings.user = normalizeUserData(this.settings.user);
    applyUserData(this.settings.user);
    setLang(resolveLang(this.settings.language));

    this.registerView(VIEW_TYPE, (leaf) => new WorkoutView(leaf, this));

    this.addRibbonIcon('dumbbell', t('ribbonTitle'), () => this.activateView());

    this.addCommand({
      id: 'open-workout-vault',
      name: t('commandOpen'),
      callback: () => this.activateView(),
    });

    this.addSettingTab(new WorkoutSettingTab(this.app, this));
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  refreshViews() {
    this.app.workspace.getLeavesOfType(VIEW_TYPE).forEach((leaf) => {
      if (leaf.view && typeof leaf.view.render === 'function') leaf.view.render();
    });
  }

  async commitUserData() {
    await this.saveSettings();
    applyUserData(this.settings.user);
    this.refreshViews();
  }

  isEditedBuiltin(id) {
    return !!this.settings.user.edited[id];
  }

  async addExercise(payload) {
    const u = this.settings.user;
    const id = Math.max(CUSTOM_ID_START - 1, ...u.added.map((a) => a.id)) + 1;
    u.added.push(Object.assign({ id }, payload));
    await this.commitUserData();
    return id;
  }

  async updateExercise(id, payload) {
    const u = this.settings.user;
    const idx = u.added.findIndex((a) => a.id === id);
    if (idx >= 0) u.added[idx] = Object.assign({ id }, payload);
    else u.edited[id] = { meta: { category: payload.category, video: payload.video }, text: payload.text };
    await this.commitUserData();
  }

  async deleteExercise(id) {
    const u = this.settings.user;
    const idx = u.added.findIndex((a) => a.id === id);
    if (idx >= 0) u.added.splice(idx, 1);
    else {
      if (!u.deleted.includes(id)) u.deleted.push(id);
      delete u.edited[id];
    }
    await this.commitUserData();
  }

  async resetExercise(id) {
    delete this.settings.user.edited[id];
    await this.commitUserData();
  }

  async restoreDeleted() {
    this.settings.user.deleted = [];
    await this.commitUserData();
  }

  /** Applies the chosen language and redraws any open Workout Vault views. */
  applyLanguage() {
    setLang(resolveLang(this.settings.language));
    this.app.workspace.getLeavesOfType(VIEW_TYPE).forEach((leaf) => {
      if (leaf.view && typeof leaf.view.render === 'function') leaf.view.render();
    });
  }

  async activateView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE)[0];

    if (!leaf) {
      leaf = workspace.getLeaf('tab');
      await leaf.setViewState({ type: VIEW_TYPE, active: true });
    }
    workspace.revealLeaf(leaf);
  }
};

// Exposed for tests outside Obsidian.
module.exports.__data = { CATEGORIES, EXERCISES_DATABASE, WORKOUT_PROGRAM, RANKING_VIDEOS, applyUserData, parseVideoId };
module.exports.__i18n = {
  t, setLang, resolveLang, exText, dayText, catTitle,
  STRINGS, EXERCISE_TEXT, DAY_TEXT, CATEGORY_TITLES, SUPPORTED_LANGS,
};
