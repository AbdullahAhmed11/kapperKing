-- Add active column to products table
ALTER TABLE public.products
ADD COLUMN active boolean DEFAULT true NOT NULL;

-- Optional: Add index if you query by active status frequently
-- CREATE INDEX idx_products_active ON public.products (active);

-- Backfill existing products if necessary (set them to active)
-- UPDATE public.products SET active = true WHERE active IS NULL;