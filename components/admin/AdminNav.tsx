'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  LogOut, 
  Package, 
  ShoppingCart, 
  LayoutDashboard, 
  Menu, 
  Tag, 
  Wind,
  Settings,
  FileQuestion,
  Star // Added for Testimonials
} from 'lucide-react';
import Link from 'next/link';

// --- Navigation Items Configuration ---
const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/tags', label: 'Tags', icon: Tag },
  { href: '/admin/fragrances', label: 'Fragrances', icon: Wind },
  { href: '/admin/enquiries', label: 'Enquiries', icon: FileQuestion },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Star },
];

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for glass morphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('token'); // Clear token
      router.push('/admin/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const closeSheet = () => setIsSheetOpen(false);

  return (
    <>
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .glass-nav {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 
            0 8px 32px 0 rgba(31, 38, 135, 0.07),
            0 0 0 1px rgba(255, 255, 255, 0.5) inset;
        }
        .glass-button {
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.6);
          transition: all 0.3s ease;
        }
        .glass-button:hover {
          background: rgba(255, 255, 255, 0.95);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .glass-button-active {
          background: rgba(15, 23, 42, 0.08);
          border: 1px solid rgba(15, 23, 42, 0.1);
          color: #0f172a;
        }
      `}</style>

      <nav className={`fixed top-0 left-0 right-0 z-50 px-4 pt-4 transition-all duration-300 ${scrolled ? 'pt-2' : 'pt-4'}`}>
        <div className={`glass-nav rounded-2xl max-w-[1400px] mx-auto transition-all duration-300 ${scrolled ? 'py-1 shadow-lg' : 'py-1'}`}>
          <div className="px-4 sm:px-6">
            <div className="flex justify-between h-16 items-center gap-4">
              
              {/* --- 1. Logo Section --- */}
              <Link href="/admin/dashboard" className="flex items-center group cursor-pointer flex-shrink-0">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-slate-900/20 transition-all duration-300 group-hover:scale-105">
                  <LayoutDashboard className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3 hidden sm:block">
                  <h1 className="text-lg font-bold text-slate-900 leading-tight">
                    Admin Panel
                  </h1>
                  <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Management</p>
                </div>
              </Link>

              {/* --- 2. Desktop Navigation --- */}
              {/* Changed: Added 'gap-2' for spacing and 'px-4' for wider buttons */}
              <div className="hidden xl:flex items-center gap-2 overflow-x-auto no-scrollbar">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`glass-button inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap ${
                        isActive
                          ? 'glass-button-active text-slate-900 shadow-inner'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mr-2.5 ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* --- 3. Right Actions --- */}
              <div className="flex items-center gap-3 flex-shrink-0">
                
                {/* Desktop Sign Out */}
                <div className="hidden xl:flex">
                  <button
                    onClick={handleSignOut}
                    className="glass-button flex items-center px-5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100 group transition-all"
                  >
                    <LogOut className="w-4 h-4 mr-2 group-hover:text-red-600 transition-colors" />
                    Sign Out
                  </button>
                </div>

                {/* Mobile/Tablet Menu Trigger */}
                <div className="flex xl:hidden">
                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                      <button className="glass-button p-2.5 rounded-xl hover:bg-slate-100 transition-colors">
                        <Menu className="w-6 h-6 text-slate-700" />
                      </button>
                    </SheetTrigger>
                    
                    {/* Mobile Sheet Content */}
                    <SheetContent side="left" className="w-[85vw] sm:w-[400px] p-0 border-r-0 bg-white/95 backdrop-blur-xl">
                      <div className="flex flex-col h-full">
                        <SheetHeader className="px-6 py-6 border-b border-slate-100">
                          <SheetTitle className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                                <LayoutDashboard className="w-5 h-5 text-white" />
                              </div>
                              <div className="text-left">
                                <span className="text-lg font-bold text-slate-900 block">Admin Panel</span>
                                <span className="text-xs text-slate-500">Navigation</span>
                              </div>
                            </div>
                          </SheetTitle>
                        </SheetHeader>
                        
                        <div className="flex-1 overflow-y-auto py-6 px-4">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-4">Menu</p>
                          <nav className="flex flex-col space-y-2">
                            {navItems.map((item) => {
                              const Icon = item.icon;
                              const isActive = pathname === item.href || pathname.startsWith(item.href);
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={closeSheet}
                                  className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                                    isActive
                                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                      : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-transparent hover:border-slate-200'
                                  }`}
                                >
                                  <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                  <span className="font-medium text-sm flex-1">{item.label}</span>
                                </Link>
                              );
                            })}
                          </nav>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center justify-center px-4 py-3.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 hover:border-red-200 transition-all active:scale-95"
                          >
                            <LogOut className="w-4 h-4 mr-2" /> Sign Out
                          </button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Spacer */}
      <div className="h-28"></div>
    </>
  );
}