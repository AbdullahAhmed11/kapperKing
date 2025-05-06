import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import { Client } from './clients'; // Import Client type

// --- Interface Definitions ---

export interface LoyaltyTier {
  id: string;
  salon_id: string;
  name: string;
  points_threshold: number;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyReward {
  id: string;
  salon_id: string;
  name: string;
  description?: string | null;
  points_cost: number;
  reward_type: 'discount' | 'free_service' | 'product';
  reward_value?: number | null;
  required_service_id?: string | null;
  required_product_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyRedemption {
  id: string;
  salon_id: string;
  client_id: string;
  reward_id: string;
  points_spent: number;
  redeemed_at: string;
  notes?: string | null;
  staff_id?: string | null;
  loyalty_rewards?: { name: string } | null;
}

export interface LoyaltyPointLog {
   id: string;
   created_at: string;
   points_change: number;
   reason: string;
}

export interface LoyaltyAnalyticsSummary {
  salon_id: string;
  total_members: number;
  active_members_90d: number;
  points_earned_30d: number;
  points_spent_30d: number;
  redemption_rate: number | null;
}

export interface PointsActivityResult {
    month_start: string; // Date string
    points_earned: number;
    points_spent: number;
}

export interface TopRewardResult {
    reward_name: string;
    redemption_count: number;
}

export interface LoyaltyMember extends Client {
  loyalty_tier?: Pick<LoyaltyTier, 'id' | 'name'> | null;
  join_date?: string;
  recent_activity?: string;
}

interface LoyaltyStore {
  tiers: LoyaltyTier[];
  rewards: LoyaltyReward[];
  members: LoyaltyMember[];
  redemptions: LoyaltyRedemption[];
  pointLog: LoyaltyPointLog[];
  analyticsSummary: LoyaltyAnalyticsSummary | null;
  pointsActivity: PointsActivityResult[];
  topRewards: TopRewardResult[];
  loadingTiers: boolean;
  loadingRewards: boolean;
  loadingMembers: boolean;
  loadingRedemptions: boolean;
  loadingPointLog: boolean;
  loadingAnalyticsSummary: boolean; // Correct loading state name
  loadingPointsActivity: boolean;
  loadingTopRewards: boolean;
  loading: boolean; // General loading state
  error: string | null;

  // Actions
  fetchTiers: (salonId: string) => Promise<void>;
  addTier: (tierData: Omit<LoyaltyTier, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateTier: (id: string, updates: Partial<Omit<LoyaltyTier, 'id' | 'created_at' | 'updated_at' | 'salon_id'>>) => Promise<boolean>;
  deleteTier: (id: string) => Promise<boolean>;
  fetchRewards: (salonId: string) => Promise<void>;
  addReward: (rewardData: Omit<LoyaltyReward, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateReward: (id: string, updates: Partial<Omit<LoyaltyReward, 'id' | 'created_at' | 'updated_at' | 'salon_id'>>) => Promise<boolean>;
  deleteReward: (id: string) => Promise<boolean>;
  fetchMembers: (salonId: string) => Promise<void>;
  addPoints: (clientId: string, pointsToAdd: number, reason: string, staffId?: string, appointmentId?: string) => Promise<boolean>;
  redeemReward: (clientId: string, rewardId: string, staffId?: string) => Promise<boolean>;
  adjustPoints: (clientId: string, pointsToAdjust: number, reason: string, staffId?: string) => Promise<boolean>;
  fetchRedemptionsByClientId: (clientId: string) => Promise<void>;
  fetchPointLogByClientId: (clientId: string) => Promise<void>;
  fetchAnalyticsSummary: (salonId: string) => Promise<void>; // Correct action name
  fetchPointsActivity: (salonId: string, months?: number) => Promise<void>;
  fetchTopRewards: (salonId: string, limit?: number) => Promise<void>;
}

export const useLoyaltyStore = create<LoyaltyStore>((set, get) => ({
  // Initial State
  tiers: [],
  rewards: [],
  members: [],
  redemptions: [],
  pointLog: [],
  analyticsSummary: null, // Correctly initialized
  pointsActivity: [],
  topRewards: [],
  loadingTiers: false,
  loadingRewards: false,
  loadingMembers: false,
  loadingRedemptions: false,
  loadingPointLog: false,
  loadingAnalyticsSummary: false, // Correctly initialized
  loadingPointsActivity: false,
  loadingTopRewards: false,
  loading: false,
  error: null,

  // --- Tier Actions ---
  fetchTiers: async (salonId) => {
    if (!salonId) return;
    set({ loadingTiers: true, error: null });
    try {
      const { data, error } = await supabase.from('loyalty_tiers').select('*').eq('salon_id', salonId).order('points_threshold', { ascending: true });
      if (error) throw error;
      set({ tiers: data || [] });
    } catch (error: any) { toast.error(`Failed to fetch loyalty tiers: ${error.message}`); set({ error: error.message }); }
    finally { set({ loadingTiers: false }); }
  },
  addTier: async (tierData) => {
     set({ loadingTiers: true });
     try {
        const { data, error } = await supabase.from('loyalty_tiers').insert(tierData).select().single();
        if (error) throw error;
        set(state => ({ tiers: [...state.tiers, data].sort((a,b) => a.points_threshold - b.points_threshold) }));
        toast.success(`Tier "${data.name}" created.`); return true;
     } catch (error: any) { toast.error(`Failed to create tier: ${error.message}`); set({ error: error.message }); return false; }
     finally { set({ loadingTiers: false }); }
  },
  updateTier: async (id, updates) => {
     set({ loadingTiers: true });
     try {
        const { data, error } = await supabase.from('loyalty_tiers').update(updates).eq('id', id).select().single();
        if (error) throw error;
        set(state => ({ tiers: state.tiers.map(t => t.id === id ? data : t).sort((a,b) => a.points_threshold - b.points_threshold) }));
        toast.success(`Tier "${data.name}" updated.`); return true;
     } catch (error: any) { toast.error(`Failed to update tier: ${error.message}`); set({ error: error.message }); return false; }
     finally { set({ loadingTiers: false }); }
  },
   deleteTier: async (id) => {
      set({ loadingTiers: true });
      try {
         const { error } = await supabase.from('loyalty_tiers').delete().eq('id', id);
         if (error) throw error;
         set(state => ({ tiers: state.tiers.filter(t => t.id !== id) }));
         toast.success(`Tier deleted.`); return true;
      } catch (error: any) { toast.error(`Failed to delete tier: ${error.message}`); set({ error: error.message }); return false; }
      finally { set({ loadingTiers: false }); }
   },

  // --- Reward Actions ---
  fetchRewards: async (salonId) => {
     if (!salonId) return;
     set({ loadingRewards: true, error: null });
     try {
       const { data, error } = await supabase.from('loyalty_rewards').select('*').eq('salon_id', salonId).order('points_cost', { ascending: true });
       if (error) throw error;
       set({ rewards: data || [] });
     } catch (error: any) { toast.error(`Failed to fetch loyalty rewards: ${error.message}`); set({ error: error.message }); }
     finally { set({ loadingRewards: false }); }
  },
  addReward: async (rewardData) => {
      set({ loadingRewards: true });
      try {
         const { data, error } = await supabase.from('loyalty_rewards').insert(rewardData).select().single();
         if (error) throw error;
         set(state => ({ rewards: [...state.rewards, data].sort((a,b) => a.points_cost - b.points_cost) }));
         toast.success(`Reward "${data.name}" created.`); return true;
      } catch (error: any) { toast.error(`Failed to create reward: ${error.message}`); set({ error: error.message }); return false; }
      finally { set({ loadingRewards: false }); }
   },
   updateReward: async (id, updates) => {
      set({ loadingRewards: true });
      try {
         const { data, error } = await supabase.from('loyalty_rewards').update(updates).eq('id', id).select().single();
         if (error) throw error;
         set(state => ({ rewards: state.rewards.map(r => r.id === id ? data : r).sort((a,b) => a.points_cost - b.points_cost) }));
         toast.success(`Reward "${data.name}" updated.`); return true;
      } catch (error: any) { toast.error(`Failed to update reward: ${error.message}`); set({ error: error.message }); return false; }
      finally { set({ loadingRewards: false }); }
   },
    deleteReward: async (id) => {
       set({ loadingRewards: true });
       try {
          const { error } = await supabase.from('loyalty_rewards').delete().eq('id', id);
          if (error) throw error;
          set(state => ({ rewards: state.rewards.filter(r => r.id !== id) }));
          toast.success(`Reward deleted.`); return true;
       } catch (error: any) { toast.error(`Failed to delete reward: ${error.message}`); set({ error: error.message }); return false; }
       finally { set({ loadingRewards: false }); }
    },

  // --- Member Actions (Dashboard) ---
  fetchMembers: async (salonId) => {
     if (!salonId) return;
     set({ loadingMembers: true, error: null });
     try {
       const { data, error } = await supabase.from('clients').select(`*, loyalty_tiers ( id, name )`).eq('salon_id', salonId).order('lastName', { ascending: true });
       if (error) throw error;
       const members = data?.map(client => ({ ...client, loyalty_tier: client.loyalty_tiers })) || [];
       set({ members: members });
     } catch (error: any) { toast.error(`Failed to fetch loyalty members: ${error.message}`); set({ error: error.message }); }
     finally { set({ loadingMembers: false }); }
  },

  // --- Points & Redemption Actions (Frontend calls Backend Function) ---
  addPoints: async (clientId, pointsToAdd, reason, staffId, appointmentId) => {
     set({ loadingMembers: true }); 
     try {
       const { data, error } = await supabase.functions.invoke('add-loyalty-points', { body: { clientId, pointsToAdd, reason, relatedAppointmentId: appointmentId } });
       if (error) throw error; if (data.error) throw new Error(data.error);
       toast.success(`${pointsToAdd} points added successfully.`);
       const salonId = get().members.find(m => m.id === clientId)?.salon_id;
       if (salonId) get().fetchMembers(salonId); return true;
     } catch (error: any) { console.error("Error calling add-loyalty-points function:", error); toast.error(`Failed to add points: ${error.message}`); set({ loadingMembers: false }); return false; }
  },
  redeemReward: async (clientId, rewardId, staffId) => {
     set({ loadingMembers: true });
     try {
       const { data, error } = await supabase.functions.invoke('redeem-loyalty-reward', { body: { clientId, rewardId } });
       if (error) throw error; if (data.error) throw new Error(data.error);
       toast.success(`Reward redeemed successfully.`);
       const salonId = get().members.find(m => m.id === clientId)?.salon_id;
       if (salonId) get().fetchMembers(salonId); return true;
     } catch (error: any) { console.error("Error calling redeem-loyalty-reward function:", error); toast.error(`Failed to redeem reward: ${error.message}`); set({ loadingMembers: false }); return false; }
  },
  adjustPoints: async (clientId, pointsToAdjust, reason, staffId) => {
     set({ loadingMembers: true });
     try {
       const { data, error } = await supabase.functions.invoke('adjust-loyalty-points', { body: { clientId, pointsToAdjust, reason } });
       if (error) throw error; if (data.error) throw new Error(data.error);
       toast.success(`Points adjusted successfully.`);
       const salonId = get().members.find(m => m.id === clientId)?.salon_id;
       if (salonId) get().fetchMembers(salonId); return true;
     } catch (error: any) { console.error("Error calling adjust-loyalty-points function:", error); toast.error(`Failed to adjust points: ${error.message}`); set({ loadingMembers: false }); return false; }
  },

  // --- Redemption History Action (Customer Portal) ---
  fetchRedemptionsByClientId: async (clientId) => {
     if (!clientId) return;
     set({ loadingRedemptions: true, error: null });
     try {
       const { data, error } = await supabase.from('loyalty_redemptions').select(`*, loyalty_rewards ( name )`).eq('client_id', clientId).order('redeemed_at', { ascending: false });
       if (error) throw error;
       set({ redemptions: data || [] });
     } catch (error: any) { toast.error(`Failed to fetch redemption history: ${error.message}`); set({ error: error.message }); }
     finally { set({ loadingRedemptions: false }); }
  },

  // --- Point Log History ---
  fetchPointLogByClientId: async (clientId) => {
     if (!clientId) return;
     set({ loadingPointLog: true, error: null });
     try {
       const { data, error } = await supabase.from('loyalty_points_log').select('*').eq('client_id', clientId).order('created_at', { ascending: false }).limit(100);
       if (error) throw error;
       set({ pointLog: data || [] });
     } catch (error: any) { toast.error(`Failed to fetch points history: ${error.message}`); set({ error: error.message }); }
     finally { set({ loadingPointLog: false }); }
  },

  // --- Analytics --- Correctly defined once here ---
  fetchAnalyticsSummary: async (salonId) => {
     if (!salonId) return;
     set({ loadingAnalyticsSummary: true, error: null }); // Use correct loading state name
     try {
       const { data, error } = await supabase.from('loyalty_analytics_summary').select('*').eq('salon_id', salonId).maybeSingle();
       if (error) throw error;
       set({ analyticsSummary: data });
     } catch (error: any) { toast.error(`Failed to fetch loyalty analytics: ${error.message}`); set({ error: error.message }); }
     finally { set({ loadingAnalyticsSummary: false }); } // Use correct loading state name
  },
  fetchPointsActivity: async (salonId, months = 6) => {
     if (!salonId) return;
     set({ loadingPointsActivity: true, error: null });
     try {
       const { data, error } = await supabase.rpc('get_monthly_points_activity', { p_salon_id: salonId, p_months: months });
       if (error) throw error;
       set({ pointsActivity: data || [] });
     } catch (error: any) { toast.error(`Failed to fetch points activity: ${error.message}`); set({ error: error.message }); }
     finally { set({ loadingPointsActivity: false }); }
  },
  fetchTopRewards: async (salonId, limit = 5) => {
     if (!salonId) return;
     set({ loadingTopRewards: true, error: null });
     try {
       const { data, error } = await supabase.rpc('get_top_redeemed_rewards', { p_salon_id: salonId, p_limit: limit });
       if (error) throw error;
       set({ topRewards: data || [] });
     } catch (error: any) { toast.error(`Failed to fetch top rewards: ${error.message}`); set({ error: error.message }); }
     finally { set({ loadingTopRewards: false }); }
  },

}));

// Selectors
export const selectLoyaltyTiers = (state: LoyaltyStore) => state.tiers;
export const selectLoyaltyRewards = (state: LoyaltyStore) => state.rewards;
export const selectLoyaltyMembers = (state: LoyaltyStore) => state.members;
export const selectCustomerRedemptions = (state: LoyaltyStore) => state.redemptions;
export const selectCustomerPointLog = (state: LoyaltyStore) => state.pointLog;
export const selectAnalyticsSummary = (state: LoyaltyStore) => state.analyticsSummary;
export const selectPointsActivity = (state: LoyaltyStore) => state.pointsActivity; // Added selector
export const selectTopRewards = (state: LoyaltyStore) => state.topRewards; // Added selector