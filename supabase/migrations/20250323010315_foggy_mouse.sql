/*
  # Add Staff Availability Tables and Policies
  
  1. New Tables
    - staff_availability
      - id (uuid, primary key)
      - staff_id (uuid, references staff)
      - day_of_week (integer, 0-6)
      - start_time (time)
      - end_time (time)
      - is_available (boolean)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - staff_breaks
      - id (uuid, primary key)
      - staff_id (uuid, references staff)
      - availability_id (uuid, references staff_availability)
      - start_time (time)
      - end_time (time)
      - created_at (timestamptz)
      - updated_at (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policies for staff and admin access
*/

-- Create staff_availability table
CREATE TABLE IF NOT EXISTS public.staff_availability (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id uuid REFERENCES public.staff(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (staff_id, day_of_week)
);

-- Create staff_breaks table
CREATE TABLE IF NOT EXISTS public.staff_breaks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id uuid REFERENCES public.staff(id) ON DELETE CASCADE,
  availability_id uuid REFERENCES public.staff_availability(id) ON DELETE CASCADE,
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_staff_availability_staff_id ON public.staff_availability(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_breaks_staff_id ON public.staff_breaks(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_breaks_availability_id ON public.staff_breaks(availability_id);

-- Enable RLS
ALTER TABLE public.staff_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_breaks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Staff can view their own availability" ON public.staff_availability;
  DROP POLICY IF EXISTS "Staff can manage their own availability" ON public.staff_availability;
  DROP POLICY IF EXISTS "Staff can view their own breaks" ON public.staff_breaks;
  DROP POLICY IF EXISTS "Staff can manage their own breaks" ON public.staff_breaks;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create RLS policies for staff_availability
CREATE POLICY "Staff can view their own availability"
  ON public.staff_availability
  FOR SELECT
  TO authenticated
  USING (
    staff_id IN (
      SELECT id FROM public.staff
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage their own availability"
  ON public.staff_availability
  FOR ALL
  TO authenticated
  USING (
    staff_id IN (
      SELECT id FROM public.staff
      WHERE auth_user_id = auth.uid()
    )
  );

-- Create RLS policies for staff_breaks
CREATE POLICY "Staff can view their own breaks"
  ON public.staff_breaks
  FOR SELECT
  TO authenticated
  USING (
    staff_id IN (
      SELECT id FROM public.staff
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage their own breaks"
  ON public.staff_breaks
  FOR ALL
  TO authenticated
  USING (
    staff_id IN (
      SELECT id FROM public.staff
      WHERE auth_user_id = auth.uid()
    )
  );

-- Insert default availability for demo staff
WITH demo_staff AS (
  SELECT id FROM public.staff WHERE email = 'admin@kapperking.com'
)
INSERT INTO public.staff_availability (
  staff_id,
  day_of_week,
  start_time,
  end_time,
  is_available
)
SELECT 
  id,
  generate_series(1, 5) as day_of_week,
  '09:00'::time as start_time,
  '17:00'::time as end_time,
  true as is_available
FROM demo_staff
ON CONFLICT (staff_id, day_of_week) DO NOTHING;