const path = require('path');
const NEW = require(path.join(__dirname, 'new-main.js'));
const { EXERCISES_DATABASE: DB, WORKOUT_PROGRAM: PROG, parseVideoId } = NEW.__data;
const I = NEW.__i18n;
const { Modal, Setting } = require('obsidian');
const errors = []; const err = (m) => errors.push(m);
const find = (el, pred, out = []) => { if (pred(el)) out.push(el); el.children.forEach((c) => find(c, pred, out)); return out; };
const cls = (el, c) => find(el, (e) => e.cls.has(c));
const click = async (el) => { await el.listeners.click[0](); };
const set = (m, c, v) => { const e = cls(m.contentEl, c)[0]; if (!e) err('no field ' + c); else e.value = v; };
const N0 = DB.length;

(async () => {
  // video id parsing
  const cases = [['dQw4w9WgXcQ', 'dQw4w9WgXcQ'], ['https://youtu.be/TqXwI1MWZks?si=x', 'TqXwI1MWZks'], ['https://www.youtube.com/watch?v=YqFfh5IZUBs&t=5s', 'YqFfh5IZUBs'], ['', ''], ['not a link', null]];
  cases.forEach(([i, o]) => { if (parseVideoId(i) !== o) err('parseVideoId ' + i + ' -> ' + parseVideoId(i)); });

  const plugin = new NEW(); plugin.saved = { language: 'en' }; await plugin.onload();
  const v = plugin.views['workout-helper-view']({}); plugin.leaves = [{ view: v }]; await v.onOpen();

  // --- add via "+" on a category page
  v.go({ name: 'category', key: 'shoulders' });
  const plus = cls(v.contentEl, 'wt-add');
  if (plus.length !== 1) err('plus button count ' + plus.length);
  await click(plus[0]);
  let m = Modal.last;
  if (cls(m.contentEl, 'wt-f-category')[0].value !== 'shoulders') err('category not preselected');
  // validation: empty names
  await click(cls(m.contentEl, 'wt-save')[0]);
  if (!cls(m.contentEl, 'wt-form-error')[0].text) err('no name error'); 
  if (DB.length !== N0) err('added despite invalid');
  set(m, 'wt-f-en-name', 'My shrug'); set(m, 'wt-f-ru-name', 'Моя тяга');
  set(m, 'wt-f-video', 'garbage');
  await click(cls(m.contentEl, 'wt-save')[0]);
  if (DB.length !== N0) err('added with bad video');
  set(m, 'wt-f-video', 'https://youtu.be/TqXwI1MWZks?si=x');
  set(m, 'wt-f-en-muscles', 'Delts'); set(m, 'wt-f-ru-muscles', 'Дельты');
  set(m, 'wt-f-en-steps', 'Lift\n\nLower'); set(m, 'wt-f-ru-steps', 'Подними\nОпусти');
  set(m, 'wt-f-ru-safety', 'Осторожно');
  await click(cls(m.contentEl, 'wt-save')[0]);
  if (DB.length !== N0 + 1) err('not added');
  const added = DB.find((e) => e.custom);
  if (!added || added.id !== 1000 || added.category !== 'shoulders' || added.video !== 'TqXwI1MWZks') err('added entry ' + JSON.stringify(added));
  if (I.EXERCISE_TEXT.en[1000].name !== 'My shrug' || I.EXERCISE_TEXT.ru[1000].name !== 'Моя тяга') err('texts');
  if (JSON.stringify(I.EXERCISE_TEXT.en[1000].steps) !== '["Lift","Lower"]') err('steps split');
  const names = () => cls(v.contentEl, 'wt-row-name').map((e) => e.text);
  if (!names().includes('My shrug')) err('not listed after add');
  v.openExercise(1000);
  const em = Modal.last;
  const texts = []; (function w(e) { if (e.text) texts.push(e.text); e.children.forEach(w); })(em.contentEl);
  if (texts.includes(I.STRINGS.en.detailsSoon)) err('custom shows detailsSoon');
  if (!texts.includes('Lift')) err('steps not rendered');
  em.onClose();
  // persisted and reloaded
  if (plugin.saved.user.added.length !== 1) err('not persisted');
  const p2 = new NEW(); p2.saved = JSON.parse(JSON.stringify(plugin.saved)); await p2.onload();
  if (!DB.find((e) => e.id === 1000)) err('not restored on load');

  // language switch shows RU name
  await click(cls(v.contentEl, 'wt-lang-btn')[1]);
  if (!names().includes('Моя тяга')) err('ru name missing');
  await click(cls(v.contentEl, 'wt-lang-btn')[0]);

  // --- edit custom
  v.openExercise(1000); let em2 = Modal.last;
  await click(cls(em2.contentEl, 'wt-edit')[0]);
  m = Modal.last;
  if (cls(m.contentEl, 'wt-f-en-name')[0].value !== 'My shrug' || cls(m.contentEl, 'wt-f-ru-steps')[0].value !== 'Подними\nОпусти') err('prefill');
  if (cls(m.contentEl, 'wt-reset').length) err('reset shown for custom');
  set(m, 'wt-f-en-name', 'My shrug 2');
  await click(cls(m.contentEl, 'wt-save')[0]);
  if (I.EXERCISE_TEXT.en[1000].name !== 'My shrug 2' || DB.filter((e) => e.custom).length !== 1) err('custom edit');

  // --- edit built-in (id 10), then reset
  v.go({ name: 'category', key: 'chest' });
  const baseRuName = I.EXERCISE_TEXT.ru[10].name;
  v.openExercise(10); em2 = Modal.last;
  await click(cls(em2.contentEl, 'wt-edit')[0]);
  m = Modal.last;
  if (cls(m.contentEl, 'wt-f-ru-name')[0].value !== baseRuName) err('built-in prefill');
  if (cls(m.contentEl, 'wt-reset').length) err('reset shown before edit');
  set(m, 'wt-f-ru-name', 'Мой жим'); set(m, 'wt-f-video', '');
  await click(cls(m.contentEl, 'wt-save')[0]);
  const e10 = DB.find((e) => e.id === 10);
  if (I.EXERCISE_TEXT.ru[10].name !== 'Мой жим' || e10.video !== null || e10.tier !== 5) err('built-in edit ' + JSON.stringify(e10));
  v.openExercise(10); em2 = Modal.last;
  await click(cls(em2.contentEl, 'wt-edit')[0]); m = Modal.last;
  if (!cls(m.contentEl, 'wt-reset').length) err('reset missing after edit');
  await click(cls(m.contentEl, 'wt-reset')[0]);
  if (I.EXERCISE_TEXT.ru[10].name !== baseRuName || !DB.find((e) => e.id === 10).video) err('reset');

  // --- delete built-in (16) with confirmation, program row skipped, restore from settings
  v.openExercise(16); em2 = Modal.last;
  await click(cls(em2.contentEl, 'wt-delete')[0]);
  if (!DB.find((e) => e.id === 16)) err('deleted without confirm');
  await click(cls(em2.contentEl, 'wt-delete-no')[0]);
  if (!cls(em2.contentEl, 'wt-delete').length) err('cancel did not restore buttons');
  await click(cls(em2.contentEl, 'wt-delete')[0]);
  await click(cls(em2.contentEl, 'wt-delete-yes')[0]);
  if (DB.find((e) => e.id === 16)) err('not deleted');
  if (I.EXERCISE_TEXT.en[16]) err('text kept after delete');
  v.go({ name: 'day', key: 'B' }); // contains id 16: must render without crashing
  const rowsB = cls(v.contentEl, 'wt-row').length;
  if (rowsB !== 7) err('day B rows after delete ' + rowsB);
  // settings restore
  plugin.tabs[0].display();
  const restore = Setting.all.filter((s) => s.button).pop();
  if (!restore.desc.includes('1')) err('restore count in desc: ' + restore.desc);
  await restore.button.handler();
  if (!DB.find((e) => e.id === 16) || !I.EXERCISE_TEXT.ru[16]) err('restore');

  // --- delete custom
  v.openExercise(1000); em2 = Modal.last;
  await click(cls(em2.contentEl, 'wt-delete')[0]); await click(cls(em2.contentEl, 'wt-delete-yes')[0]);
  if (DB.length !== N0 || plugin.settings.user.deleted.length) err('custom delete left traces ' + DB.length + ' ' + JSON.stringify(plugin.settings.user));

  // --- dashboard "+" defaults to first category; final state identical to builtin
  v.go({ name: 'dashboard' });
  await click(cls(v.contentEl, 'wt-add')[0]);
  if (cls(Modal.last.contentEl, 'wt-f-category')[0].value !== 'legs' && !cls(Modal.last.contentEl, 'wt-f-category')[0].value) err('dashboard default category');
  console.log('errors:', errors.length ? errors : 'none');
  process.exit(errors.length ? 1 : 0);
})();
