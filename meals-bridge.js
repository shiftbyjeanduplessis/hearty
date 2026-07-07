(function () {
  "use strict";

  const LOG_KEY = "heartyProteinLogsV1";
  const SNACKS_KEY = "heartyMealsSnacksOn"; // legacy key ignored from v73; optional snack stays available.
  const SUPPORT_STORAGE_KEY = "hearty_support_mode_v1";
  const LEGACY_SUPPORT_KEY = "meals_support_mode";
  const BRIDGE_VERSION = "v77-meals-ia-refresh-split";
  const PLAN_SEED_KEY = "hearty_meals_plan_seed_v1";
  const BULK_PREP_PLAN_KEY = "hearty_bulk_prep_plan_v1";
  const PREP_KEY = "hearty_meals_prep_model_v1";
  const LEGACY_LEFTOVER_KEY = "heartyDinnerToLunchEnabled";

  const $ = (id) => document.getElementById(id);

  const SUPPORT_MODE_MAP = {
    nausea: "nausea",
    bloating: "bloating",
    constipation: "constipation",
    low_appetite: "low_appetite",
    fatigue: "fatigue",
    exhaustion: "fatigue",
    tired: "fatigue",
    "low energy": "fatigue",
    "low_energy": "fatigue"
  };

  const SUPPORT_LABELS = {
    nausea: "Nausea",
    bloating: "Bloated",
    constipation: "Constipated",
    low_appetite: "Low appetite",
    fatigue: "Tired"
  };

  const PREP_LABELS = {
    cook_fresh: "Cook as you go",
    dinner_leftovers: "Dinner becomes lunch",
    weekly_bulk_prep: "Weekly bulk prep"
  };

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[ch]));
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function snacksEnabled() {
    return true;
  }

  function readPlanSeed() {
    const n = Number(readJSON(PLAN_SEED_KEY, 0));
    return Number.isFinite(n) ? n : 0;
  }

  function bumpPlanSeed() {
    const next = readPlanSeed() + 1;
    writeJSON(PLAN_SEED_KEY, next);
    return next;
  }

  function normaliseSupportMode(value) {
    if (!value) return null;
    const raw = String(value).trim();
    const low = raw.toLowerCase().replace(/\s+/g, "_");
    return SUPPORT_MODE_MAP[raw] || SUPPORT_MODE_MAP[low] || null;
  }

  function readGlobalSupportMode() {
    try {
      const raw = localStorage.getItem(SUPPORT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.active === true || parsed.isActive === true)) {
          return normaliseSupportMode(parsed.reason || parsed.mode || parsed.type || parsed.symptom);
        }
        return null;
      }
    } catch { return null; }
    return null;
  }

  function writeGlobalSupportMode(mode, source) {
    const supportMode = normaliseSupportMode(mode);
    if (!supportMode) {
      writeJSON(SUPPORT_STORAGE_KEY, {
        active: false,
        reason: null,
        source: source || "meals",
        updatedAt: new Date().toISOString()
      });
      try { localStorage.removeItem(LEGACY_SUPPORT_KEY); } catch {}
      return null;
    }

    writeJSON(SUPPORT_STORAGE_KEY, {
      active: true,
      reason: supportMode,
      source: source || "meals",
      updatedAt: new Date().toISOString()
    });
    try { localStorage.setItem(LEGACY_SUPPORT_KEY, supportMode); } catch {}
    return supportMode;
  }

  function loadMealAdjustments() {
    const supportMode = readGlobalSupportMode();
    return {
      supportMode,
      lowAppetite: supportMode === "low_appetite",
      supportActive: !!supportMode,
      snacksOn: true
    };
  }

  function defaultPrepModel() {
    let scenario = "dinner_leftovers";
    try {
      if (localStorage.getItem(LEGACY_LEFTOVER_KEY) === "false") scenario = "cook_fresh";
      if (localStorage.getItem(LEGACY_LEFTOVER_KEY) === "true") scenario = "dinner_leftovers";
    } catch {}
    return {
      scenario,
      bulkPrep: {
        prepDay: "Sunday",
        prepDaysCount: 5,
        mealsToPrep: ["lunch", "dinner"],
        batchRecipeCount: 3,
        includeSnacks: false,
        fridgeDays: 3,
        freezerFriendly: true
      }
    };
  }

  function normalizePrepModel(value) {
    const defaults = defaultPrepModel();
    const model = Object.assign({}, defaults, value || {});
    if (!["cook_fresh", "dinner_leftovers", "weekly_bulk_prep"].includes(model.scenario)) model.scenario = defaults.scenario;
    model.bulkPrep = Object.assign({}, defaults.bulkPrep, model.bulkPrep || {});
    model.bulkPrep.prepDaysCount = clampNumber(model.bulkPrep.prepDaysCount, 1, 7, 5);
    model.bulkPrep.batchRecipeCount = clampNumber(model.bulkPrep.batchRecipeCount, 1, 4, 3);
    model.bulkPrep.fridgeDays = clampNumber(model.bulkPrep.fridgeDays, 1, 5, 3);
    if (!Array.isArray(model.bulkPrep.mealsToPrep) || !model.bulkPrep.mealsToPrep.length) model.bulkPrep.mealsToPrep = ["lunch", "dinner"];
    model.bulkPrep.mealsToPrep = model.bulkPrep.mealsToPrep.filter((slot) => ["breakfast", "lunch", "dinner"].includes(slot));
    if (!model.bulkPrep.mealsToPrep.length) model.bulkPrep.mealsToPrep = ["lunch", "dinner"];
    model.bulkPrep.includeSnacks = model.bulkPrep.includeSnacks === true;
    return model;
  }

  function clampNumber(value, min, max, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.round(n)));
  }

  function readPrepModel() {
    return normalizePrepModel(readJSON(PREP_KEY, null));
  }

  function writePrepModel(model) {
    const normalized = normalizePrepModel(model);
    normalized.updatedAt = new Date().toISOString();
    writeJSON(PREP_KEY, normalized);
    try { localStorage.setItem(LEGACY_LEFTOVER_KEY, normalized.scenario === "dinner_leftovers" ? "true" : "false"); } catch {}
    return normalized;
  }

  function compactMealForSavedPlan(meal) {
    const n = meal && meal.nutrition ? meal.nutrition : {};
    return {
      slot: meal && meal.slot,
      title: meal && meal.title,
      detail: meal && (meal.detail || meal.subtitle || ""),
      containerLabel: meal && meal.containerLabel,
      batchId: meal && meal.batchId,
      cycleLabel: meal && meal.cycleLabel,
      nutrition: {
        kcal: Math.round(Number(n.kcal || 0)),
        protein: Math.round(Number(n.protein || 0)),
        carbs: Math.round(Number(n.carbs || 0)),
        fat: Math.round(Number(n.fat || 0)),
        fibre: Math.round(Number(n.fibre || n.fiber || 0))
      }
    };
  }

  function persistBulkPrepPlan(plan, prepModel) {
    if (!plan || !prepModel || prepModel.scenario !== "weekly_bulk_prep") return null;
    const saved = {
      version: "v77",
      generatedAt: new Date().toISOString(),
      prepModel: normalizePrepModel(prepModel),
      prepPlan: plan.prepPlan || {},
      shoppingList: Array.isArray(plan.shoppingList) ? plan.shoppingList.slice(0, 80) : [],
      days: Array.isArray(plan.days) ? plan.days.map((day) => ({
        dayName: day.dayName,
        date: day.date,
        cycleDay: day.cycleDay,
        cycleLabel: day.cycleLabel,
        inPrepRange: day.inPrepRange,
        totals: day.totals || {},
        meals: Array.isArray(day.meals) ? day.meals.map(compactMealForSavedPlan) : []
      })) : []
    };
    writeJSON(BULK_PREP_PLAN_KEY, saved);
    return saved;
  }

  function readSavedBulkPrepPlan() {
    return readJSON(BULK_PREP_PLAN_KEY, null);
  }

  function isProteinLogged(slot) {
    const logs = readJSON(LOG_KEY, {});
    return !!(logs[todayKey()] && logs[todayKey()][slot]);
  }

  function toggleProtein(slot) {
    const logs = readJSON(LOG_KEY, {});
    const day = todayKey();
    logs[day] = logs[day] || {};
    logs[day][slot] = !logs[day][slot];
    writeJSON(LOG_KEY, logs);
  }

  function createMealsBridge(options) {
    options = options || {};
    const ui = options.ui || {};
    const engine = options.engine || window.HeartyMealsEngineV77 || window.HeartyMealsEngineV76 || window.HeartyMealsEngineV73 || window.HeartyMealsEngineV72 || window.HeartyMealsEngineV71 || window.heartyMealsEngine;

    const bridge = {
      state: {
        selectedDayIndex: Number(localStorage.getItem("heartyMealsCurrentDay") || 0),
        profile: options.initialProfile || {},
        prepModel: readPrepModel(),
        plan: null,
        week: [],
        shoppingList: [],
        planSeed: readPlanSeed(),
        adjustments: loadMealAdjustments()
      },

      init() {
        this.bind();
        this.regenerateWeek(false);
      },

      syncSupportModeFromStorage() {
        this.state.adjustments = Object.assign({}, this.state.adjustments || {}, loadMealAdjustments());
        return this.state.adjustments;
      },

      syncPrepModelFromStorage() {
        this.state.prepModel = readPrepModel();
        return this.state.prepModel;
      },

      buildPlan() {
        this.syncSupportModeFromStorage();
        this.syncPrepModelFromStorage();
        this.state.profile = Object.assign({}, this.state.profile || {}, { snacksEnabled: true, snackEnabled: true });

        if (!engine || typeof engine.generateWeekPlan !== "function") {
          throw new Error("Hearty v73 meal engine was not available.");
        }

        const plan = engine.generateWeekPlan({
          profile: this.state.profile,
          adjustments: this.state.adjustments,
          prepModel: this.state.prepModel,
          planSeed: this.state.planSeed
        });

        this.state.plan = plan;
        this.state.week = plan.days || [];
        this.state.shoppingList = plan.shoppingList || [];
        if (this.state.prepModel && this.state.prepModel.scenario === "weekly_bulk_prep") {
          this.state.savedBulkPrepPlan = persistBulkPrepPlan(plan, this.state.prepModel);
        } else {
          this.state.savedBulkPrepPlan = readSavedBulkPrepPlan();
        }
        return plan;
      },

      bind() {
        const dayTabs = ui.dayTabs || $("plannerDays");

        if (dayTabs && !dayTabs.__bound) {
          dayTabs.__bound = true;
          dayTabs.addEventListener("click", (event) => {
            const btn = event.target.closest("button");
            if (!btn) return;
            const buttons = Array.from(dayTabs.querySelectorAll("button"));
            const idx = buttons.indexOf(btn);
            if (idx >= 0) {
              this.state.selectedDayIndex = idx;
              localStorage.setItem("heartyMealsCurrentDay", String(idx));
              this.render();
            }
          });
        }

        if (!document.__heartyMealsBridgeBoundV73) {
          document.__heartyMealsBridgeBoundV73 = true;

          document.addEventListener("click", (event) => {
            const proteinBtn = event.target.closest("[data-log-protein]");
            if (proteinBtn) {
              toggleProtein(proteinBtn.dataset.logProtein);
              this.render();
              return;
            }

            const scenarioBtn = event.target.closest("[data-prep-scenario]");
            if (scenarioBtn) {
              const next = Object.assign({}, this.state.prepModel, { scenario: scenarioBtn.getAttribute("data-prep-scenario") });
              this.state.prepModel = writePrepModel(next);
              this.regenerateWeek();
              return;
            }

            const supportBtn = event.target.closest("[data-support-mode], [data-support]");
            if (supportBtn) {
              const selectedMode = supportBtn.getAttribute("data-support-mode") || supportBtn.getAttribute("data-support");
              this.state.adjustments.supportMode = writeGlobalSupportMode(selectedMode, "meals");
              this.regenerateWeek();
              return;
            }

            if (event.target.closest("[data-support-off], .support-chip-off, #supportOffBtn, [data-support-clear]")) {
              this.state.adjustments.supportMode = writeGlobalSupportMode(null, "meals");
              this.regenerateWeek();
              return;
            }

            if (event.target.closest("[data-regenerate-bulk-prep]")) {
              this.regeneratePrepPlanOnly();
              return;
            }

            if (event.target.closest("[data-regenerate-week]")) {
              this.regenerateWeek(true, { forceNew: true });
              return;
            }

            if (event.target.closest("[data-regenerate-day]")) {
              this.regenerateDay(this.state.selectedDayIndex);
            }
          });

          document.addEventListener("change", (event) => {
            const field = event.target.closest("[data-bulk-prep-field]");
            if (!field) return;

            const current = normalizePrepModel(this.state.prepModel);
            const bulk = Object.assign({}, current.bulkPrep || {});
            const name = field.getAttribute("data-bulk-prep-field");

            if (name === "prepDay") bulk.prepDay = field.value || "Sunday";
            if (name === "prepDaysCount") bulk.prepDaysCount = clampNumber(field.value, 1, 7, 5);
            if (name === "batchRecipeCount") bulk.batchRecipeCount = clampNumber(field.value, 1, 4, 3);
            if (name === "fridgeDays") bulk.fridgeDays = clampNumber(field.value, 1, 5, 3);
            if (name === "includeSnacks") bulk.includeSnacks = !!field.checked;
            if (name === "mealsToPrep") {
              bulk.mealsToPrep = Array.from(document.querySelectorAll("[data-bulk-meal-slot]:checked")).map((input) => input.value);
            }

            this.state.prepModel = writePrepModel(Object.assign({}, current, { bulkPrep: bulk }));
            this.regenerateWeek();
          });
        }

        if (!window.__heartyMealsBridgeStorageBoundV73) {
          window.__heartyMealsBridgeStorageBoundV73 = true;
          window.addEventListener("storage", (event) => {
            if ([SUPPORT_STORAGE_KEY, LEGACY_SUPPORT_KEY, PREP_KEY].includes(event.key)) this.regenerateWeek();
          });
          window.addEventListener("hearty:support-mode-changed", () => this.regenerateWeek());
          window.addEventListener("hearty-support-mode-changed", () => this.regenerateWeek());
        }
      },

      render() {
        this.syncSupportModeFromStorage();
        renderTabs(this.state.selectedDayIndex, ui.dayTabs, this.state.week);
        renderSupportState(this.state.adjustments.supportMode);
        renderPrepControls(this.state.prepModel, this.state.plan);
        renderPrepSummary(this.state.plan);
        renderSavedBulkPrep(this.state.savedBulkPrepPlan || readSavedBulkPrepPlan(), this.state.prepModel);
        renderMeals(this.state.week[this.state.selectedDayIndex], ui.mealList, this.state.adjustments);
        renderProteinMeter();
      },

      regenerateWeek(shouldRender = true, options = {}) {
        if (options && options.forceNew) {
          this.state.planSeed = bumpPlanSeed();
        } else {
          this.state.planSeed = readPlanSeed();
        }
        this.buildPlan();
        if (this.state.selectedDayIndex > this.state.week.length - 1) this.state.selectedDayIndex = 0;
        this.render();
        if (options && options.forceNew) showMealsToast("New weekly plan created.");
      },

      generateWeek() {
        this.regenerateWeek(true, { forceNew: true });
      },

      regeneratePrepPlanOnly() {
        this.syncPrepModelFromStorage();
        this.syncSupportModeFromStorage();
        this.state.profile = Object.assign({}, this.state.profile || {}, { snacksEnabled: true, snackEnabled: true });

        if (!this.state.plan || !Array.isArray(this.state.week) || !this.state.week.length) {
          this.buildPlan();
        }

        if (!this.state.prepModel || this.state.prepModel.scenario !== "weekly_bulk_prep") {
          showMealsToast("Prep plan refresh is only for Weekly bulk prep mode.");
          this.render();
          return;
        }

        if (engine && typeof engine.refreshPrepPlanFromExistingPlan === "function") {
          const refreshed = engine.refreshPrepPlanFromExistingPlan({
            plan: this.state.plan || { days: this.state.week },
            profile: this.state.profile,
            prepModel: this.state.prepModel,
            refreshSeed: Date.now()
          });
          this.state.plan = refreshed || this.state.plan;
          this.state.week = (this.state.plan && this.state.plan.days) || this.state.week || [];
          this.state.shoppingList = (this.state.plan && this.state.plan.shoppingList) || this.state.shoppingList || [];
        }

        this.state.savedBulkPrepPlan = persistBulkPrepPlan(this.state.plan, this.state.prepModel);
        this.render();
        showMealsToast("Prep plan refreshed. Weekly meals kept the same.");
      },

      regenerateDay(index) {
        index = Number.isFinite(Number(index)) ? Number(index) : this.state.selectedDayIndex;
        this.state.planSeed = bumpPlanSeed();
        this.buildPlan();
        this.state.selectedDayIndex = Math.max(0, Math.min(6, index));
        localStorage.setItem("heartyMealsCurrentDay", String(this.state.selectedDayIndex));
        this.render();
      },

      refresh() {
        this.render();
      },

      refreshMealsUI() {
        this.render();
      },

      renderMeals() {
        this.render();
      },

      getShoppingList() {
        if (!this.state.shoppingList || !this.state.shoppingList.length) this.buildPlan();
        return this.state.shoppingList || [];
      }
    };

    return bridge;
  }

  function renderTabs(idx, dayTabs, week) {
    dayTabs = dayTabs || $("plannerDays");
    if (!dayTabs) return;

    const days = week && week.length ? week : [];
    dayTabs.innerHTML = Array.from({ length: 7 }).map((_, i) => {
      const day = days[i] || {};
      const sub = day.cycleLabel ? `${niceShortDate(day.date)} • ${day.cycleLabel}` : (day.date ? niceShortDate(day.date) : "Day " + (i + 1));
      return `<button class="planner-day ${i === idx ? "is-active active" : ""}" type="button"><span>${escapeHtml(day.dayName || "Day " + (i + 1))}</span><small>${escapeHtml(sub)}</small></button>`;
    }).join("");
  }

  function niceShortDate(iso) {
    try {
      const d = new Date(iso + "T00:00:00");
      return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return iso; }
  }

  function renderSupportState(activeMode) {
    activeMode = normaliseSupportMode(activeMode);

    document.querySelectorAll("[data-support-mode], [data-support]").forEach((btn) => {
      const btnMode = normaliseSupportMode(btn.getAttribute("data-support-mode") || btn.getAttribute("data-support"));
      btn.classList.toggle("is-active", btnMode === activeMode);
      btn.classList.toggle("active", btnMode === activeMode);
      btn.setAttribute("aria-pressed", btnMode === activeMode ? "true" : "false");
    });

    document.querySelectorAll("[data-support-off], .support-chip-off, #supportOffBtn, [data-support-clear]").forEach((btn) => {
      btn.classList.toggle("is-active", !activeMode);
      btn.classList.toggle("active", !activeMode);
      btn.setAttribute("aria-pressed", !activeMode ? "true" : "false");
    });

    const status = $("supportPill") || $("supportStatus") || document.querySelector("[data-support-status]");
    if (status) status.textContent = activeMode ? SUPPORT_LABELS[activeMode] || "Support on" : "Okay";

    document.body.classList.toggle("support-mode-active", !!activeMode);
    if (activeMode) document.body.setAttribute("data-support-mode", activeMode);
    else document.body.removeAttribute("data-support-mode");
  }

  function renderPrepControls(prepModel, plan) {
    prepModel = normalizePrepModel(prepModel);
    const card = $("mealPrepCard");
    if (!card) return;

    card.querySelectorAll("[data-prep-scenario]").forEach((btn) => {
      const active = btn.getAttribute("data-prep-scenario") === prepModel.scenario;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    const bulkWrap = $("bulkPrepOptions");
    if (bulkWrap) bulkWrap.hidden = prepModel.scenario !== "weekly_bulk_prep";

    setValue("bulkPrepDay", prepModel.bulkPrep.prepDay);
    setValue("bulkPrepDaysCount", prepModel.bulkPrep.prepDaysCount);
    setValue("bulkBatchRecipeCount", prepModel.bulkPrep.batchRecipeCount);
    setValue("bulkFridgeDays", prepModel.bulkPrep.fridgeDays);

    const includeSnacks = $("bulkIncludeSnacks");
    if (includeSnacks) includeSnacks.checked = !!prepModel.bulkPrep.includeSnacks;

    document.querySelectorAll("[data-bulk-meal-slot]").forEach((input) => {
      input.checked = prepModel.bulkPrep.mealsToPrep.includes(input.value);
    });

    const container = $("containerSummary");
    const containerPlan = plan && plan.prepPlan && plan.prepPlan.containerPlan;
    if (container && containerPlan) {
      const advice = Array.isArray(containerPlan.advice) ? containerPlan.advice.slice(0, 3) : [];
      container.innerHTML = `
        <strong>${escapeHtml(containerPlan.summary)}</strong>
        ${containerPlan.labels && containerPlan.labels.length ? `<span>${escapeHtml(containerPlan.labels.slice(0, 5).join(", "))}${containerPlan.labels.length > 5 ? "…" : ""}</span>` : ""}
        ${advice.length ? `<ul class="container-advice-list">${advice.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
      `;
    }
  }

  function setValue(id, value) {
    const el = $(id);
    if (el && String(el.value) !== String(value)) el.value = value;
  }

  function renderPrepSummary(plan) {
    const summary = $("prepPlanSummary");
    if (!summary || !plan || !plan.prepPlan) return;
    const prep = plan.prepPlan;
    const containers = prep.containerPlan || {};
    const scenario = prep.scenario || (plan.prepModel && plan.prepModel.scenario) || "";
    const batches = Array.isArray(prep.batchRecipes) ? prep.batchRecipes : [];

    summary.innerHTML = `
      <div class="prep-summary-main">
        <span class="prep-summary-pill">${escapeHtml(prep.label || "Prep model")}</span>
        <div>
          <strong>${escapeHtml(prep.summary || "Your prep plan is ready.")}</strong>
          <span>${escapeHtml(containers.summary || "")}</span>
        </div>
      </div>
      ${scenario === "weekly_bulk_prep" && batches.length ? `<div class="prep-mini-row">${batches.slice(0, 3).map((batch) => `<span>${escapeHtml(batch.title)} • ${escapeHtml(batch.portions)} portions</span>`).join("")}</div>` : ""}
    `;
  }

  function compactPortionText(items, maxItems) {
    const list = Array.isArray(items) ? items.filter(Boolean).slice(0, maxItems || 3) : [];
    return list.join(" • ");
  }

  function renderPrepCookList(batches) {
    batches = Array.isArray(batches) ? batches.filter(Boolean) : [];
    if (!batches.length) return "";
    return `
      <div class="prep-cook-list">
        <h4 class="prep-cook-title">What to cook</h4>
        ${batches.map((batch) => {
          const portion = compactPortionText(batch.portionGuide, 3);
          const firstStep = Array.isArray(batch.prepSteps) && batch.prepSteps.length ? batch.prepSteps[0] : "Cook, portion and label.";
          return `
            <div class="prep-cook-item">
              <strong>${escapeHtml(batch.title || "Batch recipe")}</strong>
              <span>Make ${escapeHtml(String(batch.portions || 1))} portion${Number(batch.portions || 1) === 1 ? "" : "s"}</span>
              ${portion ? `<p>Per portion: ${escapeHtml(portion)}</p>` : ""}
              <p>${escapeHtml(firstStep)}</p>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderSavedBulkPrep(saved, prepModel) {
    const wrap = $("savedBulkPrepPlan");
    if (!wrap) return;
    prepModel = normalizePrepModel(prepModel);
    if (prepModel.scenario !== "weekly_bulk_prep") {
      wrap.hidden = true;
      wrap.innerHTML = "";
      return;
    }

    const prep = saved && saved.prepPlan ? saved.prepPlan : null;
    const containers = prep && prep.containerPlan ? prep.containerPlan : {};
    const batches = prep && Array.isArray(prep.batchRecipes) ? prep.batchRecipes : [];
    const generated = saved && saved.generatedAt ? niceSavedDate(saved.generatedAt) : "Not saved yet";
    const steps = prep && Array.isArray(prep.steps) ? prep.steps.slice(0, 4) : [];
    const advice = prep && Array.isArray(prep.containerAdvice) ? prep.containerAdvice.slice(0, 4) : [];

    wrap.hidden = false;
    wrap.innerHTML = `
      <div class="saved-prep-head">
        <div>
          <div class="section-label">SAVED PREP</div>
          <h3 class="saved-prep-title">Your weekly prep plan</h3>
          <p>Saved ${escapeHtml(generated)}. Use this until you regenerate your prep plan.</p>
        </div>
        <button class="planner-action primary" data-regenerate-bulk-prep type="button">Refresh prep plan</button>
      </div>
      <div class="saved-prep-stats">
        <span><strong>${escapeHtml(String(containers.total || 0))}</strong> containers</span>
        <span><strong>${escapeHtml(String(batches.length || 0))}</strong> batch recipes</span>
        <span><strong>3</strong> day cycle</span>
      </div>
      ${renderPrepCookList(batches)}
      <div class="prep-pack-strip">
        <strong>Container advice:</strong> ${escapeHtml(containers.summary || "Use simple labelled containers.")}
        ${Array.isArray(containers.labels) && containers.labels.length ? `<div class="prep-label-preview">${containers.labels.slice(0, 6).map((label) => `<span>${escapeHtml(label)}</span>`).join("")}${containers.labels.length > 6 ? `<span>+${escapeHtml(String(containers.labels.length - 6))} more</span>` : ""}</div>` : ""}
      </div>
      <details class="saved-prep-details">
        <summary>Full prep notes and container labels</summary>
        ${steps.length ? `<ol>${steps.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>` : ""}
        ${advice.length ? `<ul>${advice.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
        ${Array.isArray(containers.labels) && containers.labels.length ? `<ul>${containers.labels.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
      </details>
    `;
  }

  function niceSavedDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return "recently"; }
  }

  function renderMeals(day, mealList, adjustments) {
    mealList = mealList || $("mealList");
    if (!mealList || !day) return;
    const supportMode = normaliseSupportMode(day.supportMode || (adjustments && adjustments.supportMode));
    const totals = day.totals || {};

    mealList.innerHTML = `
      <div class="meal-day-summary">
        <div>
          <div class="section-label">${escapeHtml(day.dayName || "Today")}${day.cycleLabel ? " • " + escapeHtml(day.cycleLabel) : ""}</div>
          <h3>${escapeHtml(day.date ? niceLongDate(day.date) : "Today’s meals")}</h3>
          <p>Estimated day total: ±${Math.round(totals.kcal || 0)} kcal incl. buffer</p>
        </div>
        <div class="meal-total-pill">Protein ±${Math.round(totals.protein || 0)}g<br>Carbs ±${Math.round(totals.carbs || 0)}g • Fat ±${Math.round(totals.fat || 0)}g • Fibre ±${Math.round(totals.fibre || 0)}g</div>
      </div>
      ${day.meals.map((meal) => renderMealCard(meal, supportMode)).join("")}
    `;
  }

  function renderMealCard(meal, supportMode) {
    const logged = isProteinLogged(meal.slot);
    const isSnack = String(meal.slot).toLowerCase().includes("snack");
    const supportBadge = meal.supportAdjusted || supportMode ? `<span class="meal-card__support">Support</span>` : "";
    const leftoverBadge = meal.leftoverOf ? `<span class="meal-card__support meal-card__leftover">Leftover</span>` : "";
    const batchBadge = meal.batchId ? `<span class="meal-card__support meal-card__batch">Batch</span>` : "";
    const nutrition = meal.nutrition || {};
    const portionGuide = Array.isArray(meal.portionGuide) ? meal.portionGuide.filter(Boolean).slice(0, 6) : [];
    const compactPortionCount = isSnack ? 2 : 3;
    const compactPortion = compactPortionText(portionGuide, compactPortionCount);
    const extraPortionGuide = portionGuide.slice(compactPortionCount);
    const expandedPortionGuide = extraPortionGuide.length ? extraPortionGuide : portionGuide;
    const expandedPortionTitle = extraPortionGuide.length ? "Extra portion detail" : "Full portion detail";
    const prepSteps = Array.isArray(meal.prepSteps) ? meal.prepSteps.filter(Boolean).slice(0, 5) : [];
    const packNotes = [];
    if (meal.containerLabel) packNotes.push("Container: " + meal.containerLabel);
    if (meal.storageNote) packNotes.push(meal.storageNote);
    if (meal.batchInstruction) packNotes.push(meal.batchInstruction);
    const detailId = "meal-detail-" + escapeHtml(String(meal.slot || "meal")) + "-" + Math.random().toString(36).slice(2, 7);

    return `
      <article class="meal-card ${meal.supportAdjusted || supportMode ? "is-support-adjusted" : ""}" data-slot="${escapeHtml(meal.slot)}">
        <div class="meal-card__header">
          <div>
            <div class="meal-card__eyebrow">${escapeHtml(label(meal.slot))} ${supportBadge}${leftoverBadge}${batchBadge}</div>
            <h3 class="meal-card__title">${escapeHtml(meal.title)}</h3>
            <div class="meal-card__subtitle">${escapeHtml(meal.detail || meal.subtitle || "")}</div>
            ${meal.servingNote ? `<div class="meal-serving-note">${escapeHtml(meal.servingNote)}</div>` : ""}
            ${compactPortion ? `<div class="meal-visible-portion"><strong>Cook / serve:</strong> ${escapeHtml(compactPortion)}</div>` : ""}
          </div>
          <div class="meal-card__protein">${isSnack ? "Optional" : logged ? "Logged" : "±" + Math.round(nutrition.protein || 0) + "g protein"}</div>
        </div>
        <div class="meal-meta-row" aria-label="Estimated meal macros">
          <span>±${Math.round(nutrition.kcal || 0)} kcal</span>
          <span>Carbs ±${Math.round(nutrition.carbs || 0)}g</span>
          <span>Fat ±${Math.round(nutrition.fat || 0)}g</span>
          <span>Fibre ±${Math.round(nutrition.fibre || 0)}g</span>
        </div>
        ${packNotes.length ? `<div class="meal-pack-note">${packNotes.slice(0, 2).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>` : ""}
        ${(portionGuide.length || prepSteps.length || meal.prepNote) ? `
          <details class="meal-detail-collapse" id="${detailId}">
            <summary>View portion + prep</summary>
            <div class="meal-detail-grid">
              ${expandedPortionGuide.length ? `<div class="meal-detail-panel"><strong>${escapeHtml(expandedPortionTitle)}</strong><ul>${expandedPortionGuide.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>` : ""}
              ${prepSteps.length ? `<div class="meal-detail-panel"><strong>Prep</strong><ol>${prepSteps.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol></div>` : ""}
            </div>
            ${meal.prepNote ? `<div class="meal-prep-note">${escapeHtml(meal.prepNote)}</div>` : ""}
          </details>
        ` : ""}
        ${meal.supportNote ? `<div class="meal-support-note">${escapeHtml(meal.supportNote)}</div>` : ""}
        ${isSnack ? "" : `
          <div class="meal-card__actions">
            <button type="button" data-log-protein="${escapeHtml(meal.slot)}">${logged ? "Protein logged ✓" : "Log protein"}</button>
          </div>
        `}
      </article>
    `;
  }

  function niceLongDate(iso) {
    try {
      const d = new Date(iso + "T00:00:00");
      return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
    } catch { return iso; }
  }

  function renderProteinMeter() {
    const slots = ["breakfast", "lunch", "dinner"];
    const count = slots.filter(isProteinLogged).length;
    const meter = $("proteinMeter");
    const text = $("proteinMeterText");
    const pips = $("proteinMeterPips");

    if (meter) meter.style.setProperty("--protein-percent", Math.round((count / 3) * 100));
    if (text) text.textContent = `${count} / 3 protein meals`;
    if (pips) pips.innerHTML = slots.map((slot) => `<span class="protein-pip ${isProteinLogged(slot) ? "is-filled" : ""}"></span>`).join("");

    document.querySelectorAll(".protein-chip").forEach((chip) => {
      const name = chip.querySelector(".protein-name") && chip.querySelector(".protein-name").textContent.toLowerCase();
      const done = isProteinLogged(name);
      chip.classList.toggle("done", done);
      const state = chip.querySelector(".protein-state");
      if (state) state.textContent = done ? "Logged" : "Pending";
    });
  }

  function label(slot) {
    slot = String(slot || "").toLowerCase();
    if (slot.includes("break")) return "Breakfast";
    if (slot.includes("lunch")) return "Lunch";
    if (slot.includes("dinner")) return "Dinner";
    if (slot.includes("snack")) return "Snack";
    return "Meal";
  }

  window.createMealsBridge = createMealsBridge;
  window.HeartyMealsBridgeVersion = BRIDGE_VERSION;
  window.createHeartyMealsBridge = createMealsBridge;
  window.HeartyMealsSupport = window.HeartyMealsSupport || {
    read: readGlobalSupportMode,
    write: writeGlobalSupportMode,
    normalise: normaliseSupportMode
  };
})();
