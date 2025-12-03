'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ArrowRight, 
  CreditCard, Truck, Shield, Loader2, AlertCircle, CheckCircle2, 
  PenLine, Sparkles, MapPin, Home, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '../app/context/CartContext'; 
import { api } from '@/lib/apiService'; 
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getUserProfileData, addUserAddress } from '@/lib/appService';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get('buy_now') === 'true';
  const ref = useRef(null);
  
  const { 
    cart, directCart, updateQuantity, updateItemMetaData,
    removeFromCart, clearCart, clearDirectCart, startDirectCheckout 
  } = useCart();

  const activeItems = isBuyNow ? directCart : cart;
  const activeSubtotal = activeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = activeSubtotal > 3000 ? 0 : 0; 
  const finalTotal = activeSubtotal + shippingCost;

  // --- State ---
  const [showCheckout, setShowCheckout] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  // Address Book State
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home', street: '', city: '', state: '', zip: '', country: 'India'
  });

  const [shippingInfo, setShippingInfo] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: ''
  });

  // Alert State
  const [alertState, setAlertState] = useState<{
    isOpen: boolean; title: string; description: string;
    actionLabel?: string; cancelLabel?: string;
    variant?: 'default' | 'destructive' | 'success';
    onConfirm: () => void; showCancel?: boolean;
  }>({
    isOpen: false, title: '', description: '', onConfirm: () => {}, showCancel: false
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

  // --- Load User Data & Addresses ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        // 1. Load basic info from local storage (Fast)
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const nameParts = user.name ? user.name.split(' ') : [];
                const firstName = nameParts[0] || '';
                const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

                setShippingInfo(prev => ({
                    ...prev,
                    email: user.email || '',
                    firstName: firstName,
                    lastName: lastName,
                    phone: user.phone || ''
                }));
            } catch (e) { console.error(e); }
        }

        // 2. Fetch Address Book & Latest Profile from API (Reliable)
        getUserProfileData().then(res => {
            if (res) {
                if (res.user) {
                    const nameParts = res.user.name ? res.user.name.split(' ') : [];
                    setShippingInfo(prev => ({
                        ...prev,
                        email: res.user.email || prev.email,
                        firstName: nameParts[0] || prev.firstName,
                        lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : prev.lastName,
                        phone: res.user.phone || prev.phone
                    }));
                }
                if (res.addresses) {
                    setSavedAddresses(res.addresses);
                    const defaultAddr = res.addresses.find((a: any) => a.isDefault) || res.addresses[0];
                    if (defaultAddr && !shippingInfo.address) {
                        selectAddress(defaultAddr);
                    }
                }
            }
        }).catch(err => console.error("Failed to load user data", err));
    }
  }, []);

  const selectAddress = (addr: any) => {
    setShippingInfo(prev => ({
        ...prev,
        address: addr.street,
        city: addr.city,
        state: addr.state,
        zip: addr.zip
    }));
    setIsAddressModalOpen(false);
  };

  const handleAddNewAddress = async () => {
    try {
        const added = await addUserAddress(newAddress);
        setSavedAddresses(prev => [added, ...prev]);
        selectAddress(added); 
        setIsAddressModalOpen(false);
        setNewAddress({ label: 'Home', street: '', city: '', state: '', zip: '', country: 'India' });
    } catch (error) {
        showAlert({ title: 'Error', description: 'Failed to save address. Please check all fields.', variant: 'destructive', showCancel: false });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleMessageChange = (cartId: string, message: string) => updateItemMetaData(cartId, { customMessage: message });
  const handleFragranceChange = (cartId: string, fragranceId: string) => updateItemMetaData(cartId, { selectedFragrances: [fragranceId] });
  
  const handleExit = () => {
    if (isBuyNow) clearDirectCart();
    router.push('/products');
  };

  const handleRemoveItem = (cartId: string) => {
    showAlert({
      title: 'Remove Item?',
      description: "Are you sure you want to remove this item?",
      actionLabel: 'Remove',
      variant: 'destructive',
      showCancel: true,
      onConfirm: () => {
        if (isBuyNow) {
            const updatedDirectItems = directCart.filter(item => item.cartId !== cartId);
            startDirectCheckout(updatedDirectItems);
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
        actionLabel: 'Login',
        variant: 'default',
        onConfirm: () => router.push('/login?redirect=/cart')
      });
      return;
    }
    setShowCheckout(true);
  };

  const handlePlaceOrder = async () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip'];
    const missing = requiredFields.filter(field => !shippingInfo[field as keyof typeof shippingInfo]);

    if (missing.length > 0) {
      showAlert({
        title: 'Missing Information',
        description: `Please fill in the following fields: ${missing.join(', ')}`,
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

      if (isBuyNow) clearDirectCart(); else clearCart();
      
      showAlert({
        title: 'Order Placed!',
        description: 'Thank you for your purchase.',
        variant: 'success',
        actionLabel: 'Continue Shopping',
        showCancel: false,
        onConfirm: () => router.push('/products')
      });

    } catch (error: any) {
      showAlert({ title: 'Order Failed', description: error.message || 'Something went wrong.', variant: 'destructive', showCancel: false });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <section ref={ref} className="pt-20 pb-32 sm:pb-24 px-4 bg-gradient-to-b from-[#F8F8F8] via-white to-[#F8F8F8] min-h-screen relative overflow-hidden">
      
      {/* Alert Dialog */}
      <AlertDialog open={alertState.isOpen} onOpenChange={(isOpen) => !isOpen && setAlertState(prev => ({ ...prev, isOpen: false }))}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader className="flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${alertState.variant === 'success' ? 'bg-green-50 text-green-600' : alertState.variant === 'destructive' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-900'}`}>
              {alertState.variant === 'success' ? <CheckCircle2 className="w-6 h-6" /> : alertState.variant === 'destructive' ? <AlertCircle className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
            </div>
            <AlertDialogTitle className="text-xl font-bold">{alertState.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertState.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center w-full gap-2">
            {alertState.showCancel && <AlertDialogCancel className="w-full sm:w-auto rounded-xl">{alertState.cancelLabel}</AlertDialogCancel>}
            <AlertDialogAction onClick={alertState.onConfirm} className={`w-full sm:w-auto rounded-xl ${alertState.variant === 'success' ? 'bg-green-600' : alertState.variant === 'destructive' ? 'bg-red-600' : 'bg-slate-900'}`}>{alertState.actionLabel}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
          <Button variant="outline" onClick={handleExit} className="rounded-full border-slate-200 hover:bg-white"><ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping</Button>
        </motion.div>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-[#222222] mb-4">{showCheckout ? 'Checkout' : (isBuyNow ? 'Direct Checkout' : 'Shopping Cart')}</h1>
          <p className="text-gray-500 text-sm md:text-base">{showCheckout ? 'Confirm your shipping details below.' : `You have ${activeItems.length} items in your cart`}</p>
        </div>

        {activeItems.length === 0 ? (
          <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/40 shadow-sm max-w-2xl mx-auto">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <Button size="lg" onClick={handleExit} className="bg-[#1C1C1C] hover:bg-gray-800 text-white rounded-full px-8 mt-6">Start Shopping</Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2">
              {!showCheckout ? (
                /* --- RESPONSIVE CART ITEMS VIEW --- */
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {activeItems.map((item) => (
                    <div key={item.cartId} className="bg-white rounded-2xl p-4 flex gap-4 items-start shadow-sm border border-gray-100 relative group">
                      
                      {/* Image */}
                      <div className="w-20 h-20 sm:w-28 sm:h-28 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[5rem] sm:min-h-[7rem]">
                        
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base sm:text-lg text-gray-900 truncate">{item.name}</h3>
                            {/* Mobile Price Display */}
                            <p className="sm:hidden text-sm font-semibold text-slate-900 mt-1">₹{(item.price * item.quantity).toFixed(2)}</p>
                            
                            {(item.available_fragrances?.length || 0) > 0 && (
                                <div className="mt-2">
                                  <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1"><Sparkles className="w-3 h-3" /> Scent:</label>
                                  <select className="w-full text-xs sm:text-sm bg-slate-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-slate-900" value={item.selectedFragrances?.[0] || ""} onChange={(e) => handleFragranceChange(item.cartId, e.target.value)}>
                                    <option value="" disabled>Select Scent</option>
                                    {item?.available_fragrances?.map((frag: any) => (
                                        <option key={typeof frag === 'object' ? frag._id : frag} value={typeof frag === 'object' ? frag._id : frag}>{typeof frag === 'object' ? frag.name : 'Unknown Scent'}</option>
                                    ))}
                                  </select>
                                </div>
                            )}
                            {item.allow_custom_message && (
                                <div className="mt-2">
                                  <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1"><PenLine className="w-3 h-3" /> Note:</label>
                                  <Input className="h-8 text-xs sm:text-sm w-full bg-slate-50 border-slate-200" placeholder="Add note..." value={item.customMessage || ''} onChange={(e) => handleMessageChange(item.cartId, e.target.value)} maxLength={150} />
                                </div>
                            )}
                          </div>
                          
                          <button onClick={() => handleRemoveItem(item.cartId)} className="text-slate-300 hover:text-red-500 p-2 -mr-2 -mt-2"><Trash2 className="w-5 h-5" /></button>
                        </div>

                        {/* Desktop Price & Quantity */}
                        <div className="hidden sm:flex justify-between items-end mt-4">
                          <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                            <button onClick={() => updateQuantity(item.cartId, -1)} className="p-1.5 hover:bg-gray-50 text-gray-600"><Minus className="w-4 h-4" /></button>
                            <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.cartId, 1)} className="p-1.5 hover:bg-gray-50 text-gray-600"><Plus className="w-4 h-4" /></button>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">₹{(item.price * item.quantity).toFixed(2)}</p>
                            <p className="text-xs text-gray-400">₹{item.price} ea</p>
                          </div>
                        </div>

                        {/* Mobile Quantity Control (Visible only on mobile) */}
                        <div className="flex sm:hidden items-center mt-3 gap-3">
                           <div className="flex items-center border border-gray-200 rounded-lg bg-white h-8">
                            <button onClick={() => updateQuantity(item.cartId, -1)} className="px-2 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600"><Minus className="w-3 h-3" /></button>
                            <span className="w-8 text-center font-medium text-xs">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.cartId, 1)} className="px-2 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600"><Plus className="w-3 h-3" /></button>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : (
                /* --- CHECKOUT VIEW --- */
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-gray-100">
                  
                  {/* Address Book Trigger */}
                  <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                     <div>
                        <h4 className="font-bold text-slate-900">Saved Addresses</h4>
                        <p className="text-sm text-slate-500">Quickly fill details from your address book.</p>
                     </div>
                     <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                        <DialogTrigger asChild>
                           <Button variant="outline" className="bg-white border-slate-200 shadow-sm hover:bg-slate-100 w-full sm:w-auto">
                              <MapPin className="w-4 h-4 mr-2" /> Select Address
                           </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                           <DialogHeader>
                              <DialogTitle>Select Delivery Address</DialogTitle>
                              <DialogDescription>Choose a saved address or add a new one.</DialogDescription>
                           </DialogHeader>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors min-h-[150px]" onClick={() => setIsAddressModalOpen(false)}>
                                 <p className="font-medium text-slate-900 mb-2">Create New</p>
                                 <div className="w-full space-y-3" onClick={(e) => e.stopPropagation()}>
                                    <Input placeholder="Label (Home/Office)" value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} />
                                    <Input placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} />
                                    <div className="grid grid-cols-2 gap-2">
                                       <Input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                                       <Input placeholder="Zip" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} />
                                    </div>
                                    <Input placeholder="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
                                    <Button size="sm" className="w-full bg-slate-900 text-white" onClick={handleAddNewAddress}>Save & Use</Button>
                                 </div>
                              </div>

                              {savedAddresses.map((addr: any) => (
                                 <div key={addr._id} onClick={() => selectAddress(addr)} className="border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-slate-900 hover:shadow-md transition-all relative group">
                                    <div className="flex items-center gap-2 mb-2">
                                       {addr.label.toLowerCase().includes('office') ? <Briefcase className="w-4 h-4 text-slate-500" /> : <Home className="w-4 h-4 text-slate-500" />}
                                       <span className="font-bold text-slate-900">{addr.label}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 line-clamp-2">{addr.street}, {addr.city}, {addr.state} {addr.zip}</p>
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </DialogContent>
                     </Dialog>
                  </div>

                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Truck className="w-5 h-5" /> Shipping Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>First Name <span className="text-red-500">*</span></Label><Input name="firstName" value={shippingInfo.firstName} onChange={handleInputChange} placeholder="John" /></div>
                    <div className="space-y-2"><Label>Last Name <span className="text-red-500">*</span></Label><Input name="lastName" value={shippingInfo.lastName} onChange={handleInputChange} placeholder="Doe" /></div>
                    <div className="space-y-2 md:col-span-2"><Label>Email <span className="text-red-500">*</span></Label><Input name="email" type="email" value={shippingInfo.email} onChange={handleInputChange} /></div>
                    <div className="space-y-2 md:col-span-2"><Label>Phone <span className="text-red-500">*</span></Label><Input name="phone" type="tel" value={shippingInfo.phone} onChange={handleInputChange} /></div>
                    <div className="space-y-2 md:col-span-2"><Label>Address <span className="text-red-500">*</span></Label><Input name="address" value={shippingInfo.address} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label>City <span className="text-red-500">*</span></Label><Input name="city" value={shippingInfo.city} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label>State <span className="text-red-500">*</span></Label><Input name="state" value={shippingInfo.state} onChange={handleInputChange} /></div>
                    <div className="space-y-2"><Label>ZIP Code <span className="text-red-500">*</span></Label><Input name="zip" value={shippingInfo.zip} onChange={handleInputChange} /></div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payment Method</h3>
                    <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 text-center">
                      <p className="font-medium">Cash on Delivery (COD)</p>
                      <p className="text-xs text-gray-500 mt-1">Pay when your order arrives.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 sticky top-24 hidden lg:block">
                <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{activeSubtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{shippingCost === 0 ? <span className="text-green-600 font-medium">Free</span> : `₹${shippingCost}`}</span></div>
                </div>
                <div className="border-t border-gray-100 pt-4 mb-8">
                  <div className="flex justify-between items-end"><span className="text-lg font-bold text-gray-900">Total</span><span className="text-2xl font-bold text-gray-900">₹{finalTotal.toFixed(2)}</span></div>
                  <p className="text-xs text-gray-400 mt-1 text-right">Including all taxes</p>
                </div>
                {!showCheckout ? (
                  <Button onClick={handleProceedToCheckout} className="w-full bg-[#1C1C1C] hover:bg-gray-800 text-white h-12 rounded-xl text-base font-semibold shadow-lg">Proceed to Checkout <ArrowRight className="ml-2 w-4 h-4" /></Button>
                ) : (
                  <div className="space-y-3">
                    <Button onClick={handlePlaceOrder} disabled={isPlacingOrder} className="w-full bg-[#1C1C1C] hover:bg-gray-800 text-white h-12 rounded-xl text-base font-semibold shadow-lg">{isPlacingOrder ? <Loader2 className="animate-spin" /> : 'Place Order'}</Button>
                    <Button variant="outline" onClick={() => setShowCheckout(false)} className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50">Back to Cart</Button>
                  </div>
                )}
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400"><Shield className="w-4 h-4" /> Secure Checkout</div>
              </div>
            </div>

          </div>
        )}

        {/* --- MOBILE FIXED BOTTOM BAR (Floating Checkout) --- */}
        {activeItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] lg:hidden z-50 safe-area-bottom">
            <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
              <div>
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-xl font-bold text-slate-900">₹{finalTotal.toFixed(2)}</p>
              </div>
              {!showCheckout ? (
                <Button onClick={handleProceedToCheckout} className="bg-[#1C1C1C] text-white px-8 rounded-xl h-11 shadow-lg hover:bg-slate-800">Checkout <ArrowRight className="w-4 h-4 ml-2"/></Button>
              ) : (
                <Button onClick={handlePlaceOrder} disabled={isPlacingOrder} className="bg-[#1C1C1C] text-white px-8 rounded-xl h-11 shadow-lg hover:bg-slate-800">{isPlacingOrder ? <Loader2 className="animate-spin"/> : 'Place Order'}</Button>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}