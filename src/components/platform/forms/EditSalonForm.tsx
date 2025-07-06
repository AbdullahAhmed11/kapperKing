import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Owner {
  id: number;
  firstName: string;
  lastName: string;
}

interface Plan {
  id: number;
  name: string;
}

const salonSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().min(1, 'Postal Code is required'),
  country: z.string().min(1, 'Country is required'),
  salonPhone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  ownerId: z.string().min(1, 'Owner is required'),
  subscriptionId: z.string().min(1, 'Subscription is required'),
  longitude: z.string().min(1, 'Longitude is required'),
  latitude: z.string().min(1, 'Latitude is required'),
  website: z.string().optional(),
});

type SalonFormData = z.infer<typeof salonSchema>;

interface EditSalonFormProps {
  open: boolean;
  onClose: () => void;
  salonId: number | null;
  onSuccess: () => void;
}

const EditSalonForm = ({ open, onClose, salonId, onSuccess }: EditSalonFormProps) => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<SalonFormData>();

  // Fetch salon data when the dialog opens or salonId changes
  useEffect(() => {
    const fetchSalonData = async () => {
      if (!open || !salonId) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`https://kapperking.runasp.net/api/Salons/GetSalonById/${salonId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch salon data');
        }
        const salonData = await response.json();

        // Map API response to form fields
        setValue('name', salonData.name);
        setValue('address', salonData.address);
        setValue('city', salonData.city);
        setValue('postalCode', salonData.postalCode);
        setValue('country', salonData.country);
        setValue('salonPhone', salonData.salonPhone);
        setValue('email', salonData.email);
        setValue('ownerId', salonData.ownerId.toString());
        setValue('subscriptionId', salonData.subscriptionId.toString());
        setValue('longitude', salonData.longitude.toString());
        setValue('latitude', salonData.latitude.toString());
        if (salonData.website) {
          setValue('website', salonData.website);
        }
      } catch (error) {
        console.error('Error fetching salon data:', error);
        toast.error('Failed to load salon data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalonData();
  }, [open, salonId, setValue]);

  // Fetch owners and plans
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ownersRes, plansRes] = await Promise.all([
          fetch('https://kapperking.runasp.net/api/Owners/GetOwners'),
          fetch('https://kapperking.runasp.net/api/Home/GetPlans')
        ]);
        
        const ownersData = await ownersRes.json();
        const plansData = await plansRes.json();
        
        setOwners(ownersData || []);
        setPlans(plansData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  const onSubmit = async (data: SalonFormData) => {
    if (!salonId) {
      toast.error('No salon selected for editing');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Append all form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Include the salon ID in the request
      formData.append('id', salonId.toString());

      const response = await fetch('https://kapperking.runasp.net/api/Salons/EditSalon', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update salon');
      }

      toast.success('Salon updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating salon:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update salon');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
        style={{ scrollbarWidth: 'thin' }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {isLoading ? 'Loading Salon Data...' : 'Edit Salon'}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading salon data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Name', name: 'name' },
                { label: 'Address', name: 'address' },
                { label: 'City', name: 'city' },
                { label: 'Postal Code', name: 'postalCode' },
                { label: 'Country', name: 'country' },
                { label: 'Phone', name: 'salonPhone' },
                { label: 'Email', name: 'email' },
                { label: 'Password', name: 'password', type: 'password', optional: true },
                { label: 'Website', name: 'website', optional: true },
                { label: 'Longitude', name: 'longitude' },
                { label: 'Latitude', name: 'latitude' },
              ].map((field) => (
                <div key={field.name}>
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.optional && <span className="text-gray-500 ml-1">(optional)</span>}
                  </Label>
                  <Input
                    id={field.name}
                    type={field.type || 'text'}
                    {...register(field.name as keyof SalonFormData)}
                  />
                  {errors[field.name as keyof SalonFormData] && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors[field.name as keyof SalonFormData]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Owner Select */}
            <div>
              <Label htmlFor="ownerId">Owner</Label>
              <select
                id="ownerId"
                {...register('ownerId')}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              >
                <option value="">Select an owner</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.firstName} {owner.lastName}
                  </option>
                ))}
              </select>
              {errors.ownerId && (
                <p className="text-sm text-red-500 mt-1">{errors.ownerId.message}</p>
              )}
            </div>

            {/* Subscription Select */}
            <div>
              <Label htmlFor="subscriptionId">Subscription</Label>
              <select
                id="subscriptionId"
                {...register('subscriptionId')}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              >
                <option value="">Select a subscription</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
              {errors.subscriptionId && (
                <p className="text-sm text-red-500 mt-1">{errors.subscriptionId.message}</p>
              )}
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? 'Updating...' : 'Update Salon'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditSalonForm;