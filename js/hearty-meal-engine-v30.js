(function (global) {
  "use strict";

  const VERSION = "v30-mvp-no-egg-snack-on-egg-breakfast";
  const REQUIRED_RECIPE_FIELDS = [
    "id",
    "name",
    "family",
    "protein",
    "protein_type",
    "prep_method",
    "ingredients",
    "main_vegetables",
    "accessories",
    "starchy_accessory",
    "carb",
    "sauce_or_dressing",
    "country_aliases",
    "equipment",
    "effort",
    "day_fit",
    "meal_type",
    "low_appetite_default",
    "rough_day_possible",
    "nausea_default",
    "fat_level",
    "salt_level",
    "spice_level",
    "contains_dairy",
    "contains_fish",
    "contains_egg",
    "contains_pork",
    "contains_gluten",
    "leftover_friendly",
    "meal_prep_friendly",
    "swap_group",
    "swap_candidates",
    "render_template",
    "instruction",
    "shopping_list_items",
    "display_portion",
    "client_instruction",
    "slot_bias",
    "protein_group",
    "meal_family"
  ];

  const COUNTRIES = {
    south_africa: {
      label: "South Africa",
      standard_fish: "hake",
      secondary_fish: ["haddock", "snoek", "kingklip", "yellowtail"],
      baked_potato: "baked potato",
      sweet_potato_fries: "sweet potato wedges",
      dried_beef: "biltong",
      turkey_priority: "optional"
    },
    uk: {
      label: "UK",
      standard_fish: "cod",
      secondary_fish: ["haddock", "pollock", "hake", "basa"],
      baked_potato: "jacket potato",
      sweet_potato_fries: "sweet potato wedges",
      dried_beef: "beef jerky",
      turkey_priority: "strong"
    },
    us: {
      label: "US",
      standard_fish: "tilapia",
      secondary_fish: ["cod", "haddock", "pollock", "halibut", "catfish"],
      baked_potato: "baked potato",
      sweet_potato_fries: "sweet potato wedges",
      dried_beef: "beef jerky",
      turkey_priority: "strong"
    },
    canada: {
      label: "Canada",
      standard_fish: "cod",
      secondary_fish: ["haddock", "pollock", "halibut", "tilapia"],
      baked_potato: "baked potato",
      sweet_potato_fries: "sweet potato wedges",
      dried_beef: "beef jerky",
      turkey_priority: "strong"
    },
    australia: {
      label: "Australia",
      standard_fish: "barramundi",
      secondary_fish: ["hoki", "flathead", "snapper", "whiting", "basa"],
      baked_potato: "baked potato",
      sweet_potato_fries: "sweet potato wedges",
      dried_beef: "beef jerky",
      turkey_priority: "optional"
    }
  };

  const INGREDIENT_SYSTEM = {
    protein_families: [
      "chicken",
      "beef",
      "fish",
      "eggs",
      "turkey",
      "pork",
      "plant proteins",
      "dairy/cottage cheese support proteins"
    ],
    vegetables: {
      main_side: [
        "green beans",
        "broccoli",
        "carrots",
        "spinach",
        "peppers",
        "mushrooms",
        "cabbage",
        "cauliflower",
        "baby marrow / zucchini / courgette",
        "butternut",
        "pumpkin",
        "asparagus",
        "brussels sprouts",
        "eggplant / aubergine"
      ],
      salad: ["lettuce", "tomato", "cucumber", "carrot", "peppers", "spinach", "rocket / arugula", "celery", "cabbage"],
      accessories: ["onion", "mushrooms", "peppers", "tomato", "celery", "garlic", "ginger", "herbs", "lemon"],
      starchy_accessory: ["peas", "corn"],
      pickled_accessories: ["pickled beetroot", "pickles / gherkins", "olives", "pickled onions", "jalapenos", "sauerkraut"]
    },
    carbs: ["rice", "potato", "baby potatoes", "baked potato", "sweet potato", "sweet potato wedges", "pasta", "couscous", "toast", "crackers", "rice cakes", "noodles"],
    dressings: [
      "lemon-herb yoghurt dressing",
      "garlic yoghurt dressing",
      "mustard yoghurt dressing",
      "low-calorie mayo-style yoghurt dressing",
      "balsamic-style dressing",
      "tomato-herb dressing",
      "soy-ginger dressing",
      "mild peri-peri yoghurt dressing",
      "light honey-mustard yoghurt dressing",
      "sweet chilli yoghurt dressing",
      "light Caesar-style yoghurt dressing"
    ],
    dips: [
      "low-fat lemon-herb yoghurt dip",
      "garlic yoghurt dip",
      "mild peri-peri yoghurt dip",
      "light honey-mustard yoghurt dip",
      "tomato-herb yoghurt dip",
      "hummus",
      "soy yoghurt dip"
    ],
    sauces: [
      "light tomato-herb sauce",
      "mustard yoghurt sauce",
      "garlic yoghurt sauce",
      "light peri-peri tomato sauce",
      "light BBQ-style sauce",
      "soy-ginger sauce",
      "sweet and sour light sauce",
      "mild curry tomato sauce",
      "broth curry sauce",
      "light yoghurt curry sauce",
      "light coconut-style curry sauce",
      "sour cream / low-fat sour cream",
      "plain yoghurt with lemon and herbs"
    ]
  };

  const HARD_RULES = [
    "peas_and_corn_never_together",
    "pickled_items_are_accessories_not_main_vegetables",
    "meatballs_use_sauce_not_dip",
    "patties_use_sauce_not_dip",
    "dips_are_for_strips_bites_raw_veg_and_tofu",
    "no_dry_salads",
    "no_dry_tuna",
    "no_cucumber_as_default_garnish_everywhere",
    "fried_means_1_teaspoon_olive_oil_or_spray",
    "curry_defaults_mild_tomato_based_not_oily",
    "coconut_curry_occasional_only",
    "cream_cheese_is_portion_controlled",
    "cottage_cheese_is_lower_calorie_default",
    "turkey_is_country_aware_and_needs_moisture",
    "pork_is_lean_optional_and_mostly_asian_style",
    "beef_is_lean_and_not_rough_day_default",
    "biltong_or_jerky_is_a_protein_booster_not_dinner",
    "tuna_should_not_repeat_too_often",
    "sardines_are_optional_tuna_alternative",
    "smoked_salmon_is_snack_light_meal_or_salad",
    "cooked_fish_salads_are_not_generated",
    "fish_standard_names_are_country_specific",
    "component_plates_keep_protein_veg_and_carb_separate",
    "mixed_dishes_cook_protein_and_veg_together",
    "paella_style_rice_cooks_protein_rice_and_veg_together",
    "low_appetite_meals_are_soft_moist_mild_and_smaller",
    "avoid_oily_spicy_dry_rich_meals_as_rough_day_defaults",
    "lunch_and_dinner_are_display_slots_not_recipe_types",
    "main_meals_can_be_placed_in_lunch_or_dinner",
    "generic_rice_bowls_are_blocked",
    "tuna_and_fish_rice_bowls_are_blocked",
    "wraps_are_not_default_carb_in_this_engine_layer"
  ];

  const VEGETABLE_SIDE_STYLES = [
    { id: "steamed", effort: "very_easy", day_fit: ["weekday", "rough_day_possible"], vegetables: ["green beans", "broccoli", "carrots", "cauliflower", "spinach", "cabbage", "baby marrow / zucchini / courgette", "asparagus"], instruction: "Steam until tender, then season with lemon, herbs, salt and pepper." },
    { id: "mashed_soft", effort: "very_easy", day_fit: ["weekday", "rough_day_possible", "low_appetite"], vegetables: ["pumpkin", "butternut", "cauliflower", "carrots", "broccoli"], instruction: "Steam until soft, then mash with a little stock, salt, pepper and herbs." },
    { id: "air_fryer", effort: "easy", day_fit: ["weekday"], vegetables: ["broccoli", "carrots", "cauliflower", "baby marrow / zucchini / courgette", "butternut", "pumpkin", "brussels sprouts", "asparagus", "peppers"], instruction: "Season with garlic, herbs, paprika and a light spray of oil. Air-fry until tender and lightly golden." },
    { id: "roasted", effort: "moderate", day_fit: ["weekend", "meal_prep"], vegetables: ["carrots", "butternut", "pumpkin", "cauliflower", "broccoli", "brussels sprouts", "peppers", "baby marrow / zucchini / courgette", "eggplant / aubergine"], instruction: "Roast with garlic, herbs, paprika and a light spray of oil until soft and lightly browned." },
    { id: "pan_fried", effort: "easy", day_fit: ["weekday"], vegetables: ["spinach", "mushrooms", "peppers", "cabbage", "green beans", "baby marrow / zucchini / courgette", "asparagus"], instruction: "Cook in a non-stick pan with 1 teaspoon olive oil or cooking spray, garlic and herbs." }
  ];

  const recipeDefaults = {
    protein_type: "lean",
    prep_method: "simple",
    ingredients: [],
    main_vegetables: [],
    accessories: [],
    starchy_accessory: "",
    carb: "",
    sauce_or_dressing: "",
    country_aliases: {},
    equipment: ["non-stick pan"],
    effort: "easy",
    day_fit: ["weekday"],
    meal_type: "main_meal",
    low_appetite_default: false,
    rough_day_possible: false,
    nausea_default: false,
    fat_level: "low",
    salt_level: "moderate",
    spice_level: "mild",
    contains_dairy: false,
    contains_fish: false,
    contains_egg: false,
    contains_pork: false,
    contains_gluten: false,
    leftover_friendly: false,
    meal_prep_friendly: false,
    swap_group: "general",
    swap_candidates: [],
    render_template: "",
    instruction: "",
    shopping_list_items: [],
    display_portion: "",
    client_instruction: "",
    slot_bias: "any",
    protein_group: "",
    meal_family: ""
  };

  function list(value) {
    if (!value) return [];
    return Array.isArray(value) ? value.filter(Boolean) : [value];
  }

  function slug(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function unique(values) {
    return Array.from(new Set(list(values).filter(Boolean)));
  }


  const CLIENT_OUTPUT_RULES = Object.freeze({
    displayFieldsOnly: ["portion", "ingredients", "prep_instruction"],
    dressingPrefix: "low-calorie",
    bannedClientPhrases: [
      "not with rice",
      "proper salad plate",
      "good for low appetite",
      "low appetite",
      "this is a plant meal",
      "this is not a snack",
      "not a generic",
      "not a tuna rice",
      "not a fish bowl"
    ]
  });


  const NUTRITION_ESTIMATE_RULES = Object.freeze({
    dailyCalorieBuffer: 100,
    displayCalorieMin: 1200,
    displayCalorieMax: 1600,
    displayLabel: "Estimated day total",
    displayFields: ["calories", "protein_g", "fibre_g"],
    approximate: true
  });

  function sentence(value) {
    let text = String(value || "").trim().replace(/\s+/g, " ");
    if (!text) return "";
    text = text.charAt(0).toUpperCase() + text.slice(1);
    return /[.!?]$/.test(text) ? text : `${text}.`;
  }

  function capitalizeFirst(value) {
    const text = String(value || "").trim();
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
  }

  function normalizeClientTitle(value) {
    return capitalizeFirst(String(value || "")
      .replace(/^Low-appetite\s+/ig, "")
      .replace(/\bcomponent plate\b/ig, "")
      .replace(/\s+optional\b/ig, "")
      .replace(/^Chicken vegetable soup/i, "Chicken and vegetable soup")
      .replace(/\s{2,}/g, " ")
      .replace(/\s+with\s*$/i, "")
      .trim());
  }

  const CLIENT_RENDER_OVERRIDES = Object.freeze({
    "driedbeef-protein-snack": {
      portion: "A small handful of {driedBeef}",
      instruction: "Serve as a quick protein snack."
    },
    "driedbeef-and-cottage-cheese-bowl": {
      portion: "A small handful of {driedBeef} with ½ cup cottage cheese and tomato",
      instruction: "Serve chilled."
    },
    "smoked-salmon-rice-cakes-with-cottage-cheese": {
      portion: "A small portion of smoked salmon with 2 rice cakes and ½ cup cottage cheese",
      instruction: "Top the rice cakes with cottage cheese and smoked salmon."
    },
    "boiled-eggs-with-cottage-cheese-and-tomato": {
      portion: "2 boiled eggs with ½ cup cottage cheese and tomato",
      instruction: "Serve chilled or at room temperature."
    },
    "boiled-eggs-with-tomato-and-pickles": {
      portion: "2 boiled eggs with tomato and pickles",
      instruction: "Serve chilled or at room temperature."
    },
    "egg-rice-cakes-with-cottage-cheese": {
      portion: "1 boiled egg with 2 rice cakes and ½ cup cottage cheese",
      instruction: "Top the rice cakes with egg and cottage cheese."
    },
    "tuna-crackers-with-low-calorie-dressing": {
      portion: "½ tin tuna, drained, with 2–3 crackers and low-calorie dressing",
      instruction: "Mix the tuna with the low-calorie dressing and serve with crackers."
    },
    "sardines-on-crackers-with-tomato": {
      portion: "1 small tin sardines, drained, with 2–3 crackers and tomato",
      instruction: "Serve with lemon and herbs."
    },
    "soy-yoghurt-with-berries": {
      portion: "1 cup soy yoghurt with berries",
      instruction: "Spoon into a bowl and serve chilled."
    },
    "edamame-with-lemon-and-salt": {
      portion: "A small bowl of edamame with lemon and salt",
      instruction: ""
    },
    "hummus-with-carrot-sticks": {
      portion: "2–3 tablespoons hummus with carrot sticks",
      instruction: ""
    },
    "air-fryer-tofu-bites-with-soy-ginger-sauce": {
      portion: "A small portion of tofu bites with soy-ginger sauce",
      instruction: "Air-fry until lightly crisp."
    },
    "greek-yoghurt-with-berries": {
      portion: "1 cup Greek yoghurt with berries",
      instruction: "Spoon into a bowl and serve chilled."
    },
    "cottage-cheese-with-fruit": {
      portion: "½ cup cottage cheese with fruit",
      instruction: "Spoon into a bowl and serve chilled."
    },
    "rice-cakes-with-cottage-cheese": {
      portion: "2 rice cakes with ½ cup cottage cheese",
      instruction: "Top the rice cakes with cottage cheese and herbs."
    },
    "apple-with-peanut-butter": {
      portion: "1 apple with a spoon of peanut butter",
      instruction: "Slice the apple and serve with peanut butter."
    },
    "vegetable-sticks-with-cottage-cheese-dip": {
      portion: "Vegetable sticks with ½ cup cottage cheese dip",
      instruction: "Mix cottage cheese with herbs and serve with the vegetable sticks."
    }
  });

  function normalizeClientDressing(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    const lower = raw.toLowerCase();
    if (!lower.includes("dressing")) return raw;
    if (lower.includes("mayo-style") || lower.includes("mayo style") || lower.includes("mayo")) return "low-calorie yoghurt dressing";
    if (lower.includes("low-calorie")) return raw;
    if (lower.includes("lemon")) return "low-calorie lemon-herb dressing";
    if (lower.includes("garlic")) return "low-calorie garlic dressing";
    if (lower.includes("mustard")) return "low-calorie mustard dressing";
    if (lower.includes("balsamic")) return "low-calorie balsamic-style dressing";
    if (lower.includes("caesar")) return "low-calorie Caesar-style dressing";
    if (lower.includes("peri")) return "low-calorie peri-peri dressing";
    if (lower.includes("sweet chilli")) return "low-calorie sweet chilli dressing";
    return `low-calorie ${raw.replace(/^light\s+/i, "")}`;
  }

  function normalizeClientIngredient(value) {
    const raw = String(value || "").trim();
    if (!raw) return raw;
    return raw.toLowerCase().includes("dressing") ? normalizeClientDressing(raw) : raw;
  }

  function cleanClientCopy(value) {
    let text = String(value || "").trim();
    CLIENT_OUTPUT_RULES.bannedClientPhrases.forEach((phrase) => {
      const re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
      text = text.replace(re, "");
    });
    text = text.replace(/\s+/g, " ").replace(/\s+\./g, ".").trim();
    return sentence(text);
  }

  function proteinPortion(meal) {
    const protein = String(meal.protein || meal.name || "").toLowerCase();
    if (protein.includes("tuna")) return "1 tin tuna, drained";
    if (protein.includes("sardine")) return "1 small tin sardines, drained";
    if (protein.includes("smoked salmon")) return "a small portion of smoked salmon";
    if (protein.includes("salmon")) return "1 small-to-medium salmon fillet";
    if (protein.includes("hake") || protein.includes("cod") || protein.includes("tilapia") || protein.includes("fish")) return "1 medium fish fillet";
    if (protein.includes("shredded chicken")) return "1 medium chicken breast, shredded";
    if (protein.includes("grilled chicken")) return "1 medium chicken breast, grilled and sliced";
    if (protein.includes("chicken strips")) return "1 medium chicken breast, sliced into strips";
    if (protein.includes("chicken pieces")) return "1 medium chicken breast, cut into pieces";
    if (protein.includes("chicken breast") || protein === "chicken") return "1 medium chicken breast";
    if (protein.includes("chicken mince")) return "a palm-sized portion of chicken mince";
    if (protein.includes("turkey mince")) return "a palm-sized portion of turkey mince";
    if (protein.includes("turkey")) return "a palm-sized portion of turkey";
    if (protein.includes("pork")) return "a palm-sized portion of lean pork";
    if (protein.includes("beef mince")) return "a palm-sized portion of lean beef mince";
    if (protein.includes("beef cubes")) return "a palm-sized portion of lean beef cubes";
    if (protein.includes("steak") || protein.includes("beef strips") || protein.includes("lean beef")) return "a palm-sized portion of lean beef";
    if (protein.includes("eggs") || protein.includes("boiled egg") || protein === "eggs") return "2 eggs";
    if (protein.includes("tofu")) return "½ block tofu";
    if (protein.includes("chickpeas")) return "¾–1 cup chickpeas";
    if (protein.includes("lentils")) return "¾–1 cup cooked lentils";
    if (protein.includes("beans")) return "¾–1 cup beans";
    if (protein.includes("soy yoghurt")) return "1 cup soy yoghurt";
    if (protein.includes("yoghurt")) return "1 cup yoghurt";
    if (protein.includes("cottage cheese")) return "½–1 cup cottage cheese";
    if (protein.includes("hummus")) return "a few spoons of hummus";
    if (protein.includes("jerky")) return "a small handful of beef jerky";
    if (protein.includes("biltong")) return "a small handful of biltong";
    if (protein.includes("edamame")) return "a small bowl of edamame";
    return meal.protein || "a protein portion";
  }

  function carbPortion(carb) {
    const text = String(carb || "").toLowerCase();
    if (!text) return "";
    if (text.includes("baby potatoes")) return "3–4 baby potatoes";
    if (text.includes("sweet potato")) return "½ medium sweet potato";
    if (text.includes("baked potato")) return "1 small baked potato";
    if (text.includes("jacket potato")) return "1 small jacket potato";
    if (text === "potato") return "1 small potato";
    if (text.includes("rice")) return "½ cup cooked rice";
    if (text.includes("pasta")) return "½ cup cooked pasta";
    if (text.includes("noodles")) return "½ cup cooked noodles";
    if (text.includes("toast")) return "1 slice toast";
    if (text.includes("crackers")) return "2–3 crackers";
    if (text.includes("rice cakes")) return "2 rice cakes";
    return carb;
  }

  function readableList(items) {
    const values = unique(items).filter(Boolean);
    if (!values.length) return "";
    if (values.length === 1) return values[0];
    if (values.length === 2) return `${values[0]} and ${values[1]}`;
    return `${values.slice(0, -1).join(", ")} and ${values[values.length - 1]}`;
  }

  function clientPortionLine(meal) {
    const override = CLIENT_RENDER_OVERRIDES[meal.id];
    if (meal.display_portion) return replaceCountryTokens(meal.display_portion, meal.country || "south_africa");
    if (override && override.portion) return replaceCountryTokens(override.portion, meal.country || "south_africa");
    const protein = proteinPortion(meal);
    const carb = carbPortion(meal.carb);
    const dressing = meal.prep_method === "salad" ? normalizeClientDressing(meal.sauce_or_dressing || "low-calorie dressing") : "";
    const sideItems = [];
    if (meal.prep_method === "salad") {
      sideItems.push(...meal.main_vegetables);
      sideItems.push(...(meal.accessories || []));
      if (dressing) sideItems.push(dressing);
    } else {
      if (carb) sideItems.push(carb);
      sideItems.push(...meal.main_vegetables);
    }
    if (!sideItems.length) return protein;
    return `${protein}${protein.includes("drained") ? "," : ""} with ${readableList(sideItems)}`;
  }

  function clientPrepInstruction(meal) {
    const override = CLIENT_RENDER_OVERRIDES[meal.id];
    if (meal.client_instruction) return replaceCountryTokens(meal.client_instruction, meal.country || "south_africa");
    if (override && override.instruction) return replaceCountryTokens(override.instruction, meal.country || "south_africa");
    const prep = String(meal.prep_method || "").toLowerCase();
    const sauce = normalizeClientDressing(meal.sauce_or_dressing || "");
    const group = proteinGroup(meal);
    if (meal.instruction && !meal.instruction.toLowerCase().includes("served with")) {
      return cleanClientCopy(meal.instruction);
    }
    if (prep.includes("component_plate")) {
      const name = String(meal.name || "").toLowerCase();
      if (group === "fish") return "Bake or air-fry with lemon and herbs until cooked through.";
      if (/meatball|mince|bolognese|tomato pot|chilli/.test(name) && sauce && !sauce.includes("dressing")) return `Cook and finish with ${sauce}.`;
      if (group === "beef") return "Grill or pan-cook and serve with the vegetables.";
      if (group === "plant") return "Air-fry or pan-cook until lightly crisp.";
      return "Cook and serve with the vegetables.";
    }
    if (prep.includes("salad")) return "Mix with the low-calorie dressing and serve chilled.";
    if (prep.includes("one_pot")) return "Cook with rice, stock, tomato and paprika until the rice is tender.";
    if (prep.includes("curry")) return "Simmer in the curry sauce until cooked through.";
    if (prep.includes("stew")) return "Simmer with stock, tomato, garlic and herbs until tender.";
    if (prep.includes("soup")) return "Simmer in stock until the vegetables are soft.";
    if (prep.includes("stir")) return "Stir-fry with garlic and ginger until cooked through.";
    if (prep.includes("mixed") || prep.includes("chilli")) return "Cook with tomato, garlic, herbs and mild spices until tender.";
    if (prep.includes("tray")) return "Bake with lemon, garlic and herbs until cooked through.";
    if (prep.includes("air_fryer")) return "Air-fry with garlic, herbs and a light spray of oil until cooked through.";
    if (prep.includes("scramble")) return "Scramble gently until just set.";
    if (prep.includes("poached")) return "Poach the eggs and serve with the toast and tomato.";
    if (prep.includes("omelette")) return "Cook gently in a non-stick pan until just set.";
    if (prep.includes("tomato_simmer")) return "Simmer gently in the tomato sauce until the eggs are set.";
    if (prep.includes("snack")) return "";
    if (sauce && !sauce.includes("dressing")) return `Cook and finish with ${sauce}.`;
    return "Cook until done and the vegetables are tender.";
  }

  function clientMealDescription(meal) {
    const portion = sentence(clientPortionLine(meal));
    const prep = cleanClientCopy(clientPrepInstruction(meal));
    return `${portion} ${prep}`.trim();
  }

  function createRecipe(seed) {
    const id = seed.id || slug(seed.name);
    const recipe = Object.assign({}, recipeDefaults, seed, { id });
    recipe.ingredients = unique(recipe.ingredients.map(normalizeClientIngredient));
    recipe.main_vegetables = unique(recipe.main_vegetables);
    recipe.accessories = unique(recipe.accessories);
    recipe.sauce_or_dressing = normalizeClientDressing(recipe.sauce_or_dressing);
    recipe.equipment = unique(recipe.equipment);
    recipe.day_fit = unique(recipe.day_fit);
    // Lunch and dinner are display slots only. Any non-breakfast/non-snack recipe is a shared main meal.
    // Strip old lunch/dinner tags so wrapper code cannot accidentally rebuild separate lunch/dinner pools.
    if (recipe.meal_type !== "breakfast" && recipe.meal_type !== "snack") {
      recipe.meal_type = "main_meal";
      recipe.day_fit = recipe.day_fit.filter((tag) => tag !== "lunch" && tag !== "dinner");
      if (!recipe.day_fit.length) recipe.day_fit = ["weekday"];
    }
    if (!recipe.protein_group) recipe.protein_group = recipe.family;
    if (!recipe.meal_family) recipe.meal_family = recipe.prep_method;
    recipe.swap_candidates = unique(recipe.swap_candidates);
    recipe.shopping_list_items = unique(recipe.shopping_list_items.length ? recipe.shopping_list_items : recipe.ingredients);
    if (!recipe.render_template) recipe.render_template = recipe.name;
    REQUIRED_RECIPE_FIELDS.forEach((field) => {
      if (!(field in recipe)) recipe[field] = recipeDefaults[field] ?? null;
    });
    return Object.freeze(recipe);
  }

  function component(seed) {
    return createRecipe(Object.assign({
      meal_type: "main_meal",
      prep_method: "component_plate",
      day_fit: ["weekday", "dinner"],
      swap_group: `${seed.family}_component_plate`,
      render_template: `${seed.name}`,
      instruction: `${seed.protein} served with ${list(seed.main_vegetables).join(" and ")}${seed.carb ? ` and ${seed.carb}` : ""}.`
    }, seed));
  }

  function mixed(seed) {
    return createRecipe(Object.assign({
      meal_type: "main_meal",
      prep_method: "mixed_dish",
      day_fit: ["weekday", "dinner", "meal_prep"],
      leftover_friendly: true,
      meal_prep_friendly: true,
      render_template: `${seed.name}`
    }, seed));
  }

  function salad(seed) {
    return createRecipe(Object.assign({
      meal_type: "main_meal",
      prep_method: "salad",
      day_fit: seed.day_fit || ["weekday", "light_meal"],
      sauce_or_dressing: seed.sauce_or_dressing || "lemon-herb yoghurt dressing",
      render_template: `${seed.name}`
    }, seed));
  }

  function snack(seed) {
    return createRecipe(Object.assign({
      meal_type: "snack",
      prep_method: "snack",
      day_fit: ["snack", "light_meal"],
      render_template: `${seed.name}`
    }, seed));
  }

  const recipes = [
    component({ name: "Simple grilled chicken breast with steamed green beans and baby potatoes", family: "chicken", protein: "chicken breast", ingredients: ["chicken breast", "green beans", "baby potatoes", "garlic", "mixed herbs", "lemon"], main_vegetables: ["green beans"], carb: "baby potatoes", effort: "very_easy", low_appetite_default: true, rough_day_possible: true, nausea_default: true, swap_candidates: ["Pan-fried herb chicken breast with garlic green beans and baby potatoes", "Shredded chicken with carrot mash and baby potatoes"] }),
    component({ name: "Pan-fried herb chicken breast with garlic green beans and baby potatoes", family: "chicken", protein: "chicken breast", ingredients: ["chicken breast", "green beans", "baby potatoes", "garlic", "mixed herbs", "lemon", "1 teaspoon olive oil"], main_vegetables: ["green beans"], carb: "baby potatoes", effort: "easy", low_appetite_default: true, rough_day_possible: true }),
    component({ name: "Air-fryer paprika chicken breast with broccoli and rice", family: "chicken", protein: "chicken breast", prep_method: "air_fryer_component_plate", ingredients: ["chicken breast", "broccoli", "rice", "paprika", "garlic", "herbs"], main_vegetables: ["broccoli"], carb: "rice", equipment: ["air fryer"], effort: "very_easy" }),
    component({ name: "Lemon-pepper chicken breast with carrots and potato", family: "chicken", protein: "chicken breast", ingredients: ["chicken breast", "carrots", "potato", "lemon", "black pepper", "garlic"], main_vegetables: ["carrots"], carb: "potato", low_appetite_default: true, rough_day_possible: true }),
    component({ name: "Mild peri-peri chicken breast with peppers and rice", family: "chicken", protein: "chicken breast", ingredients: ["chicken breast", "peppers", "rice", "paprika", "lemon", "garlic", "mild chilli"], main_vegetables: ["peppers"], carb: "rice", spice_level: "mild_to_medium", nausea_default: false }),
    component({ name: "Crumbed air-fryer chicken strips with carrots and sweet potato wedges", family: "chicken", protein: "chicken strips", ingredients: ["chicken strips", "carrots", "sweet potato", "light crumbs", "egg or yoghurt", "garlic"], main_vegetables: ["carrots"], carb: "sweet potato wedges", equipment: ["air fryer"], effort: "moderate", contains_egg: true, contains_gluten: true, contains_dairy: true }),
    component({ name: "Chicken mince patties with spinach, potato and yoghurt-herb sauce", family: "chicken", protein: "chicken mince", protein_type: "mince", ingredients: ["chicken mince", "spinach", "potato", "low-fat yoghurt", "lemon", "herbs"], main_vegetables: ["spinach"], carb: "potato", sauce_or_dressing: "plain yoghurt with lemon and herbs", contains_dairy: true, low_appetite_default: true, rough_day_possible: true }),
    component({ name: "Air-fryer chicken meatballs with tomato-herb sauce, baby marrow and rice", family: "chicken", protein: "chicken mince", protein_type: "mince", ingredients: ["chicken mince", "baby marrow / zucchini / courgette", "rice", "tomato", "garlic", "herbs"], main_vegetables: ["baby marrow / zucchini / courgette"], carb: "rice", sauce_or_dressing: "light tomato-herb sauce", equipment: ["air fryer"], meal_prep_friendly: true, leftover_friendly: true }),
    component({ name: "Chicken skewers with lemon-herb basting, broccoli and baby potatoes", family: "chicken", protein: "chicken cubes", ingredients: ["chicken cubes", "broccoli", "baby potatoes", "lemon", "garlic", "herbs"], main_vegetables: ["broccoli"], carb: "baby potatoes", effort: "moderate", day_fit: ["weekend", "meal_prep", "dinner"], meal_prep_friendly: true }),
    component({ name: "Mild air-fryer chicken wings with cabbage slaw and potato", family: "chicken", protein: "chicken wings", protein_type: "higher_fat", ingredients: ["chicken wings", "cabbage", "carrot", "potato", "paprika", "garlic"], main_vegetables: ["cabbage", "carrot"], carb: "potato", equipment: ["air fryer"], effort: "moderate", day_fit: ["weekend", "dinner"], fat_level: "higher", low_appetite_default: false }),
    salad({ name: "Grilled chicken garden salad", family: "chicken", protein: "grilled chicken", ingredients: ["grilled chicken", "lettuce", "tomato", "carrot", "lemon-herb yoghurt dressing"], main_vegetables: ["lettuce", "tomato", "carrot"], contains_dairy: true, low_appetite_default: false }),
    salad({ name: "Shredded chicken salad with tomato, carrot and yoghurt dressing", family: "chicken", protein: "shredded chicken", ingredients: ["shredded chicken", "lettuce", "tomato", "carrot", "low-fat yoghurt"], main_vegetables: ["lettuce", "tomato", "carrot"], sauce_or_dressing: "low-calorie mayo-style yoghurt dressing", contains_dairy: true, low_appetite_default: true, rough_day_possible: true, leftover_friendly: true }),
    salad({ name: "Chicken potato salad with green beans", family: "chicken", protein: "chicken breast", ingredients: ["chicken", "baby potatoes", "green beans", "light yoghurt herb dressing"], main_vegetables: ["green beans"], carb: "baby potatoes", sauce_or_dressing: "mustard yoghurt dressing", contains_dairy: true, leftover_friendly: true }),
    salad({ name: "Greek-style chicken salad with olives optional", family: "chicken", protein: "grilled chicken", ingredients: ["grilled chicken", "lettuce", "tomato", "cucumber", "peppers", "olives", "yoghurt lemon dressing"], main_vegetables: ["lettuce", "tomato", "cucumber", "peppers"], accessories: ["olives"], sauce_or_dressing: "lemon-herb yoghurt dressing", contains_dairy: true, salt_level: "moderate" }),
    mixed({ name: "Mild chicken curry with green beans and carrot", family: "chicken", protein: "chicken", prep_method: "curry", ingredients: ["chicken", "green beans", "carrot", "onion", "tomato", "garlic", "ginger", "mild curry spices", "rice"], main_vegetables: ["green beans", "carrot"], accessories: ["onion", "tomato", "garlic", "ginger"], carb: "rice", sauce_or_dressing: "mild curry tomato sauce", low_appetite_default: true, rough_day_possible: true }),
    mixed({ name: "Chicken curry with cauliflower and spinach", family: "chicken", protein: "chicken", prep_method: "curry", ingredients: ["chicken", "cauliflower", "spinach", "tomato", "onion", "garlic", "mild curry spices", "rice"], main_vegetables: ["cauliflower", "spinach"], accessories: ["tomato", "onion", "garlic"], carb: "rice", sauce_or_dressing: "mild curry tomato sauce", low_appetite_default: true, rough_day_possible: true }),
    mixed({ name: "Chicken curry with broccoli and corn", family: "chicken", protein: "chicken", prep_method: "curry", ingredients: ["chicken", "broccoli", "corn", "tomato", "onion", "mild curry spices", "rice"], main_vegetables: ["broccoli"], accessories: ["tomato", "onion"], starchy_accessory: "corn", carb: "rice", sauce_or_dressing: "mild curry tomato sauce" }),
    mixed({ name: "Light yoghurt chicken curry with cauliflower and spinach", family: "chicken", protein: "chicken", prep_method: "curry", ingredients: ["chicken", "cauliflower", "spinach", "plain yoghurt", "garlic", "ginger", "mild spices"], main_vegetables: ["cauliflower", "spinach"], accessories: ["garlic", "ginger"], sauce_or_dressing: "light yoghurt curry sauce", contains_dairy: true, low_appetite_default: true, rough_day_possible: true }),
    mixed({ name: "Chicken vegetable soup with carrot and spinach", family: "chicken", protein: "chicken", prep_method: "soup", ingredients: ["chicken", "carrot", "spinach", "stock", "herbs"], main_vegetables: ["carrot", "spinach"], sauce_or_dressing: "broth curry sauce", low_appetite_default: true, rough_day_possible: true, nausea_default: true }),
    mixed({ name: "Shredded chicken and cauliflower soup with spinach", family: "chicken", protein: "shredded chicken", prep_method: "soup", ingredients: ["shredded chicken", "cauliflower", "spinach", "stock", "herbs"], main_vegetables: ["cauliflower", "spinach"], low_appetite_default: true, rough_day_possible: true, nausea_default: true }),
    mixed({ name: "Garlic-ginger chicken stir-fry with broccoli and carrot", family: "chicken", protein: "chicken strips", prep_method: "stir_fry", ingredients: ["chicken strips", "broccoli", "carrot", "garlic", "ginger", "soy sauce", "rice"], main_vegetables: ["broccoli", "carrot"], accessories: ["garlic", "ginger"], carb: "rice", sauce_or_dressing: "soy-ginger sauce" }),
    mixed({ name: "Chicken cabbage and carrot stir-fry", family: "chicken", protein: "chicken strips", prep_method: "stir_fry", ingredients: ["chicken strips", "cabbage", "carrot", "garlic", "ginger", "soy sauce", "noodles"], main_vegetables: ["cabbage", "carrot"], accessories: ["garlic", "ginger"], carb: "noodles", sauce_or_dressing: "soy-ginger sauce", contains_gluten: true }),
    mixed({ name: "Lemon chicken tray bake with green beans and baby potatoes", family: "chicken", protein: "chicken pieces", prep_method: "tray_bake", ingredients: ["chicken pieces", "green beans", "baby potatoes", "lemon", "garlic", "herbs"], main_vegetables: ["green beans"], carb: "baby potatoes", effort: "moderate", day_fit: ["weekend", "meal_prep", "dinner"] }),
    mixed({ name: "Chicken paella-style rice with peppers and green beans", family: "chicken", protein: "chicken", prep_method: "one_pot_rice", ingredients: ["chicken", "rice", "peppers", "green beans", "tomato", "paprika", "garlic", "stock"], main_vegetables: ["peppers", "green beans"], accessories: ["tomato", "garlic"], carb: "rice", effort: "moderate", meal_prep_friendly: true }),
    snack({ name: "Air-fryer chicken strips with low-fat yoghurt dip", family: "chicken", protein: "chicken strips", prep_method: "protein_snack", ingredients: ["chicken strips", "garlic", "herbs", "paprika", "low-fat yoghurt", "lemon"], sauce_or_dressing: "low-fat lemon-herb yoghurt dip", contains_dairy: true, equipment: ["air fryer"] }),
    snack({ name: "Chicken meatballs with tomato-herb sauce", family: "chicken", protein: "chicken meatballs", prep_method: "protein_snack", ingredients: ["chicken meatballs", "tomato", "garlic", "herbs"], sauce_or_dressing: "light tomato-herb sauce", meal_prep_friendly: true }),
    snack({ name: "Peri-peri chicken livers with cauliflower mash", family: "chicken", protein: "chicken livers", protein_type: "optional", ingredients: ["chicken livers", "cauliflower", "tomato", "garlic", "paprika", "lemon", "mild chilli"], main_vegetables: ["cauliflower"], sauce_or_dressing: "light peri-peri tomato sauce", spice_level: "mild_to_medium", low_appetite_default: false }),

    component({ name: "Simple grilled lean steak with roasted carrots and baby potatoes", family: "beef", protein: "lean steak", ingredients: ["lean steak", "carrots", "baby potatoes", "garlic", "herbs"], main_vegetables: ["carrots"], carb: "baby potatoes", low_appetite_default: false, rough_day_possible: false, nausea_default: false }),
    component({ name: "Garlic-herb beef strips with broccoli and rice", family: "beef", protein: "lean beef strips", ingredients: ["lean beef strips", "broccoli", "rice", "garlic", "herbs"], main_vegetables: ["broccoli"], carb: "rice", low_appetite_default: false }),
    component({ name: "Beef meatballs with light tomato-herb sauce, spinach and pasta", family: "beef", protein: "lean beef mince", protein_type: "mince", ingredients: ["lean beef mince", "spinach", "pasta", "tomato", "garlic", "herbs"], main_vegetables: ["spinach"], carb: "pasta", sauce_or_dressing: "light tomato-herb sauce", contains_gluten: true, meal_prep_friendly: true }),
    mixed({ name: "Lean beef mince tomato pot with baby marrow and carrot", family: "beef", protein: "lean beef mince", protein_type: "mince", ingredients: ["lean beef mince", "tomato", "garlic", "herbs", "baby marrow / zucchini / courgette", "carrot"], main_vegetables: ["baby marrow / zucchini / courgette", "carrot"], accessories: ["tomato", "garlic"], low_appetite_default: false }),
    mixed({ name: "Beef bolognese-style mince with vegetables and pasta", family: "beef", protein: "lean beef mince", protein_type: "mince", ingredients: ["lean beef mince", "tomato sauce", "carrot", "baby marrow / zucchini / courgette", "herbs", "pasta"], main_vegetables: ["carrot", "baby marrow / zucchini / courgette"], carb: "pasta", sauce_or_dressing: "light tomato-herb sauce", contains_gluten: true }),
    mixed({ name: "Mild beef chilli-style pot with peppers and carrot", family: "beef", protein: "lean beef mince", protein_type: "mince", ingredients: ["lean beef mince", "tomato", "peppers", "carrot", "garlic", "mild chilli spices", "beans"], main_vegetables: ["peppers", "carrot"], accessories: ["tomato", "garlic"], spice_level: "mild_to_medium", low_appetite_default: false }),
    mixed({ name: "Beef and vegetable stew with carrot and green beans", family: "beef", protein: "lean beef cubes", prep_method: "stew", ingredients: ["lean beef cubes", "carrot", "green beans", "stock", "tomato", "herbs"], main_vegetables: ["carrot", "green beans"], sauce_or_dressing: "broth curry sauce", effort: "weekend", day_fit: ["weekend", "meal_prep", "dinner"] }),
    salad({ name: "Roast beef salad with lettuce and carrot", family: "beef", protein: "lean roast beef", ingredients: ["lean roast beef", "lettuce", "carrot", "lemon-herb yoghurt dressing"], main_vegetables: ["lettuce", "carrot"], contains_dairy: true, low_appetite_default: false }),
    salad({ name: "Beef and potato salad with green beans", family: "beef", protein: "lean beef strips", ingredients: ["lean beef strips", "baby potatoes", "green beans", "mustard yoghurt dressing"], main_vegetables: ["green beans"], carb: "baby potatoes", sauce_or_dressing: "mustard yoghurt dressing", contains_dairy: true }),
    snack({ name: "{driedBeef} protein snack", family: "beef", protein: "{driedBeef}", protein_type: "dried_beef", ingredients: ["{driedBeef}"], salt_level: "higher", fat_level: "low", low_appetite_default: false }),
    snack({ name: "{driedBeef} and cottage cheese bowl", family: "beef", protein: "{driedBeef}", protein_type: "dried_beef", ingredients: ["{driedBeef}", "low-fat cottage cheese", "tomato", "herbs"], sauce_or_dressing: "low-fat cottage cheese", contains_dairy: true, salt_level: "higher" }),

    component({ name: "Lemon-herb {standardFish} with {bakedPotato}, sour cream and green beans", family: "fish", protein: "{standardFish}", ingredients: ["{standardFish}", "green beans", "{bakedPotato}", "sour cream", "lemon", "garlic", "herbs"], main_vegetables: ["green beans"], carb: "{bakedPotato}", sauce_or_dressing: "sour cream / low-fat sour cream", contains_fish: true, contains_dairy: true, low_appetite_default: true, rough_day_possible: true }),
    component({ name: "Air-fryer paprika {standardFish} with {sweetPotatoFries} and broccoli", family: "fish", protein: "{standardFish}", prep_method: "air_fryer_component_plate", ingredients: ["{standardFish}", "{sweetPotatoFries}", "broccoli", "paprika", "garlic", "herbs"], main_vegetables: ["broccoli"], carb: "{sweetPotatoFries}", equipment: ["air fryer"], contains_fish: true }),
    component({ name: "Tomato-basted {standardFish} with spinach and {sweetPotatoFries}", family: "fish", protein: "{standardFish}", ingredients: ["{standardFish}", "spinach", "{sweetPotatoFries}", "tomato paste", "garlic", "lemon"], main_vegetables: ["spinach"], carb: "{sweetPotatoFries}", sauce_or_dressing: "light tomato-herb sauce", contains_fish: true }),
    component({ name: "Salmon fillet with {bakedPotato}, sour cream and asparagus", family: "fish", protein: "salmon fillet", protein_type: "richer_fish", ingredients: ["salmon fillet", "asparagus", "{bakedPotato}", "sour cream", "lemon", "herbs"], main_vegetables: ["asparagus"], carb: "{bakedPotato}", sauce_or_dressing: "sour cream / low-fat sour cream", contains_fish: true, contains_dairy: true, fat_level: "higher", low_appetite_default: false }),
    salad({ name: "Tuna salad with tomato and cucumber", family: "fish", protein: "tinned tuna", protein_type: "tinned_fish", ingredients: ["tinned tuna", "tomato", "cucumber", "low-calorie yoghurt dressing"], main_vegetables: ["tomato", "cucumber"], sauce_or_dressing: "low-calorie mayo-style yoghurt dressing", contains_fish: true, contains_dairy: true }),
    salad({ name: "Tuna mini salad with tomato, cucumber and pickles", family: "fish", protein: "tinned tuna", protein_type: "tinned_fish", ingredients: ["tinned tuna", "tomato", "cucumber", "pickles / gherkins", "low-calorie yoghurt dressing"], main_vegetables: ["tomato", "cucumber"], accessories: ["pickles / gherkins"], sauce_or_dressing: "low-calorie mayo-style yoghurt dressing", contains_fish: true, contains_dairy: true }),
    snack({ name: "Tuna crackers with low-calorie dressing", family: "fish", protein: "tinned tuna", protein_type: "tinned_fish", ingredients: ["tinned tuna", "crackers", "low-calorie yoghurt dressing"], carb: "crackers", sauce_or_dressing: "low-calorie mayo-style yoghurt dressing", contains_fish: true, contains_dairy: true, contains_gluten: true }),
    snack({ name: "Sardines on crackers with tomato", family: "fish", protein: "sardines", protein_type: "tinned_fish", ingredients: ["sardines", "crackers", "tomato", "lemon", "herbs"], carb: "crackers", contains_fish: true, contains_gluten: true, salt_level: "higher" }),
    snack({ name: "Smoked salmon rice cakes with cottage cheese", family: "fish", protein: "smoked salmon", protein_type: "smoked_fish", ingredients: ["smoked salmon", "rice cakes", "low-fat cottage cheese", "herbs"], carb: "rice cakes", sauce_or_dressing: "low-fat cottage cheese", contains_fish: true, contains_dairy: true, salt_level: "higher" }),
    salad({ name: "Smoked salmon salad with tomato and cucumber", family: "fish", protein: "smoked salmon", protein_type: "smoked_fish", ingredients: ["smoked salmon", "lettuce", "tomato", "cucumber", "lemon-herb yoghurt dressing"], main_vegetables: ["lettuce", "tomato", "cucumber"], sauce_or_dressing: "lemon-herb yoghurt dressing", contains_fish: true, contains_dairy: true, salt_level: "higher" }),

    snack({ name: "Boiled eggs with tomato and pickles", family: "eggs", protein: "boiled eggs", ingredients: ["boiled eggs", "tomato", "pickles / gherkins"], main_vegetables: ["tomato"], accessories: ["pickles / gherkins"], contains_egg: true }),
    snack({ name: "Boiled eggs with cottage cheese and tomato", family: "eggs", protein: "boiled eggs", ingredients: ["boiled eggs", "low-fat cottage cheese", "tomato"], main_vegetables: ["tomato"], sauce_or_dressing: "low-fat cottage cheese", contains_egg: true, contains_dairy: true, low_appetite_default: true }),
    snack({ name: "Egg rice cakes with cottage cheese", family: "eggs", protein: "boiled egg slices", ingredients: ["boiled egg slices", "rice cakes", "low-fat cottage cheese", "herbs"], carb: "rice cakes", sauce_or_dressing: "low-fat cottage cheese", contains_egg: true, contains_dairy: true }),
    createRecipe({ name: "Scrambled eggs with spinach", family: "eggs", protein: "eggs", protein_type: "eggs", prep_method: "scramble", ingredients: ["eggs", "spinach", "herbs"], main_vegetables: ["spinach"], equipment: ["non-stick pan"], effort: "very_easy", day_fit: ["breakfast", "light_meal"], meal_type: "breakfast", contains_egg: true, low_appetite_default: true, rough_day_possible: true, nausea_default: true, instruction: "Scramble eggs gently with spinach and herbs until soft." }),
    createRecipe({ name: "Poached eggs with toast and tomato", family: "eggs", protein: "eggs", protein_type: "eggs", prep_method: "poached", ingredients: ["eggs", "toast", "tomato"], main_vegetables: ["tomato"], carb: "toast", effort: "easy", day_fit: ["breakfast"], meal_type: "breakfast", contains_egg: true, contains_gluten: true, instruction: "Poach eggs and serve with toast and tomato." }),
    createRecipe({ name: "Spinach omelette", family: "eggs", protein: "eggs", protein_type: "eggs", prep_method: "omelette", ingredients: ["eggs", "spinach", "herbs"], main_vegetables: ["spinach"], effort: "easy", day_fit: ["breakfast", "light_meal"], meal_type: "breakfast", contains_egg: true, low_appetite_default: true, instruction: "Cook a soft omelette with spinach and herbs." }),
    salad({ name: "Classic egg salad with lettuce and tomato", family: "eggs", protein: "boiled eggs", ingredients: ["boiled eggs", "lettuce", "tomato", "yoghurt mayo-style dressing"], main_vegetables: ["lettuce", "tomato"], sauce_or_dressing: "low-calorie mayo-style yoghurt dressing", contains_egg: true, contains_dairy: true }),
    createRecipe({ name: "Mild shakshuka-style eggs with spinach", family: "eggs", protein: "eggs", protein_type: "eggs", prep_method: "tomato_simmer", ingredients: ["eggs", "tomato sauce", "spinach", "garlic", "herbs", "mild spices"], main_vegetables: ["spinach"], accessories: ["tomato", "garlic"], sauce_or_dressing: "light tomato-herb sauce", effort: "easy", day_fit: ["breakfast", "light_meal"], meal_type: "breakfast", contains_egg: true, nausea_default: false, instruction: "Simmer eggs gently in a mild tomato and spinach sauce." }),

    createRecipe({ name: "Greek yoghurt berry bowl", family: "dairy/cottage cheese support proteins", protein: "Greek yoghurt", protein_type: "dairy", prep_method: "breakfast_bowl", ingredients: ["Greek yoghurt", "berries", "seeds"], main_vegetables: [], accessories: ["berries", "seeds"], meal_type: "breakfast", contains_dairy: true, low_appetite_default: true, rough_day_possible: true, display_portion: "1 cup Greek yoghurt with berries and a spoon of seeds", client_instruction: "Spoon into a bowl and serve chilled." }),
    createRecipe({ name: "Oats with yoghurt and berries", family: "dairy/cottage cheese support proteins", protein: "Greek yoghurt", protein_type: "dairy", prep_method: "oats_bowl", ingredients: ["oats", "Greek yoghurt", "berries", "cinnamon"], main_vegetables: [], accessories: ["berries"], carb: "oats", meal_type: "breakfast", contains_dairy: true, contains_gluten: true, meal_prep_friendly: true, display_portion: "A bowl of oats with ½–1 cup yoghurt and berries", client_instruction: "Cook or soak the oats, then top with yoghurt and berries." }),
    createRecipe({ name: "Cottage cheese fruit bowl", family: "dairy/cottage cheese support proteins", protein: "cottage cheese", protein_type: "dairy", prep_method: "breakfast_bowl", ingredients: ["cottage cheese", "fruit", "seeds"], main_vegetables: [], accessories: ["fruit", "seeds"], meal_type: "breakfast", contains_dairy: true, low_appetite_default: true, display_portion: "½–1 cup cottage cheese with sliced fruit and a spoon of seeds", client_instruction: "Spoon into a bowl and serve chilled." }),
    createRecipe({ name: "All-Bran style bowl with milk and banana", family: "dairy/cottage cheese support proteins", protein: "milk", protein_type: "dairy", prep_method: "cereal_bowl", ingredients: ["All-Bran", "milk", "banana"], main_vegetables: [], accessories: ["banana"], carb: "All-Bran", meal_type: "breakfast", contains_dairy: true, contains_gluten: true, display_portion: "A bowl of All-Bran with milk and banana", client_instruction: "Serve in a bowl with milk and sliced banana." }),
    createRecipe({ name: "Low-appetite yoghurt smoothie bowl", family: "dairy/cottage cheese support proteins", protein: "Greek yoghurt", protein_type: "dairy", prep_method: "smoothie_bowl", ingredients: ["Greek yoghurt", "banana", "berries"], main_vegetables: [], accessories: ["banana", "berries"], meal_type: "breakfast", contains_dairy: true, low_appetite_default: true, rough_day_possible: true, display_portion: "1 cup yoghurt with banana and berries", client_instruction: "Blend or serve as a soft bowl." }),
    createRecipe({ name: "Cottage cheese toast with tomato", family: "dairy/cottage cheese support proteins", protein: "cottage cheese", protein_type: "dairy", prep_method: "toast_plate", ingredients: ["toast", "cottage cheese", "tomato", "herbs"], main_vegetables: ["tomato"], carb: "toast", meal_type: "breakfast", contains_dairy: true, contains_gluten: true, display_portion: "1 slice toast with ½ cup cottage cheese, tomato and herbs", client_instruction: "Toast the bread, then top with cottage cheese, tomato and herbs." }),

    component({ name: "Simple grilled turkey breast with carrots and baby potatoes", family: "turkey", protein: "turkey breast", ingredients: ["turkey breast", "carrots", "baby potatoes", "garlic", "herbs", "lemon"], main_vegetables: ["carrots"], carb: "baby potatoes", sauce_or_dressing: "plain yoghurt with lemon and herbs", contains_dairy: true }),
    component({ name: "Turkey meatballs with tomato-herb sauce, spinach and rice", family: "turkey", protein: "lean turkey mince", protein_type: "mince", ingredients: ["lean turkey mince", "spinach", "rice", "tomato", "garlic", "herbs"], main_vegetables: ["spinach"], carb: "rice", sauce_or_dressing: "light tomato-herb sauce", meal_prep_friendly: true }),
    mixed({ name: "Turkey mince tomato pot with baby marrow and carrot", family: "turkey", protein: "lean turkey mince", protein_type: "mince", ingredients: ["lean turkey mince", "tomato", "garlic", "herbs", "baby marrow / zucchini / courgette", "carrot"], main_vegetables: ["baby marrow / zucchini / courgette", "carrot"], accessories: ["tomato", "garlic"] }),
    mixed({ name: "Turkey stir-fry with broccoli and carrot", family: "turkey", protein: "turkey strips", prep_method: "stir_fry", ingredients: ["turkey strips", "broccoli", "carrot", "garlic", "ginger", "soy sauce", "rice"], main_vegetables: ["broccoli", "carrot"], carb: "rice", sauce_or_dressing: "soy-ginger sauce" }),
    salad({ name: "Turkey and potato salad with green beans", family: "turkey", protein: "turkey strips", ingredients: ["turkey strips", "baby potatoes", "green beans", "mustard yoghurt dressing"], main_vegetables: ["green beans"], carb: "baby potatoes", sauce_or_dressing: "mustard yoghurt dressing", contains_dairy: true }),

    component({ name: "Simple grilled pork fillet with cabbage and potato", family: "pork", protein: "pork fillet", ingredients: ["pork fillet", "cabbage", "potato", "garlic", "herbs"], main_vegetables: ["cabbage"], carb: "potato", contains_pork: true, low_appetite_default: false }),
    component({ name: "Mustard-herb pork fillet with green beans and baby potatoes", family: "pork", protein: "pork fillet", ingredients: ["pork fillet", "green beans", "baby potatoes", "mustard", "garlic", "herbs"], main_vegetables: ["green beans"], carb: "baby potatoes", sauce_or_dressing: "mustard yoghurt sauce", contains_pork: true, contains_dairy: true }),
    mixed({ name: "Soy-ginger pork stir-fry with broccoli and carrot", family: "pork", protein: "lean pork strips", prep_method: "stir_fry", ingredients: ["lean pork strips", "broccoli", "carrot", "ginger", "garlic", "soy sauce", "rice"], main_vegetables: ["broccoli", "carrot"], carb: "rice", sauce_or_dressing: "soy-ginger sauce", contains_pork: true }),
    mixed({ name: "Pork cabbage and carrot stir-fry", family: "pork", protein: "lean pork strips", prep_method: "stir_fry", ingredients: ["lean pork strips", "cabbage", "carrot", "garlic", "ginger", "soy sauce", "noodles"], main_vegetables: ["cabbage", "carrot"], carb: "noodles", sauce_or_dressing: "soy-ginger sauce", contains_pork: true, contains_gluten: true }),

    snack({ name: "Edamame with lemon and salt", family: "plant proteins", protein: "edamame", protein_type: "plant", ingredients: ["edamame", "lemon", "salt", "pepper"], salt_level: "moderate" }),
    snack({ name: "Hummus with carrot sticks", family: "plant proteins", protein: "hummus", protein_type: "plant", ingredients: ["carrot sticks", "hummus"], main_vegetables: ["carrots"], sauce_or_dressing: "hummus", fat_level: "moderate" }),
    snack({ name: "Air-fryer tofu bites with soy-ginger sauce", family: "plant proteins", protein: "tofu", protein_type: "plant", ingredients: ["tofu", "garlic", "paprika", "soy sauce", "ginger", "lemon"], sauce_or_dressing: "soy-ginger sauce", equipment: ["air fryer"] }),
    snack({ name: "Soy yoghurt with berries", family: "plant proteins", protein: "soy yoghurt", protein_type: "plant", ingredients: ["unsweetened soy yoghurt", "berries"], sauce_or_dressing: "soy yoghurt", low_appetite_default: true, rough_day_possible: true }),
    snack({ name: "Greek yoghurt with berries", family: "dairy", protein: "Greek yoghurt", protein_type: "dairy", ingredients: ["Greek yoghurt", "berries"], contains_dairy: true, display_portion: "1 cup Greek yoghurt with berries", client_instruction: "Spoon into a bowl and serve chilled." }),
    snack({ name: "Cottage cheese with fruit", family: "dairy", protein: "low-fat cottage cheese", protein_type: "dairy", ingredients: ["low-fat cottage cheese", "fruit"], contains_dairy: true, display_portion: "½ cup cottage cheese with fruit", client_instruction: "Spoon into a bowl and serve chilled." }),
    snack({ name: "Rice cakes with cottage cheese", family: "dairy", protein: "low-fat cottage cheese", protein_type: "dairy", ingredients: ["rice cakes", "low-fat cottage cheese", "herbs"], carb: "rice cakes", contains_dairy: true, display_portion: "2 rice cakes with ½ cup cottage cheese", client_instruction: "Top the rice cakes with cottage cheese and herbs." }),
    snack({ name: "Apple with peanut butter", family: "fruit", protein: "peanut butter", protein_type: "plant", ingredients: ["apple", "peanut butter"], fat_level: "moderate", display_portion: "1 apple with a spoon of peanut butter", client_instruction: "Slice the apple and serve with peanut butter." }),
    snack({ name: "Vegetable sticks with cottage cheese dip", family: "dairy", protein: "low-fat cottage cheese", protein_type: "dairy", ingredients: ["carrot sticks", "cucumber sticks", "low-fat cottage cheese", "herbs"], main_vegetables: ["carrots", "cucumber"], contains_dairy: true, display_portion: "Vegetable sticks with ½ cup cottage cheese dip", client_instruction: "Mix cottage cheese with herbs and serve with the vegetable sticks." }),
    mixed({ name: "Air-fryer tofu component plate with broccoli and rice", family: "plant proteins", protein: "tofu", protein_type: "plant", prep_method: "component_plate", ingredients: ["tofu", "broccoli", "rice", "garlic", "paprika", "soy sauce"], main_vegetables: ["broccoli"], carb: "rice", sauce_or_dressing: "soy-ginger sauce", equipment: ["air fryer"] }),
    mixed({ name: "Tofu curry with cauliflower and spinach", family: "plant proteins", protein: "tofu", protein_type: "plant", prep_method: "curry", ingredients: ["tofu", "cauliflower", "spinach", "tomato", "garlic", "mild curry spices", "rice"], main_vegetables: ["cauliflower", "spinach"], carb: "rice", sauce_or_dressing: "mild curry tomato sauce" }),
    mixed({ name: "Lentil tomato stew with carrot and spinach", family: "plant proteins", protein: "lentils", protein_type: "plant", prep_method: "stew", ingredients: ["lentils", "tomato", "carrot", "spinach", "garlic", "herbs"], main_vegetables: ["carrot", "spinach"], sauce_or_dressing: "light tomato-herb sauce", low_appetite_default: false }),
    mixed({ name: "Bean chilli-style pot with peppers and carrot", family: "plant proteins", protein: "beans", protein_type: "plant", prep_method: "chilli", ingredients: ["beans", "tomato", "peppers", "carrot", "mild spices", "rice"], main_vegetables: ["peppers", "carrot"], carb: "rice", sauce_or_dressing: "light tomato-herb sauce", spice_level: "mild_to_medium" }),
    salad({ name: "Chickpea salad with tomato, cucumber and pickles", family: "plant proteins", protein: "chickpeas", protein_type: "plant", ingredients: ["chickpeas", "tomato", "cucumber", "pickles / gherkins", "yoghurt lemon dressing"], main_vegetables: ["tomato", "cucumber"], accessories: ["pickles / gherkins"], sauce_or_dressing: "lemon-herb yoghurt dressing", contains_dairy: true }),
    mixed({ name: "Chickpea curry with spinach and cauliflower", family: "plant proteins", protein: "chickpeas", protein_type: "plant", prep_method: "curry", ingredients: ["chickpeas", "spinach", "cauliflower", "tomato", "mild curry spices", "rice"], main_vegetables: ["spinach", "cauliflower"], carb: "rice", sauce_or_dressing: "mild curry tomato sauce" })
  ];

  const recipesById = Object.freeze(Object.fromEntries(recipes.map((recipe) => [recipe.id, recipe])));

  function normalizeCountry(country) {
    const key = slug(country || "south_africa").replace(/-/g, "_");
    if (key === "south-africa" || key === "za") return "south_africa";
    if (key === "united_kingdom" || key === "great_britain") return "uk";
    if (key === "united_states" || key === "usa") return "us";
    return COUNTRIES[key] ? key : "south_africa";
  }

  function countryTerms(country) {
    const terms = COUNTRIES[normalizeCountry(country)];
    return Object.assign({}, terms, {
      standardFish: terms.standard_fish,
      bakedPotato: terms.baked_potato,
      sweetPotatoFries: terms.sweet_potato_fries,
      driedBeef: terms.dried_beef
    });
  }

  function countryVegetableAlias(country) {
    const key = normalizeCountry(country);
    return {
      babyMarrow: key === "south_africa" ? "baby marrow" : (key === "uk" ? "courgette" : "zucchini"),
      eggplant: key === "uk" ? "aubergine" : "eggplant",
      rocket: key === "us" || key === "canada" ? "arugula" : "rocket",
      pickles: key === "south_africa" || key === "uk" ? "gherkins" : "pickles"
    };
  }

  function replaceCountryTokens(value, country) {
    const terms = countryTerms(country);
    const veg = countryVegetableAlias(country);
    if (Array.isArray(value)) return value.map((item) => replaceCountryTokens(item, country));
    if (!value || typeof value !== "string") return value;
    return value
      .replace(/\{standardFish\}/g, terms.standardFish)
      .replace(/\{bakedPotato\}/g, terms.bakedPotato)
      .replace(/\{sweetPotatoFries\}/g, terms.sweetPotatoFries)
      .replace(/\{driedBeef\}/g, terms.driedBeef)
      .replace(/baby marrow \/ zucchini \/ courgette/gi, veg.babyMarrow)
      .replace(/eggplant \/ aubergine/gi, veg.eggplant)
      .replace(/rocket \/ arugula/gi, veg.rocket)
      .replace(/pickles \/ gherkins/gi, veg.pickles)
      .replace(/sweet potato chips \/ fries/gi, terms.sweetPotatoFries)
      .replace(/sour cream \/ low-fat sour cream/gi, "low-fat sour cream");
  }

  function localizeRecipe(recipe, country) {
    const localized = {};
    REQUIRED_RECIPE_FIELDS.forEach((field) => {
      localized[field] = field === "id" ? recipe[field] : replaceCountryTokens(recipe[field], country);
    });
    localized.country = normalizeCountry(country);
    localized.country_label = COUNTRIES[localized.country].label;
    localized.country_terms = countryTerms(country);
    return localized;
  }

  function hasAny(values, wanted) {
    const source = list(values);
    return list(wanted).some((item) => source.includes(item));
  }

  function recipeMatches(recipe, filters) {
    if (filters.family && recipe.family !== filters.family) return false;
    if (filters.protein && recipe.protein !== filters.protein) return false;
    if (filters.mealType) {
      const requestedMealType = filters.mealType;
      if ((requestedMealType === "lunch" || requestedMealType === "dinner") && recipe.meal_type !== "main_meal") return false;
      if (requestedMealType !== "lunch" && requestedMealType !== "dinner" && recipe.meal_type !== requestedMealType) return false;
    }
    if (filters.slot) {
      const requestedSlot = filters.slot;
      if ((requestedSlot === "lunch" || requestedSlot === "dinner") && recipe.meal_type !== "main_meal") return false;
      if ((requestedSlot === "breakfast" || requestedSlot === "snack") && recipe.meal_type !== requestedSlot) return false;
    }
    if (filters.prepMethod && recipe.prep_method !== filters.prepMethod) return false;
    if (filters.effort && recipe.effort !== filters.effort) return false;
    if (filters.dayFit && !hasAny(recipe.day_fit, filters.dayFit)) return false;
    if (filters.lowAppetite && !recipe.low_appetite_default) return false;
    if (filters.roughDay && !recipe.rough_day_possible) return false;
    if (filters.nausea && !recipe.nausea_default) return false;
    if (filters.noDairy && recipe.contains_dairy) return false;
    if (filters.noFish && recipe.contains_fish) return false;
    if (filters.noEgg && recipe.contains_egg) return false;
    if (filters.noGluten && recipe.contains_gluten) return false;
    if (filters.noPork && recipe.contains_pork) return false;
    if (filters.excludeHighFat && recipe.fat_level === "higher") return false;
    if (filters.excludeHighSalt && recipe.salt_level === "higher") return false;
    if (filters.mealPrep && !recipe.meal_prep_friendly) return false;
    if (filters.leftover && !recipe.leftover_friendly) return false;
    if (filters.country) {
      const country = normalizeCountry(filters.country);
      const turkeyIsOptional = recipe.family === "turkey" && COUNTRIES[country].turkey_priority === "optional";
      if (turkeyIsOptional && !filters.includeOptionalTurkey) return false;
    }
    return true;
  }

  function filterRecipes(filters = {}) {
    return recipes.filter((recipe) => recipeMatches(recipe, filters)).map((recipe) => localizeRecipe(recipe, filters.country));
  }

  function stablePick(items, seed = "") {
    if (!items.length) return null;
    const text = String(seed || "hearty");
    const total = Array.from(text).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return items[total % items.length];
  }

  function generateMeal(options = {}) {
    const filters = Object.assign({
      country: "south_africa",
      excludeHighFat: !!options.roughDay,
      excludeHighSalt: !!options.roughDay
    }, options);
    const matches = filterRecipes(filters);
    return options.random ? matches[Math.floor(Math.random() * matches.length)] || null : stablePick(matches, JSON.stringify(filters));
  }

  function renderMeal(recipeOrId, country = "south_africa") {
    const recipe = typeof recipeOrId === "string" ? recipesById[recipeOrId] : recipeOrId;
    if (!recipe) return null;
    const meal = recipe.id && !recipe.country ? localizeRecipe(recipe, country) : recipe;
    const title = normalizeClientTitle(meal.render_template || meal.name);
    const portion = clientPortionLine(meal);
    const prepInstruction = clientPrepInstruction(meal);
    const description = clientMealDescription(meal);
    return { title, description, portion, prepInstruction, meal };
  }

  function validateRecipe(recipeOrId) {
    const recipe = typeof recipeOrId === "string" ? recipesById[recipeOrId] : recipeOrId;
    if (!recipe) return [{ rule: "recipe_exists", message: "Recipe was not found." }];
    const issues = [];
    const allItems = unique([].concat(recipe.ingredients, recipe.main_vegetables, recipe.accessories, recipe.starchy_accessory, recipe.carb, recipe.sauce_or_dressing).map((item) => String(item).toLowerCase()));
    const hasPeas = allItems.some((item) => item.includes("peas"));
    const hasCorn = allItems.some((item) => item.includes("corn"));
    if (hasPeas && hasCorn) issues.push({ rule: "peas_and_corn_never_together", message: "Peas and corn appear in the same recipe." });
    const pickledAsMain = recipe.main_vegetables.some((veg) => INGREDIENT_SYSTEM.vegetables.pickled_accessories.includes(veg));
    if (pickledAsMain) issues.push({ rule: "pickled_items_are_accessories_not_main_vegetables", message: "Pickled items are being used as main vegetable volume." });
    const lowerName = recipe.name.toLowerCase();
    const lowerSauce = String(recipe.sauce_or_dressing || "").toLowerCase();
    if (lowerName.includes("meatball") && lowerSauce.includes("dip")) issues.push({ rule: "meatballs_use_sauce_not_dip", message: "Meatballs need a sauce, not a dip." });
    if (lowerName.includes("patt") && lowerSauce.includes("dip")) issues.push({ rule: "patties_use_sauce_not_dip", message: "Patties need a sauce, not a dip." });
    if ((recipe.prep_method === "salad" || lowerName.includes("salad")) && !recipe.sauce_or_dressing) issues.push({ rule: "no_dry_salads", message: "Salads need dressing or another moisture element." });
    if (recipe.protein.includes("tuna") && !recipe.sauce_or_dressing) issues.push({ rule: "no_dry_tuna", message: "Tuna needs dressing or another moisture element." });
    if (recipe.low_appetite_default && (recipe.fat_level === "higher" || recipe.spice_level === "spicy")) issues.push({ rule: "low_appetite_default", message: "Low-appetite defaults should not be high-fat or spicy." });
    if (recipe.prep_method === "curry" && recipe.spice_level !== "mild" && recipe.spice_level !== "mild_to_medium") issues.push({ rule: "curry_defaults_mild", message: "Curry defaults should remain mild." });
    return issues;
  }

  function validateAllRecipes() {
    return recipes.map((recipe) => ({ id: recipe.id, name: recipe.name, issues: validateRecipe(recipe) })).filter((result) => result.issues.length);
  }

  function findSwap(recipeOrId, swapType, options = {}) {
    const source = typeof recipeOrId === "string" ? recipesById[recipeOrId] : recipesById[recipeOrId.id] || recipeOrId;
    if (!source) return null;
    const base = { country: options.country || "south_africa" };
    let filters = base;
    if (swapType === "country_wording" || swapType === "fish_type" || swapType === "country_fish_alias") return localizeRecipe(source, options.country);
    if (swapType === "protein_prep") filters = Object.assign(base, { family: source.family, mealType: source.meal_type });
    if (swapType === "protein_family") filters = Object.assign(base, { mealType: source.meal_type, noPork: options.noPork !== false });
    if (swapType === "vegetable") filters = Object.assign(base, { family: source.family, mealType: source.meal_type });
    if (swapType === "carb") filters = Object.assign(base, { family: source.family, mealType: source.meal_type });
    if (swapType === "sauce" || swapType === "sauce_dressing") filters = Object.assign(base, { family: source.family, mealType: source.meal_type });
    if (swapType === "effort") filters = Object.assign(base, { family: source.family, effort: options.effort || "very_easy" });
    if (swapType === "low_appetite") filters = Object.assign(base, { family: source.family, mealType: source.meal_type, lowAppetite: true, roughDay: options.roughDay });
    if (swapType === "full_meal") filters = Object.assign(base, options.filters || {});
    let candidates = filterRecipes(filters).filter((recipe) => recipe.id !== source.id);
    if (!candidates.length && swapType === "low_appetite") {
      candidates = filterRecipes(Object.assign(base, { lowAppetite: true, roughDay: options.roughDay })).filter((recipe) => recipe.id !== source.id);
    }
    return stablePick(candidates, `${source.id}:${swapType}:${JSON.stringify(options)}`);
  }


  function includesAny(text, needles) {
    const value = String(text || "").toLowerCase();
    return needles.some((needle) => value.includes(needle));
  }

  function estimateProteinBase(meal) {
    const protein = String(meal.protein || meal.name || "").toLowerCase();
    const family = String(meal.family || "").toLowerCase();
    if (includesAny(protein, ["salmon"])) return { calories: 300, protein_g: 30, fibre_g: 0 };
    if (includesAny(protein, ["hake", "cod", "tilapia", "fish", "snoek", "kingklip", "yellowtail", "barramundi"])) return { calories: 210, protein_g: 32, fibre_g: 0 };
    if (includesAny(protein, ["tinned tuna", "tuna"])) return { calories: 150, protein_g: 25, fibre_g: 0 };
    if (includesAny(protein, ["sardines"])) return { calories: 180, protein_g: 20, fibre_g: 0 };
    if (includesAny(protein, ["chicken livers"])) return { calories: 190, protein_g: 25, fibre_g: 0 };
    if (includesAny(protein, ["chicken mince", "chicken meatballs"])) return { calories: 260, protein_g: 30, fibre_g: 0 };
    if (includesAny(protein, ["chicken breast", "chicken strips", "chicken pieces", "shredded chicken", "grilled chicken", "chicken"])) return { calories: 240, protein_g: 34, fibre_g: 0 };
    if (includesAny(protein, ["turkey mince", "turkey strips", "turkey"])) return { calories: 240, protein_g: 32, fibre_g: 0 };
    if (includesAny(protein, ["lean beef mince", "beef mince", "beef meatballs"])) return { calories: 310, protein_g: 30, fibre_g: 0 };
    if (includesAny(protein, ["lean beef cubes", "beef cubes", "steak", "beef strips", "lean beef"])) return { calories: 300, protein_g: 32, fibre_g: 0 };
    if (includesAny(protein, ["pork"])) return { calories: 280, protein_g: 30, fibre_g: 0 };
    if (includesAny(protein, ["tofu"])) return { calories: 240, protein_g: 20, fibre_g: 3 };
    if (includesAny(protein, ["chickpeas"])) return { calories: 260, protein_g: 14, fibre_g: 10 };
    if (includesAny(protein, ["lentils"])) return { calories: 230, protein_g: 16, fibre_g: 11 };
    if (includesAny(protein, ["beans"])) return { calories: 240, protein_g: 15, fibre_g: 10 };
    if (includesAny(protein, ["eggs", "boiled egg"]) || family === "eggs") return { calories: 160, protein_g: 13, fibre_g: 0 };
    if (includesAny(protein, ["greek yoghurt", "yoghurt"])) return { calories: 160, protein_g: 16, fibre_g: 1 };
    if (includesAny(protein, ["soy yoghurt"])) return { calories: 140, protein_g: 8, fibre_g: 2 };
    if (includesAny(protein, ["cottage cheese"])) return { calories: 170, protein_g: 20, fibre_g: 0 };
    if (includesAny(protein, ["hummus"])) return { calories: 130, protein_g: 5, fibre_g: 4 };
    if (includesAny(protein, ["biltong", "jerky"])) return { calories: 100, protein_g: 16, fibre_g: 0 };
    if (includesAny(protein, ["edamame"])) return { calories: 140, protein_g: 12, fibre_g: 5 };
    return { calories: meal.meal_type === "snack" ? 120 : 240, protein_g: meal.meal_type === "snack" ? 10 : 25, fibre_g: 2 };
  }

  function estimateCarbNutrition(carb) {
    const text = String(carb || "").toLowerCase();
    if (!text) return { calories: 0, protein_g: 0, fibre_g: 0 };
    if (includesAny(text, ["rice", "pasta", "noodles"])) return { calories: 110, protein_g: 3, fibre_g: 1 };
    if (includesAny(text, ["baby potatoes", "baked potato", "jacket potato", "potato"])) return { calories: 130, protein_g: 3, fibre_g: 3 };
    if (includesAny(text, ["sweet potato"])) return { calories: 120, protein_g: 2, fibre_g: 4 };
    if (includesAny(text, ["toast", "wrap"])) return { calories: 90, protein_g: 3, fibre_g: 2 };
    if (includesAny(text, ["crackers", "rice cakes"])) return { calories: 70, protein_g: 1, fibre_g: 1 };
    if (includesAny(text, ["oats", "all-bran", "bran"])) return { calories: 180, protein_g: 6, fibre_g: 5 };
    return { calories: 80, protein_g: 2, fibre_g: 1 };
  }

  function estimateVegetableNutrition(meal) {
    const vegetables = unique([].concat(meal.main_vegetables || [], meal.accessories || []));
    const mainVegCount = unique(meal.main_vegetables || []).length;
    const accessoryCount = unique(meal.accessories || []).length;
    const calories = Math.min(90, (mainVegCount * 25) + (accessoryCount * 8));
    const fibre = Math.min(8, (mainVegCount * 2) + (accessoryCount * 0.5));
    return { calories, protein_g: mainVegCount ? 2 : 0, fibre_g: fibre };
  }

  function estimateSauceNutrition(meal) {
    const prep = String(meal.prep_method || "").toLowerCase();
    const sauce = String(meal.sauce_or_dressing || "").toLowerCase();
    if (!sauce && !prep) return { calories: 0, protein_g: 0, fibre_g: 0 };
    if (prep.includes("salad") || sauce.includes("dressing")) return { calories: 35, protein_g: 1, fibre_g: 0 };
    if (prep.includes("curry")) return { calories: 70, protein_g: 1, fibre_g: 1 };
    if (prep.includes("stew") || prep.includes("soup")) return { calories: 45, protein_g: 1, fibre_g: 1 };
    if (prep.includes("stir")) return { calories: 40, protein_g: 1, fibre_g: 0 };
    if (prep.includes("tray") || prep.includes("air_fryer")) return { calories: 35, protein_g: 0, fibre_g: 0 };
    return { calories: 25, protein_g: 0, fibre_g: 0 };
  }

  function sumNutrition(parts) {
    return parts.reduce((total, part) => ({
      calories: total.calories + (Number(part.calories) || 0),
      protein_g: total.protein_g + (Number(part.protein_g) || 0),
      fibre_g: total.fibre_g + (Number(part.fibre_g) || 0)
    }), { calories: 0, protein_g: 0, fibre_g: 0 });
  }

  function roundTo(value, step) {
    return Math.round((Number(value) || 0) / step) * step;
  }

  function clampDisplayCalories(value) {
    const rounded = roundTo(value, 50);
    const min = NUTRITION_ESTIMATE_RULES.displayCalorieMin;
    const max = NUTRITION_ESTIMATE_RULES.displayCalorieMax;
    return Math.max(min, Math.min(max, rounded));
  }

  function estimateRecipeNutrition(recipeOrId, country = "south_africa") {
    const recipe = typeof recipeOrId === "string" ? recipesById[recipeOrId] : recipeOrId;
    if (!recipe) return { calories: 0, protein_g: 0, fibre_g: 0, approximate: true };
    const meal = recipe.id ? localizeRecipe(recipe, country) : recipe;
    if (meal.nutritionEstimate || meal.nutrition_estimate) {
      const source = meal.nutritionEstimate || meal.nutrition_estimate;
      return {
        calories: Number(source.calories) || 0,
        protein_g: Number(source.protein_g) || 0,
        fibre_g: Number(source.fibre_g) || 0,
        approximate: true
      };
    }
    const estimated = sumNutrition([
      estimateProteinBase(meal),
      estimateCarbNutrition(meal.carb),
      estimateVegetableNutrition(meal),
      estimateSauceNutrition(meal)
    ]);
    return {
      calories: roundTo(estimated.calories, 10),
      protein_g: roundTo(estimated.protein_g, 1),
      fibre_g: Math.round(estimated.fibre_g),
      approximate: true
    };
  }

  function estimateDayNutrition(day, country = "south_africa") {
    const mealKeys = ["breakfast", "lunch", "dinner", "snack"];
    const mealEstimates = {};
    mealKeys.forEach((key) => {
      if (day && day[key]) mealEstimates[key] = estimateRecipeNutrition(day[key], country);
    });
    const subtotal = sumNutrition(Object.values(mealEstimates));
    const rawCalories = subtotal.calories + NUTRITION_ESTIMATE_RULES.dailyCalorieBuffer;
    return {
      calories: clampDisplayCalories(rawCalories),
      raw_calories: roundTo(rawCalories, 50),
      protein_g: roundTo(subtotal.protein_g, 5),
      raw_fibre_g: roundTo(subtotal.fibre_g, 1),
      fibre_g: Math.max(NUTRITION_ESTIMATE_RULES.displayFibreMin || 0, roundTo(subtotal.fibre_g, 1)),
      calorieBuffer: NUTRITION_ESTIMATE_RULES.dailyCalorieBuffer,
      calorieBand: [NUTRITION_ESTIMATE_RULES.displayCalorieMin, NUTRITION_ESTIMATE_RULES.displayCalorieMax],
      approximate: true,
      meals: mealEstimates
    };
  }

  function renderDailyNutritionSummary(nutrition) {
    const estimate = nutrition || { calories: 0, protein_g: 0, fibre_g: 0 };
    return `${NUTRITION_ESTIMATE_RULES.displayLabel}: ±${estimate.calories} kcal • Protein ±${estimate.protein_g}g • Fibre ±${estimate.fibre_g}g`;
  }

  function estimatePlanNutrition(plan, country = "south_africa") {
    return (plan || []).map((day) => ({
      day: day.day,
      nutrition_estimate: day.nutrition_estimate || estimateDayNutrition(day, country),
      nutritionSummary: day.nutritionSummary || renderDailyNutritionSummary(day.nutrition_estimate || estimateDayNutrition(day, country))
    }));
  }

  const DEFAULT_BLOCKED_MAIN_MEAL_IDS = new Set([
    "chicken-potato-salad-with-green-beans",
    "beef-and-potato-salad-with-green-beans",
    "turkey-and-potato-salad-with-green-beans",
    "roast-beef-salad-with-lettuce-and-carrot",
    "classic-egg-salad-with-lettuce-and-tomato"
  ]);

  const DEFAULT_BLOCKED_SNACK_IDS = new Set([
    "air-fryer-chicken-strips-with-low-fat-yoghurt-dip",
    "chicken-meatballs-with-tomato-herb-sauce",
    "peri-peri-chicken-livers-with-cauliflower-mash",
    "soy-yoghurt-with-berries"
  ]);

  const OMNIVORE_WEEKLY_CAPS = Object.freeze({
    plant: 2,
    fish: 2,
    seafood: 1,
    pork: 1,
    turkey: 2,
    eggBreakfast: 2,
    eggSnack: 1,
    plantSnack: 2,
    fishSnack: 1,
    driedBeefSnack: 1,
    dairySnack: 3,
    cottageCheeseSnack: 2,
    yoghurtSnack: 2,
    riceCakeSnack: 2,
    sameSnackAnchor: 2
  });

  const DEFAULT_WEEKLY_SKELETON = Object.freeze({
    dinners: [
      { group: "beef", bucket: "stew" },
      { group: "chicken", bucket: "tray_bake" },
      { group: "chicken", bucket: "stir_fry" },
      { group: "fish", bucket: "fish_plate" },
      { group: "beef", bucket: "mince_meatballs" },
      { group: "plant", bucket: "curry" },
      { group: "chicken", bucket: "paella" }
    ],
    lunches: [
      { group: "chicken", bucket: "salad" },
      { group: "fish", bucket: "salad" },
      { group: "beef", bucket: "mixed" },
      { group: "plant", bucket: "salad" },
      { group: "chicken", bucket: "soup" },
      { group: "beef", bucket: "component" },
      { group: "beef", bucket: "mixed" }
    ]
  });

  function isDefaultMainMealAllowed(recipe, options = {}) {
    if (!recipe || recipe.meal_type !== "main_meal") return false;
    if (DEFAULT_BLOCKED_MAIN_MEAL_IDS.has(recipe.id)) return false;
    if (recipe.fat_level === "higher") return false;
    if (recipe.contains_pork && !options.includePork) return false;
    return true;
  }

  function isEggBreakfast(recipe) {
    return !!recipe && (recipe.contains_egg || recipe.family === "eggs" || /egg|omelette|shakshuka|scramble/i.test(recipe.name || ""));
  }

  function proteinGroup(recipe) {
    const family = String(recipe && recipe.family || "").toLowerCase();
    const protein = String(recipe && recipe.protein || "").toLowerCase();
    if (family.includes("plant") || /tofu|lentil|bean|chickpea|edamame|hummus/.test(protein)) return "plant";
    if (family.includes("fish") || /fish|hake|cod|tilapia|salmon|tuna|sardine/.test(protein)) return "fish";
    if (family.includes("pork") || protein.includes("pork")) return "pork";
    if (family.includes("turkey") || protein.includes("turkey")) return "turkey";
    if (family.includes("beef") || protein.includes("beef") || protein.includes("steak") || protein.includes("biltong") || protein.includes("jerky")) return "beef";
    if (family.includes("chicken") || protein.includes("chicken")) return "chicken";
    if (family.includes("egg") || protein.includes("egg")) return "eggs";
    if (family.includes("dairy") || protein.includes("yoghurt") || protein.includes("cottage")) return "dairy";
    return family || "other";
  }

  function mealBucket(recipe) {
    const prep = String(recipe && recipe.prep_method || "").toLowerCase();
    const name = String(recipe && recipe.name || "").toLowerCase();
    const group = proteinGroup(recipe);
    if (prep.includes("tray")) return "tray_bake";
    if (prep.includes("one_pot") || name.includes("paella")) return "paella";
    if (prep.includes("stir")) return "stir_fry";
    if (prep.includes("curry")) return "curry";
    if (prep.includes("soup")) return "soup";
    if (prep.includes("stew")) return "stew";
    if (prep.includes("salad")) return "salad";
    if (group === "fish" && (prep.includes("component") || prep.includes("air_fryer"))) return "fish_plate";
    if (/meatball|bolognese|chilli|mince/.test(name) || prep.includes("mixed")) return "mince_meatballs";
    if (prep.includes("component") || prep.includes("air_fryer")) return "component";
    return prep || "other";
  }

  function recipeMatchesTarget(recipe, target) {
    const group = proteinGroup(recipe);
    const bucket = mealBucket(recipe);
    if (target.group && target.group !== group) return false;
    if (!target.bucket) return true;
    if (target.bucket === bucket) return true;
    if (target.bucket === "mixed" && (bucket === "mince_meatballs" || bucket === "component")) return true;
    if (target.bucket === "component" && bucket === "component") return true;
    if (target.bucket === "fish_plate" && group === "fish" && bucket !== "salad") return true;
    if (target.bucket === "mince_meatballs" && bucket === "mince_meatballs") return true;
    return false;
  }

  function selectedFoodsContain(selected, values) {
    const chosen = new Set(list(selected || []).map((item) => String(item).toLowerCase()));
    if (!chosen.size) return true;
    return list(values).some((value) => chosen.has(String(value).toLowerCase()));
  }

  function proteinAllowedBySelections(recipe, options) {
    const selected = options.selectedFoods && options.selectedFoods.proteins;
    if (!selected || !selected.length) return true;
    const group = proteinGroup(recipe);
    const protein = String(recipe.protein || "").toLowerCase();
    if (group === "plant") {
      if (protein.includes("tofu")) return selectedFoodsContain(selected, ["tofu"]);
      if (protein.includes("lentil")) return selectedFoodsContain(selected, ["lentils"]);
      if (protein.includes("chickpea")) return selectedFoodsContain(selected, ["chickpeas"]);
      if (protein.includes("bean")) return selectedFoodsContain(selected, ["beans"]);
      return selectedFoodsContain(selected, ["tofu", "beans", "lentils", "chickpeas"]);
    }
    if (group === "dairy") return selectedFoodsContain(selected, ["yoghurt", "cottage_cheese", "protein_shake"]);
    if (group === "eggs") return selectedFoodsContain(selected, ["eggs"]);
    return selectedFoodsContain(selected, [group]);
  }

  function carbAllowedBySelections(recipe, options) {
    const selected = options.selectedFoods && options.selectedFoods.carbs;
    const carb = String(recipe.carb || "").toLowerCase();
    if (!selected || !selected.length || !carb) return true;
    if (carb.includes("baby potato") || carb.includes("baked potato") || carb === "potato") return selectedFoodsContain(selected, ["potato"]);
    if (carb.includes("sweet potato")) return selectedFoodsContain(selected, ["sweet_potato"]);
    if (carb.includes("rice cake")) return selectedFoodsContain(selected, ["rice_cakes"]);
    if (carb.includes("rice")) return selectedFoodsContain(selected, ["rice"]);
    if (carb.includes("pasta")) return selectedFoodsContain(selected, ["pasta"]);
    if (carb.includes("noodle")) return selectedFoodsContain(selected, ["noodles"]);
    if (carb.includes("toast")) return selectedFoodsContain(selected, ["toast"]);
    if (carb.includes("cracker")) return selectedFoodsContain(selected, ["crackers"]);
    if (carb.includes("couscous")) return selectedFoodsContain(selected, ["couscous"]);
    return true;
  }

  function obeysWeeklyCaps(recipe, state, caps) {
    const group = proteinGroup(recipe);
    if (group === "plant" && state.groupCounts.plant >= caps.plant) return false;
    if (group === "fish" && state.groupCounts.fish >= caps.fish) return false;
    if (group === "pork" && state.groupCounts.pork >= caps.pork) return false;
    if (group === "turkey" && state.groupCounts.turkey >= caps.turkey) return false;
    return true;
  }

  function addMainMealToState(recipe, state) {
    if (!recipe) return;
    state.usedMainMealIds.add(recipe.id);
    const group = proteinGroup(recipe);
    state.groupCounts[group] = (state.groupCounts[group] || 0) + 1;
    const bucket = mealBucket(recipe);
    state.bucketCounts[bucket] = (state.bucketCounts[bucket] || 0) + 1;
  }

  function hashFor(value) {
    return Array.from(String(value || "hearty")).reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) % 1000003, 7);
  }

  function selectedVegScore(recipe, options) {
    const selected = new Set(list(options.selectedFoods && options.selectedFoods.vegetables || []).map((item) => String(item).toLowerCase()));
    if (!selected.size) return 0;
    const aliases = {
      "green beans": "green_beans", broccoli: "broccoli", carrot: "carrots", carrots: "carrots", spinach: "spinach", peppers: "peppers", mushrooms: "mushrooms", cabbage: "cabbage", cauliflower: "cauliflower", "baby marrow / zucchini / courgette": "baby_marrow", "baby marrow": "baby_marrow", zucchini: "baby_marrow", courgette: "baby_marrow", butternut: "butternut", pumpkin: "pumpkin", asparagus: "asparagus", tomato: "tomato", cucumber: "cucumber", lettuce: "lettuce"
    };
    return unique(recipe.main_vegetables || []).reduce((score, veg) => score + (selected.has(aliases[String(veg).toLowerCase()] || String(veg).toLowerCase()) ? 5 : 0), 0);
  }

  function scoreCandidate(recipe, target, state, options, slot, sameDayOther) {
    let score = 0;
    if (recipeMatchesTarget(recipe, target)) score += 200;
    if (target.group && proteinGroup(recipe) === target.group) score += 80;
    if (target.bucket && mealBucket(recipe) === target.bucket) score += 70;
    if (!state.usedMainMealIds.has(recipe.id)) score += 50;
    if (sameDayOther && proteinGroup(recipe) !== proteinGroup(sameDayOther)) score += 35;
    if (slot === "dinner" && mealBucket(recipe) !== "salad") score += 35;
    if (slot === "dinner" && mealBucket(recipe) === "salad") score -= 200;
    if (slot === "lunch" && mealBucket(recipe) === "salad") score += 10;
    score += selectedVegScore(recipe, options);
    const selectedProteins = new Set(list(options.selectedFoods && options.selectedFoods.proteins || []).map((item) => String(item).toLowerCase()));
    const proteinText = String(recipe.protein || "").toLowerCase();
    if (selectedProteins.has("tofu") && proteinText.includes("tofu")) score += 120;
    if (target.group === "plant" && selectedProteins.has("tofu") && !proteinText.includes("tofu")) score -= 40;
    if (!proteinAllowedBySelections(recipe, options)) score -= 1200;
    if (!carbAllowedBySelections(recipe, options)) score -= 900;
    if (!obeysWeeklyCaps(recipe, state, OMNIVORE_WEEKLY_CAPS)) score -= 500;
    if (state.usedMainMealIds.has(recipe.id)) score -= 350;
    score += hashFor(`${options.seed || "default"}:${slot}:${recipe.id}`) % 17;
    return score;
  }

  function pickBestMainMeal(mainMeals, target, state, options, slot, sameDayOther) {
    const selectedAllowedAll = mainMeals.filter((recipe) => proteinAllowedBySelections(recipe, options) && carbAllowedBySelections(recipe, options));
    let pool = selectedAllowedAll.length ? selectedAllowedAll.filter((recipe) => !state.usedMainMealIds.has(recipe.id)) : mainMeals.filter((recipe) => !state.usedMainMealIds.has(recipe.id));
    if (!pool.length && selectedAllowedAll.length) pool = selectedAllowedAll.slice();
    if (!pool.length) pool = mainMeals.slice();
    const strict = pool.filter((recipe) => recipeMatchesTarget(recipe, target) && proteinAllowedBySelections(recipe, options) && carbAllowedBySelections(recipe, options) && obeysWeeklyCaps(recipe, state, OMNIVORE_WEEKLY_CAPS));
    if (strict.length) pool = strict;
    const scored = pool.map((recipe) => ({ recipe, score: scoreCandidate(recipe, target, state, options, slot, sameDayOther) }))
      .sort((a, b) => b.score - a.score);
    const picked = scored.length ? scored[0].recipe : null;
    addMainMealToState(picked, state);
    return picked;
  }

  function pickBreakfast(breakfasts, state, options, dayIndex) {
    let pool = breakfasts.filter((recipe) => !state.usedBreakfastIds.has(recipe.id));
    if (!pool.length) pool = breakfasts.slice();
    const nonEgg = pool.filter((recipe) => !isEggBreakfast(recipe) && proteinAllowedBySelections(recipe, options));
    const egg = pool.filter((recipe) => isEggBreakfast(recipe) && proteinAllowedBySelections(recipe, options));
    let targetPool = nonEgg.length ? nonEgg : pool;
    if (state.eggBreakfasts >= OMNIVORE_WEEKLY_CAPS.eggBreakfast && nonEgg.length) targetPool = nonEgg;
    if ((dayIndex === 3 || dayIndex === 6) && egg.length && state.eggBreakfasts < OMNIVORE_WEEKLY_CAPS.eggBreakfast) targetPool = egg;
    const picked = stablePick(targetPool, `${options.seed || "default"}:breakfast:${dayIndex}`);
    if (picked) {
      state.usedBreakfastIds.add(picked.id);
      if (isEggBreakfast(picked)) state.eggBreakfasts += 1;
    }
    return picked;
  }

  const DEFAULT_SNACK_SKELETON = Object.freeze([
    "dried_beef",
    "dairy",
    "fruit",
    "plant",
    "fish",
    "dairy",
    "carb_dairy"
  ]);

  function snackText(recipe) {
    return [
      recipe && recipe.id,
      recipe && recipe.name,
      recipe && recipe.family,
      recipe && recipe.protein,
      recipe && recipe.carb,
      recipe && recipe.sauce_or_dressing,
      ...(recipe && recipe.ingredients || [])
    ].join(" ").toLowerCase();
  }

  function snackHasCottageCheese(recipe) {
    return snackText(recipe).includes("cottage cheese");
  }

  function snackAnchors(recipe) {
    const text = snackText(recipe);
    const anchors = [];
    if (text.includes("cottage cheese")) anchors.push("cottage_cheese");
    if (/\byoghurt\b/.test(text) && !text.includes("soy yoghurt")) anchors.push("yoghurt");
    if (text.includes("soy yoghurt")) anchors.push("soy_yoghurt");
    if (/\begg\b|boiled eggs|egg slices/.test(text)) anchors.push("egg");
    if (/tuna|sardine|salmon|fish|hake|cod|tilapia/.test(text)) anchors.push("fish");
    if (/biltong|jerky|driedbeef/.test(text)) anchors.push("dried_beef");
    if (text.includes("rice cake")) anchors.push("rice_cake");
    if (text.includes("cracker")) anchors.push("cracker");
    if (text.includes("hummus")) anchors.push("hummus");
    if (text.includes("edamame")) anchors.push("edamame");
    if (text.includes("tofu")) anchors.push("tofu");
    if (text.includes("peanut butter")) anchors.push("peanut_butter");
    if (/apple|berries|banana|fruit|naartjie|orange|pear|peach|nectarine|plum|grapes|melon|kiwi/.test(text)) anchors.push("fruit");
    return unique(anchors);
  }

  function mostlyPlantSelected(options) {
    const selected = new Set(list(options.selectedFoods && options.selectedFoods.proteins || []).map((item) => String(item).toLowerCase()));
    const animal = ["chicken", "beef", "fish", "pork", "turkey", "seafood", "shellfish", "dried_beef", "biltong", "jerky"];
    const plant = ["tofu", "beans", "lentils", "chickpeas"];
    return plant.some((item) => selected.has(item)) && !animal.some((item) => selected.has(item));
  }

  function snackAnchorMax(anchor, options) {
    if (anchor === "cottage_cheese") return OMNIVORE_WEEKLY_CAPS.cottageCheeseSnack;
    if (anchor === "yoghurt") return OMNIVORE_WEEKLY_CAPS.yoghurtSnack;
    if (anchor === "rice_cake") return OMNIVORE_WEEKLY_CAPS.riceCakeSnack;
    if (anchor === "fish") return 1;
    if (anchor === "egg") return OMNIVORE_WEEKLY_CAPS.eggSnack;
    if (anchor === "dried_beef") return OMNIVORE_WEEKLY_CAPS.driedBeefSnack;
    if (["hummus", "edamame", "tofu"].includes(anchor)) return mostlyPlantSelected(options) ? 4 : 2;
    if (anchor === "soy_yoghurt") return 0;
    return OMNIVORE_WEEKLY_CAPS.sameSnackAnchor;
  }

  function snackIsGlobalCapped(recipe) {
    const anchors = snackAnchors(recipe);
    return anchors.includes("fish") || anchors.includes("dried_beef") || anchors.includes("egg") || anchors.includes("soy_yoghurt");
  }

  function snackStrictlyBlocked(recipe, state, options = {}) {
    return !snackObeysWeeklyCaps(recipe, state, options);
  }

  function snackGroup(recipe) {
    const id = String(recipe && recipe.id || "").toLowerCase();
    const name = String(recipe && recipe.name || "").toLowerCase();
    const family = String(recipe && recipe.family || "").toLowerCase();
    const protein = String(recipe && recipe.protein || "").toLowerCase();
    const carb = String(recipe && recipe.carb || "").toLowerCase();
    if (id.includes("driedbeef") || protein.includes("driedbeef") || protein.includes("biltong") || protein.includes("jerky")) return "dried_beef";
    if (protein.includes("egg") || name.includes("boiled egg") || name.includes("egg rice cake")) return "egg";
    if (protein.includes("soy yoghurt")) return "soy_dairy_free";
    if (protein.includes("tuna") || protein.includes("sardine") || protein.includes("smoked salmon") || family.includes("fish")) return "fish";
    if (protein.includes("hummus") || protein.includes("edamame") || protein.includes("tofu")) return "plant";
    if (family.includes("fruit") || name.includes("apple") || name.includes("fruit")) return "fruit";
    if (protein.includes("yoghurt") || protein.includes("cottage cheese") || family.includes("dairy")) {
      if (carb.includes("rice cake")) return "carb_dairy";
      return "dairy";
    }
    if (carb.includes("rice cake") || carb.includes("cracker")) return "carb";
    return proteinGroup(recipe) || "other";
  }

  function snackAllowedBySelections(recipe, options) {
    const selected = options.selectedFoods && options.selectedFoods.snacks;
    if (!selected || !selected.length) return true;
    const chosen = new Set(selected.map((item) => String(item).toLowerCase()));
    const id = String(recipe.id || "").toLowerCase();
    const name = String(recipe.name || "").toLowerCase();
    const protein = String(recipe.protein || "").toLowerCase();
    const carb = String(recipe.carb || "").toLowerCase();
    const hasFruit = ["berries", "banana", "apple", "pear", "orange", "naartjie", "grapes", "melon", "peach", "nectarine", "pineapple", "plum", "kiwi"].some((fruit) => chosen.has(fruit));
    if (protein.includes("soy yoghurt")) return chosen.has("soy_yoghurt_snacks") || chosen.has("dairy_free_snacks");
    if (id.includes("driedbeef") || protein.includes("biltong") || protein.includes("jerky")) return chosen.has("biltong_snacks") || chosen.has("jerky_snacks");
    if (id === "greek-yoghurt-with-berries") return chosen.has("yoghurt_snacks") || chosen.has("berries");
    if (id === "cottage-cheese-with-fruit") return chosen.has("cottage_cheese_snacks") && hasFruit;
    if (id === "apple-with-peanut-butter") return chosen.has("apple");
    if (id === "vegetable-sticks-with-cottage-cheese-dip") return chosen.has("veg_sticks") && chosen.has("cottage_cheese_snacks");
    if (id === "rice-cakes-with-cottage-cheese") return chosen.has("rice_cake_snacks") && chosen.has("cottage_cheese_snacks");
    if (protein.includes("yoghurt")) return chosen.has("yoghurt_snacks") || chosen.has("berries");
    if (protein.includes("cottage cheese")) return chosen.has("cottage_cheese_snacks");
    if (protein.includes("egg")) return chosen.has("egg_snacks");
    if (protein.includes("tuna") || protein.includes("sardine") || protein.includes("smoked salmon")) return chosen.has("fish_snacks");
    if (protein.includes("hummus")) return chosen.has("hummus_snacks") || chosen.has("veg_sticks");
    if (protein.includes("edamame")) return chosen.has("edamame_snacks");
    if (protein.includes("tofu")) return chosen.has("tofu_bites_snacks");
    if (carb.includes("cracker")) return chosen.has("cracker_snacks");
    if (carb.includes("rice cake")) return chosen.has("rice_cake_snacks");
    if (name.includes("fruit")) return hasFruit;
    return false;
  }

  function isDefaultSnackAllowed(recipe) {
    return !!recipe && !DEFAULT_BLOCKED_SNACK_IDS.has(recipe.id);
  }

  function snackObeysWeeklyCaps(recipe, state, options = {}) {
    const group = snackGroup(recipe);
    const count = state.snackGroupCounts[group] || 0;
    const plantSnackCap = mostlyPlantSelected(options) ? 4 : OMNIVORE_WEEKLY_CAPS.plantSnack;
    // Human-variety rule: do not put an egg snack on a day that already has an egg breakfast.
    if (group === "egg" && state.currentDayHasEggBreakfast) return false;
    if (group === "egg" && count >= OMNIVORE_WEEKLY_CAPS.eggSnack) return false;
    if (group === "plant" && count >= plantSnackCap) return false;
    if (group === "fish" && count >= OMNIVORE_WEEKLY_CAPS.fishSnack) return false;
    if (group === "fish" && (state.groupCounts && state.groupCounts.fish || 0) >= OMNIVORE_WEEKLY_CAPS.fish) return false;
    if (group === "dried_beef" && count >= OMNIVORE_WEEKLY_CAPS.driedBeefSnack) return false;
    if (group === "dairy" && count >= OMNIVORE_WEEKLY_CAPS.dairySnack) return false;
    if (group === "soy_dairy_free") return false;
    const anchorCounts = state.snackAnchorCounts || {};
    const anchors = snackAnchors(recipe);
    for (const anchor of anchors) {
      if ((anchorCounts[anchor] || 0) >= snackAnchorMax(anchor, options)) return false;
    }
    return true;
  }

  function snackTargetMatches(recipe, targetGroup) {
    const group = snackGroup(recipe);
    if (group === targetGroup) return true;
    if (targetGroup === "dairy" && group === "carb_dairy") return true;
    if (targetGroup === "carb_dairy" && (group === "carb_dairy" || group === "dairy")) return true;
    return false;
  }

  function addSnackToState(recipe, state) {
    if (!recipe) return;
    state.usedSnackIds.add(recipe.id);
    const group = snackGroup(recipe);
    state.snackGroupCounts[group] = (state.snackGroupCounts[group] || 0) + 1;
    if (snackHasCottageCheese(recipe)) state.cottageCheeseSnackCount = (state.cottageCheeseSnackCount || 0) + 1;
    state.snackAnchorCounts = state.snackAnchorCounts || {};
    const anchors = snackAnchors(recipe);
    anchors.forEach((anchor) => {
      state.snackAnchorCounts[anchor] = (state.snackAnchorCounts[anchor] || 0) + 1;
    });
    // Fish snacks count toward the same weekly fish cap as fish lunches/dinners.
    if (anchors.includes("fish")) state.groupCounts.fish = (state.groupCounts.fish || 0) + 1;
    state.lastSnackGroup = group;
  }

  function scoreSnack(recipe, targetGroup, state, options, dayIndex) {
    const group = snackGroup(recipe);
    let score = 0;
    if (snackTargetMatches(recipe, targetGroup)) score += 180;
    if (!state.usedSnackIds.has(recipe.id)) score += 80;
    if (group !== state.lastSnackGroup) score += 25;
    if (snackAllowedBySelections(recipe, options)) score += 45;
    if (!snackAllowedBySelections(recipe, options)) score -= 250;
    if (!snackObeysWeeklyCaps(recipe, state, options)) score -= 500;
    if (state.usedSnackIds.has(recipe.id)) score -= 450;
    if (group === "egg" && state.currentDayHasEggBreakfast) score -= 900;
    if (group === "egg" && state.eggBreakfasts > 0) score -= 75;
    if (group === "fish" && (state.groupCounts && state.groupCounts.fish || 0) >= OMNIVORE_WEEKLY_CAPS.fish) score -= 600;
    const anchorCounts = state.snackAnchorCounts || {};
    snackAnchors(recipe).forEach((anchor) => {
      if ((anchorCounts[anchor] || 0) > 0) score -= 90;
      if ((anchorCounts[anchor] || 0) >= snackAnchorMax(anchor, options)) score -= 700;
    });
    if (group === "soy_dairy_free") score -= 500;
    score += hashFor(`${options.seed || "default"}:snack:${dayIndex}:${recipe.id}`) % 19;
    return score;
  }

  function pickSnack(snacks, state, options, dayIndex) {
    const targetGroup = DEFAULT_SNACK_SKELETON[dayIndex % DEFAULT_SNACK_SKELETON.length];
    let allowed = snacks.filter(isDefaultSnackAllowed);
    const selectedAllowed = allowed.filter((recipe) => snackAllowedBySelections(recipe, options));
    if (selectedAllowed.length) allowed = selectedAllowed;
    const cappedAllowed = allowed.filter((recipe) => snackObeysWeeklyCaps(recipe, state, options));
    let pool = cappedAllowed.filter((recipe) => !state.usedSnackIds.has(recipe.id));
    const targetPool = pool.filter((recipe) => snackTargetMatches(recipe, targetGroup));
    if (targetPool.length) pool = targetPool;
    // If exact variety runs out, allow an exact repeat before breaking global caps.
    if (!pool.length) pool = cappedAllowed;
    // Last resort: still avoid fish/dried beef/egg/soy cap leaks.
    if (!pool.length) {
      pool = allowed.filter((recipe) => !snackIsGlobalCapped(recipe) && !state.usedSnackIds.has(recipe.id));
    }
    if (!pool.length) {
      pool = allowed.filter((recipe) => !snackIsGlobalCapped(recipe));
    }
    if (!pool.length && state.currentDayHasEggBreakfast) {
      pool = allowed.filter((recipe) => snackGroup(recipe) !== "egg");
    }
    if (!pool.length) pool = allowed.length ? allowed : snacks.filter(isDefaultSnackAllowed);
    const scored = pool.map((recipe) => ({ recipe, score: scoreSnack(recipe, targetGroup, state, options, dayIndex) }))
      .sort((a, b) => b.score - a.score);
    const picked = scored.length ? scored[0].recipe : null;
    addSnackToState(picked, state);
    return picked;
  }

  function buildLeadMagnetPlan(options = {}) {
    const days = Math.max(1, Math.min(Number(options.days) || 7, 14));
    const country = options.country || "south_africa";
    const selectedProteins = list(options.selectedFoods && options.selectedFoods.proteins || []);
    const plannerOptions = Object.assign({
      includePork: selectedProteins.includes("pork"),
      includeOptionalTurkey: selectedProteins.includes("turkey"),
      seed: "default"
    }, options);
    const plan = [];
    const state = {
      usedMainMealIds: new Set(),
      usedBreakfastIds: new Set(),
      usedSnackIds: new Set(),
      snackGroupCounts: {},
      snackAnchorCounts: {},
      cottageCheeseSnackCount: 0,
      lastSnackGroup: "",
      eggBreakfasts: 0,
      groupCounts: { chicken: 0, beef: 0, fish: 0, plant: 0, pork: 0, turkey: 0 },
      bucketCounts: {}
    };
    const breakfasts = filterRecipes({ country, mealType: "breakfast", noPork: true });
    const mainMeals = filterRecipes({ country, mealType: "main_meal", noPork: !plannerOptions.includePork, includeOptionalTurkey: !!plannerOptions.includeOptionalTurkey })
      .filter((recipe) => isDefaultMainMealAllowed(recipe, plannerOptions));
    const snacks = filterRecipes({ country, mealType: "snack", noPork: true });

    for (let index = 0; index < days; index += 1) {
      const lunchTarget = DEFAULT_WEEKLY_SKELETON.lunches[index % DEFAULT_WEEKLY_SKELETON.lunches.length];
      const dinnerTarget = DEFAULT_WEEKLY_SKELETON.dinners[index % DEFAULT_WEEKLY_SKELETON.dinners.length];
      const lunch = pickBestMainMeal(mainMeals, lunchTarget, state, plannerOptions, "lunch", null);
      const dinner = pickBestMainMeal(mainMeals, dinnerTarget, state, plannerOptions, "dinner", lunch);
      const breakfast = pickBreakfast(breakfasts, state, plannerOptions, index);
      state.currentDayHasEggBreakfast = isEggBreakfast(breakfast);
      const snack = pickSnack(snacks, state, plannerOptions, index);
      state.currentDayHasEggBreakfast = false;
      const dayPlan = {
        day: index + 1,
        breakfast,
        lunch,
        dinner,
        snack
      };
      dayPlan.nutrition_estimate = estimateDayNutrition(dayPlan, country);
      dayPlan.nutritionSummary = renderDailyNutritionSummary(dayPlan.nutrition_estimate);
      plan.push(dayPlan);
    }
    return plan;
  }

  const api = Object.freeze({
    version: VERSION,
    requiredRecipeFields: REQUIRED_RECIPE_FIELDS.slice(),
    hardRules: HARD_RULES.slice(),
    clientOutputRules: CLIENT_OUTPUT_RULES,
    nutritionEstimateRules: NUTRITION_ESTIMATE_RULES,
    countries: COUNTRIES,
    ingredientSystem: INGREDIENT_SYSTEM,
    vegetableSideStyles: VEGETABLE_SIDE_STYLES,
    recipes,
    recipesById,
    createRecipe,
    normalizeCountry,
    countryTerms,
    localizeRecipe,
    filterRecipes,
    generateMeal,
    renderMeal,
    estimateRecipeNutrition,
    estimateDayNutrition,
    estimatePlanNutrition,
    renderDailyNutritionSummary,
    findSwap,
    validateRecipe,
    validateAllRecipes,
    buildLeadMagnetPlan
  });

  global.HeartyMealEngineV30 = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
