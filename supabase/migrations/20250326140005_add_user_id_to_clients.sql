-- Migration: Add user_id column to clients table for customer portal login

-- Add the user_id column, allowing nulls initially
ALTER TABLE public.clients
ADD COLUMN user_id uuid;

-- Add foreign key constraint to link to auth.users table
-- This assumes you want deleting an auth user to potentially set client's user_id to NULL
ALTER TABLE public.clients
ADD CONSTRAINT fk_clients_auth_user_id
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add index for faster lookups by user_id
-- Make it unique per salon if a user can only be a client of a salon once via login
-- Or unique globally if a user account maps to only one client record across all salons
-- For simplicity, let's assume unique globally for now, adjust if needed.
CREATE UNIQUE INDEX idx_clients_user_id_unique ON public.clients(user_id) WHERE user_id IS NOT NULL;

-- RLS policies might need adjustment to allow clients to select their own record based on auth.uid() = user_id