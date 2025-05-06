import React, { useState } from 'react';
import { Check, Crown, Users, Calendar, MessageSquare, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = {
  basic: [
    'Up to 3 staff members',
    'Online booking',
    'Basic calendar',
    'Client profiles',
    'Email support',
    'Mobile app access'
  ],
  professional: [
    'Up to 10 staff members',
    'Advanced scheduling',
    'Marketing tools',
    'Custom branding',
    'Priority support',
    'Advanced analytics',
    'Loyalty program',
    'SMS notifications'
  ],
  enterprise: [
    'Unlimited staff members',
    'Multiple locations',
    'Custom integrations',
    'Dedicated account manager',
    'API access',
    'Custom reporting',
    'White-label solution',
    'Phone support'
  ]
};

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  const tiers = [
    {
      name: 'Basic',
      price: isAnnual ? 29 : 35,
      description: 'Perfect for small salons just getting started',
      features: features.basic,
      icon: Calendar,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      mostPopular: false
    },
    {
      name: 'Professional',
      price: isAnnual ? 79 : 95,
      description: 'Everything you need to grow your salon',
      features: features.professional,
      icon: Crown,
      color: 'bg-gradient-to-br from-primary-500 to-primary-600',
      mostPopular: true
    },
    {
      name: 'Enterprise',
      price: isAnnual ? 199 : 239,
      description: 'For large salons with multiple locations',
      features: features.enterprise,
      icon: Users,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      mostPopular: false
    }
  ];

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col sm:align-center">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-center">
            Simple, transparent pricing
          </h1>
          <p className="mt-5 text-xl text-gray-500 sm:text-center">
            Start with a 14-day free trial. No credit card required.
          </p>
          <div className="relative mt-6 bg-gray-100 rounded-lg p-0.5 flex self-center">
            <button
              type="button"
              className={`relative w-1/2 rounded-md py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary-500 focus:z-10 sm:w-auto sm:px-8 ${
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
              className={`relative w-1/2 rounded-md py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary-500 focus:z-10 sm:w-auto sm:px-8 ${
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

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-lg shadow-lg divide-y divide-gray-200 bg-white transform hover:-translate-y-1 transition-all duration-200 ${
                tier.mostPopular ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className="p-6">
                <div className={`h-12 w-12 rounded-md ${tier.color} flex items-center justify-center`}>
                  <tier.icon className="h-6 w-6 text-white" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-gray-900">{tier.name}</h2>
                {tier.mostPopular && (
                  <p className="absolute top-0 -translate-y-1/2 bg-primary-500 text-white px-3 py-0.5 text-sm font-semibold rounded-full transform">
                    Most popular
                  </p>
                )}
                <p className="mt-4 text-sm text-gray-500">{tier.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">€{tier.price}</span>
                  <span className="text-base font-medium text-gray-500">/mo</span>
                </p>
                <Link
                  to="/signup"
                  className={`mt-8 block w-full rounded-md py-2 text-sm font-semibold text-center ${
                    tier.mostPopular
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                  }`}
                >
                  Start free trial
                </Link>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h3 className="text-xs font-semibold text-gray-900 tracking-wide uppercase">
                  What's included
                </h3>
                <ul className="mt-6 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <Check
                        className={`flex-shrink-0 h-5 w-5 ${
                          tier.mostPopular ? 'text-primary-500' : 'text-green-500'
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

        <div className="mt-16 bg-gray-50 rounded-2xl">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900">
                  Enterprise features
                </h2>
                <p className="mt-4 text-lg text-gray-500">
                  Need something more? Our enterprise plan includes additional features for larger salons
                  and chains.
                </p>
                <div className="mt-8">
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
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
                      <feature.icon className="h-5 w-5 text-primary-600 mr-3" />
                      <span className="text-sm font-medium text-gray-900">{feature.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}