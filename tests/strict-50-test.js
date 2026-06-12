
const engine = require("../hearty-meal-engine-final.js");

const regions = ["SA", "US", "UK", "AU", "CA"];
const vegByRegion = {
  SA: ["spinach","tomato","onion","carrot","baby marrow","green beans","mushrooms","peppers","broccoli","cucumber","lettuce"],
  US: ["spinach","tomato","onion","carrot","zucchini","green beans","mushrooms","peppers","broccoli","cucumber","lettuce"],
  UK: ["spinach","tomato","onion","carrot","courgette","green beans","mushrooms","peppers","broccoli","cucumber","lettuce"],
  AU: ["spinach","tomato","onion","carrot","zucchini","green beans","mushrooms","peppers","broccoli","cucumber","lettuce"],
  CA: ["spinach","tomato","onion","carrot","zucchini","green beans","mushrooms","peppers","broccoli","cucumber","lettuce"]
};
function yog(region) { return (region === "US" || region === "CA") ? "yogurt" : "yoghurt"; }

const cases = [];
function add(name, input) { cases.push({ name, input }); }

for (const region of regions) {
  add(`${region} standard omnivore no leftovers`, {
    region, diet: "omnivore", proteins: ["chicken","beef","eggs","dairy"], vegetables: vegByRegion[region].slice(0,7),
    breakfastItems: ["eggs", yog(region), "cottage_cheese"], snackProteins: [yog(region), "boiled_eggs", "chicken_strips"],
    starches: ["rice","pasta"], leftoverLunches: false, useLeftovers: false
  });
  add(`${region} high variety no leftovers`, {
    region, diet: "omnivore", proteins: ["chicken","beef","fish","eggs","dairy"], vegetables: vegByRegion[region].slice(0,9),
    breakfastItems: ["eggs", yog(region), "oats"], snackProteins: [yog(region), "boiled_eggs", "tuna", "chicken_strips"],
    starches: ["rice","pasta","sweet_potato"], leftoverLunches: false, useLeftovers: false
  });
  add(`${region} no red meat no leftovers`, {
    region, diet: "omnivore", proteins: ["chicken","fish","eggs","dairy","beef"], vegetables: vegByRegion[region].slice(0,7),
    breakfastItems: ["eggs", yog(region)], snackProteins: [yog(region), "boiled_eggs", "tuna"],
    starches: ["rice","sweet_potato"], exclusions: ["no_red_meat"], leftoverLunches: false, useLeftovers: false
  });
  add(`${region} lower starch no leftovers`, {
    region, diet: "omnivore", proteins: ["chicken","beef","eggs","protein_powder"], vegetables: vegByRegion[region].slice(0,7),
    breakfastItems: ["eggs", "protein_shake"], snackProteins: ["boiled_eggs", "chicken_strips", "protein_shake"],
    starches: [], lowerStarch: true, leftoverLunches: false, useLeftovers: false
  });
  add(`${region} no breakfast no leftovers`, {
    region, diet: "omnivore", proteins: ["chicken","beef","eggs","dairy"], vegetables: vegByRegion[region].slice(0,7),
    breakfastItems: [], snackProteins: [yog(region), "boiled_eggs", "chicken_strips"],
    starches: ["rice"], noBreakfast: true, leftoverLunches: false, useLeftovers: false
  });
}

for (const region of regions) {
  add(`${region} vegetarian eggs dairy tofu lentils`, {
    region, diet: "vegetarian", proteins: ["eggs","dairy","tofu","lentils"], vegetables: vegByRegion[region].slice(0,7),
    breakfastItems: ["eggs", yog(region), "cottage_cheese"], snackProteins: [yog(region), "boiled_eggs", "tofu_bites"],
    starches: ["rice","pasta"], leftoverLunches: false, useLeftovers: false
  });
  add(`${region} vegetarian no dairy no eggs`, {
    region, diet: "vegetarian", proteins: ["tofu","lentils","beans","chickpeas"], vegetables: vegByRegion[region].slice(0,7),
    breakfastItems: ["tofu_scramble"], snackProteins: ["tofu_bites","hummus"],
    starches: ["rice","sweet_potato"], exclusions: ["no_dairy","no_eggs"], leftoverLunches: false, useLeftovers: false
  });
  add(`${region} vegetarian hummus breakfast`, {
    region, diet: "vegetarian", proteins: ["tofu","lentils","beans","chickpeas"], vegetables: vegByRegion[region].slice(0,7),
    breakfastItems: ["hummus_plate","tofu_scramble"], snackProteins: ["tofu_bites","hummus"],
    starches: ["rice"], leftoverLunches: false, useLeftovers: false
  });
}

for (const region of regions) {
  add(`${region} pescatarian fish eggs dairy`, {
    region, diet: "pescatarian", proteins: ["fish","eggs","dairy","lentils"], vegetables: vegByRegion[region].slice(0,7),
    breakfastItems: ["eggs", yog(region)], snackProteins: ["tuna","boiled_eggs",yog(region)],
    starches: ["rice","sweet_potato"], leftoverLunches: false, useLeftovers: false
  });
  add(`${region} pescatarian no dairy`, {
    region, diet: "pescatarian", proteins: ["fish","eggs","lentils","beans"], vegetables: vegByRegion[region].slice(0,7),
    breakfastItems: ["eggs"], snackProteins: ["tuna","boiled_eggs","hummus"],
    starches: ["rice"], exclusions: ["no_dairy"], leftoverLunches: false, useLeftovers: false
  });
}

function mealText(meal) { return `${meal?.name || ""} ${meal?.detail || ""}`.toLowerCase(); }
function hasWord(text, word) {
  return new RegExp("\\b" + String(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i").test(text);
}
function classifySnack(text) {
  if (/yoghurt|yogurt|cottage cheese/.test(text)) return "dairy";
  if (text.includes("egg")) return "eggs";
  if (text.includes("chicken")) return "chicken";
  if (text.includes("tuna") || text.includes("fish")) return "fish";
  if (text.includes("hummus") || text.includes("chickpea")) return "legumes";
  if (text.includes("tofu")) return "tofu";
  if (text.includes("protein shake")) return "protein_powder";
  if (/biltong|jerky|meat strips/.test(text)) return "beef";
  return "other";
}
function runLockedQA(input, result) {
  const hard = [], warn = [], dinnerCats = [], snackTypes = [];
  if (result.status === "BLOCKED") {
    hard.push("Case was blocked unexpectedly.");
    return { status: "FAIL", hard, warn };
  }
  for (const day of result.days) {
    const b = mealText(day.breakfast), am = mealText(day.morningSnack), pm = mealText(day.afternoonSnack), l = mealText(day.lunch), d = mealText(day.dinner);
    const all = `${b} ${am} ${pm} ${l} ${d}`;
    if ((hasWord(d, "fish") || hasWord(d, "hake") || hasWord(d, "cod") || hasWord(d, "tuna") || hasWord(d, "salmon")) && hasWord(d, "curry")) hard.push(`Day ${day.day}: fish curry appears.`);
    if (input.region !== "SA" && hasWord(all, "hake")) hard.push(`Day ${day.day}: hake appears outside SA.`);
    if (!input.leftoverLunches && !input.useLeftovers && (hasWord(l, "leftover") || l.includes("last night's") || l.includes("last night") || l.includes("use the leftover"))) hard.push(`Day ${day.day}: leftover lunch appears even though leftovers were not selected.`);
    if (hasWord(l, "remove") || hasWord(l, "removed")) hard.push(`Day ${day.day}: lunch uses remove-starch wording.`);
    if (!input.leftoverLunches && !input.useLeftovers && !l.includes("no added starch") && !l.includes("no added rice, pasta or potato")) hard.push(`Day ${day.day}: non-leftover lunch does not clearly say no added starch.`);
    const eggBreakfast = /\begg\b|\beggs\b|omelette|omelet|frittata/.test(b);
    const eggSnack = /\begg\b|\beggs\b|boiled egg/.test(am) || /\begg\b|\beggs\b|boiled egg/.test(pm);
    const snackAlternatives = (input.snackProteins || []).filter(x => !["boiled_eggs","eggs"].includes(x)).length >= 1;
    if (eggBreakfast && snackAlternatives && eggSnack) hard.push(`Day ${day.day}: egg breakfast and egg snack on same day.`);
    const yoghurtBreakfast = /yoghurt|yogurt/.test(b);
    const yoghurtSnack = /yoghurt|yogurt/.test(am) || /yoghurt|yogurt/.test(pm);
    const nonYoghurtSnacks = (input.snackProteins || []).filter(x => !["yoghurt","yogurt","cottage_cheese"].includes(x)).length >= 1;
    if (yoghurtBreakfast && yoghurtSnack && nonYoghurtSnacks) hard.push(`Day ${day.day}: yoghurt breakfast and yoghurt snack on same day.`);
    const shakeBreakfast = b.includes("protein shake");
    const shakeSnack = am.includes("protein shake") || pm.includes("protein shake");
    const nonShakeSnacks = (input.snackProteins || []).filter(x => x !== "protein_shake").length >= 1;
    if (shakeBreakfast && shakeSnack && nonShakeSnacks) hard.push(`Day ${day.day}: protein shake breakfast and protein shake snack on same day.`);
    const legumeBreakfastCheck = b.replace(/green beans/g, "greenbeans");
    if (/\b(lentil|lentils|bean|beans|chickpea|chickpeas)\b/.test(legumeBreakfastCheck) && !b.includes("hummus")) hard.push(`Day ${day.day}: legume breakfast outside hummus.`);
    if (b.includes("hummus") && !(input.breakfastItems || []).includes("hummus_plate")) hard.push(`Day ${day.day}: hummus breakfast without hummus_plate selected.`);
    if (b.includes("tofu") && !(input.breakfastItems || []).includes("tofu_scramble")) hard.push(`Day ${day.day}: tofu breakfast without tofu_scramble selected.`);
    if (/\b(chicken|beef|pork|fish|tuna|hake|cod|jerky|biltong)\b/.test(b)) hard.push(`Day ${day.day}: meat/fish breakfast.`);
    const ex = new Set(input.exclusions || []);
    if (ex.has("no_dairy") && /yoghurt|yogurt|cottage cheese|milk|cheese/.test(all)) hard.push(`Day ${day.day}: dairy appears despite no-dairy.`);
    if (ex.has("no_eggs") && /\begg\b|\beggs\b|omelette|frittata/.test(all)) hard.push(`Day ${day.day}: eggs appear despite no-eggs.`);
    if (ex.has("no_red_meat") && /beef|pork|biltong|jerky/.test(all)) hard.push(`Day ${day.day}: red meat appears despite no-red-meat.`);
    if ((input.region === "US" || input.region === "CA") && (hasWord(all, "hake") || all.includes("baby marrow") || hasWord(all, "biltong") || hasWord(all, "yoghurt"))) hard.push(`Day ${day.day}: US/CA region wording error.`);
    if (input.region === "UK" && (hasWord(all, "zucchini") || hasWord(all, "yogurt") || all.includes("baby marrow") || hasWord(all, "biltong") || hasWord(all, "hake"))) hard.push(`Day ${day.day}: UK region wording error.`);
    if (input.region === "SA" && (hasWord(all, "zucchini") || hasWord(all, "yogurt") || hasWord(all, "clementine"))) hard.push(`Day ${day.day}: SA region wording error.`);
    if ((day.morningSnack?.name || "").toLowerCase().includes("optional protein shake") || (day.afternoonSnack?.name || "").toLowerCase().includes("optional protein shake")) hard.push(`Day ${day.day}: snack title says Optional protein shake.`);
    if (hasWord(all, "selected protein") || hasWord(all, "selected fish")) hard.push(`Day ${day.day}: output uses selected-protein wording.`);
    if (all.includes("mixed vegetables")) hard.push(`Day ${day.day}: mixed vegetables appears in output.`);
    if (hasWord(all, "corn")) warn.push(`Day ${day.day}: corn appears in output.`);
    dinnerCats.push(day.dinner?.cat || "other");
    snackTypes.push(classifySnack(am), classifySnack(pm));
  }
  const distinctDinnerNames = new Set(result.days.map(d => (d.dinner?.name || "").toLowerCase()));
  if (distinctDinnerNames.size < 4) hard.push("Plan: fewer than 4 distinct dinner templates.");
  if (new Set(dinnerCats).size < 2) hard.push("Plan: fewer than 2 dinner protein categories.");
  if (new Set(snackTypes).size < 2) hard.push("Plan: fewer than 2 snack protein categories.");
  return { status: hard.length ? "FAIL" : (warn.length ? "CONDITIONAL PASS" : "PASS"), hard, warn };
}

const results = cases.map((c, idx) => {
  const result = engine.generatePlan(c.input);
  const lockedQA = runLockedQA(c.input, result);
  return { index: idx + 1, name: c.name, input: c.input, engineStatus: result.status, engineQA: result.qa ? result.qa.status : "none", lockedQA, days: result.days || [] };
});
const summary = results.reduce((acc,r)=>{ acc[r.lockedQA.status]=(acc[r.lockedQA.status]||0)+1; return acc; }, {});
console.log(JSON.stringify({ engineVersion: engine.VERSION, total: results.length, summary, results }, null, 2));
