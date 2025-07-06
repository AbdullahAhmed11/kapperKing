// import React, { useState, useEffect } from 'react';
// import { useForm, Controller } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { format, set } from 'date-fns';
// import axios from 'axios';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { toast } from 'sonner';
// import { Loader2, ChevronsUpDown, Check, PlusCircle } from 'lucide-react';
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
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
// });
// type AddClientDialogFormData = z.infer<typeof addClientSchema>;

// interface Service {
//   id: number;
//   name: string;
//   description: string;
//   duration: string; // "00:30:00" format
//   price: number;
//   categoryName: string;
// }

// interface AppointmentFormProps {
//   initialTime?: string | null;
//   initialDate?: Date;
//   onSuccess?: () => void;
//   onCancel?: () => void;
//   salonId?: string; // Added salonId prop
// }

// export function AppointmentForm() {
//   // const [comboboxOpen, setComboboxOpen] = useState(false);
//   // const [showAddClientDialog, setShowAddClientDialog] = useState(false);
//   // const [isCreating, setIsCreating] = useState(false);
//   // const [isAddingClient, setIsAddingClient] = useState(false);
//   // const [staff, setStaff] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
//   // const [services, setServices] = useState<Service[]>([]);
//   // const [isLoadingServices, setIsLoadingServices] = useState(false);
//   // const [isLoadingStaff, setIsLoadingStaff] = useState(false);
//   // const [clients, setClients] = useState<{ id: string; firstName: string; lastName: string; email: string; phone: string }[]>([]);

//   // const { register, handleSubmit, formState: { errors }, reset, control, setValue, watch } = useForm<AppointmentFormData>({
//   //   resolver: zodResolver(appointmentSchema),
//   //   defaultValues: {
//   //     clientId: '',
//   //     serviceId: '', 
//   //     staffId: '',
//   //     time: initialTime || format(initialDate, 'HH:mm'),
//   //     date: format(initialDate, 'yyyy-MM-dd'),
//   //     notes: '',
//   //   }
//   // });

//   // const addClientForm = useForm<AddClientDialogFormData>({ 
//   //   resolver: zodResolver(addClientSchema),
//   //   defaultValues: {
//   //     firstName: '',
//   //     lastName: '',
//   //     email: '',
//   //     phone: ''
//   //   }
//   // });

//   // const selectedServiceId = watch('serviceId');
//   // const selectedClientId = watch('clientId');
//   // const selectedStaffId = watch('staffId');
//   // const selectedDate = watch('date');
//   // const selectedTime = watch('time');

//   // // Fetch clients
//   // useEffect(() => {
//   //   const fetchClients = async () => {
//   //     try {
//   //       const response = await axios.get('https://kapperking.runasp.net/api/Users/GetCustomers');
//   //       setClients(response.data);
//   //     } catch (error) {
//   //       console.error('Error fetching clients:', error);
//   //       toast.error('Failed to load clients');
//   //     }
//   //   };
//   //   fetchClients();
//   // }, []);

//   // // Fetch staff members
//   // useEffect(() => {
//   //   const fetchStaff = async () => {
//   //     setIsLoadingStaff(true);
//   //     try {
//   //       const response = await axios.get(`https://kapperking.runasp.net/api/Salons/GetStylists?id=${salonId}`);
//   //       const formattedStaff = response.data.map((staffMember: any) => ({
//   //         id: staffMember.id.toString(),
//   //         firstName: staffMember.firstName,
//   //         lastName: staffMember.lastName
//   //       }));
//   //       setStaff(formattedStaff);
//   //     } catch (error) {
//   //       console.error('Error fetching staff:', error);
//   //       toast.error('Failed to load staff members');
//   //     } finally {
//   //       setIsLoadingStaff(false);
//   //     }
//   //   };
//   //   fetchStaff();
//   // }, [salonId]);

//   // // Fetch services
//   // useEffect(() => {
//   //   const fetchServices = async () => {
//   //     setIsLoadingServices(true);
//   //     try {
//   //       const response = await axios.get(`https://kapperking.runasp.net/api/Services/Getservices/${salonId}`);
//   //       setServices(response.data);
//   //     } catch (error) {
//   //       console.error('Error fetching services:', error);
//   //       toast.error('Failed to load services');
//   //     } finally {
//   //       setIsLoadingServices(false);
//   //     }
//   //   };
//   //   fetchServices();
//   // }, [salonId]);

//   // // Reset form when initial values change
//   // useEffect(() => {
//   //   reset({
//   //     time: initialTime || format(initialDate, 'HH:mm'),
//   //     date: format(initialDate, 'yyyy-MM-dd'),
//   //     clientId: '',
//   //     serviceId: '', 
//   //     staffId: '', 
//   //     notes: ''
//   //   });
//   // }, [initialTime, initialDate, reset]);

//   // const onSubmit = async (data: AppointmentFormData) => {
//   //   setIsCreating(true);
//   //   try {
//   //     const selectedService = services.find(service => service.id.toString() === data.serviceId);
//   //     if (!selectedService) {
//   //       throw new Error('Selected service not found');
//   //     }

//   //     const appointmentData = {
//   //       StartAt: data.time, // "15:20" format
//   //       AppointmentDuration: selectedService.duration, // "1:1:1" format
//   //       CustomerId: 8,
//   //       StylistId: data.staffId,
//   //       SalonId: salonId,
//   //       ServicesIds: [data.serviceId],
//   //       Notes: data.notes,
//   //       Date: data.date // Added date field
//   //     };

//   //     const response = await axios.post(
//   //       'https://kapperking.runasp.net/api/Appointments/AddAppointment',
//   //       appointmentData,
//   //       {
//   //         headers: {
//   //           'Content-Type': 'application/json',
//   //         }
//   //       }
//   //     );

//   //     toast.success('Appointment booked successfully');
//   //     onSuccess?.();
//   //   } catch (error) {
//   //     console.error('Error booking appointment:', error);
//   //     toast.error('Failed to book appointment');
//   //   } finally {
//   //     setIsCreating(false);
//   //   }
//   // };

//   // const handleAddClientSubmit = async (data: AddClientDialogFormData) => {
//   //   setIsAddingClient(true);
//   //   try {
//   //     const requestBody = {
//   //       firstName: data.firstName,
//   //       lastName: data.lastName,
//   //       email: data.email,
//   //       phone: data.phone || '',
//   //       password: 'defaultPassword'
//   //     };

//   //     const response = await axios.post(
//   //       'https://kapperking.runasp.net/api/Users/AddCustomer',
//   //       requestBody,
//   //       {
//   //         headers: {
//   //           'Content-Type': 'application/json',
//   //         }
//   //       }
//   //     );

//   //     const newClient = {
//   //       id: response.data.id,
//   //       firstName: response.data.firstName,
//   //       lastName: response.data.lastName,
//   //       email: response.data.email,
//   //       phone: response.data.phone || ''
//   //     };

//   //     setClients(prev => [...prev, newClient]);
//   //     setValue('clientId', newClient.id, { shouldValidate: true });
//   //     setShowAddClientDialog(false);
//   //     addClientForm.reset();
      
//   //     toast.success('Client added successfully');
//   //   } catch (error) {
//   //     console.error('Error adding client:', error);
//   //     toast.error('Failed to add client');
//   //   } finally {
//   //     setIsAddingClient(false);
//   //   }
//   // };

//   // // Helper function to convert duration string to minutes
//   // const durationToMinutes = (duration: string) => {
//   //   const [hours, minutes] = duration.split(':');
//   //   return parseInt(hours) * 60 + parseInt(minutes);
//   // };
//      const [services, setServices] = useState([]);
//   const [staff, setStaff] = useState([]);
//   const [customers, setCustomers] = useState([]);
//   const [serviceOpen, setServiceOpen] = useState(false);
//   const [staffOpen, setStaffOpen] = useState(false);
//   const [customerOpen, setCustomerOpen] = useState(false);
//   const [selectedService, setSelectedService] = useState(null);
//   const [selectedStaff, setSelectedStaff] = useState(null);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [isLoading, setIsLoading] = useState({
//     services: false,
//     staff: false,
//     customers: false
//   });

//   const getServices = async () => {
//     setIsLoading(prev => ({...prev, services: true}));
//     try {
//       const response = await axios.get(`https://kapperking.runasp.net/api/Services/Getservices/1`);
//       setServices(response.data);
//     } catch (error) {
//       console.error("Error fetching services:", error);
//       toast.error("Failed to fetch services.");
//     } finally {
//       setIsLoading(prev => ({...prev, services: false}));
//     }
//   }

//   const getStaff = async () => {
//     setIsLoading(prev => ({...prev, staff: true}));
//     try {
//       const response = await axios.get(`https://kapperking.runasp.net/api/Salons/GetStylists?id=1`);
//       setStaff(response.data);
//     } catch (error) {
//       console.error("Error fetching staff:", error);
//       toast.error("Failed to fetch staff members.");
//     } finally {
//       setIsLoading(prev => ({...prev, staff: false}));
//     }
//   }

//   const getCustomers = async () => {
//     setIsLoading(prev => ({...prev, customers: true}));
//     try {
//       const response = await axios.get(`https://kapperking.runasp.net/api/Salons/GetCustomers?id=1`);
//       setCustomers(response.data);
//     } catch (error) {
//       console.error("Error fetching customers:", error);
//       toast.error("Failed to fetch customers.");
//     } finally {
//       setIsLoading(prev => ({...prev, customers: false}));
//     }
//   }

//   useEffect(() => {
//     getServices();
//     getStaff();
//     getCustomers();
//   }, []);















//   return (
//     <>
//     <div className="space-y-4">
//     <div className="grid gap-2">
//         <Label htmlFor="customer">Customer</Label>
//         <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
//           <PopoverTrigger asChild>
//             <Button
//               variant="outline"
//               role="combobox"
//               aria-expanded={customerOpen}
//               className="w-full justify-between"
//             >
//               {selectedCustomer
//                 ? customers.find((customer) => customer.id === selectedCustomer)?.firstName + ' ' + 
//                   customers.find((customer) => customer.id === selectedCustomer)?.lastName
//                 : "Select customer..."}
//               <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className="w-full p-0">
//             <Command>
//               <CommandInput placeholder="Search customers..." />
//               <CommandEmpty>No customers found.</CommandEmpty>
//               <CommandGroup>
//                 <CommandList>
//                   {isLoading.customers ? (
//                     <div className="flex justify-center py-4">
//                       <Loader2 className="h-6 w-6 animate-spin" />
//                     </div>
//                   ) : (
//                     customers.map((customer) => (
//                       <CommandItem
//                         key={customer.id}
//                         value={customer.id}
//                         onSelect={() => {
//                           setSelectedCustomer(
//                             customer.id === selectedCustomer ? null : customer.id
//                           );
//                           setCustomerOpen(false);
//                         }}
//                       >
//                         <Check
//                           className={
//                             "mr-2 h-4 w-4 " +
//                             (selectedCustomer === customer.id ? "opacity-100" : "opacity-0")
//                           }
//                         />
//                         {customer.firstName} {customer.lastName}
//                       </CommandItem>
//                     ))
//                   )}
//                 </CommandList>
//               </CommandGroup>
//             </Command>
//           </PopoverContent>
//         </Popover>
//       </div>

//       {/* Service Select */}
//       <div className="grid gap-2">
//         <Label htmlFor="service">Service</Label>
//         <Popover open={serviceOpen} onOpenChange={setServiceOpen}>
//           <PopoverTrigger asChild>
//             <Button
//               variant="outline"
//               role="combobox"
//               aria-expanded={serviceOpen}
//               className="w-full justify-between"
//             >
//               {selectedService
//                 ? services.find((service) => service.id === selectedService)?.name
//                 : "Select service..."}
//               <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className="w-full p-0">
//             <Command>
//               <CommandInput placeholder="Search services..." />
//               <CommandEmpty>No services found.</CommandEmpty>
//               <CommandGroup>
//                 <CommandList>
//                   {isLoading.services ? (
//                     <div className="flex justify-center py-4">
//                       <Loader2 className="h-6 w-6 animate-spin" />
//                     </div>
//                   ) : (
//                     services.map((service) => (
//                       <CommandItem
//                         key={service.id}
//                         value={service.id}
//                         onSelect={() => {
//                           setSelectedService(
//                             service.id === selectedService ? null : service.id
//                           );
//                           setServiceOpen(false);
//                         }}
//                       >
//                         <Check
//                           className={
//                             "mr-2 h-4 w-4 " +
//                             (selectedService === service.id ? "opacity-100" : "opacity-0")
//                           }
//                         />
//                         {service.name}
//                       </CommandItem>
//                     ))
//                   )}
//                 </CommandList>
//               </CommandGroup>
//             </Command>
//           </PopoverContent>
//         </Popover>
//       </div>

//       {/* Staff Select */}
//       <div className="grid gap-2">
//         <Label htmlFor="staff">Staff Member</Label>
//         <Popover open={staffOpen} onOpenChange={setStaffOpen}>
//           <PopoverTrigger asChild>
//             <Button
//               variant="outline"
//               role="combobox"
//               aria-expanded={staffOpen}
//               className="w-full justify-between"
//             >
//               {selectedStaff
//                 ? staff.find((member) => member.id === selectedStaff)?.firstName + ' ' + 
//                   staff.find((member) => member.id === selectedStaff)?.lastName
//                 : "Select staff member..."}
//               <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className="w-full p-0">
//             <Command>
//               <CommandInput placeholder="Search staff..." />
//               <CommandEmpty>No staff members found.</CommandEmpty>
//               <CommandGroup>
//                 <CommandList>
//                   {isLoading.staff ? (
//                     <div className="flex justify-center py-4">
//                       <Loader2 className="h-6 w-6 animate-spin" />
//                     </div>
//                   ) : (
//                     staff.map((member) => (
//                       <CommandItem
//                         key={member.id}
//                         value={member.id}
//                         onSelect={() => {
//                           setSelectedStaff(
//                             member.id === selectedStaff ? null : member.id
//                           );
//                           setStaffOpen(false);
//                         }}
//                       >
//                         <Check
//                           className={
//                             "mr-2 h-4 w-4 " +
//                             (selectedStaff === member.id ? "opacity-100" : "opacity-0")
//                           }
//                         />
//                         {member.firstName} {member.lastName}
//                       </CommandItem>
//                     ))
//                   )}
//                 </CommandList>
//               </CommandGroup>
//             </Command>
//           </PopoverContent>
//         </Popover>
//       </div>



        


//             {/* Display selected service details if needed */}
//             {/* {selectedService && (
//                 <div className="p-4 border rounded-lg">
//                     <h3 className="font-medium">
//                         {services.find((s) => s.id === selectedService)?.name}
//                     </h3>
//                     <p className="text-sm text-muted-foreground">
//                         {services.find((s) => s.id === selectedService)?.description}
//                     </p>
//                     <p className="text-sm font-medium mt-2">
//                         €{services.find((s) => s.id === selectedService)?.price}
//                     </p>
//                 </div>
//             )} */}
//         </div>
//     </>
//   );
// }




// import React, { useState, useEffect } from 'react';
// import { useForm, Controller } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { format, set } from 'date-fns';
// import axios from 'axios';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { toast } from 'sonner';
// import { Loader2, ChevronsUpDown, Check, PlusCircle } from 'lucide-react';
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
// import { Calendar } from "@/components/ui/calendar";

// // Updated schema to include price


// export function AppointmentForm() {
//   interface Service {
//     id: number | string;
//     name: string;
//     description?: string;
//     duration?: string;
//     price?: number;
//     [key: string]: any;
//   }

//   const [services, setServices] = useState<Service[]>([]);
//   const [staff, setStaff] = useState<any[]>([]);
//   const [customers, setCustomers] = useState<any[]>([]);
//   const [serviceOpen, setServiceOpen] = useState(false);
//   const [staffOpen, setStaffOpen] = useState(false);
//   const [customerOpen, setCustomerOpen] = useState(false);
//   const [selectedService, setSelectedService] = useState<Service | null>(null);
//   const [selectedStaff, setSelectedStaff] = useState<any>(null);
//   const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
//   const [selectedDate, setSelectedDate] = useState<Date | any>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoading, setIsLoading] = useState({
//     services: false,
//     staff: false,
//     customers: false
//   });







//   const getServices = async () => {
//     setIsLoading(prev => ({...prev, services: true}));
//     try {
//       const response = await axios.get(`https://kapperking.runasp.net/api/Services/Getservices/1`);
//       setServices(response.data);
//     } catch (error) {
//       console.error("Error fetching services:", error);
//       toast.error("Failed to fetch services.");
//     } finally {
//       setIsLoading(prev => ({...prev, services: false}));
//     }
//   }

//   const getStaff = async () => {
//     setIsLoading(prev => ({...prev, staff: true}));
//     try {
//       const response = await axios.get(`https://kapperking.runasp.net/api/Salons/GetStylists?id=1`);
//       setStaff(response.data);
//     } catch (error) {
//       console.error("Error fetching staff:", error);
//       toast.error("Failed to fetch staff members.");
//     } finally {
//       setIsLoading(prev => ({...prev, staff: false}));
//     }
//   }

//   const getCustomers = async () => {
//     setIsLoading(prev => ({...prev, customers: true}));
//     try {
//       const response = await axios.get(`https://kapperking.runasp.net/api/Salons/GetCustomers?id=1`);
//       setCustomers(response.data);
//     } catch (error) {
//       console.error("Error fetching customers:", error);
//       toast.error("Failed to fetch customers.");
//     } finally {
//       setIsLoading(prev => ({...prev, customers: false}));
//     }
//   }

//   useEffect(() => {
//     getServices();
//     getStaff();
//     getCustomers();
//   }, []);


//   return (
//       <div>

//       </div>
//   );
// }


import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie'; 
type JwtPayload = {
  Id: number; // adjust this to match your token's structure
  email?: string;
  Name?: string;
  // any other fields you expect
};
export function AppointmentForm({onSuccess}: any) {
  const token = Cookies.get('salonUser');
  
  const decoded = token ? jwtDecode<JwtPayload>(token) : undefined;

  if (token) {
    // const decoded = jwtDecode<JwtPayload>(token);
    console.log('User ID:', decoded?.Name);
  }
    interface Service {
    id: number | string;
    name: string;
    description?: string;
    duration: string;
    price: number;
    [key: string]: any;
  }

  interface Staff {
    id: number | string;
    firstName: string;
    lastName: string;
    specialization?: string;
  }

  interface Customer {
    id: number | string;
    firstName: string;
    lastName: string;
    email?: string;
  }

  // State
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Fetch data
  const getServices = useCallback(async () => {
    try {
      const response = await axios.get(`https://kapperking.runasp.net/api/Services/Getservices/${decoded?.Id}`);
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to fetch services.");
    }
  }, []);

  const getStaff = useCallback(async () => {
    try {
      const response = await axios.get(`https://kapperking.runasp.net/api/Salons/GetStylists?id=${decoded?.Id}`);
      setStaff(response.data);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to fetch staff.");
    }
  }, []);

  const getCustomers = useCallback(async () => {
    try {
      const response = await axios.get(`https://kapperking.runasp.net/api/Salons/GetCustomers?id=${decoded?.Id}`);
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to fetch customers.");
    }
  }, []);

  // Create appointment with FormData
  const createAppointment = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        'https://kapperking.runasp.net/api/Appointments/AddAppointment',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success('Appointment created successfully!');
        onSuccess()
        resetForm();
      } else {
        throw new Error('Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
const formatDuration = (duration: string) => {
  const parts = duration.split(':'); // handles "HH:MM" or "HH:MM:SS"
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return `${hours}:${minutes.toString().padStart(2, '0')}`; // e.g., 0:50
};
  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedServices.length === 0 || !selectedStaff  || !appointmentDate || !appointmentTime) {
      toast.error('Please fill all fields');
      return;
    }

    const service = services.find(s => s.id.toString() === selectedServices.toString());
    if (!service) {
      toast.error('Invalid service selected');
      return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append('StartAt', appointmentTime);
    // formData.append('Date', appointmentDate);
    const formattedDate = appointmentDate.replace(/-/g, '/'); // Converts "2025-07-06" to "2025/07/06"
        formData.append('Date', formattedDate);
    formData.append('AppointmentDuration', formatDuration(service.duration));
    formData.append('CustomerId', selectedCustomer.toString());
    // formData.append('CustomerId', '148');
    formData.append('StylistId', selectedStaff.toString());
    formData.append('Price', service.price.toString());
    formData.append('PaymentType', "Cash");
    selectedServices.forEach((serviceId) => {
      formData.append('ServicesIds', serviceId);
    });
  
    formData.append('SalonId', decoded?.Id?.toString());

    await createAppointment(formData);
  };

  // Reset form
  const resetForm = () => {
    setSelectedService('');
    setSelectedStaff('');
    setSelectedCustomer('');
    setAppointmentDate('');
    setAppointmentTime('');
  };

  // Initial data loading
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([getServices(), getStaff(), getCustomers()]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getServices, getStaff, getCustomers]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ minWidth: 120, maxWidth: 400, margin: 'auto', mt: 4 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Create New Appointment
      </Typography>

      {/* Service Selection */}
      <div className="mb-4">
        <Label htmlFor="service">Service *</Label>
        <select
          id="service"
          value={selectedServices}
        onChange={(e) => {
      const options = Array.from(e.target.selectedOptions, option => option.value);
      setSelectedServices(options);
    }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        >
          <option value="">Select a service</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} ({service.duration} min) - €{service.price}
            </option>
          ))}
        </select>
      </div>

      {/* Staff Selection */}
      <div className="mb-4">
        <Label htmlFor="staff">Staff *</Label>
        <select
          id="staff"
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        >
          <option value="">Select a staff member</option>
          {staff.map((member) => (
            <option key={member.id} value={member.id}>
              {member.firstName} {member.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Customer Selection */}
      <div className="mb-4">
        <Label htmlFor="customer">Customer *</Label>
        <select
          id="customer"
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        >
          <option value="">Select a customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.firstName} {customer.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Date Input */}
      <div className="mb-4">
        <Label htmlFor="appointmentDate">Date *</Label>
        <Input
          id="appointmentDate"
          type="date"
          value={appointmentDate}
          onChange={(e) => setAppointmentDate(e.target.value)}
          required
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Time Input */}
      <div className="mb-4">
        <Label htmlFor="appointmentTime">Time *</Label>
        <Input
          id="appointmentTime"
          type="time"
          value={appointmentTime}
          onChange={(e) => setAppointmentTime(e.target.value)}
          required
        />
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating Appointment...' : 'Create Appointment'}
      </Button>
    </Box>
  );
}