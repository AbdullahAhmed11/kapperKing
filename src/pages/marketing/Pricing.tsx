import React, { useState, useEffect } from 'react'; // Add useEffect
import { Check, Crown, Users, Calendar, MessageSquare, BarChart, CreditCard, Tag, DollarSign } from 'lucide-react'; // Added icons
import { Link } from 'react-router-dom';
import { useSubscriptionPlanStore, selectAllPlans } from '@/lib/store/subscriptionPlans'; // Import store hook
import { emitter } from '@/lib/emitter';
import { useThemeStore as useAppThemeStore } from '@/lib/theme'; // Import theme store with alias

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const {
    marketingButtonTextColor,
    marketingHeaderBgType,
    marketingHeaderBgColor,
    marketingHeaderBgImageUrl,
    marketingHeaderTextColor
  } = useAppThemeStore((state) => state.currentTheme); // Get theme settings
  // Local state to hold the plans for display
  // const [displayPlans, setDisplayPlans] = useState(() => selectAllPlans(useSubscriptionPlanStore.getState()));
  const { plans, loading, error, fetchPlans, deletePlan  } = useSubscriptionPlanStore();

  // Effect to listen for updates from the emitter
  
  useEffect(() => {
    // const updateHandler = () => {
    //   console.log("Pricing page received 'plansUpdated' event, updating display.");
    //   setDisplayPlans(selectAllPlans(useSubscriptionPlanStore.getState()));
    // };

    // // Subscribe on mount
    // const unsubscribe = emitter.on('plansUpdated', updateHandler);

    // // Unsubscribe on unmount
    // return () => unsubscribe();
    fetchPlans()
  }, []); // Empty dependency array ensures this runs only once on mount/unmount


  const handleDelete = async (id: number) => {
    try {
      await deletePlan(id);
      // Show success message
    } catch (error) {
      // Show error message
    }
  };
  // Map the local displayPlans state for rendering
  const tiers = plans.map(plan => {
    let icon = Calendar;
    let color = 'bg-gray-500'; // Default background
    if (String(plan.id) === 'basic') {
      icon = Calendar;
      color = 'bg-primary'; // Use theme primary
    } else if (String(plan.id) === 'professional') {
      icon = Crown;
      color = 'bg-secondary'; // Use theme secondary (example mapping)
    } else if (String(plan.id) === 'enterprise') {
      icon = Users;
      color = 'bg-accent'; // Use theme accent (example mapping)
    }

    return {
      name: plan.name,
      price: isAnnual ? plan.priceAnnual : plan.priceMonthly,
      description: plan.description,
      features: plan.features, // Keep the string features
      maxSalons: plan.maxSalons, // Add maxSalons limit
      icon: icon,
      color: color,
      mostPopular: plan.isPopular
    };
  });

  return (
    // Main component wrapper
    <div className="bg-white">

      {/* Header Section */}
      <div
        className="py-20 md:py-24 text-center relative bg-cover bg-center overflow-hidden"
        style={{
          backgroundColor: marketingHeaderBgType === 'color' ? (marketingHeaderBgColor || '#6B46C1') : undefined,
          backgroundImage: marketingHeaderBgType === 'image' && marketingHeaderBgImageUrl ? `url(${marketingHeaderBgImageUrl})` : undefined,
          color: marketingHeaderTextColor || '#FFFFFF',
        }}
      >
        {/* Optional overlay for image background */}
        {marketingHeaderBgType === 'image' && marketingHeaderBgImageUrl && (
          <div className="absolute inset-0 bg-black/50 z-0"></div>
        )}
         {/* Decorative Background Icons */}
         <CreditCard className="absolute top-10 -left-12 h-40 w-40 text-white opacity-[0.04] transform -rotate-15" aria-hidden="true" />
         <Tag className="absolute bottom-5 -right-8 h-48 w-48 text-white opacity-[0.04] transform rotate-10" aria-hidden="true" />
         <DollarSign className="absolute top-1/3 right-10 h-32 w-32 text-white opacity-[0.04] transform rotate-6" aria-hidden="true" />

        {/* Header Content Wrapper */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="sm:flex sm:flex-col sm:align-center">
            {/* Title */}
            <h1
              className="text-5xl font-extrabold sm:text-center font-heading"
              style={{ color: marketingHeaderTextColor || '#FFFFFF' }}
            >
              Simple, transparent pricing
            </h1>
            {/* Subtitle */}
            <p
              className="mt-5 text-xl sm:text-center"
              style={{ color: marketingHeaderTextColor ? `${marketingHeaderTextColor}CC` : '#FFFFFFCC' }}
            >
              Start with a 14-day free trial. No credit card required.
            </p>
            {/* Billing Toggle */}
            <div className="relative mt-6 bg-gray-100 rounded-lg p-0.5 flex self-center">
              <button
                type="button"
                className={`relative w-1/2 rounded-md py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary focus:z-10 sm:w-auto sm:px-8 ${
                  !isAnnual
                    ? 'bg-white border-gray-200 text-gray-900 shadow-sm'
                    : 'border border-transparent text-gray-700'
                }`}
                onClick={() => setIsAnnual(false)}
              >
                Monthly billing
              </button>
              <button
                type="button"
                className={`relative w-1/2 rounded-md py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary focus:z-10 sm:w-auto sm:px-8 ${
                  isAnnual
                    ? 'bg-white border-gray-200 text-gray-900 shadow-sm'
                    : 'border border-transparent text-gray-700'
                }`}
                onClick={() => setIsAnnual(true)}
              >
                Annual billing
                <span className="absolute -top-3 right-0 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full transform translate-x-1/2">
                  Save 15%
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* End Header Section */}

      {/* Pricing Tiers Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="mt-0 space-y-4 sm:mt-0 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-lg shadow-lg divide-y divide-gray-200 bg-white transform hover:-translate-y-1 transition-all duration-200 ${
                tier.mostPopular ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="p-6">
                <div className={`h-12 w-12 rounded-md ${tier.color} flex items-center justify-center`}>
                  <tier.icon className="h-6 w-6 text-white" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-gray-900 font-heading">{tier.name}</h2>
                {tier.mostPopular && (
                  <p className="absolute top-0 -translate-y-1/2 bg-primary text-white px-3 py-0.5 text-sm font-semibold rounded-full transform">
                    Most popular
                  </p>
                )}
                <p className="mt-4 text-sm text-gray-500">{tier.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">€{tier.price}</span>
                  <span className="text-base font-medium text-gray-500">/mo</span>
                </p>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h3 className="text-xs font-semibold text-gray-900 tracking-wide uppercase font-heading">
                  What's included
                </h3>
                <ul className="mt-6 space-y-4">
                  {/* Add Max Salons limit */}
                  <li className="flex space-x-3">
                     <Check
                       className={`flex-shrink-0 h-5 w-5 ${
                         tier.mostPopular ? 'text-primary' : 'text-green-500'
                       }`}
                     />
                     <span className="text-sm text-gray-500">
                       {tier.maxSalons === -1
                         ? 'Unlimited salons'
                         : tier.maxSalons === 1
                         ? '1 Salon included'
                         : `Up to ${tier.maxSalons} salons`}
                     </span>
                   </li>
                   {/* Map existing string features */}
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <Check
                        className={`flex-shrink-0 h-5 w-5 ${
                          tier.mostPopular ? 'text-primary' : 'text-green-500'
                        }`}
                      />
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise Features Section */}
        <div className="mt-16 bg-gray-50 rounded-2xl">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 font-heading">
                  Enterprise features
                </h2>
                <p className="mt-4 text-lg text-gray-500">
                  Need something more? Our enterprise plan includes additional features for larger salons
                  and chains.
                </p>
                <div className="mt-8">
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90"
                  >
                    Contact sales
                  </Link>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-0.5 md:grid-cols-3 lg:mt-0 lg:grid-cols-2">
                {[
                  { icon: Users, text: 'Multiple locations' },
                  { icon: Crown, text: 'Custom branding' },
                  { icon: MessageSquare, text: 'Priority support' },
                  { icon: BarChart, text: 'Advanced analytics' }
                ].map((feature) => (
                  <div
                    key={feature.text}
                    className="col-span-1 flex justify-center py-8 px-8 bg-white"
                  >
                    <div className="flex items-center">
                      <feature.icon className="h-5 w-5 text-primary mr-3" />
                      <span className="text-sm font-medium text-gray-900">{feature.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Pricing Tiers Section */}

    </div> // End Main component wrapper
  );
}

// import React from 'react'

// const Pricing = () => {
//   return (
//     <div>Pricing</div>
//   )
// }

// export default Pricing