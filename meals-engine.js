(function () {
  "use strict";

  const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const ENGINE_VERSION = "v77-prep-refresh-split";
  const DEFAULT_TARGETS = { kcal: 1250, protein: 100, carbs: 110, fat: 42, fibre: 24 };

  const SLOT_LABELS = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack"
  };

  const RECIPES = {
    breakfast: [
      recipe("breakfast", "yoghurt_berry_bowl", "Greek yoghurt berry bowl", "Greek-style yoghurt with berries, chia seeds and a small handful of nuts.", { kcal: 330, protein: 32, carbs: 28, fat: 11, fibre: 8 }, ["Greek-style yoghurt", "berries", "chia seeds", "mixed nuts"], "5 minutes. Assemble cold."),
      recipe("breakfast", "egg_spinach_toast", "Egg and spinach toast", "Two eggs with spinach and one slice of wholegrain toast.", { kcal: 340, protein: 25, carbs: 27, fat: 15, fibre: 6 }, ["eggs", "spinach", "wholegrain bread"], "10 minutes. Pan scramble or boil eggs."),
      recipe("breakfast", "protein_oats", "Protein oats", "Oats cooked with milk, stirred through with yoghurt or protein powder and berries.", { kcal: 360, protein: 30, carbs: 44, fat: 8, fibre: 8 }, ["oats", "milk", "protein powder or yoghurt", "berries"], "8 minutes. Cook oats and stir protein in after cooking."),
      recipe("breakfast", "cottage_cheese_fruit", "Cottage cheese fruit bowl", "Cottage cheese with fruit, cinnamon and a few seeds.", { kcal: 300, protein: 30, carbs: 26, fat: 8, fibre: 5 }, ["cottage cheese", "fruit", "seeds"], "5 minutes. Assemble cold."),
      recipe("breakfast", "boiled_eggs_fruit", "Boiled eggs and fruit", "Two boiled eggs with fruit and a small yoghurt if needed.", { kcal: 320, protein: 25, carbs: 24, fat: 13, fibre: 5 }, ["eggs", "fruit", "plain yoghurt"], "Boil eggs ahead or make fresh."),
      recipe("breakfast", "smooth_yoghurt_bowl", "Smooth yoghurt bowl", "Low-fat yoghurt with banana, oats and cinnamon for an easy low-effort breakfast.", { kcal: 335, protein: 28, carbs: 45, fat: 5, fibre: 6 }, ["low-fat yoghurt", "banana", "oats", "cinnamon"], "5 minutes. Soft, quick option.")
    ],
    mains: [
      recipe("main", "chicken_mince_rice_bowl", "Chicken mince rice bowl", "Lean chicken mince with rice, carrots, spinach and a mild tomato-based sauce.", { kcal: 455, protein: 39, carbs: 42, fat: 13, fibre: 7 }, ["lean chicken mince", "rice", "carrots", "spinach", "tomato paste"], "20 minutes fresh. Batch-friendly.", { batch: true, freezer: true, protein: "chicken", method: "bowl" }),
      recipe("main", "turkey_bowl", "Turkey mince vegetable bowl", "Turkey mince with baby marrow, carrots, spinach and a small rice or potato portion.", { kcal: 445, protein: 40, carbs: 38, fat: 13, fibre: 8 }, ["turkey mince", "baby marrow", "carrots", "spinach", "rice or potato"], "20 minutes fresh. Batch-friendly.", { batch: true, freezer: true, protein: "turkey", method: "bowl" }),
      recipe("main", "beef_chilli_sweet_potato", "Lean beef chilli bowl", "Lean beef mince cooked with tomato, mild spices, beans and sweet potato.", { kcal: 485, protein: 38, carbs: 48, fat: 15, fibre: 10 }, ["lean beef mince", "tomato", "beans", "sweet potato", "mild chilli spice"], "25 minutes fresh. Batch-friendly.", { batch: true, freezer: true, protein: "beef", method: "stew" }),
      recipe("main", "chicken_curry_rice", "Mild chicken curry bowl", "Chicken breast cooked with mild curry spices, vegetables and a small rice portion.", { kcal: 465, protein: 41, carbs: 43, fat: 12, fibre: 7 }, ["chicken breast", "rice", "curry spices", "spinach", "carrots"], "25 minutes fresh. Batch-friendly.", { batch: true, freezer: true, protein: "chicken", method: "curry" }),
      recipe("main", "chicken_soup_bowl", "Chicken soup bowl", "Shredded chicken with soft vegetables, broth and a small pasta or potato portion.", { kcal: 410, protein: 38, carbs: 35, fat: 10, fibre: 7 }, ["chicken breast", "broth", "carrots", "spinach", "small pasta or potato"], "25 minutes. Gentle support-friendly option.", { batch: true, freezer: true, protein: "chicken", method: "soup" }),
      recipe("main", "hake_sweet_potato_plate", "Hake and sweet potato plate", "Baked hake with sweet potato and soft green vegetables.", { kcal: 430, protein: 36, carbs: 42, fat: 11, fibre: 8 }, ["hake or white fish", "sweet potato", "green beans", "spinach"], "20 minutes. Best cooked fresh.", { batch: false, freezer: false, protein: "fish", method: "plate" }),
      recipe("main", "prawn_stirfry_rice", "Prawn stir-fry rice bowl", "Prawns with stir-fry vegetables and a small rice portion.", { kcal: 420, protein: 35, carbs: 42, fat: 10, fibre: 7 }, ["prawns", "rice", "stir-fry vegetables", "soy or mild sauce"], "15 minutes. Best cooked fresh.", { batch: false, freezer: false, protein: "seafood", method: "stirfry" }),
      recipe("main", "tuna_potato_salad", "Tuna potato salad bowl", "Tuna with baby potatoes, yoghurt dressing, cucumber and salad vegetables.", { kcal: 400, protein: 34, carbs: 38, fat: 10, fibre: 6 }, ["tuna", "baby potatoes", "plain yoghurt", "cucumber", "salad vegetables"], "15 minutes if potatoes are pre-cooked.", { batch: false, freezer: false, protein: "tuna", method: "salad" }),
      recipe("main", "pork_stirfry", "Lean pork stir-fry", "Lean pork strips with broccoli, carrots, baby marrow and a small rice portion.", { kcal: 455, protein: 37, carbs: 42, fat: 13, fibre: 7 }, ["lean pork strips", "rice", "broccoli", "carrots", "baby marrow"], "20 minutes fresh.", { batch: false, freezer: false, protein: "pork", method: "stirfry" }),
      recipe("main", "lentil_chicken_stew", "Chicken lentil stew", "Chicken with lentils, carrots, spinach and tomato for a softer one-pot meal.", { kcal: 470, protein: 42, carbs: 46, fat: 10, fibre: 12 }, ["chicken breast", "lentils", "carrots", "spinach", "tomato"], "30 minutes. Batch-friendly.", { batch: true, freezer: true, protein: "chicken", method: "stew" })
    ],
    snacks: [
      recipe("snack", "cottage_cheese_berries", "Cottage cheese with berries", "Cottage cheese with berries or sliced fruit.", { kcal: 155, protein: 18, carbs: 14, fat: 3, fibre: 3 }, ["cottage cheese", "berries"], "2 minutes."),
      recipe("snack", "boiled_eggs", "Boiled eggs", "Two boiled eggs with cucumber or tomato.", { kcal: 155, protein: 13, carbs: 2, fat: 10, fibre: 1 }, ["eggs", "cucumber or tomato"], "Boil ahead or make fresh."),
      recipe("snack", "yoghurt", "Plain yoghurt snack", "Low-fat yoghurt with cinnamon.", { kcal: 145, protein: 15, carbs: 16, fat: 2, fibre: 0 }, ["low-fat yoghurt"], "2 minutes."),
      recipe("snack", "tuna_crackers", "Tuna and crackers", "Half a tin of tuna with plain crackers and cucumber.", { kcal: 170, protein: 19, carbs: 14, fat: 4, fibre: 2 }, ["tuna", "plain crackers", "cucumber"], "5 minutes."),
      recipe("snack", "protein_shake", "Protein shake", "Protein powder mixed with water or milk.", { kcal: 150, protein: 24, carbs: 6, fat: 3, fibre: 0 }, ["protein powder", "milk or water"], "2 minutes.")
    ]
  };



  const PORTION_GUIDES = {
    yoghurt_berry_bowl: ["Greek-style yoghurt ±200 g", "Berries ±100 g", "Chia seeds 1 tbsp", "Mixed nuts 10–15 g"],
    egg_spinach_toast: ["Eggs 2", "Spinach 1–2 handfuls", "Wholegrain toast 1 slice", "Cooking oil/spray minimal"],
    protein_oats: ["Oats ±40 g dry", "Milk ±150 ml", "Yoghurt ±150 g or protein powder 1 scoop", "Berries ±80 g"],
    cottage_cheese_fruit: ["Cottage cheese ±200 g", "Fruit 1 small serving", "Seeds 1 tbsp", "Cinnamon optional"],
    boiled_eggs_fruit: ["Eggs 2", "Fruit 1 small serving", "Plain yoghurt ±100 g if needed"],
    smooth_yoghurt_bowl: ["Low-fat yoghurt ±250 g", "Banana 1 small", "Oats ±25 g", "Cinnamon optional"],

    chicken_mince_rice_bowl: ["Lean chicken mince ±150–180 g raw per portion", "Cooked rice ±½ cup", "Carrots/spinach ±2 cups", "Tomato paste/sauce 2–3 tbsp"],
    turkey_bowl: ["Turkey mince ±150–180 g raw per portion", "Rice or potato ±½ cup cooked", "Baby marrow/carrots/spinach ±2 cups", "Mild seasoning"],
    beef_chilli_sweet_potato: ["Lean beef mince ±150 g raw per portion", "Sweet potato ±150 g cooked", "Beans ±⅓ cup", "Tomato and vegetables ±1–2 cups"],
    chicken_curry_rice: ["Chicken breast ±150–180 g raw per portion", "Cooked rice ±½ cup", "Vegetables ±2 cups", "Light curry sauce ±¼ cup"],
    chicken_soup_bowl: ["Cooked shredded chicken ±130–160 g", "Broth ±1½–2 cups", "Soft vegetables ±1–2 cups", "Small potato/pasta portion ±½ cup"],
    hake_sweet_potato_plate: ["Hake/white fish ±170 g raw", "Sweet potato ±150 g cooked", "Green vegetables ±2 cups", "Lemon/plain seasoning"],
    prawn_stirfry_rice: ["Prawns ±170 g raw", "Cooked rice ±½ cup", "Stir-fry vegetables ±2 cups", "Light sauce 1–2 tbsp"],
    tuna_potato_salad: ["Tuna 1 tin or ±120 g drained", "Baby potatoes ±150 g cooked", "Yoghurt dressing 2–3 tbsp", "Cucumber/salad vegetables ±2 cups"],
    pork_stirfry: ["Lean pork strips ±150–180 g raw", "Cooked rice ±½ cup", "Broccoli/carrots/baby marrow ±2 cups", "Light sauce 1–2 tbsp"],
    lentil_chicken_stew: ["Chicken breast ±130–160 g raw", "Lentils ±½ cup cooked", "Carrots/spinach/tomato ±2 cups", "Broth or tomato base as needed"],

    cottage_cheese_berries: ["Cottage cheese ±150 g", "Berries or sliced fruit ±80 g"],
    boiled_eggs: ["Eggs 2", "Cucumber or tomato 1 small serving"],
    yoghurt: ["Low-fat yoghurt ±170–200 g", "Cinnamon optional"],
    tuna_crackers: ["Tuna ±½ tin", "Plain crackers 2–4", "Cucumber 1 small serving"],
    protein_shake: ["Protein powder 1 scoop", "Water or milk ±250 ml"]
  };

  const PREP_STEPS = {
    yoghurt_berry_bowl: ["Spoon yoghurt into a bowl.", "Add berries and chia.", "Top with nuts just before eating."],
    egg_spinach_toast: ["Toast bread.", "Scramble or boil the eggs.", "Wilt spinach in the same pan and plate together."],
    protein_oats: ["Cook oats with milk until soft.", "Let it cool slightly, then stir in yoghurt or protein powder.", "Top with berries."],
    cottage_cheese_fruit: ["Add cottage cheese to a bowl.", "Top with fruit, seeds and cinnamon.", "Eat cold."],
    boiled_eggs_fruit: ["Boil eggs for 8–10 minutes.", "Serve with fruit.", "Add yoghurt if you need more protein."],
    smooth_yoghurt_bowl: ["Spoon yoghurt into a bowl.", "Slice banana over it.", "Add oats and cinnamon."],

    chicken_mince_rice_bowl: ["Cook rice or use pre-cooked rice.", "Brown mince in a pan with mild seasoning.", "Add carrots, spinach and tomato paste; cook until soft.", "Serve one protein portion with rice and vegetables."],
    turkey_bowl: ["Cook rice or potato.", "Brown turkey mince with mild seasoning.", "Add vegetables and cook until soft.", "Portion into bowl/container."],
    beef_chilli_sweet_potato: ["Roast or microwave sweet potato.", "Brown mince with tomato and mild spices.", "Add beans and simmer until thick.", "Serve with sweet potato."],
    chicken_curry_rice: ["Cook rice.", "Cook chicken pieces until done.", "Add vegetables and mild curry sauce.", "Serve one portion with rice."],
    chicken_soup_bowl: ["Cook or shred chicken.", "Simmer broth with soft vegetables.", "Add chicken and potato/pasta.", "Keep texture soft and easy to eat."],
    hake_sweet_potato_plate: ["Bake or pan-cook hake with lemon/plain seasoning.", "Cook sweet potato until soft.", "Steam or pan-cook green vegetables.", "Plate as one simple meal."],
    prawn_stirfry_rice: ["Cook rice.", "Stir-fry vegetables until just soft.", "Add prawns and cook until done.", "Add light sauce and serve with rice."],
    tuna_potato_salad: ["Cook baby potatoes and cool slightly.", "Mix yoghurt dressing.", "Combine tuna, potatoes and salad vegetables.", "Keep dressing light."],
    pork_stirfry: ["Cook rice.", "Stir-fry pork strips until cooked through.", "Add vegetables and light sauce.", "Serve with rice."],
    lentil_chicken_stew: ["Cook chicken pieces with tomato/broth.", "Add lentils and vegetables.", "Simmer until soft and thick.", "Portion into bowls or containers."],

    cottage_cheese_berries: ["Spoon cottage cheese into a bowl.", "Top with berries or sliced fruit."],
    boiled_eggs: ["Boil eggs ahead or fresh.", "Serve with cucumber or tomato."],
    yoghurt: ["Spoon yoghurt into a bowl.", "Add cinnamon if wanted."],
    tuna_crackers: ["Drain tuna.", "Serve with crackers and cucumber."],
    protein_shake: ["Add powder and liquid to shaker.", "Shake well." ]
  };

  function recipe(slot, id, title, detail, nutrition, ingredients, prepNote, meta) {
    return {
      slot,
      id,
      title,
      detail,
      nutrition: Object.assign({}, nutrition),
      ingredients: ingredients.slice(),
      prepNote,
      meta: Object.assign({}, meta || {})
    };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function iso(date) {
    return date.toISOString().slice(0, 10);
  }

  function weekStartDate() {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + diff);
    return d;
  }

  function cleanNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  }

  function normalizeRegion(value) {
    const raw = String(value || "SA").trim().toUpperCase();
    if (raw === "ZA") return "SA";
    if (["SA", "US", "UK", "AU", "CA"].includes(raw)) return raw;
    return "GLOBAL";
  }

  function normalizeProfile(profile) {
    profile = profile || {};
    const targets = profile.targets || profile.mealTargets || profile.nutritionTargets || {};
    return {
      region: normalizeRegion(profile.region || profile.country || profile.selectedCountry),
      units: profile.units || "metric",
      snacksEnabled: profile.snacksEnabled !== false && profile.snackEnabled !== false,
      seafoodAllowed: profile.seafoodAllowed !== false,
      dairyAllowed: profile.dairyAllowed !== false,
      eggsAllowed: profile.eggsAllowed !== false,
      vegetarian: profile.dietType === "vegetarian" || profile.vegetarian === true,
      targets: {
        kcal: cleanNumber(targets.kcal || targets.calories || targets.calorieTarget || targets.calorieFloor, DEFAULT_TARGETS.kcal),
        protein: cleanNumber(targets.protein || targets.proteinTarget || targets.proteinMin, DEFAULT_TARGETS.protein),
        carbs: cleanNumber(targets.carbs || targets.carbTarget, DEFAULT_TARGETS.carbs),
        fat: cleanNumber(targets.fat || targets.fatTarget, DEFAULT_TARGETS.fat),
        fibre: cleanNumber(targets.fibre || targets.fiber || targets.fibreMin, DEFAULT_TARGETS.fibre)
      },
      raw: profile
    };
  }

  function normalizeSupport(value) {
    if (!value) return null;
    const raw = String(value).trim().toLowerCase().replace(/\s+/g, "_");
    if (["nausea", "bloating", "constipation", "low_appetite", "fatigue", "exhaustion"].includes(raw)) return raw;
    if (raw === "tired" || raw === "low_energy") return "fatigue";
    return null;
  }

  function normalizePrepModel(prepModel) {
    prepModel = prepModel || {};
    const scenario = ["cook_fresh", "dinner_leftovers", "weekly_bulk_prep"].includes(prepModel.scenario)
      ? prepModel.scenario
      : "dinner_leftovers";

    const bulk = Object.assign({}, prepModel.bulkPrep || {});
    const mealsToPrep = Array.isArray(bulk.mealsToPrep) && bulk.mealsToPrep.length ? bulk.mealsToPrep : ["lunch", "dinner"];

    return {
      scenario,
      bulkPrep: {
        prepDay: bulk.prepDay || "Sunday",
        prepDaysCount: Math.max(1, Math.min(7, cleanNumber(bulk.prepDaysCount, 5))),
        mealsToPrep,
        batchRecipeCount: Math.max(1, Math.min(4, cleanNumber(bulk.batchRecipeCount, 3))),
        includeSnacks: bulk.includeSnacks === true,
        fridgeDays: Math.max(1, Math.min(5, cleanNumber(bulk.fridgeDays, 3))),
        freezerFriendly: bulk.freezerFriendly !== false,
        cycleLength: 3
      }
    };
  }

  function pick(pool, index) {
    if (!Array.isArray(pool) || !pool.length) return null;
    const safe = Math.abs(Math.round(Number(index) || 0));
    return clone(pool[safe % pool.length]);
  }

  function planOffset(seed) {
    const n = Number(seed);
    return Number.isFinite(n) ? Math.abs(Math.round(n)) : 0;
  }

  function mainPoolForProfile(profile, bulkOnly) {
    let pool = RECIPES.mains.filter((r) => profile.seafoodAllowed || !["fish", "seafood", "tuna"].includes(r.meta.protein));
    if (bulkOnly) pool = pool.filter((r) => r.meta.batch);
    return pool.length ? pool : RECIPES.mains.slice(0, 4);
  }

  function supportText(mode) {
    const map = {
      nausea: "Keep this gentle today: smaller portions, plain flavours and softer textures where possible.",
      bloating: "Keep this lighter today: cooked vegetables, slower eating and simple seasoning.",
      constipation: "Keep fluids steady and choose the higher-fibre parts of the plan if tolerated.",
      low_appetite: "Small portions are fine today. Prioritise the protein first and use the snack as a top-up only if needed.",
      fatigue: "Keep prep low today. Use the easiest cooking method or leftovers where possible.",
      exhaustion: "Keep prep low today. Use the easiest cooking method or leftovers where possible."
    };
    return map[mode] || "";
  }

  function withSlot(recipeItem, slot, extras) {
    const item = clone(recipeItem);
    item.slot = slot;
    item.slotLabel = SLOT_LABELS[slot] || "Meal";
    item.nutrition = Object.assign({}, item.nutrition || {});
    Object.assign(item, extras || {});
    return enrichMealDetail(item);
  }

  function enrichMealDetail(item) {
    const id = baseRecipeId(item.id);
    item.portionGuide = Array.isArray(item.portionGuide) && item.portionGuide.length
      ? item.portionGuide.slice()
      : (PORTION_GUIDES[id] || genericPortionGuide(item)).slice();
    item.prepSteps = Array.isArray(item.prepSteps) && item.prepSteps.length
      ? item.prepSteps.slice()
      : (PREP_STEPS[id] || genericPrepSteps(item)).slice();
    item.storageNote = item.storageNote || storageNoteForMeal(item);
    item.servingNote = item.servingNote || servingNoteForMeal(item);
    item.portionCount = Number(item.portions || item.portionCount || 1);
    if (item.portionCount > 1 && !item.batchInstruction) {
      item.batchInstruction = "Make " + item.portionCount + " portions. Eat one and pack the rest into labelled containers.";
    }
    return item;
  }

  function baseRecipeId(id) {
    return String(id || "")
      .replace(/_leftover_lunch_\d+$/, "")
      .replace(/_batch_\d+$/, "");
  }

  function genericPortionGuide(item) {
    if (item.slot === "snack") return ["One small snack portion", "Use as optional top-up only if needed"];
    if (item.slot === "breakfast") return ["One breakfast serving", "Protein source first", "Fruit or carb portion kept modest"];
    return ["Protein ±150–180 g raw or one palm-sized cooked portion", "Carb ±½ cup cooked or one small potato", "Vegetables ±2 cups", "Sauce/dressing kept light"];
  }

  function genericPrepSteps(item) {
    if (item.slot === "snack") return ["Assemble snack.", "Keep it optional if you are not hungry."];
    return ["Cook the protein.", "Add vegetables until soft.", "Add the carb portion.", "Portion and serve or pack." ];
  }

  function storageNoteForMeal(item) {
    if (item.leftoverOf) return "Keep covered in the fridge and use for the next day’s lunch.";
    if (item.batchId || (item.meta && item.meta.batch)) return "Fridge for the next few days; freeze later containers if prepping beyond your fridge window.";
    if (item.slot === "snack") return "Pack only if it helps; snacks are optional.";
    return "Best eaten fresh; leftovers can be kept covered if needed.";
  }

  function servingNoteForMeal(item) {
    if (item.leftoverOf) return "This is yesterday’s dinner portion used as today’s lunch.";
    if (item.batchId) return "This meal is part of the weekly prep cycle.";
    if (item.slot === "snack") return "Optional: use only if you need a protein top-up.";
    return "Portions are estimates; adjust slightly for your appetite and tolerance.";
  }

  function buildFreshDay(index, profile, supportMode, seed) {
    const offset = planOffset(seed);
    const breakfast = withSlot(pick(RECIPES.breakfast, index + offset), "breakfast");
    const lunch = withSlot(pick(mainPoolForProfile(profile, false), index + 1 + offset), "lunch", {
      prepNote: "Cook fresh or assemble when ready."
    });
    const dinner = withSlot(pick(mainPoolForProfile(profile, false), index + 4 + offset), "dinner", {
      prepNote: "Cook one dinner portion fresh."
    });
    const snack = profile.snacksEnabled ? withSlot(pick(RECIPES.snacks, index + offset), "snack") : null;
    const meals = [breakfast, lunch, dinner];
    if (snack) meals.splice(2, 0, snack);
    return applySupportToMeals(meals, supportMode);
  }

  function buildLeftoverWeek(profile, supportMode, seed) {
    const offset = planOffset(seed);
    const start = weekStartDate();
    const mains = mainPoolForProfile(profile, false);
    const days = [];

    for (let i = 0; i < 7; i++) {
      const meals = [];
      meals.push(withSlot(pick(RECIPES.breakfast, i + offset), "breakfast"));

      if (i === 0) {
        meals.push(withSlot(pick(mains, i + 1 + offset), "lunch", { prepNote: "Fresh lunch today. Leftovers start from tomorrow." }));
      } else {
        const previousDinner = days[i - 1].meals.find((meal) => meal.slot === "dinner");
        meals.push(withSlot(previousDinner, "lunch", {
          id: previousDinner.id + "_leftover_lunch_" + i,
          title: "Leftover " + previousDinner.title,
          detail: previousDinner.detail,
          prepNote: "Reheat yesterday’s dinner portion for lunch. Keep the same portion size as dinner unless appetite is low.",
          leftoverOf: { dayIndex: i - 1, slot: "dinner", title: previousDinner.title },
          containerLabel: DAY_NAMES[i] + " lunch"
        }));
      }

      if (profile.snacksEnabled) meals.push(withSlot(pick(RECIPES.snacks, i + offset), "snack"));

      meals.push(withSlot(pick(mains, i + 3 + offset), "dinner", {
        prepNote: "Cook 2 portions: eat one tonight and pack one for tomorrow’s lunch. Pack the second portion before serving so lunch is done.",
        portions: 2,
        containerLabel: i < 6 ? DAY_NAMES[i + 1] + " lunch" : "extra lunch"
      }));

      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push(makeDay(i, date, applySupportToMeals(meals, supportMode)));
    }

    return days;
  }

  function buildBulkPrepWeek(profile, prepModel, supportMode, seed) {
    const offset = planOffset(seed);
    const start = weekStartDate();
    const bulk = prepModel.bulkPrep;
    const cycleLength = 3;
    const prepSlots = bulk.mealsToPrep.filter((slot) => ["breakfast", "lunch", "dinner"].includes(slot));
    const mainPrepSlots = prepSlots.filter((slot) => slot === "lunch" || slot === "dinner");
    const batchRecipes = Array.from({ length: bulk.batchRecipeCount }).map((_, index) => Object.assign(pick(mainPoolForProfile(profile, true), index + offset), {
      batchId: "batch_" + (index + 1),
      batchLabel: "Batch " + (index + 1),
      portions: 0
    }));

    const days = [];
    const cyclePlan = [];

    for (let i = 0; i < 7; i++) {
      const meals = [];
      const inPrepRange = i < bulk.prepDaysCount;
      const cycleIndex = i % cycleLength;
      const cycleLabel = "Cycle day " + (cycleIndex + 1);
      const cycleEntry = cyclePlan[cycleIndex] || { cycleDay: cycleIndex + 1, meals: [] };
      cyclePlan[cycleIndex] = cycleEntry;

      const breakfastRecipe = pick(RECIPES.breakfast, cycleIndex + offset);
      meals.push(withSlot(breakfastRecipe, "breakfast", {
        cycleDay: cycleIndex + 1,
        cycleLabel,
        prepNote: prepSlots.includes("breakfast") && inPrepRange
          ? "Prep this breakfast as part of the 3-day cycle. Keep toppings or crunchy items separate."
          : "Make fresh or assemble quickly."
      }));

      ["lunch", "dinner"].forEach((slot, slotIndex) => {
        if (inPrepRange && mainPrepSlots.includes(slot)) {
          const cycleSlotIndex = (cycleIndex * Math.max(1, mainPrepSlots.length)) + slotIndex;
          const batch = batchRecipes[cycleSlotIndex % batchRecipes.length];
          batch.portions += 1;
          meals.push(withSlot(batch, slot, {
            batchId: batch.batchId,
            batchLabel: batch.batchLabel,
            title: batch.title,
            cycleDay: cycleIndex + 1,
            cycleLabel,
            prepNote: "Batch-prepped on " + bulk.prepDay + ". " + cycleLabel + " of 3. Reheat gently and add fresh salad/veg if needed. Keep sauces separate where possible.",
            containerLabel: DAY_NAMES[i] + " " + slot + " • " + cycleLabel
          }));
          if (!cycleEntry.meals.some((item) => item.slot === slot && item.title === batch.title)) {
            cycleEntry.meals.push({ slot, title: batch.title, batchLabel: batch.batchLabel });
          }
        } else {
          meals.push(withSlot(pick(mainPoolForProfile(profile, false), cycleIndex + slotIndex + 2 + offset), slot, {
            cycleDay: cycleIndex + 1,
            cycleLabel,
            prepNote: inPrepRange ? "Cook this one fresh or use a simple backup meal." : "Flexible fresh meal after your prep window."
          }));
        }
      });

      if (profile.snacksEnabled) {
        meals.splice(2, 0, withSlot(pick(RECIPES.snacks, cycleIndex + offset), "snack", {
          cycleDay: cycleIndex + 1,
          cycleLabel,
          prepNote: bulk.includeSnacks && inPrepRange ? "Pack this optional snack in a small container if useful." : "Optional top-up."
        }));
      }

      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const day = makeDay(i, date, applySupportToMeals(meals, supportMode));
      day.cycleDay = cycleIndex + 1;
      day.cycleLabel = cycleLabel;
      day.inPrepRange = inPrepRange;
      days.push(day);
    }

    batchRecipes.forEach((batch) => { if (!batch.portions) batch.portions = 1; });
    days.batchRecipes = batchRecipes;
    days.cycleLength = cycleLength;
    days.cyclePlan = cyclePlan.filter(Boolean);
    return days;
  }

  function applySupportToMeals(meals, supportMode) {
    supportMode = normalizeSupport(supportMode);
    if (!supportMode) return meals;
    const note = supportText(supportMode);
    return meals.map((meal) => Object.assign(meal, {
      supportMode,
      supportAdjusted: true,
      supportNote: note
    }));
  }

  function totalNutrition(meals) {
    const total = meals.reduce((acc, meal) => {
      const n = meal.nutrition || {};
      acc.kcal += Number(n.kcal || 0);
      acc.protein += Number(n.protein || 0);
      acc.carbs += Number(n.carbs || 0);
      acc.fat += Number(n.fat || 0);
      acc.fibre += Number(n.fibre || n.fiber || 0);
      return acc;
    }, { kcal: 100, protein: 0, carbs: 0, fat: 0, fibre: 0 });

    Object.keys(total).forEach((key) => { total[key] = Math.round(total[key]); });
    return total;
  }

  function makeDay(index, date, meals) {
    return {
      index,
      day: index + 1,
      dayName: DAY_NAMES[index],
      date: iso(date),
      meals,
      totals: totalNutrition(meals)
    };
  }

  function buildCookFreshWeek(profile, supportMode, seed) {
    const start = weekStartDate();
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return makeDay(index, date, buildFreshDay(index, profile, supportMode, seed));
    });
  }

  function buildContainerPlan(prepModel, profile) {
    const scenario = prepModel.scenario;
    if (scenario === "cook_fresh") {
      return {
        total: 0,
        mealContainers: 0,
        snackContainers: 0,
        spareContainers: 0,
        summary: "No planned containers needed. Keep 1–2 spare containers if you like leftovers.",
        advice: ["Keep one container size handy for leftovers.", "Cook fresh meals simple: protein + veg + small carb."],
        labels: []
      };
    }

    if (scenario === "dinner_leftovers") {
      const labels = DAY_NAMES.slice(1).map((day) => day + " lunch");
      return {
        total: labels.length,
        mealContainers: labels.length,
        snackContainers: 0,
        spareContainers: 1,
        summary: labels.length + " lunch containers + 1 spare suggested.",
        advice: ["Use one lunch-size container for each leftover lunch.", "Label the container before putting it in the fridge.", "Keep sauces or dressing separate where possible."],
        labels
      };
    }

    const bulk = prepModel.bulkPrep;
    const mealCount = bulk.prepDaysCount * bulk.mealsToPrep.length;
    const snackCount = profile.snacksEnabled && bulk.includeSnacks ? bulk.prepDaysCount : 0;
    const labels = [];
    for (let i = 0; i < bulk.prepDaysCount; i++) {
      bulk.mealsToPrep.forEach((slot) => labels.push(DAY_NAMES[i] + " " + slot));
      if (snackCount) labels.push(DAY_NAMES[i] + " snack");
    }
    return {
      total: mealCount + snackCount,
      mealContainers: mealCount,
      snackContainers: snackCount,
      spareContainers: 2,
      summary: (mealCount + snackCount) + " containers + 2 spare suggested.",
      advice: ["Bulk prep repeats a simple 3-day meal cycle.", "Use one main microwave-safe container size so packing stays easy.", "Label by day and meal, for example Monday lunch.", "Keep about " + bulk.fridgeDays + " days in the fridge and freeze later meals if needed.", "Keep sauces, crunchy toppings and dressings separate."],
      labels
    };
  }

  function buildPrepPlan(days, prepModel, profile) {
    const scenario = prepModel.scenario;
    const containerPlan = buildContainerPlan(prepModel, profile);
    const labels = {
      cook_fresh: "Cook as you go",
      dinner_leftovers: "Dinner becomes tomorrow’s lunch",
      weekly_bulk_prep: "Weekly bulk meal prep"
    };

    const plan = {
      scenario,
      label: labels[scenario],
      containerPlan,
      summary: "",
      steps: [],
      batchRecipes: [],
      leftoverLinks: [],
      cyclePlan: [],
      containerAdvice: []
    };

    if (scenario === "cook_fresh") {
      plan.summary = "Each meal is made fresh when you eat it.";
      plan.steps = ["Keep proteins and vegetables ready.", "Cook or assemble each meal fresh.", "Use the shopping list for the full week."];
      plan.containerAdvice = containerPlan.advice || [];
    }

    if (scenario === "dinner_leftovers") {
      plan.summary = "Dinner is cooked as 2 portions. The second portion becomes tomorrow’s lunch.";
      plan.steps = ["Cook 2 dinner portions.", "Eat one portion for dinner.", "Pack the second portion for the next day’s lunch."];
      plan.containerAdvice = containerPlan.advice || [];
      plan.leftoverLinks = days.slice(1).map((day, index) => {
        const lunch = day.meals.find((meal) => meal.slot === "lunch");
        return {
          from: DAY_NAMES[index] + " dinner",
          to: day.dayName + " lunch",
          title: lunch && lunch.leftoverOf ? lunch.leftoverOf.title : "Dinner leftovers"
        };
      });
    }

    if (scenario === "weekly_bulk_prep") {
      const bulk = prepModel.bulkPrep;
      const batchRecipes = days.batchRecipes || [];
      plan.summary = "Prep " + bulk.mealsToPrep.join(" + ") + " for " + bulk.prepDaysCount + " days on " + bulk.prepDay + " using a 3-day repeat cycle.";
      plan.cyclePlan = days.cyclePlan || [];
      plan.containerAdvice = containerPlan.advice || [];
      plan.batchRecipes = batchRecipes.map((item) => {
        const id = baseRecipeId(item.id);
        return {
          batchId: item.batchId,
          title: item.title,
          portions: item.portions,
          detail: item.detail,
          freezerFriendly: item.meta && item.meta.freezer !== false,
          portionGuide: item.portionGuide || PORTION_GUIDES[id] || [],
          prepSteps: item.prepSteps || PREP_STEPS[id] || []
        };
      });
      plan.steps = [
        "Cook " + batchRecipes.length + " batch recipe" + (batchRecipes.length === 1 ? "" : "s") + " on " + bulk.prepDay + ".",
        "Repeat meals in a simple 3-day cycle so prep stays realistic.",
        "Portion into labelled containers.",
        "Keep about " + bulk.fridgeDays + " days in the fridge and freeze the rest if needed."
      ];
    }

    return plan;
  }

  function buildShoppingList(days, prepPlan, profile) {
    const counts = new Map();
    function add(name, amount) {
      if (!name) return;
      const key = String(name).trim();
      counts.set(key, (counts.get(key) || 0) + (amount || 1));
    }

    days.forEach((day) => {
      day.meals.forEach((meal) => {
        (meal.ingredients || []).forEach((item) => add(item, meal.portions && meal.slot === "dinner" ? meal.portions : 1));
      });
    });

    const items = Array.from(counts.entries()).map(([name, count]) => ({
      name,
      qty7: roughQuantity(name, count),
      qty30: "≈ 4.3 × weekly amount"
    }));

    if (prepPlan && prepPlan.containerPlan && prepPlan.containerPlan.total > 0) {
      items.unshift({
        name: "Meal prep containers",
        qty7: prepPlan.containerPlan.summary,
        qty30: "Reuse containers weekly"
      });
    }

    if (profile.snacksEnabled) {
      items.push({ name: "Optional snack extras", qty7: "7 snack portions if wanted", qty30: "≈ 30 snack portions" });
    }

    return items;
  }

  function roughQuantity(name, count) {
    const lower = name.toLowerCase();
    if (lower.includes("egg")) return Math.max(6, Math.round(count * 2)) + " eggs";
    if (lower.includes("chicken") || lower.includes("mince") || lower.includes("beef") || lower.includes("turkey") || lower.includes("pork")) return Math.max(500, Math.round(count * 180)) + " g";
    if (lower.includes("fish") || lower.includes("hake") || lower.includes("prawn") || lower.includes("tuna")) return lower.includes("tuna") ? Math.max(2, Math.round(count)) + " tins" : Math.max(400, Math.round(count * 170)) + " g";
    if (lower.includes("yoghurt") || lower.includes("cottage")) return Math.max(500, Math.round(count * 180)) + " g";
    if (lower.includes("rice") || lower.includes("oats") || lower.includes("pasta") || lower.includes("potato")) return Math.max(4, Math.round(count)) + " portions";
    if (lower.includes("berries") || lower.includes("fruit") || lower.includes("banana")) return Math.max(4, Math.round(count)) + " portions";
    if (lower.includes("spinach") || lower.includes("carrot") || lower.includes("broccoli") || lower.includes("vegetable") || lower.includes("salad") || lower.includes("cucumber") || lower.includes("tomato") || lower.includes("baby marrow") || lower.includes("green beans")) return Math.max(1, Math.round(count * 0.35)) + " kg mixed";
    return Math.max(1, Math.round(count)) + " item" + (Math.round(count) === 1 ? "" : "s");
  }

  function buildWeek(args) {
    args = args || {};
    const profile = normalizeProfile(args.profile || args.initialProfile || {});
    const prepModel = normalizePrepModel(args.prepModel || args.prep || {});
    const supportMode = normalizeSupport((args.adjustments || {}).supportMode || args.supportMode);
    const seed = planOffset(args.planSeed || args.seed || 0);

    let days;
    if (prepModel.scenario === "cook_fresh") days = buildCookFreshWeek(profile, supportMode, seed);
    else if (prepModel.scenario === "weekly_bulk_prep") days = buildBulkPrepWeek(profile, prepModel, supportMode, seed);
    else days = buildLeftoverWeek(profile, supportMode, seed);

    const prepPlan = buildPrepPlan(days, prepModel, profile);
    const shoppingList = buildShoppingList(days, prepPlan, profile);

    return {
      version: ENGINE_VERSION,
      days,
      prepModel,
      planSeed: seed,
      prepPlan,
      shoppingList,
      targets: profile.targets
    };
  }


  function deriveBatchRecipesFromDays(days) {
    if (!Array.isArray(days)) return [];
    if (Array.isArray(days.batchRecipes) && days.batchRecipes.length) return days.batchRecipes;
    const map = new Map();
    days.forEach((day) => {
      (day.meals || []).forEach((meal) => {
        if (!meal || !meal.batchId) return;
        const key = meal.batchId || meal.id || meal.title;
        if (!map.has(key)) {
          map.set(key, Object.assign({}, meal, {
            id: meal.id || meal.recipeId || key,
            batchId: meal.batchId,
            title: meal.title,
            detail: meal.detail || meal.subtitle || "",
            portions: 0,
            meta: Object.assign({}, meal.meta || {}, { freezer: meal.freezerFriendly !== false })
          }));
        }
        const item = map.get(key);
        item.portions = Number(item.portions || 0) + 1;
      });
    });
    return Array.from(map.values());
  }

  function cloneDaysWithBatchMeta(days) {
    const copy = Array.isArray(days) ? days.slice() : [];
    copy.batchRecipes = deriveBatchRecipesFromDays(days);
    copy.cycleLength = days && days.cycleLength ? days.cycleLength : 3;
    copy.cyclePlan = days && Array.isArray(days.cyclePlan) ? days.cyclePlan : [];
    return copy;
  }

  function refreshPrepPlanFromExistingPlan(args) {
    args = args || {};
    const originalPlan = args.plan || {};
    const profile = normalizeProfile(args.profile || originalPlan.profile || {});
    const prepModel = normalizePrepModel(args.prepModel || originalPlan.prepModel || {});
    const days = cloneDaysWithBatchMeta(originalPlan.days || []);
    const prepPlan = buildPrepPlan(days, prepModel, profile);
    prepPlan.refreshedAt = new Date().toISOString();
    prepPlan.refreshSeed = String(args.refreshSeed || "");
    const shoppingList = buildShoppingList(days, prepPlan, profile);
    return Object.assign({}, originalPlan, {
      version: ENGINE_VERSION,
      days,
      prepModel,
      prepPlan,
      shoppingList,
      targets: (profile && profile.targets) || originalPlan.targets || {},
      prepRefreshedAt: prepPlan.refreshedAt
    });
  }

  function generateWeekPlan(args) {
    return buildWeek(args);
  }

  function regenerateDay(args) {
    args = args || {};
    const plan = buildWeek(args);
    const index = Math.max(0, Math.min(6, Number(args.dayIndex || 0)));
    return plan.days[index];
  }

  function swapMeal(args) {
    const day = regenerateDay(args);
    const slot = args && args.slot ? String(args.slot) : "";
    return (day.meals || []).find((meal) => meal.slot === slot) || null;
  }

  const api = {
    version: ENGINE_VERSION,
    buildWeek,
    generateWeekPlan,
    refreshPrepPlanFromExistingPlan,
    regenerateDay,
    swapMeal,
    normalizePrepModel
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") {
    window.HeartyMealsEngineV77 = api;
    window.HeartyMealsEngineV76 = api;
    window.HeartyMealsEngineV74 = api;
    window.HeartyMealsEngineV73 = api;
    window.HeartyMealsEngineV72 = api;
    window.HeartyMealsEngineV71 = api;
    window.heartyMealsEngine = api;
  }
})();
