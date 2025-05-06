import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const salonSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  owner: z.object({
    name: z.string().min(2, 'Owner name is required'),
    email: z.string().email('Invalid email address')
  }),
  location: z.object({
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    country: z.string().min(2, 'Country is required')
  }),
  subscription: z.object({
    plan: z.string(),
    status: z.string()
  })
});

type SalonFormData = z.infer<typeof salonSchema>;

interface SalonFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SalonFormData) => Promise<void>;
  initialData?: Partial<SalonFormData>;
  title?: string;
}

export function SalonForm({ open, onClose, onSubmit, initialData, title = 'Add Salon' }: SalonFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SalonFormData>({
    resolver: zodResolver(salonSchema),
    defaultValues: initialData
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name">Salon Name</Label>
            <Input
              id="name"
              {...register('name')}
              className="mt-1"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Owner Information</h3>
            <div>
              <Label htmlFor="owner.name">Owner Name</Label>
              <Input
                id="owner.name"
                {...register('owner.name')}
                className="mt-1"
              />
              {errors.owner?.name && (
                <p className="mt-1 text-sm text-red-600">{errors.owner.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="owner.email">Owner Email</Label>
              <Input
                id="owner.email"
                type="email"
                {...register('owner.email')}
                className="mt-1"
              />
              {errors.owner?.email && (
                <p className="mt-1 text-sm text-red-600">{errors.owner.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Location</h3>
            <div>
              <Label htmlFor="location.address">Address</Label>
              <Input
                id="location.address"
                {...register('location.address')}
                className="mt-1"
              />
              {errors.location?.address && (
                <p className="mt-1 text-sm text-red-600">{errors.location.address.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location.city">City</Label>
                <Input
                  id="location.city"
                  {...register('location.city')}
                  className="mt-1"
                />
                {errors.location?.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.city.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="location.country">Country</Label>
                <Input
                  id="location.country"
                  {...register('location.country')}
                  className="mt-1"
                />
                {errors.location?.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.country.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Subscription</h3>
            <div>
              <Label htmlFor="subscription.plan">Plan</Label>
              <select
                id="subscription.plan"
                {...register('subscription.plan')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="basic">Basic</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <Label htmlFor="subscription.status">Status</Label>
              <select
                id="subscription.status"
                {...register('subscription.status')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="trial">Trial</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Salon'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}