import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Store, Users, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClientForm } from '@/components/platform/forms/ClientForm';
import { useClientStore } from '@/lib/store/clients';
import { useSalonStore } from '@/lib/store/salon';
import { useSubscriptionPlanStore } from '@/lib/store/subscriptionPlans';

function ClientManagement() {
  const [showNewClient, setShowNewClient] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { 
    clients = [], // Provide default empty array
    loading, 
    fetchClients, 
    createClient, 
    updateClient, 
    deleteClient,
    searchClients 
  } = useClientStore();

  const { salons = [], fetchSalons } = useSalonStore();
  const { plans = [], fetchPlans } = useSubscriptionPlanStore();

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchClients(),
          fetchSalons(),
          fetchPlans()
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      searchClients(searchTerm);
    } else {
      fetchClients();
    }
  }, [searchTerm]);

  const handleNewClientSubmit = async (data: any) => {
    await createClient(data);
    setShowNewClient(false);
  };

  const handleEditClientSubmit = async (data: any) => {
    if (selectedClient) {
      await updateClient(selectedClient.id, data);
      setShowEditClient(false);
      setSelectedClient(null);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      await deleteClient(clientId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Client Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage platform clients and their salon access</p>
        </div>
        <Button onClick={() => setShowNewClient(true)}>
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
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center space-x-4">
          <select className="rounded-lg border border-gray-200 text-sm">
            <option>All Plans</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>
          <select className="rounded-lg border border-gray-200 text-sm">
            <option>All Salons</option>
            {salons.map(salon => (
              <option key={salon.id} value={salon.id}>{salon.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clients.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No clients found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first client
            </p>
            <Button
              onClick={() => setShowNewClient(true)}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Client
            </Button>
          </div>
        ) : (
          clients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-all duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-indigo-600">
                      {client.firstName[0]}{client.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {client.firstName} {client.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{client.email}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
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
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteClient(client.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {client.phone && (
                  <p className="text-sm text-gray-500">
                    📞 {client.phone}
                  </p>
                )}
                {client.company && (
                  <p className="text-sm text-gray-500">
                    🏢 {client.company}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Managed Salons</h4>
                <div className="flex flex-wrap gap-2">
                  {client.salons?.map((salonId) => {
                    const salon = salons.find(s => s.id === salonId);
                    return salon ? (
                      <span
                        key={salonId}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        <Store className="h-3 w-3 mr-1" />
                        {salon.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <Settings className="h-4 w-4 mr-1" />
                    <span>
                      {plans.find(p => p.id === client.subscriptionPlan)?.name || 'No Plan'}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    client.marketingConsent
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {client.marketingConsent ? 'Marketing: Yes' : 'Marketing: No'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Forms */}
      <ClientForm
        open={showNewClient}
        onClose={() => setShowNewClient(false)}
        onSubmit={handleNewClientSubmit}
        availableSalons={salons}
        availablePlans={plans}
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
        availableSalons={salons}
        availablePlans={plans}
      />
    </div>
  );
}

export default ClientManagement;