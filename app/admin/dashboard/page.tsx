'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminStats } from '@/lib/appService'; // <-- 1. IMPORT YOUR NEW SERVICE
import AdminNav from '@/components/admin/AdminNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Clock, CheckCircle } from 'lucide-react';
import { DashboardStats } from '@/lib/types';

// Define the type for the stats object we expect from the API


export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({ // <-- Add type
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
  });
  const router = useRouter();

  useEffect(() => {
    // 2. Call the new function to load the dashboard
    loadDashboard();
  }, []);

  // 3. This one function replaces both checkAuth and fetchStats
  const loadDashboard = async () => {
    try {
      // This is a protected route. It will only work if the user
      // is logged in and the browser sends the auth cookie.
      const data = await getAdminStats();
      
      // The API now returns the data pre-calculated
      setStats(data);

    } catch (error: any) {
      // 4. If the request fails (401 Unauthorized, 500, etc.),
      // the user is not authenticated. Redirect to login.
      console.error('Failed to load dashboard:', error.message);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  // 5. This loading component remains unchanged
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // 6. Your entire UI (JSX) remains unchanged
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-600 mt-2">Overview of your store</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-slate-600 mt-1">
                {stats.activeProducts} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-slate-600 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-xs text-slate-600 mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Orders</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvedOrders}</div>
              <p className="text-xs text-slate-600 mt-1">Ready to process</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}