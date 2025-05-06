-- Create initial website configuration for demo salon
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
WHERE NOT EXISTS (
  SELECT 1 FROM public.salon_websites sw 
  WHERE sw.salon_id = (SELECT id FROM salon_id)
);

-- Insert demo pages
WITH salon_id AS (
  SELECT id FROM public.salons WHERE slug = 'demo-salon'
)
INSERT INTO public.salon_pages (
  salon_id,
  title,
  slug,
  content,
  meta_description,
  is_published
)
SELECT 
  id,
  'About Us',
  'about',
  'Welcome to Demo Salon. We are passionate about creating beautiful hairstyles and providing exceptional service.',
  'Learn more about Demo Salon and our commitment to excellence',
  true
FROM salon_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.salon_pages sp 
  WHERE sp.salon_id = (SELECT id FROM salon_id) AND sp.slug = 'about'
);