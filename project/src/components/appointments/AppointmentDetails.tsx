import React from 'react';
import { format } from 'date-fns';
import { Clock, Calendar, User, Scissors, DollarSign, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  client: {
    first_name: string;
    last_name: string;
  };
  service: {
    name: string;
    duration: number;
    price: number;
  };
  staff: {
    first_name: string;
    last_name: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

interface AppointmentDetailsProps {
  appointment: Appointment | null;
  onClose: () => void;
  onCancel?: (id: string) => void;
  onConfirm?: (id: string) => void;
  onComplete?: (id: string) => void;
}

export function AppointmentDetails({ 
  appointment, 
  onClose,
  onCancel,
  onConfirm,
  onComplete
}: AppointmentDetailsProps) {
  if (!appointment) return null;

  const handleCancel = async () => {
    try {
      await onCancel?.(appointment.id);
      toast.success('Appointment cancelled successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  const handleConfirm = async () => {
    try {
      await onConfirm?.(appointment.id);
      toast.success('Appointment confirmed successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to confirm appointment');
    }
  };

  const handleComplete = async () => {
    try {
      await onComplete?.(appointment.id);
      toast.success('Appointment marked as completed');
      onClose();
    } catch (error) {
      toast.error('Failed to complete appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <Dialog open={!!appointment} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-between items-center">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Time and Date */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {format(new Date(appointment.startTime), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-sm text-gray-500">
                  {format(new Date(appointment.startTime), 'h:mm a')} - {format(new Date(appointment.endTime), 'h:mm a')}
                </p>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-500">Client</h3>
            <div className="mt-2 flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {appointment.client.first_name} {appointment.client.last_name}
                </p>
              </div>
            </div>
          </div>

          {/* Service Info */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-500">Service Details</h3>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Scissors className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-900">{appointment.service.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-900">{appointment.service.duration} min</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-900">with {appointment.staff.first_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-900">€{appointment.service.price}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-500">Notes</h3>
              <p className="mt-2 text-sm text-gray-900">{appointment.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t border-gray-200 pt-4 flex justify-end space-x-3">
            {appointment.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="text-red-600 hover:text-red-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Confirm
                </Button>
              </>
            )}
            {appointment.status === 'confirmed' && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="text-red-600 hover:text-red-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleComplete}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Complete
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}