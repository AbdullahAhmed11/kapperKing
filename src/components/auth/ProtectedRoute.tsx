import { Navigate, useLocation } from 'react-router-dom'; // Import useLocation
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react'; // Import Loader

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth(); // Get user and loading state
  const location = useLocation();

  if (loading) {
    // Show a loading indicator while checking auth state
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // TEMPORARILY DISABLED FOR UI VIEWING:
  // if (!user) {
  //   // User not logged in, redirect to appropriate login page
  //   // Determine login path based on current path (simple check for now)
  //   const loginPath = location.pathname.startsWith('/c/') ? '/c/login' : '/login';
  //   // Redirect them to the login page, saving the current location they were trying to go to
  //   return <Navigate to={loginPath} state={{ from: location }} replace />;
  // }

  // User is logged in, render the requested component
  return <>{children}</>;
}