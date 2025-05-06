import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';

const saleSchema = z.object({
  paymentMethod: z.enum(['cash', 'card', 'other']),
  amountPaid: z.number().min(0, 'Amount must be 0 or greater'),
  notes: z.string().optional()
});

type SaleFormData = z.infer<typeof saleSchema>;

interface SaleFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  cart: Array<{ product: any; quantity: number }>;
  total: number;
}

export function SaleForm({ open, onClose, onSubmit, cart, total }: SaleFormProps) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      paymentMethod: 'cash',
      amountPaid: total
    }
  });

  const amountPaid = watch('amountPaid');
  const change = amountPaid - total;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Sale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <select
              id="paymentMethod"
              {...register('paymentMethod')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <Label htmlFor="amountPaid">Amount Paid</Label>
            <Input
              id="amountPaid"
              type="number"
              step="0.01"
              {...register('amountPaid', { valueAsNumber: true })}
              className="mt-1"
            />
            {errors.amountPaid && (
              <p className="mt-1 text-sm text-red-600">{errors.amountPaid.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              {...register('notes')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-500">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-500">Tax (21%)</span>
                <span className="text-gray-900">{formatCurrency(total * 0.21)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-2">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{formatCurrency(total * 1.21)}</span>
              </div>
              {change > 0 && (
                <div className="flex justify-between text-sm font-semibold text-green-600">
                  <span>Change</span>
                  <span>{formatCurrency(change)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Complete Sale'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}