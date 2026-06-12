# Hearty Free Meal Plan Funnel — v3.3.4

This patch is built from your real funnel page.

## Fixes in v3.3.4

- Chicken does not appear unless chicken was selected.
- No default chicken fallback in the funnel page.
- Breakfast egg/tofu meals now use breakfast-friendly vegetables only:
  - tomato
  - spinach
  - mushrooms
  - peppers
  - onion
  - zucchini / courgette / baby marrow
- Breakfast no longer uses butternut, green beans, cauliflower, broccoli, cabbage or lettuce.
- Cleaner title casing:
  - Lean ground beef
  - White fish
  - Beef jerky
- Vegetable lists now use cleaner “and” wording.
- Engine QA catches unselected chicken and non-breakfast vegetables.

## Upload these files

Replace/upload the whole folder contents, or at minimum:

- `free-meal-plan.html`
- `hearty-meal-engine-final.js`
- `hearty-free-meal-engine-v24.js`
- `service-worker.js`

## Test after deploy

Open in InPrivate:

```txt
/free-meal-plan.html?v=334
```

Use the same selections as your latest test. Chicken should not appear unless selected.
