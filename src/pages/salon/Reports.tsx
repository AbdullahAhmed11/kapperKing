import React, { useState, useEffect } from 'react';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  Clock,
  Star,
  Loader2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

type Metric = { name: string; value: string; change: string; trend: 'up' | 'down'; icon: React.ElementType; color: string; };
type RevenueDataPoint = { month: string; revenue: number; };
type TopService = { name: string; count: number; revenue: string; growth: string; };
type PerformanceMetric = { name: string; value: string; icon: React.ElementType; };

type JwtPayload = {
  Id: number;
  email?: string;
  name?: string;
};

function Reports() {
  const token = Cookies.get('salonUser');
  const decoded = token ? jwtDecode<JwtPayload>(token) : undefined;

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<string>('30');
  const [data, setData] = useState<any>(null);
  const [metricsData, setMetricsData] = useState<Metric[]>([]);
  const [revenueChartData, setRevenueChartData] = useState<RevenueDataPoint[]>([]);
  const [topServicesData, setTopServicesData] = useState<TopService[]>([]);
  const [performanceMetricsData, setPerformanceMetricsData] = useState<PerformanceMetric[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`https://kapperking.runasp.net/api/Salons/GetStatistics?id=${decoded?.Id}`);
      const fetched = res.data;
      setData(fetched);

      // Process data after fetch
      setMetricsData([
        { name: 'Revenue', value: fetched.revenue, change: '+12.5%', trend: 'up', icon: DollarSign, color: 'from-primary-500 to-primary-600' },
        { name: 'New Clients', value: fetched.newClients, change: '+8.2%', trend: 'up', icon: Users, color: 'from-pink-500 to-pink-600' },
        { name: 'Average Service Value', value: fetched.averageServiceValue, change: '+5.4%', trend: 'up', icon: TrendingUp, color: 'from-indigo-500 to-indigo-600' },
        { name: 'Appointments', value: fetched.appointments, change: '-2.1%', trend: 'down', icon: Calendar, color: 'from-purple-500 to-purple-600' }
      ]);

      const topServices: TopService[] = fetched.topServices.map((service: any) => ({
        name: service.serviceName,
        count: service.appointments,
        revenue: `€${service.revenue.toLocaleString()}`,
        growth: '+12%' // Placeholder
      }));
      setTopServicesData(topServices);

      setPerformanceMetricsData([
        { name: 'Client Retention', value: '94%', icon: Users },
        { name: 'Avg. Service Time', value: '45 min', icon: Clock },
        { name: 'Client Satisfaction', value: '4.8/5', icon: Star },
        { name: 'Revenue Growth', value: '+15%', icon: BarChart2 }
      ]);

      setRevenueChartData(fetched.revenueOverview); // Example: [{ month: "Jan", revenue: 15000 }, ...]

    } catch (err) {
      console.error("Error fetching report data:", err);
      setError("Failed to load report data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedRange]); // Future improvement: apply range filter to API

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <span className="ml-2 text-gray-500">Loading reports...</span>
      </div>
    );
  }

  const maxRevenue = Math.max(...(revenueChartData || []).map(d => d.revenue), 0) || 20000;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Get insights into your salon's performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedRange} onValueChange={setSelectedRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metricsData.map((metric) => (
          <div
            key={metric.name}
            className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-lg"
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Revenue Overview</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="h-3 w-3 rounded-full bg-primary-500"></span>
              <span>Revenue</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-6 h-64">
              <div className="h-full flex items-end space-x-2">
                {revenueChartData.map((data, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-primary-100 to-primary-50 hover:from-primary-200 hover:to-primary-100 transition-colors duration-150 rounded-t-lg"
                      style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                    >
                      <div className="w-full h-1 bg-primary-500" style={{ marginTop: '-2px' }} />
                    </div>
                    <div className="mt-2 text-xs font-medium text-gray-500">{data.month}</div>
                    <div className="text-xs font-semibold text-gray-700">€{(data.revenue / 1000).toFixed(1)}k</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-6 grid grid-cols-2 gap-6">
              {performanceMetricsData.map((metric) => (
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
          </CardContent>
        </Card>
      </div>

      {/* Top Services */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Top Services</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="mt-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appointments</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Growth</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-200">
                {topServicesData.map((service, idx) => (
                  <TableRow key={idx} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="px-6 py-4">{service.name}</TableCell>
                    <TableCell className="px-6 py-4">{service.count}</TableCell>
                    <TableCell className="px-6 py-4">{service.revenue}</TableCell>
                    <TableCell className="px-6 py-4">
                      <span className={`inline-flex items-center text-sm font-medium ${service.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {service.growth}
                        {service.growth.startsWith('+') ? <ArrowUpRight className="ml-1 h-4 w-4" /> : <ArrowDownRight className="ml-1 h-4 w-4" />}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Reports;
