(function () {
  'use strict';

  const KEY = 'perfectWomen.localTracker.v1';
  const PHOTO_DB = 'perfectWomen.photos.v1';
  const PHOTO_STORE = 'photos';

  function uid(prefix = 'id') {
    if (crypto && crypto.randomUUID) return `${prefix}_${crypto.randomUUID()}`;
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  function todayKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function addDays(date, amount) {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
  }

  function mondayStart(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function defaultState() {
    return {
      schemaVersion: 6,
      localClientId: uid('pw_client'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sync: {
        status: 'local-only',
        pending: false,
        lastSyncedAt: null
      },
      client: {
        name: '',
        startDate: todayKey(),
        onboarded: false,
        startingWeightKg: null
      },
      settings: {
        waterTargetMl: 2000,
        weighInDay: 1,
        units: {
          weight: 'kg',
          length: 'cm'
        }
      },
      logs: {
        water: {},
        movement: {},
        weights: {},
        measurements: {},
        checkins: {},
        walks: [],
        runs: []
      },
      programs: {
        active: null
      },
      walkingProgram: {
        started: false,
        startDate: null,
        targetWalksPerWeek: 4,
        weeklyTargets: {}
      },
      joggingProgram: {
        started: false,
        startDate: null
      },
      photos: {
        sets: []
      },
      recipes: {
        favourites: []
      }
    };
  }

  function deepMerge(base, incoming) {
    if (!incoming || typeof incoming !== 'object') return base;
    const out = Array.isArray(base) ? [...base] : { ...base };
    Object.keys(incoming).forEach((key) => {
      const baseVal = out[key];
      const inVal = incoming[key];
      if (baseVal && typeof baseVal === 'object' && !Array.isArray(baseVal) && inVal && typeof inVal === 'object' && !Array.isArray(inVal)) {
        out[key] = deepMerge(baseVal, inVal);
      } else {
        out[key] = inVal;
      }
    });
    return out;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      return deepMerge(defaultState(), JSON.parse(raw));
    } catch (err) {
      console.warn('Perfect Women tracker: could not load state, using clean state.', err);
      return defaultState();
    }
  }

  let state = load();

  function save(nextState) {
    nextState.updatedAt = new Date().toISOString();
    nextState.sync.pending = true;
    state = nextState;
    localStorage.setItem(KEY, JSON.stringify(state));
    return state;
  }

  function update(mutator) {
    const draft = structuredClone ? structuredClone(state) : JSON.parse(JSON.stringify(state));
    mutator(draft);
    return save(draft);
  }

  function getState() {
    return structuredClone ? structuredClone(state) : JSON.parse(JSON.stringify(state));
  }

  function getTodayWater() {
    const key = todayKey();
    return state.logs.water[key] || { date: key, ml: 0, entries: [] };
  }

  function addWater(ml) {
    const key = todayKey();
    return update((draft) => {
      if (!draft.logs.water[key]) draft.logs.water[key] = { date: key, ml: 0, entries: [] };
      draft.logs.water[key].ml += ml;
      draft.logs.water[key].entries.push({ ml, ts: new Date().toISOString() });
    });
  }

  function undoWater() {
    const key = todayKey();
    return update((draft) => {
      const log = draft.logs.water[key];
      if (!log || !log.entries.length) return;
      const last = log.entries.pop();
      log.ml = Math.max(0, log.ml - last.ml);
    });
  }

  function saveMovement(entry) {
    const key = todayKey();
    return update((draft) => {
      draft.logs.movement[key] = {
        date: key,
        done: !!entry.done,
        duration: Number(entry.duration || 0),
        type: entry.type || 'Walk',
        notes: entry.notes || '',
        ts: new Date().toISOString()
      };
    });
  }

  function clearMovement() {
    const key = todayKey();
    return update((draft) => {
      delete draft.logs.movement[key];
    });
  }



  function walkingWeekNumber(dateKey = todayKey()) {
    const start = state.walkingProgram?.startDate;
    if (!state.walkingProgram?.started || !start) return 1;
    const startDate = new Date(`${start}T00:00:00`);
    const date = new Date(`${dateKey}T00:00:00`);
    const diffDays = Math.floor((date - startDate) / 86400000);
    return Math.min(8, Math.max(1, Math.floor(diffDays / 7) + 1));
  }

  function startWalkingProgram({ targetWalksPerWeek = 4, targetSteps = '' } = {}) {
    const date = todayKey();
    return update((draft) => {
      draft.walkingProgram.started = true;
      draft.walkingProgram.startDate = draft.walkingProgram.startDate || date;
      if (!draft.programs) draft.programs = { active: null };
      draft.programs.active = 'walking';
      draft.walkingProgram.targetWalksPerWeek = Math.max(1, Math.min(7, Number(targetWalksPerWeek || 4)));
      if (targetSteps !== '' && targetSteps !== null && targetSteps !== undefined) {
        const steps = Number(targetSteps);
        if (steps && !Number.isNaN(steps)) draft.walkingProgram.weeklyTargets['1'] = steps;
      }
    });
  }

  function saveWalkingTarget({ week, targetSteps }) {
    const cleanWeek = Math.min(8, Math.max(1, Number(week || 1)));
    const steps = Number(targetSteps);
    return update((draft) => {
      if (!draft.walkingProgram.started) {
        draft.walkingProgram.started = true;
        draft.walkingProgram.startDate = draft.walkingProgram.startDate || todayKey();
      }
      if (steps && !Number.isNaN(steps)) draft.walkingProgram.weeklyTargets[String(cleanWeek)] = steps;
      else delete draft.walkingProgram.weeklyTargets[String(cleanWeek)];
    });
  }

  function saveWalkSession({ date, steps, notes }) {
    const cleanDate = date || todayKey();
    const cleanSteps = Number(steps);
    if (!cleanSteps || Number.isNaN(cleanSteps)) return state;
    const week = walkingWeekNumber(cleanDate);
    return update((draft) => {
      if (!draft.walkingProgram.started) {
        draft.walkingProgram.started = true;
        draft.walkingProgram.startDate = draft.walkingProgram.startDate || cleanDate;
      }
      if (!draft.programs) draft.programs = { active: null };
      if (!draft.programs.active) draft.programs.active = 'walking';
      if (!Array.isArray(draft.logs.walks)) draft.logs.walks = [];
      draft.logs.walks.push({
        id: uid('walk'),
        date: cleanDate,
        week,
        durationMinutes: 60,
        steps: Math.round(cleanSteps),
        notes: notes || '',
        ts: new Date().toISOString()
      });
    });
  }

  function deleteWalkSession(id) {
    return update((draft) => {
      draft.logs.walks = (draft.logs.walks || []).filter((item) => item.id !== id);
    });
  }

  function sortedWalks() {
    return (state.logs.walks || [])
      .filter((item) => item && item.date && typeof item.steps === 'number')
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date) || (b.ts || '').localeCompare(a.ts || ''));
  }

  function joggingWeekNumber(dateKey = todayKey()) {
    const start = state.joggingProgram?.startDate;
    if (!state.joggingProgram?.started || !start) return 1;
    const startDate = new Date(`${start}T00:00:00`);
    const date = new Date(`${dateKey}T00:00:00`);
    const diffDays = Math.floor((date - startDate) / 86400000);
    return Math.min(8, Math.max(1, Math.floor(diffDays / 7) + 1));
  }

  function startJoggingProgram() {
    const date = todayKey();
    return update((draft) => {
      draft.joggingProgram.started = true;
      draft.joggingProgram.startDate = draft.joggingProgram.startDate || date;
      if (!draft.programs) draft.programs = { active: null };
      draft.programs.active = 'jogging';
      if (!Array.isArray(draft.logs.runs)) draft.logs.runs = [];
    });
  }

  function saveRunSession({ date, sessionKey, sessionLabel, targetKm, distanceKm, timeMinutes, rpe, notes }) {
    const cleanDate = date || todayKey();
    const km = Number(distanceKm);
    if (!km || Number.isNaN(km)) return state;
    const week = joggingWeekNumber(cleanDate);
    return update((draft) => {
      if (!draft.joggingProgram.started) {
        draft.joggingProgram.started = true;
        draft.joggingProgram.startDate = draft.joggingProgram.startDate || cleanDate;
      }
      if (!draft.programs) draft.programs = { active: null };
      if (!draft.programs.active) draft.programs.active = 'jogging';
      if (!Array.isArray(draft.logs.runs)) draft.logs.runs = [];
      draft.logs.runs.push({
        id: uid('run'),
        date: cleanDate,
        week,
        sessionKey: sessionKey || 'run',
        sessionLabel: sessionLabel || 'Jogging session',
        targetKm: Number(targetKm || 0),
        distanceKm: Math.round(km * 100) / 100,
        timeMinutes: timeMinutes === '' || timeMinutes === null || timeMinutes === undefined ? null : Number(timeMinutes),
        rpe: rpe === '' || rpe === null || rpe === undefined ? null : Number(rpe),
        notes: notes || '',
        ts: new Date().toISOString()
      });
    });
  }

  function deleteRunSession(id) {
    return update((draft) => {
      draft.logs.runs = (draft.logs.runs || []).filter((item) => item.id !== id);
    });
  }

  function sortedRuns() {
    return (state.logs.runs || [])
      .filter((item) => item && item.date && typeof item.distanceKm === 'number')
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date) || (b.ts || '').localeCompare(a.ts || ''));
  }


  function numOrNull(value) {
    if (value === '' || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }

  function saveMeasurements(entry) {
    const date = entry.date || todayKey();
    return update((draft) => {
      draft.logs.measurements[date] = {
        date,
        waist: numOrNull(entry.waist),
        hips: numOrNull(entry.hips),
        chest: numOrNull(entry.chest),
        thigh: numOrNull(entry.thigh),
        arm: numOrNull(entry.arm),
        notes: entry.notes || '',
        ts: new Date().toISOString()
      };
    });
  }

  function sortedMeasurements() {
    return Object.values(state.logs.measurements || {})
      .filter((item) => item && item.date)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  function saveCheckin(entry) {
    const date = entry.date || todayKey();
    return update((draft) => {
      draft.logs.checkins[date] = {
        date,
        meals: entry.meals || '',
        water: entry.water || '',
        movement: entry.movement || '',
        energy: entry.energy || '',
        stress: entry.stress || '',
        win: entry.win || '',
        struggle: entry.struggle || '',
        help: entry.help || '',
        ts: new Date().toISOString()
      };
    });
  }

  function sortedCheckins() {
    return Object.values(state.logs.checkins || {})
      .filter((item) => item && item.date)
      .sort((a, b) => a.date.localeCompare(b.date));
  }


  function setActiveProgram(program) {
    const clean = ['walking', 'jogging'].includes(program) ? program : null;
    if (!clean) return state;
    return update((draft) => {
      if (!draft.programs) draft.programs = { active: null };
      draft.programs.active = clean;
    });
  }

  function saveWeight(entry) {
    const date = entry.date || todayKey();
    return update((draft) => {
      draft.logs.weights[date] = {
        date,
        kg: Number(entry.kg),
        waistCm: entry.waistCm === '' || entry.waistCm === null || entry.waistCm === undefined ? null : Number(entry.waistCm),
        notes: entry.notes || '',
        ts: new Date().toISOString()
      };
    });
  }

  function sortedWeights() {
    return Object.values(state.logs.weights || {})
      .filter((w) => typeof w.kg === 'number' && !Number.isNaN(w.kg))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  function weekKeys(date = new Date()) {
    const start = mondayStart(date);
    return Array.from({ length: 7 }, (_, i) => todayKey(addDays(start, i)));
  }

  function saveSettings({ name, waterTargetMl }) {
    return update((draft) => {
      draft.client.name = (name || '').trim();
      draft.settings.waterTargetMl = Math.max(500, Number(waterTargetMl || 2000));
    });
  }

  function completeOnboarding({ name, startingWeightKg }) {
    const cleanName = (name || '').trim();
    const weight = Number(startingWeightKg);
    const date = todayKey();
    return update((draft) => {
      draft.client.name = cleanName;
      draft.client.onboarded = true;
      draft.client.startDate = draft.client.startDate || date;
      if (weight && !Number.isNaN(weight)) {
        draft.client.startingWeightKg = weight;
        draft.logs.weights[date] = {
          date,
          kg: weight,
          waistCm: null,
          notes: 'Starting weight from onboarding',
          ts: new Date().toISOString()
        };
      }
    });
  }

  function markOnboardingDone() {
    return update((draft) => {
      draft.client.onboarded = true;
    });
  }

  function resetData() {
    state = defaultState();
    localStorage.setItem(KEY, JSON.stringify(state));
    return state;
  }

  function exportData() {
    return JSON.stringify(getState(), null, 2);
  }

  function openPhotoDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(PHOTO_DB, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(PHOTO_STORE)) db.createObjectStore(PHOTO_STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function putPhoto(key, blob) {
    const db = await openPhotoDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, 'readwrite');
      tx.objectStore(PHOTO_STORE).put(blob, key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getPhoto(key) {
    const db = await openPhotoDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, 'readonly');
      const request = tx.objectStore(PHOTO_STORE).get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async function deletePhoto(key) {
    const db = await openPhotoDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE, 'readwrite');
      tx.objectStore(PHOTO_STORE).delete(key);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }

  async function savePhotoSet({ date, notes, front, side, back }) {
    const setId = uid('photo_set');
    const files = { front, side, back };
    const photoKeys = {};
    for (const [kind, file] of Object.entries(files)) {
      if (file) {
        const key = `${setId}:${kind}`;
        await putPhoto(key, file);
        photoKeys[kind] = key;
      }
    }
    update((draft) => {
      draft.photos.sets.unshift({
        id: setId,
        date: date || todayKey(),
        notes: notes || '',
        photoKeys,
        createdAt: new Date().toISOString()
      });
    });
    return setId;
  }

  async function deletePhotoSet(setId) {
    const set = state.photos.sets.find((item) => item.id === setId);
    if (set && set.photoKeys) {
      await Promise.all(Object.values(set.photoKeys).map((key) => deletePhoto(key)));
    }
    update((draft) => {
      draft.photos.sets = draft.photos.sets.filter((item) => item.id !== setId);
    });
  }

  window.PWStore = {
    todayKey,
    mondayStart,
    weekKeys,
    getState,
    addWater,
    undoWater,
    getTodayWater,
    saveMovement,
    clearMovement,
    startWalkingProgram,
    setActiveProgram,
    saveWalkingTarget,
    saveWalkSession,
    deleteWalkSession,
    sortedWalks,
    walkingWeekNumber,
    startJoggingProgram,
    saveRunSession,
    deleteRunSession,
    sortedRuns,
    joggingWeekNumber,
    saveWeight,
    saveMeasurements,
    sortedMeasurements,
    saveCheckin,
    sortedCheckins,
    sortedWeights,
    saveSettings,
    completeOnboarding,
    markOnboardingDone,
    resetData,
    exportData,
    savePhotoSet,
    getPhoto,
    deletePhotoSet
  };
})();
