// import React, { useState, useEffect } from 'react';
// import { format, addDays, isSameDay } from 'date-fns';
// import { useBookingStore } from '@/lib/store/booking';
// import { Button } from '@/components/ui/button';
// import { ChevronLeft, Clock } from 'lucide-react';

// interface TimeSelectionProps {
//   salonId: string;
//   serviceId: string;
//   staffId: string;
//   onTimeSelected: (date: Date, time: string) => void;
//   onBack: () => void;
// }

// export function TimeSelection({ salonId, serviceId, staffId, onTimeSelected, onBack }: TimeSelectionProps) {
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const { availableSlots, loading, fetchAvailableSlots } = useBookingStore();

//   useEffect(() => {
//     fetchAvailableSlots(salonId, selectedDate, serviceId);
//   }, [selectedDate, serviceId]);

//   // Generate next 7 days
//   const dates = [...Array(7)].map((_, i) => addDays(new Date(), i));

//   // Group slots by time
//   const timeSlots = availableSlots
//     .filter(slot => isSameDay(new Date(slot.startTime), selectedDate))
//     .map(slot => ({
//       time: format(new Date(slot.startTime), 'HH:mm'),
//       staffId: slot.staffId
//     }));

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <Button
//           variant="ghost"
//           onClick={onBack}
//           className="mb-4"
//         >
//           <ChevronLeft className="h-4 w-4 mr-2" />
//           Back to Staff Selection
//         </Button>
//         <h2 className="text-lg font-medium text-gray-900">Choose a Time</h2>
//         <p className="mt-1 text-sm text-gray-500">
//           Select your preferred appointment time
//         </p>
//       </div>

//       {/* Date Selection */}
//       <div className="grid grid-cols-7 gap-2">
//         {dates.map((date) => (
//           <button
//             key={date.toString()}
//             onClick={() => setSelectedDate(date)}
//             className={`p-2 text-center rounded-lg border transition-all duration-200 ${
//               isSameDay(date, selectedDate)
//                 ? 'border-indigo-600 bg-indigo-50'
//                 : 'border-gray-200 hover:border-gray-300'
//             }`}
//           >
//             <div className="text-xs text-gray-500">{format(date, 'EEE')}</div>
//             <div className="text-sm font-medium text-gray-900">{format(date, 'd')}</div>
//           </button>
//         ))}
//       </div>

//       {/* Time Slots */}
//       <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
//         {timeSlots.map((slot) => (
//           <button
//             key={slot.time}
//             onClick={() => onTimeSelected(selectedDate, slot.time)}
//             className="p-3 text-center rounded-lg border border-gray-200 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           >
//             <Clock className="h-4 w-4 mx-auto mb-1 text-gray-400" />
//             <span className="text-sm text-gray-900">{slot.time}</span>
//           </button>
//         ))}

//         {/* {timeSlots.length === 0 && (
//           <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
//             <p className="text-sm text-gray-500">
//               No available time slots for this date
//             </p>
//           </div>
//         )} */}
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { Clock, ChevronLeft } from 'lucide-react';

const Stack = ({ 
  children, 
  direction = 'vertical', 
  spacing = 2,
  className = ''
}: {
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal';
  spacing?: number;
  className?: string;
}) => {
  const spacingClass = `gap-${spacing}`;
  const flexDirection = direction === 'vertical' ? 'flex-col' : 'flex-row';
  
  return (
    <div className={`flex ${flexDirection} ${spacingClass} ${className} w-full`}>
      {children}
    </div>
  );
};

export function TimeSelection({onTimeSelected, onBack}: any) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

  // Mock data - replace with real API calls
  const mockSlots = [
    { startTime: new Date(selectedDate.setHours(9, 0, 0)), staffId: '1' },
    { startTime: new Date(selectedDate.setHours(10, 30, 0)), staffId: '1' },
    { startTime: new Date(selectedDate.setHours(11, 0, 0)), staffId: '1' },
    { startTime: new Date(selectedDate.setHours(14, 0, 0)), staffId: '1' },
    { startTime: new Date(selectedDate.setHours(15, 30, 0)), staffId: '1' },
  ];

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAvailableSlots(mockSlots);
      setLoading(false);
    }, 500);
  }, [selectedDate]);

  // Generate next 7 days
  const dates = [...Array(7)].map((_, i) => addDays(new Date(), i));

  // Format time slots
  const timeSlots = availableSlots
    .filter(slot => isSameDay(new Date(slot.startTime), selectedDate))
    .map(slot => ({
      time: format(new Date(slot.startTime), 'HH:mm'),
      staffId: slot.staffId
    }));

  const handleTimeSelected = (time: string) => {
    onTimeSelected()
  };

  const handleBack = () => {
    onBack
  };

  if (loading) {
    return (
      <Stack direction="vertical" spacing={4} className="items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </Stack>
    );
  }

  return (
    <Stack direction="vertical" spacing={6} className="p-4 max-w-md mx-auto">
      <Stack direction="vertical" spacing={1}>
        <button
          onClick={handleBack}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-2"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <h2 className="text-lg font-medium text-gray-900">Choose a Time</h2>
        <p className="text-sm text-gray-500">
          Select your preferred appointment time
        </p>
      </Stack>

      {/* Date Selection */}
      <Stack direction="horizontal" spacing={2} className="overflow-x-auto py-2">
        {dates.map((date) => (
          <button
            key={date.toString()}
            onClick={() => setSelectedDate(date)}
            className={`min-w-[50px] p-2 text-center rounded-lg border transition-all duration-200 ${
              isSameDay(date, selectedDate)
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-xs text-gray-500">{format(date, 'EEE')}</div>
            <div className="text-sm font-medium text-gray-900">{format(date, 'd')}</div>
          </button>
        ))}
      </Stack>

      {/* Time Slots */}
      <Stack direction="vertical" spacing={2}>
        <h3 className="text-sm font-medium text-gray-700">
          {format(selectedDate, 'PPPP')}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {timeSlots.length > 0 ? (
            timeSlots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => handleTimeSelected(slot.time)}
                className="p-2 text-center rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
              >
                <Clock className="h-4 w-4 mx-auto mb-1 text-gray-400" />
                <span className="text-sm text-gray-900">{slot.time}</span>
              </button>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">
                No available time slots for this date
              </p>
            </div>
          )}
        </div>
      </Stack>
    </Stack>
  );
}