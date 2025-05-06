/*
  # Add Application Schema
  
  1. New Tables
    - services
    - service_categories
    - clients
    - appointments
    - staff_services
    
  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    
  3. Changes
    - Add foreign key relationships
    - Add indexes for performance
    - Add default values and constraints
*/

-- Create service_categories table
CREATE TABLE IF NOT EXISTS public.service_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id uuid REFERENCES public.salons(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id uuid REFERENCES public.salons(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.service_categories(id),
  name text NOT NULL,
  description text,
  duration integer NOT NULL,
  price numeric(10,2) NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id uuid REFERENCES public.salons(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  notes text,
  loyalty_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_visit timestamptz
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id uuid REFERENCES public.salons(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id),
  staff_id uuid REFERENCES public.staff(id),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT appointments_status_check CHECK (status = ANY (ARRAY['pending', 'confirmed', 'cancelled', 'completed']))
);

-- Create staff_services table
CREATE TABLE IF NOT EXISTS public.staff_services (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id uuid REFERENCES public.staff(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (staff_id, service_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_service_categories_salon_id ON public.service_categories(salon_id);
CREATE INDEX IF NOT EXISTS idx_services_salon_id ON public.services(salon_id);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_clients_salon_id ON public.clients(salon_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_appointments_salon_id ON public.appointments(salon_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON public.appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff_id ON public.appointments(staff_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_staff_services_staff_id ON public.staff_services(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_services_service_id ON public.staff_services(service_id);

-- Enable RLS
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service categories are manageable by salon admins" ON public.service_categories;
DROP POLICY IF EXISTS "Service categories are viewable by salon staff" ON public.service_categories;
DROP POLICY IF EXISTS "Services are manageable by salon admins" ON public.services;
DROP POLICY IF EXISTS "Services are viewable by salon staff" ON public.services;
DROP POLICY IF EXISTS "Clients are manageable by salon staff" ON public.clients;
DROP POLICY IF EXISTS "Clients are viewable by salon staff" ON public.clients;
DROP POLICY IF EXISTS "Appointments are manageable by salon staff" ON public.appointments;
DROP POLICY IF EXISTS "Appointments are viewable by salon staff" ON public.appointments;
DROP POLICY IF EXISTS "Staff services are viewable by salon staff" ON public.staff_services;

-- Create RLS policies for service_categories
CREATE POLICY "Service categories are manageable by salon admins"
  ON public.service_categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE staff.salon_id = service_categories.salon_id
      AND staff.auth_user_id = auth.uid()
      AND staff.role = 'admin'
    )
  );

CREATE POLICY "Service categories are viewable by salon staff"
  ON public.service_categories
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE staff.salon_id = service_categories.salon_id
      AND staff.auth_user_id = auth.uid()
    )
  );

-- Create RLS policies for services
CREATE POLICY "Services are manageable by salon admins"
  ON public.services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE staff.salon_id = services.salon_id
      AND staff.auth_user_id = auth.uid()
      AND staff.role = 'admin'
    )
  );

CREATE POLICY "Services are viewable by salon staff"
  ON public.services
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE staff.salon_id = services.salon_id
      AND staff.auth_user_id = auth.uid()
    )
  );

-- Create RLS policies for clients
CREATE POLICY "Clients are manageable by salon staff"
  ON public.clients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE staff.salon_id = clients.salon_id
      AND staff.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Clients are viewable by salon staff"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE staff.salon_id = clients.salon_id
      AND staff.auth_user_id = auth.uid()
    )
  );

-- Create RLS policies for appointments
CREATE POLICY "Appointments are manageable by salon staff"
  ON public.appointments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE staff.salon_id = appointments.salon_id
      AND staff.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Appointments are viewable by salon staff"
  ON public.appointments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE staff.salon_id = appointments.salon_id
      AND staff.auth_user_id = auth.uid()
    )
  );

-- Create RLS policies for staff_services
CREATE POLICY "Staff services are viewable by salon staff"
  ON public.staff_services
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE staff.id = staff_services.staff_id
      AND staff.auth_user_id = auth.uid()
    )
  );

-- Insert demo data
WITH salon_id AS (
  SELECT id FROM public.salons WHERE slug = 'demo-salon'
), category_id AS (
  INSERT INTO public.service_categories (salon_id, name, description)
  SELECT 
    id,
    'Haircuts',
    'All haircut services'
  FROM salon_id
  RETURNING id
)
INSERT INTO public.services (
  salon_id,
  category_id,
  name,
  description,
  duration,
  price,
  active
)
SELECT 
  s.id,
  c.id,
  'Men''s Haircut',
  'Classic men''s haircut including wash and styling',
  30,
  35.00,
  true
FROM salon_id s
CROSS JOIN category_id c
ON CONFLICT DO NOTHING;