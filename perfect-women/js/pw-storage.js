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
      schemaVersion: 2,
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
        weights: {}
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
    saveWeight,
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
