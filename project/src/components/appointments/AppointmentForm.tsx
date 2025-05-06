import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const appointmentSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  serviceId: z.string().min(1, 'Please select a service'),
  staffId: z.string().min(1, 'Please select a staff member'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  initialTime?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AppointmentForm({ initialTime, onSuccess, onCancel }: AppointmentFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      time: initialTime || format(new Date(), 'HH:mm'),
      date: format(new Date(), 'yyyy-MM-dd'),
    }
  });

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      // Mock appointment creation
      console.log('Creating appointment:', data);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create appointment:', error);
    }
  };

  const services = [
    { id: '1', name: 'Haircut', duration: 30, price: 35 },
    { id: '2', name: 'Color & Cut', duration: 120, price: 150 },
    { id: '3', name: 'Styling', duration: 45, price: 45 },
  ];

  const staff = [
    { id: '1', name: 'Emma Davis' },
    { id: '2', name: 'James Wilson' },
    { id: '3', name: 'Sophie Miller' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="clientName">Client Name</Label>
        <Input
          id="clientName"
          type="text"
          {...register('clientName')}
          className="mt-1"
        />
        {errors.clientName && (
          <p className="mt-1 text-sm text-red-600">{errors.clientName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="serviceId">Service</Label>
        <select
          id="serviceId"
          {...register('serviceId')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select a service</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} ({service.duration} min) - €{service.price}
            </option>
          ))}
        </select>
        {errors.serviceId && (
          <p className="mt-1 text-sm text-red-600">{errors.serviceId.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="staffId">Staff Member</Label>
        <select
          id="staffId"
          {...register('staffId')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select a staff member</option>
          {staff.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
        {errors.staffId && (
          <p className="mt-1 text-sm text-red-600">{errors.staffId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            type="date"
            id="date"
            {...register('date')}
            min={format(new Date(), 'yyyy-MM-dd')}
            className="mt-1"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="time">Time</Label>
          <Input
            type="time"
            id="time"
            {...register('time')}
            step={900} // 15-minute intervals
            className="mt-1"
          />
          {errors.time && (
            <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          {...register('notes')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Appointment'}
        </Button>
      </div>
    </form>
  );
}