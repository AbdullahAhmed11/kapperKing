import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';

interface MicroSite {
  salon: {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
    theme_colors: {
      primary: string;
      secondary: string;
    };
    address?: string;
    city?: string;
    country?: string;
    email: string;
    phone?: string;
  };
  pages: Array<{
    id: string;
    title: string;
    slug: string;
    content: string;
  }>;
  services: Array<{
    id: string;
    name: string;
    description?: string;
    duration: number;
    price: number;
    category: string;
  }>;
  staff: Array<{
    id: string;
    firstName: string;
    lastName: string;
    services: string[];
    availability: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }>;
  }>;
  testimonials: Array<{
    id: string;
    content: string;
    rating: number;
    client: {
      firstName: string;
      lastName: string;
    };
  }>;
  navigation: Array<{
    label: string;
    url: string;
  }>;
  socialLinks: Record<string, string>;
  customCss?: string;
  customScripts?: string;
}

interface MicroSiteStore {
  site: MicroSite | null;
  loading: boolean;
  error: string | null;
  fetchSite: (slug: string) => Promise<void>;
}

export const useMicroSiteStore = create<MicroSiteStore>((set) => ({
  site: null,
  loading: false,
  error: null,

  fetchSite: async (slug: string) => {
    try {
      set({ loading: true, error: null });
      
      // First get the salon data
      const { data: salon, error: salonError } = await supabase
        .from('salons')
        .select(`
          id,
          name,
          slug,
          logo_url,
          theme_colors,
          address,
          city,
          country,
          email,
          phone
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (salonError) throw salonError;
      if (!salon) {
        set({ 
          site: null, 
          error: 'Salon not found or is not active',
          loading: false 
        });
        return;
      }

      // Get the website configuration
      const { data: website, error: websiteError } = await supabase
        .from('salon_websites')
        .select('*')
        .eq('salon_id', salon.id)
        .eq('is_published', true)
        .maybeSingle();

      if (websiteError) throw websiteError;
      if (!website) {
        set({ 
          site: null, 
          error: 'Salon website not found or is not published',
          loading: false 
        });
        return;
      }

      // Get published pages
      const { data: pages, error: pagesError } = await supabase
        .from('salon_pages')
        .select('id, title, slug, content')
        .eq('salon_id', salon.id)
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (pagesError) throw pagesError;

      // Get active services
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, name, description, duration, price, category')
        .eq('salon_id', salon.id)
        .eq('active', true)
        .order('name', { ascending: true });

      if (servicesError) throw servicesError;

      // Get active staff
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select(`
          id,
          first_name,
          last_name,
          staff_services (
            service_id
          ),
          staff_availability (
            day_of_week,
            start_time,
            end_time
          )
        `)
        .eq('salon_id', salon.id)
        .eq('active', true);

      if (staffError) throw staffError;

      // Get approved testimonials
      const { data: testimonials, error: testimonialsError } = await supabase
        .from('salon_testimonials')
        .select(`
          id,
          content,
          rating,
          clients (
            first_name,
            last_name
          )
        `)
        .eq('salon_id', salon.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (testimonialsError) throw testimonialsError;

      set({
        site: {
          salon,
          pages: pages || [],
          services: services || [],
          staff: staff?.map(s => ({
            id: s.id,
            firstName: s.first_name,
            lastName: s.last_name,
            services: s.staff_services.map((ss: any) => ss.service_id),
            availability: s.staff_availability
          })) || [],
          testimonials: testimonials?.map(t => ({
            id: t.id,
            content: t.content,
            rating: t.rating,
            client: {
              firstName: t.clients.first_name,
              lastName: t.clients.last_name
            }
          })) || [],
          navigation: website.navigation || [],
          socialLinks: website.social_links || {},
          customCss: website.custom_css,
          customScripts: website.custom_scripts
        },
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching salon website:', error);
      set({ 
        site: null,
        error: 'Failed to load salon website',
        loading: false 
      });
    }
  }
}));