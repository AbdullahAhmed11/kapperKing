import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno' // Use deno target
import { corsHeaders } from '../_shared/cors.ts'

// Initialize Stripe (requires STRIPE_SECRET_KEY env var)
const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(), // Use Fetch API for Deno
})

// Initialize Supabase client (requires SUPABASE_URL and SUPABASE_ANON_KEY env vars)
// IMPORTANT: Use the Service Role Key for admin actions if needed later,
// but for user signup and initial client record creation, anon key might suffice
// depending on RLS. For simplicity here, using anon key.
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
)

// Default trial duration (can be overridden if fetched based on priceId)
const DEFAULT_TRIAL_DAYS = 14;

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      email, password, ownerName, businessName, phoneNumber, // Step 1
      salonName, address, city, postalCode, country, salonPhone, website, // Step 2
      priceId, paymentMethodId // Step 3
    } = await req.json()

    // --- 1. Create Supabase User ---
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: ownerName, // Store name in metadata
          company_name: businessName,
          // Add other metadata if needed
        },
      },
    })

    if (authError || !authData?.user) {
      console.error('Supabase Auth Error:', authError)
      return new Response(JSON.stringify({ error: authError?.message || 'Failed to create user account.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    const userId = authData.user.id

    let stripeCustomerId: string | undefined;

    try {
      // --- 2. Create/Update Stripe Customer ---
      // Check if customer exists
      const existingCustomers = await stripe.customers.list({ email: email, limit: 1 });
      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0].id;
        // Attach payment method to existing customer
        await stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId });
        // Update default payment method
        await stripe.customers.update(stripeCustomerId, {
          invoice_settings: { default_payment_method: paymentMethodId },
          name: ownerName, // Update name just in case
        });
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email: email,
          name: ownerName,
          payment_method: paymentMethodId,
          invoice_settings: { default_payment_method: paymentMethodId },
        });
        stripeCustomerId = customer.id;
      }

      // --- 3. Create Stripe Subscription ---
      // TODO: Fetch trial duration based on priceId if it varies
      const trialDuration = DEFAULT_TRIAL_DAYS; 
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: priceId }],
        trial_period_days: trialDuration,
        payment_behavior: 'default_incomplete', // Recommended for SCA
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'], // Useful for handling immediate payment confirmation if needed
      });

      // --- 4. Store IDs and Initial Data in Database ---
      // IMPORTANT: Assumes a 'clients' table exists with these columns. Adjust table/column names as needed.
      // Use service_role key if RLS prevents direct insert after signup
      const { error: clientError } = await supabase
        .from('clients') // Or 'profiles' or your user table
        .insert({
          user_id: userId, // Link to the auth user
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: subscription.id,
          subscription_status: subscription.status, // Should be 'trialing'
          plan_id: priceId, // Store the Stripe Price ID or map back to your internal ID
          trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          // Store other client details collected in Step 1
          firstName: ownerName.split(' ')[0] || '', // Simple split for first name
          lastName: ownerName.split(' ').slice(1).join(' ') || '', // Simple split for last name
          email: email,
          phone: phoneNumber,
          companyName: businessName,
          // Add other fields like marketingConsent if collected
        });

       if (clientError) throw clientError; // Throw to catch block below

       // Create initial salon record
       const { error: salonError } = await supabase
         .from('salons')
         .insert({
            client_id: userId, // Link salon to the user/client ID
            name: salonName,
            address: address,
            city: city,
            postalCode: postalCode,
            country: country,
            phone: salonPhone,
            website: website,
            // Add other default salon fields if necessary
         });

        if (salonError) throw salonError; // Throw to catch block below


      // --- Success ---
      return new Response(JSON.stringify({ 
          message: 'Subscription created successfully!', 
          userId: userId, 
          subscriptionId: subscription.id 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })

    } catch (stripeOrDbError) {
      console.error('Stripe/DB Error:', stripeOrDbError)
      // Optional: Attempt to clean up - e.g., delete Supabase user if Stripe failed? Complex.
      // If Stripe customer was created but subscription failed, maybe delete customer?
      // For now, just return the error.
      return new Response(JSON.stringify({ error: stripeOrDbError.message || 'Failed during Stripe or database operation.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

  } catch (error) {
    console.error('General Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})