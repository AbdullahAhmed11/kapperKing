import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Clock, DollarSign, Tag, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ServiceForm } from '@/components/services/ServiceForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description?: string;
}

function Services() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewService, setShowNewService] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showEditService, setShowEditService] = useState(false);

  const services = [
    {
      id: '1',
      name: 'Men\'s Haircut',
      category: 'Haircuts',
      duration: 30,
      price: 35,
      description: 'Classic men\'s haircut including wash and styling'
    },
    {
      id: '2',
      name: 'Women\'s Cut & Style',
      category: 'Haircuts',
      duration: 60,
      price: 65,
      description: 'Women\'s haircut with wash, cut, and professional styling'
    },
    {
      id: '3',
      name: 'Color & Cut',
      category: 'Color',
      duration: 120,
      price: 150,
      description: 'Full color service with haircut and style'
    },
    {
      id: '4',
      name: 'Highlights',
      category: 'Color',
      duration: 90,
      price: 120,
      description: 'Partial or full highlights'
    }
  ];

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
  };

  const handleEditClick = (service: Service, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedService(service);
    setShowEditService(true);
  };

  const handleDeleteClick = async (service: Service, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${service.name}?`)) {
      try {
        // Implement delete logic here
        toast.success('Service deleted successfully');
      } catch (error) {
        toast.error('Failed to delete service');
      }
    }
  };

  const handleNewServiceSubmit = async (data: any) => {
    try {
      // Implement create logic here
      console.log('New service data:', data);
      toast.success('Service created successfully');
      setShowNewService(false);
    } catch (error) {
      toast.error('Failed to create service');
    }
  };

  const handleEditServiceSubmit = async (data: any) => {
    try {
      // Implement update logic here
      console.log('Updated service data:', data);
      toast.success('Service updated successfully');
      setShowEditService(false);
      setSelectedService(null);
    } catch (error) {
      toast.error('Failed to update service');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Services</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your salon's services and pricing</p>
        </div>
        <Button onClick={() => setShowNewService(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select className="rounded-lg border border-gray-200 text-sm">
                <option>All Categories</option>
                <option>Haircuts</option>
                <option>Color</option>
                <option>Styling</option>
              </select>
              <select className="rounded-lg border border-gray-200 text-sm">
                <option>Sort by Name</option>
                <option>Sort by Price</option>
                <option>Sort by Duration</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceClick(service)}
                className="bg-white rounded-lg border border-gray-100 p-4 hover:border-gray-200 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-600">
                        {service.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {service.name}
                      </h3>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-1" />
                          {service.category}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {service.duration} min
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          €{service.price}
                        </div>
                      </div>
                      {service.description && (
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Info className="h-4 w-4 mr-1" />
                          {service.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => handleEditClick(service, e)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={(e) => handleDeleteClick(service, e)}
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

      {/* New Service Form */}
      <ServiceForm
        open={showNewService}
        onClose={() => setShowNewService(false)}
        onSubmit={handleNewServiceSubmit}
      />

      {/* Edit Service Form */}
      <ServiceForm
        open={showEditService}
        onClose={() => {
          setShowEditService(false);
          setSelectedService(null);
        }}
        onSubmit={handleEditServiceSubmit}
        initialData={selectedService}
        title="Edit Service"
      />

      {/* Service Details Dialog */}
      <Dialog open={!!selectedService && !showEditService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Service Details</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-xl font-medium text-indigo-600">
                    {selectedService.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedService.name}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedService.category}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Duration</h4>
                  <div className="mt-2 flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    {selectedService.duration} minutes
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Price</h4>
                  <div className="mt-2 flex items-center text-sm">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                    €{selectedService.price}
                  </div>
                </div>
              </div>

              {selectedService.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Description</h4>
                  <p className="mt-2 text-sm text-gray-700">{selectedService.description}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedService(null);
                    setShowEditService(true);
                  }}
                >
                  Edit Service
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Services;