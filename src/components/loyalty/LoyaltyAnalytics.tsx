import { useEffect } from 'react'; // Remove unused React default import
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Gift, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react'; // Removed BarChart2
import { useLoyaltyStore } from '@/lib/store/loyalty'; // Removed unused types
import { useCurrentSalonStore } from '@/lib/store/currentSalon';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, LineChart, Line, CartesianGrid, Legend } from 'recharts'; // Import Legend
// Removed unused toast import
import { format } from 'date-fns'; // For formatting month on chart

export function LoyaltyAnalytics() {
  const { currentSalon } = useCurrentSalonStore();
  // Get all analytics state and actions
  const { 
    analyticsSummary, fetchAnalyticsSummary, loadingAnalyticsSummary,
    pointsActivity, fetchPointsActivity, loadingPointsActivity,
    topRewards, fetchTopRewards, loadingTopRewards,
    error 
  } = useLoyaltyStore();

  useEffect(() => {
    if (currentSalon?.id) {
      fetchAnalyticsSummary(currentSalon.id);
      fetchPointsActivity(currentSalon.id); // Fetch last 6 months by default
      fetchTopRewards(currentSalon.id); // Fetch top 5 by default
    }
  }, [currentSalon?.id, fetchAnalyticsSummary, fetchPointsActivity, fetchTopRewards]);

  // Combine loading states
  const isLoading = loadingAnalyticsSummary || loadingPointsActivity || loadingTopRewards;

  // Format data for charts
  const formattedPointsActivity = pointsActivity.map(item => ({
     ...item,
     // Format date string 'YYYY-MM-DD' to 'MMM YYYY'
     month: format(new Date(item.month_start + 'T00:00:00'), 'MMM yyyy') 
  }));

  const formattedTopRewards = topRewards.map(item => ({
     name: item.reward_name, // Rename for chart axis
     count: item.redemption_count
  }));


  if (isLoading) {
     return <div className="flex justify-center items-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (error) {
     // Display specific error if available, otherwise generic message
     return <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center"><AlertCircle className="h-5 w-5 mr-3" /> Error loading analytics: {error}</div>;
  }
  // Show message if summary is missing, but charts might still load if their fetches succeed
  if (!analyticsSummary && !isLoading) { 
     return <p className="text-center text-gray-500 py-10">No analytics summary data available yet.</p>;
  }

  return (
    <div className="space-y-6">
       {/* Key Metrics Row - Use fetched summary data */}
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold">{analyticsSummary?.total_members?.toLocaleString() ?? 0}</div>
             </CardContent>
          </Card>
           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Members (90d)</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold">{analyticsSummary?.active_members_90d?.toLocaleString() ?? 0}</div>
             </CardContent>
          </Card>
           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Points Earned (30d)</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold">{analyticsSummary?.points_earned_30d?.toLocaleString() ?? 0}</div>
             </CardContent>
          </Card>
           <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Points Spent (30d)</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold">{analyticsSummary?.points_spent_30d?.toLocaleString() ?? 0}</div>
             </CardContent>
          </Card>
       </div>

       {/* Charts Row - Use fetched detailed data */}
       <div className="grid gap-4 md:grid-cols-2">
          <Card>
             <CardHeader>
                <CardTitle>Points Activity (Last 6 Months)</CardTitle>
                <CardDescription>Points earned vs. spent.</CardDescription>
             </CardHeader>
             <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={formattedPointsActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="points_earned" stroke="#8884d8" name="Earned" />
                      <Line type="monotone" dataKey="points_spent" stroke="#82ca9d" name="Spent" />
                   </LineChart>
                </ResponsiveContainer>
             </CardContent>
          </Card>
          <Card>
             <CardHeader>
                <CardTitle>Top Redeemed Rewards</CardTitle>
                 <CardDescription>Most popular rewards redeemed.</CardDescription>
             </CardHeader>
             <CardContent className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedTopRewards} layout="vertical" margin={{ left: 20, right: 30 }}>
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis type="number" />
                       <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }}/>
                       <Tooltip />
                       <Bar dataKey="count" fill="#8884d8" name="Redemptions" />
                    </BarChart>
                 </ResponsiveContainer>
             </CardContent>
          </Card>
       </div>
    </div>
  );
}