/*
  Hearty Shared Meal Engine — lead-magnet-ready core
  Version: hearty-meal-engine-shared-v1.0.0

  Purpose:
  - One shared food-logic engine for Hearty.
  - Lead magnet wrapper and app wrapper should call this same core.
  - This file does not touch the DOM, localStorage, Supabase, checkout, nav, or page UI.

  Public API:
  - window.HeartyMealEngine.generatePlan(input)
  - window.HeartyMealEngine.swapMeal(plan, dayIndex, mealType, input)
  - window.HeartyMealEngine.validatePlan(plan, input)
  - window.HeartyMealEngine.buildShoppingList(plan, input)
  - window.HeartyMealEngine.calculateMealNutrition(meal, input)
  - window.HeartyMealEngine.calculateDayNutrition(day, input)
  - window.HeartyMealEngine.calculatePlanNutrition(plan, input)

  Nutrition note:
  - All nutrition values are estimates for the suggested serving.
  - The lead magnet should present rounded values, not exact calorie prescriptions.
*/
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.HeartyMealEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var VERSION = 'hearty-meal-engine-shared-v1.0.0';

  var DINNER_RHYTHM = [
    { slot: 'soup', label: 'Soup' },
    { slot: 'curry_stew', label: 'Curry / stew' },
    { slot: 'stir_fry', label: 'Stir-fry' },
    { slot: 'grill_plate', label: 'Grill / plate' },
    { slot: 'fun_food', label: 'Fun food' },
    { slot: 'light', label: 'Light dinner' },
    { slot: 'sunday_hearty', label: 'Sunday-style hearty meal' }
  ];

  var PORTION_PROFILES = {
    low_appetite_glp1: {
      label: 'Low appetite GLP-1',
      protein: 0.85,
      starch: 0.55,
      vegetables: 0.70,
      fruit: 0.75,
      sauce: 0.75,
      dairy: 0.85,
      fats: 0.75,
      eggs: 2,
      shake: 1
    },
    standard_low_activity_glp1: {
      label: 'Standard lower-activity GLP-1',
      protein: 1.00,
      starch: 0.85,
      vegetables: 1.00,
      fruit: 1.00,
      sauce: 1.00,
      dairy: 1.00,
      fats: 1.00,
      eggs: 2,
      shake: 1
    },
    higher_protein_low_activity_glp1: {
      label: 'Higher protein lower-activity GLP-1',
      protein: 1.20,
      starch: 0.85,
      vegetables: 1.00,
      fruit: 1.00,
      sauce: 1.00,
      dairy: 1.05,
      fats: 1.00,
      eggs: 3,
      shake: 1
    },
    larger_appetite_glp1: {
      label: 'Larger appetite GLP-1',
      protein: 1.15,
      starch: 1.15,
      vegetables: 1.15,
      fruit: 1.00,
      sauce: 1.00,
      dairy: 1.05,
      fats: 1.00,
      eggs: 3,
      shake: 1
    }
  };

  // Nutrition values are intentionally simple internal estimates.
  // Most foods are per 100g unless unit === 'item'.
  var NUTRITION_TABLE = {
    chicken_breast_cooked: n(165, 31, 0, 0),
    shredded_chicken_cooked: n(165, 31, 0, 0),
    lean_beef_mince_cooked: n(190, 27, 0, 0),
    lean_beef_strips_cooked: n(180, 29, 0, 0),
    lamb_lean_cooked: n(220, 26, 0, 0),
    venison_cooked: n(160, 30, 0, 0),
    lean_pork_loin_cooked: n(180, 29, 0, 0),
    white_fish_cooked: n(105, 23, 0, 0),
    hake_cooked: n(100, 22, 0, 0),
    salmon_cooked: n(206, 22, 0, 0),
    tuna_canned_drained: n(116, 26, 0, 0),
    sardines_canned: n(208, 25, 0, 0),
    prawns_cooked: n(99, 24, 0, 0),
    calamari_cooked: n(105, 18, 3, 0),
    mussels_cooked: n(172, 24, 7, 0),
    clams_cooked: n(148, 26, 5, 0),

    tofu_firm: n(144, 17, 3, 2),
    tempeh: n(193, 20, 8, 5),
    edamame: n(121, 12, 9, 5),
    lentils_cooked: n(116, 9, 20, 8),
    chickpeas_cooked: n(164, 9, 27, 8),
    beans_cooked: n(127, 9, 23, 7),
    meat_free_mince: n(160, 18, 8, 5),
    veggie_patty: n(190, 15, 16, 5),

    eggs: nItem(70, 6, 0.5, 0),
    greek_yoghurt: n(59, 10, 4, 0),
    cottage_cheese: n(98, 11, 3, 0),
    halloumi: n(315, 22, 2, 0),
    milk_low_fat: n(50, 3.5, 5, 0),
    protein_powder: nItem(110, 23, 2, 0),

    oats_raw: n(389, 13, 68, 10),
    cooked_rice: n(130, 3, 28, 1),
    cooked_potato: n(87, 2, 20, 2),
    sweet_potato_cooked: n(90, 2, 21, 3),
    cooked_pasta: n(157, 6, 31, 2),
    cooked_noodles: n(138, 5, 25, 2),
    wrap: nItem(170, 6, 30, 3),
    bread_slice: nItem(85, 3.5, 15, 2),
    crackers: n(430, 9, 70, 4),
    cauliflower_rice: n(25, 2, 5, 2),

    mixed_vegetables: n(45, 2, 8, 3),
    stir_fry_vegetables: n(40, 2, 7, 3),
    salad_vegetables: n(25, 1, 5, 2),
    cooked_green_vegetables: n(35, 3, 6, 3),
    roast_vegetables: n(65, 2, 12, 4),
    soup_vegetables: n(45, 2, 9, 3),
    tomato_base: n(35, 1.5, 7, 2),
    peppers: n(31, 1, 6, 2),
    spinach: n(23, 3, 4, 2),
    cucumber: n(15, 1, 4, 1),
    tomato: n(18, 1, 4, 1),
    carrot: n(41, 1, 10, 3),
    mushrooms: n(22, 3, 3, 1),
    baby_marrow: n(17, 1, 3, 1),
    peas: n(81, 5, 14, 5),
    lettuce_cups: n(15, 1, 3, 1),

    berries: n(50, 1, 12, 4),
    banana: nItem(105, 1, 27, 3),
    apple: nItem(95, 0.5, 25, 4),
    fruit_choice: nItem(90, 1, 22, 3),
    chia_seeds: n(486, 17, 42, 34),
    nuts: n(600, 20, 20, 10),
    avocado: n(160, 2, 9, 7),
    olive_oil: n(884, 0, 0, 0),
    light_dressing: n(120, 0, 8, 0),
    light_sauce: n(70, 1, 12, 0),
    curry_sauce_light: n(85, 2, 10, 2),
    soy_ginger_sauce: n(50, 2, 8, 0),
    tomato_sauce_light: n(45, 1, 8, 2),
    yoghurt_sauce: n(70, 5, 5, 0),
    stock_broth: n(8, 1, 1, 0)
  };

  function n(calories, protein, carbs, fibre) {
    return { per: 100, unit: 'g', calories: calories, protein: protein, carbs: carbs, fibre: fibre };
  }

  function nItem(calories, protein, carbs, fibre) {
    return { per: 1, unit: 'item', calories: calories, protein: protein, carbs: carbs, fibre: fibre };
  }

  function comp(food, role, baseAmount, unit, options) {
    return Object.assign({ food: food, role: role, baseAmount: baseAmount, unit: unit || 'g' }, options || {});
  }

  function protein(food, amount, options) { return comp(food, 'protein', amount, 'g', options); }
  function veg(food, amount, options) { return comp(food, 'vegetables', amount, 'g', options); }
  function starch(food, amount, options) { return comp(food, 'starch', amount, 'g', options); }
  function sauce(food, amount, options) { return comp(food, 'sauce', amount, 'g', options); }
  function dairy(food, amount, options) { return comp(food, 'dairy', amount, 'g', options); }
  function fat(food, amount, options) { return comp(food, 'fat', amount, 'g', options); }
  function item(food, role, amount, options) { return comp(food, role, amount, 'item', options); }

  function recipe(config) {
    return Object.assign({
      diets: ['omnivore'],
      mealTypes: [],
      template: null,
      tags: [],
      countryTags: [],
      supportGood: [],
      supportAvoid: [],
      complexity: 'normal',
      components: []
    }, config);
  }

  var RECIPES = [
    // Breakfasts
    recipe({
      id: 'breakfast_greek_yoghurt_berries',
      title: 'Greek yoghurt protein bowl',
      mealTypes: ['breakfast'],
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'dairy',
      protein: 'greek_yoghurt',
      tags: ['dairy', 'soft', 'simple'],
      supportGood: ['lowAppetite', 'nausea', 'exhaustion'],
      components: [dairy('greek_yoghurt', 180), comp('berries', 'fruit', 80, 'g'), comp('chia_seeds', 'fibre', 10, 'g')],
      description: 'Greek yoghurt with berries and seeds. Add protein powder only if needed.'
    }),
    recipe({
      id: 'breakfast_oats_greek_yoghurt',
      title: 'Protein oats with Greek yoghurt',
      mealTypes: ['breakfast'],
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'dairy',
      protein: 'greek_yoghurt',
      tags: ['dairy', 'starch', 'fibre'],
      components: [starch('oats_raw', 40), dairy('greek_yoghurt', 150), comp('berries', 'fruit', 70, 'g')],
      description: 'Oats with Greek yoghurt stirred in, plus berries for fibre.'
    }),
    recipe({
      id: 'breakfast_cottage_cheese_fruit',
      title: 'Cottage cheese breakfast plate',
      mealTypes: ['breakfast'],
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'dairy',
      protein: 'cottage_cheese',
      tags: ['dairy', 'simple', 'soft'],
      supportGood: ['lowAppetite', 'nausea', 'bloating', 'exhaustion'],
      components: [dairy('cottage_cheese', 180), comp('fruit_choice', 'fruit', 1, 'item'), comp('nuts', 'fat', 10, 'g')],
      description: 'Cottage cheese with fruit of your choice and a small nut portion.'
    }),
    recipe({
      id: 'breakfast_egg_omelette',
      title: '2–3 egg omelette with spinach and tomato',
      mealTypes: ['breakfast'],
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'eggs',
      protein: 'eggs',
      tags: ['eggs', 'simple'],
      supportGood: ['lowAppetite', 'nausea', 'bloating'],
      components: [item('eggs', 'protein', 2, { eggProfile: true }), veg('spinach', 70), veg('tomato', 80)],
      description: 'A 2–3 egg omelette with spinach and tomato.'
    }),
    recipe({
      id: 'breakfast_scrambled_eggs_mushrooms',
      title: '2–3 scrambled eggs with mushrooms',
      mealTypes: ['breakfast'],
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'eggs',
      protein: 'eggs',
      tags: ['eggs', 'simple'],
      supportGood: ['lowAppetite', 'nausea', 'bloating'],
      components: [item('eggs', 'protein', 2, { eggProfile: true }), veg('mushrooms', 80), veg('tomato', 70)],
      description: 'A 2–3 egg scramble with mushrooms and tomato.'
    }),
    recipe({
      id: 'breakfast_protein_smoothie',
      title: 'Simple protein smoothie',
      mealTypes: ['breakfast'],
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'shake',
      protein: 'protein_powder',
      tags: ['dairy', 'shake', 'soft'],
      supportGood: ['lowAppetite', 'nausea', 'exhaustion'],
      components: [item('protein_powder', 'protein', 1), comp('banana', 'fruit', 1, 'item'), dairy('milk_low_fat', 200)],
      description: 'A simple protein smoothie with milk and banana. Counts as your one shake for the day.'
    }),
    recipe({
      id: 'breakfast_tofu_scramble',
      title: 'Tofu scramble with spinach and mushrooms',
      mealTypes: ['breakfast'],
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'soy',
      protein: 'tofu_firm',
      tags: ['soy', 'vegetarian'],
      supportGood: ['bloating'],
      components: [protein('tofu_firm', 160), veg('spinach', 70), veg('mushrooms', 80), sauce('light_sauce', 15)],
      description: 'Tofu scramble with spinach and mushrooms for a dairy-light vegetarian breakfast.'
    }),

    // Snacks
    recipe({
      id: 'snack_greek_yoghurt',
      title: 'Greek yoghurt snack',
      mealTypes: ['snack'],
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'dairy',
      protein: 'greek_yoghurt',
      tags: ['dairy', 'soft', 'simple'],
      supportGood: ['lowAppetite', 'nausea', 'exhaustion'],
      components: [dairy('greek_yoghurt', 150), comp('berries', 'fruit', 50, 'g')],
      description: 'Greek yoghurt with berries.'
    }),
    recipe({
      id: 'snack_cottage_cheese',
      title: 'Cottage cheese snack plate',
      mealTypes: ['snack'],
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'dairy',
      protein: 'cottage_cheese',
      tags: ['dairy', 'simple'],
      supportGood: ['lowAppetite', 'bloating', 'exhaustion'],
      components: [dairy('cottage_cheese', 120), veg('cucumber', 80)],
      description: 'Cottage cheese with cucumber or crunchy vegetables.'
    }),
    recipe({
      id: 'snack_two_boiled_eggs',
      title: '2 boiled eggs',
      mealTypes: ['snack'],
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'eggs',
      protein: 'eggs',
      tags: ['eggs', 'simple'],
      components: [item('eggs', 'protein', 2)],
      description: 'Two boiled eggs as a simple protein snack.'
    }),
    recipe({
      id: 'snack_protein_shake',
      title: 'Protein shake',
      mealTypes: ['snack'],
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'shake',
      protein: 'protein_powder',
      tags: ['shake', 'dairy', 'soft'],
      supportGood: ['lowAppetite', 'nausea', 'exhaustion'],
      components: [item('protein_powder', 'protein', 1), dairy('milk_low_fat', 200)],
      description: 'A simple protein shake. Maximum one shake per day.'
    }),
    recipe({
      id: 'snack_fruit_nuts',
      title: 'Fruit of your choice with a small nut portion',
      mealTypes: ['snack'],
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'none',
      protein: 'none',
      tags: ['fruit'],
      components: [comp('fruit_choice', 'fruit', 1, 'item'), comp('nuts', 'fat', 12, 'g')],
      description: 'A fruit of your choice with a small portion of nuts.'
    }),

    // Lunches: omnivore / pescatarian / vegetarian
    recipe({
      id: 'lunch_chicken_salad_bowl',
      title: 'Chicken salad bowl',
      mealTypes: ['lunch'],
      diets: ['omnivore'],
      proteinFamily: 'chicken',
      protein: 'chicken_breast_cooked',
      tags: ['chicken', 'salad'],
      supportGood: ['bloating'],
      components: [protein('chicken_breast_cooked', 120), veg('salad_vegetables', 180), sauce('light_dressing', 20)],
      description: 'A portion of chicken breast with salad vegetables and a light dressing.'
    }),
    recipe({
      id: 'lunch_shredded_chicken_wrap',
      title: 'Shredded chicken wrap',
      mealTypes: ['lunch'],
      diets: ['omnivore'],
      proteinFamily: 'chicken',
      protein: 'shredded_chicken_cooked',
      tags: ['chicken', 'wrap', 'starch'],
      components: [protein('shredded_chicken_cooked', 110), item('wrap', 'starch', 1), veg('salad_vegetables', 120), sauce('yoghurt_sauce', 20)],
      description: 'Shredded chicken breast with salad vegetables in a wrap.'
    }),
    recipe({
      id: 'lunch_lean_beef_mince_bowl',
      title: 'Lean beef mince bowl',
      mealTypes: ['lunch'],
      diets: ['omnivore'],
      proteinFamily: 'red_meat',
      protein: 'lean_beef_mince_cooked',
      tags: ['beef', 'redMeat'],
      supportAvoid: ['nausea'],
      components: [protein('lean_beef_mince_cooked', 120), veg('mixed_vegetables', 180), starch('cooked_rice', 80, { optional: true }), sauce('tomato_sauce_light', 30)],
      description: 'A portion of lean beef mince with vegetables and optional rice.'
    }),
    recipe({
      id: 'lunch_tuna_salad_plate',
      title: 'Tuna salad plate',
      mealTypes: ['lunch'],
      diets: ['omnivore', 'pescatarian'],
      proteinFamily: 'fish',
      protein: 'tuna_canned_drained',
      tags: ['fish', 'salad'],
      components: [protein('tuna_canned_drained', 100), veg('salad_vegetables', 180), sauce('light_dressing', 20), starch('crackers', 25, { optional: true })],
      description: 'A portion of tuna with salad vegetables and optional crackers.'
    }),
    recipe({
      id: 'lunch_grilled_fish_plate',
      title: 'Grilled fish protein plate',
      mealTypes: ['lunch'],
      diets: ['omnivore', 'pescatarian'],
      proteinFamily: 'fish',
      protein: 'white_fish_cooked',
      tags: ['fish'],
      supportGood: ['bloating'],
      components: [protein('white_fish_cooked', 130), veg('cooked_green_vegetables', 160), starch('cooked_potato', 80, { optional: true })],
      description: 'A portion of grilled white fish with cooked vegetables and optional potato.'
    }),
    recipe({
      id: 'lunch_prawn_lettuce_cups',
      title: 'Prawn lettuce cups',
      mealTypes: ['lunch'],
      diets: ['omnivore', 'pescatarian'],
      proteinFamily: 'seafood_add_on',
      protein: 'prawns_cooked',
      tags: ['shellfish', 'prawns', 'seafood', 'light'],
      supportGood: ['lowAppetite', 'bloating'],
      supportAvoid: ['nausea'],
      components: [protein('prawns_cooked', 140), veg('lettuce_cups', 80), veg('cucumber', 80), veg('carrot', 60), sauce('yoghurt_sauce', 20)],
      description: 'A portion of prawns/shrimp in lettuce cups with cucumber, carrot and a light sauce.'
    }),
    recipe({
      id: 'lunch_grilled_calamari_salad',
      title: 'Grilled calamari salad',
      mealTypes: ['lunch'],
      diets: ['omnivore', 'pescatarian'],
      proteinFamily: 'seafood_add_on',
      protein: 'calamari_cooked',
      tags: ['shellfish', 'calamari', 'seafood', 'salad'],
      supportAvoid: ['nausea'],
      components: [protein('calamari_cooked', 140), veg('salad_vegetables', 180), sauce('light_dressing', 20)],
      description: 'A portion of grilled calamari with salad vegetables and a light dressing.'
    }),
    recipe({
      id: 'lunch_pork_lettuce_cups',
      title: 'Lean pork lettuce cups',
      mealTypes: ['lunch'],
      diets: ['omnivore'],
      proteinFamily: 'pork',
      protein: 'lean_pork_loin_cooked',
      tags: ['pork', 'light'],
      components: [protein('lean_pork_loin_cooked', 115), veg('lettuce_cups', 80), veg('cucumber', 70), veg('carrot', 60), sauce('soy_ginger_sauce', 20)],
      description: 'A portion of lean pork fillet/loin strips in lettuce cups with crunchy vegetables.'
    }),
    recipe({
      id: 'lunch_egg_salad_plate',
      title: '2–3 egg salad plate',
      mealTypes: ['lunch'],
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'eggs',
      protein: 'eggs',
      tags: ['eggs', 'salad', 'vegetarian'],
      supportGood: ['lowAppetite', 'bloating'],
      components: [item('eggs', 'protein', 2, { eggProfile: true }), veg('salad_vegetables', 180), starch('cooked_potato', 70, { optional: true })],
      description: 'A 2–3 egg salad plate with vegetables and optional potato.'
    }),
    recipe({
      id: 'lunch_cottage_cheese_plate',
      title: 'Cottage cheese protein plate',
      mealTypes: ['lunch'],
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'dairy',
      protein: 'cottage_cheese',
      tags: ['dairy', 'vegetarian', 'simple'],
      supportGood: ['lowAppetite', 'nausea', 'bloating', 'exhaustion'],
      components: [dairy('cottage_cheese', 200), veg('salad_vegetables', 160), starch('crackers', 25, { optional: true })],
      description: 'Cottage cheese with crunchy vegetables and optional crackers.'
    }),
    recipe({
      id: 'lunch_tofu_bowl',
      title: 'Tofu lunch bowl',
      mealTypes: ['lunch'],
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'soy',
      protein: 'tofu_firm',
      tags: ['soy', 'vegetarian'],
      supportGood: ['bloating'],
      components: [protein('tofu_firm', 180), veg('mixed_vegetables', 180), starch('cooked_rice', 75, { optional: true }), sauce('soy_ginger_sauce', 25)],
      description: 'A tofu bowl with mixed vegetables, light sauce and optional rice.'
    }),
    recipe({
      id: 'lunch_chickpea_salad_bowl',
      title: 'Chickpea salad bowl',
      mealTypes: ['lunch'],
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'legume',
      protein: 'chickpeas_cooked',
      tags: ['legumes', 'chickpeas', 'vegetarian', 'salad', 'highFibre'],
      supportAvoid: ['bloating', 'nausea'],
      components: [protein('chickpeas_cooked', 150), veg('salad_vegetables', 180), sauce('light_dressing', 20)],
      description: 'Chickpeas with cucumber, tomato, greens and a light dressing.'
    }),
    recipe({
      id: 'lunch_lentil_vegetable_soup',
      title: 'Lentil vegetable soup lunch',
      mealTypes: ['lunch'],
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'legume',
      protein: 'lentils_cooked',
      tags: ['legumes', 'lentils', 'vegetarian', 'soup', 'highFibre'],
      supportGood: ['lowAppetite'],
      supportAvoid: ['bloating'],
      components: [protein('lentils_cooked', 170), veg('soup_vegetables', 180), comp('stock_broth', 'broth', 200, 'g')],
      description: 'Lentils with cooked vegetables in a simple soup.'
    }),
    recipe({
      id: 'lunch_bean_wrap',
      title: 'Bean wrap',
      mealTypes: ['lunch'],
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'legume',
      protein: 'beans_cooked',
      tags: ['legumes', 'beans', 'vegetarian', 'wrap', 'highFibre'],
      supportAvoid: ['bloating'],
      components: [protein('beans_cooked', 130), item('wrap', 'starch', 1), veg('salad_vegetables', 120), sauce('tomato_sauce_light', 20)],
      description: 'Beans with salad vegetables in a wrap.'
    }),
    recipe({
      id: 'lunch_meat_free_mince_bowl',
      title: 'Meat-free mince lunch bowl',
      mealTypes: ['lunch'],
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'vegetarian_convenience',
      protein: 'meat_free_mince',
      tags: ['vegetarian', 'convenience'],
      components: [protein('meat_free_mince', 120), veg('mixed_vegetables', 170), starch('cooked_rice', 75, { optional: true }), sauce('tomato_sauce_light', 30)],
      description: 'Meat-free mince with vegetables and optional rice.'
    }),

    // Dinners — soup
    recipe({
      id: 'dinner_chicken_vegetable_soup',
      title: 'Chicken vegetable soup',
      mealTypes: ['dinner'],
      template: 'soup',
      diets: ['omnivore'],
      proteinFamily: 'chicken',
      protein: 'chicken_breast_cooked',
      tags: ['chicken', 'soup', 'soft'],
      supportGood: ['lowAppetite', 'nausea', 'exhaustion'],
      components: [protein('chicken_breast_cooked', 120), veg('soup_vegetables', 220), comp('stock_broth', 'broth', 250, 'g'), starch('cooked_potato', 70, { optional: true })],
      description: 'A portion of chicken breast in a simple vegetable soup with optional potato.'
    }),
    recipe({
      id: 'dinner_beef_vegetable_soup',
      title: 'Lean beef vegetable soup',
      mealTypes: ['dinner'],
      template: 'soup',
      diets: ['omnivore'],
      proteinFamily: 'red_meat',
      protein: 'lean_beef_strips_cooked',
      tags: ['beef', 'redMeat', 'soup'],
      supportAvoid: ['nausea'],
      components: [protein('lean_beef_strips_cooked', 115), veg('soup_vegetables', 220), comp('stock_broth', 'broth', 250, 'g'), starch('cooked_potato', 70, { optional: true })],
      description: 'A portion of lean beef strips in a vegetable soup with optional potato.'
    }),
    recipe({
      id: 'dinner_lentil_vegetable_soup',
      title: 'Lentil vegetable soup',
      mealTypes: ['dinner'],
      template: 'soup',
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'legume',
      protein: 'lentils_cooked',
      tags: ['vegetarian', 'legumes', 'lentils', 'soup', 'highFibre'],
      supportGood: ['lowAppetite'],
      supportAvoid: ['bloating'],
      components: [protein('lentils_cooked', 190), veg('soup_vegetables', 220), comp('stock_broth', 'broth', 250, 'g')],
      description: 'Lentils with cooked vegetables in a simple soup.'
    }),
    recipe({
      id: 'dinner_fish_soup',
      title: 'Light fish soup',
      mealTypes: ['dinner'],
      template: 'soup',
      diets: ['omnivore', 'pescatarian'],
      proteinFamily: 'fish',
      protein: 'white_fish_cooked',
      tags: ['fish', 'soup', 'soft'],
      supportGood: ['lowAppetite'],
      components: [protein('white_fish_cooked', 135), veg('soup_vegetables', 220), comp('stock_broth', 'broth', 250, 'g'), starch('cooked_potato', 60, { optional: true })],
      description: 'A portion of white fish in a light vegetable soup.'
    }),
    recipe({
      id: 'dinner_light_mussel_soup',
      title: 'Light mussel soup',
      mealTypes: ['dinner'],
      template: 'soup',
      diets: ['omnivore', 'pescatarian'],
      proteinFamily: 'seafood_add_on',
      protein: 'mussels_cooked',
      tags: ['shellfish', 'mussels', 'seafood', 'soup', 'rareSeafood'],
      supportAvoid: ['nausea', 'lowAppetite', 'exhaustion'],
      complexity: 'higher',
      components: [protein('mussels_cooked', 130), veg('soup_vegetables', 180), comp('stock_broth', 'broth', 250, 'g'), sauce('tomato_base', 80)],
      description: 'Mussels in a light tomato-style vegetable soup. No cream.'
    }),
    recipe({
      id: 'dinner_light_clam_soup',
      title: 'Light clam soup',
      mealTypes: ['dinner'],
      template: 'soup',
      diets: ['omnivore', 'pescatarian'],
      proteinFamily: 'seafood_add_on',
      protein: 'clams_cooked',
      tags: ['shellfish', 'clams', 'seafood', 'soup', 'rareSeafood'],
      supportAvoid: ['nausea', 'lowAppetite', 'exhaustion'],
      complexity: 'higher',
      components: [protein('clams_cooked', 130), veg('soup_vegetables', 180), comp('stock_broth', 'broth', 250, 'g'), sauce('tomato_base', 80)],
      description: 'Clams in a light tomato-style vegetable soup. No cream.'
    }),

    // Dinners — curry / stew
    recipe({
      id: 'dinner_chicken_curry',
      title: 'Chicken curry bowl',
      mealTypes: ['dinner'],
      template: 'curry_stew',
      diets: ['omnivore'],
      proteinFamily: 'chicken',
      protein: 'chicken_breast_cooked',
      tags: ['chicken', 'curry'],
      supportAvoid: ['nausea'],
      components: [protein('chicken_breast_cooked', 130), veg('mixed_vegetables', 190), sauce('curry_sauce_light', 70), starch('cooked_rice', 100, { optional: true })],
      description: 'A portion of chicken breast in a mild curry-style sauce with vegetables and optional rice.'
    }),
    recipe({
      id: 'dinner_beef_stew',
      title: 'Lean beef stew',
      mealTypes: ['dinner'],
      template: 'curry_stew',
      diets: ['omnivore'],
      proteinFamily: 'red_meat',
      protein: 'lean_beef_strips_cooked',
      tags: ['beef', 'redMeat', 'stew'],
      supportAvoid: ['nausea'],
      components: [protein('lean_beef_strips_cooked', 130), veg('soup_vegetables', 220), sauce('tomato_base', 100), starch('cooked_potato', 100, { optional: true })],
      description: 'A portion of lean beef strips in a tomato-style stew with vegetables and optional potato.'
    }),
    recipe({
      id: 'dinner_lamb_stew',
      title: 'Lean lamb stew',
      mealTypes: ['dinner'],
      template: 'curry_stew',
      diets: ['omnivore'],
      proteinFamily: 'red_meat',
      protein: 'lamb_lean_cooked',
      tags: ['lamb', 'redMeat', 'stew'],
      supportAvoid: ['nausea'],
      components: [protein('lamb_lean_cooked', 120), veg('soup_vegetables', 220), sauce('tomato_base', 100), starch('cooked_potato', 90, { optional: true })],
      description: 'A portion of lean lamb in a home-style stew with vegetables and optional potato.'
    }),
    recipe({
      id: 'dinner_pork_tomato_stew',
      title: 'Tomato pork stew',
      mealTypes: ['dinner'],
      template: 'curry_stew',
      diets: ['omnivore'],
      proteinFamily: 'pork',
      protein: 'lean_pork_loin_cooked',
      tags: ['pork', 'stew'],
      components: [protein('lean_pork_loin_cooked', 125), veg('mixed_vegetables', 200), sauce('tomato_base', 100), starch('cooked_rice', 80, { optional: true })],
      description: 'A portion of lean pork fillet/loin strips in a tomato stew with vegetables and optional rice.'
    }),
    recipe({
      id: 'dinner_lentil_curry',
      title: 'Lentil curry',
      mealTypes: ['dinner'],
      template: 'curry_stew',
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'legume',
      protein: 'lentils_cooked',
      tags: ['vegetarian', 'legumes', 'lentils', 'curry', 'highFibre'],
      supportAvoid: ['bloating'],
      components: [protein('lentils_cooked', 200), veg('mixed_vegetables', 190), sauce('curry_sauce_light', 70), starch('cooked_rice', 75, { optional: true })],
      description: 'Lentils in a mild curry-style sauce with vegetables and optional rice.'
    }),
    recipe({
      id: 'dinner_chickpea_curry',
      title: 'Chickpea curry',
      mealTypes: ['dinner'],
      template: 'curry_stew',
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'legume',
      protein: 'chickpeas_cooked',
      tags: ['vegetarian', 'legumes', 'chickpeas', 'curry', 'highFibre'],
      supportAvoid: ['bloating', 'nausea'],
      components: [protein('chickpeas_cooked', 180), veg('mixed_vegetables', 190), sauce('curry_sauce_light', 70), starch('cooked_rice', 75, { optional: true })],
      description: 'Chickpeas in a mild curry-style sauce with vegetables and optional rice.'
    }),
    recipe({
      id: 'dinner_tofu_curry',
      title: 'Tofu curry',
      mealTypes: ['dinner'],
      template: 'curry_stew',
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'soy',
      protein: 'tofu_firm',
      tags: ['vegetarian', 'soy', 'curry'],
      supportGood: ['bloating'],
      components: [protein('tofu_firm', 190), veg('mixed_vegetables', 190), sauce('curry_sauce_light', 70), starch('cooked_rice', 75, { optional: true })],
      description: 'Tofu in a mild curry-style sauce with vegetables and optional rice.'
    }),
    recipe({
      id: 'dinner_prawn_curry',
      title: 'Prawn curry',
      mealTypes: ['dinner'],
      template: 'curry_stew',
      diets: ['omnivore', 'pescatarian'],
      proteinFamily: 'seafood_add_on',
      protein: 'prawns_cooked',
      tags: ['shellfish', 'prawns', 'seafood', 'curry'],
      supportAvoid: ['nausea'],
      components: [protein('prawns_cooked', 150), veg('mixed_vegetables', 180), sauce('curry_sauce_light', 70), starch('cooked_rice', 90, { optional: true })],
      description: 'A portion of prawns/shrimp in a mild curry-style sauce with vegetables and optional rice.'
    }),
    recipe({
      id: 'dinner_tomato_mussel_stew',
      title: 'Tomato mussel stew',
      mealTypes: ['dinner'],
      template: 'curry_stew',
      diets: ['omnivore', 'pescatarian'],
      proteinFamily: 'seafood_add_on',
      protein: 'mussels_cooked',
      tags: ['shellfish', 'mussels', 'seafood', 'rareSeafood', 'stew'],
      supportAvoid: ['nausea', 'lowAppetite', 'exhaustion'],
      complexity: 'higher',
      components: [protein('mussels_cooked', 140), veg('mixed_vegetables', 170), sauce('tomato_base', 120), starch('cooked_rice', 70, { optional: true })],
      description: 'Mussels in a tomato-style stew with vegetables and optional rice. No cream.'
    }),
    recipe({
      id: 'dinner_clam_tomato_bowl',
      title: 'Clam tomato bowl',
      mealTypes: ['dinner'],
      template: 'curry_stew',
      diets: ['omnivore', 'pescatarian'],
      proteinFamily: 'seafood_add_on',
      protein: 'clams_cooked',
      tags: ['shellfish', 'clams', 'seafood', 'rareSeafood'],
      supportAvoid: ['nausea', 'lowAppetite', 'exhaustion'],
      complexity: 'higher',
      components: [protein('clams_cooked', 140), veg('mixed_vegetables', 170), sauce('tomato_base', 120), starch('cooked_rice', 70, { optional: true })],
      description: 'Clams in a tomato-style bowl with vegetables and optional rice. No cream.'
    }),

    // Dinners — stir fry
    recipe({
      id: 'dinner_chicken_stir_fry',
      title: 'Chicken stir-fry',
      mealTypes: ['dinner'],
      template: 'stir_fry',
      diets: ['omnivore'],
      proteinFamily: 'chicken',
      protein: 'chicken_breast_cooked',
      tags: ['chicken', 'stirFry'],
      components: [protein('chicken_breast_cooked', 130), veg('stir_fry_vegetables', 220), sauce('soy_ginger_sauce', 30), starch('cooked_rice', 90, { optional: true })],
      description: 'A portion of chicken breast with stir-fry vegetables, light garlic-ginger flavour and optional rice.'
    }),
    recipe({
      id: 'dinner_beef_stir_fry',
      title: 'Lean beef stir-fry',
      mealTypes: ['dinner'],
      template: 'stir_fry',
      diets: ['omnivore'],
      proteinFamily: 'red_meat',
      protein: 'lean_beef_strips_cooked',
      tags: ['beef', 'redMeat', 'stirFry'],
      supportAvoid: ['nausea'],
      components: [protein('lean_beef_strips_cooked', 125), veg('stir_fry_vegetables', 220), sauce('soy_ginger_sauce', 30), starch('cooked_rice', 80, { optional: true })],
      description: 'A portion of lean beef strips with stir-fry vegetables and optional rice.'
    }),
    recipe({
      id: 'dinner_pork_stir_fry',
      title: 'Asian pork stir-fry',
      mealTypes: ['dinner'],
      template: 'stir_fry',
      diets: ['omnivore'],
      proteinFamily: 'pork',
      protein: 'lean_pork_loin_cooked',
      tags: ['pork', 'stirFry'],
      components: [protein('lean_pork_loin_cooked', 125), veg('stir_fry_vegetables', 220), sauce('soy_ginger_sauce', 30), starch('cooked_rice', 80, { optional: true })],
      description: 'A portion of lean pork fillet/loin strips with stir-fry vegetables and optional rice.'
    }),
    recipe({
      id: 'dinner_tofu_stir_fry',
      title: 'Tofu stir-fry',
      mealTypes: ['dinner'],
      template: 'stir_fry',
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'soy',
      protein: 'tofu_firm',
      tags: ['vegetarian', 'soy', 'stirFry'],
      supportGood: ['bloating'],
      components: [protein('tofu_firm', 200), veg('stir_fry_vegetables', 220), sauce('soy_ginger_sauce', 30), starch('cooked_rice', 80, { optional: true })],
      description: 'Tofu with stir-fry vegetables, light garlic-ginger flavour and optional rice.'
    }),
    recipe({
      id: 'dinner_prawn_stir_fry',
      title: 'Prawn stir-fry',
      mealTypes: ['dinner'],
      template: 'stir_fry',
      diets: ['omnivore', 'pescatarian'],
      proteinFamily: 'seafood_add_on',
      protein: 'prawns_cooked',
      tags: ['shellfish', 'prawns', 'seafood', 'stirFry'],
      supportGood: ['bloating'],
      supportAvoid: ['nausea'],
      components: [protein('prawns_cooked', 150), veg('stir_fry_vegetables', 220), sauce('soy_ginger_sauce', 30), starch('cooked_rice', 80, { optional: true })],
      description: 'A portion of prawns/shrimp with stir-fry vegetables, garlic-ginger flavour and optional rice.'
    }),
    recipe({
      id: 'dinner_calamari_stir_fry',
      title: 'Calamari stir-fry',
      mealTypes: ['dinner'],
      template: 'stir_fry',
      diets: ['omnivore', 'pescatarian'],
      proteinFamily: 'seafood_add_on',
      protein: 'calamari_cooked',
      tags: ['shellfish', 'calamari', 'seafood', 'stirFry'],
      supportAvoid: ['nausea'],
      components: [protein('calamari_cooked', 160), veg('stir_fry_vegetables', 220), sauce('soy_ginger_sauce', 30), starch('cooked_rice', 75, { optional: true })],
      description: 'A portion of pan-seared calamari with stir-fry vegetables and optional rice. No batter or frying.'
    }),
    recipe({
      id: 'dinner_prawn_calamari_stir_fry',
      title: 'Prawn + calamari stir-fry',
      mealTypes: ['dinner'],
      template: 'stir_fry',
      diets: ['omnivore', 'pescatarian'],
      proteinFamily: 'seafood_add_on',
      protein: 'prawns_calamari',
      tags: ['shellfish', 'prawns', 'calamari', 'seafood', 'stirFry'],
      supportAvoid: ['nausea'],
      components: [protein('prawns_cooked', 90), protein('calamari_cooked', 90), veg('stir_fry_vegetables', 220), sauce('soy_ginger_sauce', 30), starch('cooked_rice', 75, { optional: true })],
      description: 'A portion of prawns/shrimp and calamari with stir-fry vegetables and optional rice.'
    }),
    recipe({
      id: 'dinner_egg_fried_rice_style_bowl',
      title: '2–3 egg fried rice-style vegetable bowl',
      mealTypes: ['dinner'],
      template: 'stir_fry',
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'eggs',
      protein: 'eggs',
      tags: ['eggs', 'vegetarian', 'stirFry', 'starch'],
      components: [item('eggs', 'protein', 2, { eggProfile: true }), veg('stir_fry_vegetables', 200), starch('cooked_rice', 100), sauce('soy_ginger_sauce', 25)],
      description: 'A 2–3 egg fried rice-style bowl with vegetables and a controlled rice portion.'
    }),

    // Dinners — grill / plate
    recipe({
      id: 'dinner_grilled_chicken_plate',
      title: 'Grilled chicken plate',
      mealTypes: ['dinner'],
      template: 'grill_plate',
      diets: ['omnivore'],
      proteinFamily: 'chicken',
      protein: 'chicken_breast_cooked',
      tags: ['chicken', 'plate'],
      supportGood: ['bloating'],
      components: [protein('chicken_breast_cooked', 140), veg('cooked_green_vegetables', 180), starch('sweet_potato_cooked', 100, { optional: true }), sauce('light_dressing', 15)],
      description: 'A portion of grilled chicken breast with green vegetables and optional sweet potato.'
    }),
    recipe({
      id: 'dinner_grilled_hake_plate',
      title: 'Grilled hake or white fish plate',
      mealTypes: ['dinner'],
      template: 'grill_plate',
      diets: ['omnivore', 'pescatarian'],
      proteinFamily: 'fish',
      protein: 'hake_cooked',
      tags: ['fish', 'plate'],
      supportGood: ['bloating'],
      countryTags: ['ZA'],
      components: [protein('hake_cooked', 150), veg('cooked_green_vegetables', 180), starch('cooked_potato', 90, { optional: true })],
      description: 'A portion of grilled hake or white fish with green vegetables and optional potato.'
    }),
    recipe({
      id: 'dinner_beef_plate',
      title: 'Lean beef plate',
      mealTypes: ['dinner'],
      template: 'grill_plate',
      diets: ['omnivore'],
      proteinFamily: 'red_meat',
      protein: 'lean_beef_strips_cooked',
      tags: ['beef', 'redMeat', 'plate'],
      supportAvoid: ['nausea'],
      components: [protein('lean_beef_strips_cooked', 130), veg('cooked_green_vegetables', 180), starch('sweet_potato_cooked', 90, { optional: true })],
      description: 'A portion of lean beef strips with green vegetables and optional sweet potato.'
    }),
    recipe({
      id: 'dinner_pork_skewer_plate',
      title: 'Lean pork skewer plate',
      mealTypes: ['dinner'],
      template: 'grill_plate',
      diets: ['omnivore'],
      proteinFamily: 'pork',
      protein: 'lean_pork_loin_cooked',
      tags: ['pork', 'plate'],
      components: [protein('lean_pork_loin_cooked', 130), veg('cooked_green_vegetables', 180), starch('sweet_potato_cooked', 85, { optional: true }), sauce('light_sauce', 15)],
      description: 'A portion of lean pork fillet/loin strips as skewers with vegetables and optional sweet potato.'
    }),
    recipe({
      id: 'dinner_grilled_calamari_plate',
      title: 'Grilled calamari plate',
      mealTypes: ['dinner'],
      template: 'grill_plate',
      diets: ['omnivore', 'pescatarian'],
      proteinFamily: 'seafood_add_on',
      protein: 'calamari_cooked',
      tags: ['shellfish', 'calamari', 'seafood', 'plate'],
      supportAvoid: ['nausea'],
      components: [protein('calamari_cooked', 170), veg('cooked_green_vegetables', 180), starch('cooked_potato', 80, { optional: true }), sauce('light_sauce', 15)],
      description: 'A portion of grilled or pan-seared calamari with vegetables and optional potato. No batter or frying.'
    }),
    recipe({
      id: 'dinner_tofu_skewer_plate',
      title: 'Tofu skewer plate',
      mealTypes: ['dinner'],
      template: 'grill_plate',
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'soy',
      protein: 'tofu_firm',
      tags: ['vegetarian', 'soy', 'plate'],
      components: [protein('tofu_firm', 200), veg('roast_vegetables', 200), starch('sweet_potato_cooked', 80, { optional: true }), sauce('light_sauce', 15)],
      description: 'Tofu skewers with roast vegetables and optional sweet potato.'
    }),
    recipe({
      id: 'dinner_frittata_plate',
      title: '2–3 egg frittata plate',
      mealTypes: ['dinner'],
      template: 'grill_plate',
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'eggs',
      protein: 'eggs',
      tags: ['vegetarian', 'eggs', 'plate'],
      supportGood: ['lowAppetite', 'bloating'],
      components: [item('eggs', 'protein', 2, { eggProfile: true }), veg('mixed_vegetables', 180), starch('cooked_potato', 70, { optional: true })],
      description: 'A 2–3 egg frittata with vegetables and optional potato.'
    }),

    // Dinners — fun food
    recipe({
      id: 'dinner_beef_burger_bowl',
      title: 'Lean beef burger bowl',
      mealTypes: ['dinner'],
      template: 'fun_food',
      diets: ['omnivore'],
      proteinFamily: 'red_meat',
      protein: 'lean_beef_mince_cooked',
      tags: ['beef', 'redMeat', 'funFood'],
      components: [protein('lean_beef_mince_cooked', 130), veg('salad_vegetables', 180), starch('cooked_potato', 100, { optional: true }), sauce('light_dressing', 20)],
      description: 'A lean beef burger-style bowl with salad vegetables and optional potato wedges.'
    }),
    recipe({
      id: 'dinner_chicken_taco_bowl',
      title: 'Chicken taco-style bowl',
      mealTypes: ['dinner'],
      template: 'fun_food',
      diets: ['omnivore'],
      proteinFamily: 'chicken',
      protein: 'chicken_breast_cooked',
      tags: ['chicken', 'funFood'],
      components: [protein('chicken_breast_cooked', 130), veg('salad_vegetables', 170), starch('cooked_rice', 90, { optional: true }), sauce('yoghurt_sauce', 25)],
      description: 'A chicken taco-style bowl with salad vegetables, light sauce and optional rice.'
    }),
    recipe({
      id: 'dinner_seafood_paella_bowl',
      title: 'Seafood paella-style rice bowl',
      mealTypes: ['dinner'],
      template: 'fun_food',
      diets: ['omnivore', 'pescatarian'],
      proteinFamily: 'seafood_add_on',
      protein: 'prawns_calamari',
      tags: ['shellfish', 'prawns', 'calamari', 'seafood', 'funFood', 'starch'],
      supportAvoid: ['nausea'],
      components: [protein('prawns_cooked', 90), protein('calamari_cooked', 80), starch('cooked_rice', 110), veg('peppers', 80), veg('tomato', 90), comp('peas', 'vegetables', 50, 'g'), sauce('tomato_sauce_light', 40)],
      description: 'A home-style seafood paella-style rice bowl with prawns/shrimp, calamari, vegetables and a controlled rice portion.'
    }),
    recipe({
      id: 'dinner_prawn_noodle_bowl',
      title: 'Prawn noodle bowl',
      mealTypes: ['dinner'],
      template: 'fun_food',
      diets: ['omnivore', 'pescatarian'],
      proteinFamily: 'seafood_add_on',
      protein: 'prawns_cooked',
      tags: ['shellfish', 'prawns', 'seafood', 'funFood', 'starch'],
      supportAvoid: ['nausea'],
      components: [protein('prawns_cooked', 150), starch('cooked_noodles', 110), veg('stir_fry_vegetables', 180), sauce('soy_ginger_sauce', 30)],
      description: 'A prawn/shrimp noodle bowl with vegetables and a light sauce.'
    }),
    recipe({
      id: 'dinner_pork_noodle_bowl',
      title: 'Lean pork noodle bowl',
      mealTypes: ['dinner'],
      template: 'fun_food',
      diets: ['omnivore'],
      proteinFamily: 'pork',
      protein: 'lean_pork_loin_cooked',
      tags: ['pork', 'funFood', 'starch'],
      components: [protein('lean_pork_loin_cooked', 125), starch('cooked_noodles', 100), veg('stir_fry_vegetables', 180), sauce('soy_ginger_sauce', 30)],
      description: 'A portion of lean pork fillet/loin strips with noodles, vegetables and a light sauce.'
    }),
    recipe({
      id: 'dinner_beef_chilli_bowl',
      title: 'Lean beef chilli-style bowl',
      mealTypes: ['dinner'],
      template: 'fun_food',
      diets: ['omnivore'],
      proteinFamily: 'red_meat',
      protein: 'lean_beef_mince_cooked',
      tags: ['beef', 'redMeat', 'funFood'],
      supportAvoid: ['nausea'],
      components: [protein('lean_beef_mince_cooked', 120), protein('beans_cooked', 70), veg('mixed_vegetables', 160), sauce('tomato_base', 80), starch('cooked_rice', 70, { optional: true })],
      description: 'Lean beef mince in a chilli-style bowl with vegetables, a small bean portion and optional rice.'
    }),
    recipe({
      id: 'dinner_vegetarian_mince_taco_bowl',
      title: 'Vegetarian mince taco-style bowl',
      mealTypes: ['dinner'],
      template: 'fun_food',
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'vegetarian_convenience',
      protein: 'meat_free_mince',
      tags: ['vegetarian', 'convenience', 'funFood'],
      components: [protein('meat_free_mince', 130), veg('salad_vegetables', 170), starch('cooked_rice', 75, { optional: true }), sauce('tomato_sauce_light', 35)],
      description: 'Meat-free mince in a taco-style bowl with salad vegetables and optional rice.'
    }),
    recipe({
      id: 'dinner_tofu_noodle_bowl',
      title: 'Tofu noodle bowl',
      mealTypes: ['dinner'],
      template: 'fun_food',
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'soy',
      protein: 'tofu_firm',
      tags: ['vegetarian', 'soy', 'funFood', 'starch'],
      components: [protein('tofu_firm', 190), starch('cooked_noodles', 100), veg('stir_fry_vegetables', 180), sauce('soy_ginger_sauce', 30)],
      description: 'Tofu with noodles, vegetables and a light sauce.'
    }),
    recipe({
      id: 'dinner_bean_taco_bowl',
      title: 'Bean taco-style bowl',
      mealTypes: ['dinner'],
      template: 'fun_food',
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'legume',
      protein: 'beans_cooked',
      tags: ['vegetarian', 'legumes', 'beans', 'funFood', 'highFibre'],
      supportAvoid: ['bloating'],
      components: [protein('beans_cooked', 160), veg('salad_vegetables', 170), starch('cooked_rice', 70, { optional: true }), sauce('tomato_sauce_light', 35)],
      description: 'Beans in a taco-style bowl with salad vegetables and optional rice.'
    }),

    // Dinners — light
    recipe({
      id: 'dinner_egg_omelette_salad',
      title: '2–3 egg omelette and salad',
      mealTypes: ['dinner'],
      template: 'light',
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'eggs',
      protein: 'eggs',
      tags: ['eggs', 'vegetarian', 'light'],
      supportGood: ['lowAppetite', 'nausea', 'bloating'],
      components: [item('eggs', 'protein', 2, { eggProfile: true }), veg('salad_vegetables', 160), starch('bread_slice', 1, { unit: 'item', optional: true })],
      description: 'A 2–3 egg omelette with salad vegetables and optional toast.'
    }),
    recipe({
      id: 'dinner_cottage_cheese_light_plate',
      title: 'Cottage cheese light plate',
      mealTypes: ['dinner'],
      template: 'light',
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'dairy',
      protein: 'cottage_cheese',
      tags: ['dairy', 'vegetarian', 'light', 'simple'],
      supportGood: ['lowAppetite', 'nausea', 'bloating', 'exhaustion'],
      components: [dairy('cottage_cheese', 220), veg('salad_vegetables', 160), starch('crackers', 25, { optional: true })],
      description: 'Cottage cheese with salad vegetables and optional crackers.'
    }),
    recipe({
      id: 'dinner_prawn_salad_lettuce_cups',
      title: 'Prawn salad / lettuce cups',
      mealTypes: ['dinner'],
      template: 'light',
      diets: ['omnivore', 'pescatarian'],
      proteinFamily: 'seafood_add_on',
      protein: 'prawns_cooked',
      tags: ['shellfish', 'prawns', 'seafood', 'light'],
      supportGood: ['lowAppetite', 'bloating'],
      supportAvoid: ['nausea'],
      components: [protein('prawns_cooked', 150), veg('lettuce_cups', 80), veg('cucumber', 80), veg('carrot', 60), sauce('yoghurt_sauce', 20)],
      description: 'A portion of prawns/shrimp as a salad or lettuce cups with crunchy vegetables.'
    }),
    recipe({
      id: 'dinner_tofu_lettuce_cups',
      title: 'Tofu lettuce cups',
      mealTypes: ['dinner'],
      template: 'light',
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'soy',
      protein: 'tofu_firm',
      tags: ['vegetarian', 'soy', 'light'],
      supportGood: ['bloating'],
      components: [protein('tofu_firm', 190), veg('lettuce_cups', 80), veg('cucumber', 80), veg('carrot', 60), sauce('soy_ginger_sauce', 20)],
      description: 'Tofu lettuce cups with crunchy vegetables and a light sauce.'
    }),
    recipe({
      id: 'dinner_chicken_light_salad',
      title: 'Chicken light salad',
      mealTypes: ['dinner'],
      template: 'light',
      diets: ['omnivore'],
      proteinFamily: 'chicken',
      protein: 'chicken_breast_cooked',
      tags: ['chicken', 'light', 'salad'],
      supportGood: ['bloating'],
      components: [protein('chicken_breast_cooked', 130), veg('salad_vegetables', 170), sauce('light_dressing', 20)],
      description: 'A portion of chicken breast with salad vegetables and a light dressing.'
    }),
    recipe({
      id: 'dinner_fish_light_salad',
      title: 'Grilled fish light salad',
      mealTypes: ['dinner'],
      template: 'light',
      diets: ['omnivore', 'pescatarian'],
      proteinFamily: 'fish',
      protein: 'white_fish_cooked',
      tags: ['fish', 'light', 'salad'],
      components: [protein('white_fish_cooked', 140), veg('salad_vegetables', 170), sauce('light_dressing', 20)],
      description: 'A portion of grilled white fish with salad vegetables.'
    }),

    // Dinners — Sunday hearty
    recipe({
      id: 'dinner_roast_chicken_plate',
      title: 'Roast-style chicken plate',
      mealTypes: ['dinner'],
      template: 'sunday_hearty',
      diets: ['omnivore'],
      proteinFamily: 'chicken',
      protein: 'chicken_breast_cooked',
      tags: ['chicken', 'sunday'],
      components: [protein('chicken_breast_cooked', 145), veg('roast_vegetables', 220), veg('cooked_green_vegetables', 100), starch('cooked_potato', 100, { optional: true })],
      description: 'A roast-style chicken plate with roast vegetables, green veg and optional potato.'
    }),
    recipe({
      id: 'dinner_beef_cottage_pie_bowl',
      title: 'Lean beef cottage-pie style bowl',
      mealTypes: ['dinner'],
      template: 'sunday_hearty',
      diets: ['omnivore'],
      proteinFamily: 'red_meat',
      protein: 'lean_beef_mince_cooked',
      tags: ['beef', 'redMeat', 'sunday'],
      supportAvoid: ['nausea'],
      components: [protein('lean_beef_mince_cooked', 130), veg('mixed_vegetables', 180), starch('cooked_potato', 120), sauce('tomato_base', 60)],
      description: 'A lean beef cottage-pie style bowl with vegetables and a controlled potato topping.'
    }),
    recipe({
      id: 'dinner_sunday_pork_plate',
      title: 'Sunday-style lean pork plate',
      mealTypes: ['dinner'],
      template: 'sunday_hearty',
      diets: ['omnivore'],
      proteinFamily: 'pork',
      protein: 'lean_pork_loin_cooked',
      tags: ['pork', 'sunday'],
      components: [protein('lean_pork_loin_cooked', 135), veg('roast_vegetables', 220), veg('cooked_green_vegetables', 100), starch('cooked_potato', 90, { optional: true })],
      description: 'A portion of lean pork fillet/loin with roast vegetables, green veg and optional potato. No crackling or fatty roast wording.'
    }),
    recipe({
      id: 'dinner_fish_roast_veg_plate',
      title: 'Grilled fish with roast vegetables',
      mealTypes: ['dinner'],
      template: 'sunday_hearty',
      diets: ['omnivore', 'pescatarian'],
      proteinFamily: 'fish',
      protein: 'white_fish_cooked',
      tags: ['fish', 'sunday'],
      components: [protein('white_fish_cooked', 150), veg('roast_vegetables', 220), veg('cooked_green_vegetables', 100), starch('cooked_potato', 90, { optional: true })],
      description: 'A portion of grilled white fish with roast vegetables, green veg and optional potato.'
    }),
    recipe({
      id: 'dinner_lentil_loaf_plate',
      title: 'Lentil loaf-style Sunday plate',
      mealTypes: ['dinner'],
      template: 'sunday_hearty',
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'legume',
      protein: 'lentils_cooked',
      tags: ['vegetarian', 'legumes', 'lentils', 'sunday', 'highFibre'],
      supportAvoid: ['bloating'],
      components: [protein('lentils_cooked', 200), veg('roast_vegetables', 220), veg('cooked_green_vegetables', 100), starch('cooked_potato', 80, { optional: true })],
      description: 'A lentil loaf-style plate with roast vegetables, green veg and optional potato.'
    }),
    recipe({
      id: 'dinner_frittata_roast_plate',
      title: '2–3 egg frittata Sunday plate',
      mealTypes: ['dinner'],
      template: 'sunday_hearty',
      diets: ['omnivore', 'vegetarian', 'pescatarian'],
      proteinFamily: 'eggs',
      protein: 'eggs',
      tags: ['vegetarian', 'eggs', 'sunday'],
      supportGood: ['lowAppetite', 'bloating'],
      components: [item('eggs', 'protein', 2, { eggProfile: true }), veg('roast_vegetables', 220), veg('cooked_green_vegetables', 100), starch('cooked_potato', 80, { optional: true })],
      description: 'A 2–3 egg frittata with roast vegetables, green veg and optional potato.'
    })
  ];

  function generatePlan(rawInput) {
    var input = normalizeInput(rawInput || {});
    var rng = seededRandom(input.seed || createSeed(input));
    var state = createState();
    var days = [];
    var totalDays = Math.max(1, Math.min(28, parseInt(input.days, 10) || 7));

    for (var i = 0; i < totalDays; i++) {
      var rhythm = DINNER_RHYTHM[i % DINNER_RHYTHM.length];
      var dayState = { proteinFamilies: {}, tags: {}, starchMeals: 0, shakeCount: 0 };

      var dinner = selectRecipe({ mealType: 'dinner', template: rhythm.slot, input: input, state: state, dayState: dayState, rng: rng, dayIndex: i });
      addMealToState(dinner, state, dayState, 'dinner');

      var breakfast = selectRecipe({ mealType: 'breakfast', input: input, state: state, dayState: dayState, rng: rng, dayIndex: i });
      addMealToState(breakfast, state, dayState, 'breakfast');

      var lunch = selectRecipe({ mealType: 'lunch', input: input, state: state, dayState: dayState, rng: rng, dayIndex: i });
      addMealToState(lunch, state, dayState, 'lunch');

      var snacks = [];
      if (input.snacksEnabled) {
        var snack = selectRecipe({ mealType: 'snack', input: input, state: state, dayState: dayState, rng: rng, dayIndex: i });
        if (snack) {
          snacks.push(finalizeMeal(snack, 'snack', input));
          addMealToState(snack, state, dayState, 'snack');
        }
      }

      days.push({
        dayNumber: i + 1,
        dinnerSlot: rhythm.slot,
        dinnerSlotLabel: rhythm.label,
        meals: {
          breakfast: finalizeMeal(breakfast, 'breakfast', input),
          lunch: finalizeMeal(lunch, 'lunch', input),
          dinner: finalizeMeal(dinner, 'dinner', input),
          snacks: snacks
        },
        flags: []
      });
    }

    var plan = {
      version: VERSION,
      generatedAt: new Date().toISOString(),
      inputSummary: summarizeInput(input),
      portionProfile: input.portionProfile,
      nutritionMode: input.calorieMode,
      days: days
    };

    plan.shoppingList = buildShoppingList(plan, input);
    plan.validation = validatePlan(plan, input);
    plan.nutrition = calculatePlanNutrition(plan, input);
    return plan;
  }

  function normalizeInput(raw) {
    var country = String(raw.country || raw.region || 'US').toUpperCase();
    var countryMap = {
      SOUTH_AFRICA: 'ZA', 'SOUTH AFRICA': 'ZA', ZA: 'ZA',
      UNITED_KINGDOM: 'UK', 'UNITED KINGDOM': 'UK', GB: 'UK', UK: 'UK',
      UNITED_STATES: 'US', 'UNITED STATES': 'US', USA: 'US', US: 'US',
      AUSTRALIA: 'AU', AU: 'AU',
      CANADA: 'CA', CA: 'CA'
    };
    country = countryMap[country] || country;
    if (['ZA', 'UK', 'US', 'AU', 'CA'].indexOf(country) === -1) country = 'US';

    var dietType = String(raw.dietType || raw.eatingStyle || 'omnivore').toLowerCase();
    if (dietType === 'i eat most foods' || dietType === 'most_foods') dietType = 'omnivore';
    if (dietType === 'no pork') dietType = 'omnivore';
    if (dietType === 'no seafood/fish') dietType = 'omnivore';
    if (['omnivore', 'vegetarian', 'pescatarian'].indexOf(dietType) === -1) dietType = 'omnivore';

    var exclusions = Object.assign({
      pork: false,
      beef: false,
      chicken: false,
      fish: false,
      seafood: false,
      shellfish: false,
      dairy: false,
      eggs: false,
      legumes: false,
      soy: false,
      lamb: false
    }, raw.exclusions || {});

    var rawEating = String(raw.eatingStyle || '').toLowerCase();
    if (rawEating.indexOf('no pork') !== -1) exclusions.pork = true;
    if (rawEating.indexOf('no seafood') !== -1 || rawEating.indexOf('no fish') !== -1) {
      exclusions.fish = true;
      exclusions.seafood = true;
      exclusions.shellfish = true;
    }

    var religious = Object.assign({ halal: false, kosherStyle: false }, raw.religious || {});
    if (religious.halal || religious.kosherStyle) exclusions.pork = true;
    if (religious.kosherStyle) exclusions.shellfish = true;

    if (dietType === 'vegetarian') {
      exclusions.pork = true;
      exclusions.beef = true;
      exclusions.chicken = true;
      exclusions.fish = true;
      exclusions.seafood = true;
      exclusions.shellfish = true;
    }
    if (dietType === 'pescatarian') {
      exclusions.pork = true;
      exclusions.beef = true;
      exclusions.chicken = true;
    }

    var supportMode = Object.assign({ nausea: 0, lowAppetite: 0, bloating: 0, exhaustion: 0 }, raw.supportMode || {});
    var struggle = String(raw.mainStruggle || raw.struggle || '').toLowerCase();
    if (struggle.indexOf('nausea') !== -1) supportMode.nausea = Math.max(supportMode.nausea, 2);
    if (struggle.indexOf('low appetite') !== -1 || struggle.indexOf('appetite') !== -1) supportMode.lowAppetite = Math.max(supportMode.lowAppetite, 2);
    if (struggle.indexOf('bloat') !== -1) supportMode.bloating = Math.max(supportMode.bloating, 2);
    if (struggle.indexOf('protein') !== -1) supportMode.proteinIdeas = 2;
    if (struggle.indexOf('simple') !== -1) supportMode.exhaustion = Math.max(supportMode.exhaustion, 1);

    var appetite = String(raw.appetite || '').toLowerCase();
    var portionProfile = raw.portionProfile;
    if (!portionProfile) {
      if (supportMode.lowAppetite >= 2 || appetite.indexOf('very low') !== -1 || appetite.indexOf('low') !== -1) {
        portionProfile = 'low_appetite_glp1';
      } else if (supportMode.proteinIdeas >= 2 || String(raw.mainStruggle || '').toLowerCase().indexOf('protein') !== -1) {
        portionProfile = 'higher_protein_low_activity_glp1';
      } else {
        portionProfile = 'standard_low_activity_glp1';
      }
    }
    if (!PORTION_PROFILES[portionProfile]) portionProfile = 'standard_low_activity_glp1';

    return {
      country: country,
      dietType: dietType,
      exclusions: exclusions,
      religious: religious,
      supportMode: supportMode,
      appetite: appetite || (portionProfile === 'low_appetite_glp1' ? 'low' : 'normal'),
      prepMode: raw.prepMode || 'simple',
      snacksEnabled: raw.snacksEnabled !== false,
      leftoversEnabled: raw.leftoversEnabled !== false,
      days: raw.days || 7,
      seed: raw.seed,
      lockedMeals: raw.lockedMeals || {},
      portionProfile: portionProfile,
      preferredProteinFamilies: Array.isArray(raw.preferredProteinFamilies) ? raw.preferredProteinFamilies : [],
      preferredTags: Array.isArray(raw.preferredTags) ? raw.preferredTags : [],
      preferredFoodKeys: Array.isArray(raw.preferredFoodKeys) ? raw.preferredFoodKeys : [],
      strictPreferredFoodKeys: raw.strictPreferredFoodKeys === true,
      vegetablePreferences: Array.isArray(raw.vegetablePreferences) ? raw.vegetablePreferences : [],
      carbPreferences: Array.isArray(raw.carbPreferences) ? raw.carbPreferences : [],
      mealStylePreferences: Array.isArray(raw.mealStylePreferences) ? raw.mealStylePreferences : [],
      personalisationLevel: raw.personalisationLevel || 'generic_lead_magnet',
      calorieMode: raw.calorieMode || 'estimated_suggested_serving'
    };
  }

  function summarizeInput(input) {
    return {
      country: input.country,
      dietType: input.dietType,
      portionProfile: input.portionProfile,
      personalisationLevel: input.personalisationLevel,
      calorieMode: input.calorieMode,
      supportMode: input.supportMode,
      exclusions: input.exclusions
    };
  }

  function createSeed(input) {
    return [
      input.country,
      input.dietType,
      input.portionProfile,
      input.days,
      JSON.stringify(input.exclusions),
      JSON.stringify(input.supportMode),
      JSON.stringify(input.preferredProteinFamilies || []),
      JSON.stringify(input.preferredTags || []),
      JSON.stringify(input.preferredFoodKeys || []),
      JSON.stringify(input.vegetablePreferences || []),
      JSON.stringify(input.carbPreferences || []),
      JSON.stringify(input.mealStylePreferences || [])
    ].join('|');
  }

  function createState() {
    return {
      proteinFamilyCounts: {},
      proteinCounts: {},
      tagCounts: {},
      dinnerProteinFamilies: [],
      dinnerTemplates: [],
      porkDinners: 0,
      porkTotal: 0,
      seafoodAddOnTotal: 0,
      prawns: 0,
      calamari: 0,
      musselsClams: 0,
      vegetarian: {
        eggs: 0,
        dairy: 0,
        soy: 0,
        legumes: 0,
        lentils: 0,
        beansChickpeas: 0,
        convenience: 0,
        halloumi: 0
      }
    };
  }

  function selectRecipe(ctx) {
    var candidates = RECIPES.filter(function (r) {
      if (r.mealTypes.indexOf(ctx.mealType) === -1) return false;
      if (ctx.template && r.template !== ctx.template) return false;
      return isRecipeAllowed(r, ctx.input);
    });

    if (!candidates.length && ctx.template) {
      candidates = RECIPES.filter(function (r) {
        return r.mealTypes.indexOf(ctx.mealType) !== -1 && isRecipeAllowed(r, ctx.input);
      });
    }

    if (!candidates.length) return null;

    var scored = candidates.map(function (r) {
      return { recipe: r, score: scoreRecipe(r, ctx) + (ctx.rng() * 0.25) };
    }).sort(function (a, b) { return b.score - a.score; });

    return scored[0].recipe;
  }

  function isRecipeAllowed(r, input) {
    if (r.diets.indexOf(input.dietType) === -1 && !(input.dietType === 'omnivore' && r.diets.indexOf('vegetarian') !== -1)) return false;
    var tags = r.tags || [];
    var ex = input.exclusions || {};

    if (ex.pork && tags.indexOf('pork') !== -1) return false;
    if (ex.beef && tags.indexOf('beef') !== -1) return false;
    if (ex.lamb && tags.indexOf('lamb') !== -1) return false;
    if (ex.chicken && tags.indexOf('chicken') !== -1) return false;
    if ((ex.fish || ex.seafood) && tags.indexOf('fish') !== -1) return false;
    if ((ex.shellfish || ex.seafood) && tags.indexOf('shellfish') !== -1) return false;
    if (ex.dairy && tags.indexOf('dairy') !== -1) return false;
    if (ex.eggs && tags.indexOf('eggs') !== -1) return false;
    if (ex.legumes && tags.indexOf('legumes') !== -1) return false;
    if (ex.soy && tags.indexOf('soy') !== -1) return false;
    if (ex.lamb && tags.indexOf('lamb') !== -1) return false;

    if (input.dietType === 'vegetarian' && (tags.indexOf('chicken') !== -1 || tags.indexOf('beef') !== -1 || tags.indexOf('pork') !== -1 || tags.indexOf('fish') !== -1 || tags.indexOf('shellfish') !== -1)) return false;
    if (input.dietType === 'pescatarian' && (tags.indexOf('chicken') !== -1 || tags.indexOf('beef') !== -1 || tags.indexOf('pork') !== -1)) return false;

    if (input.strictPreferredFoodKeys && input.preferredFoodKeys && input.preferredFoodKeys.length && r.protein) {
      if (input.preferredFoodKeys.indexOf(r.protein) === -1) return false;
    }

    return true;
  }

  function scoreRecipe(r, ctx) {
    var state = ctx.state;
    var dayState = ctx.dayState;
    var input = ctx.input;
    var tags = r.tags || [];
    var support = input.supportMode || {};
    var score = 10;

    if (r.supportGood) {
      r.supportGood.forEach(function (key) { if (support[key] > 0) score += 2 * support[key]; });
    }
    if (r.supportAvoid) {
      r.supportAvoid.forEach(function (key) { if (support[key] > 0) score -= 4 * support[key]; });
    }

    // Lead-magnet preference hints. These do not override safety/exclusion rules;
    // they simply bias the full meal engine toward foods the user said they like.
    if (input.preferredProteinFamilies && input.preferredProteinFamilies.length) {
      if (input.preferredProteinFamilies.indexOf(r.proteinFamily) !== -1) score += 5;
      else score -= 0.35;
    }
    if (input.preferredFoodKeys && input.preferredFoodKeys.length) {
      if (input.preferredFoodKeys.indexOf(r.protein) !== -1) score += 2.5;
    }
    if (input.preferredTags && input.preferredTags.length) {
      input.preferredTags.forEach(function (tag) {
        if (tags.indexOf(tag) !== -1) score += 2;
      });
    }
    if (input.mealStylePreferences && input.mealStylePreferences.length) {
      if (input.mealStylePreferences.indexOf('quick') !== -1 && (tags.indexOf('simple') !== -1 || tags.indexOf('light') !== -1)) score += 1.5;
      if (input.mealStylePreferences.indexOf('wraps_salads') !== -1 && (tags.indexOf('wrap') !== -1 || tags.indexOf('salad') !== -1)) score += 2.5;
      if (input.mealStylePreferences.indexOf('bowls') !== -1 && (tags.indexOf('plate') !== -1 || tags.indexOf('stirFry') !== -1)) score += 1.5;
      if (input.mealStylePreferences.indexOf('no_cook') !== -1 && (tags.indexOf('salad') !== -1 || tags.indexOf('soft') !== -1 || tags.indexOf('simple') !== -1)) score += 2;
      if (input.mealStylePreferences.indexOf('meal_prep') !== -1 && (tags.indexOf('stew') !== -1 || tags.indexOf('curry') !== -1 || tags.indexOf('soup') !== -1)) score += 1.5;
    }

    if (support.bloating > 0) {
      if (tags.indexOf('legumes') !== -1) score -= 6 * support.bloating;
      if (tags.indexOf('salad') !== -1) score -= 1.5 * support.bloating;
      if (tags.indexOf('dairy') !== -1) score += 1;
      if (tags.indexOf('soy') !== -1) score += 1;
      if (tags.indexOf('eggs') !== -1) score += 1;
    }

    if (support.nausea > 0) {
      if (tags.indexOf('redMeat') !== -1) score -= 4 * support.nausea;
      if (tags.indexOf('shellfish') !== -1) score -= 5 * support.nausea;
      if (tags.indexOf('curry') !== -1) score -= 2 * support.nausea;
      if (tags.indexOf('soft') !== -1 || tags.indexOf('soup') !== -1) score += 3 * support.nausea;
    }

    if (support.lowAppetite > 0) {
      if (tags.indexOf('light') !== -1 || tags.indexOf('soft') !== -1 || tags.indexOf('simple') !== -1) score += 3 * support.lowAppetite;
      if (tags.indexOf('funFood') !== -1 || tags.indexOf('redMeat') !== -1) score -= 2 * support.lowAppetite;
    }

    if (support.exhaustion > 0) {
      if (tags.indexOf('simple') !== -1) score += 2 * support.exhaustion;
      if (r.complexity === 'higher') score -= 5 * support.exhaustion;
    }

    // Avoid repeating same protein family too much.
    var familyCount = state.proteinFamilyCounts[r.proteinFamily] || 0;
    score -= familyCount * 0.8;

    if (dayState.proteinFamilies[r.proteinFamily]) score -= 6;

    if (ctx.mealType === 'dinner') {
      var lastDinnerFamily = state.dinnerProteinFamilies[state.dinnerProteinFamilies.length - 1];
      if (lastDinnerFamily && lastDinnerFamily === r.proteinFamily) score -= 8;
    }

    // Pork lock rules.
    if (r.proteinFamily === 'pork') {
      if (state.porkTotal >= 3) score -= 100;
      if (ctx.mealType === 'dinner' && state.porkDinners >= 2) score -= 100;
    }

    // Seafood add-on lock rules.
    if (r.proteinFamily === 'seafood_add_on') {
      if (state.seafoodAddOnTotal >= 3) score -= 100;
      if (dayState.tags.seafood) score -= 100;
      if (tags.indexOf('prawns') !== -1 && state.prawns >= 2) score -= 80;
      if (tags.indexOf('calamari') !== -1 && state.calamari >= 1) score -= 30;
      if ((tags.indexOf('mussels') !== -1 || tags.indexOf('clams') !== -1) && state.musselsClams >= 1) score -= 100;
      if (tags.indexOf('rareSeafood') !== -1) score -= 6;
    }

    // Vegetarian protein-family caps and anti-legume stacking.
    if (input.dietType === 'vegetarian') {
      var v = state.vegetarian;
      if (r.proteinFamily === 'eggs' && v.eggs >= 4) score -= 100;
      if (r.proteinFamily === 'dairy' && v.dairy >= 4) score -= 100;
      if (r.proteinFamily === 'soy' && v.soy >= 3) score -= 100;
      if (r.proteinFamily === 'legume') {
        if (v.legumes >= 4) score -= 100;
        if (dayState.tags.legumes) score -= 100;
        if (tags.indexOf('lentils') !== -1 && v.lentils >= 3) score -= 100;
        if ((tags.indexOf('beans') !== -1 || tags.indexOf('chickpeas') !== -1) && v.beansChickpeas >= 3) score -= 100;
      }
      if (r.proteinFamily === 'vegetarian_convenience' && v.convenience >= 2) score -= 100;
      if (tags.indexOf('halloumi') !== -1 && v.halloumi >= 1) score -= 100;
    }

    // Avoid too many shake/dairy moments in a single day.
    if (tags.indexOf('shake') !== -1 && dayState.shakeCount >= 1) score -= 100;
    if (tags.indexOf('dairy') !== -1 && dayState.tags.dairyCount >= 2) score -= 8;

    // Avoid starch in every meal.
    if (tags.indexOf('starch') !== -1 && dayState.starchMeals >= 1) score -= 3;

    return score;
  }

  function addMealToState(recipeObj, state, dayState, mealType) {
    if (!recipeObj) return;
    var tags = recipeObj.tags || [];
    state.proteinFamilyCounts[recipeObj.proteinFamily] = (state.proteinFamilyCounts[recipeObj.proteinFamily] || 0) + 1;
    state.proteinCounts[recipeObj.protein] = (state.proteinCounts[recipeObj.protein] || 0) + 1;
    dayState.proteinFamilies[recipeObj.proteinFamily] = true;

    tags.forEach(function (tag) {
      state.tagCounts[tag] = (state.tagCounts[tag] || 0) + 1;
      dayState.tags[tag] = true;
    });

    if (mealType === 'dinner') {
      state.dinnerProteinFamilies.push(recipeObj.proteinFamily);
      state.dinnerTemplates.push(recipeObj.template);
    }

    if (recipeObj.proteinFamily === 'pork') {
      state.porkTotal += 1;
      if (mealType === 'dinner') state.porkDinners += 1;
    }

    if (recipeObj.proteinFamily === 'seafood_add_on') {
      state.seafoodAddOnTotal += 1;
      dayState.tags.seafood = true;
      if (tags.indexOf('prawns') !== -1) state.prawns += 1;
      if (tags.indexOf('calamari') !== -1) state.calamari += 1;
      if (tags.indexOf('mussels') !== -1 || tags.indexOf('clams') !== -1) state.musselsClams += 1;
    }

    if (tags.indexOf('starch') !== -1 || recipeObj.components.some(function (c) { return c.role === 'starch'; })) {
      dayState.starchMeals += 1;
    }

    if (tags.indexOf('shake') !== -1) dayState.shakeCount += 1;
    if (tags.indexOf('dairy') !== -1) dayState.tags.dairyCount = (dayState.tags.dairyCount || 0) + 1;
    if (tags.indexOf('legumes') !== -1) dayState.tags.legumes = true;

    if (['eggs', 'dairy', 'soy', 'legume', 'vegetarian_convenience'].indexOf(recipeObj.proteinFamily) !== -1 || tags.indexOf('vegetarian') !== -1) {
      var v = state.vegetarian;
      if (recipeObj.proteinFamily === 'eggs') v.eggs += 1;
      if (recipeObj.proteinFamily === 'dairy') v.dairy += 1;
      if (recipeObj.proteinFamily === 'soy') v.soy += 1;
      if (recipeObj.proteinFamily === 'legume') v.legumes += 1;
      if (tags.indexOf('lentils') !== -1) v.lentils += 1;
      if (tags.indexOf('beans') !== -1 || tags.indexOf('chickpeas') !== -1) v.beansChickpeas += 1;
      if (recipeObj.proteinFamily === 'vegetarian_convenience') v.convenience += 1;
      if (tags.indexOf('halloumi') !== -1) v.halloumi += 1;
    }
  }

  function finalizeMeal(recipeObj, mealType, input) {
    if (!recipeObj) {
      return fallbackMeal(mealType, input);
    }
    var components = recipeObj.components.map(function (c) { return finalizeComponent(c, input); });
    var meal = {
      id: recipeObj.id,
      title: recipeObj.title,
      description: recipeObj.description,
      mealType: mealType,
      template: recipeObj.template,
      proteinFamily: recipeObj.proteinFamily,
      protein: recipeObj.protein,
      tags: recipeObj.tags || [],
      supportTags: deriveSupportTags(recipeObj, input),
      components: components,
      swapGroup: recipeObj.template || mealType,
      nutrition: null,
      nutritionNote: 'Estimated for the suggested serving.'
    };
    meal.nutrition = calculateMealNutrition(meal, input);
    return meal;
  }

  function fallbackMeal(mealType, input) {
    var recipeObj = RECIPES.find(function (r) {
      return r.mealTypes.indexOf(mealType) !== -1 && isRecipeAllowed(r, input);
    }) || RECIPES[0];
    return finalizeMeal(recipeObj, mealType, input);
  }

  function finalizeComponent(c, input) {
    var profile = PORTION_PROFILES[input.portionProfile] || PORTION_PROFILES.standard_low_activity_glp1;
    var amount = c.baseAmount;
    var roleScale = profile[c.role] || 1;

    if (c.eggProfile) amount = profile.eggs;
    else if (c.unit === 'item') amount = c.baseAmount;
    else amount = c.baseAmount * roleScale;

    if (c.optional && c.role === 'starch' && input.portionProfile === 'low_appetite_glp1') {
      amount = Math.max(0, amount * 0.75);
    }

    return {
      food: c.food,
      role: c.role,
      amount: roundAmount(amount, c.unit || 'g'),
      unit: c.unit || 'g',
      optional: !!c.optional
    };
  }

  function roundAmount(amount, unit) {
    if (unit === 'item') return Math.round(amount);
    if (amount < 30) return Math.round(amount / 5) * 5;
    return Math.round(amount / 10) * 10;
  }

  function deriveSupportTags(recipeObj, input) {
    var tags = [];
    var support = input.supportMode || {};
    Object.keys(support).forEach(function (key) {
      if (support[key] > 0) tags.push(key);
    });
    return tags;
  }

  function calculateMealNutrition(meal, input) {
    if (!meal || !meal.components) return emptyNutrition();
    var totals = emptyNutrition();
    meal.components.forEach(function (component) {
      var data = NUTRITION_TABLE[component.food];
      if (!data) return;
      var multiplier;
      if (data.unit === 'item' || component.unit === 'item') {
        multiplier = component.amount / data.per;
      } else {
        multiplier = component.amount / data.per;
      }
      totals.calories += data.calories * multiplier;
      totals.protein += data.protein * multiplier;
      totals.carbs += data.carbs * multiplier;
      totals.fibre += data.fibre * multiplier;
    });
    return roundNutrition(totals);
  }

  function calculateDayNutrition(day, input) {
    var totals = emptyNutrition();
    if (!day || !day.meals) return totals;
    ['breakfast', 'lunch', 'dinner'].forEach(function (type) {
      addNutrition(totals, day.meals[type] && day.meals[type].nutrition ? day.meals[type].nutrition : calculateMealNutrition(day.meals[type], input));
    });
    (day.meals.snacks || []).forEach(function (snack) {
      addNutrition(totals, snack.nutrition || calculateMealNutrition(snack, input));
    });
    return roundNutrition(totals);
  }

  function calculatePlanNutrition(plan, input) {
    var totals = emptyNutrition();
    var daily = [];
    (plan.days || []).forEach(function (day) {
      var dayNutrition = calculateDayNutrition(day, input);
      daily.push(dayNutrition);
      addNutrition(totals, dayNutrition);
    });
    var divisor = Math.max(1, daily.length);
    return {
      daily: daily,
      weeklyTotal: roundNutrition(totals),
      dailyAverage: roundNutrition({
        calories: totals.calories / divisor,
        protein: totals.protein / divisor,
        carbs: totals.carbs / divisor,
        fibre: totals.fibre / divisor
      }),
      note: 'All values are estimates for suggested servings.'
    };
  }

  function emptyNutrition() {
    return { calories: 0, protein: 0, carbs: 0, fibre: 0, confidence: 'estimated' };
  }

  function addNutrition(target, source) {
    if (!source) return;
    target.calories += source.calories || 0;
    target.protein += source.protein || 0;
    target.carbs += source.carbs || 0;
    target.fibre += source.fibre || 0;
  }

  function roundNutrition(nutrition) {
    return {
      calories: Math.round((nutrition.calories || 0) / 10) * 10,
      protein: Math.round(nutrition.protein || 0),
      carbs: Math.round(nutrition.carbs || 0),
      fibre: Math.round(nutrition.fibre || 0),
      confidence: 'estimated'
    };
  }

  function buildShoppingList(plan, input) {
    var groups = {
      proteins: {},
      vegetables: {},
      fruit: {},
      starches: {},
      dairy: {},
      snacks: {},
      saucesExtras: {},
      pantry: {}
    };

    function add(group, food, amount, unit) {
      if (!groups[group][food]) groups[group][food] = { food: food, amount: 0, unit: unit || 'g' };
      if (groups[group][food].unit === unit) groups[group][food].amount += amount;
      else groups[group][food].amount += amount;
    }

    (plan.days || []).forEach(function (day) {
      var meals = [day.meals.breakfast, day.meals.lunch, day.meals.dinner].concat(day.meals.snacks || []);
      meals.forEach(function (meal) {
        if (!meal || !meal.components) return;
        meal.components.forEach(function (c) {
          var group = groupForComponent(c);
          add(group, friendlyFoodName(c.food, input.country), c.amount, c.unit);
        });
      });
    });

    return Object.keys(groups).reduce(function (acc, key) {
      acc[key] = Object.keys(groups[key]).map(function (food) {
        var item = groups[key][food];
        return {
          food: item.food,
          amount: item.unit === 'item' ? Math.round(item.amount) : Math.round(item.amount / 10) * 10,
          unit: item.unit
        };
      });
      return acc;
    }, {});
  }

  function groupForComponent(c) {
    if (c.role === 'protein') return 'proteins';
    if (c.role === 'vegetables') return 'vegetables';
    if (c.role === 'fruit') return 'fruit';
    if (c.role === 'starch') return 'starches';
    if (c.role === 'dairy') return 'dairy';
    if (c.role === 'sauce' || c.role === 'fat') return 'saucesExtras';
    return 'pantry';
  }

  function friendlyFoodName(food, country) {
    var names = {
      chicken_breast_cooked: 'chicken breast',
      shredded_chicken_cooked: 'chicken breast',
      lean_beef_mince_cooked: 'lean beef mince',
      lean_beef_strips_cooked: 'lean beef strips',
      lamb_lean_cooked: 'lean lamb',
      venison_cooked: country === 'ZA' ? 'ostrich/kudu/venison if available' : 'lean game meat if available',
      lean_pork_loin_cooked: 'lean pork fillet/loin strips',
      white_fish_cooked: country === 'ZA' ? 'hake or white fish' : 'white fish',
      hake_cooked: country === 'ZA' ? 'hake' : 'white fish',
      salmon_cooked: 'salmon',
      tuna_canned_drained: 'tuna',
      sardines_canned: country === 'ZA' ? 'pilchards/sardines' : 'sardines',
      prawns_cooked: country === 'US' ? 'shrimp' : 'prawns',
      calamari_cooked: 'calamari',
      mussels_cooked: 'mussels',
      clams_cooked: 'clams',
      tofu_firm: 'firm tofu',
      tempeh: 'tempeh',
      edamame: 'edamame',
      lentils_cooked: 'lentils',
      chickpeas_cooked: 'chickpeas',
      beans_cooked: 'beans',
      meat_free_mince: 'meat-free mince',
      veggie_patty: 'veggie patties',
      eggs: 'eggs',
      greek_yoghurt: country === 'US' ? 'Greek yogurt' : 'Greek yoghurt',
      cottage_cheese: 'cottage cheese',
      halloumi: 'halloumi',
      milk_low_fat: 'low-fat milk',
      protein_powder: 'protein powder',
      oats_raw: 'oats',
      cooked_rice: 'rice',
      cooked_potato: 'potatoes',
      sweet_potato_cooked: 'sweet potatoes',
      cooked_pasta: 'pasta',
      cooked_noodles: 'noodles',
      wrap: 'wraps',
      bread_slice: 'bread',
      crackers: 'crackers',
      cauliflower_rice: 'cauliflower rice',
      mixed_vegetables: 'mixed vegetables',
      stir_fry_vegetables: 'stir-fry vegetables',
      salad_vegetables: 'salad vegetables',
      cooked_green_vegetables: 'green vegetables',
      roast_vegetables: 'roast vegetables',
      soup_vegetables: 'soup vegetables',
      tomato_base: 'tomato base',
      peppers: 'peppers',
      spinach: 'spinach',
      cucumber: 'cucumber',
      tomato: 'tomatoes',
      carrot: 'carrots',
      mushrooms: 'mushrooms',
      baby_marrow: country === 'US' ? 'zucchini' : 'baby marrow/courgette',
      peas: 'peas',
      lettuce_cups: 'lettuce',
      berries: 'berries',
      banana: 'bananas',
      apple: 'apples',
      fruit_choice: 'fruit of your choice',
      chia_seeds: 'chia seeds',
      nuts: 'nuts',
      avocado: 'avocado',
      olive_oil: 'olive oil',
      light_dressing: 'light dressing',
      light_sauce: 'light sauce',
      curry_sauce_light: 'mild curry sauce ingredients',
      soy_ginger_sauce: 'soy/ginger/garlic sauce ingredients',
      tomato_sauce_light: 'light tomato sauce ingredients',
      yoghurt_sauce: country === 'US' ? 'yogurt sauce ingredients' : 'yoghurt sauce ingredients',
      stock_broth: 'stock/broth'
    };
    return names[food] || food.replace(/_/g, ' ');
  }

  function validatePlan(plan, rawInput) {
    var input = normalizeInput(rawInput || plan.inputSummary || {});
    var warnings = [];
    var counters = {
      porkTotal: 0,
      porkDinners: 0,
      seafoodAddOn: 0,
      prawns: 0,
      calamari: 0,
      musselsClams: 0,
      shakesByDay: []
    };

    (plan.days || []).forEach(function (day, dayIndex) {
      var meals = [];
      if (day.meals.breakfast) meals.push(day.meals.breakfast);
      if (day.meals.lunch) meals.push(day.meals.lunch);
      if (day.meals.dinner) meals.push(day.meals.dinner);
      (day.meals.snacks || []).forEach(function (s) { meals.push(s); });

      var dayLegumes = 0;
      var daySeafood = 0;
      var dayShake = 0;
      var dayDairy = 0;
      var dayFamilies = {};

      meals.forEach(function (meal) {
        if (!meal) return;
        var tags = meal.tags || [];
        if (!meal.protein || meal.protein === 'none') {
          if (meal.mealType !== 'snack') warnings.push('Day ' + (dayIndex + 1) + ' ' + meal.mealType + ' has no clear protein anchor: ' + meal.title);
        }
        if (meal.mealType !== 'snack' && tags.indexOf('eggs') !== -1 && meal.title.indexOf('2–3') === -1 && meal.description.indexOf('2–3') === -1) {
          warnings.push('Egg meal should specify 2–3 eggs: ' + meal.title);
        }
        if (input.exclusions.pork && tags.indexOf('pork') !== -1) warnings.push('Pork appears despite pork exclusion: ' + meal.title);
        if ((input.exclusions.shellfish || input.exclusions.seafood) && tags.indexOf('shellfish') !== -1) warnings.push('Shellfish appears despite shellfish exclusion: ' + meal.title);
        if ((input.exclusions.fish || input.exclusions.seafood) && tags.indexOf('fish') !== -1) warnings.push('Fish appears despite fish exclusion: ' + meal.title);
        if (input.exclusions.dairy && tags.indexOf('dairy') !== -1) warnings.push('Dairy appears despite dairy exclusion: ' + meal.title);
        if (input.exclusions.eggs && tags.indexOf('eggs') !== -1) warnings.push('Eggs appear despite egg exclusion: ' + meal.title);
        if (input.dietType === 'vegetarian' && (tags.indexOf('chicken') !== -1 || tags.indexOf('beef') !== -1 || tags.indexOf('pork') !== -1 || tags.indexOf('fish') !== -1 || tags.indexOf('shellfish') !== -1)) {
          warnings.push('Non-vegetarian meal appears in vegetarian plan: ' + meal.title);
        }

        if (tags.indexOf('pork') !== -1) {
          counters.porkTotal += 1;
          if (meal.mealType === 'dinner') counters.porkDinners += 1;
        }
        if (meal.proteinFamily === 'seafood_add_on') {
          counters.seafoodAddOn += 1;
          daySeafood += 1;
          if (tags.indexOf('prawns') !== -1) counters.prawns += 1;
          if (tags.indexOf('calamari') !== -1) counters.calamari += 1;
          if (tags.indexOf('mussels') !== -1 || tags.indexOf('clams') !== -1) counters.musselsClams += 1;
        }
        if (tags.indexOf('legumes') !== -1) dayLegumes += 1;
        if (tags.indexOf('shake') !== -1) dayShake += 1;
        if (tags.indexOf('dairy') !== -1) dayDairy += 1;

        if (dayFamilies[meal.proteinFamily] && input.dietType === 'vegetarian' && meal.proteinFamily === 'legume') {
          warnings.push('Possible vegetarian legume stacking on day ' + (dayIndex + 1));
        }
        dayFamilies[meal.proteinFamily] = true;

        if (!meal.nutrition || typeof meal.nutrition.protein === 'undefined') warnings.push('Missing nutrition estimate: ' + meal.title);
      });

      if (input.dietType === 'vegetarian' && dayLegumes > 1) warnings.push('Legumes appear more than once on vegetarian day ' + (dayIndex + 1));
      if (daySeafood > 1) warnings.push('Seafood add-on appears more than once on day ' + (dayIndex + 1));
      if (dayShake > 1) warnings.push('More than one shake on day ' + (dayIndex + 1));
      if (dayDairy > 3) warnings.push('Possible dairy overload on day ' + (dayIndex + 1));
      counters.shakesByDay.push(dayShake);
    });

    if (counters.porkTotal > 3) warnings.push('Pork appears more than 3 times in the week.');
    if (counters.porkDinners > 2) warnings.push('Pork dinners exceed 2 per week.');
    if (counters.seafoodAddOn > 3) warnings.push('Seafood add-on meals exceed 3 per week.');
    if (counters.prawns > 2) warnings.push('Prawns/shrimp exceed 2 appearances.');
    if (counters.calamari > 1) warnings.push('Calamari exceeds 1 appearance.');
    if (counters.musselsClams > 1) warnings.push('Mussels/clams exceed 1 combined appearance.');

    return {
      passed: warnings.length === 0,
      warnings: warnings,
      counters: counters
    };
  }

  function swapMeal(plan, dayIndex, mealType, rawInput) {
    var input = normalizeInput(rawInput || plan.inputSummary || {});
    var day = plan.days[dayIndex];
    if (!day) return plan;

    var current = mealType === 'snack' ? (day.meals.snacks || [])[0] : day.meals[mealType];
    var template = mealType === 'dinner' ? day.dinnerSlot : null;
    var rng = seededRandom((input.seed || createSeed(input)) + '|swap|' + dayIndex + '|' + mealType + '|' + Date.now());
    var fakeState = createState();
    var fakeDayState = { proteinFamilies: {}, tags: {}, starchMeals: 0, shakeCount: 0 };

    var candidates = RECIPES.filter(function (r) {
      if (r.mealTypes.indexOf(mealType === 'snack' ? 'snack' : mealType) === -1) return false;
      if (template && r.template !== template) return false;
      if (current && r.id === current.id) return false;
      return isRecipeAllowed(r, input);
    });

    if (!candidates.length) return plan;

    var replacement = candidates.sort(function (a, b) {
      return (scoreRecipe(b, { mealType: mealType, template: template, input: input, state: fakeState, dayState: fakeDayState, rng: rng }) + rng()) -
        (scoreRecipe(a, { mealType: mealType, template: template, input: input, state: fakeState, dayState: fakeDayState, rng: rng }) + rng());
    })[0];

    var cloned = JSON.parse(JSON.stringify(plan));
    if (mealType === 'snack') cloned.days[dayIndex].meals.snacks = [finalizeMeal(replacement, 'snack', input)];
    else cloned.days[dayIndex].meals[mealType] = finalizeMeal(replacement, mealType, input);

    cloned.shoppingList = buildShoppingList(cloned, input);
    cloned.validation = validatePlan(cloned, input);
    cloned.nutrition = calculatePlanNutrition(cloned, input);
    return cloned;
  }

  function seededRandom(seed) {
    var h = 1779033703 ^ String(seed).length;
    for (var i = 0; i < String(seed).length; i++) {
      h = Math.imul(h ^ String(seed).charCodeAt(i), 3432918353);
      h = h << 13 | h >>> 19;
    }
    return function () {
      h = Math.imul(h ^ h >>> 16, 2246822507);
      h = Math.imul(h ^ h >>> 13, 3266489909);
      h ^= h >>> 16;
      return (h >>> 0) / 4294967296;
    };
  }

  return {
    version: VERSION,
    generatePlan: generatePlan,
    swapMeal: swapMeal,
    validatePlan: validatePlan,
    buildShoppingList: buildShoppingList,
    calculateMealNutrition: calculateMealNutrition,
    calculateDayNutrition: calculateDayNutrition,
    calculatePlanNutrition: calculatePlanNutrition,
    _internal: {
      recipes: RECIPES,
      nutritionTable: NUTRITION_TABLE,
      portionProfiles: PORTION_PROFILES,
      dinnerRhythm: DINNER_RHYTHM,
      normalizeInput: normalizeInput
    }
  };
});
