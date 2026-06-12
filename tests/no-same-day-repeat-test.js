const engine = require("../hearty-meal-engine-final.js");
const input = {
  region: "US",
  diet: "omnivore",
  proteins: ["fish","beef","pork","protein_powder","dairy","eggs"],
  breakfastItems: ["oats","protein_shake","eggs","yogurt","cottage_cheese"],
  snackProteins: ["boiled_eggs","yogurt","protein_shake","cottage_cheese","jerky","tuna"],
  starches: ["wrap","couscous","potato","rice"],
  vegetables: ["green beans","mushrooms","zucchini","cauliflower","broccoli","carrot","spinach","peppers","butternut","cabbage","lettuce"],
  leftoverLunches:false,
  useLeftovers:false
};
const result = engine.generatePlan(input);
const failures = [];
if (result.status !== "ALLOWED") failures.push("blocked");
if (result.qa && result.qa.status === "FAIL") failures.push("qa_fail: " + (result.qa.hard || []).join(" | "));
for (const d of result.days || []) {
  if (d.lunch && d.dinner && d.lunch.cat === d.dinner.cat) failures.push(`day ${d.day} lunch/dinner repeated ${d.lunch.cat}`);
}
const text = JSON.stringify(result.days || []).toLowerCase();
if (/\bchicken\b/.test(text)) failures.push("unselected chicken appeared");
console.log(JSON.stringify({version: engine.VERSION, failures, dayCats: (result.days||[]).map(d => ({day:d.day,lunch:d.lunch.cat,dinner:d.dinner.cat,lunchName:d.lunch.name,dinnerName:d.dinner.name}))}, null, 2));
if (failures.length) process.exit(1);
