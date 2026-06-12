
const engine = require("../hearty-meal-engine-final.js");

const REGION_RULES = {
  SA: {
    label: "South Africa",
    mustUse: { yoghurt: "yoghurt", marrow: "baby marrow", mince: "lean beef mince", stock: "stock", dried: "biltong", fish: "hake" },
    bannedWords: ["yogurt", "zucchini", "courgette", "ground beef", "broth", "beef jerky", "cod", "white fish", "clementine"],
    allowedFishDinner: ["hake"],
    bannedFishDinner: ["cod", "white fish", "tilapia", "haddock", "salmon"]
  },
  US: {
    label: "United States",
    mustUse: { yoghurt: "yogurt", marrow: "zucchini", mince: "lean ground beef", stock: "broth", dried: "beef jerky", fish: "white fish" },
    bannedWords: ["yoghurt", "baby marrow", "courgette", "lean beef mince", "biltong", "hake", "naartjie"],
    allowedFishDinner: ["white fish", "cod", "tilapia"],
    bannedFishDinner: ["hake", "haddock"]
  },
  UK: {
    label: "United Kingdom",
    mustUse: { yoghurt: "yoghurt", marrow: "courgette", mince: "lean beef mince", stock: "stock", dried: "lean cooked meat strips", fish: "cod" },
    bannedWords: ["yogurt", "zucchini", "baby marrow", "ground beef", "broth", "biltong", "beef jerky", "hake", "naartjie"],
    allowedFishDinner: ["cod", "haddock", "white fish"],
    bannedFishDinner: ["hake", "tilapia"]
  },
  AU: {
    label: "Australia",
    mustUse: { yoghurt: "yoghurt", marrow: "zucchini", mince: "lean beef mince", stock: "stock", dried: "lean beef jerky", fish: "white fish" },
    bannedWords: ["baby marrow", "courgette", "ground beef", "broth", "biltong", "hake", "clementine"],
    allowedFishDinner: ["white fish"],
    bannedFishDinner: ["hake", "cod", "tilapia", "haddock"]
  },
  CA: {
    label: "Canada",
    mustUse: { yoghurt: "yogurt", marrow: "zucchini", mince: "lean ground beef", stock: "broth", dried: "beef jerky", fish: "white fish" },
    bannedWords: ["yoghurt", "baby marrow", "courgette", "lean beef mince", "stock", "biltong", "hake", "naartjie"],
    allowedFishDinner: ["white fish", "cod"],
    bannedFishDinner: ["hake", "tilapia", "haddock"]
  }
};

const BANNED_FISH_TEMPLATES = [
  "fish curry", "hake curry", "cod curry", "white fish curry", "tuna curry", "salmon curry",
  "fish stew", "tomato fish stew", "hake stew", "cod stew", "white fish stew",
  "fish bolognese", "fish stir-fry", "fish mince", "selected fish"
];

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

// 50 cases: force fish, country wording, snack, breakfast and lunch coverage.
for (const region of regions) {
  add(`${region} fish omnivore high variety`, {
    region, diet:"omnivore",
    proteins:["chicken","beef","fish","eggs","dairy"],
    vegetables:vegByRegion[region],
    breakfastItems:["eggs", yog(region), "oats"],
    snackProteins:[yog(region),"boiled_eggs","tuna","chicken_strips"],
    starches:["rice","pasta","sweet_potato"],
    leftoverLunches:false, useLeftovers:false
  });

  add(`${region} pescatarian fish focused`, {
    region, diet:"pescatarian",
    proteins:["fish","eggs","dairy","lentils"],
    vegetables:vegByRegion[region],
    breakfastItems:["eggs", yog(region)],
    snackProteins:["tuna","boiled_eggs",yog(region)],
    starches:["rice","sweet_potato"],
    leftoverLunches:false, useLeftovers:false
  });

  add(`${region} fish no dairy`, {
    region, diet:"pescatarian",
    proteins:["fish","eggs","lentils","beans"],
    vegetables:vegByRegion[region],
    breakfastItems:["eggs"],
    snackProteins:["tuna","boiled_eggs","hummus"],
    starches:["rice"],
    exclusions:["no_dairy"],
    leftoverLunches:false, useLeftovers:false
  });

  add(`${region} fish lower starch`, {
    region, diet:"pescatarian",
    proteins:["fish","eggs","lentils","protein_powder"],
    vegetables:vegByRegion[region],
    breakfastItems:["eggs","protein_shake"],
    snackProteins:["tuna","boiled_eggs","protein_shake"],
    starches:[],
    lowerStarch:true,
    leftoverLunches:false, useLeftovers:false
  });

  add(`${region} no fish country wording standard`, {
    region, diet:"omnivore",
    proteins:["chicken","beef","eggs","dairy"],
    vegetables:vegByRegion[region],
    breakfastItems:["eggs",yog(region),"cottage_cheese"],
    snackProteins:[yog(region),"boiled_eggs","chicken_strips"],
    starches:["rice","pasta"],
    leftoverLunches:false, useLeftovers:false
  });

  add(`${region} no breakfast country wording`, {
    region, diet:"omnivore",
    proteins:["chicken","beef","eggs","dairy"],
    vegetables:vegByRegion[region],
    breakfastItems:[],
    snackProteins:[yog(region),"boiled_eggs","chicken_strips"],
    starches:["rice"],
    noBreakfast:true,
    leftoverLunches:false, useLeftovers:false
  });

  add(`${region} vegetarian country wording`, {
    region, diet:"vegetarian",
    proteins:["eggs","dairy","tofu","lentils"],
    vegetables:vegByRegion[region],
    breakfastItems:["eggs",yog(region),"cottage_cheese"],
    snackProteins:[yog(region),"boiled_eggs","tofu_bites"],
    starches:["rice","pasta"],
    leftoverLunches:false, useLeftovers:false
  });

  add(`${region} vegetarian no dairy no eggs`, {
    region, diet:"vegetarian",
    proteins:["tofu","lentils","beans","chickpeas"],
    vegetables:vegByRegion[region],
    breakfastItems:["tofu_scramble"],
    snackProteins:["tofu_bites","hummus"],
    starches:["rice","sweet_potato"],
    exclusions:["no_dairy","no_eggs"],
    leftoverLunches:false, useLeftovers:false
  });

  add(`${region} vegetarian hummus breakfast`, {
    region, diet:"vegetarian",
    proteins:["tofu","lentils","beans","chickpeas"],
    vegetables:vegByRegion[region],
    breakfastItems:["hummus_plate","tofu_scramble"],
    snackProteins:["tofu_bites","hummus"],
    starches:["rice"],
    leftoverLunches:false, useLeftovers:false
  });

  add(`${region} red meat snack country wording`, {
    region, diet:"omnivore",
    proteins:["chicken","beef","eggs","dairy"],
    vegetables:vegByRegion[region],
    breakfastItems:["eggs",yog(region)],
    snackProteins:[yog(region),"boiled_eggs", region === "SA" ? "biltong" : "jerky"],
    starches:["rice","pasta"],
    leftoverLunches:false, useLeftovers:false
  });
}

function textMeal(meal) { return `${meal?.name || ""} ${meal?.detail || ""}`.toLowerCase(); }
function hasWord(text, word) {
  return new RegExp("\\b" + String(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i").test(text);
}
function allText(days) {
  return JSON.stringify(days || []).toLowerCase();
}
function dinnerText(days) {
  return (days || []).map(d => textMeal(d.dinner)).join(" ");
}
function fishDinnerText(days) {
  return (days || [])
    .map(d => textMeal(d.dinner))
    .filter(t => /fish|hake|cod|tilapia|haddock|salmon|tuna/.test(t))
    .join(" ");
}
function snackText(days) {
  return (days || []).map(d => `${textMeal(d.morningSnack)} ${textMeal(d.afternoonSnack)}`).join(" ");
}

function countryFoodQA(input, result) {
  const hard = [];
  const warn = [];
  const rules = REGION_RULES[input.region];

  if (result.status === "BLOCKED") {
    hard.push("Case was blocked unexpectedly.");
    return { status:"FAIL", hard, warn };
  }

  const days = result.days || [];
  const all = allText(days);
  const dinners = dinnerText(days);
  const fishDinners = fishDinnerText(days);
  const snacks = snackText(days);

  // Country banned words, whole-word/phrase aware.
  for (const banned of rules.bannedWords) {
    if (banned.includes(" ")) {
      if (all.includes(banned)) hard.push(`Country wording fail: ${banned} appears for ${input.region}.`);
    } else {
      if (hasWord(all, banned)) hard.push(`Country wording fail: ${banned} appears for ${input.region}.`);
    }
  }

  // Fish rules.
  if ((input.proteins || []).includes("fish") && !fishDinners.trim()) {
    hard.push("Fish selected but no fish dinner appeared.");
  }

  if (fishDinners.trim()) {
    // banned templates
    for (const banned of BANNED_FISH_TEMPLATES) {
      if (fishDinners.includes(banned)) hard.push(`Banned fish template appears: ${banned}.`);
    }

    // fish dinners must include region allowed fish wording only
    const allowedFish = rules.allowedFishDinner;
    const hasAllowed = allowedFish.some(f => fishDinners.includes(f));
    if (!hasAllowed) {
      hard.push(`Fish dinner does not use allowed ${input.region} fish wording: ${allowedFish.join(", ")}.`);
    }

    for (const bannedFish of rules.bannedFishDinner) {
      if (hasWord(fishDinners, bannedFish)) hard.push(`Banned ${input.region} fish word appears in dinner: ${bannedFish}.`);
    }
  }

  // Tuna is allowed in snacks but should not become default dinner wording.
  if (hasWord(fishDinners, "tuna")) {
    hard.push("Tuna appears as dinner fish. Tuna should be snack wording only.");
  }
  if ((input.snackProteins || []).includes("tuna") && !hasWord(snacks, "tuna")) {
    hard.push("Tuna snack selected but tuna snack did not appear.");
  }

  // Fish styles allowed only.
  for (const d of days) {
    const dt = textMeal(d.dinner);
    if (/fish|hake|cod|white fish|tilapia|haddock/.test(dt)) {
      const allowedStyle = /lemon-herb|baked|grilled|fish cakes/.test(dt);
      if (!allowedStyle) hard.push(`Day ${d.day} fish dinner style is not allowed.`);
    }
  }

  // Global no leftovers unless selected.
  for (const d of days) {
    const lunch = textMeal(d.lunch);
    if (!input.leftoverLunches && !input.useLeftovers && (lunch.includes("leftover") || lunch.includes("last night") || lunch.includes("use the leftover"))) {
      hard.push(`Day ${d.day} forced leftover lunch.`);
    }
    if (hasWord(lunch, "remove") || hasWord(lunch, "removed")) {
      hard.push(`Day ${d.day} remove-starch wording.`);
    }
    if (!input.leftoverLunches && !input.useLeftovers && !lunch.includes("no added starch") && !lunch.includes("no added rice, pasta or potato")) {
      hard.push(`Day ${d.day} standalone lunch missing no added starch.`);
    }
  }

  // No mixed vegetables/corn.
  if (all.includes("mixed vegetables")) hard.push("Mixed vegetables appears in output.");
  if (hasWord(all, "corn")) hard.push("Corn appears in output.");

  return { status: hard.length ? "FAIL" : (warn.length ? "CONDITIONAL PASS" : "PASS"), hard, warn };
}

const results = cases.map((c, idx) => {
  const result = engine.generatePlan(c.input);
  const qa = countryFoodQA(c.input, result);
  return {
    index: idx + 1,
    name: c.name,
    region: c.input.region,
    diet: c.input.diet,
    engineStatus: result.status,
    engineQA: result.qa ? result.qa.status : "none",
    countryQA: qa,
    days: result.days || []
  };
});

const summary = results.reduce((acc, r) => {
  acc[r.countryQA.status] = (acc[r.countryQA.status] || 0) + 1;
  return acc;
}, {});

console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  engineVersion: engine.VERSION || "unknown",
  total: results.length,
  summary,
  results
}, null, 2));
