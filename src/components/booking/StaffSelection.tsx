import React, { useEffect, useState } from 'react';
import { useStaffStore } from '@/lib/store/staff';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Star } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useCallback } from 'react';
interface StaffSelectionProps {
  salonId: string;
  serviceId: string;
  onStaffSelected: (staffId: string) => void;
  onBack: () => void;
}

interface Staff {
    id: number | string;
    firstName: string;
    lastName: string;
    specialization?: string;
  }
export function StaffSelection({ salonId, serviceId, onStaffSelected, onBack }: StaffSelectionProps) {
  // const { staff, loading, fetchStaff } = useStaffStore();
  const [staff, setStaff] = useState<Staff[]>([]);

  // useEffect(() => {
  //   if (salonId) { // Ensure salonId is available
  //     fetchStaff("1"); // Pass salonId
  //   }
  // }, [salonId, fetchStaff]); // Add dependencies

  // // Filter staff members who can perform the selected service
  // const availableStaff = staff.filter(member =>
  //   member.services.includes(serviceId)
  // );

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
  //     </div>
  //   );
  // }
  const getStaff = useCallback(async () => {
    try {
      const response = await axios.get(`https://kapperking.runasp.net/api/Salons/GetStylists?id=1`);
      setStaff(response.data);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("Failed to fetch staff.");
    }
  }, []);

  useEffect(() => {
    getStaff();
  }, [getStaff]);
  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Services
        </Button>
        <h2 className="text-lg font-medium text-gray-900">Choose Your Stylist</h2>
        <p className="mt-1 text-sm text-gray-500">
          Select a staff member for your appointment
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {staff.map((member) => (
          <button
            key={member.id}
            onClick={() => onStaffSelected(String(member.id))}
            className="text-left bg-white rounded-lg border border-gray-200 p-4 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-lg font-medium text-gray-600">
                  {member.firstName[0]}{member.lastName[0]}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {member.firstName} {member.lastName}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {/* {member.role} */}
                </p>
                <div className="mt-2 flex items-center">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="ml-1 text-sm text-gray-600">4.9</span>
                </div>
              </div>
            </div>
          </button>
        ))}
{/* 
        {availableStaff.length === 0 && (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">
              No staff members available for this service
            </p>
          </div>
        )} */}
      </div>
    </div>
  );
}