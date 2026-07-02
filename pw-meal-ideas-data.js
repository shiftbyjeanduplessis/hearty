<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#06122F" />
  <title>Perfect Women Tracker</title>
  <link rel="manifest" href="/perfect-women/manifest.json" />
  <link rel="apple-touch-icon" href="/perfect-women/assets/icon-192.png" />
  <link rel="stylesheet" href="css/perfect-women.css" />
</head>
<body>
  <div class="onboarding-overlay" id="onboardingOverlay" aria-hidden="true">
    <div class="onboarding-card">
      <div class="onboarding-top">
        <img class="brand-logo small-logo" src="assets/perfect-women-logo.png" alt="Perfect Women logo" />
        <div>
          <p class="eyebrow pink">Start here</p>
          <h1>Set up your tracker</h1>
          <p class="muted">Add your name and starting weight. Your data stays on this phone in this version.</p>
        </div>
      </div>

      <div class="form-grid single-on-mobile">
        <label>Name<input id="onboardName" placeholder="Your name" autocomplete="given-name" /></label>
        <label>Starting weight (kg)<input id="onboardWeight" type="number" inputmode="decimal" step="0.1" placeholder="e.g. 84.6" /></label>
      </div>
      <button class="primary full" id="finishOnboardingBtn">Start tracking</button>
      <button class="text-button full-text" id="skipOnboardingBtn">I'll do this later</button>

      <div class="install-help">
        <p class="eyebrow gold">Install on phone</p>
        <div class="install-grid">
          <div class="mini-card">
            <h3>Android</h3>
            <p>Open the hosted app link in Chrome, tap the three-dot menu, choose <strong>Install app</strong> or <strong>Add to Home screen</strong>, then confirm.</p>
          </div>
          <div class="mini-card">
            <h3>iPhone</h3>
            <p>Open the hosted app link in Safari, tap the <strong>Share</strong> button, choose <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.</p>
          </div>
        </div>
        <button class="primary full install-now-btn" id="onboardingInstallBtn" type="button" hidden>Install app on this phone</button>
        <p class="small muted" id="onboardingInstallStatus">Note: installation works from the hosted app link. A downloaded <code>file://</code> preview is only for testing.</p>
      </div>
    </div>
  </div>

  <div class="app-shell">
    <header class="app-header">
      <div class="app-brand-card">
        <div class="topbar-logo-wrap" aria-hidden="true">
          <img class="brand-logo topbar-logo" src="assets/perfect-women-logo.png" alt="" />
        </div>
        <div class="brand-copy">
          <p class="eyebrow">Perfect Women</p>
          <h1 id="pageTitle">Today</h1>
          <p class="brand-subtitle">Client tracker</p>
        </div>
        <button class="icon-button" id="quickSettings" aria-label="Open settings"><span class="ui-icon" data-icon="settings"></span></button>
      </div>
    </header>

    <main class="page-wrap">
      <section class="page active" id="page-home" data-page="home">
        <div class="welcome-card card hero-card">
          <p class="eyebrow pink">Daily structure</p>
          <h2 id="homeGreeting">Welcome back</h2>
          <p id="homeCoachLine" class="muted">Small daily actions. Real progress over time.</p>
          <div class="hero-actions">
            <button class="primary" data-add-water="250">+250 ml water</button>
            <button class="secondary" id="homeMovementBtn">Tick movement</button>
          </div>
        </div>

        <div class="grid two">
          <article class="card stat-card">
            <span class="card-icon ui-icon" data-icon="water"></span>
            <p class="label">Water today</p>
            <h3 id="homeWaterStat">0 / 2,000 ml</h3>
            <div class="meter"><span id="homeWaterMeter"></span></div>
          </article>
          <article class="card stat-card">
            <span class="card-icon ui-icon" data-icon="walk"></span>
            <p class="label">Movement</p>
            <h3 id="homeMovementStat">Not done</h3>
            <p class="small muted" id="homeMovementDetail">A walk or simple movement counts.</p>
          </article>
        </div>

        <article class="card callout" id="weighInCard">
          <div>
            <p class="eyebrow gold">Monday weigh-in</p>
            <h3 id="weighInTitle">Weekly weight routine</h3>
            <p class="muted" id="weighInText">Your main weigh-in is Monday morning.</p>
          </div>
          <button class="secondary" data-nav="track">Log weight</button>
        </article>

        <article class="card walking-home-card" id="homeWalkingCard">
          <div class="section-heading">
            <div>
              <p class="eyebrow pink">Walking program</p>
              <h3 id="homeWalkingTitle">8-week walking program</h3>
              <p class="muted" id="homeWalkingText">Log your 60-minute walks and track your weekly step average.</p>
            </div>
            <button class="secondary" data-nav="programs">Log walk</button>
          </div>
          <div class="walk-mini-stats" id="homeWalkingStats"></div>
        </article>

        <article class="card">
          <div class="section-heading">
            <div>
              <p class="eyebrow pink">This week</p>
              <h3>Progress rhythm</h3>
            </div>
            <button class="text-button" data-nav="progress">View progress</button>
          </div>
          <div class="weekly-strip" id="homeWeekStrip"></div>
        </article>

        <article class="card soft-card">
          <p class="eyebrow gold">Focus</p>
          <h3>Keep it boring enough to repeat.</h3>
          <p class="muted">Water, movement, your plan, and your Monday check-in. The basics win when they are done consistently.</p>
        </article>
      </section>

      <section class="page" id="page-track" data-page="track">
        <article class="card">
          <div class="section-heading">
            <div>
              <p class="eyebrow pink">Water tracker</p>
              <h2 id="trackWaterTitle">0 ml</h2>
              <p class="muted" id="trackWaterSub">Daily target: 2,000 ml</p>
            </div>
            <div class="ring" id="waterRing">0%</div>
          </div>
          <div class="button-row">
            <button class="primary" data-add-water="250">+250 ml</button>
            <button class="primary" data-add-water="500">+500 ml</button>
            <button class="secondary" id="undoWaterBtn">Undo</button>
          </div>
          <div class="meter large"><span id="trackWaterMeter"></span></div>
        </article>

        <article class="card">
          <p class="eyebrow pink">Movement / walk</p>
          <h2>Tick off today’s movement</h2>
          <p class="muted">This replaces step tracking for now. A walk, home session, gym session, mobility or intentional movement counts.</p>
          <div class="saved-status" id="movementSavedStatus">No movement saved for today yet.</div>
          <div class="quick-movement-row">
            <button class="secondary with-icon" data-quick-movement="Walk" data-duration="20"><span class="ui-icon" data-icon="walk"></span>Walk done</button>
            <button class="secondary with-icon" data-quick-movement="Movement" data-duration="20"><span class="ui-icon" data-icon="check"></span>Movement done</button>
            <button class="secondary with-icon" data-quick-movement="Workout" data-duration="30"><span class="ui-icon" data-icon="workout"></span>Workout done</button>
          </div>
          <div class="movement-options" id="movementOptions">
            <button data-duration="10">10 min</button>
            <button data-duration="20">20 min</button>
            <button data-duration="30">30 min</button>
            <button data-duration="45">45 min</button>
            <button data-duration="60">60 min</button>
          </div>
          <label class="field-label" for="movementType">Movement type</label>
          <select id="movementType">
            <option>Walk</option>
            <option>Home workout</option>
            <option>Gym session</option>
            <option>Mobility</option>
            <option>General movement</option>
            <option>Other</option>
          </select>
          <label class="field-label" for="movementNotes">Notes</label>
          <textarea id="movementNotes" rows="2" placeholder="Optional: how did it feel?"></textarea>
          <div class="button-row">
            <button class="primary" id="saveMovementBtn">Save movement</button>
            <button class="secondary" id="clearMovementBtn">Clear today</button>
          </div>
        </article>

        <article class="card" id="weightEntryCard">
          <p class="eyebrow gold">Weekly weight</p>
          <h2>Monday morning weigh-in</h2>
          <p class="muted">The programme tracks the weekly trend, not daily scale noise. You can still correct/add a weight manually when needed.</p>
          <div class="form-grid">
            <label>Date<input type="date" id="weightDate" /></label>
            <label>Weight (kg)<input type="number" id="weightKg" inputmode="decimal" step="0.1" placeholder="e.g. 84.6" /></label>
            <label>Waist (cm, optional)<input type="number" id="waistCm" inputmode="decimal" step="0.1" placeholder="e.g. 92" /></label>
          </div>
          <label class="field-label" for="weightNotes">Notes</label>
          <textarea id="weightNotes" rows="2" placeholder="Optional: cycle, stress, weekend, digestion, etc."></textarea>
          <button class="primary full" id="saveWeightBtn">Save weigh-in</button>
        </article>
      </section>

      <section class="page" id="page-programs" data-page="programs">
        <article class="card soft-card">
          <p class="eyebrow pink">Programs</p>
          <h2>Your coaching programs</h2>
          <p class="muted">Start with the walking program here. Later we can add home workouts, gym programs and other Perfect Women training paths in the same section.</p>
        </article>

        <article class="card walking-program-card">
          <div class="section-heading">
            <div>
              <p class="eyebrow gold">8-week walking program</p>
              <h2>Log your 60-minute walks</h2>
              <p class="muted">Walk 4–5 times per week. After each 60-minute walk, enter the total steps from your phone, watch or pedometer.</p>
            </div>
            <span class="program-pill" id="walkingWeekPill">Week 1</span>
          </div>

          <div class="walking-start" id="walkingStartPanel">
            <div class="mini-card">
              <h3>How it works</h3>
              <p>Start with your normal pace in Week 1. Each week, aim to gently improve your average steps per 60-minute walk if you feel good.</p>
            </div>
            <div class="form-grid">
              <label>Walks per week
                <select id="walkingTargetWalks">
                  <option value="4">4 walks</option>
                  <option value="5">5 walks</option>
                </select>
              </label>
              <label>Week 1 step target, optional<input type="number" id="walkingStartTarget" inputmode="numeric" placeholder="e.g. 5500" /></label>
            </div>
            <button class="primary full" id="startWalkingProgramBtn">Start walking program</button>
          </div>

          <div class="walking-active" id="walkingActivePanel" hidden>
            <div class="grid three walk-stats-grid">
              <article class="mini-stat"><span>Current week</span><strong id="walkingCurrentWeek">1 of 8</strong></article>
              <article class="mini-stat"><span>Walks this week</span><strong id="walkingThisWeekCount">0/4</strong></article>
              <article class="mini-stat"><span>Average steps</span><strong id="walkingThisWeekAvg">—</strong></article>
            </div>

            <div class="form-grid">
              <label>This week’s step target<input type="number" id="walkingWeekTarget" inputmode="numeric" placeholder="Optional" /></label>
              <label>Walk date<input type="date" id="walkDate" /></label>
              <label>Steps this walk<input type="number" id="walkSteps" inputmode="numeric" placeholder="e.g. 6200" /></label>
            </div>
            <label class="field-label" for="walkNotes">Notes</label>
            <textarea id="walkNotes" rows="2" placeholder="Optional: route, shoes, energy, weather, etc."></textarea>
            <div class="button-row">
              <button class="primary" id="saveWalkBtn">Save walk</button>
              <button class="secondary" id="saveWalkingTargetBtn">Save target</button>
            </div>

            <div class="walk-advice" id="walkingAdvice">Week 1 is your baseline week. Record your walks without forcing the pace.</div>
            <div class="summary-list" id="walkingSessionList"></div>
          </div>
        </article>

      </section>

      <section class="page" id="page-progress" data-page="progress">
        <div class="grid two">
          <article class="card stat-card"><p class="label">Starting weight</p><h3 id="startWeight">—</h3></article>
          <article class="card stat-card"><p class="label">Latest weight</p><h3 id="latestWeight">—</h3></article>
          <article class="card stat-card"><p class="label">Total change</p><h3 id="totalChange">—</h3></article>
          <article class="card stat-card"><p class="label">Weigh-ins</p><h3 id="weighInCount">0</h3></article>
        </div>

        <article class="card photo-compare-card">
          <div class="section-heading">
            <div>
              <p class="eyebrow pink">Photo progress</p>
              <h2>Compare photos</h2>
              <p class="small muted">This is the photo comparison tool. Add at least two dated photo sets, then choose Front, Side or Back.</p>
            </div>
            <button class="text-button" data-nav="photos">Add photos</button>
          </div>

          <div id="compareEmpty" class="photo-preview-empty"><strong>Photo compare is ready.</strong><br>Add at least two photo sets to compare progress side by side.</div>

          <div id="photoComparePanel" class="photo-compare-panel" hidden>
            <div class="compare-controls">
              <label>Date A<select id="compareDateA"></select></label>
              <label>Date B<select id="compareDateB"></select></label>
            </div>
            <div class="angle-row" role="group" aria-label="Photo angle">
              <button class="angle-btn active" data-compare-angle="front" type="button">Front</button>
              <button class="angle-btn" data-compare-angle="side" type="button">Side</button>
              <button class="angle-btn" data-compare-angle="back" type="button">Back</button>
            </div>
            <div class="compare-grid">
              <div class="compare-frame-card">
                <p class="compare-label" id="compareLabelA">Date A</p>
                <div class="compare-frame" id="compareFrameA"></div>
              </div>
              <div class="compare-frame-card">
                <p class="compare-label" id="compareLabelB">Date B</p>
                <div class="compare-frame" id="compareFrameB"></div>
              </div>
            </div>
            <p class="small muted" id="compareHint">For the best comparison, use the same angle, lighting and distance each time.</p>
          </div>
        </article>


        <article class="card">
          <div class="section-heading">
            <div>
              <p class="eyebrow pink">Trend</p>
              <h2>Weekly weight</h2>
            </div>
          </div>
          <canvas id="weightChart" width="600" height="280" aria-label="Weight trend chart"></canvas>
          <p class="small muted" id="chartEmpty">Add at least two weigh-ins to see the trend.</p>
        </article>

        <article class="card">
          <p class="eyebrow gold">Consistency</p>
          <h2>This week</h2>
          <div class="summary-list" id="progressSummary"></div>
        </article>

        <article class="card walking-progress-card">
          <div class="section-heading">
            <div>
              <p class="eyebrow gold">Walking program</p>
              <h2>Walking progress</h2>
              <p class="small muted" id="walkingChartSummary">Start the walking program to see weekly averages.</p>
            </div>
            <button class="text-button" data-nav="programs">Log walk</button>
          </div>
          <canvas id="walkingChart" width="600" height="300" aria-label="Weekly walking average bar chart"></canvas>
          <p class="small muted" id="walkingChartEmpty">Log at least one walk to see your walking trend.</p>
          <div class="movement-delta-list" id="walkingWeekList"></div>
        </article>

        <article class="card">
          <div class="section-heading">
            <div>
              <p class="eyebrow pink">Movement trend</p>
              <h2>Movement by type</h2>
              <p class="small muted" id="movementChartSummary">Save movement this week to see your trend.</p>
            </div>
            <button class="text-button" data-nav="track">Add movement</button>
          </div>
          <canvas id="movementChart" width="600" height="320" aria-label="Movement by type bar chart"></canvas>
          <p class="small muted" id="movementChartEmpty">Save movement entries to see a bar graph.</p>
          <div class="movement-delta-list" id="movementDeltaList"></div>
        </article>


      </section>

      <section class="page" id="page-photos" data-page="photos">
        <article class="card photo-compare-shortcut">
          <div class="section-heading">
            <div>
              <p class="eyebrow gold">Photo comparison</p>
              <h2>Compare saved photos</h2>
              <p class="muted">The side-by-side compare tool is on the Progress page, directly under the weight summary.</p>
            </div>
            <button class="primary" data-nav="progress">Open compare</button>
          </div>
        </article>

        <article class="card">
          <p class="eyebrow pink">Progress photos</p>
          <h2>Add a photo set</h2>
          <p class="muted">For best comparison, use the same lighting, outfit and angle. Front, side and back are optional but recommended.</p>
          <div class="form-grid">
            <label>Date<input type="date" id="photoDate" /></label>
          </div>
          <div class="photo-inputs">
            <div class="photo-slot">
              <h3><span class="camera-badge ui-icon" data-icon="camera"></span> Front photo</h3>
              <div class="photo-actions">
                <label class="photo-action primary-photo"><span class="ui-icon" data-icon="camera"></span>Take photo<input type="file" id="photoFrontCamera" accept="image/*" capture="environment" /></label>
                <label class="photo-action"><span class="ui-icon" data-icon="upload"></span>Upload<input type="file" id="photoFront" accept="image/*" /></label>
              </div>
              <p class="small muted" id="photoFrontSelected">No photo chosen</p>
            </div>
            <div class="photo-slot">
              <h3><span class="camera-badge ui-icon" data-icon="camera"></span> Side photo</h3>
              <div class="photo-actions">
                <label class="photo-action primary-photo"><span class="ui-icon" data-icon="camera"></span>Take photo<input type="file" id="photoSideCamera" accept="image/*" capture="environment" /></label>
                <label class="photo-action"><span class="ui-icon" data-icon="upload"></span>Upload<input type="file" id="photoSide" accept="image/*" /></label>
              </div>
              <p class="small muted" id="photoSideSelected">No photo chosen</p>
            </div>
            <div class="photo-slot">
              <h3><span class="camera-badge ui-icon" data-icon="camera"></span> Back photo</h3>
              <div class="photo-actions">
                <label class="photo-action primary-photo"><span class="ui-icon" data-icon="camera"></span>Take photo<input type="file" id="photoBackCamera" accept="image/*" capture="environment" /></label>
                <label class="photo-action"><span class="ui-icon" data-icon="upload"></span>Upload<input type="file" id="photoBack" accept="image/*" /></label>
              </div>
              <p class="small muted" id="photoBackSelected">No photo chosen</p>
            </div>
          </div>
          <label class="field-label" for="photoNotes">Notes</label>
          <textarea id="photoNotes" rows="2" placeholder="Optional notes for this photo set"></textarea>
          <button class="primary full" id="savePhotoSetBtn">Save photo set</button>
          <p class="small muted">Photos are stored locally on this device in IndexedDB. They are not uploaded anywhere in this version.</p>
        </article>
        <div id="photoGallery" class="photo-gallery"></div>
      </section>

      <section class="page" id="page-recipes" data-page="recipes">
        <article class="card meal-generator-card">
          <div class="section-heading">
            <div>
              <p class="eyebrow gold">Mini meal generator</p>
              <h2>Spin for an idea</h2>
              <p class="muted">Choose the meal type, spin the wheel, and get a simple Perfect Women-style idea.</p>
            </div>
          </div>

          <div class="meal-generator-grid">
            <div>
              <label for="mealGeneratorType">What do you need?</label>
              <select id="mealGeneratorType">
                <option value="breakfast">Breakfast</option>
                <option value="snack">Snack</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
              <button class="primary full with-icon" id="spinMealBtn" type="button"><span class="ui-icon" data-icon="spark"></span>Spin the meal wheel</button>
              <button class="secondary full" id="showAllMealIdeasBtn" type="button">Show all ideas</button>
            </div>

            <div class="meal-wheel-wrap" aria-hidden="true">
              <div class="meal-wheel" id="mealWheel">
                <span id="mealWheelLabel">SPIN</span>
              </div>
            </div>
          </div>

          <div class="meal-result" id="mealIdeaResult">
            <p class="eyebrow pink">Ready</p>
            <h3>Pick a meal type and spin.</h3>
            <p class="muted">The ideas follow the basic Perfect Women structure: protein, vegetables, and starch only where the plan allows it.</p>
          </div>

          <div class="meal-idea-list" id="mealIdeaList" hidden></div>
        </article>

        <article class="card">
          <p class="eyebrow pink">Recipe book</p>
          <h2>Perfect Women recipes</h2>
          <p class="muted">Search the recipe library or tap a category like Fun Meals, Sunday Meals, Casserole or Braai.</p>
          <input id="recipeSearch" type="search" placeholder="Search fun meals, Sunday meals, casserole, braai..." />
          <div class="filter-row" id="recipeFilters"></div>
        </article>
        <div id="recipeList" class="recipe-list"></div>
      </section>

      <section class="page" id="page-settings" data-page="settings">
        <article class="card">
          <p class="eyebrow pink">Client settings</p>
          <h2>Personal details</h2>
          <div class="form-grid">
            <label>Name<input id="clientName" placeholder="Client name" /></label>
            <label>Water target (ml)<input id="waterTarget" type="number" step="250" min="500" /></label>
          </div>
          <p class="small muted">Weigh-in day is fixed to Monday morning for this version.</p>
          <button class="primary full" id="saveSettingsBtn">Save settings</button>
        </article>

        <article class="card">
          <p class="eyebrow gold">Data</p>
          <h2>Local data tools</h2>
          <p class="muted">This version stores data only on this phone/browser. Export before clearing browser data or moving phones.</p>
          <div class="button-row">
            <button class="secondary" id="exportDataBtn">Export JSON</button>
            <button class="danger" id="resetDataBtn">Reset local data</button>
          </div>
        </article>

        <article class="card">
          <p class="eyebrow gold">Install app</p>
          <h2>Add to home screen</h2>
          <div class="install-grid">
            <div class="mini-card">
              <h3>Android</h3>
              <p>Open the hosted app link in Chrome → tap the three-dot menu → <strong>Install app</strong> or <strong>Add to Home screen</strong> → confirm.</p>
            </div>
            <div class="mini-card">
              <h3>iPhone</h3>
              <p>Open the hosted app link in Safari → tap <strong>Share</strong> → <strong>Add to Home Screen</strong> → <strong>Add</strong>.</p>
            </div>
          </div>
          <button class="primary full install-now-btn" id="installAppBtn" type="button" hidden>Install app on this phone</button>
          <p class="small muted" id="installStatusText">The downloaded file preview is for testing. Proper install needs the hosted app link.</p>
          <button class="secondary full" id="showOnboardingBtn">Show setup guide again</button>
        </article>

        <article class="card soft-card">
          <p class="eyebrow pink">Future-ready</p>
          <h2>Prepared for later layers</h2>
          <p class="muted">The local data schema includes versioning, update timestamps and a local client id so login, Supabase sync and a coach dashboard can be added later without rebuilding the tracker.</p>
        </article>
      </section>
    </main>

    <nav class="bottom-nav" aria-label="Main navigation">
      <button class="nav-btn active" data-nav="home"><span class="ui-icon" data-icon="home"></span>Home</button>
      <button class="nav-btn" data-nav="track"><span class="ui-icon" data-icon="check"></span>Track</button>
      <button class="nav-btn" data-nav="programs"><span class="ui-icon" data-icon="program"></span>Programs</button>
      <button class="nav-btn" data-nav="progress"><span class="ui-icon" data-icon="chart"></span>Progress</button>
      <button class="nav-btn" data-nav="photos"><span class="ui-icon" data-icon="camera"></span>Photos</button>
      <button class="nav-btn" data-nav="recipes"><span class="ui-icon" data-icon="plate"></span>Recipes</button>
    </nav>
  </div>

  <dialog id="recipeModal" class="recipe-modal">
    <div id="recipeModalContent"></div>
    <button class="secondary full" id="closeRecipeModal">Close</button>
  </dialog>

  <script src="js/pw-storage.js" defer></script>
  <script src="js/pw-recipes-data.js" defer></script>
  <script src="js/pw-meal-ideas-data.js" defer></script>
  <script src="js/pw-app.js" defer></script>
</body>
</html>
