-- Migration: Create Notifications Table

CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- User receiving notification
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE, -- Salon context
    type text NOT NULL, -- e.g., 'new_appointment', 'new_client', 'appointment_cancelled'
    title text NOT NULL, -- Short summary
    message text NOT NULL, -- Full message content
    is_read boolean DEFAULT false NOT NULL,
    related_appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
    related_client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL
    -- Add other related IDs if needed (e.g., related_staff_id)
);

-- Add indexes
CREATE INDEX idx_notifications_user_salon ON public.notifications(user_id, salon_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Add RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own notifications
CREATE POLICY "Allow users to read their own notifications"
ON public.notifications FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  user_id = auth.uid()
);

-- Allow users to update the is_read status of their own notifications
CREATE POLICY "Allow users to mark their own notifications as read"
ON public.notifications FOR UPDATE
USING (
  auth.role() = 'authenticated' AND
  user_id = auth.uid()
)
WITH CHECK (
  auth.role() = 'authenticated' AND
  user_id = auth.uid()
);

-- Allow backend service role or specific functions to insert notifications
-- (No INSERT policy for users directly, notifications are typically system-generated)
-- Example: Allow insert only via a specific role or function if needed
-- CREATE POLICY "Allow backend to insert notifications"
-- ON public.notifications FOR INSERT
-- WITH CHECK (auth.role() = 'service_role'); -- Or check for specific function context