import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';

export interface Service { // Add export
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category: string;
  active: boolean;
}

interface ServiceStore {
  services: Service[];
  loading: boolean;
  error: string | null;
  // Add salonId parameter to fetchServices signature
  fetchServices: (salonId: string) => Promise<void>;
  createService: (service: Omit<Service, 'id'>) => Promise<boolean>; // Return boolean
  updateService: (id: string, updates: Partial<Service>) => Promise<boolean>; // Return boolean
  deleteService: (id: string) => Promise<void>;
  searchServices: (query: string) => Promise<void>;
}

export const useServiceStore = create<ServiceStore>((set) => ({
  services: [],
  loading: false,
  error: null,

  fetchServices: async (salonId) => {
    const demoSalonId = 'demo-salon-id-999'; // Same hardcoded ID

    if (!salonId) {
      set({ services: [], loading: false, error: 'Salon ID required to fetch services.' });
      return;
    }

    // --- DEMO SALON HANDLING ---
    if (salonId === demoSalonId) {
       console.log("Using demo service data.");
       // Return sample service structure matching the interface
       const demoServices: Service[] = [
          // Match Service type (id, name, description, duration, price, category, active)
          { id: 's1', name: 'Demo Cut', description: 'A stylish demo cut.', duration: 45, price: 50, category: 'Cutting', active: true },
          { id: 's2', name: 'Demo Color', description: 'Vibrant demo colors.', duration: 90, price: 120, category: 'Coloring', active: true },
       ];
       set({ services: demoServices, loading: false, error: null });
       return;
    }
    // --- END DEMO SALON HANDLING ---

    // --- Real Salon Logic ---
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salonId) // Filter by salonId
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) throw error;

      set({ services: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to fetch services');
    } finally {
      set({ loading: false });
    }
  },

  createService: async (serviceData) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        services: [...state.services, data]
      }));

      toast.success('Service created successfully');
      return true; // Indicate success
    } catch (error) {
      return false; // Indicate failure
      // Unreachable code below removed
    } finally {
      set({ loading: false });
    }
  },

  updateService: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        services: state.services.map(service =>
          service.id === id ? { ...service, ...data } : service
        )
      }));

      toast.success('Service updated successfully');
      return true; // Indicate success
    } catch (error) {
      return false; // Indicate failure
      // Unreachable code below removed
    } finally {
      set({ loading: false });
    }
  },

  deleteService: async (id) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        services: state.services.filter(service => service.id !== id)
      }));

      toast.success('Service deleted successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to delete service');
    } finally {
      set({ loading: false });
    }
  },

  searchServices: async (query) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('name', { ascending: true });

      if (error) throw error;

      set({ services: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to search services');
    } finally {
      set({ loading: false });
    }
  }
}));