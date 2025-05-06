-- Migration: Create View for Loyalty Analytics

CREATE OR REPLACE VIEW public.loyalty_monthly_activity AS
SELECT
    salon_id,
    date_trunc('month', created_at)::date AS activity_month,
    SUM(CASE WHEN points_change > 0 THEN points_change ELSE 0 END) AS points_earned,
    SUM(CASE WHEN points_change < 0 THEN ABS(points_change) ELSE 0 END) AS points_spent
FROM
    public.loyalty_points_log
GROUP BY
    salon_id,
    date_trunc('month', created_at)
ORDER BY
    salon_id,
    activity_month;

-- Optional: Add RLS policy if needed, e.g., allow staff to select from view for their salon
-- ALTER VIEW public.loyalty_monthly_activity OWNER TO postgres; -- Or appropriate role
-- GRANT SELECT ON public.loyalty_monthly_activity TO authenticated; 
-- ALTER VIEW public.loyalty_monthly_activity ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow staff to view analytics for their salon" 
-- ON public.loyalty_monthly_activity FOR SELECT USING (
--    auth.role() = 'authenticated' AND
--    EXISTS (SELECT 1 FROM staff s WHERE s.salon_id = loyalty_monthly_activity.salon_id AND s.user_id = auth.uid())
-- );