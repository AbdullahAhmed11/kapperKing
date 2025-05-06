import React, { useEffect } from 'react';
import { useForm, Controller, ControllerRenderProps, FieldValues } from 'react-hook-form'; // Import Controller and types
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select
import { useLoyaltyStore, LoyaltyReward } from '@/lib/store/loyalty';
import { useServiceStore, Service } from '@/lib/store/services'; // For service selection
import { useProductStore, Product } from '@/lib/store/products'; // For product selection
import { Loader2 } from 'lucide-react';
import { useCurrentSalonStore } from '@/lib/store/currentSalon';

// Schema for reward form validation
const rewardSchema = z.object({
  name: z.string().min(1, 'Reward name is required'),
  description: z.string().optional(),
  points_cost: z.number().int().positive('Points cost must be positive'),
  reward_type: z.enum(['discount', 'free_service', 'product']),
  reward_value: z.number().optional().nullable(), // For discount amount/percentage
  required_service_id: z.string().optional().nullable(),
  required_product_id: z.string().optional().nullable(),
  is_active: z.boolean(),
}).refine(data => {
   // Require value if type is discount
   if (data.reward_type === 'discount' && (data.reward_value === null || data.reward_value === undefined)) return false;
   // Require service if type is free_service
   if (data.reward_type === 'free_service' && !data.required_service_id) return false;
   // Require product if type is product
   if (data.reward_type === 'product' && !data.required_product_id) return false;
   return true;
}, {
   message: "Please provide the required value/item for the selected reward type.",
   // Path can be refined based on which field is missing
   path: ["reward_value"], 
});


type RewardFormData = z.infer<typeof rewardSchema>;

interface RewardFormProps {
  salonId: string;
  rewardData?: LoyaltyReward | null; // Existing reward data for editing
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RewardForm({ salonId, rewardData, onSuccess, onCancel }: RewardFormProps) {
  const { addReward, updateReward, loadingRewards } = useLoyaltyStore();
  const { services, fetchServices } = useServiceStore();
  const { products, fetchProducts } = useProductStore();
  const isEditing = !!rewardData;

  const { register, handleSubmit, formState: { errors }, reset, watch, control } = useForm<RewardFormData>({ // Added watch, control
    resolver: zodResolver(rewardSchema),
    defaultValues: {
      name: rewardData?.name || '',
      description: rewardData?.description || '',
      points_cost: rewardData?.points_cost || 0,
      reward_type: rewardData?.reward_type || 'discount',
      reward_value: rewardData?.reward_value ?? null,
      required_service_id: rewardData?.required_service_id || null,
      required_product_id: rewardData?.required_product_id || null,
      is_active: rewardData?.is_active ?? true,
    }
  });

  const rewardType = watch('reward_type'); // Watch the reward type field

  // Fetch services and products if needed for dropdowns
  useEffect(() => {
    if (salonId) {
      fetchServices(salonId);
      fetchProducts(salonId);
    }
  }, [salonId, fetchServices, fetchProducts]);

  // Reset form when initialData changes
  useEffect(() => {
    reset({
      name: rewardData?.name || '',
      description: rewardData?.description || '',
      points_cost: rewardData?.points_cost || 0,
      reward_type: rewardData?.reward_type || 'discount',
      reward_value: rewardData?.reward_value ?? null,
      required_service_id: rewardData?.required_service_id || null,
      required_product_id: rewardData?.required_product_id || null,
      is_active: rewardData?.is_active ?? true,
    });
  }, [rewardData, reset]);

  const onSubmit = async (data: RewardFormData) => {
    let success = false;
    // Clear irrelevant fields based on type before submitting
    // Convert nulls to undefined and ensure correct types for store actions
    const payload = {
      ...data,
      salon_id: salonId,
      reward_value: data.reward_type === 'discount' ? (data.reward_value === null ? undefined : data.reward_value) : undefined,
      required_service_id: data.reward_type === 'free_service' ? (data.required_service_id === null ? undefined : data.required_service_id) : undefined,
      required_product_id: data.reward_type === 'product' ? (data.required_product_id === null ? undefined : data.required_product_id) : undefined,
      // Ensure reward_type is correctly typed if needed by backend/store actions
      reward_type: data.reward_type as 'discount' | 'free_service' | 'product',
    };

    if (isEditing && rewardData) {
      success = await updateReward(rewardData.id, payload);
    } else {
      success = await addReward(payload);
    }

    if (success) {
      onSuccess?.(); // Close dialog on success
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Reward Name</Label>
        <Input id="name" {...register('name')} className="mt-1" />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="points_cost">Points Cost</Label>
        <Input id="points_cost" type="number" {...register('points_cost', { valueAsNumber: true })} className="mt-1" />
        {errors.points_cost && <p className="mt-1 text-sm text-red-600">{errors.points_cost.message}</p>}
      </div>

      <div>
        <Label htmlFor="reward_type">Reward Type</Label>
        {/* Use Controller for Shadcn Select */}
        <Controller
           name="reward_type"
           control={control}
           render={({ field }: { field: ControllerRenderProps<RewardFormData, 'reward_type'> }) => ( // Add type to field
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                 <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select reward type" />
                 </SelectTrigger>
                 <SelectContent>
                    <SelectItem value="discount">Discount (€ or %)</SelectItem>
                    <SelectItem value="free_service">Free Service</SelectItem>
                    <SelectItem value="product">Free Product</SelectItem>
                 </SelectContent>
              </Select>
           )}
        />
         {errors.reward_type && <p className="mt-1 text-sm text-red-600">{errors.reward_type.message}</p>}
      </div>

      {/* Conditional Fields based on Reward Type */}
      {rewardType === 'discount' && (
         <div>
           <Label htmlFor="reward_value">Discount Value (€ or %)</Label>
           <Input id="reward_value" type="number" step="0.01" {...register('reward_value', { setValueAs: v => v === '' ? null : parseFloat(v) })} className="mt-1" />
           {errors.reward_value && <p className="mt-1 text-sm text-red-600">{errors.reward_value.message}</p>}
         </div>
      )}

      {rewardType === 'free_service' && (
         <div>
           <Label htmlFor="required_service_id">Select Service</Label>
           <select id="required_service_id" {...register('required_service_id')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-10">
              <option value="">Select a service</option>
              {services.map((service) => ( <option key={service.id} value={service.id}> {service.name} </option> ))}
           </select>
           {errors.required_service_id && <p className="mt-1 text-sm text-red-600">{errors.required_service_id.message}</p>}
         </div>
      )}

       {rewardType === 'product' && (
         <div>
           <Label htmlFor="required_product_id">Select Product</Label>
           <select id="required_product_id" {...register('required_product_id')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm h-10">
              <option value="">Select a product</option>
              {products.map((product) => ( <option key={product.id} value={product.id}> {product.name} </option> ))}
           </select>
           {errors.required_product_id && <p className="mt-1 text-sm text-red-600">{errors.required_product_id.message}</p>}
         </div>
      )}


      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea id="description" {...register('description')} rows={3} className="mt-1" />
      </div>

       <div className="flex items-center space-x-2">
         <Checkbox id="is_active" {...register('is_active')} defaultChecked={rewardData?.is_active ?? true} />
         <Label htmlFor="is_active" className="text-sm font-normal">
           Reward is active and redeemable
         </Label>
       </div>


      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loadingRewards}>
          Cancel
        </Button>
        <Button type="submit" disabled={loadingRewards}>
          {loadingRewards ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isEditing ? 'Save Changes' : 'Create Reward'}
        </Button>
      </div>
    </form>
  );
}