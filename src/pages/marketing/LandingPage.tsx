import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form'; // Import useForm
import { z } from 'zod'; // Import Zod
import { zodResolver } from '@hookform/resolvers/zod'; // Import resolver
import { Input } from '@/components/ui/input'; // Import Input
import { Button } from '@/components/ui/button'; // Import Button
import { useSubscriberStore } from '@/lib/store/subscribers'; // Import subscriber store
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
import { useThemeStore } from '@/lib/theme';
import axios from 'axios'; 
const features = [
  {
    name: 'Online Agenda',
    description: 'Manage your salon schedule efficiently with our intuitive calendar system.',
    icon: Calendar,
    color: 'bg-primary', // Use theme primary
    link: '/features/online-agenda',
    secondaryIcon: Clock
  },
  {
    name: 'Online Booking',
    description: 'Let clients book appointments 24/7 through your custom booking website.',
    icon: Globe,
    color: 'bg-secondary', // Use theme secondary
    link: '/features/online-booking',
    secondaryIcon: Smartphone
  },
  {
    name: 'POS & Inventory',
    description: 'Complete point of sale system with integrated inventory management.',
    icon: CreditCard,
    color: 'bg-accent', // Use theme accent (Example mapping)
    link: '/features/pos-inventory',
    secondaryIcon: Shield
  },
  {
    name: 'Client Management',
    description: 'Build lasting relationships with comprehensive client profiles.',
    icon: Users,
    color: 'bg-secondary', // Reuse theme secondary (Example mapping)
    link: '/features/client-management',
    secondaryIcon: Heart
  },
  {
    name: 'Marketing Tools',
    description: 'Grow your business with integrated marketing features.',
    icon: MessageSquare,
    color: 'bg-accent', // Reuse theme accent (Example mapping)
    link: '/features/marketing-tools',
    secondaryIcon: Sparkles
  },
  {
    name: 'Analytics',
    description: 'Make data-driven decisions with detailed analytics and reporting.',
    icon: BarChart,
    color: 'bg-primary', // Reuse theme primary (Example mapping)
    link: '/features/analytics',
    secondaryIcon: TrendingUp
  }
];

const benefits = [
  {
    title: 'Boost Efficiency',
    description: 'Streamline your salon operations and save time with automated scheduling.',
    icon: Zap,
    color: 'bg-primary' // Use theme primary
  },
  {
    title: 'Increase Revenue',
    description: 'Grow your business with integrated marketing tools and online booking.',
    icon: TrendingUp,
    color: 'bg-secondary' // Use theme secondary
  },
  {
    title: 'Retain Clients',
    description: 'Build lasting relationships with comprehensive client management.',
    icon: Heart,
    color: 'bg-accent' // Use theme accent
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

// Define Zod schema for the subscription form
const subscriptionSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().optional(), // Optional name field
});
type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

export default function LandingPage() {
  const {
    marketingButtonTextColor,
    marketingHeaderBgType,
    marketingHeaderBgColor,
    marketingHeaderBgImageUrl,
    marketingHeaderTextColor,
    logoUrl
  } = useThemeStore((state) => state.currentTheme);
  
  // Get subscriber store action
  const addSubscriber = useSubscriberStore((state) => state.addSubscriber);

  // Setup form hook
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: { email: '', name: '' }
  });

  const onSubscribeSubmit = async (data: SubscriptionFormData) => {
    try {
      console.log("Subscription attempt:", data);
  
      // Make POST request using Axios
      const response = await axios.post(
        'https://kapperking.runasp.net/api/Home/AddSubscriber',
        data.email, // Send just the email string (not an object)
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      console.log("Subscription successful:", response.data);
      reset(); // Clear form on success
  
      // Optional: Show success toast
      // toast.success('Subscription successful!');
  
    } catch (error) {
      console.error("Subscription error:", error);
  
      // Handle Axios errors
      if (axios.isAxiosError(error)) {
        if (axios.isAxiosError(error)) {
          if (axios.isAxiosError(error)) {
            if (axios.isAxiosError(error)) {
              console.error("API Error:", error?.response?.data);
            } else {
              console.error("Unexpected Error:", error);
            }
          } else {
            console.error("Unexpected Error:", error);
          }
        } else {
          console.error("Unexpected Error:", error);
        }
        // Optional: Show error toast
        // toast.error(error.response?.data?.message || 'Subscription failed.');
      } else {
        console.error("Unexpected Error:", error);
        // toast.error('An unexpected error occurred.');
      }
    }
  };
  // const { theme } = useTheme(); // No longer needed
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      {/* Apply dynamic header styles */}
      {/* Redesigned Hero Section */}
      <div
        className="relative overflow-hidden bg-cover bg-center" // Added overflow-hidden
        style={{
          backgroundColor: marketingHeaderBgType === 'color' ? (marketingHeaderBgColor || '#6B46C1') : undefined, // Use primary as fallback color
          backgroundImage: marketingHeaderBgType === 'image' && marketingHeaderBgImageUrl ? `url(${marketingHeaderBgImageUrl})` : undefined,
          color: marketingHeaderTextColor || '#FFFFFF',
        }}
      >
         {/* Optional overlay for image background */}
         {marketingHeaderBgType === 'image' && marketingHeaderBgImageUrl && (
           <div className="absolute inset-0 bg-black/50 z-0"></div> // Ensure overlay is behind text
         )}
         {/* Regenerated Decorative Background Icons */}
         <Scissors className="absolute top-1/4 -left-16 h-40 w-40 text-white opacity-[0.03] transform -rotate-[25deg]" aria-hidden="true" />
         <Calendar className="absolute bottom-10 -right-10 h-56 w-56 text-white opacity-[0.03] transform rotate-[10deg]" aria-hidden="true" />
         <Users className="absolute top-10 right-1/3 h-32 w-32 text-white opacity-[0.03] transform rotate-[5deg]" aria-hidden="true" />
         <Smartphone className="absolute bottom-1/2 left-5 h-28 w-28 text-white opacity-[0.03] transform -rotate-[10deg]" aria-hidden="true" />
         <TrendingUp className="absolute top-3/4 -right-5 h-36 w-36 text-white opacity-[0.03] transform rotate-[18deg]" aria-hidden="true" />
         <Sparkles className="absolute top-5 left-10 h-24 w-24 text-white opacity-[0.03] transform -rotate-[5deg]" aria-hidden="true" />

        {/* Centered content */}
        <div className="relative max-w-4xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 text-center z-10">
          {/* Prominent Logo */}
           {/* <img
             src={logoUrl || '/logos/marketing-logo.png'}
             alt="KapperKing Logo"
             className="h-28 w-auto mx-auto mb-10 drop-shadow-lg transition-transform duration-300 hover:scale-105" // Larger size, more margin, hover scale effect
             onError={(e) => (e.currentTarget.src = '/logos/marketing-logo.png')} // Fallback
           /> */}
          <div className="max-w-2xl mx-auto"> {/* Center text content */}
            {/* Apply font-heading */}
            <h1
              className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl font-heading"
              style={{ color: marketingHeaderTextColor || '#FFFFFF' }} // Apply text color
            >
              <span className="block">The complete software</span>
              <span className="block opacity-80">for modern salons</span> {/* Use opacity for sub-headline */}
            </h1>
            {/* Use white or lighter shade */}
            <p
              className="mt-6 text-xl max-w-xl"
              style={{ color: marketingHeaderTextColor ? `${marketingHeaderTextColor}B3` : '#FFFFFFB3' }} // Apply text color with opacity (B3=70%)
            >
              Streamline your salon operations, boost appointments, and grow your business with our all-in-one platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md bg-secondary hover:opacity-90 transition-opacity"
                style={{ color: marketingButtonTextColor || '#FFFFFF' }} // Apply text color
              >
                Start free trial
              </Link>
              <Link
                to="/demo"
                className="inline-flex items-center px-6 py-3 border text-base font-medium rounded-md hover:bg-white/10 transition-colors"
                style={{ color: marketingHeaderTextColor || '#FFFFFF', borderColor: marketingHeaderTextColor || '#FFFFFF' }} // Apply text and border color
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
            {/* Apply font-heading */}
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl font-heading">
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
                  {/* Apply font-heading, use text-primary */}
                  <h3 className="mt-6 text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors font-heading">
                    {feature.name}
                  </h3>
                  <p className="mt-2 text-gray-500">{feature.description}</p>
                  {/* Use text-primary */}
                  <div className="mt-4 flex items-center text-primary group-hover:text-primary/80">
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
            {/* Apply font-heading */}
            <h2 className="text-3xl font-extrabold sm:text-4xl font-heading">
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
                {/* Apply font-heading */}
                <h3 className="mt-6 text-xl font-semibold font-heading">{benefit.title}</h3>
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
            {/* Apply font-heading */}
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl font-heading">
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
                  {/* Use bg-primary/10 and text-primary */}
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <testimonial.avatar className="h-6 w-6 text-primary" />
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
      {/* Use bg-primary */}
      <div className="relative py-16 sm:py-24 lg:py-32 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Apply font-heading */}
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl font-heading">
            <span className="block">Ready to transform your salon?</span>
            {/* Use white/lighter shade */}
            <span className="block text-white/80">Start your free trial today</span>
          </h2>
          {/* Use white/lighter shade */}
          <p className="mt-4 text-xl text-white/70">
            Try KapperKing free for 14 days. No credit card required.
          </p>
          <div className="mt-8 flex justify-center">
            {/* Link CTA to Pricing page */}
            <Link
              to="/pricing"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md bg-secondary hover:opacity-90 transition-opacity"
              style={{ color: marketingButtonTextColor || '#FFFFFF' }} // Apply text color
            >
              View Plans & Start Trial {/* Updated Text */}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Newsletter Subscription Section */}
      <div className="bg-gray-100 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 font-heading">
            Stay Updated
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest news, tips, and special offers for your salon.
          </p>
          {/* Subscription Form */}
          <form onSubmit={handleSubmit(onSubscribeSubmit)} className="mt-8 max-w-md mx-auto sm:flex sm:justify-center gap-3">
            <div className="min-w-0 flex-1">
              <label htmlFor="sub-email" className="sr-only">Email address</label>
              <Input
                id="sub-email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                className="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
            {/* Optional Name Field - uncomment if desired */}
            {/* <div className="min-w-0 flex-1 mt-3 sm:mt-0">
              <label htmlFor="sub-name" className="sr-only">Name (Optional)</label>
              <Input id="sub-name" type="text" placeholder="Your Name (Optional)" {...register('name')} className="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary" />
            </div> */}
            <div className="mt-3 sm:mt-0 sm:ml-3 sm:flex-shrink-0">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-white px-6 py-3" // Use theme colors
                style={{ color: marketingButtonTextColor || '#FFFFFF' }} // Apply text color
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </div>
          </form>
        </div>
      </div>
      {/* Footer comes after this */}
    </div>
  );
}