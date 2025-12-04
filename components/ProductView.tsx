"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useState, useEffect, useMemo } from "react";
import { 
  Star, ShoppingBag, Package, Truck, Shield, Check, ArrowLeft, 
  PenLine, AlertCircle, CheckCircle2, User as UserIcon, Sparkles, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product, SelectedFragrance } from "@/lib/types"; // Make sure types are updated
import { useCart } from "../app/context/CartContext";
import { Textarea } from "@/components/ui/textarea";
import { checkUserRating, submitProductRating } from "@/lib/appService";
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
  const { addToCart, addToDirectCart } = useCart();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }
  }, []);
  
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  // --- State ---
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [customMessage, setCustomMessage] = useState("");
  
  // --- NEW: Slot Selection State ---
  // Tracks selection for each bottle slot: { 0: "fragranceId", 1: "fragranceId" }
  const [slotSelections, setSlotSelections] = useState<Record<number, string>>({});

  // --- Calculate Slots from BottleConfig ---
  const bottleSlots = useMemo(() => {
    if (!product.bottleConfig || product.bottleConfig.length === 0) {
      // Fallback: If no config, assume 1 generic slot
      return [{ size: 'Standard', label: 'Perfume Selection' }];
    }
    const slots: { size: string, label: string }[] = [];
    product.bottleConfig.forEach((config) => {
      for (let i = 0; i < config.quantity; i++) {
        slots.push({
          size: config.size,
          label: `${config.size} Bottle`
        });
      }
    });
    return slots;
  }, [product.bottleConfig]);

  // --- Rating State ---
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && product._id) {
        checkUserRating(product._id)
            .then((res) => {
                if (res.hasRated) {
                    setHasRated(true);
                    setUserRating(res.rating);
                }
            })
            .catch(() => {});
    }
  }, [isAuthenticated, product._id]);

  // --- Alert State ---
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'warning' | 'error';
  }>({ isOpen: false, title: '', message: '', type: 'warning' });

  const showAlert = (type: 'success' | 'warning' | 'error', title: string, message: string) => {
    setAlertState({ isOpen: true, type, title, message });
  };
  const closeAlert = () => setAlertState((prev) => ({ ...prev, isOpen: false }));

  // --- Animation Hooks ---
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const benefits = [
    { icon: Package, text: "Premium Packaging" },
    { icon: Truck, text: "Free Shipping" },
    { icon: Shield, text: "Authentic Products" }
  ];

  if (!product) return <section className="h-screen flex items-center justify-center"><p>Product not found.</p></section>;

  // --- Handlers ---

  // Helper to validate and format the user's selections
  const getFormattedSelections = (): SelectedFragrance[] | null => {
    const hasFragrances = product.available_fragrances && product.available_fragrances.length > 0;
    
    // If product has no fragrances to choose from, return empty array
    if (!hasFragrances) return []; 

    // Validate: Ensure every slot has a selection
    if (Object.keys(slotSelections).length < bottleSlots.length) {
      return null;
    }

    return bottleSlots.map((slot, index) => {
        const fragId = slotSelections[index];
        const fragObj = product.available_fragrances?.find((f: any) => 
            (typeof f === 'object' ? f._id : f) === fragId
        );
        // Safely extract name
        const fragName = typeof fragObj === 'object' ? fragObj.name : 'Selected Scent';
        
        return {
            fragranceId: fragId,
            fragranceName: fragName,
            size: slot.size,
            label: slot.label
        };
    });
  };

  const handleSlotChange = (index: number, value: string) => {
    setSlotSelections(prev => ({ ...prev, [index]: value }));
  };

  const handleAddToCart = () => {
    const selections = getFormattedSelections();

    if (selections === null) {
        showAlert('warning', 'Incomplete Selection', `Please select a fragrance for all ${bottleSlots.length} bottles.`);
        return;
    }

    addToCart(product, quantity, { fragrances: selections, message: customMessage });
    
    showAlert('success', 'Added to Cart', `${product.name} has been added to your cart.`);
    // Optional: Reset selections
    setSlotSelections({});
    setCustomMessage("");
  };

  const handleBuyNow = () => {
    const selections = getFormattedSelections();

    if (selections === null) {
        showAlert('warning', 'Incomplete Selection', `Please select a fragrance for all ${bottleSlots.length} bottles.`);
        return;
    }

    const cartFn = addToDirectCart || addToCart;
    cartFn(product, quantity, { fragrances: selections, message: customMessage });

    router.push('/cart?buy_now=true');
  };

  const handleRateProduct = async (ratingValue: number) => {
    if (!isAuthenticated) {
        showAlert('warning', 'Login Required', 'Please log in to rate this product.');
        return;
    }
    setIsRatingSubmitting(true);
    try {
        await submitProductRating(product._id, ratingValue);
        setUserRating(ratingValue);
        setHasRated(true);
        showAlert('success', 'Thank You!', 'Your rating has been submitted successfully.');
    } catch (error: any) {
        showAlert('error', 'Error', error.message || 'Failed to submit rating');
    } finally {
        setIsRatingSubmitting(false);
    }
  };

  // Safe tag name extraction
  const tagName = product?.tags && product.tags.length > 0 
    ? (typeof product.tags[0] === 'object' ? (product.tags[0] as any).name : 'Featured') 
    : null;

  return (
    <section ref={ref} className="pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-[#F8F8F8] to-white relative overflow-hidden">
      
      {/* Alert Dialog */}
      <AlertDialog open={alertState.isOpen} onOpenChange={(isOpen) => !isOpen && closeAlert()}>
        <AlertDialogContent className="rounded-2xl border border-slate-100 shadow-2xl">
          <AlertDialogHeader className="flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              alertState.type === 'success' ? 'bg-green-50 text-green-600' : 
              alertState.type === 'error' ? 'bg-red-50 text-red-600' : 
              'bg-amber-50 text-amber-600'
            }`}>
              {alertState.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">{alertState.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 mt-2">{alertState.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center mt-4">
            <AlertDialogAction onClick={closeAlert} className={`w-full sm:w-auto rounded-xl px-8 h-11 font-medium text-white ${alertState.type === 'success' ? 'bg-green-600' : 'bg-slate-900'}`}>Okay</AlertDialogAction>
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
          
          {/* --- LEFT: IMAGES --- */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }} className="lg:sticky lg:top-24">
            <div className="relative mb-4 sm:mb-6">
              <motion.div whileHover={{ scale: 1.02 }} className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-[#DADADA] shadow-2xl">
                {product.images && product.images.length > 0 ? (
                    <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                )}
                {tagName && <div className="absolute top-6 right-6 bg-[#222222] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">{tagName}</div>}
              </motion.div>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {product.images?.map((image, index) => (
                <motion.button key={index} onClick={() => setSelectedImage(index)} className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${selectedImage === index ? 'border-[#222222] shadow-xl' : 'border-[#DADADA] hover:border-[#444444]'}`}>
                  <img src={image} alt={`view ${index}`} className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* --- RIGHT: INFO & ACTIONS --- */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }} className="space-y-6 sm:space-y-8">
            
            {/* Title & Price */}
            <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#222222] leading-tight mb-4">{product.name}</h1>
                
                {/* Rating Stars */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="font-bold text-[#222222]">{product.rating ? product.rating.toFixed(1) : "0.0"}</span>
                  </div>
                  <span className="text-[#444444] text-sm font-medium">{product.reviews || 0} reviews</span>
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

            <p className="text-lg text-[#444444] leading-relaxed">{product.description}</p>
            
            {/* --- SLOT CONFIGURATION SECTION --- */}
            {product.available_fragrances && product.available_fragrances.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <Sparkles className="w-5 h-5 text-slate-900" />
                        <h3 className="font-bold text-slate-900">Customize Your Hamper</h3>
                    </div>
                    
                    <div className="grid gap-3">
                        {bottleSlots.map((slot, index) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                                        {index + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm text-slate-900">{slot.label}</span>
                                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{slot.size}</span>
                                    </div>
                                </div>
                                
                                <div className="w-full sm:w-auto">
                                    <select 
                                        className="w-full sm:w-[200px] h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none cursor-pointer"
                                        value={slotSelections[index] || ""}
                                        onChange={(e) => handleSlotChange(index, e.target.value)}
                                    >
                                        <option value="" disabled>Select a Scent</option>
                                        {product.available_fragrances?.map((frag: any) => {
                                            const fragId = typeof frag === 'object' ? frag._id : frag;
                                            const fragName = typeof frag === 'object' ? frag.name : 'Unknown Scent';
                                            const isStock = typeof frag === 'object' ? frag.in_stock : true;
                                            
                                            return (
                                                <option key={fragId} value={fragId} disabled={!isStock}>
                                                    {fragName} {!isStock ? '(Out of Stock)' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Custom Message */}
            {(product.allow_custom_message || product.allow_custom_message === undefined) && (
              <div className="space-y-3">
                  <h3 className="font-semibold text-[#222222] flex items-center gap-2">
                      <PenLine className="w-4 h-4" /> Custom Message <span className="text-xs font-normal text-gray-500">(Optional)</span>
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

            {/* Features List */}
            {product.features && product.features.length > 0 && (
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#DADADA]">
                  <h3 className="text-lg sm:text-xl font-bold text-[#222222] mb-4">What&apos;s Included:</h3>
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

            {/* Benefits Icons */}
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

            {/* Cart Actions */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center justify-between sm:justify-start gap-4 px-4 py-3 bg-white border-2 border-[#DADADA] rounded-xl sm:rounded-2xl w-full sm:w-auto">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F8F8F8] hover:bg-[#DADADA] font-bold">-</button>
                    <span className="text-lg font-bold text-[#222222] w-8 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F8F8F8] hover:bg-[#DADADA] font-bold">+</button>
                </div>

                <Button onClick={handleAddToCart} size="lg" className="flex-1 bg-[#1C1C1C] text-white hover:bg-[#222222] rounded-xl sm:rounded-2xl py-7 text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Add to Cart
                </Button>
              </div>

              <Button onClick={handleBuyNow} size="lg" className="w-full bg-gradient-to-r from-pink-100 to-rose-100 text-[#222222] hover:from-pink-200 hover:to-rose-200 rounded-xl sm:rounded-2xl py-7 text-base sm:text-lg font-bold border-2 border-[#DADADA] shadow-lg hover:shadow-xl transition-all duration-300">
                Buy Now
              </Button>
            </div>

            {/* Rating UI */}
            <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="text-lg font-bold text-[#222222] mb-3">Rate this Product</h3>
                {!isAuthenticated ? (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <UserIcon className="w-5 h-5 text-slate-400" />
                            <p className="text-sm text-slate-600">Login to share your opinion.</p>
                        </div>
                        <Link href="/login">
                            <Button variant="outline" size="sm" className="rounded-full px-6">Login</Button>
                        </Link>
                    </div>
                ) : hasRated ? (
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100 flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                        <div>
                            <p className="text-sm font-bold text-green-800">Thanks for rating!</p>
                            <p className="text-xs text-green-700">You rated this product {userRating} stars.</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm text-center">
                        <p className="text-slate-600 mb-3 text-sm font-medium">How would you rate your experience?</p>
                        <div className="flex justify-center gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => handleRateProduct(star)}
                                    disabled={isRatingSubmitting}
                                    className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                                >
                                    <Star className={`w-8 h-8 transition-colors duration-200 ${star <= (hoverRating || userRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400">Click a star to submit</p>
                    </div>
                )}
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}