import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  isAvailable: z.boolean(),
});

type AvailabilityFormData = z.infer<typeof availabilitySchema>;

interface AvailabilityManagerProps {
  staffId: string;
}

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function AvailabilityManager({ staffId }: AvailabilityManagerProps) {
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!staffId) return;
    fetchAvailability();
  }, [staffId]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('staff_availability')
        .select('*')
        .eq('staff_id', staffId)
        .order('day_of_week');

      if (error) throw error;

      setAvailability(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to fetch availability');
    } finally {
      setLoading(false);
    }
  };

  const updateAvailability = async (dayOfWeek: number, data: Partial<AvailabilityFormData>) => {
    try {
      const existingAvailability = availability.find(a => a.day_of_week === dayOfWeek);

      const { error } = await supabase
        .from('staff_availability')
        .upsert({
          staff_id: staffId,
          day_of_week: dayOfWeek,
          start_time: data.startTime || '09:00',
          end_time: data.endTime || '17:00',
          is_available: data.isAvailable ?? true,
          ...(existingAvailability?.id ? { id: existingAvailability.id } : {})
        });

      if (error) throw error;

      toast.success('Availability updated');
      fetchAvailability();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Weekly Availability</h3>
        <p className="mt-1 text-sm text-gray-500">
          Set your regular working hours for each day of the week.
        </p>
      </div>

      <div className="mt-5 border-t border-gray-200">
        <dl className="divide-y divide-gray-200">
          {daysOfWeek.map((day, index) => {
            const dayAvailability = availability.find((a) => a.day_of_week === index);
            
            return (
              <div key={day} className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">{day}</dt>
                <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="flex items-center space-x-4">
                    <Label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={dayAvailability?.is_available ?? false}
                        onChange={(e) => updateAvailability(index, { isAvailable: e.target.checked })}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2">Available</span>
                    </Label>

                    <div className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={dayAvailability?.start_time || '09:00'}
                        onChange={(e) => updateAvailability(index, { startTime: e.target.value })}
                        className="block w-32"
                      />
                      <span>to</span>
                      <Input
                        type="time"
                        value={dayAvailability?.end_time || '17:00'}
                        onChange={(e) => updateAvailability(index, { endTime: e.target.value })}
                        className="block w-32"
                      />
                    </div>
                  </div>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}