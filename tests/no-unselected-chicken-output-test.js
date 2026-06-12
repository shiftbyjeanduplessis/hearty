const engine = require("../hearty-meal-engine-final.js");

const input = {
  region: "US",
  diet: "omnivore",
  proteins: ["fish","beef","pork","protein_powder","dairy","eggs"],
  breakfastItems: ["oats","protein_shake","eggs","yogurt","cottage_cheese"],
  snackProteins: ["boiled_eggs","yogurt","protein_shake","cottage_cheese","jerky","tuna"],
  starches: ["wrap","couscous","potato","rice"],
  vegetables: ["green beans","mushrooms","zucchini","cauliflower","broccoli","carrot","spinach","peppers","butternut","cabbage","lettuce"],
  exclusions: [],
  lowerStarch: false,
  noBreakfast: false,
  leftoverLunches: false,
  useLeftovers: false
};

const result = engine.generatePlan(input);
const text = JSON.stringify(result.days || []).toLowerCase();
const breakfastText = (result.days || []).map(d => `${d.breakfast.name} ${d.breakfast.detail}`.toLowerCase()).join(" ");
const textRaw = JSON.stringify(result.days || []);

const failures = [];
if (result.status !== "ALLOWED") failures.push("blocked");
if (!result.days || result.days.length !== 7) failures.push("not_7_days");
if (result.qa && result.qa.status === "FAIL") failures.push("qa_fail: " + (result.qa.hard || []).join(" | "));
if (/\bchicken\b/.test(text)) failures.push("unselected chicken appeared");
if (/\b(butternut|green beans|cauliflower|broccoli|cabbage|lettuce)\b/.test(breakfastText)) failures.push("breakfast used non-breakfast veg");
if (/Lean Ground Beef|White Fish|^beef jerky/m.test(textRaw)) failures.push("bad title casing");

console.log(JSON.stringify({
  version: engine.VERSION,
  status: result.status,
  qa: result.qa && result.qa.status,
  failures,
  days: result.days && result.days.length,
  breakfasts: (result.days || []).map(d => d.breakfast),
  sampleDay1: result.days && result.days[0]
}, null, 2));

if (failures.length) process.exit(1);
