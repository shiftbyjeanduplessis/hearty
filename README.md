# Hearty Free Meal Plan Funnel — v3.3.1

This package uses your uploaded `free-meal-plan.html` as the base and preserves the existing funnel design.

## What changed

- Replaced old meal engine with `hearty-meal-engine-final.js` v3.3.1.
- Updated `free-meal-plan.html` to load `hearty-meal-engine-final.js?v=3.3.1-us-first`.
- Changed the wizard country order so United States appears first.
- Engine fallback/default region is United States.
- Leftovers are not forced.
- Lunches use `No added starch.`
- Fish curry and fish stew are removed.
- Country food wording is locked by region.
- Service worker cache name bumped so old cached files are cleared.
- Old `hearty-free-meal-engine-v24.js` is replaced by a compatibility shim so old templates do not silently run.

## Files to upload

Upload the whole folder to GitHub/Render, or replace these files in your existing repo:

- `free-meal-plan.html`
- `hearty-meal-engine-final.js`
- `hearty-free-meal-engine-v24.js`
- `service-worker.js`

## Tests

Run:

```bash
npm test
```

Expected:

```txt
smoke-test: allowed 7-day plan
strict-50-test: PASS 50
country-food-rules-test: PASS 50
```

## Important

This keeps your funnel page. It does not replace it with a demo page.
