HEARTY TRACKING V1.2 SAFE RESTORE

Upload only these two files:
- free-meal-plan.html
- hearty-tracking.js

Do not upload or replace service-worker.js.

This package uses the working v3.5.0 free-meal-plan.html as the base and only adds tracking hooks.
It restores the working generator flow while keeping tracking events:
- page_view
- free_meal_page_view
- free_meal_started
- free_meal_generated
- free_meal_app_cta_clicked
- checkout_clicked

Test URL:
https://www.hearty.health/free-meal-plan.html?src=test&campaign=tracking_v1&v=safe_restore_1
