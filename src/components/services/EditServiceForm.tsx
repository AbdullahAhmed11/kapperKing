import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, DollarSign, Tag, Info } from 'lucide-react';

interface ServiceFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    category: string;
    duration: number;
    price: number;
    description?: string;
  }) => Promise<boolean>;
  title?: string;
  initialData?: {
    name: string;
    category: string;
    duration: number;
    price: number;
    description?: string;
  };
}

export function EditServiceForm({
  open,
  onClose,
  onSubmit,
  title = 'Add New Service',
  initialData,
}: ServiceFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || '1', // Default to first category
    duration: initialData?.duration || 30, // Default 30 minutes
    price: initialData?.price || 0,
    description: initialData?.description || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock categories - replace with your actual categories from API
  const categories = [
    { id: '1', name: 'Haircut' },
    { id: '2', name: 'Coloring' },
    { id: '3', name: 'Styling' },
    { id: '4', name: 'Treatment' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'price' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await onSubmit(formData);
    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Service Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Men's Haircut"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-2" />
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Duration (minutes)
              </div>
            </Label>
            <Input
              id="duration"
              name="duration"
              type="number"
              min="15"
              step="15"
              value={formData.duration}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Price
              </div>
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            <div className="flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Description (Optional)
            </div>
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the service..."
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Service'}
          </Button>
        </div>
      </form>
    </div>
  );
}