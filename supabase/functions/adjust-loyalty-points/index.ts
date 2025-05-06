import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log("Adjust Loyalty Points function booting up...");

interface AdjustPointsPayload {
  clientId: string;
  pointsToAdjust: number; // Can be positive or negative
  reason: string;
  // staffId?: string; // ID of staff making the adjustment
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { clientId, pointsToAdjust, reason }: AdjustPointsPayload = await req.json();
    // const authHeader = req.headers.get('Authorization');
    // TODO: Get staffId (p_staff_id) from authHeader if required by DB function

    if (!clientId || !pointsToAdjust || !reason) {
      throw new Error("Client ID, points to adjust, and reason are required.");
    }
     if (pointsToAdjust === 0) {
       throw new Error("Points adjustment cannot be zero.");
    }

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- Get Salon ID (Required by DB function) ---
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
    const { data: newPointsTotal, error: rpcError } = await supabaseAdmin.rpc('adjust_loyalty_points', {
       p_client_id: clientId,
       p_points_to_adjust: pointsToAdjust,
       p_reason: reason,
       p_salon_id: salonId, // Pass fetched salonId
       // p_staff_id: staffId // Pass staffId if obtained
    });

    if (rpcError) throw rpcError;

    return new Response(JSON.stringify({ success: true, newPoints: newPointsTotal }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in adjust-loyalty-points function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});