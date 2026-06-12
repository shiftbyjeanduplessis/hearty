# Hearty Free Meal Funnel — v3.4.0 Rebuilt Engine Clean Reset

This is a source-of-truth reset.

## Source of truth

- Engine source: rebuilt funnel engine line from `hearty_meal_engine_v331_us_first.zip`
- New engine version: `3.4.0-rebuilt-funnel-reset`
- Engine source marker: `rebuilt-funnel-engine-v331-us-first-plus-v340-rotation-qa`

## What is NOT used

- Old app engine `3.0.0-final-gated`
- Old `HeartyMealsEngineV6` generator
- Old `generateWeekPlan()` path
- Old page-contained meal templates

## What changed

- The funnel page is UI only.
- The page calls `HeartyMealEngine.generatePlan(input)` only.
- Added engine provenance logging:
  - `HEARTY_ENGINE_PROVENANCE`
  - `HEARTY_ENGINE_DEBUG`
- Added weekly protein balance logic.
- Added snack-vs-lunch/dinner repeat avoidance.
- Added rendered-output tests that catch chicken/beef dominance and snack/main clashes.

## Deploy

Upload/replace the whole folder, or at minimum:

- `free-meal-plan.html`
- `hearty-meal-engine-final.js`
- `hearty-free-meal-engine-v24.js`
- `service-worker.js`

## Test after deploy

Open in InPrivate:

```txt
/free-meal-plan.html?v=340
```

Then check the browser console for:

```txt
HEARTY_ENGINE_PROVENANCE 3.4.0-rebuilt-funnel-reset rebuilt-funnel-engine-v331-us-first-plus-v340-rotation-qa
```

## Local test

```bash
npm test
```
