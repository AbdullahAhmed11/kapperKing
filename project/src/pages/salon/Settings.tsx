import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSalonStore } from '@/lib/store/salon';
import { toast } from 'sonner';

const salonSettingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string(),
  timezone: z.string(),
  currency: z.string(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  customDomain: z.string().optional(),
  themeColors: z.object({
    primary: z.string(),
    secondary: z.string(),
  }),
});

type SalonSettingsFormData = z.infer<typeof salonSettingsSchema>;

export default function Settings() {
  const { currentSalon, updateSalon, loading } = useSalonStore();
  const { register, handleSubmit, formState: { errors, isDirty, isSubmitting } } = useForm<SalonSettingsFormData>({
    resolver: zodResolver(salonSettingsSchema),
    defaultValues: currentSalon || undefined,
  });

  const onSubmit = async (data: SalonSettingsFormData) => {
    if (!currentSalon) return;
    try {
      await updateSalon(currentSalon.id, data);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating salon settings:', error);
      toast.error('Failed to update settings');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6 divide-y divide-gray-200">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Salon Settings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your salon's profile, appearance, and operational settings.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pt-6">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <Label htmlFor="name">Salon Name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  className="mt-1"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="sm:col-span-4">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="mt-1"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="sm:col-span-4">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-6 pt-6">
            <h3 className="text-lg font-medium text-gray-900">Address</h3>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  {...register('address')}
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...register('city')}
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  {...register('postalCode')}
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="country">Country</Label>
                <select
                  id="country"
                  {...register('country')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="NL">Netherlands</option>
                  <option value="BE">Belgium</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                </select>
              </div>
            </div>
          </div>

          {/* Business Settings */}
          <div className="space-y-6 pt-6">
            <h3 className="text-lg font-medium text-gray-900">Business Settings</h3>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  {...register('timezone')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="Europe/Amsterdam">Europe/Amsterdam</option>
                  <option value="Europe/Brussels">Europe/Brussels</option>
                  <option value="Europe/Berlin">Europe/Berlin</option>
                  <option value="Europe/Paris">Europe/Paris</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  {...register('currency')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Online Presence */}
          <div className="space-y-6 pt-6">
            <h3 className="text-lg font-medium text-gray-900">Online Presence</h3>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  {...register('website')}
                  className="mt-1"
                  placeholder="https://"
                />
                {errors.website && (
                  <p className="mt-2 text-sm text-red-600">{errors.website.message}</p>
                )}
              </div>

              <div className="sm:col-span-4">
                <Label htmlFor="customDomain">Custom Domain</Label>
                <Input
                  id="customDomain"
                  {...register('customDomain')}
                  className="mt-1"
                  placeholder="yoursalon.com"
                />
              </div>
            </div>
          </div>

          {/* Theme Colors */}
          <div className="space-y-6 pt-6">
            <h3 className="text-lg font-medium text-gray-900">Theme Colors</h3>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <Input
                    type="color"
                    {...register('themeColors.primary')}
                    className="w-12 p-1 rounded-l-md border-r-0"
                  />
                  <Input
                    type="text"
                    {...register('themeColors.primary')}
                    className="flex-1 rounded-l-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <Input
                    type="color"
                    {...register('themeColors.secondary')}
                    className="w-12 p-1 rounded-l-md border-r-0"
                  />
                  <Input
                    type="text"
                    {...register('themeColors.secondary')}
                    className="flex-1 rounded-l-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!isDirty || isSubmitting}
                className="ml-3"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}