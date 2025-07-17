import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, Calendar, Mail, Phone, Loader2, AlertCircle, X, User } from 'lucide-react';
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
  imageUrl?: string;
  imagePath?:string;
}

interface NewStylistFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  imageFile?: File | null;
}

type JwtPayload = {
  Id: number;
  email?: string;
  name?: string;
};

function Staff() {
  const token = Cookies.get('salonUser');
  const decoded = token ? jwtDecode<JwtPayload>(token) : undefined;

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
    phone: '',
    imageFile: null
  });

  // Edit Staff Dialog State
  const [showEditStaffDialog, setShowEditStaffDialog] = useState(false);
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [editStaffData, setEditStaffData] = useState<NewStylistFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    imageFile: null
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const getStylists = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://kapperking.runasp.net/api/Salons/GetStylists?id=${decoded?.Id}`);
      setStylists(response.data.map((stylist: any) => ({
        ...stylist,
        id: stylist.id.toString(),
        imageUrl: stylist.imageUrl || undefined
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
    setEditStaffData({
      firstName: staffMember.firstName,
      lastName: staffMember.lastName,
      email: staffMember.email,
      password: '',
      phone: staffMember.phone || '',
      imageFile: null
    });
    setPreviewImage(staffMember.imageUrl || null);
    setShowEditStaffDialog(true);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Update form state
      if (isEdit) {
        setEditStaffData(prev => ({
          ...prev,
          imageFile: file
        }));
      } else {
        setNewStylistData(prev => ({
          ...prev,
          imageFile: file
        }));
      }
    }
  };

  const handleAddFormInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewStylistData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditFormInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditStaffData(prev => ({
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
      
      if (newStylistData.imageFile) {
        formData.append('Image', newStylistData.imageFile);
      }

      await axios.post('https://kapperking.runasp.net/api/Users/AddStylist', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Stylist added successfully!');
      setShowAddStylistDialog(false);
      setNewStylistData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        imageFile: null
      });
      setPreviewImage(null);
      getStylists();
    } catch (error) {
      console.error('Error adding stylist:', error);
      // Check if error is an AxiosError and get the response message
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data);
      } else {
        toast.error('Error adding stylist');
      }
      
    } finally {
      setIsAddingStylist(false);
    }
  };

  const handleEditStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingStaff(true);

    try {
      const formData = new FormData();
      formData.append('Id', selectedStaff?.id || '');
      formData.append('FirstName', editStaffData.firstName);
      formData.append('LastName', editStaffData.lastName);
      formData.append('Email', editStaffData.email);
      formData.append('Phone', editStaffData.phone);
      
      if (editStaffData.password) {
        formData.append('Password', editStaffData.password);
      }
      
      if (editStaffData.imageFile) {
        formData.append('Image', editStaffData.imageFile);
      }

      await axios.post('https://kapperking.runasp.net/api/Users/EditAdmin', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Staff member updated successfully!');
      setShowEditStaffDialog(false);
      setPreviewImage(null);
      getStylists();
    } catch (error) {
      console.error('Error updating staff:', error);
      // toast.error('Failed to update staff. Please try again.');
          if (axios.isAxiosError(error)) {
        toast.error(error.response?.data);
      } else {
        toast.error('Error adding stylist');
      }
    } finally {
      setIsEditingStaff(false);
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
                      <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {staffMember.imagePath ? (
                          <img 
                            src={`https://kapperking.runasp.net${staffMember.imagePath}`} 
                            alt={`${staffMember.firstName} ${staffMember.lastName}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-8 w-8 text-indigo-600" />
                        )}
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
      <Dialog open={showAddStylistDialog} onOpenChange={(open) => {
        if (!open) {
          setPreviewImage(null);
        }
        setShowAddStylistDialog(open);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Stylist</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new stylist to your salon.
            </DialogDescription>
            <button 
              onClick={() => {
                setShowAddStylistDialog(false);
                setPreviewImage(null);
              }} 
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          
          <form onSubmit={handleAddStylistSubmit} className="space-y-4">
            {/* Image Upload */}
            <div className="flex flex-col items-center space-y-2">
              <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Photo
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleImageChange(e)}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium leading-none">
                  First Name
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={newStylistData.firstName}
                  onChange={handleAddFormInputChange}
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
                  onChange={handleAddFormInputChange}
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
                onChange={handleAddFormInputChange}
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
                onChange={handleAddFormInputChange}
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
                onChange={handleAddFormInputChange}
                required
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowAddStylistDialog(false);
                  setPreviewImage(null);
                }}
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

      {/* Edit Staff Dialog */}
      <Dialog open={showEditStaffDialog} onOpenChange={(open) => {
        if (!open) {
          setPreviewImage(null);
        }
        setShowEditStaffDialog(open);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update the details for {selectedStaff?.firstName} {selectedStaff?.lastName}.
            </DialogDescription>
            <button 
              onClick={() => {
                setShowEditStaffDialog(false);
                setPreviewImage(null);
              }} 
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          
          <form onSubmit={handleEditStaffSubmit} className="space-y-4">
            {/* Image Upload */}
            <div className="flex flex-col items-center space-y-2">
              <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="h-full w-full object-cover"
                  />
                ) : selectedStaff?.imageUrl ? (
                  <img 
                    src={selectedStaff.imageUrl} 
                    alt={`${selectedStaff.firstName} ${selectedStaff.lastName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => editFileInputRef.current?.click()}
              >
                Change Photo
              </Button>
              <input
                type="file"
                ref={editFileInputRef}
                onChange={(e) => handleImageChange(e, true)}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="editFirstName" className="text-sm font-medium leading-none">
                  First Name
                </label>
                <Input
                  id="editFirstName"
                  name="firstName"
                  value={editStaffData.firstName}
                  onChange={handleEditFormInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="editLastName" className="text-sm font-medium leading-none">
                  Last Name
                </label>
                <Input
                  id="editLastName"
                  name="lastName"
                  value={editStaffData.lastName}
                  onChange={handleEditFormInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="editEmail" className="text-sm font-medium leading-none">
                Email
              </label>
              <Input
                id="editEmail"
                name="email"
                type="email"
                value={editStaffData.email}
                onChange={handleEditFormInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="editPassword" className="text-sm font-medium leading-none">
                New Password (leave blank to keep current)
              </label>
              <Input
                id="editPassword"
                name="password"
                type="password"
                value={editStaffData.password}
                onChange={handleEditFormInputChange}
                placeholder="Leave blank to keep current password"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="editPhone" className="text-sm font-medium leading-none">
                Phone Number
              </label>
              <Input
                id="editPhone"
                name="phone"
                value={editStaffData.phone}
                onChange={handleEditFormInputChange}
                required
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowEditStaffDialog(false);
                  setPreviewImage(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isEditingStaff}>
                {isEditingStaff ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : 'Update Staff'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Staff;