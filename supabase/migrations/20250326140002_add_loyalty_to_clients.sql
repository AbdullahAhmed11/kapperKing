-- Migration: Add Loyalty Columns to Clients Table

-- Add column to link to loyalty tier
ALTER TABLE public.clients
ADD COLUMN loyalty_tier_id uuid REFERENCES public.loyalty_tiers(id) ON DELETE SET NULL;

-- Add column for current points balance
ALTER TABLE public.clients
ADD COLUMN loyalty_points integer NOT NULL DEFAULT 0;

-- Add column for unique loyalty ID/QR code identifier
ALTER TABLE public.clients
ADD COLUMN loyalty_identifier text UNIQUE; -- Use text for flexibility, can be generated UUID or custom code

-- Add index for faster tier lookups
CREATE INDEX idx_clients_loyalty_tier_id ON public.clients(loyalty_tier_id);

-- Add index for loyalty identifier lookups
CREATE INDEX idx_clients_loyalty_identifier ON public.clients(loyalty_identifier);

-- RLS policies for clients table should already exist, 
-- but ensure they allow reading/updating these new columns appropriately.
-- Example: Allow clients to read their own points/tier, allow staff to update points.

-- Trigger to generate loyalty_identifier on new client insert (if desired)
-- Requires a function like `generate_unique_loyalty_id()`
-- CREATE TRIGGER set_loyalty_identifier
-- BEFORE INSERT ON public.clients
-- FOR EACH ROW
-- EXECUTE FUNCTION generate_unique_loyalty_id(); 
-- (Define the function generate_unique_loyalty_id separately)