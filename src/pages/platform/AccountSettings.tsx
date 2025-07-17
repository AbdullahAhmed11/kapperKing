// import React, { useState } from 'react';
// import { useAuth } from '@/lib/auth';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { User, Mail, Lock, Image as ImageIcon, Users, Save, Loader2 } from 'lucide-react';
// import { toast } from 'sonner';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogClose,
// } from "@/components/ui/dialog";
// import { jwtDecode } from 'jwt-decode';
// import Cookies from 'js-cookie'; 

// // --- Zod Schema for Profile & Password ---
// const accountSettingsSchema = z.object({
//   displayName: z.string().min(1, "Display name cannot be empty."),
//   currentPassword: z.string().optional(),
//   newPassword: z.string().optional(),
//   confirmPassword: z.string().optional(),
// }).refine(data => {
//   if (data.newPassword && data.newPassword !== data.confirmPassword) {
//     return false;
//   }
//   if (data.newPassword && !data.currentPassword) {
//     return false;
//   }
//   return true;
// }, {
//   message: "New passwords must match, and current password is required to change.",
//   path: ["confirmPassword"],
// });

// type AccountSettingsFormData = z.infer<typeof accountSettingsSchema>;

// // --- Zod Schema for Email Change Dialog ---
// const changeEmailSchema = z.object({
//   newEmail: z.string().email("Invalid email address."),
//   currentPasswordForEmail: z.string().min(1, "Current password is required."),
// });
// type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;

// // --- Zod Schema for Add Admin Dialog ---
// const addAdminSchema = z.object({
//   adminEmail: z.string().email("Invalid email address."),
// });
// type AddAdminFormData = z.infer<typeof addAdminSchema>;

// type JwtPayload = {
//   Id: number; // adjust this to match your token's structure
//   email?: string;
//   name?: string;
//   // any other fields you expect
// };
// export default function AccountSettings() {

//     const token = Cookies.get('salonUser');
    
//     const decoded = token ? jwtDecode<JwtPayload>(token) : undefined;


//   const { user } = useAuth();
//   const [isChangeEmailDialogOpen, setIsChangeEmailDialogOpen] = useState(false);
//   const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);
//   const [isSubmittingEmailChange, setIsSubmittingEmailChange] = useState(false);
//   const [isSubmittingAdminInvite, setIsSubmittingAdminInvite] = useState(false);
//   const [isChangingPassword, setIsChangingPassword] = useState(false);
// const [selectedImage, setSelectedImage] = useState<File | null>(null);
// const [imagePreview, setImagePreview] = useState<string | null>(null);
//   // --- Main Form Hook ---

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   if (e.target.files && e.target.files[0]) {
//     const file = e.target.files[0];
//     setSelectedImage(file);
//     setImagePreview(URL.createObjectURL(file));
//   }
// };

// // Update the profile submit handler
// const onProfileSubmit = async (data: AccountSettingsFormData) => {
//   try {
//     const formData = new FormData();
    
//     // Add all fields to FormData
//     formData.append('Id', decoded?.Id !== undefined ? String(decoded.Id) : '');
//     formData.append('FirstName', data.firstName);
//     formData.append('LastName', data.lastName);
//     formData.append('Email', data.email);
//     formData.append('Phone', data.phone);
    
//     if (selectedImage) {
//       formData.append('Image', selectedImage);
//     }

//     const response = await fetch('https://kapperking.runasp.net/api/Users/EditAdmin', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//       },
//       body: formData,
//     });

//     if (!response.ok) {
//       throw new Error('Failed to update profile');
//     }

//     toast.success("Profile updated successfully!");
//     // You might want to refresh the token or user data here
//   } catch (error) {
//     toast.error(error instanceof Error ? error.message : "Failed to update profile");
//   }
// };


//   const { 
//     register, 
//     handleSubmit: handleProfileSubmit, 
//     formState: { errors: profileErrors, isDirty: isProfileDirty, isSubmitting: isProfileSubmitting }, 
//     reset: resetProfileForm,
//     watch,
//     setValue
//   } = useForm<AccountSettingsFormData>({
//     resolver: zodResolver(accountSettingsSchema),
// defaultValues: {
//     firstName: decoded?.FirstName || '',
//     lastName: decoded?.LastName || '',
//     email: decoded?.Email || '',
//     phone: decoded?.Phone || '',
//     displayName: `${decoded?.FirstName} ${decoded?.LastName}`.trim(),
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: '',
//   }
//   });

//   // Watch password fields
//   const currentPassword = watch('currentPassword');
//   const newPassword = watch('newPassword');
//   const confirmPassword = watch('confirmPassword');

//   // --- Change Email Form Hook ---
//   const { register: registerEmail, handleSubmit: handleEmailDialogSubmit, formState: { errors: emailErrors }, reset: resetEmailForm } = useForm<ChangeEmailFormData>({
//     resolver: zodResolver(changeEmailSchema),
//     defaultValues: { newEmail: user?.email || '', currentPasswordForEmail: '' }
//   });

//   // --- Add Admin Form Hook ---
//   const { register: registerAdmin, handleSubmit: handleAdminDialogSubmit, formState: { errors: adminErrors }, reset: resetAdminForm } = useForm<AddAdminFormData>({
//     resolver: zodResolver(addAdminSchema),
//     defaultValues: { adminEmail: '' }
//   });

//   // Placeholder function for getting initials
//   const getInitials = (email?: string) => {
//     if (!email) return 'A';
//     const parts = email.split('@')[0].split(/[._-]/);
//     return parts.map(part => part[0]).join('').toUpperCase().slice(0, 2);
//   };

//   // --- Submit Handler for Password Change ---
//   const onChangePasswordSubmit = async () => {
//     if (!newPassword || !currentPassword) {
//       toast.error("Both current and new password are required");
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       toast.error("New passwords do not match");
//       return;
//     }

//     setIsChangingPassword(true);
    
//     try {
//       const response = await fetch('https://kapperking.runasp.net/api/Users/ChangePassword', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           // 'Authorization': `Bearer ${user?.access_token}`
//         },
//         body: JSON.stringify({
//           currentPassword: currentPassword,
//           newPassword: newPassword,
//           id:8,
//         })
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Password change failed");
//       }

//       toast.success("Password changed successfully!");
//       // Reset password fields
//       setValue('currentPassword', '');
//       setValue('newPassword', '');
//       setValue('confirmPassword', '');
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : "Failed to change password";
//       toast.error(errorMessage);
//     } finally {
//       setIsChangingPassword(false);
//     }
//   };

//   // --- Submit Handler for Main Profile Form ---
//   // const onProfileSubmit = async (data: AccountSettingsFormData) => {
//   //   console.log("Profile Form Data:", data);
//   //   // Simulate async operation
//   //   await new Promise(resolve => setTimeout(resolve, 1000));
//   //   toast.success("Profile display name saved (simulation).");
//   //   resetProfileForm(data, { keepValues: true });
//   // };

//   // --- Submit Handler for Change Email Dialog ---
//   const onChangeEmailSubmit = async (data: ChangeEmailFormData) => {
//     setIsSubmittingEmailChange(true);
//     console.log("Change Email Dialog Data:", data);
//     await new Promise(resolve => setTimeout(resolve, 1500));
//     if (!data.currentPasswordForEmail) {
//       toast.error("Current password is required to request email change.");
//       setIsSubmittingEmailChange(false);
//       return;
//     }
//     toast.info(`Simulation: Requesting email change to ${data.newEmail}.`);
//     setIsSubmittingEmailChange(false);
//     setIsChangeEmailDialogOpen(false);
//     resetEmailForm();
//   };

//   // --- Submit Handler for Add Admin Dialog ---
//   const onAddAdminSubmit = async (data: AddAdminFormData) => {
//     setIsSubmittingAdminInvite(true);
//     console.log("Add Admin Dialog Data:", data);
//     await new Promise(resolve => setTimeout(resolve, 1500));
//     toast.info(`Simulation: Sending invitation to ${data.adminEmail}.`);
//     setIsSubmittingAdminInvite(false);
//     setIsAddAdminDialogOpen(false);
//     resetAdminForm();
//   };

//   const handleChangeEmailClick = () => {
//     resetEmailForm({ newEmail: user?.email || '', currentPasswordForEmail: '' });
//     setIsChangeEmailDialogOpen(true);
//   };

//   const handleAddAdminClick = () => {
//     resetAdminForm();
//     setIsAddAdminDialogOpen(true);
//   };

//   return (
//     <div className="space-y-8 max-w-4xl mx-auto">
//       {/* Header */}
//       <div className="pb-4 border-b">
//         <h1 className="text-2xl font-semibold text-gray-900">Account Settings</h1>
//         <p className="mt-1 text-sm text-gray-500">
//           Manage your administrator profile and security settings.
//         </p>
//       </div>

//       {/* --- Main Form --- */}
//       <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-8">
//         {/* Profile Section */}
//         {/* <div className="bg-white shadow rounded-lg p-6 border">
//           <div className="flex items-center mb-6">
//             <User className="h-5 w-5 text-gray-500 mr-3" />
//             <h3 className="text-lg font-medium text-gray-900">Profile</h3>
//           </div>
//           <div className="space-y-6">
//             <div className="flex items-center space-x-4">
//               <Avatar className="h-16 w-16">
//                 <AvatarImage src={user?.user_metadata?.avatar_url || undefined} alt={user ? user.email : 'User'} />
//                 <AvatarFallback className="text-xl">{user ? getInitials(user.email) : '?'}</AvatarFallback>
//               </Avatar>
//               <div>
//                 <Label htmlFor="avatarFile" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
//                   <ImageIcon className="h-4 w-4 mr-2" />
//                   Change Avatar
//                 </Label>
//                 <input id="avatarFile" type="file" className="sr-only" accept="image/*" />
//                 <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 2MB.</p>
//               </div>
//             </div>
//             <div>
//               <Label htmlFor="displayName">Display Name</Label>
//               <Input
//                 id="displayName"
//                 placeholder="Your Name"
//                 defaultValue={user?.user_metadata?.full_name || ''}
//                 {...register("displayName")}
//                 className="mt-1 h-10"
//               />
//               {profileErrors.displayName && <p className="mt-1 text-sm text-red-500">{profileErrors.displayName.message}</p>}
//             </div>
//             <div className="space-y-2">
//               <Label>Email Address</Label>
//               <div className="flex items-center space-x-2">
//                 <Input
//                   id="email-display"
//                   type="email"
//                   value={user?.email || ''}
//                   className="mt-1 h-10 flex-grow bg-gray-100"
//                   readOnly
//                 />
//                 <Button type="button" variant="outline" size="sm" onClick={handleChangeEmailClick}>
//                   Change Email
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div> */}

// <div className="bg-white shadow rounded-lg p-6 border">
//   <div className="flex items-center mb-6">
//     <User className="h-5 w-5 text-gray-500 mr-3" />
//     <h3 className="text-lg font-medium text-gray-900">Profile</h3>
//   </div>
//   <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
//     <div className="flex items-center space-x-4">
//       <Avatar className="h-16 w-16">
//         <AvatarImage src={imagePreview || decoded?.Image || undefined} 
//                    alt={`${decoded?.FirstName} ${decoded?.LastName}`} />
//         <AvatarFallback className="text-xl">
//           {decoded ? `${decoded.FirstName?.[0]}${decoded.LastName?.[0]}` : '?'}
//         </AvatarFallback>
//       </Avatar>
//       <div>
//         <Label htmlFor="avatarFile" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
//           <ImageIcon className="h-4 w-4 mr-2" />
//           Change Avatar
//         </Label>
//         <input 
//           id="avatarFile" 
//           type="file" 
//           className="sr-only" 
//           accept="image/*"
//           onChange={handleImageChange}
//         />
//         <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 2MB.</p>
//       </div>
//     </div>

//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       <div>
//         <Label htmlFor="firstName">First Name</Label>
//         <Input
//           id="firstName"
//           {...register("firstName", { required: "First name is required" })}
//           className="mt-1 h-10"
//         />
//         {profileErrors.firstName && <p className="mt-1 text-sm text-red-500">{profileErrors.firstName.message}</p>}
//       </div>
//       <div>
//         <Label htmlFor="lastName">Last Name</Label>
//         <Input
//           id="lastName"
//           {...register("lastName", { required: "Last name is required" })}
//           className="mt-1 h-10"
//         />
//         {profileErrors.lastName && <p className="mt-1 text-sm text-red-500">{profileErrors.lastName.message}</p>}
//       </div>
//       <div>
//         <Label>Role</Label>
//         <div className="mt-1 p-2 border rounded-md bg-gray-50">
//           {decoded?.Role || 'Not available'}
//         </div>
//       </div>
//       <div>
//         <Label htmlFor="email">Email</Label>
//         <Input
//           id="email"
//           type="email"
//           {...register("email", { 
//             required: "Email is required",
//             pattern: {
//               value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//               message: "Invalid email address"
//             }
//           })}
//           className="mt-1 h-10"
//         />
//         {profileErrors.email && <p className="mt-1 text-sm text-red-500">{profileErrors.email.message}</p>}
//       </div>
//       <div>
//         <Label htmlFor="phone">Phone</Label>
//         <Input
//           id="phone"
//           {...register("phone")}
//           className="mt-1 h-10"
//         />
//         {profileErrors.phone && <p className="mt-1 text-sm text-red-500">{profileErrors.phone.message}</p>}
//       </div>
//     </div>

//     <div className="flex justify-end pt-4">
//       <Button type="submit" disabled={isProfileSubmitting}>
//         {isProfileSubmitting ? (
//           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//         ) : (
//           <Save className="h-4 w-4 mr-2" />
//         )}
//         {isProfileSubmitting ? 'Saving...' : 'Save Changes'}
//       </Button>
//     </div>
//   </form>
// </div>
//         {/* Security Section (Password Change) */}
//         <div className="bg-white shadow rounded-lg p-6 border">
//           <div className="flex items-center mb-6">
//             <Lock className="h-5 w-5 text-gray-500 mr-3" />
//             <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
//           </div>
//           <div className="space-y-6">
//             <div>
//               <Label htmlFor="currentPassword">Current Password</Label>
//               <Input
//                 id="currentPassword"
//                 type="password"
//                 {...register("currentPassword")}
//                 className="mt-1 h-10"
//               />
//               {profileErrors.confirmPassword && !profileErrors.currentPassword && (
//                 <p className="mt-1 text-sm text-red-500">Current password is required to change password.</p>
//               )}
//             </div>
//             <div>
//               <Label htmlFor="newPassword">New Password</Label>
//               <Input
//                 id="newPassword"
//                 type="password"
//                 {...register("newPassword")}
//                 className="mt-1 h-10"
//               />
//             </div>
//             <div>
//               <Label htmlFor="confirmPassword">Confirm New Password</Label>
//               <Input
//                 id="confirmPassword"
//                 type="password"
//                 {...register("confirmPassword")}
//                 className="mt-1 h-10"
//               />
//               {profileErrors.confirmPassword && (
//                 <p className="mt-1 text-sm text-red-500">{profileErrors.confirmPassword.message}</p>
//               )}
//             </div>
            
//             {/* Password Change Submit Button */}
//             <div className="flex justify-end pt-2">
//               <Button 
//                 type="button" 
//                 onClick={onChangePasswordSubmit}
//                 disabled={!currentPassword || !newPassword || newPassword !== confirmPassword || isChangingPassword}
//               >
//                 {isChangingPassword ? (
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 ) : (
//                   <Lock className="h-4 w-4 mr-2" />
//                 )}
//                 {isChangingPassword ? 'Changing...' : 'Change Password'}
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* Admin Management Section */}
//         <div className="bg-white shadow rounded-lg p-6 border">
//           <div className="flex items-center mb-6">
//             <Users className="h-5 w-5 text-gray-500 mr-3" />
//             <h3 className="text-lg font-medium text-gray-900">Manage Administrators</h3>
//           </div>
//           <div className="space-y-4">
//             <p className="text-sm text-gray-600">Add or remove other platform administrators.</p>
//             <Button type="button" variant="outline" onClick={handleAddAdminClick}>Add New Admin</Button>
//           </div>
//         </div>

//         {/* Save Button for Profile Form */}
//         <div className="flex justify-end pt-8 mt-8 border-t">
//           <Button type="submit" disabled={!isProfileDirty || isProfileSubmitting}>
//             {isProfileSubmitting ? (
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//             ) : (
//               <Save className="h-4 w-4 mr-2" />
//             )}
//             {isProfileSubmitting ? 'Saving...' : 'Save Profile Changes'}
//           </Button>
//         </div>
//       </form>

//       {/* --- Change Email Dialog --- */}
//       <Dialog open={isChangeEmailDialogOpen} onOpenChange={setIsChangeEmailDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Change Email Address</DialogTitle>
//             <DialogDescription>
//               Enter your new email address and current password. A confirmation link will be sent to the new address.
//             </DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleEmailDialogSubmit(onChangeEmailSubmit)} className="space-y-4 py-4">
//             <div>
//               <Label htmlFor="newEmail">New Email Address</Label>
//               <Input id="newEmail" type="email" {...registerEmail("newEmail")} className="mt-1" />
//               {emailErrors.newEmail && <p className="mt-1 text-sm text-red-500">{emailErrors.newEmail.message}</p>}
//             </div>
//             <div>
//               <Label htmlFor="currentPasswordForEmail">Current Password</Label>
//               <Input id="currentPasswordForEmail" type="password" {...registerEmail("currentPasswordForEmail")} className="mt-1" />
//               {emailErrors.currentPasswordForEmail && <p className="mt-1 text-sm text-red-500">{emailErrors.currentPasswordForEmail.message}</p>}
//             </div>
//             <DialogFooter>
//               <DialogClose asChild>
//                 <Button type="button" variant="outline" disabled={isSubmittingEmailChange}>Cancel</Button>
//               </DialogClose>
//               <Button type="submit" disabled={isSubmittingEmailChange}>
//                 {isSubmittingEmailChange && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                 Request Email Change
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* --- Add Admin Dialog --- */}
//       <Dialog open={isAddAdminDialogOpen} onOpenChange={setIsAddAdminDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Add New Administrator</DialogTitle>
//             <DialogDescription>
//               Enter the email address of the user you want to invite as an administrator.
//             </DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleAdminDialogSubmit(onAddAdminSubmit)} className="space-y-4 py-4">
//             <div>
//               <Label htmlFor="adminEmail">Admin Email Address</Label>
//               <Input id="adminEmail" type="email" {...registerAdmin("adminEmail")} className="mt-1" />
//               {adminErrors.adminEmail && <p className="mt-1 text-sm text-red-500">{adminErrors.adminEmail.message}</p>}
//             </div>
//             <DialogFooter>
//               <DialogClose asChild>
//                 <Button type="button" variant="outline" disabled={isSubmittingAdminInvite}>Cancel</Button>
//               </DialogClose>
//               <Button type="submit" disabled={isSubmittingAdminInvite}>
//                 {isSubmittingAdminInvite && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                 Send Invitation
//               </Button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Lock, Image as ImageIcon, Users, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
interface JwtPayload {
  Id?: string | number;
  Role?: string;
  Image?: any;
  FirstName?: string;
  LastName?: string;
  [key: string]: any;
}
const accountSettingsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  displayName: z.string(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) return false;
  if (data.newPassword && !data.currentPassword) return false;
  return true;
}, {
  message: 'New passwords must match, and current password is required to change.',
  path: ['confirmPassword'],
});

const changeEmailSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
  currentPasswordForEmail: z.string().min(1, 'Current password is required'),
});

const addAdminSchema = z.object({
  adminEmail: z.string().email('Invalid email address'),
});

export default function AccountSettings() {
  const token = Cookies.get('salonUser');
  const decoded = token ? jwtDecode(token) : undefined;
  const { user } = useAuth();
  const navigate = useNavigate()

  useEffect(() => {
        if (!decoded?.Id || (decoded?.Role !== "SuperAdmin" && decoded?.Role !== "Admin")) {
          navigate('/login')
        }
      },[])
  const [isChangeEmailDialogOpen, setIsChangeEmailDialogOpen] = useState(false);
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);
  const [isSubmittingEmailChange, setIsSubmittingEmailChange] = useState(false);
  const [isSubmittingAdminInvite, setIsSubmittingAdminInvite] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // const onProfileSubmit = async (data) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append('Id', decoded?.Id?.toString() || '');
  //     formData.append('FirstName', data.firstName);
  //     formData.append('LastName', data.lastName);
  //     formData.append('Email', data.email);
  //     formData.append('Phone', data.phone || '');
  //     if (selectedImage) formData.append('Image', selectedImage);

  //     const response = await fetch('https://kapperking.runasp.net/api/Users/EditAdmin', {
  //       method: 'POST',
  //       headers: { 'Authorization': `Bearer ${token}` },
  //       body: formData,
  //     });

  //     if (!response.ok) throw new Error('Failed to update profile');
  //     toast.success('Profile updated successfully!');
  //   } catch (error) {
  //     toast.error(error.message || 'Failed to update profile');
  //   }
  // };
const onProfileSubmit = async (data) => {
  try {
    const formData = new FormData();
    formData.append('Id', decoded?.Id?.toString() || '');
    formData.append('FirstName', data.firstName);
    formData.append('LastName', data.lastName);
    formData.append('Email', data.email);
    formData.append('Phone', data.phone || '');
    if (selectedImage) formData.append('Image', selectedImage);

    const response = await fetch('https://kapperking.runasp.net/api/Users/EditAdmin', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to update profile');
    
    // Get the response data which should contain the new token
    const responseData = await response.json();
    
    // Check if the response contains a new token
    if (responseData.token) {
      // Set the new token in cookies
      Cookies.set('salonUser', responseData.token, { 
        expires: 7, // Expires in 7 days (adjust as needed)
        secure: true, 
        sameSite: 'strict' 
      });
      
      // Optionally update auth context if you're using it
      // This depends on your auth implementation
      // auth.setToken(responseData.token);
      
      toast.success('Profile updated successfully! Token refreshed.');
    } else {
      toast.success('Profile updated successfully!');
    }
  } catch (error) {
    toast.error(error.message || 'Failed to update profile');
  }
};
  const { register, handleSubmit, formState: { errors, isDirty, isSubmitting }, reset, watch, setValue } = useForm({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      firstName: decoded?.FirstName || '',
      lastName: decoded?.LastName || '',
      email: decoded?.Email || '',
      phone: decoded?.Phone || '',
      displayName: `${decoded?.FirstName || ''} ${decoded?.LastName || ''}`.trim(),
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const currentPassword = watch('currentPassword');
  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  const onChangePasswordSubmit = async () => {
    if (!newPassword || !currentPassword) return toast.error('Both current and new password are required');
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match');
    setIsChangingPassword(true);

    try {
      const response = await fetch('https://kapperking.runasp.net/api/Users/ChangePassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword:currentPassword , newPassword, id: decoded?.Id }),
      });
      if (!response.ok) throw new Error('Password change failed');
      toast.success('Password changed successfully');
      navigate("/login")
      Cookies.remove('salonUser')
      setValue('currentPassword', '');
      setValue('newPassword', '');
      setValue('confirmPassword', '');
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors }, reset: resetEmail } = useForm({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: user?.email || '', currentPasswordForEmail: '' },
  });

  const { register: registerAdmin, handleSubmit: handleAdminSubmit, formState: { errors: adminErrors }, reset: resetAdmin } = useForm({
    resolver: zodResolver(addAdminSchema),
    defaultValues: { adminEmail: '' },
  });

  return (
    <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6 border space-y-6">
        <div className="flex items-center mb-6">
          <User className="h-5 w-5 text-gray-500 mr-3" />
          <h3 className="text-lg font-medium text-gray-900">Profile</h3>
        </div>

        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={imagePreview || decoded?.Image || undefined} alt="Avatar" />
            <AvatarFallback className="text-xl">{decoded?.FirstName?.[0]}{decoded?.LastName?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <Label htmlFor="avatarFile" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <ImageIcon className="h-4 w-4 mr-2" />Change Avatar
            </Label>
            <input id="avatarFile" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 2MB.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" {...register('firstName')} className="mt-1 h-10" />
            {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" {...register('lastName')} className="mt-1 h-10" />
            {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" {...register('email')} className="mt-1 h-10" />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} className="mt-1 h-10" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={!isDirty || isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 border space-y-6">
        <div className="flex items-center mb-6">
          <Lock className="h-5 w-5 text-gray-500 mr-3" />
          <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" {...register('currentPassword')} className="mt-1 h-10" />
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" {...register('newPassword')} className="mt-1 h-10" />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" {...register('confirmPassword')} className="mt-1 h-10" />
            {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>}
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={onChangePasswordSubmit} disabled={isChangingPassword}>
              {isChangingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Lock className="h-4 w-4 mr-2" />}
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
