import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Clock, DollarSign, Tag, Info, Loader2, AlertCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ServiceForm } from '@/components/services/ServiceForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import axios from 'axios';

// Define Service interface based on your API response
interface Service {
  id: number;
  name: string;
  categoryName: string;
  duration: number;
  price: number;
  description?: string;
  active: boolean;
  salon_id: number;
}

// Define type for form data from ServiceForm
type ServiceFormData = {
  name: string;
  category: string;
  duration: number;
  price: number;
  description?: string;
};

const API_URL = 'https://kapperking.runasp.net/api/Services';

function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewService, setShowNewService] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showEditService, setShowEditService] = useState(false);

  // Fetch services from API
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/Getservices/1`);
      setServices(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch services');
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };
  const createService = async (data: ServiceFormData) => {
    try {
      const formData = new FormData();
      formData.append('Name', data.name);
      if (data.description) formData.append('Description', data.description);
      // const durationInTicks = data.duration * 600000000; // Adjust if different
          const hours = Math.floor(data.duration / 60);
      const minutes = data.duration % 60;
      const timeSpanString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;

      formData.append('Duration',timeSpanString);
      formData.append('Price', data.price.toString());
      // formData.append('CategoryId', data.category.toString());
      formData.append('CategoryId', "1");
      formData.append('SalonId', '1'); // Hardcoded as per requirements

      await axios.post(`${API_URL}/Addservice`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Service created successfully');
      fetchServices();
      return true;
    } catch (err) {
      toast.error('Failed to create service');
      console.error('Error creating service:', err);
      return false;
    }
  };

  // Update service
  const updateService = async (id: number, data: ServiceFormData) => {
    try {
      await axios.put(`${API_URL}/UpdateService/${id}`, data);
      toast.success('Service updated successfully');
      fetchServices();
      return true;
    } catch (err) {
      toast.error('Failed to update service');
      return false;
    }
  };

    // Delete service
  const deleteService = async (id: number) => {
    try {
      await axios.delete(`https://kapperking.runasp.net/api/Services/Deleteservice/${id}`);
      toast.success('Service deleted successfully');
      fetchServices(); // Refresh the services list
      return true;
    } catch (err) {
      toast.error('Failed to delete service');
      console.error('Delete error:', err);
      return false;
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchServices();
  }, []);

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
    

      const success = await deleteService(service.id);
      if (success) {
        toast.success(`${service.name} was deleted successfully`);
      }
    
  };

  const handleNewServiceSubmit = async (data: ServiceFormData) => {
    const success = await createService(data);
    if (success) {
      setShowNewService(false);
    }
  };

  const handleEditServiceSubmit = async (data: ServiceFormData) => {
    if (!selectedService) return;
    const success = await updateService(selectedService.id, data);
    if (success) {
      setShowEditService(false);
      setSelectedService(null);
    }
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
  if (loading) {
    return <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Error state
  if (error) {
    return <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">Error loading services: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Services</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your salon's services and pricing</p>
        </div>
        <Button onClick={() => { setSelectedService(null); setShowNewService(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex justify-between items-center">
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
          <select className="rounded-lg border border-gray-200 text-sm h-10">
            <option>All Categories</option>
          </select>
          <select className="rounded-lg border border-gray-200 text-sm h-10">
            <option>Sort by Name</option>
            <option>Sort by Price</option>
            <option>Sort by Duration</option>
          </select>
        </div>
      </div>

      {/* Service List */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
          <AlertCircle className="h-5 w-5 mr-3" />
          <span>Error loading services list: {error}</span>
        </div>
      )}
      {!loading && !error && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="divide-y divide-gray-200">
            {filteredServices.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500">
                  {searchTerm ? 'No services found matching your search.' : 'No services added yet.'}
                </p>
                {!searchTerm && <Button onClick={() => { setSelectedService(null); setShowNewService(true); }} className="mt-4">Add First Service</Button>}
              </div>
            ) : (
              filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="p-4 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-indigo-600">
                          {service.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {service.name}
                        </h3>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center"> <Tag className="h-4 w-4 mr-1" /> {service.categoryName} </div>
                          <div className="flex items-center"> <Clock className="h-4 w-4 mr-1" /> {service.duration} min </div>
                          <div className="flex items-center"> <DollarSign className="h-4 w-4 mr-1" /> {formatCurrency(service.price)} </div>
                        </div>
                        {service.description && (
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <Info className="h-4 w-4 mr-1 flex-shrink-0" />
                            <span className="line-clamp-1">{service.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={(e) => handleEditClick(service, e)}> <Edit2 className="h-4 w-4" /> </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={(e) => handleDeleteClick(service, e)}> <Trash2 className="h-4 w-4" /> </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* New Service Form Dialog */}
      <ServiceForm
        open={showNewService}
        onClose={() => setShowNewService(false)}
        onSubmit={handleNewServiceSubmit}
        title="Add New Service"
      />

      {/* Edit Service Form Dialog */}
      <ServiceForm
        open={showEditService}
        onClose={() => { setShowEditService(false); setSelectedService(null); }}
        onSubmit={handleEditServiceSubmit}
        initialData={selectedService || undefined}
        title="Edit Service"
      />
    </div>
  );
}

export default Services;