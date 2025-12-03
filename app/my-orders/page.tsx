'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserOrders } from '@/lib/appService';
import { Order } from '@/lib/types';
import { useCart, CartItem } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, Calendar, MapPin, Package, 
  Loader2, RotateCcw, CheckCircle, Clock, XCircle, Truck, StickyNote 
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { startDirectCheckout } = useCart(); 
  const router = useRouter();

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const res = await getUserOrders();
      setOrders(res.data || []);
    } catch (error: any) {
      if (error.message?.includes('Session expired')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAgain = (order: Order) => {
    const itemsToBuy: CartItem[] = order.items.map((item: any) => ({
      ...item.product,
      cartId: `${item.product._id}-${Date.now()}-${Math.random()}`,
      quantity: item.quantity,
      selectedFragrances: item.selected_fragrances?.map((f: any) => 
        typeof f === 'string' ? f : f._id
      ) || [],
      customMessage: item.custom_message || ''
    }));

    if (itemsToBuy.length > 0) {
      startDirectCheckout(itemsToBuy);
      router.push('/cart?buy_now=true');
    } else {
       Swal.fire('Error', 'Product data no longer available', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      processing: "bg-blue-50 text-blue-700 border-blue-200",
      shipped: "bg-purple-50 text-purple-700 border-purple-200",
      delivered: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
    };
    
    const icons: Record<string, any> = {
      pending: Clock,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle,
      rejected: XCircle,
    };
    
    const Icon = icons[status] || Package;

    return (
      <Badge variant="outline" className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full capitalize border ${styles[status] || styles.pending}`}>
        <Icon className="w-3 h-3" /> {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
           <div>
             <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">My Orders</h1>
             <p className="text-slate-500 mt-1 text-sm sm:text-base">Track and manage your purchase history</p>
           </div>
           <Link href="/products">
             <Button variant="outline" className="rounded-full w-full sm:w-auto">
               Continue Shopping
             </Button>
           </Link>
        </div>

        {orders.length === 0 ? (
          <Card className="border-dashed border-2 bg-white/50">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-[#222222]">No orders yet</h3>
              <p className="text-slate-500 mt-2 mb-6">When you place an order, it will appear here.</p>
              <Link href="/products">
                <Button className="bg-[#1C1C1C] text-white hover:bg-[#222222] rounded-full px-8">
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
                  
                  {/* --- Responsive Order Header --- */}
                  <div className="border-b border-slate-100 bg-slate-50/50 p-4 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full md:w-auto">
                      <div>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order Placed</p>
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {format(new Date(order?.createdAt || order?.created_at || new Date()), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total</p>
                        <p className="text-xs sm:text-sm font-bold text-[#222222]">₹{order.total_amount.toLocaleString()}</p>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ship To</p>
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 truncate">
                           <MapPin className="w-3.5 h-3.5 text-slate-400" />
                           {order.customer_name}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between w-full md:w-auto mt-2 md:mt-0 border-t md:border-t-0 border-slate-200 pt-3 md:pt-0">
                       <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full gap-3">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wider md:mb-1">#{order._id.slice(-6).toUpperCase()}</p>
                         {getStatusBadge(order.status)}
                       </div>
                    </div>
                  </div>

                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-6">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-4 items-start border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                          
                          {/* Image (Smaller on Mobile) */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                             {item.product?.images?.[0] ? (
                               <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-slate-300"/></div>
                             )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                              <div className="pr-0 sm:pr-4">
                                <h4 className="font-bold text-slate-900 text-sm sm:text-base break-words leading-snug">
                                  {item.product?.name || 'Product Unavailable'}
                                </h4>
                                <p className="text-xs sm:text-sm text-slate-500 mt-1">Qty: {item.quantity}</p>
                              </div>
                              <p className="font-medium text-slate-900 text-sm sm:text-base mt-1 sm:mt-0 whitespace-nowrap">
                                ₹{item.price_at_purchase.toLocaleString()}
                              </p>
                            </div>

                            {/* Fragrances */}
                            {item.selected_fragrances && item.selected_fragrances.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {item.selected_fragrances.map((f: any, i: number) => (
                                  <span key={i} className="inline-flex text-[10px] sm:text-xs uppercase font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                                    {f.name || 'Unknown Scent'}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Custom Message */}
                            {item.custom_message && (
                                <div className="mt-3 bg-amber-50 rounded-lg p-3 flex gap-2 sm:gap-3 items-start border border-amber-100/50">
                                    <StickyNote className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-0.5">Note Attached</p>
                                        <p className="text-xs text-slate-700 italic">"{item.custom_message}"</p>
                                    </div>
                                </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
                       <Button 
                         onClick={() => handleOrderAgain(order)}
                         className="w-full sm:w-auto bg-white border-2 border-[#1C1C1C] text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white transition-all rounded-full"
                       >
                         <RotateCcw className="w-4 h-4 mr-2" />
                         Order Again
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}