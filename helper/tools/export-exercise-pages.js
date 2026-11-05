#!/usr/bin/env node
// Writes the Workout Helper exercise base as Workout Planner exercise pages (markdown + frontmatter).
// Usage (from repo root):  NODE_PATH=helper/workout-helper/dev/mock/node_modules node helper/tools/export-exercise-pages.js [outDir]
// Output: <outDir>/<en|ru>/<category>/<exercise name>.md  (default outDir: helper/exercise-pages)
const fs = require('fs');
const path = require('path');
const Helper = require(path.resolve(__dirname, '../workout-helper/main.js'));
const { CATEGORIES, EXERCISES_DATABASE: DB, RANKING_VIDEOS } = Helper.__data;
const I = Helper.__i18n;
const out = path.resolve(process.argv[2] || path.join(__dirname, '../exercise-pages'));

// words in the English "muscles" text -> canonical muscle tag of Workout Planner (MUSCLE_GROUPS)
const TAGS = [
  [/upper chest/i, 'upper_chest'], [/\bchest\b/i, 'chest'], [/\blats?\b/i, 'lats'], [/mid-back|rhomboid/i, 'rhomboids'],
  [/rear delt/i, 'rear_delts'], [/side delt|lateral delt/i, 'side_delts'], [/front delt/i, 'front_delts'],
  [/\bdelts?\b|shoulder/i, 'shoulders'], [/trapez|\btraps?\b/i, 'traps'], [/biceps/i, 'biceps'], [/triceps/i, 'triceps'],
  [/quadricep|\bquads\b/i, 'quads'], [/hamstring/i, 'hamstrings'], [/glute/i, 'glutes'], [/calves|calf/i, 'calves'],
  [/lower back|erector|spinal/i, 'lower_back'], [/oblique/i, 'obliques'], [/\babs\b|abdominis|rectus/i, 'abs'],
  [/\bcore\b/i, 'core'], [/forearm|grip/i, 'forearms'], [/\bback\b/i, 'back'],
];
const tagsFor = (ex, enMuscles) => {
  const set = new Set();
  TAGS.forEach(([re, id]) => { if (re.test(enMuscles)) set.add(id); });
  if (set.has('upper_chest') || set.has('chest')) set.add('chest');
  return [...set];
};
const safeName = (s) => s.replace(/[\\/:*?"<>|#^\[\]]/g, '-').replace(/\s+/g, ' ').trim();
const yaml = (v) => (/[:#\[\]{},&*!|>'"%@`]|^\s|\s$|^[-?]/.test(v) ? JSON.stringify(v) : v);
const list = (a) => a.map((s) => `- ${s}`).join('\n');

const report = { noTags: [], count: 0 };
for (const lang of ['en', 'ru']) {
  I.setLang(lang);
  const S = I.STRINGS[lang];
  const other = lang === 'en' ? 'ru' : 'en';
  for (const ex of DB) {
    const tx = Object.assign({}, I.EXERCISE_TEXT.en[ex.id], I.EXERCISE_TEXT[lang][ex.id]);
    const otherName = I.EXERCISE_TEXT[other][ex.id].name;
    const tags = tagsFor(ex, I.EXERCISE_TEXT.en[ex.id].muscles || '');
    if (!tags.length) report.noTags.push(ex.id + ' ' + tx.name);
    const cat = CATEGORIES.find((c) => c.key === ex.category);
    const type = ex.category === 'cardio' ? 'cardio' : 'strength';
    const videoUrl = ex.video
      ? `https://www.youtube.com/watch?v=${ex.video}`
      : `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.videoQuery || I.EXERCISE_TEXT.en[ex.id].name)}`;
    const rank = ex.tier && RANKING_VIDEOS[ex.src] ? `https://www.youtube.com/watch?v=${RANKING_VIDEOS[ex.src].id}` : null;
    const fm = [
      '---',
      `exercise_name: ${yaml(tx.name)}`,
      `exercise_type: ${type}`,
      tags.length ? `tags:\n${list(tags)}` : null,
      `aliases:\n- ${yaml(otherName)}`,
      `category: ${ex.category}`,
      ex.tier ? `tier: ${ex.tier}` : null,
      rank ? `rank_source: ${rank}` : null,
      `video: ${videoUrl}`,
      ex.band ? 'equipment_band: true' : null,
      ex.bar ? 'equipment_bar: true' : null,
      ex.gear ? `equipment_gear: ${ex.gear}` : null,
      ex.neck ? 'neck_warning: true' : null,
      ex.jerk ? 'jerk_warning: true' : null,
      `helper_id: ${ex.id}`,
      '---',
    ].filter(Boolean).join('\n');
    const body = [`# ${tx.name}`];
    if (ex.tier) body.push(`**${S['tier' + ex.tier]}**${rank ? ` · [${RANKING_VIDEOS[ex.src].title}](${rank})` : ''}`);
    if (tx.muscles) body.push(`**${S.targetMuscles.replace(/:\s*$/, '')}:** ${tx.muscles}`);
    const notes = [];
    if (ex.band) notes.push(S.bandNote);
    if (ex.gear) notes.push(S['gear_' + ex.gear]);
    if (ex.bar) notes.push(S.barNote);
    if (ex.neck) notes.push(S.neckNote);
    if (ex.jerk) notes.push(S.jerkNote);
    notes.forEach((n) => body.push(`> [!warning] ${n}`));
    if (tx.start) body.push(`## ${S.startPosition}\n\n${tx.start}`);
    if (tx.steps && tx.steps.length) body.push(`## ${S.technique}\n\n${tx.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`);
    if (tx.tips && tx.tips.length) body.push(`## ${S.keyPoints}\n\n${list(tx.tips)}`);
    if (tx.mistakes && tx.mistakes.length) body.push(`## ${S.commonMistakes}\n\n${list(tx.mistakes)}`);
    if (tx.safety) body.push(`## ${S.spineSafety}\n\n${tx.safety}`);
    if (tx.home) body.push(`## ${S.atHome}\n\n${tx.home}`);
    body.push(`## Video\n\n${videoUrl}`);
    const dir = path.join(out, lang, ex.category);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, safeName(tx.name) + '.md'), fm + '\n\n' + body.join('\n\n') + '\n');
    report.count++;
  }
}
console.log('pages written:', report.count, '->', out);
console.log('without muscle tags:', report.noTags.length ? report.noTags.join('; ') : 'none');
