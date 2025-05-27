// import React, { useState, useEffect } from 'react';
// import { format } from 'date-fns';
// import { Plus, Filter, Search, List, LayoutGrid, Loader2 } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { AppointmentForm, AppointmentFormProps } from '@/components/appointments/AppointmentForm'; // Import Props type
// import { AppointmentList } from '@/components/appointments/AppointmentList';
// import { AppointmentDetails } from '@/components/appointments/AppointmentDetails';
// import { AgendaView } from '@/components/appointments/AgendaView';
// import { AppointmentCalendar } from '@/components/appointments/AppointmentCalendar';
// import { useCurrentSalonStore } from '@/lib/store/currentSalon';
// import { useAppointmentStore, selectAllAppointments, Appointment } from '@/lib/store/appointments'; // Use imported Appointment type
// import { useStaffStore, StaffMember } from '@/lib/store/staff';
// import { useServiceStore, Service } from '@/lib/store/services';

// export default function Appointments() {
//   const { currentSalon } = useCurrentSalonStore();
//   const { appointments, loading: appointmentsLoading, error: appointmentsError, fetchAppointments } = useAppointmentStore();
//   const { staff, fetchStaff } = useStaffStore();
//   const { services, fetchServices } = useServiceStore();

//   const [date, setDate] = useState<Date>(new Date());
//   const [viewMode, setViewMode] = useState<'list' | 'agenda'>('agenda');
//   const [showNewAppointment, setShowNewAppointment] = useState(false);
//   const [selectedTime, setSelectedTime] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null); // Use imported type
//   const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>(['All Staff']);
//   const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(['All Services']);

//   // useEffect(() => {
//   //   if (currentSalon?.id) {
//   //     fetchAppointments(currentSalon.id, date);
//   //     fetchStaff(currentSalon.id);
//   //     fetchServices(currentSalon.id);
//   //   }
//   // }, [currentSalon?.id, date, fetchAppointments, fetchStaff, fetchServices]);

//   useEffect(() => {
//     fetchAppointments("16", date);
//   },[])

//   const handleStaffFilterChange = (staffId: string, checked: boolean | string) => {
//     setSelectedStaffIds(prev => {
//       if (staffId === 'All Staff') return checked ? ['All Staff'] : [];
//       let newSelection = prev.filter(id => id !== 'All Staff');
//       if (checked) newSelection = [...newSelection, staffId];
//       else newSelection = newSelection.filter(id => id !== staffId);
//       return newSelection.length === 0 ? ['All Staff'] : newSelection;
//     });
//     // TODO: Refetch appointments with filter or filter locally
//   };

//   const handleServiceFilterChange = (serviceId: string, checked: boolean | string) => {
//      setSelectedServiceIds(prev => {
//        if (serviceId === 'All Services') return checked ? ['All Services'] : [];
//        let newSelection = prev.filter(id => id !== 'All Services');
//        if (checked) newSelection = [...newSelection, serviceId];
//        else newSelection = newSelection.filter(id => id !== serviceId);
//        return newSelection.length === 0 ? ['All Services'] : newSelection;
//      });
//      // TODO: Refetch appointments with filter or filter locally
//    };

//   const filteredAppointments = appointments.filter(app => {
//     const staffMatch = selectedStaffIds.includes('All Staff') || selectedStaffIds.includes(app.staff_id);
//     const serviceMatch = selectedServiceIds.includes('All Services') || selectedServiceIds.includes(app.service_id);
//     // Use correct property names (firstName, lastName) from joined data
//     const searchMatch = !searchQuery ||
//       `${app.clients?.firstName} ${app.clients?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || // Corrected
//       app.services?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       `${app.staff?.firstName} ${app.staff?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()); // Corrected

//     return staffMatch && serviceMatch && searchMatch;
//   });

//   const handleTimeSlotClick = (time: string) => { setSelectedTime(time); setShowNewAppointment(true); };
//   const handleAppointmentClick = (appointment: Appointment) => { setSelectedAppointment(appointment); };
//   const handleAppointmentCancel = (id: string) => { console.log('Cancel appointment:', id); setSelectedAppointment(null); /* TODO: Call store action */ };
//   const handleAppointmentConfirm = (id: string) => { console.log('Confirm appointment:', id); setSelectedAppointment(null); /* TODO: Call store action */ };
//   const handleAppointmentComplete = (id: string) => { console.log('Complete appointment:', id); setSelectedAppointment(null); /* TODO: Call store action */ };

//   return (
//     <div className="h-[calc(100vh-4rem)] flex"> {/* Main container */}
//       {/* Left Sidebar */}
//       <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col space-y-4 overflow-y-auto">
//         <AppointmentCalendar selectedDate={date} onDateChange={setDate} />
//         {/* Staff Filter */}
//         <div className="border-t border-gray-200 pt-4">
//           <h3 className="text-sm font-medium text-gray-900 mb-2">Staff</h3>
//           <div className="space-y-2">
//             <label key="All Staff" className="flex items-center">
//               <Checkbox id="staff-all" checked={selectedStaffIds.includes('All Staff')} onCheckedChange={(checked) => handleStaffFilterChange('All Staff', checked)} />
//               <span className="ml-2 text-sm text-gray-700">All Staff</span>
//             </label>
//             {staff.map((staffMember: StaffMember) => (
//               <label key={staffMember.id} className="flex items-center">
//                 <Checkbox id={`staff-${staffMember.id}`} checked={selectedStaffIds.includes(staffMember.id)} onCheckedChange={(checked) => handleStaffFilterChange(staffMember.id, checked)} />
//                 <span className="ml-2 text-sm text-gray-700">{staffMember.firstName} {staffMember.lastName}</span>
//               </label>
//             ))}
//           </div>
//         </div>
//         {/* Service Filter */}
//         <div className="border-t border-gray-200 pt-4">
//           <h3 className="text-sm font-medium text-gray-900 mb-2">Services</h3>
//           <div className="space-y-2">
//              <label key="All Services" className="flex items-center">
//                <Checkbox id="service-all" checked={selectedServiceIds.includes('All Services')} onCheckedChange={(checked) => handleServiceFilterChange('All Services', checked)} />
//                <span className="ml-2 text-sm text-gray-700">All Services</span>
//              </label>
//             {services.map((service: Service) => (
//               <label key={service.id} className="flex items-center">
//                 <Checkbox id={`service-${service.id}`} checked={selectedServiceIds.includes(service.id)} onCheckedChange={(checked) => handleServiceFilterChange(service.id, checked)} />
//                 <span className="ml-2 text-sm text-gray-700">{service.name}</span>
//               </label>
//             ))}
//           </div>
//         </div>
//       </div> {/* End Left Sidebar */}

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col">
//         {/* Header */}
//         <div className="p-6 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
//               <p className="mt-1 text-sm text-gray-500">{format(date, 'EEEE, MMMM d, yyyy')}</p>
//             </div>
//             <div className="flex items-center space-x-4">
//               {/* View Toggle, Search, New Button */}
//               <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
//                 <Button variant="ghost" size="sm" onClick={() => setViewMode('list')} className={`p-1 rounded ${viewMode === 'list' ? 'bg-white shadow' : 'hover:bg-white/50'}`}> <List className="h-4 w-4" /> </Button>
//                 <Button variant="ghost" size="sm" onClick={() => setViewMode('agenda')} className={`p-1 rounded ${viewMode === 'agenda' ? 'bg-white shadow' : 'hover:bg-white/50'}`}> <LayoutGrid className="h-4 w-4" /> </Button>
//               </div>
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <Input type="text" placeholder="Search appointments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
//               </div>
//               <Button onClick={() => { setSelectedTime(null); setShowNewAppointment(true); }}> <Plus className="h-4 w-4 mr-2" /> New Appointment </Button>
//             </div>
//           </div>
//         </div>
//         {/* Scrollable Content Area */}
//         <div className="flex-1 overflow-y-auto">
//            {appointmentsLoading ? (
//               <div className="flex items-center justify-center h-64"> <Loader2 className="animate-spin h-8 w-8 text-primary" /> </div>
//            ) : appointmentsError ? (
//               <div className="p-6 text-center text-red-600">Error: {appointmentsError}</div>
//            // Ensure AppointmentList and AgendaView accept the imported Appointment type
//            ) : viewMode === 'list' ? (
//              <AppointmentList appointments={filteredAppointments} onAppointmentClick={handleAppointmentClick} />
//            ) : (
//              <AgendaView appointments={filteredAppointments} onTimeSlotClick={handleTimeSlotClick} date={date} />
//            )}
//         </div>
//       </div> {/* End Main Content */}

//       {/* New Appointment Dialog */}
//       <Dialog open={showNewAppointment} onOpenChange={setShowNewAppointment}>
//         <DialogContent>
//           <DialogHeader> <DialogTitle>New Appointment</DialogTitle> </DialogHeader>
//           {/* Pass initialDate prop correctly if AppointmentForm expects it */}
//           <AppointmentForm
//             initialTime={selectedTime}
//             initialDate={date} // Assuming AppointmentFormProps includes initialDate: Date
//             onSuccess={() => setShowNewAppointment(false)}
//             onCancel={() => setShowNewAppointment(false)}
//           />
//         </DialogContent>
//       </Dialog>

//       {/* Appointment Details Dialog */}
//       {/* Ensure AppointmentDetails accepts the imported Appointment type */}
//       <AppointmentDetails
//         appointment={selectedAppointment}
//         onClose={() => setSelectedAppointment(null)}
//         onCancel={handleAppointmentCancel}
//         onConfirm={handleAppointmentConfirm}
//         onComplete={handleAppointmentComplete}
//       />
//     </div> // End Main container
//   );
// }

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Filter, Search, List, LayoutGrid, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AppointmentForm, AppointmentFormProps } from '@/components/appointments/AppointmentForm';
import { AppointmentList } from '@/components/appointments/AppointmentList';
import { AppointmentDetails } from '@/components/appointments/AppointmentDetails';
import { AgendaView } from '@/components/appointments/AgendaView';
import { AppointmentCalendar } from '@/components/appointments/AppointmentCalendar';

interface Appointment {
  id: number;
  stylistName: string;
  customerName: string;
  startAt: string;
  duration: number;
  services: string[];
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'agenda'>('agenda');
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>(['All Staff']);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(['All Services']);

  const fetchAppointments = async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const response = await fetch(
        `https://kapperking.runasp.net/api/Appointments/GetAppointmentsByShop?id=1&date=${formattedDate}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(date);
  }, [date]);

  const handleStaffFilterChange = (staffId: string, checked: boolean | string) => {
    setSelectedStaffIds(prev => {
      if (staffId === 'All Staff') return checked ? ['All Staff'] : [];
      let newSelection = prev.filter(id => id !== 'All Staff');
      if (checked) newSelection = [...newSelection, staffId];
      else newSelection = newSelection.filter(id => id !== staffId);
      return newSelection.length === 0 ? ['All Staff'] : newSelection;
    });
  };

  const handleServiceFilterChange = (serviceId: string, checked: boolean | string) => {
    setSelectedServiceIds(prev => {
      if (serviceId === 'All Services') return checked ? ['All Services'] : [];
      let newSelection = prev.filter(id => id !== 'All Services');
      if (checked) newSelection = [...newSelection, serviceId];
      else newSelection = newSelection.filter(id => id !== serviceId);
      return newSelection.length === 0 ? ['All Services'] : newSelection;
    });
  };

  const filteredAppointments = appointments.filter(app => {
    const staffMatch = selectedStaffIds.includes('All Staff') || selectedStaffIds.includes(app.stylistName);
    const serviceMatch = selectedServiceIds.includes('All Services') || 
      app.services.some(service => selectedServiceIds.includes(service));
    const searchMatch = !searchQuery ||
      app.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.stylistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()));

    return staffMatch && serviceMatch && searchMatch;
  });

  const handleTimeSlotClick = (time: string) => { setSelectedTime(time); setShowNewAppointment(true); };
  const handleAppointmentClick = (appointment: Appointment) => { setSelectedAppointment(appointment); };
  const handleAppointmentCancel = (id: number) => { console.log('Cancel appointment:', id); setSelectedAppointment(null); };
  const handleAppointmentConfirm = (id: number) => { console.log('Confirm appointment:', id); setSelectedAppointment(null); };
  const handleAppointmentComplete = (id: number) => { console.log('Complete appointment:', id); setSelectedAppointment(null); };

  return (
  
   <div className="h-[calc(100vh-4rem)] flex">

      {/* Left Sidebar */}

      <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col space-y-4 overflow-y-auto">

        <AppointmentCalendar selectedDate={date} onDateChange={setDate} />
        
        {/* Staff Filter */}
        
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Staff</h3>
          <div className="space-y-2">
            <label key="All Staff" className="flex items-center">
              <Checkbox 
                id="staff-all" 
                checked={selectedStaffIds.includes('All Staff')} 
                onCheckedChange={(checked) => handleStaffFilterChange('All Staff', checked)} 
              />
              <span className="ml-2 text-sm text-gray-700">All Staff</span>
            </label>
            {Array.from(new Set(appointments.map(a => a.stylistName))).map(staffName => (
              <label key={staffName} className="flex items-center">
                <Checkbox 
                  id={`staff-${staffName}`} 
                  checked={selectedStaffIds.includes(staffName)} 
                  onCheckedChange={(checked) => handleStaffFilterChange(staffName, checked)} 
                />
                <span className="ml-2 text-sm text-gray-700">{staffName}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Service Filter */}

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Services</h3>
          <div className="space-y-2">
            <label key="All Services" className="flex items-center">
              <Checkbox 
                id="service-all" 
                checked={selectedServiceIds.includes('All Services')} 
                onCheckedChange={(checked) => handleServiceFilterChange('All Services', checked)} 
              />
              <span className="ml-2 text-sm text-gray-700">All Services</span>
            </label>
            {Array.from(new Set(appointments.flatMap(a => a.services))).map(service => (
              <label key={service} className="flex items-center">
                <Checkbox 
                  id={`service-${service}`} 
                  checked={selectedServiceIds.includes(service)} 
                  onCheckedChange={(checked) => handleServiceFilterChange(service, checked)} 
                />
                <span className="ml-2 text-sm text-gray-700">{service}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
              <p className="mt-1 text-sm text-gray-500">{format(date, 'EEEE, MMMM d, yyyy')}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <Button variant="ghost" size="sm" onClick={() => setViewMode('list')} className={`p-1 rounded ${viewMode === 'list' ? 'bg-white shadow' : 'hover:bg-white/50'}`}>
                  <List className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setViewMode('agenda')} className={`p-1 rounded ${viewMode === 'agenda' ? 'bg-white shadow' : 'hover:bg-white/50'}`}>
                  <LayoutGrid className="h-4 w-4" />
                </Button>
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
              <Button onClick={() => { setSelectedTime(null); setShowNewAppointment(true); }}>
                <Plus className="h-4 w-4 mr-2" /> New Appointment
              </Button>
            </div>
          </div>
        </div>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">Error: {error}</div>
          ) : viewMode === 'list' ? (
            <AppointmentList 
              appointments={filteredAppointments} 
              onAppointmentClick={handleAppointmentClick} 
            />
          ) : (
            <AgendaView 
              appointments={filteredAppointments} 
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
            initialDate={date}
            onSuccess={() => {
              setShowNewAppointment(false);
              fetchAppointments(date);
            }}
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