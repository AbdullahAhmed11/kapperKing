import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';

interface Salon {
  id: string;
  name: string;
  slug: string;
  owner: {
    name: string;
    email: string;
  };
  location: {
    address: string;
    city: string;
    country: string;
  };
  stats: {
    staff: number;
    clients: number;
    appointments: number;
  };
  subscription: {
    plan: string;
    status: string;
  };
  created_at: string;
  updated_at: string;
}

interface SalonStore {
  salons: Salon[];
  loading: boolean;
  error: string | null;
  fetchSalons: () => Promise<void>;
  createSalon: (salon: Omit<Salon, 'id' | 'created_at' | 'updated_at' | 'stats'>) => Promise<void>;
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
      
      // Get all salons with their subscription plans
      const { data: salons, error: salonsError } = await supabase
        .from('salons')
        .select(`
          *,
          subscription_plans (
            name
          )
        `)
        .order('name', { ascending: true });

      if (salonsError) throw salonsError;

      // Get stats for each salon
      const salonsWithStats = await Promise.all((salons || []).map(async (salon) => {
        // Get staff count
        const { count: staffCount } = await supabase
          .from('staff')
          .select('id', { count: 'exact', head: true })
          .eq('salon_id', salon.id)
          .eq('active', true);

        // Get client count
        const { count: clientCount } = await supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('salon_id', salon.id);

        // Get appointment count (for current month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: appointmentCount } = await supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('salon_id', salon.id)
          .gte('start_time', startOfMonth.toISOString());

        return {
          ...salon,
          subscription: {
            plan: salon.subscription_plans?.name || 'No Plan',
            status: salon.subscription_status
          },
          stats: {
            staff: staffCount || 0,
            clients: clientCount || 0,
            appointments: appointmentCount || 0
          }
        };
      }));

      set({ salons: salonsWithStats });
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
        .insert({
          name: salonData.name,
          slug: salonData.slug,
          owner_name: salonData.owner.name,
          owner_email: salonData.owner.email,
          address: salonData.location.address,
          city: salonData.location.city,
          country: salonData.location.country,
          subscription_plan_id: salonData.subscription.plan,
          subscription_status: salonData.subscription.status
        })
        .select()
        .single();

      if (error) throw error;

      // Refetch to get updated stats
      await set().fetchSalons();

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
      
      const { error } = await supabase
        .from('salons')
        .update({
          name: updates.name,
          slug: updates.slug,
          owner_name: updates.owner?.name,
          owner_email: updates.owner?.email,
          address: updates.location?.address,
          city: updates.location?.city,
          country: updates.location?.country,
          subscription_plan_id: updates.subscription?.plan,
          subscription_status: updates.subscription?.status
        })
        .eq('id', id);

      if (error) throw error;

      // Refetch to get updated data and stats
      await set().fetchSalons();

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
        .select(`
          *,
          subscription_plans (
            name
          )
        `)
        .or(`name.ilike.%${query}%,owner_name.ilike.%${query}%,city.ilike.%${query}%`)
        .order('name', { ascending: true });

      if (error) throw error;

      // Add stats to search results
      const salonsWithStats = await Promise.all((data || []).map(async (salon) => {
        const { count: staffCount } = await supabase
          .from('staff')
          .select('id', { count: 'exact', head: true })
          .eq('salon_id', salon.id)
          .eq('active', true);

        const { count: clientCount } = await supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('salon_id', salon.id);

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: appointmentCount } = await supabase
          .from('appointments')
          .select('id', { count: 'exact', head: true })
          .eq('salon_id', salon.id)
          .gte('start_time', startOfMonth.toISOString());

        return {
          ...salon,
          subscription: {
            plan: salon.subscription_plans?.name || 'No Plan',
            status: salon.subscription_status
          },
          stats: {
            staff: staffCount || 0,
            clients: clientCount || 0,
            appointments: appointmentCount || 0
          }
        };
      }));

      set({ salons: salonsWithStats });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to search salons');
    } finally {
      set({ loading: false });
    }
  }
}));