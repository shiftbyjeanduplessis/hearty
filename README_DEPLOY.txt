DEPLOY THIS ZIP EXACTLY

Upload/replace these 3 files at the site root:

1. /free-meal-plan.html
2. /free-meal-plan
3. /js/hearty-meal-engine.js

This build:
- Uses the actual locked project lead-magnet meal engine:
  hearty-main/hearty-leadmagnet-meal-engine.js
- Replaces the broken old v33 wrapper adapter.
- Passes the correct engine input:
  proteins, breakfastItems, snackProteins, starches, vegetables, region, diet.
- Hard-resets the default checked foods on first load:
  eggs, chicken, Greek yoghurt only for proteins.
- Does not use preferredFoodKeys or the old app-style engine input.
- Keeps Brevo sync.
- Keeps /free-meal-plan as redirect safety.

After deploy:
1. Open https://hearty.health/free-meal-plan.html
2. Ctrl+F5
3. Generate default plan.
4. Console should show:
   [Hearty] Locked lead-magnet engine used
5. Default plan should not include tofu, pork, fish, calamari, chickpeas or beans unless those are selected.
