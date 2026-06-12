const fs = require("fs");
const html = fs.readFileSync("free-meal-plan.html", "utf8");

const checks = [
  ["event delegated nav remains", html.includes("root.onclick = function(event)")],
  ["next action remains", html.includes('if(action === "next")')],
  ["localYoghurt helper remains", html.includes("function localYoghurt()")],
  ["mealRow helper remains", html.includes("function mealRow(")],
  ["uses HeartyMealEngine.generatePlan", html.includes("engine.generatePlan(finalInput)")],
  ["no V6 getter", !html.includes("window.HeartyMealsEngineV6 || null")],
  ["no generateWeekPlan call", !html.includes("generateWeekPlan({")],
  ["v3.4.9-lunch-variety-polish visible subtitle marker", html.includes("v3.4.9-lunch-variety-polish release gate repair")]
];

const failed = checks.filter(([, ok]) => !ok);
console.log(JSON.stringify({ checks: Object.fromEntries(checks), failed }, null, 2));
if (failed.length) process.exit(1);
