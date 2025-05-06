import React from 'react';
import { Calendar, DollarSign, TrendingUp, Users, ArrowUpRight, ArrowDownRight, BarChart2, Clock, Star } from 'lucide-react';

function Reports() {
  const revenueData = [
    { month: 'Jan', value: 12500 },
    { month: 'Feb', value: 14200 },
    { month: 'Mar', value: 16800 },
    { month: 'Apr', value: 15600 },
    { month: 'May', value: 17900 },
    { month: 'Jun', value: 19200 }
  ];

  const metrics = [
    {
      name: 'Revenue',
      value: '€19,200',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-primary-500 to-primary-600'
    },
    {
      name: 'New Clients',
      value: '145',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      color: 'from-pink-500 to-pink-600'
    },
    {
      name: 'Average Service Value',
      value: '€75',
      change: '+5.4%',
      trend: 'up',
      icon: TrendingUp,
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      name: 'Appointments',
      value: '384',
      change: '-2.1%',
      trend: 'down',
      icon: Calendar,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const topServices = [
    { name: 'Women\'s Haircut', count: 156, revenue: '€7,800', growth: '+12%' },
    { name: 'Color Treatment', count: 98, revenue: '€6,860', growth: '+15%' },
    { name: 'Men\'s Haircut', count: 145, revenue: '€3,625', growth: '+8%' },
    { name: 'Highlights', count: 67, revenue: '€5,360', growth: '+18%' },
    { name: 'Styling', count: 89, revenue: '€2,670', growth: '+5%' }
  ];

  const performanceMetrics = [
    { name: 'Client Retention', value: '94%', icon: Users },
    { name: 'Avg. Service Time', value: '45 min', icon: Clock },
    { name: 'Client Satisfaction', value: '4.8/5', icon: Star },
    { name: 'Revenue Growth', value: '+15%', icon: BarChart2 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Get insights into your salon's performance</p>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.name}
            className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg bg-gradient-to-br ${metric.color} p-3 text-white`}>
                <metric.icon className="h-6 w-6" />
              </div>
              <span className={`flex items-center text-sm font-medium ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
                {metric.trend === 'up' ? (
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                ) : (
                  <ArrowDownRight className="ml-1 h-4 w-4" />
                )}
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">{metric.value}</p>
            <p className="text-sm text-gray-500">{metric.name}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
            <div className="flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-primary-500"></span>
              <span className="text-sm text-gray-500">Revenue</span>
            </div>
          </div>
          <div className="mt-6 h-64">
            <div className="h-full flex items-end space-x-2">
              {revenueData.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-primary-100 to-primary-50 hover:from-primary-200 hover:to-primary-100 transition-colors duration-150 rounded-t-lg"
                    style={{ height: `${(data.value / 20000) * 100}%` }}
                  >
                    <div 
                      className="w-full h-1 bg-primary-500"
                      style={{ marginTop: '-2px' }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs font-medium text-gray-500">{data.month}</div>
                  <div className="text-xs font-semibold text-gray-700">€{(data.value / 1000).toFixed(1)}k</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Performance Metrics</h2>
          <div className="mt-6 grid grid-cols-2 gap-6">
            {performanceMetrics.map((metric) => (
              <div key={metric.name} className="flex items-center space-x-4 rounded-lg bg-gray-50 p-4">
                <div className="rounded-lg bg-white p-2 shadow-sm">
                  <metric.icon className="h-6 w-6 text-primary-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">{metric.name}</div>
                  <div className="text-lg font-semibold text-gray-900">{metric.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Services */}
      <div className="rounded-xl bg-white shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Top Services</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appointments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Growth
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topServices.map((service, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{service.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{service.count}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{service.revenue}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center text-sm font-medium text-green-600">
                        {service.growth}
                        <ArrowUpRight className="ml-1 h-4 w-4" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;