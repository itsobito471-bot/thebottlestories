'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminOrders, updateOrderStatus } from '@/lib/appService';
import { Order } from '@/lib/types';
import AdminNav from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, CheckCircle, XCircle, Clock, Truck, 
  MapPin, Package, Loader2, ChevronDown, Calendar, Mail, Phone, ArrowUpRight, User,
  AlertTriangle, Ban, Filter, StickyNote
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from '@/components/ui/dialog';
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

// --- Helper Components ---
const OrdersSkeleton = () => (
  <div className="min-h-screen bg-slate-50/50">
    <AdminNav />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex justify-between items-center"><Skeleton className="h-12 w-64 rounded-xl" /><Skeleton className="h-10 w-32 rounded-lg" /></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}</div>
      <Skeleton className="h-14 w-full rounded-xl" />
      <div className="space-y-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}</div>
    </main>
  </div>
);

const formatDate = (dateString: string | undefined, formatStr: string = 'PPp') => {
  if (!dateString) return 'N/A';
  try { return format(new Date(dateString), formatStr); } catch (error) { return 'Invalid Date'; }
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
  const icons: Record<string, any> = { pending: Clock, shipped: Truck, delivered: CheckCircle, completed: CheckCircle, cancelled: XCircle, rejected: XCircle };
  const Icon = icons[status] || Clock;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ring-1 ring-inset ${styles[status] || styles.pending}`}>
      <Icon className="w-3.5 h-3.5" /> {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default function AdminOrders() {
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ revenue: 0, total: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [trackingData, setTrackingData] = useState({ id: '', url: '' });
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; description: string; actionLabel: string; actionClass?: string; onConfirm: () => void; }>({ open: false, title: '', description: '', actionLabel: '', onConfirm: () => {} });
  const [infoDialog, setInfoDialog] = useState<{ open: boolean; title: string; description: string; }>({ open: false, title: '', description: '' });

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => { loadOrders(1, true); }, [debouncedSearch, statusFilter]);

  const loadOrders = async (pageNum: number, reset = false) => {
    if (reset) setLoading(true); else setLoadingMore(true);
    try {
      const res = await getAdminOrders(pageNum, 10, debouncedSearch, statusFilter);
      if (reset) setOrders(res.orders); else setOrders(prev => [...prev, ...res.orders]);
      setStats(res.stats);
      setHasMore(res.pagination.hasMore);
      setPage(pageNum);
    } catch (error: any) {
      if (error.message?.includes('401')) router.push('/admin/login');
    } finally { setLoading(false); setLoadingMore(false); }
  };

  const handleLoadMore = () => { if (!loadingMore && hasMore) loadOrders(page + 1, false); };

  const initiateStatusUpdate = (orderId: string, status: string) => {
    const currentOrder = orders.find(o => o._id === orderId);
    if (currentOrder && ['cancelled', 'rejected', 'completed'].includes(currentOrder.status)) {
       setInfoDialog({ open: true, title: "Action Blocked", description: `Order is ${currentOrder.status.toUpperCase()}. No changes allowed.` });
       return;
    }
    if (status === 'shipped') {
        setShippingOrderId(orderId); setTrackingData({ id: '', url: '' }); setShippingModalOpen(true);
        return;
    }
    if (['cancelled', 'rejected', 'completed'].includes(status)) {
      setConfirmDialog({
        open: true, title: `Mark as ${status}?`, description: "This is permanent.", actionLabel: `Yes, ${status}`,
        actionClass: ['cancelled', 'rejected'].includes(status) ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700",
        onConfirm: () => executeStatusUpdate(orderId, status)
      });
    } else { executeStatusUpdate(orderId, status); }
  };

  const executeStatusUpdate = async (orderId: string, status: string, trackingInfo?: { trackingId: string; trackingUrl: string }) => {
    setUpdating(true); setConfirmDialog(prev => ({ ...prev, open: false })); setShippingModalOpen(false);
    try {
      const updatedOrder = await updateOrderStatus(orderId, status, trackingInfo);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: updatedOrder.status, updatedAt: updatedOrder.updatedAt, trackingId: updatedOrder.trackingId, trackingUrl: updatedOrder.trackingUrl } : o));
      if (selectedOrder?._id === orderId) setSelectedOrder(prev => prev ? ({ ...prev, status: updatedOrder.status, updatedAt: updatedOrder.updatedAt, trackingId: updatedOrder.trackingId, trackingUrl: updatedOrder.trackingUrl }) : null);
      if (['completed', 'cancelled', 'rejected'].includes(status)) loadOrders(1, true);
    } catch (error) { setInfoDialog({ open: true, title: "Error", description: "Update failed." }); } 
    finally { setUpdating(false); }
  };

  if (loading && page === 1) return <OrdersSkeleton />;
  const isOrderLocked = selectedOrder && ['cancelled', 'rejected', 'completed'].includes(selectedOrder.status);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Stats & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <Card className="bg-white border-none shadow-sm rounded-2xl relative group overflow-hidden"><CardContent className="p-6 relative z-10"><p className="text-sm font-semibold text-slate-500 mb-1">Total Orders</p><p className="text-3xl font-bold text-slate-900">{stats.total}</p></CardContent></Card>
          <Card className="bg-white border-none shadow-sm rounded-2xl relative group overflow-hidden"><CardContent className="p-6 relative z-10"><p className="text-sm font-semibold text-slate-500 mb-1">Pending</p><p className="text-3xl font-bold text-slate-900">{stats.pending}</p></CardContent></Card>
          <Card className="bg-slate-900 border-none shadow-lg rounded-2xl text-white relative group overflow-hidden"><CardContent className="p-6 relative z-10"><p className="text-sm font-semibold text-slate-300 mb-1">Revenue</p><p className="text-3xl font-bold">₹{stats.revenue.toLocaleString()}</p></CardContent></Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6 sticky top-20 z-10 bg-slate-50/95 backdrop-blur py-2">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><Input placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-white shadow-sm" /></div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {['all', 'pending', 'approved', 'completed', 'rejected', 'cancelled'].map((status) => (
              <Button key={status} variant={statusFilter === status ? "default" : "outline"} onClick={() => setStatusFilter(status)} className={`capitalize rounded-full px-4 ${statusFilter === status ? 'bg-slate-900' : 'bg-white'}`}>{status}</Button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          <AnimatePresence mode='popLayout'>
            {orders.length > 0 ? orders.map((order) => (
              <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} layout onClick={() => setSelectedOrder(order)}>
                <Card className="group border-none shadow-sm hover:shadow-md cursor-pointer bg-white overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-5 md:w-48 bg-slate-50/50 border-r border-slate-100 flex flex-row md:flex-col justify-between items-center md:items-start gap-2">
                       <div><span className="text-xs font-bold text-slate-400 uppercase">ID</span><p className="text-base font-mono font-bold">#{order._id.slice(-6).toUpperCase()}</p></div>
                       <div className="text-right md:text-left"><p className="text-xs text-slate-500">{formatDate(order.createdAt, 'MMM dd')}</p></div>
                    </div>
                    <div className="p-5 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                        <div><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"><User className="w-4 h-4" /></div><div><p className="font-semibold">{order.customer_name}</p><p className="text-xs text-slate-500">{order.customer_email}</p></div></div></div>
                        <div><div className="mb-1">{getStatusBadge(order.status)}</div><p className="text-xs text-slate-500 truncate">{order.items?.length} items</p></div>
                    </div>
                    <div className="p-5 md:w-48 border-l border-slate-100 bg-slate-50/30 flex flex-row md:flex-col justify-between items-center md:items-end">
                       <div className="text-right"><p className="text-xs font-bold text-slate-400 uppercase">Total</p><p className="text-lg font-bold">₹{order.total_amount.toLocaleString()}</p></div>
                       <div className="flex items-center text-xs font-medium text-slate-500 group-hover:text-blue-600">Details <ArrowUpRight className="w-3 h-3 ml-1" /></div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )) : <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200"><h3 className="text-lg font-semibold">No orders found</h3></div>}
          </AnimatePresence>
          {hasMore && <div className="flex justify-center pt-8"><Button variant="ghost" onClick={handleLoadMore} disabled={loadingMore}>{loadingMore ? <Loader2 className="animate-spin" /> : 'Load More'}</Button></div>}
        </div>
      </main>

      {/* --- Detail Modal --- */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl gap-0 z-50">
          <div className="bg-slate-50/80 backdrop-blur p-6 border-b border-slate-100 sticky top-0 z-10 flex justify-between items-start">
             <div><DialogTitle className="text-xl font-bold">Order #{selectedOrder?._id.slice(-6).toUpperCase()}</DialogTitle><div className="flex items-center gap-2 mt-1 text-sm text-slate-500"><Calendar className="w-3.5 h-3.5" />{formatDate(selectedOrder?.createdAt)}</div></div>
             {selectedOrder && getStatusBadge(selectedOrder.status)}
          </div>

          {selectedOrder && (
            <div className="p-6 space-y-8">
              {!isOrderLocked ? (
                <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                   <p className="text-xs font-bold text-slate-400 uppercase mb-3">Actions</p>
                   <div className="flex flex-wrap gap-2">
                      {['approved', 'crafting', 'packaging', 'shipped', 'delivered', 'completed'].map(s => <Button key={s} variant="outline" size="sm" className={`capitalize h-8 text-xs ${selectedOrder.status === s ? 'bg-slate-900 text-white' : ''}`} onClick={() => initiateStatusUpdate(selectedOrder._id, s)} disabled={updating}>{s}</Button>)}
                      <div className="flex-1"></div>
                      {selectedOrder.status === 'pending' && <><Button variant="destructive" size="sm" className="h-8 text-xs" onClick={() => initiateStatusUpdate(selectedOrder._id, 'cancelled')}>Cancel</Button></>}
                   </div>
                </div>
              ) : <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-800 text-sm font-medium text-center flex items-center justify-center gap-2"><Ban className="w-4 h-4" /> Order is {selectedOrder.status}. Locked.</div>}

              <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <section><h4 className="text-sm font-bold mb-3 flex items-center gap-2"><Package className="w-4 h-4" /> Customer</h4><div className="bg-slate-50 rounded-xl p-4 border text-sm space-y-2"><p className="font-semibold">{selectedOrder.customer_name}</p><div className="flex gap-2 text-slate-600"><Mail className="w-3.5" /> {selectedOrder.customer_email}</div><div className="flex gap-2 text-slate-600"><Phone className="w-3.5" /> {selectedOrder.customer_phone}</div></div></section>
                    <section><h4 className="text-sm font-bold mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Address</h4><div className="bg-slate-50 rounded-xl p-4 border text-sm text-slate-600">{selectedOrder.shipping_address ? <>{selectedOrder.shipping_address.street}<br/>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}</> : "No Address"}</div></section>
                    {(selectedOrder.trackingId || selectedOrder.trackingUrl) && <section><h4 className="text-sm font-bold mb-3 flex items-center gap-2"><Truck className="w-4 h-4" /> Tracking</h4><div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-sm text-blue-900"><p>ID: {selectedOrder.trackingId}</p><a href={selectedOrder.trackingUrl} target="_blank" className="text-blue-600 underline">Track</a></div></section>}
                 </div>

                 <section>
                    <h4 className="text-sm font-bold mb-3">Items ({selectedOrder.items?.length})</h4>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex flex-col gap-3 p-3 rounded-xl border border-slate-100 bg-white">
                           <div className="flex gap-4">
                               <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200"><img src={item.product?.images?.[0] || "https://placehold.co/100"} className="w-full h-full object-cover" /></div>
                               <div className="flex-1 min-w-0">
                                 <div className="flex justify-between items-start mb-1"><p className="font-medium text-sm truncate">{item.product?.name}</p><p className="font-semibold text-sm">₹{item.price_at_purchase * item.quantity}</p></div>
                                 <p className="text-xs text-slate-500 mb-2">Qty: {item.quantity}</p>
                                 
                                 {/* --- UPDATED ITEM DISPLAY FOR ADMIN --- */}
                                 {item.selected_fragrances && item.selected_fragrances.length > 0 && (
                                    <div className="flex flex-col gap-1 mt-1">
                                      {item.selected_fragrances.map((f: any, i: number) => (
                                        <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 w-fit">
                                           <span className="font-bold text-slate-400">{f.size} ({f.label}):</span>
                                           <span className="font-semibold text-slate-800">{f.fragrance?.name || "Unknown"}</span>
                                        </div>
                                      ))}
                                    </div>
                                 )}
                               </div>
                           </div>
                           {item.custom_message && <div className="bg-amber-50 rounded-lg p-2 text-xs text-slate-700 italic border border-amber-100"><StickyNote className="w-3 h-3 inline mr-1 text-amber-500"/>"{item.custom_message}"</div>}
                        </div>
                      ))}
                    </div>
                 </section>
              </div>

              {/* --- NEW: TOTAL AMOUNT FOOTER --- */}
              <div className="mt-4 p-4 bg-slate-100 rounded-xl flex justify-between items-center border border-slate-200">
                 <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Total Order Value</span>
                 <span className="text-2xl font-bold text-slate-900">₹{selectedOrder.total_amount.toLocaleString()}</span>
              </div>
              {/* -------------------------------- */}

            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* --- SHIPPING DIALOG (Fixed missing DialogHeader) --- */}
      <Dialog open={shippingModalOpen} onOpenChange={setShippingModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shipping Information</DialogTitle>
            <DialogDescription>Enter tracking details for the customer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tracking ID</Label>
              <Input 
                value={trackingData.id} 
                onChange={(e) => setTrackingData(prev => ({...prev, id: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label>Tracking URL</Label>
              <Input 
                value={trackingData.url} 
                onChange={(e) => setTrackingData(prev => ({...prev, url: e.target.value}))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShippingModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => shippingOrderId && executeStatusUpdate(shippingOrderId, 'shipped', { trackingId: trackingData.id, trackingUrl: trackingData.url })}
              disabled={updating}
              className="bg-blue-600 text-white"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Alert Dialogs */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog(prev => ({...prev, open: false}))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDialog.onConfirm} className={confirmDialog.actionClass}>{confirmDialog.actionLabel}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={infoDialog.open} onOpenChange={(open) => !open && setInfoDialog(prev => ({...prev, open: false}))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{infoDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{infoDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Okay</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}