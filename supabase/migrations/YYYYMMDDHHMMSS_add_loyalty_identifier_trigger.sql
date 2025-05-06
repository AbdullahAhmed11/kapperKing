-- Migration: Add trigger to generate loyalty_identifier for new clients

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.generate_client_loyalty_identifier()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if loyalty_identifier is NULL (it should be on insert)
  IF NEW.loyalty_identifier IS NULL THEN
    -- Generate a UUID and assign it
    NEW.loyalty_identifier := gen_random_uuid()::text; 
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Create the trigger on the clients table
-- This trigger will execute BEFORE each row is inserted
CREATE TRIGGER set_client_loyalty_identifier_before_insert
BEFORE INSERT ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.generate_client_loyalty_identifier();

-- Note: Ensure the pgcrypto extension is enabled in your Supabase project 
-- if using gen_random_uuid(). It usually is by default.
-- You can check/enable it via the Supabase dashboard (Database -> Extensions).