"use client"

import { motion, useInView } from "framer-motion"
import { useState, useRef } from "react"
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ArrowRight, CreditCard, Truck, Shield, Tag, Sparkles, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
// Sample cart items
const initialCartItems = [
  {
    id: "1",
    name: "Elegant Evening",
    price: 199,
    originalPrice: 249,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80",
    tag: "Best Seller"
  },
  {
    id: "2",
    name: "Romance Collection",
    price: 249,
    originalPrice: 299,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&q=80",
    tag: "Premium"
  }
]

export default function CartCheckout() {
  const [cartItems, setCartItems] = useState(initialCartItems)
  const [showCheckout, setShowCheckout] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState(false)
  
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const discount = appliedCoupon ? subtotal * 0.1 : 0
  const shipping = subtotal > 300 ? 0 : 15
  const total = subtotal - discount + shipping

  const updateQuantity = (id:any, change:any) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    )
  }

  const removeItem = (id:any) => {
    setCartItems(items => items.filter(item => item.id !== id))
  }

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === "save10") {
      setAppliedCoupon(true)
    }
  }

  return (
    <section ref={ref} className="pt-20 xs:pt-24 sm:pt-28 md:pt-32 lg:pt-36 pb-12 xs:pb-14 sm:pb-16 md:pb-20 lg:pb-24 px-3 xs:px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F8F8F8] via-white to-[#F8F8F8] relative overflow-hidden">
      {/* Background Effects */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-10 xs:top-20 right-0 w-[300px] xs:w-[400px] sm:w-[500px] h-[300px] xs:h-[400px] sm:h-[500px] bg-gradient-to-br from-pink-100/40 to-transparent rounded-full blur-3xl pointer-events-none"
      />
      
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-10 xs:bottom-20 left-0 w-[250px] xs:w-[350px] sm:w-[400px] h-[250px] xs:h-[350px] sm:h-[400px] bg-gradient-to-tl from-rose-100/30 to-transparent rounded-full blur-3xl pointer-events-none"
      />

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 xs:mb-8 sm:mb-10 md:mb-12"
        >
          <Link href="/products">
            <motion.button
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 xs:gap-2.5 sm:gap-3 px-3 xs:px-4 sm:px-5 md:px-6 py-2 xs:py-2.5 sm:py-3 bg-white/70 backdrop-blur-xl rounded-full border border-white/40 shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300 group text-xs xs:text-sm sm:text-base"
            >
              <ArrowLeft className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-[#222222] group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-semibold text-[#222222]">Continue Shopping</span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 xs:mb-10 sm:mb-12 md:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 sm:px-5 md:px-6 py-1.5 xs:py-2 sm:py-2.5 md:py-3 bg-white/60 backdrop-blur-sm rounded-full border border-white/40 shadow-lg mb-4 xs:mb-5 sm:mb-6"
          >
            <ShoppingBag className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-[#444444]" />
            <span className="text-xs xs:text-sm sm:text-base text-[#444444] font-medium">
              {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'} in Cart
            </span>
          </motion.div>

          <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#222222] mb-3 xs:mb-4 sm:mb-5 md:mb-6 px-2">
            {showCheckout ? 'Checkout' : 'Shopping Cart'}
          </h1>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-[#444444] max-w-2xl mx-auto px-4">
            {showCheckout ? 'Complete your order' : 'Review your items before checkout'}
          </p>
        </motion.div>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 xs:py-16 sm:py-20"
          >
            <div className="max-w-md mx-auto bg-white/70 backdrop-blur-xl rounded-2xl xs:rounded-3xl border border-white/40 shadow-xl p-6 xs:p-8 sm:p-10 md:p-12">
              <ShoppingBag className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 text-[#DADADA] mx-auto mb-4 xs:mb-5 sm:mb-6" />
              <h3 className="text-xl xs:text-2xl sm:text-3xl font-bold text-[#222222] mb-3 xs:mb-4">Your cart is empty</h3>
              <p className="text-sm xs:text-base sm:text-lg text-[#444444] mb-6 xs:mb-7 sm:mb-8">
                Add some beautiful perfume hampers to get started
              </p>
              <Button className="bg-[#1C1C1C] text-white hover:bg-[#222222] rounded-full px-6 xs:px-7 sm:px-8 py-3 xs:py-3.5 sm:py-4 text-sm xs:text-base">
                Browse Products
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 xs:gap-7 sm:gap-8 lg:gap-10 xl:gap-12">
            {/* Cart Items / Checkout Form */}
            <div className="lg:col-span-2">
              {!showCheckout ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  className="space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6"
                >
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/70 backdrop-blur-xl rounded-xl xs:rounded-2xl sm:rounded-3xl border border-white/40 shadow-xl p-3 xs:p-4 sm:p-5 md:p-6 hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 sm:gap-5 md:gap-6">
                        <div className="relative w-full xs:w-24 sm:w-28 md:w-32 h-24 xs:h-24 sm:h-28 md:h-32 flex-shrink-0 mx-auto xs:mx-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg xs:rounded-xl sm:rounded-2xl"
                          />
                          <span className="absolute top-1.5 xs:top-2 right-1.5 xs:right-2 px-1.5 xs:px-2 py-0.5 xs:py-1 bg-[#222222] text-white text-[10px] xs:text-xs font-bold rounded-full">
                            {item.tag}
                          </span>
                        </div>

                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <h3 className="text-lg xs:text-xl sm:text-2xl font-bold text-[#222222] mb-1.5 xs:mb-2 truncate">{item.name}</h3>
                            <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 mb-3 xs:mb-3.5 sm:mb-4">
                              <span className="text-xl xs:text-2xl font-bold text-[#222222]">${item.price}</span>
                              <span className="text-sm xs:text-base text-[#444444] line-through">${item.originalPrice}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between flex-wrap gap-2.5 xs:gap-3 sm:gap-4">
                            <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 px-3 xs:px-3.5 sm:px-4 py-1.5 xs:py-2 bg-[#F8F8F8] rounded-lg xs:rounded-xl border border-[#DADADA]">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md xs:rounded-lg bg-white hover:bg-[#DADADA] transition-colors"
                              >
                                <Minus className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                              </button>
                              <span className="text-base xs:text-lg font-bold text-[#222222] w-6 xs:w-7 sm:w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md xs:rounded-lg bg-white hover:bg-[#DADADA] transition-colors"
                              >
                                <Plus className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                              </button>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => removeItem(item.id)}
                              className="flex items-center gap-1.5 xs:gap-2 px-3 xs:px-3.5 sm:px-4 py-1.5 xs:py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg xs:rounded-xl transition-colors text-sm xs:text-base"
                            >
                              <Trash2 className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                              <span className="font-semibold">Remove</span>
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/70 backdrop-blur-xl rounded-xl xs:rounded-2xl sm:rounded-3xl border border-white/40 shadow-xl p-4 xs:p-5 sm:p-6 md:p-8"
                >
                  <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-[#222222] mb-4 xs:mb-5 sm:mb-6 md:mb-8">Shipping Information</h2>
                  
                  <div className="space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6">
                    <div className="grid xs:grid-cols-2 gap-3 xs:gap-4">
                      <div>
                        <label className="block text-xs xs:text-sm font-semibold text-[#222222] mb-1.5 xs:mb-2">First Name</label>
                        <input
                          type="text"
                          className="w-full px-3 xs:px-3.5 sm:px-4 py-2 xs:py-2.5 sm:py-3 rounded-lg xs:rounded-xl border-2 border-[#DADADA] bg-white focus:border-[#222222] focus:outline-none transition-colors text-sm xs:text-base"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-xs xs:text-sm font-semibold text-[#222222] mb-1.5 xs:mb-2">Last Name</label>
                        <input
                          type="text"
                          className="w-full px-3 xs:px-3.5 sm:px-4 py-2 xs:py-2.5 sm:py-3 rounded-lg xs:rounded-xl border-2 border-[#DADADA] bg-white focus:border-[#222222] focus:outline-none transition-colors text-sm xs:text-base"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs xs:text-sm font-semibold text-[#222222] mb-1.5 xs:mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full px-3 xs:px-3.5 sm:px-4 py-2 xs:py-2.5 sm:py-3 rounded-lg xs:rounded-xl border-2 border-[#DADADA] bg-white focus:border-[#222222] focus:outline-none transition-colors text-sm xs:text-base"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs xs:text-sm font-semibold text-[#222222] mb-1.5 xs:mb-2">Phone</label>
                      <input
                        type="tel"
                        className="w-full px-3 xs:px-3.5 sm:px-4 py-2 xs:py-2.5 sm:py-3 rounded-lg xs:rounded-xl border-2 border-[#DADADA] bg-white focus:border-[#222222] focus:outline-none transition-colors text-sm xs:text-base"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-xs xs:text-sm font-semibold text-[#222222] mb-1.5 xs:mb-2">Address</label>
                      <input
                        type="text"
                        className="w-full px-3 xs:px-3.5 sm:px-4 py-2 xs:py-2.5 sm:py-3 rounded-lg xs:rounded-xl border-2 border-[#DADADA] bg-white focus:border-[#222222] focus:outline-none transition-colors text-sm xs:text-base"
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div className="grid grid-cols-2 xs:grid-cols-3 gap-3 xs:gap-4">
                      <div className="col-span-2 xs:col-span-1">
                        <label className="block text-xs xs:text-sm font-semibold text-[#222222] mb-1.5 xs:mb-2">City</label>
                        <input
                          type="text"
                          className="w-full px-3 xs:px-3.5 sm:px-4 py-2 xs:py-2.5 sm:py-3 rounded-lg xs:rounded-xl border-2 border-[#DADADA] bg-white focus:border-[#222222] focus:outline-none transition-colors text-sm xs:text-base"
                          placeholder="New York"
                        />
                      </div>
                      <div>
                        <label className="block text-xs xs:text-sm font-semibold text-[#222222] mb-1.5 xs:mb-2">State</label>
                        <input
                          type="text"
                          className="w-full px-3 xs:px-3.5 sm:px-4 py-2 xs:py-2.5 sm:py-3 rounded-lg xs:rounded-xl border-2 border-[#DADADA] bg-white focus:border-[#222222] focus:outline-none transition-colors text-sm xs:text-base"
                          placeholder="NY"
                        />
                      </div>
                      <div>
                        <label className="block text-xs xs:text-sm font-semibold text-[#222222] mb-1.5 xs:mb-2">ZIP Code</label>
                        <input
                          type="text"
                          className="w-full px-3 xs:px-3.5 sm:px-4 py-2 xs:py-2.5 sm:py-3 rounded-lg xs:rounded-xl border-2 border-[#DADADA] bg-white focus:border-[#222222] focus:outline-none transition-colors text-sm xs:text-base"
                          placeholder="10001"
                        />
                      </div>
                    </div>

                    <div className="pt-4 xs:pt-5 sm:pt-6 border-t border-[#DADADA]">
                      <h3 className="text-lg xs:text-xl font-bold text-[#222222] mb-3 xs:mb-4">Payment Method</h3>
                      <div className="space-y-2.5 xs:space-y-3">
                        <label className="flex items-center gap-2.5 xs:gap-3 p-3 xs:p-3.5 sm:p-4 bg-white rounded-lg xs:rounded-xl border-2 border-[#222222] cursor-pointer">
                          <input type="radio" name="payment" defaultChecked className="w-4 h-4 xs:w-5 xs:h-5" />
                          <CreditCard className="w-4 h-4 xs:w-5 xs:h-5 text-[#222222]" />
                          <span className="font-semibold text-[#222222] text-sm xs:text-base">Credit Card</span>
                        </label>
                        <label className="flex items-center gap-2.5 xs:gap-3 p-3 xs:p-3.5 sm:p-4 bg-white rounded-lg xs:rounded-xl border-2 border-[#DADADA] cursor-pointer hover:border-[#222222] transition-colors">
                          <input type="radio" name="payment" className="w-4 h-4 xs:w-5 xs:h-5" />
                          <span className="font-semibold text-[#222222] text-sm xs:text-base">Cash on Delivery</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 }}
                className="bg-white/70 backdrop-blur-xl rounded-xl xs:rounded-2xl sm:rounded-3xl border border-white/40 shadow-xl p-4 xs:p-5 sm:p-6 md:p-8 lg:sticky lg:top-24"
              >
                <div className="flex items-center gap-2 mb-4 xs:mb-5 sm:mb-6">
                  <Sparkles className="w-4 h-4 xs:w-5 xs:h-5 text-[#222222]" />
                  <h2 className="text-xl xs:text-2xl font-bold text-[#222222]">Order Summary</h2>
                </div>

                <div className="space-y-3 xs:space-y-3.5 sm:space-y-4 mb-4 xs:mb-5 sm:mb-6">
                  <div className="flex justify-between text-[#444444] text-sm xs:text-base">
                    <span>Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600 text-sm xs:text-base">
                      <span>Discount (10%)</span>
                      <span className="font-semibold">-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-[#444444] text-sm xs:text-base">
                    <span>Shipping</span>
                    <span className="font-semibold">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>

                  <div className="pt-3 xs:pt-3.5 sm:pt-4 border-t-2 border-[#DADADA]">
                    <div className="flex justify-between text-[#222222]">
                      <span className="text-lg xs:text-xl font-bold">Total</span>
                      <span className="text-xl xs:text-2xl font-bold">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {!showCheckout && !appliedCoupon && (
                  <div className="mb-4 xs:mb-5 sm:mb-6 p-3 xs:p-3.5 sm:p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl xs:rounded-2xl border border-[#DADADA]">
                    <div className="flex items-center gap-1.5 xs:gap-2 mb-2.5 xs:mb-3">
                      <Tag className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-[#222222]" />
                      <span className="text-xs xs:text-sm font-semibold text-[#222222]">Have a coupon?</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1 px-3 xs:px-3.5 sm:px-4 py-1.5 xs:py-2 rounded-lg xs:rounded-xl border-2 border-[#DADADA] bg-white focus:border-[#222222] focus:outline-none text-xs xs:text-sm"
                      />
                      <Button
                        onClick={applyCoupon}
                        className="bg-[#1C1C1C] text-white hover:bg-[#222222] rounded-lg xs:rounded-xl px-3 xs:px-4 text-xs xs:text-sm"
                      >
                        Apply
                      </Button>
                    </div>
                    <p className="text-[10px] xs:text-xs text-[#444444] mt-1.5 xs:mt-2">Try: SAVE10 for 10% off</p>
                  </div>
                )}

                {appliedCoupon && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-4 xs:mb-5 sm:mb-6 p-3 xs:p-3.5 sm:p-4 bg-green-50 rounded-xl xs:rounded-2xl border border-green-200"
                  >
                    <div className="flex items-center gap-2 text-green-600 text-sm xs:text-base">
                      <Check className="w-4 h-4 xs:w-5 xs:h-5" />
                      <span className="font-semibold">Coupon applied successfully!</span>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2 xs:space-y-2.5 sm:space-y-3 mb-4 xs:mb-5 sm:mb-6">
                  <div className="flex items-center gap-2 text-xs xs:text-sm text-[#444444]">
                    <Shield className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs xs:text-sm text-[#444444]">
                    <Truck className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                    <span>Free shipping over $300</span>
                  </div>
                </div>

                {!showCheckout ? (
                  <Button
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-[#1C1C1C] text-white hover:bg-[#222222] rounded-xl xs:rounded-2xl px-4 xs:px-5 sm:px-6 py-4 xs:py-5 sm:py-6 text-base xs:text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 xs:w-5 xs:h-5 ml-2" />
                  </Button>
                ) : (
                  <div className="space-y-2.5 xs:space-y-3">
                    <Button
                      className="w-full bg-[#1C1C1C] text-white hover:bg-[#222222] rounded-xl xs:rounded-2xl px-4 xs:px-5 sm:px-6 py-4 xs:py-5 sm:py-6 text-base xs:text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      Place Order
                      <Check className="w-4 h-4 xs:w-5 xs:h-5 ml-2" />
                    </Button>
                    <Button
                      onClick={() => setShowCheckout(false)}
                      variant="outline"
                      className="w-full border-2 border-[#DADADA] hover:bg-[#F8F8F8] rounded-xl xs:rounded-2xl px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 font-semibold text-sm xs:text-base"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 xs:w-4 xs:h-4 mr-2" />
                      Back to Cart
                    </Button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
