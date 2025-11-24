'use client';

import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  ArrowRight, 
  CreditCard, 
  Truck, 
  Shield, 
  Tag, 
  Sparkles, 
  Check,
  Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';

// --- Imports from your project ---
import { Button } from '@/components/ui/button';
import { useCart } from '../app/context/CartContext'; // Use the new Context hook
import { api } from '@/lib/apiService'; // Use your API helper
import { Input } from './ui/input';

export default function CartPage() {
  const router = useRouter();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  // Use global cart state
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();

  // Local state for checkout flow
  const [showCheckout, setShowCheckout] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  // Shipping Form State
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });

  // Calculations
  const shippingCost = cartTotal > 3000 ? 0 : 150; // Example: Free shipping over 3000
  const finalTotal = cartTotal + shippingCost;

  // --- Handlers ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleProceedToCheckout = () => {
    // 1. Check Authentication
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Redirect to login, pass current path as redirect param
      Swal.fire({
        title: 'Please Login',
        text: 'You need to be logged in to complete your purchase.',
        icon: 'info',
        confirmButtonText: 'Go to Login',
        confirmButtonColor: '#1C1C1C'
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/login?redirect=/cart');
        }
      });
      return;
    }
    
    // 2. If logged in, show checkout form
    setShowCheckout(true);
    
    // Optional: Pre-fill user data from localStorage if available
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
  };

  const handlePlaceOrder = async () => {
    // Basic Validation
    if (!shippingInfo.address || !shippingInfo.phone || !shippingInfo.city) {
      Swal.fire('Missing Information', 'Please fill in all required shipping details.', 'warning');
      return;
    }

    setIsPlacingOrder(true);

    try {
      // 3. Send Order to Backend
      // Note: Your backend endpoint might be /api/orders or /api/admin/orders 
      // Adjust based on your route setup. Usually customer orders go to /api/orders
      await api.post('/orders', {
        items: cart,
        shippingAddress: shippingInfo,
        totalAmount: finalTotal
      });

      // 4. Success!
      clearCart();
      
      await Swal.fire({
        title: 'Order Placed!',
        text: 'Thank you for your purchase. You will receive an email confirmation shortly.',
        icon: 'success',
        confirmButtonText: 'Continue Shopping',
        confirmButtonColor: '#1C1C1C'
      });
      
      router.push('/products');

    } catch (error: any) {
      console.error("Order failed", error);
      Swal.fire('Order Failed', error.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <section ref={ref} className="pt-20 pb-24 px-4 bg-gradient-to-b from-[#F8F8F8] via-white to-[#F8F8F8] min-h-screen relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-0 w-[500px] h-[500px] bg-pink-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-0 w-[400px] h-[400px] bg-rose-100/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Back Button */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href="/products">
            <Button variant="outline" className="rounded-full border-slate-200 hover:bg-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#222222] mb-4">
            {showCheckout ? 'Checkout' : 'Shopping Cart'}
          </h1>
          <p className="text-gray-500">
            {showCheckout ? 'Enter your shipping details' : `You have ${cart.length} items in your cart`}
          </p>
        </div>

        {cart.length === 0 ? (
          // Empty State
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/40 shadow-sm max-w-2xl mx-auto"
          >
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
            <Link href="/products">
              <Button size="lg" className="bg-[#1C1C1C] hover:bg-gray-800 text-white rounded-full px-8">
                Start Shopping
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Column: Cart Items OR Shipping Form */}
            <div className="lg:col-span-2">
              {!showCheckout ? (
                // --- CART ITEMS VIEW ---
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {cart.map((item) => (
                    <div key={item._id} className="bg-white rounded-2xl p-4 flex gap-4 items-center shadow-sm border border-gray-100">
                      <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 truncate">{item.name}</h3>
                            {item.tag && <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">{item.tag}</span>}
                          </div>
                          <button 
                            onClick={() => removeFromCart(item._id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex justify-between items-end mt-4">
                          <div className="flex items-center border border-gray-200 rounded-lg">
                            <button 
                              onClick={() => updateQuantity(item._id, -1)}
                              className="p-1.5 hover:bg-gray-50 text-gray-600"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item._id, 1)}
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
                  ))}
                </motion.div>
              ) : (
                // --- CHECKOUT FORM VIEW ---
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

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 sticky top-24">
                <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? <span className="text-green-600 font-medium">Free</span> : `₹${shippingCost}`}</span>
                  </div>
                  {/* You can add Tax logic here later */}
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