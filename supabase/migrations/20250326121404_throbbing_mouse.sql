/*
  # Add Loyalty Program Tables

  1. New Tables
    - client_loyalty_points: Stores current points balance for each client
    - loyalty_points_history: Tracks point earning and redemption history
    
  2. Security
    - Enable RLS
    - Add policies for staff access
*/

-- Create client_loyalty_points table
CREATE TABLE IF NOT EXISTS client_loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  points integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(client_id, salon_id)
);

-- Create loyalty_points_history table
CREATE TABLE IF NOT EXISTS loyalty_points_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  points integer NOT NULL,
  type text NOT NULL CHECK (type IN ('earned', 'redeemed')),
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_client_loyalty_points_client_id ON client_loyalty_points(client_id);
CREATE INDEX IF NOT EXISTS idx_client_loyalty_points_salon_id ON client_loyalty_points(salon_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_history_client_id ON loyalty_points_history(client_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_history_salon_id ON loyalty_points_history(salon_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_history_created_at ON loyalty_points_history(created_at);

-- Enable RLS
ALTER TABLE client_loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Clients can view their own loyalty points"
  ON client_loyalty_points
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM client_salons cs
      WHERE cs.client_id = client_loyalty_points.client_id
      AND cs.salon_id = client_loyalty_points.salon_id
    )
  );

CREATE POLICY "Staff can view client loyalty points"
  ON client_loyalty_points
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.auth_user_id = auth.uid()
      AND s.salon_id = client_loyalty_points.salon_id
    )
  );

CREATE POLICY "Staff can manage client loyalty points"
  ON client_loyalty_points
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.auth_user_id = auth.uid()
      AND s.salon_id = client_loyalty_points.salon_id
      AND s.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Clients can view their own loyalty history"
  ON loyalty_points_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM client_salons cs
      WHERE cs.client_id = loyalty_points_history.client_id
      AND cs.salon_id = loyalty_points_history.salon_id
    )
  );

CREATE POLICY "Staff can view loyalty history"
  ON loyalty_points_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.auth_user_id = auth.uid()
      AND s.salon_id = loyalty_points_history.salon_id
    )
  );

CREATE POLICY "Staff can manage loyalty history"
  ON loyalty_points_history
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.auth_user_id = auth.uid()
      AND s.salon_id = loyalty_points_history.salon_id
      AND s.role IN ('admin', 'manager')
    )
  );

-- Create function to add loyalty points
CREATE OR REPLACE FUNCTION add_loyalty_points(
  p_client_id uuid,
  p_salon_id uuid,
  p_points integer,
  p_description text
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert or update points
  INSERT INTO client_loyalty_points (client_id, salon_id, points)
  VALUES (p_client_id, p_salon_id, p_points)
  ON CONFLICT (client_id, salon_id)
  DO UPDATE SET
    points = client_loyalty_points.points + p_points,
    updated_at = now();

  -- Record history
  INSERT INTO loyalty_points_history (
    client_id,
    salon_id,
    points,
    type,
    description
  ) VALUES (
    p_client_id,
    p_salon_id,
    p_points,
    'earned',
    p_description
  );
END;
$$;

-- Create function to redeem loyalty points
CREATE OR REPLACE FUNCTION redeem_loyalty_points(
  p_client_id uuid,
  p_salon_id uuid,
  p_points integer,
  p_description text
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_points integer;
BEGIN
  -- Get current points
  SELECT points INTO v_current_points
  FROM client_loyalty_points
  WHERE client_id = p_client_id
  AND salon_id = p_salon_id;

  -- Check if enough points
  IF v_current_points IS NULL OR v_current_points < p_points THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;

  -- Update points
  UPDATE client_loyalty_points
  SET points = points - p_points,
      updated_at = now()
  WHERE client_id = p_client_id
  AND salon_id = p_salon_id;

  -- Record history
  INSERT INTO loyalty_points_history (
    client_id,
    salon_id,
    points,
    type,
    description
  ) VALUES (
    p_client_id,
    p_salon_id,
    -p_points,
    'redeemed',
    p_description
  );
END;
$$;