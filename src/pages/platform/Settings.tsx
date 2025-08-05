import React, {useEffect} from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { usePlatformSettingsStore, selectPlatformSettings, PlatformSettingsData } from '@/lib/store/platformSettings';
import { Settings as SettingsIcon, Mail, Shield, Link as LinkIcon, Facebook, Twitter, Instagram, Linkedin, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs components
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

interface MyJwtPayload {
      Id?: string;
      Role?: string;
      [key: string]: any;
    }
// Schema remains the same (includes all fields)
const platformSettingsSchema = z.object({
  platformName: z.string().min(2, 'Platform name must be at least 2 characters'),
  supportEmail: z.string().email('Invalid email address'),
  defaultCurrency: z.string(),
  defaultLanguage: z.string(),
  defaultTimezone: z.string(),
  emailSettings: z.object({
    fromName: z.string(),
    fromEmail: z.string().email('Invalid email address'),
    smtpHost: z.string(),
    smtpPort: z.number(),
    smtpUsername: z.string(),
    smtpPassword: z.string().optional(),
  }),
  security: z.object({
    passwordMinLength: z.number().min(6),
    sessionTimeout: z.number().min(5),
    maxLoginAttempts: z.number().min(1),
  }),
  socialLinks: z.object({
    facebook: z.string().url().or(z.literal('')).optional(),
    twitter: z.string().url().or(z.literal('')).optional(),
    instagram: z.string().url().or(z.literal('')).optional(),
    linkedin: z.string().url().or(z.literal('')).optional(),
  }),
  stripeConfig: z.object({
    publishableKey: z.string().startsWith('pk_').or(z.literal('')).optional(),
    secretKey: z.string().startsWith('sk_').or(z.literal('')).optional(),
    webhookSecret: z.string().startsWith('whsec_').or(z.literal('')).optional(),
  }),
});

type PlatformSettingsFormData = PlatformSettingsData;

export default function PlatformSettings() {

      const navigate = useNavigate()
    const token = Cookies.get('salonUser');
    const decoded: MyJwtPayload | undefined = token ? jwtDecode<MyJwtPayload>(token) : undefined;

    useEffect(() => {
      if (!decoded?.Id || (decoded?.Role !== "SuperAdmin" && decoded?.Role !== "Admin")) {
        navigate('/login')
      }
    },[])
  const settings = usePlatformSettingsStore(selectPlatformSettings);
  const updateSettings = usePlatformSettingsStore((state) => state.updateSettings);

  const { register, handleSubmit, formState: { errors, isDirty, isSubmitting }, reset } = useForm<PlatformSettingsFormData>({
    resolver: zodResolver(platformSettingsSchema),
    defaultValues: settings
  });

  React.useEffect(() => {
    reset(settings);
  }, [settings, reset]);

  const onSubmit = async (data: PlatformSettingsFormData) => {
    console.log('Updating settings with:', data);
    updateSettings(data);
    toast.success('Settings updated successfully');
    reset(data); // Reset dirty state after successful save
  };

  return (
    <div className="space-y-6">
      {/* Header */}
       <div className="flex items-center justify-between pb-4 border-b">
         <div>
           <h1 className="text-2xl font-semibold text-gray-900">Platform Settings</h1>
           <p className="mt-1 text-sm text-gray-500">
             Configure global platform settings and defaults
           </p>
         </div>
         {/* Save Button moved outside the form, next to header */}
         <Button
            onClick={handleSubmit(onSubmit)} // Trigger form submit
            disabled={!isDirty || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
       </div>

      {/* Use Tabs component */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6"> {/* Adjust grid-cols based on number of tabs */}
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="stripe">Stripe</TabsTrigger>
        </TabsList>

        {/* Wrap content in a single form */}
        <form onSubmit={handleSubmit(onSubmit)}> {/* Form now wraps TabsContent */}

          <TabsContent value="general">
            <Card> {/* Wrap content in Card for consistent styling */}
              <CardHeader>
                 <CardTitle className="flex items-center">
                    <SettingsIcon className="h-5 w-5 text-gray-500 mr-3" />
                    General Settings
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="platformName">Platform Name</Label>
                  <Input id="platformName" {...register('platformName')} className="mt-1 h-10" />
                  {errors.platformName && <p className="mt-2 text-sm text-red-600">{errors.platformName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input id="supportEmail" type="email" {...register('supportEmail')} className="mt-1 h-10" />
                  {errors.supportEmail && <p className="mt-2 text-sm text-red-600">{errors.supportEmail.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <div>
                     <Label htmlFor="defaultCurrency">Default Currency</Label>
                     <select id="defaultCurrency" {...register('defaultCurrency')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-10">
                       <option value="EUR">Euro (€)</option>
                       <option value="USD">US Dollar ($)</option>
                       <option value="GBP">British Pound (£)</option>
                     </select>
                   </div>
                   <div>
                     <Label htmlFor="defaultLanguage">Default Language</Label>
                     <select id="defaultLanguage" {...register('defaultLanguage')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-10">
                       <option value="en">English (en)</option>
                       <option value="nl">Dutch (nl)</option>
                       <option value="ar">Arabic (ar)</option>
                       <option value="uk">Ukrainian (uk)</option>
                     </select>
                   </div>
                   <div>
                     <Label htmlFor="defaultTimezone">Default Timezone</Label>
                     <select id="defaultTimezone" {...register('defaultTimezone')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-10">
                       <option value="Europe/Amsterdam">Europe/Amsterdam</option>
                       <option value="Europe/London">Europe/London</option>
                       <option value="Europe/Paris">Europe/Paris</option>
                       <option value="Europe/Berlin">Europe/Berlin</option>
                     </select>
                   </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
             <Card>
               <CardHeader>
                  <CardTitle className="flex items-center">
                     <Mail className="h-5 w-5 text-gray-500 mr-3" />
                     Email Settings
                  </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                   <div className="sm:col-span-3">
                     <Label htmlFor="emailSettings.fromName">From Name</Label>
                     <Input id="emailSettings.fromName" {...register('emailSettings.fromName')} className="mt-1 h-10" />
                   </div>
                   <div className="sm:col-span-3">
                     <Label htmlFor="emailSettings.fromEmail">From Email</Label>
                     <Input id="emailSettings.fromEmail" type="email" {...register('emailSettings.fromEmail')} className="mt-1 h-10" />
                   </div>
                   {/* <div className="sm:col-span-3">
                     <Label htmlFor="emailSettings.smtpHost">SMTP Host</Label>
                     <Input id="emailSettings.smtpHost" {...register('emailSettings.smtpHost')} className="mt-1 h-10" />
                   </div>
                   <div className="sm:col-span-3">
                     <Label htmlFor="emailSettings.smtpPort">SMTP Port</Label>
                     <Input id="emailSettings.smtpPort" type="number" {...register('emailSettings.smtpPort', { valueAsNumber: true })} className="mt-1 h-10" />
                   </div>
                   <div className="sm:col-span-3">
                     <Label htmlFor="emailSettings.smtpUsername">SMTP Username</Label>
                     <Input id="emailSettings.smtpUsername" {...register('emailSettings.smtpUsername')} className="mt-1 h-10" />
                   </div>
                   <div className="sm:col-span-3">
                     <Label htmlFor="emailSettings.smtpPassword">SMTP Password</Label>
                     <Input id="emailSettings.smtpPassword" type="password" {...register('emailSettings.smtpPassword')} className="mt-1 h-10" placeholder="Enter new password or leave blank" />
                   </div> */}
                 </div>
               </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="security">
             <Card>
               <CardHeader>
                  <CardTitle className="flex items-center">
                     <Shield className="h-5 w-5 text-gray-500 mr-3" />
                     Security Settings
                  </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                   <div className="sm:col-span-2">
                     <Label htmlFor="security.passwordMinLength">Minimum Password Length</Label>
                     <Input id="security.passwordMinLength" type="number" {...register('security.passwordMinLength', { valueAsNumber: true })} className="mt-1 h-10" />
                   </div>
                   {/* <div className="sm:col-span-2">
                     <Label htmlFor="security.sessionTimeout">Session Timeout (minutes)</Label>
                     <Input id="security.sessionTimeout" type="number" {...register('security.sessionTimeout', { valueAsNumber: true })} className="mt-1 h-10" />
                   </div> */}
                   <div className="sm:col-span-2">
                     <Label htmlFor="security.maxLoginAttempts">Max Login Attempts</Label>
                     <Input id="security.maxLoginAttempts" type="number" {...register('security.maxLoginAttempts', { valueAsNumber: true })} className="mt-1 h-10" />
                   </div>
                 </div>
               </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="social">
             <Card>
               <CardHeader>
                  <CardTitle className="flex items-center">
                     <LinkIcon className="h-5 w-5 text-gray-500 mr-3" />
                     Social Media Links
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="socialLinks.facebook" className="flex items-center">
                      <Facebook className="h-4 w-4 mr-2 text-[#1877F2]" /> Facebook URL
                    </Label>
                    <Input id="socialLinks.facebook" {...register('socialLinks.facebook')} placeholder="https://facebook.com/yourpage" className="mt-1 h-10" />
                  </div>
                  <div>
                    <Label htmlFor="socialLinks.twitter" className="flex items-center">
                      <Twitter className="h-4 w-4 mr-2 text-[#1DA1F2]" /> Twitter URL
                    </Label>
                    <Input id="socialLinks.twitter" {...register('socialLinks.twitter')} placeholder="https://twitter.com/yourhandle" className="mt-1 h-10" />
                  </div>
                  <div>
                    <Label htmlFor="socialLinks.instagram" className="flex items-center">
                      <Instagram className="h-4 w-4 mr-2 text-[#E4405F]" /> Instagram URL
                    </Label>
                    <Input id="socialLinks.instagram" {...register('socialLinks.instagram')} placeholder="https://instagram.com/yourprofile" className="mt-1 h-10" />
                  </div>
                  <div>
                    <Label htmlFor="socialLinks.linkedin" className="flex items-center">
                      <Linkedin className="h-4 w-4 mr-2 text-[#0A66C2]" /> LinkedIn URL
                    </Label>
                    <Input id="socialLinks.linkedin" {...register('socialLinks.linkedin')} placeholder="https://linkedin.com/company/yourcompany" className="mt-1 h-10" />
                  </div>
               </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="stripe">
             <Card>
               <CardHeader>
                  <CardTitle className="flex items-center">
                     <CreditCard className="h-5 w-5 text-gray-500 mr-3" />
                     Stripe Configuration
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-md border border-orange-200">
                    **Important:** These keys are for configuration reference. The actual keys used by the application should be securely stored in environment variables (`.env` file, server configuration) and NOT fetched dynamically from these settings by frontend or backend code at runtime.
                  </p>
                  <div>
                    <Label htmlFor="stripeConfig.publishableKey">Publishable Key</Label>
                    <Input id="stripeConfig.publishableKey" {...register('stripeConfig.publishableKey')} placeholder="pk_live_..." className="mt-1 h-10" />
                    <p className="mt-1 text-xs text-gray-500">Used by frontend (via VITE_STRIPE_PUBLISHABLE_KEY env var).</p>
                  </div>
                  <div>
                    <Label htmlFor="stripeConfig.secretKey">Secret Key</Label>
                    <Input id="stripeConfig.secretKey" type="password" {...register('stripeConfig.secretKey')} placeholder="sk_live_..." className="mt-1 h-10" />
                    <p className="mt-1 text-xs text-gray-500">Used by backend ONLY (via STRIPE_SECRET_KEY env var).</p>
                    <p className="mt-1 text-xs text-gray-500">Leave blank to keep current value.</p>
                  </div>
                  <div>
                    <Label htmlFor="stripeConfig.webhookSecret">Webhook Signing Secret</Label>
                    <Input id="stripeConfig.webhookSecret" type="password" {...register('stripeConfig.webhookSecret')} placeholder="whsec_..." className="mt-1 h-10" />
                     <p className="mt-1 text-xs text-gray-500">Used by backend webhook handler ONLY (via STRIPE_WEBHOOK_SECRET env var).</p>
                     <p className="mt-1 text-xs text-gray-500">Leave blank to keep current value.</p>
                  </div>
               </CardContent>
             </Card>
          </TabsContent>

          {/* Save Button moved outside the form, next to header */}
          {/* <div className="flex justify-end pt-8 mt-8 border-t"> ... </div> */}
        </form>
      </Tabs>
    </div>
  );
}