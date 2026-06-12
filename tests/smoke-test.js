const engine = require("../hearty-meal-engine-final.js");
const result = engine.generatePlan({
  region:"US",
  diet:"omnivore",
  proteins:["chicken","beef","fish","eggs","dairy"],
  vegetables:["spinach","tomato","onion","carrot","zucchini","green beans","mushrooms"],
  breakfastItems:["eggs","yogurt","oats"],
  snackProteins:["yogurt","boiled_eggs","tuna","chicken_strips"],
  starches:["rice","pasta"]
});
console.log(JSON.stringify({ version: engine.VERSION, status: result.status, qa: result.qa && result.qa.status, days: result.days && result.days.length }, null, 2));
if(result.status !== "ALLOWED" || !result.days || result.days.length !== 7 || (result.qa && result.qa.status === "FAIL")) process.exit(1);
