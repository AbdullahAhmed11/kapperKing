import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';
// Import shared types from their respective stores
import { StaffMember } from '@/lib/store/staff'; 
import { Service } from '@/lib/store/services'; 
import { Product } from '@/lib/store/products'; 

// --- Interface Definitions ---

// GalleryImage remains local
export interface GalleryImage {
  id: string;
  src: string; 
  alt?: string;
  category?: string; 
}

// Testimonial structure (assuming DB columns)
export interface Testimonial {
   id: string;
   client_name?: string; 
   rating: number;
   comment: string;
   created_at: string;
   client_id?: string | null;
}

// Define ThemeConfig structure (matching website store/settings)
export interface ThemeConfig { // Add export
  colors: { primary: string; secondary: string };
  fonts: { heading: string; body: string };
  layout: { header: string; footer: string };
}

// Main MicroSite configuration structure
export interface MicroSite {
  salon: {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
    theme_colors: { primary: string; secondary: string; };
    address_line1?: string; 
    address_line2?: string;
    city?: string; 
    postal_code?: string;
    country?: string; 
    email: string; 
    phone?: string;
  };
  hero: { title: string; subtitle: string; cta_label: string; cta_url: string; background_image_url?: string; };
  about: { heading: string; content: string; image_url?: string; };
  services: Service[]; // Use imported Service type
  staff: StaffMember[]; // Use imported StaffMember type
  gallery: GalleryImage[];
  testimonials: Testimonial[];
  products: Product[];
  themeConfig: ThemeConfig; // Add theme config object
  navigation?: Array<{ label: string; url: string }>;
  customCss?: string;
  customScripts?: string;
}

interface MicroSiteState {
  site: MicroSite | null;
  loading: boolean;
  error: string | null;
  fetchSite: (slug: string) => Promise<void>;
}

// Helper function to provide default demo data matching the structure
// NOTE: This demo data needs to be updated to match the imported types
const getDemoSiteData = (slug: string): MicroSite => ({
   salon: { 
      id: 'demo-salon-id-999', name: 'Demo Salon Deluxe', slug: slug, 
      email: 'demo@salon.com', phone: '123-456-7890', address_line1: '123 Demo St', city: 'Demo City', country: 'Demo Land',
      theme_colors: { primary: '#6366f1', secondary: '#818cf8' } 
   },
   hero: { title: 'Welcome to Demo Salon', subtitle: 'Experience the difference.', cta_label: 'Book Now', cta_url: `/s/${slug}/book`, background_image_url: '/images/placeholders/hero.jpg' },
   about: { heading: 'About Us', content: 'We are a demo salon showcasing features.', image_url: '/images/placeholders/about.jpg' },
   // Updated demo data to match imported types
   services: [ // Match imported Service type
      { id: 's1', name: 'Demo Cut', description: 'A stylish demo cut.', duration: 45, price: 50, category: 'Cutting', active: true }, // Removed extra fields
      { id: 's2', name: 'Demo Color', description: 'Vibrant demo colors.', duration: 90, price: 120, category: 'Coloring', active: true }, // Removed extra fields
   ],
   staff: [ // Match StaffMember type
      { id: 'st1', firstName: 'Alex', lastName: 'Demo', email: 'alex@demo.com', role: 'stylist', active: true, salonId: 'demo-salon-id-999', services: ['s1'], availability: [], working_hours: [], imageUrl: '/images/placeholders/avatar.png', title: 'Master Stylist' },
      { id: 'st2', firstName: 'Sam', lastName: 'Tester', email: 'sam@demo.com', role: 'stylist', active: true, salonId: 'demo-salon-id-999', services: ['s2'], availability: [], working_hours: [], imageUrl: '/images/placeholders/avatar.png', title: 'Color Specialist' },
   ] as any, // Cast as any temporarily
   gallery: [
      { id: 'g1', src: '/images/placeholders/gallery1.jpg', alt: 'Gallery Image 1' },
      { id: 'g2', src: '/images/placeholders/gallery2.jpg', alt: 'Gallery Image 2' },
   ],
   testimonials: [
      { id: 't1', client_name: 'Happy Client', rating: 5, comment: 'Great service!', created_at: new Date().toISOString() },
   ],
   products: [ // Match Product type
      { id: 'p1', salon_id: 'demo-salon-id-999', name: 'Demo Shampoo', price: 20, image_url: '/images/placeholders/product.png', active: true, created_at: '', description: 'Cleans demo hair', stock: 10 },
   ],
   navigation: [ { label: 'Home', url: '#home' }, { label: 'Services', url: '#services' }, { label: 'Team', url: '#team' } ],
   // Add default themeConfig for demo
   themeConfig: {
      colors: { primary: '#6366f1', secondary: '#ec4899' },
      fonts: { heading: 'Inter', body: 'Inter' },
      layout: { header: 'default', footer: 'default' }
   },
});


export const useMicroSiteStore = create<MicroSiteState>((set) => ({
  site: null,
  loading: false,
  error: null,
  fetchSite: async (slug) => {
    if (slug === 'demo-salon') {
       set({ site: getDemoSiteData(slug), loading: false, error: null });
       return;
    }

    set({ loading: true, error: null });
    try {
      // 1. Fetch Salon details by slug (including settings)
      const { data: salonData, error: salonError } = await supabase
        .from('salons')
        .select('*, website_settings(*), theme_settings(*)') 
        .eq('slug', slug)
        .single();

      if (salonError || !salonData) throw new Error(salonError?.message || 'Salon not found');

      // 2. Fetch related data concurrently
      const [servicesResult, staffResult, galleryResult, testimonialsResult, productsResult] = await Promise.all([
        supabase.from('services').select('*').eq('salon_id', salonData.id).eq('active', true),
        supabase.from('staff').select('*, staff_services(service_id)').eq('salon_id', salonData.id).eq('active', true), 
        supabase.from('gallery_images').select('*').eq('salon_id', salonData.id), 
        supabase.from('testimonials').select('*').eq('salon_id', salonData.id), 
        supabase.from('products').select('*').eq('salon_id', salonData.id).eq('active', true),
      ]);

      // Minimal error checking
      if (servicesResult.error) console.error("Error fetching services:", servicesResult.error);
      if (staffResult.error) console.error("Error fetching staff:", staffResult.error);
      
      // 3. Construct the MicroSite object
      // Define default theme config
      const defaultTheme: ThemeConfig = {
         colors: { primary: '#6366f1', secondary: '#ec4899' },
         fonts: { heading: 'Inter', body: 'Inter' },
         layout: { header: 'default', footer: 'default' }
      };

      const siteData: MicroSite = {
        salon: {
          id: salonData.id, name: salonData.name, slug: salonData.slug, logo_url: salonData.logo_url,
          theme_colors: { // Keep this if needed elsewhere, but themeConfig is primary now
             primary: salonData.theme_settings?.primary_color || defaultTheme.colors.primary,
             secondary: salonData.theme_settings?.secondary_color || defaultTheme.colors.secondary,
          },
          address_line1: salonData.address_line1, address_line2: salonData.address_line2,
          city: salonData.city, postal_code: salonData.postal_code, country: salonData.country,
          email: salonData.email, phone: salonData.phone,
        },
        hero: salonData.website_settings?.hero_section || { title: 'Welcome', subtitle: '', cta_label: 'Book Now', cta_url: `/s/${slug}/book` },
        about: salonData.website_settings?.about_section || { heading: 'About Us', content: '' },
        services: (servicesResult.data as Service[]) || [],
        staff: staffResult.data?.map((s: any): StaffMember => ({
           id: s.id, firstName: s.first_name, lastName: s.last_name, email: s.email, phone: s.phone,
           role: s.role, services: s.staff_services?.map((ss: { service_id: string }) => ss.service_id) || [],
           active: s.active, salonId: s.salon_id, availability: s.availability || null,
           working_hours: s.working_hours || null, imageUrl: s.image_url, title: s.title, bio: s.bio,
        })) || [],
        gallery: galleryResult.data?.map((g: any): GalleryImage => ({ id: g.id, src: g.image_url, alt: g.alt_text, category: g.category })) || [],
        testimonials: (testimonialsResult.data as Testimonial[]) || [],
        products: (productsResult.data as Product[]) || [],
        // Populate themeConfig from fetched settings or defaults
        themeConfig: {
           colors: {
              primary: salonData.theme_settings?.primary_color || defaultTheme.colors.primary,
              secondary: salonData.theme_settings?.secondary_color || defaultTheme.colors.secondary,
           },
           fonts: {
              heading: salonData.website_settings?.heading_font || defaultTheme.fonts.heading,
              body: salonData.website_settings?.body_font || defaultTheme.fonts.body,
           },
           layout: {
              header: salonData.website_settings?.header_layout || defaultTheme.layout.header,
              footer: salonData.website_settings?.footer_layout || defaultTheme.layout.footer,
           }
        },
        navigation: salonData.website_settings?.navigation || undefined,
        customCss: salonData.website_settings?.custom_css || undefined,
        customScripts: salonData.website_settings?.custom_scripts || undefined,
      };

      set({ site: siteData, loading: false });

    } catch (error: any) {
      console.error("Error fetching microsite data:", error);
      toast.error(`Failed to load site: ${error.message}`);
      set({ error: error.message, loading: false, site: null });
    }
  },
}));