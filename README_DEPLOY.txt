Hearty funnel v31q full drop

Upload/replace this funnel package as a full drop for the free meal plan funnel.
Includes:
- free-meal-plan.html
- js/hearty-funnel-v31.js
- js/hearty-meal-engine.js
- assets/

Notes:
- v31q includes the detailed one-day meal preview and app-phone restore in the app bridge.
- Meal engine file is carried forward from the current baseline, not redesigned in this pass.


v31s: Repositioned funnel as complete GLP-1 companion app. Free meal plan remains the entry hook. Added padded nav logo asset.


v31v: Reverted to previous site colour scheme, swapped in new phone image that better matches the site, and added extra-safe padded top logo asset to fix clipped Y.


v31w: Inserted shared core meal engine from hearty_meal_engine_v1_shared_core.zip. Funnel design remains v31v.


v31x: Fixed header/hero clipping, removed phone tags, rebuilt app section to sell complete GLP-1 companion app harder.


v31y: Fixed main logo clipping again with extra-padded nav asset, kept hero period on same line, and added more colour/energy to the right-side plan panel.


v31z: Replaced clipping image logo with CSS-rendered Hearty logo, made top Generate my free GLP-1 plan CTA primary, fixed CTA click to open/scroll to inline plan unlock, changed app section headline to Your Complete GLP-1 companion and added scannable feature cards.


v32b: Reverted section 2 to the previous layout, removed stray junk text/formatting, and left additional app screenshots in assets for future use.


v32c: Replaced Movement with Exercise / home and gym exercise, added more dark sections, and strengthened the gradient treatment on the meal generator box.


v32d: Added a clearer colour gradient to the right meal-plan box and fixed Generate Plan so it opens a visible setup panel before the email unlock flow.


v32e: Inserted the new generated site-matched Hearty logo into the top bar.


v32f: Added a large colourful CTA at the top of the right plan panel and fixed unreadable white-text capsules/kickers in the dark sections.


v32g: Replaced generated checkerboard logo with Jean-provided transparent logo, made header logo larger, and added a richer colourful gradient to the right meal-plan block.


v32h: Made header logo larger, tightened alignment of the right-panel capsules/boxes, and added more visible colour to the right meal-plan section.


v32i: Fixed capsule/pill alignment so they no longer overlap border lines in the right panel and other dark sections.


v32j: Final visual change — increased the header logo size substantially and gave the top bar more room so the logo reads properly.


v32k: Inserted the newly remade sharp Hearty logo with white background into the site header and increased its size again.


v32l: Inserted the latest transparent logo into the site header and increased its size again.


v32m: Fixed Generate My Plan buttons with explicit setup targets and a defensive inline fallback so the setup panel opens even if main JS fails or binds late.


v32n: Swapped in Jean's transparent logo asset with no background, made the header logo substantially larger, and added a 5-star visual to the review section.


v32o: Converted the meal plan setup into a full-screen builder window. The right hero panel now remains a preview/sales section, and all generate buttons open the full-window builder.


v32p: Redesigned the full-screen plan builder as a proper selection interface with dropdown fields for protein, sex, appetite, eating style and country. Generate buttons now open a cleaner modal builder.


v32q: Reworked plan builder into a low-friction 3-question flow: appetite, preferred protein foods, and eating style. Sex/protein target/country moved into Advanced settings.


v32r: Build My 7-Day Plan now renders the generated 7-day meal plan onscreen before the email/PDF unlock. Added shared meal-engine compatibility adapter.


v32s: Cleaned the messy builder/right-panel layout. Right panel is now a simple CTA section; builder is forced into a proper full-screen modal; generated 7-day plan appears in a clean section below the preview.


v32t: Fixed Generate buttons with direct fallback onclick/open function. Rebalanced hero columns and added compact sample-day/app-bridge preview to fill the right side.


v32u: Simplified right hero panel. Removed sample/example block, removed heavy container feel, and replaced trust chips with persuasive bullet points under the Generate button.


v32v: Replaced funnel-centric benefit bullet with customer-facing benefits and aligned the two hero sides/capsules so the hero feels less disjointed.


v32w: Final visual pass to align the two hero capsules — 'Complete GLP-1 companion app' and 'Free 7-day starter plan' — onto the same baseline.


v32x: Removed 'free' from the 'Why most meal plans...' heading, extended the dark solution section downward to better meet the proof block below, and changed the confusing app block to 'Easy install'. Also updated the phone caption.


v32y: Forced visible changes: removed FREE from the 'Why most meal plans...' heading, changed Routine/app-like wording to Easy install, changed install section wording, and extended the dark solution block downward.


v32z: Hard-fixed Generate buttons with delegated HTML-level modal opener. Buttons no longer rely on the main funnel JS binding.


v33a: Restored the missing quickSetupPanel builder modal. Generate button now has a real modal to open, while preserving previous text/layout fixes.


v33b: Reworked generate flow: better dietary questions and a full-screen generated plan viewer before email/PDF unlock. Added avoid-food and cooking-effort inputs, and mapped avoids/no-seafood into meal engine exclusions.


v33c: Rebuilt the plan-builder modal to mirror the meal engine instead of the generic survey style. Uses compact meal-engine-like cards, chip controls, country selector, liked proteins, avoids, and a cleaner action/footer area.


v33d: Simplified the meal-plan builder. Protein target is no longer a user question; it is calculated internally from sex (female 100g, male 120g default). Country is hidden/IP-based. Appetite was removed. Builder now asks sex, eating style, liked protein foods, and foods to avoid. Vegetables remain flexible, not selectable.


v33e: Removed visible Food list card, changed Foods to avoid to foods the user doesn't like, removed the bottom Your setup summary, and fixed generation by guarding removed preview DOM elements plus adding a fallback viewer plan so the modal never shows 'being prepared'.


v33f: Removed the foods-you-don't-like/avoid block from the builder. Added daily total protein display to each generated day card in the plan viewer and onscreen plan.


v33g: Added broader food preference setup beyond protein: carbs/starches, vegetables, and meal style preferences. Kept the builder compact and updated fallback plan generation and viewer chips to reflect these choices.


v33h: Implemented full Hearty meal engine integration in the funnel. Generate now calls window.HeartyMealEngine.generatePlan directly and renders the real engine plan in the full-screen viewer with meal titles, descriptions, components, daily protein, calories, carbs, fibre, and shopping-list preview. Added preference hints to the shared engine scoring instead of using the old fallback renderer.


v33j: Rebuilt from stable v33h. Added fuller ingredient choices for proteins, carbs/starches/fruit and vegetables. Removed the meal-style question completely; meal type tags are inferred from selected ingredients. Setup now opens as a locked full-screen modal and prevents background scroll/interaction.


v33k: Made sex selection obvious/sticky, added fuller vegetables and a fruit/snack preference block, and added lead-magnet nutrition guardrails. The funnel still uses the full meal engine, then adds top-up snacks where needed so female days target a 95–115g protein band with ~1220 kcal floor and male days target a 112–132g band with ~1450 kcal floor. Modal scroll resets to top on open.


v33l: Fixed the intake and nutrition guardrails. Vegetable intake now shows only plain vegetables, not internal meal-engine buckets. Meal tags are inferred behind the scenes. Fixed incorrect item-vs-gram units for fruit_choice and protein_powder top-ups. Guardrail allows at most one optional add-on per day and no duplicate plan rendering behind the modal.


v33m: Removed vegetarian/omnivore/no-seafood question and now infers food style from selected protein ingredients. Sex selector remains at the top of the form but no longer floats/sticks while scrolling. Improved guardrail add-ons, updated copy, added fibre guide and macro indicator row for protein/calories/carbs/fibre.


v33m final patch: cleaned remaining '3 quick questions' and outdated low-appetite setup copy. Strengthened calorie add-on logic and replaced protein shakes on days already above the protein band.


v33n: Final polish pass. Fibre now uses ranges instead of fixed targets; macro row is compact; Extra snack renamed Add-on snack and included in totals; guardrails respond to low fibre/calories/protein with one add-on only; wording softened from target/floor to guide/range.


v33o: Global-facing intake copy changed from 'White fish / hake' to 'White fish'. Region-specific wording can still appear later in generated meals/shopping where appropriate.


v33p: Final balance polish. Widened protein guide to avoid good days looking wrong, renamed Add-on snack to Balancing snack, strengthened fibre/calorie balancing snacks, and collapsed duplicate displayed vegetable lines in meal components.


v33q: Ingredient intake cleanup. Removed lean lamb and keep-carbs-lighter from user-facing intake. Expanded snack choices. Narrowed default selected proteins so pork/red meat/seafood do not appear unless selected. Added lamb exclusion support and avocado nutrition.


v33r: Snack wording cleanup. Output now labels snacks as Snack 1 and Snack 2 instead of Snack/Add-on/Balance. The second snack uses a food-based title and says 'Included in the totals.'


v33s: Fixed the plan viewer continue flow. The 'Continue to PDF + shopping list' button now opens the email/PDF/shopping unlock panel inside the modal instead of closing the modal and jumping back to the page.
