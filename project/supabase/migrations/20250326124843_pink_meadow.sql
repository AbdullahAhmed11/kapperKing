/*
  # Fix Salon Website Schema

  1. Changes
    - Add policy existence checks
    - Keep existing table structure
    - Maintain all indexes and functions
  
  2. Security
    - Enable RLS on all tables
    - Add proper policies for data access
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public can view published salon websites" ON public.salon_websites;
  DROP POLICY IF EXISTS "Salon admins can manage their website" ON public.salon_websites;
  DROP POLICY IF EXISTS "Public can view published pages" ON public.salon_pages;
  DROP POLICY IF EXISTS "Salon staff can manage pages" ON public.salon_pages;
  DROP POLICY IF EXISTS "Public can view published blog posts" ON public.salon_blog_posts;
  DROP POLICY IF EXISTS "Salon staff can manage blog posts" ON public.salon_blog_posts;
  DROP POLICY IF EXISTS "Public can view approved testimonials" ON public.salon_testimonials;
  DROP POLICY IF EXISTS "Salon staff can manage testimonials" ON public.salon_testimonials;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create salon_websites table
CREATE TABLE IF NOT EXISTS salon_websites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  theme_config jsonb DEFAULT '{
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
  seo_config jsonb DEFAULT '{
    "title": "",
    "description": "",
    "keywords": [],
    "ogImage": ""
  }'::jsonb,
  navigation jsonb DEFAULT '[]'::jsonb,
  social_links jsonb DEFAULT '{}'::jsonb,
  custom_css text,
  custom_scripts text,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(salon_id)
);

-- Create salon_pages table
CREATE TABLE IF NOT EXISTS salon_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  content text NOT NULL,
  meta_description text,
  is_published boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(salon_id, slug)
);

-- Create salon_blog_posts table
CREATE TABLE IF NOT EXISTS salon_blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  content text NOT NULL,
  excerpt text,
  featured_image text,
  author_id uuid REFERENCES staff(id),
  meta_description text,
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(salon_id, slug)
);

-- Create salon_testimonials table
CREATE TABLE IF NOT EXISTS salon_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id uuid NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id),
  content text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  is_featured boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_salon_websites_salon_id ON salon_websites(salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_pages_salon_id ON salon_pages(salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_pages_slug ON salon_pages(slug);
CREATE INDEX IF NOT EXISTS idx_salon_blog_posts_salon_id ON salon_blog_posts(salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_blog_posts_slug ON salon_blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_salon_blog_posts_author_id ON salon_blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_salon_testimonials_salon_id ON salon_testimonials(salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_testimonials_client_id ON salon_testimonials(client_id);

-- Enable RLS
ALTER TABLE salon_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_testimonials ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$ 
BEGIN
  -- Website policies
  CREATE POLICY "Public can view published salon websites"
    ON salon_websites
    FOR SELECT
    TO public
    USING (is_published = true);

  CREATE POLICY "Salon admins can manage their website"
    ON salon_websites
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM staff s
        WHERE s.auth_user_id = auth.uid()
        AND s.salon_id = salon_websites.salon_id
        AND s.role = 'admin'
      )
    );

  -- Page policies
  CREATE POLICY "Public can view published pages"
    ON salon_pages
    FOR SELECT
    TO public
    USING (is_published = true);

  CREATE POLICY "Salon staff can manage pages"
    ON salon_pages
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM staff s
        WHERE s.auth_user_id = auth.uid()
        AND s.salon_id = salon_pages.salon_id
        AND s.role IN ('admin', 'manager')
      )
    );

  -- Blog post policies
  CREATE POLICY "Public can view published blog posts"
    ON salon_blog_posts
    FOR SELECT
    TO public
    USING (is_published = true);

  CREATE POLICY "Salon staff can manage blog posts"
    ON salon_blog_posts
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM staff s
        WHERE s.auth_user_id = auth.uid()
        AND s.salon_id = salon_blog_posts.salon_id
        AND s.role IN ('admin', 'manager')
      )
    );

  -- Testimonial policies
  CREATE POLICY "Public can view approved testimonials"
    ON salon_testimonials
    FOR SELECT
    TO public
    USING (is_approved = true);

  CREATE POLICY "Salon staff can manage testimonials"
    ON salon_testimonials
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM staff s
        WHERE s.auth_user_id = auth.uid()
        AND s.salon_id = salon_testimonials.salon_id
        AND s.role IN ('admin', 'manager')
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create or replace function to update website theme
CREATE OR REPLACE FUNCTION update_website_theme(
  p_salon_id uuid,
  p_theme_config jsonb
)
RETURNS void AS $$
BEGIN
  UPDATE salon_websites
  SET theme_config = p_theme_config,
      updated_at = now()
  WHERE salon_id = p_salon_id;
END;
$$ LANGUAGE plpgsql;

-- Create or replace function to publish/unpublish website
CREATE OR REPLACE FUNCTION toggle_website_published(
  p_salon_id uuid,
  p_is_published boolean
)
RETURNS void AS $$
BEGIN
  UPDATE salon_websites
  SET is_published = p_is_published,
      updated_at = now()
  WHERE salon_id = p_salon_id;
END;
$$ LANGUAGE plpgsql;