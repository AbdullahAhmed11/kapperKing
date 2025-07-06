import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft } from 'lucide-react';

interface BookingConfirmationProps {
  salonId: string;
  serviceId: string;
  staffId: string;
  date: Date;
  time: string;
  isGuestBookingAllowed: boolean;
  requireDeposit: boolean;
  depositAmount: number;
  onConfirm: (guestInfo?: {
    name: string;
    email: string;
    phone?: string;
  }, notes?: string) => void;
  onBack: () => void;
}

const guestBookingSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  notes: z.string().optional()
});

type GuestBookingFormData = z.infer<typeof guestBookingSchema>;

export function BookingConfirmation({
  salonId,
  serviceId,
  staffId,
  date,
  time,
  isGuestBookingAllowed,
  requireDeposit,
  depositAmount,
  onConfirm,
  onBack
}: BookingConfirmationProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<GuestBookingFormData>({
    resolver: zodResolver(guestBookingSchema)
  });


  useEffect(() => {
    console.log('BookingConfirmation rendered with:', {
      salonId,
      serviceId,
      staffId,
      date,
      time,
      isGuestBookingAllowed,
      requireDeposit,
      depositAmount
    });
  },[])

  const handleConfirm = async (data: GuestBookingFormData) => {
    const { notes, ...guestInfo } = data;
    await onConfirm(guestInfo, notes);
  };

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Time Selection
        </Button>
        <h2 className="text-lg font-medium text-gray-900">Confirm Your Booking</h2>
        <p className="mt-1 text-sm text-gray-500">
          Please review and confirm your appointment details
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {format(date, 'EEEE, MMMM d, yyyy')} at {time}
            </dd>
          </div>
          {requireDeposit && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Deposit Required</dt>
              <dd className="mt-1 text-sm text-gray-900">
                €{depositAmount.toFixed(2)}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <form onSubmit={handleSubmit(handleConfirm)} className="space-y-6">
        {isGuestBookingAllowed && (
          <>
            <div>
              <Label htmlFor="name">Your Name</Label>
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
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="mt-1"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                className="mt-1"
              />
            </div>
          </>
        )}

        <div>
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <textarea
            id="notes"
            {...register('notes')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
          </Button>
        </div>
      </form>
    </div>
  );
}