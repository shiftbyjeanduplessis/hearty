# Hearty Free Meal Plan Funnel — v3.3.5 CLEAN ENGINE

This package removes the contaminated old funnel-engine layer.

## What changed

- Removed the old `BUTTON_FIX_ONLY_V1` / `HeartyMealsEngineV6` page block from `free-meal-plan.html`.
- The funnel now uses only `window.HeartyMealEngine.generatePlan()`.
- Removed the old `generateWeekPlan()` path from the HTML.
- Added a console debug line: `HEARTY_ENGINE_DEBUG` showing engine version and exact input sent to the engine.
- Added a browser-side guard so chicken and chicken snacks cannot be sent unless chicken was selected.
- Engine now avoids lunch and dinner using the same main protein category on the same day when alternatives exist.
- Beef jerky / Lean ground beef / White fish casing remains cleaned.
- Service worker cache bumped again.

## Upload these files

Upload the whole folder, or at minimum replace:

- `free-meal-plan.html`
- `hearty-meal-engine-final.js`
- `hearty-free-meal-engine-v24.js`
- `service-worker.js`

## Test after deploy

Open in InPrivate:

```txt
/free-meal-plan.html?v=335
```

Then open DevTools Console and look for:

```txt
HEARTY_ENGINE_DEBUG
```

It should show:

```txt
version: 3.3.5-clean-engine
```

and the exact `input.proteins` being sent to the engine.
