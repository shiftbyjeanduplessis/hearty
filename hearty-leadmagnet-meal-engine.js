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

  const VERSION = "3.9.4-leadmagnet-v26-cucumber-cleanup";
  const ENGINE_SOURCE = "rebuilt-funnel-engine-v394-v26-cucumber-cleanup";

  const REGION = {
    US: { label:"United States", yoghurt:"yogurt", stock:"broth", fish:"white fish", mince:"lean ground beef", dried:"beef jerky",
      defaultVeg:["spinach","tomato","onion","carrot","zucchini","green beans","mushrooms","peppers","broccoli","lettuce"] },
    SA: { label:"South Africa", yoghurt:"yoghurt", stock:"stock", fish:"hake", mince:"lean beef mince", dried:"biltong",
      defaultVeg:["spinach","tomato","onion","carrot","baby marrow","green beans","mushrooms","peppers","broccoli","lettuce"] },
    UK: { label:"United Kingdom", yoghurt:"yoghurt", stock:"stock", fish:"cod", mince:"lean beef mince", dried:"lean cooked meat strips",
      defaultVeg:["spinach","tomato","onion","carrot","courgette","green beans","mushrooms","peppers","broccoli","lettuce"] },
    AU: { label:"Australia", yoghurt:"yoghurt", stock:"stock", fish:"white fish", mince:"lean beef mince", dried:"lean beef jerky",
      defaultVeg:["spinach","tomato","onion","carrot","zucchini","green beans","mushrooms","peppers","broccoli","lettuce"] },
    CA: { label:"Canada", yoghurt:"yogurt", stock:"broth", fish:"white fish", mince:"lean ground beef", dried:"beef jerky",
      defaultVeg:["spinach","tomato","onion","carrot","zucchini","green beans","mushrooms","peppers","broccoli","lettuce"] }
  };

  const STARCH = {
    rice:"rice", pasta:"pasta", couscous:"couscous", sweet_potato:"sweet potato", potato:"potato", wrap:"small wrap"
  };

  const BAD_CORE_VEG = new Set(["corn","peas","mixed vegetables","mixed veg"]);
  const MAIN = new Set(["chicken","turkey","beef","pork","fish","eggs","tofu","lentils","beans","chickpeas"]);
  const BF = {
    eggs:"eggs", yoghurt:"dairy", yogurt:"dairy", greek_yoghurt:"dairy", greek_yogurt:"dairy",
    cottage_cheese:"dairy", oats:"dairy", oats_with_yoghurt:"dairy", oats_with_yogurt:"dairy",
    protein_shake:"protein_powder", tofu_scramble:"tofu", hummus_plate:"legumes"
  };
  const SN = {
    yoghurt:"dairy", yogurt:"dairy", cottage_cheese:"dairy", boiled_eggs:"eggs",
    biltong:"beef", jerky:"beef", dried_meat:"beef", chicken_strips:"chicken", turkey_strips:"turkey",
    tuna:"fish", fish:"fish", hummus:"legumes", roasted_chickpeas:"legumes",
    tofu_bites:"tofu", tofu:"tofu", protein_shake:"protein_powder",
    fruit:"fruit", rice_cakes:"light", wholegrain_crackers:"light"
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
      leftoverLunches: Boolean(input.leftoverLunches || input.useLeftovers),
      planTier: Number(input.planTier || input.tier || input.targets?.tier || 2),
      targets: input.targets || null
    };
  }

  function allowedProteins(input) {
    const p = new Set(input.proteins);
    const ex = new Set(input.exclusions);

    if (input.diet === "vegetarian") ["chicken","turkey","beef","pork","fish"].forEach(x => p.delete(x));
    if (input.diet === "pescatarian") ["chicken","turkey","beef","pork"].forEach(x => p.delete(x));

    if (ex.has("no_dairy")) p.delete("dairy");
    if (ex.has("no_eggs")) p.delete("eggs");
    if (ex.has("no_fish")) p.delete("fish");
    if (ex.has("no_chicken")) p.delete("chicken");
    if (ex.has("no_turkey")) p.delete("turkey");
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
    if (snCats.length < 3) {
      failures.push("snack_protein_minimum");
      messages.push("Please choose at least 3 snack options so your 7-day plan does not repeat the same snack too often.");
    }

    if (!input.noBreakfast) {
      ["eggs","dairy","protein_powder"].forEach(cat => {
        if (bfCats.includes(cat)) {
          const alternatives = snCats.filter(x => x !== cat);
          if (alternatives.length < 2) {
            failures.push(`snack_variety_for_${cat}_breakfast`);
            const label = cat === "protein_powder" ? "protein shake" : cat === "dairy" ? "yoghurt/dairy" : "egg";
            messages.push(`Because you selected a ${label} breakfast, please choose at least 2 snack options that are not ${label}-based.`);
          }
        }
      });
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

  function pickVeg(input, start, count, exclude) {
    const banned = new Set((exclude || []).map(x => x.toLowerCase()));
    const pool = input.vegetables.filter(v => !banned.has(v.toLowerCase()));
    const source = pool.length ? pool : input.vegetables;
    const out = [];
    let i = 0;
    while (out.length < count && i < source.length * 2) {
      const v = source[(start + i) % source.length];
      if (!out.includes(v)) out.push(v);
      i++;
    }
    return out.join(", ");
  }

  function vegContextSet(region, context) {
    const z = region === "UK" ? "courgette" : region === "SA" ? "baby marrow" : "zucchini";
    const common = {
      cold: ["tomato","lettuce","peppers","carrot","spinach"],
      cooked: ["tomato","onion","carrot",z,"green beans","mushrooms","cauliflower","broccoli","cabbage","spinach","peppers","butternut"],
      soup: ["tomato","onion","carrot",z,"green beans","mushrooms","cauliflower","broccoli","cabbage","spinach","peppers","butternut"],
      stirfry: ["onion","carrot",z,"green beans","mushrooms","peppers","cabbage","spinach","broccoli"],
      curry: ["onion","tomato","carrot",z,"green beans","mushrooms","cauliflower","spinach","peppers","butternut"],
      side: ["carrot",z,"green beans","mushrooms","cauliflower","broccoli","cabbage","spinach","peppers","butternut"],
      egg: ["tomato","spinach","mushrooms","peppers","onion",z]
    };
    return new Set(common[context] || common.cooked);
  }

  function pickVegContext(input, context, start, count, exclude) {
    const allowed = vegContextSet(input.region, context);
    const banned = new Set((exclude || []).map(x => String(x).toLowerCase()));
    const selected = input.vegetables.filter(v => allowed.has(String(v).toLowerCase()) && !banned.has(String(v).toLowerCase()));
    const fallback = Array.from(allowed).filter(v => !banned.has(String(v).toLowerCase()));
    const source = selected.length ? selected : fallback;
    const out = [];
    let i = 0;
    while (out.length < count && i < source.length * 2) {
      const v = source[(start + i) % source.length];
      if (!out.includes(v)) out.push(v);
      i++;
    }
    return out.join(", ");
  }

  function sidePhrase(input, start, count) {
    return `a side of ${pickVegContext(input, "side", start, count)}`;
  }

  function coldPlateVeg(input, start, count, exclude) {
    const defaultExclude = ["cucumber","tomato","lettuce"];
    return pickVegContext(input, "cold", start, count, exclude || defaultExclude);
  }

  function pickBreakfastVeg(input, start, count) {
    const friendly = new Set(["tomato","spinach","mushrooms","peppers","onion","zucchini","courgette","baby marrow"]);
    const pool = input.vegetables.filter(v => friendly.has(String(v).toLowerCase()));
    const fallback = input.region === "UK"
      ? ["tomato","spinach","mushrooms","peppers","onion","courgette"]
      : input.region === "SA"
        ? ["tomato","spinach","mushrooms","peppers","onion","baby marrow"]
        : ["tomato","spinach","mushrooms","peppers","onion","zucchini"];
    const source = pool.length ? pool : fallback;
    const out = [];
    let i = 0;
    while (out.length < count && i < source.length * 2) {
      const v = source[(start + i) % source.length];
      if (!out.includes(v)) out.push(v);
      i++;
    }
    return out.join(", ");
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
          ? `120–150g chicken cooked with onion, garlic, ginger, tomato, curry spices, ${pickVegContext(input,"curry",i,3,["onion","tomato"])} and ${r.stock}. Serve with ${starchAmount(st)}.`
          : `120–150g chicken cooked with onion, garlic, ginger, tomato, curry spices and ${pickVegContext(input,"curry",i,5,["onion","tomato"])}. No added starch.`);
      add("chicken","Chicken stir-fry with low-calorie sauce and {starch}","32–38g","rice",
        (st,i) => st !== "none"
          ? `120–150g chicken strips stir-fried with ${pickVegContext(input,"stirfry",i,5)}. Sauce: garlic, lemon/vinegar, water and pepper. Serve with ${starchAmount(st)}.`
          : `120–150g chicken strips stir-fried with ${pickVegContext(input,"stirfry",i,5)} and garlic-lemon sauce. No added starch.`);
      add("chicken","Chicken tomato stew with {starch}","32–38g","rice",
        (st,i) => st !== "none"
          ? `120–150g chicken simmered with tomato, onion, garlic, ${pickVegContext(input,"soup",i,4,["onion","tomato"])}, herbs and ${r.stock} until saucy. Serve with ${starchAmount(st)}.`
          : `120–150g chicken simmered with tomato, onion, garlic, ${pickVegContext(input,"soup",i,5,["onion","tomato"])}, herbs and ${r.stock}. No added starch.`);
    }

    if (main.has("turkey")) {
      add("turkey","Turkey chilli bowl with {starch}","32–38g","rice",
        (st,i) => st !== "none"
          ? `120–150g lean turkey mince cooked with tomato, onion, mild spices, ${pickVegContext(input,"cooked",i,4,["onion","tomato"])} and ${r.stock}. Serve with ${starchAmount(st)}.`
          : `120–150g lean turkey mince cooked with tomato, onion, mild spices and ${pickVegContext(input,"cooked",i,5,["onion","tomato"])}. No added starch.`);
      add("turkey","Turkey tomato stew with {starch}","32–38g","rice",
        (st,i) => st !== "none"
          ? `120–150g turkey pieces or lean turkey mince simmered with tomato, onion, garlic, ${pickVegContext(input,"soup",i,4,["onion","tomato"])}, herbs and ${r.stock}. Serve with ${starchAmount(st)}.`
          : `120–150g turkey pieces or lean turkey mince simmered with tomato, onion, garlic, ${pickVegContext(input,"soup",i,5,["onion","tomato"])}, herbs and ${r.stock}. No added starch.`);
    }

    if (main.has("beef")) {
      add("beef",`${capFirst(r.mince)} bolognese with {starch}`,"32–38g","pasta",
        (st,i) => st !== "none"
          ? `120–150g ${r.mince} cooked with onion, garlic, chopped tomato, grated carrot, mushrooms and Italian herbs. Serve with ${starchAmount(st)} and ${sidePhrase(input,i,3)}.`
          : `120–150g ${r.mince} cooked with onion, garlic, tomato, carrot, mushrooms and herbs. Serve with ${sidePhrase(input,i,5)}. No added starch.`);
      add("beef","Lean beef stew with {starch}","32–38g","rice",
        (st,i) => st !== "none"
          ? `120–150g lean beef cooked with tomato, onion, ${pickVegContext(input,"soup",i,4,["onion","tomato"])}, ${r.stock}, herbs and pepper. Serve with ${starchAmount(st)}.`
          : `120–150g lean beef cooked with tomato, onion, ${pickVegContext(input,"soup",i,5,["onion","tomato"])}, ${r.stock}, herbs and pepper. No added starch.`);
    }

    if (main.has("pork")) {
      add("pork","Lean pork stir-fry with sweet-and-sour sauce and {starch}","30–36g","rice",
        (st,i) => st !== "none"
          ? `120–150g lean pork strips stir-fried with ${pickVegContext(input,"stirfry",i,5)}. Sauce: garlic, ginger, vinegar/lemon, tomato paste, water and a small amount of sweetener. Serve with ${starchAmount(st)}.`
          : `120–150g lean pork strips stir-fried with ${pickVegContext(input,"stirfry",i,5)} and low-calorie sweet-and-sour sauce. No added starch.`);
    }

    if (main.has("fish")) {
      add("fish",`${capFirst(r.fish)} lemon-herb plate with {starch}`,"30–36g","rice",
        (st,i) => st !== "none"
          ? `150g ${r.fish} cooked with lemon, herbs, garlic and pepper. Serve with ${sidePhrase(input,i,5)} and ${starchAmount(st)}.`
          : `150g ${r.fish} cooked with lemon, herbs, garlic and pepper. Serve with ${sidePhrase(input,i,5)}. No added starch.`);
      add("fish",`Grilled ${r.fish} plate with {starch}`,"30–36g","rice",
        (st,i) => st !== "none"
          ? `150g ${r.fish} grilled with lemon, herbs and pepper. Serve with ${sidePhrase(input,i,5)} and ${starchAmount(st)}.`
          : `150g ${r.fish} grilled with lemon, herbs and pepper. Serve with ${sidePhrase(input,i,5)}. No added starch.`);
      add("fish","Baked fish with vegetables and {starch}","30–36g","sweet_potato",
        (st,i) => st !== "none"
          ? `150g ${r.fish} baked with lemon, herbs and black pepper. Serve with ${sidePhrase(input,i,5)} and ${starchAmount(st)}.`
          : `150g ${r.fish} baked with lemon, herbs and black pepper. Serve with ${sidePhrase(input,i,5)}. No added starch.`);
      add("fish","Homemade fish cakes with vegetables and {starch}","28–36g","sweet_potato",
        (st,i) => st !== "none"
          ? `150g cooked ${r.fish} mixed with onion, herbs, lemon, pepper and a small amount of crumbs/oat flour to bind. Pan-sear and serve with ${sidePhrase(input,i,4)} and ${starchAmount(st)}.`
          : `150g cooked ${r.fish} mixed with onion, herbs, lemon, pepper and a small amount of crumbs/oat flour to bind. Pan-sear and serve with ${sidePhrase(input,i,5)}. No added starch.`);
    }

    if (main.has("eggs")) {
      add("eggs","Egg and vegetable frittata with {starch}","20–28g","sweet_potato",
        (st,i) => st !== "none"
          ? `2–3 eggs cooked with ${pickVegContext(input,"egg",i,5)} and herbs. Serve with ${starchAmount(st)}.`
          : `2–3 eggs cooked with ${pickVegContext(input,"egg",i,5)} and herbs. No added starch.`);
    }

    if (main.has("tofu")) {
      add("tofu","Tofu-style stir-fry with {starch}","24–34g","rice",
        (st,i) => st !== "none"
          ? `Tofu-style protein stir-fried with ${pickVegContext(input,"stirfry",i,5)} and garlic-ginger sauce. Serve with ${starchAmount(st)}.`
          : `Tofu-style protein stir-fried with ${pickVegContext(input,"stirfry",i,5)} and garlic-ginger sauce. No added starch.`);
      add("tofu","Tofu tomato bake with {starch}","24–34g","couscous",
        (st,i) => st !== "none"
          ? `Tofu-style protein baked or simmered in tomato, onion, garlic, ${pickVegContext(input,"cooked",i,4,["onion","tomato"])} and herbs. Serve with ${starchAmount(st)}.`
          : `Tofu-style protein baked or simmered in tomato, onion, garlic, ${pickVegContext(input,"cooked",i,5,["onion","tomato"])} and herbs. No added starch.`);
    }

    if (main.has("lentils")) {
      add("lentils","Lentil bolognese with {starch}","18–28g","pasta",
        (st,i) => st !== "none"
          ? `Lentils cooked with onion, garlic, chopped tomato, carrot, mushrooms and Italian herbs. Serve with ${starchAmount(st)} and ${sidePhrase(input,i,3)}.`
          : `Lentils cooked with onion, garlic, tomato, carrot, mushrooms and herbs. Serve with ${sidePhrase(input,i,5)}. No added starch.`);
      add("lentils","Lentil and vegetable stew with {starch}","18–28g","sweet_potato",
        (st,i) => st !== "none"
          ? `Lentils simmered with tomato, onion, ${pickVegContext(input,"soup",i,4,["onion","tomato"])}, herbs and ${r.stock}. Serve with ${starchAmount(st)}.`
          : `Lentils simmered with tomato, onion, ${pickVegContext(input,"soup",i,5,["onion","tomato"])}, herbs and ${r.stock}. No added starch.`);
    }

    if (main.has("beans")) {
      add("beans","Bean and vegetable chilli with {starch}","18–28g","rice",
        (st,i) => st !== "none"
          ? `Beans cooked with tomato, onion, mild spices, herbs and ${pickVegContext(input,"cooked",i,4,["onion","tomato"])}. Serve with ${starchAmount(st)}.`
          : `Beans cooked with tomato, onion, mild spices, herbs and ${pickVegContext(input,"cooked",i,5,["onion","tomato"])}. No added starch.`);
    }

    if (main.has("chickpeas")) {
      add("chickpeas","Chickpea and vegetable stew with {starch}","18–28g","rice",
        (st,i) => st !== "none"
          ? `Chickpeas simmered with onion, garlic, tomato, herbs and ${pickVegContext(input,"cooked",i,4,["onion","tomato"])}. Serve with ${starchAmount(st)}. Chickpeas stay in the meal because they are the protein source.`
          : `Chickpeas simmered with onion, garlic, tomato, herbs and ${pickVegContext(input,"cooked",i,5,["onion","tomato"])}. No added starch. Chickpeas stay in the meal because they are the protein source.`);
    }

    return t;
  }

  function lunchTemplates(input, gate) {
    const r = REGION[input.region];
    const main = new Set(gate.mainMealProteins);
    const t = [];
    const add = (cat, name, protein, detail) => t.push({cat, name, protein, detail});

    if (main.has("chicken")) {
      add("chicken","Chicken vegetable soup bowl","30–35g", i => `120–150g cooked chicken simmered with ${pickVegContext(input,"soup",i,5)} and ${r.stock}. No added starch.`);
      add("chicken","Chicken salad plate","25–35g", i => `120–150g cooked chicken served as a cold plate with lettuce, tomato, lemon-herb dressing and ${coldPlateVeg(input,i,3)}. No added starch.`);
    }
    if (main.has("turkey")) {
      add("turkey","Turkey salad plate","25–35g", i => `120–150g cooked turkey served as a cold plate with lettuce, tomato, lemon-herb dressing and ${coldPlateVeg(input,i,3)}. No added starch.`);
      add("turkey","Turkey vegetable soup bowl","30–35g", i => `120–150g cooked turkey simmered with ${pickVegContext(input,"soup",i,5)} and ${r.stock}. No added starch.`);
    }
    if (main.has("beef")) {
      add("beef",`${capFirst(r.mince)} vegetable bowl`,"30–35g", i => `120–150g ${r.mince} cooked with tomato, onion, garlic, herbs and ${pickVegContext(input,"cooked",i,4,["tomato","onion"])}. No added starch.`);
    }
    if (main.has("pork")) {
      add("pork","Lean pork vegetable bowl","25–35g", i => `120–150g lean pork strips cooked with tomato, onion, garlic, herbs and ${pickVegContext(input,"cooked",i,4,["tomato","onion"])}. No added starch.`);
    }
    if (main.has("fish")) {
      add("fish","Tuna salad bowl","20–30g", i => `Tuna with lettuce, tomato, lemon, herbs and ${coldPlateVeg(input,i,3)}. No added starch.`);
      add("fish",`${capFirst(r.fish)} vegetable plate`,"25–35g", i => `${capFirst(r.fish)} with lemon-herb dressing and ${sidePhrase(input,i,5)}. No added starch.`);
      add("fish",`${capFirst(r.fish)} vegetable soup bowl`,"25–35g", i => `${capFirst(r.fish)} simmered gently with ${pickVegContext(input,"soup",i,5)} and ${r.stock}. No added starch.`);
      add("fish",`${capFirst(r.fish)} salad plate`,"25–35g", i => `${capFirst(r.fish)} served with lettuce, tomato, lemon, herbs and ${coldPlateVeg(input,i,3)}. No added starch.`);
    }
    if (main.has("eggs")) {
      add("eggs","Boiled egg vegetable plate","14–22g", i => `2 boiled eggs with lettuce, tomato and ${coldPlateVeg(input,i,3)}. No added starch.`);
      add("eggs","Egg salad bowl","14–22g", i => `2 boiled eggs served with tomato, peppers, herbs and ${coldPlateVeg(input,i,2)}. No added starch.`);
    }
    if (gate.allowed.includes("dairy")) {
      add("dairy","Cottage cheese protein plate","18–25g", i => `Cottage cheese served with tomato, lettuce, herbs and ${coldPlateVeg(input,i,3)}. No added starch.`);
      add("dairy","Cottage cheese herb bowl","18–25g", i => `Cottage cheese served as a light bowl with tomato, peppers, herbs and ${coldPlateVeg(input,i,2)}. No added starch.`);
    }
    if (main.has("tofu")) {
      add("tofu","Tofu vegetable bowl","20–30g", i => `Tofu-style protein with tomato, lettuce, lemon-herb dressing and ${coldPlateVeg(input,i,3)}. No added starch.`);
    }
    if (main.has("lentils")) {
      add("lentils","Lentil vegetable soup bowl","18–28g", i => `Lentils simmered with ${pickVegContext(input,"soup",i,5)} and ${r.stock}. No added starch. Lentils stay in the meal because they are the protein source.`);
    }
    if (main.has("beans")) {
      add("beans","Bean chilli vegetable bowl","18–28g", i => `Beans cooked with tomato, onion, mild spices and ${pickVegContext(input,"cooked",i,4,["tomato","onion"])}. No added starch. Beans stay in the meal because they are the protein source.`);
    }
    if (main.has("chickpeas")) {
      add("chickpeas","Chickpea vegetable bowl","18–28g", i => `Chickpeas with tomato, lettuce, herbs and ${coldPlateVeg(input,i,3)}. No added starch. Chickpeas stay in the meal because they are the protein source.`);
    }

    return t;
  }

  function makeBreakfasts(input, gate) {
    const r = REGION[input.region];

    if (input.noBreakfast) {
      return Array.from({length:7}, () => ({name:"No breakfast planned", protein:"0g", detail:"You said you do not prefer breakfast, so the morning snack becomes your first protein anchor.", type:"none"}));
    }

    const allowed = new Set(gate.allowed);
    const opts = [];
    const add = (type, name, protein, detail) => opts.push({type, name, protein, detail});

    input.breakfastItems.forEach(item => {
      if (item === "eggs" && allowed.has("eggs")) {
        add("eggs","Vegetable scrambled eggs","18g",`2 eggs scrambled with ${pickBreakfastVeg(input,0,4)}.`);
        add("eggs","Vegetable omelette","18–22g",`2 eggs cooked with ${pickBreakfastVeg(input,1,4)}.`);
      } else if (["yoghurt","yogurt","greek_yoghurt","greek_yogurt"].includes(item) && allowed.has("dairy")) {
        add("dairy",`High-protein ${r.yoghurt} bowl`,"18–22g",`1 cup Greek-style ${r.yoghurt} with berries or fruit and cinnamon.`);
      } else if (item === "cottage_cheese" && allowed.has("dairy")) {
        add("dairy","Cottage cheese breakfast plate","12–20g","½ cup cottage cheese with tomato and herbs.");
      } else if (["oats","oats_with_yoghurt","oats_with_yogurt"].includes(item) && allowed.has("dairy")) {
        add("dairy",`Oats with ${r.yoghurt}`,"12–20g",`Small portion oats topped with plain ${r.yoghurt}, berries or fruit and cinnamon.`);
      } else if (item === "protein_shake" && allowed.has("protein_powder")) {
        add("protein_powder","Protein shake breakfast","20–25g","Protein shake prepared with water, plus fruit if desired.");
      } else if (item === "tofu_scramble" && allowed.has("tofu")) {
        add("tofu","Tofu scramble","18–24g",`Tofu-style protein cooked with ${pickBreakfastVeg(input,2,4)} and mild spices.`);
      } else if (item === "hummus_plate" && (allowed.has("lentils") || allowed.has("beans") || allowed.has("chickpeas"))) {
        add("hummus","Hummus breakfast plate","5–10g","2–3 tablespoons hummus with tomato and carrot sticks.");
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
        const usedName = names[o.name] || 0;
        const hasUnusedName = opts.some(x => !names[x.name]);
        let score = idx + (counts[o.type] || 0)*10 + usedName*90;
        if (hasUnusedName && usedName > 0) score += 650;
        if (["eggs","dairy"].includes(o.type) && typeCount > 1 && (counts[o.type] || 0) >= 4) score += 140;
        if (o.type === "protein_powder" && typeCount > 1 && (counts[o.type] || 0) >= 2) score += 1200;
        if (day > 0 && out[day-1]?.name === o.name && opts.some(x => x.name !== o.name)) score += 500;
        if (day >= 5 && out[0]?.name === o.name && opts.some(x => x.name !== o.name)) score += 900;
        if (score < bestScore) { best = o; bestScore = score; }
      });
      counts[best.type] = (counts[best.type] || 0) + 1;
      names[best.name] = (names[best.name] || 0) + 1;
      out.push({...best});
    }
    return out;
  }

  function snackOptions(input, gate, day) {
    const r = REGION[input.region];
    const allowed = new Set(gate.allowed);
    const proteinOpts = [];
    const lightOpts = [];
    const seenProtein = new Set();
    const seenLight = new Set();
    const chickenSnackGarnish = ["cherry tomatoes and lemon", "celery sticks and lemon", "carrot sticks and lemon", "pepper strips and lemon"];
    const turkeySnackGarnish  = ["cherry tomatoes and lemon", "celery sticks and lemon", "pepper strips and lemon", "carrot sticks and lemon"];
    const tunaSnackGarnish    = ["cherry tomatoes, lemon and herbs", "celery sticks, lemon and herbs", "pepper strips, lemon and herbs", "carrot sticks, lemon and herbs"];
    const driedMeatGarnish    = ["carrot sticks", "celery sticks", "pepper strips"];
    const garnishIndex = Number(day || 0);
    const add = (type, name, protein, detail) => {
      if (!seenProtein.has(name)) { proteinOpts.push({type, name, protein, detail}); seenProtein.add(name); }
    };
    const addLight = (type, name, protein, detail) => {
      if (!seenLight.has(name)) { lightOpts.push({type, name, protein, detail}); seenLight.add(name); }
    };

    input.snackProteins.forEach(item => {
      const cat = SN[item];
      if (cat === "dairy" && allowed.has("dairy")) add("dairy",`Plain ${r.yoghurt} with berries`,"10–18g",`¾–1 cup plain ${r.yoghurt} with berries or fruit.`);
      else if (cat === "eggs" && allowed.has("eggs")) add("eggs","Boiled egg snack","6–8g","1 boiled egg with tomato or carrot sticks.");
      else if (cat === "chicken" && allowed.has("chicken")) add("chicken","Cooked chicken strips","12–15g",`Small portion cooked chicken strips with ${chickenSnackGarnish[garnishIndex % chickenSnackGarnish.length]}.`);
      else if (cat === "turkey" && allowed.has("turkey")) add("turkey","Cooked turkey strips","12–15g",`Small portion cooked turkey strips with ${turkeySnackGarnish[garnishIndex % turkeySnackGarnish.length]}.`);
      else if (cat === "fish" && allowed.has("fish")) add("fish","Tuna bites","12–18g",`Small portion tuna with ${tunaSnackGarnish[garnishIndex % tunaSnackGarnish.length]}.`);
      else if (cat === "beef" && allowed.has("beef")) add("beef",`${capFirst(r.dried)} snack`,"12–15g",`25–30g ${r.dried} with ${driedMeatGarnish[garnishIndex % driedMeatGarnish.length]}.`);
      else if (cat === "legumes" && (allowed.has("lentils") || allowed.has("beans") || allowed.has("chickpeas"))) add("legumes","Hummus with vegetable sticks","5–8g","2–3 tablespoons hummus with carrot or celery sticks.");
      else if (cat === "tofu" && allowed.has("tofu")) add("tofu","Tofu protein bites","10–16g","Small portion tofu-style protein with tomato, lemon and herbs.");
      else if (cat === "protein_powder" && allowed.has("protein_powder")) add("protein_powder","Protein shake","20–25g","Use if protein is difficult to reach from meals.");
      else if (item === "rice_cakes") addLight("light","Rice cakes with nut butter","3–5g","2 plain rice cakes with a thin spread of peanut or almond butter.");
      else if (item === "wholegrain_crackers") addLight("light","Wholegrain crackers with cottage cheese","8–12g","4–5 wholegrain crackers with a small amount of cottage cheese.");
    });

    return { proteinOpts, lightOpts };
  }

  function fruitSnackOption(input, day) {
    const regionFruit = {
      US: "mandarin",
      SA: "naartjie",
      UK: "clementine",
      AU: "mandarin",
      CA: "clementine"
    };
    const fruit = regionFruit[input.region] || "fruit";
    const opts = [
      { type:"fruit", name:`${capFirst(fruit)} or berries`, protein:"0–2g", detail:`1 small ${fruit} or a small handful of berries.` },
      { type:"fruit", name:"Apple slices", protein:"0–2g", detail:"1 small apple sliced slowly if appetite is low." }
    ];
    return opts[day % opts.length];
  }



  function makeSnacks(input, gate, breakfasts, lunches, dinners) {
    const out = [];
    const typeCounts = {};
    const nameCounts = {};
    let fruitUses = 0;
    let weeklyShakeUses = (breakfasts || []).filter(b => familyCat(b?.type || classifyMealByText(b)) === "protein_powder").length;
    const userWantsFruit = (input.snackProteins || []).includes("fruit");
    const fruitLimit = userWantsFruit ? 3 : 2;

    for (let day=0; day<7; day++) {
      const snackPools = snackOptions(input, gate, day);
      const opts = Array.isArray(snackPools) ? snackPools : (snackPools.proteinOpts || []);
      const lightOpts = Array.isArray(snackPools) ? [] : (snackPools.lightOpts || []);
      const highProteinPlan = Number(input.planTier || 2) >= 3 || Number(input.targets?.proteinMin || 0) >= 105;
      const chosen = [];
      const fixedMeals = [breakfasts?.[day], lunches?.[day], dinners?.[day]].filter(Boolean);
      const fixedCats = fixedMeals.map(m => familyCat(m.type || m.cat || classifyMealByText(m))).filter(Boolean);
      const fixedCatSet = new Set(fixedCats);
      const fixedDairy = fixedCats.filter(x => x === "dairy").length;
      const fixedShake = fixedCats.filter(x => x === "protein_powder").length;
      const baseProtein = fixedMeals.reduce((sum, meal) => sum + proteinMidpoint(meal?.protein), 0);

      for (let slot=0; slot<2; slot++) {
        const chosenCats = chosen.map(m => familyCat(m.type || classifyMealByText(m))).filter(Boolean);
        const chosenCatSet = new Set(chosenCats);
        const currentDairy = fixedDairy + chosenCats.filter(x => x === "dairy").length;
        const currentShake = fixedShake + chosenCats.filter(x => x === "protein_powder").length;
        const weeklyShakeCap = highProteinPlan ? 3 : 2;
        const hasNonShakeAlternative = opts.some(o => familyCat(o.type || classifyMealByText(o)) !== "protein_powder" && proteinMidpoint(o.protein) >= (highProteinPlan ? 10 : 0));

        const alreadyName = (o) => chosen.some(c => c.name === o.name);
        const typeOf = (o) => familyCat(o.type || classifyMealByText(o));
        const dairyCap = (type) => type === "dairy" && currentDairy >= 2;
        const shakeCap = (type) => type === "protein_powder" && currentShake >= 1;
        const sameAsPreviousSnack = (type) => chosenCats.length && chosenCats[chosenCats.length - 1] === type;
        const repeatsFixed = (type) => fixedCatSet.has(type);
        const repeatsChosen = (type) => chosenCatSet.has(type);

        const candidate = (strictness) => opts.filter(o => {
          const type = typeOf(o);
          if (alreadyName(o)) return false;
          if (dairyCap(type) || shakeCap(type)) return false;
          if (type === "protein_powder" && weeklyShakeUses >= weeklyShakeCap && hasNonShakeAlternative) return false;
          if (sameAsPreviousSnack(type)) return false;
          if (strictness >= 2 && repeatsFixed(type)) return false;
          if (strictness >= 1 && repeatsChosen(type)) return false;
          if (highProteinPlan && proteinMidpoint(o.protein) < 10) return false;
          return true;
        });

        let pool = candidate(2);
        if (!pool.length) pool = candidate(1);
        if (!pool.length) pool = opts.filter(o => {
          const type = typeOf(o);
          if (type === "protein_powder" && weeklyShakeUses >= weeklyShakeCap && hasNonShakeAlternative) return false;
          return !alreadyName(o) && !dairyCap(type) && !shakeCap(type) && (!highProteinPlan || proteinMidpoint(o.protein) >= 10);
        });
        if (!pool.length) pool = opts.filter(o => !alreadyName(o));
        if (!pool.length && lightOpts.length) pool = lightOpts.filter(o => !alreadyName(o));

        let best = null;
        let bestScore = Infinity;
        pool.forEach((o, idx) => {
          const type = typeOf(o);
          let score = idx * 0.01 + (typeCounts[type] || 0) * 10 + (nameCounts[o.name] || 0) * 12;
          if (repeatsFixed(type)) score += 260;
          if (repeatsChosen(type)) score += 380;
          if (sameAsPreviousSnack(type)) score += 800;
          if (type === "dairy" && currentDairy >= 1) score += 180;
          if (type === "protein_powder" && currentShake >= 1) score += 900;
          if (type === "protein_powder" && weeklyShakeUses >= weeklyShakeCap && hasNonShakeAlternative) score += 2500;
          if (highProteinPlan) score -= Math.min(proteinMidpoint(o.protein), 25) * 0.28;
          if (score < bestScore) { best = o; bestScore = score; }
        });

        const chosenProtein = chosen.reduce((sum, meal) => sum + proteinMidpoint(meal?.protein), 0);
        const proteinMin = Number(input.targets?.proteinMin || 0);
        const proteinBeforeSlot = baseProtein + chosenProtein;
        const nearProteinTarget = proteinMin ? proteinBeforeSlot >= (proteinMin - 15) : proteinBeforeSlot >= 95;
        const lightPool = lightOpts.filter(o => !alreadyName(o));
        if (slot === 1 && lightPool.length && nearProteinTarget) {
          best = lightPool[(day + slot) % lightPool.length];
        }

        const projectedProtein = baseProtein + chosenProtein + proteinMidpoint(best?.protein);
        const shouldUseFruit =
          fruitUses < fruitLimit &&
          slot === 1 &&
          best &&
          typeOf(best) !== "fruit" &&
          (userWantsFruit || (!highProteinPlan && projectedProtein > 118));

        if (shouldUseFruit) {
          best = fruitSnackOption(input, day);
        }

        if (!best) best = ((userWantsFruit || !highProteinPlan) && fruitUses < fruitLimit) ? fruitSnackOption(input, day) : (opts[slot % Math.max(1, opts.length)] || lightOpts[slot % Math.max(1, lightOpts.length)]);

        chosen.push(best);
        const type = typeOf(best);
        typeCounts[type] = (typeCounts[type] || 0) + 1;
        nameCounts[best.name] = (nameCounts[best.name] || 0) + 1;
        if (type === "fruit") fruitUses += 1;
        if (type === "protein_powder") weeklyShakeUses += 1;
      }

      out.push(chosen.map(stripType));
    }

    return out;
  }

  function classifyMealByText(meal) {
    const t = mealText(meal);
    if (/yoghurt|yogurt|cottage cheese|cheese|milk/.test(t)) return "dairy";
    if (/protein shake|protein powder/.test(t)) return "protein_powder";
    if (/\begg\b|\beggs\b|omelette|frittata/.test(t)) return "eggs";
    if (/chicken/.test(t)) return "chicken";
    if (/turkey/.test(t)) return "turkey";
    if (/tuna|fish|hake|cod|salmon/.test(t)) return "fish";
    if (/beef|jerky|biltong/.test(t)) return "beef";
    if (/pork/.test(t)) return "pork";
    if (/lentil|bean|chickpea|hummus/.test(t)) return "legumes";
    if (/tofu/.test(t)) return "tofu";
    if (/mandarin|berries|apple|fruit|clementine|naartjie/.test(t)) return "fruit";
    return "other";
  }

  function dayFamilyCounts(day) {
    const meals = [day.breakfast, day.morningSnack, day.lunch, day.afternoonSnack, day.dinner].filter(Boolean);
    const cats = meals.map(m => familyCat(m.type || m.cat || classifyMealByText(m))).filter(Boolean);
    return count(cats);
  }

  function generatePlan(raw) {
    const input = normalizeInput(raw);
    const gate = gateCheck(input);

    if (gate.status === "BLOCKED") {
      return { ok:false, status:"BLOCKED", version:VERSION, engineSource:ENGINE_SOURCE, gate, messages:gate.messages, days:[] };
    }

    const breakfastsRaw = makeBreakfasts(input, gate);
    const dinners = makeDinners(input, gate);
    if (input.leftoverLunches && dinners[0]) {
      dinners[0] = {
        ...dinners[0],
        detail: `${dinners[0].detail} Make extra tonight: cook a double portion of the protein and sauce. Refrigerate half separately from the starch — it becomes tomorrow's lunch.`
      };
    }
    const lunches = input.leftoverLunches ? makeLeftoverLunches(input, gate, dinners, breakfastsRaw) : makeStandaloneLunches(input, gate, dinners, breakfastsRaw);
    const snacks = makeSnacks(input, gate, breakfastsRaw, lunches, dinners);

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
    return { ok: qa.status === "PASS", status:"ALLOWED", version:VERSION, engineSource:ENGINE_SOURCE, gate, qa, days, markdown: renderMarkdown(input, gate, days, qa) };
  }


  function proteinMidpoint(value) {
    const nums = String(value || "").match(/\d+/g)?.map(Number) || [];
    if (!nums.length) return 0;
    return nums.length >= 2 ? Math.round((nums[0] + nums[1]) / 2) : nums[0];
  }

  function mealCat(meal) {
    if (!meal) return "";
    return meal.cat || meal.type || "";
  }

  function familyCat(cat) {
    if (!cat) return "";
    if (cat === "tuna" || cat === "salmon") return "fish";
    if (cat === "jerky" || cat === "biltong") return "beef";
    if (cat === "yogurt" || cat === "yoghurt" || cat === "cottage_cheese") return "dairy";
    if (cat === "boiled_eggs") return "eggs";
    if (cat === "chicken_strips") return "chicken";
    if (cat === "turkey_strips") return "turkey";
    return cat;
  }

  function maxWeeklyMainFor(cat, mainCount) {
    if (mainCount >= 4) {
      if (cat === "chicken") return 2;
      if (cat === "turkey") return 2;
      if (cat === "beef") return 2;
      if (cat === "fish") return 2;
      if (cat === "pork") return 1;
      if (cat === "eggs") return 2;
      return 2;
    }
    if (mainCount === 3) {
      if (cat === "chicken" || cat === "turkey" || cat === "beef" || cat === "fish") return 3;
      return 3;
    }
    return 4;
  }

  function chooseBalancedTemplate(templates, day, counts, avoidCats, maxMap, nameCounts) {
    let best = null;
    let bestScore = Infinity;
    const hasUnusedName = templates.some(x => !(nameCounts && nameCounts[x.name]));

    templates.forEach((template, idx) => {
      const cat = template.cat;
      const used = counts[cat] || 0;
      const usedName = nameCounts?.[template.name] || 0;
      let score = idx * 0.01 + used * 25 + usedName * 140;
      if (hasUnusedName && usedName > 0) score += 900;
      if (avoidCats && avoidCats.has(cat) && templates.some(x => x.cat !== cat)) score += 500;
      const max = maxMap[cat] || 7;
      if (used >= max && templates.some(x => x.cat !== cat)) score += 1000 + used * 100;
      if (counts.__last === cat && templates.some(x => x.cat !== cat)) score += 80;
      if (counts.__lastName === template.name && templates.some(x => x.name !== template.name)) score += 500;
      score += ((idx + day) % templates.length) * 0.05;
      if (score < bestScore) { best = template; bestScore = score; }
    });

    return best || templates[day % templates.length];
  }


  function makeDinners(input, gate) {
    const t = dinnerTemplates(input, gate);
    const mainCount = new Set(t.map(x => x.cat)).size || 1;
    const maxMap = {};
    t.forEach(x => { maxMap[x.cat] = maxWeeklyMainFor(x.cat, mainCount); });

    const counts = {};
    const nameCounts = {};
    const out = [];

    for (let day=0; day<7; day++) {
      const template = chooseBalancedTemplate(t, day, counts, new Set(), maxMap, nameCounts);
      const st = chooseStarch(input, template.pref, day);
      const mealName = st === "none"
        ? template.name
            .replace(" with {starch}", " bowl")
            .replace(" and {starch}", "")
            .replace("{starch}", "vegetables")
        : template.name.replace("{starch}", STARCH[st] || "starch");

      out.push({
        name: mealName,
        protein: template.protein,
        detail: template.detail(st, day),
        cat: template.cat,
        starch: st
      });
      counts[template.cat] = (counts[template.cat] || 0) + 1;
      nameCounts[template.name] = (nameCounts[template.name] || 0) + 1;
      counts.__last = template.cat;
      counts.__lastName = template.name;
    }

    return out;
  }

  function makeStandaloneLunches(input, gate, dinners, breakfasts) {
    const t = lunchTemplates(input, gate);
    const dinnerCounts = {};
    (dinners || []).forEach(d => { dinnerCounts[d.cat] = (dinnerCounts[d.cat] || 0) + 1; });

    const mainCount = new Set(t.map(x => x.cat)).size || 1;
    const maxMap = {};
    t.forEach(x => { maxMap[x.cat] = maxWeeklyMainFor(x.cat, mainCount); });

    const counts = {};
    const nameCounts = {};
    const out = [];

    for (let day=0; day<7; day++) {
      const dinnerCat = dinners?.[day]?.cat;
      let best = null;
      let bestScore = Infinity;

      t.forEach((template, idx) => {
        const cat = template.cat;
        const used = counts[cat] || 0;
        const totalMainUsed = used + (dinnerCounts[cat] || 0);
        let score = idx * 0.01 + used * 28 + totalMainUsed * 14 + (nameCounts[template.name] || 0) * 35;

        if (dinnerCat === cat && t.some(x => x.cat !== cat)) score += 1000;
        if (counts.__lastName === template.name && t.some(x => x.name !== template.name)) score += 90;
        if (cat === "dairy" && breakfasts?.[day]?.type === "dairy" && t.some(x => x.cat !== "dairy")) score += 1200;
        const weeklyMax = (maxMap[cat] || 7) + 1;
        if (totalMainUsed >= weeklyMax && t.some(x => x.cat !== cat)) score += 900;
        if (counts.__last === cat && t.some(x => x.cat !== cat)) score += 60;
        score += ((idx + day) % t.length) * 0.05;

        if (score < bestScore) { best = template; bestScore = score; }
      });

      const template = best || t[day % t.length];
      out.push({
        name: template.name,
        protein: template.protein,
        detail: template.detail(day),
        cat: template.cat
      });
      counts[template.cat] = (counts[template.cat] || 0) + 1;
      nameCounts[template.name] = (nameCounts[template.name] || 0) + 1;
      counts.__last = template.cat;
      counts.__lastName = template.name;
    }

    return out;
  }

  function makeLeftoverLunches(input, gate, dinners, breakfasts) {
    const standalone = makeStandaloneLunches(input, gate, dinners, breakfasts);
    return dinners.map((d, idx) => {
      if (idx === 0) return standalone[0];
      const previousDinner = dinners[idx - 1];
      return {
        name: `Leftover ${previousDinner.name}`,
        protein: previousDinner.protein,
        cat: previousDinner.cat,
        detail: `Use the extra ${humanProtein(previousDinner.cat)} from last night’s dinner with sauce and vegetables. Serve cold or reheated with extra vegetables such as ${pickVeg(input, idx, 5)}. Keep starch separate — add a small portion at lunch only if appetite allows.`
      };
    });
  }

  function validatePlan(input, gate, days) {
    // Built-in QA now mirrors locked business rules.
    const hard = [];
    const warn = [];
    const text = JSON.stringify(days).toLowerCase();

    days.forEach(day => {
      const b = mealText(day.breakfast);
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
      const familyCounts = dayFamilyCounts(day);
      const dairyHeavyCount = familyCounts.dairy || 0;
      const shakeCount = familyCounts.protein_powder || 0;
      const mealsInOrder = [day.breakfast, day.morningSnack, day.lunch, day.afternoonSnack, day.dinner].filter(Boolean);
      const famsInOrder = mealsInOrder.map(m => familyCat(m.type || m.cat || classifyMealByText(m))).filter(Boolean);
      for (let i = 1; i < famsInOrder.length; i++) {
        if (famsInOrder[i] && famsInOrder[i] === famsInOrder[i-1] && !["fruit","none","other"].includes(famsInOrder[i])) {
          warn.push(`Day ${day.day}: back-to-back ${famsInOrder[i]} protein anchors.`);
        }
      }
      if (dairyHeavyCount > 2) hard.push(`Day ${day.day}: dairy-heavy anchors appear ${dairyHeavyCount} times.`);
      if (shakeCount > 1) hard.push(`Day ${day.day}: protein shake appears more than once.`);
      if (/protein shake[^.]{0,120}(tuna|chicken strips|turkey strips|pork|egg|boiled egg)/.test(all)) hard.push(`Day ${day.day}: protein shake is paired with unrelated protein side.`);
      if (/(tuna|chicken strips|turkey strips|pork|boiled eggs?)[^.]{0,120}protein shake/.test(all)) hard.push(`Day ${day.day}: unrelated protein side is paired with protein shake.`);

      if (eggBreakfast && eggSnack && gate.snackCategories.some(x => x !== "eggs")) hard.push(`Day ${day.day}: egg breakfast and egg snack same day.`);
      if (yoghurtBreakfast && yoghurtSnack && gate.snackCategories.some(x => x !== "dairy")) hard.push(`Day ${day.day}: yoghurt breakfast and yoghurt snack same day.`);
      if (shakeBreakfast && shakeSnack && gate.snackCategories.some(x => x !== "protein_powder")) hard.push(`Day ${day.day}: protein shake breakfast and shake snack same day.`);

      const legumeBreakfastCheck = b.replace(/green beans/g, "greenbeans");
      if (/\b(lentil|lentils|bean|beans|chickpea|chickpeas)\b/.test(legumeBreakfastCheck) && !b.includes("hummus")) hard.push(`Day ${day.day}: legume breakfast outside hummus.`);
      if (b.includes("hummus") && !input.breakfastItems.includes("hummus_plate")) hard.push(`Day ${day.day}: hummus breakfast without selection.`);
      if (b.includes("tofu") && !input.breakfastItems.includes("tofu_scramble")) hard.push(`Day ${day.day}: tofu breakfast without selection.`);
      if (/\b(chicken|turkey|beef|pork|fish|tuna|hake|cod|jerky|biltong)\b/.test(b)) hard.push(`Day ${day.day}: meat/fish breakfast.`);

      if (/optional protein shake/.test(all)) hard.push(`Day ${day.day}: optional protein shake wording.`);
      if (/selected protein|selected fish/.test(all)) hard.push(`Day ${day.day}: selected-protein wording.`);
      if (/mixed vegetables/.test(all)) hard.push(`Day ${day.day}: mixed vegetables wording.`);
      if (/\bcorn\b/.test(all)) warn.push(`Day ${day.day}: corn appears.`);
    });

    if (input.diet === "vegetarian" && /\b(chicken|turkey|beef|pork|fish|tuna|hake|cod|biltong|jerky)\b/.test(text)) hard.push("Meat/fish appears in vegetarian plan.");
    if (input.diet === "pescatarian" && /\b(chicken|turkey|beef|pork|biltong|jerky)\b/.test(text)) hard.push("Chicken/red meat appears in pescatarian plan.");

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


    // v3.4 rendered-output quality gates: weekly balance and snack/main clashes.
    const mainCatsAll = days.flatMap(d => [d.lunch.cat, d.dinner.cat].filter(Boolean));
    const mainMix = count(mainCatsAll);
    const strictMainMix = count(mainCatsAll.filter(cat => cat !== "dairy"));
    const mainCategoryCount = Object.keys(strictMainMix).length;

    if (mainCategoryCount >= 4) {
      Object.entries(strictMainMix).forEach(([cat, n]) => {
        const limit = cat === "pork" ? 3 : 4;
        if (n > limit) hard.push(`Plan: ${cat} appears ${n} times across lunch/dinner; weekly rotation is too repetitive.`);
      });
      if ((strictMainMix.chicken || 0) > 4) hard.push("Plan: chicken dominates the week.");
      if ((strictMainMix.turkey || 0) > 4) hard.push("Plan: turkey dominates the week.");
      if ((strictMainMix.beef || 0) > 4) hard.push("Plan: beef dominates the week.");
    } else if (mainCategoryCount === 3) {
      Object.entries(strictMainMix).forEach(([cat, n]) => {
        if (n > 5) hard.push(`Plan: ${cat} appears ${n} times in a narrow plan; weekly rotation is too repetitive.`);
      });
    }

    days.forEach(day => {
      const lunchCat = familyCat(day.lunch?.cat);
      const dinnerCat = familyCat(day.dinner?.cat);
      const mainCats = new Set([lunchCat, dinnerCat].filter(Boolean));
      const snackCats = [classifySnack(day.morningSnack), classifySnack(day.afternoonSnack)].map(familyCat);

      if (lunchCat && dinnerCat && lunchCat === dinnerCat) {
        hard.push(`Day ${day.day}: lunch and dinner repeat ${lunchCat}.`);
      }

      snackCats.forEach(sc => {
        if (sc && mainCats.has(sc) && gate.snackCategories.some(x => !mainCats.has(familyCat(x)))) {
          warn.push(`Day ${day.day}: ${sc} snack repeats lunch/dinner protein.`);
        }
      });

      const approxTotal = [
        day.breakfast,
        day.morningSnack,
        day.lunch,
        day.afternoonSnack,
        day.dinner
      ].reduce((sum, meal) => sum + proteinMidpoint(meal?.protein), 0);

      const proteinCeiling = Number(input.targets?.proteinMax || 0) ? Number(input.targets.proteinMax) + 15 : 122;
      if (approxTotal > proteinCeiling) warn.push(`Day ${day.day}: protein estimate is high at approximately ${approxTotal}g.`);
    });


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
  function titleCase(s) { return String(s).replace(/\b\w/g, c => c.toUpperCase()); }
  function capFirst(s) { s = String(s || ""); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function humanProtein(cat) {
    return ({chicken:"chicken", turkey:"lean turkey", beef:"lean beef", fish:"fish", eggs:"eggs", tofu:"tofu-style protein", lentils:"lentils", beans:"beans", chickpeas:"chickpeas", pork:"lean pork"})[cat] || cat;
  }
  function classifyBreakfast(meal) {
    const t = mealText(meal);
    if (t.includes("not planned")) return "none";
    if (t.includes("egg")) return "eggs";
    if (/yoghurt|yogurt|cottage cheese|oats/.test(t)) return "dairy";
    if (t.includes("protein shake")) return "protein_powder";
    if (t.includes("tofu")) return "tofu";
    if (t.includes("hummus")) return "hummus";
    return classifyMealByText(meal);
  }
  function classifySnack(meal) {
    const t = mealText(meal);
    if (/yoghurt|yogurt|cottage cheese/.test(t)) return "dairy";
    if (t.includes("egg")) return "eggs";
    if (t.includes("chicken")) return "chicken";
    if (t.includes("turkey")) return "turkey";
    if (t.includes("tuna") || t.includes("fish")) return "fish";
    if (t.includes("hummus") || t.includes("chickpea")) return "legumes";
    if (t.includes("tofu")) return "tofu";
    if (t.includes("protein shake")) return "protein_powder";
    if (/biltong|jerky|meat strips/.test(t)) return "beef";
    if (/apple|berries|mandarin|naartjie|clementine|fruit/.test(t)) return "fruit";
    return classifyMealByText(meal);
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
    ENGINE_SOURCE,
    REGION_OPTIONS,
    generatePlan,
    gateCheck,
    validatePlan,
    normalizeInput
  };
});
