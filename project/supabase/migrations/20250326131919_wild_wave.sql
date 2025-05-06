/*
  # Add Loyalty Program and Online Booking Tables
  
  1. New Tables
    - loyalty_program_settings: Store salon-specific loyalty program rules
    - loyalty_points: Track client points balance
    - loyalty_transactions: Record point earning/redemption history
    - online_booking_settings: Store salon-specific booking rules
    - booking_slots: Track available booking slots
    - booking_requests: Store booking requests from clients
  
  2. Security
    - Enable RLS on all tables
    - Add policies for secure access
*/

-- Create loyalty_program_settings table
CREATE TABLE IF NOT EXISTS loyalty_program_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  points_per_currency numeric(10,2) DEFAULT 1.0,
  points_value_currency numeric(10,2) DEFAULT 0.01,
  minimum_points_redemption integer DEFAULT 100,
  welcome_bonus_points integer DEFAULT 0,
  birthday_bonus_points integer DEFAULT 0,
  expiry_months integer DEFAULT 12,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(salon_id)
);

-- Create loyalty_points table
CREATE TABLE IF NOT EXISTS loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  points_balance integer DEFAULT 0,
  total_points_earned integer DEFAULT 0,
  total_points_redeemed integer DEFAULT 0,
  last_activity_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(client_id, salon_id)
);

-- Create loyalty_transactions table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  points integer NOT NULL,
  type text NOT NULL CHECK (type IN ('earn', 'redeem', 'expire', 'bonus')),
  source text NOT NULL,
  source_id uuid,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create online_booking_settings table
CREATE TABLE IF NOT EXISTS online_booking_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  min_advance_hours integer DEFAULT 24,
  max_advance_days integer DEFAULT 30,
  buffer_minutes integer DEFAULT 0,
  cancellation_hours integer DEFAULT 24,
  allow_guest_booking boolean DEFAULT true,
  require_deposit boolean DEFAULT false,
  deposit_amount numeric(10,2) DEFAULT 0,
  confirmation_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(salon_id)
);

-- Create booking_slots table
CREATE TABLE IF NOT EXISTS booking_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create booking_requests table
CREATE TABLE IF NOT EXISTS booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  requested_date date NOT NULL,
  requested_time time NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
  guest_name text,
  guest_email text,
  guest_phone text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_program_settings_salon_id ON loyalty_program_settings(salon_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_client_id ON loyalty_points(client_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_salon_id ON loyalty_points(salon_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_client_id ON loyalty_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_salon_id ON loyalty_transactions(salon_id);
CREATE INDEX IF NOT EXISTS idx_online_booking_settings_salon_id ON online_booking_settings(salon_id);
CREATE INDEX IF NOT EXISTS idx_booking_slots_salon_id ON booking_slots(salon_id);
CREATE INDEX IF NOT EXISTS idx_booking_slots_staff_id ON booking_slots(staff_id);
CREATE INDEX IF NOT EXISTS idx_booking_slots_service_id ON booking_slots(service_id);
CREATE INDEX IF NOT EXISTS idx_booking_slots_start_time ON booking_slots(start_time);
CREATE INDEX IF NOT EXISTS idx_booking_requests_salon_id ON booking_requests(salon_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_client_id ON booking_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_service_id ON booking_requests(service_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_staff_id ON booking_requests(staff_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_requested_date ON booking_requests(requested_date);

-- Enable RLS
ALTER TABLE loyalty_program_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_booking_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$ 
BEGIN
  -- Loyalty Program Settings
  CREATE POLICY "Salon admins can manage loyalty program settings"
    ON loyalty_program_settings
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM staff s
        WHERE s.auth_user_id = auth.uid()
        AND s.salon_id = loyalty_program_settings.salon_id
        AND s.role = 'admin'
      )
    );

  CREATE POLICY "Staff can view loyalty program settings"
    ON loyalty_program_settings
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM staff s
        WHERE s.auth_user_id = auth.uid()
        AND s.salon_id = loyalty_program_settings.salon_id
      )
    );

  -- Loyalty Points
  CREATE POLICY "Staff can manage loyalty points"
    ON loyalty_points
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM staff s
        WHERE s.auth_user_id = auth.uid()
        AND s.salon_id = loyalty_points.salon_id
      )
    );

  -- Loyalty Transactions
  CREATE POLICY "Staff can view loyalty transactions"
    ON loyalty_transactions
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM staff s
        WHERE s.auth_user_id = auth.uid()
        AND s.salon_id = loyalty_transactions.salon_id
      )
    );

  -- Online Booking Settings
  CREATE POLICY "Salon admins can manage booking settings"
    ON online_booking_settings
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM staff s
        WHERE s.auth_user_id = auth.uid()
        AND s.salon_id = online_booking_settings.salon_id
        AND s.role = 'admin'
      )
    );

  CREATE POLICY "Staff can view booking settings"
    ON online_booking_settings
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM staff s
        WHERE s.auth_user_id = auth.uid()
        AND s.salon_id = online_booking_settings.salon_id
      )
    );

  -- Booking Slots
  CREATE POLICY "Staff can manage booking slots"
    ON booking_slots
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM staff s
        WHERE s.auth_user_id = auth.uid()
        AND s.salon_id = booking_slots.salon_id
      )
    );

  CREATE POLICY "Public can view available booking slots"
    ON booking_slots
    FOR SELECT
    TO public
    USING (is_available = true);

  -- Booking Requests
  CREATE POLICY "Staff can manage booking requests"
    ON booking_requests
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM staff s
        WHERE s.auth_user_id = auth.uid()
        AND s.salon_id = booking_requests.salon_id
      )
    );

  CREATE POLICY "Public can create booking requests"
    ON booking_requests
    FOR INSERT
    TO public
    WITH CHECK (true);

EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create function to calculate available booking slots
CREATE OR REPLACE FUNCTION calculate_available_slots(
  p_salon_id uuid,
  p_date date,
  p_service_id uuid
)
RETURNS TABLE (
  staff_id uuid,
  start_time timestamptz,
  end_time timestamptz
) AS $$
DECLARE
  v_service_duration integer;
BEGIN
  -- Get service duration
  SELECT duration INTO v_service_duration
  FROM services
  WHERE id = p_service_id;

  RETURN QUERY
  WITH staff_availability AS (
    -- Get staff members who can perform the service
    SELECT DISTINCT s.id, s.first_name, s.last_name
    FROM staff s
    JOIN staff_services ss ON ss.staff_id = s.id
    WHERE s.salon_id = p_salon_id
    AND ss.service_id = p_service_id
    AND s.active = true
  ),
  time_slots AS (
    -- Generate time slots for the day
    SELECT generate_series(
      date_trunc('day', p_date::timestamp) + interval '9 hours',
      date_trunc('day', p_date::timestamp) + interval '17 hours' - (v_service_duration || ' minutes')::interval,
      '30 minutes'::interval
    ) as slot_start
  ),
  existing_bookings AS (
    -- Get existing bookings
    SELECT staff_id, start_time, end_time
    FROM appointments
    WHERE salon_id = p_salon_id
    AND date_trunc('day', start_time) = p_date
    AND status NOT IN ('cancelled')
  )
  SELECT 
    sa.id as staff_id,
    ts.slot_start as start_time,
    ts.slot_start + (v_service_duration || ' minutes')::interval as end_time
  FROM staff_availability sa
  CROSS JOIN time_slots ts
  WHERE NOT EXISTS (
    SELECT 1 FROM existing_bookings eb
    WHERE eb.staff_id = sa.id
    AND (
      (ts.slot_start, ts.slot_start + (v_service_duration || ' minutes')::interval) OVERLAPS 
      (eb.start_time, eb.end_time)
    )
  )
  ORDER BY ts.slot_start;
END;
$$ LANGUAGE plpgsql;

-- Create function to create a booking request
CREATE OR REPLACE FUNCTION create_booking_request(
  p_salon_id uuid,
  p_client_id uuid,
  p_service_id uuid,
  p_staff_id uuid,
  p_requested_date date,
  p_requested_time time,
  p_guest_name text DEFAULT NULL,
  p_guest_email text DEFAULT NULL,
  p_guest_phone text DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_request_id uuid;
BEGIN
  -- Insert booking request
  INSERT INTO booking_requests (
    salon_id,
    client_id,
    service_id,
    staff_id,
    requested_date,
    requested_time,
    guest_name,
    guest_email,
    guest_phone,
    notes
  ) VALUES (
    p_salon_id,
    p_client_id,
    p_service_id,
    p_staff_id,
    p_requested_date,
    p_requested_time,
    p_guest_name,
    p_guest_email,
    p_guest_phone,
    p_notes
  )
  RETURNING id INTO v_request_id;

  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to confirm booking request
CREATE OR REPLACE FUNCTION confirm_booking_request(
  p_request_id uuid
)
RETURNS uuid AS $$
DECLARE
  v_appointment_id uuid;
  v_request booking_requests;
  v_service_duration integer;
BEGIN
  -- Get booking request details
  SELECT * INTO v_request
  FROM booking_requests
  WHERE id = p_request_id;

  -- Get service duration
  SELECT duration INTO v_service_duration
  FROM services
  WHERE id = v_request.service_id;

  -- Create appointment
  INSERT INTO appointments (
    salon_id,
    client_id,
    service_id,
    staff_id,
    start_time,
    end_time,
    status,
    notes
  ) VALUES (
    v_request.salon_id,
    v_request.client_id,
    v_request.service_id,
    v_request.staff_id,
    v_request.requested_date + v_request.requested_time,
    v_request.requested_date + v_request.requested_time + (v_service_duration || ' minutes')::interval,
    'confirmed',
    v_request.notes
  )
  RETURNING id INTO v_appointment_id;

  -- Update booking request status
  UPDATE booking_requests
  SET status = 'confirmed',
      updated_at = now()
  WHERE id = p_request_id;

  RETURN v_appointment_id;
END;
$$ LANGUAGE plpgsql;

-- Insert demo loyalty program settings
WITH salon_id AS (
  SELECT id FROM public.salons WHERE slug = 'demo-salon'
)
INSERT INTO loyalty_program_settings (
  salon_id,
  points_per_currency,
  points_value_currency,
  minimum_points_redemption,
  welcome_bonus_points,
  birthday_bonus_points,
  expiry_months
)
SELECT 
  id,
  1.0,
  0.01,
  100,
  50,
  100,
  12
FROM salon_id
ON CONFLICT (salon_id) DO NOTHING;

-- Insert demo online booking settings
WITH salon_id AS (
  SELECT id FROM public.salons WHERE slug = 'demo-salon'
)
INSERT INTO online_booking_settings (
  salon_id,
  min_advance_hours,
  max_advance_days,
  buffer_minutes,
  cancellation_hours,
  allow_guest_booking,
  require_deposit,
  deposit_amount,
  confirmation_required
)
SELECT 
  id,
  24,
  30,
  15,
  24,
  true,
  false,
  0,
  true
FROM salon_id
ON CONFLICT (salon_id) DO NOTHING;