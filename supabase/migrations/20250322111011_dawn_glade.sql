/*
  # Fix Authentication Schema

  1. Changes
    - Remove custom auth schema modifications
    - Add necessary application tables and policies
    - Keep existing data intact
  
  2. Security
    - Enable RLS on all tables
    - Add proper policies for data access
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create salon settings table
CREATE TABLE IF NOT EXISTS public.salon_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id uuid REFERENCES public.salons(id) ON DELETE CASCADE,
  working_hours jsonb DEFAULT '{}'::jsonb,
  booking_rules jsonb DEFAULT '{}'::jsonb,
  notification_settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (salon_id)
);

-- Enable RLS
ALTER TABLE public.salon_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for salon settings
CREATE POLICY "Salon settings are viewable by salon staff"
  ON public.salon_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE staff.salon_id = salon_settings.salon_id
      AND staff.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Salon settings are manageable by salon admins"
  ON public.salon_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE staff.salon_id = salon_settings.salon_id
      AND staff.auth_user_id = auth.uid()
      AND staff.role = 'admin'
    )
  );

-- Create demo salon settings
WITH salon_id AS (
  SELECT id FROM public.salons WHERE slug = 'demo-salon'
)
INSERT INTO public.salon_settings (
  salon_id,
  working_hours,
  booking_rules,
  notification_settings
)
SELECT 
  id,
  '{
    "monday": {"start": "09:00", "end": "18:00"},
    "tuesday": {"start": "09:00", "end": "18:00"},
    "wednesday": {"start": "09:00", "end": "18:00"},
    "thursday": {"start": "09:00", "end": "18:00"},
    "friday": {"start": "09:00", "end": "18:00"},
    "saturday": {"start": "09:00", "end": "17:00"},
    "sunday": null
  }'::jsonb,
  '{
    "min_notice": 30,
    "max_future_days": 60,
    "cancellation_period": 24
  }'::jsonb,
  '{
    "email": true,
    "sms": false,
    "reminder_hours": 24
  }'::jsonb
FROM salon_id
ON CONFLICT (salon_id) DO NOTHING;