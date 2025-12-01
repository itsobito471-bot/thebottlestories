"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { 
  Star, Heart, ShoppingBag, Sparkles, Package, Truck, Shield, 
  Check, ArrowLeft, PenLine, AlertCircle, CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/types";
import { useCart } from "../app/context/CartContext";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProductViewProps {
  product: Product;
}

export default function ProductView({ product }: ProductViewProps) {
  const router = useRouter();
  
  // --- FIX: Ensure we get addToDirectCart from context ---
  const { addToCart, addToDirectCart } = useCart();
  
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  // --- State ---
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedFragrances, setSelectedFragrances] = useState<string[]>([]); 
  const [customMessage, setCustomMessage] = useState("");
  
  // --- Alert State ---
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

  // --- Animation Hooks ---
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const benefits = [
    { icon: Package, text: "Premium Packaging" },
    { icon: Truck, text: "Free Shipping" },
    { icon: Shield, text: "Authentic Products" }
  ];

  if (!product) {
    return (
      <section className="h-screen flex items-center justify-center">
        <p>Product not found.</p>
      </section>
    );
  }

  // --- Handlers ---

  const toggleFragrance = (fragranceId: string) => {
    if (selectedFragrances.includes(fragranceId)) {
      setSelectedFragrances((prev) => prev.filter((f) => f !== fragranceId));
    } else {
      setSelectedFragrances((prev) => [...prev, fragranceId]);
    }
  };

  const handleAddToCart = () => {
    const hasFragrances = product.available_fragrances && product.available_fragrances.length > 0;

    // Validation
    if (hasFragrances && selectedFragrances.length === 0) {
        showAlert('warning', 'Select a Scent', 'Please select at least one fragrance to proceed.');
        return;
    }

    // Logic: Separate Entries
    if (hasFragrances) {
        selectedFragrances.forEach((fragId) => {
            addToCart(product, quantity, {
                fragrances: [fragId],
                message: customMessage
            });
        });
    } else {
        addToCart(product, quantity, {
            fragrances: [],
            message: customMessage
        });
    }
    
    // Success Message
    const totalItemsAdded = hasFragrances ? (selectedFragrances.length * quantity) : quantity;
    
    showAlert(
        'success',
        'Added to Cart',
        hasFragrances 
          ? `Successfully added ${totalItemsAdded} items (${selectedFragrances.length} variations) to your cart.`
          : `${product.name} has been added to your cart.`
    );
    
    setSelectedFragrances([]);
  };

  // --- FIX: HANDLE BUY NOW ---
  const handleBuyNow = () => {
    const hasFragrances = product.available_fragrances && product.available_fragrances.length > 0;

    if (hasFragrances && selectedFragrances.length === 0) {
        showAlert('warning', 'Select a Scent', 'Please select at least one fragrance.');
        return;
    }

    // Use addToDirectCart instead of addToCart
    if (hasFragrances) {
        selectedFragrances.forEach((fragId) => {
            // Ensure your Context has this function!
            if (addToDirectCart) {
                addToDirectCart(product, quantity, {
                    fragrances: [fragId],
                    message: customMessage
                });
            } else {
                // Fallback if context missing (prevents crash but logic needs context update)
                console.error("addToDirectCart is missing from CartContext");
                addToCart(product, quantity, {
                    fragrances: [fragId],
                    message: customMessage
                });
            }
        });
    } else {
        if (addToDirectCart) {
            addToDirectCart(product, quantity, {
                fragrances: [],
                message: customMessage
            });
        } else {
            addToCart(product, quantity, {
                fragrances: [],
                message: customMessage
            });
        }
    }

    router.push('/cart?buy_now=true');
  };

  // Render variables
  const totalItemsToAdd = (product.available_fragrances && product.available_fragrances.length > 0 && selectedFragrances.length > 0)
    ? selectedFragrances.length * quantity
    : quantity;

  // Safe tag extraction
  const tagName = product.tag || (product.tags && product.tags.length > 0 
    ? (typeof product.tags[0] === 'object' ? (product.tags[0] as any).name : product.tags[0]) 
    : null);

  return (
    <section ref={ref} className="pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-[#F8F8F8] to-white relative overflow-hidden">
      
      {/* Alert Dialog */}
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

      {/* Bg Effects */}
      <motion.div style={{ y, opacity }} className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-pink-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
      <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [-100, 100]) }} className="absolute bottom-20 left-0 w-[500px] h-[500px] bg-gradient-to-tl from-rose-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="mb-6 sm:mb-8">
          <Link href="/products">
            <motion.button whileHover={{ scale: 1.05, x: -5 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/70 backdrop-blur-xl rounded-full border border-white/40 shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300 group">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#222222] group-hover:-translate-x-1 transition-transform duration-300" />
            </motion.button>
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start">
          
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }} className="lg:sticky lg:top-24">
            <div className="relative mb-4 sm:mb-6">
              <motion.div whileHover={{ scale: 1.02 }} className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-[#DADADA] shadow-2xl">
                {product.images && product.images.length > 0 ? (
                    <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                )}
                
                {tagName && (
                  <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-[#222222] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                    {tagName}
                  </motion.div>
                )}
                
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="absolute top-4 sm:top-6 left-4 sm:left-6 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-[#222222]" />
                </motion.button>
              </motion.div>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {product.images?.map((image, index) => (
                <motion.button key={index} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedImage(index)} className={`aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all duration-300 ${selectedImage === index ? 'border-[#222222] shadow-xl' : 'border-[#DADADA] hover:border-[#444444]'}`}>
                  <img src={image} alt={`view ${index}`} className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }} className="space-y-6 sm:space-y-8">
            
            {/* Title & Price */}
            <div>
                <motion.div className="flex items-center gap-2 text-sm text-[#444444] mb-2">
                    <span>Home</span>/<span>Products</span>/<span className="text-[#222222] font-semibold">{product.name}</span>
                </motion.div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#222222] leading-tight mb-4">
                    {product.name}
                </h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating || 0) ? 'fill-[#222222] text-[#222222]' : 'text-[#DADADA]'}`} />
                      ))}
                    </div>
                    <span className="font-bold text-[#222222]">{product.rating || 0}</span>
                  </div>
                  <span className="text-[#444444]">({product.reviews || 0} reviews)</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <span className="text-4xl sm:text-5xl font-bold text-[#222222]">₹{product.price.toLocaleString()}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <>
                        <span className="text-xl sm:text-2xl text-[#444444] line-through">₹{product.originalPrice.toLocaleString()}</span>
                        <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-pink-50 text-[#222222] rounded-full text-xs sm:text-sm font-bold">
                            Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </span>
                        </>
                    )}
                </div>
            </div>

            <p className="text-lg text-[#444444] leading-relaxed">
              {product.description}
            </p>
            
            {/* Scents */}
            {product.available_fragrances && product.available_fragrances.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-semibold text-[#222222]">Select Fragrance:</h3>
                    <div className="flex flex-wrap gap-2">
                        {product.available_fragrances.map((fragrance: any) => {
                            const fragranceId = typeof fragrance === 'object' ? fragrance._id : fragrance;
                            const fragranceName = typeof fragrance === 'object' ? fragrance.name : 'Unknown Scent';
                            const inStock = typeof fragrance === 'object' ? fragrance.in_stock : true;
                            
                            const isSelected = selectedFragrances.includes(fragranceId);
                            
                            return (
                                <button
                                    key={fragranceId}
                                    onClick={() => inStock && toggleFragrance(fragranceId)}
                                    disabled={!inStock}
                                    className={`px-4 py-2 rounded-full border transition-all duration-200 text-sm font-medium flex items-center gap-2
                                        ${!inStock ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400' : 
                                          isSelected 
                                            ? 'bg-[#222222] text-white border-[#222222] shadow-md transform scale-105' 
                                            : 'bg-white text-[#444444] border-[#DADADA] hover:border-[#222222]'
                                        }`}
                                >
                                    {fragranceName}
                                    {!inStock && <span className="text-[10px] text-red-500">(Out of Stock)</span>}
                                    {isSelected && <Check className="w-3 h-3 ml-1" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Message */}
            {(product.allow_custom_message || product.allow_custom_message === undefined) && (
              <div className="space-y-3">
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
              </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#DADADA]">
                  <h3 className="text-lg sm:text-xl font-bold text-[#222222] mb-4 sm:mb-6">What&apos;s Included:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {product.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-[#222222] rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[#444444]">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
            )}

            <div className="flex flex-wrap gap-4 py-4 border-t border-b border-[#f0f0f0]">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-[#222222]" />
                    <span className="text-sm font-semibold text-[#222222]">{benefit.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center justify-between sm:justify-start gap-4 px-4 py-3 bg-white border-2 border-[#DADADA] rounded-xl sm:rounded-2xl w-full sm:w-auto">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F8F8F8] hover:bg-[#DADADA] font-bold">-</button>
                    <span className="text-lg font-bold text-[#222222] w-8 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F8F8F8] hover:bg-[#DADADA] font-bold">+</button>
                </div>

                <Button onClick={handleAddToCart} size="lg" className="flex-1 bg-[#1C1C1C] text-white hover:bg-[#222222] rounded-xl sm:rounded-2xl py-7 text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    {totalItemsToAdd > 1 ? `Add ${totalItemsToAdd} Items` : 'Add to Cart'}
                </Button>
              </div>

              <Button onClick={handleBuyNow} size="lg" className="w-full bg-gradient-to-r from-pink-100 to-rose-100 text-[#222222] hover:from-pink-200 hover:to-rose-200 rounded-xl sm:rounded-2xl py-7 text-base sm:text-lg font-bold border-2 border-[#DADADA] shadow-lg hover:shadow-xl transition-all duration-300">
                Buy Now
              </Button>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}