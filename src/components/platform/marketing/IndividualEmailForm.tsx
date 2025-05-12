import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

const emailSchema = z.object({
  subject: z.string().min(3, 'Subject is required'),
  body: z.string().min(10, 'Email body cannot be empty'),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface IndividualEmailFormProps {
  open: boolean;
  onClose: () => void;
  recipientEmail: string | null;
}

export function IndividualEmailForm({ open, onClose, recipientEmail }: IndividualEmailFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { subject: '', body: '' }
  });

  useEffect(() => {
    if (open) {
      reset({ subject: '', body: '' });
    }
  }, [open, recipientEmail, reset]);

  const handleFormSubmit = async (data: EmailFormData) => {
    if (!recipientEmail) {
      toast.error("No recipient selected.");
      return;
    }

    try {
      const response = await fetch('https://kapperking.runasp.net/api/SuperAdmin/SendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust if you use different auth
        },
        body: JSON.stringify({
          id: 8, // Set to fixed value 8 as requested
          subject: data.subject,
          body: data.body,
          isHtml: true,
          to: recipientEmail // Ensure this matches your API expectations
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email');
      }

      toast.success('Email sent successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send email');
      console.error('Error sending email:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Individual Email</DialogTitle>
          <DialogDescription>
            Compose and send an email to {recipientEmail || '...'}
          </DialogDescription>
        </DialogHeader>
        <form id="individualEmailForm" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" {...register('subject')} className="mt-1" />
            {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>}
          </div>
          <div>
            <Label htmlFor="body">Body (HTML)</Label>
            <textarea
              id="body"
              {...register('body')}
              rows={12}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm font-mono"
              placeholder="Enter your email body here (HTML supported)..."
            />
            {errors.body && <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>}
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="individualEmailForm" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Email'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}