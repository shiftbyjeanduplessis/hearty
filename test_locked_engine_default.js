
const fs=require('fs'), vm=require('vm');
const s=fs.readFileSync('./js/hearty-meal-engine.js','utf8');
const ctx={console, window:{}}; ctx.self=ctx.window; vm.createContext(ctx); vm.runInContext(s,ctx);
const e=ctx.window.HeartyMealEngine;
const input={
  region:'SA',
  diet:'omnivore',
  proteins:['eggs','chicken','dairy','protein_powder'],
  breakfastItems:['eggs','greek_yoghurt'],
  snackProteins:['boiled_eggs','yoghurt','protein_shake','fruit','wholegrain_crackers'],
  starches:['rice','potato','sweet_potato'],
  vegetables:['spinach','lettuce','tomato','cucumber','carrot','broccoli'],
  lowerStarch:false,
  leftoverLunches:false,
  planTier:2
};
const plan=e.generatePlan(input);
const dayText=JSON.stringify(plan.days || []).toLowerCase();
const badPatterns=[
  /\btofu\b/,
  /\bpork\b/,
  /\bcalamari\b/,
  /\bprawn/,
  /\bchickpea/,
  /\bbean wrap\b/,
  /\blean pork\b/,
  /\bwhite fish\b/,
  /\bfish plate\b/,
  /\bgrilled fish\b/,
  /\bhake\b/
];
const bad=badPatterns.filter(re=>re.test(dayText)).map(re=>String(re));
console.log(JSON.stringify({
  version:e.VERSION,
  source:e.ENGINE_SOURCE,
  status:plan.status,
  days:plan.days.length,
  bad,
  dinners: plan.days.map(d=>d.dinner && d.dinner.name),
  day1:plan.days[0]
}, null, 2));
if (bad.length) process.exit(2);
