import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  salonId: string;
  clientId: string;
  serviceId: string;
  staffId: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  client?: {
    first_name: string;
    last_name: string;
  };
  service?: {
    name: string;
    duration: number;
    price: number;
  };
  staff?: {
    first_name: string;
    last_name: string;
  };
}

interface AppointmentStore {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  fetchAppointments: (salonId: string, date: Date) => Promise<void>;
  createAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
  confirmAppointment: (id: string) => Promise<void>;
  completeAppointment: (id: string) => Promise<void>;
}

export const useAppointmentStore = create<AppointmentStore>((set, get) => ({
  appointments: [],
  loading: false,
  error: null,

  fetchAppointments: async (salonId: string, date: Date) => {
    try {
      set({ loading: true, error: null });
      
      const startOfDay = format(date, 'yyyy-MM-dd 00:00:00');
      const endOfDay = format(date, 'yyyy-MM-dd 23:59:59');

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          client:clients(first_name, last_name),
          service:services(name, duration, price),
          staff:staff(first_name, last_name)
        `)
        .eq('salon_id', salonId)
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .order('start_time', { ascending: true });

      if (error) throw error;

      set({ appointments: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to fetch appointments');
    } finally {
      set({ loading: false });
    }
  },

  createAppointment: async (appointment) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        appointments: [...state.appointments, data],
      }));

      toast.success('Appointment created successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to create appointment');
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateAppointment: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        appointments: state.appointments.map((app) =>
          app.id === id ? { ...app, ...data } : app
        ),
      }));

      toast.success('Appointment updated successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to update appointment');
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  cancelAppointment: async (id) => {
    try {
      await get().updateAppointment(id, { status: 'cancelled' });
      toast.success('Appointment cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel appointment');
      throw error;
    }
  },

  confirmAppointment: async (id) => {
    try {
      await get().updateAppointment(id, { status: 'confirmed' });
      toast.success('Appointment confirmed successfully');
    } catch (error) {
      toast.error('Failed to confirm appointment');
      throw error;
    }
  },

  completeAppointment: async (id) => {
    try {
      await get().updateAppointment(id, { status: 'completed' });
      toast.success('Appointment completed successfully');
    } catch (error) {
      toast.error('Failed to complete appointment');
      throw error;
    }
  },
}));