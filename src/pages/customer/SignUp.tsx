import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useClientStore } from '@/lib/store/clients'; // To create client record
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Helper to extract query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function CustomerSignUpPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup, loading, logout } = useAuth(); // Destructure logout
  const { addClient } = useClientStore(); // Get addClient action
  const navigate = useNavigate();
  const query = useQuery();
  const salonId = query.get('salonId'); // Get salonId if passed in URL (e.g., from microsite link)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Sign up the user with Supabase Auth
    const { data: authData, error: authError } = await signup(email, password);

    if (authError || !authData.user) {
      toast.error(`Sign up failed: ${authError?.message || 'Unknown error'}`);
      return;
    }

    // 2. Create a corresponding client record
    // We need a salonId. If not in URL, how do we get it?
    // Option: Ask user? Default? For now, require it via URL param.
    if (!salonId) {
       toast.error("Sign up failed: Salon association missing. Please sign up via a specific salon's link.");
       // Log out the user as we can't link them without a salon
       await logout();
       return;
    }

    const clientPayload = {
      salon_id: salonId,
      user_id: authData.user.id, // Link to the created auth user
      firstName,
      lastName,
      email,
      // phone: '', // Phone is optional, collect later?
      marketingConsent: false, // Default consent
    };

    const newClient = await addClient(clientPayload as any); // Use 'as any' if type mismatch

    if (!newClient) {
      toast.error("Account created, but failed to link client profile. Please contact support.");
      // Log out the user as the process is incomplete
      await logout();
      return;
    }

    toast.success('Sign up successful! Please check your email for confirmation if required.');
    // Redirect based on where they came from or to profile
    navigate(query.get('redirect') || '/c/profile'); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Customer Account
          </h2>
           {/* TODO: Show Salon Name if salonId is present */}
           {salonId && <p className="mt-2 text-center text-sm text-gray-600">Signing up for [Salon Name]</p>}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <Label htmlFor="firstName">First Name</Label>
               <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="mt-1"/>
             </div>
             <div>
               <Label htmlFor="lastName">Last Name</Label>
               <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="mt-1"/>
             </div>
          </div>
          <div>
            <Label htmlFor="email-address">Email address</Label>
            <Input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
          </div>

          <div>
            <Button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-5 w-5 mr-3" /> : null}
              Sign up
            </Button>
          </div>
        </form>
         <div className="text-sm text-center">
            Already have an account?{' '}
            <Link to="/c/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Log in
            </Link>
          </div>
      </div>
    </div>
  );
}