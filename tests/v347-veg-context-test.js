const engine = require("../hearty-meal-engine-final.js");

const input = {
  region:"US",
  diet:"omnivore",
  proteins:["chicken","beef","pork","fish","eggs","dairy","protein_powder"],
  breakfastItems:["eggs","yogurt","oats","protein_shake","cottage_cheese"],
  snackProteins:["yogurt","boiled_eggs","tuna","jerky","protein_shake","chicken_strips"],
  starches:["rice","pasta","sweet_potato"],
  vegetables:["cauliflower","zucchini","mushrooms","green beans","butternut","lettuce","cabbage","peppers","spinach","carrot","tomato","cucumber"],
  exclusions:[]
};

const result = engine.generatePlan(input);
const text = JSON.stringify(result.days || []).toLowerCase();
const failures = [];

if (engine.VERSION !== "3.4.9-lunch-variety-polish") failures.push("wrong version");
if (engine.ENGINE_SOURCE !== "rebuilt-funnel-engine-v331-us-first-plus-v349-lunch-variety-polish") failures.push("wrong source");
if (result.status !== "ALLOWED") failures.push("plan blocked");

for (const day of result.days || []) {
  const dinner = `${day.dinner.name} ${day.dinner.detail}`.toLowerCase();
  const lunch = `${day.lunch.name} ${day.lunch.detail}`.toLowerCase();
  const breakfast = `${day.breakfast.name} ${day.breakfast.detail}`.toLowerCase();

  if (/soup|stew|stir-fry|curry|fish|frittata/.test(dinner) && /\blettuce\b|\bcucumber\b/.test(dinner)) {
    failures.push(`Day ${day.day}: raw veg in cooked dinner`);
  }

  if (/frittata|omelette|scrambled/.test(dinner) && /green beans|butternut|lettuce|cabbage|cauliflower|broccoli/.test(dinner)) {
    failures.push(`Day ${day.day}: bad frittata veg`);
  }

  if (/cottage cheese protein plate/.test(lunch) && /cauliflower|zucchini|mushrooms|green beans|butternut|cabbage|broccoli/.test(lunch)) {
    failures.push(`Day ${day.day}: bad cottage cheese lunch veg`);
  }

  if (/cottage cheese breakfast/.test(breakfast) && /cottage cheese protein plate/.test(lunch)) {
    failures.push(`Day ${day.day}: cottage cheese breakfast and lunch`);
  }
}

console.log(JSON.stringify({version: engine.VERSION, status: result.status, failures, days: result.days?.map(d => ({day:d.day, breakfast:d.breakfast.name, lunch:d.lunch.name, lunchDetail:d.lunch.detail, dinner:d.dinner.name, dinnerDetail:d.dinner.detail}))}, null, 2));
if (failures.length) process.exit(1);
