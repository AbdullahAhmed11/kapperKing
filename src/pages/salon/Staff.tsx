import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Calendar, Star, Clock, BarChart2, Users, Mail, Phone, Scissors, Loader2, AlertCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StaffForm, StaffFormData } from '@/components/staff/StaffForm'; // Import form and type
import { AvailabilityManager } from '@/components/staff/AvailabilityManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useStaffStore, StaffMember } from '@/lib/store/staff';
import { useCurrentSalonStore } from '@/lib/store/currentSalon';
import { useServiceStore, Service } from '@/lib/store/services'; // Import service store for mapping names

// Define type for form data from StaffForm (adjust based on StaffForm's actual schema)
// type StaffFormData = Omit<StaffMember, 'id' | 'performance' | 'salonId'> & { services: string[] }; // Example type - Assuming StaffForm handles this

function Staff() {
  const { currentSalon, loading: salonLoading, error: salonError } = useCurrentSalonStore();
  const { staff, loading, error, fetchStaff, createStaff, updateStaff, deleteStaff } = useStaffStore();
  const { services: allServices, fetchServices } = useServiceStore(); // Fetch services for mapping
  // Removed duplicate declarations below

  const [searchTerm, setSearchTerm] = useState('');
  const [showNewStaff, setShowNewStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showEditStaff, setShowEditStaff] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);

  // Fetch staff and services when salon ID is available
  useEffect(() => {
    if (currentSalon?.id && !salonLoading && !salonError) {
      fetchStaff(currentSalon.id);
      fetchServices(currentSalon.id); // Fetch services needed for display
    }
  }, [currentSalon?.id, salonLoading, salonError, fetchStaff, fetchServices]);

  // Function to get service names from IDs
  const getServiceNames = (serviceIds: string[]): string[] => {
     return serviceIds.map(id => allServices.find(s => s.id === id)?.name).filter(Boolean) as string[];
  };

  const handleEditClick = (staffMember: StaffMember, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStaff(staffMember);
    setShowEditStaff(true);
  };

  const handleDeleteClick = async (staffMember: StaffMember, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${staffMember.firstName} ${staffMember.lastName}?`)) {
      await deleteStaff(staffMember.id); // Call store action
      // Store handles toast and state update
    }
  };

  const handleNewStaffSubmit = async (data: StaffFormData) => {
    if (!currentSalon?.id) {
       toast.error("Cannot add staff: Salon context missing.");
       return;
    }
    const payload = {
       ...data,
       salonId: currentSalon.id,
       active: data.active ?? true,
    };
    // Ensure createStaff expects the correct payload structure including salonId
    const success = await createStaff(payload as any); // Use type assertion if needed
    if (success) {
      setShowNewStaff(false); // Close modal on success
    }
    // Store handles toasts
  };

  const handleEditStaffSubmit = async (data: StaffFormData) => {
     if (!selectedStaff) return;
     // Ensure updateStaff expects Partial<StaffFormData> or adjust payload
     const success = await updateStaff(selectedStaff.id, data);
     if (success) {
       setShowEditStaff(false);
       setSelectedStaff(null);
     }
     // Store handles toasts
   };

  const handleAvailabilityClick = (staffMember: StaffMember, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStaff(staffMember);
    setShowAvailability(true);
  };

  const filteredStaff = staff.filter(s =>
     `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
     s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Render Logic ---
  if (salonLoading || loading) {
     return <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (salonError) {
     return <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">Error loading salon context: {salonError}</div>;
  }
  if (!currentSalon) {
     return <div className="p-6 text-center text-gray-500">No active salon associated with this account.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Staff</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your salon's team</p>
        </div>
        <Button onClick={() => { setSelectedStaff(null); setShowNewStaff(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input type="text" placeholder="Search staff..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            {/* TODO: Implement Role/Status Filters */}
            <div className="flex items-center space-x-4">
              <select className="rounded-lg border border-gray-200 text-sm h-10"> <option>All Roles</option> <option>Admin</option> <option>Stylist</option> <option>Assistant</option> </select>
              <select className="rounded-lg border border-gray-200 text-sm h-10"> <option>All Status</option> <option>Active</option> <option>Inactive</option> </select>
            </div>
          </div>

          {error && ( // Display staff fetch error
             <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
               <AlertCircle className="h-5 w-5 mr-3" />
               <span>Error loading staff: {error}</span>
             </div>
          )}

          <div className="grid gap-4">
            {filteredStaff.length === 0 && !loading ? (
               <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">
                     {searchTerm ? 'No staff found matching your search.' : 'No staff members added yet.'}
                  </p>
                  {!searchTerm && <Button onClick={() => { setSelectedStaff(null); setShowNewStaff(true); }} className="mt-4">Add First Staff Member</Button>}
               </div>
            ) : (
              filteredStaff.map((staffMember) => (
                <div key={staffMember.id} className="bg-white rounded-lg border border-gray-100 p-4 hover:border-gray-200 transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-indigo-600">{staffMember.firstName[0]}{staffMember.lastName[0]}</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{staffMember.firstName} {staffMember.lastName}</h3>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center"> <Mail className="h-4 w-4 mr-1" /> {staffMember.email} </div>
                          {staffMember.phone && <div className="flex items-center"> <Phone className="h-4 w-4 mr-1" /> {staffMember.phone} </div>}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {getServiceNames(staffMember.services).map((serviceName, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              <Scissors className="h-3 w-3 mr-1" /> {serviceName}
                            </span>
                          ))}
                        </div>
                        {/* Performance data removed - needs separate fetching/calculation */}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={(e) => handleAvailabilityClick(staffMember, e)}> <Calendar className="h-4 w-4" /> </Button>
                      <Button variant="outline" size="sm" onClick={(e) => handleEditClick(staffMember, e)}> <Edit2 className="h-4 w-4" /> </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={(e) => handleDeleteClick(staffMember, e)}> <Trash2 className="h-4 w-4" /> </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Forms in Dialogs */}
      <StaffForm
        open={showNewStaff || showEditStaff}
        onClose={() => { setShowNewStaff(false); setShowEditStaff(false); setSelectedStaff(null); }}
        onSubmit={showEditStaff ? handleEditStaffSubmit : handleNewStaffSubmit}
        initialData={selectedStaff} // Pass selected staff for editing
        title={showEditStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
        // Pass salonId to the form if it needs it for createStaff payload
        salonId={currentSalon?.id || ''} 
      />

      {/* Availability Dialog */}
      {showAvailability && selectedStaff && (
        <Dialog open={showAvailability} onOpenChange={() => setShowAvailability(false)}>
          <DialogContent>
            <DialogHeader> <DialogTitle>Manage Availability - {selectedStaff.firstName} {selectedStaff.lastName}</DialogTitle> </DialogHeader>
            <AvailabilityManager staffId={selectedStaff.id} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default Staff;