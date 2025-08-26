import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Send, Edit } from 'lucide-react'; // Added Edit icon

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCampaignStore, Campaign, CampaignFormData } from '@/lib/store/campaigns'; 
import { Subscriber } from '@/lib/store/subscribers'; 
import { toast } from 'sonner'; 
import { CampaignForm } from '@/components/platform/forms/CampaignForm'; 
import { SubscriberList } from '@/components/platform/marketing/SubscriberList'; 
import axios from 'axios';

const API_BASE_URL = 'https://kapperking.runasp.net/api/SuperAdmin';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

interface MyJwtPayload {
  Id?: string;
  Role?: string;
  [key: string]: any;
}

export default function MarketingManagement() {
  const navigate = useNavigate();
  const token = Cookies.get('salonUser');
  const decoded: MyJwtPayload | undefined = token ? jwtDecode<MyJwtPayload>(token) : undefined;

  useEffect(() => {
    if (!decoded?.Id || (decoded?.Role !== "SuperAdmin" && decoded?.Role !== "Admin")) {
      navigate('/login');
    }
  }, []);

  const [statics, setStatics] = useState<any>(null);
  const [staticsLoading, setStaticsLoading] = useState(true);
  const [allsubscribers, setAllSubscribers] = useState<Subscriber[]>([]);

  const getAllSubscribers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/GetSubscribers`);
      const data = res.data || [];
      setAllSubscribers(data);
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
      toast.error('Failed to fetch subscribers');
    }
  };

  useEffect(() => {
    getAllSubscribers();
  }, []);

  const getMarketingStatics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/GetMarketingStatics`);
      const data = await response.data;
      setStatics(data);
    } catch (error) {
      console.error('Error fetching marketing statistics:', error);
      toast.error('Failed to load marketing statistics');
    } finally {
      setStaticsLoading(false);
    }
  };

  useEffect(() => {
    getMarketingStatics();
  }, []);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/GetCampains`);
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      const data: Campaign[] = await response.json();
      const campaignsWithStats = data.map(campaign => ({
        ...campaign,
        stats: {
          opened: Math.floor(Math.random() * 1000),
          clicked: Math.floor(Math.random() * 100),
          sent: 1000,
          openRate: Math.random() * 100,
          clickRate: Math.random() * 10,
        },
      }));
      setCampaigns(campaignsWithStats);
    } catch (err) {
      toast.error('Failed to load campaigns');
      console.error('Error fetching campaigns:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'subscribers'>('campaigns');

  const addCampaign = useCampaignStore((state) => state.addCampaign);
  const updateCampaign = useCampaignStore((state) => state.updateCampaign);

  // ✅ updated delete function
// ✅ updated delete function using sonner toast
const handleDelete = async (id: string, name: string) => {
  if (window.confirm(`Are you sure you want to delete the "${name}" campaign?`)) {
    try {
      await axios.delete(`${API_BASE_URL}/DeleteCampign`, {
        params: { campaignId: id },
      });

      toast.success(`Campaign "${name}" deleted successfully ✅`);
      fetchCampaigns(); // refresh campaigns list
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || '❌ Failed to delete campaign');
    }
  }
};

  const handleSendEmail = async (campaignId: string, campaignName: string) => {
    if (allsubscribers.length === 0) {
      toast.error("No subscribers found.");
      return;
    }

    const emails = allsubscribers.map(sub => sub.email).filter(Boolean);

    const confirmed = window.confirm(`Send email for all subscribers for "${campaignName}"?`);

    if (confirmed) {
      try {
        await axios.post(`${API_BASE_URL}/SendMessageToSubscribers`, {
          campaignId: Number(campaignId),
          all: true,
          emails,
        });
        toast.success(`Campaign "${campaignName}" sent to all subscribers.`);
      } catch (err) {
        console.error(err);
        toast.error('Failed to send campaign.');
      }
    }
  };
 const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowCampaignForm(true);
  };
  // const handleCampaignSubmit = async (data: CampaignFormData) => {
  //   if (editingCampaign) {
  //     updateCampaign(editingCampaign.id, data);
  //     setEditingCampaign(null);
  //   } else {
  //     addCampaign(8, data);
  //     await fetchCampaigns();
  //   }
  //   setShowCampaignForm(false);
  // };
 const handleCampaignSubmit = async (data: CampaignFormData) => {
    if (editingCampaign) {
      // For editing, we're now using the API directly in CampaignForm
      // So we just need to refresh the list
      await fetchCampaigns();
      setEditingCampaign(null);
    } else {
      // For creating new campaign
      addCampaign(8, data);
      await fetchCampaigns();
    }
    setShowCampaignForm(false);
  };
  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Marketing Management</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage marketing campaigns and subscribers</p>
        </div>
        {activeTab === 'campaigns' && (
          <Button onClick={() => { setEditingCampaign(null); setShowCampaignForm(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        )}
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'campaigns'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Campaigns ({campaigns.length})
          </button>
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'subscribers'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Subscribers ({allsubscribers.length})
          </button>
        </nav>
      </div>

      {activeTab === 'campaigns' && (
        <div className="bg-white shadow rounded-lg border">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="relative flex-1 max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Campaign</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td className="px-6 py-4">{campaign.name}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendEmail(campaign.id, campaign.name)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Send Email
                        </Button>
                 <Button
  variant="destructive"
  size="sm"
  onClick={() => handleDelete(campaign.id, campaign.name)}
>
  <Trash2 className="h-4 w-4 mr-1" />
  Delete
</Button>

<Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(campaign)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'subscribers' && (
        <SubscriberList />
      )}

    <CampaignForm
  open={showCampaignForm}
  onClose={() => {
    setShowCampaignForm(false);
    setEditingCampaign(null);
  }}
  onSubmit={handleCampaignSubmit}
  initialData={editingCampaign}
  onEditSuccess={fetchCampaigns} // Refresh the campaigns list after edit
/>
    </div>
  );
}
