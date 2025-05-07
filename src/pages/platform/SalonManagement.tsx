import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Store, Users, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { SalonForm, SalonSubmitData } from '@/components/platform/forms/SalonForm'; // Import SalonSubmitData
import { useSalonStore, selectAllSalons, Salon, AddSalonPayload } from '@/lib/store/salons'; // Import salon store
import { useClientStore, selectAllClients, Client } from '@/lib/store/clients';
import { useSubscriptionPlanStore, selectAllPlans } from '@/lib/store/subscriptionPlans';

function SalonManagement() {
  const [showNewSalon, setShowNewSalon] = useState(false);
  const [showEditSalon, setShowEditSalon] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<any>(null); // Keep any for now, update if SalonForm needs specific type
  const [searchTerm, setSearchTerm] = useState('');
  const { 
    salons, 
    loading, 
    error, 
    fetchSalons,
    fetchSalonById, // Add this
    currentSalon // Add this to access the fetched salon
  } = useSalonStore();  // Get data from stores

  // const salons = useSalonStore(selectAllSalons);
  const clients = useClientStore(selectAllClients);
  const plans = useSubscriptionPlanStore(selectAllPlans);
  const addSalon = useSalonStore((state) => state.addSalon); // Get addSalon action
  const updateSalon = useSalonStore((state) => state.updateSalon); // Get updateSalon action
  const deleteSalon = useSalonStore((state) => state.deleteSalon); // Get deleteSalon action
  const {  fetchClients } = useClientStore();

  useEffect(() => {
    fetchSalons();
    fetchClients()
  }, [fetchSalons, fetchClients]);
  // Use correct type SalonSubmitData from SalonForm
  const handleNewSalonSubmit = async (data: SalonSubmitData) => {
    // Find the client selected in the form
    // const selectedClient = clients.find(c => c.id === data?.id);
    // if (!selectedClient) {
    //   toast.error("Selected client not found.");
    //   return;
    // }
    const selectedClient = 8;
    // Find the client's plan and calculate limits
    const plan = plans.find(p => p.id === selectedClient.subscriptionPlanId);
    const planId =3;
    const subscriptionId = 1;
    const subscriptionType= "Monthly";
    const maxSalonsAllowed = plan?.maxSalons ?? 0;
    const currentSalonCount = salons.filter(s => s.clientId === selectedClient.id).length;

    // Construct the full payload for the store action
    const addSalonPayload: AddSalonPayload = {
      ...data, // Spread the form data (name, address, clientId, etc.)
      currentSalonCount: currentSalonCount,
      maxSalonsAllowed: maxSalonsAllowed,
      planId: planId,
      subscriptionId: subscriptionId,
      subscriptionType: subscriptionType,
    };

    // Call the store action with the complete payload
    const newSalonId = addSalon(addSalonPayload);
    if (newSalonId) {
      setShowNewSalon(false);
      // Success toast is handled in the store action
    }
    // Error toast for validation failure is also handled in the store action
  };

  const handleEditClick = async (salonId: number) => {
    try {
      const salon = await fetchSalonById(salonId);
      console.log("select", salon);
      setSelectedSalon(salon);
      setShowEditSalon(true);
    } catch (error) {
      toast.error('Failed to load salon details');
    }
  };

  // Use correct type and action for editing
  console.log("Editing salon:", selectedSalon);
  // const handleEditSalonSubmit = async (data: Partial<Omit<Salon, 'id' | 'clientId'>>) => { // Use correct type
  //   if (selectedSalon) {
  //     updateSalon(selectedSalon.id, data); // Call correct action
  //     setShowEditSalon(false);
  //     setSelectedSalon(null);
  //     // Success toast is in store action
  //   } else {
  //      toast.error('No salon selected for editing.');
  //   }
  // };
  const handleEditSalonSubmit = async (data: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    salonPhone: string;
    website?: string;
  }) => {
    if (selectedSalon) {
      try {
        await updateSalon(selectedSalon.id, data);
        setShowEditSalon(false);
        setSelectedSalon(null);
      } catch (error) {
        // Error handling is already done in the store
      }
    } else {
      toast.error('No salon selected for editing.');
    }
  };
  const handleDeleteSalon = async (salonId: string) => {
    try {
      // TODO: Implement salon deletion logic using store action
      deleteSalon(Number(salonId));
      fetchSalons() // Using store action now
      toast.success('Salon deleted successfully'); // Toast is in store action
    } catch (error) {
      toast.error('Failed to delete salon');
    }
  };

  // Filter salons based on search term
  const filteredSalons = salons.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Salon Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all salons on the platform</p>
        </div>
        {/* Enable top-level Add Salon button */}
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
          {/* TODO: Implement actual filtering based on these selects */}
          <select className="rounded-lg border border-gray-200 text-sm h-10">
            <option>All Plans</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>
          <select className="rounded-lg border border-gray-200 text-sm h-10">
            <option>All Status</option>
            <option value="trialing">Trialing</option>
            <option value="active">Active</option>
            <option value="past_due">Past Due</option>
            <option value="canceled">Canceled</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>
      </div>

      {/* Salons Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSalons.length === 0 ? (
           <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
             <Store className="h-12 w-12 text-gray-400 mb-4" />
             <h3 className="text-lg font-medium text-gray-900">No salons found</h3>
             <p className="mt-1 text-sm text-gray-500">
               Add clients via Client Management to create their first salon.
             </p>
           </div>
        ) : (
          filteredSalons.map((salon) => {
            // Find associated client and plan
            const client = clients.find(c => c.id === salon.clientId);
            const plan = client ? plans.find(p => p.id === client.subscriptionPlanId) : null;
            const subscriptionStatus = client?.subscriptionStatus || 'unknown'; 
            console.log(client,"client")
            return (
            <div
              key={salon.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-all duration-200 flex flex-col" // Added flex flex-col
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0"> {/* Added flex-shrink-0 */}
                    <Store className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="min-w-0"> {/* Added min-w-0 for truncation */}
                    <h3 className="text-lg font-medium text-gray-900 truncate">{salon.name}</h3> {/* Added truncate */}
                    <p className="text-sm text-gray-500 truncate">Owner: {client ? `${client.name}` : 'Unknown'}</p> 
                  </div>
                </div>
                <div className="flex space-x-2 flex-shrink-0"> {/* Added flex-shrink-0 */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(salon.id)} 
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteSalon(String(salon.id))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Removed stats section */}
              
              <div className="mt-auto pt-4 border-t border-gray-100"> {/* Pushed to bottom */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <Settings className="h-4 w-4 mr-1" />
                    <span>{plan?.name || 'No Plan'}</span> 
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    subscriptionStatus === 'active' || subscriptionStatus === 'trialing' ? 'bg-green-100 text-green-800' : 
                    subscriptionStatus === 'past_due' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800' // canceled, incomplete or unknown
                  }`}>
                    {subscriptionStatus}
                  </span>
                </div>
              </div>
            </div>
          );})
        )}
      </div>

      {/* Forms */}
      <SalonForm
        open={showNewSalon}
        onClose={() => setShowNewSalon(false)}
        onSubmit={handleNewSalonSubmit}
        availableClients={clients} // Pass clients list
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
        availableClients={clients} // Pass clients list
      />
    </div>
  );
}

export default SalonManagement;