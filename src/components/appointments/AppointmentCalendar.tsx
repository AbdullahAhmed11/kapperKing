import React from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppointmentCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function AppointmentCalendar({ selectedDate, onDateChange }: AppointmentCalendarProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));

  const handlePrevWeek = () => {
    onDateChange(addDays(weekStart, -7));
  };

  const handleNextWeek = () => {
    onDateChange(addDays(weekStart, 7));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {format(selectedDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevWeek}
            className="p-1"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextWeek}
            className="p-1"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <button
            key={day.toString()}
            onClick={() => onDateChange(day)}
            className={`
              flex flex-col items-center p-2 rounded-lg transition-colors
              ${isSameDay(day, selectedDate)
                ? 'bg-indigo-600 text-white'
                : 'hover:bg-gray-50'
              }
            `}
          >
            <span className={`text-xs font-medium ${
              isSameDay(day, selectedDate) ? 'text-indigo-100' : 'text-gray-500'
            }`}>
              {format(day, 'EEE')}
            </span>
            <span className={`text-sm font-semibold mt-1 ${
              isSameDay(day, selectedDate) ? 'text-white' : 'text-gray-900'
            }`}>
              {format(day, 'd')}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}