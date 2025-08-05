import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Clock, Calendar } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
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

interface Stylist {
  id: number;
  firstName: string;
  lastName: string;
  imagePath: string;
}
type JwtPayload = {
  Id: number;
  email?: string;
  name?: string;
};

export function AgendaView({ appointments, onTimeSlotClick, date }: AgendaViewProps) {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const token = Cookies.get('salonUser');
  const decoded = token ? jwtDecode<JwtPayload>(token) : undefined;

  useEffect(() => {
    fetch(`https://kapperking.runasp.net/api/Salons/GetStylists?id=${decoded?.Id}`)
      .then((res) => res.json())
      .then((data) => setStylists(data))
      .catch((err) => console.error('Failed to fetch stylists:', err));
  }, []);

  const timeSlots = Array.from({ length: 16 }, (_, i) => {
    const hour = (i + 7).toString().padStart(2, '0');
    return `${hour}:00`;
  });

  const getAppointmentStyle = (appointment: Appointment) => {
    const [hours, minutes] = appointment.startAt.split(':').map(Number);
    const durationMinutes = appointment.duration;
    const top = (hours - 7) * 60 + minutes;
    const height = durationMinutes;
    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  const getStatusColor = () => 'bg-blue-100 border-blue-200 text-blue-800';

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto relative">
      {/* Header */}
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

      {/* Stylist Headers */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `80px repeat(${stylists.length}, minmax(150px, 1fr))`,
        }}
      >
        <div className="p-2 text-sm font-semibold text-gray-700 text-center">Time</div>
        {stylists.map((stylist) => (
          <div key={stylist.id} className="p-2 flex flex-col items-center text-center text-sm border-l border-gray-200">
            <img
              src={`https://kapperking.runasp.net${stylist.imagePath}`}
              alt={`${stylist.firstName}`}
              className="w-10 h-10 rounded-full object-cover mb-1"
            />
            <div className="font-medium">{stylist.firstName} {stylist.lastName}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid" style={{ gridTemplateColumns: `80px repeat(${stylists.length}, minmax(150px, 1fr))` }}>
        {/* Time Column */}
        <div className="divide-y divide-gray-200">
          {timeSlots.map((time) => (
            <div key={time} className="h-[60px] p-2 text-xs font-medium text-gray-500 text-right pr-3">
              {time}
            </div>
          ))}
        </div>

        {/* Stylist Columns */}
        {stylists.map((stylist) => (
          <div
            key={stylist.id}
            className="relative min-h-[960px] border-l border-gray-200"
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
                <div className="absolute w-full h-[1px] bg-gray-100" style={{ top: `${index * 60}px` }} />
                <div className="absolute w-full h-[1px] bg-gray-50" style={{ top: `${index * 60 + 30}px` }} />
              </React.Fragment>
            ))}

            {/* Appointments */}
            {appointments
              .filter((a) => a.stylistName.toLowerCase().includes(stylist.firstName.toLowerCase()))
              .map((appointment) => {
                const style = getAppointmentStyle(appointment);
                return (
                  <div
                    key={appointment.id}
                    className={`absolute rounded-lg border p-2 shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer text-xs ${getStatusColor()}`}
                    style={style}
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="font-medium">{appointment.startAt.substring(0, 5)}</span>
                      </div>
                      <span>{appointment.duration} min</span>
                    </div>
                    <div className="text-gray-700 font-medium mb-1">{appointment.customerName}</div>
                    <div className="text-gray-500">{appointment.services.join(', ')}</div>
                  </div>
                );
              })}

            {/* Current Time Line */}
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
        ))}
      </div>

      {/* Appointment Dialog */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Appointment Details</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Customer:</strong> {selectedAppointment.customerName}</p>
              <p><strong>Stylist:</strong> {selectedAppointment.stylistName}</p>
              <p><strong>Start Time:</strong> {selectedAppointment.startAt}</p>
              <p><strong>Duration:</strong> {selectedAppointment.duration} minutes</p>
              <p><strong>Services:</strong> {selectedAppointment.services.join(', ')}</p>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedAppointment(null)}
                className="px-4 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
