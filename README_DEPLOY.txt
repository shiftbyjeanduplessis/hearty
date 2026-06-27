Hearty locked new-engine + Brevo deploy

Upload ONLY:
- free-meal-plan.html
- js/hearty-meal-engine.js

Do NOT upload:
- assets/
- full-drop folders
- old app meal engine files

What this does:
- Uses the current working free-meal-plan.html layout.
- Points the page to js/hearty-meal-engine.js?v=locked-new-engine-v2 so the browser reloads the uploaded engine.
- Includes the latest finished lead-magnet engine file from this project, not the tiny legacy app/fallback engine.
- Adds soy/tofu exclusion support so tofu does not appear unless tofu is selected.
- Keeps lamb excluded where the wrapper says lamb is excluded.
- Keeps visible vegetables to max 2 names per meal line.
- Adds the Brevo/Supabase sync endpoint and sends email, name, firstName, source.

Test after upload:
1. Hard refresh with Ctrl+F5.
2. Generate plan with default female / eggs + chicken + Greek yoghurt.
3. Confirm no tofu/lamb/pork/beef appears unless selected.
4. Download with a fresh email.
5. Console should show:
   [Hearty] Brevo sync start
   [Hearty] Brevo sync success

Additional v2b check: strictPreferredFoodKeys is enabled so the lead magnet does not pull proteins the user did not select.
