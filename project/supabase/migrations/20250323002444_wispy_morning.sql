/*
  # Fix Authentication Schema
  
  1. Changes
    - Remove all auth schema modifications
    - Add application tables only
    - Fix policies and permissions
  
  2. Security
    - Enable RLS on application tables
    - Add proper policies
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create application tables if they don't exist
CREATE TABLE IF NOT EXISTS public.salons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  owner_id uuid,
  subscription_plan_id uuid,
  subscription_status text NOT NULL DEFAULT 'trial'::text,
  trial_ends_at timestamptz,
  email text NOT NULL,
  phone text,
  address text,
  city text,
  postal_code text,
  country text,
  timezone text NOT NULL DEFAULT 'UTC'::text,
  currency text NOT NULL DEFAULT 'EUR'::text,
  logo_url text,
  website text,
  custom_domain text UNIQUE,
  theme_colors jsonb DEFAULT '{"primary": "#6B46C1", "secondary": "#E84393"}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT salons_subscription_status_check CHECK (subscription_status = ANY (ARRAY['trial'::text, 'active'::text, 'past_due'::text, 'canceled'::text]))
);

CREATE TABLE IF NOT EXISTS public.staff (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id uuid REFERENCES public.salons(id) ON DELETE CASCADE,
  auth_user_id uuid,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  role text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT staff_role_check CHECK (role = ANY (ARRAY['admin'::text, 'stylist'::text, 'assistant'::text]))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_staff_auth_user_id ON public.staff(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_staff_salon_id ON public.staff(salon_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_role ON public.staff(role);

-- Enable RLS
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Salons are viewable by their staff members" ON public.salons;
DROP POLICY IF EXISTS "Salons are editable by their owners and admins" ON public.salons;
DROP POLICY IF EXISTS "Staff members can view their salon's staff" ON public.staff;
DROP POLICY IF EXISTS "Staff members can be managed by salon admins" ON public.staff;

-- Create RLS policies
CREATE POLICY "Salons are viewable by their staff members"
  ON public.salons
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE staff.salon_id = salons.id
      AND staff.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Salons are editable by their owners and admins"
  ON public.salons
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE staff.salon_id = salons.id
      AND staff.auth_user_id = auth.uid()
      AND staff.role = 'admin'
    )
  );

CREATE POLICY "Staff members can view their salon's staff"
  ON public.staff
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.salon_id = staff.salon_id
      AND s.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Staff members can be managed by salon admins"
  ON public.staff
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.salon_id = staff.salon_id
      AND s.auth_user_id = auth.uid()
      AND s.role = 'admin'
    )
  );

-- Create demo salon if it doesn't exist
INSERT INTO public.salons (
  name,
  slug,
  email,
  timezone,
  currency,
  subscription_status,
  is_active
) VALUES (
  'Demo Salon',
  'demo-salon',
  'admin@kapperking.com',
  'Europe/Amsterdam',
  'EUR',
  'trial',
  true
) ON CONFLICT (slug) DO UPDATE SET
  updated_at = now()
RETURNING id;

-- Create admin staff member if it doesn't exist
WITH salon_id AS (
  SELECT id FROM public.salons WHERE slug = 'demo-salon'
), user_id AS (
  SELECT id FROM auth.users WHERE email = 'admin@kapperking.com'
)
INSERT INTO public.staff (
  salon_id,
  auth_user_id,
  first_name,
  last_name,
  email,
  role,
  active
) 
SELECT 
  (SELECT id FROM salon_id),
  (SELECT id FROM user_id),
  'Admin',
  'User',
  'admin@kapperking.com',
  'admin',
  true
ON CONFLICT (email) DO UPDATE SET
  updated_at = now();