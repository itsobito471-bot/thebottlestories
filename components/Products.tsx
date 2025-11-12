"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingBag, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from 'next/navigation'
// NEW: Import API service and new Product interface
import { getPreferredProducts } from "@/lib/appService"
import { Product } from "@/lib/types" // Using the interface from appService

// NEW: Default data to use as a fallback
const defaultProducts: Product[] = [
  { 
    _id: "default-1", 
    name: "Elegant Evening", 
    description: "A sophisticated collection of evening fragrances with luxury packaging", 
    price: 199, 
    images: ["https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80"], 
    tag: "Best Seller",
    // --- ADDED MISSING PROPERTIES ---
    stock_quantity: 10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    _id: "default-2", 
    name: "Romance Collection", 
    description: "Perfect for anniversaries with rose-infused perfumes and chocolates", 
    price: 249, 
    images: ["https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80"], 
    tag: "Premium",
    // --- ADDED MISSING PROPERTIES ---
    stock_quantity: 10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    _id: "default-3", 
    name: "Corporate Elite", 
    description: "Professional gift hampers with timeless scents for business occasions", 
    price: 299, 
    images: ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80"], 
    tag: "Corporate",
    // --- ADDED MISSING PROPERTIES ---
    stock_quantity: 10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    _id: "default-4", 
    name: "Celebration Special", 
    description: "Festive hampers with champagne notes and sparkling accents", 
    price: 349, 
    images: ["https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80"], 
    tag: "Limited Edition",
    // --- ADDED MISSING PROPERTIES ---
    stock_quantity: 10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    _id: "default-5", 
    name: "Luxury Voyage", 
    description: "Travel-sized luxury perfumes in premium leather case", 
    price: 179, 
    images: ["https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=80"], 
    tag: "Travel Set",
    // --- ADDED MISSING PROPERTIES ---
    stock_quantity: 10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    _id: "default-6", 
    name: "Signature Series", 
    description: "Our most exclusive collection with rare and exotic fragrances", 
    price: 499, 
    images: ["https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80"], 
    tag: "Exclusive",
    // --- ADDED MISSING PROPERTIES ---
    stock_quantity: 10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export default function Products() {
  const router = useRouter()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [itemsPerView, setItemsPerView] = useState(3)

  // NEW: State for products, loading
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // NEW: Fetch data from API on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const apiProducts = await getPreferredProducts();
        
        if (apiProducts && apiProducts.length > 0) {
          setProducts(apiProducts);
        } else {
          // API succeeded but returned no products, use default
          setProducts(defaultProducts);
        }
      } catch (error) {
        console.error("Failed to fetch preferred products:", error);
        // ON FAIL: Use the default hardcoded data as a fallback
        setProducts(defaultProducts);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []) // Empty dependency array means this runs once on mount

  // --- Carousel Logic (driven by `products` state) ---
  const [currentIndex, setCurrentIndex] = useState(0) // Start at 0, will be reset
  const duplicatedProducts = products.length > 0 ? [...products, ...products, ...products] : []

  // Update currentIndex AFTER products are loaded
  useEffect(() => {
    setCurrentIndex(products.length);
  }, [products.length])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1)
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2)
      } else {
        setItemsPerView(3)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isCarouselActive = products.length > itemsPerView;

  // Auto-advance timer
  useEffect(() => {
    if (!isCarouselActive || isLoading) return; // Don't run if loading
    const timer = setInterval(() => {
      setCurrentIndex((prev) => prev + 1)
    }, 3000)
    return () => clearInterval(timer)
  }, [isCarouselActive, isLoading])

  // Reset for infinite loop
  useEffect(() => {
    if (!isCarouselActive || isLoading) return;

    if (currentIndex >= products.length * 2) {
      setTimeout(() => setCurrentIndex(products.length), 50)
    }
    if (currentIndex <= products.length - 1) {
      setTimeout(() => setCurrentIndex(products.length * 2 - 1), 50)
    }
  }, [currentIndex, products.length, isCarouselActive, isLoading])

  const goToNext = () => {
    setCurrentIndex((prev) => prev + 1)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => prev - 1)
  }

  const displayProducts = isCarouselActive ? duplicatedProducts : products

  return (
    <section id="products" ref={ref} className="py-24 px-4 bg-gradient-to-b from-[#F8F8F8] to-[#FFFFFF] relative overflow-hidden">
      {/* ... (decorative elements) ... */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#DADADA]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#DADADA]/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* ... (header content) ... */}
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#444444] mb-4 px-6 py-3 bg-white rounded-full border border-[#DADADA] shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            OUR COLLECTION
          </motion.span>
          <h2 className="text-5xl md:text-6xl font-bold text-[#222222] mb-6">
            Curated Gift Hampers
          </h2>
          <p className="text-lg md:text-xl text-[#444444] max-w-3xl mx-auto">
            Discover our handpicked selection of luxury perfume gift hampers, each designed to create unforgettable moments.
          </p>
        </motion.div>

        <div className="relative">
          {/* ... (Navigation buttons, skipped if !isCarouselActive) ... */}
          {isCarouselActive && (
            <>
              <button onClick={goToPrev} /* ... (button styles) ... */ >
                <ChevronLeft className="w-6 h-6 text-[#222222]" />
              </button>
              <button onClick={goToNext} /* ... (button styles) ... */ >
                <ChevronRight className="w-6 h-6 text-[#222222]" />
              </button>
            </>
          )}

          <div className="overflow-hidden px-2">
            
            {/* NEW: Loading State */}
            {isLoading ? (
              <div className="text-center py-20">
                 <p className="text-lg text-[#444444]">Loading Collection...</p>
                 {/* You could put a spinner here */}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                 <h3 className="text-3xl font-bold text-[#222222] mb-4">
                  New Collection Coming Soon!
                </h3>
                <p className="text-lg text-[#444444]">
                  We're curating exciting new products for you. Please check back later.
                </p>
              </div>
            ) : (
              <motion.div
                animate={isCarouselActive ? { x: `-${(currentIndex / displayProducts.length) * 100}%` } : {}}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
                className={`flex ${!isCarouselActive ? 'justify-center' : ''}`}
                style={{ 
                  width: isCarouselActive 
                    ? `${displayProducts.length * (100 / itemsPerView)}%` 
                    : '100%' 
                }}
              >
                {displayProducts.map((product, index) => (
                  <div
                    // UPDATED: Use product._id for key if available, else index
                    key={product._id || index}
                    className="px-3"
                    style={{ 
                      width: isCarouselActive 
                        ? `${100 / displayProducts.length}%` 
                        : `${100 / itemsPerView}%`,
                      maxWidth: !isCarouselActive && itemsPerView === 1 ? '100%' : 'none'
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      whileHover={{ y: -15, transition: { duration: 0.3 } }}
                      className="group relative h-full"
                    >
                      {/* --- Product Card Content --- */}
                      <div className="h-full bg-white rounded-3xl overflow-hidden border border-[#DADADA] shadow-lg hover:shadow-2xl transition-all duration-500">
                        <div className="relative h-80 overflow-hidden bg-[#F8F8F8]">
                          <img 
                            // UPDATED: Use images[0]
                            src={product.images[0] || '/placeholder.jpg'} // Add a fallback image
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          {/* ... (Tag, Sparkle, etc.) ... */}
                          <div className="absolute top-6 right-6">
                            <motion.span /* ... */ >
                              {product.tag}
                            </motion.span>
                          </div>
                          {/* ... */}
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileHover={{ opacity: 1, y: 0 }}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300"
                          >
                            <Button
                              size="sm"
                              className="bg-white text-[#222222] hover:bg-[#F8F8F8] rounded-full px-6 shadow-lg"
                              // UPDATED: Use product._id for the link
                              onClick={() => router.push(`/product/${product._id}`)}
                            >
                              Quick View
                            </Button>
                          </motion.div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-2xl font-bold text-[#222222] mb-2 group-hover:text-[#444444] transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-[#444444] mb-6 leading-relaxed text-sm line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between pt-4 border-t border-[#DADADA]">
                            <div>
                              <p className="text-xs text-[#444444] mb-1">Starting from</p>
                              {/* UPDATED: Format price from number */}
                              <span className="text-3xl font-bold text-[#222222]">${product.price}</span>
                            </div>
                            <Button /* ... */ >
                              <ShoppingBag className="w-4 h-4 mr-2" />
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                      <motion.div /* ... (Glow effect) ... */ />
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* ... (Dots Indicator, skipped if !isCarouselActive) ... */}
          {isCarouselActive && (
            <div className="flex justify-center gap-2 mt-8">
              {products.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(products.length + index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    (currentIndex % products.length) === index
                      ? 'w-8 bg-[#222222]'
                      : 'w-2 bg-[#DADADA] hover:bg-[#444444]'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ... (View All Button) ... */}
        {products.length > 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-16"
          >
            <Button
              size="lg"
              className="bg-[#1C1C1C] text-[#F8F8F8] hover:bg-[#222222] rounded-2xl px-10 py-7 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              onClick={() => router.push("/products")}
            >
              View All Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  )
}