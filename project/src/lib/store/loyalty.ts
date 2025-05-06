import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';

interface LoyaltyProgramSettings {
  id: string;
  salonId: string;
  pointsPerCurrency: number;
  pointsValueCurrency: number;
  minimumPointsRedemption: number;
  welcomeBonusPoints: number;
  birthdayBonusPoints: number;
  expiryMonths: number;
}

interface LoyaltyPoints {
  id: string;
  clientId: string;
  salonId: string;
  pointsBalance: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  lastActivityDate: string;
}

interface LoyaltyTransaction {
  id: string;
  clientId: string;
  salonId: string;
  points: number;
  type: 'earn' | 'redeem' | 'expire' | 'bonus';
  source: string;
  sourceId?: string;
  description: string;
  createdAt: string;
}

interface LoyaltyStore {
  settings: LoyaltyProgramSettings | null;
  points: LoyaltyPoints | null;
  transactions: LoyaltyTransaction[];
  loading: boolean;
  error: string | null;
  fetchSettings: (salonId: string) => Promise<void>;
  updateSettings: (salonId: string, settings: Partial<LoyaltyProgramSettings>) => Promise<void>;
  fetchClientPoints: (clientId: string, salonId: string) => Promise<void>;
  fetchTransactions: (clientId: string, salonId: string) => Promise<void>;
  awardPoints: (clientId: string, salonId: string, points: number, source: string, sourceId?: string, description?: string) => Promise<void>;
  redeemPoints: (clientId: string, salonId: string, points: number, source: string, sourceId?: string, description?: string) => Promise<void>;
}

export const useLoyaltyStore = create<LoyaltyStore>((set, get) => ({
  settings: null,
  points: null,
  transactions: [],
  loading: false,
  error: null,

  fetchSettings: async (salonId) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('loyalty_program_settings')
        .select('*')
        .eq('salon_id', salonId)
        .single();

      if (error) throw error;

      set({ settings: data });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to fetch loyalty program settings');
    } finally {
      set({ loading: false });
    }
  },

  updateSettings: async (salonId, settings) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('loyalty_program_settings')
        .upsert({
          salon_id: salonId,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      set({ settings: data });
      toast.success('Loyalty program settings updated');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to update loyalty program settings');
    } finally {
      set({ loading: false });
    }
  },

  fetchClientPoints: async (clientId, salonId) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('client_id', clientId)
        .eq('salon_id', salonId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      set({ points: data || null });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to fetch loyalty points');
    } finally {
      set({ loading: false });
    }
  },

  fetchTransactions: async (clientId, salonId) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('client_id', clientId)
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ transactions: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to fetch loyalty transactions');
    } finally {
      set({ loading: false });
    }
  },

  awardPoints: async (clientId, salonId, points, source, sourceId, description) => {
    try {
      set({ loading: true, error: null });

      const { data: transaction, error: transactionError } = await supabase
        .from('loyalty_transactions')
        .insert({
          client_id: clientId,
          salon_id: salonId,
          points,
          type: 'earn',
          source,
          source_id: sourceId,
          description
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update points balance
      const { data: currentPoints, error: pointsError } = await supabase
        .from('loyalty_points')
        .select('points_balance, total_points_earned')
        .eq('client_id', clientId)
        .eq('salon_id', salonId)
        .single();

      if (pointsError && pointsError.code !== 'PGRST116') throw pointsError;

      const newBalance = (currentPoints?.points_balance || 0) + points;
      const newTotalEarned = (currentPoints?.total_points_earned || 0) + points;

      const { error: updateError } = await supabase
        .from('loyalty_points')
        .upsert({
          client_id: clientId,
          salon_id: salonId,
          points_balance: newBalance,
          total_points_earned: newTotalEarned,
          last_activity_date: new Date().toISOString()
        });

      if (updateError) throw updateError;

      // Refresh data
      await Promise.all([
        get().fetchClientPoints(clientId, salonId),
        get().fetchTransactions(clientId, salonId)
      ]);

      toast.success(`Awarded ${points} loyalty points`);
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to award loyalty points');
    } finally {
      set({ loading: false });
    }
  },

  redeemPoints: async (clientId, salonId, points, source, sourceId, description) => {
    try {
      set({ loading: true, error: null });

      // Check if client has enough points
      const { data: currentPoints, error: pointsError } = await supabase
        .from('loyalty_points')
        .select('points_balance, total_points_redeemed')
        .eq('client_id', clientId)
        .eq('salon_id', salonId)
        .single();

      if (pointsError) throw pointsError;
      if (!currentPoints || currentPoints.points_balance < points) {
        throw new Error('Insufficient points balance');
      }

      // Create redemption transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('loyalty_transactions')
        .insert({
          client_id: clientId,
          salon_id: salonId,
          points: -points,
          type: 'redeem',
          source,
          source_id: sourceId,
          description
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update points balance
      const newBalance = currentPoints.points_balance - points;
      const newTotalRedeemed = currentPoints.total_points_redeemed + points;

      const { error: updateError } = await supabase
        .from('loyalty_points')
        .update({
          points_balance: newBalance,
          total_points_redeemed: newTotalRedeemed,
          last_activity_date: new Date().toISOString()
        })
        .eq('client_id', clientId)
        .eq('salon_id', salonId);

      if (updateError) throw updateError;

      // Refresh data
      await Promise.all([
        get().fetchClientPoints(clientId, salonId),
        get().fetchTransactions(clientId, salonId)
      ]);

      toast.success(`Redeemed ${points} loyalty points`);
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to redeem loyalty points');
    } finally {
      set({ loading: false });
    }
  }
}));