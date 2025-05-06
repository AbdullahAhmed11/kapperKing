-- Migration: Create Loyalty Points Log Table

CREATE TABLE public.loyalty_points_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    points_change integer NOT NULL, -- Positive for earned, negative for spent/expired
    reason text, -- e.g., 'Appointment completed', 'Product purchase', 'Reward redeemed', 'Manual adjustment', 'Expired'
    related_appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
    related_sale_id uuid, -- TODO: Add reference to sales table if you have one
    related_reward_redemption_id uuid, -- TODO: Add reference to loyalty_redemptions table
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL -- Optional: Track which staff member/system added points
);

-- Add indexes
CREATE INDEX idx_loyalty_log_client_id ON public.loyalty_points_log(client_id);
CREATE INDEX idx_loyalty_log_salon_id ON public.loyalty_points_log(salon_id);

-- Add RLS Policies (Example: Allow clients to read their own log, staff to read/create for their salon)
ALTER TABLE public.loyalty_points_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow clients to read their own points log"
ON public.loyalty_points_log FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  client_id = (SELECT id FROM public.clients WHERE user_id = auth.uid() LIMIT 1) -- Assumes clients can log in and have user_id set
);

CREATE POLICY "Allow salon staff to manage points log for their salon"
ON public.loyalty_points_log FOR ALL
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
     EXISTS (SELECT 1 FROM clients c WHERE c.salon_id = loyalty_points_log.salon_id AND c.user_id = auth.uid() AND c.role = 'owner') OR
     EXISTS (SELECT 1 FROM staff s WHERE s.salon_id = loyalty_points_log.salon_id AND s.user_id = auth.uid()) -- Allow any staff
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND
   EXISTS (
     EXISTS (SELECT 1 FROM clients c WHERE c.salon_id = loyalty_points_log.salon_id AND c.user_id = auth.uid() AND c.role = 'owner') OR
     EXISTS (SELECT 1 FROM staff s WHERE s.salon_id = loyalty_points_log.salon_id AND s.user_id = auth.uid())
  )
);