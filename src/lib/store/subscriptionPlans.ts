import { create } from 'zustand';
import { emitter } from '../emitter';

// --- Type Definitions ---
export interface SubscriptionPlan {
  id: number; // Changed from string to number to match API
  name: string;
  description: string | null; // API returns null for description
  priceMonthly: number; // Will map from manthlyPrice
  priceAnnual: number; // Will map from annualPrice
  features: string[];
  limits?: {
    staff?: number; // From staffLimit
    clients?: number; // From clientLimit
    storage?: string; // Not in API
  };
  interval: 'monthly' | 'yearly';
  isPopular: boolean;
  isActive: boolean;
  maxSalons: number; // From maxSalons (note: API uses maxSalons)
  trialDuration: number; // Not in API, we'll add default
}

interface SubscriptionPlanState {
  plans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
  fetchPlans: () => Promise<void>;
  addPlan: (formData: PlanFormDataFromForm) => void;
  updatePlan: (planId: number, formData: PartialPlanFormDataFromForm) => void;
  deletePlan: (planId: number) => void;
}

// Form data types adjusted for API compatibility
type PlanFormDataFromForm = Omit<SubscriptionPlan, 'id' | 'isActive' | 'features' | 'trialDuration'> & { features: string };
type PartialPlanFormDataFromForm = Partial<PlanFormDataFromForm>;

export const useSubscriptionPlanStore = create<SubscriptionPlanState>((set, get) => ({
  // --- State ---
  plans: [],
  loading: false,
  error: null,

  // --- Actions ---
  fetchPlans: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('https://kapperking.runasp.net/api/Home/GetPlans');
      if (!response.ok) throw new Error('Failed to fetch plans');
      
      const apiPlans = await response.json();
      
      // Transform API data to match our SubscriptionPlan interface
      const transformedPlans: SubscriptionPlan[] = apiPlans.map((apiPlan: any) => ({
        id: apiPlan.id,
        name: apiPlan.name,
        description: apiPlan.description || '', // Handle null description
        priceMonthly: apiPlan.manthlyPrice,
        priceAnnual: apiPlan.annualPrice,
        features: apiPlan.features || [],
        limits: {
          staff: apiPlan.staffLimit,
          clients: apiPlan.clientLimit,
        },
        interval: 'monthly', // Default, can be adjusted based on API
        isPopular: apiPlan.isPopular,
        isActive: true, // Assuming all fetched plans are active
        maxSalons: apiPlan.maxSalons,
        trialDuration: 14, // Default value since not in API
      }));

      set({ plans: transformedPlans });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ loading: false });
    }
  },

  addPlan: async (formData) => {
    try {
      const featuresArray = formData.features?.split('\n').map(f => f.trim()).filter(f => f) ?? [];
      
      // Prepare data for API (adjust according to your API's expected format)
      const apiData = {
        name: formData.name,
        description: formData.description,
        annualPrice: formData.priceAnnual,
        manthlyPrice: formData.priceMonthly,
        maxSalons: formData.maxSalons,
        staffLimit: formData.limits?.staff,
        clientLimit: formData.limits?.clients,
        isPopular: formData.isPopular,
        features: featuresArray,
      };

      const response = await fetch('https://kapperking.runasp.net/api/Home/AddPlan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) throw new Error('Failed to add plan');

      // Refresh the plans after successful addition
      await get().fetchPlans();
      emitter.emit('plansUpdated');
    } catch (error) {
      console.error('Error adding plan:', error);
      throw error;
    }
  },

  // updatePlan: async (planId, formData) => {
  //   try {
  //     const featuresArray = formData.features !== undefined
  //       ? formData.features.split('\n').map(f => f.trim()).filter(f => f) ?? []
  //       : get().plans.find(p => p.id === planId)?.features || [];

  //     // Prepare data for API
  //     const apiData = {
  //       id: planId,
  //       name: formData.name,
  //       description: formData.description,
  //       annualPrice: formData.priceAnnual,
  //       manthlyPrice: formData.priceMonthly,
  //       maxSalons: formData.maxSalons,
  //       staffLimit: formData.limits?.staff,
  //       clientLimit: formData.limits?.clients,
  //       isPopular: formData.isPopular,
  //       features: featuresArray,
  //     };

  //     const response = await fetch('https://kapperking.runasp.net/api/Home/UpdatePlan', {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(apiData),
  //     });

  //     if (!response.ok) throw new Error('Failed to update plan');

  //     await get().fetchPlans();
  //     emitter.emit('plansUpdated');
  //   } catch (error) {
  //     console.error('Error updating plan:', error);
  //     throw error;
  //   }
  // },
  updatePlan: async (planId, formData) => {
    try {
      // Convert features string to array if needed
      const featuresArray = formData.features !== undefined
        ? typeof formData.features === 'string'
          ? formData.features.split('\n').map(f => f.trim()).filter(f => f)
          : formData.features
        : get().plans.find(p => p.id === planId)?.features || [];
  
      // Prepare data for API in the exact required format
      const apiData = {
        id: planId,
        name: formData.name ?? get().plans.find(p => p.id === planId)?.name,
        description: formData.description ?? get().plans.find(p => p.id === planId)?.description,
        annualPrice: formData.priceAnnual ?? get().plans.find(p => p.id === planId)?.priceAnnual,
        manthlyPrice: formData.priceMonthly ?? get().plans.find(p => p.id === planId)?.priceMonthly,
        maxSalons: formData.maxSalons ?? get().plans.find(p => p.id === planId)?.maxSalons,
        staffLimit: formData.limits?.staff ?? get().plans.find(p => p.id === planId)?.limits?.staff,
        clientLimit: formData.limits?.clients ?? get().plans.find(p => p.id === planId)?.limits?.clients,
        isPopular: formData.isPopular ?? get().plans.find(p => p.id === planId)?.isPopular,
        features: featuresArray
      };
  
      const response = await fetch('https://kapperking.runasp.net/api/SuperAdmin/EditPlan', {
        method: 'POST', // or 'PUT' if that's what your API expects
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update plan');
      }
  
      // Refresh the plans after successful update
      await get().fetchPlans();
      emitter.emit('plansUpdated');
      
      return { success: true };
    } catch (error) {
      console.error('Error updating plan:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  },

  // deletePlan: async (planId) => {
  //   try {
  //     const response = await fetch(`https://kapperking.runasp.net/api/Home/DeletePlan/${planId}`, {
  //       method: 'DELETE',
  //     });

  //     if (!response.ok) throw new Error('Failed to delete plan');

  //     await get().fetchPlans();
  //     emitter.emit('plansUpdated');
  //   } catch (error) {
  //     console.error('Error deleting plan:', error);
  //     throw error;
  //   }
  // },
  deletePlan: async (planId) => {
  try {
    set({ loading: true, error: null });
    
    const response = await fetch(
      `https://kapperking.runasp.net/api/SuperAdmin/DeletePlan/${planId}`, 
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${yourToken}`
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete plan (Status: ${response.status})`);
    }

    // Option 1: Optimistic update - remove from state immediately
    set((state) => ({
      plans: state.plans.filter(plan => plan.id !== planId),
      loading: false
    }));

    // Option 2: Refresh the entire list (if you prefer consistency)
    // await get().fetchPlans();
    
    emitter.emit('plansUpdated');
  } catch (error) {
    set({ 
      error: error instanceof Error ? error.message : 'Failed to delete plan',
      loading: false
    });
    console.error('Error deleting plan:', error);
    throw error; // Re-throw if you want components to handle the error
  }
},
}));

// --- Selectors ---
export const selectAllPlans = (state: SubscriptionPlanState) => state.plans;

export const selectPlanById = (state: SubscriptionPlanState, planId: number): SubscriptionPlan | undefined => {
  return state.plans.find(p => p.id === planId);
};