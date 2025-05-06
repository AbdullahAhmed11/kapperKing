import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';

interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  date: string;
  salonId: string;
  staffId: string;
  createdAt: string;
  updatedAt: string;
}

interface SaleStore {
  sales: Sale[];
  loading: boolean;
  error: string | null;
  fetchSales: () => Promise<void>;
  createSale: (sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  getSalesByDateRange: (startDate: string, endDate: string) => Promise<void>;
}

export const useSaleStore = create<SaleStore>((set) => ({
  sales: [],
  loading: false,
  error: null,

  fetchSales: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      set({ sales: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to fetch sales');
    } finally {
      set({ loading: false });
    }
  },

  createSale: async (saleData) => {
    try {
      set({ loading: true, error: null });
      
      // Start a transaction
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          total: saleData.total,
          date: saleData.date,
          salon_id: saleData.salonId,
          staff_id: saleData.staffId
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Create sale items
      const saleItems = saleData.items.map(item => ({
        sale_id: sale.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Update product stock
      for (const item of saleData.items) {
        const { error: stockError } = await supabase.rpc('update_product_stock', {
          p_product_id: item.productId,
          p_quantity: -item.quantity
        });

        if (stockError) throw stockError;
      }

      set(state => ({
        sales: [sale, ...state.sales]
      }));

      toast.success('Sale completed successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to create sale');
    } finally {
      set({ loading: false });
    }
  },

  getSalesByDateRange: async (startDate, endDate) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;

      set({ sales: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to fetch sales');
    } finally {
      set({ loading: false });
    }
  }
}));