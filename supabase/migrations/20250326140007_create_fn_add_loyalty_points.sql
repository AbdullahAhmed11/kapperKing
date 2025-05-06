-- Migration: Create add_loyalty_points PostgreSQL Function

CREATE OR REPLACE FUNCTION public.add_loyalty_points(
    p_client_id uuid,
    p_points_to_add integer,
    p_reason text,
    p_salon_id uuid,
    p_related_appointment_id uuid DEFAULT NULL,
    p_related_sale_id uuid DEFAULT NULL,
    p_created_by uuid DEFAULT NULL -- Assuming this is auth.users.id
)
RETURNS integer -- Returns new point total
LANGUAGE plpgsql
-- SECURITY DEFINER allows function to run with definer's permissions (usually postgres role)
-- This is necessary to update tables with RLS enabled, but use with caution.
-- Ensure the function logic properly validates inputs (like p_salon_id matching client's salon).
SECURITY DEFINER
-- Set search_path to prevent hijacking, include extensions like pgcrypto if needed
SET search_path = public
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
    -- Ensure the client belongs to the provided salon_id for security
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

    -- Update tier only if it changed (handles NULL cases correctly)
    IF v_new_tier_id IS DISTINCT FROM v_current_tier_id THEN
        UPDATE public.clients
        SET loyalty_tier_id = v_new_tier_id
        WHERE id = p_client_id;
    END IF;

    RETURN v_new_points_total;
END;
$$;

-- Grant execute permission to the authenticated role
-- This allows logged-in users (via Edge Functions or client-side) to call the function
GRANT EXECUTE ON FUNCTION public.add_loyalty_points(uuid, integer, text, uuid, uuid, uuid, uuid) TO authenticated;

-- Note: RLS policies on the underlying tables (clients, loyalty_points_log, loyalty_tiers)
-- still apply unless bypassed by SECURITY DEFINER context. Ensure function logic is secure.