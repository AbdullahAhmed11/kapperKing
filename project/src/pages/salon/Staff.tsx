import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Calendar, Star, Clock, BarChart2, Users, Mail, Phone, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StaffForm } from '@/components/staff/StaffForm';
import { AvailabilityManager } from '@/components/staff/AvailabilityManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'stylist' | 'assistant';
  services: string[];
  status: 'active' | 'inactive';
  performance: {
    rating: number;
    clients: number;
    revenue: string;
    appointments: number;
  };
}

function Staff() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewStaff, setShowNewStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showEditStaff, setShowEditStaff] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);

  const staffMembers = [
    {
      id: '1',
      firstName: 'Emma',
      lastName: 'Davis',
      role: 'Senior Stylist',
      email: 'emma@example.com',
      phone: '+31 6 12345678',
      services: ['Haircut', 'Color', 'Styling'],
      status: 'active',
      performance: {
        rating: 4.9,
        clients: 245,
        revenue: '€8,450',
        appointments: 156
      }
    },
    {
      id: '2',
      firstName: 'James',
      lastName: 'Wilson',
      role: 'Barber',
      email: 'james@example.com',
      phone: '+31 6 87654321',
      services: ['Men\'s Cuts', 'Beard Trim'],
      status: 'active',
      performance: {
        rating: 4.8,
        clients: 198,
        revenue: '€6,320',
        appointments: 142
      }
    }
  ];

  const handleStaffClick = (staff: StaffMember) => {
    setSelectedStaff(staff);
  };

  const handleEditClick = (staff: StaffMember, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStaff(staff);
    setShowEditStaff(true);
  };

  const handleDeleteClick = async (staff: StaffMember, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${staff.firstName} ${staff.lastName}?`)) {
      try {
        // Implement delete logic here
        toast.success('Staff member deleted successfully');
      } catch (error) {
        toast.error('Failed to delete staff member');
      }
    }
  };

  const handleNewStaffSubmit = async (data: any) => {
    try {
      // Implement create logic here
      console.log('New staff data:', data);
      toast.success('Staff member created successfully');
      setShowNewStaff(false);
    } catch (error) {
      toast.error('Failed to create staff member');
    }
  };

  const handleEditStaffSubmit = async (data: any) => {
    try {
      // Implement update logic here
      console.log('Updated staff data:', data);
      toast.success('Staff member updated successfully');
      setShowEditStaff(false);
      setSelectedStaff(null);
    } catch (error) {
      toast.error('Failed to update staff member');
    }
  };

  const handleAvailabilityClick = (staff: StaffMember, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStaff(staff);
    setShowAvailability(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Staff</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your salon's team</p>
        </div>
        <Button onClick={() => setShowNewStaff(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select className="rounded-lg border border-gray-200 text-sm">
                <option>All Roles</option>
                <option>Admin</option>
                <option>Stylist</option>
                <option>Assistant</option>
              </select>
              <select className="rounded-lg border border-gray-200 text-sm">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4">
            {staffMembers.map((staff) => (
              <div
                key={staff.id}
                onClick={() => handleStaffClick(staff)}
                className="bg-white rounded-lg border border-gray-100 p-4 hover:border-gray-200 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-600">
                        {staff.firstName[0]}{staff.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {staff.firstName} {staff.lastName}
                      </h3>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {staff.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {staff.phone}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {staff.services.map((service, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            <Scissors className="h-3 w-3 mr-1" />
                            {service}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div className="flex items-center text-sm">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="font-medium">{staff.performance.rating}</span>
                          <span className="text-gray-500 ml-1">rating</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 text-blue-500 mr-1" />
                          <span className="font-medium">{staff.performance.clients}</span>
                          <span className="text-gray-500 ml-1">clients</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <BarChart2 className="h-4 w-4 text-green-500 mr-1" />
                          <span className="font-medium">{staff.performance.revenue}</span>
                          <span className="text-gray-500 ml-1">revenue</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 text-purple-500 mr-1" />
                          <span className="font-medium">{staff.performance.appointments}</span>
                          <span className="text-gray-500 ml-1">appointments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => handleAvailabilityClick(staff, e)}
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => handleEditClick(staff, e)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={(e) => handleDeleteClick(staff, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Staff Form */}
      <StaffForm
        open={showNewStaff}
        onClose={() => setShowNewStaff(false)}
        onSubmit={handleNewStaffSubmit}
      />

      {/* Edit Staff Form */}
      <StaffForm
        open={showEditStaff}
        onClose={() => {
          setShowEditStaff(false);
          setSelectedStaff(null);
        }}
        onSubmit={handleEditStaffSubmit}
        initialData={selectedStaff}
        title="Edit Staff Member"
      />

      {/* Staff Details Dialog */}
      <Dialog open={!!selectedStaff && !showEditStaff && !showAvailability} onOpenChange={() => setSelectedStaff(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-xl font-medium text-indigo-600">
                    {selectedStaff.firstName[0]}{selectedStaff.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedStaff.firstName} {selectedStaff.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedStaff.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Contact</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedStaff.email}
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedStaff.phone}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Performance</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 mr-2 text-yellow-400" />
                      {selectedStaff.performance.rating} rating
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-blue-500" />
                      {selectedStaff.performance.clients} clients
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Services</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedStaff.services.map((service, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      <Scissors className="h-3 w-3 mr-1" />
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedStaff(null);
                    setShowEditStaff(true);
                  }}
                >
                  Edit Staff Member
                </Button>
                <Button
                  onClick={() => {
                    setSelectedStaff(null);
                    setShowAvailability(true);
                  }}
                >
                  Manage Availability
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Availability Dialog */}
      {showAvailability && selectedStaff && (
        <Dialog open={showAvailability} onOpenChange={() => setShowAvailability(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Availability - {selectedStaff.firstName} {selectedStaff.lastName}</DialogTitle>
            </DialogHeader>
            <AvailabilityManager staffId={selectedStaff.id} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default Staff;