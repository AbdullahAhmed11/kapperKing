import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CalendarClock, Scissors, UserRound, Building, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface Appointment {
  salonName: string;
  time: string;
  amount: number;
  baberName: string;
  id: number;
  services: string;
}

interface JwtPayload {
  Id: number;
  FirstName?: string;
  LastName?: string;
}

const Booked = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const token = Cookies.get('customerToken');

  useEffect(() => {
    if (!token) {
      // Redirect to login if no token found
      navigate('/login');
      return;
    }

    const fetchAppointments = async () => {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const userId = decoded.Id;

        const response = await fetch(
          `https://kapperking.runasp.net/api/Appointments/GetAppointmentsByUser/${userId}?year=0&month=0&day=0&dayOfWeek=Sunday`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }

        const data = await response.json();
        setAppointments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token, navigate]);

  if (!token) {
    // Show nothing while redirecting
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Appointments</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <CalendarClock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Appointments Found</h2>
          <p className="text-gray-600">You don't have any upcoming appointments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Your Appointments</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <div className="flex items-start space-x-4 mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <CalendarClock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{appointment.services}</h3>
                <p className="text-gray-500">{appointment.time}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-gray-400" />
                <span>{appointment.salonName}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <UserRound className="h-5 w-5 text-gray-400" />
                <span>{appointment.baberName}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Scissors className="h-5 w-5 text-gray-400" />
                <span className="font-medium">{formatCurrency(appointment.amount)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Booked;