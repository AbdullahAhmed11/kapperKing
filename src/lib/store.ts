import { create } from 'zustand';

interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  staffId: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  lastVisit?: string;
  totalVisits: number;
  preferredService?: string;
  loyaltyPoints: number;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
  category: string;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'stylist' | 'assistant';
  services: string[];
  schedule: {
    [key: string]: {
      start: string;
      end: string;
      breaks?: { start: string; end: string }[];
    };
  };
}

interface StoreState {
  appointments: Appointment[];
  clients: Client[];
  services: Service[];
  staff: Staff[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  appointments: [],
  clients: [],
  services: [],
  staff: [],
  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),
  addAppointment: (appointment) =>
    set((state) => ({ appointments: [...state.appointments, appointment] })),
  updateAppointment: (id, appointment) =>
    set((state) => ({
      appointments: state.appointments.map((app) =>
        app.id === id ? { ...app, ...appointment } : app
      ),
    })),
  deleteAppointment: (id) =>
    set((state) => ({
      appointments: state.appointments.filter((app) => app.id !== id),
    })),
  addClient: (client) =>
    set((state) => ({ clients: [...state.clients, client] })),
  updateClient: (id, client) =>
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === id ? { ...c, ...client } : c
      ),
    })),
  deleteClient: (id) =>
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id),
    })),
}));