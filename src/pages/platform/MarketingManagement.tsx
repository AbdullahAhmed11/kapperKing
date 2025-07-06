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

export default function MarketingManagement() {
  const [statics, setStatics] = useState<any>(null); // State for stats
  const [staticsLoading, setStaticsLoading] = useState(true); // Loading state for stats

  const getMarktingStatics = async () => {
    try {
      const response = await axios.get(`https://kapperking.runasp.net/api/SuperAdmin/GetMarketingStatics`);
   
      const data = await response.data;
      setStatics(data);
    } catch (error) {
      console.error('Error fetching marketing statistics:', error);   
      toast.error('Failed to load marketing statistics');
    } finally {   
      setStaticsLoading(false); // Set loading to false after fetching
    }

  }

  useEffect(() => {
    getMarktingStatics()
  },[])

  const [campaigns, setCampaigns] = useState<any[]>([]); // Local state for campaigns
  const [isLoading, setIsLoading] = useState(true);
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/GetCampains`);
        if (!response.ok) {
          throw new Error('Failed to fetch campaigns');
        }
        const data: Campaign[] = await response.json();
        // Add mock stats for demonstration (replace with actual stats from API if available)
        const campaignsWithStats = data.map(campaign => ({
          ...campaign,
          stats: {
            opened: Math.floor(Math.random() * 1000),
            clicked: Math.floor(Math.random() * 100),
            sent: 1000,
            openRate: Math.random() * 100,
            clickRate: Math.random() * 10
          }
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
  const [activeTab, setActiveTab] = useState<'campaigns' | 'subscribers'>('campaigns'); // State for active tab

  // Get data and actions from stores
  // const campaigns = useCampaignStore(selectAllCampaigns);
  const addCampaign = useCampaignStore((state) => state.addCampaign); 
  const updateCampaign = useCampaignStore((state) => state.updateCampaign); 
  const deleteCampaign = useCampaignStore((state) => state.deleteCampaign);
  const subscriberCount = useSubscriberStore(selectSubscriberCount);
  const subscribers = useSubscriberStore(selectAllSubscribers); 
  const sendCampaign = useCampaignStore((state) => state.sendCampaign); 

  // TODO: Calculate real average open/click rates from campaign stats
  const sentCampaigns = campaigns.filter(c => c.status === 'sent');
  const totalOpened = sentCampaigns.reduce((sum, c) => sum + (c.stats?.opened ?? 0), 0);
  const totalSent = sentCampaigns.reduce((sum, c) => sum + (c.stats?.sent ?? 0), 0);
  const totalClicked = sentCampaigns.reduce((sum, c) => sum + (c.stats?.clicked ?? 0), 0);
  
  const averageOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0; 
  // Click rate can be based on opened or sent, let's use opened for now
  const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0; 

  // Filter campaigns based on search term (add type/status filters later)
  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (campaignId: string, campaignName: string) => {
    if (window.confirm(`Are you sure you want to delete the campaign "${campaignName}"?`)) {
      deleteCampaign(campaignId);
    }
  };

  const handleSend = async (campaignId: string, campaignName: string) => {
    if (subscribers.length === 0) {
       toast.error("Cannot send campaign, no subscribers found.");
       return;
    }
    if (window.confirm(`Are you sure you want to send the campaign "${campaignName}" to ${subscribers.length} subscribers?`)) {
      // Consider adding a loading state for the send button
      const success = await sendCampaign(campaignId, subscribers);
      // Toast is handled in the store action
    }
  };

  // Handle form submission (passed to CampaignForm)
  const handleCampaignSubmit = async (data: CampaignFormData) => {
    if (editingCampaign) {
      updateCampaign(editingCampaign.id, data); 
      setEditingCampaign(null);
    } else {
      addCampaign(8, data); 
      fetchCampaigns()
    }
    setShowCampaignForm(false); // Close the form
  };
  console.log('Campaigns:', campaigns); // Debugging line
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
         <div className="bg-white overflow-hidden shadow rounded-lg">
           <div className="p-5">
             <div className="flex items-center">
               <div className="flex-shrink-0">
                 <Mail className="h-6 w-6 text-gray-400" />
               </div>
               <div className="ml-5 w-0 flex-1">
                 <dl>
                   <dt className="text-sm font-medium text-gray-500 truncate">Total Subscribers</dt>
                   <dd className="flex items-baseline">
                     <div className="text-2xl font-semibold text-gray-900">{statics?.subscribers}</div> 
                   </dd>
                 </dl>
               </div>
             </div>
           </div>
         </div>
         <div className="bg-white overflow-hidden shadow rounded-lg">
           <div className="p-5">
             <div className="flex items-center">
               <div className="flex-shrink-0">
                 <MessageSquare className="h-6 w-6 text-gray-400" />
               </div>
               <div className="ml-5 w-0 flex-1">
                 <dl>
                   <dt className="text-sm font-medium text-gray-500 truncate">Average Open Rate</dt>
                   <dd className="flex items-baseline">
                     <div className="text-2xl font-semibold text-gray-900">{averageOpenRate.toFixed(1)}%</div> 
                   </dd>
                 </dl>
               </div>
             </div>
           </div>
         </div>
         <div className="bg-white overflow-hidden shadow rounded-lg">
           <div className="p-5">
             <div className="flex items-center">
               <div className="flex-shrink-0">
                 <BarChart2 className="h-6 w-6 text-gray-400" />
               </div>
               <div className="ml-5 w-0 flex-1">
                 <dl>
                   <dt className="text-sm font-medium text-gray-500 truncate">Avg. Click Rate (Opened)</dt>
                   <dd className="flex items-baseline">
                     <div className="text-2xl font-semibold text-gray-900">{clickRate.toFixed(1)}%</div> 
                   </dd>
                 </dl>
               </div>
             </div>
           </div>
         </div>
      </div>

      {/* Tab Navigation */}
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
            Subscribers ({subscriberCount})
          </button>
        </nav>
      </div>

      {/* Conditional Content based on Tab */}
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
            <div className="flex items-center space-x-4">
              <select className="rounded-lg border border-gray-200 text-sm h-10"> 
                <option>All Types</option>
                <option>Email</option>
              </select>
              <select className="rounded-lg border border-gray-200 text-sm h-10"> 
                <option>All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Sent / Sent To</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500">{campaign.subject}</div> 
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        campaign.type === 'email' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {campaign.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        campaign.status === 'sent' ? 'bg-green-100 text-green-800' : 
                        campaign.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800' 
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {campaign.status === 'sent' && campaign.stats ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {campaign.stats.opened?.toLocaleString() ?? 0} opened ({campaign.stats.openRate?.toFixed(1) ?? 0}%)
                          </div>
                          <div className="text-sm text-gray-500">
                            {campaign.stats.clicked?.toLocaleString() ?? 0} clicked ({campaign.stats.clickRate?.toFixed(1) ?? 0}%) 
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">{campaign.status === 'draft' ? 'Draft' : 'Not sent'}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.status === 'sent' && campaign.stats ? (
                        <>
                          <div>{campaign.sentAt ? new Date(campaign.sentAt).toLocaleDateString() : '-'}</div>
                          <div className="text-xs text-gray-500">({campaign.stats.sent.toLocaleString()} subscribers)</div>
                        </>
                      ) : (
                        'Not sent'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-1"> 
                        {campaign.status === 'draft' && (
                           <Button 
                             variant="outline" 
                             size="sm" 
                             className="text-green-600 hover:text-green-700"
                             onClick={() => handleSend(campaign.id, campaign.name)}
                             title="Send Campaign"
                           >
                             <Send className="h-4 w-4" />
                           </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => { setEditingCampaign(campaign); setShowCampaignForm(true); }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(campaign.id, campaign.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

      {/* Campaign Form Modal */}
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