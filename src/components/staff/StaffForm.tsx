import React, { useEffect } from 'react'; // Import useEffect
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'; // Import DialogDescription
import { useServiceStore, Service } from '@/lib/store/services'; // Import service store

const staffSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'stylist', 'assistant']),
  services: z.array(z.string()).min(1, 'Select at least one service'),
});

type StaffFormData = z.infer<typeof staffSchema>;

interface StaffFormProps {
  salonId: string; // Add salonId prop
  open: boolean;
  onClose: () => void;
  onSubmit: (data: StaffFormData) => void;
  initialData?: Partial<StaffFormData>;
  title?: string;
}

export function StaffForm({ salonId, open, onClose, onSubmit, initialData, title = 'Add Staff Member' }: StaffFormProps) { // Add salonId
  const { services, fetchServices } = useServiceStore(); // Get services and fetch action
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<StaffFormData>({ // Add reset
    resolver: zodResolver(staffSchema),
    // Ensure defaultValues handles services array correctly
    defaultValues: {
      ...initialData,
      services: initialData?.services || []
    },
  });

  // Fetch services when the form mounts or salonId changes
  useEffect(() => {
    if (salonId) {
      fetchServices(salonId);
    }
  }, [salonId, fetchServices]);

  // Reset form when initialData changes (e.g., switching between edit/add)
  useEffect(() => {
     reset({ ...initialData, services: initialData?.services || [] });
  }, [initialData, reset]);

  // Remove hardcoded services

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Enter the details for the staff member.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                className="mt-1"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                className="mt-1"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className="mt-1"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              {...register('role')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select a role</option>
              <option value="admin">Admin</option>
              <option value="stylist">Stylist</option>
              <option value="assistant">Assistant</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          <div>
            <Label>Services</Label>
            <div className="mt-2 space-y-2">
              {/* Use fetched services */}
              {services.length === 0 && <p className="text-sm text-gray-500">No services found for this salon.</p>}
              {services.map((service: Service) => ( // Add Service type
                <label key={service.id} className="flex items-center">
                  <input
                    type="checkbox"
                    value={service.id}
                    {...register('services')}
                    // Check if this service ID is included in the form's current 'services' array value
                    defaultChecked={initialData?.services?.includes(service.id)}
                    className="rounded border-gray-300 text-primary focus:ring-primary" // Use theme color
                  />
                  <span className="ml-2 text-sm text-gray-700">{service.name}</span>
                </label>
              ))}
            </div>
            {errors.services && (
              <p className="mt-1 text-sm text-red-600">{errors.services.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Staff Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}