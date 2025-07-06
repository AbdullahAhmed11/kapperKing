import React, { useEffect } from 'react';
import { Store, Users, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useSalonStore, selectAllSalons } from '@/lib/store/salons';
import { useClientStore, selectAllClients } from '@/lib/store/clients';
import { formatDistanceToNow } from 'date-fns'; // For relative time
import axios from 'axios'; // For API calls
import {  Briefcase, Book, ClipboardList } from 'lucide-react';

type StaticsType = {
  salons: number;
  users: number;
  revenue: number | string;
  // Add other properties as needed
};

function PlatformDashboard() {
  const [statics, setStatics] = React.useState<StaticsType | null>(null); // State for stats
  const [staticsLoading, setStaticsLoading] = React.useState(true); // Loading state for stats
  const [recentsSalons, setRecentsSalon] = React.useState<any[]>([]); // State for recent salons

  const getStatics = async () => {
    try {
      const response = await axios.get('https://kapperking.runasp.net/api/SuperAdmin/GetStatistics'); // Adjust API endpoint as needed
      setStatics(response.data);
    } catch (error) {
      console.error('Error fetching platform statistics:', error);
    } finally {
      setStaticsLoading(false); 
    }
  };

  const getRecentsSalons = async () => {
     try {
      const response = await axios.get('https://kapperking.runasp.net/api/Salons/GetRecentSalons');
      setRecentsSalon(response.data) // Adjust API endpoint as needed
     }catch (error) {
      console.log(error)
     }
  }

  useEffect(()  => {
    getStatics();
    getRecentsSalons()
  }, []); // Fetc

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
      owner: client ? `${client?.ownerName} ${client.lastName}` : 'Unknown Client',
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
      {/* <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
      </div> */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Card 1 */}
      <div className="relative overflow-hidden rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex justify-between">
          <div className="rounded-lg bg-indigo-600 p-2">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div className="inline-flex items-center rounded-full bg-green-100 text-green-800 px-2.5 py-0.5 text-xs font-medium">
            +12%
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </div>
        </div>
        <p className="mt-4 text-2xl font-semibold text-gray-900">{statics?.salons}</p>
        <p className="text-sm text-gray-500">Total Salons</p>
      </div>

      {/* Card 2 */}
      <div className="relative overflow-hidden rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex justify-between">
          <div className="rounded-lg bg-pink-600 p-2">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div className="inline-flex items-center rounded-full bg-red-100 text-red-800 px-2.5 py-0.5 text-xs font-medium">
            -8%
            <ArrowDownRight className="ml-1 h-3 w-3" />
          </div>
        </div>
        <p className="mt-4 text-2xl font-semibold text-gray-900">{statics?.users}</p>
        <p className="text-sm text-gray-500">Active Users</p>
      </div>

      {/* Card 3 */}
      <div className="relative overflow-hidden rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex justify-between">
          <div className="rounded-lg bg-purple-600 p-2">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <div className="inline-flex items-center rounded-full bg-green-100 text-green-800 px-2.5 py-0.5 text-xs font-medium">
            +5%
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </div>
        </div>
        <p className="mt-4 text-2xl font-semibold text-gray-900">{statics?.revenue}</p>
        <p className="text-sm text-gray-500">Monthly Revenue</p>
      </div>

      {/* Card 4 */}
      <div className="relative overflow-hidden rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex justify-between">
          <div className="rounded-lg bg-green-600 p-2">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div className="inline-flex items-center rounded-full bg-red-100 text-red-800 px-2.5 py-0.5 text-xs font-medium">
            -3%
            <ArrowDownRight className="ml-1 h-3 w-3" />
          </div>
        </div>
        <p className="mt-4 text-2xl font-semibold text-gray-900">450</p>
        <p className="text-sm text-gray-500">Growth Rate</p>
      </div>
    </div>

      {/* Recent Salons */}




      <div className="bg-white shadow rounded-lg">
  <div className="px-6 py-4 border-b border-gray-200">
    <h2 className="text-lg font-medium text-gray-900">Recent Salons</h2>
  </div>
  <div className="divide-y divide-gray-200">
    {/* Salon item 1 */}
    {
      recentsSalons.map((salon) => (
      <div key={salon.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">{salon.name}</h3>
            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
              <span>{salon.ownerName}</span>
              <span>•</span>
              <span>{salon.address}</span>
              <span>•</span>
              <time dateTime="2025-06-25">{salon.createdAt}</time>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-green-100 text-green-800">
              {salon.planName || 'Unknown Plan'}
            </span>
          </div>
        </div>
      </div>

      ))
    }

  
  </div>
</div>

      
    </div>
  );
}

export default PlatformDashboard;