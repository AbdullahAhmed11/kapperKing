import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogDescription } from '@/components/ui/dialog'; // Import DialogDescription
import { useLoyaltyStore, LoyaltyTier } from '@/lib/store/loyalty';
import { Loader2 } from 'lucide-react';

// Schema for tier form validation
const tierSchema = z.object({
  name: z.string().min(1, 'Tier name is required'),
  points_threshold: z.number().int().min(0, 'Points must be 0 or greater'),
  description: z.string().optional(),
});

type TierFormData = z.infer<typeof tierSchema>;

interface TierFormProps {
  salonId: string;
  tierData?: LoyaltyTier | null; // Existing tier data for editing
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TierForm({ salonId, tierData, onSuccess, onCancel }: TierFormProps) {
  const { addTier, updateTier, loadingTiers } = useLoyaltyStore();
  const isEditing = !!tierData;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<TierFormData>({
    resolver: zodResolver(tierSchema),
    defaultValues: {
      name: tierData?.name || '',
      points_threshold: tierData?.points_threshold || 0,
      description: tierData?.description || '',
    }
  });

  // Reset form when initialData changes
  useEffect(() => {
    reset({
      name: tierData?.name || '',
      points_threshold: tierData?.points_threshold || 0,
      description: tierData?.description || '',
    });
  }, [tierData, reset]);

  const onSubmit = async (data: TierFormData) => {
    let success = false;
    const payload = {
      ...data,
      salon_id: salonId,
    };

    if (isEditing && tierData) {
      success = await updateTier(tierData.id, payload);
    } else {
      success = await addTier(payload);
    }

    if (success) {
      onSuccess?.(); // Close dialog on success
    }
    // Error toasts handled in store actions
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Tier Name</Label>
        <Input id="name" {...register('name')} className="mt-1" />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="points_threshold">Points Threshold</Label>
        <Input id="points_threshold" type="number" {...register('points_threshold', { valueAsNumber: true })} className="mt-1" />
        <p className="mt-1 text-xs text-gray-500">Minimum points needed to reach this tier.</p>
        {errors.points_threshold && <p className="mt-1 text-sm text-red-600">{errors.points_threshold.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea id="description" {...register('description')} rows={3} className="mt-1" />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loadingTiers}>
          Cancel
        </Button>
        <Button type="submit" disabled={loadingTiers}>
          {loadingTiers ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isEditing ? 'Save Changes' : 'Create Tier'}
        </Button>
      </div>
    </form>
  );
}