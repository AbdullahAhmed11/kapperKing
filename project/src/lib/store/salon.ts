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
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SalonStore {
  salons: Salon[];
  loading: boolean;
  error: string | null;
  fetchSalons: () => Promise<void>;
  createSalon: (salon: Omit<Salon, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSalon: (id: string, updates: Partial<Salon>) => Promise<void>;
  deleteSalon: (id: string) => Promise<void>;
  searchSalons: (query: string) => Promise<void>;
}

export const useSalonStore = create<SalonStore>((set) => ({
  salons: [],
  loading: false,
  error: null,

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

  createSalon: async (salonData) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('salons')
        .insert(salonData)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        salons: [...state.salons, data]
      }));

      toast.success('Salon created successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to create salon');
    } finally {
      set({ loading: false });
    }
  },

  updateSalon: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('salons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        salons: state.salons.map(salon =>
          salon.id === id ? { ...salon, ...data } : salon
        )
      }));

      toast.success('Salon updated successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to update salon');
    } finally {
      set({ loading: false });
    }
  },

  deleteSalon: async (id) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('salons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        salons: state.salons.filter(salon => salon.id !== id)
      }));

      toast.success('Salon deleted successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to delete salon');
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