'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserOrders } from '@/lib/appService';
import { Order } from '@/lib/types';
import { useCart, CartItem } from '../context/CartContext'; // Import CartItem type
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, Calendar, MapPin, ArrowRight, Package, 
  Loader2, RotateCcw, CheckCircle, Clock, XCircle, Truck 
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
      // The response structure from getUserOrders is { data: Order[], pagination: {...} }
      // We need to extract the data array
      setOrders(res.data || []);
    } catch (error: any) {
      if (error.message?.includes('Session expired')) {
        router.push('/login');
      }
      // Don't show alert if it's just empty
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAgain = (order: Order) => {
    // 1. Construct Cart Items from the Order
    const itemsToBuy: CartItem[] = order.items.map((item: any) => ({
      ...item.product, // Spread product details (name, price, images)
      cartId: `${item.product._id}-${Date.now()}-${Math.random()}`, // Generate new temp ID
      quantity: item.quantity,
      selectedFragrances: item.selected_fragrances?.map((f: any) => f._id) || [], // Extract IDs
      customMessage: item.custom_message || ''
    }));

    if (itemsToBuy.length > 0) {
      // 2. Save to Direct Cart (Does not affect main cart)
      startDirectCheckout(itemsToBuy);

      // 3. Redirect to Checkout with a flag
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
    };
    
    const icons: Record<string, any> = {
      pending: Clock,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle,
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
    <div className="min-h-screen bg-[#F8F8F8] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center justify-between mb-8">
           <div>
             <h1 className="text-3xl font-bold text-[#222222]">My Orders</h1>
             <p className="text-slate-500 mt-1">Track and manage your purchase history</p>
           </div>
           <Link href="/products">
             <Button variant="outline" className="rounded-full">
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
                  <div className="border-b border-slate-100 bg-slate-50/50 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order Placed</p>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {format(new Date(order?.createdAt || order?.created_at || new Date()), 'MMMM dd, yyyy')}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total</p>
                        <p className="text-sm font-bold text-[#222222]">₹{order.total_amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ship To</p>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                           <MapPin className="w-4 h-4 text-slate-400" />
                           {order.customer_name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                       <div className="flex flex-col items-end">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Order # {order._id.slice(-6).toUpperCase()}</p>
                         {getStatusBadge(order.status)}
                       </div>
                    </div>
                  </div>

                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-4 items-center">
                          <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                             {item.product?.images?.[0] ? (
                               <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-slate-300"/></div>
                             )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 truncate">{item.product?.name || 'Product Unavailable'}</h4>
                            <p className="text-sm text-slate-500 mt-1">Quantity: {item.quantity}</p>
                            {item.selected_fragrances?.length > 0 && (
                              <p className="text-xs text-slate-400 mt-1">
                                Scents: {item.selected_fragrances.map((f: any) => f.name).join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                             <p className="font-medium text-slate-900">₹{item.price_at_purchase.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
                       <Button 
                         onClick={() => handleOrderAgain(order)}
                         className="bg-white border-2 border-[#1C1C1C] text-[#1C1C1C] hover:bg-[#1C1C1C] hover:text-white transition-all rounded-full"
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