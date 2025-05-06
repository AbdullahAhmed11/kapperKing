import React, { useState } from 'react';
import { useLoyaltyStore, LoyaltyTier } from '@/lib/store/loyalty';
import { useCurrentSalonStore } from '@/lib/store/currentSalon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'; // Import DialogDescription
// Removed duplicate Dialog import below
import { Plus, Edit2, Trash2, Trophy } from 'lucide-react';
import { TierForm } from './TierForm'; // Import the form

export function LoyaltyTiers() {
  const { currentSalon } = useCurrentSalonStore();
  const { tiers, loadingTiers, deleteTier } = useLoyaltyStore();
  const [showTierForm, setShowTierForm] = useState(false);
  const [editingTier, setEditingTier] = useState<LoyaltyTier | null>(null);

  const handleAddNew = () => {
    setEditingTier(null);
    setShowTierForm(true);
  };

  const handleEdit = (tier: LoyaltyTier) => {
    setEditingTier(tier);
    setShowTierForm(true);
  };

  const handleDelete = async (tier: LoyaltyTier) => {
    if (window.confirm(`Are you sure you want to delete the "${tier.name}" tier?`)) {
      await deleteTier(tier.id);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
         <Button onClick={handleAddNew} size="sm">
            <Plus className="h-4 w-4 mr-2"/> Add Tier
         </Button>
      </div>

      {loadingTiers && <p>Loading tiers...</p>}

      {!loadingTiers && tiers.length === 0 && (
         <p className="text-center text-gray-500 py-4">No loyalty tiers defined yet.</p>
      )}

      {!loadingTiers && tiers.length > 0 && (
         <div className="space-y-4">
            {tiers.map((tier) => (
               <Card key={tier.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-lg font-medium flex items-center">
                        <Trophy className="h-5 w-5 mr-2 text-yellow-500"/> {tier.name}
                     </CardTitle>
                     <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(tier)}>
                           <Edit2 className="h-4 w-4"/>
                        </Button>
                         <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(tier)}>
                           <Trash2 className="h-4 w-4"/>
                        </Button>
                     </div>
                  </CardHeader>
                  <CardContent>
                     <p className="text-sm text-gray-600">
                        Requires <span className="font-semibold">{tier.points_threshold}</span> points to reach.
                     </p>
                     {tier.description && <p className="text-xs text-gray-500 mt-1">{tier.description}</p>}
                  </CardContent>
               </Card>
            ))}
         </div>
      )}

      {/* Add/Edit Tier Dialog */}
      <Dialog open={showTierForm} onOpenChange={setShowTierForm}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>{editingTier ? 'Edit Tier' : 'Add New Tier'}</DialogTitle>
             <DialogDescription>Define the name and point threshold for this loyalty tier.</DialogDescription>
           </DialogHeader>
           <TierForm
             salonId={currentSalon?.id || ''}
             tierData={editingTier}
             onSuccess={() => setShowTierForm(false)}
             onCancel={() => setShowTierForm(false)}
           />
         </DialogContent>
       </Dialog>
    </div>
  );
}