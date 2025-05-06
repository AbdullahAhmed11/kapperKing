import React from 'react';
import { 
  Calendar, 
  Users, 
  CreditCard, 
  BarChart, 
  MessageSquare,
  Globe,
  ArrowRight,
  Star,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    id: 'online-agenda',
    name: 'Online Agenda',
    description: 'Manage your salon schedule efficiently with our intuitive calendar system.',
    icon: Calendar,
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    link: '/features/online-agenda',
    image: '/images/features/agenda-preview.svg',
    highlights: [
      'Smart scheduling with conflict prevention',
      'Staff availability management',
      'Resource allocation',
      'Break time management'
    ]
  },
  {
    id: 'online-booking',
    name: 'Online Booking',
    description: 'Let clients book appointments 24/7 through your custom booking website.',
    icon: Globe,
    color: 'bg-gradient-to-br from-green-500 to-green-600',
    link: '/features/online-booking',
    image: '/images/features/booking-preview.svg',
    highlights: [
      'Custom booking website',
      'Real-time availability',
      'Service selection',
      'Automated confirmations'
    ]
  },
  {
    id: 'pos-inventory',
    name: 'POS & Inventory',
    description: 'Complete point of sale system with integrated inventory management.',
    icon: CreditCard,
    color: 'bg-gradient-to-br from-purple-500 to-purple-600',
    link: '/features/pos-inventory',
    image: '/images/features/pos-preview.svg',
    highlights: [
      'Easy checkout process',
      'Stock management',
      'Product tracking',
      'Sales analytics'
    ]
  },
  {
    id: 'client-management',
    name: 'Client Management',
    description: 'Build lasting relationships with comprehensive client profiles.',
    icon: Users,
    color: 'bg-gradient-to-br from-pink-500 to-pink-600',
    link: '/features/client-management',
    image: '/images/features/clients-preview.svg',
    highlights: [
      'Detailed profiles',
      'Service history',
      'Preferences tracking',
      'Notes & reminders'
    ]
  },
  {
    id: 'marketing-tools',
    name: 'Marketing Tools',
    description: 'Grow your business with integrated marketing features.',
    icon: MessageSquare,
    color: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    link: '/features/marketing-tools',
    image: '/images/features/marketing-preview.svg',
    highlights: [
      'Email campaigns',
      'SMS notifications',
      'Social media integration',
      'Campaign analytics'
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Make data-driven decisions with detailed analytics and reporting.',
    icon: BarChart,
    color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    link: '/features/analytics',
    image: '/images/features/analytics-preview.svg',
    highlights: [
      'Business insights',
      'Performance metrics',
      'Revenue tracking',
      'Growth analytics'
    ]
  }
];

export default function Features() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">All-in-one salon software</span>
              <span className="block text-primary-600 mt-2">designed for growth</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
              Everything you need to run and grow your salon business in one powerful platform.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-white"></div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.id}
              to={feature.link}
              className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center p-3 ${feature.color} rounded-xl text-white shadow-lg`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {feature.name}
                </h3>
                <p className="mt-2 text-gray-500">
                  {feature.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {feature.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center text-primary-600 group-hover:text-primary-700">
                  <span className="text-sm font-medium">Learn more</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
              <div className="absolute right-0 bottom-0 h-32 w-32 opacity-10 transform translate-x-8 translate-y-8 group-hover:opacity-20 transition-opacity">
                <feature.icon className="w-full h-full" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Start your free trial
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            No credit card required · 14-day free trial · Cancel anytime
          </p>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Trusted by salons worldwide
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Join thousands of salon owners who trust KapperKing to run their business
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "KapperKing has transformed how we run our salon. The scheduling and client management features are invaluable."
                </p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                    <p className="text-sm text-gray-500">Owner, Style Studio</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}