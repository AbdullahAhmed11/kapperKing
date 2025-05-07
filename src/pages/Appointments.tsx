import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Plus, Filter, Search, MoreVertical } from 'lucide-react';
import { useStore } from '@/lib/store';

function () {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'day' | 'week'>('day');

  const appointments = [
    {
      time: '09:00',
      client: 'Sarah Johnson',
      service: 'Hair Color & Cut',
      stylist: 'Emma Davis',
      duration: '120min',
      status: 'confirmed',
      price: '€150'
    },
    {
      time: '11:30',
      client: 'Michael Brown',
      service: 'Men\'s Haircut',
      stylist: 'James Wilson',
      duration: '30min',
      status: 'confirmed',
      price: '€35'
    },
    {
      time: '13:00',
      client: 'Emily White',
      service: 'Blowout',
      stylist: 'Sophie Miller',
      duration: '45min',
      status: 'pending',
      price: '€45'
    }
  ];

  return (
    <div className="h-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
          <div className="flex items-center space-x-2">
            <button
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                view === 'day'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setView('day')}
            >
              Day
            </button>
            <button
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                view === 'week'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setView('week')}
            >
              Week
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Calendar */}
        <div className="w-auto">
          <div className="bg-white rounded-lg border border-gray-100 p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
            />
          </div>
        </div>

        {/* Appointments List */}
        <div className="flex-1">
          <div className="bg-white rounded-lg border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  {date ? format(date, 'MMMM d, yyyy') : 'Today'}
                </h2>
                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {appointments.map((appointment, idx) => (
                <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {appointment.client.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          appointment.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">{appointment.client}</p>
                      <p className="text-sm text-gray-500">{appointment.service} with {appointment.stylist}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{appointment.price}</p>
                      <p className="text-sm text-gray-500">{appointment.duration}</p>
                    </div>
                    <button className="p-1 rounded-full hover:bg-gray-100">
                      <MoreVertical className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Appointments;