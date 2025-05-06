import React, { useState } from 'react'; 
import { Plus, Search, Edit2, Trash2, Store, Users, Calendar, Settings, CreditCard } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClientForm } from '@/components/platform/forms/ClientForm';
import { SalonForm, SalonSubmitData } from '@/components/platform/forms/SalonForm'; // Import SalonForm and type
import { useClientStore, selectAllClients, AddClientFormData, Client } from '@/lib/store/clients'; 
import { useSalonStore, selectAllSalons, Salon, AddSalonPayload } from '@/lib/store/salons'; // Import salon store types/selectors
import { useSubscriptionPlanStore, selectAllPlans } from '@/lib/store/subscriptionPlans'; 
import { toast } from 'sonner'; 
import { useThemeStore } from '@/lib/theme'; // Import theme store for button color

function ClientManagement() {
  const [showNewClient, setShowNewClient] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddSalonForm, setShowAddSalonForm] = useState(false); 
  const [clientToAddSalonTo, setClientToAddSalonTo] = useState<Client | null>(null); 

  // Get state and actions from stores
  const clients = useClientStore(selectAllClients);
  const addClient = useClientStore((state) => state.addClient);
  const updateClient = useClientStore((state) => state.updateClient);
  const deleteClient = useClientStore((state) => state.deleteClient);
  
  const salons = useSalonStore(selectAllSalons);
  const addSalon = useSalonStore((state) => state.addSalon); // Get addSalon action
  const updateSalon = useSalonStore((state) => state.updateSalon); // Get updateSalon action
  const deleteSalon = useSalonStore((state) => state.deleteSalon); // Get deleteSalon action

  const plans = useSubscriptionPlanStore(selectAllPlans);
  const { dashboardButtonTextColor } = useThemeStore((state) => state.currentTheme); // Get text color

  // Combined action to add client and their first salon
  const addClientAndFirstSalon = (formData: AddClientFormData) => {
    // 1. Create the Client
    const clientDataForStore: Omit<Client, 'id' | 'createdAt'> = { 
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      companyName: formData.companyName,
      subscriptionPlanId: formData.subscriptionPlanId,
      marketingConsent: formData.marketingConsent,
      notes: formData.notes,
      subscriptionStatus: formData.subscriptionPlanId ? 'trialing' : 'incomplete', 
      trialEndsAt: formData.subscriptionPlanId ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() : null, 
      userId: null, 
    };
    const newClientId = addClient(clientDataForStore);

    if (!newClientId) return; 

    // 2. Create the first Salon
    const selectedPlan = plans.find(p => p.id === formData.subscriptionPlanId);
    const maxSalonsForPlan = selectedPlan?.maxSalons ?? 0; 

    const addSalonPayload: AddSalonPayload = { // Use AddSalonPayload type
      clientId: newClientId,
      name: formData.firstSalonName, 
      currentSalonCount: 0, 
      maxSalonsAllowed: maxSalonsForPlan, 
    };
    const newSalonId = addSalon(addSalonPayload); 

    if (!newSalonId) {
      toast.error("Client created, but failed to create initial salon.");
      // Consider rollback logic here in a real application
      return;
    }
    
    toast.success("Client and initial salon created successfully!");
    setShowNewClient(false);
  };

  // Submit handler for the "Add New Client" form
  const handleNewClientSubmit = async (data: AddClientFormData) => { 
    addClientAndFirstSalon(data);
  };

  // Submit handler for the "Edit Client" form
  const handleEditClientSubmit = async (data: Partial<Client>) => { 
    if (selectedClient) {
      const { id, createdAt, userId, ...updateData } = data; 
      updateClient(selectedClient.id, updateData); 
      setShowEditClient(false);
      setSelectedClient(null);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    const clientSalons = salons.filter(s => s.clientId === clientId);
    if (window.confirm(`Are you sure you want to delete this client and their ${clientSalons.length} associated salon(s)? This cannot be undone.`)) { 
      if (clientSalons.length > 0) {
         console.warn(`Deleting ${clientSalons.length} associated salons not implemented yet.`);
         toast.info("Deleting associated salons is not yet implemented.");
         // In real app: await Promise.all(clientSalons.map(s => deleteSalon(s.id)));
      }
      deleteClient(clientId); 
    }
  };

  // Handle adding a new salon to an *existing* client
  const handleAddSalonSubmit = async (data: SalonSubmitData) => { 
    if (!clientToAddSalonTo) return; // Should not happen, but good practice

    const clientSalons = salons.filter(s => s.clientId === clientToAddSalonTo.id);
    const plan = plans.find(p => p.id === clientToAddSalonTo.subscriptionPlanId);
    const maxSalonsForPlan = plan?.maxSalons ?? 0;

    const addSalonPayload: AddSalonPayload = { // Use AddSalonPayload type
      ...data, // Spread the form data (name, address, etc.)
      currentSalonCount: clientSalons.length,
      maxSalonsAllowed: maxSalonsForPlan,
    };

    const salonId = addSalon(addSalonPayload); 
    if (salonId) {
      setShowAddSalonForm(false);
      setClientToAddSalonTo(null);
    } 
    // Error toast is handled in store action if validation fails
  };

  // Check if client can add more salons based on plan
  const canAddMoreSalons = (client: Client): boolean => {
    const plan = plans.find(p => p.id === client.subscriptionPlanId);
    if (!plan) return false; 
    if (plan.maxSalons === -1) return true; 
    const currentSalonCount = salons.filter(s => s.clientId === client.id).length;
    return currentSalonCount < plan.maxSalons;
  };

  // Filter clients based on search term
   const filteredClients = clients.filter(client => 
     `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
     client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     client.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
   );


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Client Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage platform clients and their salon access</p>
        </div>
        <Button 
          onClick={() => setShowNewClient(true)}
          style={{ color: dashboardButtonTextColor || '#FFFFFF' }} // Apply text color
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Client
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search clients by name, email, company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center space-x-4">
          <select className="rounded-lg border border-gray-200 text-sm h-10">
            <option>All Plans</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>
          <select className="rounded-lg border border-gray-200 text-sm h-10">
            <option>All Salons</option>
            {salons.map(salon => (
              <option key={salon.id} value={salon.id}>{salon.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No clients found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search.' : 'Get started by adding your first client.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowNewClient(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add New Client
              </Button>
            )}
          </div>
        ) : (
          filteredClients.map((client) => {
            const clientSalons = salons.filter(s => s.clientId === client.id);
            const plan = plans.find(p => p.id === client.subscriptionPlanId);
            const subscriptionStatus = client?.subscriptionStatus || 'unknown'; 

            return (
            <div
              key={client.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-all duration-200 flex flex-col" 
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3 min-w-0"> 
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0"> 
                    <span className="text-sm font-medium text-indigo-600">
                      {client.firstName?.[0]}{client.lastName?.[0]}
                    </span>
                  </div>
                  <div className="min-w-0"> 
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {client.firstName} {client.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{client.email}</p>
                  </div>
                </div>
                <div className="flex space-x-1 flex-shrink-0"> 
                   <Button
                     variant="outline"
                     size="sm"
                     title="Add Salon"
                     onClick={() => {
                       // Always allow platform owner to open the form
                       // Validation happens on submit in the store action
                       setClientToAddSalonTo(client);
                       setShowAddSalonForm(true);
                     }}
                     // The disabled check is removed here for the platform owner view.
                     // Validation still happens on submit within the addSalon store action.
                   >
                     <Store className="h-4 w-4" /> 
                   </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    title="Edit Client"
                    onClick={() => {
                      setSelectedClient(client);
                      setShowEditClient(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    title="Delete Client"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteClient(client.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-1 text-sm text-gray-500"> 
                {client.phone && ( <p>📞 {client.phone}</p> )}
                {client.companyName && ( <p>🏢 {client.companyName}</p> )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100"> 
                <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Managed Salons ({clientSalons.length})</h4>
                <div className="flex flex-wrap gap-1">
                   {clientSalons.map((salon) => (
                      <span
                        key={salon.id}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {salon.name}
                      </span>
                   ))}
                    {clientSalons.length === 0 && (
                       <span className="text-xs text-gray-400 italic">No salons assigned</span>
                    )}
                </div>
              </div>

              <div className="mt-auto pt-3 border-t border-gray-100"> 
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <CreditCard className="h-4 w-4 mr-1.5" /> 
                    <span>{plan?.name || 'No Plan'}</span> 
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    subscriptionStatus === 'active' || subscriptionStatus === 'trialing' ? 'bg-green-100 text-green-800' : 
                    subscriptionStatus === 'past_due' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800' 
                  }`}>
                    {subscriptionStatus}
                  </span>
                </div>
                 {subscriptionStatus === 'trialing' && client.trialEndsAt && (
                    <div className="text-xs text-gray-400 mt-1 text-right">
                      Trial ends {new Date(client.trialEndsAt).toLocaleDateString()}
                    </div>
                 )}
              </div>
            </div>
          );})
        )}
      </div>

      {/* Forms */}
      <ClientForm
        open={showNewClient}
        onClose={() => setShowNewClient(false)}
        onSubmit={handleNewClientSubmit}
        availablePlans={plans}
      />

      {/* Add Salon Form Modal */}
      <SalonForm
        key={clientToAddSalonTo?.id || 'add-salon'} 
        open={showAddSalonForm}
        onClose={() => {
          setShowAddSalonForm(false);
          setClientToAddSalonTo(null);
        }}
        onSubmit={handleAddSalonSubmit}
        preselectedClientId={clientToAddSalonTo?.id || null} 
        availableClients={clients} 
        title={`Add Salon for ${clientToAddSalonTo?.firstName || ''}`}
      />

      <ClientForm
        open={showEditClient}
        onClose={() => {
          setShowEditClient(false);
          setSelectedClient(null);
        }}
        onSubmit={handleEditClientSubmit}
        initialData={selectedClient}
        title="Edit Client"
        availablePlans={plans}
      />
    </div>
  );
}

export default ClientManagement;