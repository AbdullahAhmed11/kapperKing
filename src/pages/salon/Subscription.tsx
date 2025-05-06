import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AlertCircle, CreditCard, CalendarDays, Loader2, Users, FileText, BarChartHorizontal, Edit, Trash2, Settings } from 'lucide-react'; // Added icons
import { Progress } from "@/components/ui/progress"; // Import Progress
import { Switch } from "@/components/ui/switch"; // Import Switch
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Import Table components

// TODO: Fetch actual subscription, usage, billing data from backend

export default function SalonSubscription() {
  const navigate = useNavigate(); // Initialize useNavigate
  // Placeholder data - replace with actual fetched data
  const [isLoading, setIsLoading] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRenew, setAutoRenew] = useState(true); // Example state for toggle

  // More detailed placeholder data matching the screenshot structure
  const subscription = {
    planName: 'Professional Plan',
    priceString: '$49.99/month', // Example
    status: 'active', // 'trialing', 'active', 'past_due', 'canceled'
    trialEndsAt: null, // Set if status is 'trialing'
    currentPeriodEnd: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // Example: 20 days left in period
    usage: {
      staff: { current: 8, limit: 10 },
      appointments: { current: 450, limit: 500 }, // Example limits
      storage: { current: 4.2, limit: 5, unit: 'GB' },
    },
    paymentMethod: {
      brand: 'Visa',
      last4: '4242',
      expires: '12/25',
    },
    billingInfo: {
      companyName: 'Salon Manager Pro',
      email: 'billing@salonmanager.com',
      address: '123 Salon St\nSuite 100\nCity, State 12345', // Example address
    },
    // Example invoice structure
    invoices: [
      { id: 'inv_1', date: '2025-03-01', amount: 49.99, status: 'Paid', pdfUrl: '#' },
      { id: 'inv_2', date: '2025-02-01', amount: 49.99, status: 'Paid', pdfUrl: '#' },
      { id: 'inv_3', date: '2025-01-01', amount: 49.99, status: 'Paid', pdfUrl: '#' },
    ]
  };

  const handleManageSubscription = async () => {
    setIsManaging(true);
    setError(null);
    console.log("Attempting to create Stripe Customer Portal session...");
    // TODO (Backend): Call backend to get Stripe Portal URL and redirect
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.info("Redirecting to Stripe portal... (Simulation)");
    // window.location.href = portalUrl;
    // setIsManaging(false); // Only if redirect fails
  };

  const handleCancelSubscription = () => {
    // TODO: Implement logic to call backend cancellation function
    if (window.confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
       toast.info('Simulating subscription cancellation request...');
       // Call backend function here
    }
  };

  const handleChangePlan = () => {
     // TODO: Implement logic to show plan change options/modal or redirect
     toast.info('Change Plan functionality not yet implemented.');
  };

  // Map status to existing Badge variants
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'default';
      case 'past_due':
        return 'secondary';
      case 'canceled':
      default:
        return 'destructive';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
        <AlertCircle className="h-5 w-5 mr-3" />
        <span>Error loading subscription details: {error}</span>
      </div>
    );
  }

  if (!subscription) {
     return <div className="p-6 text-gray-500">No active subscription found.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Subscription Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your subscription plan and billing preferences</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/salon/settings')}> {/* Assuming settings page exists */}
           Back to Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (Plan & Usage) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Current Plan Card */}
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-start p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <div>
                  <h4 className="font-semibold text-lg text-indigo-800">{subscription.planName}</h4>
                  <p className="text-sm text-indigo-600">{subscription.priceString}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleChangePlan}>Change Plan</Button>
                  {subscription.status !== 'canceled' && (
                     <Button variant="destructive" size="sm" onClick={handleCancelSubscription}>Cancel Plan</Button>
                  )}
                </div>
              </div>
              {/* Usage Limits */}
              <div className="space-y-3 pt-4">
                 <UsageBar label="Staff Members" current={subscription.usage.staff.current} limit={subscription.usage.staff.limit} />
                 <UsageBar label="Monthly Appointments" current={subscription.usage.appointments.current} limit={subscription.usage.appointments.limit} />
                 <UsageBar label="Storage Used" current={subscription.usage.storage.current} limit={subscription.usage.storage.limit} unit={subscription.usage.storage.unit} />
              </div>
            </CardContent>
          </Card>

          {/* Usage Analytics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              {/* TODO: Add date range selector */}
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Resource Usage</h4>
                  {/* Placeholder for Resource Usage Graph */}
                  <div className="h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">
                     Resource Usage Graph Placeholder
                  </div>
               </div>
               <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Billing History (Amount)</h4>
                   {/* Placeholder for Billing History Bar Chart */}
                   <div className="h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">
                      Billing History Graph Placeholder
                   </div>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Payment & Billing) */}
        <div className="lg:col-span-1 space-y-8">
          {/* Payment Method Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                 <span>Payment Method</span>
                 <Button variant="ghost" size="sm" onClick={handleManageSubscription} disabled={isManaging}>
                    <Edit size={14} className="mr-1" /> Edit
                 </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription.paymentMethod ? (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded border">
                   {/* Basic icon mapping */}
                   <CreditCard className="h-6 w-6 text-gray-600" />
                   <div>
                      <p className="text-sm font-medium text-gray-800 capitalize">{subscription.paymentMethod.brand} ending in {subscription.paymentMethod.last4}</p>
                      <p className="text-xs text-gray-500">Expires {subscription.paymentMethod.expires}</p>
                   </div>
                </div>
              ) : (
                 <Button onClick={handleManageSubscription} disabled={isManaging} className="w-full">
                    {isManaging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Payment Method
                 </Button>
              )}
              <div className="flex items-center justify-between pt-2">
                 <Label htmlFor="auto-renew" className="text-sm font-medium text-gray-700">Auto-renew subscription</Label>
                 <Switch
                   id="auto-renew"
                   checked={autoRenew}
                   onCheckedChange={setAutoRenew}
                   // TODO: Add logic to update auto-renew setting via backend/Stripe
                 />
              </div>
            </CardContent>
          </Card>

          {/* Billing Information Card */}
          <Card>
             <CardHeader>
               <CardTitle>Billing Information</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div>
                   <Label htmlFor="billingCompanyName">Company Name</Label>
                   <Input id="billingCompanyName" defaultValue={subscription.billingInfo.companyName} readOnly className="mt-1 bg-gray-100"/>
                </div>
                <div>
                   <Label htmlFor="billingEmail">Billing Email</Label>
                   <Input id="billingEmail" type="email" defaultValue={subscription.billingInfo.email} readOnly className="mt-1 bg-gray-100"/>
                </div>
                 <div>
                   <Label htmlFor="billingAddress">Billing Address</Label>
                   <Textarea id="billingAddress" defaultValue={subscription.billingInfo.address} readOnly rows={3} className="mt-1 bg-gray-100"/>
                 </div>
                 <Button variant="link" size="sm" className="p-0 h-auto" onClick={handleManageSubscription} disabled={isManaging}>
                    Update Billing Information
                 </Button>
             </CardContent>
          </Card>
        </div>

      </div>

       {/* Billing History Table */}
       <Card>
          <CardHeader>
             <CardTitle>Billing History</CardTitle>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                   <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {subscription.invoices.length > 0 ? (
                      subscription.invoices.map(invoice => (
                         <TableRow key={invoice.id}>
                            <TableCell className="font-medium">{invoice.id.substring(0, 8)}...</TableCell>
                            <TableCell>€{invoice.amount.toFixed(2)}</TableCell>
                            <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                               <Badge variant={invoice.status === 'Paid' ? 'default' : 'secondary'}>{invoice.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                               <Button variant="outline" size="sm" asChild>
                                  <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">View PDF</a>
                               </Button>
                            </TableCell>
                         </TableRow>
                      ))
                   ) : (
                      <TableRow>
                         <TableCell colSpan={5} className="text-center text-gray-500 py-10">No invoices yet.</TableCell>
                      </TableRow>
                   )}
                </TableBody>
             </Table>
          </CardContent>
       </Card>

    </div>
  );
}

// Helper component for usage bars
interface UsageBarProps {
  label: string;
  current: number;
  limit: number;
  unit?: string;
}
const UsageBar: React.FC<UsageBarProps> = ({ label, current, limit, unit = '' }) => {
  const percentage = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;
  const displayLimit = limit === -1 ? 'Unlimited' : `${limit}${unit ? ` ${unit}` : ''}`;
  const displayCurrent = `${current}${unit ? ` ${unit}` : ''}`;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{displayCurrent} / {displayLimit}</span>
      </div>
      {limit > 0 && <Progress value={percentage} className="h-2" />}
    </div>
  );
};