import React, { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Filter, Search, List, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { AppointmentList } from '@/components/appointments/AppointmentList';
import { AppointmentDetails } from '@/components/appointments/AppointmentDetails';
import { AgendaView } from '@/components/appointments/AgendaView';
import { AppointmentCalendar } from '@/components/appointments/AppointmentCalendar';

export default function Appointments() {
  const [date, setDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'agenda'>('agenda');
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const appointments = [
    {
      id: '1',
      startTime: '2024-03-22T09:00:00Z',
      endTime: '2024-03-22T10:30:00Z',
      client: {
        first_name: 'Sarah',
        last_name: 'Johnson'
      },
      service: {
        name: 'Hair Color & Cut',
        duration: 90,
        price: 150
      },
      staff: {
        first_name: 'Emma',
        last_name: 'Davis'
      },
      status: 'confirmed',
      notes: 'Client prefers cool tones'
    },
    {
      id: '2',
      startTime: '2024-03-22T11:30:00Z',
      endTime: '2024-03-22T12:00:00Z',
      client: {
        first_name: 'Michael',
        last_name: 'Brown'
      },
      service: {
        name: 'Men\'s Haircut',
        duration: 30,
        price: 35
      },
      staff: {
        first_name: 'James',
        last_name: 'Wilson'
      },
      status: 'pending'
    },
    {
      id: '3',
      startTime: '2024-03-22T13:00:00Z',
      endTime: '2024-03-22T13:45:00Z',
      client: {
        first_name: 'Emily',
        last_name: 'White'
      },
      service: {
        name: 'Blowout',
        duration: 45,
        price: 45
      },
      staff: {
        first_name: 'Sophie',
        last_name: 'Miller'
      },
      status: 'pending'
    }
  ];

  const handleTimeSlotClick = (time: string) => {
    setSelectedTime(time);
    setShowNewAppointment(true);
  };

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
  };

  const handleAppointmentCancel = (id: string) => {
    console.log('Cancel appointment:', id);
    // Implement cancel logic
    setSelectedAppointment(null);
  };

  const handleAppointmentConfirm = (id: string) => {
    console.log('Confirm appointment:', id);
    // Implement confirm logic
    setSelectedAppointment(null);
  };

  const handleAppointmentComplete = (id: string) => {
    console.log('Complete appointment:', id);
    // Implement complete logic
    setSelectedAppointment(null);
  };

  return (
    <div className="h-full flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col space-y-4">
        <AppointmentCalendar
          selectedDate={date}
          onDateChange={setDate}
        />

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Staff</h3>
          <div className="space-y-2">
            {['All Staff', 'Emma Davis', 'James Wilson', 'Sophie Miller'].map((staff) => (
              <label key={staff} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  defaultChecked={staff === 'All Staff'}
                />
                <span className="ml-2 text-sm text-gray-700">{staff}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Services</h3>
          <div className="space-y-2">
            {['All Services', 'Haircut', 'Color & Cut', 'Styling'].map((service) => (
              <label key={service} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  defaultChecked={service === 'All Services'}
                />
                <span className="ml-2 text-sm text-gray-700">{service}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
              <p className="mt-1 text-sm text-gray-500">{format(date, 'EEEE, MMMM d, yyyy')}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded ${viewMode === 'list' ? 'bg-white shadow' : 'hover:bg-white/50'}`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('agenda')}
                  className={`p-1 rounded ${viewMode === 'agenda' ? 'bg-white shadow' : 'hover:bg-white/50'}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={() => setShowNewAppointment(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </div>
          </div>

          {viewMode === 'list' ? (
            <AppointmentList 
              appointments={appointments}
              onAppointmentClick={handleAppointmentClick}
            />
          ) : (
            <AgendaView 
              appointments={appointments} 
              onTimeSlotClick={handleTimeSlotClick}
              date={date}
            />
          )}
        </div>
      </div>

      {/* New Appointment Dialog */}
      <Dialog open={showNewAppointment} onOpenChange={setShowNewAppointment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Appointment</DialogTitle>
          </DialogHeader>
          <AppointmentForm
            initialTime={selectedTime}
            onSuccess={() => setShowNewAppointment(false)}
            onCancel={() => setShowNewAppointment(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Appointment Details Dialog */}
      <AppointmentDetails
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onCancel={handleAppointmentCancel}
        onConfirm={handleAppointmentConfirm}
        onComplete={handleAppointmentComplete}
      />
    </div>
  );
}