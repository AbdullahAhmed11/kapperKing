import React, { useEffect, useState } from 'react'; // Import useState
// Removed duplicate React import below
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Import Card components
import { Badge } from '@/components/ui/badge'; // Import Badge
import { Label } from '@/components/ui/label';
import { useCurrentSalonStore, Salon } from '@/lib/store/currentSalon';
import { ExternalLink } from 'lucide-react'; // Import ExternalLink icon
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react'; // Import Loader

// Schema matching editable fields in the 'salons' table and Salon interface
const salonSettingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').nullable(), // Allow null
  phone: z.string().optional().nullable(),
  address_line1: z.string().optional().nullable(), // Use snake_case from DB/interface
  address_line2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),
  currency: z.string().optional().nullable(),
  dashboard_primary_color: z.string().optional().nullable(), // Add dashboard color schema
  dashboard_secondary_color: z.string().optional().nullable(), // Add dashboard color schema
});

// Type for form data derived from schema
type SalonSettingsFormData = z.infer<typeof salonSettingsSchema>;

export default function Settings() {
  const [isConnectingStripe, setIsConnectingStripe] = useState(false); // State for button loading
  // Use the correct store
  const { currentSalon, updateCurrentSalonDetails, initiateStripeConnectOnboarding, loading, error } = useCurrentSalonStore(); // Add onboarding action

  const { register, handleSubmit, formState: { errors, isDirty, isSubmitting }, reset } = useForm<SalonSettingsFormData>({
    resolver: zodResolver(salonSettingsSchema),
    // Default values will be set by useEffect
  });

  // Populate form when currentSalon data loads or changes
  useEffect(() => {
    if (currentSalon) {
      reset({
        name: currentSalon.name || '',
        email: currentSalon.email || null,
        phone: currentSalon.phone || null,
        address_line1: currentSalon.address_line1 || null,
        address_line2: currentSalon.address_line2 || null,
        city: currentSalon.city || null,
        postal_code: currentSalon.postal_code || null,
        country: currentSalon.country || null,
        timezone: currentSalon.timezone || null,
        currency: currentSalon.currency || null,
        // Add dashboard colors to reset
        dashboard_primary_color: currentSalon.dashboard_primary_color || null,
        dashboard_secondary_color: currentSalon.dashboard_secondary_color || null,
      });
    }
  }, [currentSalon, reset]);

  const onSubmit = async (data: SalonSettingsFormData) => {
    if (!currentSalon?.id) {
       toast.error("Cannot update settings: Salon context missing.");
       return;
    }
    // The data object already matches the required Partial<Omit<...>> type
    // because the schema only includes editable fields.
    await updateCurrentSalonDetails(currentSalon.id, data);
    // Store action handles success/error toasts
    reset(data); // Reset dirty state after successful save
  };

  if (loading && !currentSalon) { // Show loading only if salon hasn't loaded yet
    return (
      <div className="flex items-center justify-center h-full p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
     return <div className="p-4 text-red-700">Error loading settings: {error}</div>;
  }

  if (!currentSalon) {
     return <div className="p-6 text-center text-gray-500">Salon data not available.</div>;
  }


  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6 divide-y divide-gray-200">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Salon Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your salon's profile and operational settings.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pt-6">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <Label htmlFor="name">Salon Name</Label>
                <Input id="name" {...register('name')} className="mt-1" />
                {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div className="sm:col-span-4">
                <Label htmlFor="email">Contact Email</Label>
                <Input id="email" type="email" {...register('email')} className="mt-1" />
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
              </div>
              <div className="sm:col-span-4">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" {...register('phone')} className="mt-1" />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-6 pt-6">
            <h3 className="text-lg font-medium text-gray-900">Address</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <Label htmlFor="address_line1">Street Address</Label>
                <Input id="address_line1" {...register('address_line1')} className="mt-1" />
              </div>
               <div className="sm:col-span-6">
                <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                <Input id="address_line2" {...register('address_line2')} className="mt-1" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register('city')} className="mt-1" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input id="postal_code" {...register('postal_code')} className="mt-1" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="country">Country</Label>
                {/* TODO: Use a proper country select component */}
                <Input id="country" {...register('country')} className="mt-1" />
              </div>
            </div>
          </div>

          {/* Business Settings */}
          <div className="space-y-6 pt-6">
            <h3 className="text-lg font-medium text-gray-900">Business Settings</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <Label htmlFor="timezone">Timezone</Label>
                {/* TODO: Use a proper timezone select component */}
                <Input id="timezone" {...register('timezone')} className="mt-1" />
              </div>
              <div className="sm:col-span-3">
                <Label htmlFor="currency">Currency</Label>
                 {/* TODO: Use a proper currency select component */}
                <Input id="currency" {...register('currency')} className="mt-1" />
              </div>
            </div>
          </div>

          {/* Dashboard Appearance */}
          <div className="space-y-6 pt-6">
            <h3 className="text-lg font-medium text-gray-900">Dashboard Appearance</h3>
            <p className="text-sm text-gray-500">Customize the primary and secondary colors of your salon dashboard sidebar and accents.</p>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
               {/* Primary Color */}
               <div className="sm:col-span-3">
                  <Label htmlFor="dashboardPrimaryColor">Dashboard Primary Color</Label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                     <Input
                        type="color"
                        id="dashboardPrimaryColor"
                        // Use defaultValue from currentSalon, register for form state
                        defaultValue={currentSalon?.dashboard_primary_color || '#4f46e5'} // Default Indigo
                        {...register('dashboard_primary_color')}
                        className="w-12 p-1 rounded-l-md border-r-0"
                     />
                     <Input
                        type="text"
                        // Use defaultValue from currentSalon, register for form state
                        defaultValue={currentSalon?.dashboard_primary_color || '#4f46e5'}
                        {...register('dashboard_primary_color')}
                        className="flex-1 rounded-l-none"
                     />
                  </div>
                  {errors.dashboard_primary_color && <p className="mt-1 text-sm text-red-600">{errors.dashboard_primary_color.message}</p>}
               </div>
               {/* Secondary Color */}
                <div className="sm:col-span-3">
                  <Label htmlFor="dashboardSecondaryColor">Dashboard Secondary Color</Label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                     <Input
                        type="color"
                        id="dashboardSecondaryColor"
                        defaultValue={currentSalon?.dashboard_secondary_color || '#ec4899'} // Default Pink
                        {...register('dashboard_secondary_color')}
                        className="w-12 p-1 rounded-l-md border-r-0"
                     />
                     <Input
                        type="text"
                        defaultValue={currentSalon?.dashboard_secondary_color || '#ec4899'}
                        {...register('dashboard_secondary_color')}
                        className="flex-1 rounded-l-none"
                     />
                  </div>
                  {errors.dashboard_secondary_color && <p className="mt-1 text-sm text-red-600">{errors.dashboard_secondary_color.message}</p>}
               </div>
               {/* TODO: Add Logo Upload field here */}
            </div>
             {/* Add fields for logo upload, maybe theme selection later */}
           </div>

           {/* Payment Gateway Integration */}
           <div className="space-y-6 pt-6">
             <h3 className="text-lg font-medium text-gray-900">Payment Settings</h3>
             <Card>
                <CardHeader>
                   <CardTitle className="text-base">Stripe Connection</CardTitle>
                   <CardDescription>Connect your Stripe account to accept online payments for products or appointment deposits.</CardDescription>
                </CardHeader>
                <CardContent>
                   {currentSalon?.stripe_connect_account_id ? (
                      <div className="flex items-center space-x-3">
                         <span className="text-sm font-medium text-green-600">Stripe Account Connected</span>
                         <Badge variant="secondary">{currentSalon.stripe_connect_account_id}</Badge>
                         {/* TODO: Add button to view Stripe Dashboard or disconnect */}
                      </div>
                   ) : (
                      <Button
                         onClick={async () => {
                            if (!currentSalon?.id) return;
                            setIsConnectingStripe(true);
                            const onboardingUrl = await initiateStripeConnectOnboarding(currentSalon.id);
                            if (onboardingUrl) {
                               window.location.href = onboardingUrl; // Redirect user to Stripe
                            } else {
                               // Error toast handled in store action
                               setIsConnectingStripe(false);
                            }
                         }}
                         disabled={isConnectingStripe || loading}
                      >
                         {isConnectingStripe && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                         Connect with Stripe
                         <ExternalLink className="ml-2 h-4 w-4"/>
                      </Button>
                   )}
                </CardContent>
             </Card>
             {/* TODO: Add Mollie Integration section if needed */}
           </div>

           {/* Removed duplicate placeholder section */}
          <div className="pt-6">
            <div className="flex justify-end">
              <Button type="submit" disabled={!isDirty || isSubmitting || loading} className="ml-3">
                {(isSubmitting || loading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}