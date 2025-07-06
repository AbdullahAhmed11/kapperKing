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

interface Owner {
  firstName: string;
  lastName: string;
  id: number;
}

interface Plan {
  id: number;
  name: string;
  description: string;
  annualPrice: number;
  manthlyPrice: number;
  maxSalons: number;
  staffLimit: number;
  clientLimit: number;
  isPopular: boolean;
  features: string[];
}

const salonSchema = z.object({
  Name: z.string().min(1, 'Name is required'),
  Address: z.string().min(1, 'Address is required'),
  City: z.string().min(1, 'City is required'),
  PostalCode: z.string().min(1, 'Postal Code is required'),
  Country: z.string().min(1, 'Country is required'),
  SalonPhone: z.string().min(1, 'Phone is required'),
  Email: z.string().email('Invalid email'),
  Password: z.string().min(6, 'Password must be at least 6 characters'),
  OwnerId: z.string().min(1, 'Owner is required'),
  PlanId: z.string().min(1, 'Plan is required'),
  Latitude: z.string().min(1, 'Latitude is required'),
  Longitude: z.string().min(1, 'Longitude is required'),
});

type SalonFormData = z.infer<typeof salonSchema>;

const AddSalonForm = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SalonFormData>({
    resolver: zodResolver(salonSchema),
  });

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await fetch('https://kapperking.runasp.net/api/Owners/GetOwners');
        const data = await res.json();
        setOwners(data || []);
      } catch (error) {
        console.error('Failed to fetch owners:', error);
      }
    };
    fetchOwners();
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('https://kapperking.runasp.net/api/Home/GetPlans');
        const data = await res.json();
        setPlans(data || []);
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      }
    };
    fetchPlans();
  }, []);

const onSubmit = async (data: SalonFormData) => {
  const formData = new FormData();

  // Manually append each field
  formData.append("Name", data.Name);
  formData.append("Address", data.Address);
  formData.append("City", data.City);
  formData.append("PostalCode", data.PostalCode);
  formData.append("Country", data.Country);
  formData.append("SalonPhone", data.SalonPhone);
  formData.append("Email", data.Email);
  formData.append("Password", data.Password);
  formData.append("SubscriptionId", `1`);
  formData.append("OwnerId", data.OwnerId);
  formData.append("PlanId", data.PlanId);
  formData.append("Latitude", data.Latitude);
  formData.append("Longitude", data.Longitude);

  try {
    const response = await fetch('https://kapperking.runasp.net/api/Salons/AddSalon', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('API validation errors:', result);
      throw new Error('Failed to create salon');
    }

    console.log('Salon created:', result);
    reset();
    onClose();
  } catch (error) {
    console.error('Error:', error);
  }
};


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
        style={{ scrollbarWidth: 'thin' }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Add New Salon</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Name', name: 'Name' },
              { label: 'Address', name: 'Address' },
              { label: 'City', name: 'City' },
              { label: 'Postal Code', name: 'PostalCode' },
              { label: 'Country', name: 'Country' },
              { label: 'Phone', name: 'SalonPhone' },
              { label: 'Email', name: 'Email' },
              { label: 'Password', name: 'Password', type: 'password' },
              { label: 'Latitude', name: 'Latitude' },
              { label: 'Longitude', name: 'Longitude' },
            ].map((field) => (
              <div key={field.name}>
                <Label htmlFor={field.name}>{field.label}</Label>
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
            <Label htmlFor="OwnerId">Owner</Label>
            <select
              id="OwnerId"
              {...register('OwnerId')}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              defaultValue=""
            >
              <option value="" disabled>Select an owner</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.firstName} {owner.lastName}
                </option>
              ))}
            </select>
            {errors.OwnerId && (
              <p className="text-sm text-red-500 mt-1">{errors.OwnerId.message}</p>
            )}
          </div>

          {/* Plan Select */}
          <div>
            <Label htmlFor="PlanId">Plan</Label>
            <select
              id="PlanId"
              {...register('PlanId')}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
              defaultValue=""
            >
              <option value="" disabled>Select a plan</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
            {errors.PlanId && (
              <p className="text-sm text-red-500 mt-1">{errors.PlanId.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? 'Creating...' : 'Create Salon'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSalonForm;
