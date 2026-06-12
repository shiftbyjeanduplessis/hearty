const fs = require("fs");
const html = fs.readFileSync("free-meal-plan.html", "utf8");

const checks = [
  ["uses event delegation", html.includes("root.onclick = function(event)")],
  ["next action handled", html.includes('if(action === "next")')],
  ["back action handled", html.includes('if(action === "back")')],
  ["skip action handled", html.includes('if(action === "skip")')],
  ["select action handled", html.includes('if(action === "select")')],
  ["nav error logging exists", html.includes("HEARTY_WIZARD_NAV_ERROR")],
  ["render logging exists", html.includes("HEARTY_WIZARD_RENDER")],
  ["v3.3.7 engine script", html.includes("hearty-meal-engine-final.js?v=3.3.7-nav-fixed")],
  ["localYoghurt helper exists", html.includes("function localYoghurt()")],
  ["mealRow helper exists", html.includes("function mealRow(")],
  ["no old V6 getter", !html.includes("window.HeartyMealsEngineV6 || null")],
  ["no old generateWeekPlan call", !html.includes("generateWeekPlan({")]
];

const failed = checks.filter(([, ok]) => !ok);
console.log(JSON.stringify({ checks: Object.fromEntries(checks), failed }, null, 2));
if (failed.length) process.exit(1);
