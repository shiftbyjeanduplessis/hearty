Hearty Onboarding v39 patch

Scope:
- General onboarding stays separate from Meals onboarding.
- Home onboarding now collects app-wide basics only: name, country/region, units, optional weight/goal, optional medication label and reminder rhythm.
- Meals no longer forces meals-onboarding before opening. Meals setup remains optional and separate.
- Medication name supports Other / custom label. Schedule supports set later, weekly, every 2 weeks, twice weekly, every X days, custom next date, no fixed schedule, not using medication.
- Saves canonical basic profile to hearty_basic_user_profile_v1 while preserving existing legacy keys.

Changed files:
- home.html
- meals.html
- meals-onboarding.html
- js/hearty-home-v15-refactor-aesthetic.js
