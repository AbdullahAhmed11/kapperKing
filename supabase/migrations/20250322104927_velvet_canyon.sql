/*
  # Fix Authentication Schema and Initial Setup
  
  1. Auth Schema
    - Creates auth schema and required extensions
    - Sets up auth.users table with proper structure
    - Configures required indexes and constraints
  
  2. Initial Data
    - Creates demo admin user
    - Creates demo salon
    - Creates admin staff member
    
  3. Security
    - Configures RLS policies with proper checks for existing policies
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create auth schema
CREATE SCHEMA IF NOT EXISTS auth;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS auth.users CASCADE;
DROP TABLE IF EXISTS auth.refresh_tokens CASCADE;
DROP TABLE IF EXISTS auth.instances CASCADE;
DROP TABLE IF EXISTS auth.audit_log_entries CASCADE;

-- Create auth.users table
CREATE TABLE auth.users (
  instance_id uuid,
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  aud character varying(255),
  role character varying(255),
  email character varying(255) UNIQUE,
  encrypted_password character varying(255),
  email_confirmed_at timestamp with time zone DEFAULT now(),
  invited_at timestamp with time zone,
  confirmation_token character varying(255),
  confirmation_sent_at timestamp with time zone,
  recovery_token character varying(255),
  recovery_sent_at timestamp with time zone,
  email_change_token_new character varying(255),
  email_change character varying(255),
  email_change_sent_at timestamp with time zone,
  last_sign_in_at timestamp with time zone,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  is_super_admin boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  phone character varying(255) DEFAULT NULL::character varying,
  phone_confirmed_at timestamp with time zone,
  phone_change character varying(255) DEFAULT ''::character varying,
  phone_change_token character varying(255) DEFAULT ''::character varying,
  phone_change_sent_at timestamp with time zone,
  confirmed_at timestamp with time zone GENERATED ALWAYS AS (
    LEAST(email_confirmed_at, phone_confirmed_at)
  ) STORED,
  email_change_token_current character varying(255) DEFAULT ''::character varying,
  email_change_confirm_status smallint DEFAULT 0,
  banned_until timestamp with time zone,
  reauthentication_token character varying(255) DEFAULT ''::character varying,
  reauthentication_sent_at timestamp with time zone,
  is_sso_user boolean DEFAULT false,
  deleted_at timestamp with time zone,
  CONSTRAINT users_email_check CHECK ((email ~* '^[^@]+@[^@]+\.[^@]+$'::text))
);

CREATE INDEX users_instance_id_email_idx ON auth.users (instance_id, email);
CREATE INDEX users_instance_id_idx ON auth.users (instance_id);

-- Create refresh tokens table
CREATE TABLE auth.refresh_tokens (
  instance_id uuid,
  id bigserial PRIMARY KEY,
  token character varying(255),
  user_id character varying(255),
  revoked boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens (instance_id);
CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens (instance_id, user_id);
CREATE INDEX refresh_tokens_token_idx ON auth.refresh_tokens (token);

-- Create audit log entries
CREATE TABLE auth.audit_log_entries (
  instance_id uuid,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  payload json,
  created_at timestamp with time zone,
  ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries (instance_id);

-- Grant permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO anon, authenticated;

-- Create demo admin user
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at
) VALUES (
  'admin@kapperking.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Admin User"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  updated_at = now()
RETURNING id;

-- Create demo salon
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

-- Create admin staff member
WITH user_id AS (
  SELECT id FROM auth.users WHERE email = 'admin@kapperking.com'
), salon_id AS (
  SELECT id FROM public.salons WHERE slug = 'demo-salon'
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

-- Enable RLS
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Salons are viewable by their staff members" ON public.salons;
  DROP POLICY IF EXISTS "Salons are editable by their owners and admins" ON public.salons;
  DROP POLICY IF EXISTS "Staff members can view their salon's staff" ON public.staff;
  DROP POLICY IF EXISTS "Staff members can be managed by salon admins" ON public.staff;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

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