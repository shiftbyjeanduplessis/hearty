Hearty meal-engine patch v3.3.3

Changed files:
- free-meal-plan.html
- hearty-meal-engine-final.js
- hearty-free-meal-engine-v24.js
- service-worker.js

Fixes:
- United States is first in the wizard.
- Wizard defaults to United States and forces US if blank.
- Removed old state.country || "ZA" fallback.
- Generate button no longer rejects valid plans based on result.ok.
- It blocks only engine BLOCKED or QA FAIL.
- Hardened wizard-to-engine mapping so visible selections are translated into valid engine selections.
- Non-protein snack options no longer cause false snack-gate failures.
- Service worker cache bumped.

Deploy note:
Open /free-meal-plan.html?v=333 in a private window after deploy to avoid old cached JS.
