import React from 'react';
import { format } from 'date-fns';
import { Clock, Calendar } from 'lucide-react';
import { Appointment } from '@/lib/store/appointments'; // Import shared type

// Removed local Appointment interface definition

interface AgendaViewProps {
  appointments: Appointment[];
  onTimeSlotClick: (time: string) => void;
  date: Date;
}

export function AgendaView({ appointments, onTimeSlotClick, date }: AgendaViewProps) {
  // Generate time slots from 7:00 to 22:00
  const timeSlots = Array.from({ length: 16 }, (_, i) => {
    const hour = (i + 7).toString().padStart(2, '0');
    return `${hour}:00`;
  });

  const getAppointmentStyle = (appointment: Appointment) => {
    // Use start_time and end_time
    const startDate = new Date(appointment.start_time);
    const endDate = new Date(appointment.end_time);
    const startHour = startDate.getHours();
    const endHour = endDate.getHours();
    // Calculate duration more accurately in minutes
    const durationMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    const startMinutes = startDate.getMinutes();
    const top = (startHour - 7) * 60 + startMinutes; // Offset by 7 hours
    const height = durationMinutes; // Height in pixels assuming 1px per minute
    
    return {
      top: `${top}px`,
      height: `${height}px`,
      left: '0.5rem',
      right: '0.5rem',
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 border-blue-200 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 border-red-200 text-red-800';
      case 'completed':
        return 'bg-green-100 border-green-200 text-green-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Date header */}
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
        {/* Time slots */}
        <div className="divide-y divide-gray-200">
          {timeSlots.map((time) => (
            <div key={time} className="h-[60px] p-2 text-xs font-medium text-gray-500 text-right pr-3">
              {time}
            </div>
          ))}
        </div>

        {/* Appointments grid */}
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
          {/* Time slot guidelines */}
          {timeSlots.map((time, index) => (
            <React.Fragment key={time}>
              <div 
                className="absolute w-full h-[1px] bg-gray-100"
                style={{ top: `${index * 60}px` }}
              />
              {/* Half-hour markers */}
              <div 
                className="absolute w-full h-[1px] bg-gray-50"
                style={{ top: `${index * 60 + 30}px` }}
              />
            </React.Fragment>
          ))}

          {/* Appointment blocks */}
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className={`absolute rounded-lg border p-2 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer ${getStatusColor(appointment.status)}`}
              style={getAppointmentStyle(appointment)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    {/* Use start_time */}
                    {format(new Date(appointment.start_time), 'HH:mm')}
                  </span>
                </div>
                <span className="text-xs font-medium">
                  {/* Use service.duration */}
                  {appointment.service.duration}min
                </span>
              </div>
              <div className="mt-1">
                <div className="text-sm font-medium">
                  {/* Use client.firstName, client.lastName */}
                  {appointment.client.firstName} {appointment.client.lastName}
                </div>
                <div className="text-xs">
                  {/* Use service.name, staff.firstName */}
                  {appointment.service.name} with {appointment.staff.firstName}
                </div>
              </div>
            </div>
          ))}

          {/* Current time indicator */}
          <div 
            className="absolute w-full border-t-2 border-red-500 z-10"
            style={{ 
              top: `${((new Date().getHours() - 7) * 60 + new Date().getMinutes())}px`,
              display: format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'block' : 'none'
            }}
          >
            <div className="absolute -top-[5px] -left-[5px] w-[10px] h-[10px] rounded-full bg-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
}