import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useProductStore, Product } from '@/lib/store/products';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Schema for product form validation
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  image_url: z.string().url().or(z.literal('')).optional(), // Optional URL
  stock: z.number().int().optional().nullable(), // Optional integer or null
  active: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  salonId: string;
  productData?: Product | null; // Existing product data for editing
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ salonId, productData, onSuccess, onCancel }: ProductFormProps) {
  const { createProduct, updateProduct, loading } = useProductStore();
  const isEditing = !!productData;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: productData?.name || '',
      description: productData?.description || '',
      price: productData?.price || 0,
      image_url: productData?.image_url || '',
      stock: productData?.stock ?? null, // Handle null for optional number
      active: productData?.active ?? true, // Default to active for new products
    }
  });

  // Reset form if productData changes (e.g., opening dialog for different product)
  useEffect(() => {
    reset({
      name: productData?.name || '',
      description: productData?.description || '',
      price: productData?.price || 0,
      image_url: productData?.image_url || '',
      stock: productData?.stock ?? null,
      active: productData?.active ?? true,
    });
  }, [productData, reset]);

  const onSubmit = async (data: ProductFormData) => {
    let success = false;
    const payload = {
      ...data,
      salon_id: salonId, // Add salon_id
    };

    if (isEditing && productData) {
      // Ensure stock is number or undefined, not null, for updateProduct
      const updatePayload = {
        ...payload,
        stock: payload.stock === null ? undefined : payload.stock,
      };
      console.log("Updating product:", productData.id, updatePayload);
      success = await updateProduct(productData.id, updatePayload);
    } else {
      console.log("Creating product:", payload);
      // Omit fields not needed for creation if necessary by backend/DB schema
      const createPayload = { ...payload, active: data.active ?? true }; 
      success = await createProduct(createPayload as any); // Cast needed if type mismatch
    }

    if (success) {
      onSuccess?.(); // Close dialog on success
    }
    // Error toasts handled in store actions
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" {...register('name')} className="mt-1" />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} rows={3} className="mt-1" />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (€)</Label>
          <Input id="price" type="number" step="0.01" {...register('price', { valueAsNumber: true })} className="mt-1" />
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
        </div>
         <div>
           <Label htmlFor="stock">Stock Quantity (Optional)</Label>
           <Input id="stock" type="number" {...register('stock', { setValueAs: (v) => v === '' ? null : parseInt(v, 10) })} className="mt-1" placeholder="Leave blank if not tracked"/>
           {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>}
         </div>
      </div>

      <div>
        <Label htmlFor="image_url">Image URL (Optional)</Label>
        <Input id="image_url" type="url" {...register('image_url')} className="mt-1" placeholder="https://..." />
        {errors.image_url && <p className="mt-1 text-sm text-red-600">{errors.image_url.message}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="active" {...register('active')} defaultChecked={productData?.active ?? true} />
        <Label htmlFor="active" className="text-sm font-normal">
          Product is active (available for sale)
        </Label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isEditing ? 'Save Changes' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}