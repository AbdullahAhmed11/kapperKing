import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log("Add Loyalty Points function booting up...");

interface AddPointsPayload {
  clientId: string;
  pointsToAdd: number;
  reason: string;
  relatedAppointmentId?: string;
  relatedSaleId?: string; // Add if you implement sales tracking
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { clientId, pointsToAdd, reason, relatedAppointmentId, relatedSaleId }: AddPointsPayload = await req.json();

    if (!clientId || !pointsToAdd || !reason) {
      throw new Error("Client ID, points to add, and reason are required.");
    }
    if (pointsToAdd <= 0) {
       throw new Error("Points to add must be positive.");
    }

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // --- Get Salon ID (Required by DB function) ---
    // Option 1: Pass salonId in the payload from the frontend (if available)
    // Option 2: Fetch it based on clientId (less efficient)
    const { data: clientData, error: clientFetchError } = await supabaseAdmin
       .from('clients')
       .select('salon_id')
       .eq('id', clientId)
       .single();

    if (clientFetchError || !clientData?.salon_id) {
       throw new Error(`Could not determine salon ID for client ${clientId}. Client fetch error: ${clientFetchError?.message}`);
    }
    const salonId = clientData.salon_id;
    // TODO: Get staffId (p_created_by) from authHeader if required by DB function and pass it

    // --- Call the Database Function ---
    const { data: newPointsTotal, error: rpcError } = await supabaseAdmin.rpc('add_loyalty_points', {
       p_client_id: clientId,
       p_points_to_add: pointsToAdd,
       p_reason: reason,
       p_salon_id: salonId, // Pass fetched salonId
       p_related_appointment_id: relatedAppointmentId,
       p_related_sale_id: relatedSaleId,
       // p_created_by: staffId // Pass staffId if obtained
    });

    if (rpcError) throw rpcError;

    return new Response(JSON.stringify({ success: true, newPoints: newPointsTotal }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in add-loyalty-points function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

/* 
DB Function Alternative (Recommended for Atomicity)

CREATE OR REPLACE FUNCTION add_loyalty_points(
    p_client_id uuid,
    p_points_to_add integer,
    p_reason text,
    p_salon_id uuid,
    p_related_appointment_id uuid DEFAULT NULL,
    p_related_sale_id uuid DEFAULT NULL,
    p_created_by uuid DEFAULT NULL
)
RETURNS integer -- Returns new point total
LANGUAGE plpgsql
SECURITY DEFINER -- Important for updating tables
AS $$
DECLARE
    v_new_points_total integer;
    v_current_tier_id uuid;
    v_new_tier_id uuid;
BEGIN
    -- Validate input
    IF p_points_to_add <= 0 THEN
        RAISE EXCEPTION 'Points to add must be positive.';
    END IF;

    -- Update client points and get new total + current tier
    UPDATE public.clients
    SET loyalty_points = loyalty_points + p_points_to_add
    WHERE id = p_client_id AND salon_id = p_salon_id
    RETURNING loyalty_points, loyalty_tier_id INTO v_new_points_total, v_current_tier_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Client not found or does not belong to the specified salon.';
    END IF;

    -- Log the transaction
    INSERT INTO public.loyalty_points_log (
        salon_id, client_id, points_change, reason, 
        related_appointment_id, related_sale_id, created_by
    ) VALUES (
        p_salon_id, p_client_id, p_points_to_add, p_reason,
        p_related_appointment_id, p_related_sale_id, p_created_by
    );

    -- Check and update tier
    SELECT id INTO v_new_tier_id
    FROM public.loyalty_tiers
    WHERE salon_id = p_salon_id AND points_threshold <= v_new_points_total
    ORDER BY points_threshold DESC
    LIMIT 1;

    IF v_new_tier_id IS DISTINCT FROM v_current_tier_id THEN
        UPDATE public.clients
        SET loyalty_tier_id = v_new_tier_id
        WHERE id = p_client_id;
    END IF;

    RETURN v_new_points_total;
END;
$$;

*/