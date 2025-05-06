import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';

// Define a comprehensive Salon type matching the DB schema
export interface Salon {
  id: string;
  name: string;
  slug: string;
  owner_id: string | null;
  subscription_plan_id?: string | null; 
  subscription_status?: string | null; 
  trial_ends_at?: string | null; 
  email?: string | null; 
  phone?: string | null; 
  address_line1?: string | null; 
  address_line2?: string | null;
  city?: string | null; 
  postal_code?: string | null; 
  country?: string | null; 
  timezone?: string | null; 
  currency?: string | null; 
  logo_url?: string | null; 
  website?: string | null; 
  custom_domain?: string | null; 
  theme_colors?: { primary: string; secondary: string; } | null; 
  stripe_connect_account_id?: string | null; // Added Stripe Connect ID
  is_active: boolean;
  dashboard_primary_color?: string | null; // Add dashboard color
  dashboard_secondary_color?: string | null; // Add dashboard color
  created_at: string;
  updated_at: string;
}

interface CurrentSalonState {
  currentSalon: Salon | null;
  loading: boolean;
  error: string | null;
  fetchCurrentSalon: (userId: string) => Promise<void>;
  updateCurrentSalonDetails: (salonId: string, updates: Partial<Omit<Salon, 'id' | 'owner_id' | 'created_at' | 'updated_at' | 'slug' | 'subscription_plan_id' | 'subscription_status' | 'trial_ends_at'>>) => Promise<boolean>; 
  clearCurrentSalon: () => void; 
  initiateStripeConnectOnboarding: (salonId: string) => Promise<string | null>; // Add signature
}

export const useCurrentSalonStore = create<CurrentSalonState>((set, get) => ({ 
  currentSalon: null,
  loading: false,
  error: null,

  fetchCurrentSalon: async (userId) => {
    const demoUserId = 'demo-user-123'; 
    const demoSalonSlug = 'demo-salon'; 

    if (!userId) {
      set({ currentSalon: null, loading: false, error: 'User ID not provided.' });
      return;
    }
    if (userId === demoUserId) {
      console.log("Fetching hardcoded demo salon data...");
      const demoSalonData: Salon = {
        id: 'demo-salon-id-999', name: 'KapperKing Demo Salon', slug: demoSalonSlug, owner_id: demoUserId, is_active: true,
        subscription_plan_id: 'professional', subscription_status: 'trialing', trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        email: 'demo@kapperking-salon.com', phone: '0123456789', address_line1: '1 Demo Street', address_line2: null, city: 'Demo City', postal_code: '1234AB', country: 'Netherlands',
        timezone: 'Europe/Amsterdam', currency: 'EUR', logo_url: null, website: null, custom_domain: null, 
        theme_colors: { primary: '#6366F1', secondary: '#EC4899' }, stripe_connect_account_id: null, // Add stripe id to demo
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      };
      set({ currentSalon: demoSalonData, loading: false, error: null });
      return; 
    }
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.from('salons').select('*').eq('owner_id', userId).eq('is_active', true).limit(1).maybeSingle(); 
      if (error) throw error;
      if (data) { set({ currentSalon: data as Salon, loading: false }); } 
      else { set({ currentSalon: null, loading: false, error: 'No active salon found for this user.' }); }
    } catch (error: any) {
      console.error("Error fetching current salon:", error);
      set({ currentSalon: null, error: `Failed to load salon data: ${error.message}`, loading: false });
      toast.error('Failed to load salon data');
    }
  },

  updateCurrentSalonDetails: async (salonId, updates) => {
     set({ loading: true });
     try {
        const validUpdates = updates; // Type signature already omits immutable fields
        const { data, error } = await supabase.from('salons').update(validUpdates).eq('id', salonId).select('*').single();
        if (error) throw error;
        set({ currentSalon: data as Salon, loading: false, error: null }); 
        toast.success("Salon details updated successfully.");
        return true;
     } catch (error: any) {
        toast.error(`Failed to update salon details: ${error.message}`);
        set({ loading: false, error: error.message });
        return false;
     }
  },

  // Add implementation for Stripe onboarding action
  initiateStripeConnectOnboarding: async (salonId) => {
     set({ loading: true }); 
     try {
        const { data, error } = await supabase.functions.invoke('create-stripe-connect-account', {
           body: { salonId },
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);
        if (!data.onboardingUrl) throw new Error("Onboarding URL not returned from function.");

        set({ loading: false });
        return data.onboardingUrl; // Return the URL for redirection

     } catch (error: any) {
        console.error("Error initiating Stripe Connect onboarding:", error);
        toast.error(`Failed to start Stripe setup: ${error.message}`);
        set({ loading: false, error: error.message });
        return null;
     }
  },

  clearCurrentSalon: () => {
    set({ currentSalon: null, loading: false, error: null });
  }

}));

// Selector
export const selectCurrentSalon = (state: CurrentSalonState) => state.currentSalon;