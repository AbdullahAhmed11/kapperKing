import { create } from 'zustand';
import { supabase } from '../supabase';
import { toast } from 'sonner';

// Define detailed Availability structure
export interface StaffAvailabilityOverride {
  date: string; // YYYY-MM-DD
  type: 'unavailable' | 'available';
  startTime?: string; // HH:mm (if type is available)
  endTime?: string; // HH:mm (if type is available)
}

// Define detailed Working Hours structure
export interface StaffWorkingHour {
  dayOfWeek: number; // 0 (Sun) to 6 (Sat)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

// Define the single source of truth for StaffMember
export interface StaffMember { 
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'stylist' | 'assistant';
  services: string[]; // Array of service IDs
  active: boolean;
  salonId: string; 
  // Use detailed types, make optional as they might not always be fetched/present
  availability?: StaffAvailabilityOverride[] | null; 
  working_hours?: StaffWorkingHour[] | null; 
  // Add other fields if needed by microsite/dashboard
  imageUrl?: string; 
  title?: string; 
  bio?: string; 
}

interface StaffStore {
  staff: StaffMember[];
  loading: boolean;
  error: string | null;
  fetchStaff: (salonId: string) => Promise<void>;
  // Ensure create/update payloads match the DB schema (availability/working_hours might be JSONB)
  createStaff: (staff: Omit<StaffMember, 'id'>) => Promise<boolean>; // Return boolean
  updateStaff: (id: string, updates: Partial<Omit<StaffMember, 'id' | 'salonId'>>) => Promise<boolean>; // Return boolean
  deleteStaff: (id: string) => Promise<boolean>; // Return boolean
  // Removed unused searchStaff signature
}

export const useStaffStore = create<StaffStore>((set, get) => ({ // Re-added 'get'
  staff: [],
  loading: false,
  error: null,

  fetchStaff: async (salonId) => {
    const demoSalonId = 'demo-salon-id-999'; 
    if (!salonId) { set({ staff: [], loading: false, error: 'Salon ID required.' }); return; }
    if (salonId === demoSalonId) { set({ staff: [], loading: false, error: null }); return; } // Empty for demo

    try {
      set({ loading: true, error: null });
      // Fetch staff including availability/working_hours and join service IDs
      const { data, error } = await supabase
        .from('staff')
        .select(`
          id, first_name, last_name, email, phone, role, active, salon_id, 
          availability, working_hours, image_url, title, bio, 
          staff_services ( service_id ) 
        `) 
        .eq('salon_id', salonId) // Use correct DB column name
        .eq('active', true) // Fetch only active staff by default? Adjust if needed
        .order('first_name', { ascending: true }); // Corrected sort column to DB name

      if (error) throw error;

      // Transform the data to match StaffMember interface
      const transformedData = data?.map(s => ({
        id: s.id,
        firstName: s.first_name,
        lastName: s.last_name,
        email: s.email,
        phone: s.phone,
        role: s.role,
        services: s.staff_services?.map((ss: { service_id: string }) => ss.service_id) || [], 
        active: s.active,
        salonId: s.salon_id, 
        availability: s.availability || null, // Handle potential null from DB
        working_hours: s.working_hours || null, // Handle potential null from DB
        imageUrl: s.image_url,
        title: s.title,
        bio: s.bio,
      })) || [];
      set({ staff: transformedData });
    } catch (error: any) {
      set({ error: error.message });
      toast.error('Failed to fetch staff');
    } finally {
      set({ loading: false });
    }
  },

  createStaff: async (staffData) => {
     set({ loading: true });
     try {
        // Separate services from main staff data
        const { services, ...staffPayloadDb } = staffData;
        // Map frontend names to DB names if necessary (e.g., firstName -> first_name)
        const dbStaffData = {
           ...staffPayloadDb,
           first_name: staffPayloadDb.firstName,
           last_name: staffPayloadDb.lastName,
           salon_id: staffPayloadDb.salonId, // Explicitly map salonId to salon_id
           // Ensure availability/working_hours are formatted correctly for DB
        };
        delete (dbStaffData as any).firstName; // Remove frontend-specific names
        delete (dbStaffData as any).lastName;
        delete (dbStaffData as any).salonId; // Remove original salonId property

        // 1. Insert staff member
        const { data: newStaff, error: staffError } = await supabase
           .from('staff')
           .insert(dbStaffData)
           .select('id') // Only need the ID
           .single();

        if (staffError) throw staffError;
        if (!newStaff?.id) throw new Error("Failed to get new staff ID.");

        // 2. Insert into staff_services link table (Skip for demo salon to avoid FK errors)
        const demoSalonId = 'demo-salon-id-999';
        if (staffData.salonId !== demoSalonId && services && services.length > 0) {
           const serviceLinks = services.map(serviceId => ({
              staff_id: newStaff.id,
              service_id: serviceId,
              salon_id: staffData.salonId
           }));
           const { error: serviceLinkError } = await supabase
              .from('staff_services')
              .insert(serviceLinks);
           if (serviceLinkError) {
              console.error("Failed to link services to new staff:", serviceLinkError);
              toast.error("Staff created, but failed to link services.");
              // Note: Ideally, use a transaction or DB function to handle rollback
           }
        }
        
        toast.success("Staff member created successfully.");
        get().fetchStaff(staffData.salonId); // Refetch to update list
        return true;
     } catch (error: any) {
        toast.error(`Failed to create staff: ${error.message}`);
        set({ loading: false, error: error.message }); return false;
     } 
     // loading set to false in fetchStaff
  },

  updateStaff: async (id, updates) => {
     set({ loading: true });
     try {
        const { services, ...staffUpdatesDb } = updates;
         // Map frontend names to DB names
        const dbStaffUpdates = {
           ...staffUpdatesDb,
           first_name: staffUpdatesDb.firstName,
           last_name: staffUpdatesDb.lastName,
           // Ensure availability/working_hours are formatted correctly for DB
        };
        delete (dbStaffUpdates as any).firstName; 
        delete (dbStaffUpdates as any).lastName;

        // 1. Update staff table
        const { error: staffUpdateError } = await supabase
           .from('staff')
           .update(dbStaffUpdates)
           .eq('id', id);
        if (staffUpdateError) throw staffUpdateError;

        // 2. Update staff_services (delete existing, insert new)
        if (services !== undefined) { // Only update services if passed in updates
           // Delete existing links
           const { error: deleteError } = await supabase
              .from('staff_services')
              .delete()
              .eq('staff_id', id);
           if (deleteError) throw deleteError;

           // Insert new links
           if (services.length > 0) {
              const staffMember = get().staff.find((s: StaffMember) => s.id === id); // Added type
              const serviceLinks = services.map(serviceId => ({
                 staff_id: id,
                 service_id: serviceId,
                 salon_id: staffMember?.salonId // Include salon_id if needed
              }));
              const { error: insertError } = await supabase
                 .from('staff_services')
                 .insert(serviceLinks);
              if (insertError) throw insertError;
           }
        }

        toast.success("Staff member updated successfully.");
        const staffMember = get().staff.find((s: StaffMember) => s.id === id); // Added type
        if (staffMember?.salonId) get().fetchStaff(staffMember.salonId);
        return true;
     } catch (error: any) {
        toast.error(`Failed to update staff: ${error.message}`);
        set({ loading: false, error: error.message }); return false;
     }
  },

  deleteStaff: async (id) => {
     set({ loading: true });
     try {
        // Deleting staff should cascade delete staff_services due to FK constraint (if set up)
        const { error } = await supabase.from('staff').delete().eq('id', id);
        if (error) throw error;
        
        toast.success("Staff member deleted successfully.");
        // Refetch is tricky without salonId, maybe remove locally?
        set(state => ({ staff: state.staff.filter(s => s.id !== id) })); 
        return true;
     } catch (error: any) {
        toast.error(`Failed to delete staff: ${error.message}`);
        set({ loading: false, error: error.message }); return false;
     } finally {
        set({ loading: false }); // Ensure loading is reset even on local removal
     }
  },

}));

// Selectors
export const selectAllStaff = (state: StaffStore) => state.staff;