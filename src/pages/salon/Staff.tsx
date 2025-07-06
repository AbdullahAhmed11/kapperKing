import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Calendar, Mail, Phone, Loader2, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie'; 

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

interface NewStylistFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}
type JwtPayload = {
  Id: number; // adjust this to match your token's structure
  email?: string;
  name?: string;
  // any other fields you expect
};
function Staff() {
  const token = Cookies.get('salonUser');
  
  const decoded = jwtDecode<JwtPayload>(token);
  if (token) {
    const decoded = jwtDecode<JwtPayload>(token);
    console.log('User ID:', decoded.Id);
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [stylists, setStylists] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showAvailability, setShowAvailability] = useState(false);
  
  // Add Stylist Dialog State
  const [showAddStylistDialog, setShowAddStylistDialog] = useState(false);
  const [isAddingStylist, setIsAddingStylist] = useState(false);
  const [newStylistData, setNewStylistData] = useState<NewStylistFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  });

  const getStylists = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://kapperking.runasp.net/api/Salons/GetStylists?id=${decoded?.Id}`);
      setStylists(response.data.map((stylist: any) => ({
        ...stylist,
        id: stylist.id.toString()
      })));
      setError(null);
    } catch (err) {
      setError('Failed to load stylists');
      console.error('Error fetching stylists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStylists();
  }, []);

  const handleEditClick = (staffMember: StaffMember, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStaff(staffMember);
    // Implement edit functionality as needed
  };

  const handleDeleteClick = async (staffMember: StaffMember, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${staffMember.firstName} ${staffMember.lastName}?`)) {
      try {
        await axios.delete(`https://kapperking.runasp.net/api/Users/DeleteUser?id=${staffMember.id}`);
        toast.success('Stylist deleted successfully');
        getStylists();
      } catch (err) {
        toast.error('Failed to delete stylist');
        console.error('Error deleting stylist:', err);
      }
    }
  };

  const handleAvailabilityClick = (staffMember: StaffMember, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStaff(staffMember);
    setShowAvailability(true);
  };

  const handleNewStylistInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStylistData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddStylistSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsAddingStylist(true);

  try {
    const formData = new FormData();
    formData.append('SalonId', decoded?.Id.toString() || '');
    formData.append('FirstName', newStylistData.firstName);
    formData.append('LastName', newStylistData.lastName);
    formData.append('Email', newStylistData.email);
    formData.append('Password', newStylistData.password);
    formData.append('Phone', newStylistData.phone);

    await axios.post('https://kapperking.runasp.net/api/Users/AddStylist', formData);

    toast.success('Stylist added successfully!');
    setShowAddStylistDialog(false);
    setNewStylistData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: ''
    });
    getStylists();
  } catch (error) {
    console.error('Error adding stylist:', error);
    toast.error('Failed to add stylist. Please try again.');
  } finally {
    setIsAddingStylist(false);
  }
};


  const filteredStaff = stylists.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (error) {
    return <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Staff</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your salon's team</p>
        </div>
        <Button onClick={() => setShowAddStylistDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Stylist
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Search staff..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-9" 
              />
            </div>
            <div className="flex items-center space-x-4">
              <select className="rounded-lg border border-gray-200 text-sm h-10">
                <option>All Roles</option>
                <option>Stylist</option>
                <option>Assistant</option>
              </select>
              <select className="rounded-lg border border-gray-200 text-sm h-10">
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredStaff.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">
                  {searchTerm ? 'No stylists found matching your search.' : 'No stylists available.'}
                </p>
              </div>
            ) : (
              filteredStaff.map((staffMember) => (
                <div key={staffMember.id} className="bg-white rounded-lg border border-gray-100 p-4 hover:border-gray-200 transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-indigo-600">
                          {staffMember.firstName[0]}{staffMember.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {staffMember.firstName} {staffMember.lastName}
                        </h3>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" /> {staffMember.email}
                          </div>
                          {staffMember.phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" /> {staffMember.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => handleAvailabilityClick(staffMember, e)}
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => handleEditClick(staffMember, e)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700" 
                        onClick={(e) => handleDeleteClick(staffMember, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Stylist Dialog */}
      <Dialog open={showAddStylistDialog} onOpenChange={setShowAddStylistDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Stylist</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new stylist to your salon.
            </DialogDescription>
            <button 
              onClick={() => setShowAddStylistDialog(false)} 
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          
          <form onSubmit={handleAddStylistSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium leading-none">
                  First Name
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={newStylistData.firstName}
                  onChange={handleNewStylistInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium leading-none">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={newStylistData.lastName}
                  onChange={handleNewStylistInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newStylistData.email}
                onChange={handleNewStylistInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium leading-none">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={newStylistData.password}
                onChange={handleNewStylistInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium leading-none">
                Phone Number
              </label>
              <Input
                id="phone"
                name="phone"
                value={newStylistData.phone}
                onChange={handleNewStylistInputChange}
                required
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddStylistDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isAddingStylist}>
                {isAddingStylist ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : 'Add Stylist'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Staff;