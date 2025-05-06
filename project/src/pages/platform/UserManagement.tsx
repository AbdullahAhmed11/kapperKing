import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UserForm } from '@/components/platform/forms/UserForm';

function UserManagement() {
  const [showNewUser, setShowNewUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleNewUserSubmit = async (data: any) => {
    try {
      // Implement user creation logic here
      console.log('New user data:', data);
      toast.success('User created successfully');
      setShowNewUser(false);
    } catch (error) {
      toast.error('Failed to create user');
    }
  };

  const handleEditUserSubmit = async (data: any) => {
    try {
      // Implement user update logic here
      console.log('Updated user data:', data);
      toast.success('User updated successfully');
      setShowEditUser(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
        <Button onClick={() => setShowNewUser(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* New User Form */}
      <UserForm
        open={showNewUser}
        onClose={() => setShowNewUser(false)}
        onSubmit={handleNewUserSubmit}
      />

      {/* Edit User Form */}
      <UserForm
        open={showEditUser}
        onClose={() => {
          setShowEditUser(false);
          setSelectedUser(null);
        }}
        onSubmit={handleEditUserSubmit}
        initialData={selectedUser}
        title="Edit User"
      />
    </div>
  );
}

export default UserManagement;