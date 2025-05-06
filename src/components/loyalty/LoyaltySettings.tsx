import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const settingsSchema = z.object({
  pointsPerCurrency: z.number().min(0),
  pointsValueCurrency: z.number().min(0),
  minimumPointsRedemption: z.number().min(0),
  welcomeBonusPoints: z.number().min(0),
  birthdayBonusPoints: z.number().min(0),
  expiryMonths: z.number().min(0)
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface LoyaltySettingsProps {
  salonId: string;
  initialData?: Partial<SettingsFormData>;
  onSubmit: (data: SettingsFormData) => Promise<void>;
}

export function LoyaltySettings({ salonId, initialData, onSubmit }: LoyaltySettingsProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      pointsPerCurrency: 1,
      pointsValueCurrency: 0.01,
      minimumPointsRedemption: 100,
      welcomeBonusPoints: 50,
      birthdayBonusPoints: 100,
      expiryMonths: 12,
      ...initialData
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Loyalty Program Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure how your loyalty program works
        </p>
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="pointsPerCurrency">Points per Currency (€)</Label>
          <Input
            id="pointsPerCurrency"
            type="number"
            step="0.1"
            {...register('pointsPerCurrency', { valueAsNumber: true })}
            className="mt-1"
          />
          {errors.pointsPerCurrency && (
            <p className="mt-1 text-sm text-red-600">{errors.pointsPerCurrency.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="pointsValueCurrency">Points Value in Currency (€)</Label>
          <Input
            id="pointsValueCurrency"
            type="number"
            step="0.01"
            {...register('pointsValueCurrency', { valueAsNumber: true })}
            className="mt-1"
          />
          {errors.pointsValueCurrency && (
            <p className="mt-1 text-sm text-red-600">{errors.pointsValueCurrency.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="minimumPointsRedemption">Minimum Points for Redemption</Label>
          <Input
            id="minimumPointsRedemption"
            type="number"
            {...register('minimumPointsRedemption', { valueAsNumber: true })}
            className="mt-1"
          />
          {errors.minimumPointsRedemption && (
            <p className="mt-1 text-sm text-red-600">{errors.minimumPointsRedemption.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="welcomeBonusPoints">Welcome Bonus Points</Label>
          <Input
            id="welcomeBonusPoints"
            type="number"
            {...register('welcomeBonusPoints', { valueAsNumber: true })}
            className="mt-1"
          />
          {errors.welcomeBonusPoints && (
            <p className="mt-1 text-sm text-red-600">{errors.welcomeBonusPoints.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="birthdayBonusPoints">Birthday Bonus Points</Label>
          <Input
            id="birthdayBonusPoints"
            type="number"
            {...register('birthdayBonusPoints', { valueAsNumber: true })}
            className="mt-1"
          />
          {errors.birthdayBonusPoints && (
            <p className="mt-1 text-sm text-red-600">{errors.birthdayBonusPoints.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="expiryMonths">Points Expiry (Months)</Label>
          <Input
            id="expiryMonths"
            type="number"
            {...register('expiryMonths', { valueAsNumber: true })}
            className="mt-1"
          />
          {errors.expiryMonths && (
            <p className="mt-1 text-sm text-red-600">{errors.expiryMonths.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
}