
const fs = require("fs");
const engine = require("./hearty-meal-engine-final.js");

function clone(x){ return JSON.parse(JSON.stringify(x)); }

const baseVegUS = ["spinach","tomato","onion","carrot","zucchini","green beans","mushrooms","peppers","broccoli","cucumber","lettuce","cauliflower"];
const baseVegSA = ["spinach","tomato","onion","carrot","baby marrow","green beans","mushrooms","peppers","broccoli","cucumber","lettuce","cauliflower"];
const baseVegUK = ["spinach","tomato","onion","carrot","courgette","green beans","mushrooms","peppers","broccoli","cucumber","lettuce","cauliflower"];

const scenarios = [
  {name:"US broad omnivore full variety", region:"US", diet:"omnivore", proteins:["chicken","beef","fish","eggs","dairy","protein_powder"], breakfastItems:["oats","protein_shake","eggs","yogurt"], snackProteins:["chicken_strips","boiled_eggs","yogurt","tuna","jerky","protein_shake"], starches:["rice","pasta"], vegetables:baseVegUS},
  {name:"US no chicken broad", region:"US", diet:"omnivore", proteins:["beef","pork","fish","eggs","dairy","protein_powder"], breakfastItems:["oats","protein_shake","eggs","yogurt","cottage_cheese"], snackProteins:["boiled_eggs","yogurt","tuna","jerky","protein_shake","cottage_cheese"], starches:["wrap","couscous","potato","rice"], vegetables:["green beans","mushrooms","zucchini","cauliflower","broccoli","carrot","spinach","peppers","butternut","tomato","onion"]},
  {name:"US chicken beef eggs dairy", region:"US", diet:"omnivore", proteins:["chicken","beef","eggs","dairy","protein_powder"], breakfastItems:["eggs","yogurt","oats"], snackProteins:["yogurt","boiled_eggs","chicken_strips","jerky"], starches:["rice","pasta"], vegetables:["spinach","tomato","onion","carrot","zucchini","green beans","mushrooms","peppers","broccoli","cucumber"]},
  {name:"US fish beef pork eggs", region:"US", diet:"omnivore", proteins:["fish","beef","pork","eggs","dairy"], breakfastItems:["eggs","yogurt","oats"], snackProteins:["yogurt","boiled_eggs","tuna","jerky"], starches:["rice","potato","couscous"], vegetables:baseVegUS},
  {name:"US pescatarian", region:"US", diet:"pescatarian", proteins:["fish","eggs","dairy","protein_powder"], breakfastItems:["eggs","yogurt","protein_shake","oats"], snackProteins:["yogurt","boiled_eggs","tuna","protein_shake"], starches:["rice","pasta","potato"], vegetables:baseVegUS},
  {name:"US vegetarian tofu legumes", region:"US", diet:"vegetarian", proteins:["eggs","dairy","tofu","lentils","beans","chickpeas"], breakfastItems:["eggs","yogurt","tofu_scramble","hummus_plate"], snackProteins:["yogurt","boiled_eggs","hummus","tofu"], starches:["rice","pasta","sweet_potato"], vegetables:baseVegUS},
  {name:"US vegetarian no eggs", region:"US", diet:"vegetarian", proteins:["dairy","tofu","lentils","beans","chickpeas","protein_powder"], breakfastItems:["yogurt","protein_shake","tofu_scramble","hummus_plate"], snackProteins:["yogurt","protein_shake","hummus","tofu"], starches:["rice","pasta","potato"], vegetables:baseVegUS},
  {name:"US no breakfast", region:"US", diet:"omnivore", proteins:["chicken","beef","fish","eggs","dairy"], breakfastItems:[], snackProteins:["yogurt","boiled_eggs","tuna","jerky","chicken_strips"], starches:["rice","pasta"], vegetables:baseVegUS, noBreakfast:true},
  {name:"SA broad omnivore", region:"SA", diet:"omnivore", proteins:["chicken","beef","fish","eggs","dairy","protein_powder"], breakfastItems:["oats","protein_shake","eggs","yoghurt"], snackProteins:["chicken_strips","boiled_eggs","yoghurt","tuna","biltong","protein_shake"], starches:["rice","pasta","sweet_potato"], vegetables:baseVegSA},
  {name:"SA no chicken", region:"SA", diet:"omnivore", proteins:["beef","pork","fish","eggs","dairy"], breakfastItems:["eggs","yoghurt","oats"], snackProteins:["boiled_eggs","yoghurt","tuna","biltong"], starches:["rice","potato","couscous"], vegetables:baseVegSA},
  {name:"UK broad omnivore", region:"UK", diet:"omnivore", proteins:["chicken","beef","fish","eggs","dairy","protein_powder"], breakfastItems:["oats","protein_shake","eggs","yoghurt"], snackProteins:["chicken_strips","boiled_eggs","yoghurt","tuna","jerky","protein_shake"], starches:["rice","pasta","potato"], vegetables:baseVegUK},
  {name:"UK fish beef eggs", region:"UK", diet:"omnivore", proteins:["fish","beef","eggs","dairy","protein_powder"], breakfastItems:["eggs","yoghurt","protein_shake","oats"], snackProteins:["boiled_eggs","yoghurt","tuna","jerky","protein_shake"], starches:["rice","pasta","couscous"], vegetables:baseVegUK},
  {name:"AU broad omnivore", region:"AU", diet:"omnivore", proteins:["chicken","beef","pork","fish","eggs","dairy"], breakfastItems:["eggs","yoghurt","oats"], snackProteins:["boiled_eggs","yoghurt","tuna","jerky","chicken_strips"], starches:["rice","pasta","sweet_potato"], vegetables:baseVegUS},
  {name:"CA broad omnivore", region:"CA", diet:"omnivore", proteins:["chicken","beef","fish","eggs","dairy"], breakfastItems:["eggs","yogurt","oats"], snackProteins:["boiled_eggs","yogurt","tuna","jerky","chicken_strips"], starches:["rice","pasta"], vegetables:baseVegUS},
  {name:"CA no red meat", region:"CA", diet:"omnivore", proteins:["chicken","fish","eggs","dairy","protein_powder"], breakfastItems:["eggs","yogurt","protein_shake","oats"], snackProteins:["boiled_eggs","yogurt","tuna","protein_shake","chicken_strips"], starches:["rice","potato","pasta"], vegetables:baseVegUS, exclusions:["no_red_meat"]},
];

const starchSets = [
  ["rice","pasta"],
  ["rice","potato","sweet_potato"],
  ["wrap","couscous","rice"],
  ["pasta","couscous","potato"],
  ["rice","pasta","sweet_potato","wrap"]
];

const regions = ["US","SA","UK","AU","CA"];
const regionVeg = {US:baseVegUS, SA:baseVegSA, UK:baseVegUK, AU:baseVegUS, CA:baseVegUS};
const yKey = r => (r==="US" || r==="CA" ? "yogurt" : "yoghurt");
const jerkyKey = r => (r==="SA" ? "biltong" : "jerky");

for (let i=15; i<50; i++) {
  const region = regions[i % regions.length];
  const mode = i % 7;
  const y = yKey(region);
  const proteins =
    mode === 0 ? ["chicken","beef","fish","eggs","dairy","protein_powder"] :
    mode === 1 ? ["beef","pork","fish","eggs","dairy"] :
    mode === 2 ? ["chicken","fish","eggs","dairy","protein_powder"] :
    mode === 3 ? ["fish","eggs","dairy","protein_powder"] :
    mode === 4 ? ["chicken","beef","eggs","dairy"] :
    mode === 5 ? ["eggs","dairy","tofu","lentils","beans","chickpeas"] :
                 ["dairy","tofu","lentils","beans","chickpeas","protein_powder"];
  const diet = (mode === 3) ? "pescatarian" : (mode === 5 || mode === 6) ? "vegetarian" : "omnivore";
  const breakfastItems =
    mode === 6 ? [y,"protein_shake","tofu_scramble","hummus_plate"] :
    mode === 5 ? ["eggs",y,"tofu_scramble","hummus_plate"] :
    ["eggs",y,"oats","protein_shake"];
  const snackProteins =
    mode === 6 ? [y,"protein_shake","hummus","tofu"] :
    mode === 5 ? [y,"boiled_eggs","hummus","tofu"] :
    mode === 3 ? [y,"boiled_eggs","tuna","protein_shake"] :
    [y,"boiled_eggs","tuna",jerkyKey(region),"protein_shake","chicken_strips"];
  scenarios.push({
    name:`Generated scenario ${i+1} ${region} mode ${mode}`,
    region, diet, proteins, breakfastItems, snackProteins,
    starches: starchSets[i % starchSets.length],
    vegetables: regionVeg[region].slice(0, 8 + (i % 4)),
    exclusions: mode === 4 && i % 2 === 0 ? ["no_fish"] : [],
    noBreakfast: i % 13 === 0,
    lowerStarch: false,
    leftoverLunches: false,
    useLeftovers: false
  });
}

function mealText(meal){ return `${meal?.name || ""} ${meal?.detail || ""}`.toLowerCase(); }
function proteinMidpoint(value){
  const nums = String(value || "").match(/\d+/g)?.map(Number) || [];
  if(!nums.length) return 0;
  return nums.length >= 2 ? Math.round((nums[0]+nums[1])/2) : nums[0];
}
function hasWord(text, word){
  const escaped = String(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp("\\b" + escaped + "\\b", "i").test(text);
}
function snackCat(meal) {
  const t = mealText(meal);
  if (/yoghurt|yogurt|cottage cheese/.test(t)) return "dairy";
  if (t.includes("egg")) return "eggs";
  if (t.includes("chicken")) return "chicken";
  if (t.includes("tuna") || t.includes("fish")) return "fish";
  if (t.includes("protein shake")) return "protein_powder";
  if (/jerky|biltong|meat strips/.test(t)) return "beef";
  if (/hummus|chickpea/.test(t)) return "legumes";
  if (/tofu/.test(t)) return "tofu";
  if (/apple|berries|mandarin|naartjie|clementine|fruit/.test(t)) return "fruit";
  return "other";
}
function fam(cat){
  if(!cat) return "";
  if(cat==="tuna" || cat==="salmon") return "fish";
  if(cat==="jerky" || cat==="biltong") return "beef";
  if(cat==="yogurt" || cat==="yoghurt" || cat==="cottage_cheese") return "dairy";
  return cat;
}
function renderFullPlan(s, result){
  const lines = [];
  lines.push(`# ${s.index}. ${s.name}`);
  lines.push("");
  lines.push(`Engine: ${result.version}`);
  lines.push(`Source: ${result.engineSource || engine.ENGINE_SOURCE || "not exported"}`);
  lines.push(`Region: ${s.region}`);
  lines.push(`Diet: ${s.diet}`);
  lines.push(`Status: ${result.status}`);
  lines.push(`Engine QA: ${result.qa?.status}`);
  if(result.qa?.hard?.length) lines.push(`Hard issues: ${result.qa.hard.join(" | ")}`);
  if(result.qa?.warn?.length) lines.push(`Warnings: ${result.qa.warn.join(" | ")}`);
  lines.push("");
  for(const d of result.days || []){
    const total = [d.breakfast,d.morningSnack,d.lunch,d.afternoonSnack,d.dinner].reduce((sum,m)=>sum+proteinMidpoint(m?.protein),0);
    lines.push(`## Day ${d.day}`);
    for(const [label, meal] of [["Breakfast",d.breakfast],["Morning snack",d.morningSnack],["Lunch",d.lunch],["Afternoon snack",d.afternoonSnack],["Dinner",d.dinner]]){
      lines.push(`**${label}**`);
      lines.push(`${meal.name} Approx. ${meal.protein} protein`);
      lines.push(`Basic method: ${meal.detail}`);
      lines.push("");
    }
    lines.push(`Estimated daily protein: approx. ${total}g`);
    lines.push("");
  }
  lines.push("---", "");
  return lines.join("\n");
}
function extraQA(input, result){
  const hard = [];
  const warn = [];
  const days = result.days || [];
  const selected = new Set(input.proteins || []);
  const text = JSON.stringify(days).toLowerCase();

  if(result.version !== "3.4.1-snack-balance-reset") hard.push("Wrong engine version");
  if(!result.engineSource || !String(result.engineSource).includes("v341-snack-balance")) hard.push("Missing/incorrect engine source");
  if(result.status !== "ALLOWED") hard.push("Not allowed");
  if(!days || days.length !== 7) hard.push("Not 7 generated days");

  for(const [cat, pattern] of [["chicken","chicken"],["beef","beef"],["pork","pork"],["fish","fish|tuna|white fish|hake|cod"]]){
    if(selected.has(cat)) continue;
    const rx = new RegExp("\\b(" + pattern + ")\\b", "i");
    if(rx.test(text)) hard.push(`${cat} appears but was not selected`);
  }

  if(input.diet === "vegetarian" && /\b(chicken|beef|pork|fish|tuna|hake|cod|jerky|biltong)\b/.test(text)) hard.push("Meat/fish appears in vegetarian");
  if(input.diet === "pescatarian" && /\b(chicken|beef|pork|jerky|biltong)\b/.test(text)) hard.push("Meat/red meat appears in pescatarian");
  if(input.region !== "SA" && hasWord(text, "hake")) hard.push("Hake outside SA");
  if((input.region === "US" || input.region === "CA") && (hasWord(text, "yoghurt") || hasWord(text, "biltong") || text.includes("baby marrow"))) hard.push("US/CA wording error");
  if(input.region === "UK" && (hasWord(text, "zucchini") || hasWord(text, "yogurt") || text.includes("baby marrow") || hasWord(text, "biltong") || hasWord(text, "hake"))) hard.push("UK wording error");
  if(input.region === "SA" && (hasWord(text, "zucchini") || hasWord(text, "yogurt"))) hard.push("SA wording error");
  if(/fish curry|fish stew|fish bolognese|fish stir-fry|selected fish|selected protein|mixed vegetables/.test(text)) hard.push("Bad phrase/template appears");
  if(!input.leftoverLunches && /\bleftover\b|last night|use the leftover|remove the added/.test(text)) hard.push("Forced leftover/remove wording appears");

  const mainCounts = {};
  for(const d of days){
    for(const cat of [d.lunch?.cat, d.dinner?.cat]) if(cat) mainCounts[cat] = (mainCounts[cat] || 0) + 1;
    if(d.lunch?.cat && d.dinner?.cat && fam(d.lunch.cat) === fam(d.dinner.cat)) hard.push(`Day ${d.day}: lunch and dinner repeat ${d.lunch.cat}`);

    const bf = fam(snackCat(d.breakfast));
    for(const snack of [d.morningSnack, d.afternoonSnack]){
      const sc = fam(snackCat(snack));
      if(sc && sc !== "fruit" && sc === bf && ["eggs","dairy","protein_powder"].includes(sc)) hard.push(`Day ${d.day}: ${sc} breakfast and snack same day`);
    }

    const total = [d.breakfast,d.morningSnack,d.lunch,d.afternoonSnack,d.dinner].reduce((sum,m)=>sum+proteinMidpoint(m?.protein),0);
    if(total > 125) hard.push(`Day ${d.day}: protein too high ${total}g`);
    else if(total > 118) warn.push(`Day ${d.day}: protein high ${total}g`);
  }

  const mainCategories = Object.keys(mainCounts).length;
  if(mainCategories >= 4){
    for(const [cat,n] of Object.entries(mainCounts)){
      if(n > 5) hard.push(`${cat} dominates lunch/dinner count ${n}`);
      else if(n > 4) warn.push(`${cat} appears often across lunch/dinner count ${n}`);
    }
  }
  return {hard, warn, mainCounts};
}

const results = [];
let full = [];
scenarios.slice(0,50).forEach((scenario, idx) => {
  const s = clone(scenario);
  s.index = idx + 1;
  const result = engine.generatePlan(s);
  const qa = extraQA(s, result);
  results.push({
    index: s.index,
    name: s.name,
    region: s.region,
    diet: s.diet,
    engineVersion: result.version,
    engineSource: result.engineSource || engine.ENGINE_SOURCE,
    status: result.status,
    engineQA: result.qa?.status || "",
    engineHardCount: result.qa?.hard?.length || 0,
    engineWarnCount: result.qa?.warn?.length || 0,
    extraHardCount: qa.hard.length,
    extraWarnCount: qa.warn.length,
    hard: [...(result.qa?.hard || []), ...qa.hard].join(" | "),
    warn: [...(result.qa?.warn || []), ...qa.warn].join(" | "),
    days: result.days?.length || 0,
    mainCounts: JSON.stringify(qa.mainCounts)
  });
  full.push(renderFullPlan(s, result));
});

fs.writeFileSync("hearty_v341_50_full_generation_results.json", JSON.stringify({engineVersion: engine.VERSION, engineSource: engine.ENGINE_SOURCE, generatedAt: new Date().toISOString(), results}, null, 2));
fs.writeFileSync("hearty_v341_50_full_generation_full_plans.md", full.join("\n"));
console.log(JSON.stringify({
  engineVersion: engine.VERSION,
  engineSource: engine.ENGINE_SOURCE,
  total: results.length,
  hardFailures: results.filter(r => r.engineQA === "FAIL" || r.extraHardCount > 0).length,
  conditionalOrWarn: results.filter(r => r.engineQA === "CONDITIONAL PASS" || r.extraWarnCount > 0).length,
  passClean: results.filter(r => r.engineQA === "PASS" && r.extraHardCount === 0 && r.extraWarnCount === 0).length,
  rows: results
}, null, 2));
