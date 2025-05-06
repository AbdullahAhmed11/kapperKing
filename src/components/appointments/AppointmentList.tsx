import React from 'react';
import { format } from 'date-fns';
import { Clock, Calendar, User, Scissors } from 'lucide-react';
import { formatCurrency } from '@/lib/utils'; // Import currency formatter
import { Appointment } from '@/lib/store/appointments'; // Import shared type

// Removed local Appointment interface definition

interface AppointmentListProps {
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
}

export function AppointmentList({ appointments, onAppointmentClick }: AppointmentListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div
          key={appointment.id}
          onClick={() => onAppointmentClick?.(appointment)}
          className="bg-white rounded-lg border border-gray-100 p-4 hover:border-gray-200 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {/* Use start_time */}
                    {format(new Date(appointment.start_time), 'h:mm a')}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-gray-900 mt-1">
                  {/* Use client.firstName, client.lastName */}
                  {appointment.client.firstName} {appointment.client.lastName}
                </h4>
                <div className="mt-2 flex items-start space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Scissors className="h-4 w-4 mr-1" />
                    {/* Use service.name */}
                    {appointment.service.name}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {/* Use service.duration */}
                    {appointment.service.duration} min
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {/* Use staff.firstName */}
                    {appointment.staff.firstName}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              {/* Use service.price */}
              <span className="text-sm font-medium text-gray-900">{formatCurrency(appointment.service.price)}</span>
            </div>
          </div>
        </div>
      ))}
      {appointments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
          <p className="mt-1 text-sm text-gray-500">No appointments scheduled for this date.</p>
        </div>
      )}
    </div>
  );
}