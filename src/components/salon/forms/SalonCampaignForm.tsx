import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Campaign, CampaignFormData } from '@/lib/store/campaigns'; // Import types from campaign store
import { useClientStore, Client } from '@/lib/store/clients'; // Import client store for targeting
import { Loader2 } from 'lucide-react'; // Import Loader2

// Schema for the form data
const campaignSchema = z.object({
  name: z.string().min(2, 'Campaign name is required'),
  subject: z.string().min(5, 'Subject is required'),
  content: z.string().min(10, 'Email content cannot be empty'),
  target_type: z.enum(['all_clients', 'specific_clients']), // Simplified options for now
  selectedClientIds: z.array(z.string()).optional(), 
}).refine(data => data.target_type !== 'specific_clients' || (data.selectedClientIds && data.selectedClientIds.length > 0), {
  message: "Please select at least one client for targeted campaigns.",
  path: ["selectedClientIds"], 
});

// Type for the form data (matches schema)
type SalonCampaignFormSchemaData = z.infer<typeof campaignSchema>;

interface SalonCampaignFormProps {
  salonId: string; // Need salonId to fetch clients
  open: boolean;
  onClose: () => void;
  // onSubmit expects the type defined in the store
  onSubmit: (data: CampaignFormData) => Promise<void>; 
  initialData?: Campaign | null; 
}

export function SalonCampaignForm({ salonId, open, onClose, onSubmit, initialData }: SalonCampaignFormProps) {
  // Fetch clients for this specific salon
  const { clients, fetchClients, loading: clientsLoading } = useClientStore(); 
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } = useForm<SalonCampaignFormSchemaData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '', subject: '', content: '',
      target_type: 'all_clients',
      selectedClientIds: [],
    }
  });

  // Fetch clients when the form mounts or salonId changes
  useEffect(() => {
     if (salonId && open) { // Fetch only when dialog is open and salonId is available
        fetchClients(salonId);
     }
  }, [salonId, open, fetchClients]);

  // Watch the targetType field
  const targetType = watch('target_type');

  // Reset form when initialData changes or dialog opens/closes
  useEffect(() => {
    if (open) {
       if (initialData) {
         // Ensure target_type from initialData is valid for the form schema
         const formTargetType = (initialData.target_type === 'all_clients' || initialData.target_type === 'specific_clients')
                               ? initialData.target_type
                               : 'all_clients'; // Default if invalid
         reset({
           name: initialData.name,
           subject: initialData.subject || '',
           content: initialData.content,
           target_type: formTargetType,
           // TODO: Need logic to map DB targeting criteria back to selectedClientIds if editing 'specific_clients'
           selectedClientIds: [], // Reset selection on edit for now
         });
       } else {
         reset({ name: '', subject: '', content: '', target_type: 'all_clients', selectedClientIds: [] });
       }
    }
  }, [initialData, open, reset]);

  // Handle form submission
  const handleFormSubmit = async (formData: SalonCampaignFormSchemaData) => {
    // Map form data to the CampaignFormData expected by the store action
    const storePayload: CampaignFormData = {
       ...formData,
       // manualRecipientList: formData.target_type === 'manual_list' ? formData.manualRecipientList : undefined, // Add if manual list is implemented
    };
    await onSubmit(storePayload); 
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]"> 
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the details for this campaign.' : 'Enter the details for your new email campaign.'}
          </DialogDescription>
        </DialogHeader>
        <form id="salonCampaignForm" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2"> 
          <div>
            <Label htmlFor="campaign-name">Campaign Name</Label>
            <Input id="campaign-name" {...register('name')} className="mt-1" />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="campaign-subject">Email Subject</Label>
            <Input id="campaign-subject" {...register('subject')} className="mt-1" />
            {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>}
          </div>
          
          {/* Targeting Options */}
          <div className="space-y-2">
             <Label className="block text-sm font-medium text-gray-700">Target Audience</Label>
             <div className="flex items-center space-x-4">
               <label className="flex items-center">
                 <input type="radio" value="all_clients" {...register('target_type')} className="focus:ring-primary h-4 w-4 text-primary border-gray-300"/>
                 <span className="ml-2 text-sm text-gray-700">All Clients ({clients.length})</span>
               </label>
               <label className="flex items-center">
                 <input type="radio" value="specific_clients" {...register('target_type')} className="focus:ring-primary h-4 w-4 text-primary border-gray-300"/>
                 <span className="ml-2 text-sm text-gray-700">Specific Clients</span>
               </label>
               {/* Add Manual List option later if needed */}
             </div>
          </div>

          {/* Client Selection (conditional) */}
          {targetType === 'specific_clients' && (
            <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
               <Label className="block text-sm font-medium text-gray-700 mb-2">Select Clients</Label>
               {clientsLoading && <p className="text-sm text-gray-500">Loading clients...</p>}
               {!clientsLoading && clients.length === 0 && <p className="text-sm text-gray-500">No clients available for this salon.</p>}
               {!clientsLoading && clients.map((client: Client) => ( // Use Client type
                 <div key={client.id} className="flex items-center space-x-2"> 
                    <input
                      type="checkbox" 
                      id={`client-${client.id}`}
                      value={client.id}
                      {...register('selectedClientIds')}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
                    />
                    <Label htmlFor={`client-${client.id}`} className="text-sm font-normal">
                      {client.firstName} {client.lastName} ({client.email})
                    </Label>
                 </div>
               ))}
               {errors.selectedClientIds && <p className="mt-1 text-sm text-red-600">{errors.selectedClientIds.message}</p>}
            </div>
          )}

          <div>
            <Label htmlFor="campaign-content">Email Content (HTML or Markdown)</Label>
            <Textarea
              id="campaign-content"
              {...register('content')}
              rows={10}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm font-mono"
              placeholder="Enter your email body here..."
            />
            {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}> Cancel </Button>
          <Button type="submit" form="salonCampaignForm" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            {initialData ? 'Save Changes' : 'Create Campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}