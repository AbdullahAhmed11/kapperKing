import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, MessageSquare, Users, ArrowUpRight, Edit2, Trash2, Send, Loader2, AlertCircle } from 'lucide-react'; // Added icons
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge'; // Import Badge
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Import Table
import { useCampaignStore, Campaign, CampaignFormData } from '@/lib/store/campaigns'; // Import store and types
import { useCurrentSalonStore } from '@/lib/store/currentSalon'; // Import salon store
import { SalonCampaignForm } from '@/components/salon/forms/SalonCampaignForm'; // Import the new form
import { format } from 'date-fns'; // Import format
import { toast } from 'sonner'; // Import toast
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie'; 

interface Campaign {
  id: number;
  name: string;
  body: string;
  email: string;
  isHtml: boolean;
  type: string;
  status: string;
  sentAt: string;
}
type JwtPayload = {
  Id: number; // adjust this to match your token's structure
  email?: string;
  name?: string;
  FirstName?: string;
  LastName?: string;
  // any other fields you expect
};
function Marketing() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [sendingCampaignId, setSendingCampaignId] = useState<number | null>(null);
 const token = Cookies.get('salonUser');
  
  const decoded = token ? jwtDecode<JwtPayload>(token) : undefined;
 
  // Fetch campaigns from API
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://kapperking.runasp.net/api/Salons/GetSalonCampaings?salonId=${decoded?.Id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setCampaigns(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
        toast.error('Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleAddNew = () => {
    setEditingCampaign(null);
    setShowCampaignForm(true);
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowCampaignForm(true);
  };

  // const handleDelete = async (campaign: Campaign) => {
  //   if (window.confirm(`Are you sure you want to delete the "${campaign.name}" campaign?`)) {
  //     try {
  //       // Add your delete API call here
  //       toast.success(`Campaign "${campaign.name}" deleted`);
  //       setCampaigns(campaigns.filter(c => c.id !== campaign.id));
  //     } catch (err) {
  //       toast.error('Failed to delete campaign');
  //     }
  //   }
  // };
const handleDelete = async (campaign: Campaign) => {
  if (window.confirm(`Are you sure you want to delete the "${campaign.name}" campaign?`)) {
    try {
      const response = await fetch(`https://kapperking.runasp.net/api/Salons/DeleteSalonCampign?campaignId=${campaign.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success(`Campaign "${campaign.name}" deleted`);
      setCampaigns(campaigns.filter(c => c.id !== campaign.id));
    } catch (err) {
      toast.error('Failed to delete campaign');
      console.error(err);
    }
  }
};

//   const handleFormSubmit = async (data: CampaignFormData) => {
//   try {
//     const token = Cookies.get('salonUser');
//     const decoded = token ? jwtDecode<JwtPayload>(token) : undefined;
//     const salonId = decoded?.Id;

//     const payload = {
//       name: data.name,
//       body: data.content,
//       email: data.subject, // or another field if this is not correct
//       isHtml: true,
//       type: "Email",
//       status: "Sent",
//       toAll: data.target_type === 'all_clients',
//       emails: data.target_type === 'specific_clients' ? data.selectedClientIds : [],
//       salonId: salonId
//     };

//     const response = await fetch('https://kapperking.runasp.net/api/Salons/AddSalonCampain', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(payload)
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     toast.success('Campaign created successfully');
//     setShowCampaignForm(false);
    
//     // Refetch the campaigns after creation
//     const refreshed = await fetch(`https://kapperking.runasp.net/api/Salons/GetSalonCampaings?salonId=${salonId}`);
//     const newCampaigns = await refreshed.json();
//     setCampaigns(newCampaigns);
//   } catch (err) {
//     toast.error('Failed to create campaign');
//     console.error(err);
//   }
// };
const handleFormSubmit = async (data: CampaignFormData) => {
  try {
    const token = Cookies.get('salonUser');
    const decoded = token ? jwtDecode<JwtPayload>(token) : undefined;
    const salonId = decoded?.Id;

    if (!salonId) {
      toast.error('Invalid salon session');
      return;
    }

    // If editing
    if (editingCampaign) {
      const payload = {
        salonId,
        campaignId: editingCampaign.id,
        name: data.name,
        body: data.content,
        email: data.subject,
        isHtml: true
      };

      const response = await fetch('https://kapperking.runasp.net/api/Salons/EditSalonCampaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success('Campaign updated successfully');
    } else {
      // Create new campaign
      const payload = {
        name: data.name,
        body: data.content,
        email: data.subject,
        isHtml: true,
        type: "Email",
        status: "Sent",
        toAll: data.target_type === 'all_clients',
        emails: data.target_type === 'specific_clients' ? data.selectedClientIds : [],
        salonId
      };

      const response = await fetch('https://kapperking.runasp.net/api/Salons/AddSalonCampain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success('Campaign created successfully');
    }

    setShowCampaignForm(false);

    // Refetch updated campaigns list
    const refreshed = await fetch(`https://kapperking.runasp.net/api/Salons/GetSalonCampaings?salonId=${salonId}`);
    const newCampaigns = await refreshed.json();
    setCampaigns(newCampaigns);
  } catch (err) {
    toast.error('Failed to submit campaign');
    console.error(err);
  }
};

  const handleSend = async (campaign: Campaign) => {
    if (campaign.status !== 'Draft') {
      toast.info("Only draft campaigns can be sent.");
      return;
    }
    
    if (window.confirm(`Are you sure you want to send the "${campaign.name}" campaign?`)) {
      setSendingCampaignId(campaign.id);
      try {
        // Add your send API call here
        toast.success(`Campaign "${campaign.name}" sent successfully`);
        // Update local state to reflect sent status
        setCampaigns(campaigns.map(c => 
          c.id === campaign.id ? { ...c, status: 'Sent', sentAt: new Date().toISOString() } : c
        ));
      } catch (err) {
        toast.error('Failed to send campaign');
      } finally {
        setSendingCampaignId(null);
      }
    }
  };

  const filteredCampaigns = campaigns.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalSubscribers = 0; // You would fetch this from another endpoint
  const activeCampaigns = campaigns.filter(c => c.status === 'Sending' || c.status === 'Scheduled').length;

  if (loading && campaigns.length === 0) {
    return <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (error) {
    return <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">Error loading marketing data: {error}</div>;
  }
  return (
    <div className="space-y-6">
  <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Marketing</h1>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Marketing Stats */}
      {/* <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <dt className="text-sm font-medium text-gray-500 truncate flex items-center">
            <Mail className="h-5 w-5 mr-2"/>Total Subscribers
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalSubscribers}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
          <dt className="text-sm font-medium text-gray-500 truncate flex items-center">
            <MessageSquare className="h-5 w-5 mr-2"/>Active Campaigns
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{activeCampaigns}</dd>
        </div>
      </div> */}

      {/* Campaigns List */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative flex-1 max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && campaigns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      Loading campaigns...
                    </TableCell>
                  </TableRow>
                )}
                {!loading && filteredCampaigns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                      No campaigns found
                    </TableCell>
                  </TableRow>
                )}
                {filteredCampaigns.map((campaign) => {
                  const isSending = sendingCampaignId === campaign.id;
                  const canSend = campaign.status === 'Draft';

                  return (
                    <TableRow key={campaign.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={campaign.type === 'Email' ? 'default' : 'secondary'}>
                          {campaign.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          campaign.status === 'Sent' ? 'default' :
                          campaign.status === 'Draft' ? 'outline' :
                          campaign.status === 'Scheduled' ? 'secondary' :
                          campaign.status === 'Sending' ? 'secondary' :
                          campaign.status === 'Failed' ? 'destructive' :
                          'secondary'
                        }>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {campaign.email}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {campaign.sentAt ? format(new Date(campaign.sentAt), 'PPpp') : 'Not sent'}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(campaign)} disabled={isSending} title="Edit">
                          <Edit2 className="h-4 w-4"/>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleSend(campaign)} disabled={isSending || !canSend} title={canSend ? "Send" : `Cannot send (status: ${campaign.status})`}>
                          {/* {isSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>} */}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(campaign)} disabled={isSending} title="Delete">
                          <Trash2 className="h-4 w-4"/>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <SalonCampaignForm
         salonId={decoded?.Id ? String(decoded.Id) : ''}
         open={showCampaignForm}
         onClose={() => setShowCampaignForm(false)}
         onSubmit={handleFormSubmit}
         initialData={
           editingCampaign
             ? {
                 ...editingCampaign,
                 salon_id: decoded?.Id ?? '', // or the correct salon id
                 content: editingCampaign.body,
                 target_type: 'all_clients', // or map appropriately
                 created_at: editingCampaign.sentAt || new Date().toISOString(),
                 updated_at: new Date().toISOString(),
               }
             : null
         }
      />
    </div>
  );
}

export default Marketing;