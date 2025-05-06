import React, { useEffect } from 'react'; // Import useEffect
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Client, AddClientFormData } from '@/lib/store/clients'; // Import correct types
import { SubscriptionPlan } from '@/lib/store/subscriptionPlans'; // Import Plan type

// Schema matching AddClientFormData structure
const clientSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  companyName: z.string().optional(), // Use companyName
  firstSalonName: z.string().min(2, 'Initial salon name is required'), // Add first salon name
  subscriptionPlanId: z.string().nullable().refine(val => val !== null && val !== '', { // Make required, allow null initially for dropdown
    message: "Please select a subscription plan",
  }), 
  notes: z.string().optional(),
  marketingConsent: z.boolean().default(false)
});

// Use AddClientFormData for the form's data shape
type ClientFormSchemaData = AddClientFormData; 

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AddClientFormData) => Promise<void>; // Expect AddClientFormData
  initialData?: Client | null; // Use Client type for editing initial data
  title?: string;
  // availableSalons: Array<{ id: string; name: string }>; // Remove unused prop
  availablePlans: Array<SubscriptionPlan>; // Use SubscriptionPlan type
}

export function ClientForm({ 
  open, 
  onClose, 
  onSubmit, 
  initialData, 
  title = 'Add Client',
  // availableSalons, // Remove unused prop
  availablePlans 
}: ClientFormProps) {
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ClientFormSchemaData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      companyName: '',
      firstSalonName: '', // Add default
      subscriptionPlanId: null, // Default to null
      notes: '',
      marketingConsent: false,
    }
  });

  // Reset form when initialData changes (for editing)
  // Note: This form doesn't directly edit the 'firstSalonName' when editing a client
  // That would likely be handled in Salon Management.
  useEffect(() => {
    if (open) {
      if (initialData) {
        console.log("ClientForm: Resetting with initialData", initialData);
        reset({
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          email: initialData.email,
          phone: initialData.phone || '',
          companyName: initialData.companyName || '',
          subscriptionPlanId: initialData.subscriptionPlanId || null,
          notes: initialData.notes || '',
          marketingConsent: initialData.marketingConsent || false,
          firstSalonName: '', // Don't populate firstSalonName when editing client details
        });
      } else {
        // Reset for new client
        reset({
          firstName: '', lastName: '', email: '', phone: '', companyName: '',
          firstSalonName: '', subscriptionPlanId: null, notes: '', marketingConsent: false,
        });
      }
    }
  }, [initialData, open, reset]);


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4"> {/* Reduced spacing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...register('firstName')} className="mt-1" />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...register('lastName')} className="mt-1" />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} className="mt-1" />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" {...register('phone')} className="mt-1" />
          </div>

          <div>
            <Label htmlFor="companyName">Company Name</Label> {/* Changed to companyName */}
            <Input id="companyName" {...register('companyName')} className="mt-1" />
          </div>

          {/* Only show First Salon Name when ADDING a client */}
          {!initialData && (
             <div>
               <Label htmlFor="firstSalonName">First Salon Name</Label>
               <Input id="firstSalonName" {...register('firstSalonName')} className="mt-1" placeholder="e.g., Chic Cuts Downtown" />
               {errors.firstSalonName && <p className="mt-1 text-sm text-red-600">{errors.firstSalonName.message}</p>}
             </div>
          )}


          {/* Removed Managed Salons checklist */}

          <div>
            <Label htmlFor="subscriptionPlanId">Subscription Plan</Label> {/* Changed to subscriptionPlanId */}
            <select
              id="subscriptionPlanId"
              {...register('subscriptionPlanId')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            >
              <option value="">Select a plan</option>
              {availablePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} (€{plan.priceAnnual}/yr) {/* Show price hint */}
                </option>
              ))}
            </select>
             {errors.subscriptionPlanId && <p className="mt-1 text-sm text-red-600">{errors.subscriptionPlanId.message}</p>}
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              {...register('notes')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>

          <div className="flex items-center">
            <input
              id="marketingConsent"
              type="checkbox"
              {...register('marketingConsent')}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="marketingConsent" className="ml-2">
              Consent to receive marketing communications
            </Label>
          </div>

          <div className="flex justify-end space-x-3 pt-4"> {/* Added padding top */}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}