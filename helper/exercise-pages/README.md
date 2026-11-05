# Generated exercise pages (Workout Planner format)

91 exercises x 2 languages (`en/`, `ru/`), one folder per category. Generated, do not edit by hand:
`NODE_PATH=helper/workout-helper/dev/mock/node_modules node helper/tools/export-exercise-pages.js`

Use: copy `en/` or `ru/` into the vault's exercise folder (Settings -> exercise folder). Frontmatter follows `CONTEXT.md`
"Exercise page frontmatter" (`exercise_name`, `exercise_type`, `tags` = canonical muscle ids) plus our fields:
`tier` (2-5), `rank_source`, `video`, `aliases` (name in the other language), `equipment_*`, `neck_warning`, `jerk_warning`, `helper_id`.
Next step (phase 1, step 2): a plugin command "Create reference exercise pages" that writes these pages without overwriting existing files.
