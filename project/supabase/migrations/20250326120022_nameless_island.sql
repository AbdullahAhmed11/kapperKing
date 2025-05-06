/*
  # Payment Processing Schema

  1. New Tables
    - `payment_methods`
      - Stores customer payment methods
      - Links to Stripe payment method IDs
    - `payment_transactions`
      - Records all payment transactions
      - Links to Stripe payment intents
    - `subscriptions`
      - Stores subscription information
      - Links to Stripe subscriptions

  2. Security
    - Enable RLS on all tables
    - Add policies for secure access
*/

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  stripe_payment_method_id text NOT NULL,
  type text NOT NULL,
  last_four text NOT NULL,
  exp_month integer NOT NULL,
  exp_year integer NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'eur',
  status text NOT NULL,
  stripe_payment_intent_id text,
  payment_method_id uuid REFERENCES payment_methods(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id),
  stripe_subscription_id text,
  status text NOT NULL,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_salon_id ON payment_methods(salon_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_id ON payment_methods(stripe_payment_method_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_salon_id ON payment_transactions(salon_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_id ON payment_transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_salon_id ON subscriptions(salon_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payment_methods
CREATE POLICY "Salon owners can manage their payment methods"
  ON payment_methods
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.auth_user_id = auth.uid()
      AND s.salon_id = payment_methods.salon_id
      AND s.role = 'admin'
    )
  );

-- Create RLS policies for payment_transactions
CREATE POLICY "Salon staff can view transactions"
  ON payment_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.auth_user_id = auth.uid()
      AND s.salon_id = payment_transactions.salon_id
    )
  );

CREATE POLICY "Salon admins can manage transactions"
  ON payment_transactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.auth_user_id = auth.uid()
      AND s.salon_id = payment_transactions.salon_id
      AND s.role = 'admin'
    )
  );

-- Create RLS policies for subscriptions
CREATE POLICY "Salon admins can view and manage subscriptions"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.auth_user_id = auth.uid()
      AND s.salon_id = subscriptions.salon_id
      AND s.role = 'admin'
    )
  );

-- Create function to handle subscription status updates
CREATE OR REPLACE FUNCTION handle_subscription_update()
RETURNS trigger AS $$
BEGIN
  -- Update the salon's subscription status
  UPDATE salons
  SET subscription_status = NEW.status
  WHERE id = NEW.salon_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for subscription status updates
CREATE TRIGGER subscription_status_update
  AFTER INSERT OR UPDATE OF status
  ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_subscription_update();