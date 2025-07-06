import { create } from 'zustand';
import { toast } from 'sonner';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
// Updated Client/Owner interface to match your API response
export interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  // Add other fields that match your API response
  salonId?: string; // If applicable
  createdAt?: string; // If applicable
}
type JwtPayload = {
  Id: number; // adjust this to match your token's structure
  email?: string;
  name?: string;
  // any other fields you expect
};
interface ClientState {
  clients: Client[];
  currentCustomerClient: Client | null;
  loading: boolean;
  loadingCustomer: boolean;
  error: string | null;
  fetchClients: () => Promise<void>;
  fetchCurrentCustomerClient: (userId: string) => Promise<void>;
  updateCustomerPhone: (userId: string, phone: string) => Promise<boolean>;
  addClient: (clientData: Omit<Client, 'id'>) => Promise<Client | null>;
  updateClient: (clientId: string, updatedData: Partial<Client>) => Promise<boolean>;
  deleteClient: (clientId: string) => Promise<boolean>;
  getClientById: (clientId: string) => Promise<Client | undefined>;
  updateCurrentCustomerClient: (updates: Partial<Client>) => Promise<boolean>;
}
const token = Cookies.get('salonUser');

const decoded = jwtDecode<JwtPayload>(token);
if (token) {
  const decoded = jwtDecode<JwtPayload>(token);
  console.log('User ID:', decoded.Id);
}
export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  currentCustomerClient: null,
  loading: false,
  loadingCustomer: false,
  error: null,

  fetchClients: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`https://kapperking.runasp.net/api/Salons/GetCustomers?id=${decoded?.Id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const clients = await response.json();
      set({ clients });
    } catch (error: any) {
      toast.error(`Failed to fetch clients: ${error.message}`);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  getClientById: async (clientId) => {
    set({ loading: true });
    try {
      const response = await fetch(`https://kapperking.runasp.net/api/Owners/GetOwners/${clientId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const client = await response.json();
      return client;
    } catch (error: any) {
      toast.error(`Failed to fetch client: ${error.message}`);
      return undefined;
    } finally {
      set({ loading: false });
    }
  },

  addClient: async (clientData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('https://kapperking.runasp.net/api/Owners/CreateOwner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newClient = await response.json();
      set(state => ({ clients: [...state.clients, newClient] }));
      toast.success(`Client ${newClient.name} added.`);
      return newClient;
    } catch (error: any) {
      toast.error(`Failed to add client: ${error.message}`);
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  updateClient: async (clientId, updatedData) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`https://kapperking.runasp.net/api/Owners/UpdateOwner/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedClient = await response.json();
      set(state => ({
        clients: state.clients.map(c => c.id === clientId ? updatedClient : c)
      }));
      toast.success("Client updated.");
      return true;
    } catch (error: any) {
      toast.error(`Failed to update client: ${error.message}`);
      set({ error: error.message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteClient: async (clientId) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`https://kapperking.runasp.net/api/Owners/DeleteOwner/${clientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      set(state => ({ clients: state.clients.filter(c => c.id !== clientId) }));
      toast.success("Client deleted.");
      return true;
    } catch (error: any) {
      toast.error(`Failed to delete client: ${error.message}`);
      set({ error: error.message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // The following methods would need similar API endpoint integration
  // Placeholder implementations shown:
  fetchCurrentCustomerClient: async (userId) => {
    // Implement based on your API
  },

  updateCustomerPhone: async (userId, phone) => {
    // Implement based on your API
    return false;
  },

  updateCurrentCustomerClient: async (updates) => {
    // Implement based on your API
    return false;
  },
}));

// Selectors
export const selectAllClients = (state: ClientState) => state.clients;