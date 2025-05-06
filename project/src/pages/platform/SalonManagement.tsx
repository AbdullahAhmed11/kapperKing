import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Store, Users, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { SalonForm } from '@/components/platform/forms/SalonForm';

function SalonManagement() {
  const [showNewSalon, setShowNewSalon] = useState(false);
  const [showEditSalon, setShowEditSalon] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual data from your backend
  const salons = [
    {
      id: '1',
      name: 'Style Studio',
      owner: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com'
      },
      location: {
        address: '123 Main St',
        city: 'Amsterdam',
        country: 'Netherlands'
      },
      stats: {
        staff: 12,
        clients: 450,
        appointments: 120
      },
      subscription: {
        plan: 'Professional',
        status: 'active'
      }
    },
    {
      id: '2',
      name: 'Chic Cuts',
      owner: {
        name: 'Michael Chen',
        email: 'michael@example.com'
      },
      location: {
        address: '456 High St',
        city: 'Rotterdam',
        country: 'Netherlands'
      },
      stats: {
        staff: 8,
        clients: 320,
        appointments: 85
      },
      subscription: {
        plan: 'Basic',
        status: 'trial'
      }
    }
  ];

  const handleNewSalonSubmit = async (data: any) => {
    try {
      // Implement salon creation logic here
      console.log('New salon data:', data);
      toast.success('Salon created successfully');
      setShowNewSalon(false);
    } catch (error) {
      toast.error('Failed to create salon');
    }
  };

  const handleEditSalonSubmit = async (data: any) => {
    try {
      // Implement salon update logic here
      console.log('Updated salon data:', data);
      toast.success('Salon updated successfully');
      setShowEditSalon(false);
      setSelectedSalon(null);
    } catch (error) {
      toast.error('Failed to update salon');
    }
  };

  const handleDeleteSalon = async (salonId: string) => {
    try {
      // Implement salon deletion logic here
      console.log('Deleting salon:', salonId);
      toast.success('Salon deleted successfully');
    } catch (error) {
      toast.error('Failed to delete salon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Salon Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all salons on the platform</p>
        </div>
        <Button onClick={() => setShowNewSalon(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Salon
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search salons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center space-x-4">
          <select className="rounded-lg border border-gray-200 text-sm">
            <option>All Plans</option>
            <option>Basic</option>
            <option>Professional</option>
            <option>Enterprise</option>
          </select>
          <select className="rounded-lg border border-gray-200 text-sm">
            <option>All Status</option>
            <option>Active</option>
            <option>Trial</option>
            <option>Suspended</option>
          </select>
        </div>
      </div>

      {/* Salons Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {salons.map((salon) => (
          <div
            key={salon.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Store className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{salon.name}</h3>
                  <p className="text-sm text-gray-500">{salon.location.city}, {salon.location.country}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedSalon(salon);
                    setShowEditSalon(true);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDeleteSalon(salon.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 py-4 border-y border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center text-gray-500 mb-1">
                  <Users className="h-4 w-4" />
                </div>
                <div className="text-lg font-semibold text-gray-900">{salon.stats.staff}</div>
                <div className="text-xs text-gray-500">Staff</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center text-gray-500 mb-1">
                  <Users className="h-4 w-4" />
                </div>
                <div className="text-lg font-semibold text-gray-900">{salon.stats.clients}</div>
                <div className="text-xs text-gray-500">Clients</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center text-gray-500 mb-1">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="text-lg font-semibold text-gray-900">{salon.stats.appointments}</div>
                <div className="text-xs text-gray-500">Appointments</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-500">
                  <Settings className="h-4 w-4 mr-1" />
                  <span>{salon.subscription.plan}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  salon.subscription.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {salon.subscription.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Forms */}
      <SalonForm
        open={showNewSalon}
        onClose={() => setShowNewSalon(false)}
        onSubmit={handleNewSalonSubmit}
      />

      <SalonForm
        open={showEditSalon}
        onClose={() => {
          setShowEditSalon(false);
          setSelectedSalon(null);
        }}
        onSubmit={handleEditSalonSubmit}
        initialData={selectedSalon}
        title="Edit Salon"
      />
    </div>
  );
}

export default SalonManagement;