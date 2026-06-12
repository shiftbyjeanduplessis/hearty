
const fs = require("fs");
const engine = require("./hearty-meal-engine-final.js");

const REGIONS = ["US","UK","SA","AU","CA"];

const VEG = {
  US:["cauliflower","zucchini","mushrooms","green beans","butternut","lettuce","cabbage","peppers","spinach","carrot","tomato","cucumber","broccoli","onion"],
  UK:["cauliflower","courgette","mushrooms","green beans","butternut","lettuce","cabbage","peppers","spinach","carrot","tomato","cucumber","broccoli","onion"],
  SA:["cauliflower","baby marrow","mushrooms","green beans","butternut","lettuce","cabbage","peppers","spinach","carrot","tomato","cucumber","broccoli","onion"],
  AU:["cauliflower","zucchini","mushrooms","green beans","butternut","lettuce","cabbage","peppers","spinach","carrot","tomato","cucumber","broccoli","onion"],
  CA:["cauliflower","zucchini","mushrooms","green beans","butternut","lettuce","cabbage","peppers","spinach","carrot","tomato","cucumber","broccoli","onion"]
};

const y = r => (r === "US" || r === "CA" ? "yogurt" : "yoghurt");
const jerky = r => r === "SA" ? "biltong" : "jerky";

function scenario(i) {
  const region = REGIONS[(i * 3 + 1) % REGIONS.length];
  const yoghurt = y(region);
  const dried = jerky(region);
  const mode = i % 25;

  const common = {
    name:`Fresh v349 100-gen scenario ${i+1} mode ${mode} ${region}`,
    region,
    vegetables: VEG[region].slice(0, 9 + (i % 6)),
    starches: [
      ["rice","pasta","sweet_potato"],
      ["rice","potato"],
      ["wrap","couscous","rice"],
      ["sweet_potato","rice","pasta"],
      ["pasta","potato","couscous"]
    ][i % 5],
    exclusions: [],
    lowerStarch: false,
    noBreakfast: false,
    leftoverLunches: false,
    useLeftovers: false
  };

  const cases = [
    // Broad omnivore, all likely issues included.
    {diet:"omnivore", proteins:["chicken","beef","pork","fish","eggs","dairy","protein_powder"], breakfastItems:["eggs",yoghurt,"oats","protein_shake","cottage_cheese"], snackProteins:[yoghurt,"boiled_eggs","tuna",dried,"protein_shake","chicken_strips"]},

    // No chicken.
    {diet:"omnivore", proteins:["beef","pork","fish","eggs","dairy","protein_powder"], breakfastItems:["eggs",yoghurt,"oats","protein_shake"], snackProteins:[yoghurt,"boiled_eggs","tuna",dried,"protein_shake"]},

    // No red meat.
    {diet:"omnivore", proteins:["chicken","fish","eggs","dairy","protein_powder"], breakfastItems:["eggs",yoghurt,"oats","protein_shake"], snackProteins:[yoghurt,"boiled_eggs","tuna","protein_shake","chicken_strips"], exclusions:["no_red_meat"]},

    // No fish.
    {diet:"omnivore", proteins:["chicken","beef","pork","eggs","dairy","protein_powder"], breakfastItems:["eggs",yoghurt,"oats","protein_shake"], snackProteins:[yoghurt,"boiled_eggs",dried,"protein_shake","chicken_strips"], exclusions:["no_fish"]},

    // No eggs.
    {diet:"omnivore", proteins:["chicken","beef","fish","dairy","protein_powder"], breakfastItems:[yoghurt,"oats","protein_shake"], snackProteins:[yoghurt,"tuna",dried,"protein_shake","chicken_strips"], exclusions:["no_eggs"]},

    // No dairy.
    {diet:"omnivore", proteins:["chicken","beef","fish","eggs","protein_powder"], breakfastItems:["eggs","protein_shake"], snackProteins:["boiled_eggs","tuna",dried,"protein_shake","chicken_strips"], exclusions:["no_dairy"]},

    // Pescatarian with powder.
    {diet:"pescatarian", proteins:["fish","eggs","dairy","protein_powder"], breakfastItems:["eggs",yoghurt,"oats","protein_shake"], snackProteins:[yoghurt,"boiled_eggs","tuna","protein_shake"]},

    // Pescatarian without shake breakfast, but shake snack.
    {diet:"pescatarian", proteins:["fish","eggs","dairy","protein_powder"], breakfastItems:["eggs",yoghurt,"oats"], snackProteins:[yoghurt,"boiled_eggs","tuna","protein_shake"]},

    // Vegetarian broad.
    {diet:"vegetarian", proteins:["eggs","dairy","tofu","lentils","beans","chickpeas"], breakfastItems:["eggs",yoghurt,"tofu_scramble","hummus_plate","cottage_cheese"], snackProteins:[yoghurt,"boiled_eggs","hummus","tofu"]},

    // Vegetarian no eggs.
    {diet:"vegetarian", proteins:["dairy","tofu","lentils","beans","chickpeas","protein_powder"], breakfastItems:[yoghurt,"protein_shake","tofu_scramble","hummus_plate"], snackProteins:[yoghurt,"protein_shake","hummus","tofu"], exclusions:["no_eggs"]},

    // Vegetarian no dairy.
    {diet:"vegetarian", proteins:["eggs","tofu","lentils","beans","chickpeas","protein_powder"], breakfastItems:["eggs","protein_shake","tofu_scramble","hummus_plate"], snackProteins:["boiled_eggs","protein_shake","hummus","tofu"], exclusions:["no_dairy"]},

    // Vegetarian no eggs/dairy.
    {diet:"vegetarian", proteins:["tofu","lentils","beans","chickpeas","protein_powder"], breakfastItems:["protein_shake","tofu_scramble","hummus_plate"], snackProteins:["protein_shake","hummus","tofu"], exclusions:["no_eggs","no_dairy"]},

    // Lower starch broad.
    {diet:"omnivore", proteins:["chicken","beef","fish","eggs","dairy","protein_powder"], breakfastItems:["eggs",yoghurt,"oats","protein_shake"], snackProteins:[yoghurt,"boiled_eggs","tuna",dried,"protein_shake","chicken_strips"], lowerStarch:true, starches:[]},

    // No breakfast.
    {diet:"omnivore", proteins:["chicken","beef","fish","eggs","dairy"], breakfastItems:[], snackProteins:[yoghurt,"boiled_eggs","tuna",dried,"chicken_strips"], noBreakfast:true},

    // Chicken/beef/eggs/dairy narrowish but valid.
    {diet:"omnivore", proteins:["chicken","beef","eggs","dairy","protein_powder"], breakfastItems:["eggs",yoghurt,"oats","cottage_cheese"], snackProteins:[yoghurt,"boiled_eggs",dried,"chicken_strips","protein_shake"]},

    // Fish/beef/pork/eggs/dairy, no chicken.
    {diet:"omnivore", proteins:["fish","beef","pork","eggs","dairy"], breakfastItems:["eggs",yoghurt,"oats"], snackProteins:[yoghurt,"boiled_eggs","tuna",dried]},

    // Fish/chicken/dairy/protein powder, no eggs/red meat.
    {diet:"omnivore", proteins:["chicken","fish","dairy","protein_powder"], breakfastItems:[yoghurt,"oats","protein_shake"], snackProteins:[yoghurt,"tuna","protein_shake","chicken_strips"], exclusions:["no_eggs","no_red_meat"]},

    // High cold-plate likelihood.
    {diet:"omnivore", proteins:["chicken","fish","eggs","dairy","protein_powder"], breakfastItems:["eggs",yoghurt,"cottage_cheese"], snackProteins:[yoghurt,"boiled_eggs","tuna","protein_shake","chicken_strips"]},

    // High cooked-meal veg stress.
    {diet:"omnivore", proteins:["chicken","beef","pork","fish","eggs","dairy"], breakfastItems:["eggs",yoghurt,"oats"], snackProteins:[yoghurt,"boiled_eggs","tuna",dried,"chicken_strips"]},

    // Starch plus fish cake stress.
    {diet:"omnivore", proteins:["fish","chicken","beef","eggs","dairy","protein_powder"], breakfastItems:["eggs",yoghurt,"protein_shake"], snackProteins:[yoghurt,"boiled_eggs","tuna",dried,"protein_shake"]},

    // Dairy breakfast + dairy lunch avoidance stress.
    {diet:"omnivore", proteins:["chicken","beef","fish","eggs","dairy","protein_powder"], breakfastItems:[yoghurt,"cottage_cheese","oats"], snackProteins:[yoghurt,"boiled_eggs","tuna",dried,"protein_shake"]},

    // Region wording stress.
    {diet:"omnivore", proteins:["chicken","beef","fish","eggs","dairy"], breakfastItems:["eggs",yoghurt,"oats"], snackProteins:[yoghurt,"boiled_eggs","tuna",dried,"chicken_strips"]},

    // Vegetarian tofu/legumes without eggs/dairy but robust snacks.
    {diet:"vegetarian", proteins:["tofu","lentils","beans","chickpeas","protein_powder"], breakfastItems:["protein_shake","tofu_scramble","hummus_plate"], snackProteins:["protein_shake","hummus","tofu"], exclusions:["no_eggs","no_dairy"]},

    // Broad omnivore but no protein powder.
    {diet:"omnivore", proteins:["chicken","beef","pork","fish","eggs","dairy"], breakfastItems:["eggs",yoghurt,"oats","cottage_cheese"], snackProteins:[yoghurt,"boiled_eggs","tuna",dried,"chicken_strips"]},

    // Broad omnivore with lower-starch and cottage cheese.
    {diet:"omnivore", proteins:["chicken","beef","pork","fish","eggs","dairy","protein_powder"], breakfastItems:["eggs",yoghurt,"oats","protein_shake","cottage_cheese"], snackProteins:[yoghurt,"boiled_eggs","tuna",dried,"protein_shake","chicken_strips"], lowerStarch:true, starches:[]},
  ];

  return {...common, ...cases[mode], name:common.name};
}

function mealText(meal){ return `${meal?.name || ""} ${meal?.detail || ""}`.toLowerCase(); }
function allText(days){ return JSON.stringify(days || []).toLowerCase(); }
function hasWord(text, word){
  const escaped = String(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp("\\b" + escaped + "\\b", "i").test(text);
}
function hasAnyWord(text, words){ return words.some(w => hasWord(text, w)); }
function proteinMidpoint(value){
  const nums = String(value || "").match(/\d+/g)?.map(Number) || [];
  if(!nums.length) return 0;
  return nums.length >= 2 ? Math.round((nums[0]+nums[1])/2) : nums[0];
}
function classifyMeal(meal){
  const t = mealText(meal);
  if (/yoghurt|yogurt|cottage cheese/.test(t)) return "dairy";
  if (hasAnyWord(t, ["egg","eggs"]) || /omelette|frittata/.test(t)) return "eggs";
  if (hasWord(t,"chicken")) return "chicken";
  if (hasAnyWord(t,["tuna","fish","hake","cod"])) return "fish";
  if (hasWord(t,"beef") || hasWord(t,"jerky") || hasWord(t,"biltong")) return "beef";
  if (hasWord(t,"pork")) return "pork";
  if (/protein shake/.test(t)) return "protein_powder";
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
function count(arr){ return arr.reduce((a,x)=>{a[x]=(a[x]||0)+1; return a;},{}); }

function qaScenario(input, result){
  const hard = [], warn = [], weird = [];
  const days = result.days || [];
  const text = allText(days);
  const selected = new Set(input.proteins || []);
  const exclusions = new Set(input.exclusions || []);

  if(result.version !== "3.4.9-lunch-variety-polish") hard.push("wrong engine version");
  if(!String(result.engineSource || "").includes("v349-lunch-variety-polish")) hard.push("wrong/missing engine source");
  if(result.status !== "ALLOWED") hard.push("engine blocked valid scenario");
  if(days.length !== 7) hard.push("not 7 days");

  const leakageChecks = [
    ["chicken", ["chicken"]],
    ["beef", ["beef","jerky","biltong"]],
    ["pork", ["pork"]],
    ["fish", ["fish","tuna","hake","cod"]],
    ["eggs", ["egg","eggs"]],
    ["tofu", ["tofu"]]
  ];
  for(const [cat, words] of leakageChecks){
    if(!selected.has(cat) && hasAnyWord(text, words)) hard.push(`${cat} appears but was not selected`);
  }
  if(!selected.has("dairy") && /yoghurt|yogurt|cottage cheese/.test(text)) hard.push("dairy appears but was not selected");
  if(!selected.has("protein_powder") && /protein shake/.test(text)) hard.push("protein powder appears but was not selected");

  if(exclusions.has("no_eggs") && (hasAnyWord(text,["egg","eggs"]) || /omelette|frittata/.test(text))) hard.push("egg appears despite no_eggs");
  if(exclusions.has("no_dairy") && /yoghurt|yogurt|cottage cheese/.test(text)) hard.push("dairy appears despite no_dairy");
  if(exclusions.has("no_red_meat") && (hasAnyWord(text,["beef","pork","jerky","biltong"]))) hard.push("red meat appears despite no_red_meat");
  if(exclusions.has("no_fish") && hasAnyWord(text,["fish","tuna","hake","cod"])) hard.push("fish appears despite no_fish");

  if(input.diet === "vegetarian" && hasAnyWord(text,["chicken","beef","pork","fish","tuna","hake","cod","jerky","biltong"])) hard.push("meat/fish appears in vegetarian");
  if(input.diet === "pescatarian" && hasAnyWord(text,["chicken","beef","pork","jerky","biltong"])) hard.push("meat/red meat appears in pescatarian");

  // Country wording
  if(input.region !== "SA" && hasWord(text, "hake")) hard.push("hake outside SA");
  if((input.region === "US" || input.region === "CA") && (hasWord(text,"yoghurt") || hasWord(text,"biltong") || text.includes("baby marrow") || hasWord(text,"stock"))) hard.push("US/CA country wording error");
  if(input.region === "SA" && (hasWord(text,"yogurt") || hasWord(text,"zucchini") || text.includes("white fish") || hasWord(text,"jerky") || hasWord(text,"broth"))) hard.push("SA country wording error");
  if(input.region === "UK" && (hasWord(text,"zucchini") || hasWord(text,"yogurt") || text.includes("baby marrow") || hasWord(text,"biltong") || hasWord(text,"hake") || hasWord(text,"broth"))) hard.push("UK country wording error");
  if(input.region === "AU" && (hasWord(text,"yogurt") || hasWord(text,"hake") || hasWord(text,"biltong") || text.includes("baby marrow") || hasWord(text,"broth"))) hard.push("AU country wording error");

  const badPhrases = ["fish curry","fish stew","fish bolognese","fish stir-fry","selected fish","selected protein","mixed vegetables","remove the rice","remove the pasta","remove the potato","last night","use the leftover","and and","undefined","null"];
  for(const phrase of badPhrases) if(text.includes(phrase)) hard.push(`bad phrase: ${phrase}`);

  const badFishCombos = /\b(fish|tuna|hake|cod)\b.{0,45}\b(curry|stew|bolognese|stir-fry|mince)\b|\b(curry|stew|bolognese|stir-fry|mince)\b.{0,45}\b(fish|tuna|hake|cod)\b/;
  if(badFishCombos.test(text)) hard.push("bad fish combination detected");

  const hotDinner = /soup|stew|stir-fry|curry|bolognese|chilli|frittata|bake|baked|grilled|fish cakes|fish plate|lemon-herb plate/;
  const coldLunch = /cottage cheese protein plate|cucumber plate|tuna cucumber bowl|boiled egg vegetable plate|tofu vegetable bowl|chickpea vegetable bowl/;
  const coldBadVeg = /cauliflower|green beans|mushrooms|zucchini|courgette|baby marrow|butternut|cabbage|broccoli/;

  const lunchNames = new Set(), dinnerNames = new Set(), lunchCats=[], dinnerCats=[], totals=[];
  let fruitSnacks = 0;

  for(const d of days){
    const b = mealText(d.breakfast);
    const lunch = mealText(d.lunch);
    const dinner = mealText(d.dinner);

    if(!input.noBreakfast && hasAnyWord(b,["chicken","beef","pork","fish","tuna","hake","cod"])) hard.push(`Day ${d.day}: meat/fish breakfast`);
    if(/omelette|scrambled|tofu scramble/.test(b) && /green beans|butternut|lettuce|cabbage|cauliflower|broccoli/.test(b)) hard.push(`Day ${d.day}: bad breakfast veg`);
    if(/frittata/.test(dinner) && /green beans|butternut|lettuce|cabbage|cauliflower|broccoli/.test(dinner)) hard.push(`Day ${d.day}: bad frittata veg`);
    if(/tofu scramble/.test(b) && !(input.breakfastItems || []).includes("tofu_scramble")) hard.push(`Day ${d.day}: tofu breakfast not selected`);
    if(/hummus breakfast/.test(b) && !(input.breakfastItems || []).includes("hummus_plate")) hard.push(`Day ${d.day}: hummus breakfast not selected`);

    if(hotDinner.test(dinner) && (hasWord(dinner,"lettuce") || hasWord(dinner,"cucumber"))) hard.push(`Day ${d.day}: raw veg in cooked dinner`);
    if(/soup|stew|chilli|simmered|cooked with/.test(lunch) && !/served with cucumber|cucumber plate|tuna cucumber|boiled egg vegetable plate|cottage cheese protein plate|tofu vegetable bowl|chickpea vegetable bowl/.test(lunch) && (hasWord(lunch,"lettuce") || hasWord(lunch,"cucumber"))) hard.push(`Day ${d.day}: raw veg in cooked lunch`);
    if(coldLunch.test(lunch) && coldBadVeg.test(lunch)) hard.push(`Day ${d.day}: hot-style veg in cold lunch`);
    if(/cucumber, tomato, lettuce and (cucumber|tomato|lettuce)/.test(lunch)) hard.push(`Day ${d.day}: duplicated cold plate base veg`);
    if(/cottage cheese breakfast/.test(b) && /cottage cheese protein plate/.test(lunch)) hard.push(`Day ${d.day}: cottage cheese breakfast and lunch`);

    lunchNames.add(d.lunch?.name?.toLowerCase() || "");
    dinnerNames.add(d.dinner?.name?.toLowerCase() || "");
    lunchCats.push(fam(d.lunch?.cat));
    dinnerCats.push(fam(d.dinner?.cat));

    if(fam(d.lunch?.cat) && fam(d.lunch?.cat) === fam(d.dinner?.cat)) hard.push(`Day ${d.day}: same lunch/dinner protein ${d.lunch.cat}`);

    for(const snack of [d.morningSnack,d.afternoonSnack]) {
      if(classifyMeal(snack) === "fruit") fruitSnacks++;
    }

    const total = [d.breakfast,d.morningSnack,d.lunch,d.afternoonSnack,d.dinner].reduce((sum,m)=>sum+proteinMidpoint(m?.protein),0);
    totals.push(total);
    if(total > 125) hard.push(`Day ${d.day}: protein too high ${total}`);
    if(total < 70 && !input.noBreakfast && input.diet !== "vegetarian") hard.push(`Day ${d.day}: protein too low ${total}`);
    if(total > 118) warn.push(`Day ${d.day}: protein high ${total}`);
  }

  if(fruitSnacks > 2) hard.push(`too many fruit snacks ${fruitSnacks}`);
  if(lunchNames.size < 4) weird.push(`low lunch template variety ${lunchNames.size}`);
  if(dinnerNames.size < 4) weird.push(`low dinner template variety ${dinnerNames.size}`);

  const mainCounts = count([...lunchCats, ...dinnerCats].filter(Boolean));
  const nonDairyMainCounts = {...mainCounts};
  delete nonDairyMainCounts.dairy;
  const mainCatCount = Object.keys(nonDairyMainCounts).length;
  if(mainCatCount >= 4){
    for(const [cat,n] of Object.entries(nonDairyMainCounts)){
      const limit = cat === "pork" ? 3 : 4;
      if(n > limit + 1) hard.push(`${cat} excessive main count ${n}`);
      else if(n > limit) warn.push(`${cat} slightly high main count ${n}`);
    }
  } else if(mainCatCount === 3){
    for(const [cat,n] of Object.entries(nonDairyMainCounts)){
      if(n > 5) hard.push(`${cat} excessive narrow main count ${n}`);
      else if(n === 5) warn.push(`${cat} high narrow main count ${n}`);
    }
  }

  const targetDays = totals.filter(x => x >= 80 && x <= 120).length;
  return {hard, warn, weird, mainCounts, totals, targetDays};
}

function renderPlan(s,result){
  const lines = [`# ${s.index}. ${s.name}`, "", `Engine: ${result.version}`, `Source: ${result.engineSource}`, `Region: ${s.region}`, `Diet: ${s.diet}`, `Status: ${result.status}`, `Engine QA: ${result.qa?.status}`, ""];
  for(const d of result.days || []){
    const total = [d.breakfast,d.morningSnack,d.lunch,d.afternoonSnack,d.dinner].reduce((sum,m)=>sum+proteinMidpoint(m?.protein),0);
    lines.push(`## Day ${d.day}`);
    for(const [label, m] of [["Breakfast",d.breakfast],["Morning snack",d.morningSnack],["Lunch",d.lunch],["Afternoon snack",d.afternoonSnack],["Dinner",d.dinner]]){
      lines.push(`**${label}**`, `${m.name} Approx. ${m.protein} protein`, `Basic method: ${m.detail}`, "");
    }
    lines.push(`Estimated daily protein: approx. ${total}g`, "");
  }
  lines.push("---", "");
  return lines.join("\n");
}

const results = [];
const fullPlans = [];
let totalTargetDays = 0, totalDays = 0;

for(let i=0;i<100;i++){
  const s = scenario(i);
  s.index = i+1;
  const result = engine.generatePlan(s);
  const qa = qaScenario(s, result);
  const hardCombined = [...(result.qa?.hard || []), ...qa.hard];
  const warnCombined = [...(result.qa?.warn || []), ...qa.warn];
  const weirdCombined = qa.weird;
  totalTargetDays += qa.targetDays;
  totalDays += result.days?.length || 0;
  results.push({
    index:s.index,
    name:s.name,
    region:s.region,
    diet:s.diet,
    selectedProteins:(s.proteins||[]).join("|"),
    exclusions:(s.exclusions||[]).join("|"),
    status:result.status,
    engineQA:result.qa?.status || "",
    hardCount:hardCombined.length,
    warnCount:warnCombined.length,
    weirdCount:weirdCombined.length,
    hard:hardCombined.join(" | "),
    warn:warnCombined.join(" | "),
    weird:weirdCombined.join(" | "),
    days:result.days?.length || 0,
    targetDays:qa.targetDays,
    mainCounts:JSON.stringify(qa.mainCounts),
    proteinTotals:JSON.stringify(qa.totals)
  });
  fullPlans.push(renderPlan(s, result));
}

const hardRows = results.filter(r => r.hardCount > 0 || r.engineQA === "FAIL");
const weirdRows = results.filter(r => r.weirdCount > 0 && !hardRows.includes(r));
const warnRows = results.filter(r => r.warnCount > 0 && !hardRows.includes(r));
const cleanRows = results.filter(r => !hardRows.includes(r) && r.warnCount === 0 && r.weirdCount === 0);
const proteinTargetPct = totalDays ? Math.round((totalTargetDays/totalDays)*1000)/10 : 0;

const weirdPhraseCounts = {};
for(const r of results){
  if(!r.weird) continue;
  for(const item of r.weird.split(" | ").filter(Boolean)){
    const key = item.replace(/^Day \d+: /,"").replace(/\d+/g,"#");
    weirdPhraseCounts[key] = (weirdPhraseCounts[key] || 0) + 1;
  }
}

const gate = {
  version: engine.VERSION,
  source: engine.ENGINE_SOURCE,
  totalPlans: results.length,
  totalDays,
  hardFailures: hardRows.length,
  warningRows: warnRows.length,
  weirdRows: weirdRows.length,
  cleanRows: cleanRows.length,
  proteinTargetPct,
  weirdPhraseCounts,
  pass:
    results.length === 100 &&
    totalDays === 700 &&
    hardRows.length === 0 &&
    proteinTargetPct >= 85 &&
    Object.values(weirdPhraseCounts).every(n => n <= 20)
};

fs.writeFileSync("hearty_v349_fresh_100_generation_results.json", JSON.stringify({gate, results}, null, 2));
fs.writeFileSync("hearty_v349_fresh_100_generation_full_plans.md", fullPlans.join("\n"));
console.log(JSON.stringify({gate, hardRows:hardRows.slice(0,20), weirdRows:weirdRows.slice(0,20), warnRows:warnRows.slice(0,20)}, null, 2));
if(!gate.pass) process.exit(2);
