// import React, { useEffect, useState, useCallback } from 'react';
// import axios from 'axios';
// import {
//   Box,
//   CircularProgress,
//   Typography,
// } from '@mui/material';
// import { toast } from 'sonner';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { jwtDecode } from 'jwt-decode';
// import Cookies from 'js-cookie'; 
// import { 
//   Select,
//   MenuItem,
//   Chip,
//   FormControl,
//   InputLabel,
//   SelectChangeEvent,
//   OutlinedInput,
//   Theme,
//   useTheme
// } from '@mui/material';
// import { useNavigate, useLocation } from 'react-router-dom';
// type JwtPayload = {
//   Id: number; // adjust this to match your token's structure
//   email?: string;
//   Name?: string;
//   // any other fields you expect
// };
// type CustomerJwt = {
//     Id: number; // adjust this to match your token's structure
//     email?: string;
//     name?: string;
//     FirstName?: string;
//     LastName?: string;
// }

// export function AppointmentCutomerForm({onSuccess}: any) {
// const theme = useTheme();
// const ITEM_HEIGHT = 48;
// const ITEM_PADDING_TOP = 8;
// const MenuProps = {
//   PaperProps: {
//     style: {
//       maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
//       width: 250,
//     },
//   },
// };
// function getStyles(name: string, selectedServices: readonly string[], theme: Theme) {
//   return {
//     fontWeight:
//       selectedServices.indexOf(name) === -1
//         ? theme.typography.fontWeightRegular
//         : theme.typography.fontWeightMedium,
//   };
// }
//         const navigate = useNavigate();
//         const location = useLocation();
//         const parts = location.pathname.split('/');
//         const basePath = `/${parts[1]}/${parts[2]}/`;
//   const token = Cookies.get('salonUser');
//   const cutomerToken = Cookies.get(`customerToken`)
  
//   const decoded = token ?  jwtDecode<JwtPayload>(token) : undefined;

//   const CutomerDecoded = cutomerToken ? jwtDecode<CustomerJwt>(cutomerToken) : undefined;
  


//     interface Service {
//     id: number | string;
//     name: string;
//     description?: string;
//     duration: string;
//     price: number;
//     [key: string]: any;
//   }

//   interface Staff {
//     id: number | string;
//     firstName: string;
//     lastName: string;
//     specialization?: string;
//   }

//   interface Customer {
//     id: number | string;
//     firstName: string;
//     lastName: string;
//     email?: string;
//   }

//   // State
//   const [services, setServices] = useState<Service[]>([]);
//   const [staff, setStaff] = useState<Staff[]>([]);
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [selectedService, setSelectedService] = useState<string>('');
//   const [selectedStaff, setSelectedStaff] = useState<string>('');
//   const [selectedCustomer, setSelectedCustomer] = useState<string>('');
//   const [appointmentDate, setAppointmentDate] = useState<string>('');
//   const [appointmentTime, setAppointmentTime] = useState<string>('');
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [selectedServices, setSelectedServices] = useState<string[]>([]);

//   // Fetch data
//   const getServices = useCallback(async () => {
//     try {
//       const response = await axios.get(`https://kapperking.runasp.net/api/Services/Getservices/${decoded?.Id}`);
//       setServices(response.data);
//     } catch (error) {
//       console.error("Error fetching services:", error);
//       toast.error("Failed to fetch services.");
//     }
//   }, []);

//   const getStaff = useCallback(async () => {
//     try {
//       const response = await axios.get(`https://kapperking.runasp.net/api/Salons/GetStylists?id=${decoded?.Id}`);
//       setStaff(response.data);
//     } catch (error) {
//       console.error("Error fetching staff:", error);
//       toast.error("Failed to fetch staff.");
//     }
//   }, []);

//   const getCustomers = useCallback(async () => {
//     try {
//       const response = await axios.get(`https://kapperking.runasp.net/api/Salons/GetCustomers?id=${decoded?.Id}`);
//       setCustomers(response.data);
//     } catch (error) {
//       console.error("Error fetching customers:", error);
//       toast.error("Failed to fetch customers.");
//     }
//   }, []);

//   // Create appointment with FormData
//   const createAppointment = async (formData: FormData) => {
//     setIsSubmitting(true);
//     try {
//       const response = await axios.post(
//         'https://kapperking.runasp.net/api/Appointments/AddAppointment',
//         formData,
//         {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         }
//       );

//       if (response.status === 200 || response.status === 201) {
//         toast.success('Appointment created successfully!');
//         onSuccess()
//         resetForm();
//       } else {
//         throw new Error('Failed to create appointment');
//       }
//     } catch (error) {
//       console.error('Error creating appointment:', error);
//       toast.error('Failed to create appointment. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
// // const formatDuration = (duration: string) => {
// //   const parts = duration.split(':'); // handles "HH:MM" or "HH:MM:SS"
// //   const hours = parseInt(parts[0], 10);
// //   const minutes = parseInt(parts[1], 10);
// //   return `${hours}:${minutes.toString().padStart(2, '0')}`; // e.g., 0:50
// // };

// const calculateTotalDuration = (serviceIds: string[]) => {
//   let totalMinutes = 0;
//   serviceIds.forEach(id => {
//     const service = services.find(s => s.id.toString() === id);
//     if (service) {
//       const [hours, minutes] = service.duration.split(':').map(Number);
//       totalMinutes += hours * 60 + minutes;
//     }
//   });
//   return `${Math.floor(totalMinutes / 60)}:${(totalMinutes % 60).toString().padStart(2, '0')}`;
// };

// const totalPrice = selectedServices.reduce((sum, serviceId) => {
//   const service = services.find(s => s.id.toString() === serviceId);
//   return sum + (service?.price || 0);
// }, 0);

//   // Form submission handler
// // const handleSubmit = async (e: React.FormEvent) => {
// //   e.preventDefault();

// //   if (selectedServices.length === 0 || !selectedStaff || !appointmentDate || !appointmentTime) {
// //     toast.error('Please fill all fields');
// //     return;
// //   }

// //   // const service = services.find(s => s.id.toString() === selectedServices.toString());
// //   // if (!service) {
// //   //   toast.error('Invalid service selected');
// //   //   return;
// //   // }

// //   // Create FormData
// //   const formData = new FormData();
// //   const formattedDate = appointmentDate.replace(/-/g, '/'); // "2025/07/06"

// //   formData.append('StartAt', appointmentTime);
// //   formData.append('Date', formattedDate);
// //   // formData.append('AppointmentDuration', formatDuration(service.duration));
// //   // formData.append('Price', service.price.toString());
// //   formData.append('AppointmentDuration', calculateTotalDuration(selectedServices));
// // formData.append('Price', totalPrice.toString());
// // selectedServices.forEach((serviceId) => {
// //   formData.append('ServicesIds', serviceId);
// // });
// //   if (CutomerDecoded?.Id !== undefined) {
// //     formData.append('CustomerId', CutomerDecoded.Id.toString());
// //   } else {
// //     toast.error('Customer ID is missing.');
// //     return;
// //   }
// //   formData.append('StylistId', selectedStaff.toString());
// //   formData.append('PaymentType', "Cash");
// //   selectedServices.forEach((serviceId) => {
// //     formData.append('ServicesIds', serviceId);
// //   });
// //   if (decoded?.Id !== undefined) {
// //     formData.append('SalonId', decoded.Id.toString());
// //   } else {
// //     toast.error('Salon ID is missing.');
// //     return;
// //   }

// //   try {
// //     const response = await axios.post(
// //       'https://kapperking.runasp.net/api/Appointments/AddAppointment',
// //       formData,
// //       {
// //         headers: {
// //           'Content-Type': 'multipart/form-data',
// //         },
// //       }
// //     );

// //     if (response.status === 200) {
// //       toast.success('Appointment created successfully!');
// //   setTimeout(() => {
// //         navigate(`${basePath}${decoded?.Id}`);
// //       }, 10000);
// //         } else {
// //       toast.error(`Failed to create appointment: ${response}`);
// //     }
// //   } catch (error: any) {
// //     const errorMessage = error?.response?.data;
// //     toast.error(` ${errorMessage}`);
// //   }
// // };

// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   if (selectedServices.length === 0 || !selectedStaff || !appointmentDate || !appointmentTime) {
//     toast.error('Please fill all required fields');
//     return;
//   }

//   // Calculate total duration and price
//   const { totalDuration, totalPrice } = selectedServices.reduce((acc, serviceId) => {
//     const service = services.find(s => s.id.toString() === serviceId);
//     if (service) {
//       const [hours, minutes] = service.duration.split(':').map(Number);
//       acc.totalDuration += hours * 60 + minutes;
//       acc.totalPrice += service.price;
//     }
//     return acc;
//   }, { totalDuration: 0, totalPrice: 0 });

//   const formattedDuration = `${Math.floor(totalDuration / 60)}:${(totalDuration % 60).toString().padStart(2, '0')}`;
//   const formattedDate = appointmentDate.replace(/-/g, '/');

//   // Create FormData with array of service IDs
//   const formData = new FormData();
//   formData.append('StartAt', appointmentTime);
//   formData.append('Date', formattedDate);
//   formData.append('AppointmentDuration', formattedDuration);
//   formData.append('CustomerId', CutomerDecoded?.Id.toString() || '');
//   formData.append('StylistId', selectedStaff);
//   formData.append('Price', totalPrice.toString());
//   formData.append('PaymentType', "Cash");
//   formData.append('SalonId', decoded?.Id.toString() || '');
  
//   // Append all service IDs as a single array
//   selectedServices.forEach(serviceId => {
//     formData.append('ServicesIds', serviceId);
//   });

//   try {
//     const response = await axios.post(
//       'https://kapperking.runasp.net/api/Appointments/AddAppointment',
//       formData,
//       {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       }
//     );

//     if (response.status === 200) {
//       toast.success('Appointment created successfully!');
//       setTimeout(() => {
//         navigate(`${basePath}${decoded?.Id}`);
//       }, 2000);
//     } else {
//       toast.error(`Failed to create appointment: ${response.statusText}`);
//     }
//   } catch (error: any) {
//     const errorMessage = error?.response?.data || 'Unknown error occurred';
//     toast.error(`Error: ${errorMessage}`);
//   }
// };
//   // Reset form
//   const resetForm = () => {
//     setSelectedService('');
//     setSelectedStaff('');
//     setSelectedCustomer('');
//     setAppointmentDate('');
//     setAppointmentTime('');
//   };

//   // Initial data loading
//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       try {
//         await Promise.all([getServices(), getStaff(), getCustomers()]);
//       } catch (error) {
//         console.error("Error loading initial data:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [getServices, getStaff, getCustomers]);

//   if (isLoading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box component="form" onSubmit={handleSubmit} sx={{ minWidth: 120, maxWidth: 400, margin: 'auto', mt: 4 }}>
//       <Typography variant="h6" component="h2" gutterBottom>
//         Create New Appointment
//       </Typography>

//       {/* Service Selection */}
//       {/* <div className="mb-4">
//         <Label htmlFor="service">Service *</Label>
//         <select
//           id="service"
//           value={selectedServices}
//         onChange={(e) => {
//       const options = Array.from(e.target.selectedOptions, option => option.value);
//       setSelectedServices(options);
//     }}
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//           required
//         >
//           <option value="">Select a service</option>
//           {services.map((service) => (
//             <option key={service.id} value={service.id}>
//               {service.name} ({service.duration} min) - €{service.price}
//             </option>
//           ))}
//         </select>
//       </div> */}
// {/* Service Selection - Updated for multiple selection */}
// <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
//   <InputLabel id="multiple-service-label">Services *</InputLabel>
//   <Select<string[]>
//     labelId="multiple-service-label"
//     id="multiple-service"
//     multiple
//     value={selectedServices}
//     onChange={(event: SelectChangeEvent<string[]>) => {
//       const { value } = event.target;
//       setSelectedServices(
//         // On autofill we get a stringified value.
//         typeof value === 'string' ? value.split(',') : value,
//       );
//     }}
//     input={<OutlinedInput label="Services *" />}
//     renderValue={(selected) => (
//       <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//         {selected.map((value) => {
//           const service = services.find(s => s.id.toString() === value);
//           return service ? (
//             <Chip 
//               key={value} 
//               label={`${service.name} (€${service.price})`} 
//               onDelete={() => {
//                 setSelectedServices(selectedServices.filter(id => id !== value));
//               }}
//               onMouseDown={(event) => {
//                 event.stopPropagation();
//               }}
//             />
//           ) : null;
//         })}
//       </Box>
//     )}
//     MenuProps={MenuProps}
//   >
//     {services.map((service) => (
//       <MenuItem
//         key={service.id}
//         value={service.id.toString()}
//         style={getStyles(service.id.toString(), selectedServices, theme)}
//       >
//         {service.name} ({service.duration} min) - €{service.price}
//       </MenuItem>
//     ))}
//   </Select>
// </FormControl>
//       {/* Staff Selection */}
//       <div className="mb-4">
//         <Label htmlFor="staff">Staff *</Label>
//         <select
//           id="staff"
//           value={selectedStaff}
//           onChange={(e) => setSelectedStaff(e.target.value)}
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//           required
//         >
//           <option value="">Select a staff member</option>
//           {staff.map((member) => (
//             <option key={member.id} value={member.id}>
//               {member.firstName} {member.lastName}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Customer Selection */}
//       {/* <div className="mb-4">
//         <Label htmlFor="customer">Customer *</Label>
//         <select
//           id="customer"
//           value={selectedCustomer}
//           onChange={(e) => setSelectedCustomer(e.target.value)}
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//           required
//         >
//           <option value="">Select a customer</option>
//           {customers.map((customer) => (
//             <option key={customer.id} value={customer.id}>
//               {customer.firstName} {customer.lastName}
//             </option>
//           ))}
//         </select>
//       </div> */}

//       {/* Date Input */}
//       <div className="mb-4">
//         <Label htmlFor="appointmentDate">Date *</Label>
//         <Input
//           id="appointmentDate"
//           type="date"
//           value={appointmentDate}
//           onChange={(e) => setAppointmentDate(e.target.value)}
//           required
//           min={new Date().toISOString().split('T')[0]}
//         />
//       </div>

//       {/* Time Input */}
//       <div className="mb-4">
//         <Label htmlFor="appointmentTime">Time *</Label>
//         <Input
//           id="appointmentTime"
//           type="time"
//           value={appointmentTime}
//           onChange={(e) => setAppointmentTime(e.target.value)}
//           required
//         />
//       </div>

//       {/* Submit Button */}
//       <Button type="submit" className="w-full" disabled={isSubmitting}>
//         {isSubmitting ? 'Creating Appointment...' : 'Create Appointment'}
//       </Button>
//     </Box>
//   );
// }

// import React, { useEffect, useState, useCallback } from 'react';
// import axios from 'axios';
// import {
//   Box,
//   CircularProgress,
//   Typography,
//   Chip,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   OutlinedInput,
//   Theme,
//   useTheme,
// } from '@mui/material';
// import { toast } from 'sonner';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { jwtDecode } from 'jwt-decode';
// import Cookies from 'js-cookie';
// import { useNavigate, useLocation } from 'react-router-dom';

// type JwtPayload = {
//   Id: number;
//   email?: string;
//   Name?: string;
// };

// type CustomerJwt = {
//   Id: number;
//   email?: string;
//   name?: string;
//   FirstName?: string;
//   LastName?: string;
// };

// export function AppointmentCutomerForm({ onSuccess }: { onSuccess: () => void }) {
//   const theme = useTheme();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const parts = location.pathname.split('/');
//   const basePath = `/${parts[1]}/${parts[2]}/`;

//   const token = Cookies.get('salonUser');
//   const customerToken = Cookies.get('customerToken');

//   const decoded = token ? jwtDecode<JwtPayload>(token) : undefined;
//   const customerDecoded = customerToken ? jwtDecode<CustomerJwt>(customerToken) : undefined;

//   interface Service {
//     id: number | string;
//     name: string;
//     description?: string;
//     duration: string;
//     price: number;
//   }

//   interface Staff {
//     id: number | string;
//     firstName: string;
//     lastName: string;
//   }

//   // State
//   const [services, setServices] = useState<Service[]>([]);
//   const [staff, setStaff] = useState<Staff[]>([]);
//   const [selectedStaff, setSelectedStaff] = useState<string>('');
//   const [appointmentDate, setAppointmentDate] = useState<string>('');
//   const [appointmentTime, setAppointmentTime] = useState<string>('');
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//   const [selectedServices, setSelectedServices] = useState<string[]>([]);
//   const [bookedTimes, setBookedTimes] = useState<string[]>([]);

//   const ITEM_HEIGHT = 48;
//   const ITEM_PADDING_TOP = 8;
//   const MenuProps = {
//     PaperProps: {
//       style: {
//         maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
//         width: 250,
//       },
//     },
//   };

//   function getStyles(name: string, selectedServices: readonly string[], theme: Theme) {
//     return {
//       fontWeight:
//         selectedServices.indexOf(name) === -1
//           ? theme.typography.fontWeightRegular
//           : theme.typography.fontWeightMedium,
//     };
//   }

//   // --- API Calls ---
//   const getServices = useCallback(async () => {
//     try {
//       const response = await axios.get(
//         `https://kapperking.runasp.net/api/Services/Getservices/${decoded?.Id}`
//       );
//       setServices(response.data);
//     } catch (error) {
//       console.error('Error fetching services:', error);
//       toast.error('Failed to fetch services.');
//     }
//   }, [decoded?.Id]);

//   const getStaff = useCallback(async () => {
//     try {
//       const response = await axios.get(
//         `https://kapperking.runasp.net/api/Salons/GetStylists?id=${decoded?.Id}`
//       );
//       setStaff(response.data);
//     } catch (error) {
//       console.error('Error fetching staff:', error);
//       toast.error('Failed to fetch staff.');
//     }
//   }, [decoded?.Id]);

//   // --- Fetch booked times ---
//   const fetchBookedTimes = async (stylistId: string, date: string) => {
//     if (!date) return;

//     try {
//       const selectedDate = new Date(date);
//       const year = selectedDate.getFullYear();
//       const month = selectedDate.getMonth() + 1;
//       const day = selectedDate.getDate();
//       const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

//       const response = await axios.get(
//         `https://kapperking.runasp.net/api/Appointments/GetStylistAppointments/${stylistId}?year=${year}&month=${month}&day=${day}&dayOfWeek=${dayOfWeek}`
//       );

//       if (response.status === 200) {
//         const times = response.data.map((appt: any) => appt.time);
//         setBookedTimes(times);
//       }
//     } catch (error) {
//       console.error('Error fetching booked times:', error);
//       toast.error('Failed to fetch booked times');
//     }
//   };

//   // --- Form Submit ---
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (selectedServices.length === 0 || !selectedStaff || !appointmentDate || !appointmentTime) {
//       toast.error('Please fill all required fields');
//       return;
//     }

//     if (bookedTimes.includes(appointmentTime)) {
//       toast.error('This time is already booked. Please choose another.');
//       return;
//     }

//     const { totalDuration, totalPrice } = selectedServices.reduce(
//       (acc, serviceId) => {
//         const service = services.find((s) => s.id.toString() === serviceId);
//         if (service) {
//           const [hours, minutes] = service.duration.split(':').map(Number);
//           acc.totalDuration += hours * 60 + minutes;
//           acc.totalPrice += service.price;
//         }
//         return acc;
//       },
//       { totalDuration: 0, totalPrice: 0 }
//     );

//     const formattedDuration = `${Math.floor(totalDuration / 60)}:${(
//       totalDuration % 60
//     ).toString().padStart(2, '0')}`;
//     const formattedDate = appointmentDate.replace(/-/g, '/');

//     const formData = new FormData();
//     formData.append('StartAt', appointmentTime);
//     formData.append('Date', formattedDate);
//     formData.append('AppointmentDuration', formattedDuration);
//     formData.append('CustomerId', customerDecoded?.Id.toString() || '');
//     formData.append('StylistId', selectedStaff);
//     formData.append('Price', totalPrice.toString());
//     formData.append('PaymentType', 'Cash');
//     formData.append('SalonId', decoded?.Id.toString() || '');
//     selectedServices.forEach((serviceId) => {
//       formData.append('ServicesIds', serviceId);
//     });

//     try {
//       setIsSubmitting(true);
//       const response = await axios.post(
//         'https://kapperking.runasp.net/api/Appointments/AddAppointment',
//         formData,
//         { headers: { 'Content-Type': 'multipart/form-data' } }
//       );

//       if (response.status === 200) {
//         toast.success('Appointment created successfully!');
//         onSuccess();
//         navigate(`${basePath}${decoded?.Id}`);
//       } else {
//         toast.error(`Failed to create appointment: ${response.statusText}`);
//       }
//     } catch (error: any) {
//       const errorMessage = error?.response?.data || 'Unknown error occurred';
//       toast.error(`Error: ${errorMessage}`);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // --- Load initial data ---
//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       try {
//         await Promise.all([getServices(), getStaff()]);
//       } catch (error) {
//         console.error('Error loading initial data:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [getServices, getStaff]);

//   if (isLoading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box
//       component="form"
//       onSubmit={handleSubmit}
//       sx={{ minWidth: 120, maxWidth: 400, margin: 'auto', mt: 4 }}
//     >
//       <Typography variant="h6" component="h2" gutterBottom>
//         Create New Appointment
//       </Typography>

//       {/* Services */}
//       <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
//         <InputLabel id="multiple-service-label">Services *</InputLabel>
//         <Select<string[]>
//           labelId="multiple-service-label"
//           id="multiple-service"
//           multiple
//           value={selectedServices}
//           onChange={(event) => {
//             const { value } = event.target;
//             setSelectedServices(typeof value === 'string' ? value.split(',') : value);
//           }}
//           input={<OutlinedInput label="Services *" />}
//           renderValue={(selected) => (
//             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
//               {selected.map((value) => {
//                 const service = services.find((s) => s.id.toString() === value);
//                 return service ? (
//                   <Chip
//                     key={value}
//                     label={`${service.name} (€${service.price})`}
//                     onDelete={() =>
//                       setSelectedServices(selectedServices.filter((id) => id !== value))
//                     }
//                     onMouseDown={(event) => event.stopPropagation()}
//                   />
//                 ) : null;
//               })}
//             </Box>
//           )}
//           MenuProps={MenuProps}
//         >
//           {services.map((service) => (
//             <MenuItem
//               key={service.id}
//               value={service.id.toString()}
//               style={getStyles(service.id.toString(), selectedServices, theme)}
//             >
//               {service.name} ({service.duration} min) - €{service.price}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>

//       {/* Staff */}
//       <div className="mb-4">
//         <Label htmlFor="staff">Staff *</Label>
//         <select
//           id="staff"
//           value={selectedStaff}
//           onChange={(e) => {
//             setSelectedStaff(e.target.value);
//             if (appointmentDate) {
//               fetchBookedTimes(e.target.value, appointmentDate);
//             }
//           }}
//           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//           required
//         >
//           <option value="">Select a staff member</option>
//           {staff.map((member) => (
//             <option key={member.id} value={member.id}>
//               {member.firstName} {member.lastName}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Date */}
//       <div className="mb-4">
//         <Label htmlFor="appointmentDate">Date *</Label>
//         <Input
//           id="appointmentDate"
//           type="date"
//           value={appointmentDate}
//           onChange={(e) => {
//             setAppointmentDate(e.target.value);
//             if (selectedStaff) {
//               fetchBookedTimes(selectedStaff, e.target.value);
//             }
//           }}
//           required
//           min={new Date().toISOString().split('T')[0]}
//         />
//       </div>

//       {/* Time */}
//       <div className="mb-4">
//         <Label htmlFor="appointmentTime">Time *</Label>
//         <Input
//           id="appointmentTime"
//           type="time"
//           value={appointmentTime}
//           onChange={(e) => setAppointmentTime(e.target.value)}
//           required
//         />

//         {bookedTimes.length > 0 && (
//           <Box sx={{ mt: 2 }}>
//             <Typography variant="subtitle2">Booked Times:</Typography>
//             <ul className="list-disc pl-5">
//               {bookedTimes.map((t, idx) => (
//                 <div className='flex items-center gap-5'>
//                     <div className=''>
//                       <p>From : {t}</p>
//                     </div>
//                     <div className=''>
//                       <p>to : {t + 1}</p>
//                     </div>

//                 </div>
//               ))}
//             </ul>
//           </Box>
//         )}
//       </div>

//       {/* Submit */}
//       <Button type="submit" className="w-full" disabled={isSubmitting}>
//         {isSubmitting ? 'Creating Appointment...' : 'Create Appointment'}
//       </Button>
//     </Box>
//   );
// }


import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Box,
  CircularProgress,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Theme,
  useTheme,
} from '@mui/material';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { useNavigate, useLocation } from 'react-router-dom';

type JwtPayload = {
  Id: number;
  email?: string;
  Name?: string;
};

type CustomerJwt = {
  Id: number;
  email?: string;
  name?: string;
  FirstName?: string;
  LastName?: string;
};

export function AppointmentCutomerForm({ onSuccess }: { onSuccess: () => void }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const parts = location.pathname.split('/');
  const basePath = `/${parts[1]}/${parts[2]}/`;

  const token = Cookies.get('salonUser');
  const customerToken = Cookies.get('customerToken');

  const decoded = token ? jwtDecode<JwtPayload>(token) : undefined;
  const customerDecoded = customerToken ? jwtDecode<CustomerJwt>(customerToken) : undefined;

  interface Service {
    id: number | string;
    name: string;
    description?: string;
    /** stored as "HH:mm" (e.g., "01:30") */
    duration: string;
    price: number;
  }

  interface Staff {
    id: number | string;
    firstName: string;
    lastName: string;
  }

  // State
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  function getStyles(name: string, selectedServices: readonly string[], theme: Theme) {
    return {
      fontWeight:
        selectedServices.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }

  // -------- helpers for time/duration ----------
  const durationStringToMinutes = (dur: string | undefined) => {
    if (!dur) return 0;
    if (dur.includes(':')) {
      const [h, m] = dur.split(':').map((n) => parseInt(n, 10) || 0);
      return h * 60 + m;
    }
    const n = parseInt(dur, 10);
    return Number.isFinite(n) ? n : 0;
  };

  const minutesToHuman = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
    };

  const parseTimeToDate = (t: string) => {
    // supports "HH:mm" or "HH:mm:ss"
    const [h, m, s] = t.split(':').map((n) => parseInt(n, 10) || 0);
    const d = new Date();
    d.setHours(h, m ?? 0, s ?? 0, 0);
    return d;
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // total duration of currently selected services (minutes)
  const totalSelectedMinutes = useMemo(
    () =>
      selectedServices.reduce((sum, id) => {
        const svc = services.find((s) => s.id.toString() === id);
        return sum + durationStringToMinutes(svc?.duration);
      }, 0),
    [selectedServices, services]
  );

  // --- API Calls ---
  const getServices = useCallback(async () => {
    try {
      const response = await axios.get(
        `https://kapperking.runasp.net/api/Services/Getservices/${decoded?.Id}`
      );
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to fetch services.');
    }
  }, [decoded?.Id]);

  const getStaff = useCallback(async () => {
    try {
      const response = await axios.get(
        `https://kapperking.runasp.net/api/Salons/GetStylists?id=${decoded?.Id}`
      );
      setStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to fetch staff.');
    }
  }, [decoded?.Id]);

  // --- Fetch booked times ---
  const fetchBookedTimes = async (stylistId: string, date: string) => {
    if (!date || !stylistId) return;

    try {
      const selectedDate = new Date(date);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;
      const day = selectedDate.getDate();
      const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

      const response = await axios.get(
        `https://kapperking.runasp.net/api/Appointments/GetStylistAppointments/${stylistId}?year=${year}&month=${month}&day=${day}&dayOfWeek=${dayOfWeek}`
      );

      if (response.status === 200) {
        const times = response.data.map((appt: any) => appt.time as string);
        setBookedTimes(times);
      }
    } catch (error) {
      console.error('Error fetching booked times:', error);
      toast.error('Failed to fetch booked times');
    }
  };

  // --- Form Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedServices.length === 0 || !selectedStaff || !appointmentDate || !appointmentTime) {
      toast.error('Please fill all required fields');
      return;
    }

    if (bookedTimes.includes(appointmentTime)) {
      toast.error('This time is already booked. Please choose another.');
      return;
    }

    const { totalDuration, totalPrice } = selectedServices.reduce(
      (acc, serviceId) => {
        const service = services.find((s) => s.id.toString() === serviceId);
        if (service) {
          const mins = durationStringToMinutes(service.duration);
          acc.totalDuration += mins;
          acc.totalPrice += service.price;
        }
        return acc;
      },
      { totalDuration: 0, totalPrice: 0 }
    );

    const formattedDuration = `${Math.floor(totalDuration / 60)}:${(totalDuration % 60)
      .toString()
      .padStart(2, '0')}`;
    const formattedDate = appointmentDate.replace(/-/g, '/');

    const formData = new FormData();
    formData.append('StartAt', appointmentTime);
    formData.append('Date', formattedDate);
    formData.append('AppointmentDuration', formattedDuration);
    formData.append('CustomerId', customerDecoded?.Id.toString() || '');
    formData.append('StylistId', selectedStaff);
    formData.append('Price', totalPrice.toString());
    formData.append('PaymentType', 'Cash');
    formData.append('SalonId', decoded?.Id.toString() || '');
    selectedServices.forEach((serviceId) => {
      formData.append('ServicesIds', serviceId);
    });

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        'https://kapperking.runasp.net/api/Appointments/AddAppointment',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.status === 200) {
        toast.success('Appointment created successfully!');
        onSuccess();
        navigate(`${basePath}${decoded?.Id}`);
      } else {
        toast.error(`Failed to create appointment: ${response.statusText}`);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error occurred';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Load initial data ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([getServices(), getStaff()]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getServices, getStaff]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ minWidth: 120, maxWidth: 400, margin: 'auto', mt: 4 }}
    >
      <Typography variant="h6" component="h2" gutterBottom>
        Create New Appointment
      </Typography>

      {/* Services */}
      <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
        <InputLabel id="multiple-service-label">Services *</InputLabel>
        <Select<string[]>
          labelId="multiple-service-label"
          id="multiple-service"
          multiple
          value={selectedServices}
          onChange={(event) => {
            const { value } = event.target as unknown as { value: string | string[] };
            setSelectedServices(typeof value === 'string' ? value.split(',') : value);
          }}
          input={<OutlinedInput label="Services *" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => {
                const service = services.find((s) => s.id.toString() === value);
                return service ? (
                  <Chip
                    key={value}
                    label={`${service.name} (${minutesToHuman(
                      durationStringToMinutes(service.duration)
                    )}) • €${service.price}`}
                    onDelete={() =>
                      setSelectedServices(selectedServices.filter((id) => id !== value))
                    }
                    onMouseDown={(event) => event.stopPropagation()}
                  />
                ) : null;
              })}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {services.map((service) => (
            <MenuItem
              key={service.id}
              value={service.id.toString()}
              style={getStyles(service.id.toString(), selectedServices, theme)}
            >
              {service.name} ({minutesToHuman(durationStringToMinutes(service.duration))}) - €{service.price}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Staff */}
      <div className="mb-4">
        <Label htmlFor="staff">Staff *</Label>
        <select
          id="staff"
          value={selectedStaff}
          onChange={(e) => {
            setSelectedStaff(e.target.value);
            if (appointmentDate) {
              fetchBookedTimes(e.target.value, appointmentDate);
            }
          }}
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

      {/* Date */}
      <div className="mb-4">
        <Label htmlFor="appointmentDate">Date *</Label>
        <Input
          id="appointmentDate"
          type="date"
          value={appointmentDate}
          onChange={(e) => {
            setAppointmentDate(e.target.value);
            if (selectedStaff) {
              fetchBookedTimes(selectedStaff, e.target.value);
            }
          }}
          required
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Time */}
      <div className="mb-4">
        <Label htmlFor="appointmentTime">Time *</Label>
        <Input
          id="appointmentTime"
          type="time"
          value={appointmentTime}
          onChange={(e) => setAppointmentTime(e.target.value)}
          required
        />

        {bookedTimes.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" className="mb-2">
              Booked Times:
            </Typography>
            <div className="grid gap-2">
              {bookedTimes.map((t, idx) => {
                const start = parseTimeToDate(t);
                const end =
                  totalSelectedMinutes > 0
                    ? new Date(start.getTime() + totalSelectedMinutes * 60 * 1000)
                    : null;

                return (
                  <div
                    key={`${t}-${idx}`}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                  >
                    <div>
                      <p className="text-xs text-gray-500">From</p>
                      <p className="text-sm font-medium">{formatTime(start)}</p>
                    </div>

                    <div className="text-gray-400">→</div>

                    <div>
                      <p className="text-xs text-gray-500">To</p>
                      <p className="text-sm font-medium">
                        {end ? formatTime(end) : <span className="text-gray-400">Select services</span>}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm font-medium">
                        {totalSelectedMinutes > 0 ? minutesToHuman(totalSelectedMinutes) : '—'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Box>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating Appointment...' : 'Create Appointment'}
      </Button>
    </Box>
  );
}
