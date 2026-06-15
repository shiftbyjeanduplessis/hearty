HEARTY LOGIN INLINE FIX

Upload this one file only:

/login.html

This version has the auth/tab JavaScript embedded inside the page, so the Sign in / Create account tabs work even if /js/hearty-auth-soft.v1.js was missing or uploaded to the wrong path.

After upload, hard-refresh:
https://hearty.health/login.html?mode=signup
