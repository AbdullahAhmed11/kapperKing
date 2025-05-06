-- Migration: Add Dashboard Theme Color Columns to Salons Table

ALTER TABLE public.salons
ADD COLUMN dashboard_primary_color TEXT,
ADD COLUMN dashboard_secondary_color TEXT;

-- Optional: Set default values if desired
-- UPDATE public.salons SET dashboard_primary_color = '#4f46e5' WHERE dashboard_primary_color IS NULL; -- Example Indigo
-- UPDATE public.salons SET dashboard_secondary_color = '#ec4899' WHERE dashboard_secondary_color IS NULL; -- Example Pink