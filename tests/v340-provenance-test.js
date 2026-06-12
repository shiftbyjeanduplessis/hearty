const fs = require("fs");
const html = fs.readFileSync("free-meal-plan.html", "utf8");
const engine = fs.readFileSync("hearty-meal-engine-final.js", "utf8");
const loaded = require("../hearty-meal-engine-final.js");

const checks = [
  ["engine version exported", loaded.VERSION === "3.4.9-lunch-variety-polish"],
  ["engine source exported", loaded.ENGINE_SOURCE === "rebuilt-funnel-engine-v331-us-first-plus-v349-lunch-variety-polish"],
  ["html cache busts v3.4", html.includes("hearty-meal-engine-final.js?v=3.4.9-lunch-variety-polish")],
  ["html logs provenance", html.includes("HEARTY_ENGINE_PROVENANCE")],
  ["html does not use old getter", !html.includes("window.HeartyMealsEngineV6 || null")],
  ["html does not call generateWeekPlan", !html.includes("generateWeekPlan({")],
  ["engine has weekly rotation QA", engine.includes("weekly rotation is too repetitive")],
  ["engine has snack/main clash QA", engine.includes("snack repeats lunch/dinner protein")]
];

const failed = checks.filter(([, ok]) => !ok);
console.log(JSON.stringify({ checks: Object.fromEntries(checks), failed }, null, 2));
if (failed.length) process.exit(1);
