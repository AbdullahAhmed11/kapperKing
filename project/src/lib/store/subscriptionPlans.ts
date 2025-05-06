import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    staff: number;
    clients: number;
    storage: string;
  };
  isPopular: boolean;
  isActive: boolean;
  stats?: {
    activeSalons: number;
    revenue: string;
  };
  created_at: string;
  updated_at: string;
}

interface SubscriptionPlanStore {
  plans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
  fetchPlans: () => Promise<void>;
  createPlan: (plan: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at' | 'stats'>) => Promise<void>;
  updatePlan: (id: string, updates: Partial<SubscriptionPlan>) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  searchPlans: (query: string) => Promise<void>;
}

export const useSubscriptionPlanStore = create<SubscriptionPlanStore>((set) => ({
  plans: [],
  loading: false,
  error: null,

  fetchPlans: async () => {
    try {
      set({ loading: true, error: null });
      
      // First get all plans
      const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

      if (plansError) throw plansError;

      // Then get stats for each plan
      const plansWithStats = await Promise.all(plans.map(async (plan) => {
        // Get number of active salons for this plan
        const { count: activeSalons } = await supabase
          .from('salons')
          .select('id', { count: 'exact', head: true })
          .eq('subscription_plan_id', plan.id)
          .eq('subscription_status', 'active');

        // Calculate monthly revenue
        const monthlyRevenue = (activeSalons || 0) * plan.price;

        return {
          ...plan,
          features: plan.features || [],
          limits: plan.limits || { staff: -1, clients: -1, storage: 'Unlimited' },
          isPopular: plan.is_popular || false,
          isActive: plan.is_active || false,
          stats: {
            activeSalons: activeSalons || 0,
            revenue: `€${monthlyRevenue.toFixed(2)}`
          }
        };
      }));

      set({ plans: plansWithStats });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to fetch subscription plans');
    } finally {
      set({ loading: false });
    }
  },

  createPlan: async (planData) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert({
          name: planData.name,
          description: planData.description,
          price: planData.price,
          interval: planData.interval,
          features: planData.features,
          limits: planData.limits,
          is_popular: planData.isPopular,
          is_active: planData.isActive
        })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        plans: [...state.plans, {
          ...data,
          features: data.features || [],
          limits: data.limits || { staff: -1, clients: -1, storage: 'Unlimited' },
          isPopular: data.is_popular || false,
          isActive: data.is_active || false,
          stats: {
            activeSalons: 0,
            revenue: '€0.00'
          }
        }]
      }));

      toast.success('Subscription plan created successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to create subscription plan');
    } finally {
      set({ loading: false });
    }
  },

  updatePlan: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .update({
          name: updates.name,
          description: updates.description,
          price: updates.price,
          interval: updates.interval,
          features: updates.features,
          limits: updates.limits,
          is_popular: updates.isPopular,
          is_active: updates.isActive
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Refetch to get updated stats
      await set().fetchPlans();

      toast.success('Subscription plan updated successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to update subscription plan');
    } finally {
      set({ loading: false });
    }
  },

  deletePlan: async (id) => {
    try {
      set({ loading: true, error: null });
      
      // First check if any salons are using this plan
      const { count } = await supabase
        .from('salons')
        .select('id', { count: 'exact', head: true })
        .eq('subscription_plan_id', id);

      if (count && count > 0) {
        throw new Error('Cannot delete plan while salons are subscribed to it');
      }

      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        plans: state.plans.filter(plan => plan.id !== id)
      }));

      toast.success('Subscription plan deleted successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to delete subscription plan');
    } finally {
      set({ loading: false });
    }
  },

  searchPlans: async (query) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('price', { ascending: true });

      if (error) throw error;

      // Add stats to search results
      const plansWithStats = await Promise.all((data || []).map(async (plan) => {
        const { count: activeSalons } = await supabase
          .from('salons')
          .select('id', { count: 'exact', head: true })
          .eq('subscription_plan_id', plan.id)
          .eq('subscription_status', 'active');

        const monthlyRevenue = (activeSalons || 0) * plan.price;

        return {
          ...plan,
          features: plan.features || [],
          limits: plan.limits || { staff: -1, clients: -1, storage: 'Unlimited' },
          isPopular: plan.is_popular || false,
          isActive: plan.is_active || false,
          stats: {
            activeSalons: activeSalons || 0,
            revenue: `€${monthlyRevenue.toFixed(2)}`
          }
        };
      }));

      set({ plans: plansWithStats });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to search subscription plans');
    } finally {
      set({ loading: false });
    }
  }
}));