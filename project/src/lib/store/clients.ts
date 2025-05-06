import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  salons: string[];
  subscriptionPlan: string;
  notes?: string;
  marketingConsent: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ClientStore {
  clients: Client[];
  loading: boolean;
  error: string | null;
  fetchClients: () => Promise<void>;
  createClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  searchClients: (query: string) => Promise<void>;
}

export const useClientStore = create<ClientStore>((set) => ({
  clients: [],
  loading: false,
  error: null,

  fetchClients: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          client_salons!inner (
            salon_id
          )
        `)
        .order('last_name', { ascending: true });

      if (error) throw error;

      // Transform the data to match our Client interface
      const transformedData = data.map(client => ({
        id: client.id,
        firstName: client.first_name,
        lastName: client.last_name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        salons: client.client_salons.map((cs: any) => cs.salon_id),
        subscriptionPlan: client.subscription_plan_id,
        notes: client.notes,
        marketingConsent: client.marketing_consent,
        createdAt: client.created_at,
        updatedAt: client.updated_at
      }));

      set({ clients: transformedData });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to fetch clients');
    } finally {
      set({ loading: false });
    }
  },

  createClient: async (clientData) => {
    try {
      set({ loading: true, error: null });
      
      // First create the client
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          first_name: clientData.firstName,
          last_name: clientData.lastName,
          email: clientData.email,
          phone: clientData.phone,
          company: clientData.company,
          subscription_plan_id: clientData.subscriptionPlan,
          notes: clientData.notes,
          marketing_consent: clientData.marketingConsent
        })
        .select()
        .single();

      if (clientError) throw clientError;

      // Then create the salon associations
      const salonAssociations = clientData.salons.map(salonId => ({
        client_id: client.id,
        salon_id: salonId
      }));

      const { error: salonError } = await supabase
        .from('client_salons')
        .insert(salonAssociations);

      if (salonError) throw salonError;

      // Fetch the updated clients list
      await set().fetchClients();

      toast.success('Client created successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to create client');
    } finally {
      set({ loading: false });
    }
  },

  updateClient: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      
      // Update the client details
      const { error: clientError } = await supabase
        .from('clients')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          email: updates.email,
          phone: updates.phone,
          company: updates.company,
          subscription_plan_id: updates.subscriptionPlan,
          notes: updates.notes,
          marketing_consent: updates.marketingConsent
        })
        .eq('id', id);

      if (clientError) throw clientError;

      // If salons were updated, update the associations
      if (updates.salons) {
        // First delete existing associations
        const { error: deleteError } = await supabase
          .from('client_salons')
          .delete()
          .eq('client_id', id);

        if (deleteError) throw deleteError;

        // Then create new associations
        const salonAssociations = updates.salons.map(salonId => ({
          client_id: id,
          salon_id: salonId
        }));

        const { error: salonError } = await supabase
          .from('client_salons')
          .insert(salonAssociations);

        if (salonError) throw salonError;
      }

      // Fetch the updated clients list
      await set().fetchClients();

      toast.success('Client updated successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to update client');
    } finally {
      set({ loading: false });
    }
  },

  deleteClient: async (id) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        clients: state.clients.filter(client => client.id !== id)
      }));

      toast.success('Client deleted successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to delete client');
    } finally {
      set({ loading: false });
    }
  },

  searchClients: async (query) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          client_salons!inner (
            salon_id
          )
        `)
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('last_name', { ascending: true });

      if (error) throw error;

      // Transform the data to match our Client interface
      const transformedData = data.map(client => ({
        id: client.id,
        firstName: client.first_name,
        lastName: client.last_name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        salons: client.client_salons.map((cs: any) => cs.salon_id),
        subscriptionPlan: client.subscription_plan_id,
        notes: client.notes,
        marketingConsent: client.marketing_consent,
        createdAt: client.created_at,
        updatedAt: client.updated_at
      }));

      set({ clients: transformedData });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to search clients');
    } finally {
      set({ loading: false });
    }
  }
}));