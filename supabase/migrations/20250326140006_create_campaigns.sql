-- Migration: Create Campaigns Table (Scoped to Salon)

CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'failed', 'archived');
CREATE TYPE campaign_type AS ENUM ('email', 'sms'); -- Add SMS later if needed
CREATE TYPE campaign_target_type AS ENUM ('all_clients', 'specific_clients', 'manual_list'); -- Define targeting options

CREATE TABLE public.campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    name character varying NOT NULL,
    subject character varying, -- Required for email, optional for SMS?
    content text NOT NULL, -- Email HTML/Markdown or SMS text
    type campaign_type NOT NULL DEFAULT 'email',
    status campaign_status NOT NULL DEFAULT 'draft',
    target_type campaign_target_type NOT NULL DEFAULT 'all_clients',
    -- For specific_clients, we might link to a saved segment or filter criteria later
    -- For manual_list, this could store comma-separated emails/phones or link to another table
    manual_recipients text, 
    scheduled_at timestamp with time zone, -- For scheduled campaigns
    sent_at timestamp with time zone, -- When sending completed
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Staff who created it

    -- Basic Stats (can be updated by backend function/webhook after sending)
    stat_sent integer DEFAULT 0,
    stat_opened integer DEFAULT 0,
    stat_clicked integer DEFAULT 0
    -- Add more stats like bounced, unsubscribed if needed
);

-- Add indexes
CREATE INDEX idx_campaigns_salon_id ON public.campaigns(salon_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);

-- RLS Policies (Allow staff to manage campaigns for their salon)
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow salon staff to manage campaigns for their salon"
ON public.campaigns FOR ALL
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
     EXISTS (SELECT 1 FROM clients c WHERE c.salon_id = campaigns.salon_id AND c.user_id = auth.uid() AND c.role = 'owner') OR
     EXISTS (SELECT 1 FROM staff s WHERE s.salon_id = campaigns.salon_id AND s.user_id = auth.uid())
  )
)
WITH CHECK (
  auth.role() = 'authenticated' AND
   EXISTS (
     EXISTS (SELECT 1 FROM clients c WHERE c.salon_id = campaigns.salon_id AND c.user_id = auth.uid() AND c.role = 'owner') OR
     EXISTS (SELECT 1 FROM staff s WHERE s.salon_id = campaigns.salon_id AND s.user_id = auth.uid())
  )
);

-- Trigger to update updated_at timestamp
CREATE TRIGGER handle_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION moddatetime('updated_at');