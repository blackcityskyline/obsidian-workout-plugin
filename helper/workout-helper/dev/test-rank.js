const path = require('path');
const B = __dirname;
const NEW = require(path.join(B, process.argv[2] || 'new-main.js'));
const OLD = require(path.join(B, 'old-main.js'));
const { CATEGORIES, EXERCISES_DATABASE: DB, WORKOUT_PROGRAM: PROG, RANKING_VIDEOS } = NEW.__data;
const I = NEW.__i18n;
const O = OLD.__data;
const errors = [];
const err = (m) => errors.push(m);
const CYR = /[А-Яа-яЁё]/;
const ids = DB.map((e) => e.id);

function walkStrings(v, cb, p = '') {
  if (typeof v === 'string') cb(v, p);
  else if (Array.isArray(v)) v.forEach((x, i) => walkStrings(x, cb, p + '[' + i + ']'));
  else if (v && typeof v === 'object') Object.keys(v).forEach((k) => walkStrings(v[k], cb, p + '.' + k));
}

/* 1. dropped exercises are gone everywhere */
const DROPPED = [5, 7, 18, 11, 20, 23];
DROPPED.forEach((d) => {
  if (ids.includes(d)) err('dropped id still in DB ' + d);
  if (I.EXERCISE_TEXT.en[d] || I.EXERCISE_TEXT.ru[d]) err('dropped id still has text ' + d);
  PROG.forEach((p) => p.blocks.forEach((b) => b.items.forEach((i) => { if (i.id === d) err('dropped id in program ' + d); })));
});
if (new Set(ids).size !== ids.length) err('duplicate ids');
if (DB.length !== 91) err('exercise count ' + DB.length + ' (expected 91)');

/* 2. ranking data */
const byTier = { 2: [], 3: [], 4: [], 5: [] };
if (sorted0(DB.filter((e) => e.neck).map((e) => e.id)) !== '42,43,44,47,95,96,97') err('neck set');
function sorted0(a) { return a.slice().sort((x, y) => x - y).join(); }
DB.forEach((e) => {
  if (e.tier === undefined) { if (e.src) err('src without tier ' + e.id); return; }
  if (![2, 3, 4, 5].includes(e.tier)) err('tier outside 2–5 for ' + e.id + ': ' + e.tier);
  if (!RANKING_VIDEOS[e.src]) err('unknown ranking source for ' + e.id);
  else if (!/^[\w-]{11}$/.test(RANKING_VIDEOS[e.src].id)) err('odd video id ' + e.src);
  if (byTier[e.tier]) byTier[e.tier].push(e.id);
});
const sorted = (a) => a.slice().sort((x, y) => x - y).join();
if (sorted0(DB.filter((e) => e.bar).map((e) => e.id)) !== '86,87,88,89,90,91') err('bar set');
if (sorted(byTier[2]) !== '17') err('tier 2 set');
if (sorted(byTier[5]) !== sorted([6, 10, 15, 21, 54, 55, 56, 68, 72, 86, 95])) err('tier 5 set: ' + sorted(byTier[5]));
if (sorted(byTier[4]) !== sorted([14, 39, 40, 41, 45, 46, 47, 48, 52, 53, 61, 62, 64, 65, 66, 67, 71, 73, 74, 82, 83, 84, 85, 87, 90, 91, 92, 93, 94])) err('tier 4 set: ' + sorted(byTier[4]));
if (sorted(byTier[3]) !== sorted([12, 36, 37, 38, 42, 43, 44, 49, 50, 51, 57, 58, 59, 60, 63, 69, 70, 75, 76, 77, 78, 79, 80, 81, 88, 89, 96, 97])) err('tier 3 set: ' + sorted(byTier[3]));
const bandIds = DB.filter((e) => e.band).map((e) => e.id);
if (sorted(bandIds) !== sorted([37, 38, 39, 40, 45, 48, 51, 55, 59, 73, 74, 76, 77, 79, 80, 84, 92])) err('band set: ' + sorted(bandIds));
console.log('ranked:', 'tier5=' + byTier[5].length, 'tier4=' + byTier[4].length, 'tier3=' + byTier[3].length, '| band:', bandIds.length, '| unranked:', DB.filter((e) => !e.tier).length);

/* 3. program: all references exist, repaired slots */
PROG.forEach((d) => d.blocks.forEach((b) => b.items.forEach((i) => { if (!ids.includes(i.id)) err('program ref missing ' + i.id); })));
const slot = (day, bi) => PROG.find((d) => d.key === day).blocks[bi].items.map((i) => i.id).join();
if (slot('A', 1) !== '36') err('Day A back slot ' + slot('A', 1));
if (slot('A', 3) !== '27') err('Day A posture slot ' + slot('A', 3));
if (slot('C', 1) !== '36') err('Day C back slot ' + slot('C', 1));
if (slot('C', 5) !== '17,21') err('Day C arms slot ' + slot('C', 5));
if (slot('A', 5) !== '22,33' || slot('B', 2) !== '10' || slot('B', 4) !== '16,19' || slot('C', 6) !== '33,9') err('core/chest/arms repairs');
// everything else in the program is untouched
PROG.forEach((d) => {
  const o = O.WORKOUT_PROGRAM.find((x) => x.key === d.key);
  d.blocks.forEach((b, j) => {
    const same = JSON.stringify(b.items.map((x) => x.id)) === JSON.stringify(o.blocks[j].items.map((x) => x.id));
    const expectedChange = (d.key === 'A' && [1, 3, 5].includes(j)) || (d.key === 'B' && [2, 4].includes(j)) || (d.key === 'C' && [1, 6].includes(j));
    if (!same && !expectedChange) err('unexpected program change ' + d.key + j);
    if (same && expectedChange) err('expected change missing ' + d.key + j);
  });
});

/* 4. surviving exercises keep their old Russian text and video IDs */
DB.forEach((e) => {
  const o = O.EXERCISES_DATABASE.find((x) => x.id === e.id);
  if (!o) return;
  if ((e.video || null) !== (o.video || null) || e.category !== o.category) err('neutral changed for ' + e.id);
  const ru = I.EXERCISE_TEXT.ru[e.id];
  ['name', 'muscles', 'start', 'safety', 'home'].forEach((k) => { if (ru[k] !== o[k]) err('ru ' + k + ' changed ' + e.id); });
  if (JSON.stringify(ru.steps) !== JSON.stringify(o.steps)) err('ru steps changed ' + e.id);
});

/* 5. completeness and parity */
if (Object.keys(I.STRINGS.en).sort().join() !== Object.keys(I.STRINGS.ru).sort().join()) err('STRINGS keys differ');
DB.forEach((e) => {
  const en = I.EXERCISE_TEXT.en[e.id], ru = I.EXERCISE_TEXT.ru[e.id];
  if (!en || !ru) { err('missing text ' + e.id); return; }
  ['name', 'muscles'].forEach((k) => { if (!en[k] || !ru[k]) err('empty ' + k + ' ' + e.id); });
  const fullEn = !!en.start, fullRu = !!ru.start;
  if (fullEn !== fullRu) err('stub/full mismatch between languages ' + e.id);
  if (fullEn) {
    ['start'].forEach((k) => { if (!en[k] || !ru[k]) err('empty ' + k + ' ' + e.id); });
    ['safety', 'home'].forEach((k) => { if (!!en[k] !== !!ru[k]) err('parity ' + k + ' ' + e.id); });
    ['tips', 'mistakes'].forEach((k) => { if ((en[k] || []).length !== (ru[k] || []).length) err('parity ' + k + ' ' + e.id); });
    if (e.id < 80 && !(en.tips && en.tips.length && en.mistakes && en.mistakes.length) && e.id >= 36 && e.id !== 36) err('missing tips/mistakes ' + e.id);
    if (!en.steps.length || en.steps.length !== ru.steps.length) err('steps parity ' + e.id);
  }
  if (!CYR.test(ru.name) && e.id !== 8) err('ru name has no cyrillic ' + e.id + ': ' + ru.name);
  if (!e.video && !e.videoQuery) err('no video and no query ' + e.id);
});
[I.STRINGS.en, I.EXERCISE_TEXT.en, I.DAY_TEXT.en, I.CATEGORY_TITLES.en].forEach((src) =>
  walkStrings(src, (s, p) => { if (CYR.test(s)) err('cyrillic in EN ' + p); }));
DB.forEach((e) => { if (e.videoQuery && CYR.test(e.videoQuery)) err('cyrillic videoQuery ' + e.id); });

/* 6. rendering */
const find = (el, pred, out = []) => { if (pred(el)) out.push(el); el.children.forEach((c) => find(c, pred, out)); return out; };
const allText = (el) => { const r = []; (function w(e) { if (e.text) r.push(e.text); e.children.forEach(w); })(el); return r; };
const stringKeys = new Set(Object.keys(I.STRINGS.en));
let now = 1e6, cb = null;
Date.now = () => now; global.setInterval = (f) => { cb = f; return 1; }; global.clearInterval = () => { cb = null; };
const { Modal, Setting } = require('obsidian');
function checkTexts(el, ctx) {
  allText(el).forEach((s) => {
    if (stringKeys.has(s)) err(ctx + ': raw key shown ' + s);
    if (/\{[a-z]+\}/.test(s)) err(ctx + ': unreplaced placeholder "' + s + '"');
    if (s === 'undefined') err(ctx + ': undefined text');
  });
}

(async () => {
  for (const lang of ['en', 'ru']) {
    const plugin = new NEW(); plugin.saved = { language: lang }; await plugin.onload();
    const v = plugin.views['workout-helper-view']({}); plugin.leaves = [{ view: v }]; await v.onOpen();
    const ctx = lang;
    checkTexts(v.contentEl, ctx + ' dashboard');
    CATEGORIES.forEach((c) => {
      v.go({ name: 'category', key: c.key }); checkTexts(v.contentEl, ctx + ' cat ' + c.key);
      const heads = find(v.contentEl, (e) => e.cls.has('wt-tier-title')).map((e) => e.text);
      const items = DB.filter((e) => e.category === c.key);
      const expectHeads = [5, 4, 3, 2, 0].filter((tr) => items.some((e) => (e.tier || 0) === tr)).map((tr) => (tr ? '★ ' + I.STRINGS[lang]['tier' + tr] : I.STRINGS[lang].tierNone));
      const hasRanks = items.some((e) => e.tier);
      if (JSON.stringify(heads) !== JSON.stringify(hasRanks ? expectHeads : [])) err(ctx + ' cat ' + c.key + ' headings ' + heads.join('|'));
      const rows = find(v.contentEl, (e) => e.cls.has('wt-row-name'));
      if (rows.length !== items.length) err(ctx + ' cat ' + c.key + ' rows ' + rows.length + '/' + items.length);
      // order inside the page: tiers descending, unranked last
      const order = rows.map((r) => { const b = r.children.find((x) => x.cls.has('wt-tier')); return b ? +[...b.cls].find((k) => /^wt-tier-\d$/.test(k)).slice(-1) : 0; });
      for (let i = 1; i < order.length; i++) {
        const rk = (x) => (x === 0 ? -1 : x);
        if (rk(order[i]) > rk(order[i - 1])) err(ctx + ' cat ' + c.key + ' not sorted by tier');
      }
      if (lang === 'en' && c.key === 'arms') console.log('arms headings:', heads.join(' | '), '| rows:', rows.length);
    });
    PROG.forEach((d) => {
      v.go({ name: 'day', key: d.key }); checkTexts(v.contentEl, ctx + ' day ' + d.key);
      const rows = find(v.contentEl, (e) => e.cls.has('wt-row')).length;
      const schemes = find(v.contentEl, (e) => e.cls.has('wt-row-scheme') && e.text).length;
      if (rows !== schemes) err(ctx + ' day ' + d.key + ' schemes ' + rows + '/' + schemes);
      if (d.timer) {
        const t = v.timer; t.startBtn.listeners.click[0](); let n = 0;
        while (!t.finished && n < 20000) { now += 200; cb && cb(); n++; }
        if (!t.finished) err(ctx + ' timer never finished ' + d.key);
        now = 1e6;
      }
    });
    v.go({ name: 'day', key: 'A' });
    const badges = find(v.contentEl, (e) => e.cls.has('wt-tier')).map((e) => e.text);
    if (!badges.includes(I.STRINGS[lang].tier3) || !badges.includes(I.STRINGS[lang].tier5)) err(ctx + ' day A badges ' + badges.join());

    DB.forEach((e) => {
      v.openExercise(e.id); const m = Modal.last;
      checkTexts(m.contentEl, ctx + ' modal ' + e.id);
      const ifr = find(m.contentEl, (x) => x.tag === 'iframe').length;
      const links = find(m.contentEl, (x) => x.tag === 'a');
      const search = links.filter((a) => (a.attrs.href || '').includes('search_query='));
      const rankLinks = links.filter((a) => /watch\?v=/.test(a.attrs.href || '') && RANKING_VIDEOS[e.src] && a.attrs.href.endsWith(RANKING_VIDEOS[e.src].id));
      const safety = find(m.contentEl, (x) => x.cls.has('wt-callout-safety')).length;
      const texts = allText(m.contentEl);
      if (e.video && ifr !== 1) err(ctx + ' iframe missing ' + e.id);
      if (!e.video && (ifr !== 0 || search.length !== 1)) err(ctx + ' search link ' + e.id);
      if (e.tier && rankLinks.length !== 1) err(ctx + ' rank link ' + e.id);
      if (!e.tier && find(m.contentEl, (x) => x.cls.has('wt-rank-line')).length) err(ctx + ' rank line on unranked ' + e.id);
      const E = I.EXERCISE_TEXT.en[e.id], R = I.EXERCISE_TEXT.ru[e.id];
      const wantSafety = E.safety || R.safety ? 1 : 0;
      if (safety !== wantSafety || texts.includes(I.STRINGS[lang].detailsSoon)) err(ctx + ' modal details ' + e.id);
      const T = lang === 'ru' ? R : E;
      if ((T.tips || []).length && !texts.includes(I.STRINGS[lang].keyPoints)) err(ctx + ' key points heading ' + e.id);
      if ((T.mistakes || []).length && !texts.includes(I.STRINGS[lang].commonMistakes)) err(ctx + ' mistakes heading ' + e.id);
      if (!!e.band !== texts.includes(I.STRINGS[lang].bandNote)) err(ctx + ' band note ' + e.id);
      if (!!e.jerk !== texts.includes(I.STRINGS[lang].jerkNote)) err(ctx + ' jerk note ' + e.id);
      if (!!e.gear !== texts.includes(I.STRINGS[lang]['gear_' + e.gear])) err(ctx + ' gear note ' + e.id);
      if (!!e.bar !== texts.includes(I.STRINGS[lang].barNote)) err(ctx + ' bar note ' + e.id);
      if (!!e.neck !== texts.includes(I.STRINGS[lang].neckNote)) err(ctx + ' neck note ' + e.id);
      m.onClose();
    });
  }

  /* 7. language switch (settings + header toggle) */
  const plugin = new NEW(); plugin.saved = { language: 'en' }; await plugin.onload();
  const v = plugin.views['workout-helper-view']({}); plugin.leaves = [{ view: v }]; await v.onOpen();
  v.go({ name: 'category', key: 'shoulders' });
  const btns = () => find(v.contentEl, (e) => e.cls.has('wt-lang-btn'));
  const firstHead = () => find(v.contentEl, (e) => e.cls.has('wt-tier-title'))[0].text;
  if (firstHead() !== '★ Best') err('EN first heading ' + firstHead());
  await btns()[1].listeners.click[0]();
  if (firstHead() !== '★ Лучшее' || plugin.saved.language !== 'ru' || v.route.key !== 'shoulders') err('toggle to RU: ' + firstHead());
  plugin.tabs[0].display(); await Setting.all.filter((s) => s.dropdown).pop().dropdown.handler('en');
  if (firstHead() !== '★ Best') err('settings back to EN');
  console.log('shoulders in EN:', find(v.contentEl, (e) => e.cls.has('wt-row-name')).slice(0, 3).map((e) => e.text + ' [' + (e.children[0] ? e.children[0].text : '') + ']').join(' ; '));
  await btns()[1].listeners.click[0]();
  console.log('shoulders in RU:', find(v.contentEl, (e) => e.cls.has('wt-row-name')).slice(0, 3).map((e) => e.text + ' [' + (e.children[0] ? e.children[0].text : '') + ']').join(' ; '));

  console.log('errors:', errors.length ? errors : 'none');
  process.exit(errors.length ? 1 : 0);
})();
