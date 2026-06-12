
const engine = require("./hearty-meal-engine-final.js");
const input = {
  region: "US",
  diet: "omnivore",
  proteins: ["chicken","beef","fish","eggs","dairy","protein_powder"],
  vegetables: ["green beans","zucchini","cauliflower","broccoli","carrot","spinach","peppers","tomato","onion","mushrooms","lettuce","cucumber"],
  breakfastItems: ["oats","protein_shake","eggs","yogurt"],
  snackProteins: ["chicken_strips","boiled_eggs","yogurt","tuna","jerky","protein_shake"],
  starches: ["rice","pasta"],
  exclusions: [],
  lowerStarch: false,
  noBreakfast: false,
  leftoverLunches: false,
  useLeftovers: false
};
const result = engine.generatePlan(input);
console.log(JSON.stringify({
  version: result.version,
  source: result.engineSource,
  qa: result.qa.status,
  hard: result.qa.hard,
  warn: result.qa.warn,
  mainCounts: result.days.reduce((a,d)=>{[d.lunch.cat,d.dinner.cat].forEach(c=>a[c]=(a[c]||0)+1); return a;},{}),
  days: result.days.map(d=>({day:d.day, breakfast:d.breakfast.name, morningSnack:d.morningSnack.name, lunch:d.lunch.name, lunchCat:d.lunch.cat, afternoonSnack:d.afternoonSnack.name, dinner:d.dinner.name, dinnerCat:d.dinner.cat}))
}, null, 2));
