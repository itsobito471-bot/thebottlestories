"use client"

import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Star, Heart, ShoppingBag, Sparkles, Package, Truck, Shield, Check, ArrowLeft, PenLine, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" 
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Product } from "@/lib/types"
import { useCart } from "../app/context/CartContext"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProductViewProps {
  product: Product
}

export default function ProductView({ product }: ProductViewProps) {
  console.log(product,'product')
  const router = useRouter()
  const { addToCart } = useCart()
  
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  // State
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedFragrances, setSelectedFragrances] = useState<string[]>([]) 
  const [customMessage, setCustomMessage] = useState("")
  
  // --- Alert State (Using AlertDialog) ---
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'error';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
  });

  const showAlert = (type: 'success' | 'warning' | 'error', title: string, message: string) => {
    setAlertState({ isOpen: true, type, title, message });
  };

  const closeAlert = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  };

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

  const benefits = [
    { icon: Package, text: "Premium Packaging" },
    { icon: Truck, text: "Free Shipping" },
    { icon: Shield, text: "Authentic Products" }
  ]

  if (!product) {
    return <section className="h-screen flex items-center justify-center"><p>Product not found.</p></section>
  }

  // --- Handlers ---

  const toggleFragrance = (fragranceId: string) => {
    // Multi-select logic for fragrances
    if (selectedFragrances.includes(fragranceId)) {
      setSelectedFragrances(prev => prev.filter(f => f !== fragranceId))
    } else {
      setSelectedFragrances(prev => [...prev, fragranceId])
    }
  }

  const handleAddToCart = () => {
    // 1. Validation
    if (product.available_fragrances && product.available_fragrances.length > 0 && selectedFragrances.length === 0) {
        showAlert(
            'warning',
            'Select a Scent',
            'Please choose at least one fragrance for your hamper before adding to cart.'
        );
        return
    }

    // 2. Add to Cart
    addToCart(product, quantity, {
        fragrances: selectedFragrances, 
        message: customMessage
    });
    
    showAlert(
        'success',
        'Added to Cart',
        `${product.name} has been successfully added to your shopping bag.`
    );
  }

  const handleBuyNow = () => {
    if (product.available_fragrances && product.available_fragrances.length > 0 && selectedFragrances.length === 0) {
        showAlert(
            'warning',
            'Select a Scent',
            'Please choose at least one fragrance for your hamper.'
        );
        return
    }

    // Add to cart silently first
    addToCart(product, quantity, {
        fragrances: selectedFragrances, 
        message: customMessage
    });

    router.push('/cart') 
  }

  return (
    <section ref={ref} className="pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-[#F8F8F8] to-white relative overflow-hidden">
      
      {/* --- ALERT DIALOG (Shadcn/UI) --- */}
      <AlertDialog open={alertState.isOpen} onOpenChange={(isOpen) => !isOpen && closeAlert()}>
        <AlertDialogContent className="rounded-2xl border border-slate-100 shadow-2xl">
          <AlertDialogHeader className="flex flex-col items-center text-center sm:text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              alertState.type === 'success' ? 'bg-green-50 text-green-600' : 
              alertState.type === 'error' ? 'bg-red-50 text-red-600' : 
              'bg-amber-50 text-amber-600'
            }`}>
              {alertState.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            </div>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">
              {alertState.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-base mt-2">
              {alertState.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center mt-4">
            <AlertDialogAction 
              onClick={closeAlert}
              className={`w-full sm:w-auto rounded-xl px-8 h-11 font-medium text-white ${
                alertState.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              Okay, got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- Background Effects --- */}
      <motion.div style={{ y, opacity }} className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-pink-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
      <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [-100, 100]) }} className="absolute bottom-20 left-0 w-[500px] h-[500px] bg-gradient-to-tl from-rose-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-40 left-20 text-pink-200"
      >
        <Sparkles className="w-8 h-8" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, -10, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-40 right-32 text-rose-200"
      >
        <Sparkles className="w-6 h-6" />
      </motion.div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="mb-6 sm:mb-8">
          <Link href="/products">
            <motion.button whileHover={{ scale: 1.05, x: -5 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/70 backdrop-blur-xl rounded-full border border-white/40 shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300 group">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#222222] group-hover:-translate-x-1 transition-transform duration-300" />
            </motion.button>
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start">
          
          {/* --- LEFT SIDE: IMAGES --- */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }} className="lg:sticky lg:top-24">
            <div className="relative mb-4 sm:mb-6">
              <motion.div whileHover={{ scale: 1.02 }} className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-[#DADADA] shadow-2xl">
                {product.images && product.images.length > 0 ? (
                    <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                
                {/* Dynamic Tag Badge */}
                {(product.tag || (product.tags && product.tags.length > 0)) && (
                  <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-[#222222] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                    {/* Handle string tag or populated Tag object */}
                    {product.tag || (typeof product.tags?.[0] === 'object' ? (product.tags[0] as any).name : product.tags?.[0])}
                  </motion.div>
                )}
                
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="absolute top-4 sm:top-6 left-4 sm:left-6 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-[#222222]" />
                </motion.button>
                
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
                </motion.div>
              </motion.div>
            </div>
            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {product.images?.map((image, index) => (
                <motion.button key={index} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedImage(index)} className={`aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all duration-300 ${selectedImage === index ? 'border-[#222222] shadow-xl' : 'border-[#DADADA] hover:border-[#444444]'}`}>
                  <img src={image} alt={`view ${index}`} className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* --- RIGHT SIDE: INFO --- */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }} className="space-y-6 sm:space-y-8">
            
            {/* Title & Price Section */}
            <div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }} className="flex items-center gap-2 text-sm text-[#444444] mb-2">
                    <span>Home</span>/<span>Products</span>/<span className="text-[#222222] font-semibold">{product.name}</span>
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }} className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#222222] leading-tight mb-4">
                    {product.name}
                </motion.h1>
                {/* Rating & Reviews */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }} className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating || 0) ? 'fill-[#222222] text-[#222222]' : 'text-[#DADADA]'}`} />
                      ))}
                    </div>
                    <span className="font-bold text-[#222222]">{product.rating || 0}</span>
                  </div>
                  <span className="text-[#444444]">({product.reviews || 0} reviews)</span>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6 }} className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <span className="text-4xl sm:text-5xl font-bold text-[#222222]">₹{product.price.toLocaleString()}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <>
                        <span className="text-xl sm:text-2xl text-[#444444] line-through">₹{product.originalPrice.toLocaleString()}</span>
                        <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-pink-50 text-[#222222] rounded-full text-xs sm:text-sm font-bold">
                            Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </span>
                        </>
                    )}
                </motion.div>
            </div>

            {/* Description */}
            <motion.p initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.7 }} className="text-lg text-[#444444] leading-relaxed">
              {product.description}
            </motion.p>
            
            {/* --- UPDATED: FRAGRANCE SELECTION --- */}
            {product.available_fragrances && product.available_fragrances.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.8 }} className="space-y-3">
                    <h3 className="font-semibold text-[#222222]">Select Fragrance:</h3>
                    <div className="flex flex-wrap gap-2">
                        {/* We map using 'any' to handle the populated object safely */}
                        {product.available_fragrances.map((fragrance: any) => {
                            // Extract name and id from the object
                            const fragranceId = typeof fragrance === 'object' ? fragrance._id : fragrance;
                            const fragranceName = typeof fragrance === 'object' ? fragrance.name : 'Unknown Scent';
                            const inStock = typeof fragrance === 'object' ? fragrance.in_stock : true;
                            
                            const isSelected = selectedFragrances.includes(fragranceId);
                            
                            return (
                                <button
                                    key={fragranceId} // Use ID for React Key
                                    onClick={() => inStock && toggleFragrance(fragranceId)} // Pass ID to handler now for consistency
                                    disabled={!inStock}
                                    className={`px-4 py-2 rounded-full border transition-all duration-200 text-sm font-medium flex items-center gap-2
                                        ${!inStock ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400' : 
                                          isSelected 
                                            ? 'bg-[#222222] text-white border-[#222222] shadow-md transform scale-105' 
                                            : 'bg-white text-[#444444] border-[#DADADA] hover:border-[#222222]'
                                        }`}
                                >
                                    {fragranceName} {/* Display Name */}
                                    {!inStock && <span className="text-[10px] text-red-500">(Out of Stock)</span>}
                                </button>
                            )
                        })}
                    </div>
                </motion.div>
            )}

            {/* --- UPDATED: CUSTOM MESSAGE (Only if allowed by product) --- */}
            {/* Assuming your product type has 'allow_custom_message' as per your schema */}
            {(product.allow_custom_message || product.allow_custom_message === undefined) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.85 }} className="space-y-3">
                  <h3 className="font-semibold text-[#222222] flex items-center gap-2">
                      <PenLine className="w-4 h-4" /> 
                      Custom Message <span className="text-xs font-normal text-gray-500">(Optional)</span>
                  </h3>
                  <Textarea 
                      placeholder="Write your heartfelt message here..."
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="bg-white border-[#DADADA] focus:ring-black focus:border-black rounded-xl min-h-[80px]"
                      maxLength={200}
                  />
                  <p className="text-xs text-gray-500 text-right">{customMessage.length}/200</p>
              </motion.div>
            )}

            {/* --- ADDED: FEATURES SECTION (Previously missing) --- */}
            {product.features && product.features.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={isInView ? { opacity: 1, y: 0 } : {}} 
                  transition={{ delay: 0.9 }}
                  className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#DADADA]"
                >
                  <h3 className="text-lg sm:text-xl font-bold text-[#222222] mb-4 sm:mb-6">What&apos;s Included:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {product.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 1 + index * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-6 h-6 bg-[#222222] rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[#444444]">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
            )}

            {/* Benefits Icons */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.8 }} className="flex flex-wrap gap-4 py-4 border-t border-b border-[#f0f0f0]">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div key={index} className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-[#222222]" />
                    <span className="text-sm font-semibold text-[#222222]">{benefit.text}</span>
                  </div>
                )
              })}
            </motion.div>

            {/* Quantity & Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1.2 }} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Qty Selector */}
                <div className="flex items-center justify-between sm:justify-start gap-4 px-4 py-3 bg-white border-2 border-[#DADADA] rounded-xl sm:rounded-2xl w-full sm:w-auto">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F8F8F8] hover:bg-[#DADADA] font-bold">-</button>
                    <span className="text-lg font-bold text-[#222222] w-8 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F8F8F8] hover:bg-[#DADADA] font-bold">+</button>
                </div>

                {/* Add to Cart */}
                <Button onClick={handleAddToCart} size="lg" className="flex-1 bg-[#1C1C1C] text-white hover:bg-[#222222] rounded-xl sm:rounded-2xl py-7 text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Add to Cart
                </Button>
              </div>

              {/* Buy Now */}
              <Button onClick={handleBuyNow} size="lg" className="w-full bg-gradient-to-r from-pink-100 to-rose-100 text-[#222222] hover:from-pink-200 hover:to-rose-200 rounded-xl sm:rounded-2xl py-7 text-base sm:text-lg font-bold border-2 border-[#DADADA] shadow-lg hover:shadow-xl transition-all duration-300">
                Buy Now
              </Button>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  )
}