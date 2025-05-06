-- Migration: Create DB function for redeeming loyalty rewards atomically

CREATE OR REPLACE FUNCTION public.redeem_loyalty_reward(
    p_client_id uuid,
    p_reward_id uuid,
    p_salon_id uuid,
    p_notes text DEFAULT NULL,
    p_staff_id uuid DEFAULT NULL -- Assuming this is auth.users.id of staff processing
)
RETURNS integer -- Returns new point total
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_reward_points_cost integer;
    v_client_current_points integer;
    v_new_points_total integer;
    v_redemption_id uuid;
    v_current_tier_id uuid;
    v_new_tier_id uuid;
BEGIN
    -- Fetch reward details and client points
    SELECT r.points_cost, c.loyalty_points, c.loyalty_tier_id
    INTO v_reward_points_cost, v_client_current_points, v_current_tier_id
    FROM public.loyalty_rewards r
    JOIN public.clients c ON r.salon_id = c.salon_id -- Ensure client & reward in same salon
    WHERE r.id = p_reward_id AND c.id = p_client_id AND r.salon_id = p_salon_id AND r.is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Active reward not found for this client/salon, or client not found.';
    END IF;

    -- Check if client has enough points
    IF v_client_current_points < v_reward_points_cost THEN
        RAISE EXCEPTION 'Insufficient points to redeem this reward. Required: %, Available: %', v_reward_points_cost, v_client_current_points;
    END IF;

    v_new_points_total := v_client_current_points - v_reward_points_cost;

    -- Update client points
    UPDATE public.clients
    SET loyalty_points = v_new_points_total
    WHERE id = p_client_id;

    -- Insert redemption record
    INSERT INTO public.loyalty_redemptions (
        salon_id, client_id, reward_id, points_spent, notes, staff_id
    ) VALUES (
        p_salon_id, p_client_id, p_reward_id, v_reward_points_cost, p_notes, p_staff_id
    ) RETURNING id INTO v_redemption_id;

    -- Insert points log record
    INSERT INTO public.loyalty_points_log (
        salon_id, client_id, points_change, reason, 
        related_reward_redemption_id, created_by
    ) VALUES (
        p_salon_id, p_client_id, -v_reward_points_cost, -- Negative points change
        'Redeemed reward: ' || p_reward_id, -- Consider joining reward name here if needed
        v_redemption_id, p_staff_id
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.redeem_loyalty_reward(uuid, uuid, uuid, text, uuid) TO authenticated;