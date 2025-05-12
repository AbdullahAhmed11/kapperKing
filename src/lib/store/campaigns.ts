import { create } from 'zustand';
import { supabase } from '../supabase'; // Import supabase
import { toast } from 'sonner';
import { Client } from './clients'; // Import Client type for targeting

// Define types based on DB schema
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'archived';
export type CampaignType = 'email'; // | 'sms';
export type CampaignTargetType = 'all_clients' | 'specific_clients' | 'manual_list';

export interface Campaign {
  id: string;
  salon_id: string;
  name: string;
  subject?: string; // Nullable for non-email types potentially
  content: string; 
  type: CampaignType;
  status: CampaignStatus;
  target_type: CampaignTargetType;
  manual_recipients?: string | null; 
  scheduled_at?: string | null;
  sent_at?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  // Stats
  stat_sent?: number | null;
  stat_opened?: number | null;
  stat_clicked?: number | null;
}

// Form data type (might differ slightly from DB model)
export type CampaignFormData = {
  name: string;
  subject: string; // Keep required for email form
  content: string;
  target_type: CampaignTargetType;
  // Targeting details might be handled differently in form state vs. DB
  // e.g., form might hold array of client IDs, DB might store criteria or list
  selectedClientIds?: string[]; // Example for specific_clients
  manualRecipientList?: string; // Example for manual_list
  // scheduleDate?: string; // Optional: For scheduling
  // scheduleTime?: string; // Optional: For scheduling
};

interface CampaignState {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  fetchCampaigns: (salonId: string) => Promise<void>;
  addCampaign: (salonId: string, formData: CampaignFormData) => Promise<Campaign | null>;
  updateCampaign: (campaignId: string, formData: Partial<CampaignFormData>) => Promise<boolean>;
  deleteCampaign: (campaignId: string) => Promise<boolean>;
  sendCampaign: (campaignId: string) => Promise<boolean>; // Simplified send action
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  loading: false,
  error: null,

  fetchCampaigns: async (salonId) => {
    const demoSalonId = 'demo-salon-id-999'; // Consistent demo ID
    if (!salonId) return;

    // --- DEMO SALON HANDLING ---
    if (salonId === demoSalonId) {
       console.log("Using demo campaign data.");
       const demoCampaigns: Campaign[] = [
          { id: 'camp1', salon_id: demoSalonId, name: 'Demo Spring Promo', subject: 'Spring Savings!', content: '<p>Demo Content</p>', type: 'email', status: 'sent', target_type: 'all_clients', created_at: new Date(Date.now() - 5*24*60*60*1000).toISOString(), updated_at: new Date(Date.now() - 4*24*60*60*1000).toISOString(), sent_at: new Date(Date.now() - 4*24*60*60*1000).toISOString(), stat_sent: 150, stat_opened: 100, stat_clicked: 20 },
          { id: 'camp2', salon_id: demoSalonId, name: 'Demo Draft Campaign', subject: 'Coming Soon', content: '<p>Draft...</p>', type: 'email', status: 'draft', target_type: 'specific_clients', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
       ];
       set({ campaigns: demoCampaigns, loading: false, error: null });
       return;
    }
    // --- END DEMO SALON HANDLING ---
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false }); // Show newest first
      if (error) throw error;
      set({ campaigns: data || [] });
    } catch (error: any) {
      toast.error(`Failed to fetch campaigns: ${error.message}`);
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

//   addCampaign: async (salonId, formData) => {
//      set({ loading: true });
//      try {
//         const dbPayload = {
//            salon_id: salonId,
//            name: formData.name,
//            subject: formData.subject,
//            content: formData.content,
//            type: 'email' as CampaignType, // Default to email for now
//            status: 'draft' as CampaignStatus,
//            target_type: formData.target_type,
//            manual_recipients: formData.target_type === 'manual_list' ? formData.manualRecipientList : null,
//            // TODO: Handle specific_clients targeting (might need separate table or JSON criteria)
//            // TODO: Handle scheduling (set scheduled_at)
//         };

//         const { data: newCampaign, error } = await supabase
//            .from('campaigns')
//            .insert(dbPayload)
//            .select()
//            .single();

//         if (error) throw error;
//         set(state => ({ campaigns: [newCampaign, ...state.campaigns] })); // Add to top
//         toast.success(`Campaign "${newCampaign.name}" created as draft.`);
//         set({ loading: false });
//         return newCampaign;
//      } catch (error: any) {
//         toast.error(`Failed to create campaign: ${error.message}`);
//         set({ loading: false, error: error.message }); 
//         return null;
//      }
//   },
addCampaign: async (salonId, formData) => {
  set({ loading: true });
  try {
    // Map your form data to the API's expected format
    const apiPayload = {
      name: formData.name,
      body: formData.content,
      email: "salon@example.com", // Replace with actual salon email
      isHtml: true,
      type: "Email",
      status: "Draft", // Start as draft instead of sent
      // toAll: formData.target_type === 'all_clients',
      emails:[ "salon@example.com"]
    };

    const response = await fetch('https://kapperking.runasp.net/api/SuperAdmin/AddCampain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add if needed: 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(apiPayload)
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || `API error: ${response.statusText}`);
    }

    // Debugging: Log the full response
    console.log('API Response:', responseData);

    // Ensure we have a valid response
    if (!responseData) {
      throw new Error('Empty response from server');
    }

    // Transform the API response to match your Campaign type
    const transformedCampaign: Campaign = {
      id: responseData.id || `temp-${Date.now()}`,
      salon_id: salonId,
      name: responseData.name || formData.name,
      subject: formData.subject || '',
      content: responseData.body || formData.content,
      type: 'email',
      status: (responseData.status?.toLowerCase() || 'draft') as CampaignStatus,
      target_type: responseData.toAll ? 'all_clients' : 
                 responseData.emails?.length ? 'manual_list' : 'specific_clients',
      manual_recipients: responseData.emails?.join(','),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Set default values for optional fields
      stat_sent: 0,
      stat_opened: 0,
      stat_clicked: 0
    };

    set(state => ({ campaigns: [transformedCampaign, ...state.campaigns] }));
    toast.success(`Campaign "${transformedCampaign.name}" created successfully.`);
    return transformedCampaign;
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to create campaign';
    console.error('Campaign creation error:', error);
    toast.error(errorMessage);
    set({ error: errorMessage });
    return null;
  } finally {
    set({ loading: false });
  }
},
  updateCampaign: async (campaignId, formData) => {
     set({ loading: true });
     try {
        // Map partial form data to DB schema
        const dbUpdates: Partial<Campaign> = { ...formData };
        if (formData.target_type === 'manual_list') {
           dbUpdates.manual_recipients = formData.manualRecipientList;
        } else {
           dbUpdates.manual_recipients = null; // Clear if not manual
        }
        // Remove form-specific fields not in DB
        delete (dbUpdates as any).selectedClientIds; 
        delete (dbUpdates as any).manualRecipientList;

        const { data, error } = await supabase
           .from('campaigns')
           .update(dbUpdates)
           .eq('id', campaignId)
           .select()
           .single();

        if (error) throw error;
        set(state => ({ 
           campaigns: state.campaigns.map(c => c.id === campaignId ? data : c) 
        }));
        toast.success(`Campaign updated.`);
        set({ loading: false });
        return true;
     } catch (error: any) {
        toast.error(`Failed to update campaign: ${error.message}`);
        set({ loading: false, error: error.message }); 
        return false;
     }
  },

  deleteCampaign: async (campaignId) => {
     set({ loading: true });
     try {
        const { error } = await supabase.from('campaigns').delete().eq('id', campaignId);
        if (error) throw error;
        set(state => ({ campaigns: state.campaigns.filter(c => c.id !== campaignId) }));
        toast.success(`Campaign deleted.`);
        set({ loading: false });
        return true;
     } catch (error: any) {
        toast.error(`Failed to delete campaign: ${error.message}`);
        set({ loading: false, error: error.message }); 
        return false;
     }
  },

  // Placeholder for sending logic - requires significant backend work
  sendCampaign: async (campaignId) => {
     set({ loading: true });
     const campaign = get().campaigns.find(c => c.id === campaignId);
     if (!campaign) {
        toast.error("Campaign not found.");
        set({ loading: false });
        return false;
     }
     if (campaign.status !== 'draft' && campaign.status !== 'failed') {
         toast.info(`Campaign cannot be sent (status: ${campaign.status})`); // Use toast.info
         set({ loading: false });
         return false;
     }

     console.log(`TODO: Implement sendCampaign backend logic for campaign ${campaignId}`);
     // 1. Fetch target recipients based on campaign.target_type
     //    - 'all_clients': Fetch all clients for campaign.salon_id with marketingConsent=true
     //    - 'specific_clients': Fetch clients based on stored criteria/IDs
     //    - 'manual_list': Parse campaign.manual_recipients
     // 2. Call a backend function ('send-campaign') passing campaign details and recipient list.
     // 3. Backend function iterates, sends emails via provider, updates campaign status ('sending' -> 'sent'/'failed'), logs stats.

     // Simulate sending
     await new Promise(resolve => setTimeout(resolve, 1500));
     set(state => ({
        campaigns: state.campaigns.map(c => c.id === campaignId ? { ...c, status: 'sent', sent_at: new Date().toISOString(), stat_sent: 100 } : c) // Simulate sent
     }));
     toast.success(`Campaign "${campaign.name}" sent (simulated).`);
     set({ loading: false });
     return true;
  },

}));

// Selectors
export const selectAllCampaigns = (state: CampaignState) => state.campaigns;