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
import axios from 'axios';
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
//       body: formData,
//     });
// console.log(response.data, "ress")
//     if (!response.ok) throw new Error('Failed to update profile');
    
//     // Get the response data which should contain the new token
//     const responseData = await response.json();
    
//     // Check if the response contains a new token
//     if (responseData.token) {
//       // Set the new token in cookies
//       Cookies.set('salonUser', responseData.token, { 
//         expires: 7, // Expires in 7 days (adjust as needed)
//         secure: true, 
//         sameSite: 'strict' 
//       });
      
//       // Optionally update auth context if you're using it
//       // This depends on your auth implementation
//       // auth.setToken(responseData.token);
      
//       toast.success('Profile updated successfully! Token refreshed.');
//     } else {
//       toast.success('Profile updated successfully!');
//     }
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
    if (selectedImage) {
      formData.append('Image', selectedImage);
    }

    const response = await axios.post(
      'https://kapperking.runasp.net/api/Users/EditAdmin',
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const responseData = response.data;
    console.log(responseData, "ress");
    if (responseData) {
      Cookies.set('salonUser', responseData);

      toast.success('Profile updated successfully! Token refreshed.');
    } else {
      toast.success('Profile updated successfully!');
    }
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || 'Failed to update profile';
    toast.error(message);
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
