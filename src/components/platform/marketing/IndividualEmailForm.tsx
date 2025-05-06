import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

// Schema for the individual email form
const emailSchema = z.object({
  subject: z.string().min(3, 'Subject is required'),
  body: z.string().min(10, 'Email body cannot be empty'),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface IndividualEmailFormProps {
  open: boolean;
  onClose: () => void;
  recipientEmail: string | null; // Email of the subscriber to send to
  // Placeholder for the actual send function
  onSend: (recipient: string, subject: string, body: string) => Promise<boolean>; 
}

export function IndividualEmailForm({ open, onClose, recipientEmail, onSend }: IndividualEmailFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { subject: '', body: '' }
  });

  // Reset form when dialog opens or recipient changes
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
    const success = await onSend(recipientEmail, data.subject, data.body);
    if (success) {
      onClose(); // Close dialog on successful send
    } 
    // Feedback (success/error) should be handled by the onSend function
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Individual Email</DialogTitle>
          <DialogDescription>
            Compose and send an email to {recipientEmail || '...'}.
          </DialogDescription>
        </DialogHeader>
        <form id="individualEmailForm" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" {...register('subject')} className="mt-1" />
            {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>}
          </div>
          <div>
            <Label htmlFor="body">Body (HTML or Markdown)</Label>
            <textarea
              id="body"
              {...register('body')}
              rows={12}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm font-mono"
              placeholder="Enter your email body here..."
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