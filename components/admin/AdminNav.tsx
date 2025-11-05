'use client';

import { useRouter, usePathname } from 'next/navigation';
// import { signOutAdmin } from '@/lib/admin-auth';
import { Button } from '@/components/ui/button';
import { LogOut, Package, ShoppingCart, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      // await signOutAdmin();
      router.push('/admin/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  ];

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-slate-900">Admin Panel</h1>
            </div>
            <div className="flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleSignOut} className="flex items-center">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
