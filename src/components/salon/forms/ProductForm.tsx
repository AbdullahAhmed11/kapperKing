import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  quantity: z.number().int().optional().nullable(),
  active: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  salonId: string;
  productData?: any | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ salonId, productData, onSuccess, onCancel }: ProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const isEditing = !!productData;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: productData?.name || '',
      description: productData?.description || '',
      price: productData?.price || 0,
      quantity: productData?.stock ?? null,
      active: productData?.active ?? true,
    }
  });

  useEffect(() => {
    reset({
      name: productData?.name || '',
      description: productData?.description || '',
      price: productData?.price || 0,
      quantity: productData?.stock ?? null,
      active: productData?.active ?? true,
    });
  }, [productData, reset]);

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      
      // Common fields for both create and update
      formData.append('Name', data.name);
      formData.append('Description', data.description || '');
      formData.append('Price', data.price.toString());
      formData.append('Quantity', data.quantity?.toString() || '0');
      formData.append('IsAvailable', data.active.toString());
      formData.append('SalonId',  '1');
      
      // Append image file if selected
      if (fileInputRef.current?.files?.[0]) {
        formData.append('Image', fileInputRef.current.files[0]);
      }

      // For editing, add product ID and use EditProduct endpoint
      if (isEditing && productData?.id) {
        formData.append('Id', productData.id.toString());
      }

      const endpoint = isEditing && productData?.id 
        ? 'https://kapperking.runasp.net/api/Products/EditProduct'
        : 'https://kapperking.runasp.net/api/Products/AddProduct';

      const method = isEditing ? 'POST' : 'POST'; // Assuming both use POST

      const response = await fetch(endpoint, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} product`);
      }

      toast.success(`Product ${isEditing ? 'updated' : 'created'} successfully`);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting product:', error);
      toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} product`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Form fields remain the same as previous implementation */}
      <div>
        <Label htmlFor="name">Product Name *</Label>
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
          <Label htmlFor="price">Price *</Label>
          <Input 
            id="price" 
            type="number" 
            step="0.01" 
            {...register('price', { valueAsNumber: true })} 
            className="mt-1" 
          />
          {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
        </div>
        <div>
          <Label htmlFor="quantity">Stock Quantity</Label>
          <Input 
            id="quantity" 
            type="number" 
            {...register('quantity', { 
              setValueAs: (v) => v === '' ? null : parseInt(v, 10) 
            })} 
            className="mt-1" 
            placeholder="Leave blank if not tracked"
          />
          {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="image">Product Image</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="mt-1"
        />
        {isEditing && productData?.imagePath && (
          <p className="mt-1 text-sm text-gray-500">
            Current image: {productData.imagePath}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="active" 
          {...register('active')} 
          defaultChecked={productData?.active ?? true} 
        />
        <Label htmlFor="active" className="text-sm font-normal">
          Product is active (available for sale)
        </Label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isEditing ? 'Save Changes' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}