const fs = require("fs");
const html = fs.readFileSync("free-meal-plan.html", "utf8");
const checks = [
  ["loads v3.4.9-lunch-variety-polish engine", html.includes("hearty-meal-engine-final.js?v=3.4.9-lunch-variety-polish")],
  ["US is first country option", html.includes('options:[["US","United States",""],["ZA","South Africa",""]')],
  ["state defaults to US", html.includes('country:"US", countrySelected:true')],
  ["old ZA fallback removed", !html.includes('country: state.country || "ZA"')],
  ["does not gate on result.ok false", !html.includes('result.ok === false')],
  ["no default chicken fallback", !html.includes('["chicken","beef","fish","eggs"]')],
  ["mapFinalProteins only adds chicken when selected", html.includes('if(p === "chicken") add("chicken")')]
];
const failed = checks.filter(([, ok]) => !ok);
console.log(JSON.stringify({ checks: Object.fromEntries(checks), failed }, null, 2));
if (failed.length) process.exit(1);
