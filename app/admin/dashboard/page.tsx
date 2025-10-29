'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAdminAuth } from '@/lib/admin-auth';
import { supabase } from '@/lib/supabase';
import AdminNav from '@/components/admin/AdminNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Clock, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      router.push('/admin/login');
      return;
    }
    await fetchStats();
  };

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from('products').select('id, is_active', { count: 'exact' }),
        supabase.from('orders').select('id, status', { count: 'exact' }),
      ]);

      const activeProducts = productsRes.data?.filter((p) => p.is_active).length || 0;
      const pendingOrders = ordersRes.data?.filter((o) => o.status === 'pending').length || 0;
      const approvedOrders = ordersRes.data?.filter((o) => o.status === 'approved').length || 0;

      setStats({
        totalProducts: productsRes.count || 0,
        activeProducts,
        totalOrders: ordersRes.count || 0,
        pendingOrders,
        approvedOrders,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

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
