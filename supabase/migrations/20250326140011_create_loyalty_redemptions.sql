-- Migration: Create Loyalty Redemptions Table

CREATE TABLE public.loyalty_redemptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    reward_id uuid NOT NULL REFERENCES public.loyalty_rewards(id) ON DELETE CASCADE,
    points_spent integer NOT NULL,
    redeemed_at timestamp with time zone DEFAULT now() NOT NULL,
    notes text, -- Optional notes about the redemption
    staff_id uuid REFERENCES auth.users(id) ON DELETE SET NULL -- Optional: Track which staff member processed redemption
);

-- Add indexes
CREATE INDEX idx_loyalty_redemptions_client_id ON public.loyalty_redemptions(client_id);
CREATE INDEX idx_loyalty_redemptions_salon_id ON public.loyalty_redemptions(salon_id);
CREATE INDEX idx_loyalty_redemptions_reward_id ON public.loyalty_redemptions(reward_id);

-- Add RLS Policies (Similar to points log)
ALTER TABLE public.loyalty_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow clients to read their own redemptions"
ON public.loyalty_redemptions FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  client_id = (SELECT id FROM public.clients WHERE user_id = auth.uid() LIMIT 1)
);

CREATE POLICY "Allow salon staff to manage redemptions for their salon"
ON public.loyalty_redemptions FOR ALL
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
     EXISTS (SELECT 1 FROM clients c WHERE c.salon_id = loyalty_redemptions.salon_id AND c.user_id = auth.uid() AND c.role = 'owner') OR
     EXISTS (SELECT 1 FROM staff s WHERE s.salon_id = loyalty_redemptions.salon_id AND s.user_id = auth.uid())
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND
   EXISTS (
     EXISTS (SELECT 1 FROM clients c WHERE c.salon_id = loyalty_redemptions.salon_id AND c.user_id = auth.uid() AND c.role = 'owner') OR
     EXISTS (SELECT 1 FROM staff s WHERE s.salon_id = loyalty_redemptions.salon_id AND s.user_id = auth.uid())
  )
);

-- Add foreign key constraint to link back to points log
-- This assumes you add 'related_reward_redemption_id' to loyalty_points_log table
ALTER TABLE public.loyalty_points_log
ADD CONSTRAINT fk_log_redemption_id
FOREIGN KEY (related_reward_redemption_id) REFERENCES public.loyalty_redemptions(id) ON DELETE SET NULL;