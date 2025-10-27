"use client"

import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Star, Heart, ShoppingBag, Sparkles, Package, Truck, Shield, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

// Define all your products
const allProducts = [
  {
    id: "elegant-evening",
    name: "Elegant Evening",
    price: "$199",
    originalPrice: "$249",
    rating: 4.9,
    reviews: 156,
    description: "A sophisticated collection of evening fragrances with luxury packaging that creates an unforgettable experience.",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80",
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80",
      "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80"
    ],
    features: [
      "3 Premium Perfumes (50ml each)",
      "Luxury Gift Box with Ribbon",
      "Personalized Message Card",
      "Elegant Rose Gold Packaging",
      "Complimentary Gift Wrapping",
      "Premium Velvet Pouch"
    ],
    tag: "Best Seller"
  },
  {
    id: "romance-collection",
    name: "Romance Collection",
    price: "$249",
    originalPrice: "$299",
    rating: 4.9,
    reviews: 203,
    description: "Perfect for anniversaries with rose-infused perfumes and chocolates that express love.",
    images: [
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80",
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80",
      "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80"
    ],
    features: [
      "2 Premium Perfumes (100ml each)",
      "Artisan Chocolates Selection",
      "Hand-written Love Notes",
      "Crystal Gift Box",
      "Red Rose Arrangement",
      "Silk Ribbon Packaging"
    ],
    tag: "Premium"
  },
  {
    id: "corporate-elite",
    name: "Corporate Elite",
    price: "$299",
    originalPrice: "$349",
    rating: 4.8,
    reviews: 89,
    description: "Professional gift hampers with timeless scents for business occasions.",
    images: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80",
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80",
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80",
      "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80"
    ],
    features: [
      "Executive Perfume Collection",
      "Premium Leather Case",
      "Business Card Holder",
      "Monogrammed Gift Box",
      "Corporate Branding Option",
      "Express Delivery Available"
    ],
    tag: "Corporate"
  },
  {
    id: "celebration-special",
    name: "Celebration Special",
    price: "$349",
    originalPrice: "$399",
    rating: 5.0,
    reviews: 124,
    description: "Festive hampers with champagne notes and sparkling accents.",
    images: [
      "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80",
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80",
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80"
    ],
    features: [
      "4 Celebration Perfumes",
      "Champagne-inspired Scents",
      "Gold-plated Gift Box",
      "Festive Decorations",
      "Party Favor Tags",
      "Premium Gift Wrapping"
    ],
    tag: "Limited Edition"
  },
  {
    id: "luxury-voyage",
    name: "Luxury Voyage",
    price: "$179",
    originalPrice: "$229",
    rating: 4.7,
    reviews: 67,
    description: "Travel-sized luxury perfumes in premium leather case.",
    images: [
      "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=80",
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80",
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80"
    ],
    features: [
      "5 Travel Perfumes (15ml each)",
      "Genuine Leather Case",
      "TSA-approved Sizes",
      "Refillable Bottles",
      "Compact Design",
      "Travel Pouch Included"
    ],
    tag: "Travel Set"
  },
  {
    id: "signature-series",
    name: "Signature Series",
    price: "$499",
    originalPrice: "$599",
    rating: 5.0,
    reviews: 234,
    description: "Our most exclusive collection with rare and exotic fragrances.",
    images: [
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80",
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80",
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80"
    ],
    features: [
      "Rare Fragrance Collection",
      "Hand-crafted Crystal Bottles",
      "Limited Edition Box",
      "Certificate of Authenticity",
      "Personal Consultation",
      "Lifetime Guarantee"
    ],
    tag: "Exclusive"
  }
]

interface ProductViewProps {
  productId: string
}

export default function ProductView({ productId }: ProductViewProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState(allProducts[0])

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

  // Find product by ID
  useEffect(() => {
    const foundProduct = allProducts.find(p => p.id === productId)
    if (foundProduct) {
      setProduct(foundProduct)
    }
  }, [productId])

  const benefits = [
    { icon: Package, text: "Premium Packaging" },
    { icon: Truck, text: "Free Shipping" },
    { icon: Shield, text: "Authentic Products" }
  ]

  return (
    <section ref={ref} className="py-32 px-4 bg-gradient-to-b from-white via-[#F8F8F8] to-white relative overflow-hidden">
      {/* Parallax Background Elements */}
      <motion.div
        style={{ y, opacity }}
        className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-pink-100/30 to-transparent rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [-100, 100]) }}
        className="absolute bottom-20 left-0 w-[500px] h-[500px] bg-gradient-to-tl from-rose-100/30 to-transparent rounded-full blur-3xl pointer-events-none"
      />

      {/* Floating Sparkles */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-40 left-20 text-pink-200"
      >
        <Sparkles className="w-8 h-8" />
      </motion.div>
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, -10, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-40 right-32 text-rose-200"
      >
        <Sparkles className="w-6 h-6" />
      </motion.div>

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Product Images - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="sticky top-8"
          >
            {/* Main Image */}
            <div className="relative mb-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-[#DADADA] shadow-2xl"
              >
                <img 
                  src={product.images[selectedImage]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                {/* Badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute top-6 right-6 bg-[#222222] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                >
                  {product.tag}
                </motion.div>

                {/* Wishlist Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-6 left-6 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <Heart className="w-6 h-6 text-[#222222]" />
                </motion.button>

                {/* Sparkle Effect */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                  className="absolute bottom-8 right-8"
                >
                  <Sparkles className="w-8 h-8 text-white drop-shadow-lg" />
                </motion.div>
              </motion.div>

              {/* Image Glow */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0, 0.2, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="absolute inset-0 bg-gradient-to-br from-pink-200 to-rose-200 rounded-3xl blur-2xl pointer-events-none"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
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
            className="space-y-8"
          >
            {/* Breadcrumb */}
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

            {/* Product Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-5xl font-bold text-[#222222] leading-tight"
            >
              {product.name}
            </motion.h1>

            {/* Rating & Reviews */}
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
                      className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-[#222222] text-[#222222]' : 'text-[#DADADA]'}`}
                    />
                  ))}
                </div>
                <span className="font-bold text-[#222222]">{product.rating}</span>
              </div>
              <span className="text-[#444444]">({product.reviews} reviews)</span>
            </motion.div>

            {/* Price */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-4"
            >
              <span className="text-5xl font-bold text-[#222222]">{product.price}</span>
              <span className="text-2xl text-[#444444] line-through">{product.originalPrice}</span>
              <span className="px-4 py-2 bg-pink-50 text-[#222222] rounded-full text-sm font-bold">
                Save {Math.round(((parseInt(product.originalPrice.replace('$', '')) - parseInt(product.price.replace('$', ''))) / parseInt(product.originalPrice.replace('$', ''))) * 100)}%
              </span>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7 }}
              className="text-lg text-[#444444] leading-relaxed"
            >
              {product.description}
            </motion.p>

            {/* Benefits */}
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

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.9 }}
              className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-8 border border-[#DADADA]"
            >
              <h3 className="text-xl font-bold text-[#222222] mb-6">What's Included:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Quantity Selector & Add to Cart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.2 }}
              className="flex flex-wrap gap-4"
            >
              {/* Quantity */}
              <div className="flex items-center gap-4 px-6 py-4 bg-white border-2 border-[#DADADA] rounded-2xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F8F8F8] hover:bg-[#DADADA] transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-bold text-[#222222] w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F8F8F8] hover:bg-[#DADADA] transition-colors"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <Button
                size="lg"
                className="flex-1 bg-[#1C1C1C] text-white hover:bg-[#222222] rounded-2xl px-8 py-7 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </motion.div>

            {/* Buy Now Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.3 }}
            >
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-pink-100 to-rose-100 text-[#222222] hover:from-pink-200 hover:to-rose-200 rounded-2xl px-8 py-7 text-lg font-bold border-2 border-[#DADADA] shadow-lg hover:shadow-xl transition-all duration-300"
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