import React, { useState, useEffect, useMemo } from 'react'; // Import useMemo
// Removed duplicate React import below
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, TrendingUp, DollarSign, ChevronRight, ArrowUpRight, ArrowDownRight, List, LayoutGrid, Loader2, AlertCircle } from 'lucide-react'; // Added Loader2, AlertCircle
import { Button } from '@/components/ui/button';
import { AppointmentList } from '@/components/appointments/AppointmentList';
import { AgendaView } from '@/components/appointments/AgendaView';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { AppointmentCalendar } from '@/components/appointments/AppointmentCalendar';
import { useCurrentSalonStore } from '@/lib/store/currentSalon'; // Import salon store
import { useAppointmentStore } from '@/lib/store/appointments'; // Import appointment store
import { useClientStore } from '@/lib/store/clients'; // Import client store
import { useServiceStore } from '@/lib/store/services'; // Import service store
import { formatCurrency } from '@/lib/utils'; // Import currency formatter
import { isSameDay } from 'date-fns'; // Import date-fns helper

export default function SalonDashboard() { // Renamed component
  const [date, setDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'agenda'>('list');
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Get state and actions from stores
  const { currentSalon, loading: salonLoading, error: salonError } = useCurrentSalonStore();
  const { appointments, fetchAppointments, loading: appointmentsLoading, error: appointmentError } = useAppointmentStore();
  const { clients, fetchClients, loading: clientsLoading, error: clientError } = useClientStore();
  const { services, fetchServices, loading: servicesLoading, error: serviceError } = useServiceStore();

  // Fetch data when salon context or selected date changes
  useEffect(() => {
    if (currentSalon?.id && !salonLoading && !salonError) {
      fetchAppointments(currentSalon.id, date);
      // Fetch clients and services once on load or if salon changes
      fetchClients(currentSalon.id); 
      fetchServices(currentSalon.id);
    }
  }, [currentSalon?.id, date, salonLoading, salonError, fetchAppointments, fetchClients, fetchServices]);

  // Calculate Stats dynamically
  const todaysAppointmentsCount = appointments.filter(app => 
     isSameDay(new Date(app.start_time), date) && 
     app.status !== 'cancelled' // Exclude cancelled
  ).length;

  const activeClientsCount = clients.length; // Assuming all fetched clients are active for now

  const averageServiceTime = useMemo(() => { // Use useMemo for calculation
     if (!services || services.length === 0) return 0;
     const totalDuration = services.reduce((sum, service) => sum + service.duration, 0);
     return Math.round(totalDuration / services.length);
  }, [services]);

  // Placeholder for Revenue MTD
  const revenueMTD = 'N/A';

  // Remove the hardcoded stats array definition
  // Removed hardcoded stats array definition
  // Removed hardcoded appointments array

  const handleTimeSlotClick = (time: string) => {
    setSelectedTime(time);
    setShowNewAppointment(true);
  };

  // Combine loading states
  const isLoading = salonLoading || appointmentsLoading || clientsLoading || servicesLoading;
  // Combine errors (show first one encountered)
  const combinedError = salonError || appointmentError || clientError || serviceError;

  // --- Render Logic ---
  if (isLoading && appointments.length === 0 && clients.length === 0) { // Show loading on initial fetch
     return <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (combinedError) {
     return <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">Error loading dashboard data: {combinedError}</div>;
  }
   if (!isLoading && !currentSalon) {
     return <div className="p-6 text-center text-gray-500">No active salon associated with this account.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid - Use dynamic data */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
         {/* Today's Appointments */}
         <div className="relative bg-white overflow-hidden rounded-lg border border-gray-100 p-5">
            <div className="flex justify-between"> <div className="bg-indigo-600 rounded-lg p-2"> <Calendar className="h-5 w-5 text-white" /> </div> </div>
            <p className="mt-4 text-2xl font-semibold text-gray-900">{todaysAppointmentsCount}</p>
            <p className="mt-1 text-sm text-gray-500">Today's Appointments</p>
         </div>
         {/* Active Clients */}
         <div className="relative bg-white overflow-hidden rounded-lg border border-gray-100 p-5">
            <div className="flex justify-between"> <div className="bg-indigo-600 rounded-lg p-2"> <Users className="h-5 w-5 text-white" /> </div> </div>
            <p className="mt-4 text-2xl font-semibold text-gray-900">{activeClientsCount.toLocaleString()}</p>
            <p className="mt-1 text-sm text-gray-500">Active Clients</p>
         </div>
         {/* Average Service Time */}
         <div className="relative bg-white overflow-hidden rounded-lg border border-gray-100 p-5">
            <div className="flex justify-between"> <div className="bg-indigo-600 rounded-lg p-2"> <Clock className="h-5 w-5 text-white" /> </div> </div>
            <p className="mt-4 text-2xl font-semibold text-gray-900">{averageServiceTime} min</p>
            <p className="mt-1 text-sm text-gray-500">Average Service Time</p>
         </div>
         {/* Revenue (MTD) - Still Placeholder */}
         <div className="relative bg-white overflow-hidden rounded-lg border border-gray-100 p-5">
            <div className="flex justify-between"> <div className="bg-indigo-600 rounded-lg p-2"> <DollarSign className="h-5 w-5 text-white" /> </div> </div>
            <p className="mt-4 text-2xl font-semibold text-gray-900">{revenueMTD}</p>
            <p className="mt-1 text-sm text-gray-500">Revenue (MTD)</p>
         </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-lg border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
            <div className="flex items-center space-x-4">
              <AppointmentCalendar selectedDate={date} onDateChange={setDate} />
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button onClick={() => setViewMode('list')} className={`p-1 rounded ${viewMode === 'list' ? 'bg-white shadow' : 'hover:bg-white/50'}`}> <List className="h-4 w-4" /> </button>
                <button onClick={() => setViewMode('agenda')} className={`p-1 rounded ${viewMode === 'agenda' ? 'bg-white shadow' : 'hover:bg-white/50'}`}> <LayoutGrid className="h-4 w-4" /> </button>
              </div>
              <Link to="/salon/appointments" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"> View all <ChevronRight className="ml-1 h-4 w-4" /> </Link>
            </div>
          </div>
        </div>
        <div>
          {/* Pass fetched appointments to child components */}
          {viewMode === 'list' ? (
            <AppointmentList appointments={appointments.filter(app => isSameDay(new Date(app.start_time), date))} /> // Filter for the selected day
          ) : (
            <AgendaView appointments={appointments.filter(app => isSameDay(new Date(app.start_time), date))} onTimeSlotClick={handleTimeSlotClick} date={date} /> // Filter for the selected day
          )}
           {/* Add message if no appointments for the selected day */}
           {!appointmentsLoading && appointments.filter(app => isSameDay(new Date(app.start_time), date)).length === 0 && (
              <p className="text-center text-gray-500 py-10">No appointments scheduled for this day.</p>
           )}
        </div>
      </div>

      {/* New Appointment Dialog */}
      <Dialog open={showNewAppointment} onOpenChange={setShowNewAppointment}>
        <DialogContent>
          <DialogHeader> <DialogTitle>New Appointment</DialogTitle> </DialogHeader>
          <AppointmentForm initialTime={selectedTime} initialDate={date} onSuccess={() => setShowNewAppointment(false)} onCancel={() => setShowNewAppointment(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}