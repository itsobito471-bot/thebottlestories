'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAdminAuth } from '@/lib/admin-auth';
import { supabase, Order, OrderWithItems } from '@/lib/supabase';
import AdminNav from '@/components/admin/AdminNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';

export default function AdminOrders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [updating, setUpdating] = useState(false);
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
    await fetchOrders();
  };

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData } = await supabase
            .from('order_items')
            .select(`
              *,
              product:products(*)
            `)
            .eq('order_id', order.id);

          return {
            ...order,
            items: itemsData || [],
          };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      await fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', icon: any }> = {
      pending: { variant: 'secondary', icon: Clock },
      approved: { variant: 'default', icon: CheckCircle },
      rejected: { variant: 'destructive', icon: XCircle },
      completed: { variant: 'outline', icon: CheckCircle },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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
          <h2 className="text-3xl font-bold text-slate-900">Orders</h2>
          <p className="text-slate-600 mt-2">Manage customer orders</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="w-16 h-16 text-slate-400 mb-4" />
              <p className="text-slate-600 text-lg">No orders yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">
                        {format(new Date(order.created_at), 'PPp')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Customer</p>
                      <p className="text-sm text-slate-600">{order.customer_name}</p>
                      <p className="text-sm text-slate-600">{order.customer_email}</p>
                      <p className="text-sm text-slate-600">{order.customer_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Address</p>
                      <p className="text-sm text-slate-600">{order.customer_address}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Total</p>
                      <p className="text-2xl font-bold text-slate-900">
                        ${order.total_amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {order.items.length} item(s)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900 mb-1">Order ID</p>
                  <p className="text-sm text-slate-600">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 mb-1">Status</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 mb-1">Date</p>
                  <p className="text-sm text-slate-600">
                    {format(new Date(selectedOrder.created_at), 'PPp')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-slate-900">
                    ${selectedOrder.total_amount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-900 mb-2">Customer Information</p>
                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm"><span className="font-medium">Name:</span> {selectedOrder.customer_name}</p>
                  <p className="text-sm"><span className="font-medium">Email:</span> {selectedOrder.customer_email}</p>
                  <p className="text-sm"><span className="font-medium">Phone:</span> {selectedOrder.customer_phone}</p>
                  <p className="text-sm"><span className="font-medium">Address:</span> {selectedOrder.customer_address}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-900 mb-2">Order Items</p>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg">
                      <div className="w-16 h-16 bg-slate-200 rounded flex-shrink-0">
                        {item.product?.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product?.name}</p>
                        <p className="text-sm text-slate-600">
                          ${item.price_at_time.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-sm">
                        ${(item.price_at_time * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => updateOrderStatus(selectedOrder.id, 'rejected')}
                    disabled={updating}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Order
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => updateOrderStatus(selectedOrder.id, 'approved')}
                    disabled={updating}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Order
                  </Button>
                </div>
              )}

              {selectedOrder.status === 'approved' && (
                <div className="pt-4 border-t">
                  <Button
                    className="w-full"
                    onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                    disabled={updating}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Completed
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
