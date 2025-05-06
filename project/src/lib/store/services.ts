import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';

interface Service {
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
  fetchServices: () => Promise<void>;
  createService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, updates: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  searchServices: (query: string) => Promise<void>;
}

export const useServiceStore = create<ServiceStore>((set) => ({
  services: [],
  loading: false,
  error: null,

  fetchServices: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
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
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to create service');
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
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to update service');
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