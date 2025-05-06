/*
  # Fix Authentication Schema and Login Process
  
  1. Schema Changes
    - Properly set up auth schema and tables
    - Add proper indexes and constraints
    - Fix refresh token handling
  
  2. Security
    - Configure proper permissions
    - Set up RLS policies
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create auth schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS auth;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS auth.refresh_tokens CASCADE;
DROP TABLE IF EXISTS auth.audit_log_entries CASCADE;
DROP TABLE IF EXISTS auth.instances CASCADE;
DROP TABLE IF EXISTS auth.users CASCADE;

-- Create auth.users table
CREATE TABLE auth.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  instance_id uuid,
  aud character varying(255) DEFAULT 'authenticated',
  role character varying(255) DEFAULT 'authenticated',
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
  raw_app_meta_data jsonb DEFAULT '{"provider": "email", "providers": ["email"]}'::jsonb,
  raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
  is_super_admin boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
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

-- Create refresh tokens table with proper foreign key
CREATE TABLE auth.refresh_tokens (
  id bigserial PRIMARY KEY,
  token character varying(255) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  parent character varying(255),
  revoked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT refresh_tokens_token_unique UNIQUE (token)
);

CREATE INDEX refresh_tokens_token_idx ON auth.refresh_tokens (token);
CREATE INDEX refresh_tokens_user_id_idx ON auth.refresh_tokens (user_id);
CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens (parent);

-- Create audit log entries
CREATE TABLE auth.audit_log_entries (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  instance_id uuid,
  payload json,
  created_at timestamp with time zone DEFAULT now(),
  ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries (instance_id);

-- Grant permissions
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO anon, authenticated;

-- Reset sequences
ALTER SEQUENCE auth.refresh_tokens_id_seq RESTART WITH 1;

-- Create demo admin user if it doesn't exist
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  'admin@kapperking.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Admin User"}'::jsonb,
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  updated_at = now();

-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own data" ON auth.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON auth.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can manage their own refresh tokens" ON auth.refresh_tokens
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Audit logs are viewable by users" ON auth.audit_log_entries
  FOR SELECT
  TO authenticated
  USING (true);