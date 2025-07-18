import React, {useState, useEffect} from 'react';
import { useParams, useLocation } from 'react-router-dom'; // Import useLocation
import { useMicroSiteStore } from '@/lib/store/microsite';
import { BookingFlow } from '@/components/booking/BookingFlow';
// import { AppointmentForm } from '@/components/appointments/AppointmentForm';
// Helper to parse query params
import { AppointmentCutomerForm } from '@/components/appointments/AppointmentCutomerForm';
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SalonBooking() {
  const { slug } = useParams<{ slug: string }>(); // Add type hint
  const { site, loading, error  } = useMicroSiteStore();
  const query = useQuery();
  const initialServiceId = query.get('serviceId');
  const initialStaffId = query.get('staffId');
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }
   
  

  // if (error || !site) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold text-gray-900">Errorr</h1>
  //         <p className="mt-2 text-gray-500">{error || 'Salon not found'}</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Book an Appointment
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Schedule your visit to {site?.salon.name}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          {/* <BookingFlow
            salonId="1"
            initialServiceId={initialServiceId} // Pass initial service ID
            initialStaffId={initialStaffId}   // Pass initial staff ID
            onComplete={() => {
              // Handle successful booking
              window.location.href = `/s/${slug}`; // Redirect back to microsite home
            }}
          /> */}

          <AppointmentCutomerForm
                onSuccess={() => {
                  // Handle successful appointment booking here
                  // For example, redirect or show a message
                }}
          />
        </div>
      </div>
    </div>
  );
}