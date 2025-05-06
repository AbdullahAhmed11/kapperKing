import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';

interface BookingSettings {
  id: string;
  salonId: string;
  minAdvanceHours: number;
  maxAdvanceDays: number;
  bufferMinutes: number;
  cancellationHours: number;
  allowGuestBooking: boolean;
  requireDeposit: boolean;
  depositAmount: number;
  confirmationRequired: boolean;
}

interface BookingSlot {
  staffId: string;
  startTime: string;
  endTime: string;
}

interface BookingRequest {
  id: string;
  salonId: string;
  clientId?: string;
  serviceId: string;
  staffId: string;
  requestedDate: string;
  requestedTime: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  notes?: string;
  createdAt: string;
}

interface BookingStore {
  settings: BookingSettings | null;
  availableSlots: BookingSlot[];
  requests: BookingRequest[];
  loading: boolean;
  error: string | null;
  fetchSettings: (salonId: string) => Promise<void>;
  updateSettings: (salonId: string, settings: Partial<BookingSettings>) => Promise<void>;
  fetchAvailableSlots: (salonId: string, date: Date, serviceId: string) => Promise<void>;
  createBookingRequest: (
    salonId: string,
    serviceId: string,
    staffId: string,
    date: Date,
    time: string,
    clientId?: string,
    guestInfo?: {
      name: string;
      email: string;
      phone?: string;
    },
    notes?: string
  ) => Promise<void>;
  fetchBookingRequests: (salonId: string, status?: BookingRequest['status']) => Promise<void>;
  updateBookingRequest: (requestId: string, status: BookingRequest['status']) => Promise<void>;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  settings: null,
  availableSlots: [],
  requests: [],
  loading: false,
  error: null,

  fetchSettings: async (salonId) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('online_booking_settings')
        .select('*')
        .eq('salon_id', salonId)
        .single();

      if (error) throw error;

      set({ settings: data });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to fetch booking settings');
    } finally {
      set({ loading: false });
    }
  },

  updateSettings: async (salonId, settings) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('online_booking_settings')
        .upsert({
          salon_id: salonId,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      set({ settings: data });
      toast.success('Booking settings updated');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to update booking settings');
    } finally {
      set({ loading: false });
    }
  },

  fetchAvailableSlots: async (salonId, date, serviceId) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .rpc('calculate_available_slots', {
          p_salon_id: salonId,
          p_date: date.toISOString().split('T')[0],
          p_service_id: serviceId
        });

      if (error) throw error;

      set({ availableSlots: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to fetch available slots');
    } finally {
      set({ loading: false });
    }
  },

  createBookingRequest: async (salonId, serviceId, staffId, date, time, clientId, guestInfo, notes) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .rpc('create_booking_request', {
          p_salon_id: salonId,
          p_client_id: clientId,
          p_service_id: serviceId,
          p_staff_id: staffId,
          p_requested_date: date.toISOString().split('T')[0],
          p_requested_time: time,
          p_guest_name: guestInfo?.name,
          p_guest_email: guestInfo?.email,
          p_guest_phone: guestInfo?.phone,
          p_notes: notes
        });

      if (error) throw error;

      toast.success('Booking request created successfully');
      
      // Refresh booking requests
      await get().fetchBookingRequests(salonId);
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to create booking request');
    } finally {
      set({ loading: false });
    }
  },

  fetchBookingRequests: async (salonId, status) => {
    try {
      set({ loading: true, error: null });
      
      let query = supabase
        .from('booking_requests')
        .select('*')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      set({ requests: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to fetch booking requests');
    } finally {
      set({ loading: false });
    }
  },

  updateBookingRequest: async (requestId, status) => {
    try {
      set({ loading: true, error: null });
      
      if (status === 'confirmed') {
        const { data, error } = await supabase
          .rpc('confirm_booking_request', {
            p_request_id: requestId
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('booking_requests')
          .update({
            status,
            updated_at: new Date().toISOString()
          })
          .eq('id', requestId);

        if (error) throw error;
      }

      toast.success(`Booking request ${status}`);
      
      // Refresh booking requests for the salon
      const request = get().requests.find(r => r.id === requestId);
      if (request) {
        await get().fetchBookingRequests(request.salonId);
      }
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to update booking request');
    } finally {
      set({ loading: false });
    }
  }
}));