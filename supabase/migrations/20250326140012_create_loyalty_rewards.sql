-- Migration: Create Loyalty Rewards Table

CREATE TABLE public.loyalty_rewards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    name character varying NOT NULL,
    description text,
    points_cost integer NOT NULL,
    reward_type character varying NOT NULL DEFAULT 'discount', -- e.g., 'discount', 'free_service', 'product'
    reward_value numeric, -- e.g., discount amount/percentage, or null if type is product/service
    required_service_id uuid REFERENCES public.services(id) ON DELETE SET NULL, -- Link if it's a free service reward
    required_product_id uuid REFERENCES public.products(id) ON DELETE SET NULL, -- Link if it's a free product reward
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT positive_points_cost CHECK (points_cost > 0)
);

-- Add RLS Policies (Similar to loyalty_tiers)
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read active rewards for their salon"
ON public.loyalty_rewards FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  is_active = true AND
  EXISTS (
    SELECT 1 FROM staff s WHERE s.salon_id = loyalty_rewards.salon_id AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Allow salon owners/admins to manage rewards"
ON public.loyalty_rewards FOR ALL
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
     EXISTS (SELECT 1 FROM clients c WHERE c.salon_id = loyalty_rewards.salon_id AND c.user_id = auth.uid() AND c.role = 'owner') OR
     EXISTS (SELECT 1 FROM staff s WHERE s.salon_id = loyalty_rewards.salon_id AND s.user_id = auth.uid() AND s.role = 'admin')
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND
   EXISTS (
     EXISTS (SELECT 1 FROM clients c WHERE c.salon_id = loyalty_rewards.salon_id AND c.user_id = auth.uid() AND c.role = 'owner') OR
     EXISTS (SELECT 1 FROM staff s WHERE s.salon_id = loyalty_rewards.salon_id AND s.user_id = auth.uid() AND s.role = 'admin')
  )
);

-- Trigger to update updated_at timestamp
CREATE TRIGGER handle_loyalty_rewards_updated_at
BEFORE UPDATE ON public.loyalty_rewards
FOR EACH ROW
EXECUTE FUNCTION moddatetime('updated_at');