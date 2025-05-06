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

function Marketing() {
  const { currentSalon, loading: salonLoading, error: salonError } = useCurrentSalonStore();
  const { campaigns, loading, error, fetchCampaigns, addCampaign, updateCampaign, deleteCampaign, sendCampaign } = useCampaignStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [sendingCampaignId, setSendingCampaignId] = useState<string | null>(null); // Track sending state

  // Fetch campaigns when salon context is ready
  useEffect(() => {
    if (currentSalon?.id && !salonLoading && !salonError) {
      fetchCampaigns(currentSalon.id);
    }
  }, [currentSalon?.id, salonLoading, salonError, fetchCampaigns]);

  const handleAddNew = () => {
    setEditingCampaign(null);
    setShowCampaignForm(true);
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowCampaignForm(true);
  };

  const handleDelete = async (campaign: Campaign) => {
    if (window.confirm(`Are you sure you want to delete the "${campaign.name}" campaign?`)) {
      await deleteCampaign(campaign.id);
    }
  };

  const handleSend = async (campaign: Campaign) => {
     if (campaign.status !== 'draft' && campaign.status !== 'failed') {
        toast.info("Only draft or failed campaigns can be sent.");
        return;
     }
     if (window.confirm(`Are you sure you want to send the "${campaign.name}" campaign?`)) {
        setSendingCampaignId(campaign.id);
        await sendCampaign(campaign.id); // Store action handles success/error toast
        setSendingCampaignId(null);
     }
  };

  // Form submission handler (passed to SalonCampaignForm)
  const handleFormSubmit = async (data: CampaignFormData) => {
     let success = false;
     if (editingCampaign) {
        success = await updateCampaign(editingCampaign.id, data);
     } else if (currentSalon?.id) {
        const newCampaign = await addCampaign(currentSalon.id, data);
        success = !!newCampaign;
     } else {
        toast.error("Cannot create campaign: Salon context missing.");
     }
     
     if (success) {
        setShowCampaignForm(false); // Close dialog on success
     }
     // Store actions handle toasts
  };

  const filteredCampaigns = campaigns.filter(c =>
     c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     c.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats (basic examples)
  const totalSubscribers = 0; // TODO: Fetch from subscriber store/clients with marketing consent
  // Define 'active' campaigns as scheduled or sending
  const activeCampaigns = campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length;
  // TODO: Calculate average open rate properly from stats

  const isLoading = loading || salonLoading;
  const combinedError = error || salonError;

  if (isLoading && campaigns.length === 0) { // Show loading only on initial load
     return <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (combinedError) {
     return <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">Error loading marketing data: {combinedError}</div>;
  }
   if (!isLoading && !currentSalon) {
     return <div className="p-6 text-center text-gray-500">No active salon associated with this account.</div>;
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
         {/* Total Subscribers Card */}
         <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <dt className="text-sm font-medium text-gray-500 truncate flex items-center"><Mail className="h-5 w-5 mr-2"/>Total Subscribers</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{totalSubscribers}</dd>
         </div>
         {/* Average Open Rate Card */}
         <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <dt className="text-sm font-medium text-gray-500 truncate flex items-center"><MessageSquare className="h-5 w-5 mr-2"/>Average Open Rate</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">N/A</dd> {/* TODO: Calculate */}
         </div>
         {/* Active Campaigns Card */}
         <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <dt className="text-sm font-medium text-gray-500 truncate flex items-center"><Users className="h-5 w-5 mr-2"/>Active Campaigns</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{activeCampaigns}</dd>
         </div>
      </div>

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
                  <TableHead>Performance</TableHead>
                  <TableHead>Last Sent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && campaigns.length === 0 && (
                   <TableRow><TableCell colSpan={6} className="text-center py-10">Loading campaigns...</TableCell></TableRow>
                )}
                {!loading && filteredCampaigns.length === 0 && (
                   <TableRow><TableCell colSpan={6} className="text-center py-10 text-gray-500">No campaigns found.</TableCell></TableRow>
                )}
                {filteredCampaigns.map((campaign) => {
                   const isSending = sendingCampaignId === campaign.id;
                   const canSend = campaign.status === 'draft' || campaign.status === 'failed';
                   const openRate = campaign.stat_sent && campaign.stat_opened ? Math.round((campaign.stat_opened / campaign.stat_sent) * 100) : 0;
                   const clickRate = campaign.stat_sent && campaign.stat_clicked ? Math.round((campaign.stat_clicked / campaign.stat_sent) * 100) : 0; // Click-through rate of total sent

                   return (
                      <TableRow key={campaign.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-xs text-gray-500">{campaign.target_type.replace('_', ' ')}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={campaign.type === 'email' ? 'default' : 'secondary'} className="capitalize">{campaign.type}</Badge>
                        </TableCell>
                        <TableCell>
                          {/* Map status to available Badge variants */}
                          <Badge variant={
                             campaign.status === 'sent' ? 'default' : // Use default (primary) for sent
                             campaign.status === 'draft' ? 'outline' :
                             campaign.status === 'scheduled' ? 'secondary' : // Use secondary for scheduled/sending/failed
                             campaign.status === 'sending' ? 'secondary' :
                             campaign.status === 'failed' ? 'destructive' : // Use destructive for failed
                             'secondary' // Default/Archived
                          } className="capitalize">{campaign.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {campaign.stat_sent && campaign.stat_sent > 0 ? (
                            <div>
                              <div className="text-sm text-gray-900">{campaign.stat_opened || 0} opened ({openRate}%)</div>
                              <div className="text-sm text-gray-500">{campaign.stat_clicked || 0} clicked ({clickRate}%)</div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">{campaign.status === 'draft' || campaign.status === 'scheduled' ? 'Not sent yet' : '-'}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {campaign.sent_at ? format(new Date(campaign.sent_at), 'PP') : 'Never'}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                           <Button variant="ghost" size="sm" onClick={() => handleEdit(campaign)} disabled={isSending} title="Edit"> <Edit2 className="h-4 w-4"/> </Button>
                           <Button variant="ghost" size="sm" onClick={() => handleSend(campaign)} disabled={isSending || !canSend} title={canSend ? "Send" : `Cannot send (status: ${campaign.status})`}> 
                              {isSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                           </Button>
                           <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(campaign)} disabled={isSending} title="Delete"> <Trash2 className="h-4 w-4"/> </Button>
                        </TableCell>
                      </TableRow>
                   );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Campaign Form Dialog */}
      <SalonCampaignForm
         salonId={currentSalon?.id || ''}
         open={showCampaignForm}
         onClose={() => setShowCampaignForm(false)}
         onSubmit={handleFormSubmit}
         initialData={editingCampaign}
      />
    </div>
  );
}

export default Marketing;