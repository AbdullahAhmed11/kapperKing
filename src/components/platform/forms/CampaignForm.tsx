import React, { useEffect, useState } from 'react'; // Import useState
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Campaign, CampaignFormData } from '@/lib/store/campaigns'; // Import types
import { useSubscriberStore, selectAllSubscribers, Subscriber } from '@/lib/store/subscribers'; // Import subscriber store
// import { Checkbox } from '@/components/ui/checkbox'; // No Checkbox component found
import axios from 'axios';
// Schema for the form data, including targeting
const campaignSchema = z.object({
  name: z.string().min(2, 'Campaign name is required'),
  subject: z.string().min(5, 'Subject is required'),
  content: z.string().min(10, 'Email content cannot be empty'),
  targetType: z.enum(['all', 'selected']),
  selectedSubscriberIds: z.array(z.string()).optional(), // Array of IDs, optional
}).refine(data => data.targetType !== 'selected' || (data.selectedSubscriberIds && data.selectedSubscriberIds.length > 0), {
  message: "Please select at least one subscriber for targeted campaigns.",
  path: ["selectedSubscriberIds"], // Path of error
});

// Type for the form data (matches schema)
type CampaignFormSchemaData = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CampaignFormData) => Promise<void>; // Expects type from store action
  initialData?: Campaign | null; 
}

export function CampaignForm({ open, onClose, onSubmit, initialData }: CampaignFormProps) {
  const allSubscribers = useSubscriberStore(selectAllSubscribers); // Get all subscribers for selection
    const [allsubscribers, setAllSubscripers] = useState<any[]>([]); // Local state for subscribers
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } = useForm<CampaignFormSchemaData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      subject: '',
      content: '',
      targetType: 'all',
      selectedSubscriberIds: [],
    }
  });

  // Watch the targetType field to conditionally show subscriber selection
  const targetType = watch('targetType');

  // Reset form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      console.log("CampaignForm: Resetting with initialData", initialData);
      reset({
        name: initialData.name,
        subject: initialData.subject,
        content: initialData.content,
        targetType: initialData.targetType || 'all', 
        selectedSubscriberIds: initialData.selectedSubscriberIds || [],
      });
    } else {
      // Reset to defaults when opening for 'new'
      reset({ name: '', subject: '', content: '', targetType: 'all', selectedSubscriberIds: [] });
    }
  }, [initialData, reset]);

  // Handle form submission - data here matches CampaignFormSchemaData
  const handleFormSubmit = async (formData: CampaignFormSchemaData) => {
    // The onSubmit prop expects CampaignFormData (which matches schema now)
    await onSubmit(formData); 
  };
  const getAllSubscribers = async () => {
    try { 
      const res = await axios.get('https://kapperking.runasp.net/api/SuperAdmin/GetSubscribers');
      const data = res.data || [];
      console.log('Fetched subscribers:', data); // Debugging line
      setAllSubscripers(data);
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
    }
  };

  useEffect(() => { 
    getAllSubscribers();
  }, []);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]"> {/* Wider modal */}
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the details for this campaign.' : 'Enter the details for your new email campaign.'}
          </DialogDescription>
        </DialogHeader>
        <form id="campaignForm" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2"> {/* Scrollable content */}
          <div>
            <Label htmlFor="name">Campaign Name</Label>
            <Input id="name" {...register('name')} className="mt-1" />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="subject">Email Subject</Label>
            <Input id="subject" {...register('subject')} className="mt-1" />
            {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>}
          </div>
          
          {/* Targeting Options */}
          <div className="space-y-2">
             <Label className="block text-sm font-medium text-gray-700">Target Audience</Label>
             <div className="flex items-center space-x-4">
               <label className="flex items-center">
                 <input
                   type="radio"
                   value="all"
                   {...register('targetType')}
                   className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                 />
                 <span className="ml-2 text-sm text-gray-700">All Subscribers ({allsubscribers.length})</span>
               </label>
               <label className="flex items-center">
                 <input
                   type="radio"
                   value="selected"
                   {...register('targetType')}
                   className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                 />
                 <span className="ml-2 text-sm text-gray-700">Selected Subscribers</span>
               </label>
             </div>
          </div>

          {/* Subscriber Selection (conditional) */}
          {targetType === 'selected' && (
            <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
               <Label className="block text-sm font-medium text-gray-700 mb-2">Select Subscribers</Label>
               {allsubscribers.length === 0 && <p className="text-sm text-gray-500">No subscribers available.</p>}
               {allsubscribers.map(sub => (
                 <div key={sub.id} className="flex items-center space-x-2"> {/* Added space */}
                    <input
                      type="checkbox" // Use standard HTML checkbox
                      id={`sub-${sub.id}`}
                      value={sub.id}
                      {...register('selectedSubscriberIds')}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" // Basic styling
                    />
                    <Label htmlFor={`sub-${sub.id}`} className="text-sm font-normal">
                      {sub.email} {sub.name ? `(${sub.name})` : ''}
                    </Label>
                 </div>
               ))}
               {errors.selectedSubscriberIds && <p className="mt-1 text-sm text-red-600">{errors.selectedSubscriberIds.message}</p>}
            </div>
          )}

          <div>
            <Label htmlFor="content">Email Content (HTML or Markdown)</Label>
            <textarea
              id="content"
              {...register('content')}
              rows={10}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm font-mono"
              placeholder="Enter your email body here..."
            />
            {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="campaignForm" disabled={isSubmitting}>
            {isSubmitting ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Campaign')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}