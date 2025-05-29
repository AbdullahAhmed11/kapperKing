import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from './supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ 
    error: AuthError | null; 
    isSuperAdmin?: boolean 
  }>;
  signup: (email: string, password: string, options?: { data?: object, emailRedirectTo?: string }) => Promise<{ 
    data: { user: User | null; session: Session | null; }; 
    error: AuthError | null; 
  }>;
  logout: () => Promise<void>;
  updateCustomerEmail: (newEmail: string) => Promise<{ error: Error | null }>;
  updateCustomerPassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  login: async () => ({ error: null }),
  signup: async () => ({ data: { user: null, session: null }, error: null }),
  logout: async () => {},
  updateCustomerEmail: async () => ({ error: null }),
  updateCustomerPassword: async () => ({ error: null }),
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (isMounted) {
          console.log("Auth state changed:", _event, newSession);
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          // Redirect after auth state change if needed
          if (_event === 'SIGNED_IN' && newSession?.user.email === 'superAdmin@gmail.com') {
            navigate('/platform');
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    // --- SUPER ADMIN LOGIN ---
    const superAdminEmail = 'superAdmin@gmail.com';
    const superAdminPassword = '123456789';
    
    if (email === superAdminEmail && password === superAdminPassword) {
      const superAdminUser = {
        id: 'super-admin-id',
        email: superAdminEmail,
        app_metadata: { 
          provider: 'email', 
          roles: ['superAdmin'] 
        },
        user_metadata: { name: 'Super Admin' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User;
      
      await Promise.resolve();
      setUser(superAdminUser);
      setSession(null);
      setLoading(false);
      navigate('/platform');
      return { error: null, isSuperAdmin: true };
    }
    
    // --- DEMO USER LOGIN ---
    const demoEmail = 'admin@kapperking.com';
    const demoPassword = 'admin123';
    const demoUserId = 'demo-user-123';

    if (email === demoEmail && password === demoPassword) {
      await Promise.resolve();
      setUser({
        id: demoUserId, 
        email: demoEmail, 
        app_metadata: { provider: 'email' },
        user_metadata: { name: 'Demo Admin' }, 
        aud: 'authenticated', 
        created_at: new Date().toISOString(),
      } as User);
      setSession(null);
      setLoading(false);
      navigate('/salon');
      return { error: null };
    }
    // --- END DEMO USER LOGIN ---

    // --- Real User Login ---
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error("Supabase login error:", error);
        setLoading(false);
        return { error };
      }
      return { error: null };
    } catch (catchError: any) {
      console.error("Unexpected error during login:", catchError);
      setLoading(false);
      return { 
        error: catchError instanceof AuthError 
          ? catchError 
          : new AuthError(catchError.message || 'Unknown login error') 
      };
    }
  };

  const signup = async (email: string, password: string, options?: { data?: object, emailRedirectTo?: string }) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options
    });
    setLoading(false);
    return { data, error };
  };

  const updateCustomerEmail = async (newEmail: string) => {
    setLoading(true);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) throw new Error("User not authenticated.");

      const { data, error } = await supabase.functions.invoke('update-customer-email', {
        body: { newEmail },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success(data.message || "Email update initiated.");
      setLoading(false);
      return { error: null };

    } catch (error: any) {
      console.error("Error calling update-customer-email function:", error);
      toast.error(`Failed to update email: ${error.message}`);
      setLoading(false);
      return { error };
    }
  };

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

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
      toast.error('Failed to logout');
    }
    setUser(null);
    setSession(null);
    setLoading(false);
    navigate('/login');
  };

  const value = { 
    user, 
    session, 
    loading, 
    login, 
    signup, 
    logout, 
    updateCustomerEmail, 
    updateCustomerPassword 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};