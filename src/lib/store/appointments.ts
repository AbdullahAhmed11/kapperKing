import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import { Service } from './services';
import { StaffMember } from './staff';
import { useLoyaltyStore } from './loyalty'; // Import loyalty store
import { Client } from './clients';

// Define Appointment structure (adjust based on your DB schema)
// Define nested object types expected by UI components
interface AppointmentClient {
   id: string;
   firstName: string; // Use camelCase matching UI expectations
   lastName: string;
}
interface AppointmentService {
   id: string;
   name: string;
   duration: number;
   price: number;
}
interface AppointmentStaff {
   id: string;
   firstName: string;
   lastName: string;
}

export interface Appointment {
  id: string;
  salon_id: string;
  client_id: string;
  staff_id: string;
  service_id: string;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  notes?: string;
  created_at: string;
  // Use non-optional nested objects with specific fields
  client: AppointmentClient;
  service: AppointmentService;
  staff: AppointmentStaff;
}

interface AppointmentStore {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  fetchAppointments: (salonId: string, date: Date) => Promise<void>; // Fetch for day/salon (dashboard view)
  fetchAppointmentsByClientId: (clientId: string) => Promise<void>; // Fetch all for a client (profile view)
  createAppointment: (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'clients' | 'services' | 'staff'>) => Promise<boolean>; // Returns true on success
  updateAppointmentStatus: (appointmentId: string, status: Appointment['status']) => Promise<boolean>; // Returns true on success
  deleteAppointment: (id: string) => Promise<boolean>; // Returns true on success
}

export const useAppointmentStore = create<AppointmentStore>((set, get) => ({
  appointments: [],
  loading: false,
  error: null,

  fetchAppointments: async (salonId, date) => {
    if (!salonId) return;
    try {
      set({ loading: true, error: null });

      // Calculate start and end of the selected day
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      // Fetch appointments for the given salon and date range
      // Join with related tables to get names etc.
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          clients!inner( id, first_name, last_name ),
          services ( id, name, duration, price ),
          staff ( id, first_name, last_name )
        `)
        .eq('salon_id', salonId)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Transform the data to match our Appointment interface
      const transformedData = data?.map((app: any) => ({
         id: app.id,
         salon_id: app.salon_id,
         client_id: app.client_id,
         staff_id: app.staff_id,
         service_id: app.service_id,
         start_time: app.start_time,
         end_time: app.end_time,
         status: app.status,
         notes: app.notes,
         created_at: app.created_at,
         // Map nested objects
         client: {
            id: app.clients?.id || '', // Use joined table name 'clients'
            firstName: app.clients?.first_name || 'Unknown', // Map snake_case
            lastName: app.clients?.last_name || 'Client',
         },
         service: {
            id: app.services?.id || '', // Use joined table name 'services'
            name: app.services?.name || 'Unknown Service',
            duration: app.services?.duration || 0,
            price: app.services?.price || 0,
         },
         staff: {
            id: app.staff?.id || '', // Use joined table name 'staff'
            firstName: app.staff?.first_name || 'Unknown',
            lastName: app.staff?.last_name || 'Staff',
         },
      })) || [];

      set({ appointments: transformedData });
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      set({ error: `Failed to fetch appointments: ${error.message}` });
      toast.error('Failed to fetch appointments');
    } finally {
      set({ loading: false });
    }
  },

  createAppointment: async (appointmentData) => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();

      if (error) throw error;

      // Don't add directly, refetch instead to get joined data
      // set(state => ({
      //   appointments: [...state.appointments, data].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      // }));
      // Refetch appointments for the day the new one was added
      get().fetchAppointments(appointmentData.salon_id, new Date(appointmentData.start_time));

      toast.success('Appointment created successfully');
      return true; // Indicate success
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      set({ error: `Failed to create appointment: ${error.message}` });
      toast.error(`Failed to create appointment: ${error.message}`);
      return false; // Indicate failure
    } finally {
      set({ loading: false });
    }
  },

  fetchAppointmentsByClientId: async (clientId) => {
     if (!clientId) {
        set({ appointments: [], loading: false, error: 'Client ID required.' });
        return;
     }
     set({ loading: true, error: null });
     try {
       // Fetch appointments for the client, joining related data
       // Order by start_time descending for history view
       const { data, error } = await supabase
         .from('appointments')
         .select(`
            *,
            clients!inner( id, first_name, last_name ),
            services ( id, name, duration ),
            staff ( id, first_name, last_name )
         `)
         .eq('client_id', clientId)
         .order('start_time', { ascending: false }); // Fetch all history/upcoming

       if (error) throw error;
       // Transform data to match the new Appointment interface
       const transformedData = data?.map((app: any) => ({
          id: app.id,
          salon_id: app.salon_id,
          client_id: app.client_id,
          staff_id: app.staff_id,
          service_id: app.service_id,
          start_time: app.start_time,
          end_time: app.end_time,
          status: app.status,
          notes: app.notes,
          created_at: app.created_at,
          // Map nested objects
          client: {
             id: app.clients?.id || '', // Use joined table name 'clients'
             firstName: app.clients?.first_name || 'Unknown', // Map snake_case
             lastName: app.clients?.last_name || 'Client',
          },
          service: {
             id: app.services?.id || '', // Use joined table name 'services'
             name: app.services?.name || 'Unknown Service',
             duration: app.services?.duration || 0,
             price: app.services?.price || 0,
          },
          staff: {
             id: app.staff?.id || '', // Use joined table name 'staff'
             firstName: app.staff?.first_name || 'Unknown',
             lastName: app.staff?.last_name || 'Staff',
          },
       })) || [];

       set({ appointments: transformedData });
     } catch (error: any) {
       console.error("Error fetching appointments:", error);
       set({ error: `Failed to fetch appointments: ${error.message}` });
       toast.error('Failed to fetch appointments');
     } finally {
       set({ loading: false });
     }
  },

  updateAppointmentStatus: async (appointmentId, status) => {
    try {
      // Find the appointment being updated to get client_id etc.
      const appointment = get().appointments.find(app => app.id === appointmentId);

      set(state => ({
        appointments: state.appointments.map(app => app.id === appointmentId ? { ...app, status } : app)
      }));

      const { error } = await supabase
        .from('appointments')
        .update({ status: status, updated_at: new Date().toISOString() })
        .eq('id', appointmentId);

      if (error) {
        toast.error(`Failed to update appointment status: ${error.message}`);
        return false; // Indicate failure
      }

      toast.success(`Appointment status updated to ${status}`);

      // --- Award Loyalty Points on Completion ---
      if (status === 'completed' && appointment?.client_id) {
         const pointsToAdd = 100; // Award 100 points per visit
         const reason = `Completed Appointment #${appointmentId.substring(0, 8)}`; 
         // Use the addPoints action from the loyalty store
         const loyaltyStore = useLoyaltyStore.getState(); 
         await loyaltyStore.addPoints(appointment.client_id, pointsToAdd, reason, undefined, appointmentId);
         // Error handling for addPoints is within the loyalty store action itself
      }
      // --- End Loyalty Points ---

      return true; // Indicate success of status update
    } catch (error: any) {
      console.error("Error updating appointment status:", error);
      // Ensure state is consistent, maybe refetch
      return false; // Indicate failure
    }
  },

  deleteAppointment: async (id) => {
    try {
      // Optimistic UI update
      set(state => ({
        appointments: state.appointments.filter(app => app.id !== id)
      }));

      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
         toast.error(`Failed to delete appointment: ${error.message}`);
         // Revert optimistic update if needed by refetching
         // get().fetchAppointments(salonId, date); // Need salonId and date here
         throw error;
      }

      toast.success('Appointment deleted successfully');
      return true; // Indicate success
    } catch (error: any) {
      console.error("Error deleting appointment:", error);
      // Ensure state is consistent, maybe refetch
      return false; // Indicate failure
    }
  },
}));

// Selectors
export const selectAllAppointments = (state: AppointmentStore) => state.appointments;