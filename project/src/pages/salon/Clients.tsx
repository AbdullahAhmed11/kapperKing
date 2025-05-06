import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Calendar, Phone, Mail, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClientForm } from '@/components/clients/ClientForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  lastVisit: string;
  totalVisits: number;
  preferredService: string;
  loyaltyPoints: number;
  status: 'active' | 'inactive';
}

function Clients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClient, setShowNewClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showEditClient, setShowEditClient] = useState(false);

  const clients: Client[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+31 6 12345678',
      notes: 'Prefers afternoon appointments',
      lastVisit: '2024-03-10',
      totalVisits: 12,
      preferredService: 'Haircut',
      loyaltyPoints: 120,
      status: 'active'
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '+31 6 87654321',
      notes: 'Allergic to certain hair dyes',
      lastVisit: '2024-03-08',
      totalVisits: 8,
      preferredService: 'Color & Cut',
      loyaltyPoints: 80,
      status: 'active'
    }
  ];

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
  };

  const handleEditClick = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClient(client);
    setShowEditClient(true);
  };

  const handleDeleteClick = async (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${client.firstName} ${client.lastName}?`)) {
      try {
        // Implement delete logic here
        toast.success('Client deleted successfully');
      } catch (error) {
        toast.error('Failed to delete client');
      }
    }
  };

  const handleNewClientSubmit = async (data: any) => {
    try {
      // Implement create logic here
      console.log('New client data:', data);
      toast.success('Client created successfully');
      setShowNewClient(false);
    } catch (error) {
      toast.error('Failed to create client');
    }
  };

  const handleEditClientSubmit = async (data: any) => {
    try {
      // Implement update logic here
      console.log('Updated client data:', data);
      toast.success('Client updated successfully');
      setShowEditClient(false);
      setSelectedClient(null);
    } catch (error) {
      toast.error('Failed to update client');
    }
  };

  const handleBookAppointment = (client: Client) => {
    // Implement booking logic or navigation
    console.log('Book appointment for:', client);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your client database</p>
        </div>
        <Button onClick={() => setShowNewClient(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
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
                <option>All Clients</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
              <select className="rounded-lg border border-gray-200 text-sm">
                <option>Sort by Name</option>
                <option>Sort by Last Visit</option>
                <option>Sort by Total Visits</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4">
            {clients.map((client) => (
              <div
                key={client.id}
                onClick={() => handleClientClick(client)}
                className="bg-white rounded-lg border border-gray-100 p-4 hover:border-gray-200 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-600">
                        {client.firstName[0]}{client.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {client.firstName} {client.lastName}
                      </h3>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {client.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {client.phone}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm">
                        <div className="flex items-center text-yellow-600">
                          <Star className="h-4 w-4 mr-1" />
                          {client.loyaltyPoints} points
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          Last visit: {client.lastVisit}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleBookAppointment(client)}
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => handleEditClick(client, e)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={(e) => handleDeleteClick(client, e)}
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

      {/* New Client Form */}
      <ClientForm
        open={showNewClient}
        onClose={() => setShowNewClient(false)}
        onSubmit={handleNewClientSubmit}
      />

      {/* Edit Client Form */}
      <ClientForm
        open={showEditClient}
        onClose={() => {
          setShowEditClient(false);
          setSelectedClient(null);
        }}
        onSubmit={handleEditClientSubmit}
        initialData={selectedClient}
        title="Edit Client"
      />

      {/* Client Details Dialog */}
      <Dialog open={!!selectedClient && !showEditClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-xl font-medium text-indigo-600">
                    {selectedClient.firstName[0]}{selectedClient.lastName[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedClient.firstName} {selectedClient.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{selectedClient.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Contact</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedClient.email}
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedClient.phone}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Stats</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 mr-2 text-yellow-400" />
                      {selectedClient.loyaltyPoints} loyalty points
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedClient.totalVisits} total visits
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                <p className="mt-2 text-sm text-gray-700">{selectedClient.notes}</p>
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedClient(null);
                    setShowEditClient(true);
                  }}
                >
                  Edit Client
                </Button>
                <Button onClick={() => handleBookAppointment(selectedClient)}>
                  Book Appointment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Clients;