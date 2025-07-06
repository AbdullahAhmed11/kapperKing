import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Revert imports
import { Toaster } from 'sonner';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './lib/auth';
// No PageStoreProvider needed with Zustand
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Layouts
import PlatformLayout from './components/platform/PlatformLayout';
import SalonLayout from './components/salon/SalonLayout';
import MarketingLayout from './components/marketing/MarketingLayout';

// Marketing Pages
import LandingPage from './pages/marketing/LandingPage';
import Features from './pages/marketing/Features';
import OnlineAgenda from './pages/marketing/features/OnlineAgenda';
import OnlineBooking from './pages/marketing/features/OnlineBooking';
import PosInventory from './pages/marketing/features/PosInventory';
import ClientManagement from './pages/marketing/features/ClientManagement';
import MarketingTools from './pages/marketing/features/MarketingTools';
import Analytics from './pages/marketing/features/Analytics';
import Pricing from './pages/marketing/Pricing';
import Contact from './pages/marketing/Contact';
import TermsOfService from './pages/marketing/TermsOfService';
import About from './pages/marketing/About';
import PrivacyPolicy from './pages/marketing/PrivacyPolicy';

// Auth Pages
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';

// Platform Admin Pages
import PlatformDashboard from './pages/platform/Dashboard';
import SalonManagement from './pages/platform/SalonManagement';
import ClientsManagement from './pages/platform/ClientManagement';
import SubscriptionPlans from './pages/platform/SubscriptionPlans';
import MarketingManagement from './pages/platform/MarketingManagement';
import WebsiteManagement from './pages/platform/WebsiteManagement';
import AppearanceManagement from './pages/platform/AppearanceManagement';
import PlatformSettings from './pages/platform/Settings';

// Salon Pages
import SalonDashboard from './pages/salon/Dashboard';
import Appointments from './pages/salon/Appointments';
import Clients from './pages/salon/Clients';
import Services from './pages/salon/Services';
import Staff from './pages/salon/Staff';
import Marketing from './pages/salon/Marketing';
import Reports from './pages/salon/Reports';
import Settings from './pages/salon/Settings';
import Website from './pages/salon/Website';
import SalonOnlineBooking from './pages/salon/OnlineBooking';

// Microsite Pages
import SalonMicrosite from './pages/salon/[slug]';
import SalonBooking from './pages/salon/[slug]/book';

// No loader needed for BrowserRouter setup
// const marketingPageLoader = ... (Remove loader)

function App() {
  return (
    // Use original BrowserRouter structure
    <Router> 
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Marketing/Public Routes */}
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<Features />} />
              <Route path="/features/online-agenda" element={<OnlineAgenda />} />
              <Route path="/features/online-booking" element={<OnlineBooking />} />
              <Route path="/features/pos-inventory" element={<PosInventory />} />
              <Route path="/features/client-management" element={<ClientManagement />} />
              <Route path="/features/marketing-tools" element={<MarketingTools />} />
              <Route path="/features/analytics" element={<Analytics />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/about" element={<About />} /> 
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Platform Admin Routes */}
            <Route
              path="/platform"
              element={
                <ProtectedRoute>
                  <PlatformLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<PlatformDashboard />} />
              <Route path="salons" element={<SalonManagement />} />
              <Route path="clients" element={<ClientsManagement />} />
              <Route path="subscriptions" element={<SubscriptionPlans />} />
              <Route path="marketing" element={<MarketingManagement />} />
              <Route path="website" element={<WebsiteManagement />} />
              <Route path="appearance" element={<AppearanceManagement />} />
              <Route path="settings" element={<PlatformSettings />} />
            </Route>

            {/* Salon Dashboard Routes */}
            <Route
              path="/salon"
              element={
                <ProtectedRoute>
                  <SalonLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SalonDashboard />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="clients" element={<Clients />} />
              <Route path="services" element={<Services />} />
              <Route path="staff" element={<Staff />} />
              <Route path="marketing" element={<Marketing />} />
              <Route path="website" element={<Website />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="online-booking" element={<SalonOnlineBooking />} />
            </Route>

            {/* Salon Microsite Routes */}
            <Route path="/s/:slug" element={<SalonMicrosite />} />
            <Route path="/s/:slug/book" element={<SalonBooking />} />
            
          </Routes>
          <Toaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;