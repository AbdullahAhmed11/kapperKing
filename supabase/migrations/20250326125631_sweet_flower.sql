-- Insert demo salon website data
WITH salon_id AS (
  SELECT id FROM public.salons WHERE slug = 'demo-salon'
)
INSERT INTO public.salon_websites (
  salon_id,
  theme_config,
  seo_config,
  navigation,
  social_links,
  is_published
)
SELECT 
  id,
  '{
    "colors": {
      "primary": "#6B46C1",
      "secondary": "#E84393",
      "accent": "#38B2AC",
      "background": "#FFFFFF",
      "text": "#1A202C"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "layout": {
      "header": "default",
      "footer": "default"
    }
  }'::jsonb,
  '{
    "title": "Demo Salon - Professional Hair Salon",
    "description": "Professional hair salon services in Amsterdam",
    "keywords": ["hair salon", "haircut", "styling", "color"],
    "ogImage": ""
  }'::jsonb,
  '[
    {"label": "Home", "url": "#"},
    {"label": "Services", "url": "#services"},
    {"label": "Team", "url": "#staff"},
    {"label": "Contact", "url": "#contact"}
  ]'::jsonb,
  '{
    "instagram": "https://instagram.com/demosalon",
    "facebook": "https://facebook.com/demosalon"
  }'::jsonb,
  true
FROM salon_id
ON CONFLICT (salon_id) DO UPDATE SET
  updated_at = now(),
  is_published = true;

-- Insert demo services
WITH salon_id AS (
  SELECT id FROM public.salons WHERE slug = 'demo-salon'
)
INSERT INTO public.services (
  salon_id,
  name,
  description,
  duration,
  price,
  active
)
SELECT 
  id,
  unnest(ARRAY['Men''s Haircut', 'Women''s Haircut', 'Color Treatment']) as name,
  unnest(ARRAY[
    'Classic men''s haircut with styling',
    'Women''s haircut and blowout',
    'Professional hair coloring service'
  ]) as description,
  unnest(ARRAY[30, 60, 120]) as duration,
  unnest(ARRAY[35.00, 65.00, 120.00]) as price,
  true as active
FROM salon_id
ON CONFLICT DO NOTHING;