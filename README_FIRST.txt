HEARTY ROOT RESCUE PATCH
Date: 2026-07-03

Purpose:
- Restore the public root / index.html to a sales page.
- Stop / or /index.html from opening the app home page.
- Keep app pages on their own URLs like /home.html, /meals.html, /progress.html, etc.

Files included:
1) index.html
   Emergency sales-page restore for https://hearty.health/ and https://www.hearty.health/
   Current offer shown: $29 once-off lifetime access + 14-day money-back guarantee.

2) sw.js
   Root-safe service worker.
   Never serves the app shell for / or /index.html.

3) service-worker.js
   Same as sw.js, included because the current project may use either file name.
   If you know exactly which one is registered, upload only that matching file.
   If unsure, upload both.

Important:
- Do NOT upload app home.html as index.html.
- Do NOT rename home.html to index.html.
- Root /index.html must be the sales page only.
- App entry stays /home.html unless/until we intentionally move the app into /app/.

After deploy, test in this order:
1) https://hearty.health/
   Must show sales page.

2) https://www.hearty.health/
   Must show same sales page or redirect to same root.

3) https://hearty.health/home.html
   Must show the app Home page.

4) On your phone/browser, if root still opens app:
   - Open DevTools > Application > Service Workers > Unregister.
   - Clear site cache only, not Supabase data.
   - Hard refresh.

Note:
This is a rescue patch. The main payment checkout button is intentionally routed to /free-meal-plan.html until the exact live Paddle checkout URL is reconnected from your correct production sales page.
