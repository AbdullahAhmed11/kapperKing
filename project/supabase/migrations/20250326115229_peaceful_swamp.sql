/*
  # Update Subscription and Salon Relationships

  1. Changes
    - Add missing indexes for subscription plans and salons
    - Update RLS policies for better access control
*/

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_salons_subscription_plan_id ON salons(subscription_plan_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_name ON subscription_plans(name);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_interval ON subscription_plans(interval);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_price ON subscription_plans(price);

-- Update RLS policies for subscription_plans
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Platform admins can manage subscription plans"
  ON subscription_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.auth_user_id = auth.uid()
      AND s.role = 'admin'
    )
  );

-- Update RLS policies for salons
CREATE POLICY "Platform admins can manage all salons"
  ON salons
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff s
      WHERE s.auth_user_id = auth.uid()
      AND s.role = 'admin'
    )
  );