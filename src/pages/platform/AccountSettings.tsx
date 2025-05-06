import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Lock, Image as ImageIcon, Users, Save, Loader2 } from 'lucide-react'; // Added Loader2
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
} from "@/components/ui/dialog";

// --- Zod Schema for Profile & Password ---
const accountSettingsSchema = z.object({
  displayName: z.string().min(1, "Display name cannot be empty."),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "New passwords must match, and current password is required to change.",
  path: ["confirmPassword"],
});

type AccountSettingsFormData = z.infer<typeof accountSettingsSchema>;

// --- Zod Schema for Email Change Dialog ---
const changeEmailSchema = z.object({
  newEmail: z.string().email("Invalid email address."),
  currentPasswordForEmail: z.string().min(1, "Current password is required."),
});
type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;

// --- Zod Schema for Add Admin Dialog ---
const addAdminSchema = z.object({
  adminEmail: z.string().email("Invalid email address."),
});
type AddAdminFormData = z.infer<typeof addAdminSchema>;


export default function AccountSettings() {
  const { user } = useAuth();
  const [isChangeEmailDialogOpen, setIsChangeEmailDialogOpen] = useState(false);
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);
  const [isSubmittingEmailChange, setIsSubmittingEmailChange] = useState(false); // Loading state
  const [isSubmittingAdminInvite, setIsSubmittingAdminInvite] = useState(false); // Loading state

  // --- Main Form Hook ---
  const { register, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors, isDirty: isProfileDirty, isSubmitting: isProfileSubmitting }, reset: resetProfileForm } = useForm<AccountSettingsFormData>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      displayName: user?.user_metadata?.full_name || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  // --- Change Email Form Hook ---
   const { register: registerEmail, handleSubmit: handleEmailDialogSubmit, formState: { errors: emailErrors }, reset: resetEmailForm } = useForm<ChangeEmailFormData>({
     resolver: zodResolver(changeEmailSchema),
     defaultValues: { newEmail: user?.email || '', currentPasswordForEmail: '' }
   });

  // --- Add Admin Form Hook ---
   const { register: registerAdmin, handleSubmit: handleAdminDialogSubmit, formState: { errors: adminErrors }, reset: resetAdminForm } = useForm<AddAdminFormData>({
     resolver: zodResolver(addAdminSchema),
     defaultValues: { adminEmail: '' }
   });


  // Placeholder function for getting initials
  const getInitials = (email?: string) => {
    if (!email) return 'A';
    const parts = email.split('@')[0].split(/[._-]/);
    return parts.map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  // --- Submit Handler for Main Profile/Password Form ---
  const onProfileSubmit = async (data: AccountSettingsFormData) => {
    console.log("Profile/Password Form Data:", data);
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    // TODO (Backend): Implement profile and password update logic.
    // 1. Update Display Name:
    //    - Call `supabase.auth.updateUser({ data: { full_name: data.displayName } })`.
    // 2. Change Password (if newPassword is present):
    //    - This requires verifying the `data.currentPassword` against the user's actual current password *on the backend* for security.
    //    - Create a Supabase Edge Function (e.g., `change-password`).
    //    - Frontend calls this function, passing `currentPassword` and `newPassword`.
    //    - Backend function:
    //        a. Verifies the *current* password using a secure method (e.g., trying to sign in with it, or a dedicated verification endpoint if available). DO NOT trust the frontend verification alone.
    //        b. If verified, calls `supabase.auth.updateUser({ password: data.newPassword })`.
    //        c. Returns success/error to the frontend.
    //    - Update toast messages based on success/error.
    toast.success("Profile display name saved (simulation). Password change requires backend verification.");
    resetProfileForm(data, { keepValues: true }); // Reset dirty state but keep values
  };

  // --- Submit Handler for Change Email Dialog ---
  const onChangeEmailSubmit = async (data: ChangeEmailFormData) => {
     setIsSubmittingEmailChange(true);
     console.log("Change Email Dialog Data:", data);
     // Simulate async operation & basic check
     await new Promise(resolve => setTimeout(resolve, 1500));
     if (!data.currentPasswordForEmail) {
        toast.error("Current password is required to request email change.");
        setIsSubmittingEmailChange(false);
        return; // Stop simulation
     }
      // TODO (Backend): Implement secure email change flow.
      // 1. Create a Supabase Edge Function (e.g., `request-email-change`).
      // 2. Frontend calls this function, passing `newEmail` and `currentPasswordForEmail`.
      // 3. Backend function:
      //    a. Verifies `currentPasswordForEmail` securely (similar to password change).
      //    b. If verified, calls `supabase.auth.updateUser({ email: data.newEmail })`. Supabase Auth automatically handles sending a confirmation email to the *new* address. The email change only takes effect after the user clicks the confirmation link.
      //    c. Returns success/error (indicating if the request was initiated).
      // 4. Update toast message based on success/error.
      toast.info(`Simulation: Requesting email change to ${data.newEmail}. Requires backend password verification & user confirmation via email link.`);
     setIsSubmittingEmailChange(false);
     setIsChangeEmailDialogOpen(false);
     resetEmailForm();
  };

   // --- Submit Handler for Add Admin Dialog ---
   const onAddAdminSubmit = async (data: AddAdminFormData) => {
     setIsSubmittingAdminInvite(true);
     console.log("Add Admin Dialog Data:", data);
     // Simulate async operation
     await new Promise(resolve => setTimeout(resolve, 1500));
      // TODO (Backend): Implement admin invitation flow.
      // 1. Create a Supabase Edge Function (e.g., `invite-admin`).
      // 2. Frontend calls this function, passing `adminEmail`.
      // 3. Backend function:
      //    a. Check if the inviting user has permission (is an admin).
      //    b. Check if the target email already exists.
      //    c. Use `supabase.auth.admin.inviteUserByEmail(data.adminEmail, { data: { role: 'admin' } })` (requires service_role key). This sends an invitation email.
      //    d. Alternatively, create a custom invitation system (e.g., store invite tokens, send custom emails).
      //    e. Return success/error.
      // 4. Update toast message. Consider adding the invited admin to a pending list in the UI.
      toast.info(`Simulation: Sending invitation to ${data.adminEmail}. Requires backend logic for sending invite email and managing roles.`);
     setIsSubmittingAdminInvite(false);
     setIsAddAdminDialogOpen(false);
     resetAdminForm();
   };


  // Placeholder click handlers (Now just open dialogs)
  const handleChangeEmailClick = () => {
    resetEmailForm({ newEmail: user?.email || '', currentPasswordForEmail: '' });
    setIsChangeEmailDialogOpen(true);
  };

  const handleAddAdminClick = () => {
    resetAdminForm();
    setIsAddAdminDialogOpen(true);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b">
        <h1 className="text-2xl font-semibold text-gray-900">Account Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your administrator profile and security settings.
        </p>
      </div>

      {/* --- Main Form --- */}
      <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-8">

        {/* Profile Section */}
        <div className="bg-white shadow rounded-lg p-6 border">
           <div className="flex items-center mb-6">
             <User className="h-5 w-5 text-gray-500 mr-3" />
             <h3 className="text-lg font-medium text-gray-900">Profile</h3>
           </div>
           <div className="space-y-6">
             <div className="flex items-center space-x-4">
               <Avatar className="h-16 w-16">
                 {/* Ensure user exists before accessing metadata/email */}
                 <AvatarImage src={user?.user_metadata?.avatar_url || undefined} alt={user ? user.email : 'User'} />
                 <AvatarFallback className="text-xl">{user ? getInitials(user.email) : '?'}</AvatarFallback>
               </Avatar>
               <div>
                 <Label htmlFor="avatarFile" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                   <ImageIcon className="h-4 w-4 mr-2" />
                   Change Avatar
                 </Label>
                 <input id="avatarFile" type="file" className="sr-only" accept="image/*" />
                 {/* TODO (Backend): Implement avatar upload handling.
                      1. On file selection, upload the image to Supabase Storage (or other provider).
                      2. Get the public URL of the uploaded image.
                      3. Update the user's metadata (e.g., `avatar_url` in `user.user_metadata`) using `supabase.auth.updateUser`.
                      4. Potentially update the local `user` state via the `useAuth` context or refetch.
                 */}
                 <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 2MB.</p>
               </div>
             </div>
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder="Your Name"
                // Use defaultValue from user state, but allow form control
                defaultValue={user?.user_metadata?.full_name || ''}
                {...register("displayName")}
                className="mt-1 h-10"
              />
              {profileErrors.displayName && <p className="mt-1 text-sm text-red-500">{profileErrors.displayName.message}</p>}
            </div>
            {/* Email Change Button */}
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="flex items-center space-x-2">
                 <Input
                   id="email-display"
                   type="email"
                   value={user?.email || ''}
                   className="mt-1 h-10 flex-grow bg-gray-100"
                   readOnly
                   />
                 <Button type="button" variant="outline" size="sm" onClick={handleChangeEmailClick}>
                    Change Email
                 </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section (Password Change) */}
        <div className="bg-white shadow rounded-lg p-6 border">
          <div className="flex items-center mb-6">
            <Lock className="h-5 w-5 text-gray-500 mr-3" />
            <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
          </div>
          <div className="space-y-6">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...register("currentPassword")}
                className="mt-1 h-10"
              />
               {profileErrors.confirmPassword && !profileErrors.currentPassword && <p className="mt-1 text-sm text-red-500">Current password is required to change password.</p>}
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...register("newPassword")}
                className="mt-1 h-10"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className="mt-1 h-10"
              />
              {profileErrors.confirmPassword && <p className="mt-1 text-sm text-red-500">{profileErrors.confirmPassword.message}</p>}
            </div>
          </div>
        </div>

        {/* Admin Management Section */}
        <div className="bg-white shadow rounded-lg p-6 border">
           <div className="flex items-center mb-6">
             <Users className="h-5 w-5 text-gray-500 mr-3" />
             <h3 className="text-lg font-medium text-gray-900">Manage Administrators</h3>
           </div>
           <div className="space-y-4">
              <p className="text-sm text-gray-600">Add or remove other platform administrators.</p>
              {/* TODO (Backend): List existing admins.
                   1. Requires fetching users, potentially filtering by an 'admin' role stored in metadata or a separate table (e.g., using Supabase admin client).
                   2. Display list with options to remove/manage (requires another backend function for removal).
              */}
              <Button type="button" variant="outline" onClick={handleAddAdminClick}>Add New Admin</Button>
           </div>
         </div>


        {/* Save Button for Profile/Password Form */}
        <div className="flex justify-end pt-8 mt-8 border-t">
          <Button type="submit" disabled={!isProfileDirty || isProfileSubmitting}>
             {isProfileSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             ) : (
                <Save className="h-4 w-4 mr-2" />
             )}
             {isProfileSubmitting ? 'Saving...' : 'Save Profile & Password Changes'}
          </Button>
        </div>
      </form>

       {/* --- Change Email Dialog --- */}
       <Dialog open={isChangeEmailDialogOpen} onOpenChange={setIsChangeEmailDialogOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Change Email Address</DialogTitle>
             <DialogDescription>
               Enter your new email address and current password. A confirmation link will be sent to the new address.
             </DialogDescription>
           </DialogHeader>
           <form onSubmit={handleEmailDialogSubmit(onChangeEmailSubmit)} className="space-y-4 py-4">
             <div>
               <Label htmlFor="newEmail">New Email Address</Label>
               <Input id="newEmail" type="email" {...registerEmail("newEmail")} className="mt-1" />
               {emailErrors.newEmail && <p className="mt-1 text-sm text-red-500">{emailErrors.newEmail.message}</p>}
             </div>
             <div>
               <Label htmlFor="currentPasswordForEmail">Current Password</Label>
               <Input id="currentPasswordForEmail" type="password" {...registerEmail("currentPasswordForEmail")} className="mt-1" />
               {emailErrors.currentPasswordForEmail && <p className="mt-1 text-sm text-red-500">{emailErrors.currentPasswordForEmail.message}</p>}
             </div>
             <DialogFooter>
                <DialogClose asChild>
                   <Button type="button" variant="outline" disabled={isSubmittingEmailChange}>Cancel</Button>
                </DialogClose>
               <Button type="submit" disabled={isSubmittingEmailChange}>
                  {isSubmittingEmailChange && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 Request Email Change
               </Button>
             </DialogFooter>
           </form>
         </DialogContent>
       </Dialog>

       {/* --- Add Admin Dialog --- */}
       <Dialog open={isAddAdminDialogOpen} onOpenChange={setIsAddAdminDialogOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Add New Administrator</DialogTitle>
             <DialogDescription>
               Enter the email address of the user you want to invite as an administrator.
             </DialogDescription>
           </DialogHeader>
           <form onSubmit={handleAdminDialogSubmit(onAddAdminSubmit)} className="space-y-4 py-4">
             <div>
               <Label htmlFor="adminEmail">Admin Email Address</Label>
               <Input id="adminEmail" type="email" {...registerAdmin("adminEmail")} className="mt-1" />
               {adminErrors.adminEmail && <p className="mt-1 text-sm text-red-500">{adminErrors.adminEmail.message}</p>}
             </div>
             <DialogFooter>
               <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmittingAdminInvite}>Cancel</Button>
               </DialogClose>
               <Button type="submit" disabled={isSubmittingAdminInvite}>
                  {isSubmittingAdminInvite && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 Send Invitation
               </Button>
             </DialogFooter>
           </form>
         </DialogContent>
       </Dialog>

    </div>
  );
}