/*!
 * Hearty Lead-Magnet Meal Engine — Clean Replacement Core
 * Version: 4.1.0-leadmagnet-band-rotation
 *
 * This replaces the old v3.9.x lead-magnet engine completely.
 * It keeps the public API/shape expected by the current free-meal-plan wrapper:
 *   window.HeartyMealEngine.generatePlan(input)
 *   output.days[].breakfast / morningSnack / lunch / afternoonSnack / dinner
 *
 * Build principles:
 * - selected proteins only; no tofu/fish/pork/beans etc unless selected/mapped in input
 * - realistic meal descriptions; no ingredient dumping
 * - egg breakfasts use 2–3 eggs and max 1–2 vegetables
 * - two snack slots per day
 * - daily protein repair toward the guide
 * - estimated nutrition is included for future wrappers, but the current page displays protein only
 */
(function(root, factory){
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HeartyMealEngine = factory();
})(typeof self !== 'undefined' ? self : this, function(){
  'use strict';

  var VERSION = '4.1.0-leadmagnet-band-rotation';
  var ENGINE_SOURCE = 'clean-engine-protein-band-breakfast-starch-protein-rotation';

  var REGION = {
    US: { yoghurt:'yogurt', stock:'broth', fish:'white fish', mince:'lean ground beef', dried:'beef jerky', marrow:'zucchini', fruit:'mandarin' },
    SA: { yoghurt:'yoghurt', stock:'stock', fish:'hake', mince:'lean beef mince', dried:'biltong', marrow:'baby marrow', fruit:'naartjie' },
    UK: { yoghurt:'yoghurt', stock:'stock', fish:'cod', mince:'lean beef mince', dried:'lean cooked meat strips', marrow:'courgette', fruit:'clementine' },
    AU: { yoghurt:'yoghurt', stock:'stock', fish:'white fish', mince:'lean beef mince', dried:'lean beef jerky', marrow:'zucchini', fruit:'mandarin' },
    CA: { yoghurt:'yogurt', stock:'broth', fish:'white fish', mince:'lean ground beef', dried:'beef jerky', marrow:'zucchini', fruit:'clementine' }
  };

  var STARCH_LABEL = {
    rice:'½ cup cooked rice',
    potato:'½ cup cooked potato',
    sweet_potato:'½ medium sweet potato',
    pasta:'½ cup cooked pasta',
    noodles:'½ cup cooked noodles',
    wrap:'1 small wrap',
    bread:'1 slice toast',
    crackers:'4–5 wholegrain crackers'
  };

  var PROTEIN_FAMILIES = ['chicken','turkey','beef','pork','fish','eggs','dairy','protein_powder','tofu','lentils','beans','chickpeas'];
  var MAIN_FAMILIES = ['chicken','turkey','beef','pork','fish','eggs','tofu','lentils','beans','chickpeas'];
  var ANIMAL_FAMILIES = ['chicken','turkey','beef','pork'];
  var FISH_FAMILIES = ['fish'];
  var LEGUME_FAMILIES = ['lentils','beans','chickpeas'];

  function unique(arr){
    var out = [];
    (arr || []).forEach(function(x){
      if (x == null) return;
      x = String(x).trim();
      if (x && out.indexOf(x) === -1) out.push(x);
    });
    return out;
  }

  function cap(s){ s = String(s || ''); return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

  function regionKey(v){ return REGION[v] ? v : 'US'; }

  function normalizeVegetableName(v, region){
    v = String(v || '').trim().replace(/_/g,' ').toLowerCase();
    if (v === 'zucchini' || v === 'courgette' || v === 'baby marrow') return REGION[region].marrow;
    if (v === 'green beans') return 'green beans';
    if (v === 'bell peppers') return 'peppers';
    return v;
  }

  function normalizeInput(raw){
    raw = raw || {};
    var region = regionKey(raw.region || raw.country || 'US');
    var proteins = unique(raw.proteins || raw.selectedProteins || []);
    var vegetables = unique((raw.vegetables || []).map(function(v){ return normalizeVegetableName(v, region); }));
    if (!vegetables.length) vegetables = ['spinach','tomato','carrot','lettuce','cucumber','broccoli'];
    ['spinach','tomato','carrot','lettuce','cucumber'].forEach(function(v){ if (vegetables.length < 5 && vegetables.indexOf(v) === -1) vegetables.push(v); });
    var starches = unique(raw.starches || raw.selectedStarches || []);
    if (!starches.length && !raw.lowerStarch && !raw.lowStarch) starches = ['rice','potato'];
    var targets = raw.targets || {};

    return {
      region: region,
      diet: raw.diet || raw.dietType || 'omnivore',
      proteins: proteins,
      breakfastItems: unique(raw.breakfastItems || []),
      snackProteins: unique(raw.snackProteins || raw.snacks || []),
      starches: starches,
      vegetables: vegetables,
      lowerStarch: !!(raw.lowerStarch || raw.lowStarch),
      leftoverLunches: !!(raw.leftoverLunches || raw.useLeftovers),
      planTier: Number(raw.planTier || raw.tier || 2),
      targets: {
        proteinMin: Number(targets.proteinMin || (Number(raw.planTier || 2) >= 3 ? 105 : 90)),
        proteinMax: Number(targets.proteinMax || (Number(raw.planTier || 2) >= 3 ? 145 : 125)),
        fibreMin: Number(targets.fibreMin || (Number(raw.planTier || 2) >= 3 ? 25 : 20)),
        fibreMax: Number(targets.fibreMax || (Number(raw.planTier || 2) >= 3 ? 35 : 30)),
        calorieFloor: Number(targets.calorieFloor || (Number(raw.planTier || 2) >= 3 ? 1350 : 1150))
      }
    };
  }

  function allowedProteins(input){
    var set = {};
    input.proteins.forEach(function(p){ if (PROTEIN_FAMILIES.indexOf(p) !== -1) set[p] = true; });

    if (input.diet === 'vegetarian') {
      ANIMAL_FAMILIES.concat(FISH_FAMILIES).forEach(function(p){ delete set[p]; });
    }
    if (input.diet === 'pescatarian') {
      ANIMAL_FAMILIES.forEach(function(p){ delete set[p]; });
    }

    return Object.keys(set).sort();
  }

  function has(allowed, key){ return allowed.indexOf(key) !== -1; }
  function hasAny(allowed, list){ return list.some(function(x){ return has(allowed, x); }); }

  function proteinMid(value){
    var nums = String(value || '').match(/\d+/g) || [];
    if (!nums.length) return 0;
    nums = nums.map(Number);
    return nums.reduce(function(a,b){ return a+b; },0) / nums.length;
  }

  function estimateFromProtein(proteinText, kind){
    var p = Math.round(proteinMid(proteinText));
    var base = { protein:p, fibre:3, carbs:15, calories:Math.round(p * 8 + 130) };
    if (kind === 'breakfast') { base.carbs = 18; base.fibre = 4; base.calories = Math.round(p * 9 + 150); }
    if (kind === 'snack') { base.carbs = 10; base.fibre = 2; base.calories = Math.round(p * 8 + 80); }
    if (kind === 'lunch') { base.carbs = 18; base.fibre = 6; base.calories = Math.round(p * 8 + 190); }
    if (kind === 'dinner') { base.carbs = 30; base.fibre = 7; base.calories = Math.round(p * 8 + 260); }
    return { protein:base.protein, carbs:base.carbs, fibre:base.fibre, calories:base.calories, confidence:'estimated' };
  }

  function meal(name, protein, detail, type, tags){
    return {
      name: name,
      title: name,
      protein: protein,
      detail: detail,
      description: detail,
      type: type || 'other',
      proteinFamily: type || 'other',
      tags: tags || [],
      nutrition: estimateFromProtein(protein, tags && tags[0] || 'meal'),
      nutritionNote: 'Estimated for the suggested serving.'
    };
  }

  function pickFrom(arr, index){
    if (!arr || !arr.length) return '';
    return arr[Math.abs(index || 0) % arr.length];
  }

  function vegPool(input, context){
    var v = input.vegetables || [];
    var r = REGION[input.region];
    var contextSets = {
      breakfast:['spinach','tomato','mushrooms','peppers','onion',r.marrow],
      salad:['lettuce','tomato','cucumber','carrot','peppers','spinach'],
      soup:['carrot','spinach','tomato','onion','broccoli','cauliflower','green beans',r.marrow,'mushrooms'],
      cooked:['carrot','broccoli','cauliflower','green beans',r.marrow,'mushrooms','spinach','peppers','cabbage'],
      stirfry:['peppers','carrot','broccoli','green beans',r.marrow,'mushrooms','cabbage','spinach'],
      curry:['spinach','carrot','peppers','mushrooms',r.marrow,'green beans','cauliflower'],
      side:['broccoli','green beans','carrot','cauliflower','spinach',r.marrow,'mushrooms']
    };
    var allowed = contextSets[context] || contextSets.cooked;
    var out = v.filter(function(x){ return allowed.indexOf(x) !== -1; });
    return out.length ? out : allowed;
  }

  function vegList(input, context, start, count){
    var source = vegPool(input, context);
    var out = [];
    var i;
    // Meal realism cap: breakfast stays simple, lunch/dinner never dump long veg lists.
    count = Math.max(1, Math.min(count || 2, context === 'breakfast' ? 2 : context === 'salad' ? 2 : 3));
    for (i=0; out.length < count && i < source.length * 2; i++) {
      var item = source[(start + i) % source.length];
      if (out.indexOf(item) === -1) out.push(item);
    }
    return out.join(', ');
  }



  function saladExtras(input, start, count){
    var source = vegPool(input, 'salad').filter(function(v){ return ['lettuce','tomato'].indexOf(v) === -1; });
    if (!source.length) source = ['cucumber','carrot','peppers','spinach'];
    var out = [];
    count = Math.max(1, Math.min(count || 1, 2));
    for (var i=0; out.length < count && i < source.length * 2; i++) {
      var item = source[(start + i) % source.length];
      if (out.indexOf(item) === -1) out.push(item);
    }
    return out.join(', ');
  }

  function selectedStarch(input, day, preferred){
    if (input.lowerStarch) return '';
    var starches = (input.starches || []).filter(function(s){ return STARCH_LABEL[s]; });
    if (!starches.length) return '';
    if (preferred && starches.indexOf(preferred) !== -1) return preferred;
    return starches[day % starches.length];
  }

  function starchPhrase(input, day, preferred){
    var s = selectedStarch(input, day, preferred);
    return s ? STARCH_LABEL[s] : '';
  }

  function withStarch(base, input, day, preferred){
    var s = starchPhrase(input, day, preferred);
    return s ? base + ' Serve with ' + s + '.' : base + ' No added starch.';
  }

  function gateCheck(raw){
    var input = normalizeInput(raw);
    var allowed = allowedProteins(input);
    var main = allowed.filter(function(p){ return MAIN_FAMILIES.indexOf(p) !== -1; });
    var failures = [];
    var messages = [];
    if (!allowed.length) { failures.push('no_proteins'); messages.push('Please choose at least a few protein options.'); }
    if (!main.length && !hasAny(allowed, ['dairy','protein_powder'])) { failures.push('no_main_proteins'); messages.push('Please choose at least one main-meal protein.'); }
    return {
      status: failures.length ? 'BLOCKED' : 'ALLOWED',
      allowed: allowed,
      mainMealProteins: main,
      failures: failures,
      messages: messages
    };
  }

  function breakfastOptions(input, allowed){
    var r = REGION[input.region];
    var out = [];
    var b = input.breakfastItems || [];
    function selected(keys){ return keys.some(function(k){ return b.indexOf(k) !== -1; }); }

    if (has(allowed,'eggs') && (!b.length || selected(['eggs']))) {
      out.push(function(day){ return meal('Vegetable scrambled eggs','20–26g','2–3 eggs scrambled with ' + vegList(input,'breakfast',day,2) + '.', 'eggs', ['breakfast']); });
      out.push(function(day){ return meal('Vegetable omelette','20–26g','2–3 eggs cooked with ' + vegList(input,'breakfast',day+1,2) + '.', 'eggs', ['breakfast']); });
    }
    if (has(allowed,'dairy') && (!b.length || selected(['greek_yoghurt','greek_yogurt','yoghurt','yogurt']))) {
      out.push(function(){ return meal('High-protein ' + r.yoghurt + ' bowl','18–24g','1 cup Greek-style ' + r.yoghurt + ' with berries or fruit and cinnamon.', 'dairy', ['breakfast']); });
    }
    if (has(allowed,'dairy') && selected(['cottage_cheese'])) {
      out.push(function(){ return meal('Cottage cheese breakfast plate','18–24g','Cottage cheese with tomato, herbs and wholegrain crackers or fruit.', 'dairy', ['breakfast']); });
    }
    if (has(allowed,'protein_powder') && selected(['protein_shake'])) {
      out.push(function(){ return meal('Protein shake breakfast','20–25g','Protein shake prepared with water or milk, plus fruit if desired.', 'protein_powder', ['breakfast']); });
    }
    if (has(allowed,'tofu') && selected(['tofu_scramble'])) {
      out.push(function(day){ return meal('Tofu scramble','20–28g','Tofu-style protein cooked with ' + vegList(input,'breakfast',day+2,2) + ' and mild spices.', 'tofu', ['breakfast']); });
    }

    if (!out.length) {
      if (has(allowed,'eggs')) out.push(function(day){ return meal('Vegetable omelette','20–26g','2–3 eggs cooked with ' + vegList(input,'breakfast',day,2) + '.', 'eggs', ['breakfast']); });
      else if (has(allowed,'dairy')) out.push(function(){ return meal('High-protein ' + r.yoghurt + ' bowl','18–24g','1 cup Greek-style ' + r.yoghurt + ' with berries or fruit and cinnamon.', 'dairy', ['breakfast']); });
      else if (has(allowed,'tofu')) out.push(function(day){ return meal('Tofu scramble','20–28g','Tofu-style protein cooked with ' + vegList(input,'breakfast',day,2) + '.', 'tofu', ['breakfast']); });
      else if (has(allowed,'protein_powder')) out.push(function(){ return meal('Protein shake breakfast','20–25g','Protein shake prepared with water or milk.', 'protein_powder', ['breakfast']); });
    }
    return out;
  }

  function lunchOptions(input, allowed){
    var r = REGION[input.region];
    var out = [];
    if (has(allowed,'chicken')) {
      out.push(function(day){ return meal('Chicken salad plate','30–38g','120–150g cooked chicken with lettuce, tomato and ' + saladExtras(input,day,1) + '. No added starch.', 'chicken', ['lunch']); });
      out.push(function(day){ return meal('Chicken vegetable soup bowl','30–38g','120–150g cooked chicken simmered with ' + vegList(input,'soup',day,3) + ' and ' + r.stock + '. No added starch.', 'chicken', ['lunch']); });
    }
    if (has(allowed,'turkey')) {
      out.push(function(day){ return meal('Turkey salad plate','28–36g','120–150g cooked turkey with lettuce, tomato and ' + saladExtras(input,day,1) + '. No added starch.', 'turkey', ['lunch']); });
    }
    if (has(allowed,'fish')) {
      out.push(function(day){ return meal('Tuna salad bowl','24–32g','Tuna with lettuce, tomato, lemon, herbs and ' + saladExtras(input,day,1) + '. No added starch.', 'fish', ['lunch']); });
      out.push(function(day){ return meal(cap(r.fish) + ' vegetable plate','28–36g','A portion of ' + r.fish + ' with lemon herbs and ' + vegList(input,'side',day,3) + '. No added starch.', 'fish', ['lunch']); });
    }
    if (has(allowed,'beef')) {
      out.push(function(day){ return meal(cap(r.mince) + ' vegetable bowl','30–38g','120–150g ' + r.mince + ' cooked with tomato, herbs and ' + vegList(input,'cooked',day,3) + '. No added starch.', 'beef', ['lunch']); });
    }
    if (has(allowed,'pork')) {
      out.push(function(day){ return meal('Lean pork vegetable bowl','28–36g','A portion of lean pork fillet/loin strips with tomato herbs and ' + vegList(input,'cooked',day,3) + '. No added starch.', 'pork', ['lunch']); });
    }
    if (has(allowed,'eggs')) {
      out.push(function(day){ return meal('Boiled egg vegetable plate','18–26g','2–3 boiled eggs with lettuce, tomato and ' + saladExtras(input,day,1) + '. No added starch.', 'eggs', ['lunch']); });
      out.push(function(day){ return meal('Egg salad bowl','18–26g','2–3 boiled eggs with tomato, herbs and ' + saladExtras(input,day+1,1) + '. No added starch.', 'eggs', ['lunch']); });
    }
    if (has(allowed,'dairy')) {
      out.push(function(day){ return meal('Cottage cheese protein plate','18–25g','Cottage cheese with tomato, lettuce, herbs and ' + saladExtras(input,day,1) + '. No added starch.', 'dairy', ['lunch']); });
    }
    if (has(allowed,'tofu')) {
      out.push(function(day){ return meal('Tofu vegetable bowl','24–34g','Tofu-style protein with lettuce, tomato, lemon-herb dressing and ' + saladExtras(input,day,1) + '. No added starch.', 'tofu', ['lunch']); });
    }
    if (has(allowed,'lentils')) {
      out.push(function(day){ return meal('Lentil vegetable soup bowl','20–30g','Lentils simmered with ' + vegList(input,'soup',day,3) + ' and ' + r.stock + '. No added starch. Lentils stay in the meal because they are the protein source.', 'lentils', ['lunch','legume']); });
    }
    if (has(allowed,'beans')) {
      out.push(function(day){ return meal('Bean chilli vegetable bowl','20–30g','Beans cooked with tomato, mild spices and ' + vegList(input,'cooked',day,3) + '. No added starch. Beans stay in the meal because they are the protein source.', 'beans', ['lunch','legume']); });
    }
    if (has(allowed,'chickpeas')) {
      out.push(function(day){ return meal('Chickpea vegetable bowl','20–30g','Chickpeas with tomato, lettuce, herbs and ' + saladExtras(input,day,1) + '. No added starch. Chickpeas stay in the meal because they are the protein source.', 'chickpeas', ['lunch','legume']); });
    }
    return out;
  }

  function dinnerOptionSets(input, allowed){
    var r = REGION[input.region];
    function chickenSoup(day){ return meal('Chicken vegetable soup','32–40g','120–150g chicken simmered with ' + vegList(input,'soup',day,3) + ' and ' + r.stock + '.', 'chicken', ['dinner']); }
    function chickenCurry(day){ return meal('Chicken curry with rice','32–40g',withStarch('120–150g chicken cooked with onion, garlic, ginger, tomato, mild curry spices and ' + vegList(input,'curry',day,3) + '.', input, day, 'rice'), 'chicken', ['dinner']); }
    function chickenStir(day){ return meal('Chicken stir-fry with rice','32–40g',withStarch('120–150g chicken strips stir-fried with ' + vegList(input,'stirfry',day,3) + ' and garlic-ginger sauce.', input, day, 'rice'), 'chicken', ['dinner']); }
    function chickenPlate(day){ return meal('Grilled chicken plate','32–40g',withStarch('120–150g grilled chicken with ' + vegList(input,'side',day,3) + '.', input, day, 'sweet_potato'), 'chicken', ['dinner']); }
    function roastChicken(day){ return meal('Roast-style chicken plate','34–42g',withStarch('A portion of roast-style chicken with green vegetables and carrots.', input, day, 'potato'), 'chicken', ['dinner']); }

    function fishPlate(day){ return meal('Grilled ' + r.fish + ' plate','30–38g',withStarch('A portion of ' + r.fish + ' with lemon, herbs and ' + vegList(input,'side',day,3) + '.', input, day, 'rice'), 'fish', ['dinner']); }
    function fishSoup(day){ return meal(cap(r.fish) + ' vegetable soup','28–36g','A portion of ' + r.fish + ' simmered gently with ' + vegList(input,'soup',day,3) + ' and ' + r.stock + '.', 'fish', ['dinner']); }

    function beefStew(day){ return meal('Lean beef stew with rice','32–40g',withStarch('120–150g lean beef cooked with tomato, herbs and ' + vegList(input,'soup',day,3) + '.', input, day, 'rice'), 'beef', ['dinner']); }
    function beefBolognese(day){ return meal(cap(r.mince) + ' bolognese with pasta','32–40g',withStarch('120–150g ' + r.mince + ' cooked with onion, garlic, chopped tomato, grated carrot, mushrooms and Italian herbs.', input, day, 'pasta'), 'beef', ['dinner']); }
    function beefBurgerBowl(day){ return meal('Lean beef burger bowl','32–40g','120–150g lean beef mince served burger-bowl style with lettuce, tomato, cucumber and a light dressing. No added starch.', 'beef', ['dinner']); }

    function porkStir(day){ return meal('Lean pork stir-fry with sweet-and-sour sauce and rice','30–38g',withStarch('120–150g lean pork fillet/loin strips stir-fried with ' + vegList(input,'stirfry',day,3) + '. Sauce: garlic, ginger, vinegar/lemon, tomato paste, water and a small amount of sweetener.', input, day, 'rice'), 'pork', ['dinner']); }
    function porkStew(day){ return meal('Tomato pork stew with rice','30–38g',withStarch('A portion of lean pork fillet/loin strips simmered in tomato, herbs and ' + vegList(input,'soup',day,3) + '.', input, day, 'rice'), 'pork', ['dinner']); }

    function eggFrittata(day){ return meal('2–3 egg vegetable frittata','22–30g',withStarch('2–3 eggs baked with ' + vegList(input,'breakfast',day,2) + ' and herbs.', input, day, 'sweet_potato'), 'eggs', ['dinner']); }
    function omeletteLight(day){ return meal('2–3 egg omelette and salad','20–28g','2–3 eggs cooked with ' + vegList(input,'breakfast',day,2) + ' and served with a small salad. No added starch.', 'eggs', ['dinner']); }

    function tofuStir(day){ return meal('Tofu-style stir-fry with rice','26–36g',withStarch('Tofu-style protein stir-fried with ' + vegList(input,'stirfry',day,3) + ' and garlic-ginger sauce.', input, day, 'rice'), 'tofu', ['dinner']); }
    function tofuBake(day){ return meal('Tofu tomato bake with rice','26–36g',withStarch('Tofu-style protein baked or simmered in tomato, onion, garlic, herbs and ' + vegList(input,'cooked',day,3) + '.', input, day, 'rice'), 'tofu', ['dinner']); }
    function tofuCurry(day){ return meal('Tofu curry with rice','26–36g',withStarch('Tofu-style protein cooked with tomato, mild curry spices and ' + vegList(input,'curry',day,3) + '.', input, day, 'rice'), 'tofu', ['dinner']); }

    function lentilSoup(day){ return meal('Lentil vegetable soup','20–30g','Lentils simmered with ' + vegList(input,'soup',day,3) + ' and ' + r.stock + '. Lentils stay in the meal because they are the protein source.', 'lentils', ['dinner','legume']); }
    function lentilStew(day){ return meal('Lentil and vegetable stew with sweet potato','20–30g',withStarch('Lentils simmered with tomato, herbs and ' + vegList(input,'soup',day,3) + '.', input, day, 'sweet_potato') + ' Lentils stay in the meal because they are the protein source.', 'lentils', ['dinner','legume']); }
    function beanChilli(day){ return meal('Bean and vegetable chilli with rice','20–30g',withStarch('Beans cooked with tomato, mild spices, herbs and ' + vegList(input,'cooked',day,3) + '.', input, day, 'rice') + ' Beans stay in the meal because they are the protein source.', 'beans', ['dinner','legume']); }
    function chickpeaStew(day){ return meal('Chickpea and vegetable stew with rice','20–30g',withStarch('Chickpeas simmered with onion, garlic, tomato, herbs and ' + vegList(input,'cooked',day,3) + '.', input, day, 'rice') + ' Chickpeas stay in the meal because they are the protein source.', 'chickpeas', ['dinner','legume']); }

    var sets = [[],[],[],[],[],[],[]];
    if (has(allowed,'chicken')) { sets[0].push(chickenSoup); sets[1].push(chickenCurry); sets[2].push(chickenStir); sets[3].push(chickenPlate); sets[4].push(chickenStir); sets[5].push(chickenSoup); sets[6].push(roastChicken); }
    if (has(allowed,'fish')) { sets[0].push(fishSoup); sets[2].push(fishPlate); sets[3].push(fishPlate); sets[4].push(fishPlate); sets[5].push(fishSoup); sets[6].push(fishPlate); }
    if (has(allowed,'beef')) { sets[1].push(beefStew); sets[3].push(beefStew); sets[4].push(beefBolognese, beefBurgerBowl); sets[6].push(beefStew); }
    if (has(allowed,'pork')) { sets[1].push(porkStew); sets[2].push(porkStir); sets[3].push(porkStir); sets[6].push(porkStir); }
    if (has(allowed,'eggs')) { sets[3].push(eggFrittata); sets[5].push(omeletteLight); sets[6].push(eggFrittata); }
    if (has(allowed,'tofu')) { sets[1].push(tofuCurry); sets[2].push(tofuStir); sets[3].push(tofuBake); sets[4].push(tofuStir); sets[5].push(tofuBake); sets[6].push(tofuBake); }
    if (has(allowed,'lentils')) { sets[0].push(lentilSoup); sets[1].push(lentilStew); sets[5].push(lentilSoup); sets[6].push(lentilStew); }
    if (has(allowed,'beans')) { sets[1].push(beanChilli); sets[4].push(beanChilli); sets[6].push(beanChilli); }
    if (has(allowed,'chickpeas')) { sets[1].push(chickpeaStew); sets[4].push(chickpeaStew); sets[6].push(chickpeaStew); }

    return sets;
  }

  function snackOptions(input, allowed){
    var r = REGION[input.region];
    var selected = input.snackProteins || [];
    function wants(keys){ return !selected.length || keys.some(function(k){ return selected.indexOf(k) !== -1; }); }
    var out = [];
    if (has(allowed,'dairy') && wants(['yoghurt','greek_yoghurt','greek_yogurt'])) out.push(function(){ return meal('Plain ' + r.yoghurt + ' with berries','12–18g','¾–1 cup plain ' + r.yoghurt + ' with berries or fruit.', 'dairy', ['snack']); });
    if (has(allowed,'dairy') && wants(['cottage_cheese','wholegrain_crackers'])) out.push(function(){ return meal('Wholegrain crackers with cottage cheese','10–16g','4–5 wholegrain crackers with a small amount of cottage cheese.', 'dairy', ['snack']); });
    if (has(allowed,'eggs') && wants(['boiled_eggs'])) out.push(function(){ return meal('Boiled egg snack','7–14g','1–2 boiled eggs with tomato or carrot sticks.', 'eggs', ['snack']); });
    if (has(allowed,'chicken') && wants(['chicken_strips'])) out.push(function(){ return meal('Cooked chicken strips','12–18g','Small portion cooked chicken strips with lemon and cucumber or carrot sticks.', 'chicken', ['snack']); });
    if (has(allowed,'fish') && wants(['tuna'])) out.push(function(){ return meal('Tuna bites','12–18g','Small portion tuna with cherry tomatoes, lemon and herbs.', 'fish', ['snack']); });
    if (has(allowed,'beef') && wants(['biltong','jerky','dried_meat'])) out.push(function(){ return meal(cap(r.dried) + ' snack','12–18g','25–30g ' + r.dried + ' with pepper or carrot sticks.', 'beef', ['snack']); });
    if (has(allowed,'tofu') && wants(['tofu_bites','tofu'])) out.push(function(){ return meal('Tofu protein bites','12–18g','Small portion tofu-style protein with tomato, lemon and herbs.', 'tofu', ['snack']); });
    if (has(allowed,'protein_powder') && wants(['protein_shake'])) out.push(function(){ return meal('Protein shake','20–25g','Use if protein is difficult to reach from meals.', 'protein_powder', ['snack']); });
    if (hasAny(allowed, LEGUME_FAMILIES) && wants(['hummus'])) out.push(function(){ return meal('Hummus with vegetable sticks','5–8g','2–3 tablespoons hummus with carrot or cucumber sticks.', 'legumes', ['snack']); });

    // Light snacks are allowed only as second snacks or when protein is already on track.
    out.push(function(day){ return meal(cap(r.fruit) + ' or berries','0–2g','1 small ' + r.fruit + ' or a small handful of berries.', 'fruit', ['snack','light']); });
    out.push(function(){ return meal('Apple slices','0–2g','1 small apple sliced slowly if appetite is low.', 'fruit', ['snack','light']); });
    return out;
  }

  function pickNonRepeating(options, day, avoidTypes, counts){
    if (!options.length) return null;
    avoidTypes = avoidTypes || [];
    counts = counts || {};
    var best = null, bestScore = 999999;
    options.forEach(function(fn, idx){
      var m = fn(day);
      var type = m.type || 'other';
      var score = idx + (counts[type] || 0) * 10;
      if (avoidTypes.indexOf(type) !== -1) score += 90;
      if (m.tags && m.tags.indexOf('light') !== -1) score += 25;
      if (score < bestScore) { best = m; bestScore = score; }
    });
    if (best) counts[best.type] = (counts[best.type] || 0) + 1;
    return best;
  }

  function buildBreakfasts(input, allowed){
    var opts = breakfastOptions(input, allowed);
    var counts = {};
    var out = [];
    for (var day=0; day<7; day++) out.push(pickNonRepeating(opts, day, day ? [out[day-1].type] : [], counts));
    return out;
  }

  function buildLunches(input, allowed, breakfasts){
    var opts = lunchOptions(input, allowed);
    var counts = {};
    var out = [];
    for (var day=0; day<7; day++) {
      var avoid = [breakfasts[day] && breakfasts[day].type];
      if (day && out[day-1]) avoid.push(out[day-1].type);
      out.push(pickNonRepeating(opts, day, avoid, counts));
    }
    return out;
  }

  function buildDinners(input, allowed, lunches){
    var sets = dinnerOptionSets(input, allowed);
    var counts = {};
    var out = [];
    for (var day=0; day<7; day++) {
      var opts = sets[day] && sets[day].length ? sets[day] : sets.reduce(function(a,b){ return a.concat(b); }, []);
      var avoid = [lunches[day] && lunches[day].type];
      if (day && out[day-1]) avoid.push(out[day-1].type);
      if (day > 1 && out[day-2]) avoid.push(out[day-2].type);

      // Vegetarian anti-legume stacking: if lunch is a legume, avoid legume dinner where alternatives exist.
      if (lunches[day] && LEGUME_FAMILIES.indexOf(lunches[day].type) !== -1) avoid = avoid.concat(LEGUME_FAMILIES);

      out.push(pickNonRepeating(opts, day, avoid, counts));
    }
    return out;
  }

  function buildSnacks(input, allowed, breakfasts, lunches, dinners){
    var opts = snackOptions(input, allowed);
    var out = [];
    var counts = {};
    var shakeWeek = 0;
    for (var day=0; day<7; day++) {
      var fixedTypes = [breakfasts[day] && breakfasts[day].type, lunches[day] && lunches[day].type, dinners[day] && dinners[day].type].filter(Boolean);
      var snack1 = chooseSnack(opts, day, fixedTypes, counts, false, shakeWeek);
      if (snack1 && snack1.type === 'protein_powder') shakeWeek++;
      var totalBefore = proteinMid(breakfasts[day] && breakfasts[day].protein) + proteinMid(snack1 && snack1.protein) + proteinMid(lunches[day] && lunches[day].protein) + proteinMid(dinners[day] && dinners[day].protein);
      var needProtein = totalBefore < (input.targets.proteinMin - 10);
      var snack2 = chooseSnack(opts, day+3, fixedTypes.concat([snack1 && snack1.type]), counts, !needProtein, shakeWeek);
      if (snack2 && snack2.type === 'protein_powder') shakeWeek++;
      out.push([snack1, snack2]);
    }
    return out;
  }

  function chooseSnack(opts, day, avoidTypes, counts, preferLight, shakeWeek){
    var best = null, bestScore = 999999;
    opts.forEach(function(fn, idx){
      var m = fn(day);
      var type = m.type || 'other';
      var isLight = m.tags && m.tags.indexOf('light') !== -1;
      var score = idx + (counts[type] || 0) * 12;
      if (avoidTypes.indexOf(type) !== -1) score += 420;
      if (preferLight && isLight) score -= 80;
      if (!preferLight && isLight) score += 80;
      if (type === 'protein_powder' && shakeWeek >= 2) score += 10000;
      if (type === 'dairy' && avoidTypes.indexOf('dairy') !== -1) score += 120;
      if (score < bestScore) { best = m; bestScore = score; }
    });
    if (best) counts[best.type] = (counts[best.type] || 0) + 1;
    return best;
  }

  function dayProtein(day){
    return proteinMid(day.breakfast && day.breakfast.protein) + proteinMid(day.morningSnack && day.morningSnack.protein) + proteinMid(day.lunch && day.lunch.protein) + proteinMid(day.afternoonSnack && day.afternoonSnack.protein) + proteinMid(day.dinner && day.dinner.protein);
  }

  function proteinBoostMeal(m){
    if (!m) return;
    if (m.type === 'eggs') m.protein = '24–30g';
    else if (m.type === 'dairy') m.protein = '22–28g';
    else if (m.type === 'tofu') m.protein = '28–36g';
    else if (LEGUME_FAMILIES.indexOf(m.type) !== -1) m.protein = '24–32g';
    else if (['chicken','turkey','beef','pork','fish'].indexOf(m.type) !== -1) m.protein = '34–42g';
    m.nutrition = estimateFromProtein(m.protein, (m.tags && m.tags[0]) || 'meal');
  }

  function bestProteinSnack(allowed, avoidTypes){
    avoidTypes = avoidTypes || [];
    var order = [];
    if (has(allowed,'dairy')) order.push(function(){ return meal('Wholegrain crackers with cottage cheese','12–18g','4–5 wholegrain crackers with cottage cheese.', 'dairy', ['snack']); });
    if (has(allowed,'eggs')) order.push(function(){ return meal('Boiled egg snack','12–18g','2 boiled eggs with tomato or carrot sticks.', 'eggs', ['snack']); });
    if (has(allowed,'chicken')) order.push(function(){ return meal('Cooked chicken strips','14–20g','Small portion cooked chicken strips with lemon and cucumber or carrot sticks.', 'chicken', ['snack']); });
    if (has(allowed,'fish')) order.push(function(){ return meal('Tuna bites','14–20g','Small portion tuna with cherry tomatoes, lemon and herbs.', 'fish', ['snack']); });
    if (has(allowed,'beef')) order.push(function(){ return meal(cap(REGION.US.dried).replace('Beef jerky', 'Beef jerky') + ' snack','14–20g','25–30g biltong or beef jerky with pepper or carrot sticks.', 'beef', ['snack']); });
    if (has(allowed,'tofu')) order.push(function(){ return meal('Tofu protein bites','14–20g','Small portion tofu-style protein with tomato, lemon and herbs.', 'tofu', ['snack']); });
    if (has(allowed,'protein_powder')) order.push(function(){ return meal('Protein shake','20–25g','Use if protein is difficult to reach from meals.', 'protein_powder', ['snack']); });
    var fallbackNonShake = null;
    var fallbackAny = null;
    for (var i=0;i<order.length;i++) {
      var candidate = order[i]();
      if (!fallbackAny) fallbackAny = candidate;
      if (candidate.type !== 'protein_powder' && !fallbackNonShake) fallbackNonShake = candidate;
      if (candidate.type !== 'protein_powder' && avoidTypes.indexOf(candidate.type) === -1) return candidate;
    }
    // If all useful snacks clash with the day, repeat a normal food before using another shake.
    return fallbackNonShake || fallbackAny || null;
  }

  function lightFruitSnack(input){
    var r = REGION[input.region];
    return meal(cap(r.fruit) + ' or berries','0–2g','1 small ' + r.fruit + ' or a small handful of berries.', 'fruit', ['snack','light']);
  }

  function fixSameDaySnackClash(day, input, allowed){
    if (!day.morningSnack || !day.afternoonSnack) return day;
    if (day.morningSnack.name !== day.afternoonSnack.name && day.morningSnack.type !== day.afternoonSnack.type) return day;
    var avoid = [day.breakfast && day.breakfast.type, day.morningSnack && day.morningSnack.type, day.lunch && day.lunch.type, day.dinner && day.dinner.type].filter(Boolean);
    var replacement = bestProteinSnack(allowed, avoid);
    if (replacement && replacement.type !== day.morningSnack.type && replacement.name !== day.morningSnack.name) {
      day.afternoonSnack = replacement;
    } else if (dayProtein(day) >= (input.targets.proteinMin || 90)) {
      day.afternoonSnack = lightFruitSnack(input);
    }
    return day;
  }

  function repairProtein(day, input, allowed){
    var min = input.targets.proteinMin || 90;
    var max = input.targets.proteinMax || 125;

    // Low protein repair: preserve main meals, upgrade weak pieces first.
    if (dayProtein(day) < min) {
      proteinBoostMeal(day.breakfast);
    }
    if (dayProtein(day) < min && day.afternoonSnack && proteinMid(day.afternoonSnack.protein) < 12) {
      day.afternoonSnack = bestProteinSnack(allowed, [day.breakfast && day.breakfast.type, day.morningSnack && day.morningSnack.type, day.lunch && day.lunch.type, day.dinner && day.dinner.type].filter(Boolean)) || day.afternoonSnack;
    }
    if (dayProtein(day) < min && day.morningSnack && proteinMid(day.morningSnack.protein) < 12) {
      day.morningSnack = bestProteinSnack(allowed, [day.breakfast && day.breakfast.type, day.afternoonSnack && day.afternoonSnack.type, day.lunch && day.lunch.type, day.dinner && day.dinner.type].filter(Boolean)) || day.morningSnack;
    }
    if (dayProtein(day) < min) proteinBoostMeal(day.lunch);
    if (dayProtein(day) < min) proteinBoostMeal(day.dinner);
    if (dayProtein(day) < min && day.afternoonSnack && day.afternoonSnack.type === 'fruit') {
      day.afternoonSnack = bestProteinSnack(allowed, [day.breakfast && day.breakfast.type, day.morningSnack && day.morningSnack.type].filter(Boolean)) || day.afternoonSnack;
    }

    // High protein soft cap: if too high, replace one snack with fruit first.
    if (dayProtein(day) > max) {
      if (day.afternoonSnack && proteinMid(day.afternoonSnack.protein) >= 10) day.afternoonSnack = lightFruitSnack(input);
    }
    if (dayProtein(day) > max && day.morningSnack && proteinMid(day.morningSnack.protein) >= 14) {
      day.morningSnack = lightFruitSnack(input);
    }

    fixSameDaySnackClash(day, input, allowed);
    return day;
  }

  function inferDinnerStarch(mealObj){
    var t = ((mealObj && mealObj.name) || '') + ' ' + ((mealObj && mealObj.detail) || '');
    t = t.toLowerCase();
    if (/sweet potato/.test(t)) return 'sweet_potato';
    if (/\bpotato\b/.test(t)) return 'potato';
    if (/\bpasta\b/.test(t)) return 'pasta';
    if (/\bnoodles\b/.test(t)) return 'noodles';
    if (/\bwrap\b/.test(t)) return 'wrap';
    if (/\brice\b/.test(t)) return 'rice';
    return '';
  }

  function starchNameForTitle(key){
    return key === 'sweet_potato' ? 'sweet potato' : key === 'wrap' ? 'small wrap' : key;
  }

  function starchServePhrase(key){
    return STARCH_LABEL[key] || '';
  }

  function replaceDinnerStarch(mealObj, next){
    if (!mealObj || !next) return mealObj;
    var titleStarch = starchNameForTitle(next);
    var phrase = starchServePhrase(next);
    var name = mealObj.name || '';
    var detail = mealObj.detail || '';
    name = name.replace(/with (rice|potato|sweet potato|pasta|noodles|small wrap|wrap)/i, 'with ' + titleStarch);
    name = name.replace(/and (rice|potato|sweet potato|pasta|noodles|small wrap|wrap)$/i, 'and ' + titleStarch);
    detail = detail.replace(/Serve with (½ cup cooked rice|½ cup cooked potato|½ medium sweet potato|½ cup cooked pasta|½ cup cooked noodles|1 small wrap)\./i, 'Serve with ' + phrase + '.');
    mealObj.name = mealObj.title = name;
    mealObj.detail = mealObj.description = detail;
    mealObj.starch = next;
    return mealObj;
  }

  function chooseRotatedStarch(input, current, dayIndex, used){
    var available = (input.starches || []).filter(function(s){ return STARCH_LABEL[s]; });
    if (!available.length) return current || '';
    if (available.length === 1) return available[0];
    var caps = { pasta:1, noodles:1, wrap:2, rice:3, potato:3, sweet_potato:3 };
    var best = null, bestScore = 999999;
    available.forEach(function(s, idx){
      var score = idx * 0.05 + (used.counts[s] || 0) * 20;
      if (used.last1 === s) score += 200;
      if (used.last2 === s) score += 100;
      if ((used.counts[s] || 0) >= (caps[s] || 2)) score += 500;
      if (s === current) score -= 10;
      if ((s === 'pasta' || s === 'noodles') && (used.counts[s] || 0) > 0) score += 350;
      if (score < bestScore) { best = s; bestScore = score; }
    });
    return best || current || available[dayIndex % available.length];
  }

  function enforceStarchRotation(days, input){
    var used = { counts:{}, last1:'', last2:'' };
    days.forEach(function(dayObj, idx){
      var m = dayObj.dinner;
      var current = inferDinnerStarch(m);
      if (!current) return;
      var next = chooseRotatedStarch(input, current, idx, used);
      replaceDinnerStarch(m, next);
      used.counts[next] = (used.counts[next] || 0) + 1;
      used.last2 = used.last1;
      used.last1 = next;
    });
    return days;
  }

  function buildShoppingList(plan, input){
    var groups = { proteins:[], vegetables:[], fruit:[], starches:[], dairy:[], snacks:[], sauces_extras:[], pantry:[] };
    function add(g, x){ if (x && groups[g].indexOf(x) === -1) groups[g].push(x); }
    var allowed = plan.gate ? plan.gate.allowed : allowedProteins(input);
    if (has(allowed,'chicken')) add('proteins','chicken breast');
    if (has(allowed,'eggs')) add('proteins','eggs');
    if (has(allowed,'dairy')) { add('dairy','Greek-style ' + REGION[input.region].yoghurt); add('dairy','cottage cheese'); }
    if (has(allowed,'fish')) add('proteins', REGION[input.region].fish + ' or tuna');
    if (has(allowed,'beef')) add('proteins', REGION[input.region].mince);
    if (has(allowed,'pork')) add('proteins','lean pork fillet/loin strips');
    if (has(allowed,'tofu')) add('proteins','tofu-style protein');
    if (has(allowed,'lentils')) add('proteins','lentils');
    if (has(allowed,'beans')) add('proteins','beans');
    if (has(allowed,'chickpeas')) add('proteins','chickpeas');
    (input.vegetables || []).forEach(function(v){ add('vegetables', v); });
    (input.starches || []).forEach(function(s){ add('starches', STARCH_LABEL[s] ? STARCH_LABEL[s].replace(/^½ cup cooked /,'').replace(/^½ medium /,'') : s); });
    add('fruit','berries or fruit of your choice');
    add('sauces_extras','lemon'); add('sauces_extras','herbs'); add('sauces_extras','garlic'); add('sauces_extras','mild spices');
    return groups;
  }

  function validatePlan(plan, rawInput){
    var input = normalizeInput(rawInput || plan.input || {});
    var allowed = allowedProteins(input);
    var warnings = [];
    function warnIf(cond, msg){ if (cond) warnings.push(msg); }
    var mealTypes = [];
    (plan.days || []).forEach(function(day){ ['breakfast','morningSnack','lunch','afternoonSnack','dinner'].forEach(function(k){ if(day[k] && day[k].type) mealTypes.push(day[k].type); }); });

    if (!has(allowed,'tofu')) warnIf(mealTypes.indexOf('tofu') !== -1, 'tofu appeared without being selected');
    if (!has(allowed,'pork')) warnIf(mealTypes.indexOf('pork') !== -1, 'pork appeared without being selected');
    if (!has(allowed,'fish')) warnIf(mealTypes.indexOf('fish') !== -1, 'fish appeared without being selected');
    if (!has(allowed,'beans')) warnIf(mealTypes.indexOf('beans') !== -1, 'beans appeared without being selected');
    if (!has(allowed,'chickpeas')) warnIf(mealTypes.indexOf('chickpeas') !== -1, 'chickpeas appeared without being selected');
    if (!has(allowed,'lentils')) warnIf(mealTypes.indexOf('lentils') !== -1, 'lentils appeared without being selected');
    plan.days.forEach(function(day){
      var p = dayProtein(day);
      warnIf(p < input.targets.proteinMin, 'Day ' + day.day + ' protein is below the target band: approx ' + Math.round(p) + 'g');
      [day.breakfast, day.lunch, day.dinner].forEach(function(m){
        if (!m) return;
        warnIf(m.type === 'eggs' && !/2–3|2-3/.test(m.detail), 'Egg meal missing 2–3 egg wording: ' + m.name);
        warnIf(m.tags && m.tags.indexOf('breakfast') !== -1 && /scrambled|omelette|tofu scramble/i.test(m.name) && ((m.detail.match(/,/g) || []).length >= 2), 'Breakfast-style meal may have too many vegetables: ' + m.name);
      });
    });

    var starchSeen = {};
    var lastStarch = '';
    var beforeLastStarch = '';
    plan.days.forEach(function(day){
      var st = inferDinnerStarch(day.dinner);
      if (!st) return;
      warnIf(st === lastStarch, 'Dinner starch repeats on consecutive days: ' + st);
      warnIf(st === beforeLastStarch && (input.starches || []).length > 2, 'Dinner starch repeats within three days: ' + st);
      starchSeen[st] = (starchSeen[st] || 0) + 1;
      beforeLastStarch = lastStarch;
      lastStarch = st;
    });
    warnIf((starchSeen.pasta || 0) > 1, 'Pasta appears more than once in the week.');
    warnIf((starchSeen.noodles || 0) > 1, 'Noodles appear more than once in the week.');

    return { passed: warnings.length === 0, warnings: warnings };
  }

  function generatePlan(raw){
    var input = normalizeInput(raw);
    var gate = gateCheck(input);
    if (gate.status === 'BLOCKED') return { status:'BLOCKED', gate:gate, messages:gate.messages, days:[] };
    var allowed = gate.allowed;
    var breakfasts = buildBreakfasts(input, allowed);
    var lunches = buildLunches(input, allowed, breakfasts);
    var dinners = buildDinners(input, allowed, lunches);
    var snacks = buildSnacks(input, allowed, breakfasts, lunches, dinners);
    var days = [];
    for (var i=0; i<7; i++) {
      var d = {
        day: i + 1,
        dayNumber: i + 1,
        breakfast: breakfasts[i],
        morningSnack: snacks[i] && snacks[i][0],
        lunch: lunches[i],
        afternoonSnack: snacks[i] && snacks[i][1],
        dinner: dinners[i]
      };
      d = repairProtein(d, input, allowed);
      d.totalProtein = Math.round(dayProtein(d));
      d.nutrition = calculateDayNutrition(d, input);
      days.push(d);
    }
    enforceStarchRotation(days, input);
    days.forEach(function(dayObj){
      dayObj.totalProtein = Math.round(dayProtein(dayObj));
      dayObj.nutrition = calculateDayNutrition(dayObj, input);
    });
    var plan = {
      status:'ALLOWED',
      version:VERSION,
      source:ENGINE_SOURCE,
      gate:gate,
      inputSummary:{ region:input.region, diet:input.diet, targets:input.targets, selectedProteins:allowed },
      days:days,
      messages:[],
      shoppingList:null,
      validation:null
    };
    plan.shoppingList = buildShoppingList(plan, input);
    plan.validation = validatePlan(plan, input);
    return plan;
  }

  function calculateMealNutrition(mealObj){ return mealObj && mealObj.nutrition ? mealObj.nutrition : estimateFromProtein(mealObj && mealObj.protein, 'meal'); }
  function calculateDayNutrition(day){
    var meals = [day.breakfast, day.morningSnack, day.lunch, day.afternoonSnack, day.dinner].filter(Boolean);
    var out = { protein:0, carbs:0, fibre:0, calories:0, confidence:'estimated' };
    meals.forEach(function(m){ var n = calculateMealNutrition(m); out.protein += n.protein || proteinMid(m.protein); out.carbs += n.carbs || 0; out.fibre += n.fibre || 0; out.calories += n.calories || 0; });
    out.protein = Math.round(out.protein); out.carbs = Math.round(out.carbs); out.fibre = Math.round(out.fibre); out.calories = Math.round(out.calories);
    return out;
  }
  function calculatePlanNutrition(plan){
    var out = { protein:0, carbs:0, fibre:0, calories:0, confidence:'estimated' };
    (plan.days || []).forEach(function(d){ var n = calculateDayNutrition(d); out.protein += n.protein; out.carbs += n.carbs; out.fibre += n.fibre; out.calories += n.calories; });
    var days = Math.max(1, (plan.days || []).length);
    out.dailyAverage = { protein:Math.round(out.protein/days), carbs:Math.round(out.carbs/days), fibre:Math.round(out.fibre/days), calories:Math.round(out.calories/days), confidence:'estimated' };
    return out;
  }

  function swapMeal(plan){ return plan; }

  return {
    VERSION: VERSION,
    ENGINE_SOURCE: ENGINE_SOURCE,
    version: VERSION,
    source: ENGINE_SOURCE,
    generatePlan: generatePlan,
    gateCheck: gateCheck,
    validatePlan: validatePlan,
    buildShoppingList: buildShoppingList,
    calculateMealNutrition: calculateMealNutrition,
    calculateDayNutrition: calculateDayNutrition,
    calculatePlanNutrition: calculatePlanNutrition,
    swapMeal: swapMeal,
    _internal: { normalizeInput: normalizeInput, allowedProteins: allowedProteins, proteinMid: proteinMid }
  };
});
