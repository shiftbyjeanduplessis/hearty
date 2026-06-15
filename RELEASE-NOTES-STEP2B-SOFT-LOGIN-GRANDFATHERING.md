# HEARTY Step 2B Test Checklist

## 1. Run migration

Run on staging first:

```sql
supabase/migrations/010_soft_login_grandfathering.sql
```

## 2. Add a test grandfathered customer

Insert a test purchase email:

```sql
insert into public.grandfathered_customers (email, source, notes)
values ('your-test-email@example.com', 'manual test', 'Step 2B test')
on conflict (email_normalized, entitlement_key)
do update set status='active', updated_at=now();
```

## 3. Deploy Step 2B files

Upload the patch files.

## 4. Existing user test

Open `/home.html` while signed out.

Expected:
- Home still opens.
- No forced login.
- A “Secure your Hearty account” card appears.

## 5. Account creation test

Open `/login.html?mode=signup`.

Create an account with the same email you inserted into `grandfathered_customers`.

Expected:
- Account is created.
- The RPC claims access.
- A row appears in `user_entitlements`.
- The app redirects to Home.

## 6. Sign-in test

Sign out, then sign in again.

Expected:
- Account signs in.
- Existing local app data remains on the same device.
- Settings shows account prompt/status.

## 7. Access recovery test

Open `/login.html?mode=access`.

Submit:
- purchase email
- current account email
- message

Expected:
- A row appears in `access_recovery_requests`.

## 8. Important expected behaviour

This step should NOT:
- redirect signed-out users away from Home
- require payment access
- block old users
- touch Meals
- touch Coach Dashboard
