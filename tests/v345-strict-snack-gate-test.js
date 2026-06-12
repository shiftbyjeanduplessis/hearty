const engine = require("../hearty-meal-engine-final.js");

const base = {
  region:"US",
  diet:"omnivore",
  proteins:["chicken","beef","fish","eggs","dairy","protein_powder"],
  vegetables:["spinach","tomato","onion","carrot","zucchini","green beans","mushrooms","peppers"],
  breakfastItems:["eggs","yogurt","protein_shake"],
  starches:["rice","pasta"],
  exclusions:[]
};

const badTooFew = engine.generatePlan({...base, snackProteins:["yogurt","boiled_eggs"]});
const goodEggBreakfast = engine.generatePlan({...base, breakfastItems:["eggs"], snackProteins:["boiled_eggs","yogurt","protein_shake"]});
const goodBroad = engine.generatePlan({...base, breakfastItems:["eggs"], snackProteins:["yogurt","tuna","jerky","protein_shake"]});

const checks = [
  ["version", engine.VERSION === "3.4.9-lunch-variety-polish"],
  ["source", engine.ENGINE_SOURCE === "rebuilt-funnel-engine-v331-us-first-plus-v349-lunch-variety-polish"],
  ["blocks fewer than 3 snack families", badTooFew.status === "BLOCKED" && badTooFew.gate.failures.includes("snack_protein_minimum")],
  ["allows egg breakfast with 2 non-egg snack families", goodEggBreakfast.status === "ALLOWED" && goodEggBreakfast.days.length === 7],
  ["allows broad snack choice", goodBroad.status === "ALLOWED" && goodBroad.days.length === 7]
];

const failed = checks.filter(([, ok]) => !ok);
console.log(JSON.stringify({checks:Object.fromEntries(checks), badTooFew:badTooFew.gate, goodEggBreakfastStatus:goodEggBreakfast.status, goodBroadStatus:goodBroad.status, failed}, null, 2));
if(failed.length) process.exit(1);
