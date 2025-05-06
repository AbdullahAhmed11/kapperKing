import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Check, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { SubscriptionPlanForm } from '@/components/platform/forms/SubscriptionPlanForm';

function SubscriptionPlans() {
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [showEditPlan, setShowEditPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual data from your backend
  const plans = [
    {
      id: '1',
      name: 'Basic',
      description: 'Perfect for small salons just getting started',
      price: 29,
      interval: 'monthly',
      features: [
        'Up to 3 staff members',
        'Basic scheduling',
        'Client management',
        'Email support'
      ],
      limits: {
        staff: 3,
        clients: 100,
        storage: '5GB'
      },
      isPopular: false,
      isActive: true,
      stats: {
        activeSalons: 45,
        revenue: '€1,305'
      }
    },
    {
      id: '2',
      name: 'Professional',
      description: 'For growing salons with advanced needs',
      price: 79,
      interval: 'monthly',
      features: [
        'Up to 10 staff members',
        'Advanced scheduling',
        'Marketing tools',
        'Priority support'
      ],
      limits: {
        staff: 10,
        clients: 500,
        storage: '20GB'
      },
      isPopular: true,
      isActive: true,
      stats: {
        activeSalons: 128,
        revenue: '€10,112'
      }
    }
  ];

  const handleNewPlanSubmit = async (data: any) => {
    try {
      // Implement plan creation logic here
      console.log('New plan data:', data);
      toast.success('Plan created successfully');
      setShowNewPlan(false);
    } catch (error) {
      toast.error('Failed to create plan');
    }
  };

  const handleEditPlanSubmit = async (data: any) => {
    try {
      // Implement plan update logic here
      console.log('Updated plan data:', data);
      toast.success('Plan updated successfully');
      setShowEditPlan(false);
      setSelectedPlan(null);
    } catch (error) {
      toast.error('Failed to update plan');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      // Implement plan deletion logic here
      console.log('Deleting plan:', planId);
      toast.success('Plan deleted successfully');
    } catch (error) {
      toast.error('Failed to delete plan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Subscription Plans</h1>
          <p className="mt-1 text-sm text-gray-500">Manage subscription plans and pricing</p>
        </div>
        <Button onClick={() => setShowNewPlan(true)}>
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
      <div className="grid gap-6 lg:grid-cols-2">
        {plans.map((plan) => (
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
                  <span className="text-3xl font-bold text-gray-900">€{plan.price}</span>
                  <span className="text-gray-500">/{plan.interval}</span>
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
                  onClick={() => handleDeletePlan(plan.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900">Features</h4>
              <ul className="mt-4 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="ml-3 text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Active Salons</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">
                    {plan.stats.activeSalons}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Monthly Revenue</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">
                    {plan.stats.revenue}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Forms */}
      <SubscriptionPlanForm
        open={showNewPlan}
        onClose={() => setShowNewPlan(false)}
        onSubmit={handleNewPlanSubmit}
      />

      <SubscriptionPlanForm
        open={showEditPlan}
        onClose={() => {
          setShowEditPlan(false);
          setSelectedPlan(null);
        }}
        onSubmit={handleEditPlanSubmit}
        initialData={selectedPlan}
        title="Edit Plan"
      />
    </div>
  );
}

export default SubscriptionPlans;