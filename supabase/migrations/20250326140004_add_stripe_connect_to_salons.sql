-- Migration: Add Stripe Connect Account ID to Salons Table

ALTER TABLE public.salons
ADD COLUMN stripe_connect_account_id TEXT UNIQUE;

-- Add index for faster lookup if needed
-- CREATE INDEX idx_salons_stripe_connect_account_id ON public.salons(stripe_connect_account_id);

-- RLS: Ensure owner/admins can update this, but it shouldn't be generally readable by clients/staff
-- Adjust existing policies on 'salons' table as needed.