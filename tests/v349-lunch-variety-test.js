const engine = require("../hearty-meal-engine-final.js");

const input = {
  region:"CA",
  diet:"pescatarian",
  proteins:["fish","eggs","dairy","protein_powder"],
  breakfastItems:["eggs","yogurt","oats","protein_shake"],
  snackProteins:["yogurt","boiled_eggs","tuna","protein_shake"],
  starches:["rice","pasta","sweet_potato"],
  vegetables:["cauliflower","zucchini","mushrooms","green beans","butternut","lettuce","cabbage","peppers","spinach","carrot","tomato","cucumber","broccoli","onion"],
  exclusions:[]
};

const result = engine.generatePlan(input);
const lunchNames = new Set((result.days || []).map(d => d.lunch.name));
const failures = [];
if (engine.VERSION !== "3.4.9-lunch-variety-polish") failures.push("wrong version");
if (engine.ENGINE_SOURCE !== "rebuilt-funnel-engine-v331-us-first-plus-v349-lunch-variety-polish") failures.push("wrong source");
if (result.status !== "ALLOWED") failures.push("blocked");
if (lunchNames.size < 4) failures.push(`low lunch variety ${lunchNames.size}`);
for (const d of result.days || []) {
  const lunch = `${d.lunch.name} ${d.lunch.detail}`.toLowerCase();
  if (/cottage cheese protein plate|tuna cucumber bowl|boiled egg vegetable plate|tofu vegetable bowl|chickpea vegetable bowl|cucumber plate/.test(lunch) && /cauliflower|green beans|mushrooms|zucchini|courgette|baby marrow|butternut|cabbage|broccoli/.test(lunch)) {
    failures.push(`Day ${d.day}: hot-style veg in cold lunch`);
  }
}
console.log(JSON.stringify({version: engine.VERSION, status: result.status, lunchNames:[...lunchNames], failures, days: result.days?.map(d => ({day:d.day,lunch:d.lunch.name,detail:d.lunch.detail}))}, null, 2));
if (failures.length) process.exit(1);
