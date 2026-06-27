
const fs=require('fs'), vm=require('vm');
const s=fs.readFileSync('./js/hearty-meal-engine.js','utf8');
const context={window:{}, console}; context.global=context; context.self=context.window;
vm.createContext(context); vm.runInContext(s, context);
const engine=context.window.HeartyMealEngine;
const input={
 country:'ZA',region:'ZA',dietType:'omnivore',eatingStyle:'Omnivore',
 exclusions:{pork:true,beef:true,chicken:false,fish:true,seafood:true,shellfish:true,dairy:false,eggs:false,legumes:true,soy:true,lamb:true},
 days:7,snacksEnabled:true,portionProfile:'standard_low_activity_glp1',mainStruggle:'protein simple',
 supportMode:{nausea:0,lowAppetite:0,bloating:0,exhaustion:1,proteinIdeas:2},
 preferredProteinFamilies:['eggs','chicken','dairy'],
 preferredFoodKeys:['eggs','chicken_breast_cooked','greek_yoghurt'],
 strictPreferredFoodKeys:true,
 preferredTags:['simple','light','starch','fruit','salad','plate','dairy'],
 vegetablePreferences:['spinach','lettuce','tomato','cucumber'],
 carbPreferences:['rice','potato','sweet_potato','banana','berries'],
 snackPreferences:['fruit_choice','berries','banana','greek_yoghurt'],
 personalisationLevel:'lead_magnet_inferred_diet_guardrails',
 calorieMode:'estimated_suggested_serving'
};
const plan=engine.generatePlan(input);
const badProteins = ['tofu_firm','lamb_lean_cooked','lean_pork_loin_cooked','lean_beef_mince_cooked','lean_beef_strips_cooked','meat_free_mince','chickpeas_cooked','beans_cooked','lentils_cooked','tuna_canned_drained','white_fish_cooked','hake_cooked','prawns_cooked','calamari_cooked','mussels_cooked','clams_cooked','cottage_cheese'];
const used = [];
for (const day of plan.days) {
  for (const meal of [day.meals.breakfast, day.meals.lunch, day.meals.dinner, ...(day.meals.snacks||[])]) {
    if (!meal || !meal.components) continue;
    for (const c of meal.components) if (badProteins.includes(c.food)) used.push(c.food);
  }
}
console.log(JSON.stringify({
  badProteinsUsed:[...new Set(used)],
  dinners: plan.days.map(d=>d.meals.dinner && d.meals.dinner.title),
  lunches: plan.days.map(d=>d.meals.lunch && d.meals.lunch.title),
  snacks: plan.days.map(d=>(d.meals.snacks||[]).map(s=>s.title))
}, null, 2));
if (used.length) process.exit(2);
