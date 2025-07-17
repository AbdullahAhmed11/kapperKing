// import React from 'react';
// import { format } from 'date-fns';
// import { Clock, Calendar } from 'lucide-react';

// interface Appointment {
//   id: number;
//   stylistName: string;
//   customerName: string;
//   startAt: string;
//   duration: number;
//   services: string[];
// }

// interface AgendaViewProps {
//   appointments: Appointment[];
//   onTimeSlotClick: (time: string) => void;
//   date: Date;
// }

// export function AgendaView({ appointments, onTimeSlotClick, date }: AgendaViewProps) {
//   // Generate time slots from 7:00 to 22:00
//   const timeSlots = Array.from({ length: 16 }, (_, i) => {
//     const hour = (i + 7).toString().padStart(2, '0');
//     return `${hour}:00`;
//   });

//   const getAppointmentStyle = (appointment: Appointment) => {
//     // Parse start time (format: "HH:mm:ss")
//     const [hours, minutes] = appointment.startAt.split(':').map(Number);
//     const durationMinutes = appointment.duration;
    
//     const top = (hours - 7) * 60 + minutes; // Offset by 7 hours
//     const height = durationMinutes; // Height in pixels assuming 1px per minute
    
//     return {
//       top: `${top}px`,
//       height: `${height}px`,
//       left: '0.5rem',
//       right: '0.5rem',
//     };
//   };

//   // Default status color since our API doesn't provide status
//   const getStatusColor = () => {
//     return 'bg-blue-100 border-blue-200 text-blue-800'; // Default to confirmed color
//   };

//   return (
//     <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//       {/* Date header */}
//       <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
//         <div className="flex items-center justify-between">
//           <h3 className="text-lg font-medium text-gray-900">
//             {format(date, 'EEEE, MMMM d')}
//           </h3>
//           <div className="flex items-center space-x-2 text-sm text-gray-500">
//             <Calendar className="h-4 w-4" />
//             <span>{format(date, 'yyyy')}</span>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-[80px_1fr] divide-x divide-gray-200">
//         {/* Time slots */}
//         <div className="divide-y divide-gray-200">
//           {timeSlots.map((time) => (
//             <div key={time} className="h-[60px] p-2 text-xs font-medium text-gray-500 text-right pr-3">
//               {time}
//             </div>
//           ))}
//         </div>

//         {/* Appointments grid */}
//         <div 
//           className="relative min-h-[960px]" // 16 hours * 60px
//           onDoubleClick={(e) => {
//             const rect = e.currentTarget.getBoundingClientRect();
//             const y = e.clientY - rect.top;
//             const minutes = Math.floor(y);
//             const hour = Math.floor(minutes / 60) + 7;
//             const min = Math.floor((minutes % 60) / 15) * 15;
//             const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
//             onTimeSlotClick(time);
//           }}
//         >
//           {/* Time slot guidelines */}
//           {timeSlots.map((time, index) => (
//             <React.Fragment key={time}>
//               <div 
//                 className="absolute w-full h-[1px] bg-gray-100"
//                 style={{ top: `${index * 60}px` }}
//               />
//               {/* Half-hour markers */}
//               <div 
//                 className="absolute w-full h-[1px] bg-gray-50"
//                 style={{ top: `${index * 60 + 30}px` }}
//               />
//             </React.Fragment>
//           ))}

//           {/* Appointment blocks */}
//           {appointments.map((appointment) => (
//             <div
//               key={appointment.id}
//               className={`absolute rounded-lg border p-2  shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer ${getStatusColor()}`}
//               style={getAppointmentStyle(appointment)}
//               onClick={() => console.log('Appointment clicked:', appointment.id)}
//             >
//               <div className="flex  justify-between">
//                 <div className="flex ">
//                   <Clock className="h-4 w-4 mr-2" />
//                   <span className="text-sm font-medium">
//                     {appointment.startAt.substring(0, 5)} 
//                   </span>
                  
//                 </div>
//                 <span className="text-xs font-medium">
//                   {appointment.duration}min
//                     <div className="text-xs">
//                   {appointment.services.join(', ')} with {appointment.stylistName}
//                 </div>
//                 </span>
//               </div>
//                 <div className="text-sm mb-6 font-medium">
//                   {appointment.customerName}
//                 </div>
//               <div className="">
              
//               </div>
//             </div>
//           ))}

//           {/* Current time indicator */}
//           <div 
//             className="absolute w-full border-t-2 border-red-500 z-10"
//             style={{ 
//               top: `${((new Date().getHours() - 7) * 60 + new Date().getMinutes())}px`,
//               display: format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'block' : 'none'
//             }}
//           >
//             <div className="absolute -top-[5px] -left-[5px] w-[10px] h-[10px] rounded-full bg-red-500" />
//           </div>
          
//         </div>
//       </div>
//     </div>
//   );
// }
import React from 'react';
import { format } from 'date-fns';
import { Clock, Calendar } from 'lucide-react';

interface Appointment {
  id: number;
  stylistName: string;
  customerName: string;
  startAt: string; // Format: HH:mm:ss
  duration: number;
  services: string[];
}

interface AgendaViewProps {
  appointments: Appointment[];
  onTimeSlotClick: (time: string) => void;
  date: Date;
}

export function AgendaView({ appointments, onTimeSlotClick, date }: AgendaViewProps) {
  // Generate hourly time slots from 7:00 to 22:00
  const timeSlots = Array.from({ length: 16 }, (_, i) => {
    const hour = (i + 7).toString().padStart(2, '0');
    return `${hour}:00`;
  });

  // Group appointments by start time
  const groupedAppointments = appointments.reduce((acc, appointment) => {
    const key = appointment.startAt;
    if (!acc[key]) acc[key] = [];
    acc[key].push(appointment);
    return acc;
  }, {} as Record<string, Appointment[]>);

  // Calculate style for each appointment block
  const getAppointmentStyle = (appointment: Appointment) => {
    const [hours, minutes] = appointment.startAt.split(':').map(Number);
    const durationMinutes = appointment.duration;

    const top = (hours - 7) * 60 + minutes; // Offset from 7:00
    const height = durationMinutes; // 1px per minute

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  const getStatusColor = () => {
    return 'bg-blue-100 border-blue-200 text-blue-800';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Date Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {format(date, 'EEEE, MMMM d')}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>{format(date, 'yyyy')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[80px_1fr] divide-x divide-gray-200">
        {/* Time Labels */}
        <div className="divide-y divide-gray-200">
          {timeSlots.map((time) => (
            <div key={time} className="h-[60px] p-2 text-xs font-medium text-gray-500 text-right pr-3">
              {time}
            </div>
          ))}
        </div>

        {/* Appointment Grid */}
        <div
          className="relative min-h-[960px]" // 16 hours * 60px
          onDoubleClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const minutes = Math.floor(y);
            const hour = Math.floor(minutes / 60) + 7;
            const min = Math.floor((minutes % 60) / 15) * 15;
            const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
            onTimeSlotClick(time);
          }}
        >
          {/* Guidelines */}
          {timeSlots.map((_, index) => (
            <React.Fragment key={index}>
              <div
                className="absolute w-full h-[1px] bg-gray-100"
                style={{ top: `${index * 60}px` }}
              />
              <div
                className="absolute w-full h-[1px] bg-gray-50"
                style={{ top: `${index * 60 + 30}px` }}
              />
            </React.Fragment>
          ))}

          {/* Appointments Rendered in Groups */}
          {Object.entries(groupedAppointments).map(([startAt, group]) =>
            group.map((appointment, index) => {
              const style = getAppointmentStyle(appointment);
              const groupSize = group.length;
              const gap = 4; // px between overlapping appointments
              const totalWidth = 100;
              const width = (totalWidth - gap * (groupSize - 1)) / groupSize;

              return (
                <div
                  key={appointment.id}
                  className={`absolute rounded-lg border p-2 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer text-xs ${getStatusColor()}`}
                  style={{
                    ...style,
                    width: `calc(${width}% - ${gap}px)`,
                    left: `calc(${(width + gap) * index}%)`,
                  }}
                  onClick={() => console.log('Appointment clicked:', appointment.id)}
                >
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="font-medium">{appointment.startAt.substring(0, 5)}</span>
                    </div>
                    <span>{appointment.duration} min</span>
                  </div>
                  <div className="text-gray-700 font-medium mb-1">
                    {appointment.customerName}
                  </div>
                  <div className="text-gray-500">
                    {appointment.services.join(', ')} with {appointment.stylistName}
                  </div>
                </div>
              );
            })
          )}

          {/* Red Current Time Line */}
          <div
            className="absolute w-full border-t-2 border-red-500 z-10"
            style={{
              top: `${((new Date().getHours() - 7) * 60 + new Date().getMinutes())}px`,
              display: format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'block' : 'none',
            }}
          >
            <div className="absolute -top-[5px] -left-[5px] w-[10px] h-[10px] rounded-full bg-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
