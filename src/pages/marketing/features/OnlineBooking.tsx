import React from 'react';
import { Globe, Calendar, Clock, Users, CheckCircle, ArrowRight, Star, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    title: '24/7 Online Booking',
    description: 'Let clients book appointments anytime, anywhere through your custom booking website.',
    icon: Globe,
    color: 'from-primary-500 to-primary-600'
  },
  {
    title: 'Smart Availability',
    description: 'Automatically show real-time availability based on your schedule and staff.',
    icon: Calendar,
    color: 'from-pink-500 to-pink-600'
  },
  {
    title: 'Instant Confirmations',
    description: 'Automated booking confirmations and reminders to reduce no-shows.',
    icon: MessageSquare,
    color: 'from-purple-500 to-purple-600'
  }
];

const benefits = [
  'Reduce phone calls and manual booking',
  'Fill last-minute cancellations',
  'Increase booking conversion rate',
  'Customize booking rules and policies',
  'Multi-language support'
];

const testimonials = [
  {
    content: "The online booking system has significantly increased our bookings and reduced no-shows.",
    author: "Sarah Johnson",
    role: "Owner, Style Studio",
    rating: 5
  },
  {
    content: "Our clients love being able to book appointments 24/7. It's been a game-changer for our salon.",
    author: "Michael Chen",
    role: "Manager, Chic Cuts",
    rating: 5
  },
  {
    content: "The automated reminders have practically eliminated no-shows. Highly recommended!",
    author: "Emma Davis",
    role: "Owner, The Hair Lab",
    rating: 5
  }
];

export default function OnlineBooking() {
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
              <span className="block">Accept appointments</span>
              <span className="block text-primary-200">24/7 online</span>
            </h1>
            <p className="mt-6 text-xl text-primary-100 max-w-xl">
              Let your clients book appointments online anytime, anywhere with our customizable booking system.
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

      {/* Features Grid */}
      <div className="relative py-16 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Boost your bookings
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              Make it easy for clients to book appointments with your salon.
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
              Benefits of online booking
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Transform your salon's booking experience
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
              Loved by salon owners
            </h2>
            <p className="mt-4 text-xl text-gray-500">
              See what our customers have to say
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
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
            <span className="block">Ready to boost your bookings?</span>
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