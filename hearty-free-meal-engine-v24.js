// HEARTY_FREE_MEAL_ENGINE_V24_HUMAN_POLISH
// Shared GLP-1 meal engine for the free lead magnet and the full Hearty app.
// Focus: dish-first meal names, country-aware fish suggestions, controlled fish rotation, stronger lunch/dinner/snack variety, and daily high-protein snack ideas.
(function () {
  "use strict";

  const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const PROTEIN_DISCLAIMER = "Protein estimates are approximate and based on standard serving assumptions. Actual values vary by brand, portion size and preparation.";
  const LOW_PROTEIN_THRESHOLD = 70;

  // Conservative standard-serving estimates. These are not exact nutrition calculations.
  const PROTEIN_EST = {
    chicken: 30,
    beef: 28,
    pork: 26,
    venison: 28,
    ostrich: 28,
    turkey: 28,
    tuna: 24,
    prawns: 24,
    seafood: 24,
    hake: 25,
    snoek: 25,
    salmon: 26,
    cod: 24,
    haddock: 24,
    barramundi: 24,
    trout: 24,
    tilapia: 23,
    fish: 25,
    "white fish": 24,
    eggs: 12,
    yoghurt: 12,
    greek_yoghurt: 17,
    cottage_cheese: 15,
    whey: 24,
    biltong: 15,
    nuts: 6,
    oats_milk: 8,
    all_bran_milk: 7,
    overnight_oats: 10,
    avocado_toast: 5,
    beans_lentils: 13
  };

  const DEFAULT_FRUITS = ["banana", "apple", "grapes", "pineapple", "berries"];
  const DEFAULT_VEGETABLES = ["broccoli", "carrots", "baby_marrow", "spinach", "lettuce", "cucumber", "tomato", "green_beans", "mushrooms", "peppers", "onion", "cauliflower", "butternut"];
  const DEFAULT_STARCHES = ["rice", "potato", "sweet_potato", "whole_wheat_wraps", "whole_wheat_pasta", "whole_wheat_bread", "couscous"];
  const MARKET_PROFILES = {
    ZA: {
      label: "South Africa", breadBase: "whole wheat", yoghurt: "low-fat yoghurt", yoghurtProteinId: "yoghurt",
      mince: "lean beef mince", jerky: "biltong", babyMarrow: "baby marrow",
      fish: ["hake", "snoek", "salmon"], defaultProteins: ["chicken", "beef", "hake", "eggs"],
      defaultStarches: ["rice", "potato", "sweet_potato", "whole_wheat_wraps", "whole_wheat_pasta", "whole_wheat_bread", "couscous"],
      lunchFocus: ["chicken_mayo_sandwich", "hake_potato_plate", "lean_mince_bowl"],
      dinnerFocus: ["fish_chips", "lean_mince", "chicken_tray_bake"]
    },
    UK: {
      label: "United Kingdom", breadBase: "wholemeal", yoghurt: "Greek-style yoghurt", yoghurtProteinId: "greek_yoghurt",
      mince: "lean beef mince", jerky: "beef jerky", babyMarrow: "courgette",
      fish: ["cod", "haddock", "salmon"], defaultProteins: ["chicken", "beef", "cod", "eggs"],
      defaultStarches: ["potato", "rice", "whole_wheat_bread", "whole_wheat_wraps", "whole_wheat_pasta", "sweet_potato", "couscous"],
      lunchFocus: ["jacket_potato", "prawn_sandwich", "wholemeal_sandwich"],
      dinnerFocus: ["fish_chips", "jacket_potato", "meatballs"]
    },
    US: {
      label: "United States", breadBase: "whole wheat", yoghurt: "Greek yogurt", yoghurtProteinId: "greek_yoghurt",
      mince: "lean ground beef", jerky: "beef jerky", babyMarrow: "zucchini",
      fish: ["cod", "salmon", "white fish"], defaultProteins: ["chicken", "turkey", "beef", "cod", "eggs"],
      defaultStarches: ["rice", "potato", "sweet_potato", "whole_wheat_bread", "whole_wheat_wraps", "whole_wheat_pasta", "couscous"],
      lunchFocus: ["turkey_burger", "fish_chips", "chicken_wrap"],
      dinnerFocus: ["turkey_burger", "taco_bowl", "fish_chips"]
    },
    CA: {
      label: "Canada", breadBase: "whole wheat", yoghurt: "Greek yogurt", yoghurtProteinId: "greek_yoghurt",
      mince: "lean ground beef", jerky: "beef jerky", babyMarrow: "zucchini",
      fish: ["salmon", "cod", "trout"], defaultProteins: ["chicken", "turkey", "beef", "salmon", "eggs"],
      defaultStarches: ["rice", "potato", "sweet_potato", "whole_wheat_bread", "whole_wheat_wraps", "whole_wheat_pasta", "couscous"],
      lunchFocus: ["turkey_burger", "fish_chips", "chicken_wrap"],
      dinnerFocus: ["turkey_burger", "fish_chips", "fish_chips"]
    },
    AU: {
      label: "Australia", breadBase: "wholemeal", yoghurt: "low-fat yoghurt", yoghurtProteinId: "yoghurt",
      mince: "lean beef mince", jerky: "beef jerky", babyMarrow: "zucchini",
      fish: ["salmon", "barramundi"], defaultProteins: ["chicken", "beef", "salmon", "prawns", "eggs"],
      defaultStarches: ["rice", "sweet_potato", "potato", "whole_wheat_wraps", "whole_wheat_bread", "whole_wheat_pasta", "couscous"],
      lunchFocus: ["prawn_avo_wrap", "fish_chips", "chicken_wrap"],
      dinnerFocus: ["prawn_paella", "fish_chips", "fish_chips"]
    },
    OTHER: {
      label: "International", breadBase: "whole wheat", yoghurt: "low-fat yoghurt", yoghurtProteinId: "yoghurt",
      mince: "lean beef mince", jerky: "biltong / beef jerky", babyMarrow: "zucchini",
      fish: ["salmon", "cod"], defaultProteins: ["chicken", "beef", "salmon", "eggs"],
      defaultStarches: ["rice", "potato", "sweet_potato", "whole_wheat_wraps", "whole_wheat_pasta", "whole_wheat_bread", "couscous"],
      lunchFocus: ["chicken_wrap", "fish_chips", "wholemeal_sandwich"],
      dinnerFocus: ["fish_chips", "taco_bowl", "tray_bake"]
    }
  };
  const FISH_EXAMPLES_BY_COUNTRY = Object.fromEntries(Object.entries(MARKET_PROFILES).map(([key, value]) => [key, value.fish]));
  FISH_EXAMPLES_BY_COUNTRY.GLOBAL = MARKET_PROFILES.OTHER.fish;

  let CURRENT_ENGINE_COUNTRY = "ZA";

  const FISH_PROTEIN_IDS = ["fish", "hake", "snoek", "cod", "haddock", "salmon", "barramundi", "trout", "white fish", "tilapia"];
  const SEAFOOD_PROTEIN_IDS = ["prawns", "seafood"];
  function isFishProtein(id){ return FISH_PROTEIN_IDS.includes(String(id || "").toLowerCase()); }
  function isSeafoodProtein(id){ return SEAFOOD_PROTEIN_IDS.includes(String(id || "").toLowerCase()); }
  function isFishOrSeafoodProtein(id){ return isFishProtein(id) || isSeafoodProtein(id); }
  function localFishIdeas(country){
    return (marketProfile(country).fish || MARKET_PROFILES.OTHER.fish)
      .filter(Boolean)
      .filter(v => String(v).toLowerCase() !== "tilapia")
      .slice(0, 3);
  }
  function fishIdeasSentence(country){
    const ideas = localFishIdeas(country);
    if(!ideas.length) return "Fish ideas: use a local white fish or salmon, depending on what is available.";
    const pretty = ideas.map(v => String(v));
    const joined = pretty.length === 1 ? pretty[0] : `${pretty.slice(0, -1).join(", ")} or ${pretty[pretty.length - 1]}`;
    return `Fish ideas: ${joined}.`;
  }
  function displayProteinForMealTitle(proteinId, country){
    if(isFishProtein(proteinId)) return "fish";
    if(String(proteinId || "").toLowerCase() === "seafood") return "seafood";
    return proteinLabel(proteinId, country);
  }
  function polishMealTitle(title, proteinId){
    let out = compact(title);
    if(isFishProtein(proteinId)){
      const exactFishNames = ["tilapia", "salmon", "cod", "haddock", "hake", "snoek", "barramundi", "trout", "white fish"];
      exactFishNames.forEach(name => {
        const rx = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\b`, "ig");
        out = out.replace(rx, "fish");
      });
      out = out.replace(/\bFish fish\b/gi, "Fish").replace(/\bfish fish\b/gi, "fish");
      out = out.replace(/^Fish (rice|couscous) bowl with (.+?) plus 1 portion \1$/i, "Grilled fish with $2 plus 1 portion $1");
      out = out.replace(/^Fish (rice|couscous) bowl with (.+)$/i, "Grilled fish with $2 plus 1 portion $1");
      out = out.replace(/^Fish protein bowl with (.+)$/i, "Grilled fish plate with $1");
      out = out.replace(/^Friday night fish taco-style bowl with (.+)$/i, "Friday night fish taco-style plate with $1");
      out = out.replace(/^Easy weekend fish bowl with (.+)$/i, "Easy weekend grilled fish plate with $1");
      out = out.replace(/^Warm fish bowl with (.+)$/i, "Warm fish plate with $1");
      out = out.replace(/^Cooked fish bowl with (.+)$/i, "Cooked fish plate with $1");
      out = out.replace(/^Mini fish bowl with (.+)$/i, "Mini fish plate with $1");
    }
    out = out.replace(/light/g, "light");
    out = out.replace(/yoghurt\/yogurt/gi, "yoghurt");
    out = out.replace(/tomato/gi, "tomato");
    return compact(out);
  }

  function marketProfile(country){
    const key = String(country || "ZA").toUpperCase();
    return MARKET_PROFILES[key] || MARKET_PROFILES.OTHER;
  }

  const VEGETABLE_GROUPS = {
    salad: ["lettuce", "cucumber", "tomato", "peppers", "carrots", "onion", "spinach"],
    roast: ["carrots", "green_beans", "broccoli", "cauliflower", "butternut", "baby_marrow", "mushrooms", "peppers", "onion"],
    stir_fry: ["peppers", "baby_marrow", "broccoli", "green_beans", "mushrooms", "onion", "carrots", "cabbage", "peas"],
    soft: ["carrots", "butternut", "baby_marrow", "cauliflower", "green_beans", "spinach", "mushrooms"],
    mediterranean: ["tomato", "cucumber", "peppers", "onion", "lettuce", "baby_marrow"],
    mexican: ["peppers", "onion", "tomato", "lettuce", "corn", "cucumber"],
    pasta: ["mushrooms", "spinach", "baby_marrow", "peppers", "onion", "tomato"],
    curry: ["butternut", "spinach", "cauliflower", "peas", "green_beans", "carrots"]
  };

  function iso(date){ return date.toISOString().slice(0, 10); }
  function weekStartDate(){ const d = new Date(); const day = d.getDay(); const diff = day === 0 ? -6 : 1 - day; d.setHours(0,0,0,0); d.setDate(d.getDate() + diff); return d; }
  function toList(values){ return Array.isArray(values) ? values.map(v => String(v).toLowerCase()).filter(Boolean) : []; }
  function unique(values){ return Array.from(new Set((values || []).filter(Boolean))); }
  function pick(list, index){ if(!list || !list.length) return null; return list[((index % list.length) + list.length) % list.length]; }
  function compact(value){ return String(value || "").replace(/\s+/g, " ").trim(); }
  function titleCase(value){ value = String(value || ""); return value ? value.charAt(0).toUpperCase() + value.slice(1) : value; }

  // Stable, varied selection. Avoid full random so screenshots and tests are less confusing.
  function selectFrom(list, index, salt){
    if(!list || !list.length) return null;
    const s = String(salt || "").split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return list[(index + s) % list.length];
  }

  function normalizeMode(mode){ return mode === "full_app" ? "full_app" : "lead_magnet"; }

  function normalizeSupportMode(value){
    if(!value) return null;
    if(typeof value === "string"){
      const v = value.toLowerCase();
      return {
        type: v,
        nausea: v === "nausea" ? 3 : 0,
        lowAppetite: v === "low_appetite" || v === "low-appetite" ? 3 : 0,
        bloating: v === "bloating" ? 3 : 0,
        exhaustion: v === "exhaustion" || v === "fatigue" ? 3 : 0
      };
    }
    return {
      type: value.type || value.reason || value.mode || null,
      nausea: Number(value.nausea || 0),
      lowAppetite: Number(value.lowAppetite || value.low_appetite || 0),
      bloating: Number(value.bloating || 0),
      exhaustion: Number(value.exhaustion || value.fatigue || 0)
    };
  }

  function activeSupportTypes(supportMode){
    const s = normalizeSupportMode(supportMode);
    if(!s) return [];
    const out = [];
    if(s.type) out.push(String(s.type).toLowerCase());
    if(s.nausea > 1) out.push("nausea");
    if(s.lowAppetite > 1) out.push("low_appetite");
    if(s.bloating > 1) out.push("bloating");
    if(s.exhaustion > 1) out.push("exhaustion");
    return unique(out);
  }

  function normalizeStruggleMode(value){
    if(!value) return null;
    const v = String(value).toLowerCase();
    const map = {
      lowappetite: "low_appetite",
      low_appetite: "low_appetite",
      "low appetite": "low_appetite",
      protein_hard: "protein_hard",
      "protein is hard": "protein_hard",
      nausea: "nausea_food_aversion",
      nausea_food_aversion: "nausea_food_aversion",
      "nausea / food aversion": "nausea_food_aversion",
      no_breakfast: "no_breakfast",
      "not a breakfast person": "no_breakfast",
      not_sure_what_to_eat: "not_sure_what_to_eat",
      "not sure what to eat": "not_sure_what_to_eat",
      simple_structure: "simple_structure",
      "simple structure": "simple_structure"
    };
    return map[v] || v;
  }

  function normalizeProfile(profile={}){
    const country = String(profile.country || "ZA").toUpperCase();
    const market = marketProfile(country);
    const veg = toList(profile.allowedVegetables || profile.vegetables);
    const starches = toList(profile.allowedStarches || profile.starches);
    const fruits = toList(profile.allowedFruits || profile.fruits);
    return {
      country,
      allowedProteins: toList(profile.allowedProteins || profile.proteins),
      allowedBreakfastFamilies: toList(profile.allowedBreakfastFamilies || profile.breakfast || profile.breakfasts),
      allowedStarches: starches.length ? starches : market.defaultStarches.slice(),
      allowedVegetables: veg.length ? veg : DEFAULT_VEGETABLES.slice(),
      allowedFruits: fruits.length ? fruits : DEFAULT_FRUITS.slice(),
      allowedSnacks: toList(profile.allowedSnacks || profile.snacks),
      snackEnabled: profile.snackEnabled !== false,
      seafoodAllowed: profile.seafoodAllowed !== false,
      noBreakfast: profile.noBreakfast === true,
      struggleMode: normalizeStruggleMode(profile.struggleMode || profile.struggle)
    };
  }


  function normalizeFeedback(raw){
    if(!raw) return [];
    const list = Array.isArray(raw) ? raw : (Array.isArray(raw.items) ? raw.items : []);
    return list.map(item => ({
      mealId: item.mealId || item.id || null,
      title: item.title || item.mealTitle || "",
      slot: item.slot || item.mealType || "",
      proteinId: item.proteinId || null,
      family: item.family || item.mealFamily || item.method || null,
      tags: Array.isArray(item.tags) ? item.tags : [],
      eaten: item.eaten || item.status || null,
      reaction: item.reaction || item.howItSat || item.response || null,
      wouldRepeat: item.wouldRepeat || item.repeat || null,
      date: item.date || item.createdAt || null
    })).filter(Boolean);
  }

  function feedbackRulesFrom(rawFeedback){
    const feedback = normalizeFeedback(rawFeedback);
    const rules = { avoidMealIds: [], reduceTags: [], preferTags: [], reduceProteins: [], preferProteins: [], notes: [] };
    feedback.slice(-30).forEach(item => {
      const reaction = String(item.reaction || "").toLowerCase();
      const eaten = String(item.eaten || "").toLowerCase();
      const repeat = String(item.wouldRepeat || "").toLowerCase();
      const tags = (item.tags || []).concat(item.family || []).filter(Boolean).map(v => String(v).toLowerCase());

      if(repeat === "yes" || reaction === "fine" || reaction === "liked"){
        rules.preferTags.push(...tags);
        if(item.proteinId) rules.preferProteins.push(item.proteinId);
      }
      if(repeat === "no" || reaction === "didnt_appeal" || reaction === "didn't appeal"){
        if(item.mealId) rules.avoidMealIds.push(item.mealId);
        rules.reduceTags.push(...tags);
        if(item.proteinId) rules.reduceProteins.push(item.proteinId);
      }
      if(reaction === "too_heavy" || reaction === "too heavy"){
        rules.reduceTags.push("rich", "peanut", "burger_bowl", "creamy", "heavy", ...tags);
        rules.preferTags.push("plain", "low_effort", "soup", "warm_simple");
      }
      if(reaction === "nausea" || reaction === "made_me_nauseous" || reaction === "made me nauseous"){
        rules.reduceTags.push("rich", "peanut", "fried", "burger_bowl", "heavy", "spicy", ...tags);
        rules.preferTags.push("plain", "gentle", "soup", "soft", "small_portion");
      }
      if(eaten === "skipped" || eaten === "no"){
        rules.reduceTags.push(...tags);
        rules.preferTags.push("small_portion", "low_effort");
      }
      if(reaction === "still_hungry" || reaction === "still hungry"){
        rules.preferTags.push("higher_satiety", "protein_first");
      }
    });
    rules.avoidMealIds = unique(rules.avoidMealIds);
    rules.reduceTags = unique(rules.reduceTags);
    rules.preferTags = unique(rules.preferTags);
    rules.reduceProteins = unique(rules.reduceProteins);
    rules.preferProteins = unique(rules.preferProteins);
    return rules;
  }

  function feedbackAvoids(ctx, value){
    return !!(ctx && ctx.feedbackRules && ctx.feedbackRules.reduceTags && ctx.feedbackRules.reduceTags.includes(value));
  }

  function feedbackPrefers(ctx, value){
    return !!(ctx && ctx.feedbackRules && ctx.feedbackRules.preferTags && ctx.feedbackRules.preferTags.includes(value));
  }

  function createMealFeedback(meal, response){
    response = response || {};
    return {
      mealId: meal?.mealId || null,
      title: meal?.title || "",
      slot: meal?.slot || meal?.mealType || "",
      proteinId: meal?.proteinId || null,
      family: meal?.family || meal?.method || null,
      tags: Array.isArray(meal?.tags) ? meal.tags : [],
      eaten: response.eaten || null,
      reaction: response.reaction || null,
      wouldRepeat: response.wouldRepeat || null,
      date: response.date || iso(new Date())
    };
  }

  function makeWeekState(){ return { recentBreakfast: [], recentSnacks: [], recentProteins: [], proteinCounts: {}, usedMainTitles: [], usedMainFamilies: [], fishCount: 0, tunaCount: 0, tunaSnackCount: 0, wheyCount: 0, fishSnackDayCount: 0, recentDinnerMethods: [] }; }
  function pushLimited(list, value, max){ if(!value) return; list.push(value); while(list.length > max) list.shift(); }

  function yoghurtLabel(country){ return marketProfile(country).yoghurt; }
  function localiseCopy(text, country){
    return String(text || "")
      .replace(/yoghurt\/yogurt/gi, yoghurtLabel(country))
      .replace(/light dressing/gi, "light dressing");
  }
  function yoghurtProteinId(country){ return marketProfile(country).yoghurtProteinId || "yoghurt"; }
  function breadBaseLabel(profileOrCountry){
    const country = typeof profileOrCountry === "string" ? profileOrCountry : (profileOrCountry && profileOrCountry.country);
    return marketProfile(country).breadBase || "whole wheat";
  }
  function jerkyLabel(country){ return marketProfile(country).jerky || "biltong / beef jerky"; }
  function lightDressingLabel(country){ return (String(country || "").toUpperCase() === "US" || String(country || "").toUpperCase() === "CA") ? "light yogurt-style dressing" : "light dressing"; }
  function lightToppingLabel(country){ return (String(country || "").toUpperCase() === "US" || String(country || "").toUpperCase() === "CA") ? "light yogurt-style topping" : "light topping"; }
  function vegLabel(id, country){
    const map = {
      broccoli:"broccoli", cauliflower:"cauliflower", carrots:"carrots", spinach:"spinach", mushrooms:"mushrooms", peppers:"peppers", green_beans:"green beans", corn:"corn", butternut:"butternut", cabbage:"cabbage", lettuce:"salad greens", cucumber:"cucumber", tomato:"tomato", onion:"onion", peas:"peas", mixed_veg:"mixed vegetables"
    };
    if(id === "baby_marrow") return marketProfile(country).babyMarrow;
    return map[id] || String(id || "vegetables").replace(/_/g, " ");
  }
  function starchLabel(id, country){
    const map = {
      rice:"rice",
      potato:"potato",
      sweet_potato:"sweet potato",
      couscous:"couscous",
      whole_wheat_pasta:"whole wheat pasta",
      whole_wheat_wraps:`${breadBaseLabel(country)} wrap`,
      whole_wheat_bread:`${breadBaseLabel(country)} toast`
    };
    return map[id] || String(id || "starch").replace(/_/g, " ");
  }
  function fruitLabel(id){ return ({ pawpaw:"pawpaw / papaya", kiwi:"kiwi fruit", berries:"berries" }[id] || id || "fruit").replace(/_/g, " "); }
  function countryFish(country){ return (marketProfile(country).fish || MARKET_PROFILES.OTHER.fish)[0] || "salmon"; }
  function countryFishList(country){ return (marketProfile(country).fish || MARKET_PROFILES.OTHER.fish).slice(); }
  function proteinLabel(id, country){
    const map = {
      chicken:"chicken",
      beef:marketProfile(country).mince,
      pork:"lean pork",
      venison:"venison",
      ostrich:"ostrich",
      turkey:"turkey breast",
      tuna:"canned tuna",
      prawns:"prawns",
      seafood:"seafood",
      hake:"hake",
      snoek:"snoek",
      cod:"cod",
      haddock:"haddock",
      barramundi:"barramundi",
      trout:"trout",
      tilapia:"fish",
      salmon:"salmon",
      fish:"fish",
      eggs:"eggs",
      beans_lentils:"beans or lentils"
    };
    return map[id] || String(id || "protein").replace(/_/g, " ");
  }

  function selectedProteinPool(profile){
    // Default should feel like normal food, not a tuna-heavy emergency plan.
    let allowed = profile.allowedProteins.length ? profile.allowedProteins.slice() : marketProfile(profile.country).defaultProteins.slice();
    const out = [];
    allowed.forEach(p => {
      if(p === "fish") out.push(...countryFishList(profile.country).filter(x => String(x).toLowerCase() !== "tilapia"));
      else if(p === "seafood") out.push("prawns", ...(countryFishList(profile.country).includes("salmon") ? ["salmon"] : []));
      else if(p === "canned_tuna") out.push("tuna");
      else if(p === "tilapia") out.push(countryFish(profile.country));
      else if(p === "eggs") out.push("eggs");
      else out.push(p);
    });
    return unique(out.filter(p => PROTEIN_EST[p] || p === "beans_lentils"));
  }

  function selectedMainProteinPool(profile){
    const pool = selectedProteinPool(profile);
    const mains = pool.filter(p => p !== "eggs");
    return mains.length ? mains : pool;
  }

  function hasStarch(profile, key){ return profile.allowedStarches.includes(key); }
  function hasVeg(profile, key){ return profile.allowedVegetables.includes(key); }
  function chooseStarch(profile, dayIndex, preferred){
    const selected = profile.allowedStarches.length ? profile.allowedStarches : DEFAULT_STARCHES;
    const prefs = Array.isArray(preferred) ? preferred : (preferred ? [preferred] : []);
    // Human-quality rule: when multiple preferred starches are available, rotate between them.
    // The old first-match behaviour overused wraps/bread whenever selected.
    const matches = prefs.filter(p => selected.includes(p));
    if(matches.length) return pick(matches, dayIndex);
    return pick(selected, dayIndex) || "rice";
  }

  function chooseVeg(profile, group, count, dayIndex){
    const selected = profile.allowedVegetables.length ? unique(profile.allowedVegetables) : DEFAULT_VEGETABLES.slice();
    const preferred = VEGETABLE_GROUPS[group] || DEFAULT_VEGETABLES;
    let pool = preferred.filter(v => selected.includes(v));
    if(!pool.length) pool = selected.slice();

    // Trust rule: if the user selected vegetables, never invent extra named vegetables.
    // If they only selected one vegetable, use that one rather than adding random defaults.
    const out = [];
    for(let i=0; i<count && i<pool.length; i++){
      const v = pick(pool, dayIndex + (i * 2));
      if(v && !out.includes(v)) out.push(v);
    }
    if(!out.length && selected.length) out.push(selected[0]);
    return out.map(v => vegLabel(v, profile.country));
  }

  function vegPhrase(profile, group, count, dayIndex){
    const veg = chooseVeg(profile, group, count, dayIndex).filter(Boolean);
    if(!veg.length) return group === "salad" ? "salad vegetables" : "mixed vegetables";
    if(veg.length === 1) return veg[0];
    return `${veg.slice(0, -1).join(", ")} and ${veg[veg.length - 1]}`;
  }

  function preferredVegPhrase(profile, preferred, count, dayIndex, fallbackGroup){
    const selected = profile.allowedVegetables.length ? profile.allowedVegetables : DEFAULT_VEGETABLES;
    let pool = preferred.filter(v => selected.includes(v));
    if(!pool.length) return vegPhrase(profile, fallbackGroup || "salad", count, dayIndex);
    const out = [];
    for(let i=0; i<count; i++){
      const v = pick(pool, dayIndex + i);
      if(v && !out.includes(v)) out.push(v);
    }
    if(out.length === 1) return vegLabel(out[0], profile.country);
    return `${out.slice(0, -1).map(v => vegLabel(v, profile.country)).join(", ")} and ${vegLabel(out[out.length - 1], profile.country)}`;
  }

  function lunchStyleForStarch(starchKey, country){
    const starch = starchLabel(starchKey, country);
    if(starchKey === "whole_wheat_wraps") return { kind:"wrap", noun:"wrap", addon:`in a ${starch}`, joiner:"" };
    if(starchKey === "whole_wheat_bread") return { kind:"open_sandwich", noun:"open sandwich", addon:`on ${starch}`, joiner:"" };
    if(starchKey === "potato" || starchKey === "sweet_potato") return { kind:"jacket", noun:`${starch} plate`, addon:`with a small ${starch}`, joiner:"" };
    return { kind:"bowl", noun:"bowl", addon:`plus 1 portion ${starch}`, joiner:"" };
  }

  function plusStarch(starchKey, country){
    const starch = starchLabel(starchKey, country);
    if(starchKey === "whole_wheat_wraps") return `with a small ${starch} on the side`;
    if(starchKey === "whole_wheat_bread") return `with ${starch} on the side`;
    return `plus 1 portion ${starch}`;
  }

  function withStarch(starchKey, country){
    const starch = starchLabel(starchKey, country);
    if(starchKey === "whole_wheat_wraps") return `with a small ${starch} on the side`;
    if(starchKey === "whole_wheat_bread") return `with ${starch} on the side`;
    return `with 1 portion ${starch}`;
  }

  function hasAnyStarch(profile, keys){
    return keys.some(k => profile.allowedStarches.includes(k));
  }

  function chooseRequiredStarch(profile, dayIndex, required, fallbackPreferred){
    const requiredList = Array.isArray(required) ? required : [required];
    const match = requiredList.find(k => profile.allowedStarches.includes(k));
    if(match) return match;
    return chooseStarch(profile, dayIndex, fallbackPreferred || ["rice", "potato", "sweet_potato", "whole_wheat_wraps"]);
  }

  function slugify(value){
    return String(value || "meal")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "meal";
  }

  function mealFamilyFromTitle(title, method){
    const t = String(title || "").toLowerCase();
    if(t.includes("fish and chips") || t.includes("air-fried chips") || t.includes("sweet potato chips")) return "fish_and_chips";
    if(t.includes("salad bowl")) return "salad_bowl";
    if(t.includes("beef strips") || t.includes("steak-style")) return "beef_strips";
    if(t.includes("whole wheat burger") || t.includes("wholemeal burger") || t.includes("burger bun") || t.includes("burger with") || t.includes("fish burger") || t.includes("burger on a ")) return "burger";
    if(t.includes("burger bowl")) return "burger_bowl";
    if(t.includes("paella")) return "paella_style_rice";
    if(t.includes("shawarma")) return "shawarma";
    if(t.includes("pita")) return "pita";
    if(t.includes("sandwich") || t.includes("open sandwich")) return "sandwich";
    if(t.includes("loaded potato") || t.includes("jacket-style") || t.includes("potato plate")) return "loaded_potato";
    if(t.includes("pasta salad")) return "pasta_salad";
    if(t.includes("fried rice-style") || t.includes("egg-and-veg rice")) return "fried_rice_style";
    if(t.includes("meatballs")) return "meatballs";
    if(t.includes("stuffed pepper")) return "stuffed_peppers";
    if(t.includes("fish cake")) return "fish_cakes";
    if(t.includes("frittata")) return "frittata";
    if(t.includes("slow cooker")) return "slow_cooker";
    if(t.includes("one-dish") || t.includes("pasta bake") || t.includes("oven pasta bake")) return "one_dish_bake";
    if(t.includes("tray bake") || t.includes("roast-style") || t.includes("roast ")) return "tray_bake";
    if(t.includes("taco") || t.includes("fajita")) return "fun_bowl";
    if(t.includes("bolognese")) return "bolognese";
    if(t.includes("stir-fry")) return "stir_fry";
    if(t.includes("curry")) return "curry";
    if(t.includes("stew")) return "stew";
    if(t.includes("soup")) return "soup";
    if(/\bwrap with\b|\bfajita-style wrap\b|\btaco-style wrap\b|\beasy .+ wrap\b|\bwhole wheat wrap\b|\bwholemeal wrap\b/.test(t)) return "wrap";
    if(t.includes("yoghurt bowl") || t.includes("yogurt bowl") || t.startsWith("low-fat yoghurt") || t.startsWith("plain yoghurt") || t.startsWith("greek-style yoghurt")) return "yoghurt_bowl";
    if(t.includes("rice bowl") || t.includes("couscous bowl") || t.includes("protein bowl") || t.includes("loaded bowl") || t.includes("potato bowl")) return "rice_bowl";
    return method || "simple";
  }

  function recipeNoteForTitle(title, proteinId, method){
    const t = String(title || "").toLowerCase();
    const country = CURRENT_ENGINE_COUNTRY || "ZA";
    const yoghurt = yoghurtLabel(country);
    const breadBase = marketProfile(country).breadBase || "whole wheat";

    if(t.includes("1 cup") && (t.includes("yoghurt") || t.includes("yogurt"))) return `Basic method: use one cup of ${yoghurt} as an easy protein snack. Add fruit if you want it sweeter, and keep it simple if appetite is low.`;
    if((t.includes("yoghurt") || t.includes("yogurt")) && t.includes("chia")) return `Basic method: stir chia seeds into ${yoghurt} and add fruit. Let it stand for a few minutes if you prefer a softer texture.`;
    if(t.includes("scrambled eggs")) return "Basic method: scramble 2 eggs gently and add the selected vegetables. Keep it plain if appetite or nausea is an issue.";
    if(t.includes("salad bowl")) return "Basic method: build the bowl around the protein first, then add salad vegetables and a light dressing. Keep the portion easy to finish.";
    if(t.includes("mayo-style") || t.includes("sandwich")) return `Basic method: use ${breadBase} bread, a clear protein portion, salad vegetables and a yoghurt-style or low-calorie dressing instead of a heavy mayo.`;
    if(t.includes("burger on a") || t.includes("burger-style")) return `Basic method: use a lean patty or grilled fillet on one ${breadBase} bun with salad and a low-calorie dressing. Add air-fried chips or salad if needed.`;
    if(t.includes("grilled fish with")) return `Basic method: grill or air-fry the fish and serve it with the selected starch and vegetables. ${fishIdeasSentence(country)}`;
    if(t.includes("rice-style bowl")) return "Basic method: use a modest rice portion with the protein and selected vegetables. Keep sauces light and avoid making it greasy.";
    if(t.includes("small") && (t.includes("protein plate") || t.includes("dinner plate") || t.includes("supper plate"))) return "Basic method: keep the plate small and protein-led. Add a little starch only if it sits well and stop before the meal feels heavy.";

    if(t.includes("weet-bix") || t.includes("weetabix")) return `Basic method: use 1–2 Weet-Bix/Weetabix with low-fat milk. Keep the portion modest and add ${yoghurt} on the side to lift the protein.`;
    if(t.includes("baked oats")) return `Basic method: bake a small oats portion with milk and fruit, then add ${yoghurt} on the side. Keep it soft and easy to tolerate.`;
    if(t.includes("cooked oats")) return "Basic method: cook oats with low-fat milk and keep the bowl modest. Add fruit for taste, and pair with a protein snack later if this breakfast feels too light.";
    if(t.includes("overnight oats")) return `Basic method: mix oats, milk and ${yoghurt} the night before. Keep the portion small and easy to tolerate, especially on low-appetite mornings.`;
    if(t.includes("all-bran") || t.includes("bran flakes")) return "Basic method: use a normal cereal bowl with low-fat milk and fruit. Increase fibre gradually and keep fluids up.";
    if(t.includes("smoothie")) return `Basic method: blend ${yoghurt} or low-fat milk with fruit. Keep it small, smooth and easy to sip.`;
    if(t.includes("yoghurt bowl") || t.includes("yogurt bowl")) return `Basic method: use a simple ${yoghurt} bowl with fruit and a small oat portion. It is a light protein option for mornings when cooked food feels too much.`;
    if(t.includes("2 eggs scrambled") || t.includes("2 eggs scrambled or boiled")) return "Basic method: scramble or boil 2 eggs and add the selected vegetables. Keep it plain if appetite or nausea is an issue.";
    if(t.includes("omelette") || t.includes("frittata")) return "Basic method: cook eggs with selected vegetables in a pan or small oven dish. Serve with salad, toast, potato or another selected starch if needed.";
    if(t.includes("egg wrap")) return `Basic method: use one ${breadBase} wrap with egg and simple vegetables. Keep it lightly dressed and not too packed.`;
    if(t.includes("1–2 boiled eggs") || t.includes("2 boiled eggs")) return "Basic method: keep boiled eggs ready as a small protein backup. Add water or tea and stop at the amount that feels comfortable.";
    if(t.includes("biltong") || t.includes("jerky")) return "Basic method: keep the portion modest because this is salty and dense. Pair it with water, cucumber or a softer option like yoghurt/cottage cheese if needed.";
    if(t.includes("chicken strips")) return "Basic method: season chicken strips lightly and grill, bake or air-fry them. Keep extra strips for snacks or the next day’s lunch.";
    if(t.includes("tuna on 2 rice cakes")) return "Basic method: use drained tuna on rice cakes with a light dressing if needed. This is a quick protein snack, not a large meal.";
    if(t.includes("protein snack plate") || t.includes("protein snack box") || t.includes("protein snack list")) return "Basic method: choose one protein snack option rather than trying to make a full meal. Keep a few easy options ready for low-appetite days.";
    if(t.includes("cottage cheese")) return "Basic method: use cottage cheese with rice cakes, crackers or fruit as a quick protein snack when a full meal feels too much.";
    if(t.includes("protein shake") || t.includes("whey protein")) return "Basic method: use the protein powder you selected with low-fat milk or water. Add banana/oats only if tolerated, and sip slowly rather than forcing it down quickly.";
    if(t.includes("fruit of your choice") || /^[-• ]*(apple|banana|pineapple|grapes|berries|kiwi|peach|orange)/.test(t)) return `Basic method: use fruit as a light snack. If protein is low that day, pair it with ${yoghurt}, cottage cheese, eggs or another protein option.`;
    if(t.includes("fish and chips")) return `Basic method: grill or air-fry the fish and make potato or sweet potato chips in the air fryer. Keep the chips portion sensible and add salad or cooked vegetables. ${fishIdeasSentence(country)}`;
    if(t.includes("fish burger")) return `Basic method: use grilled fish on one ${breadBase} bun with salad and a low-calorie dressing. Add air-fried chips or salad if needed. ${fishIdeasSentence(country)}`;
    if(t.includes("whole wheat burger") || t.includes("wholemeal burger")) return `Basic method: use a lean patty or grilled fillet on one ${breadBase} bun with salad and a low-calorie dressing. Add air-fried chips or salad if needed.`;
    if(t.includes("paella")) return "Basic method: cook the protein with rice, mild spices and selected vegetables in one pan. Keep it paella-style and simple rather than oily or heavy.";
    if(t.includes("shawarma")) return "Basic method: season the protein lightly, add salad vegetables, and serve in a wrap or bowl with a light dressing.";
    if(t.includes("meatballs")) return "Basic method: make small lean meatballs, bake or pan-cook them, and serve with tomato-style sauce plus a modest pasta, rice or potato portion.";
    if(t.includes("stuffed pepper")) return "Basic method: fill peppers with lean protein, rice or couscous and vegetables, then bake until soft. Keep the filling protein-forward.";
    if(t.includes("fish cake")) return `Basic method: mix cooked fish with a little potato or egg to bind, shape into small cakes and pan-cook or air-fry. Serve with salad or vegetables. ${fishIdeasSentence(country)}`;
    if(t.includes("pasta salad")) return "Basic method: use a modest whole wheat pasta portion, add the protein clearly, and keep the dressing light rather than creamy or oily.";
    if(t.includes("fried rice-style")) return "Basic method: use cooked rice with egg, protein and vegetables. Keep oil light and avoid making it greasy.";
    if(t.includes("loaded potato")) return "Basic method: use a small potato or sweet potato, add the protein on top, and finish with salad vegetables or a light dressing.";
    if(t.includes("one-dish")) return "Basic method: add the protein, selected vegetables and starch to one oven dish with a little stock, tomato-style sauce or light sauce. Bake and portion into smaller servings.";
    if(t.includes("slow cooker peanut chicken")) return "Basic method: add chicken breast, a small measured spoon of peanut butter, soy/light seasoning, garlic/ginger and water or stock to a slow cooker. Cook until soft, shred, and serve in a small portion with rice and vegetables.";
    if(t.includes("one-dish chicken pasta") || t.includes("one-dish turkey pasta") || t.includes("oven pasta bake")) return "Basic method: add chicken or turkey pieces, selected vegetables and whole wheat pasta to one dish with stock, tomato-style sauce or water. Bake until cooked through, then portion smaller servings.";
    if(t.includes("bolognese")) return "Basic method: cook lean mince with onion, carrot, tomato and herbs. Serve with a sensible portion of pasta, potato or rice and keep the plate protein-first.";
    if(t.includes("burger bowl")) return "Basic method: cook lean mince or strips, serve over salad vegetables with potato/sweet potato wedges and a light burger-style sauce.";
    if(t.includes("fajita")) return "Basic method: cook the protein with peppers/onion and mild spices. Serve as a bowl or wrap with a light topping.";
    if(t.includes("taco-style")) return "Basic method: keep it simple: protein, mild seasoning, salad-style vegetables, a small starch portion and lemon/lime. Avoid making it greasy.";
    if(t.includes("tuna jacket")) return "Basic method: use one drained tin of tuna over a small baked potato or selected starch, with cooked vegetables or salad and a light dressing.";
    if(t.includes("cottage-pie")) return "Basic method: cook lean mince with tomato, onion and vegetables, then serve with potato or sweet potato as a cottage-pie style bowl without making it heavy.";
    if(t.includes("tray bake") || t.includes("roast-style")) return "Basic method: put the protein, vegetables and potato/sweet potato on one tray. Season simply, roast until cooked, and keep portions GLP-1 friendly.";
    if(t.includes("curry")) return "Basic method: use a mild tomato or light curry base, keep oil light, and serve with a sensible rice/potato portion.";
    if(t.includes("stir-fry")) return "Basic method: cook protein and vegetables quickly with light seasoning. Serve with rice or another selected starch if tolerated.";
    if(t.includes("soup")) return "Basic method: keep it warm, soft and simple. Add the selected protein clearly so it still supports protein.";
    if(t.includes("wrap")) return "Basic method: use one wrap with a protein portion, salad vegetables and a light dressing. Keep it easy to eat, not overloaded.";
    if(t.includes("beef strips") || t.includes("steak-style")) return "Basic method: cook lean beef strips simply and keep the portion protein-focused. Add vegetables and a sensible starch portion without making the plate too large.";
    if(t.includes("lemon-herb")) return "Basic method: season the protein with lemon, herbs and light seasoning. Bake, grill or pan-cook simply and serve with the selected vegetables and starch.";
    if(t.includes("bake-style bowl") || t.includes("one-dish chicken bowl") || t.includes("one-dish turkey bowl")) return "Basic method: use one dish or pan, add the protein, selected vegetables and starch with a little stock or sauce. Keep the final portion small and easy to reheat.";
    if(t.includes("rice bowl") || t.includes("protein bowl") || t.includes("loaded bowl")) return "Basic method: build a small bowl with the protein first, then add the selected vegetables and a sensible starch portion. Keep sauces light and easy to tolerate.";
    if(t.includes("jacket-style") || t.includes("potato plate")) return "Basic method: use a small potato or sweet potato, add the protein on top or beside it, and keep the vegetables simple. This should feel filling without becoming a huge meal.";
    if(t.includes("open sandwich") || t.includes("toast")) return "Basic method: keep the toast portion modest, add the protein clearly, and pair it with simple salad or cooked vegetables.";
    if(t.includes("gentle") || t.includes("soft") || t.includes("small warm") || t.includes("plain")) return "Basic method: keep this intentionally plain, warm and small. Choose soft-cooked vegetables and stop before the meal feels heavy.";
    if(t.includes("weekend")) return "Basic method: keep this easy and relaxed: one protein, one simple starch and vegetables you already tolerate. It should feel like normal food, not diet admin.";
    return "Basic method: keep the meal simple and protein-first. Use a normal portion of protein, add vegetables or fruit, and add the starch portion only as tolerated.";
  }

  function makeMeal({ slot, title, proteinId, extraProteinId, method, tags, supportAdjusted, recipeNote, mealId, family }){
    const proteinEstimate = Math.max(0, Math.round((PROTEIN_EST[proteinId] || 0) + (PROTEIN_EST[extraProteinId] || 0)));
    const cleanTitle = polishMealTitle(title, proteinId);
    const mealFamily = family || mealFamilyFromTitle(cleanTitle, method);
    const baseTags = ["baseline", mealFamily].concat(tags || []);
    let note = recipeNote || recipeNoteForTitle(cleanTitle, proteinId, method);
    if(isFishProtein(proteinId) && !/Fish ideas:/i.test(note || "")) note = `${note} ${fishIdeasSentence(CURRENT_ENGINE_COUNTRY)}`;
    note = localiseCopy(note, CURRENT_ENGINE_COUNTRY);
    note = String(note || "").replace(/yoghurt\/yogurt/gi, yoghurtLabel(CURRENT_ENGINE_COUNTRY)).replace(/light/g, "light").replace(/tomato/gi, "tomato");
    return {
      mealId: mealId || `${slot}_${slugify(cleanTitle)}`,
      mealType: slot,
      slot,
      templateId: `${slot}_${mealFamily || method || "meal"}`,
      title: cleanTitle,
      recipeNote: note,
      methodNote: note,
      proteinId: proteinId || null,
      extraProteinId: extraProteinId || null,
      family: mealFamily,
      method: method || mealFamily || "simple",
      proteinEstimate,
      proteinEstimateLabel: proteinEstimate ? `Approx. ${proteinEstimate}g protein` : "",
      tags: unique(baseTags),
      supportAdjusted: !!supportAdjusted
    };
  }

  function supportOrStruggle(profile, ctx, name){
    return ctx.supportTypes.includes(name) || profile.struggleMode === name;
  }

  function allowsWhey(profile){
    const breakfasts = profile.allowedBreakfastFamilies || [];
    const snacks = profile.allowedSnacks || [];
    const proteins = profile.allowedProteins || [];
    return breakfasts.includes("protein_shake") || snacks.includes("protein_shake") || proteins.includes("whey") || proteins.includes("protein_powder");
  }

  function selectedPoolHas(profile, ids){
    const pool = selectedProteinPool(profile);
    return ids.some(id => pool.includes(id));
  }

  function allowsFishBreakfast(profile){
    return selectedPoolHas(profile, ["salmon", "hake", "snoek", "cod", "haddock", "prawns", "seafood", "fish"]);
  }

  function allowsSalmonBreakfast(profile){
    return selectedPoolHas(profile, ["salmon"]);
  }

  function addUnique(target, values){
    values.forEach(v => { if(v && !target.includes(v)) target.push(v); });
  }

  function expandBreakfastFamilies(profile, ctx, gentle){
    const selected = profile.allowedBreakfastFamilies.length
      ? profile.allowedBreakfastFamilies.slice()
      : ["eggs", "egg_toast", "oats", "overnight_oats", "yoghurt_bowl", "cottage_cheese_bowl", "all_bran", "smoothie"];

    const wheyOk = allowsWhey(profile);
    const fishOk = allowsFishBreakfast(profile);
    const salmonOk = allowsSalmonBreakfast(profile);
    const breadOk = hasStarch(profile, "whole_wheat_bread");
    const wrapOk = hasStarch(profile, "whole_wheat_wraps");
    const beansOk = (profile.allowedProteins || []).includes("beans_lentils") || (profile.allowedProteins || []).includes("vegetarian") || (profile.allowedProteins || []).includes("legumes");

    const expanded = [];
    selected.forEach(f => {
      if(f === "eggs") addUnique(expanded, ["scrambled_eggs", "boiled_egg_plate", "omelette", "egg_muffin_cups"]);
      else if(f === "egg_toast") addUnique(expanded, [breadOk ? "egg_toast" : "boiled_egg_crackers", wrapOk ? "egg_wrap" : null, breadOk ? "avo_egg_toast" : null]);
      else if(f === "oats") addUnique(expanded, ["cooked_oats", "banana_oats", "baked_oats"]);
      else if(f === "overnight_oats") addUnique(expanded, ["overnight_oats", "apple_chia_overnight_oats"]);
      else if(f === "yoghurt_bowl") addUnique(expanded, ["yoghurt_fruit_bowl", "yoghurt_chia_bowl", "muesli_yoghurt_bowl"]);
      else if(f === "protein_yoghurt") addUnique(expanded, ["greek_yoghurt_bowl", "yoghurt_chia_bowl", "yoghurt_oats_bowl"]);
      else if(f === "cottage_cheese_bowl") addUnique(expanded, ["cottage_cheese_fruit_bowl", breadOk ? "cottage_cheese_toast" : "cottage_cheese_crackers", "cottage_cheese_chia_bowl"]);
      else if(f === "all_bran") addUnique(expanded, ["bran_flakes", "weetbix_yoghurt", "muesli_yoghurt_bowl"]);
      else if(f === "smoothie") addUnique(expanded, ["yoghurt_smoothie", "banana_yoghurt_smoothie"]);
      else if(f === "protein_shake") addUnique(expanded, wheyOk ? ["protein_shake", "whey_smoothie"] : ["yoghurt_smoothie"]);
      else addUnique(expanded, [f]);
    });

    // Only add savoury fish/bean options when the user's protein choices allow them.
    // This prevents salmon/fish language leaking into no-fish profiles.
    if(!profile.allowedBreakfastFamilies.length && !gentle){
      if(salmonOk && breadOk) addUnique(expanded, ["salmon_cottage_cheese_toast"]);
      else if(fishOk && breadOk) addUnique(expanded, ["fish_toast"]);
      if(beansOk && breadOk) addUnique(expanded, ["beans_egg_toast"]);
    }

    if(gentle){
      const chosen = profile.allowedBreakfastFamilies.length ? profile.allowedBreakfastFamilies.slice() : [];
      const allGentle = !chosen.length;
      const gentleSet = [];
      const choseAny = keys => allGentle || keys.some(k => chosen.includes(k));

      if(choseAny(["yoghurt_bowl", "protein_yoghurt", "smoothie", "all_bran"])) addUnique(gentleSet, ["mini_yoghurt_bowl", "yoghurt_smoothie", "yoghurt_chia_bowl", "yoghurt_fruit_bowl"]);
      if(choseAny(["cottage_cheese_bowl"])) addUnique(gentleSet, ["mini_cottage_cheese_bowl", "cottage_cheese_fruit_bowl", "cottage_cheese_chia_bowl", hasStarch(profile, "whole_wheat_bread") ? "cottage_cheese_toast" : "cottage_cheese_crackers"]);
      if(choseAny(["oats", "overnight_oats", "all_bran"])) addUnique(gentleSet, ["small_oats_bowl", "overnight_oats", "cooked_oats", "banana_oats"]);
      if(choseAny(["eggs", "egg_toast"])) addUnique(gentleSet, ["boiled_egg_mini_plate", "scrambled_eggs", "omelette", hasStarch(profile, "whole_wheat_bread") ? "egg_toast" : "boiled_egg_crackers", hasStarch(profile, "whole_wheat_wraps") ? "egg_wrap" : null]);
      if(wheyOk && choseAny(["protein_shake"])) addUnique(gentleSet, ["protein_shake", "whey_smoothie", "yoghurt_smoothie"]);

      // Respect the user's selected breakfast styles. Only use the broad default gentle pool when no breakfast style was selected.
      return gentleSet.length ? gentleSet : expanded;
    }

    return expanded.length ? expanded : ["scrambled_eggs", "cooked_oats", "yoghurt_fruit_bowl", "cottage_cheese_fruit_bowl", "overnight_oats"];
  }

  function chooseBreakfastFamily(families, ctx){
    // Prefer a family not used in the previous 3 breakfasts. If possible, also keep the week wide.
    const recentThree = ctx.weekState.recentBreakfast.slice(-3);
    let pool = families.filter(f => !recentThree.includes(f));
    if(!pool.length) pool = families.slice();
    const family = selectFrom(pool, ctx.dayIndex * 3, ctx.dayName) || pool[0] || "scrambled_eggs";
    pushLimited(ctx.weekState.recentBreakfast, family, 7);
    return family;
  }

  function chooseBreakfast(profile, ctx){
    const nausea = supportOrStruggle(profile, ctx, "nausea") || profile.struggleMode === "nausea_food_aversion";
    const lowAppetite = supportOrStruggle(profile, ctx, "low_appetite") || profile.struggleMode === "low_appetite";
    const noBreakfast = profile.noBreakfast || profile.struggleMode === "no_breakfast";
    const gentle = noBreakfast || lowAppetite || nausea;
    const families = expandBreakfastFamilies(profile, ctx, gentle);
    const family = chooseBreakfastFamily(families, ctx);

    const fruit = fruitLabel(pick(profile.allowedFruits, ctx.dayIndex));
    const fruit2 = fruitLabel(pick(profile.allowedFruits, ctx.dayIndex + 2));
    const yoghurt = yoghurtLabel(profile.country);
    const breakfastYoghurtProteinId = yoghurtProteinId(profile.country);
    const breakfastPrefix = noBreakfast ? "Light protein start: " : "";
    const bread = starchLabel("whole_wheat_bread", profile.country);
    const wrap = starchLabel("whole_wheat_wraps", profile.country);
    const toastOrCrackers = hasStarch(profile, "whole_wheat_bread") ? bread : "wholegrain crackers";
    const vegSoft = vegPhrase(profile, "soft", 2, ctx.dayIndex);
    const vegSalad = preferredVegPhrase(profile, ["tomato", "cucumber", "spinach", "mushrooms", "peppers"], 2, ctx.dayIndex, "salad");
    const supportAdjusted = gentle;

    switch(family){
      case "mini_yoghurt_bowl":
        return makeMeal({ slot:"breakfast", proteinId:breakfastYoghurtProteinId, method:"mini_yoghurt", family, tags:["bowl", "gentle", "small_portion"], supportAdjusted, title:`${breakfastPrefix}Small ${yoghurt} bowl with ${fruit}` });
      case "mini_cottage_cheese_bowl":
        return makeMeal({ slot:"breakfast", proteinId:"cottage_cheese", method:"mini_cottage_cheese", family, tags:["bowl", "gentle", "small_portion"], supportAdjusted, title:`${breakfastPrefix}Small cottage cheese bowl with ${fruit}` });
      case "small_oats_bowl":
        return makeMeal({ slot:"breakfast", proteinId:"oats_milk", method:"oats", family, tags:["bowl", "gentle", "small_portion"], supportAdjusted, title:`${breakfastPrefix}Small cooked oats bowl made with low-fat milk and ${fruit}` });
      case "boiled_egg_mini_plate":
        return makeMeal({ slot:"breakfast", proteinId:"eggs", method:"eggs", family, tags:["eggs", "gentle", "protein_first"], supportAdjusted, title:`${breakfastPrefix}1–2 boiled eggs with ${toastOrCrackers} and ${vegSalad}` });
      case "protein_shake":
        return makeMeal({ slot:"breakfast", proteinId:"whey", method:"protein_shake", family, tags:["shake", "protein_first", "low_effort"], supportAdjusted, title:`${breakfastPrefix}Whey protein shake made with low-fat milk or water${gentle ? "" : ` and ${fruit}`}` });
      case "whey_smoothie":
        return makeMeal({ slot:"breakfast", proteinId:breakfastYoghurtProteinId, extraProteinId:"whey", method:"smoothie", family, tags:["smoothie", "shake", "protein_first"], supportAdjusted, title:`${breakfastPrefix}${titleCase(yoghurt)} and whey smoothie with ${fruit}` });
      case "yoghurt_smoothie":
        return makeMeal({ slot:"breakfast", proteinId:breakfastYoghurtProteinId, method:"smoothie", family, tags:["smoothie", "light"], supportAdjusted, title:`${breakfastPrefix}${titleCase(yoghurt)} smoothie with ${fruit}` });
      case "banana_yoghurt_smoothie":
        return makeMeal({ slot:"breakfast", proteinId:breakfastYoghurtProteinId, method:"smoothie", family, tags:["smoothie", "light"], supportAdjusted, title:`${breakfastPrefix}${titleCase(yoghurt)} smoothie with banana and ${fruit2}` });
      case "scrambled_eggs":
        return makeMeal({ slot:"breakfast", proteinId:"eggs", method:"eggs", family, tags:["eggs", "protein_first"], supportAdjusted, title:`${breakfastPrefix}2 scrambled eggs with ${vegSoft}` });
      case "boiled_egg_plate":
        return makeMeal({ slot:"breakfast", proteinId:"eggs", method:"eggs", family, tags:["eggs", "protein_first"], supportAdjusted, title:`${breakfastPrefix}2 boiled eggs with ${vegSalad} and ${fruit}` });
      case "omelette":
        return makeMeal({ slot:"breakfast", proteinId:"eggs", method:"omelette", family, tags:["eggs", "protein_first"], supportAdjusted, title:`${breakfastPrefix}2-egg omelette with ${vegSoft}` });
      case "egg_muffin_cups":
        return makeMeal({ slot:"breakfast", proteinId:"eggs", method:"egg_muffins", family, tags:["eggs", "prep_ahead", "protein_first"], supportAdjusted, title:`${breakfastPrefix}Egg muffin cups with ${vegSoft}` });
      case "egg_toast":
        return makeMeal({ slot:"breakfast", proteinId:"eggs", method:"egg_toast", family, tags:["eggs", "toast", "protein_first"], supportAdjusted, title:`${breakfastPrefix}Boiled eggs on ${bread} with ${vegSalad}` });
      case "boiled_egg_crackers":
        return makeMeal({ slot:"breakfast", proteinId:"eggs", method:"egg_crackers", family, tags:["eggs", "protein_first", "low_effort"], supportAdjusted, title:`${breakfastPrefix}Boiled eggs with wholegrain crackers and ${vegSalad}` });
      case "egg_wrap":
        return makeMeal({ slot:"breakfast", proteinId:"eggs", method:"egg_wrap", family, tags:["eggs", "wrap", "protein_first"], supportAdjusted, title:`${breakfastPrefix}Scrambled egg ${wrap} with ${vegSalad}` });
      case "avo_egg_toast":
        return makeMeal({ slot:"breakfast", proteinId:"eggs", extraProteinId:"avocado_toast", method:"egg_toast", family, tags:["eggs", "toast", "higher_satiety"], supportAdjusted, title:`${breakfastPrefix}Egg and avocado on ${bread} with ${vegSalad}` });
      case "cooked_oats":
        return makeMeal({ slot:"breakfast", proteinId:"oats_milk", method:"oats", family, tags:["bowl"], supportAdjusted, title:`${breakfastPrefix}Cooked oats bowl made with low-fat milk and ${fruit}` });
      case "banana_oats":
        return makeMeal({ slot:"breakfast", proteinId:"oats_milk", method:"oats", family, tags:["bowl"], supportAdjusted, title:`${breakfastPrefix}Banana oats bowl made with low-fat milk` });
      case "baked_oats":
        return makeMeal({ slot:"breakfast", proteinId:"oats_milk", extraProteinId:breakfastYoghurtProteinId, method:"baked_oats", family, tags:["bowl", "prep_ahead"], supportAdjusted, title:`${breakfastPrefix}Small baked oats portion with ${yoghurt} on the side` });
      case "overnight_oats":
        return makeMeal({ slot:"breakfast", proteinId:"overnight_oats", extraProteinId:breakfastYoghurtProteinId, method:"overnight_oats", family, tags:["bowl", "prep_ahead"], supportAdjusted, title:`${breakfastPrefix}Overnight oats made with low-fat milk, ${yoghurt} and ${fruit}` });
      case "apple_chia_overnight_oats":
        return makeMeal({ slot:"breakfast", proteinId:"overnight_oats", extraProteinId:breakfastYoghurtProteinId, method:"overnight_oats", family, tags:["bowl", "prep_ahead"], supportAdjusted, title:`${breakfastPrefix}Apple chia overnight oats with ${yoghurt}` });
      case "yoghurt_fruit_bowl":
        return makeMeal({ slot:"breakfast", proteinId:breakfastYoghurtProteinId, method:"yoghurt", family, tags:["bowl", "protein_first"], supportAdjusted, title:`${breakfastPrefix}${titleCase(yoghurt)} bowl with ${fruit} and a small portion of oats` });
      case "yoghurt_chia_bowl":
        return makeMeal({ slot:"breakfast", proteinId:breakfastYoghurtProteinId, method:"yoghurt", family, tags:["bowl", "protein_first"], supportAdjusted, title:`${breakfastPrefix}${titleCase(yoghurt)} with chia seeds and ${fruit}` });
      case "muesli_yoghurt_bowl":
        return makeMeal({ slot:"breakfast", proteinId:breakfastYoghurtProteinId, method:"yoghurt", family, tags:["bowl"], supportAdjusted, title:`${breakfastPrefix}Small muesli bowl with ${yoghurt} and ${fruit}` });
      case "greek_yoghurt_bowl":
        return makeMeal({ slot:"breakfast", proteinId:breakfastYoghurtProteinId, method:"yoghurt", family, tags:["bowl", "protein_first"], supportAdjusted, title:`${breakfastPrefix}Higher-protein ${yoghurt} bowl with ${fruit}` });
      case "yoghurt_oats_bowl":
        return makeMeal({ slot:"breakfast", proteinId:breakfastYoghurtProteinId, extraProteinId:"oats_milk", method:"yoghurt", family, tags:["bowl", "protein_first"], supportAdjusted, title:`${breakfastPrefix}${titleCase(yoghurt)} and oats bowl with ${fruit}` });
      case "cottage_cheese_fruit_bowl":
        return makeMeal({ slot:"breakfast", proteinId:"cottage_cheese", method:"cottage_cheese", family, tags:["bowl", "soft", "protein_first"], supportAdjusted, title:`${breakfastPrefix}Cottage cheese bowl with ${fruit}` });
      case "cottage_cheese_toast":
        return makeMeal({ slot:"breakfast", proteinId:"cottage_cheese", method:"cottage_cheese_toast", family, tags:["toast", "protein_first"], supportAdjusted, title:`${breakfastPrefix}Cottage cheese on ${bread} with ${vegSalad}` });
      case "cottage_cheese_crackers":
        return makeMeal({ slot:"breakfast", proteinId:"cottage_cheese", method:"cottage_cheese_crackers", family, tags:["protein_first", "low_effort"], supportAdjusted, title:`${breakfastPrefix}Cottage cheese with wholegrain crackers and ${vegSalad}` });
      case "cottage_cheese_chia_bowl":
        return makeMeal({ slot:"breakfast", proteinId:"cottage_cheese", method:"cottage_cheese", family, tags:["bowl", "protein_first"], supportAdjusted, title:`${breakfastPrefix}Cottage cheese and chia bowl with ${fruit}` });
      case "bran_flakes":
        return makeMeal({ slot:"breakfast", proteinId:"all_bran_milk", method:"cereal", family, tags:["bowl"], supportAdjusted, title:`${breakfastPrefix}All-Bran / bran flakes bowl with low-fat milk and ${fruit}` });
      case "weetbix_yoghurt":
        return makeMeal({ slot:"breakfast", proteinId:"all_bran_milk", extraProteinId:breakfastYoghurtProteinId, method:"cereal", family, tags:["bowl"], supportAdjusted, title:`${breakfastPrefix}Weet-Bix / Weetabix with low-fat milk and ${yoghurt} on the side` });
      case "salmon_cottage_cheese_toast":
        return makeMeal({ slot:"breakfast", proteinId:"salmon", extraProteinId:"cottage_cheese", method:"salmon_toast", family, tags:["toast", "fish", "protein_first"], supportAdjusted, title:`${breakfastPrefix}Salmon and cottage cheese on ${bread} with ${vegSalad}` });
      case "fish_toast":
        return makeMeal({ slot:"breakfast", proteinId:countryFish(profile.country), extraProteinId:"cottage_cheese", method:"fish_toast", family, tags:["toast", "fish", "protein_first"], supportAdjusted, title:`${breakfastPrefix}${titleCase(proteinLabel(countryFish(profile.country), profile.country))} and cottage cheese on ${bread} with ${vegSalad}` });
      case "beans_egg_toast":
        return makeMeal({ slot:"breakfast", proteinId:"eggs", extraProteinId:"beans_lentils", method:"beans_egg_toast", family, tags:["toast", "higher_satiety"], supportAdjusted, title:`${breakfastPrefix}Beans and egg on ${bread} with ${vegSalad}` });
      default:
        return makeMeal({ slot:"breakfast", proteinId:"oats_milk", method:"oats", family:"cooked_oats", tags:["bowl"], supportAdjusted, title:`${breakfastPrefix}Cooked oats bowl made with low-fat milk and ${fruit}` });
    }
  }

  function chooseMainProtein(profile, ctx, avoidProtein){
    let pool = selectedMainProteinPool(profile).filter(Boolean);
    const nausea = ctx.supportTypes.includes("nausea") || profile.struggleMode === "nausea_food_aversion";
    if(nausea){
      const gentle = pool.filter(p => ["chicken", "hake", "cod", "haddock", "eggs", "tuna", "turkey"].includes(p));
      if(gentle.length) pool = gentle;
    }
    if(avoidProtein){
      const noSame = pool.filter(p => p !== avoidProtein);
      if(noSame.length) pool = noSame;
    }
    if(ctx.feedbackRules && ctx.feedbackRules.reduceProteins && ctx.feedbackRules.reduceProteins.length){
      const lessDisliked = pool.filter(p => !ctx.feedbackRules.reduceProteins.includes(p));
      if(lessDisliked.length) pool = lessDisliked;
    }
    if(ctx.feedbackRules && ctx.feedbackRules.preferProteins && ctx.feedbackRules.preferProteins.length && ctx.dayIndex % 3 === 0){
      const preferred = pool.filter(p => ctx.feedbackRules.preferProteins.includes(p));
      if(preferred.length) pool = preferred;
    }
    const noRecent = pool.filter(p => !ctx.weekState.recentProteins.slice(-2).includes(p));
    if(noRecent.length) pool = noRecent;

    let fishLimited = pool.filter(p => !isFishOrSeafoodProtein(p) || ctx.weekState.fishCount < 2);
    if(fishLimited.length) pool = fishLimited;
    if(ctx.weekState.proteinCounts){
      const notOverused = pool.filter(p => (ctx.weekState.proteinCounts[p] || 0) < (p === "chicken" ? 4 : p === "eggs" ? 3 : 2));
      if(notOverused.length) pool = notOverused;
    }
    if(ctx.weekState.tunaCount >= 1){
      const noTuna = pool.filter(p => p !== "tuna");
      if(noTuna.length) pool = noTuna;
    }

    const protein = selectFrom(pool, ctx.dayIndex, `${ctx.slot || "main"}_${ctx.dayName}`) || "chicken";
    pushLimited(ctx.weekState.recentProteins, protein, 3);
    if(isFishOrSeafoodProtein(protein) || protein === "tuna") ctx.weekState.fishCount += 1;
    if(protein === "tuna") ctx.weekState.tunaCount += 1;
    ctx.weekState.proteinCounts = ctx.weekState.proteinCounts || {};
    ctx.weekState.proteinCounts[protein] = (ctx.weekState.proteinCounts[protein] || 0) + 1;
    return protein;
  }

  function burgerBunLabel(profile){
    return `${breadBaseLabel(profile)} bun`;
  }

  function sandwichBreadLabel(profile){
    return `${breadBaseLabel(profile)} bread`;
  }

  function lunchTemplates(profile, ctx, protein){
    const p = proteinLabel(protein, profile.country);
    const salad = vegPhrase(profile, "salad", 3, ctx.dayIndex + 1);
    const mex = vegPhrase(profile, "mexican", 2, ctx.dayIndex + 2);
    const med = vegPhrase(profile, "mediterranean", 3, ctx.dayIndex + 3);
    const cooked = vegPhrase(profile, "soft", 2, ctx.dayIndex + 4);
    const stir = vegPhrase(profile, "stir_fry", 2, ctx.dayIndex + 5);
    const pastaVeg = vegPhrase(profile, "pasta", 2, ctx.dayIndex + 6);
    const hasBread = hasStarch(profile, "whole_wheat_bread");
    const hasWrap = hasStarch(profile, "whole_wheat_wraps");
    const hasRice = hasStarch(profile, "rice");
    const hasCouscous = hasStarch(profile, "couscous");
    const hasPasta = hasStarch(profile, "whole_wheat_pasta");
    const hasPotato = hasStarch(profile, "potato") || hasStarch(profile, "sweet_potato");
    const bowlKey = (hasRice || hasCouscous) ? chooseStarch(profile, ctx.dayIndex, ["rice", "couscous"]) : chooseStarch(profile, ctx.dayIndex, ["potato", "sweet_potato"]);
    const bowlStarch = starchLabel(bowlKey, profile.country);
    const potatoKey = chooseStarch(profile, ctx.dayIndex, ["potato", "sweet_potato", "rice", "couscous"]);
    const potato = starchLabel(potatoKey, profile.country);
    const bread = sandwichBreadLabel(profile);
    const sandwich = `${breadBaseLabel(profile)} sandwich`;
    const bun = burgerBunLabel(profile);
    const templates = [];
    const add = (title) => { if(title) templates.push(compact(title)); };
    const lightDressing = "light dressing";

    if(protein === "chicken" || protein === "turkey"){
      const bird = protein === "turkey" ? "turkey" : "chicken";
      add(`Grilled ${bird} salad bowl with ${salad} and ${lightDressing}`);
      if(hasBread) add(`${titleCase(bird)} mayo-style ${sandwich} with ${salad} and ${lightDressing}`);
      if(hasWrap) add(`${titleCase(bird)} Caesar-style ${starchLabel("whole_wheat_wraps", profile.country)} with ${salad} and ${lightDressing}`);
      if(hasRice || hasCouscous) add(`${titleCase(bird)} shawarma-style ${bowlStarch} bowl with ${med} and ${lightDressing}`);
      if(hasPasta) add(`${titleCase(bird)} pasta salad with ${pastaVeg} and a light dressing`);
      if(hasPotato) add(`${titleCase(bird)} loaded ${potato} plate with ${cooked} and ${lightDressing}`);
      if(hasBread) add(`${titleCase(bird)} burger on a ${bun} with ${salad} and a low-calorie dressing`);
    } else if(protein === "beef"){
      add(`Lean beef taco-style ${bowlStarch} bowl with ${mex} and ${lightDressing}`);
      if(hasBread) add(`Lean beef burger on a ${bun} with ${salad} and a low-calorie burger-style dressing`);
      if(hasBread) add(`Beef strips ${bread} open sandwich with ${med}`);
      if(hasWrap) add(`Lean beef fajita ${starchLabel("whole_wheat_wraps", profile.country)} with ${mex} and ${lightDressing}`);
      if(hasPotato) add(`Lean beef loaded ${potato} plate with ${cooked}`);
      add(`Lean beef burger bowl with ${salad} plus 1 portion ${potato}`);
    } else if(protein === "pork"){
      add(`Lean pork stir-fry lunch bowl with ${stir} plus 1 portion ${bowlStarch}`);
      if(hasWrap) add(`Lean pork ${starchLabel("whole_wheat_wraps", profile.country)} with ${salad} and ${lightDressing}`);
      if(hasBread) add(`Lean pork ${bread} open sandwich with ${med}`);
      if(hasPotato) add(`Lean pork potato plate with ${cooked}`);
    } else if(isFishProtein(protein)){
      add(`Grilled fish salad plate with ${salad} and a lemon light dressing`);
      if(hasBread) add(`Fish and cottage cheese open sandwich on ${bread} with ${salad}`);
      if(hasWrap) add(`Grilled fish ${starchLabel("whole_wheat_wraps", profile.country)} with ${salad} and a lemon light dressing`);
      if(hasPotato) add(`Grilled fish with ${potato} and ${cooked}`);
      if(hasRice || hasCouscous) add(`Lemon-herb fish plate with ${med} plus 1 portion ${bowlStarch}`);
      if(hasPasta) add(`Fish pasta salad with ${pastaVeg} and a light dressing`);
      if(hasBread) add(`Fish burger on a ${bun} with ${salad} and a low-calorie dressing`);
    } else if(protein === "prawns"){
      if(hasCouscous) add(`Prawn couscous-style salad with ${med} and a light dressing`);
      else add(`Prawn salad plate with ${med} and a light dressing`);
      if(hasBread) add(`Prawn and small avo ${sandwich} with ${salad} and low-fat dressing`);
      if(hasWrap) add(`Prawn avo-style ${starchLabel("whole_wheat_wraps", profile.country)} with ${salad} and low-fat dressing`);
      if(hasRice || hasCouscous) add(`Prawn ${bowlStarch} bowl with ${stir}`);
      if(hasPasta) add(`Prawn pasta salad with ${pastaVeg} and a light dressing`);
    } else if(protein === "tuna"){
      if(hasBread) add(`Tuna ${sandwich} with ${salad} and light dressing`);
      if(hasWrap) add(`Tuna salad ${starchLabel("whole_wheat_wraps", profile.country)} with ${salad}`);
      if(hasPotato) add(`Tuna loaded ${potato} plate with ${salad}`);
      if(hasPasta) add(`Tuna pasta salad with ${pastaVeg} and a light dressing`);
      add(`Tuna protein bowl with ${med} plus 1 portion ${bowlStarch}`);
    } else if(protein === "eggs"){
      if(hasBread) add(`Egg mayo-style ${sandwich} with ${salad} and light dressing`);
      if(hasWrap) add(`Egg salad ${starchLabel("whole_wheat_wraps", profile.country)} with ${salad}`);
      if(hasPotato) add(`Egg salad ${potato} bowl with ${salad}`);
      if(hasRice) add(`Egg fried rice-style lunch bowl with ${stir}`);
      add(`Frittata-style lunch plate with ${cooked} plus 1 portion ${bowlStarch}`);
    } else if(protein === "beans_lentils"){
      add(`Bean and lentil taco-style ${bowlStarch} bowl with ${mex}`);
      if(hasWrap) add(`Bean and lentil ${starchLabel("whole_wheat_wraps", profile.country)} with ${salad}`);
      if(hasPotato) add(`Bean and lentil loaded ${potato} plate with ${cooked}`);
    } else {
      add(`${titleCase(p)} salad bowl with ${salad} and ${lightDressing}`);
      if(hasBread) add(`${titleCase(p)} ${sandwich} with ${salad}`);
      if(hasWrap) add(`${titleCase(p)} ${starchLabel("whole_wheat_wraps", profile.country)} with ${salad}`);
      add(`${titleCase(p)} ${bowlStarch} bowl with ${cooked}`);
    }

    // Country profile nudges: these add familiar meal shapes without overriding user selections.
    const focus = marketProfile(profile.country).lunchFocus || [];
    if(focus.includes("jacket_potato") && hasPotato && ["chicken", "beef", "tuna", "eggs"].includes(protein)){
      add(`${titleCase(p)} jacket-style ${potato} with ${cooked} and a light dressing`);
    }
    if(focus.includes("turkey_burger") && protein === "turkey" && hasBread){
      add(`Turkey burger on a ${bun} with ${salad} and a low-calorie dressing`);
    }
    if(focus.includes("fish_chips") && isFishProtein(protein) && hasPotato){
      add(`Grilled fish with air-fried ${potato} and ${salad}`);
    }
    if(focus.includes("prawn_avo_wrap") && protein === "prawns" && hasWrap){
      add(`Prawn and small avo ${starchLabel("whole_wheat_wraps", profile.country)} with ${salad} and low-fat dressing`);
    }

    if(!templates.length){
      const style = lunchStyleForStarch(bowlKey, profile.country);
      templates.push(`${titleCase(p)} ${style.noun} with ${cooked} ${style.addon}`);
    }
    return templates;
  }

  function chooseLunch(profile, ctx, avoidProtein){
    ctx.slot = "lunch";
    const protein = chooseMainProtein(profile, ctx, avoidProtein);
    const nausea = ctx.supportTypes.includes("nausea") || profile.struggleMode === "nausea_food_aversion";
    const lowAppetite = ctx.supportTypes.includes("low_appetite") || profile.struggleMode === "low_appetite";
    const bloating = ctx.supportTypes.includes("bloating");
    const p = proteinLabel(protein, profile.country);
    const starch = starchLabel(chooseStarch(profile, ctx.dayIndex, ["rice", "potato", "sweet_potato", "whole_wheat_bread"]), profile.country);

    if(nausea){
      const vegs = vegPhrase(profile, "soft", 2, ctx.dayIndex);
      return makeMeal({ slot:"lunch", proteinId:protein, method:"gentle_plate", tags:["plain", "support"], supportAdjusted:true, title:`Gentle ${p} plate with soft-cooked ${vegs} plus a small portion of ${starch}` });
    }
    if(lowAppetite){
      const vegs = vegPhrase(profile, "soft", 1, ctx.dayIndex);
      return makeMeal({ slot:"lunch", proteinId:protein, method:"small_plate", tags:["small_portion", "support"], supportAdjusted:true, title:`Small ${p} protein plate with ${vegs}; add ${starch} only if tolerated` });
    }
    if(bloating){
      const vegs = vegPhrase(profile, "soft", 2, ctx.dayIndex);
      return makeMeal({ slot:"lunch", proteinId:protein, method:"warm_bowl", tags:["warm", "support"], supportAdjusted:true, title:`Warm ${p} bowl with cooked ${vegs} plus 1 portion ${starch}` });
    }

    const options = lunchTemplates(profile, ctx, protein);
    const unusedOptions = options.filter(title => !(ctx.weekState.usedMainTitles || []).includes(slugify(polishMealTitle(title, protein))));
    const lunchTitle = selectFrom(unusedOptions.length ? unusedOptions : options, ctx.dayIndex, protein);
    const lunchMeal = makeMeal({ slot:"lunch", proteinId:protein, method:"coherent_lunch", tags:["protein_first", "meal_idea"], supportAdjusted:false, title:lunchTitle });
    pushLimited(ctx.weekState.usedMainTitles, slugify(lunchMeal.title), 30);
    pushLimited(ctx.weekState.usedMainFamilies, lunchMeal.family, 30);
    return lunchMeal;
  }

  function dinnerTheme(dayIndex){
    if(dayIndex === 4) return "friday_fun";     // Friday
    if(dayIndex === 6) return "sunday_roast";   // Sunday
    if(dayIndex === 5) return "easy_weekend";   // Saturday
    return "weeknight";
  }

  function funDinner(profile, ctx, protein){
    const p = displayProteinForMealTitle(protein, profile.country);
    const mex = vegPhrase(profile, "mexican", 2, ctx.dayIndex);
    const pastaVeg = vegPhrase(profile, "pasta", 2, ctx.dayIndex + 1);
    const burgerVeg = preferredVegPhrase(profile, ["lettuce", "tomato", "cucumber", "onion"], 2, 0, "salad");
    const hasWrap = hasStarch(profile, "whole_wheat_wraps");
    const hasBread = hasStarch(profile, "whole_wheat_bread");
    const hasPasta = hasStarch(profile, "whole_wheat_pasta");
    const hasChips = hasStarch(profile, "potato") || hasStarch(profile, "sweet_potato");
    const funStarchKey = chooseStarch(profile, ctx.dayIndex, hasWrap ? ["whole_wheat_wraps", "rice", "potato", "sweet_potato"] : ["rice", "potato", "sweet_potato", "couscous"]);
    const chipsKey = hasChips ? chooseRequiredStarch(profile, ctx.dayIndex, ["potato", "sweet_potato"], ["potato", "sweet_potato"]) : chooseStarch(profile, ctx.dayIndex, ["rice", "couscous"]);
    const chips = starchLabel(chipsKey, profile.country);
    const burgerSide = hasChips ? `air-fried ${chips}` : `1 portion ${chips}`;
    const sauce = hasVeg(profile, "tomato") ? "a light tomato-style sauce" : "a light savoury sauce";

    if(["beef", "chicken", "turkey"].includes(protein)){
      if(hasBread) return `Friday night ${p} burger on a ${burgerBunLabel(profile)} with ${burgerVeg}, a low-calorie dressing and ${burgerSide}`;
      return `Friday night ${p} burger bowl with ${burgerVeg}, a light burger-style sauce plus ${burgerSide}`;
    }
    if(["hake", "snoek", "cod", "haddock", "salmon"].includes(protein)){
      if(hasChips) return `Friday night fish and chips: grilled fish with air-fried ${chips} and ${burgerVeg}`;
      if(hasBread) return `Friday night fish burger on a ${burgerBunLabel(profile)} with ${burgerVeg} and a low-calorie dressing`;
      return `Friday night fish taco-style plate with ${mex}, ${plusStarch(funStarchKey, profile.country)} and a squeeze of lemon`;
    }
    if(protein === "prawns"){
      if(hasWrap) return `Friday night prawn fajita-style ${starchLabel("whole_wheat_wraps", profile.country)} with ${mex} and a light topping`;
      if(hasStarch(profile, "rice")) return `Friday night prawn paella-style rice bowl with ${mex} and a squeeze of lemon`;
      return `Friday night prawn ${starchLabel(funStarchKey, profile.country)} bowl with ${mex} and a squeeze of lemon`;
    }
    if(protein === "pork"){
      if(hasBread) return `Friday night lean pork burger on a ${burgerBunLabel(profile)} with ${burgerVeg} and a low-calorie dressing`;
      return `Friday night lean pork fajita-style bowl with ${mex}, ${plusStarch(funStarchKey, profile.country)} and a light topping`;
    }
    if(protein === "tuna"){
      if(hasPasta){
        return `Friday night tuna pasta bowl with ${pastaVeg}, ${sauce} plus 1 portion ${starchLabel("whole_wheat_pasta", profile.country)}`;
      }
      const bowlStarch = chooseStarch(profile, ctx.dayIndex, ["rice", "potato", "sweet_potato", "couscous"]);
      return `Friday night tuna loaded ${starchLabel(bowlStarch, profile.country)} plate with ${mex} and a light dressing`;
    }
    if(protein === "eggs"){
      return `Friday night frittata plate with ${mex} plus 1 portion ${starchLabel(funStarchKey, profile.country)}`;
    }
    return `Friday night ${p} loaded bowl with ${mex}, ${plusStarch(funStarchKey, profile.country)} and a lighter takeaway-style feel`;
  }

  function sundayRoast(profile, ctx, protein){
    const p = proteinLabel(protein, profile.country);
    const roastVeg = vegPhrase(profile, "roast", 3, ctx.dayIndex);
    const hasPotato = hasStarch(profile, "potato") || hasStarch(profile, "sweet_potato");
    const starchKey = chooseStarch(profile, ctx.dayIndex, ["potato", "sweet_potato", "rice", "couscous"]);
    const starch = starchLabel(starchKey, profile.country);
    if(protein === "eggs"){
      return `Sunday savoury egg bake with ${roastVeg} plus a small portion of ${starch}`;
    }
    if(protein === "tuna"){
      if(hasPotato){
        const potatoKey = chooseRequiredStarch(profile, ctx.dayIndex, ["potato", "sweet_potato"]);
        return `Sunday tuna jacket-style ${starchLabel(potatoKey, profile.country)} plate with ${roastVeg}`;
      }
      return `${starchKey === "rice" ? "Sunday tuna rice-style bowl" : "Sunday tuna protein bowl"} with ${roastVeg} plus 1 portion ${starch}`;
    }
    if(["hake", "snoek", "cod", "haddock", "salmon", "prawns"].includes(protein)){
      return `Sunday lemon-herb fish tray bake with ${roastVeg} plus 1 portion ${starch}`;
    }
    return `Sunday roast-style ${p} plate with ${roastVeg} plus 1 portion ${starch}`;
  }

  function weeknightDinner(profile, ctx, protein){
    const p = proteinLabel(protein, profile.country);
    const stir = vegPhrase(profile, "stir_fry", 3, ctx.dayIndex);
    const med = vegPhrase(profile, "mediterranean", 3, ctx.dayIndex + 1);
    const pastaVeg = vegPhrase(profile, "pasta", 2, ctx.dayIndex + 2);
    const curryVeg = vegPhrase(profile, "curry", 2, ctx.dayIndex + 3);
    const roastVeg = vegPhrase(profile, "roast", 2, ctx.dayIndex + 4);
    const mex = vegPhrase(profile, "mexican", 2, ctx.dayIndex + 5);
    const salad = vegPhrase(profile, "salad", 3, ctx.dayIndex + 6);
    const hasBread = hasStarch(profile, "whole_wheat_bread");
    const hasWrap = hasStarch(profile, "whole_wheat_wraps");
    const hasPasta = hasStarch(profile, "whole_wheat_pasta");
    const hasRice = hasStarch(profile, "rice");
    const hasCouscous = hasStarch(profile, "couscous");
    const hasChips = hasStarch(profile, "potato") || hasStarch(profile, "sweet_potato");
    const riceKey = chooseStarch(profile, ctx.dayIndex, ["rice", "couscous", "potato", "sweet_potato"]);
    const rice = starchLabel(riceKey, profile.country);
    const pasta = starchLabel(hasPasta ? "whole_wheat_pasta" : chooseStarch(profile, ctx.dayIndex, ["rice", "potato", "sweet_potato", "couscous"]), profile.country);
    const potatoKey = chooseStarch(profile, ctx.dayIndex, ["potato", "sweet_potato", "rice", "couscous"]);
    const potato = starchLabel(potatoKey, profile.country);
    const chipsKey = hasChips ? chooseRequiredStarch(profile, ctx.dayIndex, ["potato", "sweet_potato"], ["potato", "sweet_potato"]) : chooseStarch(profile, ctx.dayIndex, ["rice", "couscous"]);
    const chips = starchLabel(chipsKey, profile.country);
    const burgerSide = hasChips ? `air-fried ${chips}` : `1 portion ${chips}`;

    const templates = [];
    const add = (title) => { if(title) templates.push(compact(title)); };

    if(protein === "beef"){
      if(hasPasta) add(`Lean beef bolognese-style bowl with ${pastaVeg} plus 1 portion ${pasta}`);
      else add(`${hasVeg(profile, "tomato") ? "Lean beef tomato mince bowl" : "Lean beef savoury mince bowl"} with ${pastaVeg} plus 1 portion ${pasta}`);
      add(`Simple cottage-pie style beef bowl with ${roastVeg} plus 1 portion ${potato}`);
      add(`Lean beef taco bowl with ${mex} plus 1 portion ${rice}`);
      add(`Lean beef meatballs with ${pastaVeg} plus 1 portion ${pasta}`);
      add(`Lean beef stuffed peppers with ${med} plus 1 portion ${rice}`);
      if(hasBread) add(`Lean beef burger on a ${burgerBunLabel(profile)} with ${salad}, a low-calorie dressing and ${burgerSide}`);
      add(`Steak-style beef strips with ${roastVeg} plus 1 portion ${potato}`);
    } else if(protein === "chicken" || protein === "turkey"){
      const bird = protein === "turkey" ? "turkey" : "chicken";
      if(protein === "chicken" && !feedbackAvoids(ctx, "peanut") && !feedbackAvoids(ctx, "rich")) add(`Slow cooker peanut chicken with ${stir} plus 1 portion ${rice}`);
      if(hasPasta) add(`One-dish ${bird} pasta bake with ${pastaVeg} plus 1 portion ${pasta}`);
      else add(`One-dish ${bird} bowl with ${pastaVeg} plus 1 portion ${pasta}`);
      add(`Lemon-herb ${p} tray bake with ${roastVeg} plus 1 portion ${potato}`);
      add(`Mild ${p} curry bowl with ${curryVeg} plus 1 portion ${rice}`);
      add(`${titleCase(p)} stir-fry with ${stir} plus 1 portion ${rice}`);
      if(hasRice) add(`${titleCase(bird)} paella-style rice bowl with ${mex} plus 1 portion ${rice}`);
      else add(`${titleCase(bird)} one-pan ${rice} bowl with ${mex}`);
      if(hasWrap) add(`${titleCase(bird)} shawarma-style ${starchLabel("whole_wheat_wraps", profile.country)} with ${salad} and a light dressing`);
      else add(`${titleCase(bird)} shawarma-style bowl with ${salad} plus 1 portion ${rice}`);
      if(hasBread) add(`${titleCase(bird)} burger on a ${burgerBunLabel(profile)} with ${salad}, a low-calorie dressing and ${burgerSide}`);
      if(hasChips) add(`Oven-style ${bird} strips with air-fried ${chips} and ${salad}`);
      if(protein === "turkey") add(`Turkey meatballs with ${pastaVeg} plus 1 portion ${pasta}`);
    } else if(protein === "pork"){
      add(`Lean pork stir-fry with ${stir} plus 1 portion ${rice}`);
      add(`Apple-style pork plate with ${roastVeg} plus 1 portion ${potato}`);
      if(hasBread) add(`Lean pork burger on a ${burgerBunLabel(profile)} with ${salad} and a low-calorie dressing`);
      if(hasWrap) add(`Lean pork fajita ${starchLabel("whole_wheat_wraps", profile.country)} with ${mex} and a light topping`);
    } else if(isFishProtein(protein)){
      add(`Lemon-herb fish with ${roastVeg} plus 1 portion ${potato}`);
      if(hasRice) add(`Paella-style fish rice with ${mex} and a squeeze of lemon`);
      else if(hasCouscous) add(`Mediterranean fish couscous plate with ${med}`);
      if(hasChips) add(`Fish and chips: grilled fish with air-fried ${chips} and ${salad}`);
      if(hasBread) add(`Fish burger on a ${burgerBunLabel(profile)} with ${salad} and a low-calorie dressing`);
      add(`Fish cakes with ${salad} plus 1 portion ${potato}`);
      if(hasPasta) add(`Fish pasta with ${pastaVeg} and a light tomato-style sauce`);
    } else if(protein === "prawns"){
      add(`Prawn stir-fry bowl with ${stir} plus 1 portion ${rice}`);
      add(`Mediterranean prawn bowl with ${med} plus 1 portion ${rice}`);
      if(hasRice) add(`Prawn paella-style rice with ${mex}`);
      else add(`Prawn one-pan ${rice} bowl with ${mex}`);
      if(hasPasta) add(`Light prawn pasta with ${pastaVeg}`);
      if(hasWrap) add(`Prawn fajita ${starchLabel("whole_wheat_wraps", profile.country)} with ${mex} and a light dressing`);
      if(hasBread) add(`Prawn and small avo ${breadBaseLabel(profile)} sandwich with ${salad} and low-fat dressing`);
    } else if(protein === "tuna"){
      if(hasPasta) add(`Tuna pasta bake-style bowl with ${pastaVeg} plus 1 portion ${pasta}`);
      else add(`Tuna bake-style bowl with ${pastaVeg} plus 1 portion ${pasta}`);
      if(hasStarch(profile, "potato") || hasStarch(profile, "sweet_potato")){
        const jacketKey = chooseRequiredStarch(profile, ctx.dayIndex, ["potato", "sweet_potato"]);
        add(`Tuna jacket-style ${starchLabel(jacketKey, profile.country)} with ${med}`);
      }
      add(`Tuna ${riceKey === "rice" ? "rice-style" : "protein"} bowl with ${med} plus 1 portion ${rice}`);
    } else if(protein === "eggs"){
      const eggStarchKey = chooseStarch(profile, ctx.dayIndex, ["potato", "sweet_potato", "rice", "whole_wheat_pasta", "couscous"]);
      const eggStarch = starchLabel(eggStarchKey, profile.country);
      add(`Vegetable omelette plate with ${stir} plus 1 portion ${eggStarch}`);
      add(`Frittata plate with ${med} plus 1 portion ${eggStarch}`);
      add(`Egg fried rice-style bowl with ${stir}`);
      add(`Egg-and-veg bake with ${curryVeg} plus 1 portion ${eggStarch}`);
      if(hasPasta) add(`Egg-and-veg pasta bowl with ${pastaVeg} plus 1 portion ${starchLabel("whole_wheat_pasta", profile.country)}`);
    } else if(protein === "beans_lentils"){
      add(`Bean and lentil taco bowl with ${mex} plus 1 portion ${rice}`);
      add(`Bean and lentil stuffed peppers with ${med} plus 1 portion ${rice}`);
      add(`Mild bean and lentil curry bowl with ${curryVeg} plus 1 portion ${rice}`);
    } else {
      add(`${titleCase(p)} stir-fry with ${stir} plus 1 portion ${rice}`);
      add(`${titleCase(p)} tray bake with ${roastVeg} plus 1 portion ${potato}`);
      if(hasBread) add(`${titleCase(p)} burger on a ${burgerBunLabel(profile)} with ${salad} and a low-calorie dressing`);
    }
    const dinnerFocus = marketProfile(profile.country).dinnerFocus || [];
    if(dinnerFocus.includes("turkey_burger") && protein === "turkey" && hasBread){
      add(`Turkey burger on a ${burgerBunLabel(profile)} with ${salad}, a low-calorie dressing and ${burgerSide}`);
    }
    if(dinnerFocus.includes("prawn_paella") && protein === "prawns" && hasRice){
      add(`Prawn paella-style rice with ${mex} and a light one-pan method`);
    }
    if(dinnerFocus.includes("fish_chips") && isFishProtein(protein) && hasChips){
      add(`Fish and chips: grilled fish with air-fried ${chips} and ${salad}`);
    }

    return selectFrom(templates, ctx.dayIndex, protein) || `${titleCase(p)} plate with ${roastVeg} plus 1 portion ${potato}`;
  }

  function chooseDinner(profile, ctx, avoidProtein){
    ctx.slot = "dinner";
    const theme = dinnerTheme(ctx.dayIndex);
    const protein = chooseMainProtein(profile, ctx, avoidProtein);
    const nausea = ctx.supportTypes.includes("nausea") || profile.struggleMode === "nausea_food_aversion";
    const lowAppetite = ctx.supportTypes.includes("low_appetite") || profile.struggleMode === "low_appetite";
    const bloating = ctx.supportTypes.includes("bloating");
    const exhaustion = ctx.supportTypes.includes("exhaustion");
    const p = proteinLabel(protein, profile.country);

    if(nausea){
      const variants = hasStarch(profile, "whole_wheat_bread")
        ? ["gentle_plate", "warm_soup", "soft_bowl", "toast_plate", "plain_protein_bowl", "soft_tray", "small_warm_plate"]
        : ["gentle_plate", "warm_soup", "soft_bowl", "plain_protein_bowl", "soft_tray", "small_warm_plate", "simple_rice_plate"];
      const variant = variants[ctx.dayIndex % variants.length];
      const vegs = vegPhrase(profile, "soft", 2, ctx.dayIndex + 3);
      const starchKey = chooseStarch(profile, ctx.dayIndex, ["rice", "potato", "sweet_potato", "whole_wheat_bread", "couscous"]);
      const starch = starchLabel(starchKey, profile.country);
      if(variant === "warm_soup") return makeMeal({ slot:"dinner", proteinId:protein, method:"warm_soup", family:"soup", tags:["plain", "support", "gentle"], supportAdjusted:true, title:`Warm ${p} soup-style bowl with soft-cooked ${vegs} and a small ${starch} portion` });
      if(variant === "soft_bowl") return makeMeal({ slot:"dinner", proteinId:protein, method:"soft_bowl", family:"soft_bowl", tags:["plain", "support", "small_portion"], supportAdjusted:true, title:`Soft ${p} bowl with ${vegs} plus a small portion of ${starch}` });
      if(variant === "toast_plate"){
        const bread = starchLabel("whole_wheat_bread", profile.country);
        return makeMeal({ slot:"dinner", proteinId:protein, method:"toast_plate", family:"toast_plate", tags:["plain", "support", "low_effort"], supportAdjusted:true, title:`Simple ${p} on ${bread} with ${vegs}` });
      }
      if(variant === "plain_protein_bowl") return makeMeal({ slot:"dinner", proteinId:protein, method:"plain_protein_bowl", family:"plain_protein_bowl", tags:["plain", "support", "protein_first"], supportAdjusted:true, title:`Plain ${p} protein bowl with soft ${vegs} plus a small portion of ${starch}` });
      if(variant === "soft_tray") return makeMeal({ slot:"dinner", proteinId:protein, method:"soft_tray", family:"soft_tray", tags:["plain", "support", "simple"], supportAdjusted:true, title:`Soft ${p} tray-style meal with ${vegs} plus a small portion of ${starch}` });
      if(variant === "small_warm_plate") return makeMeal({ slot:"dinner", proteinId:protein, method:"small_warm_plate", family:"small_warm_plate", tags:["plain", "support", "small_portion"], supportAdjusted:true, title:`Small warm ${p} plate with ${vegs} plus a little ${starch}` });
      if(variant === "simple_rice_plate") return makeMeal({ slot:"dinner", proteinId:protein, method:"simple_rice_plate", family:"simple_rice_plate", tags:["plain", "support"], supportAdjusted:true, title:`Simple ${p} plate with ${vegs} and a small ${starch} portion` });
      return makeMeal({ slot:"dinner", proteinId:protein, method:"gentle_plate", family:"gentle_plate", tags:["plain", "support"], supportAdjusted:true, title:`Gentle ${p} plate with soft-cooked ${vegs} plus a small portion of ${starch}` });
    }
    if(lowAppetite){
      const variants = ["small_plate", "protein_snack_plate", "mini_bowl", "warm_soup", "small_tray", "simple_protein_bowl", "light_supper_plate"];
      const variant = variants[ctx.dayIndex % variants.length];
      const vegs = vegPhrase(profile, "soft", 1, ctx.dayIndex + 3);
      const starchKey = chooseStarch(profile, ctx.dayIndex, ["potato", "rice", "whole_wheat_bread", "sweet_potato", "couscous"]);
      const starch = starchLabel(starchKey, profile.country);
      if(variant === "protein_snack_plate") return makeMeal({ slot:"dinner", proteinId:protein, method:"protein_snack_plate", family:"protein_snack_plate", tags:["small_portion", "support", "protein_first"], supportAdjusted:true, title:`Small ${p} protein snack plate with ${vegs}; add ${starch} only if tolerated` });
      if(variant === "mini_bowl") return makeMeal({ slot:"dinner", proteinId:protein, method:"mini_bowl", family:"mini_bowl", tags:["small_portion", "support"], supportAdjusted:true, title:`Mini ${p} bowl with ${vegs} plus a small portion of ${starch}` });
      if(variant === "warm_soup") return makeMeal({ slot:"dinner", proteinId:protein, method:"warm_soup", family:"soup", tags:["small_portion", "support", "warm"], supportAdjusted:true, title:`Small warm ${p} soup-style bowl with ${vegs} and a little ${starch}` });
      if(variant === "small_tray") return makeMeal({ slot:"dinner", proteinId:protein, method:"small_tray", family:"small_tray", tags:["small_portion", "support", "simple"], supportAdjusted:true, title:`Small ${p} tray-style supper with ${vegs} plus a little ${starch}` });
      if(variant === "simple_protein_bowl") return makeMeal({ slot:"dinner", proteinId:protein, method:"simple_protein_bowl", family:"simple_protein_bowl", tags:["small_portion", "support", "protein_first"], supportAdjusted:true, title:`Simple ${p} protein bowl with ${vegs}; add ${starch} if appetite allows` });
      if(variant === "light_supper_plate") return makeMeal({ slot:"dinner", proteinId:protein, method:"light_supper_plate", family:"light_supper_plate", tags:["small_portion", "support"], supportAdjusted:true, title:`Light ${p} supper plate with ${vegs} plus a small ${starch} portion` });
      return makeMeal({ slot:"dinner", proteinId:protein, method:"small_plate", family:"small_plate", tags:["small_portion", "support"], supportAdjusted:true, title:`Small ${p} dinner plate with ${vegs} plus a small portion of ${starch}` });
    }
    if(bloating){
      const variants = ["warm_bowl", "soft_plate", "simple_tray", "gentle_stir_fry", "cooked_bowl", "soft_supper", "warm_plate"];
      const variant = variants[ctx.dayIndex % variants.length];
      const vegs = vegPhrase(profile, "soft", 2, ctx.dayIndex + 3);
      const starch = starchLabel(chooseStarch(profile, ctx.dayIndex, ["rice", "potato", "sweet_potato", "couscous"]), profile.country);
      if(variant === "soft_plate") return makeMeal({ slot:"dinner", proteinId:protein, method:"soft_plate", family:"soft_plate", tags:["warm", "support"], supportAdjusted:true, title:`Soft-cooked ${p} plate with ${vegs} plus 1 portion ${starch}` });
      if(variant === "simple_tray") return makeMeal({ slot:"dinner", proteinId:protein, method:"simple_tray", family:"tray_bake", tags:["warm", "support", "simple"], supportAdjusted:true, title:`Simple ${p} tray-style meal with cooked ${vegs} plus 1 portion ${starch}` });
      if(variant === "gentle_stir_fry") return makeMeal({ slot:"dinner", proteinId:protein, method:"gentle_stir_fry", family:"stir_fry", tags:["warm", "support"], supportAdjusted:true, title:`Gentle ${p} stir-fry with cooked ${vegs} plus 1 portion ${starch}` });
      if(variant === "cooked_bowl") return makeMeal({ slot:"dinner", proteinId:protein, method:"cooked_bowl", family:"cooked_bowl", tags:["warm", "support"], supportAdjusted:true, title:`Cooked ${p} bowl with ${vegs} plus 1 portion ${starch}` });
      if(variant === "soft_supper") return makeMeal({ slot:"dinner", proteinId:protein, method:"soft_supper", family:"soft_supper", tags:["warm", "support", "gentle"], supportAdjusted:true, title:`Soft ${p} supper with cooked ${vegs} and 1 portion ${starch}` });
      if(variant === "warm_plate") return makeMeal({ slot:"dinner", proteinId:protein, method:"warm_plate", family:"warm_plate", tags:["warm", "support"], supportAdjusted:true, title:`Warm ${p} plate with ${vegs} plus 1 portion ${starch}` });
      return makeMeal({ slot:"dinner", proteinId:protein, method:"warm_bowl", family:"warm_bowl", tags:["warm", "support"], supportAdjusted:true, title:`Warm ${p} bowl with cooked ${vegs} plus 1 portion ${starch}` });
    }
    if(exhaustion){
      const variants = hasStarch(profile, "whole_wheat_wraps")
        ? ["low_effort_bowl", "easy_wrap", "tray_bake", "simple_plate", "quick_stir_fry", "shortcut_supper", "one_pan_plate"]
        : ["low_effort_bowl", "tray_bake", "simple_plate", "quick_stir_fry", "shortcut_supper", "one_pan_plate", "easy_rice_bowl"];
      const variant = variants[ctx.dayIndex % variants.length];
      const vegs = vegPhrase(profile, "stir_fry", 2, ctx.dayIndex + 3);
      const starchKey = chooseStarch(profile, ctx.dayIndex, ["rice", "whole_wheat_wraps", "potato", "sweet_potato", "couscous"]);
      const starch = starchLabel(starchKey, profile.country);
      if(variant === "easy_wrap" && hasStarch(profile, "whole_wheat_wraps")) return makeMeal({ slot:"dinner", proteinId:protein, method:"easy_wrap", family:"wrap", tags:["quick", "support", "low_effort"], supportAdjusted:true, title:`Easy ${p} wrap with ${vegs} and a light dressing` });
      if(variant === "tray_bake") return makeMeal({ slot:"dinner", proteinId:protein, method:"tray_bake", family:"tray_bake", tags:["quick", "support", "low_effort"], supportAdjusted:true, title:`Low-effort ${p} tray bake with ${vegs} plus 1 portion ${starch}` });
      if(variant === "simple_plate") return makeMeal({ slot:"dinner", proteinId:protein, method:"simple_plate", family:"simple_plate", tags:["quick", "support", "low_effort"], supportAdjusted:true, title:`Simple ${p} plate with ${vegs} plus 1 portion ${starch}` });
      if(variant === "quick_stir_fry") return makeMeal({ slot:"dinner", proteinId:protein, method:"quick_stir_fry", family:"stir_fry", tags:["quick", "support", "low_effort"], supportAdjusted:true, title:`Quick ${p} stir-fry with ${vegs} plus 1 portion ${starch}` });
      if(variant === "shortcut_supper") return makeMeal({ slot:"dinner", proteinId:protein, method:"shortcut_supper", family:"shortcut_supper", tags:["quick", "support", "low_effort"], supportAdjusted:true, title:`Shortcut ${p} supper with ${vegs} plus 1 portion ${starch}` });
      if(variant === "one_pan_plate") return makeMeal({ slot:"dinner", proteinId:protein, method:"one_pan_plate", family:"one_pan_plate", tags:["quick", "support", "low_effort"], supportAdjusted:true, title:`One-pan ${p} plate with ${vegs} plus 1 portion ${starch}` });
      if(variant === "easy_rice_bowl") return makeMeal({ slot:"dinner", proteinId:protein, method:"easy_rice_bowl", family:"easy_rice_bowl", tags:["quick", "support", "low_effort"], supportAdjusted:true, title:`Easy ${p} plate with ${vegs} plus 1 portion ${starch}` });
      return makeMeal({ slot:"dinner", proteinId:protein, method:"low_effort_plate", family:"low_effort_plate", tags:["quick", "support", "low_effort"], supportAdjusted:true, title:`Low-effort ${p} plate with ${vegs} plus 1 portion ${starch}` });
    }

    let title;
    let tags = ["protein_first", "meal_idea"];
    if(theme === "friday_fun"){
      title = funDinner(profile, ctx, protein);
      tags.push("friday_fun");
    } else if(theme === "sunday_roast"){
      title = sundayRoast(profile, ctx, protein);
      tags.push("sunday_roast");
    } else if(theme === "easy_weekend"){
      const starchKey = chooseStarch(profile, ctx.dayIndex, ["rice", "potato", "sweet_potato", "couscous", "whole_wheat_pasta", "whole_wheat_wraps", "whole_wheat_bread"]);
      const starch = starchLabel(starchKey, profile.country);
      const vegs = vegPhrase(profile, "mediterranean", 2, ctx.dayIndex);
      if(starchKey === "whole_wheat_wraps") title = `Easy weekend ${p} wrap with ${vegs} and a light dressing`;
      else if(starchKey === "whole_wheat_bread") title = `Easy weekend ${p} open sandwich with ${vegs}`;
      else title = `Easy weekend ${p} plate with ${vegs} plus 1 portion ${starch}`;
      tags.push("easy_weekend");
    } else {
      title = weeknightDinner(profile, ctx, protein);
    }
    pushLimited(ctx.weekState.recentDinnerMethods, theme, 3);
    const dinnerMeal = makeMeal({ slot:"dinner", proteinId:protein, method:theme, tags, supportAdjusted:false, title });
    if(ctx.weekState && ctx.weekState.usedMainTitles){ pushLimited(ctx.weekState.usedMainTitles, slugify(dinnerMeal.title), 30); }
    if(ctx.weekState && ctx.weekState.usedMainFamilies){ pushLimited(ctx.weekState.usedMainFamilies, dinnerMeal.family, 30); }
    return dinnerMeal;
  }

  function snackCandidates(profile, ctx){
    const fruit = fruitLabel(pick(profile.allowedFruits, ctx.dayIndex + 1));
    const yoghurt = yoghurtLabel(profile.country);
    const jerky = profile.country === "ZA" ? "biltong" : (profile.country === "US" || profile.country === "CA" ? "beef jerky" : "biltong / beef jerky");
    const candidates = [
      { key:"low_fat_yoghurt", title:`1 cup ${yoghurt}`, proteinId:yoghurtProteinId(profile.country), method:"yoghurt" },
      { key:"protein_yoghurt", title:`${titleCase(yoghurt)} protein bowl with ${fruit}`, proteinId:yoghurtProteinId(profile.country), method:"protein_yoghurt" },
      { key:"cottage_cheese", title:"Cottage cheese on rice cakes or crackerbread", proteinId:"cottage_cheese", method:"cottage_cheese" },
      { key:"cottage_cheese_fruit", title:`Cottage cheese with ${fruit}`, proteinId:"cottage_cheese", method:"cottage_cheese" },
      { key:"fruit", title:`${fruit} or a fruit of your choice`, proteinId:null, method:"fruit" },
      { key:"biltong", title:`A small portion of ${jerky}`, proteinId:"biltong", method:"single_protein" },
      { key:"nuts_seeds", title:"A small handful of nuts and seeds", proteinId:"nuts", method:"nuts" },
      { key:"boiled_eggs", title:"1–2 boiled eggs", proteinId:"eggs", method:"eggs" },
      { key:"salmon_crackers", title:"Fish on crackers or rice cakes", proteinId:"fish", method:"fish" },
      { key:"tuna_rice_cakes", title:"Tuna on 2 rice cakes", proteinId:"tuna", method:"tuna" },
      { key:"protein_shake", title:"Protein shake with water or low-fat milk if tolerated", proteinId:"whey", method:"protein_shake", requiresWhey:true },
      { key:"protein_snack_box", title:"Protein snack box: boiled egg, cottage cheese and fruit", proteinId:"eggs", extraProteinId:"cottage_cheese", method:"protein_snack_box" }
    ];
    let allowed = profile.allowedSnacks || [];
    if(!allowed.length) allowed = candidates.map(c => c.key);
    let pool = candidates.filter(c => allowed.includes(c.key) || (c.key === "protein_yoghurt" && profile.struggleMode === "protein_hard") || (c.key === "protein_snack_box" && profile.struggleMode === "protein_hard"));
    if(!allowsWhey(profile)) pool = pool.filter(c => !c.requiresWhey && c.proteinId !== "whey" && c.extraProteinId !== "whey");
    const selectedProteins = selectedProteinPool(profile);
    const tunaExplicit = selectedProteins.includes("tuna") || profile.allowedSnacks.includes("tuna_rice_cakes");
    if(!tunaExplicit){
      pool = pool.filter(c => c.proteinId !== "tuna");
    }
    if(ctx.supportTypes.includes("nausea") || profile.struggleMode === "nausea_food_aversion"){
      const gentle = pool.filter(c => ["low_fat_yoghurt", "cottage_cheese", "boiled_eggs", "fruit", "protein_shake"].includes(c.key));
      if(gentle.length) pool = gentle;
    }
    if(profile.struggleMode === "protein_hard" || profile.struggleMode === "simple_structure" || profile.struggleMode === "not_sure_what_to_eat" || !profile.allowedSnacks.length){
      const proteinFirst = pool.filter(c => c.proteinId && !["fruit", "nuts"].includes(c.proteinId));
      if(proteinFirst.length) pool = proteinFirst;
    }
    return pool.length ? pool : candidates;
  }

  function chooseSnack(profile, ctx){
    if(profile.snackEnabled === false) return null;
    let pool = snackCandidates(profile, ctx);
    if(Array.isArray(ctx.avoidSnackProteins) && ctx.avoidSnackProteins.length){
      const noRepeat = pool.filter(c => !c.proteinId || !ctx.avoidSnackProteins.includes(c.proteinId));
      if(noRepeat.length) pool = noRepeat;
    }
    const noRecentSnack = pool.filter(c => !ctx.weekState.recentSnacks.slice(-3).includes(c.key));
    if(noRecentSnack.length) pool = noRecentSnack;
    let chosen = selectFrom(pool, ctx.dayIndex, `snack_${ctx.dayName}`);
    if(chosen && chosen.proteinId === "whey" && ctx.weekState.wheyCount >= 2) chosen = pool.find(c => c.proteinId !== "whey") || chosen;
    if(chosen && chosen.proteinId === "tuna" && ctx.weekState.tunaSnackCount >= 1) chosen = pool.find(c => c.proteinId !== "tuna") || chosen;
    if(chosen && isFishProtein(chosen.proteinId) && (ctx.weekState.fishSnackDayCount || 0) >= 2) chosen = pool.find(c => !isFishProtein(c.proteinId)) || chosen;
    if(chosen && chosen.proteinId === "whey") ctx.weekState.wheyCount += 1;
    if(chosen && chosen.proteinId === "tuna") ctx.weekState.tunaSnackCount = (ctx.weekState.tunaSnackCount || 0) + 1;
    if(chosen && isFishProtein(chosen.proteinId)) ctx.weekState.fishSnackDayCount = (ctx.weekState.fishSnackDayCount || 0) + 1;
    pushLimited(ctx.weekState.recentSnacks, chosen.key, 4);
    return makeMeal({ slot:"snack", proteinId:chosen.proteinId, extraProteinId:chosen.extraProteinId, method:chosen.method, tags:[chosen.method, chosen.proteinId ? "protein_option" : "light", chosen.key === "protein_shake" ? "shake" : ""].filter(Boolean), supportAdjusted:ctx.supportTypes.length > 0, title:chosen.title });
  }


  function snackIdeaBank(profile, ctx){
    profile = normalizeProfile(profile || {});
    ctx = ctx || {};
    const country = profile.country;
    const yoghurt = yoghurtLabel(country);
    const jerky = jerkyLabel(country);
    const fruit = fruitLabel(pick(profile.allowedFruits, (ctx.dayIndex || 0) + 1));
    const allowedProteins = selectedProteinPool(profile);
    const snacks = profile.allowedSnacks || [];
    const noSnackPrefs = !snacks.length;
    const allow = (key) => noSnackPrefs || snacks.includes(key);
    const hasProtein = (key) => allowedProteins.includes(key);
    const shakeAllowed = allowsWhey(profile) && allow("protein_shake");
    const eggAllowed = hasProtein("eggs") || allow("boiled_eggs");
    const tunaAllowed = hasProtein("tuna") || snacks.includes("tuna_rice_cakes");
    const fishAllowed = hasProtein("salmon") || hasProtein("hake") || hasProtein("snoek") || hasProtein("cod") || hasProtein("haddock") || hasProtein("fish") || snacks.includes("salmon_crackers");
    const salmonAllowed = fishAllowed;
    const chickenAllowed = hasProtein("chicken");
    const cottageAllowed = allow("cottage_cheese") || allow("cottage_cheese_fruit");
    const yoghurtAllowed = allow("low_fat_yoghurt") || allow("protein_yoghurt");
    const jerkyAllowed = allow("biltong") || hasProtein("beef");

    const ideas = [
      { id:"shake_water", title:"Protein shake", protein:"Approx. 24g", note:"Mix one scoop with water or low-fat milk and sip slowly.", tags:["shake","low_appetite","quick","no_cook"], allowed:shakeAllowed },
      { id:"shake_banana", title:`Protein shake with ${fruit}`, protein:"Approx. 24–30g", note:"Blend or shake protein powder with low-fat milk/water and a small portion of fruit.", tags:["shake","sweet","low_appetite"], allowed:shakeAllowed },
      { id:"iced_coffee_shake", title:"Iced coffee protein shake", protein:"Approx. 24–30g", note:"Use cold coffee, protein powder and low-fat milk or water. Keep it small if nausea is active.", tags:["shake","sweet","quick"], allowed:shakeAllowed },
      { id:"yoghurt_whey", title:`${titleCase(yoghurt)} protein bowl`, protein:"Approx. 25–35g", note:`Use the highest-protein ${yoghurt} option available and add berries or fruit.`, tags:["sweet","protein_hard","low_appetite"], allowed:yoghurtAllowed },
      { id:"yoghurt_fruit", title:`${titleCase(yoghurt)} with ${fruit}`, protein:"Approx. 12–20g", note:"A simple sweet option when a full meal feels too much.", tags:["sweet","gentle","low_appetite"], allowed:yoghurtAllowed },
      { id:"overnight_protein_oats", title:"Protein overnight oats", protein:"Approx. 22–32g", note:`Mix oats, low-fat milk and ${yoghurt}. Use a small bowl if appetite is low.`, tags:["sweet","prep_ahead","breakfast_style"], allowed:yoghurtAllowed || shakeAllowed },
      { id:"cottage_crackers", title:"Cottage cheese with crackers or rice cakes", protein:"Approx. 15–22g", note:"Spoon cottage cheese onto crackers/rice cakes and add cucumber or fruit.", tags:["no_cook","gentle","savoury"], allowed:cottageAllowed },
      { id:"cottage_fruit", title:`Cottage cheese with ${fruit}`, protein:"Approx. 15–22g", note:"A soft sweet-savoury snack that works well when chewing meat feels heavy.", tags:["gentle","sweet","low_appetite"], allowed:cottageAllowed },
      { id:"fish_crackers", title:"Fish on crackers or rice cakes", protein:"Approx. 18–28g", note:`Use cooked or smoked fish with crackers/rice cakes, cucumber and a light dressing. ${fishIdeasSentence(profile.country)}`, tags:["savoury","no_cook","fish","protein_hard"], allowed:fishAllowed },
      { id:"fish_cottage", title:"Fish and cottage cheese snack plate", protein:"Approx. 23–35g", note:`Pair cooked fish with cottage cheese and cucumber for a softer savoury snack. ${fishIdeasSentence(profile.country)}`, tags:["savoury","fish","protein_hard"], allowed:fishAllowed && cottageAllowed },
      { id:"fish_leftovers", title:"Leftover fish snack plate", protein:"Approx. 18–28g", note:`Use a small leftover portion of fish you already tolerate. ${fishIdeasSentence(profile.country)}`, tags:["leftovers","savoury","fish"], allowed:fishAllowed },
      { id:"cottage_tuna", title:"Tuna and cottage cheese bowl", protein:"Approx. 30–40g", note:"Mix drained tuna with cottage cheese and cucumber. Use a smaller portion if very full.", tags:["protein_hard","no_cook","savoury","tuna"], allowed:cottageAllowed && tunaAllowed },
      { id:"boiled_eggs", title:"2 boiled eggs", protein:"Approx. 12g", note:"Keep boiled eggs in the fridge for a simple grab-and-go protein backup.", tags:["quick","no_cook","gentle"], allowed:eggAllowed },
      { id:"egg_crackers", title:"Egg mayo on crackers", protein:"Approx. 12–16g", note:`Mash boiled egg with a small spoon of light mayo or ${yoghurt} and add crackers.`, tags:["savoury","simple_recipe"], allowed:eggAllowed },
      { id:"egg_yoghurt", title:`Boiled egg plus ${yoghurt}`, protein:"Approx. 20–28g", note:`Use one boiled egg with a ${yoghurt} cup when protein is hard to reach.`, tags:["protein_hard","quick"], allowed:eggAllowed && yoghurtAllowed },
      { id:"tuna_rice_cakes", title:"Tuna on rice cakes", protein:"Approx. 24g", note:"Use drained tuna on two rice cakes with cucumber or a light dressing.", tags:["no_cook","savoury","protein_hard","tuna"], allowed:tunaAllowed },
      { id:"tuna_snack_bowl", title:"Tuna snack bowl", protein:"Approx. 24–30g", note:"Tuna with cucumber, tomato/salad greens if selected, and a light dressing.", tags:["no_cook","savoury","tuna"], allowed:tunaAllowed },
      { id:"tuna_wrap_half", title:"Half tuna wrap", protein:"Approx. 20–28g", note:"Use tuna, salad and light dressing in half a wrap if wraps sit well.", tags:["savoury","portable","tuna"], allowed:tunaAllowed && hasStarch(profile,"whole_wheat_wraps") },
      { id:"chicken_strips", title:"Leftover chicken strips", protein:"Approx. 25–30g", note:"Cook extra chicken at dinner and keep strips ready for a quick protein top-up.", tags:["leftovers","savoury","protein_hard"], allowed:chickenAllowed },
      { id:"chicken_crackers", title:"Chicken on crackers", protein:"Approx. 20–28g", note:"Use shredded chicken on crackers/rice cakes with cucumber or a light dressing.", tags:["leftovers","savoury"], allowed:chickenAllowed },
      { id:"chicken_soup_cup", title:"Small chicken soup cup", protein:"Approx. 15–25g", note:"Add shredded chicken to soup for a warmer, easier option on rough appetite days.", tags:["warm","gentle","nausea","exhaustion"], allowed:chickenAllowed },
      { id:"biltong", title:`Small portion of ${jerky}`, protein:"Approx. 15–25g", note:"Easy salty protein backup. Keep portions modest and drink water.", tags:["no_cook","savoury","portable"], allowed:jerkyAllowed },
      { id:"biltong_cottage", title:`${titleCase(jerky)} with cottage cheese`, protein:"Approx. 25–35g", note:"A small snack plate when you need something savoury and higher protein.", tags:["protein_hard","savoury"], allowed:jerkyAllowed && cottageAllowed },
      { id:"nuts_yoghurt", title:`${titleCase(yoghurt)} with nuts or seeds`, protein:"Approx. 15–22g", note:`Add a small sprinkle of nuts or seeds to the ${yoghurt}. Avoid a huge portion if nausea is active.`, tags:["sweet","higher_satiety"], allowed:yoghurtAllowed },
      { id:"peanut_yoghurt", title:`Peanut butter ${yoghurt} bowl`, protein:"Approx. 14–22g", note:`Stir a small spoon of peanut butter into ${yoghurt}. Richer option, so skip if nausea is active.`, tags:["sweet","rich","higher_satiety"], allowed:yoghurtAllowed && allow("peanut_butter") },
      { id:"snack_box", title:"Protein snack box", protein:"Approx. 20–35g", note:`Choose two protein options you tolerate, such as ${yoghurt}, eggs, cottage cheese${chickenAllowed ? ", chicken" : ""}${jerkyAllowed ? ", " + jerky : ""}${shakeAllowed ? ", or a shake" : ""}.`, tags:["protein_hard","mix_and_match","no_cook"], allowed:true },
      { id:"cant_face_food", title:"Can’t-face-food backup", protein:"Approx. 10–25g", note:`Choose the easiest tolerated option: ${yoghurt}${shakeAllowed ? ", a small shake" : ""}, cottage cheese, or soup with a protein you tolerate.`, tags:["low_appetite","nausea","gentle"], allowed:true }
    ];
    // JS does not support Python-style "and"; this string is repaired below if minifiers do not run.
    ideas.forEach(item => { item.allowed = Boolean(item.allowed); });
    return ideas;
  }

  function snackGroup(item){
    const id = String(item.id || "").toLowerCase();
    const tags = item.tags || [];
    if(tags.includes("shake") || id.includes("shake")) return "shake";
    if(tags.includes("tuna") || id.includes("tuna")) return "tuna";
    if(tags.includes("fish") || id.includes("salmon") || id.includes("fish")) return "fish";
    if(id.includes("yoghurt") || id.includes("yogurt")) return "yoghurt";
    if(id.includes("cottage")) return "cottage";
    if(id.includes("egg")) return "egg";
    if(id.includes("chicken")) return "chicken";
    if(id.includes("biltong") || id.includes("jerky")) return "jerky";
    return "other";
  }

  function generateDailyProteinSnacks(profile, ctx, count){
    profile = normalizeProfile(profile || {});
    ctx = ctx || {};
    count = count || 5;
    const supportTypes = Array.isArray(ctx.supportTypes) ? ctx.supportTypes : [];
    const nauseaActive = supportTypes.includes("nausea") || profile.struggleMode === "nausea_food_aversion";
    const lowAppetite = supportTypes.includes("low_appetite") || profile.struggleMode === "low_appetite";
    const proteinHard = profile.struggleMode === "protein_hard";
    let pool = snackIdeaBank(profile, ctx).filter(item => item.allowed !== false);
    const selectedProteinsForSnacks = selectedProteinPool(profile);
    const nonFishProteinCount = selectedProteinsForSnacks.filter(p => !isFishProtein(p) && p !== "tuna" && p !== "whey" && p !== "protein_powder").length;
    const fishOnlyOrMostlyFish = selectedProteinsForSnacks.some(isFishProtein) && nonFishProteinCount < 2;
    const fishSnackDayAllowed = fishOnlyOrMostlyFish || [1, 5].includes(ctx.dayIndex || 0);
    if(!fishSnackDayAllowed) pool = pool.filter(item => snackGroup(item) !== "fish");
    const tunaSnackDayAllowed = [3].includes(ctx.dayIndex || 0);
    if(!tunaSnackDayAllowed) pool = pool.filter(item => snackGroup(item) !== "tuna");

    if(nauseaActive){
      const gentle = pool.filter(item => item.tags.includes("gentle") || item.tags.includes("warm") || item.tags.includes("nausea") || item.tags.includes("shake"));
      if(gentle.length >= count) pool = gentle;
    } else if(lowAppetite){
      const small = pool.filter(item => item.tags.includes("low_appetite") || item.tags.includes("gentle") || item.tags.includes("shake") || item.tags.includes("warm") || item.tags.includes("no_cook"));
      if(small.length >= count) pool = small;
    } else if(proteinHard){
      const high = pool.filter(item => item.tags.includes("protein_hard") || /24|25|28|30|35|40/.test(item.protein || ""));
      if(high.length >= count) pool = high;
    }

    if(!pool.length) pool = snackIdeaBank(profile, ctx).filter(item => item.allowed !== false);
    const dayIndex = ctx.dayIndex || 0;
    const rotated = pool.map((item, index) => ({ item, index, group: snackGroup(item) }))
      .sort((a, b) => {
        const groupOrder = ["yoghurt", "cottage", "egg", "fish", "chicken", "jerky", "shake", "tuna", "other"];
        const aGroup = groupOrder.indexOf(a.group); const bGroup = groupOrder.indexOf(b.group);
        const aScore = (aGroup === -1 ? 99 : aGroup) + ((a.index + dayIndex * 2) % 7) / 10;
        const bScore = (bGroup === -1 ? 99 : bGroup) + ((b.index + dayIndex * 2) % 7) / 10;
        return aScore - bScore;
      });

    const start = (dayIndex * 2) % Math.max(1, rotated.length);
    const ordered = rotated.slice(start).concat(rotated.slice(0, start));
    const out = [];
    const groupCounts = {};
    const maxPerGroup = { shake: 1, tuna: 1, fish: 1 };

    for(const entry of ordered){
      const item = entry.item;
      const group = entry.group;
      if(out.find(existing => existing.id === item.id)) continue;
      if(maxPerGroup[group] && (groupCounts[group] || 0) >= maxPerGroup[group]) continue;
      out.push({ id:item.id, title:item.title, protein:item.protein, note:item.note, tags:item.tags });
      groupCounts[group] = (groupCounts[group] || 0) + 1;
      if(out.length >= count) break;
    }

    if(out.length < count){
      for(const entry of ordered){
        const item = entry.item;
        if(out.length >= count) break;
        if(!out.find(existing => existing.id === item.id)) out.push({ id:item.id, title:item.title, protein:item.protein, note:item.note, tags:item.tags });
      }
    }

    if(out.length < count){
      const emergency = [
        { id:"universal_yoghurt", title:`Protein ${yoghurt} cup`, protein:"Approx. 12–25g", note:`Choose the highest-protein ${yoghurt} you tolerate.`, tags:["backup","gentle"] },
        { id:"universal_eggs", title:"Boiled egg backup", protein:"Approx. 6–12g", note:"Use one or two eggs if they sit well for you.", tags:["backup","simple"] },
        { id:"universal_cottage", title:"Cottage cheese backup", protein:"Approx. 12–18g", note:"Use with crackers, rice cakes, cucumber or fruit.", tags:["backup","gentle"] },
        { id:"universal_leftovers", title:"Leftover lean protein snack", protein:"Approx. 15–30g", note:"Use a small leftover portion of chicken, lean meat, eggs, beans or a protein you already tolerate.", tags:["backup","leftovers"] }
      ];
      for(const item of emergency){
        if(out.length >= count) break;
        if(!out.find(existing => existing.id === item.id)) out.push(item);
      }
    }
    return out.slice(0, count);
  }

  function proteinSnackList(profile){
    profile = normalizeProfile(profile || {});
    const yoghurt = yoghurtLabel(profile.country);
    const jerky = jerkyLabel(profile.country);
    const allowedProteins = selectedProteinPool(profile);
    const salmonOk = allowedProteins.some(isFishProtein) || profile.allowedSnacks.includes("salmon_crackers");
    const tunaOk = allowedProteins.includes("tuna") || profile.allowedSnacks.includes("tuna_rice_cakes");
    const wheyOk = allowsWhey(profile);
    const base = [
      { title:`${yoghurt} bowl`, protein:"Approx. " + PROTEIN_EST[yoghurtProteinId(profile.country)] + "g", note:"easy when a full meal feels too much" },
      { title:"Cottage cheese with crackers/rice cakes", protein:"Approx. 15g", note:"soft, quick and repeatable" },
      { title:"2 boiled eggs", protein:"Approx. 12g", note:"simple fridge backup" },
      salmonOk ? { title:"Fish on crackers/rice cakes", protein:"Approx. 18–28g", note:fishIdeasSentence(profile.country).replace(/^Fish ideas: /, "local options: ") } : null,
      { title:`Small portion of ${jerky}`, protein:"Approx. 15g", note:"salty, easy backup; keep portions modest" },
      { title:"Leftover chicken strips", protein:"Approx. 25–30g", note:"use from dinner leftovers for an easy top-up" },
      wheyOk ? { title:"Protein shake", protein:"Approx. 24g", note:"use water or low-fat milk and sip slowly" } : null,
      tunaOk ? { title:"Tuna on rice cakes", protein:"Approx. 24g", note:"quick backup if you actually chose tuna" } : null
    ].filter(Boolean);
    return base.filter(item => {
      const t = item.title.toLowerCase();
      if(t.includes("chicken") && !allowedProteins.includes("chicken")) return false;
      if(t.includes("egg") && !allowedProteins.includes("eggs") && profile.allowedSnacks.length && !profile.allowedSnacks.includes("boiled_eggs")) return false;
      return true;
    }).slice(0, 6);
  }

  function boosterOptions(profile){
    const allowed = selectedProteinPool(profile);
    const options = [];
    if(profile.allowedSnacks.includes("low_fat_yoghurt") || !profile.allowedSnacks.length) options.push(profile.country === "US" || profile.country === "CA" ? "Greek yogurt" : "low-fat yoghurt");
    if(profile.allowedSnacks.includes("cottage_cheese") || !profile.allowedSnacks.length) options.push("cottage cheese");
    if(allowed.includes("eggs") || profile.allowedSnacks.includes("boiled_eggs")) options.push("2 boiled eggs");
    if(allowed.some(isFishProtein) || profile.allowedSnacks.includes("salmon_crackers")) options.push("fish on crackers/rice cakes");
    if(allowed.includes("tuna") || profile.allowedSnacks.includes("tuna_rice_cakes")) options.push("tuna on rice cakes");
    if(allowed.includes("chicken")) options.push("extra chicken");
    if(allowsWhey(profile)) options.push("a small protein shake if tolerated");
    return unique(options).slice(0, 5);
  }

  function addDayMeta(day, profile){
    const meals = [day.breakfast, day.lunch, day.snack, day.dinner].filter(Boolean);
    const total = meals.reduce((sum, m) => sum + Number(m.proteinEstimate || 0), 0);
    day.estimatedProteinTotal = total;
    day.estimatedProteinLabel = `Approx. ${total}g protein for the day`;
    day.proteinDisclaimer = PROTEIN_DISCLAIMER;
    day.proteinSnackList = proteinSnackList(profile);
    const snackDayIndex = Math.max(0, DAY_NAMES.indexOf(day.dayName || ""));
    day.proteinSnackIdeas = generateDailyProteinSnacks(profile, { dayIndex: snackDayIndex, dayName: day.dayName, supportTypes: day.supportMode ? [day.supportMode] : [] }, 5);
    if(total > 0 && total < LOW_PROTEIN_THRESHOLD){
      day.proteinBooster = `Protein booster option: add ${boosterOptions(profile).join(", ")}.`;
    } else if(profile.struggleMode === "protein_hard" && total < 85){
      day.proteinBooster = `Protein backup: keep ${boosterOptions(profile).slice(0, 3).join(", ")} available in case appetite drops.`;
    }
    return day;
  }

  function buildDay(profile, ctx){
    ctx.dayName = DAY_NAMES[ctx.dayIndex];
    const breakfast = chooseBreakfast(profile, ctx);
    const lunch = chooseLunch(profile, ctx, breakfast ? breakfast.proteinId : null);
    const dinner = chooseDinner(profile, ctx, lunch ? lunch.proteinId : null);
    ctx.avoidSnackProteins = [lunch && lunch.proteinId, dinner && dinner.proteinId].filter(Boolean);
    const snack = chooseSnack(profile, ctx);
    const date = new Date(ctx.startDate); date.setDate(ctx.startDate.getDate() + ctx.dayIndex);
    const supportAdjusted = [breakfast, lunch, dinner, snack].filter(Boolean).some(m => m.supportAdjusted);
    const theme = dinnerTheme(ctx.dayIndex);
    const themeLabel = theme === "friday_fun" ? "Friday night meal" : theme === "sunday_roast" ? "Sunday roast-style meal" : theme === "easy_weekend" ? "Easy weekend meal" : null;
    return addDayMeta({
      date: iso(date),
      dayName: DAY_NAMES[ctx.dayIndex],
      theme,
      themeLabel,
      breakfast,
      lunch,
      dinner,
      snack,
      supportAdjusted,
      supportMode: ctx.supportTypes[0] || null
    }, profile);
  }

  function buildWeek(args={}){
    const rawProfile = Object.assign({}, args.profile || {});
    if(args.struggleMode && !rawProfile.struggleMode) rawProfile.struggleMode = args.struggleMode;
    if(args.struggle && !rawProfile.struggle) rawProfile.struggle = args.struggle;
    const profile = normalizeProfile(rawProfile);
    CURRENT_ENGINE_COUNTRY = profile.country || "ZA";
    const supportMode = args.supportMode || args.adjustments?.supportMode || null;
    const supportTypes = activeSupportTypes(supportMode);
    const feedbackRules = feedbackRulesFrom(args.feedback || args.mealFeedback || args.adjustments?.feedback || []);
    const weekState = args.weekState || makeWeekState();
    const startDate = weekStartDate();
    const days = [];
    for(let i=0; i<7; i++){
      days.push(buildDay(profile, { dayIndex:i, weekState, supportTypes, feedbackRules, startDate, mode: normalizeMode(args.mode) }));
    }
    return days;
  }

  function generateWeekPlan(args={}){
    return {
      days: buildWeek(args),
      proteinDisclaimer: PROTEIN_DISCLAIMER,
      proteinSnackList: proteinSnackList(normalizeProfile((args && args.profile) || {})),
      proteinSnackIdeas: generateDailyProteinSnacks(normalizeProfile((args && args.profile) || {}), { dayIndex: 0, supportTypes: activeSupportTypes(args.supportMode || args.adjustments?.supportMode || null) }, 5),
      mode: normalizeMode(args.mode),
      version: "HeartyFreeMealEngineV24HumanPolish"
    };
  }

  function regenerateDay(args={}){
    const days = buildWeek({ profile: args.profile || {}, supportMode: args.supportMode || args.adjustments?.supportMode || null, mode: args.mode || "full_app", struggleMode: args.struggleMode, feedback: args.feedback || args.mealFeedback || args.adjustments?.feedback || [] });
    return days[args.dayIndex || 0] || null;
  }

  function swapMeal(args={}){
    const day = regenerateDay(args);
    if(!day) return null;
    if(args.slot === "breakfast") return day.breakfast;
    if(args.slot === "lunch") return day.lunch;
    if(args.slot === "dinner") return day.dinner;
    if(args.slot === "snack") return day.snack;
    return null;
  }

  const api = {
    version: "HeartyFreeMealEngineV24HumanPolish",
    proteinDisclaimer: PROTEIN_DISCLAIMER,
    buildWeek,
    generateWeekPlan,
    regenerateDay,
    swapMeal,
    normalizeFeedback,
    feedbackRulesFrom,
    createMealFeedback,
    proteinSnackList,
    generateDailyProteinSnacks,
    snackIdeaBank,
    marketProfile
  };

  if(typeof module !== "undefined" && module.exports) module.exports = api;
  if(typeof window !== "undefined"){
    window.HeartySharedMealEngineV2 = api;
    window.HeartySharedMealEngineV3 = api;
    window.HeartySharedMealEngineV4 = api;
    window.HeartySharedMealEngineV5 = api;
    // Compatibility layer: existing pages still call window.HeartyMealsEngineV6.
    window.HeartyMealsEngineV6 = api;
  }
})();
