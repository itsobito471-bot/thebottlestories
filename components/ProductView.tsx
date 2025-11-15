"use client"

import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Star, Heart, ShoppingBag, Sparkles, Package, Truck, Shield, Check, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Product } from "@/lib/types" // <-- 1. Import Product type

// --- 2. DELETE the entire 'allProducts' array ---
// const allProducts = [ ... (delete all 200+ lines) ... ]

interface ProductViewProps {
  product: Product // <-- 3. Change prop from productId to product
}

export default function ProductView({ product }: ProductViewProps) {
  // console.log("Rendering ProductView for product:", product)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  // --- 4. DELETE the useState and useEffect for product ---
  // const [product, setProduct] = useState(allProducts[0])
  // useEffect(() => { ... }, [productId])

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // All animation logic remains unchanged
  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

  const benefits = [
    { icon: Package, text: "Premium Packaging" },
    { icon: Truck, text: "Free Shipping" },
    { icon: Shield, text: "Authentic Products" }
  ]

  // --- 5. Add a check in case product is somehow null ---
  // (The page.tsx should prevent this, but it's safe practice)
  if (!product) {
    return (
      <section className="h-screen flex items-center justify-center">
        <p>Product not found.</p>
      </section>
    )
  }

  return (
    <section ref={ref} className="pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-[#F8F8F8] to-white relative overflow-hidden">
      {/* All parallax, sparkles, and motion divs remain unchanged */}
      <motion.div
        style={{ y, opacity }}
        className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-pink-100/30 to-transparent rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [-100, 100]) }}
        className="absolute bottom-20 left-0 w-[500px] h-[500px] bg-gradient-to-tl from-rose-100/30 to-transparent rounded-full blur-3xl pointer-events-none"
      />
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
        {/* Back Button (unchanged) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <Link href="/products">
            <motion.button
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/70 backdrop-blur-xl rounded-full border border-white/40 shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300 group"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#222222] group-hover:-translate-x-1 transition-transform duration-300" />
            </motion.button>
          </Link>
        </motion.div>

        {/* --- 6. ALL YOUR DESIGN/ANIMATION JSX REMAINS THE SAME --- */}
        {/* It now reads from the 'product' prop instead of the state variable */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-start">
          {/* Product Images - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="lg:sticky lg:top-24"
          >
            {/* Main Image */}
            <div className="relative mb-4 sm:mb-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-[#DADADA] shadow-2xl"
              >
                <img
                  src={product.images[selectedImage]} // This now works with the 'product' prop
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {/* ... (Gradient, Badge, Heart button, Sparkle... all unchanged) ... */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-[#222222] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg"
                >
                  {product.tag}
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-4 sm:top-6 left-4 sm:left-6 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-[#222222]" />
                </motion.button>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute bottom-4 sm:bottom-8 right-4 sm:right-8"
                >
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
                </motion.div>
              </motion.div>
              {/* ... (Image Glow, unchanged) ... */}
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              {product.images.map((image, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                    selectedImage === index
                      ? 'border-[#222222] shadow-xl'
                      : 'border-[#DADADA] hover:border-[#444444]'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Product view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Product Info - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* ... (Breadcrumb, unchanged) ... */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 text-sm text-[#444444]"
            >
              <span>Home</span>
              <span>/</span>
              <span>Products</span>
              <span>/</span>
              <span className="text-[#222222] font-semibold">{product.name}</span>
            </motion.div>
            
            {/* Product Name (unchanged) */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#222222] leading-tight"
            >
              {product.name}
            </motion.h1>

            {/* Rating & Reviews (unchanged) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating || 0) ? 'fill-[#222222] text-[#222222]' : 'text-[#DADADA]'}`}
                    />
                  ))}
                </div>
                <span className="font-bold text-[#222222]">{product.rating || 0}</span>
              </div>
              <span className="text-[#444444]">({product.reviews || 0} reviews)</span>
            </motion.div>

            {/* Price (unchanged, but now calculates discount dynamically) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center gap-3 sm:gap-4"
            >
              <span className="text-4xl sm:text-5xl font-bold text-[#222222]">₹{product.price.toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-xl sm:text-2xl text-[#444444] line-through">₹{product.originalPrice.toFixed(2)}</span>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-pink-50 text-[#222222] rounded-full text-xs sm:text-sm font-bold">
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                </>
              )}
            </motion.div>

            {/* Description (unchanged) */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7 }}
              className="text-lg text-[#444444] leading-relaxed"
            >
              {product.description}
            </motion.p>

            {/* Benefits (unchanged) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap gap-4"
            >
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div key={index} className="flex items-center gap-2 px-4 py-3 bg-white border border-[#DADADA] rounded-full shadow-md">
                    <Icon className="w-5 h-5 text-[#222222]" />
                    <span className="text-sm font-semibold text-[#222222]">{benefit.text}</span>
                  </div>
                )
              })}
            </motion.div>

            {/* Features (unchanged) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.9 }}
              className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#DADADA]"
            >
              <h3 className="text-lg sm:text-xl font-bold text-[#222222] mb-4 sm:mb-6">What&apos;s Included:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {product.features?.map((feature, index) => (
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

            {/* Quantity & Add to Cart (unchanged) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.2 }}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-[#DADADA] rounded-xl sm:rounded-2xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-[#F8F8F8] hover:bg-[#DADADA] transition-colors text-lg font-bold"
                >
                  -
                </button>
                <span className="text-lg sm:text-xl font-bold text-[#222222] w-10 sm:w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-[#F8F8F8] hover:bg-[#DADADA] transition-colors text-lg font-bold"
                >
                  +
                </button>
              </div>
              <Button
                size="lg"
                className="flex-1 bg-[#1C1C1C] text-white hover:bg-[#222222] rounded-xl sm:rounded-2xl px-6 sm:px-8 py-6 sm:py-7 text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Add to Cart
              </Button>
            </motion.div>

            {/* Buy Now Button (unchanged) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.3 }}
            >
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-pink-100 to-rose-100 text-[#222222] hover:from-pink-200 hover:to-rose-200 rounded-xl sm:rounded-2xl px-6 sm:px-8 py-6 sm:py-7 text-base sm:text-lg font-bold border-2 border-[#DADADA] shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Buy Now
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}