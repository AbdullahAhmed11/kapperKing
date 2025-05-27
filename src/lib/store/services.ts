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

  // fetchServices: async (salonId) => {
  //   const demoSalonId = 'demo-salon-id-999'; // Same hardcoded ID

  //   if (!salonId) {
  //     set({ services: [], loading: false, error: 'Salon ID required to fetch services.' });
  //     return;
  //   }

  //   // --- DEMO SALON HANDLING ---
  //   if (salonId === demoSalonId) {
  //      console.log("Using demo service data.");
  //      // Return sample service structure matching the interface
  //      const demoServices: Service[] = [
  //         // Match Service type (id, name, description, duration, price, category, active)
  //         { id: 's1', name: 'Demo Cut', description: 'A stylish demo cut.', duration: 45, price: 50, category: 'Cutting', active: true },
  //         { id: 's2', name: 'Demo Color', description: 'Vibrant demo colors.', duration: 90, price: 120, category: 'Coloring', active: true },
  //      ];
  //      set({ services: demoServices, loading: false, error: null });
  //      return;
  //   }
  //   // --- END DEMO SALON HANDLING ---

  //   // --- Real Salon Logic ---
  //   try {
  //     set({ loading: true, error: null });
      
  //     const { data, error } = await supabase
  //       .from('services')
  //       .select('*')
  //       .eq('salon_id', salonId) // Filter by salonId
  //       .eq('active', true)
  //       .order('name', { ascending: true });

  //     if (error) throw error;

  //     set({ services: data || [] });
  //   } catch (error) {
  //     set({ error: (error as Error).message });
  //     toast.error('Failed to fetch services');
  //   } finally {
  //     set({ loading: false });
  //   }
  // },

  fetchServices: async (salonId) => {
  const demoSalonId = 'demo-salon-id-999';

  if (!salonId) {
    set({ services: [], loading: false, error: 'Salon ID required to fetch services.' });
    return;
  }

  // --- DEMO SALON HANDLING ---
  // if (salonId === demoSalonId) {
  //   console.log("Using demo service data.");
  //   const demoServices: Service[] = [
  //     { id: 's1', name: 'Demo Cut', description: 'A stylish demo cut.', duration: 45, price: 50, category: 'Cutting', active: true },
  //     { id: 's2', name: 'Demo Color', description: 'Vibrant demo colors.', duration: 90, price: 120, category: 'Coloring', active: true },
  //   ];
  //   set({ services: demoServices, loading: false, error: null });
  //   return;
  // }
  // --- END DEMO SALON HANDLING ---

  // --- API Endpoint Logic ---
  try {
    set({ loading: true, error: null });

    const response = await fetch(`https://kapperking.runasp.net/api/Services/Getservices/${salonId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data: { id: number; name: string; description?: string; duration: string; price: number; categoryName: string }[] = await response.json();

    // Map API response to Service interface
    const mappedServices: Service[] = data.map((item) => {
      // Parse duration (e.g., "00:30:00" to 30 minutes)
      const [hours, minutes, seconds] = item.duration.split(':').map(Number);
      const durationInMinutes = hours * 60 + minutes + seconds / 60;

      return {
        id: item.id.toString(), // Convert number to string
        name: item.name,
        description: item.description,
        duration: durationInMinutes,
        price: item.price,
        category: item.categoryName, // Rename categoryName to category
        active: true, // Default value since API doesn't provide it
      };
    });

    set({ services: mappedServices, loading: false, error: null });
  } catch (error) {
    set({ error: (error as Error).message, loading: false });
    const message = error instanceof Error ? error.message : 'Failed to fetch services';
    // toast.error(message);
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

  // updateService: async (id, updates) => {
  //   try {
  //     set({ loading: true, error: null });
      
  //     const { data, error } = await supabase
  //       .from('services')
  //       .update(updates)
  //       .eq('id', id)
  //       .select()
  //       .single();

  //     if (error) throw error;

  //     set(state => ({
  //       services: state.services.map(service =>
  //         service.id === id ? { ...service, ...data } : service
  //       )
  //     }));

  //     toast.success('Service updated successfully');
  //     return true; // Indicate success
  //   } catch (error) {
  //     return false; // Indicate failure
  //     // Unreachable code below removed
  //   } finally {
  //     set({ loading: false });
  //   }
  // },


  updateService: async (id, updates) => {
  try {
    set({ loading: true, error: null });

    // Prepare payload for the API
    const payload: {
      id: string;
      name?: string;
      description?: string;
      duration?: string;
      price?: number;
      categoryName?: string;
    } = { id };

    // Map updates to API format
    if (updates.name) payload.name = updates.name;
    if (updates.description) payload.description = updates.description;
    if (updates.price) payload.price = updates.price;
    if (updates.category) payload.categoryName = updates.category;
    if (updates.active !== undefined) {
      // API doesn't support active, so we'll handle it locally
      console.warn('Active field not supported by API; handled locally.');
    }
    if (updates.duration) {
      // Convert duration (minutes) to "HH:mm:ss"
      const hours = Math.floor(updates.duration / 60);
      const minutes = Math.floor(updates.duration % 60);
      const seconds = 0; // Assuming seconds are not needed
      payload.duration = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    const response = await fetch('https://kapperking.runasp.net/api/Services/Editservice', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Assume response returns the updated service
    const data: {
      id: number;
      name: string;
      description?: string;
      duration: string;
      price: number;
      categoryName: string;
    } = await response.json();

    // Map API response to Service interface
    const [hours, minutes, seconds] = data.duration.split(':').map(Number);
    const durationInMinutes = hours * 60 + minutes + seconds / 60;

    const updatedService: Service = {
      id: data.id.toString(),
      name: data.name,
      description: data.description,
      duration: durationInMinutes,
      price: data.price,
      category: data.categoryName,
      active: updates.active !== undefined ? updates.active : true, // Use provided active or default
    };

    // Update state
    set((state) => ({
      services: state.services.map((service) =>
        service.id === id ? updatedService : service,
      ),
    }));

    toast.success('Service updated successfully');
    return true;
  } catch (error) {
    set({ error: (error as Error).message, loading: false });
    toast.error('Failed to update service');
    return false;
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