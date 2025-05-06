# Backend Implementation Notes for Account Settings & Stripe Integration

**IMPORTANT: API Key Management**

*   **Stripe Secret Key (`STRIPE_SECRET_KEY`) and Webhook Secret (`STRIPE_WEBHOOK_SECRET`) MUST be stored securely as environment variables on the backend.** They should NEVER be exposed to the frontend or fetched dynamically from database settings at runtime.
*   **Stripe Publishable Key (`VITE_STRIPE_PUBLISHABLE_KEY`)** should be stored as an environment variable accessible during the frontend build process (e.g., in `.env`).
*   The Stripe Configuration section in the Platform Settings UI is primarily for **reference and initial setup guidance**, not for runtime key fetching.


# Backend Implementation Notes for Account Settings (Part 1)

This document outlines the necessary backend functionality (likely Supabase Edge Functions) required to support the features implemented in the frontend `src/pages/platform/AccountSettings.tsx` component.

## 1. Avatar Upload

*   **Requirement:** Allow users to upload and update their profile avatar.
*   **Frontend Action:** User selects an image file via `<input type="file">`.
*   **Backend Steps:**
    1.  Create an endpoint/function (e.g., Supabase Edge Function `upload-avatar`) that accepts the image file.
    2.  Upload the received file to a designated bucket in Supabase Storage (or other cloud storage). Ensure appropriate access controls (e.g., public read access for avatars).
    3.  Retrieve the public URL of the uploaded image.
    4.  Use the Supabase client (authenticated as the user) to update the user's metadata: `supabase.auth.updateUser({ data: { avatar_url: publicImageUrl } })`.
    5.  Return the new `avatar_url` or a success status to the frontend.

## 2. Profile Update (Display Name)

*   **Requirement:** Allow users to update their display name.
*   **Frontend Action:** User modifies the "Display Name" input field and submits the main form.
*   **Backend Steps:**
    1.  Use the Supabase client (authenticated as the user) to update the user's metadata: `supabase.auth.updateUser({ data: { full_name: newDisplayName } })`.
    *   *Note:* This might be achievable directly from the frontend if Row Level Security (RLS) permits users to update their own metadata. However, a dedicated backend function could be used for consistency or if more complex logic is needed.

## 3. Password Change

*   **Requirement:** Allow users to change their login password securely.
*   **Frontend Action:** User fills "Current Password", "New Password", and "Confirm New Password" fields and submits the main form.
*   **Backend Steps:**
    1.  **Crucially, current password verification MUST happen on the backend.** Do not trust any frontend checks.
    2.  Create a Supabase Edge Function (e.g., `change-password`).
    3.  The frontend calls this function, passing the `currentPassword` and `newPassword` values from the form.
    4.  The backend function performs the following:
        *   **Securely verify `currentPassword`:** Attempt to sign in the user with their email and the provided `currentPassword` using the Supabase client. If successful, the password is correct. Alternatively, use a dedicated password verification endpoint if Supabase provides one. **Never compare password hashes directly unless you are an expert in secure password handling.**
        *   If verification succeeds, call `supabase.auth.updateUser({ password: newPassword })` using the authenticated user's context or an admin client if necessary.
        *   Return a success or error status to the frontend.

## 4. Email Change Request

*   **Requirement:** Allow users to change their login email address, requiring verification of the new email.
*   **Frontend Action:** User clicks "Change Email", enters the new email and their current password in a dialog, and submits the dialog form.
*   **Backend Steps:**
    1.  **Current password verification MUST happen on the backend.**
    2.  Create a Supabase Edge Function (e.g., `request-email-change`).
    3.  The frontend calls this function, passing the `newEmail` and `currentPasswordForEmail` from the dialog.
    4.  The backend function performs the following:
        *   Securely verify `currentPasswordForEmail` (similar method as password change).
        *   If verification succeeds, call `supabase.auth.updateUser({ email: newEmail })`. Supabase Auth automatically handles sending a confirmation email to the *new* address. The email change is **not finalized** until the user clicks the link in that confirmation email.
        *   Return a success or error status to the frontend, indicating whether the confirmation email process was *initiated*.

## 5. Admin Invitation

*   **Requirement:** Allow an existing admin to invite a new user as an administrator.
*   **Frontend Action:** User clicks "Add New Admin", enters the target email address in a dialog, and submits the dialog form.
*   **Backend Steps:**
    1.  Create a Supabase Edge Function (e.g., `invite-admin`). This function **must run with elevated privileges** (e.g., using the `service_role` key) because it uses admin-level Supabase Auth methods. **Secure this function appropriately.**
    2.  The frontend calls this function, passing the `adminEmail` to invite.
    3.  The backend function performs the following:
        *   Verify that the user calling the function is indeed an authorized administrator (check their role/claims).
        *   Check if an account with `adminEmail` already exists. Handle this case appropriately (e.g., return an error, or potentially update the existing user's role if desired, though invitation is usually for new users).
        *   Use the Supabase Admin client: `supabase.auth.admin.inviteUserByEmail(adminEmail, { data: { role: 'admin' } })`. The `data` option can be used to set initial user metadata, like assigning an 'admin' role upon signup. This method sends a standard Supabase invitation email.
        *   *(Alternative)*: Implement a custom invitation flow (e.g., generate a unique invite token, store it, send a custom email with a link containing the token, and have a separate endpoint/page to handle token verification and user signup/role assignment).
        *   Return a success or error status to the frontend.

## 6. List/Manage Existing Admins

*   **Requirement:** Display a list of current administrators and potentially allow removal.
*   **Frontend Action:** Displaying the list within the "Manage Administrators" section.
*   **Backend Steps:**
    1.  **List Admins:**
        *   Create a Supabase Edge Function (e.g., `list-admins`) or perform a secure query from the frontend if RLS allows.
        *   This function needs elevated privileges (like `service_role`) to query all users.
        *   Fetch users from `auth.users`. Filter them based on how admin status is determined (e.g., `user_metadata.role === 'admin'`, or membership in a specific 'admins' table).
        *   Return the list of admin emails/names/IDs to the frontend.
    2.  **Remove Admin:**
        *   Requires another secure backend function (e.g., `remove-admin`) with elevated privileges.
        *   The frontend calls this function, passing the user ID of the admin to be removed.
        *   The backend function verifies the calling user's permissions.
        *   It then either deletes the user (`supabase.auth.admin.deleteUser(userId)`) or updates their role/metadata to remove admin privileges (`supabase.auth.admin.updateUserById(userId, { user_metadata: { role: 'user' } })`). **Be careful with user deletion.** Updating roles is often safer.
        *   Return success/error.

\n\n## 7. Create Subscription (Signup Flow)\n\n*   **Requirement:** Handle new user signup, Stripe customer creation, and Stripe subscription creation with a trial period.\n*   **Frontend Action:** User submits the signup form (`src/pages/auth/SignUp.tsx`) after filling details and providing payment info via Stripe Elements. The form sends user details (name, email, password), the selected `planId`, and the generated Stripe `paymentMethodId` to the backend.\n*   **Backend Steps:**\n    1.  Create a Supabase Edge Function (e.g., `create-subscription`). **This function needs to handle multiple critical steps and potential errors.**\n    2.  **Input:** Receive `email`, `password`, `firstName`, `lastName`, `companyName` (optional), `planId`, `paymentMethodId`.\n    3.  **Create Supabase User:**\n        *   Call `supabase.auth.signUp({ email, password, options: { data: { full_name: \`${firstName} ${lastName}\`, company_name: companyName } } })`.\n        *   Handle potential errors (e.g., email already exists).\n        *   Get the `userId` from the successful signup response.\n    4.  **Create/Update Stripe Customer:**\n        *   Use the Stripe Node library (`const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);`).\n        *   Check if a Stripe Customer already exists with this email: `stripe.customers.list({ email: email, limit: 1 })`.\n        *   If not exists, create one: `stripe.customers.create({ email: email, name: \`${firstName} ${lastName}\`, payment_method: paymentMethodId, invoice_settings: { default_payment_method: paymentMethodId } })`.\n        *   If exists, potentially update their details or attach the new payment method: `stripe.paymentMethods.attach(paymentMethodId, { customer: existingCustomerId });` and `stripe.customers.update(existingCustomerId, { invoice_settings: { default_payment_method: paymentMethodId } });`.\n        *   Get the `stripeCustomerId`.\n    5.  **Create Stripe Subscription:**\n        *   Retrieve the corresponding Stripe Price ID for the given `planId` (this mapping needs to be stored securely, e.g., in environment variables or a database table mapping your internal plan IDs to Stripe Price IDs).\n        *   Create the subscription: `stripe.subscriptions.create({ customer: stripeCustomerId, items: [{ price: stripePriceId }], trial_period_days: trialDuration, // Get trialDuration from plan details or config payment_behavior: 'default_incomplete', // Important for handling SCA payment_settings: { save_default_payment_method: 'on_subscription' }, expand: ['latest_invoice.payment_intent'] })`.\n        *   The `trial_period_days` should match the trial duration configured for the plan.\n    6.  **Store Data in Database:**\n        *   In your `clients` table (or equivalent), create/update the record for the new `userId`.\n        *   Store `planId`, `stripeCustomerId`, `stripeSubscriptionId`, `subscriptionStatus` ('trialing'), and `trialEndsAt` (calculate based on `trial_period_days`).\n    7.  **Return Success/Error:** Send a success response to the frontend if all steps complete. Handle and return specific errors if any step fails (e.g., payment method invalid, Stripe API error, database error).\n\n*   **Security:** Ensure the Stripe Secret Key and Supabase Service Role Key are stored securely as environment variables on the backend and never exposed to the frontend.\n

\n\n## 8. Create Stripe Customer Portal Session\n\n*   **Requirement:** Allow authenticated clients to securely manage their subscription (update payment methods, view invoices, cancel) via Stripe's hosted portal.\n*   **Frontend Action:** User clicks the "Manage Subscription & Billing" button on the `/salon/subscription` page.\n*   **Backend Steps:**\n    1.  Create a Supabase Edge Function (e.g., `create-customer-portal-session`).\n    2.  **Input:** The function needs to securely identify the logged-in user (e.g., via Supabase Auth context) and retrieve their corresponding `stripeCustomerId` (stored in your database during signup/subscription creation).\n    3.  **Create Portal Session:**\n        *   Use the Stripe Node library.\n        *   Call `stripe.billingPortal.sessions.create({ customer: stripeCustomerId, return_url: 'YOUR_RETURN_URL' })`. Replace `'YOUR_RETURN_URL'` with the URL on your site where users should be redirected after leaving the portal (e.g., `https://yourdomain.com/salon/subscription`).\n    4.  **Return URL:** Return the `url` property from the created portal session object to the frontend.\n    5.  **Frontend Redirect:** The frontend receives the URL and redirects the user using `window.location.href = portalUrl;`.\n\n*   **Security:** Ensure the backend function verifies the user is authenticated and only creates a portal session for their own `stripeCustomerId`. Store the Stripe Secret Key securely.\n



## 7. Create Subscription (Signup Flow)

*   **Requirement:** Handle new user signup, Stripe customer creation, and Stripe subscription creation with a trial period.
*   **Frontend Action:** User submits the signup form (`src/pages/auth/SignUp.tsx`) after filling details and providing payment info via Stripe Elements. The form sends user details (name, email, password, salon details), the selected Stripe `priceId`, and the generated Stripe `paymentMethodId` to the backend.
*   **Backend Steps:**
    1.  Create a Supabase Edge Function (e.g., `create-subscription`). **This function needs to handle multiple critical steps and potential errors.**
    2.  **Input:** Receive `email`, `password`, `ownerName`, `businessName`, `phoneNumber`, `salonName`, `address`, `city`, `postalCode`, `country`, `salonPhone`, `website`, `priceId`, `paymentMethodId`.
    3.  **Create Supabase User:**
        *   Call `supabase.auth.signUp({ email, password, options: { data: { full_name: ownerName, company_name: businessName } } })`.
        *   Handle potential errors (e.g., email already exists).
        *   Get the `userId` from the successful signup response.
    4.  **Create/Update Stripe Customer:**
        *   Use the Stripe Node library (`const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);`).
        *   Check if a Stripe Customer already exists with this email: `stripe.customers.list({ email: email, limit: 1 })`.
\n\n## Database Schema Notes\n\n*   Ensure tables like `clients` (or `profiles`), `salons`, `subscriptions`, `services`, `products`, `staff`, `salon_pages`, `salon_gallery_images`, `salon_testimonials` exist with appropriate columns.\n*   A `salon_websites` table is crucial for storing microsite configurations per salon. Key columns include:\n    *   `salon_id` (foreign key to `salons.id`)\n    *   `is_published` (boolean)\n    *   `theme_config` (jsonb - storing colors, fonts, layout choices)\n    *   `seo_config` (jsonb - storing title, description, keywords)\n    *   `navigation` (jsonb - array of {label, url})\n    *   `social_links` (jsonb - object like {facebook: url, ...})\n    *   `hero_image_url`, `hero_title`, `hero_subtitle`, `hero_description` (text/varchar)\n    *   `custom_css` (text)\n    *   `custom_scripts` (text)\n*   Adjust Edge Function database queries (`insert`, `select`, `update`) to match your exact table and column names.\n
\n\n## 10. Cancel Subscription\n\n*   **Requirement:** Allow clients to cancel their subscription (typically at the end of the current billing period).\n*   **Frontend Action:** User clicks "Cancel Plan" button on `/salon/subscription` page, confirms via modal.\n*   **Backend Steps:**\n    1.  Create a Supabase Edge Function (e.g., `cancel-subscription`).\n    2.  **Input:** Securely identify the logged-in user and retrieve their `stripeSubscriptionId` from your database.\n    3.  **Cancel via Stripe:** Call `stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })`. This is generally preferred over immediate deletion (`stripe.subscriptions.del`) as it allows access until the period ends.\n    4.  **Update Local DB (Optional but Recommended):** Immediately update the subscription status in your database to 'canceled' or 'pending_cancellation' for faster UI feedback.\n    5.  **Return Success/Error:** Indicate if the cancellation request was successful.\n    *   **Note:** Rely on the `customer.subscription.updated` or `customer.subscription.deleted` webhook event for the definitive state change in your database.\n\n
\n\n## 11. Change Plan\n\n*   **Requirement:** Allow clients to switch between different subscription plans.\n*   **Frontend Action:** User clicks "Change Plan" button on `/salon/subscription` page. This likely opens a modal or redirects to a page showing available plans.\n*   **Backend Steps (Option A: Custom Flow):**\n    1.  Create a Supabase Edge Function (e.g., `change-subscription-plan`).\n    2.  **Input:** Securely identify the logged-in user, retrieve their `stripeSubscriptionId`, and receive the `newPriceId` for the desired plan from the frontend.\n    3.  **Update via Stripe:** Call `stripe.subscriptions.update(subscriptionId, { items: [{ id: currentSubscriptionItemId, price: newPriceId }], proration_behavior: 'create_prorations' })`. You need to get the `currentSubscriptionItemId` from the existing subscription object first (`stripe.subscriptions.retrieve(subscriptionId)`).\n    4.  **Update Local DB:** Update the `planId` and potentially `subscriptionStatus` in your database.\n    5.  **Return Success/Error:** Indicate success/failure.\n*   **Backend Steps (Option B: Via Stripe Customer Portal):**\n    1.  **Configure Portal:** In your Stripe Billing settings, configure the Customer Portal to allow plan changes.\n    2.  **Use Portal Session:** The existing `create-customer-portal-session` function can be used. The user changes their plan directly within the Stripe-hosted portal.\n    3.  **Webhook:** Rely on the `customer.subscription.updated` webhook event to update the `planId` and status in your local database when the change occurs.\n    *   **Recommendation:** Using the Stripe Customer Portal (Option B) is often simpler and less error-prone for plan changes.\n\n
\n\n## 12. Stripe Webhook Handler\n\n*   **Requirement:** Keep the application database synchronized with Stripe events.\n*   **Frontend Action:** None (Backend only).\n*   **Backend Steps:**\n    1.  Create a Supabase Edge Function (e.g., `stripe-webhook`).\n    2.  **Configure in Stripe:** Add the deployed function's URL as a webhook endpoint in your Stripe Dashboard. Select the events to listen for (e.g., `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`, `customer.subscription.trial_will_end`).\n    3.  **Verify Signature:** Use `stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET)` to verify the incoming request signature (`sig` usually comes from the `Stripe-Signature` header). **This is crucial for security.**\n    4.  **Process Event:** Use a `switch` statement on `event.type`:\n        *   `invoice.paid`: Update subscription status to 'active', update `currentPeriodEnd`.\n        *   `invoice.payment_failed`: Update subscription status to 'past_due'. Trigger notifications/emails.\n        *   `customer.subscription.updated`: Handle changes like trial ending (status -> 'active'), plan changes, or cancellations (`cancel_at_period_end: true`). Update status, `currentPeriodEnd`, `planId`, etc., in your database.\n        *   `customer.subscription.deleted`: Update status to 'canceled'.\n        *   `customer.subscription.trial_will_end`: Trigger reminder notifications/emails.\n    5.  **Return Success:** Return a `200 OK` response to Stripe quickly to acknowledge receipt. Handle actual database updates asynchronously if they might take time.\n\n
\n\n## Deployment & Setup Checklist\n\n1.  **Deploy Edge Functions:**\n    *   Deploy `create-subscription` using Supabase CLI: `supabase functions deploy create-subscription --no-verify-jwt` (Add proper auth checks later if removing `--no-verify-jwt`).\n    *   Deploy other functions (`get-subscription-details`, `create-customer-portal-session`, `cancel-subscription`, `stripe-webhook`, etc.) as they are created.\n2.  **Set Environment Variables (Supabase Project Settings -> Edge Functions -> `create-subscription` -> Secrets):**\n    *   `STRIPE_SECRET_KEY`: Your Stripe Secret Key (e.g., `sk_test_...` or `sk_live_...`).\n    *   `SUPABASE_URL`: Your Supabase project URL.\n    *   `SUPABASE_ANON_KEY`: Your Supabase project anon key.\n    *   `STRIPE_WEBHOOK_SECRET`: Your Stripe Webhook Signing Secret (for the `stripe-webhook` function, e.g., `whsec_...`).\n    *   *(Optional/If needed)* `SUPABASE_SERVICE_ROLE_KEY`: If functions require admin-level database/auth access.\n3.  **Database Schema:**\n    *   Verify/create necessary tables (e.g., `clients`/`profiles`, `salons`, `subscriptions`).\n    *   Ensure tables have the columns expected by the Edge Functions (e.g., `user_id`, `stripe_customer_id`, `stripe_subscription_id`, `subscription_status`, `plan_id`, `trial_ends_at`, address fields, etc.). Adjust function queries if schema differs.\n4.  **Stripe Configuration:**\n    *   Create Products in Stripe for each plan (Basic, Professional, Enterprise).\n    *   Create corresponding Prices (monthly) for each Product. Note the Price IDs (e.g., `price_...`).\n    *   Configure a Webhook endpoint in Stripe pointing to your deployed `stripe-webhook` function URL. Select the necessary events (e.g., `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`, `customer.subscription.trial_will_end`).\n5.  **Frontend Updates:**\n    *   Replace placeholder Stripe Price IDs in `src/pages/marketing/Pricing.tsx` with your actual Price IDs.\n    *   Update `src/pages/salon/Subscription.tsx` to fetch data from the `get-subscription-details` endpoint and call the `create-customer-portal-session` / `cancel-subscription` endpoints.\n    *   Ensure `src/pages/auth/SignUp.tsx` uses the correct Supabase client instance (`@/lib/supabase`).\n    *   Update the frontend `AuthProvider` (`src/lib/auth.tsx`) to use real Supabase authentication and state listeners (`onAuthStateChange`) for persistent login.\n
        *   If not exists, create one: `stripe.customers.create({ email: email, name: ownerName, payment_method: paymentMethodId, invoice_settings: { default_payment_method: paymentMethodId } })`.
        *   If exists, attach the new payment method: `stripe.paymentMethods.attach(paymentMethodId, { customer: existingCustomerId });` and update the default: `stripe.customers.update(existingCustomerId, { invoice_settings: { default_payment_method: paymentMethodId } });`.
        *   Get the `stripeCustomerId`.
    5.  **Create Stripe Subscription:**
        *   **Map `priceId`:** Use the received `priceId` directly. Ensure this corresponds to a valid Price ID in your Stripe account.
        *   **Get Trial Duration:** Fetch the `trialDuration` associated with this plan/price from your database or configuration.
        *   Create the subscription: `stripe.subscriptions.create({ customer: stripeCustomerId, items: [{ price: priceId }], trial_period_days: trialDuration, payment_behavior: 'default_incomplete', payment_settings: { save_default_payment_method: 'on_subscription' }, expand: ['latest_invoice.payment_intent'] })`.
    6.  **Store Data in Database:**
        *   Create/Update `clients` record for the new `userId`. Store `stripeCustomerId`, `subscriptionStatus` ('trialing').
        *   Create `salons` record associated with the `userId`. Store `salonName`, `address`, `city`, etc.
        *   Store `stripeSubscriptionId`, `planId` (your internal ID, mapped from `priceId`), `trialEndsAt` in a `subscriptions` table linked to the client/user.
    7.  **Return Success/Error:** Handle errors gracefully at each step.




## 9. Fetch Client Subscription Data

*   **Requirement:** Provide data for the client's subscription page (`/salon/subscription`).
*   **Frontend Action:** Page load triggers a request to this endpoint.
*   **Backend Steps:**
    1.  Create a Supabase Edge Function (e.g., `get-subscription-details`).
    2.  **Input:** Securely identify the logged-in user (e.g., via Supabase Auth context).
    3.  **Fetch Data:**
        *   Retrieve the user's `stripeCustomerId` and `stripeSubscriptionId` from your database.
        *   Call `stripe.subscriptions.retrieve(subscriptionId, { expand: ['plan.product'] })` to get status, trial end, current period end, plan details (including Stripe Product name).
        *   Call `stripe.customers.retrieve(customerId, { expand: ['invoice_settings.default_payment_method'] })` to get default payment method details (brand, last4, expiry).
        *   Call `stripe.invoices.list({ customer: customerId, limit: 10 })` to get recent invoices.
        *   Fetch usage data (staff count, appointments, storage) from your application's database based on the user/salon ID.
    4.  **Return Data:** Compile and return the necessary data (plan name, status, dates, payment method info, usage stats, invoices list) to the frontend.




## 10. Cancel Subscription

*   **Requirement:** Allow clients to cancel their subscription.
*   **Frontend Action:** User clicks "Cancel Plan" button on `/salon/subscription` page, confirms via modal.
*   **Backend Steps:**
    1.  Create a Supabase Edge Function (e.g., `cancel-subscription`).
    2.  **Input:** Securely identify the logged-in user and retrieve their `stripeSubscriptionId`.
    3.  **Cancel via Stripe:** Call `stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })`. This is generally preferred over immediate deletion (`stripe.subscriptions.del`) as it allows access until the period ends.
    4.  **Update Local DB (Optional but Recommended):** Immediately update the subscription status in your database to 'canceled' or 'pending_cancellation' for faster UI feedback.
    5.  **Return Success/Error:** Indicate if the cancellation request was successful.
    *   **Note:** Rely on the `customer.subscription.updated` or `customer.subscription.deleted` webhook event for the definitive state change in your database.




## 11. Stripe Webhook Handler

*   **Requirement:** Keep the application database synchronized with Stripe events.
*   **Frontend Action:** None (Backend only).
*   **Backend Steps:**
    1.  Create a Supabase Edge Function (e.g., `stripe-webhook`).
    2.  **Configure in Stripe:** Add the deployed function's URL as a webhook endpoint in your Stripe Dashboard. Select the events to listen for (e.g., `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`, `customer.subscription.trial_will_end`).
    3.  **Verify Signature:** Use `stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET)` to verify the incoming request signature (`sig` usually comes from the `Stripe-Signature` header). **This is crucial for security.**
    4.  **Process Event:** Use a `switch` statement on `event.type`:
        *   `invoice.paid`: Update subscription status to 'active', update `currentPeriodEnd`.
        *   `invoice.payment_failed`: Update subscription status to 'past_due'. Trigger notifications/emails.
        *   `customer.subscription.updated`: Handle changes like trial ending (status -> 'active'), plan changes, or cancellations (`cancel_at_period_end: true`). Update status, `currentPeriodEnd`, `planId`, etc., in your database.
        *   `customer.subscription.deleted`: Update status to 'canceled'.
        *   `customer.subscription.trial_will_end`: Trigger reminder notifications/emails.
    5.  **Return Success:** Return a `200 OK` response to Stripe quickly to acknowledge receipt. Handle actual database updates asynchronously if they might take time.

