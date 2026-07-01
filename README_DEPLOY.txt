Hearty free meal plan funnel — v35j clean flow

Upload these paths together:
- free-meal-plan.html
- js/hearty-meal-engine-v30.js
- assets/hearty-logo.png
- assets/hearty-app-phone-preview.png

v35j fixes:
- Removes duplicate X problem by removing old injected close-button patches and styling the original close buttons only.
- Moves the original viewer action bar to document.body and fixes it to the true browser bottom.
- Action bar now only shows while the plan viewer is open.
- Action bar hides when the email capture/download form opens, avoiding three competing save/download CTAs.
- App offer uses the real phone image asset with transparent background, not the mini mockup.
- App offer layout simplified so guarantee/refund text no longer collapses into a narrow vertical column.
- Refine panel has clear actions: Update my plan and Close refinements.
- Selection fidelity/snack variety changes preserved.
- Existing meal engine, Paddle, Brevo, tracking and PDF logic preserved.
