import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/components/ThemeProvider'; // Import useTheme
import { 
  Calendar, 
  Users, 
  CreditCard, 
  BarChart, 
  MessageSquare,
  Globe,
  ArrowRight,
  Star,
  CheckCircle,
  Crown,
  Scissors,
  Smartphone,
  Clock,
  Shield,
  Sparkles,
  Zap,
  TrendingUp,
  Heart
} from 'lucide-react';

const features = [
  {
    name: 'Online Agenda',
    description: 'Manage your salon schedule efficiently with our intuitive calendar system.',
    icon: Calendar,
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    link: '/features/online-agenda',
    secondaryIcon: Clock
  },
  {
    name: 'Online Booking',
    description: 'Let clients book appointments 24/7 through your custom booking website.',
    icon: Globe,
    color: 'bg-gradient-to-br from-green-500 to-green-600',
    link: '/features/online-booking',
    secondaryIcon: Smartphone
  },
  {
    name: 'POS & Inventory',
    description: 'Complete point of sale system with integrated inventory management.',
    icon: CreditCard,
    color: 'bg-gradient-to-br from-purple-500 to-purple-600',
    link: '/features/pos-inventory',
    secondaryIcon: Shield
  },
  {
    name: 'Client Management',
    description: 'Build lasting relationships with comprehensive client profiles.',
    icon: Users,
    color: 'bg-gradient-to-br from-pink-500 to-pink-600',
    link: '/features/client-management',
    secondaryIcon: Heart
  },
  {
    name: 'Marketing Tools',
    description: 'Grow your business with integrated marketing features.',
    icon: MessageSquare,
    color: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    link: '/features/marketing-tools',
    secondaryIcon: Sparkles
  },
  {
    name: 'Analytics',
    description: 'Make data-driven decisions with detailed analytics and reporting.',
    icon: BarChart,
    color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    link: '/features/analytics',
    secondaryIcon: TrendingUp
  }
];

const benefits = [
  {
    title: 'Boost Efficiency',
    description: 'Streamline your salon operations and save time with automated scheduling.',
    icon: Zap,
    color: 'bg-gradient-to-br from-blue-500 to-blue-600'
  },
  {
    title: 'Increase Revenue',
    description: 'Grow your business with integrated marketing tools and online booking.',
    icon: TrendingUp,
    color: 'bg-gradient-to-br from-green-500 to-green-600'
  },
  {
    title: 'Retain Clients',
    description: 'Build lasting relationships with comprehensive client management.',
    icon: Heart,
    color: 'bg-gradient-to-br from-pink-500 to-pink-600'
  }
];

const testimonials = [
  {
    content: "KapperKing has transformed how we run our salon. The scheduling and client management features are invaluable.",
    author: "Sarah Johnson",
    role: "Owner, Style Studio",
    rating: 5,
    avatar: Users
  },
  {
    content: "The online booking system has significantly increased our bookings and reduced no-shows.",
    author: "Michael Chen",
    role: "Manager, Chic Cuts",
    rating: 5,
    avatar: Users
  },
  {
    content: "Finally, a salon software that's both powerful and easy to use. Our staff love it!",
    author: "Emma Davis",
    role: "Owner, The Hair Lab",
    rating: 5,
    avatar: Users
  }
];

export default function LandingPage() {
  const { theme } = useTheme(); // Get theme object
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800 mix-blend-multiply" />
          <div className="absolute inset-y-0 right-0 w-1/2">
            <div className="relative h-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-8 opacity-20">
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
              <span className="block">The complete software</span>
              <span className="block text-primary-200">for modern salons</span>
            </h1>
            <p className="mt-6 text-xl text-primary-100 max-w-xl">
              Streamline your salon operations, boost appointments, and grow your business with our all-in-one platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: theme.primaryColor }} // Apply theme background
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

      {/* Features Grid */}
      <div className="relative py-16 sm:py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need to run your salon
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              One platform to manage your entire salon business
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Link
                key={feature.name}
                to={feature.link}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100"
              >
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center p-3 ${feature.color} rounded-xl text-white shadow-lg`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {feature.name}
                  </h3>
                  <p className="mt-2 text-gray-500">{feature.description}</p>
                  <div className="mt-4 flex items-center text-primary-600 group-hover:text-primary-700">
                    <span className="text-sm font-medium">Learn more</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
                <div className="absolute right-0 bottom-0 h-32 w-32 opacity-10 transform translate-x-8 translate-y-8 group-hover:opacity-20 transition-opacity">
                  <feature.secondaryIcon className="w-full h-full" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="relative py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Transform your salon business
            </h2>
            <p className="mt-4 text-xl text-gray-300">
              Take your salon to the next level with our comprehensive management solution
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="relative group bg-white/5 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/10 transition-colors"
              >
                <div className={`inline-flex items-center justify-center p-3 ${benefit.color} rounded-xl text-white shadow-lg`}>
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">{benefit.title}</h3>
                <p className="mt-2 text-gray-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="relative py-16 sm:py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Trusted by salons worldwide
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              See what our customers have to say
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">{testimonial.content}</p>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <testimonial.avatar className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to transform your salon?</span>
            <span className="block text-primary-200">Start your free trial today</span>
          </h2>
          <p className="mt-4 text-xl text-primary-100">
            Try KapperKing free for 14 days. No credit card required.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: theme.primaryColor }} // Apply theme background
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