# HEARTY Step 1 — Baseline Stabilisation Audit

**Source uploaded:** `hearty-main (8).zip`  
**Step:** RC8-A Baseline + Settings Repair  
**Build rule:** one safe change only before feature work.

---

## What was found

The uploaded app contains **309 files**.

The current `settings.html` was contaminated:

```text
settings.html title before: Hearty — Home
home.html title: Hearty — Home
settings/home similarity ratio: 0.999986
```

This means `settings.html` was effectively the Home page again.

---

## What this step changes

Only this app file is changed:

```text
settings.html
```

It is replaced with the previously fixed real Settings page.

No login system was changed.  
No meal engine was changed.  
No theme system was changed.  
No coach dashboard was added.  
No Supabase schema was changed.  
No service worker was changed.

---

## Why this comes first

Before building login, Meals, themes or the coach dashboard, the current app baseline must stop carrying obvious page contamination.

If we build on top of a broken `settings.html`, future changes become harder to debug.

---

## Current feature areas still to build

## 1. Individual login system

Current login work exists, but it still needs to become the final individual account system:

```text
email + password registration
email + password login
Google login
forgot password
session guard
logout
profile creation
lifetime access / entitlement foundation
coach/client role support later
```

## 2. Meals page upgrade

The app contains multiple meal engine files. These need consolidation into one shared engine.

Meal-related files currently found:

```text
free-meal-plan.html
hearty-free-meal-engine-v24.js
hearty-meal-engine-final.js
hearty-meals-db-bridge.js
lead-magnet-meals-engine.js
meals-bridge.js
meals-engine.js
meals-main.js
meals-onboarding.html
meals-page-preboot.js
meals-page-refined.js
meals.html
```

## 3. Theme / brand customisation system

The app contains multiple theme-related files. This needs to become one brand/customisation layer.

Theme-related files currently found:

```text
hearty-theme.css
hearty-theme.js
css/hearty-theme.css
js/hearty-theme.js
```

## 4. Coach dashboard

Coach dashboard production work exists in previous RC packages, but it is not merged into this uploaded baseline yet.

It should be added only after:
1. baseline is clean
2. login works
3. data model is clear
4. theme/brand system has a stable foundation

---

## Next step after this package

**Step 2: Individual Login System**

Build as a controlled patch around:

```text
login.html
new-password.html or reset-password.html if needed
auth guard script
profile/entitlement SQL
```

Do not touch Meals, themes or dashboard in Step 2.
