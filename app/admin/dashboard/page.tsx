'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminStats } from '@/lib/appService';
import AdminNav from '@/components/admin/AdminNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton'; // <-- 1. Import Skeleton
import { Package, ShoppingCart, Clock, CheckCircle } from 'lucide-react';
import { DashboardStats } from '@/lib/types';
import { motion } from 'framer-motion'; // <-- 2. Import motion

// This is the new Skeleton Loading Component
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-slate-50">
    <AdminNav />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-64" /> {/* Skeleton for title */}
        <Skeleton className="h-4 w-48 mt-3" /> {/* Skeleton for subtitle */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-3 w-24 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  </div>
);

// --- 3. Animation Variants for Framer Motion ---
const gridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Each card animates 0.1s after the previous
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 }, // Start invisible and 20px down
  show: { opacity: 1, y: 0 },    // Animate to visible and 0px
};
// --- End Animation Variants ---

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
  });
  const router = useRouter();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (error: any) {
      console.error('Failed to load dashboard:', error.message);
      router.push('/admin/login');
    } finally {
      // Use a small timeout to make the skeleton visible
      // This prevents a jarring "flash" if the API is too fast
      setTimeout(() => setLoading(false), 300);
    }
  };

  // --- 4. Updated Loading Check ---
  if (loading) {
    return <DashboardSkeleton />;
  }
  // --- End Updated Loading Check ---

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-600 mt-2">Overview of your store</p>
        </div>

        {/* --- 5. Added Animation to Grid --- */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={gridVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={cardVariants}>
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
          </motion.div>

          <motion.div variants={cardVariants}>
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
          </motion.div>

          <motion.div variants={cardVariants}>
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
          </motion.div>

          <motion.div variants={cardVariants}>
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
          </motion.div>
        </motion.div>
        {/* --- End Animation --- */}
      </main>
    </div>
  );
}