-- Migration: Create adjust_loyalty_points PostgreSQL Function

CREATE OR REPLACE FUNCTION public.adjust_loyalty_points(
    p_client_id uuid,
    p_points_to_adjust integer, -- Can be positive or negative
    p_reason text,
    p_salon_id uuid,
    p_staff_id uuid DEFAULT NULL -- Assuming this is auth.users.id of staff processing
)
RETURNS integer -- Returns new point total
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_points_total integer;
    v_current_tier_id uuid;
    v_new_tier_id uuid;
    v_current_points integer;
    v_actual_points_adjusted integer := p_points_to_adjust; -- Store the actual change
BEGIN
    -- Validate input
    IF p_points_to_adjust = 0 THEN
        RAISE EXCEPTION 'Points adjustment cannot be zero.';
    END IF;

    -- Update client points and get new total + current tier
    UPDATE public.clients
    SET loyalty_points = loyalty_points + p_points_to_adjust
    WHERE id = p_client_id AND salon_id = p_salon_id
    RETURNING loyalty_points, loyalty_tier_id INTO v_new_points_total, v_current_tier_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Client not found or does not belong to the specified salon.';
    END IF;

    -- Optional: Prevent points going below zero
    -- IF v_new_points_total < 0 THEN
    --     SELECT loyalty_points INTO v_current_points FROM public.clients WHERE id = p_client_id;
    --     v_actual_points_adjusted := -v_current_points; -- Actual change was to make it zero
    --     v_new_points_total := 0;
    --     UPDATE public.clients SET loyalty_points = 0 WHERE id = p_client_id;
    -- END IF;

    -- Log the transaction
    INSERT INTO public.loyalty_points_log (
        salon_id, client_id, points_change, reason, created_by
    ) VALUES (
        p_salon_id, p_client_id, v_actual_points_adjusted, -- Log the actual/requested adjustment
        'Manual Adjustment: ' || p_reason, p_staff_id
    );

    -- Check and update tier (same logic as add_loyalty_points)
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.adjust_loyalty_points(uuid, integer, text, uuid, uuid) TO authenticated;