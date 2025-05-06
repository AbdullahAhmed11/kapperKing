-- Migration: Create Loyalty Tiers Table

CREATE TABLE public.loyalty_tiers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    name character varying NOT NULL,
    points_threshold integer NOT NULL DEFAULT 0,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT unique_tier_name_per_salon UNIQUE (salon_id, name),
    CONSTRAINT positive_points_threshold CHECK (points_threshold >= 0)
);

-- Add RLS Policies (Example: Allow authenticated users of the salon to read)
ALTER TABLE public.loyalty_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read tiers for their salon"
ON public.loyalty_tiers FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM staff s WHERE s.salon_id = loyalty_tiers.salon_id AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Allow salon owners/admins to manage tiers"
ON public.loyalty_tiers FOR ALL
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
     -- TODO: Define logic to check if user is owner/admin of the salon
     -- This might involve checking a 'role' column in 'staff' or 'clients' table
     -- Example: Check if user is owner via clients table
     EXISTS (SELECT 1 FROM clients c WHERE c.salon_id = loyalty_tiers.salon_id AND c.user_id = auth.uid() AND c.role = 'owner') OR
     -- Example: Check if user is admin via staff table
     EXISTS (SELECT 1 FROM staff s WHERE s.salon_id = loyalty_tiers.salon_id AND s.user_id = auth.uid() AND s.role = 'admin')
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND
   EXISTS (
     EXISTS (SELECT 1 FROM clients c WHERE c.salon_id = loyalty_tiers.salon_id AND c.user_id = auth.uid() AND c.role = 'owner') OR
     EXISTS (SELECT 1 FROM staff s WHERE s.salon_id = loyalty_tiers.salon_id AND s.user_id = auth.uid() AND s.role = 'admin')
  )
);

-- Trigger to update updated_at timestamp
CREATE TRIGGER handle_loyalty_tiers_updated_at
BEFORE UPDATE ON public.loyalty_tiers
FOR EACH ROW
EXECUTE FUNCTION moddatetime('updated_at');