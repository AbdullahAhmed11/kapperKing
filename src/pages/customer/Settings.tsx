import React, { useState, useEffect } from 'react'; // Import useEffect
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useClientStore } from '@/lib/store/clients'; // Import client store
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { User, Mail, Lock, ArrowLeft, Loader2, Phone } from 'lucide-react'; // Added Phone icon
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema for Change Email form
const emailSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
});
type EmailFormData = z.infer<typeof emailSchema>;

// Schema for Change Password form
const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});
type PasswordFormData = z.infer<typeof passwordSchema>;

// Schema for Phone form
const phoneSchema = z.object({
  phone: z.string().optional(), // Allow empty string
});
type PhoneFormData = z.infer<typeof phoneSchema>;


export default function CustomerSettingsPage() {
  const { user, loading: authLoading, updateCustomerEmail, updateCustomerPassword } = useAuth();
  const { currentCustomerClient, fetchCurrentCustomerClient, updateCustomerPhone, loadingCustomer } = useClientStore();
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // Form hooks
  const emailForm = useForm<EmailFormData>({ resolver: zodResolver(emailSchema) });
  const passwordForm = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });
  const phoneForm = useForm<PhoneFormData>({
     resolver: zodResolver(phoneSchema),
     defaultValues: { phone: '' } // Initialize empty
  });

  // Fetch client data on load to get current phone
  useEffect(() => {
     if (user?.id && !authLoading) { // Ensure auth isn't loading
        fetchCurrentCustomerClient(user.id);
     }
  }, [user?.id, authLoading, fetchCurrentCustomerClient]);

  // Update phone form default value when client data loads/changes
  useEffect(() => {
     if (currentCustomerClient) {
        phoneForm.reset({ phone: currentCustomerClient.phone || '' });
     }
  }, [currentCustomerClient, phoneForm]);


  const handleEmailSubmit = async (data: EmailFormData) => {
     const { error } = await updateCustomerEmail(data.newEmail);
     if (!error) {
        setShowEmailDialog(false);
        emailForm.reset();
     }
  };

  const handlePasswordSubmit = async (data: PasswordFormData) => {
     const { error } = await updateCustomerPassword(data.newPassword);
     if (!error) {
        setShowPasswordDialog(false);
        passwordForm.reset();
     }
  };

  const handlePhoneSubmit = async (data: PhoneFormData) => {
     if (!user?.id) { toast.error("User not authenticated."); return; }
     // Pass empty string if data.phone is undefined/null
     await updateCustomerPhone(user.id, data.phone || ''); 
  };

  // Combined loading state for disabling buttons
  const isLoading = authLoading || loadingCustomer;

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4 sm:px-6 lg:px-8 space-y-8">
       <div>
          <Button variant="outline" size="sm" asChild className="mb-4">
             <Link to="/c/profile"><ArrowLeft className="h-4 w-4 mr-2"/>Back to Profile</Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your login and contact details.</p>
       </div>

       {/* Change Email Card */}
       <Card>
          <CardHeader>
             <CardTitle className="flex items-center"><Mail className="h-5 w-5 mr-2"/>Email Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <p className="text-sm text-gray-700">Your current email address is: <span className="font-medium">{user?.email || 'N/A'}</span></p>
             <Button onClick={() => setShowEmailDialog(true)} variant="outline" disabled={isLoading}>Change Email Address</Button>
             <p className="text-xs text-gray-500">Changing your email requires confirmation via the new email address.</p>
          </CardContent>
       </Card>

       {/* Change Password Card */}
       <Card>
          <CardHeader>
             <CardTitle className="flex items-center"><Lock className="h-5 w-5 mr-2"/>Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <Button onClick={() => setShowPasswordDialog(true)} variant="outline" disabled={isLoading}>Change Password</Button>
              {/* Removed mention of current password as it's not implemented in this flow */}
          </CardContent>
       </Card>

       {/* Update Phone Number Card */}
       <Card>
          <CardHeader>
             <CardTitle className="flex items-center"><Phone className="h-5 w-5 mr-2"/>Phone Number</CardTitle>
          </CardHeader>
          <CardContent>
             <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-4">
                <div>
                   <Label htmlFor="phone">Phone Number</Label>
                   <Input id="phone" type="tel" {...phoneForm.register('phone')} className="mt-1" placeholder="Enter your phone number"/>
                   {phoneForm.formState.errors.phone && <p className="mt-1 text-sm text-red-600">{phoneForm.formState.errors.phone.message}</p>}
                </div>
                <Button type="submit" disabled={isLoading}>
                   {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   Update Phone
                </Button>
             </form>
          </CardContent>
       </Card>

       {/* Change Email Dialog */}
       <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <DialogContent>
             <DialogHeader><DialogTitle>Change Email Address</DialogTitle></DialogHeader>
             <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4 py-2">
                <div>
                   <Label htmlFor="newEmail">New Email Address</Label>
                   <Input id="newEmail" type="email" {...emailForm.register('newEmail')} className="mt-1" />
                   {emailForm.formState.errors.newEmail && <p className="mt-1 text-sm text-red-600">{emailForm.formState.errors.newEmail.message}</p>}
                </div>
                <DialogFooter>
                   <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
                   <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Email
                   </Button>
                </DialogFooter>
             </form>
          </DialogContent>
       </Dialog>

       {/* Change Password Dialog */}
       <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
             <DialogHeader><DialogTitle>Change Password</DialogTitle></DialogHeader>
             <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4 py-2">
                <div>
                   <Label htmlFor="newPassword">New Password</Label>
                   <Input id="newPassword" type="password" {...passwordForm.register('newPassword')} className="mt-1" />
                   {passwordForm.formState.errors.newPassword && <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.newPassword.message}</p>}
                </div>
                 <div>
                   <Label htmlFor="confirmPassword">Confirm New Password</Label>
                   <Input id="confirmPassword" type="password" {...passwordForm.register('confirmPassword')} className="mt-1" />
                   {passwordForm.formState.errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>}
                </div>
                <DialogFooter>
                   <DialogClose asChild><Button type="button" variant="outline" disabled={isLoading}>Cancel</Button></DialogClose>
                   <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Password
                   </Button>
                </DialogFooter>
             </form>
          </DialogContent>
       </Dialog>

    </div>
  );
}