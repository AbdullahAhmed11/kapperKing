import React from 'react';
import { ShoppingBag, CreditCard, Package, BarChart, CheckCircle, ArrowRight, Star, DollarSign, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Point of Sale',
    description: 'Fast and intuitive POS system designed specifically for salons.',
    icon: CreditCard,
    color: 'from-primary-500 to-primary-600'
  },
  {
    title: 'Inventory Management',
    description: 'Track products, manage stock levels, and automate reordering.',
    icon: Package,
    color: 'from-pink-500 to-pink-600'
  },
  {
    title: 'Sales Analytics',
    description: 'Detailed insights into your retail performance and trends.',
    icon: BarChart,
    color: 'from-purple-500 to-purple-600'
  }
];

const benefits = [
  'Streamline checkout process',
  'Track product inventory in real-time',
  'Manage multiple product lines',
  'Automated stock alerts',
  'Sales and inventory reporting'
];

const stats = [
  {
    title: 'Average Transaction Value',
    value: '€85',
    description: 'Per sale',
    icon: DollarSign,
    color: 'from-green-500 to-green-600'
  },
  {
    title: 'Monthly Revenue',
    value: '€12.5K',
    description: 'From retail sales',
    icon: TrendingUp,
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Products Managed',
    value: '250+',
    description: 'In inventory',
    icon: Package,
    color: 'from-purple-500 to-purple-600'
  }
];

const testimonials = [
  {
    content: "The POS system has transformed how we handle retail sales. It's fast, reliable, and our staff love it.",
    author: "Emma Wilson",
    role: "Owner, Glam Studio",
    rating: 5
  },
  {
    content: "Inventory management is a breeze now. No more running out of products unexpectedly.",
    author: "David Chen",
    role: "Manager, Style House",
    rating: 5
  }
];

export default function PosInventory() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800 mix-blend-multiply" />
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
              <span className="block">Manage your salon's</span>
              <span className="block text-primary-200">retail business</span>
            </h1>
            <p className="mt-6 text-xl text-primary-100 max-w-xl">
              Complete point of sale and inventory management system designed for salons.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 transition-colors"
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

      {/* Stats Section */}
      <div className="relative -mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="bg-white rounded-xl shadow-lg p-6 transform hover:-translate-y-1 transition-all duration-200"
            >
              <div className={`bg-gradient-to-br ${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm font-medium text-gray-900 mt-1">{stat.title}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative py-16 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need to sell
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              Powerful tools to manage your retail business efficiently.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100"
              >
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center p-3 bg-gradient-to-br ${feature.color} rounded-xl text-white shadow-lg`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-gray-500">{feature.description}</p>
                </div>
                <div className="absolute right-0 bottom-0 h-32 w-32 opacity-10 transform translate-x-8 translate-y-8">
                  <feature.icon className="w-full h-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Benefits of our POS system
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Transform your retail operations
            </p>
          </div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {benefits.map((benefit) => (
                <div key={benefit} className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{benefit}</p>
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              What our customers say
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              Don't just take our word for it
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">{testimonial.content}</p>
                <div>
                  <p className="text-sm font-medium text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to streamline your retail?</span>
            <span className="block text-primary-200">Start your free trial today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-100">
            Try KapperKing free for 14 days. No credit card required.
          </p>
          <Link
            to="/signup"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 sm:w-auto"
          >
            Start free trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}