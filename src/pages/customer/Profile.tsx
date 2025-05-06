import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useClientStore, Client } from '@/lib/store/clients';
import { useAppointmentStore, Appointment } from '@/lib/store/appointments';
import { useLoyaltyStore, LoyaltyRedemption } from '@/lib/store/loyalty';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, User, Calendar, Star, Settings, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';

export default function CustomerProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { currentCustomerClient, fetchCurrentCustomerClient, loadingCustomer, error: clientError } = useClientStore();
  const { appointments, fetchAppointmentsByClientId, loading: appointmentsLoading, error: appointmentError } = useAppointmentStore();
  const { redemptions, fetchRedemptionsByClientId, loadingRedemptions, error: redemptionError } = useLoyaltyStore();

  useEffect(() => {
    if (user?.id && !authLoading) {
      fetchCurrentCustomerClient(user.id);
    }
  }, [user?.id, authLoading, fetchCurrentCustomerClient]);

  useEffect(() => {
    if (currentCustomerClient?.id) {
      fetchAppointmentsByClientId(currentCustomerClient.id);
      fetchRedemptionsByClientId(currentCustomerClient.id);
    }
  }, [currentCustomerClient?.id, fetchAppointmentsByClientId, fetchRedemptionsByClientId]);

  const isLoading = authLoading || loadingCustomer || appointmentsLoading || loadingRedemptions;
  const combinedError = clientError || appointmentError || redemptionError;

  if (isLoading) {
    return <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (combinedError) {
     return <div className="min-h-screen flex items-center justify-center p-4"><AlertCircle className="h-8 w-8 mr-3 text-red-500"/> Error loading profile: {combinedError}</div>;
  }

  if (!currentCustomerClient) {
    return (
       <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
             <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4"/>
             <p className="text-lg text-gray-700">Could not load profile data. Please log in or ensure your account is linked to a client profile.</p>
             <Button asChild className="mt-4"><Link to="/c/login">Log In</Link></Button>
          </div>
       </div>
    );
  }

  const customerAppointments = appointments;

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8 space-y-8">
       <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <Button variant="outline" size="sm" asChild>
             <Link to="/c/settings"><Settings className="h-4 w-4 mr-2"/>Account Settings</Link>
          </Button>
       </div>

       {/* Loyalty & QR Code Card */}
       <Card>
          <CardHeader>
             <CardTitle className="flex items-center"><Star className="h-5 w-5 mr-2 text-yellow-500"/>Loyalty Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
             <div className="flex-1 space-y-1">
                <p>Current Points: <span className="font-semibold">{currentCustomerClient?.loyalty_points ?? 0}</span></p>
                <p>Current Tier: <span className="font-semibold">{currentCustomerClient?.loyalty_tier?.name ?? 'None'}</span></p>
                <Button variant="link" className="p-0 h-auto mt-2" asChild><Link to="/c/rewards">View Rewards Catalog</Link></Button>
             </div>
             {/* Display QR Code SVG if identifier exists */}
             {currentCustomerClient?.loyalty_identifier && (
                <div className="text-center">
                   <QRCodeSVG 
                      value={currentCustomerClient.loyalty_identifier} 
                      size={128} 
                      level="M"
                      includeMargin={true}
                   />
                   <p className="text-xs text-gray-500 mt-2">Scan for check-in / points</p>
                </div>
             )}
          </CardContent>
       </Card>

       {/* Upcoming Appointments */}
       <Card>
          <CardHeader>
             <CardTitle className="flex items-center"><Calendar className="h-5 w-5 mr-2 text-blue-500"/>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
             {customerAppointments.filter(a => new Date(a.start_time) >= new Date() && a.status !== 'cancelled' && a.status !== 'completed').length > 0 ? (
                <Table>
                   <TableHeader>
                      <TableRow>
                         <TableHead>Date & Time</TableHead>
                         <TableHead>Service</TableHead>
                         <TableHead>Staff</TableHead>
                         <TableHead>Status</TableHead>
                         <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {customerAppointments
                         .filter(a => new Date(a.start_time) >= new Date() && a.status !== 'cancelled' && a.status !== 'completed')
                         .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                         .map(app => (
                         <TableRow key={app.id}>
                            <TableCell>{format(new Date(app.start_time), 'PPpp')}</TableCell>
                            <TableCell>{app.service?.name || 'N/A'}</TableCell>
                            <TableCell>{app.staff?.firstName || 'N/A'}</TableCell>
                            <TableCell><Badge variant={app.status === 'confirmed' ? 'default' : 'secondary'} className="capitalize">{app.status}</Badge></TableCell>
                            <TableCell className="text-right">
                               <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {}}
                                  disabled={appointmentsLoading}
                               >
                                  Cancel
                               </Button>
                               {/* Add Reschedule button linking to booking page */}
                               <Button variant="outline" size="sm" asChild>
                                  <Link to={`/s/${currentCustomerClient?.salon_slug}/book?serviceId=${app.service_id}&staffId=${app.staff_id}`}>Reschedule</Link>
                               </Button>
                            </TableCell>
                         </TableRow>
                      ))}
                   </TableBody>
                </Table>
             ) : (
                <p className="text-gray-500 text-center py-4">No upcoming appointments.</p>
             )}
          </CardContent>
       </Card>

       {/* Redemption History */}
       <Card>
          <CardHeader>
             <CardTitle className="flex items-center"><Gift className="h-5 w-5 mr-2 text-purple-500"/>Redemption History</CardTitle>
          </CardHeader>
          <CardContent>
             {redemptions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No rewards redeemed yet.</p>
             ) : (
                <Table>
                   <TableHeader>
                      <TableRow>
                         <TableHead>Date</TableHead>
                         <TableHead>Reward</TableHead>
                         <TableHead>Points Spent</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {redemptions.map((redemption: LoyaltyRedemption) => (
                         <TableRow key={redemption.id}>
                            <TableCell>{format(new Date(redemption.redeemed_at), 'PP')}</TableCell>
                            <TableCell>{redemption.loyalty_rewards?.name || 'N/A'}</TableCell>
                            <TableCell>{redemption.points_spent}</TableCell>
                         </TableRow>
                      ))}
                   </TableBody>
                </Table>
             )}
          </CardContent>
       </Card>

    </div>
  );
}