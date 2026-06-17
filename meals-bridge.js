(function () {
  "use strict";

  const LOG_KEY = "heartyProteinLogsV1";
  const LEFTOVER_KEY = "heartyDinnerToLunchEnabled";
  const SNACKS_KEY = "heartyMealsSnacksOn";
  const SUPPORT_STORAGE_KEY = "hearty_support_mode_v1";
  const LEGACY_SUPPORT_KEY = "meals_support_mode";

  const $ = (id) => document.getElementById(id);

  const SUPPORT_MODE_MAP = {
    nausea: "nausea",
    "nausea": "nausea",
    "Nausea": "nausea",

    bloating: "bloating",
    "bloating": "bloating",
    "Bloating": "bloating",

    exhaustion: "exhaustion",
    "exhaustion": "exhaustion",
    fatigue: "exhaustion",
    "fatigue": "exhaustion",
    "Fatigue": "exhaustion",
    "low energy": "exhaustion",
    "Low energy": "exhaustion",
    "Low Energy": "exhaustion",
    tired: "exhaustion",
    "Tired": "exhaustion",

    low_appetite: "low_appetite",
    "low_appetite": "low_appetite",
    "low appetite": "low_appetite",
    "Low appetite": "low_appetite",
    "Low Appetite": "low_appetite",
    appetite: "low_appetite",
    "Appetite": "low_appetite"
  };

  const SUPPORT_LABELS = {
    nausea: "Support on: nausea",
    bloating: "Support on: bloating",
    exhaustion: "Support on: low energy",
    low_appetite: "Support on: low appetite"
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
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function snacksEnabled() {
    return localStorage.getItem(SNACKS_KEY) !== "false";
  }

  function normaliseSupportMode(value) {
    if (!value) return null;
    const raw = String(value).trim();
    if (!raw) return null;
    return SUPPORT_MODE_MAP[raw] || SUPPORT_MODE_MAP[raw.toLowerCase()] || null;
  }

  function readGlobalSupportMode() {
    try {
      const raw = localStorage.getItem(SUPPORT_STORAGE_KEY);

      // Canonical key is the authority. If it exists and is off, never fall back
      // to meals_support_mode because that key may be stale from an old support day.
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.active === true || parsed.isActive === true)) {
          return normaliseSupportMode(parsed.reason || parsed.mode || parsed.type || parsed.symptom);
        }
        return null;
      }
    } catch {
      return null;
    }

    // Legacy fallback disabled to prevent support turning on by itself.
    // Other pages should write hearty_support_mode_v1 going forward.
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
      try {
        localStorage.removeItem(LEGACY_SUPPORT_KEY);
      } catch {}
      return null;
    }

    writeJSON(SUPPORT_STORAGE_KEY, {
      active: true,
      reason: supportMode,
      source: source || "meals",
      updatedAt: new Date().toISOString()
    });

    // Keep the legacy key alive while the other pages are being patched file by file.
    try {
      localStorage.setItem(LEGACY_SUPPORT_KEY, supportMode);
    } catch {}

    return supportMode;
  }

  function loadMealAdjustments() {
    const supportMode = readGlobalSupportMode();

    return {
      supportMode,
      lowAppetite: supportMode === "low_appetite",
      supportActive: !!supportMode
    };
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

  function leftoversEnabled() {
    return localStorage.getItem(LEFTOVER_KEY) === "true";
  }

  function setLeftoversEnabled(value) {
    localStorage.setItem(LEFTOVER_KEY, value ? "true" : "false");
  }

  function createMealsBridge(options) {
    options = options || {};
    const ui = options.ui || {};

    const bridge = {
      state: {
        selectedDayIndex: Number(localStorage.getItem("heartyMealsCurrentDay") || 0),
        week: [],
        shoppingList: [],
        adjustments: loadMealAdjustments()
      },

      init() {
        this.syncSupportModeFromStorage();
        this.state.week = buildWeek(this.state.adjustments);
        applyLeftovers(this.state.week);
        this.bind();
        this.render();
      },

      syncSupportModeFromStorage() {
        this.state.adjustments = loadMealAdjustments();
        return this.state.adjustments;
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

        if (!document.__heartyMealsBridgeBound) {
          document.__heartyMealsBridgeBound = true;

          document.addEventListener("click", (event) => {
            const proteinBtn = event.target.closest("[data-log-protein]");
            if (proteinBtn) {
              toggleProtein(proteinBtn.dataset.logProtein);
              this.render();
              return;
            }

            const supportBtn = event.target.closest("[data-support-mode], [data-support]");
            if (supportBtn) {
              const selectedMode = supportBtn.getAttribute("data-support-mode") || supportBtn.getAttribute("data-support");
              this.state.adjustments.supportMode = writeGlobalSupportMode(selectedMode, "meals");
              this.state.adjustments.lowAppetite = this.state.adjustments.supportMode === "low_appetite";
              this.regenerateWeek();
              return;
            }

            if (event.target.closest("[data-support-off], .support-chip-off, #supportOffBtn, [data-support-clear]")) {
              this.state.adjustments.supportMode = writeGlobalSupportMode(null, "meals");
              this.state.adjustments.lowAppetite = false;
              this.regenerateWeek();
              return;
            }

            if (event.target.closest("[data-regenerate-week]")) {
              this.syncSupportModeFromStorage();
              this.state.week = buildWeek(this.state.adjustments);
              applyLeftovers(this.state.week);
              this.render();
              return;
            }

            if (event.target.closest("[data-regenerate-day]")) {
              this.syncSupportModeFromStorage();
              this.state.week[this.state.selectedDayIndex] = buildDay(this.state.selectedDayIndex + 1, this.state.adjustments);
              applyLeftovers(this.state.week);
              this.render();
            }
          });

          document.addEventListener("change", (event) => {
            const toggle = event.target.closest("[data-leftover-toggle]");
            if (toggle) {
              setLeftoversEnabled(toggle.checked);
              this.syncSupportModeFromStorage();
              this.state.week = buildWeek(this.state.adjustments);
              applyLeftovers(this.state.week);
              this.render();
            }
          });
        }

        if (!window.__heartyMealsBridgeStorageBound) {
          window.__heartyMealsBridgeStorageBound = true;
          window.addEventListener("storage", (event) => {
            if (event.key === SUPPORT_STORAGE_KEY || event.key === LEGACY_SUPPORT_KEY) {
              this.regenerateWeek();
            }
          });
        }
      },

      render() {
        this.syncSupportModeFromStorage();
        renderTabs(this.state.selectedDayIndex, ui.dayTabs);
        renderSupportState(this.state.adjustments.supportMode);
        renderLeftoverToggle();
        renderMeals(this.state.week[this.state.selectedDayIndex], ui.mealList, this.state.adjustments);
        renderProteinMeter();
        this.state.shoppingList = buildShoppingList(this.state.adjustments);
      },

      regenerateWeek() {
        this.syncSupportModeFromStorage();
        this.state.week = buildWeek(this.state.adjustments);
        applyLeftovers(this.state.week);
        this.render();
      },

      generateWeek() {
        this.regenerateWeek();
      },

      refresh() {
        this.render();
      },

      getShoppingList() {
        this.syncSupportModeFromStorage();
        return buildShoppingList(this.state.adjustments);
      }
    };

    return bridge;
  }

  function finalEngineInput() {
    return {
      region: localStorage.getItem("heartyMealsCountry") || localStorage.getItem("heartyCountry") || "SA",
      proteins: ["chicken", "beef", "fish", "eggs", "dairy", "pork"],
      breakfastItems: ["eggs", "yoghurt", "protein_shake", "oats"],
      snackProteins: ["yoghurt", "cottage_cheese", "boiled_eggs", "biltong", "tuna", "protein_shake", "chicken_strips"],
      starches: ["rice", "pasta", "sweet_potato"],
      vegetables: ["spinach", "tomato", "onion", "carrot", "baby marrow", "green beans", "mushrooms", "peppers", "broccoli", "cucumber", "lettuce"],
      leftoverLunches: leftoversEnabled(),
      lowerStarch: false
    };
  }

  function toAppMeal(slot, meal, supportAdjusted) {
    meal = meal || {};
    const protein = meal.protein ? `Approx. ${meal.protein} protein` : "Approx. protein";
    return {
      slot,
      title: meal.name || "Meal idea",
      subtitle: meal.detail || "Basic method not available yet.",
      protein,
      supportAdjusted: !!supportAdjusted
    };
  }

  function adaptFinalEngineDay(day, supportAdjusted) {
    const meals = [toAppMeal("breakfast", day.breakfast, supportAdjusted)];
    if (snacksEnabled()) meals.push(toAppMeal("morningSnack", day.morningSnack, supportAdjusted));
    meals.push(toAppMeal("lunch", day.lunch, supportAdjusted));
    if (snacksEnabled()) meals.push(toAppMeal("afternoonSnack", day.afternoonSnack, supportAdjusted));
    meals.push(toAppMeal("dinner", day.dinner, supportAdjusted));
    return { day: day.day, meals, supportAdjusted: !!supportAdjusted, engineSource: "hearty-meal-engine-final" };
  }

  function buildFinalEngineWeek(adjustments) {
    const engine = window.HeartyMealEngine;
    if (!engine || typeof engine.generatePlan !== "function") return null;
    const result = engine.generatePlan(finalEngineInput());
    if (!result || !result.days || !result.days.length) {
      console.warn("[Hearty Meals] Final engine did not return a usable week", result);
      return null;
    }
    return result.days.map((day) => adaptFinalEngineDay(day, false));
  }

  function buildWeek(adjustments) {
    adjustments = adjustments || loadMealAdjustments();
    if (normaliseSupportMode(adjustments.supportMode)) {
      return [1, 2, 3, 4, 5, 6, 7].map((dayNumber) => buildDay(dayNumber, adjustments));
    }
    const finalWeek = buildFinalEngineWeek(adjustments);
    if (finalWeek) return finalWeek;
    return [1, 2, 3, 4, 5, 6, 7].map((dayNumber) => buildDay(dayNumber, adjustments));
  }

  function buildDay(n, adjustments) {
    adjustments = adjustments || loadMealAdjustments();

    const supportDay = buildSupportDay(n, adjustments.supportMode);
    if (supportDay) return supportDay;

    const finalWeek = buildFinalEngineWeek(adjustments);
    if (finalWeek && finalWeek[n - 1]) return finalWeek[n - 1];

    return { day: n, meals: [
      { slot: "breakfast", title: "High-protein yogurt bowl", subtitle: "Greek-style yogurt with berries or fruit and cinnamon.", protein: "Approx. 20g protein" },
      { slot: "morningSnack", title: "Cottage cheese rice cakes", subtitle: "Low-fat cottage cheese on rice cakes or cracker-bread with cucumber or tomato.", protein: "Approx. 18g protein" },
      { slot: "lunch", title: "Chicken vegetable soup bowl", subtitle: "Cooked chicken simmered with soft vegetables and broth.", protein: "Approx. 33g protein" },
      { slot: "afternoonSnack", title: "Boiled egg with cucumber", subtitle: "One boiled egg with cucumber and tomato.", protein: "Approx. 7g protein" },
      { slot: "dinner", title: "Chicken curry with rice", subtitle: "Chicken cooked with tomato, onion, mild curry spices and vegetables. Serve with ½ cup cooked rice.", protein: "Approx. 35g protein" }
    ].filter((meal) => snacksEnabled() || !String(meal.slot).toLowerCase().includes("snack")), supportAdjusted: false, engineSource: "safe-fallback" };
  }

  function buildSupportDay(n, supportMode) {
    supportMode = normaliseSupportMode(supportMode);
    if (!supportMode) return null;

    const supportPlans = {
      nausea: [
        [
          "Low-fat yoghurt bowl with banana",
          "Plain crackers with tuna and cucumber",
          "Chicken soup with soft cooked carrots and baby marrow",
          "Small low-fat yoghurt or dry crackers"
        ],
        [
          "Oats bowl with low-fat milk and banana",
          "Boiled eggs with cucumber and plain rice cakes",
          "White fish with soft cooked vegetables",
          "Apple slices or low-fat yoghurt"
        ],
        [
          "Low-fat yoghurt bowl with berries",
          "Chicken soup cup with soft vegetables",
          "Simple chicken plate with carrots and a small sweet potato portion",
          "Cottage cheese on rice cakes"
        ]
      ],
      bloating: [
        [
          "2 x Eggs scrambled with spinach",
          "Chicken with cooked carrots and green beans",
          "White fish with baby marrow and spinach",
          "Low-fat yoghurt"
        ],
        [
          "Low-fat yoghurt bowl with berries",
          "Egg salad bowl with cucumber and tomato",
          "Chicken strips with soft cooked baby marrow and carrots",
          "Cottage cheese on rice cakes"
        ],
        [
          "Oats bowl with low-fat milk",
          "Tuna with cucumber and rice cakes",
          "Chicken soup with soft vegetables",
          "Small handful biltong"
        ]
      ],
      exhaustion: [
        [
          "Low-fat yoghurt bowl with berries",
          "Easy chicken protein plate with carrots and green beans",
          "Quick white fish with soft vegetables",
          "Cottage cheese or low-fat yoghurt"
        ],
        [
          "Overnight oats with low-fat milk and blueberries",
          "Tuna salad with rice cakes",
          "Chicken tray bake with baby marrow and peppers",
          "Fruit + small handful nuts"
        ],
        [
          "2 x Eggs on 1 slice whole wheat toast",
          "Leftover-style chicken bowl with cooked vegetables",
          "Lean mince bowl with tomato, onion and vegetables",
          "Low-fat yoghurt"
        ]
      ],
      low_appetite: [
        [
          "Small protein shake or low-fat yoghurt bowl",
          "Boiled eggs with apple slices",
          "Small chicken plate with soft cooked vegetables",
          "Low-fat yoghurt"
        ],
        [
          "Low-fat yoghurt bowl with banana",
          "Tuna on rice cakes with cucumber",
          "Small white fish plate with carrots and baby marrow",
          "Cottage cheese"
        ],
        [
          "2 x Eggs scrambled softly",
          "Chicken soup cup with soft vegetables",
          "Small lean beef stew portion with carrots",
          "Biltong or low-fat yoghurt"
        ]
      ]
    };

    const options = supportPlans[supportMode] || supportPlans.nausea;
    const p = options[(n - 1) % options.length];

    const subtitles = {
      nausea: [
        "Support Mode: cool, plain and gentle on nausea.",
        "Support Mode: small, bland protein-first lunch.",
        "Support Mode: warm, soft and easy to manage.",
        "Support Mode snack: optional and gentle."
      ],
      bloating: [
        "Support Mode: simple protein, lighter starch load.",
        "Support Mode: cooked vegetables and simple seasoning.",
        "Support Mode: light dinner with soft cooked vegetables.",
        "Support Mode snack: keep it simple."
      ],
      exhaustion: [
        "Support Mode: no-fuss breakfast.",
        "Support Mode: quick protein-first lunch.",
        "Support Mode: minimal-prep dinner.",
        "Support Mode snack: easy protein option."
      ],
      low_appetite: [
        "Support Mode: small protein-first option.",
        "Support Mode: smaller meal, still protein-led.",
        "Support Mode: half-size plate if needed.",
        "Support Mode snack: optional top-up."
      ]
    };

    const notes = subtitles[supportMode] || subtitles.nausea;

    const meals = [
      {
        slot: "breakfast",
        title: p[0],
        subtitle: notes[0],
        protein: "Support meal",
        supportAdjusted: true
      },
      {
        slot: "lunch",
        title: p[1],
        subtitle: notes[1],
        protein: "Support meal",
        supportAdjusted: true
      },
      {
        slot: "dinner",
        title: p[2],
        subtitle: notes[2],
        protein: "Support meal",
        supportAdjusted: true
      }
    ];

    if (snacksEnabled()) {
      meals.splice(1, 0, {
        slot: "snack",
        title: p[3],
        subtitle: notes[3],
        protein: "Support snack",
        supportAdjusted: true
      });
    }

    return {
      day: n,
      meals,
      supportAdjusted: true,
      supportMode
    };
  }

  function applyLeftovers(week) {
    if (!leftoversEnabled()) return;

    for (let i = 1; i < week.length; i++) {
      // Do not overwrite support-mode lunches. Support Mode must be the stronger rule.
      if (week[i] && week[i].supportAdjusted) continue;

      const yesterdayDinner = week[i - 1].meals.find((m) => m.slot === "dinner");
      const lunchIndex = week[i].meals.findIndex((m) => m.slot === "lunch");

      if (yesterdayDinner && lunchIndex >= 0) {
        week[i].meals[lunchIndex] = {
          slot: "lunch",
          title: "Yesterday’s dinner leftovers — no extra starch",
          subtitle: yesterdayDinner.title,
          protein: "Protein meal"
        };
      }
    }
  }

  function renderTabs(idx, dayTabs) {
    dayTabs = dayTabs || $("plannerDays");
    if (!dayTabs) return;

    dayTabs.querySelectorAll("button").forEach((btn, i) => {
      btn.classList.toggle("is-active", i === idx);
      btn.classList.toggle("active", i === idx);
    });
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

    const led = $("supportLed") || document.querySelector(".support-led");
    if (led) led.classList.toggle("active", !!activeMode);

    const status = $("supportStatus") || document.querySelector("[data-support-status]");
    if (status) status.textContent = activeMode ? SUPPORT_LABELS[activeMode] : "Support off";

    document.body.classList.toggle("support-mode-active", !!activeMode);
    if (activeMode) document.body.setAttribute("data-support-mode", activeMode);
    else document.body.removeAttribute("data-support-mode");
  }

  function renderLeftoverToggle() {
    const planner = document.querySelector(".planner-card");
    const days = $("plannerDays");
    if (!planner || !days) return;

    let wrap = $("leftoverToggleWrap");

    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "leftoverToggleWrap";
      wrap.className = "support-banner";
      planner.insertBefore(wrap, days);
    }

    wrap.innerHTML = `
      <label style="display:flex;align-items:center;gap:10px;font-weight:750;">
        <input type="checkbox" data-leftover-toggle ${leftoversEnabled() ? "checked" : ""}>
        Use dinner for tomorrow’s lunch
      </label>
    `;
  }

  function renderMeals(day, mealList, adjustments) {
    mealList = mealList || $("mealList");
    if (!mealList || !day) return;

    const supportMode = normaliseSupportMode(day.supportMode || adjustments?.supportMode);

    mealList.innerHTML = day.meals.map((meal) => {
      const logged = isProteinLogged(meal.slot);
      const isSnack = String(meal.slot).toLowerCase().includes("snack");
      const supportBadge = meal.supportAdjusted || supportMode ? `<span class="meal-card__support">Support adjusted</span>` : "";

      return `
        <article class="meal-card ${meal.supportAdjusted || supportMode ? "is-support-adjusted" : ""}" data-slot="${meal.slot}">
          <div class="meal-card__header">
            <div>
              <div class="meal-card__eyebrow">${label(meal.slot)} ${supportBadge}</div>
              <h3 class="meal-card__title">${meal.title}</h3>
              <div class="meal-card__subtitle">${meal.subtitle || ""}</div>
            </div>
            <div class="meal-card__protein">${isSnack ? "Optional" : logged ? "Logged" : meal.protein}</div>
          </div>

          ${isSnack ? "" : `
            <div class="meal-card__actions">
              <button type="button" data-log-protein="${meal.slot}">
                ${logged ? "Protein logged ✓" : "Log protein"}
              </button>
            </div>
          `}
        </article>
      `;
    }).join("");
  }

  function renderProteinMeter() {
    const slots = ["breakfast", "lunch", "dinner"];
    const count = slots.filter(isProteinLogged).length;

    const meter = $("proteinMeter");
    const text = $("proteinMeterText");
    const pips = $("proteinMeterPips");

    if (meter) meter.style.setProperty("--protein-percent", Math.round((count / 3) * 100));
    if (text) text.textContent = `${count} / 3 protein meals`;

    if (pips) {
      pips.innerHTML = slots.map((slot) =>
        `<span class="protein-pip ${isProteinLogged(slot) ? "is-filled" : ""}"></span>`
      ).join("");
    }

    document.querySelectorAll(".protein-chip").forEach((chip) => {
      const name = chip.querySelector(".protein-name")?.textContent?.toLowerCase();
      const done = isProteinLogged(name);

      chip.classList.toggle("done", done);

      const state = chip.querySelector(".protein-state");
      if (state) state.textContent = done ? "Logged" : "Pending";
    });
  }

  function buildShoppingList(adjustments) {
    const supportMode = normaliseSupportMode(adjustments?.supportMode || readGlobalSupportMode());

    if (supportMode) {
      return [
        { name: "Eggs", qty7: "10–14 eggs", qty30: "43–60 eggs" },
        { name: "Chicken breast / strips", qty7: "1–1.3 kg", qty30: "4.3–5.6 kg" },
        { name: "White fish / hake", qty7: "700–900 g", qty30: "3–4 kg" },
        { name: "Canned tuna", qty7: "3–4 tins", qty30: "13–17 tins" },
        { name: "Low-fat yoghurt", qty7: "2–2.5 kg", qty30: "8.5–11 kg" },
        { name: "Low-fat cottage cheese", qty7: "500–750 g", qty30: "2–3.2 kg" },
        { name: "Rice cakes / plain crackers", qty7: "1–2 packs", qty30: "4–8 packs" },
        { name: "Soft-cook vegetables", qty7: "3–5 kg mixed", qty30: "13–22 kg mixed" },
        { name: "Fruit", qty7: "7–10 portions", qty30: "30–43 portions" },
        { name: "Sweet potato / oats / rice", qty7: "4–7 gentle starch portions", qty30: "17–30 portions" },
        { name: "Optional support snacks", qty7: snacksEnabled() ? "7 gentle snack portions" : "Off", qty30: snacksEnabled() ? "30 gentle snack portions" : "Off" }
      ];
    }

    return [
      { name: "Eggs", qty7: "12–14 eggs", qty30: "52–60 eggs" },
      { name: "Chicken breast / strips", qty7: "1.2–1.5 kg", qty30: "5–6.5 kg" },
      { name: "Fish / hake / salmon", qty7: "700–900 g", qty30: "3–4 kg" },
      { name: "Canned tuna", qty7: "3–4 tins", qty30: "13–17 tins" },
      { name: "Lean beef / mince", qty7: "700–900 g", qty30: "3–4 kg" },
      { name: "Low-fat yoghurt", qty7: "1.5–2 kg", qty30: "6.5–8.5 kg" },
      { name: "Low-fat cottage cheese", qty7: "500–750 g", qty30: "2–3.2 kg" },
      { name: "Vegetables / salad", qty7: "4–6 kg mixed", qty30: "17–26 kg mixed" },
      { name: "Fruit", qty7: "7–10 portions", qty30: "30–43 portions" },
      { name: "Rice / couscous / sweet potato", qty7: "7 starch portions", qty30: "30 starch portions" },
      { name: "Low-calorie dressing", qty7: "1 bottle", qty30: "3–4 bottles" },
      { name: "Optional snacks", qty7: snacksEnabled() ? "7 snack portions" : "Off", qty30: snacksEnabled() ? "30 snack portions" : "Off" }
    ];
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

  window.HeartyMealsSupport = window.HeartyMealsSupport || {
    read: readGlobalSupportMode,
    write: writeGlobalSupportMode,
    normalise: normaliseSupportMode
  };
})();
