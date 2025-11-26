'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserOrders } from '@/lib/appService';
import { Order } from '@/lib/types';
import { useCart } from '../context/CartContext'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, Calendar, MapPin, ArrowRight, Package, 
  Loader2, RotateCcw, CheckCircle, Clock, XCircle, Truck, ChevronDown 
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const { addToCart } = useCart(); 
  const router = useRouter();

  useEffect(() => {
    fetchMyOrders(1, true);
  }, []);

  const fetchMyOrders = async (pageNum: number, reset = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const res = await getUserOrders(pageNum, 5); // Fetch 5 at a time for user
      
      if (reset) {
        setOrders(res.data);
      } else {
        setOrders(prev => [...prev, ...res.data]);
      }
      
      setHasMore(res.pagination.hasMore);
      setPage(pageNum);

    } catch (error: any) {
      if (error.message?.includes('Session expired') || error.message?.includes('401')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchMyOrders(page + 1, false);
    }
  };

  const handleOrderAgain = (order: Order) => {
    // Loop through items in the old order and add them to cart
    let addedCount = 0;
    
    order.items.forEach((item: any) => {
      if (item.product) {
        addToCart({
          ...item.product,
          quantity: item.quantity
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      Swal.fire({
        icon: 'success',
        title: 'Added to Cart',
        text: `${addedCount} items from your previous order have been added to your cart.`,
        showConfirmButton: false,
        timer: 1500
      });
      router.push('/cart');
    } else {
       Swal.fire('Error', 'Product data no longer available', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      crafting: "bg-indigo-50 text-indigo-700 border-indigo-200",
      packaging: "bg-pink-50 text-pink-700 border-pink-200",
      shipped: "bg-purple-50 text-purple-700 border-purple-200",
      delivered: "bg-green-50 text-green-700 border-green-200",
      completed: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
    };
    
    const icons: Record<string, any> = {
      pending: Clock,
      shipped: Truck,
      delivered: CheckCircle,
      completed: CheckCircle,
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

  if (loading && page === 1) {
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
                          {format(new Date(order.createdAt || order.created_at || new Date()), 'MMMM dd, yyyy')}
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

            {hasMore && (
              <div className="flex justify-center pt-4 pb-8">
                <Button 
                  variant="ghost" 
                  onClick={handleLoadMore} 
                  disabled={loadingMore}
                  className="text-slate-500 hover:text-slate-900"
                >
                  {loadingMore ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                  Load Older Orders
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}