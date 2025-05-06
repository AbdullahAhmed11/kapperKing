import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'stylist' | 'assistant';
  services: string[];
  active: boolean;
}

interface StaffStore {
  staff: StaffMember[];
  loading: boolean;
  error: string | null;
  fetchStaff: () => Promise<void>;
  createStaff: (staff: Omit<StaffMember, 'id'>) => Promise<void>;
  updateStaff: (id: string, updates: Partial<StaffMember>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  searchStaff: (query: string) => Promise<void>;
}

export const useStaffStore = create<StaffStore>((set) => ({
  staff: [],
  loading: false,
  error: null,

  fetchStaff: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('staff')
        .select(`
          *,
          staff_services (
            service_id
          )
        `)
        .eq('active', true)
        .order('first_name', { ascending: true });

      if (error) throw error;

      // Transform the data to match our StaffMember interface
      const transformedData = data.map(staff => ({
        id: staff.id,
        firstName: staff.first_name,
        lastName: staff.last_name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        services: staff.staff_services.map((ss: any) => ss.service_id),
        active: staff.active
      }));

      set({ staff: transformedData });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to fetch staff');
    } finally {
      set({ loading: false });
    }
  },

  createStaff: async (staffData) => {
    try {
      set({ loading: true, error: null });
      
      // First create the staff member
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .insert({
          first_name: staffData.firstName,
          last_name: staffData.lastName,
          email: staffData.email,
          phone: staffData.phone,
          role: staffData.role,
          active: staffData.active
        })
        .select()
        .single();

      if (staffError) throw staffError;

      // Then create the service associations
      const serviceAssociations = staffData.services.map(serviceId => ({
        staff_id: staff.id,
        service_id: serviceId
      }));

      const { error: servicesError } = await supabase
        .from('staff_services')
        .insert(serviceAssociations);

      if (servicesError) throw servicesError;

      // Fetch the updated staff list
      await set().fetchStaff();

      toast.success('Staff member created successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to create staff member');
    } finally {
      set({ loading: false });
    }
  },

  updateStaff: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      
      // Update the staff details
      const { error: staffError } = await supabase
        .from('staff')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          email: updates.email,
          phone: updates.phone,
          role: updates.role,
          active: updates.active
        })
        .eq('id', id);

      if (staffError) throw staffError;

      // If services were updated, update the associations
      if (updates.services) {
        // First delete existing associations
        const { error: deleteError } = await supabase
          .from('staff_services')
          .delete()
          .eq('staff_id', id);

        if (deleteError) throw deleteError;

        // Then create new associations
        const serviceAssociations = updates.services.map(serviceId => ({
          staff_id: id,
          service_id: serviceId
        }));

        const { error: servicesError } = await supabase
          .from('staff_services')
          .insert(serviceAssociations);

        if (servicesError) throw servicesError;
      }

      // Fetch the updated staff list
      await set().fetchStaff();

      toast.success('Staff member updated successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to update staff member');
    } finally {
      set({ loading: false });
    }
  },

  deleteStaff: async (id) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        staff: state.staff.filter(staff => staff.id !== id)
      }));

      toast.success('Staff member deleted successfully');
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to delete staff member');
    } finally {
      set({ loading: false });
    }
  },

  searchStaff: async (query) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('staff')
        .select(`
          *,
          staff_services (
            service_id
          )
        `)
        .eq('active', true)
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('first_name', { ascending: true });

      if (error) throw error;

      // Transform the data to match our StaffMember interface
      const transformedData = data.map(staff => ({
        id: staff.id,
        firstName: staff.first_name,
        lastName: staff.last_name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        services: staff.staff_services.map((ss: any) => ss.service_id),
        active: staff.active
      }));

      set({ staff: transformedData });
    } catch (error) {
      set({ error: (error as Error).message });
      toast.error('Failed to search staff');
    } finally {
      set({ loading: false });
    }
  }
}));