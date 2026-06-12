
const fs = require("fs");
const engine = require("./hearty-meal-engine-final.js");

const baseVegUS = ["spinach","tomato","onion","carrot","zucchini","green beans","mushrooms","peppers","broccoli","cucumber","lettuce","cauliflower","butternut"];
const baseVegSA = ["spinach","tomato","onion","carrot","baby marrow","green beans","mushrooms","peppers","broccoli","cucumber","lettuce","cauliflower","butternut"];
const baseVegUK = ["spinach","tomato","onion","carrot","courgette","green beans","mushrooms","peppers","broccoli","cucumber","lettuce","cauliflower","butternut"];
const baseVeg = {US:baseVegUS, SA:baseVegSA, UK:baseVegUK, AU:baseVegUS, CA:baseVegUS};

const regions = ["US","SA","UK","AU","CA"];
const yKey = r => (r==="US" || r==="CA" ? "yogurt" : "yoghurt");
const jerkyKey = r => (r==="SA" ? "biltong" : "jerky");
const starchSets = [
  ["rice","pasta"],
  ["rice","potato","sweet_potato"],
  ["wrap","couscous","rice"],
  ["pasta","couscous","potato"],
  ["rice","pasta","sweet_potato","wrap"],
  ["rice"],
  ["potato","rice"]
];

function scenarioFor(i) {
  const region = regions[i % regions.length];
  const y = yKey(region);
  const jerky = jerkyKey(region);
  const mode = i % 16;

  let diet = "omnivore";
  let proteins, breakfastItems, snackProteins, exclusions = [], noBreakfast = false, lowerStarch = false;

  if (mode === 0) {
    proteins = ["chicken","beef","fish","eggs","dairy","protein_powder"];
    breakfastItems = ["oats","protein_shake","eggs",y];
    snackProteins = ["chicken_strips","boiled_eggs",y,"tuna",jerky,"protein_shake"];
  } else if (mode === 1) {
    proteins = ["beef","pork","fish","eggs","dairy","protein_powder"];
    breakfastItems = ["oats","protein_shake","eggs",y,"cottage_cheese"];
    snackProteins = ["boiled_eggs",y,"tuna",jerky,"protein_shake","cottage_cheese"];
  } else if (mode === 2) {
    proteins = ["chicken","beef","eggs","dairy","protein_powder"];
    breakfastItems = ["eggs",y,"oats"];
    snackProteins = [y,"boiled_eggs","chicken_strips",jerky];
  } else if (mode === 3) {
    proteins = ["fish","beef","pork","eggs","dairy"];
    breakfastItems = ["eggs",y,"oats"];
    snackProteins = [y,"boiled_eggs","tuna",jerky];
  } else if (mode === 4) {
    diet = "pescatarian";
    proteins = ["fish","eggs","dairy","protein_powder"];
    breakfastItems = ["eggs",y,"protein_shake","oats"];
    snackProteins = [y,"boiled_eggs","tuna","protein_shake"];
  } else if (mode === 5) {
    diet = "vegetarian";
    proteins = ["eggs","dairy","tofu","lentils","beans","chickpeas"];
    breakfastItems = ["eggs",y,"tofu_scramble","hummus_plate"];
    snackProteins = [y,"boiled_eggs","hummus","tofu"];
  } else if (mode === 6) {
    diet = "vegetarian";
    proteins = ["dairy","tofu","lentils","beans","chickpeas","protein_powder"];
    breakfastItems = [y,"protein_shake","tofu_scramble","hummus_plate"];
    snackProteins = [y,"protein_shake","hummus","tofu"];
  } else if (mode === 7) {
    proteins = ["chicken","beef","fish","eggs","dairy"];
    breakfastItems = [];
    snackProteins = [y,"boiled_eggs","tuna",jerky,"chicken_strips"];
    noBreakfast = true;
  } else if (mode === 8) {
    proteins = ["chicken","fish","eggs","dairy","protein_powder"];
    breakfastItems = ["eggs",y,"protein_shake","oats"];
    snackProteins = ["boiled_eggs",y,"tuna","protein_shake","chicken_strips"];
    exclusions = ["no_red_meat"];
  } else if (mode === 9) {
    proteins = ["beef","pork","eggs","dairy","protein_powder"];
    breakfastItems = ["eggs",y,"protein_shake","oats"];
    snackProteins = ["boiled_eggs",y,jerky,"protein_shake"];
    exclusions = ["no_fish"];
  } else if (mode === 10) {
    proteins = ["chicken","beef","fish","dairy","protein_powder"];
    breakfastItems = [y,"protein_shake","oats"];
    snackProteins = [y,"tuna",jerky,"protein_shake","chicken_strips"];
    exclusions = ["no_eggs"];
  } else if (mode === 11) {
    proteins = ["chicken","beef","fish","eggs","protein_powder"];
    breakfastItems = ["eggs","protein_shake"];
    snackProteins = ["boiled_eggs","tuna",jerky,"protein_shake","chicken_strips"];
    exclusions = ["no_dairy"];
  } else if (mode === 12) {
    proteins = ["chicken","beef","fish","eggs","dairy"];
    breakfastItems = ["eggs",y,"oats"];
    snackProteins = [y,"boiled_eggs","tuna",jerky,"chicken_strips"];
    lowerStarch = true;
  } else if (mode === 13) {
    proteins = ["chicken","fish","eggs","dairy","protein_powder"];
    breakfastItems = ["eggs",y,"oats","protein_shake"];
    snackProteins = [y,"boiled_eggs","tuna","protein_shake","chicken_strips"];
  } else if (mode === 14) {
    proteins = ["chicken","beef","eggs","dairy"];
    breakfastItems = ["eggs",y,"oats"];
    snackProteins = [y,"boiled_eggs","chicken_strips",jerky];
  } else {
    diet = "vegetarian";
    proteins = ["eggs","dairy","lentils","beans","chickpeas","protein_powder"];
    breakfastItems = ["eggs",y,"protein_shake","hummus_plate"];
    snackProteins = [y,"boiled_eggs","hummus","protein_shake"];
  }

  return {
    name: `Gate scenario ${i+1} ${region} mode ${mode}`,
    region,
    diet,
    proteins,
    breakfastItems,
    snackProteins,
    starches: lowerStarch ? [] : starchSets[i % starchSets.length],
    vegetables: baseVeg[region].slice(0, 8 + (i % 5)),
    exclusions,
    noBreakfast,
    lowerStarch,
    leftoverLunches: false,
    useLeftovers: false
  };
}

const scenarios = Array.from({length:100}, (_,i) => scenarioFor(i));

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
function snackOptionFamilies(input) {
  return new Set((input.snackProteins || []).map(x => {
    if (x === "chicken_strips") return "chicken";
    if (x === "boiled_eggs") return "eggs";
    if (x === "tuna") return "fish";
    if (x === "jerky" || x === "biltong") return "beef";
    if (x === "yogurt" || x === "yoghurt" || x === "cottage_cheese") return "dairy";
    if (x === "hummus") return "legumes";
    if (x === "protein_shake") return "protein_powder";
    if (x === "tofu") return "tofu";
    return x;
  }));
}
function extraQA(input, result){
  const hard = [];
  const warn = [];
  const warningKeys = [];
  const days = result.days || [];
  const selected = new Set(input.proteins || []);
  const text = JSON.stringify(days).toLowerCase();

  if(result.version !== "3.4.3-release-gate-repair") hard.push("Wrong engine version");
  if(!result.engineSource || !String(result.engineSource).includes("v343-100gen-gate-repair")) hard.push("Missing/incorrect engine source");
  if(result.status !== "ALLOWED") hard.push("Not allowed");
  if(!days || days.length !== 7) hard.push("Not 7 generated days");

  for(const [cat, pattern] of [["chicken","chicken"],["beef","beef"],["pork","pork"],["fish","fish|tuna|white fish|hake|cod"]]){
    if(selected.has(cat)) continue;
    const rx = new RegExp("\\b(" + pattern + ")\\b", "i");
    if(rx.test(text)) hard.push(`${cat} appears but was not selected`);
  }

  if(input.diet === "vegetarian" && /\b(chicken|beef|pork|fish|tuna|hake|cod|jerky|biltong)\b/.test(text)) hard.push("Meat/fish appears in vegetarian");
  if(input.diet === "pescatarian" && /\b(chicken|beef|pork|jerky|biltong)\b/.test(text)) hard.push("Meat/red meat appears in pescatarian");

  if(input.exclusions?.includes("no_dairy") && /yoghurt|yogurt|cottage cheese|cheese|milk/.test(text)) hard.push("Dairy appears despite no_dairy");
  if(input.exclusions?.includes("no_eggs") && /\begg\b|\beggs\b|omelette|frittata/.test(text)) hard.push("Egg appears despite no_eggs");
  if(input.exclusions?.includes("no_red_meat") && /\bbeef\b|\bpork\b|jerky|biltong/.test(text)) hard.push("Red meat appears despite no_red_meat");
  if(input.exclusions?.includes("no_fish") && /\bfish\b|\btuna\b|\bhake\b|\bcod\b/.test(text)) hard.push("Fish appears despite no_fish");

  if(input.region !== "SA" && hasWord(text, "hake")) hard.push("Hake outside SA");
  if((input.region === "US" || input.region === "CA") && (hasWord(text, "yoghurt") || hasWord(text, "biltong") || text.includes("baby marrow"))) hard.push("US/CA wording error");
  if(input.region === "UK" && (hasWord(text, "zucchini") || hasWord(text, "yogurt") || text.includes("baby marrow") || hasWord(text, "biltong") || hasWord(text, "hake"))) hard.push("UK wording error");
  if(input.region === "SA" && (hasWord(text, "zucchini") || hasWord(text, "yogurt") || hasWord(text, "beef jerky") || hasWord(text, "white fish"))) hard.push("SA wording error");

  if(/fish curry|fish stew|fish bolognese|fish stir-fry|selected fish|selected protein|mixed vegetables/.test(text)) hard.push("Bad phrase/template appears");
  if(!input.leftoverLunches && /\bleftover\b|last night|use the leftover|remove the added/.test(text)) hard.push("Forced leftover/remove wording appears");
  if(/and and|and broth and|and stock and/.test(text)) hard.push("Awkward repeated 'and' grammar");

  const mainCounts = {};
  const dailyProteinTotals = [];
  let fruitSnacks = 0;
  for(const d of days){
    for(const cat of [d.lunch?.cat, d.dinner?.cat]) if(cat) mainCounts[cat] = (mainCounts[cat] || 0) + 1;

    if(d.lunch?.cat && d.dinner?.cat && fam(d.lunch.cat) === fam(d.dinner.cat)) hard.push(`Day ${d.day}: lunch and dinner repeat ${d.lunch.cat}`);

    const bf = fam(snackCat(d.breakfast));
    const snackCats = [snackCat(d.morningSnack), snackCat(d.afternoonSnack)].map(fam);
    const main = new Set([fam(d.lunch?.cat), fam(d.dinner?.cat)].filter(Boolean));
    const snackOptions = snackOptionFamilies(input);

    for(const sc of snackCats){
      if(sc === "fruit") fruitSnacks++;
      if(sc && sc !== "fruit" && sc === bf && ["eggs","dairy","protein_powder"].includes(sc)) hard.push(`Day ${d.day}: ${sc} breakfast and snack same day`);

      const alternatives = [...snackOptions].filter(x => !main.has(x) && x !== bf);
      if(sc && sc !== "fruit" && main.has(sc) && alternatives.length >= 2) {
        warn.push(`Day ${d.day}: ${sc} snack matches lunch/dinner despite alternatives`);
        warningKeys.push("snack_main_repeat");
      }
    }

    const total = [d.breakfast,d.morningSnack,d.lunch,d.afternoonSnack,d.dinner].reduce((sum,m)=>sum+proteinMidpoint(m?.protein),0);
    dailyProteinTotals.push(total);
    if(total > 125) hard.push(`Day ${d.day}: protein too high ${total}g`);
    else if(total > 118) { warn.push(`Day ${d.day}: protein high ${total}g`); warningKeys.push("protein_high"); }
    if(total < 70 && !input.noBreakfast && input.diet !== "vegetarian") hard.push(`Day ${d.day}: protein too low ${total}g`);
  }

  if(fruitSnacks > 2) hard.push(`More than 2 fruit snacks: ${fruitSnacks}`);

  const mainCategories = Object.keys(mainCounts).length;
  if(mainCategories >= 4){
    for(const [cat,n] of Object.entries(mainCounts)){
      const limit = cat === "pork" ? 3 : 4;
      if(n > limit + 1) hard.push(`${cat} dominates lunch/dinner count ${n}`);
      else if(n > limit) { warn.push(`${cat} appears often across lunch/dinner count ${n}`); warningKeys.push(`main_${cat}_often`); }
    }
  } else if(mainCategories === 3) {
    for(const [cat,n] of Object.entries(mainCounts)){
      if(n > 5) hard.push(`${cat} dominates narrow plan lunch/dinner count ${n}`);
      else if(n === 5) { warn.push(`${cat} appears 5 times in narrow plan`); warningKeys.push(`narrow_${cat}_5`); }
    }
  }

  const inTarget = dailyProteinTotals.filter(x => x >= 80 && x <= 120).length;
  return {hard, warn, warningKeys, mainCounts, dailyProteinTotals, inTargetDays: inTarget};
}
function renderFullPlan(s, result){
  const lines = [];
  lines.push(`# ${s.index}. ${s.name}`,"");
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
      lines.push(`Basic method: ${meal.detail}`,"");
    }
    lines.push(`Estimated daily protein: approx. ${total}g`,"");
  }
  lines.push("---","");
  return lines.join("\n");
}

const results = [];
const full = [];
let allWarningKeys = [];
let totalTargetDays = 0;
let totalDays = 0;

scenarios.forEach((scenario, idx) => {
  const s = JSON.parse(JSON.stringify(scenario));
  s.index = idx + 1;
  const result = engine.generatePlan(s);
  const qa = extraQA(s, result);
  allWarningKeys = allWarningKeys.concat(qa.warningKeys);
  totalTargetDays += qa.inTargetDays;
  totalDays += result.days?.length || 0;
  results.push({
    index:s.index,
    name:s.name,
    region:s.region,
    diet:s.diet,
    engineVersion:result.version,
    engineSource:result.engineSource || engine.ENGINE_SOURCE,
    status:result.status,
    engineQA:result.qa?.status || "",
    engineHardCount:result.qa?.hard?.length || 0,
    engineWarnCount:result.qa?.warn?.length || 0,
    extraHardCount:qa.hard.length,
    extraWarnCount:qa.warn.length,
    hard:[...(result.qa?.hard || []), ...qa.hard].join(" | "),
    warn:[...(result.qa?.warn || []), ...qa.warn].join(" | "),
    warningKeys:qa.warningKeys.join("|"),
    days:result.days?.length || 0,
    targetDays:qa.inTargetDays,
    mainCounts:JSON.stringify(qa.mainCounts),
    proteinTotals:JSON.stringify(qa.dailyProteinTotals)
  });
  full.push(renderFullPlan(s, result));
});

const hardRows = results.filter(r => r.engineQA === "FAIL" || r.extraHardCount > 0);
const warningRows = results.filter(r => (r.engineQA === "CONDITIONAL PASS" || r.extraWarnCount > 0) && !hardRows.includes(r));
const cleanRows = results.filter(r => !hardRows.includes(r) && !warningRows.includes(r));
const warningKeyCounts = allWarningKeys.reduce((a,k)=>{a[k]=(a[k]||0)+1; return a;}, {});
const proteinTargetPct = totalDays ? Math.round((totalTargetDays / totalDays) * 1000) / 10 : 0;

const gate = {
  version: engine.VERSION,
  source: engine.ENGINE_SOURCE,
  totalPlans: results.length,
  totalDays,
  hardFailures: hardRows.length,
  warningRows: warningRows.length,
  cleanRows: cleanRows.length,
  warningPercent: Math.round((warningRows.length / results.length) * 1000) / 10,
  warningKeyCounts,
  proteinTargetPct,
  pass:
    results.length === 100 &&
    totalDays === 700 &&
    hardRows.length === 0 &&
    warningRows.length < 30 &&
    Object.values(warningKeyCounts).every(n => n <= 10) &&
    proteinTargetPct >= 85
};

fs.writeFileSync("hearty_v343_100_gate_results.json", JSON.stringify({gate, results}, null, 2));
fs.writeFileSync("hearty_v343_100_gate_full_plans.md", full.join("\n"));
console.log(JSON.stringify({gate, hardRows: hardRows.slice(0,10), warningRows: warningRows.slice(0,10)}, null, 2));
if(!gate.pass) process.exit(2);
