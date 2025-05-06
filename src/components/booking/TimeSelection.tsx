import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { useBookingStore } from '@/lib/store/booking';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Clock } from 'lucide-react';

interface TimeSelectionProps {
  salonId: string;
  serviceId: string;
  staffId: string;
  onTimeSelected: (date: Date, time: string) => void;
  onBack: () => void;
}

export function TimeSelection({ salonId, serviceId, staffId, onTimeSelected, onBack }: TimeSelectionProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { availableSlots, loading, fetchAvailableSlots } = useBookingStore();

  useEffect(() => {
    fetchAvailableSlots(salonId, selectedDate, serviceId);
  }, [selectedDate, serviceId]);

  // Generate next 7 days
  const dates = [...Array(7)].map((_, i) => addDays(new Date(), i));

  // Group slots by time
  const timeSlots = availableSlots
    .filter(slot => isSameDay(new Date(slot.startTime), selectedDate))
    .map(slot => ({
      time: format(new Date(slot.startTime), 'HH:mm'),
      staffId: slot.staffId
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Staff Selection
        </Button>
        <h2 className="text-lg font-medium text-gray-900">Choose a Time</h2>
        <p className="mt-1 text-sm text-gray-500">
          Select your preferred appointment time
        </p>
      </div>

      {/* Date Selection */}
      <div className="grid grid-cols-7 gap-2">
        {dates.map((date) => (
          <button
            key={date.toString()}
            onClick={() => setSelectedDate(date)}
            className={`p-2 text-center rounded-lg border transition-all duration-200 ${
              isSameDay(date, selectedDate)
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-xs text-gray-500">{format(date, 'EEE')}</div>
            <div className="text-sm font-medium text-gray-900">{format(date, 'd')}</div>
          </button>
        ))}
      </div>

      {/* Time Slots */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {timeSlots.map((slot) => (
          <button
            key={slot.time}
            onClick={() => onTimeSelected(selectedDate, slot.time)}
            className="p-3 text-center rounded-lg border border-gray-200 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Clock className="h-4 w-4 mx-auto mb-1 text-gray-400" />
            <span className="text-sm text-gray-900">{slot.time}</span>
          </button>
        ))}

        {timeSlots.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">
              No available time slots for this date
            </p>
          </div>
        )}
      </div>
    </div>
  );
}