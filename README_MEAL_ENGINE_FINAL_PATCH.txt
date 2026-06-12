Hearty meal-engine patch v3.3.5 CLEAN ENGINE

Changed files:
- free-meal-plan.html
- hearty-meal-engine-final.js
- hearty-free-meal-engine-v24.js
- service-worker.js

Fixes:
- Removed old V6 page block.
- Removed old generateWeekPlan path.
- Final page uses only HeartyMealEngine.generatePlan.
- Added browser-side chicken guard.
- Added HEARTY_ENGINE_DEBUG console output.
- Engine avoids lunch/dinner same-protein repeat where alternatives exist.
- Service worker cache bumped.
