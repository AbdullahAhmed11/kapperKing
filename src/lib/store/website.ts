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

export const useWebsiteStore = create<WebsiteStore>((set, get) => ({ // Add get
  website: null,
  loading: false,
  error: null,

  fetchWebsite: async (salonId) => {
    const demoSalonId = 'demo-salon-id-999'; // Same hardcoded ID

    // --- DEMO SALON HANDLING ---
    if (salonId === demoSalonId) {
      // Check if demo website data already exists in state (e.g., after initialize)
      const currentWebsite = get().website; // Need 'get' from create()
      if (currentWebsite && currentWebsite.salonId === demoSalonId) {
         console.log("Using existing demo website data from state.");
         set({ loading: false, error: null }); // Already loaded
         return;
      }
      // If not in state, maybe it was "initialized" but page refreshed?
      // For demo, we'll just assume it needs fetching/creating if not in state.
      // In a real app, the DB fetch would handle this.
      console.log("Demo salon website not in state, simulating 'not found' for fetch.");
      set({ website: null, loading: false, error: null }); // Simulate not found initially
      return;
    }
    // --- END DEMO SALON HANDLING ---

    // --- Real Salon Logic ---
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
    const demoSalonId = 'demo-salon-id-999';

    // --- DEMO SALON HANDLING ---
    if (salonId === demoSalonId) {
       console.log("Initializing hardcoded demo website data...");
       const defaultTheme: WebsiteTheme = { /* ... copy default theme from below ... */
         colors: { primary: "#6366F1", secondary: "#EC4899", accent: "#38B2AC", background: "#FFFFFF", text: "#1A202C" },
         fonts: { heading: "Inter", body: "Inter" },
         layout: { header: "default", footer: "default" }
       };
       const defaultSEO: WebsiteSEO = { /* ... copy default SEO from below ... */
         title: `${salonName} - Demo Salon`, description: "Demo salon services", keywords: ["demo", "salon"], ogImage: ""
       };
       const defaultNav = [ { label: "Home", url: "#" }, /* ... */ ];
       const demoWebsiteData: Website = {
         id: 'demo-website-id-999', // Hardcoded ID
         salonId: demoSalonId,
         themeConfig: defaultTheme,
         seoConfig: defaultSEO,
         navigation: defaultNav,
         socialLinks: { facebook: '#', twitter: '#', instagram: '#' }, // Placeholder links
         isPublished: true, // Publish immediately for demo
         customCss: '',
         customScripts: '',
       };
       set({ website: demoWebsiteData, loading: false, error: null });
       toast.success('Demo website initialized successfully');
       return; // Skip Supabase call
    }
    // --- END DEMO SALON HANDLING ---

    // --- Real Salon Logic ---
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from('salon_websites')
        .insert({
          salon_id: salonId,
          // Default values for real salons
          theme_config: {
            colors: { primary: "#6366F1", secondary: "#EC4899", accent: "#38B2AC", background: "#FFFFFF", text: "#1A202C" },
            fonts: { heading: "Inter", body: "Inter" },
            layout: { header: "default", footer: "default" }
          },
          seo_config: {
            title: `${salonName} - Salon Services`, description: `Book appointments online at ${salonName}`, keywords: ["salon", salonName], ogImage: ""
          },
          navigation: [ // Default navigation
             { label: "Home", url: "#home" }, { label: "Services", url: "#services" }, { label: "Team", url: "#team" }, { label: "Gallery", url: "#gallery" }, { label: "Contact", url: "#contact" }
          ],
          social_links: {}, // Empty defaults
          is_published: true // Publish immediately
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
    const demoSalonId = 'demo-salon-id-999';
    // --- DEMO SALON HANDLING ---
    if (salonId === demoSalonId) {
      console.log("Updating demo website theme in local state:", theme);
      set(state => {
        if (!state.website || state.website.salonId !== demoSalonId) return {}; // Safety check
        return {
          website: {
            ...state.website,
            themeConfig: { ...state.website.themeConfig, ...theme } // Merge partial theme updates
          }
        };
      });
      toast.success('Demo theme updated locally');
      return; // Skip Supabase call
    }
    // --- END DEMO SALON HANDLING ---
    // --- Real Salon Logic ---
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
    const demoSalonId = 'demo-salon-id-999';
    // --- DEMO SALON HANDLING ---
    if (salonId === demoSalonId) {
      console.log("Updating demo website SEO in local state:", seo);
      set(state => {
        if (!state.website || state.website.salonId !== demoSalonId) return {};
        return { website: { ...state.website, seoConfig: { ...state.website.seoConfig, ...seo } } };
      });
      toast.success('Demo SEO updated locally');
      return;
    }
    // --- END DEMO SALON HANDLING ---
    // --- Real Salon Logic ---
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
    const demoSalonId = 'demo-salon-id-999';
    // --- DEMO SALON HANDLING ---
     if (salonId === demoSalonId) {
       console.log("Updating demo website navigation in local state:", navigation);
       set(state => {
         if (!state.website || state.website.salonId !== demoSalonId) return {};
         return { website: { ...state.website, navigation: navigation } };
       });
       toast.success('Demo navigation updated locally');
       return;
     }
    // --- END DEMO SALON HANDLING ---
    // --- Real Salon Logic ---
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
    const demoSalonId = 'demo-salon-id-999';
    // --- DEMO SALON HANDLING ---
     if (salonId === demoSalonId) {
       console.log("Updating demo website social links in local state:", links);
       set(state => {
         if (!state.website || state.website.salonId !== demoSalonId) return {};
         return { website: { ...state.website, socialLinks: links } };
       });
       toast.success('Demo social links updated locally');
       return;
     }
    // --- END DEMO SALON HANDLING ---
    // --- Real Salon Logic ---
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
    const demoSalonId = 'demo-salon-id-999';
    // --- DEMO SALON HANDLING ---
     if (salonId === demoSalonId) {
       console.log("Updating demo website custom code in local state");
       set(state => {
         if (!state.website || state.website.salonId !== demoSalonId) return {};
         return { website: { ...state.website, customCss: css, customScripts: scripts } };
       });
       toast.success('Demo custom code updated locally');
       return;
     }
    // --- END DEMO SALON HANDLING ---
    // --- Real Salon Logic ---
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
    const demoSalonId = 'demo-salon-id-999';
     // --- DEMO SALON HANDLING ---
     if (salonId === demoSalonId) {
       console.log(`Setting demo website published status to: ${isPublished}`);
       set(state => {
         if (!state.website || state.website.salonId !== demoSalonId) return {};
         return { website: { ...state.website, isPublished: isPublished } };
       });
       toast.success(isPublished ? 'Demo website published locally' : 'Demo website unpublished locally');
       return;
     }
     // --- END DEMO SALON HANDLING ---
     // --- Real Salon Logic ---
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