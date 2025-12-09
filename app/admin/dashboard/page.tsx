'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminStats, getAnalytics } from '@/lib/appService';
import AdminNav from '@/components/admin/AdminNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, ShoppingCart, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { DashboardStats, AnalyticsData } from '@/lib/types';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

// --- Premium Color Palette ---
const GOLD = '#D4AF37'; // Historic Gold
const GOLD_LIGHT = '#F4E5B0';
const DARK = '#1e293b'; // Slate 900
const DARK_ACCENT = '#334155'; // Slate 700
const MUTED_TEXT = '#64748b'; // Slate 500
const SUCCESS_GREEN = '#10b981'; // Emerald 500
const WARN_ORANGE = '#f59e0b'; // Amber 500
const ERROR_RED = '#ef4444'; // Red 500

const PIE_COLORS = [GOLD, DARK_ACCENT, '#94a3b8', '#cbd5e1', '#e2e8f0'];

// --- Animation Variants ---
const gridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// --- Custom Components ---

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-slate-100 p-4 rounded-xl shadow-xl">
        <p className="text-sm font-semibold text-slate-900 mb-1">{label}</p>
        <p className="text-sm text-amber-600 font-medium">
          {payload[0].name === 'sales' ?
            `₹${payload[0].value.toLocaleString()}` :
            `${payload[0].value} ${payload[0].name}`
          }
        </p>
        {payload[1] && (
          <p className="text-xs text-slate-500 mt-1">
            {payload[1].value} orders
          </p>
        )}
      </div>
    );
  }
  return null;
};

// --- Skeleton Component ---
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-slate-50/50">
    <AdminNav />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-64 rounded-xl" />
        <Skeleton className="h-4 w-48 mt-3 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-none shadow-sm bg-white/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-3 w-32 mt-2 rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6">
        <Skeleton className="h-[300px] sm:h-[400px] w-full rounded-3xl" />
      </div>
    </main>
  </div>
);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
  });

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [range, setRange] = useState('30d');
  const router = useRouter();

  useEffect(() => {
    loadDashboard();
  }, [range]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsData, analyticsResult] = await Promise.all([
        getAdminStats(),
        getAnalytics(range)
      ]);
      setStats(statsData);
      setAnalyticsData(analyticsResult);
    } catch (error: any) {
      console.error('Failed to load dashboard:', error.message);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const salesChartData = analyticsData?.salesData.map(item => ({
    date: item._id, // Needs better formatting ideally
    sales: item.totalSales,
    orders: item.orderCount
  })) || [];

  const topProductsData = analyticsData?.topProducts.map(item => ({
    name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
    quantity: item.quantity,
    revenue: item.revenue
  })) || [];

  const statusData = analyticsData?.statusDistribution.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count
  })) || [];

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-serif text-slate-900 tracking-tight">Executive Dashboard</h2>
            <p className="text-slate-500 mt-1 font-medium">Visualizing the essence of your business</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={range} onValueChange={setRange}>
              <SelectTrigger className="w-[160px] bg-white border-slate-200 rounded-xl shadow-sm focus:ring-amber-500/20 hover:bg-slate-50 transition-all">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 3 Months</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={gridVariants}
          initial="hidden"
          animate="show"
        >
          {/* Card 1: Total Orders */}
          <motion.div variants={cardVariants}>
            <Card className="rounded-2xl border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white hover:shadow-lg transition-all duration-300 group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</CardTitle>
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-slate-900 font-serif">
                  {/* Placeholder for total revenue if not in stats, otherwise use orders */}
                  {stats.totalOrders}
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium">Total Orders Placed</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: Products */}
          <motion.div variants={cardVariants}>
            <Card className="rounded-2xl border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white hover:shadow-lg transition-all duration-300 group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Inventory</CardTitle>
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                  <Package className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-slate-900 font-serif">{stats.activeProducts}</div>
                <p className="text-xs text-slate-400 mt-1 font-medium">Active Fragrances</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 3: Pending */}
          <motion.div variants={cardVariants}>
            <Card className="rounded-2xl border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white hover:shadow-lg transition-all duration-300 group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending</CardTitle>
                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                  <Clock className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-slate-900 font-serif">{stats.pendingOrders}</div>
                <p className="text-xs text-slate-400 mt-1 font-medium">Actions Required</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 4: Delivered/Approved */}
          <motion.div variants={cardVariants}>
            <Card className="rounded-2xl border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white hover:shadow-lg transition-all duration-300 group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Processing</CardTitle>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-slate-900 font-serif">{stats.approvedOrders}</div>
                <p className="text-xs text-slate-400 mt-1 font-medium">In Production</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Sales Trend Graph */}
          <motion.div variants={cardVariants}>
            <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white rounded-3xl overflow-hidden p-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-serif text-slate-900">Revenue Trajectory</CardTitle>
                <CardDescription>Sales performance over time</CardDescription>
              </CardHeader>
              <CardContent className="pl-0">
                <div className="h-[300px] sm:h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesChartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="date"
                        stroke={MUTED_TEXT}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                      />
                      <YAxis
                        stroke={MUTED_TEXT}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: GOLD, strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke={GOLD}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorSales)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: DARK }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <motion.div variants={cardVariants}>
              <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white rounded-3xl overflow-hidden p-2 h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-serif text-slate-900">Bestsellers</CardTitle>
                  <CardDescription>Most popular fragrances</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] sm:h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topProductsData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }} barSize={20}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={80}
                          tick={{ fontSize: 11, fill: DARK_ACCENT }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                          cursor={{ fill: 'transparent' }}
                        />
                        <Bar
                          dataKey="quantity"
                          fill={DARK}
                          radius={[0, 4, 4, 0]}
                          background={{ fill: '#f1f5f9', radius: 4 }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Status */}
            <motion.div variants={cardVariants}>
              <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white rounded-3xl overflow-hidden p-2 h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-serif text-slate-900">Order Distribution</CardTitle>
                  <CardDescription>Current order statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] sm:h-[350px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius="60%"
                          outerRadius="80%"
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                        <Legend
                          verticalAlign="bottom"
                          align="center"
                          layout="horizontal"
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ paddingTop: '20px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}