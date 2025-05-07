import { create } from 'zustand';
import { emitter } from '../emitter';

// --- Type Definitions ---
export interface Salon {
  id: number;
  ownerId: number;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  salonPhone: string;
  email: string;
  website?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  country: string; // Add this
}

interface SalonState {
  salons: Salon[];
  currentSalon: Salon | null; // Add this to store the single salon
  loading: boolean;
  error: string | null;
  fetchSalons: () => Promise<void>;
  fetchSalonById: (id: number) => Promise<Salon>; // Add this new action
  addSalon: (salonData: Omit<Salon, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSalon: (id: number, salonData: Partial<Salon>) => Promise<void>;
  deleteSalon: (id: number) => Promise<void>;
}

export const useSalonStore = create<SalonState>((set, get) => ({
  // --- State ---
  salons: [],
  loading: false,
  error: null,
  currentSalon: null,

  // --- Actions ---
  fetchSalons: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('https://kapperking.runasp.net/api/Salons/GetSalons');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch salons (Status: ${response.status})`);
      }
      
      const data = await response.json();
      
      // Transform API data if needed
      const salons: Salon[] = data.map((salon: any) => ({
        id: salon.id,
        name: salon.name,
        address: salon.address,
        city: salon.city,
        postalCode: salon.postalCode,
        phoneNumber: salon.phoneNumber,
        email: salon.email,
        website: salon.website || undefined,
        description: salon.description || undefined,
        isActive: salon.isActive,
        createdAt: salon.createdAt,
        updatedAt: salon.updatedAt || undefined
      }));

      set({ salons });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
    } finally {
      set({ loading: false });
    }
  },

  addSalon: async (salonData) => {
    try {
      set({ loading: true });
      
      const response = await fetch('https://kapperking.runasp.net/api/Salons/AddSalon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(salonData),
      });

      if (!response.ok) {
        throw new Error('Failed to add salon');
      }

      // Refresh the list after successful addition
      await get().fetchSalons();
      emitter.emit('salonsUpdated');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add salon' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // updateSalon: async (id, salonData) => {
  //   try {
  //     set({ loading: true });
      
  //     const response = await fetch(`https://kapperking.runasp.net/api/Salons/UpdateSalon/${id}`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(salonData),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to update salon');
  //     }

  //     // Refresh the list after successful update
  //     await get().fetchSalons();
  //     emitter.emit('salonsUpdated');
  //   } catch (error) {
  //     set({ error: error instanceof Error ? error.message : 'Failed to update salon' });
  //     throw error;
  //   } finally {
  //     set({ loading: false });
  //   }
  // },

  updateSalon: async (id, salonData) => {
    try {
      set({ loading: true });
      
      // Prepare the request body according to the API specification
      const requestBody = {
        id: id, // Use the provided ID
        name: salonData.name || '',
        address: salonData.address || '',
        city: salonData.city || '',
        postalCode: salonData.postalCode || '',
        country: salonData.country || '', // Add country if needed
        salonPhone: salonData.salonPhone || '',
        website: salonData.website || '',
        ownerId: salonData.ownerId || undefined // This will now be a number

      };
  
      const response = await fetch('https://kapperking.runasp.net/api/Salons/EditSalon', {
        method: 'PUT', // or 'POST' if that's what the endpoint expects
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update salon (Status: ${response.status})`);
      }
  
      // Refresh the list after successful update
      await get().fetchSalons();
      emitter.emit('salonsUpdated');
      // toast.success('Salon updated successfully');
      
      return; // Indicate success
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update salon';
      set({ error: message });
      // toast.error(message);
      throw error;
    } finally {
      set({ loading: false });
    }
  },


  deleteSalon: async (id) => {
    try {
      set({ loading: true });
      
      const response = await fetch(`https://kapperking.runasp.net/api/Salons/DeleteSalon/${id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error(`Failed to delete salon (Status: ${response.status})`);
      }
  
      // Optimistically remove from state
      set((state) => ({
        salons: state.salons.filter(salon => salon.id !== id),
      }));
      
      emitter.emit('salonsUpdated');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete salon' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchSalonById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`https://kapperking.runasp.net/api/Salons/GetSalonById/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch salon (Status: ${response.status})`);
      }
      
      const data = await response.json();
      
      // Transform API data to match Salon interface
      const salon: Salon = {
        id: data.id,
        ownerId: data.ownerId,
        name: data.name,
        address: data.address,
        city: data.city,
        country: data.country || undefined,
        postalCode: data.postalCode,
        salonPhone: data.salonPhone,
        email: data.email,
        website: data.website || undefined,
        description: data.description || undefined,
        isActive: data.isActive,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt || undefined
      };

      set({ currentSalon: salon });
      return salon;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },



}));

// --- Selectors ---
export const selectAllSalons = (state: SalonState) => state.salons;
export const selectActiveSalons = (state: SalonState) => state.salons.filter(salon => salon.isActive);
export const selectSalonById = (state: SalonState, id: number) => state.salons.find(salon => salon.id === id);
export const selectCurrentSalon = (state: SalonState) => state.currentSalon;
