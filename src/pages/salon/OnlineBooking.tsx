import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useServiceStore } from '@/lib/store/services';
import { useStaffStore } from '@/lib/store/staff';
import { format, addDays } from 'date-fns';

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function OnlineBooking() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');

  const { services = [], loading: servicesLoading, fetchServices } = useServiceStore();
  const { staff = [], loading: staffLoading, fetchStaff } = useStaffStore();

  useEffect(() => {
    fetchServices();
    fetchStaff();
  }, []);

  const timeSlots: TimeSlot[] = [
    { time: '09:00', available: true },
    { time: '10:00', available: true },
    { time: '11:00', available: false },
    { time: '12:00', available: true },
    { time: '13:00', available: false },
    { time: '14:00', available: true },
    { time: '15:00', available: true },
    { time: '16:00', available: true },
    { time: '17:00', available: true }
  ];

  const nextWeekDates = [...Array(7)].map((_, i) => addDays(new Date(), i));

  if (servicesLoading || staffLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Book Your Appointment
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Choose your service, stylist, and preferred time
          </p>
        </div>

        {/* Progress Steps */}
        <div className="relative mb-12">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-between">
            <div className="flex items-center">
              <span className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">1</span>
              </span>
              <span className="ml-2 text-sm font-medium text-gray-900">Service</span>
            </div>
            <div className="flex items-center">
              <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">2</span>
              </span>
              <span className="ml-2 text-sm font-medium text-gray-500">Staff</span>
            </div>
            <div className="flex items-center">
              <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">3</span>
              </span>
              <span className="ml-2 text-sm font-medium text-gray-500">Time</span>
            </div>
          </div>
        </div>

        {/* Service Selection */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Select a Service</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                className={`relative rounded-lg border p-4 cursor-pointer transition-all duration-200 ${
                  selectedService === service.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedService(service.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{service.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{service.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">€{service.price}</p>
                    <p className="mt-1 text-xs text-gray-500">{service.duration} min</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Selection */}
        {selectedService && (
          <div className="mb-12">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Choose Your Stylist</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className={`relative rounded-lg border p-4 cursor-pointer transition-all duration-200 ${
                    selectedStaff === member.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedStaff(member.id)}
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Date & Time Selection */}
        {selectedStaff && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-6">Select Date & Time</h2>
            
            {/* Date Selection */}
            <div className="mb-8">
              <Label className="mb-4 block">Available Dates</Label>
              <div className="grid grid-cols-7 gap-2">
                {nextWeekDates.map((date) => (
                  <button
                    key={date.toString()}
                    onClick={() => setSelectedDate(date)}
                    className={`p-2 text-center rounded-lg border transition-all duration-200 ${
                      format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-xs text-gray-500">{format(date, 'EEE')}</div>
                    <div className="text-sm font-medium text-gray-900">{format(date, 'd')}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <Label className="mb-4 block">Available Times</Label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    className={`p-3 text-center rounded-lg border transition-all duration-200 ${
                      slot.available
                        ? 'border-gray-200 hover:border-gray-300'
                        : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span className={`text-sm ${
                        slot.available ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {slot.time}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Continue Button */}
            <div className="mt-8">
              <Button className="w-full">
                Continue to Booking
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}