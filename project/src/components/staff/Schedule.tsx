import React from 'react';
import { format, startOfWeek, addDays } from 'date-fns';

interface ScheduleProps {
  staffId: string;
  date: Date;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const timeSlots: TimeSlot[] = [
  { time: '09:00', available: true },
  { time: '10:00', available: false },
  { time: '11:00', available: true },
  { time: '12:00', available: true },
  { time: '13:00', available: false },
  { time: '14:00', available: true },
  { time: '15:00', available: true },
  { time: '16:00', available: true },
  { time: '17:00', available: true },
];

export function Schedule({ staffId, date }: ScheduleProps) {
  const weekStart = startOfWeek(date);
  const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="grid grid-cols-8 gap-px bg-gray-200">
        <div className="bg-gray-50 p-2 text-sm font-medium text-gray-500">Time</div>
        {weekDays.map((day) => (
          <div
            key={day.toString()}
            className="bg-gray-50 p-2 text-sm font-medium text-gray-500 text-center"
          >
            {format(day, 'EEE d')}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-8 gap-px bg-gray-200">
        {timeSlots.map((slot) => (
          <React.Fragment key={slot.time}>
            <div className="bg-white p-2 text-sm text-gray-900">{slot.time}</div>
            {weekDays.map((day) => (
              <div
                key={`${day.toString()}-${slot.time}`}
                className={`bg-white p-2 text-sm ${
                  slot.available
                    ? 'cursor-pointer hover:bg-indigo-50'
                    : 'bg-gray-50 cursor-not-allowed'
                }`}
              >
                {slot.available ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                  </div>
                )}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}