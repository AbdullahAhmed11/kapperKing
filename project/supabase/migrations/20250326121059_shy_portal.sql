/*
  # Add Website Management Functions and Indexes

  1. Changes
    - Add missing indexes for website-related tables
    - Add functions for website theme and publishing management
    - Add missing RLS policies for website-related tables
*/

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_salon_websites_salon_id ON salon_websites(salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_pages_salon_id ON salon_pages(salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_pages_slug ON salon_pages(slug);
CREATE INDEX IF NOT EXISTS idx_salon_blog_posts_salon_id ON salon_blog_posts(salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_blog_posts_slug ON salon_blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_salon_blog_posts_author_id ON salon_blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_salon_testimonials_salon_id ON salon_testimonials(salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_testimonials_client_id ON salon_testimonials(client_id);

-- Create function to update website theme
CREATE OR REPLACE FUNCTION update_website_theme(p_salon_id uuid, p_theme_config jsonb)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE salon_websites
  SET theme_config = p_theme_config,
      updated_at = now()
  WHERE salon_id = p_salon_id;
END;
$$;

-- Create function to publish/unpublish website
CREATE OR REPLACE FUNCTION toggle_website_published(p_salon_id uuid, p_is_published boolean)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE salon_websites
  SET is_published = p_is_published,
      updated_at = now()
  WHERE salon_id = p_salon_id;
END;
$$;

-- Create RLS policies for salon_pages if they don't exist
DO $$
DECLARE
  policy_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'salon_pages' 
    AND policyname = 'Salon staff can manage pages'
  ) INTO policy_exists;
  
  IF NOT policy_exists THEN
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
  END IF;
END
$$;

-- Create RLS policies for salon_blog_posts if they don't exist
DO $$
DECLARE
  policy_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'salon_blog_posts' 
    AND policyname = 'Salon staff can manage blog posts'
  ) INTO policy_exists;
  
  IF NOT policy_exists THEN
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
  END IF;
END
$$;

-- Create RLS policies for salon_testimonials if they don't exist
DO $$
DECLARE
  policy_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'salon_testimonials' 
    AND policyname = 'Salon staff can manage testimonials'
  ) INTO policy_exists;
  
  IF NOT policy_exists THEN
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
  END IF;
END
$$;