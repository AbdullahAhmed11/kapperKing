import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js';
import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { salonId, planId, paymentMethodId } = await req.json();

    if (!salonId || !planId || !paymentMethodId) {
      throw new Error('Missing required parameters');
    }

    // Get the subscription plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      throw new Error('Subscription plan not found');
    }

    // Get or create a Stripe customer for the salon
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('stripe_customer_id')
      .eq('id', salonId)
      .single();

    if (salonError) {
      throw new Error('Salon not found');
    }

    let customerId = salon.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          salonId,
        },
      });
      customerId = customer.id;

      // Update the salon with the Stripe customer ID
      await supabase
        .from('salons')
        .update({ stripe_customer_id: customerId })
        .eq('id', salonId);
    }

    // Attach the payment method to the customer if it's not already attached
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Set it as the default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: plan.stripe_price_id,
        },
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      metadata: {
        salonId,
        planId,
      },
    });

    // Record the subscription in our database
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        salon_id: salonId,
        plan_id: planId,
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      });

    if (subscriptionError) {
      console.error('Error recording subscription:', subscriptionError);
    }

    return new Response(
      JSON.stringify({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Error creating subscription:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});