# Hearty Free Meal Plan Funnel — v3.3.6

This patch fixes the broken wizard Next button after the clean-engine removal.

## What was wrong

The v3.3.5 clean package removed the old V6 engine block, but that block also contained helper functions the wizard still used:

- `localYoghurt()`
- `mealRow()`
- `dayTotalRow()`

The fruit step looked broken because clicking **Next** tries to render the snack step, and the snack step calls `localYoghurt()`.

## Fixes in v3.3.6

- Restored `localYoghurt()` as a small standalone helper.
- Restored `mealRow()` and `dayTotalRow()` for plan rendering.
- Did **not** reintroduce the old V6 engine.
- Added safer Next/Back/Skip handlers with console error logging.
- Script cache-busted to `v=3.3.6-button-helper-fix`.
- Service worker cache bumped.

## Upload these files

Replace/upload the whole folder contents, or at minimum:

- `free-meal-plan.html`
- `hearty-meal-engine-final.js`
- `hearty-free-meal-engine-v24.js`
- `service-worker.js`

## Test after deploy

Open in InPrivate:

```txt
/free-meal-plan.html?v=336
```

Go to the fruit step and click Next. It should move to the protein snack step.
