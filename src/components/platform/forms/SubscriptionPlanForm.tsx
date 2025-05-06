import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Updated schema to match API requirements
const planSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  annualPrice: z.number().min(0, 'Annual Price must be 0 or greater'),
  manthlyPrice: z.number().min(0, 'Monthly Price must be 0 or greater'), // Changed from priceMonthly to manthlyPrice
  maxSalons: z.number().min(-1, 'Use -1 for unlimited'),
  staffLimit: z.number().min(-1, 'Use -1 for unlimited'), // Changed from limits.staff
  clientLimit: z.number().min(-1, 'Use -1 for unlimited'), // Changed from limits.clients
  isPopular: z.boolean(),
  features: z.string().min(1, 'At least one feature is required (one per line)'),
});

type PlanFormData = z.infer<typeof planSchema>;

interface PlanFormProps {
  open: boolean;
  onClose: () => void;
  onPlanAdded: () => void; // New prop to refresh plans after addition
  initialData?: any | null;
  title?: string;
  onSubmit?: (data: PlanFormData) => Promise<void>;
}

export function SubscriptionPlanForm({ open, onClose, onPlanAdded, initialData, title = 'Add Plan' }: PlanFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<PlanFormData>({ 
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      description: '',
      annualPrice: 0,
      manthlyPrice: 0,
      maxSalons: 1,
      staffLimit: -1,
      clientLimit: -1,
      isPopular: false,
      features: '',
    }
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name,
          description: initialData.description ?? '',
          annualPrice: initialData.priceAnnual ?? 0,
          manthlyPrice: initialData.priceMonthly ?? 0,
          maxSalons: initialData.maxSalons ?? 1,
          staffLimit: initialData.limits?.staff ?? -1,
          clientLimit: initialData.limits?.clients ?? -1,
          isPopular: initialData.isPopular ?? false,
          features: initialData.features?.join('\n') ?? '',
        });
      } else {
        reset({
          name: '',
          description: '',
          annualPrice: 0,
          manthlyPrice: 0,
          maxSalons: 1,
          staffLimit: -1,
          clientLimit: -1,
          isPopular: false,
          features: '',
        });
      }
    }
  }, [initialData, open, reset]);

  const onSubmit = async (data: PlanFormData) => {
    try {
      // Convert features string to array
      const featuresArray = data.features.split('\n').map(f => f.trim()).filter(f => f);
      
      const response = await fetch('https://kapperking.runasp.net/api/SuperAdmin/AddPlan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${yourToken}`
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          annualPrice: data.annualPrice,
          manthlyPrice: data.manthlyPrice,
          maxSalons: data.maxSalons,
          staffLimit: data.staffLimit,
          clientLimit: data.clientLimit,
          isPopular: data.isPopular,
          features: featuresArray,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add plan');
      }

      toast.success('Plan added successfully');
      onPlanAdded(); // Refresh the plans list
      onClose(); // Close the dialog
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add plan');
      console.error('Error adding plan:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          
          <div>
            <Label htmlFor="name">Plan Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea id="description" {...register('description')} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="annualPrice">Annual Price (€)</Label>
              <Input id="annualPrice" type="number" step="0.01" {...register('annualPrice', { valueAsNumber: true })} />
              {errors.annualPrice && <p className="mt-1 text-sm text-red-600">{errors.annualPrice.message}</p>}
            </div>
            <div>
              <Label htmlFor="manthlyPrice">Monthly Price (€)</Label>
              <Input id="manthlyPrice" type="number" step="0.01" {...register('manthlyPrice', { valueAsNumber: true })} />
              {errors.manthlyPrice && <p className="mt-1 text-sm text-red-600">{errors.manthlyPrice.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="maxSalons">Max Salons</Label>
              <Input id="maxSalons" type="number" {...register('maxSalons', { valueAsNumber: true })} />
              <p className="mt-1 text-xs text-gray-500">-1 for unlimited</p>
              {errors.maxSalons && <p className="mt-1 text-sm text-red-600">{errors.maxSalons.message}</p>}
            </div>
            <div>
              <Label htmlFor="staffLimit">Staff Limit</Label>
              <Input id="staffLimit" type="number" {...register('staffLimit', { valueAsNumber: true })} />
              <p className="mt-1 text-xs text-gray-500">-1 for unlimited</p>
              {errors.staffLimit && <p className="mt-1 text-sm text-red-600">{errors.staffLimit.message}</p>}
            </div>
            <div>
              <Label htmlFor="clientLimit">Client Limit</Label>
              <Input id="clientLimit" type="number" {...register('clientLimit', { valueAsNumber: true })} />
              <p className="mt-1 text-xs text-gray-500">-1 for unlimited</p>
              {errors.clientLimit && <p className="mt-1 text-sm text-red-600">{errors.clientLimit.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="features">Features (One per line)</Label>
            <textarea
              id="features"
              {...register('features')}
              rows={5}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm font-mono"
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
            />
            {errors.features && <p className="mt-1 text-sm text-red-600">{errors.features.message}</p>}
          </div>

          <div className="flex items-center space-x-6 pt-4 border-t">
            <label className="flex items-center">
              <input type="checkbox" {...register('isPopular')} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <span className="ml-2 text-sm text-gray-700">Mark as Popular</span>
            </label>
          </div>
        </form>
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}