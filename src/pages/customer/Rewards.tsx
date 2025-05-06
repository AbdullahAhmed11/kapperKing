import React, { useEffect, useState } from 'react'; // Import useState
import { Link } from 'react-router-dom';
import { useLoyaltyStore, LoyaltyReward } from '@/lib/store/loyalty';
import { useClientStore, Client } from '@/lib/store/clients'; // To get current points
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, Gift, Ticket, Package, ArrowLeft, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomerRewardsPage() {
  const { user } = useAuth();
  // Fetch current customer to get their points and salon_id
  const { currentCustomerClient, fetchCurrentCustomerClient, loadingCustomer } = useClientStore();
  // Fetch rewards and handle redemption
  const { rewards, fetchRewards, redeemReward, loadingRewards, loadingMembers } = useLoyaltyStore();
  const [mockRewards] = useState<LoyaltyReward[]>([ // Mock data for UI preview
    { id: 'mock-1', salon_id: 'mock-salon', name: '10% Off Next Visit', description: 'Get 10% off any service on your next visit.', points_cost: 100, reward_type: 'discount', required_service_id: undefined, required_product_id: undefined, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, // Add updated_at
    { id: 'mock-2', salon_id: 'mock-salon', name: 'Free Haircut', description: 'Enjoy a complimentary haircut service.', points_cost: 500, reward_type: 'free_service', required_service_id: 'svc-haircut', required_product_id: undefined, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, // Add updated_at
    { id: 'mock-3', salon_id: 'mock-salon', name: 'Free Shampoo', description: 'Receive a free bottle of our premium shampoo.', points_cost: 250, reward_type: 'product', required_service_id: undefined, required_product_id: 'prod-shampoo', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, // Add updated_at
    { id: 'mock-4', salon_id: 'mock-salon', name: '€5 Voucher', description: 'Get a €5 voucher for your next purchase.', points_cost: 50, reward_type: 'discount', required_service_id: undefined, required_product_id: undefined, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, // Add updated_at
    { id: 'mock-5', salon_id: 'mock-salon', name: 'Deep Conditioning Treatment', description: 'A free deep conditioning add-on.', points_cost: 300, reward_type: 'free_service', required_service_id: 'svc-condition', required_product_id: undefined, is_active: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, // Add updated_at
  ]);
  const [mockTier] = useState({ name: 'Gold Member', pointsToNext: 250 }); // Mock tier info

  const customerPoints = currentCustomerClient?.loyalty_points ?? 0;
  const salonId = currentCustomerClient?.salon_id;

  // Fetch customer data and rewards for their salon
  useEffect(() => {
    if (user?.id) {
      fetchCurrentCustomerClient(user.id);
    }
  }, [user?.id, fetchCurrentCustomerClient]);

  useEffect(() => {
    if (salonId) {
      fetchRewards(salonId);
    }
  }, [salonId, fetchRewards]);

  const handleRedeem = async (reward: LoyaltyReward) => {
    if (!currentCustomerClient) {
       toast.error("Cannot redeem: Client profile not loaded.");
       return;
    }
    if (customerPoints < reward.points_cost) {
       toast.error("Not enough points to redeem this reward.");
       return;
    }
    if (window.confirm(`Redeem "${reward.name}" for ${reward.points_cost} points?`)) {
       // Call the redeemReward action from the store
       await redeemReward(currentCustomerClient.id, reward.id);
       // Store action handles success/error toasts and refetches member data
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

  const isLoading = loadingCustomer || loadingRewards;

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8 space-y-8">
       <div>
          <Button variant="outline" size="sm" asChild className="mb-4">
             <Link to="/c/profile"><ArrowLeft className="h-4 w-4 mr-2"/>Back to Profile</Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Rewards Catalog</h1>
          <p className="mt-1 text-sm text-gray-500">Redeem your loyalty points for exciting rewards!</p>
          <p className="mt-4 text-lg">Your Points: <span className="font-bold text-primary">{customerPoints > 0 ? customerPoints : 125}</span></p> {/* Show mock points if 0 */}
          {/* Placeholder for Tier Info */}
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-100 to-amber-200 rounded-lg border border-amber-300 shadow-sm">
             <p className="text-sm font-semibold text-amber-800">Your Tier: <span className="font-bold">{mockTier.name}</span></p>
             {mockTier.pointsToNext > 0 && <p className="text-xs text-amber-700 mt-1">{mockTier.pointsToNext} points until next tier!</p>}
             {/* TODO: Add progress bar if desired */}
          </div>
       </div>

       {isLoading && <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}

       {!isLoading && rewards.filter((r: LoyaltyReward) => r.is_active).length === 0 && mockRewards.filter((r: LoyaltyReward) => r.is_active).length === 0 && ( // Add type LoyaltyReward
          <div className="text-center text-gray-500 py-10 bg-gray-50 rounded-lg">
             <Gift className="mx-auto h-12 w-12 text-gray-400 mb-4" />
             <p className="font-semibold">No Rewards Available Yet</p>
             <p className="text-sm mt-1">Keep visiting us to earn points and unlock exciting rewards!</p>
          </div>
       )}

       {!isLoading && (rewards.filter((r: LoyaltyReward) => r.is_active).length > 0 || mockRewards.filter((r: LoyaltyReward) => r.is_active).length > 0) && ( // Add type LoyaltyReward
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {(rewards.filter(r => r.is_active).length > 0 ? rewards : mockRewards) // Use real rewards if available, else mock
                .filter((r: LoyaltyReward) => r.is_active) // Add type LoyaltyReward
                .map((reward: LoyaltyReward) => { // Add type LoyaltyReward
                const currentDisplayPoints = customerPoints > 0 ? customerPoints : 125; // Use mock points for display if real points are 0
                const canAfford = currentDisplayPoints >= reward.points_cost;
                return (
                   <Card key={reward.id} className={`flex flex-col justify-between ${!canAfford ? 'opacity-60 bg-gray-50' : ''}`}>
                      <CardHeader className="pb-2">
                         <CardTitle className="text-base font-semibold flex items-center">
                            {getRewardIcon(reward.reward_type)}
                            {reward.name}
                         </CardTitle>
                         {reward.description && <CardDescription className="text-xs pt-1 line-clamp-2">{reward.description}</CardDescription>}
                      </CardHeader>
                      <CardContent className="pt-2 pb-4 flex-grow"> {/* Use flex-grow to push footer down */}
                         <p className="text-lg font-bold text-primary">{reward.points_cost} <span className="text-sm font-normal text-gray-600">points</span></p>
                         {/* Placeholder for required service/product */}
                         {(reward.required_service_id || reward.required_product_id) && ( // Use required_ fields
                            <p className="text-xs text-gray-500 mt-1 italic">
                               Applies to: {reward.required_service_id ? `Service (ID: ${reward.required_service_id})` : `Product (ID: ${reward.required_product_id})`} {/* Use required_ fields */}
                               {/* TODO: Fetch actual service/product name based on ID */}
                            </p>
                         )}
                      </CardContent>
                      <CardFooter className="pt-0 mt-auto"> {/* Use mt-auto to push footer down */}
                         <Button
                            className="w-full"
                            onClick={() => handleRedeem(reward)}
                            disabled={!canAfford || loadingMembers} // Disable if cannot afford or redemption is in progress
                         >
                            {loadingMembers ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Star className="h-4 w-4 mr-2"/>}
                            Redeem
                         </Button>
                      </CardFooter>
                   </Card>
                );
             })}
          </div>
       )}
    </div>
  );
}