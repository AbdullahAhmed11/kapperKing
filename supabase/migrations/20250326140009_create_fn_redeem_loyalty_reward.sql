-- Migration: Create redeem_loyalty_reward PostgreSQL Function

CREATE OR REPLACE FUNCTION public.redeem_loyalty_reward(
    p_client_id uuid,
    p_reward_id uuid,
    p_salon_id uuid, -- Pass salon_id for validation
    p_notes text DEFAULT NULL,
    p_staff_id uuid DEFAULT NULL -- Assuming this is auth.users.id of staff processing
)
RETURNS integer -- Returns new point total
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_client_points integer;
    v_reward_cost integer;
    v_reward_is_active boolean;
    v_new_points_total integer;
    v_redemption_id uuid;
    v_current_tier_id uuid;
    v_new_tier_id uuid;
BEGIN
    -- Fetch client points and reward details in one go
    SELECT c.loyalty_points, c.loyalty_tier_id, r.points_cost, r.is_active
    INTO v_client_points, v_current_tier_id, v_reward_cost, v_reward_is_active
    FROM public.clients c
    JOIN public.loyalty_rewards r ON c.salon_id = r.salon_id
    WHERE c.id = p_client_id AND r.id = p_reward_id AND c.salon_id = p_salon_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Client or reward not found, or they do not belong to the specified salon.';
    END IF;

    -- Validate reward activity and points balance
    IF NOT v_reward_is_active THEN
        RAISE EXCEPTION 'Reward is not currently active.';
    END IF;

    IF v_client_points < v_reward_cost THEN
        RAISE EXCEPTION 'Insufficient points to redeem this reward. Needs %, has %.', v_reward_cost, v_client_points;
    END IF;

    -- Calculate new point total
    v_new_points_total := v_client_points - v_reward_cost;

    -- Update client points
    UPDATE public.clients
    SET loyalty_points = v_new_points_total
    WHERE id = p_client_id;

    -- Insert redemption record
    INSERT INTO public.loyalty_redemptions (
        salon_id, client_id, reward_id, points_spent, notes, staff_id
    ) VALUES (
        p_salon_id, p_client_id, p_reward_id, v_reward_cost, p_notes, p_staff_id
    ) RETURNING id INTO v_redemption_id;

    -- Insert points log record
    INSERT INTO public.loyalty_points_log (
        salon_id, client_id, points_change, reason, 
        related_reward_redemption_id, created_by
    ) VALUES (
        p_salon_id, p_client_id, -v_reward_cost, -- Negative change
        'Redeemed reward: ' || p_reward_id, -- Consider joining reward name here if needed
        v_redemption_id, p_staff_id
    );

    -- Check and update tier (points decreased)
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