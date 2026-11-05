
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
