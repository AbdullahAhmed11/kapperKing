import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';

interface WebsiteTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: {
    header: string;
    footer: string;
  };
}

interface WebsiteSEO {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
}

interface Website {
  id: string;
  salonId: string;
  themeConfig: WebsiteTheme;
  seoConfig: WebsiteSEO;
  navigation: Array<{
    label: string;
    url: string;
  }>;
  socialLinks: Record<string, string>;
  customCss?: string;
  customScripts?: string;
  isPublished: boolean;
}

interface WebsiteStore {
  website: Website | null;
  loading: boolean;
  error: string | null;
  fetchWebsite: (salonId: string) => Promise<void>;
  updateTheme: (salonId: string, theme: Partial<WebsiteTheme>) => Promise<void>;
  updateSEO: (salonId: string, seo: Partial<WebsiteSEO>) => Promise<void>;
  updateNavigation: (salonId: string, navigation: Website['navigation']) => Promise<void>;
  updateSocialLinks: (salonId: string, links: Website['socialLinks']) => Promise<void>;
  updateCustomCode: (salonId: string, css?: string, scripts?: string) => Promise<void>;
  togglePublished: (salonId: string, isPublished: boolean) => Promise<void>;
  initializeWebsite: (salonId: string, salonName: string) => Promise<void>;
}

export const useWebsiteStore = create<WebsiteStore>((set) => ({
  website: null,
  loading: false,
  error: null,

  fetchWebsite: async (salonId) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('salon_websites')
        .select('*')
        .eq('salon_id', salonId)
        .single();

      if (error) throw error;

      set({ website: data });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to fetch website settings');
    } finally {
      set({ loading: false });
    }
  },

  initializeWebsite: async (salonId, salonName) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from('salon_websites')
        .insert({
          salon_id: salonId,
          theme_config: {
            colors: {
              primary: "#6B46C1",
              secondary: "#E84393",
              accent: "#38B2AC",
              background: "#FFFFFF",
              text: "#1A202C"
            },
            fonts: {
              heading: "Inter",
              body: "Inter"
            },
            layout: {
              header: "default",
              footer: "default"
            }
          },
          seo_config: {
            title: `${salonName} - Professional Hair Salon`,
            description: "Professional hair salon services",
            keywords: ["hair salon", "haircut", "styling", "color"],
            ogImage: ""
          },
          navigation: [
            { label: "Home", url: "#" },
            { label: "Services", url: "#services" },
            { label: "Team", url: "#staff" },
            { label: "Contact", url: "#contact" }
          ],
          social_links: {},
          is_published: false
        })
        .select()
        .single();

      if (error) throw error;

      set({ website: data });
      toast.success('Website initialized successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to initialize website');
    } finally {
      set({ loading: false });
    }
  },

  updateTheme: async (salonId, theme) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('salon_websites')
        .update({
          theme_config: theme,
          updated_at: new Date().toISOString()
        })
        .eq('salon_id', salonId)
        .select()
        .single();

      if (error) throw error;

      set({ website: data });
      toast.success('Theme updated successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to update theme');
    } finally {
      set({ loading: false });
    }
  },

  updateSEO: async (salonId, seo) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('salon_websites')
        .update({
          seo_config: seo,
          updated_at: new Date().toISOString()
        })
        .eq('salon_id', salonId)
        .select()
        .single();

      if (error) throw error;

      set({ website: data });
      toast.success('SEO settings updated successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to update SEO settings');
    } finally {
      set({ loading: false });
    }
  },

  updateNavigation: async (salonId, navigation) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('salon_websites')
        .update({
          navigation,
          updated_at: new Date().toISOString()
        })
        .eq('salon_id', salonId)
        .select()
        .single();

      if (error) throw error;

      set({ website: data });
      toast.success('Navigation updated successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to update navigation');
    } finally {
      set({ loading: false });
    }
  },

  updateSocialLinks: async (salonId, links) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('salon_websites')
        .update({
          social_links: links,
          updated_at: new Date().toISOString()
        })
        .eq('salon_id', salonId)
        .select()
        .single();

      if (error) throw error;

      set({ website: data });
      toast.success('Social links updated successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to update social links');
    } finally {
      set({ loading: false });
    }
  },

  updateCustomCode: async (salonId, css, scripts) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('salon_websites')
        .update({
          custom_css: css,
          custom_scripts: scripts,
          updated_at: new Date().toISOString()
        })
        .eq('salon_id', salonId)
        .select()
        .single();

      if (error) throw error;

      set({ website: data });
      toast.success('Custom code updated successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to update custom code');
    } finally {
      set({ loading: false });
    }
  },

  togglePublished: async (salonId, isPublished) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('salon_websites')
        .update({
          is_published: isPublished,
          updated_at: new Date().toISOString()
        })
        .eq('salon_id', salonId)
        .select()
        .single();

      if (error) throw error;

      set({ website: data });
      toast.success(isPublished ? 'Website published successfully' : 'Website unpublished');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to update website status');
    } finally {
      set({ loading: false });
    }
  }
}));