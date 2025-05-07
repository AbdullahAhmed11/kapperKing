import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useSubscriptionPlanStore, selectAllPlans } from '@/lib/store/subscriptionPlans';
import SubscriptionPlans from '@/pages/platform/SubscriptionPlans';
const planSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  annualPrice: z.number().min(0, 'Annual Price must be 0 or greater'),
  manthlyPrice: z.number().min(0, 'Monthly Price must be 0 or greater'),
  maxSalons: z.number().min(-1, 'Use -1 for unlimited'),
  staffLimit: z.number().min(-1, 'Use -1 for unlimited'),
  clientLimit: z.number().min(-1, 'Use -1 for unlimited'),
  isPopular: z.boolean(),
  features: z.string().min(1, 'At least one feature is required (one per line)'),
});

type PlanFormData = z.infer<typeof planSchema>;

interface PlanFormProps {
  open: boolean;
  onClose: () => void;
  onPlanAdded: () => void;
  initialData?: SubscriptionPlan | null;
}

export function EditSub({ open, onClose, onPlanAdded, initialData }: PlanFormProps) {
  const { addPlan, updatePlan } = useSubscriptionPlanStore();
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    reset 
  } = useForm<PlanFormData>({ 
    resolver: zodResolver(planSchema),
    defaultValues: getDefaultValues(initialData)
  });

  // Set form values when opening or when initialData changes
  useEffect(() => {
    if (open) {
      reset(getDefaultValues(initialData));
    }
  }, [open, initialData, reset]);

  const onSubmit = async (data: PlanFormData) => {
    try {
      if (initialData) {
        // Update existing plan
        const result = await updatePlan(initialData.id, {
          name: data.name,
          description: data.description,
          priceAnnual: data.annualPrice,
          priceMonthly: data.manthlyPrice,
          maxSalons: data.maxSalons,
          limits: {
            staff: data.staffLimit,
            clients: data.clientLimit,
          },
          isPopular: data.isPopular,
          features: data.features,
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to update plan');
        }

        toast.success('Plan updated successfully');
      } else {
        // Add new plan
        await addPlan({
          name: data.name,
          description: data.description,
          priceAnnual: data.annualPrice,
          priceMonthly: data.manthlyPrice,
          maxSalons: data.maxSalons,
          limits: {
            staff: data.staffLimit,
            clients: data.clientLimit,
          },
          isPopular: data.isPopular,
          features: data.features,
          interval: 'monthly', // Default value
          isActive: true, // Default value
          trialDuration: 14, // Default value
        });

        toast.success('Plan added successfully');
      }

      onPlanAdded();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save plan');
      console.error('Error saving plan:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Name */}
          <div>
            <Label htmlFor="name">Plan Name*</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description*</Label>
            <textarea
              id="description"
              {...register('description')}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="annualPrice">Annual Price (€)*</Label>
              <Input 
                id="annualPrice" 
                type="number" 
                step="0.01" 
                {...register('annualPrice', { valueAsNumber: true })} 
              />
              {errors.annualPrice && <p className="mt-1 text-sm text-red-600">{errors.annualPrice.message}</p>}
            </div>
            <div>
              <Label htmlFor="manthlyPrice">Monthly Price (€)*</Label>
              <Input 
                id="manthlyPrice" 
                type="number" 
                step="0.01" 
                {...register('manthlyPrice', { valueAsNumber: true })} 
              />
              {errors.manthlyPrice && <p className="mt-1 text-sm text-red-600">{errors.manthlyPrice.message}</p>}
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="maxSalons">Max Salons</Label>
              <Input 
                id="maxSalons" 
                type="number" 
                {...register('maxSalons', { valueAsNumber: true })} 
              />
              <p className="mt-1 text-xs text-gray-500">-1 for unlimited</p>
              {errors.maxSalons && <p className="mt-1 text-sm text-red-600">{errors.maxSalons.message}</p>}
            </div>
            <div>
              <Label htmlFor="staffLimit">Staff Limit</Label>
              <Input 
                id="staffLimit" 
                type="number" 
                {...register('staffLimit', { valueAsNumber: true })} 
              />
              <p className="mt-1 text-xs text-gray-500">-1 for unlimited</p>
              {errors.staffLimit && <p className="mt-1 text-sm text-red-600">{errors.staffLimit.message}</p>}
            </div>
            <div>
              <Label htmlFor="clientLimit">Client Limit</Label>
              <Input 
                id="clientLimit" 
                type="number" 
                {...register('clientLimit', { valueAsNumber: true })} 
              />
              <p className="mt-1 text-xs text-gray-500">-1 for unlimited</p>
              {errors.clientLimit && <p className="mt-1 text-sm text-red-600">{errors.clientLimit.message}</p>}
            </div>
          </div>

          {/* Features */}
          <div>
            <Label htmlFor="features">Features* (One per line)</Label>
            <textarea
              id="features"
              {...register('features')}
              rows={5}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm font-mono"
              placeholder="Feature 1\nFeature 2\nFeature 3"
            />
            {errors.features && <p className="mt-1 text-sm text-red-600">{errors.features.message}</p>}
          </div>

          {/* Popular Flag */}
          <div className="flex items-center space-x-6 pt-4 border-t">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                {...register('isPopular')} 
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
              />
              <span className="ml-2 text-sm text-gray-700">Mark as Popular</span>
            </label>
          </div>
        </form>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : initialData ? 'Update Plan' : 'Create Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function for default values
function getDefaultValues(initialData?: SubscriptionPlan | null): PlanFormData {
  return initialData ? {
    name: initialData.name,
    description: initialData.description ?? '',
    annualPrice: initialData.priceAnnual ?? 0,
    manthlyPrice: initialData.priceMonthly ?? 0,
    maxSalons: initialData.maxSalons ?? 1,
    staffLimit: initialData.limits?.staff ?? -1,
    clientLimit: initialData.limits?.clients ?? -1,
    isPopular: initialData.isPopular ?? false,
    features: initialData.features?.join('\n') ?? '',
  } : {
    name: '',
    description: '',
    annualPrice: 0,
    manthlyPrice: 0,
    maxSalons: 1,
    staffLimit: -1,
    clientLimit: -1,
    isPopular: false,
    features: '',
  };
}