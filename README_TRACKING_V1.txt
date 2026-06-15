HEARTY TRACKING V1

Changed files:
- free-meal-plan.html
- hearty-tracking.js
- service-worker.js
- SUPABASE_SQL_HEARTY_EVENTS.sql

What this tracks:
- page_view
- free_meal_page_view
- free_meal_started
- free_meal_generated
- free_meal_app_cta_clicked
- checkout_clicked

What this does NOT track:
- medication dose
- symptoms in detail
- medical history
- weight
- photos
- generated meal-plan text/content

Deploy order:
1. Run SUPABASE_SQL_HEARTY_EVENTS.sql in Supabase SQL Editor.
2. Upload/deploy these changed files.
3. Open:
   https://www.hearty.health/free-meal-plan.html?src=test&campaign=tracking_v1
4. Generate a plan.
5. Click a Hearty checkout/app CTA.
6. Check Supabase > hearty_events for rows.

Useful Supabase check query:

select event_name, source, campaign, count(*) as total
from public.hearty_events
where created_at >= now() - interval '24 hours'
group by event_name, source, campaign
order by total desc;

Source link examples:
https://www.hearty.health/free-meal-plan.html?src=fb_page_pinned&campaign=free_meal_generator
https://www.hearty.health/free-meal-plan.html?src=fb_mounjaro_diet_recipes&campaign=low_appetite
https://www.hearty.health/free-meal-plan.html?src=fb_zepbound_support_success&campaign=low_appetite
