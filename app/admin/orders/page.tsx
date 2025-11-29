'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminOrders, updateOrderStatus } from '@/lib/appService';
import { Order } from '@/lib/types';
import AdminNav from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, CheckCircle, XCircle, Clock, Truck, 
  MapPin, Package, Loader2, ChevronDown, Calendar, Mail, Phone, ArrowUpRight, User,
  AlertTriangle, Ban,
  Filter
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

// --- UI Helper Components ---

const OrdersSkeleton = () => (
  <div className="min-h-screen bg-slate-50/50">
    <AdminNav />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
      </div>
      <Skeleton className="h-14 w-full rounded-xl" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
      </div>
    </main>
  </div>
);

const formatDate = (dateString: string | undefined, formatStr: string = 'PPp') => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), formatStr);
  } catch (error) {
    return 'Invalid Date';
  }
};

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-100",
    preparing: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-100",
    crafting: "bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-100",
    packaging: "bg-pink-50 text-pink-700 border-pink-200 ring-pink-100",
    shipped: "bg-purple-50 text-purple-700 border-purple-200 ring-purple-100",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100",
    cancelled: "bg-slate-100 text-slate-600 border-slate-200 ring-slate-100",
    rejected: "bg-red-50 text-red-700 border-red-200 ring-red-100",
  };

  const icons: Record<string, any> = {
    pending: Clock,
    preparing: Package,
    crafting: Package,
    packaging: Package,
    shipped: Truck,
    delivered: CheckCircle,
    completed: CheckCircle,
    cancelled: XCircle,
    rejected: XCircle,
  };

  const Icon = icons[status] || Clock;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ring-1 ring-inset ${styles[status] || styles.pending}`}>
      <Icon className="w-3.5 h-3.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function AdminOrders() {
  const router = useRouter();
  
  // --- Data State ---
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ revenue: 0, total: 0, pending: 0 });
  
  // --- UI State ---
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  // --- Filter/Pagination State ---
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // --- Dialog States for Shadcn AlertDialog ---
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    actionLabel: string;
    actionClass?: string;
    onConfirm: () => void;
  }>({ open: false, title: '', description: '', actionLabel: '', onConfirm: () => {} });

  const [infoDialog, setInfoDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
  }>({ open: false, title: '', description: '' });


  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    loadOrders(1, true);
  }, [debouncedSearch, statusFilter]);

  const loadOrders = async (pageNum: number, reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await getAdminOrders(pageNum, 10, debouncedSearch, statusFilter);
      
      if (reset) {
        setOrders(res.orders);
      } else {
        setOrders(prev => [...prev, ...res.orders]);
      }
      
      setStats(res.stats);
      setHasMore(res.pagination.hasMore);
      setPage(pageNum);

    } catch (error: any) {
      console.error('Error fetching orders:', error);
      if (error.message?.includes('401')) router.push('/admin/login');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadOrders(page + 1, false);
    }
  };

  // --- STATUS UPDATE LOGIC ---
  
  // 1. Initiate Action (Guards & Confirmation)
  const initiateStatusUpdate = (orderId: string, status: string) => {
    const currentOrder = orders.find(o => o._id === orderId);
    
    // Block modification if order is already terminal
    if (currentOrder && ['cancelled', 'rejected', 'completed'].includes(currentOrder.status)) {
       setInfoDialog({
         open: true,
         title: "Action Blocked",
         description: `This order has been marked as ${currentOrder.status.toUpperCase()}. It cannot be modified further.`
       });
       return;
    }

    // Require confirmation for destructive/terminal actions
    if (['cancelled', 'rejected', 'completed'].includes(status)) {
      const isDestructive = ['cancelled', 'rejected'].includes(status);
      setConfirmDialog({
        open: true,
        title: `Mark as ${status.charAt(0).toUpperCase() + status.slice(1)}?`,
        description: "This action is permanent and cannot be undone. Are you sure you want to proceed?",
        actionLabel: `Yes, ${status} it`,
        actionClass: isDestructive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700",
        onConfirm: () => executeStatusUpdate(orderId, status)
      });
    } else {
      // Immediate update for workflow steps (crafting, shipping, etc)
      executeStatusUpdate(orderId, status);
    }
  };

  // 2. Execute API Call (FIXED)
  const executeStatusUpdate = async (orderId: string, status: string) => {
    setUpdating(true);
    setConfirmDialog(prev => ({ ...prev, open: false }));

    try {
      const updatedOrder = await updateOrderStatus(orderId, status);
      
      // --- FIX: Merge new status with existing populated data ---
      
      // 1. Update List State
      setOrders(prev => prev.map(o => 
        o._id === orderId 
          ? { ...o, status: updatedOrder.status, updatedAt: updatedOrder.updatedAt || new Date().toISOString() } 
          : o
      ));
      
      // 2. Update Selected Order Modal
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(prev => prev ? ({
          ...prev, // Keep existing populated items
          status: updatedOrder.status, 
          updatedAt: updatedOrder?.updatedAt || new Date().toISOString()
        }) : null);
      }

      // Reload stats if necessary
      if (['completed', 'cancelled', 'rejected'].includes(status)) {
         loadOrders(1, true);
      }
    } catch (error) {
      setInfoDialog({
        open: true,
        title: "Error",
        description: "Failed to update order status. Please try again."
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading && page === 1) return <OrdersSkeleton />;

  const isOrderLocked = selectedOrder && ['cancelled', 'rejected', 'completed'].includes(selectedOrder.status);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* --- Stats Section --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Package className="w-24 h-24 text-blue-600 transform rotate-12" />
            </div>
            <CardContent className="p-6 relative z-10">
              <p className="text-sm font-semibold text-slate-500 mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              <div className="mt-4 inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                Lifetime Volume
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock className="w-24 h-24 text-amber-600 transform rotate-12" />
            </div>
            <CardContent className="p-6 relative z-10">
              <p className="text-sm font-semibold text-slate-500 mb-1">Pending Action</p>
              <p className="text-3xl font-bold text-slate-900">{stats.pending}</p>
              <div className="mt-4 inline-flex items-center text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                Needs Attention
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-none shadow-lg hover:shadow-xl transition-shadow rounded-2xl overflow-hidden relative group text-white">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle className="w-24 h-24 text-emerald-400 transform rotate-12" />
            </div>
            <CardContent className="p-6 relative z-10">
              <p className="text-sm font-semibold text-slate-300 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold">₹{stats.revenue.toLocaleString()}</p>
              <div className="mt-4 inline-flex items-center text-xs font-medium text-emerald-300 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                Confirmed Earnings
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- Filters & Search --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 sticky top-20 z-10 bg-slate-50/95 backdrop-blur py-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search by Order ID, Name, or Email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white shadow-sm border-slate-200 focus:ring-slate-900"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {['all', 'pending', 'approved', 'completed', 'rejected', 'cancelled'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                onClick={() => setStatusFilter(status)}
                className={`capitalize rounded-full px-4 whitespace-nowrap ${
                  statusFilter === status ? 'bg-slate-900' : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* --- Order List --- */}
        <div className="space-y-4">
          <AnimatePresence mode='popLayout'>
            {orders.length > 0 ? orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                layout
              >
                <Card 
                  className="group border-none shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer bg-white overflow-hidden"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Left: ID & Date */}
                    <div className="p-5 md:w-48 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-100 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-start gap-2">
                       <div>
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order ID</span>
                         <p className="text-base font-mono font-bold text-slate-900">#{order._id.slice(-6).toUpperCase()}</p>
                       </div>
                       <div className="text-right md:text-left">
                         <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(order.createdAt || order.created_at, 'MMM dd')}
                         </p>
                         <p className="text-[10px] text-slate-400">
                            {formatDate(order.createdAt || order.created_at, 'h:mm a')}
                         </p>
                       </div>
                    </div>

                    {/* Middle: Details */}
                    <div className="p-5 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                       <div>
                          <div className="flex items-center gap-3 mb-1">
                             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                <User className="w-4 h-4" />
                             </div>
                             <div>
                                <p className="font-semibold text-slate-900 leading-tight">{order.customer_name}</p>
                                <p className="text-xs text-slate-500">{order.customer_email}</p>
                             </div>
                          </div>
                       </div>
                       
                       <div>
                          <div className="flex items-center gap-2 mb-1">
                             {getStatusBadge(order.status)}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 truncate">
                            {order.items?.length} items • {order.items?.map((i:any) => i.product?.name).join(', ')}
                          </p>
                       </div>
                    </div>

                    {/* Right: Total & Action */}
                    <div className="p-5 md:w-48 flex flex-row md:flex-col justify-between items-center md:items-end gap-4 border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50/30">
                       <div className="text-left md:text-right">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
                          <p className="text-lg font-bold text-slate-900">₹{order.total_amount.toLocaleString()}</p>
                       </div>
                       <div className="flex items-center text-xs font-medium text-slate-500 group-hover:text-blue-600 transition-colors">
                          View Details <ArrowUpRight className="w-3 h-3 ml-1" />
                       </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )) : (
              <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-6 h-6 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No orders found</h3>
                <p className="text-slate-500">Try adjusting your search or filters.</p>
              </div>
            )}
          </AnimatePresence>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-8 pb-4">
              <Button 
                variant="ghost" 
                onClick={handleLoadMore} 
                disabled={loadingMore}
                className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full px-6"
              >
                {loadingMore ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                Load More Orders
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* --- Detail Modal --- */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl gap-0 z-50">
          <DialogDescription className="sr-only">
            Detailed view of order {selectedOrder?._id}
          </DialogDescription>

          {/* Modal Header */}
          <div className="bg-slate-50/80 backdrop-blur p-6 border-b border-slate-100 sticky top-0 z-10 flex justify-between items-start">
             <div>
               <DialogTitle className="text-xl font-bold text-slate-900">
                 Order #{selectedOrder?._id.slice(-6).toUpperCase()}
               </DialogTitle>
               <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(selectedOrder?.createdAt || selectedOrder?.created_at)}
               </div>
             </div>
             {selectedOrder && getStatusBadge(selectedOrder.status)}
          </div>

          {selectedOrder && (
            <div className="p-6 space-y-8">
              
              {/* Status Actions */}
              {!isOrderLocked ? (
                <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Update Order Status</p>
                   <div className="flex flex-wrap gap-2">
                      {['approved', 'crafting', 'packaging', 'shipped', 'delivered', 'completed'].map(status => (
                        <Button 
                          key={status}
                          variant="outline" 
                          size="sm"
                          className={`capitalize h-8 text-xs ${selectedOrder.status === status ? 'bg-slate-900 text-white border-slate-900' : 'text-slate-600'}`}
                          onClick={() => initiateStatusUpdate(selectedOrder._id, status)}
                          disabled={updating}
                        >
                          {status}
                        </Button>
                      ))}
                      <div className="flex-1"></div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => initiateStatusUpdate(selectedOrder._id, 'cancelled')}
                        disabled={updating}
                      >
                        Cancel Order
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => initiateStatusUpdate(selectedOrder._id, 'rejected')}
                        disabled={updating}
                      >
                        Reject
                      </Button>
                   </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-800 text-sm font-medium text-center flex items-center justify-center gap-2">
                   <Ban className="w-4 h-4" /> This order has been {selectedOrder.status}. No further actions are allowed.
                </div>
              )}

              {/* Info Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <section>
                      <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4 text-slate-400" /> Customer Details
                      </h4>
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm space-y-2">
                        <p className="font-semibold text-slate-900">{selectedOrder.customer_name}</p>
                        <div className="flex items-center gap-2 text-slate-600">
                           <Mail className="w-3.5 h-3.5" /> {selectedOrder.customer_email}
                        </div>
                        {selectedOrder.customer_phone && (
                          <div className="flex items-center gap-2 text-slate-600">
                             <Phone className="w-3.5 h-3.5" /> {selectedOrder.customer_phone}
                          </div>
                        )}
                      </div>
                    </section>

                    <section>
                      <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" /> Shipping Address
                      </h4>
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm text-slate-600 leading-relaxed">
                         {selectedOrder.shipping_address ? (
                           <>
                             {selectedOrder.shipping_address.street}<br />
                             {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}
                           </>
                         ) : (
                           <span className="italic text-slate-400">No address details available.</span>
                         )}
                      </div>
                    </section>
                 </div>

                 <section>
                    <h4 className="text-sm font-bold text-slate-900 mb-3">Items ({selectedOrder.items?.length})</h4>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-4 p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors">
                           
                           <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200">
                              {item.product?.images?.[0] ? (
                                <img 
                                  src={item.product.images[0]} 
                                  className="w-full h-full object-cover" 
                                  alt={item.product?.name || "Product Image"}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = "https://placehold.co/100x100?text=No+Img";
                                  }}
                                />
                              ) : (
                                <Package className="w-6 h-6 text-slate-300" />
                              )}
                           </div>

                           <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                 <p className="font-medium text-slate-900 text-sm truncate pr-2">{item.product?.name}</p>
                                 <p className="font-semibold text-slate-900 text-sm">₹{(item.price_at_purchase * item.quantity).toLocaleString()}</p>
                              </div>
                              <p className="text-xs text-slate-500 mb-2">Qty: {item.quantity} × ₹{item.price_at_purchase}</p>
                              
                              <div className="flex flex-wrap gap-1.5">
                                {item.selected_fragrances?.map((f: any, i: number) => (
                                  <span key={i} className="inline-flex text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                    {f.name}
                                  </span>
                                ))}
                                {item.custom_message && (
                                  <span className="inline-flex text-[10px] bg-blue-50 px-1.5 py-0.5 rounded text-blue-600 border border-blue-100">
                                    Note attached
                                  </span>
                                )}
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                 </section>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex justify-between items-center">
                  <span className="font-medium text-slate-600">Total Amount</span>
                  <span className="text-2xl font-bold text-slate-900">₹{selectedOrder.total_amount.toLocaleString()}</span>
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* --- ALERT DIALOGS --- */}
      
      {/* 1. Info Dialog */}
      <AlertDialog open={infoDialog.open} onOpenChange={(open) => !open && setInfoDialog(prev => ({...prev, open: false}))}>
        <AlertDialogContent className="z-[100]">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <AlertDialogTitle>{infoDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{infoDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Okay</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 2. Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog(prev => ({...prev, open: false}))}>
        <AlertDialogContent className="z-[100]">
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDialog.onConfirm}
              className={confirmDialog.actionClass}
            >
              {confirmDialog.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}