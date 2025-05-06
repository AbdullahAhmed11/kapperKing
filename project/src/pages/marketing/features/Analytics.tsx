import React from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  PieChart, 
  LineChart, 
  CheckCircle,
  DollarSign,
  Users,
  Calendar,
  ArrowRight,
  Star,
  Clock,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Business Insights',
    description: 'Comprehensive analytics dashboard with key business metrics.',
    icon: BarChart2,
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    secondaryIcon: DollarSign
  },
  {
    title: 'Performance Tracking',
    description: 'Track staff performance, service popularity, and revenue trends.',
    icon: TrendingUp,
    color: 'bg-gradient-to-br from-green-500 to-green-600',
    secondaryIcon: Target
  },
  {
    title: 'Client Analytics',
    description: 'Understand client behavior, preferences, and retention rates.',
    icon: PieChart,
    color: 'bg-gradient-to-br from-purple-500 to-purple-600',
    secondaryIcon: Users
  }
];

const metrics = [
  {
    name: 'Revenue Growth',
    value: '+32%',
    description: 'Year over year increase',
    icon: DollarSign,
    color: 'bg-gradient-to-br from-green-500 to-green-600'
  },
  {
    name: 'Client Retention',
    value: '94%',
    description: 'Monthly retention rate',
    icon: Users,
    color: 'bg-gradient-to-br from-blue-500 to-blue-600'
  },
  {
    name: 'Appointments',
    value: '2.4K',
    description: 'Monthly bookings',
    icon: Calendar,
    color: 'bg-gradient-to-br from-purple-500 to-purple-600'
  },
  {
    name: 'Service Utilization',
    value: '87%',
    description: 'Resource efficiency',
    icon: Clock,
    color: 'bg-gradient-to-br from-pink-500 to-pink-600'
  }
];

const benefits = [
  {
    title: 'Data-Driven Decisions',
    description: 'Make informed business decisions based on real-time data and insights.',
    icon: Target,
    color: 'bg-gradient-to-br from-blue-500 to-blue-600'
  },
  {
    title: 'Revenue Optimization',
    description: 'Identify opportunities to increase revenue and reduce costs.',
    icon: DollarSign,
    color: 'bg-gradient-to-br from-green-500 to-green-600'
  },
  {
    title: 'Staff Performance',
    description: 'Track and improve staff productivity and service quality.',
    icon: Star,
    color: 'bg-gradient-to-br from-yellow-500 to-yellow-600'
  }
];

export default function Analytics() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 mix-blend-multiply" />
          <div className="absolute inset-y-0 right-0 w-1/2">
            <div className="relative h-full">
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="grid grid-cols-2 gap-8">
                  {features.map((feature, idx) => (
                    <div key={idx} className="p-8">
                      <feature.icon className="w-16 h-16 text-white" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              <span className="block">Data-driven</span>
              <span className="block text-primary-200">business decisions</span>
            </h1>
            <p className="mt-6 text-xl text-gray-300 max-w-xl">
              Powerful analytics tools to help you understand and grow your salon business with real-time insights.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50 transition-colors"
              >
                Start free trial
              </Link>
              <Link
                to="/demo"
                className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white/10 transition-colors"
              >
                Watch demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="relative -mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.name}
              className="bg-white rounded-xl shadow-lg p-6 transform hover:-translate-y-1 transition-all duration-200"
            >
              <div className={`${metric.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <metric.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
              <div className="text-sm font-medium text-gray-900 mt-1">{metric.name}</div>
              <div className="text-sm text-gray-500 mt-1">{metric.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative py-16 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Powerful analytics features
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              Everything you need to understand and grow your business
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100"
              >
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center p-3 ${feature.color} rounded-xl text-white shadow-lg`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-gray-500">{feature.description}</p>
                </div>
                <div className="absolute right-0 bottom-0 h-32 w-32 opacity-10 transform translate-x-8 translate-y-8">
                  <feature.secondaryIcon className="w-full h-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="relative py-16 sm:py-24 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Transform your business with data
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              Make informed decisions and drive growth
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className={`${benefit.color} w-12 h-12 rounded-xl flex items-center justify-center mb-6`}>
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{benefit.title}</h3>
                <p className="mt-2 text-gray-500">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to grow with data?</span>
            <span className="block text-primary-200">Start your free trial today</span>
          </h2>
          <p className="mt-4 text-xl text-primary-100">
            Try KapperKing free for 14 days. No credit card required.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 transition-colors"
            >
              Start free trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}