import React from 'react';
import { Store, Users, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useSalonStore, selectAllSalons } from '@/lib/store/salons';
import { useClientStore, selectAllClients } from '@/lib/store/clients';
import { formatDistanceToNow } from 'date-fns'; // For relative time

function PlatformDashboard() {
  // Get data from stores
  const salons = useSalonStore(selectAllSalons);
  const clients = useClientStore(selectAllClients);

  // --- Calculate Stats ---
  const totalSalons = salons.length;
  // Define "Active Users" as total clients for now
  const activeUsers = clients.length;
  // Placeholders for stats requiring more complex data/logic
  const monthlyRevenue = '€48,574'; // Placeholder
  const growthRate = '24.5%'; // Placeholder
  const placeholderChange = '+X%'; // Placeholder for change %

  const stats = [
    {
      name: 'Total Salons',
      value: totalSalons.toLocaleString(), // Format number
      change: placeholderChange, // Placeholder
      trend: 'up', // Placeholder
      icon: Store,
      color: 'bg-indigo-600'
    },
    {
      name: 'Active Users', // Currently defined as total clients
      value: activeUsers.toLocaleString(), // Format number
      change: placeholderChange, // Placeholder
      trend: 'up', // Placeholder
      icon: Users,
      color: 'bg-pink-600'
    },
    {
      name: 'Monthly Revenue',
      value: monthlyRevenue, // Placeholder
      change: placeholderChange, // Placeholder
      trend: 'up', // Placeholder
      icon: CreditCard,
      color: 'bg-purple-600'
    },
    {
      name: 'Growth Rate',
      value: growthRate, // Placeholder
      change: placeholderChange, // Placeholder
      trend: 'up', // Placeholder
      icon: TrendingUp,
      color: 'bg-green-600'
    }
  ];

  // --- Prepare Recent Salons Data ---
  const sortedSalons = [...salons].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const recentSalonsData = sortedSalons.slice(0, 5).map(salon => { // Show top 5
    const client = clients.find(c => c.id === salon.clientId);
    return {
      id: salon.id,
      name: salon.name,
      owner: client ? `${client.firstName} ${client.lastName}` : 'Unknown Client',
      location: `${salon.city || 'N/A'}, ${salon.country || 'N/A'}`,
      status: client?.subscriptionStatus || 'unknown',
      revenue: 'N/A', // Placeholder - revenue data not available per salon
      createdAt: salon.createdAt,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Platform Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor and manage your platform's performance
          </p>
        </div>
        <div className="flex space-x-3">
          <select className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between">
              <div className={`rounded-lg ${stat.color} p-2`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                stat.trend === 'up' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {stat.change}
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="ml-1 h-3 w-3" />
                )}
              </div>
            </div>
            <p className="mt-4 text-2xl font-semibold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Recent Salons */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Salons</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentSalonsData.length === 0 ? (
             <div className="p-6 text-center text-gray-500">No salons created yet.</div>
          ) : (
            recentSalonsData.map((salon) => (
              <div key={salon.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{salon.name}</h3>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span>{salon.owner}</span>
                      <span>•</span>
                      <span>{salon.location}</span>
                      <span>•</span>
                      {/* Show relative time since creation */}
                      <time dateTime={salon.createdAt}>
                        {formatDistanceToNow(new Date(salon.createdAt), { addSuffix: true })}
                      </time>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      salon.status === 'active' || salon.status === 'trialing' ? 'bg-green-100 text-green-800' :
                      salon.status === 'past_due' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800' // canceled, incomplete, unknown
                    }`}>
                      {salon.status.replace('_', ' ')} {/* Replace underscore for display */}
                    </span>
                    {/* Revenue placeholder removed for now */}
                    {/* <span className="text-sm font-medium text-gray-900">{salon.revenue}</span> */}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default PlatformDashboard;