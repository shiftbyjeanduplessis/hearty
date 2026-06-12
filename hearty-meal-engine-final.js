/*!
 * Hearty Meal Engine v3.2 Locked Rules
 * Fixes against strict Hearty business-rule QA:
 * - No fish curry.
 * - No forced leftovers.
 * - Leftovers only if leftoverLunches/useLeftovers is true.
 * - Lunch wording uses "No added starch."
 * - No same-day egg/yoghurt/protein-shake snack clash with matching breakfast when alternatives exist.
 * - Hake only in South Africa.
 * - No "selected protein"/"selected fish" wording.
 * - No "mixed vegetables" in generated output.
 */

(function(root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.HeartyMealEngine = factory();
})(typeof self !== "undefined" ? self : this, function() {
  "use strict";

  const VERSION = "3.3.6-button-helper-fix";

  const REGION = {
    US: { label:"United States", yoghurt:"yogurt", stock:"broth", fish:"white fish", mince:"lean ground beef", dried:"beef jerky",
      defaultVeg:["spinach","tomato","onion","carrot","zucchini","green beans","mushrooms","peppers","broccoli","cucumber","lettuce"] },
    SA: { label:"South Africa", yoghurt:"yoghurt", stock:"stock", fish:"hake", mince:"lean beef mince", dried:"biltong",
      defaultVeg:["spinach","tomato","onion","carrot","baby marrow","green beans","mushrooms","peppers","broccoli","cucumber","lettuce"] },
    UK: { label:"United Kingdom", yoghurt:"yoghurt", stock:"stock", fish:"cod", mince:"lean beef mince", dried:"lean cooked meat strips",
      defaultVeg:["spinach","tomato","onion","carrot","courgette","green beans","mushrooms","peppers","broccoli","cucumber","lettuce"] },
    AU: { label:"Australia", yoghurt:"yoghurt", stock:"stock", fish:"white fish", mince:"lean beef mince", dried:"lean beef jerky",
      defaultVeg:["spinach","tomato","onion","carrot","zucchini","green beans","mushrooms","peppers","broccoli","cucumber","lettuce"] },
    CA: { label:"Canada", yoghurt:"yogurt", stock:"broth", fish:"white fish", mince:"lean ground beef", dried:"beef jerky",
      defaultVeg:["spinach","tomato","onion","carrot","zucchini","green beans","mushrooms","peppers","broccoli","cucumber","lettuce"] }
  };

  const STARCH = {
    rice:"rice", pasta:"pasta", couscous:"couscous", sweet_potato:"sweet potato", potato:"potato", wrap:"small wrap"
  };

  const BAD_CORE_VEG = new Set(["corn","peas","mixed vegetables","mixed veg"]);
  const MAIN = new Set(["chicken","beef","pork","fish","eggs","tofu","lentils","beans","chickpeas"]);
  const BF = {
    eggs:"eggs", yoghurt:"dairy", yogurt:"dairy", greek_yoghurt:"dairy", greek_yogurt:"dairy",
    cottage_cheese:"dairy", oats:"dairy", oats_with_yoghurt:"dairy", oats_with_yogurt:"dairy",
    protein_shake:"protein_powder", tofu_scramble:"tofu", hummus_plate:"legumes"
  };
  const SN = {
    yoghurt:"dairy", yogurt:"dairy", cottage_cheese:"dairy", boiled_eggs:"eggs",
    biltong:"beef", jerky:"beef", dried_meat:"beef", chicken_strips:"chicken",
    tuna:"fish", fish:"fish", hummus:"legumes", roasted_chickpeas:"legumes",
    tofu_bites:"tofu", protein_shake:"protein_powder"
  };

  function unique(xs) {
    return Array.from(new Set((xs || []).filter(Boolean)));
  }

  function regionKey(region) {
    return REGION[region] ? region : "US";
  }

  function sanitizeVegetables(region, vegetables) {
    const raw = unique(vegetables && vegetables.length ? vegetables : REGION[region].defaultVeg);
    const clean = raw
      .map(x => String(x).trim())
      .filter(x => x && !BAD_CORE_VEG.has(x.toLowerCase()));
    return unique(clean);
  }

  function normalizeInput(raw) {
    const input = raw || {};
    const region = regionKey(input.region || "US");
    return {
      region,
      diet: input.diet || input.dietType || "omnivore",
      proteins: unique(input.proteins || input.selectedProteins || []),
      vegetables: sanitizeVegetables(region, input.vegetables || []),
      breakfastItems: unique(input.breakfastItems || []),
      snackProteins: unique(input.snackProteins || input.snacks || []),
      starches: unique(input.starches || input.selectedStarches || []),
      exclusions: unique(input.exclusions || []),
      lowerStarch: Boolean(input.lowerStarch || input.lowStarch),
      noBreakfast: Boolean(input.noBreakfast || input.breakfast === false),
      leftoverLunches: Boolean(input.leftoverLunches || input.useLeftovers)
    };
  }

  function allowedProteins(input) {
    const p = new Set(input.proteins);
    const ex = new Set(input.exclusions);

    if (input.diet === "vegetarian") ["chicken","beef","pork","fish"].forEach(x => p.delete(x));
    if (input.diet === "pescatarian") ["chicken","beef","pork"].forEach(x => p.delete(x));

    if (ex.has("no_dairy")) p.delete("dairy");
    if (ex.has("no_eggs")) p.delete("eggs");
    if (ex.has("no_fish")) p.delete("fish");
    if (ex.has("no_chicken")) p.delete("chicken");
    if (ex.has("no_red_meat")) { p.delete("beef"); p.delete("pork"); }
    if (ex.has("no_tofu")) p.delete("tofu");
    if (ex.has("no_legumes")) ["lentils","beans","chickpeas"].forEach(x => p.delete(x));

    return Array.from(p).sort();
  }

  function breakfastCategories(input, allowed) {
    const a = new Set(allowed);
    const out = [];
    input.breakfastItems.forEach(item => {
      const cat = BF[item];
      if (cat === "dairy" && a.has("dairy")) out.push("dairy");
      else if (cat === "legumes" && (a.has("lentils") || a.has("beans") || a.has("chickpeas"))) out.push("hummus");
      else if (cat && a.has(cat)) out.push(cat);
    });
    return unique(out).sort();
  }

  function snackCategories(input, allowed) {
    const a = new Set(allowed);
    const out = [];
    input.snackProteins.forEach(item => {
      const cat = SN[item];
      if (cat === "dairy" && a.has("dairy")) out.push("dairy");
      else if (cat === "legumes" && (a.has("lentils") || a.has("beans") || a.has("chickpeas"))) out.push("legumes");
      else if (cat && a.has(cat)) out.push(cat);
    });
    return unique(out).sort();
  }

  function gateCheck(raw) {
    const input = normalizeInput(raw);
    const allowed = allowedProteins(input);
    const mainMealProteins = allowed.filter(x => MAIN.has(x)).sort();
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
      messages.push("Please select at least 5 vegetables. Corn, peas and mixed vegetables do not count toward this minimum.");
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
      lowerStarch: input.lowerStarch,
      leftoverLunches: input.leftoverLunches
    };
  }

  function sentenceList(items) {
    const clean = unique(items).filter(Boolean);
    if (!clean.length) return "";
    if (clean.length === 1) return clean[0];
    return clean.slice(0, -1).join(", ") + " and " + clean[clean.length - 1];
  }

  function normalizeMealName(name) {
    return String(name || "")
      .replace(/\bLean Ground Beef\b/g, "Lean ground beef")
      .replace(/\bWhite Fish\b/g, "White fish")
      .replace(/\bLean Beef Mince\b/g, "Lean beef mince")
      .replace(/^beef jerky/g, "Beef jerky")
      .replace(/^lean beef jerky/g, "Lean beef jerky")
      .replace(/^biltong/g, "Biltong")
      .replace(/\s+/g, " ")
      .trim();
  }

  function pickVegItems(input, start, count, exclude) {
    const banned = new Set((exclude || []).map(x => String(x).toLowerCase()));
    const pool = (input.vegetables || []).filter(v => !banned.has(String(v).toLowerCase()));
    const source = pool.length ? pool : (input.vegetables || []);
    const out = [];
    let i = 0;
    while (source.length && out.length < count && i < source.length * 3) {
      const v = source[(start + i) % source.length];
      if (v && !out.includes(v)) out.push(v);
      i++;
    }
    return out;
  }

  function pickVeg(input, start, count, exclude) {
    return sentenceList(pickVegItems(input, start, count, exclude));
  }

  function breakfastVegPool(input) {
    const allowed = new Set(["tomato", "spinach", "mushrooms", "peppers", "onion", "zucchini", "courgette", "baby marrow"]);
    const chosen = (input.vegetables || []).filter(v => allowed.has(v));
    const regionFallback = ((REGION[input.region] && REGION[input.region].veg) || []).filter(v => allowed.has(v));
    const globalFallback = ["tomato", "spinach", "mushrooms", "peppers", "onion", "zucchini"];
    return unique(chosen.concat(regionFallback, globalFallback));
  }

  function pickBreakfastVeg(input, start, count) {
    const source = breakfastVegPool(input);
    const out = [];
    let i = 0;
    while (source.length && out.length < count && i < source.length * 3) {
      const v = source[(start + i) % source.length];
      if (v && !out.includes(v)) out.push(v);
      i++;
    }
    return sentenceList(out);
  }

  function starchAmount(starch) {
    if (starch === "none") return "no added starch";
    if (starch === "sweet_potato") return "½ medium sweet potato";
    if (starch === "potato") return "½ cup cooked potato";
    if (starch === "wrap") return "1 small wrap";
    return "½ cup cooked " + (STARCH[starch] || starch);
  }

  function chooseStarch(input, pref, day) {
    if (input.lowerStarch) return "none";
    const starches = input.starches.filter(x => STARCH[x]);
    if (!starches.length) return "none";
    if (starches.includes(pref)) return pref;
    return starches[day % starches.length];
  }

  function dinnerTemplates(input, gate) {
    const r = REGION[input.region];
    const main = new Set(gate.mainMealProteins);
    const t = [];
    const add = (cat, name, protein, pref, detail) => t.push({cat, name, protein, pref, detail});

    if (main.has("chicken")) {
      add("chicken","Chicken curry with {starch}","32–38g","rice",
        (st,i) => st !== "none"
          ? `120–150g chicken cooked with onion, garlic, ginger, tomato, curry spices, ${pickVeg(input,i,3,["onion","tomato"])} and ${r.stock}. Serve with ${starchAmount(st)}.`
          : `120–150g chicken cooked with onion, garlic, ginger, tomato, curry spices and ${pickVeg(input,i,5,["onion","tomato"])}. No added starch.`);
      add("chicken","Chicken stir-fry with low-calorie sauce and {starch}","32–38g","rice",
        (st,i) => st !== "none"
          ? `120–150g chicken strips stir-fried with ${pickVeg(input,i,5)}. Sauce: garlic, lemon/vinegar, water and pepper. Serve with ${starchAmount(st)}.`
          : `120–150g chicken strips stir-fried with ${pickVeg(input,i,5)} and garlic-lemon sauce. No added starch.`);
      add("chicken","Chicken tomato stew with {starch}","32–38g","rice",
        (st,i) => st !== "none"
          ? `120–150g chicken simmered with tomato, onion, garlic, ${pickVeg(input,i,4,["onion","tomato"])}, herbs and ${r.stock} until saucy. Serve with ${starchAmount(st)}.`
          : `120–150g chicken simmered with tomato, onion, garlic, ${pickVeg(input,i,5,["onion","tomato"])}, herbs and ${r.stock}. No added starch.`);
    }

    if (main.has("beef")) {
      add("beef",`${titleCase(r.mince)} bolognese with {starch}`,"32–38g","pasta",
        (st,i) => st !== "none"
          ? `120–150g ${r.mince} cooked with onion, garlic, chopped tomato, grated carrot, mushrooms and Italian herbs. Serve with ${starchAmount(st)} and ${pickVeg(input,i,3,["onion","tomato","carrot","mushrooms"])}.`
          : `120–150g ${r.mince} cooked with onion, garlic, tomato, carrot, mushrooms and herbs. Serve with ${pickVeg(input,i,5,["onion","tomato","carrot","mushrooms"])}. No added starch.`);
      add("beef","Lean beef stew with {starch}","32–38g","rice",
        (st,i) => st !== "none"
          ? `120–150g lean beef cooked with tomato, onion, ${pickVeg(input,i,4,["onion","tomato"])}, ${r.stock}, herbs and pepper. Serve with ${starchAmount(st)}.`
          : `120–150g lean beef cooked with tomato, onion, ${pickVeg(input,i,5,["onion","tomato"])}, ${r.stock}, herbs and pepper. No added starch.`);
    }

    if (main.has("pork")) {
      add("pork","Lean pork stir-fry with sweet-and-sour sauce and {starch}","30–36g","rice",
        (st,i) => st !== "none"
          ? `120–150g lean pork strips stir-fried with ${pickVeg(input,i,5)}. Sauce: garlic, ginger, vinegar/lemon, tomato paste, water and a small amount of sweetener. Serve with ${starchAmount(st)}.`
          : `120–150g lean pork strips stir-fried with ${pickVeg(input,i,5)} and low-calorie sweet-and-sour sauce. No added starch.`);
    }

    if (main.has("fish")) {
      add("fish",`${titleCase(r.fish)} lemon-herb plate with {starch}`,"30–36g","rice",
        (st,i) => st !== "none"
          ? `150g ${r.fish} cooked with lemon, herbs, garlic and pepper. Serve with ${pickVeg(input,i,5)} and ${starchAmount(st)}.`
          : `150g ${r.fish} cooked with lemon, herbs, garlic and pepper. Serve with ${pickVeg(input,i,5)}. No added starch.`);
      add("fish",`Grilled ${r.fish} plate with {starch}`,"30–36g","rice",
        (st,i) => st !== "none"
          ? `150g ${r.fish} grilled with lemon, herbs and pepper. Serve with ${pickVeg(input,i,5)} and ${starchAmount(st)}.`
          : `150g ${r.fish} grilled with lemon, herbs and pepper. Serve with ${pickVeg(input,i,5)}. No added starch.`);
      add("fish","Baked fish with vegetables and {starch}","30–36g","sweet_potato",
        (st,i) => st !== "none"
          ? `150g ${r.fish} baked with lemon, herbs and black pepper. Serve with ${pickVeg(input,i,5)} and ${starchAmount(st)}.`
          : `150g ${r.fish} baked with lemon, herbs and black pepper. Serve with ${pickVeg(input,i,5)}. No added starch.`);
      add("fish","Homemade fish cakes with vegetables and {starch}","28–36g","sweet_potato",
        (st,i) => st !== "none"
          ? `150g cooked ${r.fish} mixed with onion, herbs, lemon, pepper and a small amount of crumbs/oat flour to bind. Pan-sear and serve with ${pickVeg(input,i,4,["onion"])} and ${starchAmount(st)}.`
          : `150g cooked ${r.fish} mixed with onion, herbs, lemon, pepper and a small amount of crumbs/oat flour to bind. Pan-sear and serve with ${pickVeg(input,i,5,["onion"])}. No added starch.`);
    }

    if (main.has("eggs")) {
      add("eggs","Egg and vegetable frittata with {starch}","20–28g","sweet_potato",
        (st,i) => st !== "none"
          ? `2–3 eggs cooked with ${pickVeg(input,i,5)} and herbs. Serve with ${starchAmount(st)}.`
          : `2–3 eggs cooked with ${pickVeg(input,i,5)} and herbs. No added starch.`);
    }

    if (main.has("tofu")) {
      add("tofu","Tofu-style stir-fry with {starch}","24–34g","rice",
        (st,i) => st !== "none"
          ? `Tofu-style protein stir-fried with ${pickVeg(input,i,5)} and garlic-ginger sauce. Serve with ${starchAmount(st)}.`
          : `Tofu-style protein stir-fried with ${pickVeg(input,i,5)} and garlic-ginger sauce. No added starch.`);
      add("tofu","Tofu tomato bake with {starch}","24–34g","couscous",
        (st,i) => st !== "none"
          ? `Tofu-style protein baked or simmered in tomato, onion, garlic, ${pickVeg(input,i,4,["onion","tomato"])} and herbs. Serve with ${starchAmount(st)}.`
          : `Tofu-style protein baked or simmered in tomato, onion, garlic, ${pickVeg(input,i,5,["onion","tomato"])} and herbs. No added starch.`);
    }

    if (main.has("lentils")) {
      add("lentils","Lentil bolognese with {starch}","18–28g","pasta",
        (st,i) => st !== "none"
          ? `Lentils cooked with onion, garlic, chopped tomato, carrot, mushrooms and Italian herbs. Serve with ${starchAmount(st)} and ${pickVeg(input,i,3,["onion","tomato","carrot","mushrooms"])}.`
          : `Lentils cooked with onion, garlic, tomato, carrot, mushrooms and herbs. Serve with ${pickVeg(input,i,5,["onion","tomato","carrot","mushrooms"])}. No added starch.`);
      add("lentils","Lentil and vegetable stew with {starch}","18–28g","sweet_potato",
        (st,i) => st !== "none"
          ? `Lentils simmered with tomato, onion, ${pickVeg(input,i,4,["onion","tomato"])}, herbs and ${r.stock}. Serve with ${starchAmount(st)}.`
          : `Lentils simmered with tomato, onion, ${pickVeg(input,i,5,["onion","tomato"])}, herbs and ${r.stock}. No added starch.`);
    }

    if (main.has("beans")) {
      add("beans","Bean and vegetable chilli with {starch}","18–28g","rice",
        (st,i) => st !== "none"
          ? `Beans cooked with tomato, onion, mild spices, herbs and ${pickVeg(input,i,4,["onion","tomato"])}. Serve with ${starchAmount(st)}.`
          : `Beans cooked with tomato, onion, mild spices, herbs and ${pickVeg(input,i,5,["onion","tomato"])}. No added starch.`);
    }

    if (main.has("chickpeas")) {
      add("chickpeas","Chickpea and vegetable stew with {starch}","18–28g","rice",
        (st,i) => st !== "none"
          ? `Chickpeas simmered with onion, garlic, tomato, herbs and ${pickVeg(input,i,4,["onion","tomato"])}. Serve with ${starchAmount(st)}. Chickpeas stay in the meal because they are the protein source.`
          : `Chickpeas simmered with onion, garlic, tomato, herbs and ${pickVeg(input,i,5,["onion","tomato"])}. No added starch. Chickpeas stay in the meal because they are the protein source.`);
    }

    return t;
  }

  function lunchTemplates(input, gate) {
    const r = REGION[input.region];
    const main = new Set(gate.mainMealProteins);
    const t = [];
    const add = (cat, name, protein, detail) => t.push({cat, name, protein, detail});

    if (main.has("chicken")) {
      add("chicken","Chicken vegetable soup bowl","30–35g", i => `120–150g cooked chicken simmered with ${pickVeg(input,i,5)} and ${r.stock}. No added starch.`);
      add("chicken","Chicken vegetable plate","25–35g", i => `120–150g cooked chicken served with cucumber, tomato, lettuce and ${pickVeg(input,i,3,["tomato","cucumber","lettuce"])}. No added starch.`);
    }
    if (main.has("beef")) {
      add("beef",`${titleCase(r.mince)} vegetable bowl`,"30–35g", i => `120–150g ${r.mince} cooked with tomato, onion, garlic, herbs and ${pickVeg(input,i,4,["tomato","onion"])}. No added starch.`);
    }
    if (main.has("fish")) {
      add("fish","Tuna cucumber bowl","20–30g", i => `Tuna with cucumber, tomato, lettuce, lemon, herbs and ${pickVeg(input,i,3,["tomato","cucumber","lettuce"])}. No added starch.`);
      add("fish",`${titleCase(r.fish)} vegetable plate`,"25–35g", i => `${titleCase(r.fish)} with lemon-herb dressing and ${pickVeg(input,i,5)}. No added starch.`);
    }
    if (main.has("eggs")) {
      add("eggs","Boiled egg vegetable plate","14–22g", i => `2 boiled eggs with cucumber, tomato, lettuce and ${pickVeg(input,i,3,["tomato","cucumber","lettuce"])}. No added starch.`);
    }
    if (main.has("tofu")) {
      add("tofu","Tofu vegetable bowl","20–30g", i => `Tofu-style protein with cucumber, tomato, lettuce, lemon-herb dressing and ${pickVeg(input,i,3,["tomato","cucumber","lettuce"])}. No added starch.`);
    }
    if (main.has("lentils")) {
      add("lentils","Lentil vegetable soup bowl","18–28g", i => `Lentils simmered with ${pickVeg(input,i,5)} and ${r.stock}. No added starch. Lentils stay in the meal because they are the protein source.`);
    }
    if (main.has("beans")) {
      add("beans","Bean chilli vegetable bowl","18–28g", i => `Beans cooked with tomato, onion, mild spices and ${pickVeg(input,i,4,["tomato","onion"])}. No added starch. Beans stay in the meal because they are the protein source.`);
    }
    if (main.has("chickpeas")) {
      add("chickpeas","Chickpea vegetable bowl","18–28g", i => `Chickpeas with tomato, cucumber, lettuce, herbs and ${pickVeg(input,i,3,["tomato","cucumber","lettuce"])}. No added starch. Chickpeas stay in the meal because they are the protein source.`);
    }

    return t;
  }

  function makeBreakfasts(input, gate) {
    const r = REGION[input.region];

    if (input.noBreakfast) {
      return Array.from({length:7}, () => ({name:"Not planned — client does not prefer breakfast", protein:"0g", detail:"No breakfast planned. The morning snack becomes the protein anchor for the day.", type:"none"}));
    }

    const allowed = new Set(gate.allowed);
    const opts = [];
    const add = (type, name, protein, detail) => opts.push({type, name: normalizeMealName(name), protein, detail});

    input.breakfastItems.forEach(item => {
      if (item === "eggs" && allowed.has("eggs")) {
        add("eggs","Vegetable scrambled eggs","18g",`2 eggs scrambled with ${pickBreakfastVeg(input,0,4)}.`);
        add("eggs","Vegetable omelette","18–22g",`2 eggs cooked with ${pickBreakfastVeg(input,1,4)}.`);
      } else if (["yoghurt","yogurt","greek_yoghurt","greek_yogurt"].includes(item) && allowed.has("dairy")) {
        add("dairy",`High-protein ${r.yoghurt} bowl`,"18–22g",`1 cup Greek-style ${r.yoghurt} with berries or fruit and cinnamon.`);
      } else if (item === "cottage_cheese" && allowed.has("dairy")) {
        add("dairy","Cottage cheese breakfast plate","12–20g","½ cup cottage cheese with cucumber, tomato and herbs.");
      } else if (["oats","oats_with_yoghurt","oats_with_yogurt"].includes(item) && allowed.has("dairy")) {
        add("dairy",`Oats with ${r.yoghurt}`,"12–20g",`Small portion oats topped with plain ${r.yoghurt}, berries or fruit and cinnamon.`);
      } else if (item === "protein_shake" && allowed.has("protein_powder")) {
        add("protein_powder","Protein shake breakfast","20–25g","Protein shake prepared with water, plus fruit if desired.");
      } else if (item === "tofu_scramble" && allowed.has("tofu")) {
        add("tofu","Tofu scramble","18–24g",`Tofu-style protein cooked with ${pickBreakfastVeg(input,2,4)} and mild spices.`);
      } else if (item === "hummus_plate" && (allowed.has("lentils") || allowed.has("beans") || allowed.has("chickpeas"))) {
        add("hummus","Hummus breakfast plate","5–10g","2–3 tablespoons hummus with cucumber, tomato and carrot sticks.");
      }
    });

    const out = [];
    const counts = {};
    const names = {};
    for (let day=0; day<7; day++) {
      const typeCount = new Set(opts.map(o => o.type)).size;
      let best = null;
      let bestScore = Infinity;
      opts.forEach((o, idx) => {
        let score = idx + (counts[o.type] || 0)*6 + (names[o.name] || 0)*8;
        if (["eggs","dairy"].includes(o.type) && typeCount > 1 && (counts[o.type] || 0) >= 4) score += 100;
        if (score < bestScore) { best = o; bestScore = score; }
      });
      counts[best.type] = (counts[best.type] || 0) + 1;
      names[best.name] = (names[best.name] || 0) + 1;
      out.push({...best});
    }
    return out;
  }

  function snackOptions(input, gate) {
    const r = REGION[input.region];
    const allowed = new Set(gate.allowed);
    const opts = [];
    const seen = new Set();
    const add = (type, name, protein, detail) => {
      const cleanName = normalizeMealName(name);
      if (!seen.has(cleanName)) { opts.push({type, name: cleanName, protein, detail}); seen.add(cleanName); }
    };

    input.snackProteins.forEach(item => {
      const cat = SN[item];
      if (cat === "dairy" && allowed.has("dairy")) add("dairy",`Plain ${r.yoghurt} with berries`,"10–18g",`¾–1 cup plain ${r.yoghurt} with berries or fruit.`);
      else if (cat === "eggs" && allowed.has("eggs")) add("eggs","Boiled egg with cucumber","6–8g","1 boiled egg with cucumber and tomato.");
      else if (cat === "chicken" && allowed.has("chicken")) add("chicken","Cooked chicken strips with cucumber","15–20g","Small portion cooked chicken strips with cucumber and lemon.");
      else if (cat === "fish" && allowed.has("fish")) add("fish","Tuna cucumber bites","15–20g","Tuna with cucumber, lemon and herbs.");
      else if (cat === "beef" && allowed.has("beef")) add("beef",`${r.dried} with cucumber sticks`,"12–15g",`25–30g ${r.dried} with cucumber sticks.`);
      else if (cat === "legumes" && (allowed.has("lentils") || allowed.has("beans") || allowed.has("chickpeas"))) add("legumes","Hummus with cucumber sticks","5–8g","2–3 tablespoons hummus with cucumber and carrot sticks.");
      else if (cat === "tofu" && allowed.has("tofu")) add("tofu","Tofu cucumber bites","10–16g","Small portion tofu-style protein with cucumber, tomato, lemon and herbs.");
      else if (cat === "protein_powder" && allowed.has("protein_powder")) add("protein_powder","Protein shake","20–25g","Use if protein is difficult to reach from meals.");
    });

    return opts;
  }

  function makeSnacks(input, gate, breakfasts) {
    const opts = snackOptions(input, gate);
    const out = [];
    const typeCounts = {};
    const nameCounts = {};

    for (let day=0; day<7; day++) {
      const bfType = breakfasts[day]?.type || "none";
      const chosen = [];

      for (let slot=0; slot<2; slot++) {
        let best = null;
        let bestScore = Infinity;

        opts.forEach((o, idx) => {
          if (chosen.some(c => c.name === o.name)) return;

          let score = idx + (typeCounts[o.type] || 0)*5 + (nameCounts[o.name] || 0)*6;

          // hard same-day clash avoidance when alternatives exist
          const alternatives = opts.filter(x => x.type !== bfType && !chosen.some(c => c.name === x.name));
          if (["eggs","dairy","protein_powder"].includes(bfType) && o.type === bfType && alternatives.length) score += 1000;

          if (score < bestScore) { best = o; bestScore = score; }
        });

        if (!best) best = opts[slot % opts.length];
        chosen.push(best);
        typeCounts[best.type] = (typeCounts[best.type] || 0) + 1;
        nameCounts[best.name] = (nameCounts[best.name] || 0) + 1;
      }

      out.push(chosen.map(stripType));
    }

    return out;
  }

  function generatePlan(raw) {
    const input = normalizeInput(raw);
    const gate = gateCheck(input);

    if (gate.status === "BLOCKED") {
      return { ok:false, status:"BLOCKED", version:VERSION, gate, messages:gate.messages, days:[] };
    }

    const breakfastsRaw = makeBreakfasts(input, gate);
    const snacks = makeSnacks(input, gate, breakfastsRaw);
    const dinners = makeDinners(input, gate);
    const lunches = input.leftoverLunches ? makeLeftoverLunches(input, dinners) : makeStandaloneLunches(input, gate, dinners);

    const days = Array.from({length:7}, (_, i) => ({
      day: i+1,
      breakfast: stripType(breakfastsRaw[i]),
      morningSnack: snacks[i][0],
      lunch: lunches[i],
      afternoonSnack: snacks[i][1],
      dinner: dinners[i],
      leftoverInstruction: input.leftoverLunches
        ? "Cook extra protein, sauce and vegetables for tomorrow's lunch. Keep any starch separate."
        : "Lunches are standalone and use no added starch."
    }));

    const qa = validatePlan(input, gate, days);
    return { ok: qa.status === "PASS", status:"ALLOWED", version:VERSION, gate, qa, days, markdown: renderMarkdown(input, gate, days, qa) };
  }

  function makeDinners(input, gate) {
    const t = dinnerTemplates(input, gate);
    return Array.from({length:7}, (_, day) => {
      const template = t[day % t.length];
      const st = chooseStarch(input, template.pref, day);
      return {
        name: normalizeMealName(template.name.replace("{starch}", STARCH[st] || "no added starch")),
        protein: template.protein,
        detail: template.detail(st, day),
        cat: template.cat,
        starch: st
      };
    });
  }

  function makeStandaloneLunches(input, gate, dinners) {
    const t = lunchTemplates(input, gate);
    const catCounts = {};

    return Array.from({length:7}, (_, day) => {
      const dinnerCat = dinners && dinners[day] ? dinners[day].cat : null;
      let candidates = t.slice();

      // Avoid lunch and dinner using the same main protein on the same day when alternatives exist.
      const nonMatching = candidates.filter(x => x.cat !== dinnerCat);
      if (nonMatching.length) candidates = nonMatching;

      candidates.sort((a, b) => {
        const ac = catCounts[a.cat] || 0;
        const bc = catCounts[b.cat] || 0;
        if (ac !== bc) return ac - bc;
        return t.indexOf(a) - t.indexOf(b);
      });

      const template = candidates[0] || t[day % t.length];
      catCounts[template.cat] = (catCounts[template.cat] || 0) + 1;

      return {
        name: normalizeMealName(template.name),
        protein: template.protein,
        detail: template.detail(day),
        cat: template.cat
      };
    });
  }

  function makeLeftoverLunches(input, dinners) {
    return dinners.map((d, idx) => ({
      name: normalizeMealName(`${d.catLabel || titleCase(d.cat)} vegetable lunch bowl`),
      protein: d.protein,
      cat: d.cat,
      detail: `Use extra ${humanProtein(d.cat)} with sauce and vegetables from a previous meal. Serve with extra vegetables such as ${pickVeg(input, idx, 5)}. No added starch.`
    }));
  }

  function validatePlan(input, gate, days) {
    // Built-in QA now mirrors locked business rules.
    const hard = [];
    const warn = [];
    const text = JSON.stringify(days).toLowerCase();

    if (!input.proteins.includes("chicken") && hasWord(text, "chicken")) {
      hard.push("Chicken appears despite chicken not being selected.");
    }

    days.forEach(day => {
      const b = mealText(day.breakfast);
      if (/\b(butternut|green beans|cauliflower|broccoli|cabbage|lettuce)\b/.test(b)) {
        hard.push(`Day ${day.day} breakfast uses non-breakfast vegetables.`);
      }
      const am = mealText(day.morningSnack);
      const pm = mealText(day.afternoonSnack);
      const l = mealText(day.lunch);
      const d = mealText(day.dinner);
      const all = `${b} ${am} ${pm} ${l} ${d}`;

      if ((/\b(fish|hake|cod|tuna|salmon)\b/.test(d)) && /\bcurry\b/.test(d)) hard.push(`Day ${day.day}: fish curry appears.`);
      if (input.region !== "SA" && /\bhake\b/.test(all)) hard.push(`Day ${day.day}: hake appears outside SA.`);
      if (!input.leftoverLunches && (/\bleftover\b/.test(l) || l.includes("last night") || l.includes("use the leftover"))) hard.push(`Day ${day.day}: forced leftover lunch.`);
      if (/\bremove\b|\bremoved\b/.test(l)) hard.push(`Day ${day.day}: remove-starch wording.`);
      if (!input.leftoverLunches && !l.includes("no added starch") && !l.includes("no added rice, pasta or potato")) hard.push(`Day ${day.day}: lunch missing no added starch wording.`);

      const eggBreakfast = /\begg\b|\beggs\b|omelette|frittata/.test(b);
      const eggSnack = /\begg\b|\beggs\b|boiled egg/.test(am) || /\begg\b|\beggs\b|boiled egg/.test(pm);
      const yoghurtBreakfast = /yoghurt|yogurt/.test(b);
      const yoghurtSnack = /yoghurt|yogurt/.test(am) || /yoghurt|yogurt/.test(pm);
      const shakeBreakfast = b.includes("protein shake");
      const shakeSnack = am.includes("protein shake") || pm.includes("protein shake");

      if (eggBreakfast && eggSnack && gate.snackCategories.some(x => x !== "eggs")) hard.push(`Day ${day.day}: egg breakfast and egg snack same day.`);
      if (yoghurtBreakfast && yoghurtSnack && gate.snackCategories.some(x => x !== "dairy")) hard.push(`Day ${day.day}: yoghurt breakfast and yoghurt snack same day.`);
      if (shakeBreakfast && shakeSnack && gate.snackCategories.some(x => x !== "protein_powder")) hard.push(`Day ${day.day}: protein shake breakfast and shake snack same day.`);

      const legumeBreakfastCheck = b.replace(/green beans/g, "greenbeans");
      if (/\b(lentil|lentils|bean|beans|chickpea|chickpeas)\b/.test(legumeBreakfastCheck) && !b.includes("hummus")) hard.push(`Day ${day.day}: legume breakfast outside hummus.`);
      if (b.includes("hummus") && !input.breakfastItems.includes("hummus_plate")) hard.push(`Day ${day.day}: hummus breakfast without selection.`);
      if (b.includes("tofu") && !input.breakfastItems.includes("tofu_scramble")) hard.push(`Day ${day.day}: tofu breakfast without selection.`);
      if (/\b(chicken|beef|pork|fish|tuna|hake|cod|jerky|biltong)\b/.test(b)) hard.push(`Day ${day.day}: meat/fish breakfast.`);

      if (/optional protein shake/.test(all)) hard.push(`Day ${day.day}: optional protein shake wording.`);
      if (/selected protein|selected fish/.test(all)) hard.push(`Day ${day.day}: selected-protein wording.`);
      if (/mixed vegetables/.test(all)) hard.push(`Day ${day.day}: mixed vegetables wording.`);
      if (/\bcorn\b/.test(all)) warn.push(`Day ${day.day}: corn appears.`);
    });

    if (input.diet === "vegetarian" && /\b(chicken|beef|pork|fish|tuna|hake|cod|biltong|jerky)\b/.test(text)) hard.push("Meat/fish appears in vegetarian plan.");
    if (input.diet === "pescatarian" && /\b(chicken|beef|pork|biltong|jerky)\b/.test(text)) hard.push("Chicken/red meat appears in pescatarian plan.");

    const ex = new Set(input.exclusions);
    if (ex.has("no_dairy") && /yoghurt|yogurt|cottage cheese|cheese|milk/.test(text)) hard.push("Dairy appears despite no-dairy.");
    if (ex.has("no_eggs") && /\begg\b|\beggs\b|omelette|frittata/.test(text)) hard.push("Egg appears despite no-eggs.");
    if (ex.has("no_red_meat") && /\bbeef\b|\bpork\b|biltong|jerky/.test(text)) hard.push("Red meat appears despite no-red-meat.");

    if ((input.region === "US" || input.region === "CA") && (hasWord(text, "hake") || text.includes("baby marrow") || hasWord(text, "biltong") || hasWord(text, "yoghurt"))) hard.push("US/CA region wording error.");
    if (input.region === "UK" && (hasWord(text, "zucchini") || hasWord(text, "yogurt") || text.includes("baby marrow") || hasWord(text, "biltong") || hasWord(text, "hake"))) hard.push("UK region wording error.");
    if (input.region === "SA" && (hasWord(text, "zucchini") || hasWord(text, "yogurt") || hasWord(text, "clementine"))) hard.push("SA region wording error.");

    const dinnerNames = new Set(days.map(d => d.dinner.name.toLowerCase()));
    const dinnerCats = new Set(days.map(d => d.dinner.cat));
    const snackCats = new Set(days.flatMap(d => [classifySnack(d.morningSnack), classifySnack(d.afternoonSnack)]));

    if (dinnerNames.size < 4) hard.push("Plan: fewer than 4 distinct dinner templates.");
    if (dinnerCats.size < 2) hard.push("Plan: fewer than 2 dinner protein categories.");
    if (snackCats.size < 2) hard.push("Plan: fewer than 2 snack protein categories.");

    return {
      status: hard.length ? "FAIL" : (warn.length ? "CONDITIONAL PASS" : "PASS"),
      hard,
      warn,
      dinnerMix: count(days.map(d => d.dinner.cat)),
      snackMix: count(days.flatMap(d => [classifySnack(d.morningSnack), classifySnack(d.afternoonSnack)])),
      breakfastMix: count(days.map(d => classifyBreakfast(d.breakfast)))
    };
  }

  function renderMarkdown(input, gate, days, qa) {
    const lines = [];
    lines.push("# 7-Day Hearty Meal Plan", "");
    lines.push(`Region: ${REGION[input.region].label}`);
    lines.push(`Diet: ${input.diet}`);
    lines.push(`QA: ${qa.status}`, "");
    lines.push("> Snacks are optional. Use them only if needed to reach protein or if appetite is low.", "");
    days.forEach(day => {
      lines.push(`## Day ${day.day}`, "");
      lines.push(formatMeal("Breakfast", day.breakfast));
      lines.push(formatMeal(input.noBreakfast ? "Morning snack / protein anchor" : "Morning snack", day.morningSnack));
      lines.push(formatMeal("Lunch", day.lunch));
      lines.push(formatMeal("Afternoon snack", day.afternoonSnack));
      lines.push(formatMeal("Dinner", day.dinner));
      lines.push(day.leftoverInstruction, "");
    });
    return lines.join("\n");
  }

  function formatMeal(label, meal) {
    return `**${label}: ${meal.name} — approx. ${meal.protein} protein**\n\nBasic method: ${meal.detail}\n`;
  }

  function mealText(meal) { return `${meal?.name || ""} ${meal?.detail || ""}`.toLowerCase(); }
  function stripType(x) { const y = {...x}; delete y.type; return y; }
  function titleCase(s) {
    const text = String(s || "");
    if (text === "white fish") return "White fish";
    if (text === "lean ground beef") return "Lean ground beef";
    if (text === "lean beef mince") return "Lean beef mince";
    return text.replace(/\b\w/g, c => c.toUpperCase());
  }
  function humanProtein(cat) {
    return ({chicken:"chicken", beef:"lean beef", fish:"fish", eggs:"eggs", tofu:"tofu-style protein", lentils:"lentils", beans:"beans", chickpeas:"chickpeas", pork:"lean pork"})[cat] || cat;
  }
  function classifyBreakfast(meal) {
    const t = mealText(meal);
    if (t.includes("not planned")) return "none";
    if (t.includes("egg")) return "eggs";
    if (/yoghurt|yogurt|cottage cheese|oats/.test(t)) return "dairy";
    if (t.includes("protein shake")) return "protein_powder";
    if (t.includes("tofu")) return "tofu";
    if (t.includes("hummus")) return "hummus";
    return "other";
  }
  function classifySnack(meal) {
    const t = mealText(meal);
    if (/yoghurt|yogurt|cottage cheese/.test(t)) return "dairy";
    if (t.includes("egg")) return "eggs";
    if (t.includes("chicken")) return "chicken";
    if (t.includes("tuna") || t.includes("fish")) return "fish";
    if (t.includes("hummus") || t.includes("chickpea")) return "legumes";
    if (t.includes("tofu")) return "tofu";
    if (t.includes("protein shake")) return "protein_powder";
    if (/biltong|jerky|meat strips/.test(t)) return "beef";
    return "other";
  }
  function hasWord(text, word) { return new RegExp("\\b" + String(word).replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&") + "\\b", "i").test(text); }
  function count(xs) { return xs.reduce((a,x) => { a[x] = (a[x] || 0) + 1; return a; }, {}); }

  const REGION_OPTIONS = [
    { value:"US", label:"United States" },
    { value:"SA", label:"South Africa" },
    { value:"UK", label:"United Kingdom" },
    { value:"AU", label:"Australia" },
    { value:"CA", label:"Canada" }
  ];

  return {
    VERSION,
    REGION_OPTIONS,
    generatePlan,
    gateCheck,
    validatePlan,
    normalizeInput
  };
});
