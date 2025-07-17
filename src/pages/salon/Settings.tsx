import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

type JwtPayload = {
  Id: number;
  email?: string;
  name?: string;
  FirstName?: string;
  LastName?: string;
};

type SalonData = {
  id: number;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  salonPhone: string;
  website: string;
  ownerId: number;
  subscriptionId: number;
  email: string;
  primaryColor: string | null;
  secondaryColor: string | null;
  longitude: number;
  latitude: number;
  image: string | null;
  stripeAccountId?: string | null;
};

const salonSettingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  salonPhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  primaryColor: z.string().optional().nullable(),
  secondaryColor: z.string().optional().nullable(),
  image: z.instanceof(FileList).optional().nullable(),
});

type SalonSettingsFormData = z.infer<typeof salonSettingsSchema>;

export default function Settings() {
const [salonData, setSalonData] = useState<SalonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = Cookies.get('salonUser');
  const decoded = token ? jwtDecode<JwtPayload>(token) : undefined;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SalonSettingsFormData>({
    resolver: zodResolver(salonSettingsSchema),
  });

  // Watch color fields to ensure they update properly
  const primaryColor = watch('primaryColor');
  const secondaryColor = watch('secondaryColor');

  useEffect(() => {
    const fetchSalonData = async () => {
      try {
        const response = await axios.get(`https://kapperking.runasp.net/api/Salons/GetSalonById/${decoded?.Id}`);
        setSalonData(response.data);
        reset({
          name: response.data.name,
          email: response.data.email,
          salonPhone: response.data.salonPhone,
          address: response.data.address,
          city: response.data.city,
          postalCode: response.data.postalCode,
          country: response.data.country,
          primaryColor: response.data.primaryColor || '#4f46e5',
          secondaryColor: response.data.secondaryColor || '#ec4899',
        });
      } catch (err) {
        setError('Failed to fetch salon data');
        toast.error('Failed to load salon settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSalonData();
  }, [reset]);

  const connectStripeAccount = async () => {
    try {
      setConnectingStripe(true);
      // Replace with your actual Stripe connection endpoint
      const response = await axios.post('https://kapperking.runasp.net/api/Payment/ConnectStripe', {
        salonId: salonData?.id,
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      toast.error('Failed to connect Stripe account');
    } finally {
      setConnectingStripe(false);
    }
  };

  const onSubmit = async (data: SalonSettingsFormData) => {
    try {
      const formData = new FormData();
      
      // Append all fields to FormData
      formData.append('Id', salonData?.id.toString() || '');
      formData.append('Name', data.name);
      formData.append('Email', data.email);
      formData.append('SalonPhone', data.salonPhone || '');
      formData.append('Address', data.address || '');
      formData.append('City', data.city || '');
      formData.append('PostalCode', data.postalCode || '');
      formData.append('Country', data.country || '');
      
      // Ensure color fields are properly included
      formData.append('PrimaryColor', data.primaryColor || '');
      formData.append('SecondaryColor', data.secondaryColor || '');
      
      // Append image if it exists
      if (data.image && data.image.length > 0) {
        formData.append('Image', data.image[0]);
      }

      const response = await axios.put(
        'https://kapperking.runasp.net/api/Salons/EditSalon',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('Salon settings updated successfully');
      
      // Update local state with new data
      if (response.data) {
        setSalonData(response.data);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update salon settings');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setValue('image', e.target.files);
    }
  };

  const handleColorChange = (field: 'primaryColor' | 'secondaryColor', value: string) => {
    setValue(field, value, { shouldValidate: true });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!salonData) {
    return <div className="p-4">No salon data available</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
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
                <Input
                  id="name"
                  type="text"
                  {...register('name')}
                  className="mt-1 block w-full"
                  placeholder="My Salon"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              <div className="sm:col-span-4">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="mt-1 block w-full"
                  placeholder="example@salon.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div className="sm:col-span-4">
                <Label htmlFor="salonPhone">Phone</Label>
                <Input
                  id="salonPhone"
                  type="tel"
                  {...register('salonPhone')}
                  className="mt-1 block w-full"
                  placeholder="+1 555-1234"
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
                  type="text"
                  {...register('address')}
                  className="mt-1 block w-full"
                  placeholder="123 Main St"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  {...register('city')}
                  className="mt-1 block w-full"
                  placeholder="New York"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  type="text"
                  {...register('postalCode')}
                  className="mt-1 block w-full"
                  placeholder="10001"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  type="text"
                  {...register('country')}
                  className="mt-1 block w-full"
                  placeholder="USA"
                />
              </div>
            </div>
          </div>

          {/* Dashboard Appearance */}
      <div className="space-y-6 pt-6">
          <h3 className="text-lg font-medium text-gray-900">Dashboard Appearance</h3>
          <p className="text-sm text-gray-500">
            Customize the primary and secondary colors of your salon dashboard.
          </p>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="color"
                  value={primaryColor || '#4f46e5'}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="w-12 p-1 rounded-l-md border-r-0"
                />
                <Input
                  id="primaryColor"
                  type="text"
                  value={primaryColor || ''}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="flex-1 rounded-l-none"
                />
              </div>
              {errors.primaryColor && (
                <p className="mt-1 text-sm text-red-600">{errors.primaryColor.message}</p>
              )}
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="color"
                  value={secondaryColor || '#ec4899'}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className="w-12 p-1 rounded-l-md border-r-0"
                />
                <Input
                  id="secondaryColor"
                  type="text"
                  value={secondaryColor || ''}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className="flex-1 rounded-l-none"
                />
              </div>
              {errors.secondaryColor && (
                <p className="mt-1 text-sm text-red-600">{errors.secondaryColor.message}</p>
              )}
            </div>
          </div>
        </div>

          {/* Image Upload */}
          <div className="space-y-6 pt-6">
            <h3 className="text-lg font-medium text-gray-900">Salon Image</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <Label htmlFor="image">Upload New Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="mt-1 block w-full"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                {salonData.image && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Current Image:</p>
                    <img 
                      src={salonData.image} 
                      alt="Salon" 
                      className="mt-1 h-32 w-32 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Website */}
          {salonData.website && (
            <div className="pt-6">
              <Label>Website</Label>
              <div className="mt-1 flex items-center">
                <a
                  href={salonData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  {salonData.website} <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>
          )}
        <div className="space-y-6 pt-6">
          <h3 className="text-lg font-medium text-gray-900">Payment Settings</h3>
          <div className="border rounded-lg p-4 shadow-sm">
            <h4 className="text-base font-semibold">Stripe Connection</h4>
            <p className="text-sm text-gray-500">
              Connect your Stripe account to accept online payments for products or appointment deposits.
            </p>
            
            {salonData.stripeAccountId ? (
              <div className="mt-4 flex items-center space-x-3">
                <span className="text-sm font-medium text-green-600">Stripe Account Connected</span>
                <span className="bg-gray-100 text-sm px-2 py-1 rounded">
                  {salonData.stripeAccountId}
                </span>
              </div>
            ) : (
              <div className="mt-4">
                <Button
                  type="button"
                  onClick={connectStripeAccount}
                  disabled={connectingStripe}
                >
                  {connectingStripe ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect Stripe Account'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
          {/* Submit Button */}
          <div className="pt-6">
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}