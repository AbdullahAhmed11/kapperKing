import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from './supabase'; // Import Supabase client
import { Session, User, AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner'; // Import toast
import { useNavigate } from 'react-router-dom'; // Keep for potential redirects

// Define the shape of the context data
interface AuthContextType {
  user: User | null;
  session: Session | null; // Add session state
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signup: (email: string, password: string, options?: { data?: object, emailRedirectTo?: string }) => Promise<{ data: { user: User | null; session: Session | null; }; error: AuthError | null; }>;
  logout: () => Promise<void>;
  updateCustomerEmail: (newEmail: string) => Promise<{ error: Error | null }>; // Add email update
  updateCustomerPassword: (newPassword: string) => Promise<{ error: Error | null }>; // Add password update
  // Add other methods if needed (e.g., password reset, update user)
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true, // Start loading true until session is checked
  login: async () => ({ error: null }),
  signup: async () => ({ data: { user: null, session: null }, error: null }),
  logout: async () => {},
  updateCustomerEmail: async () => ({ error: null }), // Add default
  updateCustomerPassword: async () => ({ error: null }), // Add default
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Keep if redirects are needed after auth actions

  useEffect(() => {
    let isMounted = true; // Prevent state updates on unmounted component

    // Check initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (isMounted) {
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setLoading(false);
      }
    }).catch(error => {
       console.error("Error getting initial session:", error);
       if (isMounted) setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (isMounted) {
           console.log("Auth state changed:", _event, newSession);
           setSession(newSession);
           setUser(newSession?.user ?? null);
           // setLoading(false); // Might not need loading here as initial load is handled
        }
      }
    );

    // Cleanup listener on unmount
    return () => {
       isMounted = false;
       subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    // --- DEMO USER LOGIN ---
    const demoEmail = 'admin@kapperking.com';
    const demoPassword = 'admin123'; // Ensure this matches UI
    const demoUserId = 'demo-user-123'; // Consistent demo ID

    if (email === demoEmail && password === demoPassword) {
       console.log("Attempting demo login...");
       // Use a microtask delay to potentially allow state to propagate before returning
       await Promise.resolve(); // Add microtask delay
       setUser({
          id: demoUserId, email: demoEmail, app_metadata: { provider: 'email' },
          user_metadata: { name: 'Demo Admin' }, aud: 'authenticated', created_at: new Date().toISOString(),
       } as User);
       setSession(null);
       setLoading(false);
       console.log("Demo login successful, user state set.");
       return { error: null };
    }
    // --- END DEMO USER LOGIN ---

    // --- Real User Login ---
    try {
       const { error } = await supabase.auth.signInWithPassword({ email, password });
       if (error) {
          console.error("Supabase login error:", error);
          setLoading(false); // Set loading false only on error here
          return { error };
       }
       // setLoading(false) is handled by onAuthStateChange effect
       return { error: null };
    } catch (catchError: any) { // Add type annotation
       console.error("Unexpected error during login:", catchError);
       setLoading(false);
       return { error: catchError instanceof AuthError ? catchError : new AuthError(catchError.message || 'Unknown login error') }; // Ensure AuthError
    }
  };

  // Signup function
  const signup = async (email: string, password: string, options?: { data?: object, emailRedirectTo?: string }) => {
     setLoading(true);
     const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options
     });
     // onAuthStateChange might handle setting user state if email confirmation is off,
     // otherwise user needs to confirm email.
     setLoading(false);
     return { data, error };
  };

  // Update Customer Email function
  const updateCustomerEmail = async (newEmail: string) => {
     setLoading(true);
     try {
       // Ensure user is logged in and we have a session token
       const session = (await supabase.auth.getSession()).data.session;
       if (!session) throw new Error("User not authenticated.");

       const { data, error } = await supabase.functions.invoke('update-customer-email', {
         body: { newEmail },
         headers: { Authorization: `Bearer ${session.access_token}` } // Pass JWT
       });

       if (error) throw error;
       if (data.error) throw new Error(data.error);

       toast.success(data.message || "Email update initiated. Check new email for confirmation.");
       // Note: User object in state might not update until confirmation or next login
       setLoading(false);
       return { error: null };

     } catch (error: any) {
       console.error("Error calling update-customer-email function:", error);
       toast.error(`Failed to update email: ${error.message}`);
       setLoading(false);
       return { error };
     }
  };

  // Update Customer Password function
  const updateCustomerPassword = async (newPassword: string) => {
     setLoading(true);
     try {
       const session = (await supabase.auth.getSession()).data.session;
       if (!session) throw new Error("User not authenticated.");

       const { data, error } = await supabase.functions.invoke('update-customer-password', {
         body: { newPassword },
         headers: { Authorization: `Bearer ${session.access_token}` }
       });

       if (error) throw error;
       if (data.error) throw new Error(data.error);

       toast.success(data.message || "Password updated successfully.");
       setLoading(false);
       return { error: null };

     } catch (error: any) {
       console.error("Error calling update-customer-password function:", error);
       toast.error(`Failed to update password: ${error.message}`);
       setLoading(false);
       return { error };
     }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
       console.error("Error logging out:", error);
       // Handle error appropriately, maybe show a toast
    }
    // State updates handled by onAuthStateChange listener
    setLoading(false);
    // Optional: Redirect after logout
    // navigate('/login'); 
  };

  // Value provided by the context
  // Value provided by the context
  const value = { user, session, loading, login, signup, logout, updateCustomerEmail, updateCustomerPassword };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};