import React, { useEffect, useState, useMemo  } from 'react';
import { Plus, Search, Edit2, Trash2, Check, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { SubscriptionPlanForm } from '@/components/platform/forms/SubscriptionPlanForm';
import { useSubscriptionPlanStore, selectAllPlans } from '@/lib/store/subscriptionPlans';
import { useThemeStore } from '@/lib/theme'; // Import theme store

function SubscriptionPlans() {
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [showEditPlan, setShowEditPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Get plans and actions from the Zustand store
  const { plans, loading, error, fetchPlans, deletePlan } = useSubscriptionPlanStore();


  const addPlan = useSubscriptionPlanStore(state => state.addPlan);
  const updatePlan = useSubscriptionPlanStore(state => state.updatePlan);
  // const deletePlan = useSubscriptionPlanStore(state => state.deletePlan);
  const { dashboardButtonTextColor } = useThemeStore((state) => state.currentTheme); // Get text color
  // TODO: Add filtering logic based on searchTerm and dropdowns using store data if needed
useEffect(() => {
  fetchPlans();
},[])
  const handleNewPlanSubmit = async (data: any) => {
    try {
      // Call the addPlan action from the store
      addPlan(data);
      // console.log('New plan data:', data); // Keep for debugging if needed
      toast.success('Plan created successfully');
      setShowNewPlan(false);
      // Remove incorrect notifyUpdate call
    } catch (error) {
      toast.error('Failed to create plan');
    }
  };

  const handleEditPlanSubmit = async (data: any) => {
    try {
      if (!selectedPlan) return;
      
      // Call the updatePlan action from the store
      const result: { success: boolean; error?: string } = await updatePlan(selectedPlan.id, data);
      
      if (result?.success) {
        toast.success('Plan updated successfully');
        setShowEditPlan(false);
        setSelectedPlan(null);
        fetchPlans(); // Refresh the list
      } else {
        throw new Error(result?.error || 'Failed to update plan');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update plan');
      console.error('Error updating plan:', error);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await deletePlan(Number(planId));
      toast.success('Plan deleted successfully');
      // Show success message
    } catch (error) {
      // Show error message
      console.error('Error deleting plan:', error);
    }
  };
  const filteredPlans = useMemo(() => {
    if (!searchTerm) return plans;
    return plans.filter(plan => 
      plan.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [plans, searchTerm]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Subscription Plans</h1>
          <p className="mt-1 text-sm text-gray-500">Manage subscription plans and pricing</p>
        </div>
        <Button
          onClick={() => setShowNewPlan(true)}
          style={{ color: dashboardButtonTextColor || '#FFFFFF' }} // Apply text color
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Plan
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center space-x-4">
          <select className="rounded-lg border border-gray-200 text-sm">
            <option>All Intervals</option>
            <option>Monthly</option>
            <option>Yearly</option>
          </select>
          <select className="rounded-lg border border-gray-200 text-sm">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* Plans Grid */}
      {/* Change grid to 3 columns on large screens */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {
          filteredPlans.length > 0 ? (
            filteredPlans.map((plan: any) => (
              <div
                key={plan.id}
                className={`bg-white rounded-lg border ${
                  plan.isPopular ? 'border-indigo-200 ring-1 ring-indigo-500' : 'border-gray-200'
                } p-6 hover:border-gray-300 transition-all duration-200`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 -translate-y-1/2 px-3 py-0.5 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                    Popular
                  </div>
                )}
                
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-3">
                      <div className={`h-10 w-10 rounded-lg ${
                        plan.isPopular ? 'bg-indigo-100' : 'bg-gray-100'
                      } flex items-center justify-center`}>
                        <Crown className={`h-5 w-5 ${
                          plan.isPopular ? 'text-indigo-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                        <p className="text-sm text-gray-500">{plan.description}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      {/* Display annual price */}
                      <span className="text-3xl font-bold text-gray-900">€{plan.priceAnnual}</span>
                      <span className="text-gray-500">/month (billed annually)</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPlan(plan);
                        setShowEditPlan(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeletePlan(String(plan.id))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
    
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900">Features</h4>
                  <ul className="mt-4 space-y-3">
                    {plan.features.map((feature:any, index: any) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="ml-3 text-sm text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
    
                <div className="mt-6 pt-6 border-t border-gray-100">
                  {/* Remove stats display as it's not in the unified store data */}
                  {/* <div className="grid grid-cols-2 gap-4"> ... stats ... </div> */}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-12 text-center">
            <p className="text-gray-500">
              {searchTerm ? 'No plans match your search' : 'No plans available'}
            </p>
          </div>
          )
        }
      </div>

      {/* Forms */}
      {/* <SubscriptionPlanForm
        open={showNewPlan}
        onClose={() => setShowNewPlan(false)}
        onSubmit={handleNewPlanSubmit}
      /> */}
<SubscriptionPlanForm
  open={showNewPlan}
  onClose={() => setShowNewPlan(false)}
  onPlanAdded={() => {
    // setShowNewPlan(false);
    fetchPlans(); // Refresh the plans list
  }}
/>

      {/* Add key prop to force re-mount on edit */}
      {/* <SubscriptionPlanForm
        key={selectedPlan?.id || 'edit-plan'}
        open={showEditPlan}
        onClose={() => {
          setShowEditPlan(false);
          setSelectedPlan(null);
        }}
        onSubmit={handleEditPlanSubmit}
        initialData={selectedPlan}
        title="Edit Plan"
      /> */}
      {/* <SubscriptionPlanForm
  key={selectedPlan?.id || 'edit-plan'}
  open={showEditPlan}
  onClose={() => {
    setShowEditPlan(false);
    setSelectedPlan(null);
  }}
  onPlanAdded={() => {
    setShowEditPlan(false);
    fetchPlans(); // Refresh the plans list
  }}
  onSubmit={handleEditPlanSubmit} 
  initialData={selectedPlan}
  title="Edit Plan"
/> */}
<SubscriptionPlanForm
  key={selectedPlan?.id || 'edit-plan'}
  open={showEditPlan}
  onClose={() => {
    setShowEditPlan(false);
    setSelectedPlan(null);
  }}
  onPlanAdded={() => {
    fetchPlans(); // Refresh the plans list after editing
  }}
  onSubmit={async (data) => {
    await updatePlan(selectedPlan.id, data); // Ensure it returns a Promise
  }} // Pass update function
  initialData={selectedPlan}
  title="Edit Plan"
/>
    </div>
  );
}

export default SubscriptionPlans;