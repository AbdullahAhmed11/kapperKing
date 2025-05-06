import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const planSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  interval: z.enum(['monthly', 'yearly']),
  features: z.array(z.string()).min(1, 'At least one feature is required'),
  limits: z.object({
    staff: z.number().min(-1),
    clients: z.number().min(-1),
    storage: z.string()
  }),
  isPopular: z.boolean(),
  isActive: z.boolean()
});

type PlanFormData = z.infer<typeof planSchema>;

interface PlanFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PlanFormData) => Promise<void>;
  initialData?: Partial<PlanFormData>;
  title?: string;
}

export function SubscriptionPlanForm({ open, onClose, onSubmit, initialData, title = 'Add Plan' }: PlanFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      isPopular: false,
      isActive: true,
      ...initialData
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name">Plan Name</Label>
            <Input
              id="name"
              {...register('name')}
              className="mt-1"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                {...register('price', { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="interval">Billing Interval</Label>
              <select
                id="interval"
                {...register('interval')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Limits</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="limits.staff">Staff Limit</Label>
                <Input
                  id="limits.staff"
                  type="number"
                  {...register('limits.staff', { valueAsNumber: true })}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-gray-500">-1 for unlimited</p>
              </div>
              <div>
                <Label htmlFor="limits.clients">Client Limit</Label>
                <Input
                  id="limits.clients"
                  type="number"
                  {...register('limits.clients', { valueAsNumber: true })}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-gray-500">-1 for unlimited</p>
              </div>
              <div>
                <Label htmlFor="limits.storage">Storage</Label>
                <Input
                  id="limits.storage"
                  {...register('limits.storage')}
                  className="mt-1"
                  placeholder="e.g., 5GB"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Features</Label>
            <div className="mt-2 space-y-2">
              <textarea
                {...register('features')}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter features, one per line"
              />
              {errors.features && (
                <p className="mt-1 text-sm text-red-600">{errors.features.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('isPopular')}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Mark as Popular</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('isActive')}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}