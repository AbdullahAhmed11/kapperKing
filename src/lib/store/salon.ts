import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';

interface Salon {
  id: string;
  name: string;
  slug: string;
  owner_id: string | null;
  subscription_plan_id: string | null;
  subscription_status: 'trial' | 'active' | 'past_due' | 'canceled';
  trial_ends_at: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  timezone: string;
  currency: string;
  logo_url: string | null;
  website: string | null;
  custom_domain: string | null;
  theme_colors: {
    primary: string;
    secondary: string;
  };
  sidebarLogoUrl: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SalonStore {
  salons: Salon[];
  loading: boolean;
  error: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  sidebarLogoUrl: string | null;
  fetchSalons: () => Promise<void>;
  createSalon: (salon: Omit<Salon, 'id' | 'created_at' | 'updated_at'>> => Promise<void>;
  updateSalon: (id: string, updates: Partial<Salon>) => Promise<void>;
  deleteSalon: (id: string) => Promise<void>;
  searchSalons: (query: string) => Promise<void>;
  updatePrimaryColor: (salonId: string, primaryColor: string) => Promise<void>;
  updateSecondaryColor: (salonId: string, secondaryColor: string) => Promise<void>;
  updateSidebarLogo: (salonId: string, sidebarLogoUrl: string) => Promise<void>;
}

export const useSalonStore = create<SalonStore>((set) => ({
  salons: [],
  loading: false,
  error: null,
  primaryColor: '#007bff', // Default primary color
  secondaryColor: '#6c757d', // Default secondary color
  sidebarLogoUrl: null,

  fetchSalons: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      set({ salons: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to fetch salons');
    } finally {
      set({ loading: false });
    }
  },

  updatePrimaryColor: async (salonId: string, primaryColor: string) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('salons')
        .update({ theme_colors: { primary: primaryColor } })
        .eq('id', salonId);

      if (error) throw error;
      set(state => ({ ...state, primaryColor }));
      toast.success('Primary color updated successfully');
    } catch (error: any) {
      toast.error(`Failed to update primary color: ${error.message}`);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  updateSecondaryColor: async (salonId: string, secondaryColor: string) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('salons')
        .update({ theme_colors: { secondary: secondaryColor } })
        .eq('id', salonId);

      if (error) throw error;
      set(state => ({ ...state, secondaryColor }));
      toast.success('Secondary color updated successfully');
    } catch (error: any) {
      toast.error(`Failed to update secondary color: ${error.message}`);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  updateSidebarLogo: async (salonId: string, sidebarLogoUrl: string) => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase
        .from('salons')
        .update({ logo_url: sidebarLogoUrl })
        .eq('id', salonId);

      if (error) throw error;
      set(state => ({ ...state, sidebarLogoUrl }));
      toast.success('Sidebar logo updated successfully');
    } catch (error: any) {
      toast.error(`Failed to update sidebar logo: ${error.message}`);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  searchSalons: async (query) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('salons')
        .select('*')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,city.ilike.%${query}%`)
        .order('name', { ascending: true });

      if (error) throw error;

      set({ salons: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to search salons');
    } finally {
      set({ loading: false });
    }
  }
}));