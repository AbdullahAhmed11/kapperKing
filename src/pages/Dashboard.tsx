import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, TrendingUp, DollarSign, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';

function Dashboard() {
  const stats = [
    { 
      name: 'Today\'s Appointments',
      value: '12',
      change: '+2.5%',
      trend: 'up',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    { 
      name: 'Active Clients',
      value: '2,451',
      change: '+3.2%',
      trend: 'up',
      icon: Users,
      color: 'bg-green-500'
    },
    { 
      name: 'Average Service Time',
      value: '45 min',
      change: '-1.5%',
      trend: 'down',
      icon: Clock,
      color: 'bg-yellow-500'
    },
    { 
      name: 'Revenue (MTD)',
      value: '€8,234',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-purple-500'
    },
  ];

  const upcomingAppointments = [
    {
      time: '09:00',
      client: 'Sarah Johnson',
      service: 'Hair Color & Cut',
      stylist: 'Emma Davis',
      duration: '120min',
      price: '€150'
    },
    {
      time: '11:30',
      client: 'Michael Brown',
      service: 'Men\'s Haircut',
      stylist: 'James Wilson',
      duration: '30min',
      price: '€35'
    },
    {
      time: '13:00',
      client: 'Emily White',
      service: 'Blowout',
      stylist: 'Sophie Miller',
      duration: '45min',
      price: '€45'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative bg-white overflow-hidden rounded-lg border border-gray-100 p-5 hover:border-gray-200 transition-all duration-200"
          >
            <div className="flex justify-between">
              <div className={`${stat.color} rounded-lg p-2`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                stat.trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
              }`}>
                {stat.change}
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="ml-1 h-3 w-3" />
                )}
              </span>
            </div>
            <p className="mt-4 text-2xl font-semibold text-gray-900">{stat.value}</p>
            <p className="mt-1 text-sm text-gray-500">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-lg border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
            <Link to="/appointments" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
              View all
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {upcomingAppointments.map((appointment, idx) => (
            <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{appointment.time} - {appointment.client}</p>
                  <p className="text-sm text-gray-500">{appointment.service} with {appointment.stylist}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{appointment.price}</p>
                  <p className="text-sm text-gray-500">{appointment.duration}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;