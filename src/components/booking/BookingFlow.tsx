import React, { useState, useEffect } from 'react';
import { useBookingStore } from '@/lib/store/booking';
import { ServiceSelection } from './ServiceSelection';
import { StaffSelection } from './StaffSelection';
import { TimeSelection } from './TimeSelection';
import { BookingConfirmation } from './BookingConfirmation';

interface BookingFlowProps {
  salonId: string;
  clientId?: string;
  onComplete?: () => void;
  initialServiceId?: string | null; // Add optional initial prop
  initialStaffId?: string | null;   // Add optional initial prop
}

type Step = 'service' | 'staff' | 'time' | 'confirm';

export function BookingFlow({ salonId, clientId, onComplete, initialServiceId, initialStaffId }: BookingFlowProps) { // Add props
  // Determine initial step based on passed props
  const getInitialStep = (): Step => {
     if (initialServiceId && initialStaffId) return 'time';
     if (initialServiceId) return 'staff';
     return 'service';
  }
  const [currentStep, setCurrentStep] = useState<Step>(getInitialStep());
  // Initialize state with props if available
  const [selectedService, setSelectedService] = useState<string | null>(initialServiceId || null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(initialStaffId || null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const { settings, fetchSettings } = useBookingStore();

  useEffect(() => {
    fetchSettings(salonId);
  }, [salonId]);

  const handleServiceSelected = (serviceId: string) => {
    setSelectedService(serviceId);
    setCurrentStep('staff');
  };

  const handleStaffSelected = (staffId: string) => {
    setSelectedStaff(staffId);
    setCurrentStep('time');
  };

  const handleTimeSelected = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setCurrentStep('confirm');
  };

  const handleConfirm = async (guestInfo?: {
    name: string;
    email: string;
    phone?: string;
  }, notes?: string) => {
    if (!selectedService || !selectedStaff || !selectedDate || !selectedTime) return;

    try {
      await useBookingStore.getState().createBookingRequest(
        salonId,
        selectedService,
        selectedStaff,
        selectedDate,
        selectedTime,
        clientId,
        guestInfo,
        notes
      );

      onComplete?.();
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-between">
          {[
            { id: 'service', label: 'Service' },
            { id: 'staff', label: 'Staff' },
            { id: 'time', label: 'Time' },
            { id: 'confirm', label: 'Confirm' }
          ].map((step, idx) => (
            <div
              key={step.id}
              className={`flex items-center ${idx > 0 ? 'ml-auto' : ''}`}
            >
              <span
                className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                  step.id === currentStep
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <span className="text-sm font-medium">{idx + 1}</span>
              </span>
              <span className="ml-2 text-sm font-medium text-gray-500">
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mt-8">
        {currentStep === 'service' && (
          <ServiceSelection
            salonId={salonId}
            onServiceSelected={handleServiceSelected}
          />
        )}

        {currentStep === 'staff' && selectedService && (
          <StaffSelection
            salonId={salonId}
            serviceId={selectedService}
            onStaffSelected={handleStaffSelected}
            onBack={() => {
              setSelectedService(null);
              setCurrentStep('service');
            }}
          />
        )}

        {currentStep === 'time' && selectedService && selectedStaff && (
          <TimeSelection
            salonId={salonId}
            serviceId={selectedService}
            staffId={selectedStaff}
            onTimeSelected={handleTimeSelected}
            onBack={() => {
              setSelectedStaff(null);
              setCurrentStep('staff');
            }}
          />
        )}

        {currentStep === 'confirm' && selectedService && selectedStaff && selectedDate && selectedTime && (
          <BookingConfirmation
            salonId={salonId}
            serviceId={selectedService}
            staffId={selectedStaff}
            date={selectedDate}
            time={selectedTime}
            isGuestBookingAllowed={settings?.allowGuestBooking ?? false}
            requireDeposit={settings?.requireDeposit ?? false}
            depositAmount={settings?.depositAmount ?? 0}
            onConfirm={handleConfirm}
            onBack={() => {
              setSelectedDate(null);
              setSelectedTime(null);
              setCurrentStep('time');
            }}
          />
        )}
      </div>
    </div>
  );
}