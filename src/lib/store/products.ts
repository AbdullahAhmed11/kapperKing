import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';

// Match Product type from microsite store (or define centrally)
export interface Product {
  id: string;
  salon_id: string; // Link to salon
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  stock?: number; // Optional stock tracking
  active: boolean; // Is the product available for sale
  created_at: string;
}

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: (salonId: string) => Promise<void>;
  createProduct: (productData: Omit<Product, 'id' | 'created_at'>) => Promise<boolean>;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'salon_id'>>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async (salonId) => {
    const demoSalonId = 'demo-salon-id-999'; // Consistent demo ID
    if (!salonId) return;

    // --- DEMO SALON HANDLING ---
    if (salonId === demoSalonId) {
       console.log("Using demo product data.");
       const demoProducts: Product[] = [
          { id: 'p1', salon_id: demoSalonId, name: 'Demo Shampoo', price: 20, image_url: '/images/placeholders/product.png', active: true, created_at: '', description: 'Cleans demo hair', stock: 10 },
          { id: 'p2', salon_id: demoSalonId, name: 'Demo Conditioner', price: 22, image_url: '/images/placeholders/product2.png', active: true, created_at: '', description: 'Softens demo hair', stock: 5 },
       ];
       set({ products: demoProducts, loading: false, error: null });
       return;
    }
    // --- END DEMO SALON HANDLING ---
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('salon_id', salonId)
        .order('name', { ascending: true });

      if (error) throw error;
      set({ products: data || [] });
    } catch (error: any) {
      set({ error: `Failed to fetch products: ${error.message}` });
      toast.error('Failed to fetch products');
    } finally {
      set({ loading: false });
    }
  },

  createProduct: async (productData) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;
      set(state => ({ products: [...state.products, data].sort((a,b) => a.name.localeCompare(b.name)) }));
      toast.success('Product created successfully');
      return true;
    } catch (error: any) {
      set({ error: `Failed to create product: ${error.message}` });
      toast.error(`Failed to create product: ${error.message}`);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateProduct: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set(state => ({
        products: state.products.map(p => p.id === id ? data : p)
      }));
      toast.success('Product updated successfully');
      return true;
    } catch (error: any) {
      set({ error: `Failed to update product: ${error.message}` });
      toast.error(`Failed to update product: ${error.message}`);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (id) => {
     try {
       set(state => ({ loading: true, products: state.products.filter(p => p.id !== id) })); // Optimistic UI
       const { error } = await supabase
         .from('products')
         .delete()
         .eq('id', id);

       if (error) {
          toast.error(`Failed to delete product: ${error.message}`);
          get().fetchProducts(get().products[0]?.salon_id || ''); // Refetch on error to revert
          throw error;
       }
       toast.success('Product deleted successfully');
       return true;
     } catch (error: any) {
       set({ error: `Failed to delete product: ${error.message}` });
       return false;
     } finally {
       set({ loading: false });
     }
   },
}));

// Selectors
export const selectAllProducts = (state: ProductStore) => state.products;