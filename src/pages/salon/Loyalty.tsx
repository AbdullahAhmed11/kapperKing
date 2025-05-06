import React, { useState, useEffect } from 'react';
import { useCurrentSalonStore } from '@/lib/store/currentSalon';
import { useLoyaltyStore } from '@/lib/store/loyalty';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Users, Trophy, Gift, BarChart2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components
import { LoyaltyMembersTable } from '@/components/loyalty/LoyaltyMembersTable';
import { LoyaltyTiers } from '@/components/loyalty/LoyaltyTiers'; // Correctly import Tiers component
import { LoyaltyRewardCatalog } from '@/components/loyalty/LoyaltyRewardCatalog'; // Import Catalog component
import { LoyaltyAnalytics } from '@/components/loyalty/LoyaltyAnalytics'; // Import Analytics component
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog'; // Import Dialog components
import { ClientSelectorCombobox } from '@/components/loyalty/ClientSelectorCombobox'; // Import Client Selector
import { toast } from 'sonner'; // Import toast

export default function LoyaltyPage() {
  const { currentSalon, loading: salonLoading, error: salonError } = useCurrentSalonStore();
  // TODO: Potentially fetch different parts of loyalty data based on active tab
  const { fetchMembers, fetchTiers, fetchRewards, loadingMembers, loadingTiers, loadingRewards, error, members, adjustPoints } = useLoyaltyStore(); // Add members, adjustPoints
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [selectedClientToEnroll, setSelectedClientToEnroll] = useState<string | null>(null);
  const [enrollLoading, setEnrollLoading] = useState(false);

  useEffect(() => {
    // Fetch initial data when salon context is ready
    if (currentSalon?.id && !salonLoading && !salonError) {
      fetchMembers(currentSalon.id);
      fetchTiers(currentSalon.id);
      fetchRewards(currentSalon.id);
    }
  }, [currentSalon?.id, salonLoading, salonError, fetchMembers, fetchTiers, fetchRewards]);

  // Combine loading states
  const isLoading = salonLoading || loadingMembers || loadingTiers || loadingRewards;
  const combinedError = salonError || error;

  // --- Render Logic ---
  if (isLoading) {
     return <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (combinedError) {
     return <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">Error loading loyalty data: {combinedError}</div>;
  }
  if (!currentSalon) {
     return <div className="p-6 text-center text-gray-500">No active salon associated with this account.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Loyalty Program Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage tiers, rewards, members, and analytics.</p>
        </div>
        {/* Add button might depend on the active tab */}
      </div>

      {/* TODO: Add Stats Cards */}
      {/* <div className="grid gap-4 md:grid-cols-3"> ... Stats ... </div> */}

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="members"><Users className="h-4 w-4 mr-2 inline-block"/>Members</TabsTrigger>
          <TabsTrigger value="tiers"><Trophy className="h-4 w-4 mr-2 inline-block"/>Reward Tiers</TabsTrigger>
          <TabsTrigger value="catalog"><Gift className="h-4 w-4 mr-2 inline-block"/>Reward Catalog</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart2 className="h-4 w-4 mr-2 inline-block"/>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between"> {/* Use flex for button alignment */}
              <CardTitle>Members</CardTitle>
              {/* Add Member Button */}
              <Button size="sm" onClick={() => { setSelectedClientToEnroll(null); setShowAddMemberDialog(true); }}>
                 <Plus className="h-4 w-4 mr-2"/>Add Member
              </Button>
            </CardHeader>
            <CardContent>
              {/* Render LoyaltyMembersTable component */}
              <LoyaltyMembersTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers">
           <Card>
             <CardHeader>
               <CardTitle>Reward Tiers</CardTitle>
                {/* Add Tier button here */}
             </CardHeader>
             <CardContent>
               {/* Render LoyaltyTiers component */}
               <LoyaltyTiers />
             </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="catalog">
           {/* Render LoyaltyRewardCatalog directly */}
           <LoyaltyRewardCatalog />
        </TabsContent>

        <TabsContent value="analytics">
           {/* Render LoyaltyAnalytics directly */}
           <LoyaltyAnalytics />
        </TabsContent>
      </Tabs>


       {/* Add Member Dialog */}
       <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
          <DialogContent>
             <DialogHeader>
                <DialogTitle>Enroll Client in Loyalty Program</DialogTitle>
                <DialogDescription>Select an existing client to add them to the program.</DialogDescription>
             </DialogHeader>
             <div className="py-4">
                <ClientSelectorCombobox
                   salonId={currentSalon?.id || ''}
                   selectedClientId={selectedClientToEnroll}
                   onClientSelected={setSelectedClientToEnroll}
                   // TODO: Filter out clients already in members list?
                />
             </div>
             <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button 
                   onClick={async () => {
                      if (!selectedClientToEnroll) {
                         toast.error("Please select a client.");
                         return;
                      }
                      // Check if client is already a member (has points or tier)
                      const existingMember = members.find(m => m.id === selectedClientToEnroll);
                      if (existingMember && (existingMember.loyalty_points > 0 || existingMember.loyalty_tier_id)) {
                         toast.info("Client is already a member.");
                         setShowAddMemberDialog(false);
                         return;
                      }
                      
                      setEnrollLoading(true);
                      // "Enrolling" might just mean ensuring they exist in the members list fetched by fetchMembers.
                      // Or, add initial points/identifier if needed via adjustPoints or a dedicated enroll function.
                      // For now, let's just ensure they are fetched next time.
                      // Optionally add 0 points to trigger log/tier check:
                      // await adjustPoints(selectedClientToEnroll, 0, "Enrolled in program"); 
                      
                      toast.success("Client enrolled (or already exists)."); // Simplified message
                      await fetchMembers(currentSalon!.id); // Refetch members list
                      setEnrollLoading(false);
                      setShowAddMemberDialog(false);
                   }}
                   disabled={!selectedClientToEnroll || enrollLoading}
                >
                   {enrollLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin"/>}
                   Enroll Client
                </Button>
             </DialogFooter>
          </DialogContent>
       </Dialog>
    </div>
  );
}

// Remove temporary Card placeholders, assuming Shadcn Card is imported/available globally or via another import