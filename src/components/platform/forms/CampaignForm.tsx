import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Campaign, CampaignFormData } from '@/lib/store/campaigns';
import { Edit, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

// Schema for the form data, including targeting
const campaignSchema = z.object({
  name: z.string().min(2, 'Campaign name is required'),
  subject: z.string().min(5, 'Subject is required'),
  content: z.string().min(10, 'Email content cannot be empty'),
  targetType: z.enum(['all', 'selected']),
  selectedSubscriberIds: z.array(z.string()).optional(),
}).refine(data => data.targetType !== 'selected' || (data.selectedSubscriberIds && data.selectedSubscriberIds.length > 0), {
  message: "Please select at least one subscriber for targeted campaigns.",
  path: ["selectedSubscriberIds"],
});

// Type for the form data (matches schema)
type CampaignFormSchemaData = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CampaignFormData) => Promise<void>;
  initialData?: Campaign | null;
  onEditSuccess?: () => void; // Callback after successful edit
}

const API_BASE_URL = 'https://kapperking.runasp.net/api/SuperAdmin';

export function CampaignForm({ open, onClose, onSubmit, initialData, onEditSuccess }: CampaignFormProps) {
  const [allsubscribers, setAllSubscribers] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  
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
      reset({
        name: initialData.name,
        subject: initialData.subject,
        content: initialData.content,
        targetType: initialData.targetType || 'all',
        selectedSubscriberIds: initialData.selectedSubscriberIds || [],
      });
    } else {
      reset({ name: '', subject: '', content: '', targetType: 'all', selectedSubscriberIds: [] });
    }
  }, [initialData, reset, open]);

  // Handle form submission
  const handleFormSubmit = async (formData: CampaignFormSchemaData) => {
    if (initialData) {
      // Edit existing campaign
      await handleEditCampaign(formData);
    } else {
      // Create new campaign
      await onSubmit(formData);
    }
  };

  // Edit campaign function
  const handleEditCampaign = async (formData: CampaignFormSchemaData) => {
    setIsEditing(true);
    try {
      // Prepare data for the API
      const editData = {
        id: parseInt(initialData?.id || '0'),
        name: formData.name,
        body: formData.content,
        email: formData.subject, // Using subject as email field
        isHtml: true
      };

      const response = await axios.post(
        `${API_BASE_URL}/EditCampaign`,
        editData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        toast.success('Campaign updated successfully');
        onClose();
        if (onEditSuccess) onEditSuccess();
      }
    } catch (error: any) {
      console.error('Error editing campaign:', error);
      toast.error(error.response?.data?.message || 'Failed to update campaign');
    } finally {
      setIsEditing(false);
    }
  };

  const getAllSubscribers = async () => {
    try { 
      const res = await axios.get(`${API_BASE_URL}/GetSubscribers`);
      const data = res.data || [];
      setAllSubscribers(data);
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
      toast.error('Failed to load subscribers');
    }
  };

  useEffect(() => { 
    if (open) {
      getAllSubscribers();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {initialData ? (
              <>
                <Edit className="h-5 w-5" />
                Edit Campaign
              </>
            ) : (
              'Create New Campaign'
            )}
          </DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the details for this campaign.' : 'Enter the details for your new email campaign.'}
          </DialogDescription>
        </DialogHeader>
        <form id="campaignForm" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
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
                 <div key={sub.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`sub-${sub.id}`}
                      value={sub.id}
                      {...register('selectedSubscriberIds')}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
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
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isEditing}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="campaignForm" 
            disabled={isSubmitting || isEditing}
            className="flex items-center gap-2"
          >
            {(isSubmitting || isEditing) ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {initialData ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                {initialData ? (
                  <>
                    <Edit className="h-4 w-4" />
                    Update Campaign
                  </>
                ) : (
                  'Create Campaign'
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}