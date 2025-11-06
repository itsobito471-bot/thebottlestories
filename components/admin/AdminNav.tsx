'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { LogOut, Package, ShoppingCart, LayoutDashboard, Menu } from 'lucide-react';
import Link from 'next/link';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
];

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      // await signOutAdmin();
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
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-2px);
          }
        }
        
        .glass-nav {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(148, 163, 184, 0.2);
          box-shadow: 
            0 8px 32px 0 rgba(15, 23, 42, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.5) inset,
            0 2px 4px 0 rgba(15, 23, 42, 0.05);
        }
        
        .glass-button {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(148, 163, 184, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glass-button:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(15, 23, 42, 0.15);
        }
        
        .glass-button-active {
          background: rgba(71, 85, 105, 0.15);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(71, 85, 105, 0.3);
        }
        
        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }
        
        .shimmer-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 3s infinite;
        }
        
        .nav-floating {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <div className="glass-nav rounded-2xl max-w-7xl mx-auto shimmer-effect">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              {/* Logo / Title */}
              <div className="flex items-center nav-floating">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                    <LayoutDashboard className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Admin Panel
                  </h1>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`glass-button inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold ${
                        isActive
                          ? 'glass-button-active text-slate-800'
                          : 'text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* Desktop Sign Out */}
              <div className="hidden md:flex items-center">
                <button
                  onClick={handleSignOut}
                  className="glass-button flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className="flex md:hidden items-center">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <button className="glass-button p-2.5 rounded-xl">
                      <Menu className="w-5 h-5 text-slate-700" />
                    </button>
                  </SheetTrigger>
                  <SheetContent 
                    side="left" 
                    className="glass-nav border-r border-slate-200/50 w-[85vw] sm:w-[350px]"
                  >
                    <SheetHeader className="border-b border-slate-200/30 pb-6">
                      <SheetTitle className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center shadow-xl relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
                          <LayoutDashboard className="w-6 h-6 text-white relative z-10" />
                        </div>
                        <div>
                          <span className="text-xl font-bold text-slate-900 block">
                            Admin Panel
                          </span>
                          <span className="text-xs text-slate-500 font-medium">Management Dashboard</span>
                        </div>
                      </SheetTitle>
                    </SheetHeader>
                    
                    <div className="py-6">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-3">
                        Navigation
                      </p>
                      <nav className="flex flex-col space-y-2">
                        {navItems.map((item, index) => {
                          const Icon = item.icon;
                          const isActive = pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={closeSheet}
                              style={{ animationDelay: `${index * 50}ms` }}
                              className={`glass-button flex items-center px-4 py-4 text-base font-semibold rounded-xl transition-all relative group overflow-hidden ${
                                isActive
                                  ? 'glass-button-active text-slate-900 shadow-md'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 transition-all ${
                                isActive 
                                  ? 'bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg' 
                                  : 'bg-white/80 group-hover:bg-white border border-slate-200/50'
                              }`}>
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-900'}`} />
                              </div>
                              <span className="flex-1">{item.label}</span>
                              {isActive && (
                                <div className="w-2 h-2 rounded-full bg-slate-700 animate-pulse"></div>
                              )}
                            </Link>
                          );
                        })}
                      </nav>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-200/30 bg-gradient-to-t from-white/50 to-transparent backdrop-blur-sm">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Account
                      </p>
                      <button
                        onClick={handleSignOut}
                        className="glass-button w-full justify-start flex items-center px-4 py-4 text-base font-semibold rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50/50 group transition-all"
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 bg-white/80 border border-slate-200/50 group-hover:bg-red-100 group-hover:border-red-200 transition-colors">
                          <LogOut className="w-5 h-5 group-hover:text-red-600 transition-colors" />
                        </div>
                        <span className="flex-1">Sign Out</span>
                        <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Spacer to prevent content from going under the fixed navbar */}
      <div className="h-20"></div>
    </>
  );
}