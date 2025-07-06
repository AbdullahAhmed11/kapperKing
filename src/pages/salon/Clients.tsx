import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Calendar, Phone, Mail, Star, Loader2, AlertCircle, Users, Package } from 'lucide-react'; // Added Users, Package
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClientForm, ClientFormData } from '@/components/clients/ClientForm'; // Import ClientFormData type
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { AddClientDialog } from '@/components/clients/AddClientDialog'; // Import AddClientDialog component
import { useClientStore, Client, AddSalonClientFormData } from '@/lib/store/clients'; // Import store and types
import { useCurrentSalonStore } from '@/lib/store/currentSalon'; // Import current salon store
import { formatCurrency } from '@/lib/utils'; // Assuming utils exists
// Removed local ClientFormData definition
import { EditClientDialog } from '@/components/clients/EditClientDialog';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

type JwtPayload = {
  Id: number; // adjust this to match your token's structure
  email?: string;
  name?: string;
  // any other fields you expect
};

function Clients() {

  const token = Cookies.get('salonUser');
  
  // const decoded = jwtDecode<JwtPayload>(token);
  if (token) {
    const decoded = jwtDecode<JwtPayload>(token);
    console.log('User ID:', decoded.Id);
  }

  
  const navigate = useNavigate(); // Initialize navigate
  const { currentSalon, loading: salonLoading, error: salonError } = useCurrentSalonStore();
  const { clients, loading, error, fetchClients, addClient, updateClient, deleteClient } = useClientStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClient, setShowNewClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showEditClient, setShowEditClient] = useState(false);
                                                                                  
  // Fetch clients when salon ID is available
  useEffect(() => {
    fetchClients()
    // if (currentSalon?.id && !salonLoading && !salonError) {
    //   fetchClients(currentSalon.id);
    // }
  }, [fetchClients]);

const handleEditClick = (client: Client, e: React.MouseEvent) => {
  e.stopPropagation();
  setSelectedClient(client);
  setShowEditClient(true);
};


  const handleDeleteClick = async (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${client.firstName} ${client.lastName}?`)) {
      await deleteClient(client.id);
    }
  };

  // Use ClientFormData type from the form component
  const handleNewClientSubmit = async (data: ClientFormData) => { 
    if (!currentSalon?.id) {
      toast.error("Cannot add client: Salon context missing.");
      
      return;
    }
    console.log(currentSalon?.id, "currentSalon?.id")
    // Construct the payload expected by the store's addClient action
    const payload: AddSalonClientFormData = {
      ...data,
      salon_id: currentSalon.id,
      // Ensure email is not undefined if required by AddSalonClientFormData
      email: data.email || '', // Provide empty string if undefined
      marketingConsent: data.marketingConsent ?? false,
    };
    const newClient = await addClient(payload);
    if (newClient) {
      setShowNewClient(false);
    }
  };

  // Use ClientFormData type from the form component
const handleEditClientSubmit = async (data: Client) => {
  try {
    const formData = new FormData();
formData.append('Id', selectedClient?.id);
formData.append('FirstName', data.firstName);
formData.append('LastName', data.lastName);
formData.append('Email', data.email);
if (data.phone) formData.append('Phone', data.phone);
if ((data as any).password) formData.append('Password', (data as any).password);

 const response = await fetch('https://kapperking.runasp.net/api/Users/EditAdmin', {
  method: 'POST',
  body: formData,
  // Remove 'Content-Type' header (FormData sets it automatically)
});

    if (!response.ok) throw new Error('Failed to update client');
    
    toast.success("Client updated successfully!");
    fetchClients(); // Refresh the list
    return true;
  } catch (error) {
    toast.error("Error updating client");
    console.error(error);
    return false;
  }
};

  // Navigate to appointment page, passing client ID
  const handleBookAppointment = (client: Client) => {
    console.log('Navigating to book appointment for:', client.id);
    // Navigate to the main appointments page or a dedicated "new appointment" route
    // Passing client ID in state to pre-fill the form
    navigate('/salon/appointments', { state: { preselectedClientId: client.id } });
  };

  const filteredClients = clients.filter(c =>
     `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
     c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     c.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Render Logic ---
  if (salonLoading) {
     return <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (salonError) {
     return <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">Error loading salon context: {salonError}</div>;
  }
  // if (!currentSalon) {
  //    return <div className="p-6 text-center text-gray-500">No active salon associated with this account.</div>;
  // }
  console.log(selectedClient, "selectedClient")

const handleEditSuccess = () => {
  fetchClients(); // Refresh the client list
  toast.success('Client updated successfully!');
};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your client database</p>
        </div>
    {/* <AddClientDialog onClientAdded={fetchClients} />   */}
        </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input type="text" placeholder="Search clients..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            {/* TODO: Implement Status/Sorting Filters */}
            <div className="flex items-center space-x-4">
              <select className="rounded-lg border border-gray-200 text-sm h-10"> <option>All Clients</option> </select>
              <select className="rounded-lg border border-gray-200 text-sm h-10"> <option>Sort by Name</option> </select>
            </div>
          </div>

          {loading && ( // Show loading specific to client fetch
             <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          )}
          {error && ( // Show client fetch error
             <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
               <AlertCircle className="h-5 w-5 mr-3" />
               <span>Error loading clients: {error}</span>
             </div>
          )}

          {!loading && !error && (
            <div className="grid gap-4">
              {filteredClients.length === 0 ? (
                 <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">
                       {searchTerm ? 'No clients found matching your search.' : 'No clients added yet.'}
                    </p>
                    {!searchTerm && <Button onClick={() => { setSelectedClient(null); setShowNewClient(true); }} className="mt-4">Add First Client</Button>}
                 </div>
              ) : (
                filteredClients.map((client) => (
                  <div key={client.id} className="bg-white rounded-lg border border-gray-100 p-4 hover:border-gray-200 transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-indigo-600">{client.firstName[0]}{client.lastName[0]}</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{client.firstName} {client.lastName}</h3>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center"> <Mail className="h-4 w-4 mr-1" /> {client.email} </div>
                            {client.phone && <div className="flex items-center"> <Phone className="h-4 w-4 mr-1" /> {client.phone} </div>}
                          </div>
                          {/* Removed hardcoded stats */}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Button variant="outline" size="sm" onClick={() => handleBookAppointment(client)}> <Calendar className="h-4 w-4" /> </Button>
                        <Button variant="outline" size="sm" onClick={(e) => handleEditClick(client, e)}> <Edit2 className="h-4 w-4" /> </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={(e) => handleDeleteClick(client, e)}> <Trash2 className="h-4 w-4" /> </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Client Form */}
      <ClientForm
        open={showNewClient}
        onClose={() => setShowNewClient(false)}
        onSubmit={handleNewClientSubmit}
        title="Add New Client"
      />

      {/* Edit Client Form */}
   {showEditClient && (
  <EditClientDialog
    open={showEditClient}
    onClose={() => setShowEditClient(false)}
    client={selectedClient}
    onSuccess={handleEditSuccess}
/>
)}

    </div> // Closing main div
  );
}

export default Clients;