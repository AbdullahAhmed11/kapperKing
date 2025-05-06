import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from "https://esm.sh/stripe@11.1.0?target=deno"; // Use Stripe Deno build
import { corsHeaders } from '../_shared/cors.ts';

console.log("Create Stripe Connect Account function booting up...");

// Initialize Stripe client
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2022-11-15', // Use your desired API version
});

interface ConnectPayload {
  salonId: string;
  // Include other details if needed for account creation (e.g., email, country)
  // These might be fetched from the salon record instead
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { salonId }: ConnectPayload = await req.json();
    if (!salonId) throw new Error("Salon ID is required.");

    // Create Supabase client with service role key to update salon record
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Optional: Check if salon already has a connect ID
    const { data: existingSalon, error: fetchError } = await supabaseAdmin
       .from('salons')
       .select('stripe_connect_account_id, email, country') // Fetch details needed by Stripe
       .eq('id', salonId)
       .single();

    if (fetchError || !existingSalon) throw new Error(`Salon not found: ${fetchError?.message}`);
    if (existingSalon.stripe_connect_account_id) throw new Error("Stripe Connect account already exists for this salon.");

    // 1. Create Stripe Connect Express Account
    // https://stripe.com/docs/connect/express-accounts
    const account = await stripe.accounts.create({
      type: 'express',
      country: existingSalon.country || 'NL', // Default or fetch from salon record
      email: existingSalon.email || undefined, // Pass email if available
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
        // Add other capabilities like ideal, bancontact etc. based on region
      },
      business_type: 'individual', // Or 'company', might need more info
      // Add more details as required by Stripe onboarding for the country
    });

    const accountId = account.id;

    // 2. Store the account ID in your database
    const { error: updateError } = await supabaseAdmin
      .from('salons')
      .update({ stripe_connect_account_id: accountId })
      .eq('id', salonId);

    if (updateError) {
       // Consider deleting the Stripe account if DB update fails? Or log inconsistency.
       console.error("Failed to store Stripe Account ID after creation:", updateError);
       throw new Error("Failed to link Stripe account to salon.");
    }

    // 3. Create an Account Link for onboarding
    // https://stripe.com/docs/connect/create-express-account#create-account-link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${Deno.env.get('SITE_URL')}/salon/settings?stripe_refresh=true`, // Your page URL
      return_url: `${Deno.env.get('SITE_URL')}/salon/settings?stripe_return=true`, // Your page URL
      type: 'account_onboarding',
      collect: 'eventually', // Or 'currently_due'
    });

    // 4. Return the Account Link URL to the frontend
    return new Response(JSON.stringify({ onboardingUrl: accountLink.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in create-stripe-connect-account function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});