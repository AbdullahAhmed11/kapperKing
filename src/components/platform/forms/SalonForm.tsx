import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

import { Salon } from '@/lib/store/salons'; // Import Salon type
import { Client } from '@/lib/store/clients'; // Import Client type

// Schema for adding/editing a salon, requires selecting a client owner
const salonSchema = z.object({
  ownerId: z.coerce.number().min(1, 'Please select a client owner'), // Convert string to number
  name: z.string().min(2, 'Salon name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  salonPhone: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')), // Allow empty string or valid URL
});

// Type for form data
type SalonFormData = z.infer<typeof salonSchema>;

// Type for the data expected by the onSubmit prop (matches store action)
export type SalonSubmitData = Omit<Salon, 'id' | 'createdAt' | 'slug'>;

interface SalonFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SalonSubmitData) => Promise<void>; // Expects data for store action
  initialData?: Salon | null; // For editing
  preselectedClientId?: string | null; // For pre-selecting client when adding from client card
  availableClients: Client[]; // List of clients to choose from
  title?: string;
}

export function SalonForm({ 
  open, 
  onClose, 
  onSubmit, 
  initialData, 
  preselectedClientId,
  availableClients,
  title = initialData ? 'Edit Salon' : 'Add New Salon' 
}: SalonFormProps) {
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<SalonFormData>({
    resolver: zodResolver(salonSchema),
    defaultValues: {
      ownerId: preselectedClientId || initialData?.ownerId || '',
      name: initialData?.name ?? '',
      address: initialData?.address ?? '',
      city: initialData?.city ?? '',
      postalCode: initialData?.postalCode ?? '',
      country: initialData?.country ?? '',
      salonPhone: initialData?.salonPhone ?? '',
      website: initialData?.website ?? '',
    }
  });

  // Reset form when dialog opens or initialData/preselectedClientId changes
  useEffect(() => {
    console.log(initialData, "initialData")
    if (open) {
      const defaults = {
        ownerId: preselectedClientId || initialData?.ownerId || '',
        name: initialData?.name ?? '',
        address: initialData?.address ?? '',
        city: initialData?.city ?? '',
        postalCode: initialData?.postalCode ?? '',
        country: initialData?.country ?? '',
        salonPhone: initialData?.salonPhone ?? '',
        website: initialData?.website ?? '',
      };
      console.log("SalonForm: Resetting with defaults:", defaults);
      reset(defaults);
    }
  }, [initialData, preselectedClientId, open, reset]);

  // Handle form submission - data here matches SalonFormData
  const handleFormSubmit = async (formData: SalonFormData) => {
    // The onSubmit prop expects SalonSubmitData
    await onSubmit(formData); 
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form id="salonForm" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          
          {/* Client Owner Selection */}
          <div>
            <Label htmlFor="clientId">Client Owner</Label>
            <select
              id="clientId"
              {...register('ownerId')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-10"
              disabled={!!initialData || !!preselectedClientId} // Disable if editing or preselected
            >
              <option value="">Select Client...</option>
              {availableClients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName} ({client.email})
                </option>
              ))}
            </select>
            {errors.ownerId && <p className="mt-1 text-sm text-red-600">{errors.ownerId.message}</p>}
          </div>

          {/* Salon Details */}
          <div>
            <Label htmlFor="name">Salon Name</Label>
            <Input id="name" {...register('name')} className="mt-1 h-10" />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} className="mt-1 h-10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register('city')} className="mt-1 h-10" />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" {...register('postalCode')} className="mt-1 h-10" />
            </div>
             <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...register('country')} className="mt-1 h-10" />
            </div>
          </div>
           <div>
            <Label htmlFor="salonPhone">Phone</Label>
            <Input id="salonPhone" type="tel" {...register('salonPhone')} className="mt-1 h-10" />
          </div>
           <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" type="url" {...register('website')} className="mt-1 h-10" placeholder="https://..." />
             {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>}
          </div>

        </form>
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="salonForm" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Salon')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}