const fs = require("fs");
const html = fs.readFileSync("free-meal-plan.html", "utf8");

const checks = [
  ["loads v3.3.3 engine", html.includes('hearty-meal-engine-final.js?v=3.3.3-final-funnel-fix')],
  ["US is first country option", html.includes('options:[["US","United States",""],["ZA","South Africa",""]')],
  ["state defaults to US", html.includes('country:"US", countrySelected:true')],
  ["wizard open forces US if blank", html.includes('if(!state.country)')],
  ["old ZA fallback removed", !html.includes('country: state.country || "ZA"')],
  ["does not gate on result.ok false", !html.includes('result.ok === false')],
  ["allows conditional pass", html.includes('Allow PASS and CONDITIONAL PASS')],
  ["has hardened input mapping", html.includes('function hardenFinalEngineInput(input)')],
  ["generic misleading alert removed", !html.includes('Please add a few more selections so Hearty can build a useful 7-day plan')]
];

const failed = checks.filter(([, ok]) => !ok);
console.log(JSON.stringify({ checks: Object.fromEntries(checks), failed }, null, 2));
if (failed.length) process.exit(1);
