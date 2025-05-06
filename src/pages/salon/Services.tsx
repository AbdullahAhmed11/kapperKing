import React, { useState, useEffect } from 'react'; // Import useEffect
import { Plus, Search, Edit2, Trash2, Clock, DollarSign, Tag, Info, Loader2, AlertCircle, Package } from 'lucide-react'; // Added Loader2, AlertCircle, Package
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ServiceForm } from '@/components/services/ServiceForm'; // Keep ServiceForm import
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useServiceStore, Service } from '@/lib/store/services'; // Import store and type
import { useCurrentSalonStore } from '@/lib/store/currentSalon'; // Import current salon store
import { formatCurrency } from '@/lib/utils'; // Assuming utils exists

// Remove local Service interface if it's exported from store
// interface Service { ... } 

// Define type for form data from ServiceForm (matches schema there)
type ServiceFormData = {
  name: string;
  category: string;
  duration: number;
  price: number;
  description?: string;
};

function Services() {
  // Get loading/error state for salon context
  const { currentSalon, loading: salonLoading, error: salonError } = useCurrentSalonStore();
  const { services, loading, error, fetchServices, createService, updateService, deleteService } = useServiceStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showNewService, setShowNewService] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showEditService, setShowEditService] = useState(false);

  // Fetch services only when salon context is loaded and valid
  useEffect(() => {
    if (currentSalon?.id && !salonLoading && !salonError) {
      fetchServices(currentSalon.id);
    }
  }, [currentSalon?.id, salonLoading, salonError, fetchServices]); // Add dependencies

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    // Keep modal closed unless edit is clicked
    // setShowEditService(true); // Don't open edit on click, just select
  };

  const handleEditClick = (service: Service, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering handleServiceClick
    setSelectedService(service);
    setShowEditService(true);
  };

  const handleDeleteClick = async (service: Service, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${service.name}?`)) {
      await deleteService(service.id);
      // Store handles success/error toasts and state update
    }
  };

  const handleNewServiceSubmit = async (data: ServiceFormData) => {
    if (!currentSalon?.id) {
      toast.error("Cannot create service: Salon context missing.");
      return;
    }
    const payload = {
      ...data,
      salon_id: currentSalon.id,
      active: true // Default new services to active
    };
    const success = await createService(payload as any); // Use 'as any' if type mismatch, or adjust store type
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
      service.category.toLowerCase().includes(searchTerm.toLowerCase())
   );

  // --- Render Logic ---

  // Show loading state if salon context or services are loading
  if (salonLoading || loading) {
     return <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  // Show error if salon context failed to load
  if (salonError) {
     return <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">Error loading salon context: {salonError}</div>;
  }

  // Show message if no salon is associated after loading
  if (!currentSalon) {
     return <div className="p-6 text-center text-gray-500">No active salon associated with this account.</div>;
  }

  // --- Render Page Content (only if salon context is loaded) ---
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Services for {currentSalon.name}</h1> {/* Show salon name */}
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
         {/* TODO: Implement actual category/sorting filters */}
         <div className="flex items-center space-x-4">
           <select className="rounded-lg border border-gray-200 text-sm h-10">
             <option>All Categories</option>
             {/* Populate categories dynamically */}
           </select>
           <select className="rounded-lg border border-gray-200 text-sm h-10">
             <option>Sort by Name</option>
             <option>Sort by Price</option>
             <option>Sort by Duration</option>
           </select>
         </div>
      </div>

      {/* Service List - Remove separate loading/error for services, handled above */}
      {/* {loading && ( ... )} */}
      {error && ( // Keep error display specifically for service fetching errors
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
                  // onClick={() => handleServiceClick(service)} // Remove click to open details for now
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
                          <div className="flex items-center"> <Tag className="h-4 w-4 mr-1" /> {service.category} </div>
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
        initialData={selectedService || undefined} // Pass undefined if null
        title="Edit Service"
      />

      {/* Service Details Dialog Removed - Edit opens form directly */}

    </div>
  );
}

export default Services;