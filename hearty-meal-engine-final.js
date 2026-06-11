/*!
 * Hearty Final Meal Engine
 * Logic-only meal generator for the Hearty free 7-day meal plan funnel.
 * Version: 3.0.0-final-gated
 *
 * This file does NOT contain page UI. It enforces the final gate, then generates plans.
 */

(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.HeartyMealEngine = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const VERSION = "3.0.0-final-gated";

  const REGION = {
    SA: {
      label: "South Africa",
      yoghurt: "yoghurt",
      vegName: "baby marrow",
      fish: "hake",
      stock: "stock",
      mince: "lean beef mince",
      fruit: "naartjie",
      dried: "biltong",
      veg: ["spinach", "tomato", "onion", "carrot", "baby marrow", "green beans", "mushrooms", "peppers", "cabbage"]
    },
    US: {
      label: "United States",
      yoghurt: "yogurt",
      vegName: "zucchini",
      fish: "white fish",
      stock: "broth",
      mince: "lean ground beef",
      fruit: "mandarin",
      dried: "beef jerky",
      veg: ["spinach", "tomato", "onion", "carrot", "zucchini", "green beans", "mushrooms", "peppers", "broccoli"]
    },
    UK: {
      label: "United Kingdom",
      yoghurt: "yoghurt",
      vegName: "courgette",
      fish: "cod",
      stock: "stock",
      mince: "lean beef mince",
      fruit: "clementine",
      dried: "lean cooked meat strips",
      veg: ["spinach", "tomato", "onion", "carrot", "courgette", "green beans", "mushrooms", "peppers", "cabbage"]
    },
    AU: {
      label: "Australia",
      yoghurt: "yoghurt",
      vegName: "zucchini",
      fish: "white fish",
      stock: "stock",
      mince: "lean beef mince",
      fruit: "mandarin",
      dried: "lean beef jerky",
      veg: ["spinach", "tomato", "onion", "carrot", "zucchini", "green beans", "mushrooms", "peppers", "cabbage"]
    },
    CA: {
      label: "Canada",
      yoghurt: "yogurt",
      vegName: "zucchini",
      fish: "white fish",
      stock: "broth",
      mince: "lean ground beef",
      fruit: "clementine",
      dried: "beef jerky",
      veg: ["spinach", "tomato", "onion", "carrot", "zucchini", "green beans", "mushrooms", "peppers", "broccoli"]
    }
  };

  const STARCH_LABELS = {
    rice: "rice",
    brown_rice: "brown rice",
    pasta: "pasta",
    couscous: "couscous",
    sweet_potato: "sweet potato",
    potato: "potato",
    wrap: "small wrap"
  };

  const MAIN_MEAL_PROTEINS = new Set([
    "chicken", "beef", "pork", "fish", "eggs", "tofu", "lentils", "beans", "chickpeas"
  ]);

  const BREAKFAST_ITEM_TO_PROTEIN = {
    eggs: "eggs",
    yoghurt: "dairy",
    yogurt: "dairy",
    greek_yoghurt: "dairy",
    greek_yogurt: "dairy",
    cottage_cheese: "dairy",
    oats: "dairy",
    oats_with_yoghurt: "dairy",
    oats_with_yogurt: "dairy",
    protein_shake: "protein_powder",
    tofu_scramble: "tofu",
    hummus_plate: "legumes"
  };

  const SNACK_ITEM_TO_PROTEIN = {
    yoghurt: "dairy",
    yogurt: "dairy",
    cottage_cheese: "dairy",
    boiled_eggs: "eggs",
    biltong: "beef",
    jerky: "beef",
    dried_meat: "beef",
    chicken_strips: "chicken",
    tuna: "fish",
    fish: "fish",
    hummus: "legumes",
    roasted_chickpeas: "legumes",
    tofu_bites: "tofu",
    protein_shake: "protein_powder"
  };

  function unique(items) {
    return Array.from(new Set((items || []).filter(Boolean)));
  }

  function normalizeRegion(region) {
    return REGION[region] ? region : "SA";
  }

  function normalizeInput(raw) {
    const input = raw || {};
    const region = normalizeRegion(input.region || "SA");
    const diet = input.diet || input.dietType || "omnivore";

    return {
      region,
      diet,
      proteins: unique(input.proteins || input.selectedProteins || []),
      vegetables: unique(input.vegetables || REGION[region].veg.slice(0, 6)),
      breakfastItems: unique(input.breakfastItems || []),
      snackProteins: unique(input.snackProteins || input.snacks || []),
      starches: unique(input.starches || input.selectedStarches || []),
      exclusions: unique(input.exclusions || []),
      lowerStarch: Boolean(input.lowerStarch || input.lowStarch),
      noBreakfast: Boolean(input.noBreakfast || input.breakfast === false)
    };
  }

  function allowedProteins(diet, proteins, exclusions) {
    const p = new Set(proteins || []);
    const e = new Set(exclusions || []);

    if (diet === "vegetarian") {
      ["chicken", "beef", "pork", "fish"].forEach(x => p.delete(x));
    }
    if (diet === "pescatarian") {
      ["chicken", "beef", "pork"].forEach(x => p.delete(x));
    }

    if (e.has("no_dairy")) p.delete("dairy");
    if (e.has("no_eggs")) p.delete("eggs");
    if (e.has("no_fish")) p.delete("fish");
    if (e.has("no_chicken")) p.delete("chicken");
    if (e.has("no_red_meat")) {
      p.delete("beef");
      p.delete("pork");
    }
    if (e.has("no_tofu")) p.delete("tofu");
    if (e.has("no_legumes")) {
      p.delete("lentils");
      p.delete("beans");
      p.delete("chickpeas");
    }

    return Array.from(p).sort();
  }

  function breakfastCategories(input, allowed) {
    const cats = [];
    const a = new Set(allowed);

    for (const item of unique(input.breakfastItems)) {
      const cat = BREAKFAST_ITEM_TO_PROTEIN[item];

      if (cat === "dairy" && a.has("dairy")) cats.push("dairy");
      else if (cat === "legumes" && (a.has("lentils") || a.has("beans") || a.has("chickpeas"))) cats.push("hummus");
      else if (cat && a.has(cat)) cats.push(cat);
    }

    return unique(cats).sort();
  }

  function snackCategories(input, allowed) {
    const cats = [];
    const a = new Set(allowed);

    for (const item of unique(input.snackProteins)) {
      const cat = SNACK_ITEM_TO_PROTEIN[item];

      if (cat === "dairy" && a.has("dairy")) cats.push("dairy");
      else if (cat === "legumes" && (a.has("lentils") || a.has("beans") || a.has("chickpeas"))) cats.push("legumes");
      else if (cat && a.has(cat)) cats.push(cat);
    }

    return unique(cats).sort();
  }

  function gateCheck(rawInput) {
    const input = normalizeInput(rawInput);
    const allowed = allowedProteins(input.diet, input.proteins, input.exclusions);
    const mainMealProteins = allowed.filter(p => MAIN_MEAL_PROTEINS.has(p)).sort();
    const bfCats = breakfastCategories(input, allowed);
    const snCats = snackCategories(input, allowed);

    const failures = [];
    const messages = [];

    if (allowed.length < 3) {
      failures.push("protein_minimum");
      messages.push("Please select at least 3 protein options so we can create a useful 7-day plan.");
    }

    if (mainMealProteins.length < 2) {
      failures.push("main_meal_protein_minimum");
      messages.push("Please select at least 2 main-meal protein options for enough lunch and dinner variety.");
    }

    if (input.vegetables.length < 5) {
      failures.push("vegetable_minimum");
      messages.push("Please select at least 5 vegetables so your plan has enough variety.");
    }

    if (!input.starches.length && !input.lowerStarch) {
      failures.push("starch_required");
      messages.push("Please choose at least 1 starch option, or select the lower-starch plan option.");
    }

    if (snCats.length < 2) {
      failures.push("snack_protein_minimum");
      messages.push("Please choose at least 2 protein snack options that match your selected foods.");
    }

    if (!input.noBreakfast && bfCats.length < 1) {
      failures.push("breakfast_protein_required");
      messages.push("Please select at least one breakfast option such as eggs, yoghurt/cottage cheese, protein shake, tofu scramble, or hummus plate — or choose “I don’t eat breakfast.”");
    }

    return {
      status: failures.length ? "BLOCKED" : "ALLOWED",
      allowed,
      mainMealProteins,
      breakfastCategories: bfCats,
      snackCategories: snCats,
      failures,
      messages,
      vegetableCount: input.vegetables.length,
      starchCount: input.starches.length,
      lowerStarch: input.lowerStarch
    };
  }

  function starchAmount(starch) {
    if (starch === "none") return "no added starch";
    if (starch === "sweet_potato") return "½ medium sweet potato";
    if (starch === "potato") return "½ cup cooked potato";
    if (starch === "wrap") return "1 small wrap";
    return "½ cup cooked " + (STARCH_LABELS[starch] || starch);
  }

  function chooseStarch(input, pref, dayIndex) {
    if (input.lowerStarch) return "none";
    const starches = input.starches.filter(x => STARCH_LABELS[x]);
    if (!starches.length) return "none";
    if (starches.includes(pref)) return pref;
    return starches[dayIndex % starches.length];
  }

  function pickVeg(input, start, count) {
    const veg = input.vegetables;
    const selected = [];
    for (let i = 0; i < count; i++) selected.push(veg[(start + i) % veg.length]);
    return selected.join(", ");
  }

  function dinnerTemplates(input, gate) {
    const r = REGION[input.region];
    const main = new Set(gate.mainMealProteins);
    const t = [];

    const add = (cat, name, protein, pref, detail, leftover) => {
      t.push({ cat, name, protein, pref, detail, leftover });
    };

    if (main.has("chicken")) {
      add("chicken", "Chicken curry with {starch}", "32–38g", "rice",
        (st, i) => st !== "none"
          ? `120–150g chicken cooked with onion, garlic, ginger, tomato, curry spices, ${pickVeg(input, i, 3)} and ${r.stock}. Serve with ${starchAmount(st)}.`
          : `120–150g chicken cooked with onion, garlic, ginger, tomato, curry spices and ${pickVeg(input, i, 5)}. No added starch.`,
        "Leftover chicken curry vegetable bowl");

      add("chicken", "Chicken stir-fry with low-calorie sauce and {starch}", "32–38g", "rice",
        (st, i) => st !== "none"
          ? `120–150g chicken strips stir-fried with ${pickVeg(input, i, 5)}. Sauce: garlic, lemon/vinegar, water and pepper. Serve with ${starchAmount(st)}.`
          : `120–150g chicken strips stir-fried with ${pickVeg(input, i, 5)} and garlic-lemon sauce. No added starch.`,
        "Leftover chicken stir-fry vegetable bowl");

      add("chicken", "Chicken tomato stew with {starch}", "32–38g", "rice",
        (st, i) => st !== "none"
          ? `120–150g chicken simmered with tomato, onion, garlic, ${pickVeg(input, i, 4)}, herbs and ${r.stock} until saucy. Serve with ${starchAmount(st)}.`
          : `120–150g chicken simmered with tomato, onion, garlic, ${pickVeg(input, i, 5)}, herbs and ${r.stock}. No added starch.`,
        "Leftover chicken tomato stew vegetable bowl");
    }

    if (main.has("beef")) {
      add("beef", `${titleCase(r.mince)} bolognese with {starch}`, "32–38g", "pasta",
        (st, i) => st !== "none"
          ? `120–150g ${r.mince} cooked with onion, garlic, chopped tomato, grated carrot, mushrooms and Italian herbs. Serve with ${starchAmount(st)} and ${pickVeg(input, i, 3)}.`
          : `120–150g ${r.mince} cooked with onion, garlic, tomato, carrot, mushrooms and herbs. Serve with ${pickVeg(input, i, 5)}. No added starch.`,
        "Leftover bolognese vegetable bowl");

      add("beef", "Lean beef stew with {starch}", "32–38g", "rice",
        (st, i) => st !== "none"
          ? `120–150g lean beef cooked with tomato, onion, ${pickVeg(input, i, 4)}, ${r.stock}, herbs and pepper. Serve with ${starchAmount(st)}.`
          : `120–150g lean beef cooked with tomato, onion, ${pickVeg(input, i, 5)}, ${r.stock}, herbs and pepper. No added starch.`,
        "Leftover beef stew vegetable bowl");
    }

    if (main.has("pork")) {
      add("pork", "Lean pork stir-fry with sweet-and-sour sauce and {starch}", "30–36g", "rice",
        (st, i) => st !== "none"
          ? `120–150g lean pork strips stir-fried with ${pickVeg(input, i, 5)}. Sauce: garlic, ginger, vinegar/lemon, tomato paste, water and a small amount of sweetener. Serve with ${starchAmount(st)}.`
          : `120–150g lean pork strips stir-fried with ${pickVeg(input, i, 5)} and low-calorie sweet-and-sour sauce. No added starch.`,
        "Leftover pork stir-fry vegetable bowl");
    }

    if (main.has("fish")) {
      add("fish", `${titleCase(r.fish)} curry with {starch}`, "30–36g", "rice",
        (st, i) => st !== "none"
          ? `150g ${r.fish} simmered with onion, garlic, ginger, tomato, curry spices and ${pickVeg(input, i, 4)}. Serve with ${starchAmount(st)}.`
          : `150g ${r.fish} simmered with onion, garlic, ginger, tomato, curry spices and ${pickVeg(input, i, 5)}. No added starch.`,
        `Leftover ${r.fish} curry vegetable bowl`);

      add("fish", "Tomato fish stew with {starch}", "30–36g", "couscous",
        (st, i) => st !== "none"
          ? `150g ${r.fish} simmered with tomato, onion, garlic, ${pickVeg(input, i, 4)}, herbs and ${r.stock}. Serve with ${starchAmount(st)}.`
          : `150g ${r.fish} simmered with tomato, onion, garlic, ${pickVeg(input, i, 5)}, herbs and ${r.stock}. No added starch.`,
        "Leftover tomato fish stew vegetable bowl");

      add("fish", "Homemade fish cakes with vegetables and {starch}", "28–36g", "sweet_potato",
        (st, i) => st !== "none"
          ? `150g cooked ${r.fish} mixed with onion, herbs, lemon, pepper and a small amount of crumbs/oat flour to bind. Pan-sear and serve with ${pickVeg(input, i, 4)} and ${starchAmount(st)}.`
          : `150g cooked ${r.fish} mixed with onion, herbs, lemon, pepper and a small amount of crumbs/oat flour to bind. Pan-sear and serve with ${pickVeg(input, i, 5)}. No added starch.`,
        "Leftover fish cake vegetable bowl");
    }

    if (main.has("eggs")) {
      add("eggs", "Egg and vegetable frittata with {starch}", "20–28g", "sweet_potato",
        (st, i) => st !== "none"
          ? `2–3 eggs cooked with ${pickVeg(input, i, 5)} and herbs. Serve with ${starchAmount(st)}.`
          : `2–3 eggs cooked with ${pickVeg(input, i, 5)} and herbs. No added starch.`,
        "Leftover frittata vegetable plate");
    }

    if (main.has("tofu")) {
      add("tofu", "Tofu-style stir-fry with {starch}", "24–34g", "rice",
        (st, i) => st !== "none"
          ? `Tofu-style protein stir-fried with ${pickVeg(input, i, 5)} and garlic-ginger sauce. Serve with ${starchAmount(st)}.`
          : `Tofu-style protein stir-fried with ${pickVeg(input, i, 5)} and garlic-ginger sauce. No added starch.`,
        "Leftover tofu-style stir-fry vegetable bowl");

      add("tofu", "Tofu tomato bake with {starch}", "24–34g", "couscous",
        (st, i) => st !== "none"
          ? `Tofu-style protein baked/simmered in tomato, onion, garlic, ${pickVeg(input, i, 4)} and herbs. Serve with ${starchAmount(st)}.`
          : `Tofu-style protein baked/simmered in tomato, onion, garlic, ${pickVeg(input, i, 5)} and herbs. No added starch.`,
        "Leftover tofu tomato vegetable bowl");
    }

    if (main.has("lentils")) {
      add("lentils", "Lentil bolognese with {starch}", "18–28g", "pasta",
        (st, i) => st !== "none"
          ? `Lentils cooked with onion, garlic, chopped tomato, carrot, mushrooms and Italian herbs. Serve with ${starchAmount(st)} and ${pickVeg(input, i, 3)}.`
          : `Lentils cooked with onion, garlic, tomato, carrot, mushrooms and herbs. Serve with ${pickVeg(input, i, 5)}. No added starch.`,
        "Leftover lentil bolognese vegetable bowl");
    }

    if (main.has("beans")) {
      add("beans", "Bean and vegetable chilli with {starch}", "18–28g", "rice",
        (st, i) => st !== "none"
          ? `Beans cooked with tomato, onion, mild spices, herbs and ${pickVeg(input, i, 4)}. Serve with ${starchAmount(st)}.`
          : `Beans cooked with tomato, onion, mild spices, herbs and ${pickVeg(input, i, 5)}. No added starch.`,
        "Leftover bean chilli vegetable bowl");
    }

    if (main.has("chickpeas")) {
      add("chickpeas", "Chickpea and vegetable curry with {starch}", "18–28g", "rice",
        (st, i) => st !== "none"
          ? `Chickpeas simmered with onion, garlic, ginger, tomato, curry spices and ${pickVeg(input, i, 4)}. Serve with ${starchAmount(st)}. Chickpeas stay in leftovers because they are the protein source.`
          : `Chickpeas simmered with onion, garlic, ginger, tomato, curry spices and ${pickVeg(input, i, 5)}. No added starch. Chickpeas stay in leftovers because they are the protein source.`,
        "Leftover chickpea curry vegetable bowl");
    }

    return t;
  }

  function makeBreakfasts(input, gate) {
    const r = REGION[input.region];

    if (input.noBreakfast) {
      return Array.from({ length: 7 }, () => ({
        name: "Not planned — client does not prefer breakfast",
        protein: "0g",
        detail: "No breakfast planned. The morning snack becomes the protein anchor for the day."
      }));
    }

    const allowed = new Set(gate.allowed);
    const opts = [];

    const add = (type, name, protein, detail) => opts.push({ type, name, protein, detail });

    for (const item of input.breakfastItems) {
      if (item === "eggs" && allowed.has("eggs")) {
        add("eggs", "Vegetable scrambled eggs", "18g", `2 eggs scrambled with ${pickVeg(input, 0, 4)}.`);
        add("eggs", "Vegetable omelette", "18–22g", `2 eggs cooked with ${pickVeg(input, 1, 4)}.`);
      } else if (["yoghurt", "yogurt", "greek_yoghurt", "greek_yogurt"].includes(item) && allowed.has("dairy")) {
        add("dairy", `High-protein ${r.yoghurt} bowl`, "18–22g", `1 cup Greek-style ${r.yoghurt} with berries or fruit and cinnamon.`);
      } else if (item === "cottage_cheese" && allowed.has("dairy")) {
        add("dairy", "Cottage cheese breakfast plate", "12–20g", "½ cup cottage cheese with cucumber, tomato and herbs.");
      } else if (["oats", "oats_with_yoghurt", "oats_with_yogurt"].includes(item) && allowed.has("dairy")) {
        add("dairy", `Oats with ${r.yoghurt}`, "12–20g", `Small portion oats topped with plain ${r.yoghurt}, berries or fruit and cinnamon.`);
      } else if (item === "protein_shake" && allowed.has("protein_powder")) {
        add("protein_powder", "Protein shake breakfast", "20–25g", "Protein shake prepared with water, plus fruit if desired.");
      } else if (item === "tofu_scramble" && allowed.has("tofu")) {
        add("tofu", "Tofu scramble", "18–24g", `Tofu-style protein cooked with ${pickVeg(input, 2, 4)} and mild spices.`);
      } else if (item === "hummus_plate" && (allowed.has("lentils") || allowed.has("beans") || allowed.has("chickpeas"))) {
        add("hummus", "Hummus breakfast plate", "5–10g", "2–3 tablespoons hummus with cucumber, tomato and carrot sticks.");
      }
    }

    if (!opts.length) {
      // Should not happen if gate has been respected.
      return [];
    }

    const counts = {};
    const nameCounts = {};
    const out = [];

    for (let day = 0; day < 7; day++) {
      let best = null;
      let bestScore = Infinity;
      const typeCount = new Set(opts.map(o => o.type)).size;

      opts.forEach((o, idx) => {
        const tCount = counts[o.type] || 0;
        const nCount = nameCounts[o.name] || 0;
        let score = idx + tCount * 6 + nCount * 8;

        if (["eggs", "dairy"].includes(o.type) && typeCount > 1 && tCount >= 4) {
          score += 100;
        }

        if (score < bestScore) {
          best = o;
          bestScore = score;
        }
      });

      counts[best.type] = (counts[best.type] || 0) + 1;
      nameCounts[best.name] = (nameCounts[best.name] || 0) + 1;
      out.push(stripType(best));
    }

    return out;
  }

  function makeSnacks(input, gate) {
    const r = REGION[input.region];
    const allowed = new Set(gate.allowed);
    const opts = [];
    const seen = new Set();

    function add(name, protein, detail) {
      if (!seen.has(name)) {
        opts.push({ name, protein, detail });
        seen.add(name);
      }
    }

    for (const item of input.snackProteins) {
      const cat = SNACK_ITEM_TO_PROTEIN[item];

      if (cat === "dairy" && allowed.has("dairy")) {
        add(`Plain ${r.yoghurt} with berries`, "10–18g", `¾–1 cup plain ${r.yoghurt} with berries or fruit.`);
      } else if (cat === "eggs" && allowed.has("eggs")) {
        add("Boiled egg with cucumber", "6–8g", "1 boiled egg with cucumber and tomato.");
      } else if (cat === "chicken" && allowed.has("chicken")) {
        add("Cooked chicken strips with cucumber", "15–20g", "Small portion cooked chicken strips with cucumber and lemon.");
      } else if (cat === "fish" && allowed.has("fish")) {
        add("Tuna cucumber bites", "15–20g", "Tuna or selected fish with cucumber, lemon and herbs.");
      } else if (cat === "beef" && allowed.has("beef")) {
        add(`${r.dried} with cucumber sticks`, "12–15g", `25–30g ${r.dried} with cucumber sticks.`);
      } else if (cat === "legumes" && (allowed.has("lentils") || allowed.has("beans") || allowed.has("chickpeas"))) {
        add("Hummus with cucumber sticks", "5–8g", "2–3 tablespoons hummus with cucumber and carrot sticks.");
      } else if (cat === "tofu" && allowed.has("tofu")) {
        add("Tofu cucumber bites", "10–16g", "Small portion tofu-style protein with cucumber, tomato, lemon and herbs.");
      } else if (cat === "protein_powder" && allowed.has("protein_powder")) {
        add("Optional protein shake", "20–25g", "Use only if selected or if protein is difficult to reach from meals.");
      }
    }

    const out = [];
    for (let day = 0; day < 7; day++) {
      out.push([opts[day % opts.length], opts[(day + 1) % opts.length]]);
    }
    return out;
  }

  function generatePlan(rawInput) {
    const input = normalizeInput(rawInput);
    const gate = gateCheck(input);

    if (gate.status === "BLOCKED") {
      return {
        ok: false,
        status: "BLOCKED",
        version: VERSION,
        gate,
        messages: gate.messages,
        days: []
      };
    }

    const templates = dinnerTemplates(input, gate);
    const breakfasts = makeBreakfasts(input, gate);
    const snacks = makeSnacks(input, gate);

    const dinners = Array.from({ length: 7 }, (_, day) => {
      const t = templates[day % templates.length];
      const st = chooseStarch(input, t.pref, day);

      return {
        name: t.name.replace("{starch}", STARCH_LABELS[st] || "no added starch"),
        protein: t.protein,
        detail: t.detail(st, day),
        cat: t.cat,
        starch: st,
        leftover: t.leftover
      };
    });

    const preferredLunchOrder = ["chicken", "fish", "tofu", "lentils", "beef", "eggs", "beans", "chickpeas", "pork"];
    const firstLunchProtein = preferredLunchOrder.find(p => gate.mainMealProteins.includes(p)) || gate.mainMealProteins[0];

    const days = Array.from({ length: 7 }, (_, idx) => {
      const lunch = idx === 0
        ? firstLunch(input, firstLunchProtein)
        : leftoverLunch(input, dinners[idx - 1], idx);

      return {
        day: idx + 1,
        breakfast: breakfasts[idx],
        morningSnack: snacks[idx][0],
        lunch,
        afternoonSnack: snacks[idx][1],
        dinner: dinners[idx],
        leftoverInstruction: "Cook extra protein/sauce/vegetables for the next lunch where practical. Keep the added starch separate so lunch can stay starch-controlled."
      };
    });

    const qa = validatePlan(input, gate, days);

    return {
      ok: qa.status === "PASS",
      status: "ALLOWED",
      version: VERSION,
      gate,
      qa,
      days,
      markdown: renderMarkdown(input, gate, days, qa)
    };
  }

  function firstLunch(input, cat) {
    const r = REGION[input.region];

    if (cat === "chicken") {
      return {
        cat: "chicken",
        name: "Chicken vegetable soup bowl",
        protein: "30–35g",
        detail: `120–150g cooked chicken simmered with ${pickVeg(input, 0, 5)} and ${r.stock}. No added rice, pasta or potato.`
      };
    }

    if (cat === "fish") {
      return {
        cat: "fish",
        name: "Fish vegetable bowl",
        protein: "25–35g",
        detail: `Selected fish with ${pickVeg(input, 0, 5)} and lemon-herb dressing. No added rice, pasta or potato.`
      };
    }

    if (cat === "tofu") {
      return {
        cat: "tofu",
        name: "Tofu vegetable bowl",
        protein: "24–34g",
        detail: `Tofu-style protein with ${pickVeg(input, 0, 5)} and a lemon-herb dressing. No added rice, pasta or potato.`
      };
    }

    if (cat === "lentils") {
      return {
        cat: "lentils",
        name: "Lentil vegetable soup bowl",
        protein: "18–28g",
        detail: `Lentils simmered with ${pickVeg(input, 0, 5)} and ${r.stock}. No added rice, pasta or potato.`
      };
    }

    return {
      cat,
      name: "Protein vegetable bowl",
      protein: "18–30g",
      detail: `Selected protein with ${pickVeg(input, 0, 5)}. No added rice, pasta or potato.`
    };
  }

  function leftoverLunch(input, previousDinner, dayIndex) {
    const removed = previousDinner.starch === "none"
      ? "No added starch was used at dinner, so keep lunch vegetable-based."
      : `Remove the added ${STARCH_LABELS[previousDinner.starch] || previousDinner.starch} from lunch.`;

    const legumeNote = ["lentils", "beans", "chickpeas"].includes(previousDinner.cat)
      ? " Keep the legumes because they are the protein source."
      : "";

    return {
      cat: previousDinner.cat,
      name: previousDinner.leftover,
      protein: previousDinner.protein,
      detail: `Use the leftover protein/sauce/vegetable part from last night's ${previousDinner.name.toLowerCase()}. Serve with extra vegetables such as ${pickVeg(input, dayIndex, 5)}. ${removed}${legumeNote}`
    };
  }

  function validatePlan(input, gate, days) {
    const hard = [];
    const warn = [];

    if (!Array.isArray(days) || days.length !== 7) hard.push("Plan must contain exactly 7 days.");

    const allText = JSON.stringify(days).toLowerCase();

    days.forEach(day => {
      const breakfast = `${day.breakfast.name} ${day.breakfast.detail}`.toLowerCase();
      const legumeCheck = breakfast.replace(/green beans/g, "greenbeans");

      if (/\b(lentil|lentils|bean|beans|chickpea|chickpeas)\b/.test(legumeCheck) && !/hummus/.test(legumeCheck)) {
        hard.push(`Day ${day.day} breakfast contains legume wording outside hummus.`);
      }

      if (/hummus/.test(breakfast) && !input.breakfastItems.includes("hummus_plate")) {
        hard.push(`Day ${day.day} breakfast contains hummus without hummus_plate selected.`);
      }

      if (/tofu/.test(breakfast) && !input.breakfastItems.includes("tofu_scramble")) {
        hard.push(`Day ${day.day} breakfast contains tofu without tofu_scramble selected.`);
      }

      if (/\b(chicken|beef|pork|fish|tuna|hake|cod|jerky|biltong)\b/.test(breakfast)) {
        hard.push(`Day ${day.day} breakfast contains meat/fish.`);
      }
    });

    const exclusions = new Set(input.exclusions || []);
    const exclusionChecks = [
      ["no_dairy", ["yoghurt", "yogurt", "cottage cheese", "cheese", "milk"], "Dairy appears despite no-dairy."],
      ["no_eggs", ["egg", "eggs", "omelette", "frittata"], "Egg appears despite no-eggs."],
      ["no_fish", ["fish", "tuna", "hake", "cod"], "Fish appears despite no-fish."],
      ["no_red_meat", ["beef", "pork", "biltong", "jerky"], "Red meat appears despite no-red-meat."]
    ];

    for (const [flag, terms, msg] of exclusionChecks) {
      if (exclusions.has(flag) && terms.some(t => hasWord(allText, t))) hard.push(msg);
    }

    if (input.diet === "vegetarian" && ["chicken", "beef", "pork", "fish", "tuna", "hake", "cod", "biltong", "jerky"].some(t => hasWord(allText, t))) {
      hard.push("Meat/fish appears in vegetarian plan.");
    }

    if (input.diet === "pescatarian" && ["chicken", "beef", "pork", "biltong", "jerky"].some(t => hasWord(allText, t))) {
      hard.push("Chicken/red meat appears in pescatarian plan.");
    }

    if (input.region === "US" && (allText.includes("yoghurt") || allText.includes("baby marrow") || allText.includes("naartjie"))) {
      hard.push("US wording error.");
    }
    if (input.region === "UK" && (allText.includes("zucchini") || allText.includes("yogurt") || allText.includes("naartjie"))) {
      hard.push("UK wording error.");
    }
    if (input.region === "SA" && (allText.includes("zucchini") || allText.includes("yogurt") || allText.includes("clementine"))) {
      hard.push("SA wording error.");
    }

    let lunchStarch = 0;
    let vague = 0;
    const dinnerCats = [];
    const snackTypes = [];
    const breakfastTypes = [];

    days.forEach(day => {
      dinnerCats.push(day.dinner.cat);

      const lunchText = `${day.lunch.name} ${day.lunch.detail}`.toLowerCase();
      if (/serve with\s+½ cup cooked (rice|pasta|couscous|potato)/.test(lunchText) || lunchText.includes("½ medium sweet potato")) {
        lunchStarch++;
      }

      const d = day.dinner.detail.toLowerCase();
      const hasProtein = /120–150g|150g|2–3 eggs|lentils|beans|chickpeas|tofu-style/.test(d);
      const hasRecipe = /tomato|onion|garlic|curry|lemon|herb|stock|broth|sauce|simmered|cooked|stir-fried|baked/.test(d);
      const hasStarch = /½ cup|½ medium|no added starch/.test(d);
      if (!(hasProtein && hasRecipe && hasStarch)) vague++;

      breakfastTypes.push(classifyBreakfast(day.breakfast));
      snackTypes.push(classifySnack(day.morningSnack));
      snackTypes.push(classifySnack(day.afternoonSnack));
    });

    if (lunchStarch) hard.push(`${lunchStarch} leftover lunches contain added starch.`);
    if (vague) hard.push(`${vague} dinners too vague.`);
    if (new Set(dinnerCats).size < 2) hard.push("Dinner variety below 2.");
    if (new Set(snackTypes).size < 2) hard.push("Snack variety below 2.");

    const breakfastCounter = countList(breakfastTypes);
    if ((breakfastCounter.eggs || 0) > 4 && new Set(breakfastTypes).size > 1) {
      warn.push("Egg breakfasts appear more than 4 times despite alternatives.");
    }

    return {
      status: hard.length ? "FAIL" : (warn.length ? "CONDITIONAL PASS" : "PASS"),
      hard,
      warn,
      dinnerMix: countList(dinnerCats),
      breakfastMix: countList(breakfastTypes),
      snackMix: countList(snackTypes)
    };
  }

  function renderMarkdown(input, gate, days, qa) {
    const r = REGION[input.region];
    const lines = [];

    lines.push(`# 7-Day Hearty Meal Plan`);
    lines.push("");
    lines.push(`Region: ${r.label}`);
    lines.push(`Diet: ${input.diet}`);
    lines.push(`Main-meal proteins: ${gate.mainMealProteins.join(", ")}`);
    lines.push(`Breakfast categories: ${gate.breakfastCategories.join(", ") || "none"}`);
    lines.push(`Snack categories: ${gate.snackCategories.join(", ")}`);
    lines.push(`QA: ${qa.status}`);
    lines.push("");
    lines.push("> Use snacks only if needed. Portions can be adjusted based on appetite.");
    lines.push("");

    days.forEach(day => {
      lines.push(`## Day ${day.day}`);
      lines.push("");
      lines.push(formatMeal("Breakfast", day.breakfast));
      lines.push(formatMeal(input.noBreakfast ? "Morning snack / protein anchor" : "Morning snack", day.morningSnack));
      lines.push(formatMeal("Lunch", day.lunch));
      lines.push(formatMeal("Afternoon snack", day.afternoonSnack));
      lines.push(formatMeal("Dinner", day.dinner));
      lines.push(`Leftover instruction: ${day.leftoverInstruction}`);
      lines.push("");
    });

    return lines.join("\n");
  }

  function formatMeal(label, meal) {
    return `**${label}: ${meal.name} — approx. ${meal.protein} protein**\n\nPortion/detail: ${meal.detail}\n`;
  }

  function runFinalRegression() {
    const cases = buildFinalRegressionCases();
    const results = cases.map(c => generatePlan(c));
    const counts = countList(results.map(r => r.ok ? "PASS" : (r.status === "BLOCKED" ? "BLOCKED" : r.qa.status)));

    return {
      version: VERSION,
      total: cases.length,
      counts,
      passed: counts.PASS === cases.length,
      failures: results
        .map((r, i) => ({ index: i + 1, caseName: cases[i].name, result: r }))
        .filter(x => !x.result.ok)
        .map(x => ({
          index: x.index,
          caseName: x.caseName,
          status: x.result.status === "BLOCKED" ? "BLOCKED" : x.result.qa.status,
          messages: x.result.messages || [],
          hard: x.result.qa ? x.result.qa.hard : [],
          warn: x.result.qa ? x.result.qa.warn : []
        }))
    };
  }

  function buildFinalRegressionCases() {
    const veg = {
      SA: ["spinach", "tomato", "onion", "carrot", "baby marrow", "green beans", "mushrooms", "peppers", "cabbage"],
      US: ["spinach", "tomato", "onion", "carrot", "zucchini", "green beans", "mushrooms", "peppers", "broccoli"],
      UK: ["spinach", "tomato", "onion", "carrot", "courgette", "green beans", "mushrooms", "peppers", "cabbage"],
      AU: ["spinach", "tomato", "onion", "carrot", "zucchini", "green beans", "mushrooms", "peppers", "cabbage"],
      CA: ["spinach", "tomato", "onion", "carrot", "zucchini", "green beans", "mushrooms", "peppers", "broccoli"]
    };

    const cases = [];

    function add(name, region, diet, proteins, breakfastItems, snackProteins, starches, extra) {
      const options = extra || {};
      cases.push({
        name,
        region,
        diet,
        proteins,
        breakfastItems,
        snackProteins,
        starches,
        vegetables: options.vegetables || veg[region].slice(0, 6),
        exclusions: options.exclusions || [],
        lowerStarch: Boolean(options.lowerStarch),
        noBreakfast: Boolean(options.noBreakfast)
      });
    }

    Object.keys(REGION).forEach(region => {
      const yog = ["US", "CA"].includes(region) ? "yogurt" : "yoghurt";

      add(`${region} standard`, region, "omnivore", ["chicken", "beef", "eggs", "dairy"], ["eggs", yog, "cottage_cheese"], [yog, "boiled_eggs", "chicken_strips"], ["rice", "pasta"]);
      add(`${region} high variety`, region, "omnivore", ["chicken", "beef", "fish", "eggs", "dairy"], ["eggs", yog, "oats"], [yog, "boiled_eggs", "tuna", "chicken_strips"], ["rice", "pasta", "sweet_potato"], { vegetables: veg[region].slice(0, 8) });
      add(`${region} no red meat`, region, "omnivore", ["chicken", "fish", "eggs", "dairy", "beef"], ["eggs", yog], [yog, "boiled_eggs", "tuna"], ["rice", "sweet_potato"], { exclusions: ["no_red_meat"] });
      add(`${region} lower starch`, region, "omnivore", ["chicken", "beef", "eggs", "protein_powder"], ["eggs", "protein_shake"], ["boiled_eggs", "chicken_strips", "protein_shake"], [], { lowerStarch: true });
      add(`${region} no breakfast`, region, "omnivore", ["chicken", "beef", "eggs", "dairy"], [], [yog, "boiled_eggs", "chicken_strips"], ["rice"], { noBreakfast: true });
    });

    Object.keys(REGION).forEach(region => {
      const yog = ["US", "CA"].includes(region) ? "yogurt" : "yoghurt";

      add(`${region} vegetarian eggs dairy tofu lentils`, region, "vegetarian", ["eggs", "dairy", "tofu", "lentils"], ["eggs", yog, "cottage_cheese"], [yog, "boiled_eggs", "tofu_bites"], ["rice", "pasta"]);
      add(`${region} vegetarian no dairy no eggs`, region, "vegetarian", ["tofu", "lentils", "beans", "chickpeas"], ["tofu_scramble"], ["tofu_bites", "hummus"], ["rice", "sweet_potato"], { exclusions: ["no_dairy", "no_eggs"] });
      add(`${region} vegetarian hummus breakfast`, region, "vegetarian", ["tofu", "lentils", "beans", "chickpeas"], ["hummus_plate", "tofu_scramble"], ["tofu_bites", "hummus"], ["rice"]);
    });

    Object.keys(REGION).forEach(region => {
      const yog = ["US", "CA"].includes(region) ? "yogurt" : "yoghurt";

      add(`${region} pescatarian fish eggs dairy`, region, "pescatarian", ["fish", "eggs", "dairy", "lentils"], ["eggs", yog], ["tuna", "boiled_eggs", yog], ["rice", "sweet_potato"]);
      add(`${region} pescatarian no dairy`, region, "pescatarian", ["fish", "eggs", "lentils", "beans"], ["eggs"], ["tuna", "boiled_eggs", "hummus"], ["rice"], { exclusions: ["no_dairy"] });
    });

    return cases;
  }

  function hasWord(text, term) {
    return new RegExp(`\\b${escapeRegex(term)}\\b`, "i").test(text);
  }

  function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function classifyBreakfast(meal) {
    const text = `${meal.name} ${meal.detail}`.toLowerCase();
    if (text.includes("not planned")) return "none";
    if (text.includes("egg")) return "eggs";
    if (["yoghurt", "yogurt", "cottage cheese", "oats"].some(x => text.includes(x))) return "dairy";
    if (text.includes("tofu")) return "tofu";
    if (text.includes("hummus")) return "hummus";
    if (text.includes("protein shake")) return "protein_powder";
    return "other";
  }

  function classifySnack(meal) {
    const text = `${meal.name} ${meal.detail}`.toLowerCase();
    if (["yoghurt", "yogurt", "cottage cheese"].some(x => text.includes(x))) return "dairy";
    if (text.includes("egg")) return "eggs";
    if (text.includes("chicken")) return "chicken";
    if (text.includes("tuna") || text.includes("fish")) return "fish";
    if (text.includes("hummus") || text.includes("chickpea")) return "legumes";
    if (text.includes("tofu")) return "tofu";
    if (text.includes("protein shake")) return "protein_powder";
    if (["biltong", "jerky", "meat strips"].some(x => text.includes(x))) return "beef";
    return "other";
  }

  function countList(items) {
    return items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});
  }

  function stripType(item) {
    const clone = Object.assign({}, item);
    delete clone.type;
    return clone;
  }

  function titleCase(value) {
    return String(value).replace(/\b\w/g, s => s.toUpperCase());
  }

  return {
    VERSION,
    generatePlan,
    gateCheck,
    validatePlan,
    normalizeInput,
    runFinalRegression,
    buildFinalRegressionCases
  };
});
