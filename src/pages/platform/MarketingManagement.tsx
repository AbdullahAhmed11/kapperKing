import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Mail, MessageSquare, BarChart2, Send } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCampaignStore, selectAllCampaigns, Campaign, CampaignFormData } from '@/lib/store/campaigns'; 
import { useSubscriberStore, selectSubscriberCount, selectAllSubscribers, Subscriber } from '@/lib/store/subscribers'; 
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
  const deleteCampaign = useCampaignStore((state) => state.deleteCampaign);

  const sentCampaigns = campaigns.filter(c => c.status === 'sent');
  const totalOpened = sentCampaigns.reduce((sum, c) => sum + (c.stats?.opened ?? 0), 0);
  const totalSent = sentCampaigns.reduce((sum, c) => sum + (c.stats?.sent ?? 0), 0);
  const totalClicked = sentCampaigns.reduce((sum, c) => sum + (c.stats?.clicked ?? 0), 0);

  const averageOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
  const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the "${name}" campaign?`)) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/DeleteCampign?campaignId=${id}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        toast.success(`Campaign "${name}" deleted successfully`);
        fetchCampaigns();
      } catch (err) {
        toast.error('Failed to delete campaign');
        console.error('Delete error:', err);
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
        const res = await axios.post(`${API_BASE_URL}/SendMessageToSubscribers`, {
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

  const handleCampaignSubmit = async (data: CampaignFormData) => {
    if (editingCampaign) {
      updateCampaign(editingCampaign.id, data);
      setEditingCampaign(null);
    } else {
      addCampaign(8, data);
      await fetchCampaigns();
    }
    setShowCampaignForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Marketing Management</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage marketing campaigns and subscribers</p>
        </div>
        {/* Only show "New Campaign" button when on campaigns tab */}
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
                      <td className="px-6 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendEmail(campaign.id, campaign.name)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Send Email
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
        key={editingCampaign?.id || 'new'}
        open={showCampaignForm}
        onClose={() => {
          setShowCampaignForm(false);
          setEditingCampaign(null);
        }}
        onSubmit={handleCampaignSubmit}
        initialData={editingCampaign}
      />
    </div>
  );
}