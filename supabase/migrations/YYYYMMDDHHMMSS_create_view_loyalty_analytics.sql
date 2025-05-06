-- Migration: Create a view for basic loyalty analytics (example)

CREATE OR REPLACE VIEW public.loyalty_analytics_summary AS
SELECT
    c.salon_id,
    COUNT(c.id) AS total_members,
    -- Active members (example: made a purchase or had points change in last 90 days)
    COUNT(DISTINCT CASE WHEN lpl.created_at >= (now() - interval '90 days') THEN c.id ELSE NULL END) AS active_members_90d,
    -- Points earned/spent (example: last 30 days)
    COALESCE(SUM(CASE WHEN lpl.points_change > 0 AND lpl.created_at >= (now() - interval '30 days') THEN lpl.points_change ELSE 0 END), 0) AS points_earned_30d,
    COALESCE(SUM(CASE WHEN lpl.points_change < 0 AND lpl.created_at >= (now() - interval '30 days') THEN ABS(lpl.points_change) ELSE 0 END), 0) AS points_spent_30d,
    -- Redemption Rate (placeholder - needs better definition, e.g., % of active members redeeming)
    NULL AS redemption_rate 
FROM
    public.clients c
LEFT JOIN 
    public.loyalty_points_log lpl ON c.id = lpl.client_id AND c.salon_id = lpl.salon_id
GROUP BY
    c.salon_id;

-- RLS: Ensure appropriate access control is applied to this view
-- Example: Allow staff/owners to select based on their salon_id
ALTER VIEW public.loyalty_analytics_summary OWNER TO postgres; -- Or appropriate role
GRANT SELECT ON public.loyalty_analytics_summary TO authenticated; 

ALTER VIEW public.loyalty_analytics_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow salon staff/owners to read their analytics"
ON public.loyalty_analytics_summary FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
     EXISTS (SELECT 1 FROM clients cl WHERE cl.salon_id = loyalty_analytics_summary.salon_id AND cl.user_id = auth.uid() AND cl.role = 'owner') OR
     EXISTS (SELECT 1 FROM staff s WHERE s.salon_id = loyalty_analytics_summary.salon_id AND s.user_id = auth.uid())
  )
);

-- TODO: Consider creating functions for more complex/parameterized queries 
-- e.g., top rewards, points activity over time ranges.