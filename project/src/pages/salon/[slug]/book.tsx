import React from 'react';
import { useParams } from 'react-router-dom';
import { useMicroSiteStore } from '@/lib/store/microsite';
import { BookingFlow } from '@/components/booking/BookingFlow';

export default function SalonBooking() {
  const { slug } = useParams();
  const { site, loading, error } = useMicroSiteStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Error</h1>
          <p className="mt-2 text-gray-500">{error || 'Salon not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Book an Appointment
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Schedule your visit to {site.salon.name}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <BookingFlow
            salonId={site.salon.id}
            onComplete={() => {
              // Handle successful booking
              window.location.href = `/s/${slug}`;
            }}
          />
        </div>
      </div>
    </div>
  );
}