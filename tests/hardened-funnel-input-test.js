const engine = require("../hearty-meal-engine-final.js");

function add(arr, value){ if(value && !arr.includes(value)) arr.push(value); }

function harden(input){
  const yog = input.region === "US" || input.region === "CA" ? "yogurt" : "yoghurt";
  if(input.proteins.includes("dairy")) add(input.snackProteins, yog);
  if(input.proteins.includes("eggs")) add(input.snackProteins, "boiled_eggs");
  if(input.proteins.includes("fish")) add(input.snackProteins, "tuna");
  if(input.proteins.includes("beef")) add(input.snackProteins, input.region === "SA" ? "biltong" : "jerky");
  if(input.proteins.includes("protein_powder")) add(input.snackProteins, "protein_shake");
  if(input.proteins.includes("chicken")) add(input.snackProteins, "chicken_strips");
  if(input.breakfastItems.includes("protein_shake")) add(input.proteins, "protein_powder");
  if(input.breakfastItems.includes("eggs")) add(input.proteins, "eggs");
  if(input.breakfastItems.includes(yog) || input.breakfastItems.includes("cottage_cheese") || input.breakfastItems.includes("oats")) add(input.proteins, "dairy");
  const defaultVeg = {
    US: ["spinach","tomato","onion","carrot","zucchini","green beans","mushrooms","peppers","broccoli","cucumber"]
  };
  (defaultVeg[input.region] || defaultVeg.US).forEach(v => { if(input.vegetables.length < 5) add(input.vegetables, v); });
  if(!input.starches.length) add(input.starches, "rice");
  return input;
}

const cases = [
  {
    name: "screenshot-like strong choices",
    input: {
      region:"US", diet:"omnivore",
      proteins:["fish","beef","pork","protein_powder","dairy","eggs"],
      breakfastItems:["oats","protein_shake","eggs","yogurt"],
      snackProteins:["boiled_eggs","yogurt","protein_shake","cottage_cheese","jerky"],
      starches:["wrap","couscous","potato","rice"],
      vegetables:["green beans","mushrooms","zucchini","cauliflower","broccoli","carrot","spinach","peppers","butternut"],
      exclusions:[], lowerStarch:false, noBreakfast:false, leftoverLunches:false, useLeftovers:false
    }
  },
  {
    name: "non-protein snack choices still get safe protein snacks",
    input: {
      region:"US", diet:"omnivore",
      proteins:["fish","beef","eggs"],
      breakfastItems:["oats","eggs"],
      snackProteins:[],
      starches:["rice"],
      vegetables:["zucchini","corn","peas","mixed vegetables","tomato"],
      exclusions:[], lowerStarch:false, noBreakfast:false, leftoverLunches:false, useLeftovers:false
    }
  }
];

const results = cases.map(c => {
  const input = harden(JSON.parse(JSON.stringify(c.input)));
  const result = engine.generatePlan(input);
  return {
    name: c.name,
    input,
    status: result.status,
    qa: result.qa && result.qa.status,
    messages: result.messages || [],
    hard: result.qa && result.qa.hard,
    days: result.days && result.days.length
  };
});

console.log(JSON.stringify({ version: engine.VERSION, results }, null, 2));

for (const r of results) {
  if (r.status !== "ALLOWED" || r.qa === "FAIL" || r.days !== 7) process.exit(1);
}
