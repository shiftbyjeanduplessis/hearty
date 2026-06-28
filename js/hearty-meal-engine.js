/*!
 * Hearty Meal Engine — Lead Magnet Alpha
 * Version: 4.2.0-selected-food-rotation-ledger
 *
 * Clean core principles:
 * - Eating style/diet is a hard filter only; it never expands the food pool.
 * - The engine generates from selected ingredients only.
 * - Fruit/snack details are preserved so the engine does not invent generic fruit.
 * - Rotation is enforced with an explicit ledger across dinners, breakfasts and snacks.
 */
(function(root, factory){
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HeartyMealEngine = factory();
})(typeof self !== 'undefined' ? self : this, function(){
  'use strict';

  var VERSION = '4.2.0-selected-food-rotation-ledger';
  var ENGINE_SOURCE = 'selected-food-only-rotation-ledger-v7-alpha';

  var DINNER_STARCHES = ['rice','potato','sweet_potato','pasta','noodles','wrap'];
  var CANONICAL_PROTEINS = ['eggs','chicken','beef','pork','fish','dairy','tofu','lentils','beans','chickpeas','protein_powder'];
  var CANONICAL_SNACKS = ['fruit','yoghurt','cottage_cheese','eggs','protein_powder','tuna','biltong','hummus','crackers','veg_sticks'];
  var BREAKFAST_PROTEINS = ['eggs','dairy','protein_powder','tofu'];
  var MAIN_PROTEINS = ['chicken','beef','pork','fish','eggs','tofu','lentils','beans','chickpeas','dairy'];

  var REGION = {
    US:{ yoghurt:'yogurt', fish:'white fish', mince:'lean ground beef', stock:'broth', marrow:'zucchini' },
    UK:{ yoghurt:'yoghurt', fish:'cod or haddock', mince:'lean beef mince', stock:'stock', marrow:'courgette' },
    ZA:{ yoghurt:'yoghurt', fish:'hake', mince:'lean beef mince', stock:'stock', marrow:'baby marrow' },
    SA:{ yoghurt:'yoghurt', fish:'hake', mince:'lean beef mince', stock:'stock', marrow:'baby marrow' },
    AU:{ yoghurt:'yoghurt', fish:'white fish', mince:'lean beef mince', stock:'stock', marrow:'zucchini' },
    CA:{ yoghurt:'yogurt', fish:'white fish', mince:'lean ground beef', stock:'broth', marrow:'zucchini' }
  };

  var FOOD_LABELS = {
    rice:'rice', potato:'potato', sweet_potato:'sweet potato', pasta:'pasta', noodles:'noodles', wrap:'wrap',
    spinach:'spinach', lettuce:'lettuce', tomato:'tomato', cucumber:'cucumber', carrot:'carrot', peppers:'peppers', mushrooms:'mushrooms', onion:'onion', broccoli:'broccoli', cauliflower:'cauliflower', green_beans:'green beans', cabbage:'cabbage', baby_marrow:'baby marrow', zucchini:'zucchini', courgette:'courgette', peas:'peas', butternut:'butternut', eggplant:'eggplant', celery:'celery', asparagus:'asparagus',
    berries:'berries', banana:'banana', apple:'apple', pear:'pear', orange_mandarin:'orange or mandarin', grapes:'grapes'
  };

  function unique(arr){
    var out = [];
    (arr || []).forEach(function(x){
      if (x == null) return;
      x = String(x).trim();
      if (x && out.indexOf(x) === -1) out.push(x);
    });
    return out;
  }
  function clampArray(arr, fallback){ arr = unique(arr); return arr.length ? arr : unique(fallback || []); }
  function regionKey(v){ v = String(v || 'US').toUpperCase(); return REGION[v] ? v : 'US'; }
  function rconf(input){ return REGION[input.region] || REGION.US; }
  function label(key){ return FOOD_LABELS[key] || String(key || '').replace(/_/g,' '); }
  function round(n){ return Math.round(Number(n || 0)); }
  function addUnique(arr, value){ if(value && arr.indexOf(value) === -1) arr.push(value); }

  function normalizeProteinKey(v){
    v = String(v || '').trim();
    var map = {
      greek_yoghurt:'dairy', greek_yogurt:'dairy', cottage_cheese:'dairy', yoghurt:'dairy', yogurt:'dairy',
      protein_shake:'protein_powder', tuna:'fish', white_fish:'fish', hake:'fish', cod:'fish', salmon:'fish',
      prawns:'fish', shrimp:'fish', calamari:'fish', mussels:'fish', clams:'fish', mussels_clams:'fish',
      meat_free_mince:'beans'
    };
    return map[v] || v;
  }

  function normalizeVegetable(v, region){
    v = String(v || '').trim();
    if(v === 'green beans') v = 'green_beans';
    if(v === 'baby marrow' || v === 'zucchini' || v === 'courgette') v = 'baby_marrow';
    return v;
  }

  function applyDietFilters(input){
    var diet = input.diet || 'omnivore';
    var proteins = unique(input.proteins).filter(function(p){ return CANONICAL_PROTEINS.indexOf(p) !== -1; });
    var seafood = unique(input.seafood || []);
    var snacks = unique(input.snacks || []).filter(function(s){ return CANONICAL_SNACKS.indexOf(s) !== -1; });

    function removeProtein(p){ proteins = proteins.filter(function(x){ return x !== p; }); }
    if(diet === 'no_pork') removeProtein('pork');
    if(diet === 'no_fish') { removeProtein('fish'); seafood = []; snacks = snacks.filter(function(s){ return s !== 'tuna'; }); }
    if(diet === 'pescatarian') {
      proteins = proteins.filter(function(p){ return ['fish','eggs','dairy','tofu','lentils','beans','chickpeas','protein_powder'].indexOf(p) !== -1; });
      snacks = snacks.filter(function(s){ return s !== 'biltong'; });
    }
    if(diet === 'vegetarian') {
      proteins = proteins.filter(function(p){ return ['eggs','dairy','tofu','lentils','beans','chickpeas','protein_powder'].indexOf(p) !== -1; });
      seafood = [];
      snacks = snacks.filter(function(s){ return s !== 'tuna' && s !== 'biltong'; });
    }
    input.proteins = proteins;
    input.seafood = seafood;
    input.snacks = snacks;
    return input;
  }

  function normalizeInput(raw){
    raw = raw || {};
    var region = regionKey(raw.region || raw.country || 'US');
    var targets = raw.targets || {};
    var input = {
      region: region,
      diet: raw.diet || 'omnivore',
      proteins: unique(raw.proteins || []).map(normalizeProteinKey),
      seafood: unique(raw.seafood || []),
      starches: unique(raw.starches || []).filter(function(s){ return DINNER_STARCHES.indexOf(s) !== -1; }),
      vegetables: unique(raw.vegetables || []).map(function(v){ return normalizeVegetable(v, region); }),
      snacks: unique(raw.snacks || []),
      fruit: unique(raw.fruit || raw.fruits || []),
      proteinDetails: unique(raw.proteinDetails || raw.selectedProteinFoods || raw.foodDetails || []),
      snackDetails: unique(raw.snackDetails || raw.selectedSnackFoods || []),
      supportMode: raw.supportMode || 'none',
      leftoverLunches: raw.leftoverLunches === true,
      targets: {
        proteinMin: Number(targets.proteinMin || 90),
        proteinMax: Number(targets.proteinMax || 125),
        fibreMin: Number(targets.fibreMin || 20),
        fibreMax: Number(targets.fibreMax || 30),
        calorieFloor: Number(targets.calorieFloor || 1150)
      }
    };
    input.proteins = unique(input.proteins).filter(function(p){ return CANONICAL_PROTEINS.indexOf(p) !== -1; });
    input.snacks = unique(input.snacks).filter(function(s){ return CANONICAL_SNACKS.indexOf(s) !== -1; });
    input.fruit = input.fruit.filter(function(f){ return ['berries','banana','apple','pear','orange_mandarin','grapes'].indexOf(f) !== -1; });
    input.vegetables = input.vegetables.filter(Boolean);
    return applyDietFilters(input);
  }

  function gateCheck(input){
    var messages = [];
    var breakfastOk = input.proteins.some(function(p){ return BREAKFAST_PROTEINS.indexOf(p) !== -1; });
    var snackCount = input.snacks.length + input.fruit.length;
    if(input.proteins.length < 3) messages.push('Choose at least 3 protein foods.');
    if(input.starches.length < 3) messages.push('Choose at least 3 carb/starch options.');
    if(input.starches.filter(function(s){ return DINNER_STARCHES.indexOf(s) !== -1; }).length < 2) messages.push('Choose at least 2 dinner starch options.');
    if(input.vegetables.length < 5) messages.push('Choose at least 5 vegetables.');
    if(snackCount < 3) messages.push('Choose at least 3 snack/fruit options.');
    if(!breakfastOk) messages.push('Include at least one breakfast-friendly protein: eggs, yoghurt/cottage cheese, protein shake or tofu.');
    return messages;
  }

  function blankCounters(){ return { dinnerProtein:{}, dinnerStarch:{}, breakfast:{}, snack:{}, fruit:{}, lunchProtein:{}, dayDairy:{}, shakeCount:0, repairs:[], warnings:[], usedFallback:false }; }
  function inc(obj,key){ if(!key) return; obj[key] = (obj[key] || 0) + 1; }
  function count(obj,key){ return obj[key] || 0; }

  function pickRotating(candidates, ledger, opts){
    opts = opts || {};
    candidates = unique(candidates).filter(Boolean);
    if(!candidates.length) return '';
    var avoid = opts.avoid || [];
    var caps = opts.caps || {};
    var filtered = candidates.filter(function(c){ return avoid.indexOf(c) === -1 && (!caps[c] || count(ledger,c) < caps[c]); });
    if(!filtered.length) filtered = candidates.filter(function(c){ return !caps[c] || count(ledger,c) < caps[c]; });
    if(!filtered.length) filtered = candidates.slice();
    filtered.sort(function(a,b){ return count(ledger,a) - count(ledger,b) || candidates.indexOf(a) - candidates.indexOf(b); });
    return filtered[0];
  }

  function vegPool(input, type, day, max){
    var pool = input.vegetables.slice();
    var breakfastAllowed = ['spinach','tomato','mushrooms','peppers','onion'];
    var saladAllowed = ['lettuce','tomato','cucumber','carrot','peppers','spinach'];
    var cookedAllowed = ['peppers','green_beans','broccoli','mushrooms','baby_marrow','cabbage','cauliflower','carrot','onion','spinach','tomato'];
    if(type === 'breakfast') pool = pool.filter(function(v){ return breakfastAllowed.indexOf(v) !== -1; });
    else if(type === 'salad') pool = pool.filter(function(v){ return saladAllowed.indexOf(v) !== -1; });
    else pool = pool.filter(function(v){ return cookedAllowed.indexOf(v) !== -1; });
    if(!pool.length) pool = input.vegetables.slice();
    var start = (day - 1) % Math.max(1,pool.length);
    var rotated = pool.slice(start).concat(pool.slice(0,start));
    return unique(rotated).slice(0, max || 3);
  }

  function vegText(keys){
    keys = unique(keys).filter(Boolean).map(label);
    if(!keys.length) return 'mixed vegetables';
    if(keys.length === 1) return keys[0];
    if(keys.length === 2) return keys[0] + ' and ' + keys[1];
    return keys.slice(0,-1).join(', ') + ' and ' + keys[keys.length - 1];
  }

  function ingredient(item, amount, group, extra){
    var out = { item:item, amount:amount, group:group || 'Pantry and flavour' };
    if(extra) Object.keys(extra).forEach(function(k){ out[k] = extra[k]; });
    return out;
  }

  function nutrition(protein, carbs, fibre, calories){ return { protein:round(protein), carbs:round(carbs), fibre:round(fibre), calories:round(calories), confidence:'estimated' }; }
  function meal(id, day, slot, title, proteinSource, starchSource, vegetables, ingredients, description, nut, tags){
    return { id:id, day:day, slot:slot, title:title, proteinSource:proteinSource || null, starchSource:starchSource || null, vegetables:unique(vegetables || []), ingredients:ingredients || [], description:description || '', nutrition:nut || nutrition(0,0,0,0), isLeftover:false, leftoverFromDay:null, tags:tags || [] };
  }

  function starchIngredient(starch){
    var map = {
      rice: ingredient('rice','½ cup cooked','Carbs and starches',{qtyCupsCooked:.5}),
      potato: ingredient('potato','½ cup cooked','Carbs and starches',{qtyCupsCooked:.5}),
      sweet_potato: ingredient('sweet potato','½ medium','Carbs and starches',{unitCount:.5}),
      pasta: ingredient('pasta','½ cup cooked','Carbs and starches',{qtyCupsCooked:.5}),
      noodles: ingredient('noodles','½ cup cooked','Carbs and starches',{qtyCupsCooked:.5}),
      wrap: ingredient('small wrap','1','Carbs and starches',{unitCount:1})
    };
    return map[starch] || null;
  }
  function starchText(starch){
    var map = { rice:'½ cup cooked rice', potato:'½ cup cooked potato', sweet_potato:'½ medium sweet potato', pasta:'½ cup cooked pasta', noodles:'½ cup cooked noodles', wrap:'1 small wrap' };
    return map[starch] || '';
  }

  function selectedFishName(input, preferTuna){
    var d = input.proteinDetails || [];
    if(preferTuna && d.indexOf('tuna') !== -1) return 'tuna';
    if(d.indexOf('white_fish') !== -1) return rconf(input).fish;
    if(d.indexOf('tuna') !== -1) return 'tuna';
    return rconf(input).fish;
  }
  function selectedDairyName(input, preferCottage){
    var d = input.proteinDetails.concat(input.snackDetails || []);
    if(preferCottage && d.indexOf('cottage_cheese') !== -1) return 'cottage cheese';
    if(d.indexOf('greek_yoghurt') !== -1 || d.indexOf('greek_yogurt') !== -1) return 'Greek-style ' + rconf(input).yoghurt;
    if(d.indexOf('cottage_cheese') !== -1) return 'cottage cheese';
    return 'Greek-style ' + rconf(input).yoghurt;
  }

  function makeBreakfast(input, day, ledger){
    var candidates = input.proteins.filter(function(p){ return BREAKFAST_PROTEINS.indexOf(p) !== -1; });
    var p = pickRotating(candidates, ledger.breakfast, { avoid:[ledger.lastBreakfast] });
    inc(ledger.breakfast, p); ledger.lastBreakfast = p;
    var veg = vegPool(input,'breakfast',day, p === 'eggs' ? 2 : 2);
    var fruit = pickFruit(input, ledger);
    var reg = rconf(input);
    if(p === 'eggs'){
      return meal('d'+day+'-breakfast',day,'breakfast','2–3 egg vegetable scramble','eggs',null,veg,[ingredient('eggs','3','Protein',{unitCount:3})].concat(veg.map(function(v){return ingredient(label(v),'small amount','Vegetables');})), '2–3 eggs scrambled with ' + vegText(veg) + '.', nutrition(24,6,2,250), ['breakfast']);
    }
    if(p === 'dairy'){
      var dairy = selectedDairyName(input, false);
      if(dairy === 'cottage cheese'){
        return meal('d'+day+'-breakfast',day,'breakfast','Cottage cheese fruit plate','dairy',null,[],[ingredient('cottage cheese','200g','Dairy',{qtyGrams:200}), ingredient(label(fruit),'1 serving','Fruit',{unitCount:1})], 'Cottage cheese with ' + label(fruit) + ' and cinnamon.', nutrition(24,24,4,270), ['breakfast']);
      }
      return meal('d'+day+'-breakfast',day,'breakfast','High-protein '+reg.yoghurt+' bowl','dairy',null,[],[ingredient(dairy,'1 cup / 200g','Dairy',{qtyGrams:200}), ingredient(label(fruit),'1 serving','Fruit',{unitCount:1})], '1 cup high-protein ' + reg.yoghurt + ' with ' + label(fruit) + ' and cinnamon.', nutrition(23,26,4,280), ['breakfast']);
    }
    if(p === 'protein_powder'){
      inc(ledger,'shakeCount');
      return meal('d'+day+'-breakfast',day,'breakfast','Protein shake breakfast','protein_powder',null,[],[ingredient('protein powder','1 scoop','Protein',{scoops:1}), ingredient(label(fruit),'1 serving','Fruit',{unitCount:1})], 'Protein shake blended with water or milk and ' + label(fruit) + '.', nutrition(25,22,3,240), ['breakfast','shake']);
    }
    return meal('d'+day+'-breakfast',day,'breakfast','Tofu scramble','tofu',null,veg,[ingredient('tofu','150g','Protein',{qtyGrams:150})].concat(veg.map(function(v){return ingredient(label(v),'small amount','Vegetables');})), 'Tofu scramble with ' + vegText(veg) + '.', nutrition(22,10,4,260), ['breakfast']);
  }

  function pickFruit(input, ledger){
    var fruits = input.fruit && input.fruit.length ? input.fruit : [];
    if(!fruits.length && input.snacks.indexOf('fruit') !== -1) fruits = ['apple'];
    if(!fruits.length) fruits = ['apple'];
    var f = pickRotating(fruits, ledger.fruit, { avoid:[ledger.lastFruit] });
    inc(ledger.fruit, f); ledger.lastFruit = f;
    return f;
  }

  function snackCandidates(input){
    var out = [];
    if(input.fruit.length || input.snacks.indexOf('fruit') !== -1) out.push('fruit');
    input.snacks.forEach(function(s){ addUnique(out, s); });
    return out;
  }

  function setSnackKey(m, key){ if(m) m.snackKey = key; return m; }

  function makeSnack(input, day, slot, ledger, preferProtein, avoidKeys){
    avoidKeys = avoidKeys || [];
    var candidates = snackCandidates(input).filter(function(s){ return avoidKeys.indexOf(s) === -1; });
    var proteinSnacks = candidates.filter(function(s){ return ['yoghurt','cottage_cheese','eggs','protein_powder','tuna','biltong'].indexOf(s) !== -1; });
    var lightSnacks = candidates.filter(function(s){ return proteinSnacks.indexOf(s) === -1; });
    var pool = preferProtein && proteinSnacks.length ? proteinSnacks : candidates;
    if(!pool.length) pool = ['fruit'];
    var key = pickRotating(pool, ledger.snack, { avoid:[ledger.lastSnack] });
    inc(ledger.snack, key); ledger.lastSnack = key;
    var id = 'd'+day+'-'+slot;
    var fruit = null, reg = rconf(input);
    if(key === 'fruit'){
      fruit = pickFruit(input, ledger);
      return setSnackKey(meal(id,day,slot,capFirst(label(fruit)),'fruit',null,[],[ingredient(label(fruit),'1 small serving','Fruit',{unitCount:1})], '1 small serving of ' + label(fruit) + '.', nutrition(1,16,3,70), ['snack','fruit']), key);
    }
    if(key === 'yoghurt'){
      fruit = pickFruit(input, ledger);
      return setSnackKey(meal(id,day,slot,'Greek '+reg.yoghurt+' with '+label(fruit),'dairy',null,[],[ingredient('Greek-style '+reg.yoghurt,'150g','Dairy',{qtyGrams:150}), ingredient(label(fruit),'small serving','Fruit',{unitCount:.5})], 'Greek-style ' + reg.yoghurt + ' with ' + label(fruit) + '.', nutrition(16,18,3,170), ['snack','dairy']), key);
    }
    if(key === 'cottage_cheese') return setSnackKey(meal(id,day,slot,'Cottage cheese snack','dairy',null,[],[ingredient('cottage cheese','100g','Dairy',{qtyGrams:100}), ingredient('wholegrain crackers','3–4','Carbs and starches',{unitCount:4})], 'Cottage cheese with a few wholegrain crackers.', nutrition(14,16,2,160), ['snack','dairy']), key);
    if(key === 'eggs') return setSnackKey(meal(id,day,slot,'Boiled egg snack','eggs',null,[],[ingredient('eggs','2','Protein',{unitCount:2})], '2 boiled eggs with salt, pepper or herbs.', nutrition(13,1,0,145), ['snack']), key);
    if(key === 'protein_powder') { inc(ledger,'shakeCount'); return setSnackKey(meal(id,day,slot,'Protein shake','protein_powder',null,[],[ingredient('protein powder','1 scoop','Protein',{scoops:1})], '1 scoop protein powder mixed with water or milk.', nutrition(23,5,1,130), ['snack','shake']), key); }
    if(key === 'tuna') return setSnackKey(meal(id,day,slot,'Tuna bites','fish',null,[],[ingredient('tuna','½ tin','Protein',{qtyGrams:70})], 'Small portion of tuna with lemon and herbs.', nutrition(17,0,0,90), ['snack']), key);
    if(key === 'biltong') return setSnackKey(meal(id,day,slot,'Biltong or lean jerky','beef',null,[],[ingredient('biltong / lean jerky','30g','Protein',{qtyGrams:30})], 'Small portion of biltong or lean jerky.', nutrition(15,2,0,100), ['snack']), key);
    if(key === 'hummus') return setSnackKey(meal(id,day,slot,'Hummus with veg sticks','chickpeas',null,['carrot','cucumber'],[ingredient('hummus','2 tbsp','Protein',{qtyGrams:40}), ingredient('veg sticks','1 cup','Vegetables')], 'Hummus with vegetable sticks.', nutrition(6,12,4,120), ['snack']), key);
    if(key === 'crackers') return setSnackKey(meal(id,day,slot,'Wholegrain crackers','crackers',null,[],[ingredient('wholegrain crackers','4–5','Carbs and starches',{unitCount:5})], 'A small serving of wholegrain crackers.', nutrition(4,18,2,110), ['snack']), key);
    return setSnackKey(meal(id,day,slot,'Veg sticks','veg_sticks',null,['carrot','cucumber'],[ingredient('veg sticks','1 cup','Vegetables')], 'Crunchy vegetable sticks.', nutrition(1,8,3,45), ['snack']), key);
  }

  function capFirst(s){ s = String(s || ''); return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

  function dinnerCandidates(input){
    var out = input.proteins.filter(function(p){ return MAIN_PROTEINS.indexOf(p) !== -1 && p !== 'protein_powder'; });
    if(input.seafood.length) addUnique(out,'seafood');
    return out;
  }

  function proteinCaps(input){
    return { chicken:4, pork:2, tofu: input.diet === 'vegetarian' ? 7 : 3, seafood:2 };
  }

  function chooseDinnerProtein(input, day, ledger){
    var candidates = dinnerCandidates(input);
    return pickRotating(candidates, ledger.dinnerProtein, { avoid:[ledger.lastDinnerProtein, ledger.prevDinnerProtein], caps: proteinCaps(input) });
  }
  function chooseDinnerStarch(input, day, ledger){
    var caps = { pasta:1, noodles:1, wrap:2, rice:3, potato:3, sweet_potato:3 };
    return pickRotating(input.starches, ledger.dinnerStarch, { avoid:[ledger.lastDinnerStarch, ledger.prevDinnerStarch], caps:caps });
  }

  function makeMainMeal(input, day, slot, protein, starch, ledger, rhythm){
    var isDinner = slot === 'dinner';
    var reg = rconf(input);
    var id = 'd'+day+'-'+slot;
    var vegType = rhythm === 'Soup' || rhythm === 'Curry / stew' ? 'cooked' : (rhythm === 'Grill / plate' || rhythm === 'Light dinner' ? 'salad' : 'cooked');
    var veg = vegPool(input, vegType, day + (slot === 'lunch' ? 2 : 0), rhythm === 'Soup' || rhythm === 'Curry / stew' ? 3 : 2);
    var starchIng = starch ? starchIngredient(starch) : null;
    var starchPhrase = starch ? ' Serve with ' + starchText(starch) + '.' : ' No added starch.';
    var baseIngredients = veg.map(function(v){ return ingredient(label(v),'½ cup','Vegetables'); });
    var title = '', desc = '', pgrams = isDinner ? 36 : 32, calories = isDinner ? 410 : 360, carbs = starch ? 36 : 14, fibre = starch ? 6 : 4;
    var ingredients = [];
    var proteinSource = protein;

    function finish(t, d, protItem, amount, group, extra){
      title = t; desc = d + starchPhrase;
      ingredients = [ingredient(protItem, amount, group || 'Protein', extra || {})].concat(starchIng ? [starchIng] : []).concat(baseIngredients);
    }

    if(protein === 'chicken') finish(chickenTitle(rhythm, starch), chickenDesc(rhythm, 'chicken', veg), 'chicken breast/strips', isDinner ? '150g' : '120g', 'Protein', {qtyGrams:isDinner?150:120});
    else if(protein === 'beef') finish(beefTitle(rhythm, starch), beefDesc(rhythm, reg.mince, veg), reg.mince, isDinner ? '150g' : '120g', 'Protein', {qtyGrams:isDinner?150:120});
    else if(protein === 'pork') finish(porkTitle(rhythm, starch), porkDesc(rhythm, veg), 'lean pork fillet/loin strips', isDinner ? '150g' : '120g', 'Protein', {qtyGrams:isDinner?150:120});
    else if(protein === 'fish'){
      var fish = selectedFishName(input, !isDinner);
      var grams = fish === 'tuna' ? (isDinner ? '1 tin' : '¾ tin') : (isDinner ? '150g' : '120g');
      finish(fishTitle(rhythm, fish, starch), fishDesc(rhythm, fish, veg, reg), fish, grams, 'Protein', {qtyGrams:isDinner?150:120});
      pgrams = fish === 'tuna' ? (isDinner ? 36 : 28) : (isDinner ? 34 : 30);
    }
    else if(protein === 'seafood'){
      var seafood = pickRotating(input.seafood.length ? input.seafood : ['prawns'], ledger.dinnerProtein, { avoid:[ledger.lastSeafood] });
      ledger.lastSeafood = seafood;
      var seafoodName = seafood === 'prawns' ? 'prawns' : seafood === 'calamari' ? 'calamari strips' : seafood;
      finish(seafoodTitle(rhythm, seafoodName, starch), seafoodDesc(rhythm, seafoodName, veg), seafoodName, isDinner ? '150g' : '120g', 'Protein', {qtyGrams:isDinner?150:120});
      proteinSource = 'seafood'; pgrams = isDinner ? 32 : 28;
    }
    else if(protein === 'eggs'){
      pgrams = isDinner ? 26 : 22; calories = isDinner ? 340 : 290;
      finish('2–3 egg vegetable frittata' + (starch ? ' with ' + label(starch) : ''), '2–3 eggs baked with ' + vegText(veg) + ' and herbs.', 'eggs', '3', 'Protein', {unitCount:3});
    }
    else if(protein === 'dairy'){
      pgrams = isDinner ? 24 : 22; calories = 300;
      var dairy = selectedDairyName(input, true);
      finish('Cottage cheese protein plate', capFirst(dairy) + ' with ' + vegText(veg) + ', herbs and lemon.', dairy, '200g', 'Dairy', {qtyGrams:200});
    }
    else if(protein === 'tofu'){
      pgrams = isDinner ? 28 : 24;
      finish(tofuTitle(rhythm, starch), 'Tofu cooked with ' + vegText(veg) + ', garlic, ginger and mild seasoning.', 'tofu', isDinner ? '180g' : '150g', 'Protein', {qtyGrams:isDinner?180:150});
    }
    else if(protein === 'lentils'){
      pgrams = isDinner ? 28 : 24; carbs += 15; fibre += 6;
      finish(lentilTitle(rhythm, starch), 'Lentils simmered with ' + vegText(veg) + ', tomato, herbs and ' + reg.stock + '.', 'lentils', isDinner ? '1 cup cooked' : '¾ cup cooked', 'Protein', {qtyGrams:isDinner?200:150});
    }
    else {
      pgrams = isDinner ? 28 : 24; carbs += 15; fibre += 7;
      var legume = protein === 'chickpeas' ? 'chickpeas' : 'beans';
      finish(legumeTitle(rhythm, legume, starch), capFirst(legume) + ' cooked with ' + vegText(veg) + ', tomato, herbs and mild spices.', legume, isDinner ? '1 cup cooked' : '¾ cup cooked', 'Protein', {qtyGrams:isDinner?200:150});
      proteinSource = protein || 'beans';
    }

    return meal(id, day, slot, title, proteinSource, starch || null, veg, ingredients, desc, nutrition(pgrams, carbs, fibre, calories), [slot, rhythm]);
  }

  function chickenTitle(rhythm, starch){ return rhythm === 'Soup' ? 'Chicken vegetable soup' + (starch ? ' with ' + label(starch) : '') : rhythm === 'Curry / stew' ? 'Chicken curry' + (starch ? ' with ' + label(starch) : '') : rhythm === 'Stir-fry' ? 'Chicken stir-fry' + (starch ? ' with ' + label(starch) : '') : rhythm === 'Fun food' ? 'Chicken taco-style bowl' : rhythm === 'Light dinner' ? 'Light chicken plate' : rhythm === 'Sunday / hearty meal' ? 'Roast-style chicken plate' : 'Grilled chicken plate'; }
  function chickenDesc(rhythm, p, veg){ return rhythm === 'Soup' ? 'Chicken simmered gently with ' + vegText(veg) + ' in broth.' : rhythm === 'Curry / stew' ? 'Chicken cooked with tomato, mild curry spices and ' + vegText(veg) + '.' : rhythm === 'Stir-fry' ? 'Chicken strips stir-fried with ' + vegText(veg) + ' and garlic-ginger sauce.' : 'Chicken served with ' + vegText(veg) + ' and simple seasoning.'; }
  function beefTitle(rhythm, starch){ return rhythm === 'Soup' || rhythm === 'Curry / stew' ? 'Lean beef stew' + (starch ? ' with ' + label(starch) : '') : rhythm === 'Stir-fry' ? 'Lean beef stir-fry' + (starch ? ' with ' + label(starch) : '') : rhythm === 'Fun food' ? 'Lean beef burger bowl' : rhythm === 'Sunday / hearty meal' ? 'Lean beef cottage-pie style bowl' : 'Lean beef vegetable bowl'; }
  function beefDesc(rhythm, mince, veg){ return capFirst(mince) + ' cooked with tomato, herbs and ' + vegText(veg) + '.'; }
  function porkTitle(rhythm, starch){ return rhythm === 'Stir-fry' ? 'Lean pork stir-fry' + (starch ? ' with ' + label(starch) : '') : rhythm === 'Curry / stew' || rhythm === 'Soup' ? 'Lean pork tomato stew' + (starch ? ' with ' + label(starch) : '') : 'Lean pork vegetable plate' + (starch ? ' with ' + label(starch) : ''); }
  function porkDesc(rhythm, veg){ return 'Lean pork fillet/loin strips cooked with ' + vegText(veg) + ' and mild seasoning.'; }
  function fishTitle(rhythm, fish, starch){ return fish === 'tuna' ? 'Tuna vegetable bowl' + (starch ? ' with ' + label(starch) : '') : rhythm === 'Soup' ? capFirst(fish) + ' vegetable soup' + (starch ? ' with ' + label(starch) : '') : rhythm === 'Stir-fry' ? capFirst(fish) + ' stir-fry' + (starch ? ' with ' + label(starch) : '') : 'Baked ' + fish + ' plate' + (starch ? ' with ' + label(starch) : ''); }
  function fishDesc(rhythm, fish, veg, reg){ return fish === 'tuna' ? 'Tuna mixed with lemon, herbs and ' + vegText(veg) + '.' : capFirst(fish) + ' cooked gently with ' + vegText(veg) + (rhythm === 'Soup' ? ' in ' + reg.stock : '') + '.'; }
  function seafoodTitle(rhythm, seafood, starch){ return capFirst(seafood) + (rhythm === 'Stir-fry' ? ' stir-fry' : rhythm === 'Curry / stew' ? ' curry' : ' plate') + (starch ? ' with ' + label(starch) : ''); }
  function seafoodDesc(rhythm, seafood, veg){ return capFirst(seafood) + ' cooked with ' + vegText(veg) + ' and mild seasoning.'; }
  function tofuTitle(rhythm, starch){ return rhythm === 'Stir-fry' ? 'Tofu stir-fry' + (starch ? ' with ' + label(starch) : '') : rhythm === 'Curry / stew' ? 'Tofu curry' + (starch ? ' with ' + label(starch) : '') : 'Tofu vegetable bowl' + (starch ? ' with ' + label(starch) : ''); }
  function lentilTitle(rhythm, starch){ return rhythm === 'Soup' ? 'Lentil vegetable soup' + (starch ? ' with ' + label(starch) : '') : rhythm === 'Curry / stew' ? 'Lentil curry' + (starch ? ' with ' + label(starch) : '') : 'Lentil vegetable bowl' + (starch ? ' with ' + label(starch) : ''); }
  function legumeTitle(rhythm, legume, starch){ return capFirst(legume) + (rhythm === 'Fun food' ? ' chilli-style bowl' : rhythm === 'Curry / stew' ? ' curry' : ' vegetable bowl') + (starch ? ' with ' + label(starch) : ''); }

  function makeDinner(input, day, ledger){
    var rhythmList = ['Soup','Curry / stew','Stir-fry','Grill / plate','Fun food','Light dinner','Sunday / hearty meal'];
    var rhythm = rhythmList[(day - 1) % rhythmList.length];
    var protein = chooseDinnerProtein(input, day, ledger);
    var starch = chooseDinnerStarch(input, day, ledger);
    inc(ledger.dinnerProtein, protein); ledger.prevDinnerProtein = ledger.lastDinnerProtein; ledger.lastDinnerProtein = protein;
    inc(ledger.dinnerStarch, starch); ledger.prevDinnerStarch = ledger.lastDinnerStarch; ledger.lastDinnerStarch = starch;
    return makeMainMeal(input, day, 'dinner', protein, starch, ledger, rhythm);
  }

  function makeLunch(input, day, ledger, dinnerProtein){
    var candidates = dinnerCandidates(input).concat(input.proteins.filter(function(p){ return p === 'dairy'; }));
    candidates = unique(candidates).filter(function(p){ return p !== dinnerProtein; });
    if(!candidates.length) candidates = dinnerCandidates(input);
    var protein = pickRotating(candidates, ledger.lunchProtein, { avoid:[dinnerProtein, ledger.lastLunchProtein] });
    inc(ledger.lunchProtein, protein); ledger.lastLunchProtein = protein;
    var starch = null;
    // Lunches are lighter by default. Use a selected wrap/rice sometimes if it helps variety.
    if(input.starches.indexOf('wrap') !== -1 && day % 3 === 0) starch = 'wrap';
    return makeMainMeal(input, day, 'lunch', protein, starch, ledger, 'Grill / plate');
  }

  function cloneLeftoverLunch(sourceDinner, day){
    var copy = JSON.parse(JSON.stringify(sourceDinner));
    copy.id = 'd' + day + '-lunch';
    copy.day = day; copy.slot = 'lunch';
    copy.title = sourceDinner.title + ' (leftover)';
    copy.description = 'Leftover ' + sourceDinner.title.toLowerCase() + ' from Day ' + sourceDinner.day + ' dinner.';
    copy.isLeftover = true; copy.leftoverFromDay = sourceDinner.day;
    return copy;
  }

  function calculateMealNutrition(meal){ return meal && meal.nutrition ? meal.nutrition : nutrition(0,0,0,0); }
  function calculateDayNutrition(day){
    var meals = [day.breakfast, day.morningSnack, day.lunch, day.afternoonSnack, day.dinner];
    var total = meals.reduce(function(acc,m){ var n = calculateMealNutrition(m); acc.protein += Number(n.protein||0); acc.carbs += Number(n.carbs||0); acc.fibre += Number(n.fibre||0); acc.calories += Number(n.calories||0); return acc; }, {protein:0,carbs:0,fibre:0,calories:0});
    return nutrition(total.protein,total.carbs,total.fibre,total.calories);
  }
  function calculatePlanNutrition(plan){
    var days = (plan && plan.days) || [];
    return days.map(calculateDayNutrition);
  }

  function dayMeals(day){ return [day.breakfast,day.morningSnack,day.lunch,day.afternoonSnack,day.dinner]; }
  function replaceSnackWithProtein(day, input, ledger, slot){
    var current = day[slot];
    if(current && current.nutrition && current.nutrition.protein >= 10) return false;
    var otherSlot = slot === 'afternoonSnack' ? 'morningSnack' : 'afternoonSnack';
    var avoid = [];
    if(day[otherSlot] && day[otherSlot].snackKey) avoid.push(day[otherSlot].snackKey);
    if(current && current.snackKey) avoid.push(current.snackKey);
    var meal = makeSnack(input, day.day, slot, ledger, true, avoid);
    if(meal.nutrition.protein <= (current && current.nutrition ? current.nutrition.protein : 0)) return false;
    day[slot] = meal; return true;
  }
  function boostMainMeal(mealObj, grams){
    if(!mealObj || !mealObj.nutrition) return false;
    mealObj.nutrition.protein += grams || 5;
    mealObj.nutrition.calories += (grams || 5) * 8;
    mealObj.description = mealObj.description.replace(/120g/g,'150g').replace(/120–150g/g,'150g');
    return true;
  }
  function proteinRepair(days, input, ledger){
    days.forEach(function(day){
      day.nutrition = calculateDayNutrition(day);
      var safety = 0;
      while(day.nutrition.protein < input.targets.proteinMin && safety++ < 5){
        if(replaceSnackWithProtein(day,input,ledger,'afternoonSnack') || replaceSnackWithProtein(day,input,ledger,'morningSnack')){
          ledger.repairs.push('Day ' + day.day + ': upgraded a snack to meet minimum protein.');
        } else if(boostMainMeal(day.dinner, 5)){
          ledger.repairs.push('Day ' + day.day + ': increased dinner protein portion to meet minimum protein.');
        } else if(boostMainMeal(day.breakfast, 5)){
          ledger.repairs.push('Day ' + day.day + ': increased breakfast protein to meet minimum protein.');
        } else break;
        day.nutrition = calculateDayNutrition(day);
      }
      if(day.nutrition.protein > input.targets.proteinMax){
        var light = makeSnack(input, day.day, 'afternoonSnack', ledger, false, ['protein_powder','tuna','biltong']);
        if(light.nutrition.protein < day.afternoonSnack.nutrition.protein){
          day.afternoonSnack = light;
          ledger.repairs.push('Day ' + day.day + ': reduced optional snack protein to stay inside protein guide.');
          day.nutrition = calculateDayNutrition(day);
        }
      }
      if(day.nutrition.protein < input.targets.proteinMin) ledger.warnings.push('Day ' + day.day + ': selections were too narrow to fully repair protein without adding unselected foods.');
    });
  }

  function validatePlan(plan, input){
    input = normalizeInput(input || plan.inputSummary || {});
    var warnings = (plan.validation && plan.validation.warnings ? plan.validation.warnings.slice() : []);
    var repairs = (plan.validation && plan.validation.repairs ? plan.validation.repairs.slice() : []);
    var passed = true;
    (plan.days || []).forEach(function(day){
      dayMeals(day).forEach(function(m){
        if(!m || !m.title || !m.description) { passed = false; warnings.push('Day ' + day.day + ': missing meal title or description.'); }
        if(m.title && /mandarin or berries|lentils stay/i.test(m.title + ' ' + m.description)) { passed = false; warnings.push('Day ' + day.day + ': blocked old template wording detected.'); }
        if(m.slot === 'breakfast' && /hummus|fruit-only/i.test(m.title)) { passed = false; warnings.push('Day ' + day.day + ': invalid breakfast template detected.'); }
      });
      var n = calculateDayNutrition(day);
      day.nutrition = n;
      if(n.protein < input.targets.proteinMin || n.protein > input.targets.proteinMax) passed = false;
    });
    return { passed: passed, warnings: unique(warnings), repairs: unique(repairs) };
  }

  function buildShoppingList(plan, input){
    var groups = { 'Protein':{}, 'Dairy':{}, 'Vegetables':{}, 'Fruit':{}, 'Carbs and starches':{}, 'Pantry and flavour':{} };
    function add(group, item, amount, meta){
      group = groups[group] ? group : 'Pantry and flavour';
      item = String(item || '').trim(); if(!item) return;
      var key = item.toLowerCase();
      if(!groups[group][key]) groups[group][key] = { item:item, grams:0, units:0, scoops:0, cups:0, count:0, examples:[] };
      var row = groups[group][key]; row.count += 1;
      meta = meta || {};
      if(meta.qtyGrams) row.grams += Number(meta.qtyGrams||0);
      if(meta.unitCount) row.units += Number(meta.unitCount||0);
      if(meta.scoops) row.scoops += Number(meta.scoops||0);
      if(meta.qtyCupsCooked) row.cups += Number(meta.qtyCupsCooked||0);
      if(amount && row.examples.length < 2) row.examples.push(amount);
    }
    ((plan && plan.days) || []).forEach(function(day){
      dayMeals(day).forEach(function(m){
        (m && m.ingredients || []).forEach(function(i){ add(i.group, i.item, i.amount, i); });
      });
    });
    var out = {};
    Object.keys(groups).forEach(function(group){
      out[group] = Object.keys(groups[group]).sort().map(function(k){
        var r = groups[group][k];
        var qty = '';
        if(r.grams) qty = '±' + Math.ceil((r.grams * 1.1) / 50) * 50 + 'g';
        else if(r.scoops) qty = r.scoops + ' scoop' + (r.scoops === 1 ? '' : 's');
        else if(r.units) qty = Math.ceil(r.units) + ' item' + (Math.ceil(r.units) === 1 ? '' : 's');
        else if(r.cups) qty = '±' + Math.ceil(r.cups) + ' cups cooked';
        else qty = r.count + ' use' + (r.count === 1 ? '' : 's');
        return { item:r.item, qty:qty, quantity:qty, notes:'' };
      });
    });
    if(!out['Pantry and flavour'].length){
      out['Pantry and flavour'] = ['garlic','lemon','mixed herbs','mild spices','olive oil or cooking spray'].map(function(x){ return {item:x, qty:'as needed', notes:''}; });
    }
    return out;
  }

  function generatePlan(raw){
    var input = normalizeInput(raw);
    var gate = gateCheck(input);
    if(gate.length){
      return { status:'BLOCKED', version:VERSION, source:ENGINE_SOURCE, inputSummary:input, days:[], shoppingList:{}, gate:gate, messages:gate, validation:{passed:false,warnings:gate,repairs:[]} };
    }
    var ledger = blankCounters();
    var days = [];
    for(var d=1; d<=7; d++){
      var day = { day:d, title:'Day ' + d, proteinGuide:{min:input.targets.proteinMin,max:input.targets.proteinMax}, fibreGuide:{min:input.targets.fibreMin,max:input.targets.fibreMax} };
      day.breakfast = makeBreakfast(input,d,ledger);
      day.morningSnack = makeSnack(input,d,'morningSnack',ledger,true,[]);
      day.dinner = makeDinner(input,d,ledger);
      day.lunch = input.leftoverLunches && d > 1 ? cloneLeftoverLunch(days[d-2].dinner, d) : makeLunch(input,d,ledger,day.dinner.proteinSource);
      day.afternoonSnack = makeSnack(input,d,'afternoonSnack',ledger,false,[day.morningSnack && day.morningSnack.snackKey]);
      day.nutrition = calculateDayNutrition(day);
      days.push(day);
    }
    proteinRepair(days,input,ledger);
    days.forEach(function(day){ day.nutrition = calculateDayNutrition(day); });
    var plan = { status:'ALLOWED', version:VERSION, source:ENGINE_SOURCE, inputSummary:input, days:days, shoppingList:null, validation:{passed:true,warnings:ledger.warnings,repairs:ledger.repairs} };
    plan.validation = validatePlan(plan,input);
    plan.validation.repairs = unique((plan.validation.repairs || []).concat(ledger.repairs));
    plan.validation.warnings = unique((plan.validation.warnings || []).concat(ledger.warnings));
    plan.shoppingList = buildShoppingList(plan,input);
    return plan;
  }

  function swapMeal(plan, dayIndex, mealType, input){
    input = normalizeInput(input || plan.inputSummary || {});
    if(!plan || !Array.isArray(plan.days) || dayIndex < 0 || dayIndex > 6) return plan;
    var ledger = blankCounters();
    var day = plan.days[dayIndex];
    var oldTitle = day[mealType] && day[mealType].title;
    var replacement = null;
    if(mealType === 'breakfast') replacement = makeBreakfast(input, day.day, ledger);
    else if(mealType === 'morningSnack' || mealType === 'afternoonSnack') replacement = makeSnack(input, day.day, mealType, ledger, mealType === 'morningSnack', []);
    else if(mealType === 'dinner') replacement = makeDinner(input, day.day, ledger);
    else if(mealType === 'lunch') replacement = makeLunch(input, day.day, ledger, day.dinner && day.dinner.proteinSource);
    if(!replacement || replacement.title === oldTitle){
      plan.validation = plan.validation || {passed:true,warnings:[],repairs:[]};
      plan.validation.warnings = unique((plan.validation.warnings || []).concat(['No valid alternative meal was available for that swap.']));
      return plan;
    }
    day[mealType] = replacement;
    day.nutrition = calculateDayNutrition(day);
    plan.shoppingList = buildShoppingList(plan,input);
    plan.validation = validatePlan(plan,input);
    return plan;
  }

  return { VERSION:VERSION, ENGINE_SOURCE:ENGINE_SOURCE, version:VERSION, source:ENGINE_SOURCE, generatePlan:generatePlan, validatePlan:validatePlan, buildShoppingList:buildShoppingList, calculateMealNutrition:calculateMealNutrition, calculateDayNutrition:calculateDayNutrition, calculatePlanNutrition:calculatePlanNutrition, swapMeal:swapMeal };
});
