import React, { useEffect, useState } from 'react';
import { useSubscriptionPlanStore } from '@/lib/store/subscriptionPlans';

function PricingPage() {
  const [plans, setPlans] = useState(useSubscriptionPlanStore.getState().plans);

  useEffect(() => {
    // Subscribe to updates
    const unsubscribe = useSubscriptionPlanStore.subscribeToUpdates(() => {
      setPlans([...useSubscriptionPlanStore.getState().plans]); // Ensure a new array is set
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h1>Pricing</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg border p-6">
            <h3>{plan.name}</h3>
            <p>{plan.description}</p>
            <p>€{plan.priceAnnual}/month</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PricingPage;
