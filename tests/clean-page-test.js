const fs = require("fs");
const html = fs.readFileSync("free-meal-plan.html", "utf8");
const checks = [
  ["loads v3.4.9-lunch-variety-polish engine", html.includes("hearty-meal-engine-final.js?v=3.4.9-lunch-variety-polish")],
  ["old V6 block removed", !html.includes("BUTTON_FIX_ONLY_V1")],
  ["old V6 getter removed", !html.includes("return window.HeartyMealsEngineV6 || null")],
  ["final engine getter present", html.includes("return window.HeartyMealEngine || null")],
  ["old generateWeekPlan call removed", !html.includes("generateWeekPlan({")],
  ["browser chicken guard present", html.includes("Final browser-side guard: never send chicken")],
  ["engine debug present", html.includes("HEARTY_ENGINE_DEBUG")]
];
const failed = checks.filter(([, ok]) => !ok);
console.log(JSON.stringify({ checks: Object.fromEntries(checks), failed }, null, 2));
if (failed.length) process.exit(1);
