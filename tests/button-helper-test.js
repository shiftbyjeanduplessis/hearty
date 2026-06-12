const fs = require("fs");
const html = fs.readFileSync("free-meal-plan.html", "utf8");

const checks = [
  ["localYoghurt helper exists", html.includes("function localYoghurt()")],
  ["mealRow helper exists", html.includes("function mealRow(")],
  ["dayTotalRow helper exists", html.includes("function dayTotalRow(")],
  ["snack step can call localYoghurt", html.includes("function getSnackOptions()") && html.includes("localYoghurt()")],
  ["nav handler has error logging", html.includes("HEARTY_WIZARD_NAV_ERROR")],
  ["v3.3.7 engine script", html.includes("hearty-meal-engine-final.js?v=3.3.7-nav-fixed")],
  ["old V6 getter not present", !html.includes("window.HeartyMealsEngineV6 || null")],
  ["old generateWeekPlan path not present", !html.includes("generateWeekPlan({")]
];

const failed = checks.filter(([, ok]) => !ok);
console.log(JSON.stringify({ checks: Object.fromEntries(checks), failed }, null, 2));
if (failed.length) process.exit(1);
