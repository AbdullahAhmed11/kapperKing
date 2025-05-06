-- Add salon_id column to clients table
ALTER TABLE public.clients
ADD COLUMN salon_id uuid;

-- Add foreign key constraint to link clients to salons
-- Ensure the 'salons' table and its 'id' column exist
ALTER TABLE public.clients
ADD CONSTRAINT fk_clients_salon_id
FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE; -- Cascade delete means deleting a salon deletes its clients

-- Add index for faster lookups by salon_id
CREATE INDEX idx_clients_salon_id ON public.clients(salon_id);

-- Optional: Backfill existing clients if necessary
-- You might need to determine the correct salon_id based on other data
-- UPDATE public.clients SET salon_id = 'your_default_salon_id' WHERE salon_id IS NULL;