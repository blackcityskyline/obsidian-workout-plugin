# Workout Vault: roadmap for this fork

Owner goal: one Obsidian vault for home training and nutrition. This fork of Workout Planner is the base;
our own reference plugin ("Workout Helper", private repo `blackcityskyline/workout-helper`, branch `ranking`,
v1.7.0, sources in its `dev/` folder, `sh dev/build.sh`) is merged into it as the exercise reference.

## Requirements (from the owner)

1. Exercise base with ranking and technique (done in Workout Helper).
2. Workout builder from exercises (A/B/C days, HIIT, light cardio, timers) (done in Workout Helper).
3. Manual dated notes about workouts.
4. Daily Report Card (DRC).
5. Workout logging: body weight, weights, reps, duration, workout type (strength, cardio, flexibility...), exercises per day, tied to the calendar.
6. Meal/diet builder + food base with macros and amino-acid profile (like 1 and 2, for food).
7. Food logging per meal (breakfast, lunch, dinner, snack), macros and vitamins, tied to the calendar.

Owner constraints: scoliosis, hyperlordosis, cervical osteochondrosis (no heavy axial loads, no jerks, no lumbar hyperextension);
equipment: dumbbells up to 16 kg, 20 kg bar, sofa, chair, floor, jump rope, bands; pull-up bar and dips are allowed.
Owner does NOT want a 1000-exercise catalog: only our curated set (about 90, ranked), plus own additions.
UI languages: English primary, Russian overlay (Planner already has `app/i18n/locales/ru.json`).

## Already provided by Planner (do not rebuild)

Workout log CSV (`WorkoutLogFile`), exercise types strength/cardio/flexibility, `workout-log` / `workout-sets` /
`workout-session` / `workout-timer` / `workout-chart` / `workout-dashboard` blocks, training calendar widget,
muscle heat map, PRs, i18n for 23 languages, Dataview API, Strong/Hevy import.

## Phase 1: exercise reference inside Planner

- Convert our data (`dev/neutral.js`, `en.js`, `ru.js`) to exercise pages (markdown + frontmatter) read by `ExerciseLibrary`
  (see CONTEXT.md "Exercise Pages"; match by file name / `exercise_name`). Frontmatter to add: `tier` (2-5), `rank_source`,
  `equipment` (band, bar, landmine, trap bar, rack), `neck_warning`, `jerk_warning`, `video`, `muscles`.
  Body sections: start position, technique steps, key points, common mistakes, spine safety, at home.
- Create them through the "Create examples"/exercise-pages generator path (ExampleGeneratorService), never overwriting user files.
- Show tier badge and warnings in the exercise page header / log modal. Group the exercise list by tier.
- Convert program days A, B, C, H1, H2, H3 into workout notes (`workout-sets` blocks, rest timers, HIIT via `workout-timer` interval).
- Every new UI string goes to `app/i18n/locales/en.json` only (translation job fills the rest); add Russian by hand if needed.
- Drop duplicated pieces of Workout Helper (its own add/edit/delete UI) once pages exist; keep it only as the data source.

## Phase 2: dated data modules (new, each as dashboard widget + code block, tested)

1. Body weight / measurements log (own CSV through `CsvCodec`, chart widget, link to training days).
2. Dated notes: note per day (folder + frontmatter `date`), shown in the calendar widget and in the day view.
3. Daily Report Card: one note per day assembled from training (`TrainingHistory`), body weight, nutrition totals, free text.
4. Calendar: extend the training calendar widget with notes, weight and meals markers.

## Phase 3: nutrition (mirror of phases 1 and 2 for food)

- Food base: curated list (pages with macros per 100 g, vitamins, amino-acid profile); no huge import.
- Meal builder (like workout builder) and food log CSV: date, meal (breakfast/lunch/dinner/snack), food, grams, computed macros and vitamins.
- Daily totals widget vs targets (recomposition, 75-80 kg, 177 cm), included in DRC.

## Working rules for this repo (from CLAUDE.md)

Follow service-layer patterns, tests with Jest, strings only in `en.json`, `npm run lint` at zero warnings,
never edit `main.js`/`styles.css` directly. Work on feature branches, not `main`. Check `competitor-scan` skill before adding features.

## Open questions for the owner

- Technique texts for the 61 imported exercises have no spine-safety/at-home blocks; add them?
- Strengthen warnings for rack pulls, dead rows, high pulls (explosive) and deep dips?
- Chest ranking video text was incomplete (Almost best / Best tiers missing); paste if needed.
