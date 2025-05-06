/*
  # Create Client-Salons Relationship

  1. New Tables
    - `client_salons`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `salon_id` (uuid, foreign key to salons)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `client_salons` table
    - Add policies for authenticated users to manage client-salon relationships
*/

-- Create the client_salons table
CREATE TABLE IF NOT EXISTS client_salons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, salon_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_client_salons_client_id ON client_salons(client_id);
CREATE INDEX IF NOT EXISTS idx_client_salons_salon_id ON client_salons(salon_id);

-- Enable RLS
ALTER TABLE client_salons ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view client-salon relationships"
  ON client_salons
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Salon admins can manage client-salon relationships"
  ON client_salons
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.auth_user_id = auth.uid()
      AND s.role = 'admin'
      AND s.salon_id = client_salons.salon_id
    )
  );