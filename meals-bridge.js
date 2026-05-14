(function () {
  /**
   * Hearty Meals Bridge — Support Sync Fix v2
   *
   * Drop-in replacement for js/meals-bridge.js.
   *
   * v2 fixes from screenshot:
   * - Does NOT revive old/legacy support keys.
   * - Only reads the canonical shared support key: hearty_support_mode_v1.
   * - Hides internal engine tags such as baseline, primary, chia, salad, support.
   * - Shows a clean support pill only when canonical support is actively on.
   * - Preserves normal meals separately from temporary support meals.
   */

  const SUPPORT_KEY = 'hearty_support_mode_v1';

  const VALID_REASONS = new Set(['nausea', 'bloating', 'fatigue', 'low_appetite']);

  const REASON_ALIASES = {
    exhaustion: 'fatigue',
    low_energy: 'fatigue',
    lowEnergy: 'fatigue',
    tired: 'fatigue',
    'low-appetite': 'low_appetite',
    lowappetite: 'low_appetite',
    appetite: 'low_appetite'
  };

  const HIDDEN_ENGINE_TAGS = new Set([
    'baseline',
    'primary',
    'secondary',
    'support',
    'support adjusted',
    'support-adjusted',
    'chia',
    'oats',
    'eggs',
    'yoghurt',
    'yogurt',
    'salad',
    'stirfry',
    'stir fry',
    'stew',
    'bowl',
    'snack',
    'main',
    'light',
    'soft',
    'simple'
  ]);

  const SLOT_TO_INDEX = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
  const SLOT_LABELS = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack'
  };

  function createMealsBridge({ engine }) {
    if (!engine) throw new Error('Meals bridge requires an engine');

    const state = {
      profile: {},
      adjustments: {},
      standardWeekRaw: [],
      supportWeekRaw: [],
      weekRaw: [],
      week: [],
      activeDayIndex: 0,
      lastSupportSignature: ''
    };

    const api = {
      state,
      init,
      refreshMealsUI,
      regenerateWeek,
      regenerateDay,
      swapMeal,
      readGlobalSupportMode,
      writeGlobalSupportMode,
      turnSupportOff
    };

    function init() {
      syncSupportAdjustmentFromGlobal();
      rebuildWeekFromEngine({ forceStandard: true });
      refreshMealsUI();
      bindMealsEvents();
      bindSupportSyncEvents();
      return api;
    }

    function normaliseReason(reason) {
      if (!reason) return null;
      const cleaned = String(reason).trim();
      const mapped = REASON_ALIASES[cleaned] || cleaned;
      return VALID_REASONS.has(mapped) ? mapped : null;
    }

    function safeJsonParse(value) {
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch (_) {
        return null;
      }
    }

    function getStorage() {
      try {
        return window.localStorage;
      } catch (_) {
        return null;
      }
    }

    function readGlobalSupportMode() {
      const store = getStorage();

      const fallback = {
        active: false,
        reason: null,
        sourcePage: null,
        startedAt: null,
        lastChangedAt: null
      };

      if (!store) return fallback;

      const canonical = safeJsonParse(store.getItem(SUPPORT_KEY));

      if (!canonical || typeof canonical !== 'object') {
        return fallback;
      }

      const active = canonical.active === true || canonical.isActive === true;
      const reason =
        normaliseReason(canonical.reason) ||
        normaliseReason(canonical.symptom) ||
        normaliseReason(canonical.type);

      if (!active || !reason) {
        return {
          active: false,
          reason: null,
          sourcePage: canonical.sourcePage || canonical.source || null,
          startedAt: null,
          lastChangedAt: canonical.lastChangedAt || canonical.updatedAt || null
        };
      }

      return {
        active: true,
        reason,
        sourcePage: canonical.sourcePage || canonical.source || null,
        startedAt: canonical.startedAt || canonical.updatedAt || null,
        lastChangedAt: canonical.lastChangedAt || canonical.updatedAt || null
      };
    }

    function writeGlobalSupportMode(reason, sourcePage = 'meals', existingStartedAt = null) {
      const store = getStorage();
      const normalisedReason = normaliseReason(reason);
      const now = new Date().toISOString();

      const next = normalisedReason
        ? {
            active: true,
            reason: normalisedReason,
            sourcePage,
            startedAt: existingStartedAt || now,
            lastChangedAt: now
          }
        : {
            active: false,
            reason: null,
            sourcePage,
            startedAt: null,
            lastChangedAt: now
          };

      if (store) {
        store.setItem(SUPPORT_KEY, JSON.stringify(next));

        /**
         * Do not migrate/read legacy support keys.
         * But when switching support off, clear obvious old Meals-only keys so they cannot
         * visually leak back into this page through older scripts.
         */
        if (!normalisedReason) {
          [
            'meals_support_mode',
            'heartySupportMode',
            'supportMode'
          ].forEach((key) => {
            try {
              store.removeItem(key);
            } catch (_) {}
          });
        }
      }

      dispatchSupportChanged(next);
      return next;
    }

    function dispatchSupportChanged(detail) {
      try {
        window.dispatchEvent(new CustomEvent('hearty:support-mode-changed', { detail }));
        window.dispatchEvent(new CustomEvent('hearty:support-changed', { detail }));
      } catch (_) {}
    }

    function supportSignature(support) {
      return `${support.active ? '1' : '0'}:${support.reason || 'off'}:${support.lastChangedAt || ''}`;
    }

    function syncSupportAdjustmentFromGlobal() {
      const support = readGlobalSupportMode();
      state.adjustments.supportMode = support.active ? support.reason : null;
      state.lastSupportSignature = supportSignature(support);
      return support;
    }

    function clone(value) {
      if (typeof structuredClone === 'function') return structuredClone(value);
      return JSON.parse(JSON.stringify(value));
    }

    function engineGenerateWeek(adjustments) {
      if (typeof engine.generateWeekPlan === 'function') {
        return engine.generateWeekPlan({ profile: state.profile, adjustments });
      }

      if (typeof engine.buildWeek === 'function') {
        return engine.buildWeek({ profile: state.profile, adjustments });
      }

      throw new Error('Meals engine must expose generateWeekPlan() or buildWeek()');
    }

    function getDays(engineWeek) {
      if (Array.isArray(engineWeek?.days)) return engineWeek.days;
      if (Array.isArray(engineWeek)) return engineWeek;
      return [];
    }

    function buildStandardAdjustments() {
      return {
        ...state.adjustments,
        supportMode: null
      };
    }

    function buildSupportAdjustments() {
      return {
        ...state.adjustments,
        supportMode: state.adjustments.supportMode || null
      };
    }

    function rebuildWeekFromEngine({ forceStandard = false } = {}) {
      syncSupportAdjustmentFromGlobal();

      const hasStandard = Array.isArray(state.standardWeekRaw) && state.standardWeekRaw.length > 0;

      if (forceStandard || !hasStandard || !state.adjustments.supportMode) {
        const standardWeek = engineGenerateWeek(buildStandardAdjustments());
        state.standardWeekRaw = clone(getDays(standardWeek));
      }

      if (state.adjustments.supportMode) {
        const supportWeek = engineGenerateWeek(buildSupportAdjustments());
        state.supportWeekRaw = clone(getDays(supportWeek));
        state.weekRaw = clone(state.supportWeekRaw);
      } else {
        state.supportWeekRaw = [];
        state.weekRaw = clone(state.standardWeekRaw);
      }

      state.week = state.weekRaw.map((day, index) => adaptEngineDayToUiDay(day, index));

      if (state.activeDayIndex >= state.week.length) state.activeDayIndex = 0;

      return state.week;
    }

    function regenerateWeek() {
      syncSupportAdjustmentFromGlobal();

      if (state.adjustments.supportMode) {
        const supportWeek = engineGenerateWeek(buildSupportAdjustments());
        state.supportWeekRaw = clone(getDays(supportWeek));
        state.weekRaw = clone(state.supportWeekRaw);
      } else {
        const standardWeek = engineGenerateWeek(buildStandardAdjustments());
        state.standardWeekRaw = clone(getDays(standardWeek));
        state.supportWeekRaw = [];
        state.weekRaw = clone(state.standardWeekRaw);
      }

      state.week = state.weekRaw.map((day, index) => adaptEngineDayToUiDay(day, index));
      refreshMealsUI();
      return state.week;
    }

    function regenerateDay(dayIndex) {
      syncSupportAdjustmentFromGlobal();

      if (typeof engine.regenerateDay !== 'function') {
        return regenerateWeek()?.[dayIndex] || null;
      }

      const activeAdjustments = state.adjustments.supportMode
        ? buildSupportAdjustments()
        : buildStandardAdjustments();

      const sourceWeekRaw = state.adjustments.supportMode
        ? state.supportWeekRaw
        : state.standardWeekRaw;

      const engineDay = engine.regenerateDay({
        week: { days: sourceWeekRaw || [] },
        dayIndex,
        profile: state.profile,
        adjustments: activeAdjustments
      });

      if (!engineDay) return null;

      if (state.adjustments.supportMode) {
        state.supportWeekRaw[dayIndex] = engineDay;
        state.weekRaw = clone(state.supportWeekRaw);
      } else {
        state.standardWeekRaw[dayIndex] = engineDay;
        state.weekRaw = clone(state.standardWeekRaw);
      }

      state.week[dayIndex] = adaptEngineDayToUiDay(engineDay, dayIndex);
      refreshMealsUI();
      return state.week[dayIndex];
    }

    function swapMeal(dayIndex, slotKey) {
      syncSupportAdjustmentFromGlobal();

      if (typeof engine.swapMeal !== 'function') return null;

      const activeAdjustments = state.adjustments.supportMode
        ? buildSupportAdjustments()
        : buildStandardAdjustments();

      const sourceWeekRaw = state.adjustments.supportMode
        ? state.supportWeekRaw
        : state.standardWeekRaw;

      const swapped = engine.swapMeal({
        week: { days: sourceWeekRaw || [] },
        dayIndex,
        slot: slotKey,
        profile: state.profile,
        adjustments: activeAdjustments
      });

      if (!swapped) return null;

      if (state.adjustments.supportMode) {
        if (!state.supportWeekRaw[dayIndex]) state.supportWeekRaw[dayIndex] = {};
        state.supportWeekRaw[dayIndex][slotKey] = swapped;
        state.weekRaw = clone(state.supportWeekRaw);
      } else {
        if (!state.standardWeekRaw[dayIndex]) state.standardWeekRaw[dayIndex] = {};
        state.standardWeekRaw[dayIndex][slotKey] = swapped;
        state.weekRaw = clone(state.standardWeekRaw);
      }

      state.week[dayIndex] = adaptEngineDayToUiDay(state.weekRaw[dayIndex], dayIndex);
      refreshMealsUI();
      return adaptEngineMealToUiMeal(swapped, slotKey, dayIndex);
    }

    function turnSupportOff() {
      writeGlobalSupportMode(null, 'meals');
      syncSupportAdjustmentFromGlobal();

      state.supportWeekRaw = [];
      state.weekRaw = clone(state.standardWeekRaw || []);
      state.week = state.weekRaw.map((day, index) => adaptEngineDayToUiDay(day, index));

      refreshMealsUI();
      return state.week;
    }

    function turnSupportOn(reason) {
      const current = readGlobalSupportMode();
      const startedAt = current.active ? current.startedAt : null;

      writeGlobalSupportMode(reason, 'meals', startedAt);
      rebuildWeekFromEngine({ forceStandard: false });
      refreshMealsUI();

      return state.week;
    }

    function maybeRefreshFromExternalSupportChange() {
      const support = readGlobalSupportMode();
      const nextSignature = supportSignature(support);

      if (nextSignature === state.lastSupportSignature) return;

      const previousSupportMode = state.adjustments.supportMode;
      state.adjustments.supportMode = support.active ? support.reason : null;
      state.lastSupportSignature = nextSignature;

      if (!state.adjustments.supportMode) {
        state.supportWeekRaw = [];
        state.weekRaw = clone(state.standardWeekRaw || []);
        state.week = state.weekRaw.map((day, index) => adaptEngineDayToUiDay(day, index));
      } else if (state.adjustments.supportMode !== previousSupportMode) {
        const supportWeek = engineGenerateWeek(buildSupportAdjustments());
        state.supportWeekRaw = clone(getDays(supportWeek));
        state.weekRaw = clone(state.supportWeekRaw);
        state.week = state.weekRaw.map((day, index) => adaptEngineDayToUiDay(day, index));
      }

      refreshMealsUI();
    }

    function bindSupportSyncEvents() {
      window.addEventListener('storage', function (event) {
        if (!event || event.key === SUPPORT_KEY) {
          maybeRefreshFromExternalSupportChange();
        }
      });

      window.addEventListener('focus', maybeRefreshFromExternalSupportChange);

      document.addEventListener('visibilitychange', function () {
        if (!document.hidden) maybeRefreshFromExternalSupportChange();
      });

      window.addEventListener('hearty:support-mode-changed', maybeRefreshFromExternalSupportChange);
      window.addEventListener('hearty:support-changed', maybeRefreshFromExternalSupportChange);
    }

    function adaptEngineMealToUiMeal(engineMeal, slotKey, dayIndex) {
      if (!engineMeal) return null;

      const visibleTags = cleanVisibleTags(engineMeal.tags);

      return {
        id: `${dayIndex}-${slotKey}-${engineMeal.templateId || 'meal'}`,
        slotKey,
        slotLabel: SLOT_LABELS[slotKey] || slotKey,
        title: engineMeal.title || engineMeal.name || 'Meal',
        subtitle: buildMealSubtitle(engineMeal),
        protein: Number(engineMeal.proteinEstimate || engineMeal.protein || 0),
        tags: visibleTags,
        supportAdjusted: !!engineMeal.supportAdjusted || !!state.adjustments.supportMode,
        templateId: engineMeal.templateId || null,
        raw: engineMeal
      };
    }

    function adaptEngineDayToUiDay(engineDay, dayIndex) {
      const orderedSlots = ['breakfast', 'lunch', 'dinner', 'snack'];

      const meals = orderedSlots
        .map((slotKey) => adaptEngineMealToUiMeal(engineDay?.[slotKey] || null, slotKey, dayIndex))
        .filter(Boolean)
        .sort((a, b) => SLOT_TO_INDEX[a.slotKey] - SLOT_TO_INDEX[b.slotKey]);

      return {
        dayIndex,
        date: engineDay?.date || null,
        dayName: engineDay?.dayName || null,
        meals
      };
    }

    function cleanVisibleTags(tags) {
      if (!Array.isArray(tags)) return [];

      return tags
        .map((tag) => String(tag || '').trim())
        .filter(Boolean)
        .filter((tag) => !HIDDEN_ENGINE_TAGS.has(tag.toLowerCase()))
        .filter((tag) => !tag.toLowerCase().startsWith('support'))
        .slice(0, 3);
    }

    function buildMealSubtitle(engineMeal) {
      const parts = [];

      const method = engineMeal?.method ? String(engineMeal.method).replace(/_/g, ' ') : '';

      if (method && !HIDDEN_ENGINE_TAGS.has(method.toLowerCase())) {
        parts.push(method);
      }

      if (state.adjustments.supportMode) {
        parts.push('support adjusted');
      }

      return parts.join(' • ');
    }

    function refreshMealsUI() {
      syncSupportAdjustmentFromGlobal();

      const activeDay = state.week?.[state.activeDayIndex] || null;

      renderDayTabs(state.week, state.activeDayIndex);
      renderMeals(activeDay);
      renderTodayLineup(activeDay);
      renderProteinMeter(activeDay);
      renderShoppingList(state.week);
      renderSupportButtons();

      return activeDay;
    }

    function renderDayTabs(days, activeDayIndex) {
      const root = document.getElementById('plannerDays');
      if (!root) return;

      root.innerHTML = (Array.isArray(days) ? days : [])
        .map((day, index) => `
          <button class="planner-day${index === activeDayIndex ? ' is-active' : ''}" data-day-index="${index}" type="button">
            <span class="planner-day__label">${escapeHtml(day?.dayName || `Day ${index + 1}`)}</span>
          </button>
        `)
        .join('');
    }

    function renderMeals(uiDay) {
      const root = document.getElementById('mealList');
      if (!root) return;

      const meals = Array.isArray(uiDay?.meals) ? uiDay.meals : [];

      root.innerHTML = meals.length
        ? meals.map(renderMealCard).join('')
        : `<div class="meal-card"><div class="meal-card__title">No meals available</div></div>`;
    }

    function renderMealCard(meal) {
      const tags = Array.isArray(meal.tags)
        ? meal.tags.map((tag) => `<span class="meal-tag">${escapeHtml(tag)}</span>`).join('')
        : '';

      const supportBadge = state.adjustments.supportMode
        ? `<span class="meal-tag meal-tag--support">Support: ${escapeHtml(formatReason(state.adjustments.supportMode))}</span>`
        : '';

      return `
        <article class="meal-card" data-slot="${escapeHtml(meal.slotKey || '')}">
          <div class="meal-card__header">
            <div>
              <div class="meal-card__eyebrow">${escapeHtml(meal.slotLabel || '')}</div>
              <h3 class="meal-card__title">${escapeHtml(meal.title || 'Meal')}</h3>
              ${meal.subtitle ? `<div class="meal-card__subtitle">${escapeHtml(meal.subtitle)}</div>` : ''}
            </div>
            <div class="meal-card__protein">${Number(meal.protein || 0)}g protein</div>
          </div>
          ${(tags || supportBadge) ? `<div class="meal-card__tags">${tags}${supportBadge}</div>` : ''}
          <div class="meal-card__actions">
            <button type="button" class="mini-btn" data-swap-slot="${escapeHtml(meal.slotKey)}">Swap</button>
          </div>
        </article>
      `;
    }

    function renderTodayLineup(uiDay) {
      const root = document.getElementById('todayLineup');
      if (!root) return;

      const meals = Array.isArray(uiDay?.meals) ? uiDay.meals : [];

      root.innerHTML = meals
        .map((meal) => `
          <div class="today-lineup__item">
            <div class="today-lineup__slot">${escapeHtml(meal.slotLabel || '')}</div>
            <div class="today-lineup__title">${escapeHtml(meal.title || '')}</div>
          </div>
        `)
        .join('');
    }

    function calculateProteinScore(uiDay) {
      if (!uiDay || !Array.isArray(uiDay.meals)) return 0;

      let score = 0;
      const breakfast = uiDay.meals.find((m) => m.slotKey === 'breakfast');
      const lunch = uiDay.meals.find((m) => m.slotKey === 'lunch');
      const dinner = uiDay.meals.find((m) => m.slotKey === 'dinner');

      if (breakfast?.raw?.proteinId || breakfast?.protein > 0) score += 1;
      if (lunch?.raw?.proteinId || lunch?.protein > 0) score += 1;
      if (dinner?.raw?.proteinId || dinner?.protein > 0) score += 1;

      return score;
    }

    function renderProteinMeter(uiDay) {
      const score = calculateProteinScore(uiDay);
      const target = 3;
      const percent = Math.max(0, Math.min(100, Math.round((score / target) * 100)));

      const ringEl = document.getElementById('proteinMeter');
      const textEl = document.getElementById('proteinMeterText');
      const pipsEl = document.getElementById('proteinMeterPips');

      if (ringEl) ringEl.style.setProperty('--protein-percent', String(percent));
      if (textEl) textEl.textContent = `${score} / ${target} protein meals`;

      if (pipsEl) {
        pipsEl.innerHTML = Array.from(
          { length: target },
          (_, i) => `<span class="protein-pip${i < score ? ' is-filled' : ''}"></span>`
        ).join('');
      }

      document.querySelectorAll('.protein-chip').forEach((chip, idx) => {
        chip.classList.toggle('done', idx < score);
      });
    }

    function renderShoppingList(week) {
      const root = document.getElementById('shoppingList');
      if (!root) return;

      const titles = [];

      (Array.isArray(week) ? week : []).forEach((day) => {
        (Array.isArray(day?.meals) ? day.meals : []).forEach((meal) => {
          if (meal?.title) titles.push(meal.title);
        });
      });

      root.innerHTML = titles.length
        ? titles.map((title) => `<div class="shopping-item">${escapeHtml(title)}</div>`).join('')
        : `<div class="shopping-item">No shopping items yet.</div>`;
    }

    function renderSupportButtons() {
      const support = readGlobalSupportMode();
      const activeReason = support.active ? support.reason : null;

      document.querySelectorAll('[data-support-mode]').forEach((btn) => {
        const reason = normaliseReason(btn.getAttribute('data-support-mode'));
        btn.classList.toggle('is-active', !!reason && reason === activeReason);
        btn.setAttribute('aria-pressed', String(!!reason && reason === activeReason));
      });

      document.querySelectorAll('[data-support-off]').forEach((offBtn) => {
        offBtn.classList.toggle('is-active', !activeReason);
        offBtn.setAttribute('aria-pressed', String(!activeReason));
      });

      const statusEls = document.querySelectorAll('[data-support-status], #supportStatus, #mealsSupportStatus');
      statusEls.forEach((el) => {
        el.textContent = activeReason
          ? `Status: ${formatReason(activeReason)} support`
          : 'Status: Off';
      });

      document.documentElement.classList.toggle('hearty-support-active', !!activeReason);

      if (document.body) {
        document.body.classList.toggle('hearty-support-active', !!activeReason);
      }
    }

    function bindMealsEvents() {
      document.addEventListener('click', function (event) {
        const dayButton = event.target.closest('[data-day-index]');
        if (dayButton) {
          const idx = Number(dayButton.getAttribute('data-day-index'));
          if (!Number.isNaN(idx)) {
            state.activeDayIndex = idx;
            refreshMealsUI();
          }
        }

        const swapBtn = event.target.closest('[data-swap-slot]');
        if (swapBtn) {
          swapMeal(state.activeDayIndex, swapBtn.getAttribute('data-swap-slot'));
        }

        if (event.target.closest('[data-regenerate-week]')) {
          regenerateWeek();
        }

        if (event.target.closest('[data-regenerate-day]')) {
          regenerateDay(state.activeDayIndex);
        }

        const supportBtn = event.target.closest('[data-support-mode]');
        if (supportBtn) {
          const reason = supportBtn.getAttribute('data-support-mode');
          turnSupportOn(reason);
        }

        if (event.target.closest('[data-support-off]')) {
          turnSupportOff();
        }
      });
    }

    function formatReason(reason) {
      const normalised = normaliseReason(reason);
      const labels = {
        nausea: 'Nausea',
        bloating: 'Bloating',
        fatigue: 'Fatigue',
        low_appetite: 'Low appetite'
      };
      return labels[normalised] || 'Support';
    }

    function escapeHtml(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    return api;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createMealsBridge };
  }

  if (typeof window !== 'undefined') {
    window.createMealsBridge = createMealsBridge;
  }
})();
