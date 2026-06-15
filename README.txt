HEARTY LOGIN SIGNUP MESSAGE FIX

Upload only:

/login.html

Fixes:
- After creating an account, the success message no longer disappears.
- Shows clear instruction to check email confirmation.
- Gives clearer sign-in error if email confirmation is still pending.
- Still uses inline JavaScript, so it does not depend on /js/hearty-auth-soft.v1.js.

After upload:
1. Open /login.html?mode=signup
2. Create account
3. Confirm email if Supabase requires confirmation
4. Sign in
