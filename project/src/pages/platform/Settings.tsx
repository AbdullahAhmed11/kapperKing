import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const platformSettingsSchema = z.object({
  platformName: z.string().min(2, 'Platform name must be at least 2 characters'),
  supportEmail: z.string().email('Invalid email address'),
  defaultCurrency: z.string(),
  defaultLanguage: z.string(),
  defaultTimezone: z.string(),
  trialDuration: z.number().min(0),
  maxFileSize: z.number().min(0),
  allowedFileTypes: z.string(),
  emailSettings: z.object({
    fromName: z.string(),
    fromEmail: z.string().email('Invalid email address'),
    smtpHost: z.string(),
    smtpPort: z.number(),
    smtpUsername: z.string(),
    smtpPassword: z.string(),
  }),
  security: z.object({
    passwordMinLength: z.number().min(6),
    sessionTimeout: z.number().min(5),
    maxLoginAttempts: z.number().min(1),
  }),
});

type PlatformSettingsFormData = z.infer<typeof platformSettingsSchema>;

export default function PlatformSettings() {
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<PlatformSettingsFormData>({
    resolver: zodResolver(platformSettingsSchema),
    defaultValues: {
      platformName: 'KapperKing',
      supportEmail: 'support@kapperking.com',
      defaultCurrency: 'EUR',
      defaultLanguage: 'en',
      defaultTimezone: 'Europe/Amsterdam',
      trialDuration: 14,
      maxFileSize: 10,
      allowedFileTypes: '.jpg,.png,.pdf',
      emailSettings: {
        fromName: 'KapperKing',
        fromEmail: 'noreply@kapperking.com',
        smtpHost: 'smtp.example.com',
        smtpPort: 587,
        smtpUsername: 'smtp_user',
        smtpPassword: '********',
      },
      security: {
        passwordMinLength: 8,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
      },
    },
  });

  const onSubmit = async (data: PlatformSettingsFormData) => {
    try {
      // Implement settings update logic here
      console.log('Settings data:', data);
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Platform Settings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure global platform settings and defaults
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* General Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">General Settings</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <Label htmlFor="platformName">Platform Name</Label>
                <Input
                  id="platformName"
                  {...register('platformName')}
                  className="mt-1"
                />
                {errors.platformName && (
                  <p className="mt-2 text-sm text-red-600">{errors.platformName.message}</p>
                )}
              </div>

              <div className="sm:col-span-4">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  {...register('supportEmail')}
                  className="mt-1"
                />
                {errors.supportEmail && (
                  <p className="mt-2 text-sm text-red-600">{errors.supportEmail.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <select
                  id="defaultCurrency"
                  {...register('defaultCurrency')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="EUR">Euro (€)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="defaultLanguage">Default Language</Label>
                <select
                  id="defaultLanguage"
                  {...register('defaultLanguage')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="en">English</option>
                  <option value="nl">Dutch</option>
                  <option value="de">German</option>
                  <option value="fr">French</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="defaultTimezone">Default Timezone</Label>
                <select
                  id="defaultTimezone"
                  {...register('defaultTimezone')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="Europe/Amsterdam">Europe/Amsterdam</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Europe/Paris">Europe/Paris</option>
                  <option value="Europe/Berlin">Europe/Berlin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Trial & Subscription Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Trial & Subscription</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <Label htmlFor="trialDuration">Trial Duration (days)</Label>
                <Input
                  id="trialDuration"
                  type="number"
                  {...register('trialDuration', { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* File Upload Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">File Upload Settings</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  {...register('maxFileSize', { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-4">
                <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                <Input
                  id="allowedFileTypes"
                  {...register('allowedFileTypes')}
                  className="mt-1"
                  placeholder=".jpg,.png,.pdf"
                />
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Email Settings</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <Label htmlFor="emailSettings.fromName">From Name</Label>
                <Input
                  id="emailSettings.fromName"
                  {...register('emailSettings.fromName')}
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-3">
                <Label htmlFor="emailSettings.fromEmail">From Email</Label>
                <Input
                  id="emailSettings.fromEmail"
                  type="email"
                  {...register('emailSettings.fromEmail')}
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-3">
                <Label htmlFor="emailSettings.smtpHost">SMTP Host</Label>
                <Input
                  id="emailSettings.smtpHost"
                  {...register('emailSettings.smtpHost')}
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-3">
                <Label htmlFor="emailSettings.smtpPort">SMTP Port</Label>
                <Input
                  id="emailSettings.smtpPort"
                  type="number"
                  {...register('emailSettings.smtpPort', { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-3">
                <Label htmlFor="emailSettings.smtpUsername">SMTP Username</Label>
                <Input
                  id="emailSettings.smtpUsername"
                  {...register('emailSettings.smtpUsername')}
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-3">
                <Label htmlFor="emailSettings.smtpPassword">SMTP Password</Label>
                <Input
                  id="emailSettings.smtpPassword"
                  type="password"
                  {...register('emailSettings.smtpPassword')}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h3>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <Label htmlFor="security.passwordMinLength">Minimum Password Length</Label>
                <Input
                  id="security.passwordMinLength"
                  type="number"
                  {...register('security.passwordMinLength', { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="security.sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="security.sessionTimeout"
                  type="number"
                  {...register('security.sessionTimeout', { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="security.maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="security.maxLoginAttempts"
                  type="number"
                  {...register('security.maxLoginAttempts', { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!isDirty}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}