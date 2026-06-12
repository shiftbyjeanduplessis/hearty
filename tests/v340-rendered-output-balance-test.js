const engine = require("../hearty-meal-engine-final.js");

function proteinMidpoint(value) {
  const nums = String(value || "").match(/\d+/g)?.map(Number) || [];
  if (!nums.length) return 0;
  return nums.length >= 2 ? Math.round((nums[0] + nums[1]) / 2) : nums[0];
}

function fam(cat) {
  if (!cat) return "";
  if (cat === "tuna" || cat === "salmon") return "fish";
  if (cat === "jerky" || cat === "biltong") return "beef";
  if (cat === "yogurt" || cat === "yoghurt" || cat === "cottage_cheese") return "dairy";
  return cat;
}

function hasWord(text, word) {
  const escaped = String(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp("\\b" + escaped + "\\b", "i").test(text);
}

function snackCat(meal) {
  const t = `${meal?.name || ""} ${meal?.detail || ""}`.toLowerCase();
  if (/yoghurt|yogurt|cottage cheese/.test(t)) return "dairy";
  if (t.includes("egg")) return "eggs";
  if (t.includes("chicken")) return "chicken";
  if (t.includes("tuna") || t.includes("fish")) return "fish";
  if (t.includes("protein shake")) return "protein_powder";
  if (/jerky|biltong|meat strips/.test(t)) return "beef";
  if (/hummus|chickpea/.test(t)) return "legumes";
  return "other";
}

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
const failures = [];

if (result.version !== "3.4.6-strict-snack-gate-quality-fix") failures.push("wrong engine version");
if (result.engineSource !== "rebuilt-funnel-engine-v331-us-first-plus-v346-strict-snack-gate-quality-fixed") failures.push("wrong engine source");
if (result.status !== "ALLOWED") failures.push("engine blocked unexpectedly");
if (result.qa.status === "FAIL") failures.push("engine QA failed: " + JSON.stringify(result.qa.hard));

const days = result.days || [];
if (days.length !== 7) failures.push("not 7 days");

const mainCounts = {};
for (const d of days) {
  for (const cat of [d.lunch.cat, d.dinner.cat]) mainCounts[cat] = (mainCounts[cat] || 0) + 1;

  if (d.lunch.cat && d.dinner.cat && fam(d.lunch.cat) === fam(d.dinner.cat)) {
    failures.push(`Day ${d.day}: lunch and dinner repeat ${d.lunch.cat}`);
  }

  const main = new Set([fam(d.lunch.cat), fam(d.dinner.cat)]);
  for (const snack of [d.morningSnack, d.afternoonSnack]) {
    const sc = fam(snackCat(snack));
    if (sc && main.has(sc)) failures.push(`Day ${d.day}: ${sc} snack matches lunch/dinner`);
  }

  const total = [d.breakfast, d.morningSnack, d.lunch, d.afternoonSnack, d.dinner].reduce((s,m)=>s+proteinMidpoint(m.protein),0);
  if (total > 125) failures.push(`Day ${d.day}: protein too high ${total}`);
}

if ((mainCounts.chicken || 0) > 4) failures.push("chicken dominates lunch/dinner: " + mainCounts.chicken);
if ((mainCounts.beef || 0) > 4) failures.push("beef dominates lunch/dinner: " + mainCounts.beef);

const text = JSON.stringify(days).toLowerCase();
if (text.includes("fish curry") || text.includes("fish stew")) failures.push("bad fish meal appears");
if (hasWord(text, "hake") || text.includes("baby marrow") || hasWord(text, "yoghurt") || hasWord(text, "biltong")) failures.push("US wording error");

console.log(JSON.stringify({
  version: result.version,
  source: result.engineSource,
  qa: result.qa.status,
  mainCounts,
  failures,
  days: days.map(d => ({
    day: d.day,
    breakfast: d.breakfast.name,
    morningSnack: d.morningSnack.name,
    lunch: d.lunch.name,
    lunchCat: d.lunch.cat,
    afternoonSnack: d.afternoonSnack.name,
    dinner: d.dinner.name,
    dinnerCat: d.dinner.cat
  }))
}, null, 2));

if (failures.length) process.exit(1);
