# Hearty Free Meal Plan Lead Magnet — Final Files

Upload these to the same folder on your site:

1. free-meal-plan.html
2. lead-magnet-meals-engine.js
3. hearty-logo.png

Do NOT replace the app's existing meals-engine.js. The lead magnet uses its own isolated engine file.

Supabase:
- Run meal-plan-leads-final.sql in Supabase SQL Editor.
- Paste your public SUPABASE_URL and SUPABASE_ANON_KEY into free-meal-plan.html.

Checkout:
- South Africa uses direct PayFast checkout from the SA page pattern.
- International uses Paddle overlay if the live Paddle client token and price ID are present.
- Search in free-meal-plan.html for HEARTY_PADDLE to paste those values if your live deployment does not expose them.

Deployment check:
- View source and search for HEARTY_LEAD_MAGNET_FINAL_2026_05_21.
- Search for lead-magnet-meals-engine.js to confirm the lead magnet is not using the app meals-engine.js.
