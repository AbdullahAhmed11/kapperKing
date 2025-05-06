-- Migration: Create DB function for monthly points activity

CREATE TYPE public.points_activity_result AS (
    month_start date,
    points_earned bigint,
    points_spent bigint
);

CREATE OR REPLACE FUNCTION public.get_monthly_points_activity(p_salon_id uuid, p_months integer DEFAULT 6)
RETURNS SETOF public.points_activity_result
LANGUAGE sql
STABLE -- Indicates the function doesn't modify the database
AS $$
WITH months AS (
    -- Generate a series of the start of the last N months
    SELECT date_trunc('month', generate_series(
        date_trunc('month', now() - (p_months - 1) * interval '1 month'), -- Start N months ago
        date_trunc('month', now()), -- End with the current month
        interval '1 month'
    ))::date AS month_start
)
SELECT
    m.month_start,
    COALESCE(SUM(CASE WHEN lpl.points_change > 0 THEN lpl.points_change ELSE 0 END), 0)::bigint AS points_earned,
    COALESCE(SUM(CASE WHEN lpl.points_change < 0 THEN ABS(lpl.points_change) ELSE 0 END), 0)::bigint AS points_spent
FROM months m
LEFT JOIN public.loyalty_points_log lpl 
    ON lpl.salon_id = p_salon_id 
    AND date_trunc('month', lpl.created_at)::date = m.month_start
GROUP BY m.month_start
ORDER BY m.month_start ASC;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_monthly_points_activity(uuid, integer) TO authenticated;