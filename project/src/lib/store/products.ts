import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  barcode?: string;
  reorderPoint: number;
  salonId: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  createProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  updateStock: (id: string, quantity: number) => Promise<void>;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      set({ products: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
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

      set(state => ({
        products: [...state.products, data]
      }));

      toast.success('Product created successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to create product');
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
        products: state.products.map(product =>
          product.id === id ? { ...product, ...data } : product
        )
      }));

      toast.success('Product updated successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to update product');
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (id) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        products: state.products.filter(product => product.id !== id)
      }));

      toast.success('Product deleted successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to delete product');
    } finally {
      set({ loading: false });
    }
  },

  searchProducts: async (query) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,sku.ilike.%${query}%,barcode.ilike.%${query}%`)
        .order('name', { ascending: true });

      if (error) throw error;

      set({ products: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to search products');
    } finally {
      set({ loading: false });
    }
  },

  updateStock: async (id, quantity) => {
    try {
      set({ loading: true, error: null });
      
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const newStock = product.stock + quantity;
      if (newStock < 0) {
        throw new Error('Insufficient stock');
      }

      const { data, error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      set(state => ({
        products: state.products.map(product =>
          product.id === id ? { ...product, ...data } : product
        )
      }));

      toast.success('Stock updated successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to update stock');
    } finally {
      set({ loading: false });
    }
  }
}));