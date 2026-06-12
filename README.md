# Hearty Free Meal Plan Funnel — v3.3.3

This is the final corrected package built from your real funnel page, not a demo page.

## Fixes in v3.3.3

- United States is first in the wizard country step.
- Wizard state defaults to United States.
- Opening the wizard forces US if state is blank.
- Removed old `state.country || "ZA"` fallback.
- The generate button does not block valid results because of `result.ok`.
- The wizard-to-engine mapping is hardened:
  - non-protein snack selections no longer cause a false snack failure
  - country-normal vegetables top up if corn/peas/mixed veg were removed
  - breakfast choices correctly add implied proteins
- The generic misleading alert was removed.
- Engine script cache-busted to `v=3.3.3-final-funnel-fix`.
- Service worker cache bumped.

## Upload these files

Replace/upload the whole folder contents, or at minimum:

- `free-meal-plan.html`
- `hearty-meal-engine-final.js`
- `hearty-free-meal-engine-v24.js`
- `service-worker.js`

## Critical deploy test

After deploy, open in InPrivate:

```txt
/free-meal-plan.html?v=333
```

The wizard must show **United States first**.

The screenshot-like selection test passes in this package.

## Tests

Run:

```bash
npm test
```

Expected:

- smoke-test: PASS
- screenshot-selection-smoke-test: PASS
- hardened-funnel-input-test: PASS
- strict-50-test: PASS 50
- country-food-rules-test: PASS 50
- page-patch-test: PASS
