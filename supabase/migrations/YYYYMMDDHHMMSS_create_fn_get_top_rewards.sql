-- Migration: Create DB function for top redeemed rewards

CREATE TYPE public.top_reward_result AS (
    reward_name text,
    redemption_count bigint
);

CREATE OR REPLACE FUNCTION public.get_top_redeemed_rewards(p_salon_id uuid, p_limit integer DEFAULT 5)
RETURNS SETOF public.top_reward_result
LANGUAGE sql
STABLE
AS $$
SELECT
    lr.name AS reward_name,
    COUNT(lred.id)::bigint AS redemption_count
FROM
    public.loyalty_redemptions lred
JOIN
    public.loyalty_rewards lr ON lred.reward_id = lr.id
WHERE
    lred.salon_id = p_salon_id
    -- Optional: Add date range filter, e.g., last 90 days
    -- AND lred.redeemed_at >= (now() - interval '90 days') 
GROUP BY
    lr.name
ORDER BY
    redemption_count DESC
LIMIT p_limit;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_top_redeemed_rewards(uuid, integer) TO authenticated;