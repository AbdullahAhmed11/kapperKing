import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, TrendingUp, DollarSign, ChevronRight, ArrowUpRight, ArrowDownRight, List, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppointmentList } from '@/components/appointments/AppointmentList';
import { AgendaView } from '@/components/appointments/AgendaView';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { AppointmentCalendar } from '@/components/appointments/AppointmentCalendar';

export default function Dashboard() {
  const [date, setDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'agenda'>('list');
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const stats = [
    { 
      name: 'Today\'s Appointments',
      value: '12',
      change: '+2.5%',
      trend: 'up',
      icon: Calendar,
      color: 'bg-indigo-600'
    },
    { 
      name: 'Active Clients',
      value: '2,451',
      change: '+3.2%',
      trend: 'up',
      icon: Users,
      color: 'bg-indigo-600'
    },
    { 
      name: 'Average Service Time',
      value: '45 min',
      change: '-1.5%',
      trend: 'down',
      icon: Clock,
      color: 'bg-indigo-600'
    },
    { 
      name: 'Revenue (MTD)',
      value: '€8,234',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-indigo-600'
    },
  ];

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
      status: 'confirmed'
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
      status: 'confirmed'
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

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative bg-white overflow-hidden rounded-lg border border-gray-100 p-5 hover:border-gray-200 transition-all duration-200"
          >
            <div className="flex justify-between">
              <div className={`${stat.color} rounded-lg p-2`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                stat.trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
              }`}>
                {stat.change}
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="ml-1 h-3 w-3" />
                )}
              </span>
            </div>
            <p className="mt-4 text-2xl font-semibold text-gray-900">{stat.value}</p>
            <p className="mt-1 text-sm text-gray-500">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-lg border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
            <div className="flex items-center space-x-4">
              <AppointmentCalendar
                selectedDate={date}
                onDateChange={setDate}
              />
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
              <Link to="/salon/appointments" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
                View all
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
        <div>
          {viewMode === 'list' ? (
            <AppointmentList appointments={appointments} />
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
    </div>
  );
}