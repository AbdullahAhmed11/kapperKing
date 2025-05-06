import React, { useState } from 'react';
import { useLoyaltyStore, LoyaltyReward } from '@/lib/store/loyalty';
import { useCurrentSalonStore } from '@/lib/store/currentSalon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// Consolidate imports
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Gift, Ticket, Package } from 'lucide-react'; // Added icons
import { RewardForm } from './RewardForm'; // Import the form
import { formatCurrency } from '@/lib/utils'; // Assuming utils exists

export function LoyaltyRewardCatalog() {
  const { currentSalon } = useCurrentSalonStore();
  const { rewards, loadingRewards, deleteReward } = useLoyaltyStore();
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editingReward, setEditingReward] = useState<LoyaltyReward | null>(null);

  const handleAddNew = () => {
    setEditingReward(null);
    setShowRewardForm(true);
  };

  const handleEdit = (reward: LoyaltyReward) => {
    setEditingReward(reward);
    setShowRewardForm(true);
  };

  const handleDelete = async (reward: LoyaltyReward) => {
    if (window.confirm(`Are you sure you want to delete the "${reward.name}" reward?`)) {
      await deleteReward(reward.id);
    }
  };

  const getRewardIcon = (type: string) => {
     switch(type) {
        case 'discount': return <Ticket className="h-5 w-5 mr-2 text-green-500"/>;
        case 'free_service': return <Gift className="h-5 w-5 mr-2 text-blue-500"/>;
        case 'product': return <Package className="h-5 w-5 mr-2 text-orange-500"/>;
        default: return <Gift className="h-5 w-5 mr-2 text-gray-500"/>;
     }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
         <Button onClick={handleAddNew} size="sm">
            <Plus className="h-4 w-4 mr-2"/> Add Reward
         </Button>
      </div>

      {loadingRewards && <p>Loading rewards...</p>}

      {!loadingRewards && rewards.length === 0 && (
         <p className="text-center text-gray-500 py-4">No rewards defined yet.</p>
      )}

      {!loadingRewards && rewards.length > 0 && (
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => (
               <Card key={reward.id} className={`flex flex-col justify-between ${!reward.is_active ? 'opacity-60 bg-gray-50' : ''}`}>
                  <CardHeader className="pb-2">
                     <CardTitle className="text-base font-semibold flex items-center justify-between">
                        <span className="flex items-center">
                           {getRewardIcon(reward.reward_type)}
                           {reward.name}
                        </span>
                         <Badge variant={reward.is_active ? 'default' : 'outline'}>
                            {reward.is_active ? 'Active' : 'Inactive'}
                         </Badge>
                     </CardTitle>
                     {reward.description && <CardDescription className="text-xs pt-1">{reward.description}</CardDescription>}
                  </CardHeader>
                  <CardContent className="pt-2 pb-4">
                     <p className="text-lg font-bold text-primary">{reward.points_cost} <span className="text-sm font-normal text-gray-600">points</span></p>
                     {/* TODO: Display linked service/product name if applicable */}
                  </CardContent>
                   <CardFooter className="pt-0 flex justify-end space-x-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(reward)}>
                         <Edit2 className="h-4 w-4"/>
                      </Button>
                       <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-700" onClick={() => handleDelete(reward)}>
                         <Trash2 className="h-4 w-4"/>
                      </Button>
                   </CardFooter>
               </Card>
            ))}
         </div>
      )}

      {/* Add/Edit Reward Dialog */}
      <Dialog open={showRewardForm} onOpenChange={setShowRewardForm}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>{editingReward ? 'Edit Reward' : 'Add New Reward'}</DialogTitle>
             <DialogDescription>Configure the details for this loyalty reward.</DialogDescription>
           </DialogHeader>
           <RewardForm
             salonId={currentSalon?.id || ''}
             rewardData={editingReward}
             onSuccess={() => setShowRewardForm(false)}
             onCancel={() => setShowRewardForm(false)}
           />
         </DialogContent>
       </Dialog>
    </div>
  );
}