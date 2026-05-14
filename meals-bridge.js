MEALS BRIDGE SAFE FIX — DO NOT REPLACE THE WHOLE BRIDGE AGAIN
===============================================================

FIRST:
Restore your previous working meals-bridge.js from before my v1/v2 replacement.

The v1/v2 replacement was too aggressive because it replaced the Meals renderer.
That broke existing UI behaviour like protein logging.

Then make ONLY the small edits below inside the existing working meals-bridge.js.

---------------------------------------------------------------
1) ADD THIS NEAR THE TOP OF createMealsBridge(), after SLOT_LABELS
---------------------------------------------------------------

const SUPPORT_KEY = 'hearty_support_mode_v1';

function safeJsonParse(value) {
  if (!value) return null;
  try { return JSON.parse(value); } catch (_) { return null; }
}

function normaliseSupportReason(reason) {
  if (!reason) return null;

  const value = String(reason).trim();

  const aliases = {
    low_energy: 'fatigue',
    lowEnergy: 'fatigue',
    exhaustion: 'fatigue',
    tired: 'fatigue',
    'low-appetite': 'low_appetite',
    lowappetite: 'low_appetite',
    appetite: 'low_appetite'
  };

  const mapped = aliases[value] || value;

  return ['nausea', 'bloating', 'fatigue', 'low_appetite'].includes(mapped)
    ? mapped
    : null;
}

function readGlobalSupportMode() {
  let parsed = null;

  try {
    parsed = safeJsonParse(localStorage.getItem(SUPPORT_KEY));
  } catch (_) {
    parsed = null;
  }

  const active = parsed?.active === true || parsed?.isActive === true;
  const reason = normaliseSupportReason(parsed?.reason || parsed?.symptom || parsed?.type);

  if (!active || !reason) {
    return { active: false, reason: null };
  }

  return { active: true, reason };
}

function writeGlobalSupportMode(reason) {
  const normalised = normaliseSupportReason(reason);
  const now = new Date().toISOString();

  const next = normalised
    ? {
        active: true,
        reason: normalised,
        sourcePage: 'meals',
        startedAt: now,
        lastChangedAt: now
      }
    : {
        active: false,
        reason: null,
        sourcePage: 'meals',
        startedAt: null,
        lastChangedAt: now
      };

  try {
    localStorage.setItem(SUPPORT_KEY, JSON.stringify(next));

    // Clear old Meals-only support state so it cannot override global off.
    if (!normalised) {
      localStorage.removeItem('meals_support_mode');
      localStorage.removeItem('supportMode');
    }
  } catch (_) {}

  try {
    window.dispatchEvent(new CustomEvent('hearty:support-mode-changed', { detail: next }));
    window.dispatchEvent(new CustomEvent('hearty:support-changed', { detail: next }));
  } catch (_) {}

  return next;
}

function syncSupportFromGlobal() {
  const support = readGlobalSupportMode();
  state.adjustments.supportMode = support.active ? support.reason : null;
  return support;
}

function refreshFromExternalSupportChange() {
  const before = state.adjustments.supportMode || null;
  const support = syncSupportFromGlobal();
  const after = support.active ? support.reason : null;

  if (before !== after) {
    regenerateWeek();
  } else {
    renderSupportButtons();
  }
}

function bindSupportExternalEvents() {
  window.addEventListener('storage', function (event) {
    if (!event || event.key === SUPPORT_KEY) refreshFromExternalSupportChange();
  });

  window.addEventListener('focus', refreshFromExternalSupportChange);

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) refreshFromExternalSupportChange();
  });

  window.addEventListener('hearty:support-mode-changed', refreshFromExternalSupportChange);
  window.addEventListener('hearty:support-changed', refreshFromExternalSupportChange);
}


---------------------------------------------------------------
2) CHANGE init()
---------------------------------------------------------------

FROM:

function init() { rebuildWeekFromEngine(); refreshMealsUI(); bindMealsEvents(); return api; }

TO:

function init() {
  syncSupportFromGlobal();
  rebuildWeekFromEngine();
  refreshMealsUI();
  bindMealsEvents();
  bindSupportExternalEvents();
  return api;
}


---------------------------------------------------------------
3) CHANGE rebuildWeekFromEngine()
---------------------------------------------------------------

FROM:

function rebuildWeekFromEngine() { const engineWeek = engine.generateWeekPlan({ profile: state.profile, adjustments: state.adjustments }); const rawDays = Array.isArray(engineWeek?.days) ? engineWeek.days : []; state.weekRaw = rawDays; state.week = rawDays.map((day, index) => adaptEngineDayToUiDay(day, index)); if (state.activeDayIndex >= state.week.length) state.activeDayIndex = 0; return state.week; }

TO:

function rebuildWeekFromEngine() {
  syncSupportFromGlobal();

  const engineWeek = engine.generateWeekPlan({
    profile: state.profile,
    adjustments: state.adjustments
  });

  const rawDays = Array.isArray(engineWeek?.days) ? engineWeek.days : [];
  state.weekRaw = rawDays;
  state.week = rawDays.map((day, index) => adaptEngineDayToUiDay(day, index));

  if (state.activeDayIndex >= state.week.length) state.activeDayIndex = 0;

  return state.week;
}


---------------------------------------------------------------
4) CHANGE regenerateDay()
---------------------------------------------------------------

At the very start of regenerateDay(dayIndex), add:

syncSupportFromGlobal();


So it becomes:

function regenerateDay(dayIndex) {
  syncSupportFromGlobal();

  const engineDay = engine.regenerateDay({
    week: { days: state.weekRaw || [] },
    dayIndex,
    profile: state.profile,
    adjustments: state.adjustments
  });

  // keep the rest of your original function exactly the same
}


---------------------------------------------------------------
5) CHANGE swapMeal()
---------------------------------------------------------------

At the very start of swapMeal(dayIndex, slotKey), add:

syncSupportFromGlobal();


So it becomes:

function swapMeal(dayIndex, slotKey) {
  syncSupportFromGlobal();

  const swapped = engine.swapMeal({
    week: { days: state.weekRaw || [] },
    dayIndex,
    slot: slotKey,
    profile: state.profile,
    adjustments: state.adjustments
  });

  // keep the rest of your original function exactly the same
}


---------------------------------------------------------------
6) CHANGE ONLY THE SUPPORT PART OF bindMealsEvents()
---------------------------------------------------------------

Find this section:

const supportBtn = event.target.closest('[data-support-mode]');
if (supportBtn) { state.adjustments.supportMode = supportBtn.getAttribute('data-support-mode') || null; regenerateWeek(); }
if (event.target.closest('[data-support-off]')) { state.adjustments.supportMode = null; regenerateWeek(); }


Replace it with:

const supportBtn = event.target.closest('[data-support-mode]');
if (supportBtn) {
  const reason = supportBtn.getAttribute('data-support-mode') || null;
  writeGlobalSupportMode(reason);
  syncSupportFromGlobal();
  regenerateWeek();
}

if (event.target.closest('[data-support-off]')) {
  writeGlobalSupportMode(null);
  syncSupportFromGlobal();
  regenerateWeek();
}


---------------------------------------------------------------
7) IMPORTANT: DO NOT CHANGE THESE FUNCTIONS
---------------------------------------------------------------

Do not replace or rewrite your existing versions of:

renderMeals()
renderMealCard()
renderProteinMeter()
renderProtein()
protein log handlers
eaten/logged/toggle handlers
shopping list renderer
any Supabase save/load logic

That is what broke the page.
