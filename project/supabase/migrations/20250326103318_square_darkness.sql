/*
  # Create Core Application Tables and Policies
  
  1. Tables
    - service_categories: For organizing services into categories
    - services: For storing service details
    - clients: For managing client information
    - appointments: For booking management
    - staff_services: For linking staff to services they can perform
  
  2. Security
    - Enable RLS on all tables
    - Set up proper policies for data access
    
  3. Initial Data
    - Create demo service category and service
*/

-- Create service_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.service_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id uuid REFERENCES public.salons(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create services table if it doesn't exist
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

-- Create clients table if it doesn't exist
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

-- Create appointments table if it doesn't exist
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

-- Create staff_services table if it doesn't exist
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
DO $$ 
BEGIN
  ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Service categories are manageable by salon admins" ON public.service_categories;
  DROP POLICY IF EXISTS "Service categories are viewable by salon staff" ON public.service_categories;
  DROP POLICY IF EXISTS "Services are manageable by salon admins" ON public.services;
  DROP POLICY IF EXISTS "Services are viewable by salon staff" ON public.services;
  DROP POLICY IF EXISTS "Clients are manageable by salon staff" ON public.clients;
  DROP POLICY IF EXISTS "Clients are viewable by salon staff" ON public.clients;
  DROP POLICY IF EXISTS "Appointments are manageable by salon staff" ON public.appointments;
  DROP POLICY IF EXISTS "Appointments are viewable by salon staff" ON public.appointments;
  DROP POLICY IF EXISTS "Staff services are viewable by salon staff" ON public.staff_services;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create RLS policies
DO $$ 
BEGIN
  -- Service Categories Policies
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

  -- Services Policies
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

  -- Clients Policies
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

  -- Appointments Policies
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

  -- Staff Services Policies
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
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Insert demo data
DO $$
DECLARE
  v_salon_id uuid;
  v_category_id uuid;
BEGIN
  -- Get demo salon ID
  SELECT id INTO v_salon_id FROM public.salons WHERE slug = 'demo-salon';
  
  -- Create demo category if it doesn't exist
  INSERT INTO public.service_categories (salon_id, name, description)
  VALUES (v_salon_id, 'Haircuts', 'All haircut services')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_category_id;
  
  -- Create demo service if it doesn't exist
  INSERT INTO public.services (
    salon_id,
    category_id,
    name,
    description,
    duration,
    price,
    active
  )
  VALUES (
    v_salon_id,
    v_category_id,
    'Men''s Haircut',
    'Classic men''s haircut including wash and styling',
    30,
    35.00,
    true
  )
  ON CONFLICT DO NOTHING;
END $$;