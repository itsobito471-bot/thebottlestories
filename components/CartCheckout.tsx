'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ArrowRight, 
  CreditCard, Truck, Shield, Loader2, AlertCircle, CheckCircle2, 
  PenLine, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '../app/context/CartContext'; 
import { api } from '@/lib/apiService'; 
import { Input } from '@/components/ui/input';
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

export default function CartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get('buy_now') === 'true';
  
  const ref = useRef(null);
  
  const { 
    cart, 
    directCart,
    updateQuantity, 
    updateItemMetaData,
    removeFromCart, 
    clearCart, 
    clearDirectCart, // Ensure this is available in context
    startDirectCheckout 
  } = useCart();

  const activeItems = isBuyNow ? directCart : cart;
  const activeSubtotal = activeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = activeSubtotal > 3000 ? 0 : 0; 
  const finalTotal = activeSubtotal + shippingCost;

  const [showCheckout, setShowCheckout] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'destructive' | 'success';
    onConfirm: () => void;
    showCancel?: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    showCancel: false
  });

  const [shippingInfo, setShippingInfo] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: ''
  });

  const showAlert = (props: Partial<typeof alertState>) => {
    setAlertState({
      isOpen: true,
      title: props.title || '',
      description: props.description || '',
      actionLabel: props.actionLabel || 'Continue',
      cancelLabel: props.cancelLabel || 'Cancel',
      variant: props.variant || 'default',
      onConfirm: props.onConfirm || (() => setAlertState(prev => ({ ...prev, isOpen: false }))),
      showCancel: props.showCancel ?? true
    });
  };

  useEffect(() => {
    if (isBuyNow && activeItems.length > 0) {
      const token = localStorage.getItem('token');
      if (token) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            setShippingInfo(prev => ({
              ...prev,
              email: user.email || '',
              firstName: user.name ? user.name.split(' ')[0] : '',
              lastName: user.name ? user.name.split(' ')[1] || '' : ''
            }));
          } catch (e) { console.error(e); }
        }
      } else {
        router.push('/login?redirect=/cart?buy_now=true');
      }
    }
  }, [isBuyNow, activeItems.length, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleMessageChange = (cartId: string, message: string) => {
    updateItemMetaData(cartId, { customMessage: message });
  };

  const handleFragranceChange = (cartId: string, fragranceId: string) => {
    updateItemMetaData(cartId, { selectedFragrances: [fragranceId] });
  };

  // --- NEW: Handle "Back" / "Continue Shopping" Logic ---
  const handleExit = () => {
    if (isBuyNow) {
      // If leaving a Buy Now session, clear the temporary items
      clearDirectCart();
    }
    router.push('/products');
  };

  const handleRemoveItem = (cartId: string) => {
    showAlert({
      title: 'Remove Item?',
      description: "Are you sure you want to remove this item from your cart?",
      actionLabel: 'Yes, remove it',
      variant: 'destructive',
      showCancel: true,
      onConfirm: () => {
        if (isBuyNow) {
            const updatedDirectItems = directCart.filter(item => item.cartId !== cartId);
            startDirectCheckout(updatedDirectItems);
            // If direct cart becomes empty after removal, consider redirecting?
            // For now, let it show empty state so user knows.
        } else {
            removeFromCart(cartId);
        }
        setAlertState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleProceedToCheckout = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      showAlert({
        title: 'Please Login',
        description: 'You need to be logged in to complete your purchase.',
        actionLabel: 'Go to Login',
        variant: 'default',
        onConfirm: () => router.push('/login?redirect=/cart')
      });
      return;
    }
    
    setShowCheckout(true);
    
    const userStr = localStorage.getItem('user');
    if (userStr && !shippingInfo.email) {
      try {
        const user = JSON.parse(userStr);
        setShippingInfo(prev => ({
          ...prev,
          email: user.email || '',
          firstName: user.name ? user.name.split(' ')[0] : '',
          lastName: user.name ? user.name.split(' ')[1] || '' : ''
        }));
      } catch (e) { console.error(e); }
    }
  };

  const handlePlaceOrder = async () => {
    if (!shippingInfo.address || !shippingInfo.phone || !shippingInfo.city) {
      showAlert({
        title: 'Missing Information',
        description: 'Please fill in all required shipping details.',
        showCancel: false,
        actionLabel: 'Okay',
        variant: 'destructive'
      });
      return;
    }

    setIsPlacingOrder(true);

    try {
      await api.post('/orders', {
        items: activeItems,
        shippingAddress: shippingInfo,
        totalAmount: finalTotal
      });

      if (isBuyNow) {
        clearDirectCart();
      } else {
        clearCart();
      }
      
      showAlert({
        title: 'Order Placed!',
        description: 'Thank you for your purchase. You will receive an email confirmation shortly.',
        variant: 'success',
        actionLabel: 'Continue Shopping',
        showCancel: false,
        onConfirm: () => router.push('/products')
      });

    } catch (error: any) {
      console.error("Order failed", error);
      showAlert({
        title: 'Order Failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
        showCancel: false,
        actionLabel: 'Close'
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <section ref={ref} className="pt-20 pb-24 px-4 bg-gradient-to-b from-[#F8F8F8] via-white to-[#F8F8F8] min-h-screen relative overflow-hidden">
      
      <AlertDialog open={alertState.isOpen} onOpenChange={(isOpen) => !isOpen && setAlertState(prev => ({ ...prev, isOpen: false }))}>
        <AlertDialogContent className="rounded-2xl border border-slate-100 shadow-2xl">
          <AlertDialogHeader className="flex flex-col items-center text-center sm:text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              alertState.variant === 'success' ? 'bg-green-50 text-green-600' : 
              alertState.variant === 'destructive' ? 'bg-red-50 text-red-600' : 
              'bg-slate-50 text-slate-900'
            }`}>
              {alertState.variant === 'success' ? <CheckCircle2 className="w-6 h-6" /> : 
               alertState.variant === 'destructive' ? <AlertCircle className="w-6 h-6" /> : 
               <Shield className="w-6 h-6" />}
            </div>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">
              {alertState.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-base mt-2">
              {alertState.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center mt-4 gap-3 w-full">
            {alertState.showCancel && (
              <AlertDialogCancel className="mt-0 w-full sm:w-auto rounded-xl border-slate-200 hover:bg-slate-50">
                {alertState.cancelLabel}
              </AlertDialogCancel>
            )}
            <AlertDialogAction 
              onClick={alertState.onConfirm}
              className={`w-full sm:w-auto rounded-xl px-8 h-10 font-medium text-white ${
                alertState.variant === 'success' ? 'bg-green-600 hover:bg-green-700' : 
                alertState.variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : 
                'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {alertState.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-0 w-[500px] h-[500px] bg-pink-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-0 w-[400px] h-[400px] bg-rose-100/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* --- UPDATED BACK BUTTON --- */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Button 
            variant="outline" 
            onClick={handleExit}
            className="rounded-full border-slate-200 hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </motion.div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#222222] mb-4">
            {showCheckout ? 'Checkout' : (isBuyNow ? 'Direct Checkout' : 'Shopping Cart')}
          </h1>
          <p className="text-gray-500">
            {showCheckout ? 'Enter your shipping details' : `You have ${activeItems.length} items in your cart`}
          </p>
        </div>

        {activeItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/40 shadow-sm max-w-2xl mx-auto"
          >
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
            {/* Exit button for empty state as well */}
            <Button size="lg" onClick={handleExit} className="bg-[#1C1C1C] hover:bg-gray-800 text-white rounded-full px-8">
              Start Shopping
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2">
              {!showCheckout ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {activeItems.map((item) => {
                    const hasFragrances = item.available_fragrances && item.available_fragrances.length > 0;
                    const hasCustomMsg = item.allow_custom_message;

                    // Get currently selected ID
                    const currentFragranceId = item.selectedFragrances && item.selectedFragrances.length > 0
                        ? item.selectedFragrances[0]
                        : "";

                    return (
                      <div key={item.cartId} className="bg-white rounded-2xl p-4 flex gap-4 items-start shadow-sm border border-gray-100">
                        <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-1 min-w-0 flex flex-col h-full justify-between">
                          
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-4">
                              <h3 className="font-bold text-lg text-gray-900 truncate">{item.name}</h3>
                              {item.tags && item.tags.length > 0 && (
                                 <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                                   {/* Handle both populated Tag object and ID string */}
                                   {typeof item.tags[0] === 'object' ? item.tags[0].name : 'Tag'}
                                 </span>
                              )}
                              
                              {/* --- Single Select Dropdown --- */}
                              {hasFragrances && (
                                <div className="mt-2">
                                  <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                                    <Sparkles className="w-3 h-3" /> Selected Scent:
                                  </label>
                                  <select
                                    className="w-full sm:w-64 text-sm bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
                                    value={currentFragranceId}
                                    onChange={(e) => handleFragranceChange(item.cartId, e.target.value)}
                                  >
                                    <option value="" disabled>Select Scent</option>
                                    {item.available_fragrances?.map((frag: any) => {
                                      const fragId = typeof frag === 'object' ? frag._id : frag;
                                      const fragName = typeof frag === 'object' ? frag.name : 'Unknown Scent';
                                      return (
                                        <option key={fragId} value={fragId}>
                                          {fragName}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </div>
                              )}

                              {hasCustomMsg && (
                                <div className="mt-3">
                                  <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
                                    <PenLine className="w-3 h-3" /> Custom Message:
                                  </label>
                                  <Input 
                                    className="h-9 text-sm w-full sm:w-64 bg-slate-50 border-slate-200"
                                    placeholder="Add a note (optional)..."
                                    value={item.customMessage || ''}
                                    onChange={(e) => handleMessageChange(item.cartId, e.target.value)}
                                    maxLength={150}
                                  />
                                </div>
                              )}
                            </div>
                            
                            <button 
                              onClick={() => handleRemoveItem(item.cartId)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="flex justify-between items-end mt-4">
                            <div className="flex items-center border border-gray-200 rounded-lg">
                              <button 
                                onClick={() => updateQuantity(item.cartId, -1)}
                                className="p-1.5 hover:bg-gray-50 text-gray-600"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.cartId, 1)}
                                className="p-1.5 hover:bg-gray-50 text-gray-600"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">₹{(item.price * item.quantity).toFixed(2)}</p>
                              <p className="text-xs text-gray-400">₹{item.price} each</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-gray-100"
                >
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Truck className="w-5 h-5" /> Shipping Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <Input name="firstName" value={shippingInfo.firstName} onChange={handleInputChange} placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input name="lastName" value={shippingInfo.lastName} onChange={handleInputChange} placeholder="Doe" />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input name="email" type="email" value={shippingInfo.email} onChange={handleInputChange} placeholder="john@example.com" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Phone</label>
                      <Input name="phone" type="tel" value={shippingInfo.phone} onChange={handleInputChange} placeholder="+91 98765 43210" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium">Address</label>
                      <Input name="address" value={shippingInfo.address} onChange={handleInputChange} placeholder="123 Street Name" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">City</label>
                      <Input name="city" value={shippingInfo.city} onChange={handleInputChange} placeholder="Mumbai" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">State</label>
                      <Input name="state" value={shippingInfo.state} onChange={handleInputChange} placeholder="Maharashtra" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">ZIP Code</label>
                      <Input name="zip" value={shippingInfo.zip} onChange={handleInputChange} placeholder="400001" />
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" /> Payment Method
                    </h3>
                    <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 text-center">
                      <p className="font-medium">Cash on Delivery (COD)</p>
                      <p className="text-xs text-gray-500 mt-1">Pay when your order arrives.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 sticky top-24">
                <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{activeSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? <span className="text-green-600 font-medium">Free</span> : `₹${shippingCost}`}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">₹{finalTotal.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-right">Including all taxes</p>
                </div>

                {!showCheckout ? (
                  <Button 
                    onClick={handleProceedToCheckout}
                    className="w-full bg-[#1C1C1C] hover:bg-gray-800 text-white h-12 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                  >
                    Proceed to Checkout <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button 
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                      className="w-full bg-[#1C1C1C] hover:bg-gray-800 text-white h-12 rounded-xl text-base font-semibold shadow-lg"
                    >
                      {isPlacingOrder ? <Loader2 className="animate-spin" /> : 'Place Order'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowCheckout(false)}
                      className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50"
                    >
                      Back to Cart
                    </Button>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <Shield className="w-4 h-4" />
                  Secure Checkout
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}