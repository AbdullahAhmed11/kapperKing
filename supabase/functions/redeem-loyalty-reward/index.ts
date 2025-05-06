import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log("Redeem Loyalty Reward function booting up...");

interface RedeemPayload {
  clientId: string;
  rewardId: string;
  notes?: string;
  // staffId?: string; // Optional: ID of staff processing redemption
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { clientId, rewardId, notes }: RedeemPayload = await req.json();
    // const authHeader = req.headers.get('Authorization'); // If needed to get staffId
    // TODO: Get staffId (p_staff_id) from authHeader if required by DB function

    if (!clientId || !rewardId) {
      throw new Error("Client ID and Reward ID are required.");
    }

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- Get Salon ID (Required by DB function) ---
    // Fetch based on clientId (could also fetch based on rewardId)
    const { data: clientData, error: clientFetchError } = await supabaseAdmin
       .from('clients')
       .select('salon_id')
       .eq('id', clientId)
       .single();

    if (clientFetchError || !clientData?.salon_id) {
       throw new Error(`Could not determine salon ID for client ${clientId}.`);
    }
    const salonId = clientData.salon_id;

    // --- Call the Database Function ---
    const { data: newPointsTotal, error: rpcError } = await supabaseAdmin.rpc('redeem_loyalty_reward', {
       p_client_id: clientId,
       p_reward_id: rewardId,
       p_salon_id: salonId, // Pass fetched salonId
       p_notes: notes,
       // p_staff_id: staffId // Pass staffId if obtained
    });

    if (rpcError) throw rpcError;

    return new Response(JSON.stringify({ success: true, newPoints: newPointsTotal }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in redeem-loyalty-reward function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});