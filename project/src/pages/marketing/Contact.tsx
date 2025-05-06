import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MessageSquare, Clock, Users, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  businessType: z.enum(['salon', 'barbershop', 'spa', 'other']),
  staffSize: z.enum(['1-5', '6-10', '11-20', '20+']),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const supportFeatures = [
  {
    name: '24/7 Support',
    description: 'Get help whenever you need it',
    icon: Clock,
    color: 'bg-gradient-to-br from-blue-500 to-blue-600'
  },
  {
    name: 'Dedicated Team',
    description: 'Personal account manager for your business',
    icon: Users,
    color: 'bg-gradient-to-br from-green-500 to-green-600'
  },
  {
    name: 'Multiple Channels',
    description: 'Reach us through email, phone, or chat',
    icon: MessageSquare,
    color: 'bg-gradient-to-br from-purple-500 to-purple-600'
  }
];

const contactMethods = [
  {
    name: 'Email',
    value: 'support@kapperking.com',
    icon: Mail,
    color: 'text-blue-500'
  },
  {
    name: 'Phone',
    value: '+31 (0) 20 123 4567',
    icon: Phone,
    color: 'text-green-500'
  },
  {
    name: 'Chat',
    value: 'Available 24/7',
    icon: MessageSquare,
    color: 'text-purple-500'
  }
];

export default function Contact() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      console.log('Contact form data:', data);
      toast.success('Message sent successfully!');
      reset();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-500 to-primary-700 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              Get in touch
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-primary-100">
              Have questions about KapperKing? We're here to help you find the perfect solution for your salon.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {contactMethods.map((method) => (
              <div key={method.name} className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white">
                <method.icon className={`h-8 w-8 ${method.color}`} />
                <h3 className="mt-4 text-lg font-semibold">{method.name}</h3>
                <p className="mt-2 text-primary-100">{method.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Let's discuss your salon needs
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Fill out the form and our team will get back to you within 24 hours.
            </p>

            {/* Support Features */}
            <div className="mt-12 space-y-8">
              {supportFeatures.map((feature) => (
                <div key={feature.name} className="flex items-start">
                  <div className={`${feature.color} p-3 rounded-lg`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{feature.name}</h3>
                    <p className="mt-1 text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Links */}
            <div className="mt-12 space-y-4">
              <Link
                to="/pricing"
                className="group flex items-center text-primary-600 hover:text-primary-700"
              >
                View pricing plans
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/features"
                className="group flex items-center text-primary-600 hover:text-primary-700"
              >
                Explore features
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  {...register('phone')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
                    Business Type
                  </label>
                  <select
                    id="businessType"
                    {...register('businessType')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="salon">Hair Salon</option>
                    <option value="barbershop">Barbershop</option>
                    <option value="spa">Spa</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="staffSize" className="block text-sm font-medium text-gray-700">
                    Staff Size
                  </label>
                  <select
                    id="staffSize"
                    {...register('staffSize')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="1-5">1-5 employees</option>
                    <option value="6-10">6-10 employees</option>
                    <option value="11-20">11-20 employees</option>
                    <option value="20+">20+ employees</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  {...register('subject')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  {...register('message')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {isSubmitting ? 'Sending...' : 'Send message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}