const engine = require("../hearty-meal-engine-final.js");

const input = {
  region: "US",
  diet: "omnivore",
  proteins: ["fish","beef","pork","protein_powder","dairy","eggs"],
  breakfastItems: ["oats","protein_shake","eggs","yogurt"],
  snackProteins: ["boiled_eggs","yogurt","protein_shake","cottage_cheese","jerky"],
  starches: ["wrap","couscous","potato","rice"],
  vegetables: ["green beans","mushrooms","zucchini","cauliflower","broccoli","carrot","spinach","peppers","butternut"],
  exclusions: [],
  lowerStarch: false,
  noBreakfast: false,
  leftoverLunches: false,
  useLeftovers: false
};

const result = engine.generatePlan(input);
console.log(JSON.stringify({
  version: engine.VERSION,
  status: result.status,
  ok: result.ok,
  qa: result.qa && result.qa.status,
  gate: result.gate && result.gate.status,
  messages: result.messages || [],
  hard: result.qa && result.qa.hard,
  warn: result.qa && result.qa.warn,
  days: result.days && result.days.length
}, null, 2));

if(result.status !== "ALLOWED" || !result.days || result.days.length !== 7 || (result.qa && result.qa.status === "FAIL")) {
  process.exit(1);
}
