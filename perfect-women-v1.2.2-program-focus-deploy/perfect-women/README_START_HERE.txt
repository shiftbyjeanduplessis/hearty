PERFECT WOMEN LOCAL TRACKER V1.0.7

This is the clean local-first client app build for Perfect Women.

WHAT IS INCLUDED
- Simple onboarding for name and starting weight
- Home screen with daily structure
- Water tracker (+250ml / +500ml / undo)
- Movement / walk tick-off instead of step tracking
- Monday-only weekly weigh-in routine
- Progress screen with weight summary and simple chart
- Movement by type bar graph comparing this week vs last week
- Photo tracker using IndexedDB for local photo storage
- Camera-first photo buttons on mobile, with upload fallback
- Photo comparison module on Progress with Date A / Date B and Front / Side / Back toggle
- Android/iPhone install instructions in onboarding and Settings
- Recipe section with starter recipes
- Mini meal generator on the Recipes page with Breakfast / Snack / Lunch / Dinner idea spinning
- Settings screen with name, water target, export JSON, reset local data
- PWA manifest and service worker
- Premium Perfect Women dark navy / pink / gold visual style with the upgraded floral logo
- Inline SVG icon system instead of emoji icons

IMPORTANT
This is local-first. Client data is stored only in the browser/device.
There is no login, Supabase sync, coach dashboard or two-way communication in this version.

HOW TO TEST LOCALLY
Option 1:
Open index.html in a browser. Most features work directly. Service worker/PWA install may not work on file://.

Option 2, recommended:
Run a small local server in this folder:
python -m http.server 8000
Then open:
http://localhost:8000

FUTURE LAYERS READY
The app data has:
- schemaVersion
- localClientId
- createdAt / updatedAt
- sync.pending
This allows later Supabase sync and coach dashboard wiring without changing the whole app.

FILES
index.html
css/perfect-women.css
js/pw-storage.js
js/pw-recipes-data.js
js/pw-meal-ideas-data.js
js/pw-app.js
assets/perfect-women-logo.png
assets/icon-192.png
assets/icon-512.png
manifest.json
sw.js
TECH_SPEC.md


V1.2.1 update:
- Added a simple 8-week 0–5 km jogging program inside Programs.
- Clients can start the program, view weekly sessions, log distance/time/RPE/notes, and see jogging progress on Progress.
- Existing local data key stays unchanged.


V1.2.2 update:
- Programs now use a focused layout. The current program opens up, while other programs stay minimal.
- Added a Current Program indicator at the top of Programs.
