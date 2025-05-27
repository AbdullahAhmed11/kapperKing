// import React, { useEffect, useState } from 'react';
// import { useForm, Controller } from 'react-hook-form';
// import { useLocation } from 'react-router-dom'; // Import useLocation
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { format, parseISO, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { useCurrentSalonStore } from '@/lib/store/currentSalon';
// import { useServiceStore, Service } from '@/lib/store/services';
// import { useStaffStore, StaffMember } from '@/lib/store/staff';
// import { useAppointmentStore } from '@/lib/store/appointments';
// import { useClientStore, Client, AddSalonClientFormData } from '@/lib/store/clients'; // Import client store
// import { toast } from 'sonner';
// import { Loader2, ChevronsUpDown, Check, PlusCircle } from 'lucide-react'; // Import icons
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Import Popover
// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"; // Import Command
// // Consolidate Dialog imports
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';

// // Schema for the main appointment form
// const appointmentSchema = z.object({
//   clientId: z.string().min(1, 'Please select a client'),
//   serviceId: z.string().min(1, 'Please select a service'),
//   staffId: z.string().min(1, 'Please select a staff member'),
//   date: z.string().min(1, 'Please select a date'),
//   time: z.string().min(1, 'Please select a time'),
//   notes: z.string().optional(),
// });
// type AppointmentFormData = z.infer<typeof appointmentSchema>;

// // Schema for the Add New Client Dialog
// const addClientSchema = z.object({
//   firstName: z.string().min(1, 'First name required'),
//   lastName: z.string().min(1, 'Last name required'),
//   email: z.string().email('Invalid email'),
//   phone: z.string().optional(),
//   // marketingConsent: z.boolean().default(false), // Keep it simple for this form
// });
// type AddClientDialogFormData = z.infer<typeof addClientSchema>;

// export interface AppointmentFormProps {
//   initialTime?: string | null;
//   initialDate?: Date;
//   onSuccess?: () => void;
//   onCancel?: () => void;
// }

// export function AppointmentForm({ initialTime, initialDate = new Date(), onSuccess, onCancel }: AppointmentFormProps) {
//   const location = useLocation(); // Get location object
//   const preselectedClientId = location.state?.preselectedClientId; // Get client ID from state
//   const { currentSalon } = useCurrentSalonStore();
//   const { services, fetchServices } = useServiceStore();
//   const { staff, fetchStaff } = useStaffStore();
//   const { clients, fetchClients, addClient: addSalonClient, loading: clientLoading } = useClientStore(); // Get client store actions + loading
//   const { createAppointment, loading: creatingAppointment } = useAppointmentStore();

//   const [comboboxOpen, setComboboxOpen] = useState(false);
//   const [showAddClientDialog, setShowAddClientDialog] = useState(false);

//   const { register, handleSubmit, formState: { errors }, reset, control, setValue, watch } = useForm<AppointmentFormData>({
//     resolver: zodResolver(appointmentSchema),
//     defaultValues: {
//       // Set default clientId if passed via state
//       clientId: preselectedClientId || '',
//       serviceId: '', staffId: '',
//       time: initialTime || format(initialDate, 'HH:mm'),
//       date: format(initialDate, 'yyyy-MM-dd'),
//       notes: '',
//     }
//   });
//   const selectedClientId = watch('clientId');

//   // Form hook for the Add Client Dialog
//   const addClientForm = useForm<AddClientDialogFormData>({ resolver: zodResolver(addClientSchema) });

//   // Fetch services, staff, and clients
//   useEffect(() => {
//     if (currentSalon?.id) {
//       fetchServices(currentSalon.id);
//       fetchStaff(currentSalon.id);
//       fetchClients(currentSalon.id);
//     }
//   }, [currentSalon?.id, fetchServices, fetchStaff, fetchClients]);

//   // Reset form effect, include preselected client ID
//   useEffect(() => {
//     reset({
//       time: initialTime || format(initialDate, 'HH:mm'),
//       date: format(initialDate, 'yyyy-MM-dd'),
//       clientId: preselectedClientId || '', // Reset with preselected ID
//       serviceId: '', staffId: '', notes: ''
//     });
//   }, [initialTime, initialDate, preselectedClientId, reset]); // Add preselectedClientId to dependency array

//   // Main form submission
//   const onSubmit = async (data: AppointmentFormData) => {
//      if (!currentSalon?.id) { toast.error("Cannot create appointment: Salon context is missing."); return; }
//      try {
//        const [hours, minutes] = data.time.split(':').map(Number);
//        let startTime = parseISO(data.date);
//        startTime = setHours(startTime, hours); startTime = setMinutes(startTime, minutes);
//        startTime = setSeconds(startTime, 0); startTime = setMilliseconds(startTime, 0);
//        const selectedService = services.find(s => s.id === data.serviceId);
//        if (!selectedService) { toast.error("Selected service not found."); return; }
//        const endTime = new Date(startTime.getTime() + selectedService.duration * 60000);
//        const appointmentPayload = {
//          salon_id: currentSalon.id, client_id: data.clientId, staff_id: data.staffId,
//          service_id: data.serviceId, start_time: startTime.toISOString(), end_time: endTime.toISOString(),
//          status: 'confirmed' as const, notes: data.notes,
//        };
//        console.log('Creating appointment with payload:', appointmentPayload);
//        const success = await createAppointment(appointmentPayload);
//        if (success) onSuccess?.();
//      } catch (e) { console.error("Error processing appointment time:", e); toast.error("Invalid date or time format."); }
//   };

//   // Add New Client Dialog submission
//   const handleAddClientSubmit = async (data: AddClientDialogFormData) => {
//      if (!currentSalon?.id) { toast.error("Salon context missing."); return; }
//      const payload: AddSalonClientFormData = { ...data, salon_id: currentSalon.id };
//      const newClient = await addSalonClient(payload);
//      if (newClient) {
//         setShowAddClientDialog(false);
//         setValue('clientId', newClient.id, { shouldValidate: true }); // Auto-select and validate
//         addClientForm.reset({ firstName: '', lastName: '', email: '', phone: '' }); // Reset add client form
//      }
//   }

//   return (
//     <>
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
//         {/* Client Combobox */}
//         <div>
//           <Label>Client</Label>
//           <Controller
//              control={control}
//              name="clientId"
//              render={({ field }) => (
//                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
//                  <PopoverTrigger asChild>
//                    <Button
//                      variant="outline"
//                      role="combobox"
//                      aria-expanded={comboboxOpen}
//                      className="w-full justify-between mt-1 h-10 font-normal"
//                    >
//                      {field.value
//                        ? clients.find((client) => client.id === field.value)?.firstName + ' ' + clients.find((client) => client.id === field.value)?.lastName
//                        : "Select client..."}
//                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                    </Button>
//                  </PopoverTrigger>
//                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
//                    <Command>
//                      <CommandInput placeholder="Search clients..." />
//                      <CommandList>
//                         <CommandEmpty>
//                            <div className="py-4 text-center text-sm">
//                               No client found.
//                               <Button variant="link" size="sm" className="block mx-auto p-1 h-auto text-primary" onClick={() => { setComboboxOpen(false); setShowAddClientDialog(true); }}>
//                                  <PlusCircle className="h-4 w-4 mr-1 inline-block"/> Add New Client
//                               </Button>
//                            </div>
//                         </CommandEmpty>
//                         <CommandGroup>
//                           {clientLoading ? (
//                              <CommandItem disabled>Loading clients...</CommandItem>
//                           ) : (
//                              clients.map((client) => (
//                                <CommandItem
//                                  key={client.id}
//                                  value={`${client.firstName} ${client.lastName} ${client.email}`} // Value for searching
//                                  onSelect={() => {
//                                    setValue("clientId", client.id, { shouldValidate: true }); // Set value and validate
//                                    setComboboxOpen(false);
//                                  }}
//                                >
//                                  <Check className={`mr-2 h-4 w-4 ${field.value === client.id ? "opacity-100" : "opacity-0"}`} />
//                                  {client.firstName} {client.lastName} <span className="text-xs text-gray-500 ml-2">({client.email})</span>
//                                </CommandItem>
//                              ))
//                           )}
//                            <CommandItem
//                               key="add-new"
//                               onSelect={() => { setComboboxOpen(false); setShowAddClientDialog(true); }}
//                               className="text-primary cursor-pointer flex items-center justify-center pt-2 mt-1 border-t"
//                            >
//                               <PlusCircle className="h-4 w-4 mr-2"/> Add New Client
//                            </CommandItem>
//                         </CommandGroup>
//                      </CommandList>
//                    </Command>
//                  </PopoverContent>
//                </Popover>
//              )}
//            />
//            {errors.clientId && <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>}
//         </div>

//         {/* Service Select */}
//         <div>
//           <Label htmlFor="serviceId">Service</Label>
//           <select id="serviceId" {...register('serviceId')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-10">
//             <option value="">Select a service</option>
//             {services.map((service) => ( <option key={service.id} value={service.id}> {service.name} ({service.duration} min) - €{service.price} </option> ))}
//           </select>
//           {errors.serviceId && <p className="mt-1 text-sm text-red-600">{errors.serviceId.message}</p>}
//         </div>

//         {/* Staff Select */}
//         <div>
//           <Label htmlFor="staffId">Staff Member</Label>
//           <select id="staffId" {...register('staffId')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-10">
//             <option value="">Select a staff member</option>
//             {staff.map((member) => ( <option key={member.id} value={member.id}> {member.firstName} {member.lastName} </option> ))}
//           </select>
//           {errors.staffId && <p className="mt-1 text-sm text-red-600">{errors.staffId.message}</p>}
//         </div>

//         {/* Date & Time */}
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <Label htmlFor="date">Date</Label>
//             <Input type="date" id="date" {...register('date')} min={format(new Date(), 'yyyy-MM-dd')} className="mt-1 h-10" />
//             {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
//           </div>
//           <div>
//             <Label htmlFor="time">Time</Label>
//             <Input type="time" id="time" {...register('time')} step={900} className="mt-1 h-10" />
//             {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>}
//           </div>
//         </div>

//         {/* Notes */}
//         <div>
//           <Label htmlFor="notes">Notes</Label>
//           <Textarea id="notes" {...register('notes')} rows={3} className="mt-1" />
//         </div>

//         {/* Buttons */}
//         <div className="flex justify-end space-x-3 pt-2">
//           <Button type="button" variant="outline" onClick={onCancel} disabled={creatingAppointment}> Cancel </Button>
//           <Button type="submit" disabled={creatingAppointment}>
//             {creatingAppointment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
//             {creatingAppointment ? 'Creating...' : 'Create Appointment'}
//           </Button>
//         </div>
//       </form>

//       {/* Add New Client Dialog */}
//       <Dialog open={showAddClientDialog} onOpenChange={setShowAddClientDialog}>
//          <DialogContent>
//            <DialogHeader>
//               <DialogTitle>Add New Client</DialogTitle>
//               <DialogDescription>Enter the details for the new client.</DialogDescription>
//            </DialogHeader>
//            <form onSubmit={addClientForm.handleSubmit(handleAddClientSubmit)} className="space-y-4 py-2">
//               <div className="grid grid-cols-2 gap-4">
//                  <div>
//                     <Label htmlFor="newClientFirstName">First Name</Label>
//                     <Input id="newClientFirstName" {...addClientForm.register('firstName')} className="mt-1" />
//                     {addClientForm.formState.errors.firstName && <p className="mt-1 text-sm text-red-600">{addClientForm.formState.errors.firstName.message}</p>}
//                  </div>
//                  <div>
//                     <Label htmlFor="newClientLastName">Last Name</Label>
//                     <Input id="newClientLastName" {...addClientForm.register('lastName')} className="mt-1" />
//                     {addClientForm.formState.errors.lastName && <p className="mt-1 text-sm text-red-600">{addClientForm.formState.errors.lastName.message}</p>}
//                  </div>
//               </div>
//               <div>
//                  <Label htmlFor="newClientEmail">Email</Label>
//                  <Input id="newClientEmail" type="email" {...addClientForm.register('email')} className="mt-1" />
//                  {addClientForm.formState.errors.email && <p className="mt-1 text-sm text-red-600">{addClientForm.formState.errors.email.message}</p>}
//               </div>
//               <div>
//                  <Label htmlFor="newClientPhone">Phone (Optional)</Label>
//                  <Input id="newClientPhone" type="tel" {...addClientForm.register('phone')} className="mt-1" />
//               </div>
//               {/* Removed marketing consent for simplicity in this dialog */}
//               <DialogFooter>
//                  <DialogClose asChild>
//                     <Button type="button" variant="outline">Cancel</Button>
//                  </DialogClose>
//                  {/* Use loading state from client store */}
//                  <Button type="submit" disabled={clientLoading}> 
//                     {clientLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                     Save Client
//                  </Button>
//               </DialogFooter>
//            </form>
//          </DialogContent>
//        </Dialog>
//     </>
//   );
// }

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, ChevronsUpDown, Check, PlusCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';

// Schema for the main appointment form
const appointmentSchema = z.object({
  clientId: z.string().min(1, 'Please select a client'),
  serviceId: z.string().min(1, 'Please select a service'),
  staffId: z.string().min(1, 'Please select a staff member'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  notes: z.string().optional(),
});
type AppointmentFormData = z.infer<typeof appointmentSchema>;

// Schema for the Add New Client Dialog
const addClientSchema = z.object({
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
});
type AddClientDialogFormData = z.infer<typeof addClientSchema>;

interface Service {
  id: number;
  name: string;
  description: string;
  duration: string; // "00:30:00" format
  price: number;
  categoryName: string;
}

interface AppointmentFormProps {
  initialTime?: string | null;
  initialDate?: Date;
  onSuccess?: () => void;
  onCancel?: () => void;
  salonId?: string; // Added salonId prop
}

export function AppointmentForm({ initialTime, initialDate = new Date(), onSuccess, onCancel, salonId = "16" }: AppointmentFormProps) {
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [showAddClientDialog, setShowAddClientDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [staff, setStaff] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [clients, setClients] = useState<{ id: string; firstName: string; lastName: string; email: string; phone: string }[]>([]);

  const { register, handleSubmit, formState: { errors }, reset, control, setValue, watch } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      clientId: '',
      serviceId: '', 
      staffId: '',
      time: initialTime || format(initialDate, 'HH:mm'),
      date: format(initialDate, 'yyyy-MM-dd'),
      notes: '',
    }
  });

  const addClientForm = useForm<AddClientDialogFormData>({ 
    resolver: zodResolver(addClientSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    }
  });

  const selectedServiceId = watch('serviceId');
  const selectedClientId = watch('clientId');
  const selectedStaffId = watch('staffId');
  const selectedDate = watch('date');
  const selectedTime = watch('time');

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('https://kapperking.runasp.net/api/Users/GetCustomers');
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast.error('Failed to load clients');
      }
    };
    fetchClients();
  }, []);

  // Fetch staff members
  useEffect(() => {
    const fetchStaff = async () => {
      setIsLoadingStaff(true);
      try {
        const response = await axios.get(`https://kapperking.runasp.net/api/Salons/GetStylists?id=${salonId}`);
        const formattedStaff = response.data.map((staffMember: any) => ({
          id: staffMember.id.toString(),
          firstName: staffMember.firstName,
          lastName: staffMember.lastName
        }));
        setStaff(formattedStaff);
      } catch (error) {
        console.error('Error fetching staff:', error);
        toast.error('Failed to load staff members');
      } finally {
        setIsLoadingStaff(false);
      }
    };
    fetchStaff();
  }, [salonId]);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoadingServices(true);
      try {
        const response = await axios.get(`https://kapperking.runasp.net/api/Services/Getservices/${salonId}`);
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to load services');
      } finally {
        setIsLoadingServices(false);
      }
    };
    fetchServices();
  }, [salonId]);

  // Reset form when initial values change
  useEffect(() => {
    reset({
      time: initialTime || format(initialDate, 'HH:mm'),
      date: format(initialDate, 'yyyy-MM-dd'),
      clientId: '',
      serviceId: '', 
      staffId: '', 
      notes: ''
    });
  }, [initialTime, initialDate, reset]);

  const onSubmit = async (data: AppointmentFormData) => {
    setIsCreating(true);
    try {
      const selectedService = services.find(service => service.id.toString() === data.serviceId);
      if (!selectedService) {
        throw new Error('Selected service not found');
      }

      const appointmentData = {
        StartAt: data.time, // "15:20" format
        AppointmentDuration: selectedService.duration, // "1:1:1" format
        CustomerId: 8,
        StylistId: data.staffId,
        SalonId: salonId,
        ServicesIds: [data.serviceId],
        Notes: data.notes,
        Date: data.date // Added date field
      };

      const response = await axios.post(
        'https://kapperking.runasp.net/api/Appointments/AddAppointment',
        appointmentData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      toast.success('Appointment booked successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddClientSubmit = async (data: AddClientDialogFormData) => {
    setIsAddingClient(true);
    try {
      const requestBody = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || '',
        password: 'defaultPassword'
      };

      const response = await axios.post(
        'https://kapperking.runasp.net/api/Users/AddCustomer',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const newClient = {
        id: response.data.id,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        phone: response.data.phone || ''
      };

      setClients(prev => [...prev, newClient]);
      setValue('clientId', newClient.id, { shouldValidate: true });
      setShowAddClientDialog(false);
      addClientForm.reset();
      
      toast.success('Client added successfully');
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Failed to add client');
    } finally {
      setIsAddingClient(false);
    }
  };

  // Helper function to convert duration string to minutes
  const durationToMinutes = (duration: string) => {
    const [hours, minutes] = duration.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        {/* Client Combobox */}
        {/* <div>
          <Label>Client</Label>
          <Controller
            control={control}
            name="clientId"
            render={({ field }) => (
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className="w-full justify-between mt-1 h-10 font-normal"
                  >
                    {field.value
                      ? clients.find((client) => client.id === field.value)?.firstName + ' ' + 
                        clients.find((client) => client.id === field.value)?.lastName
                      : "Select client..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search clients..." />
                    <CommandList>
                      <CommandEmpty>
                        <div className="py-4 text-center text-sm">
                          No client found.
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="block mx-auto p-1 h-auto text-primary" 
                            onClick={() => { setComboboxOpen(false); setShowAddClientDialog(true); }}
                          >
                            <PlusCircle className="h-4 w-4 mr-1 inline-block"/> Add New Client
                          </Button>
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {clients.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={`${client.firstName} ${client.lastName} ${client.email}`}
                            onSelect={() => {
                              setValue("clientId", client.id, { shouldValidate: true });
                              setComboboxOpen(false);
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${field.value === client.id ? "opacity-100" : "opacity-0"}`} />
                            {client.firstName} {client.lastName} 
                            <span className="text-xs text-gray-500 ml-2">({client.email})</span>
                          </CommandItem>
                        ))}
                        <CommandItem
                          onSelect={() => { setComboboxOpen(false); setShowAddClientDialog(true); }}
                          className="text-primary cursor-pointer flex items-center justify-center pt-2 mt-1 border-t"
                        >
                          <PlusCircle className="h-4 w-4 mr-2"/> Add New Client
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.clientId && <p className="mt-1 text-sm text-red-600">{errors.clientId.message}</p>}
        </div> */}

        {/* Service Select */}
        <div>
          <Label htmlFor="serviceId">Service</Label>
          {isLoadingServices ? (
            <div className="mt-1 flex items-center justify-center h-10 rounded-md border border-gray-200">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <select 
              id="serviceId" 
              {...register('serviceId')} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-10"
              disabled={isLoadingServices}
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({durationToMinutes(service.duration)} min) - €{service.price}
                  {service.categoryName && ` (${service.categoryName})`}
                </option>
              ))}
            </select>
          )}
          {errors.serviceId && <p className="mt-1 text-sm text-red-600">{errors.serviceId.message}</p>}
        </div>

        {/* Staff Select */}
        <div>
          <Label htmlFor="staffId">Staff Member</Label>
          {isLoadingStaff ? (
            <div className="mt-1 flex items-center justify-center h-10 rounded-md border border-gray-200">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <select 
              id="staffId" 
              {...register('staffId')} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-10"
              disabled={isLoadingStaff}
            >
              <option value="">Select a staff member</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
          )}
          {errors.staffId && <p className="mt-1 text-sm text-red-600">{errors.staffId.message}</p>}
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input 
              type="date" 
              id="date" 
              {...register('date')} 
              min={format(new Date(), 'yyyy-MM-dd')} 
              className="mt-1 h-10" 
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
          </div>
          <div>
            <Label htmlFor="time">Time</Label>
            <Input 
              type="time" 
              id="time" 
              {...register('time')} 
              step={900} 
              className="mt-1 h-10" 
            />
            {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>}
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea 
            id="notes" 
            {...register('notes')} 
            rows={3} 
            className="mt-1" 
            placeholder="Any special requests or notes..."
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isCreating ? 'Creating...' : 'Create Appointment'}
          </Button>
        </div>
      </form>

      {/* Add New Client Dialog */}
      <Dialog open={showAddClientDialog} onOpenChange={setShowAddClientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Enter the details for the new client.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={addClientForm.handleSubmit(handleAddClientSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newClientFirstName">First Name</Label>
                <Input 
                  id="newClientFirstName" 
                  {...addClientForm.register('firstName')} 
                  className="mt-1" 
                />
                {addClientForm.formState.errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {addClientForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="newClientLastName">Last Name</Label>
                <Input 
                  id="newClientLastName" 
                  {...addClientForm.register('lastName')} 
                  className="mt-1" 
                />
                {addClientForm.formState.errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {addClientForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="newClientEmail">Email</Label>
              <Input 
                id="newClientEmail" 
                type="email" 
                {...addClientForm.register('email')} 
                className="mt-1" 
              />
              {addClientForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {addClientForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="newClientPhone">Phone (Optional)</Label>
              <Input 
                id="newClientPhone" 
                type="tel" 
                {...addClientForm.register('phone')} 
                className="mt-1" 
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isAddingClient}>
                {isAddingClient && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Client
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}