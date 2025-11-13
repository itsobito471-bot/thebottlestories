"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
// --- 1. IMPORT Loader2 ---
import { ShoppingBag, ArrowRight, Sparkles, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useRouter } from 'next/navigation'
import { getPreferredProducts } from "@/lib/appService"
import { Product } from "@/lib/types"

const defaultProducts: Product[] = [
  { 
    _id: "default-1", 
    name: "Elegant Evening", 
    description: "A sophisticated collection of evening fragrances with luxury packaging", 
    price: 199, 
    images: ["https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80"], 
    tag: "Best Seller",
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

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // --- 2. ADD NEW STATE FOR ROUTING ---
  const [isRouting, setIsRouting] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const apiProducts = await getPreferredProducts();
        
        if (apiProducts && apiProducts.length > 0) {
          setProducts(apiProducts);
        } else {
          setProducts(defaultProducts);
        }
      } catch (error) {
        console.error("Failed to fetch preferred products:", error);
        setProducts(defaultProducts);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []) 

  const [currentIndex, setCurrentIndex] = useState(0)
  const duplicatedProducts = products.length > 0 ? [...products, ...products, ...products] : []

  useEffect(() => {
    if (products.length > 0) {
      setCurrentIndex(products.length);
    }
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

  useEffect(() => {
    if (!isCarouselActive || isLoading) return; 
    const timer = setInterval(() => {
      setCurrentIndex((prev) => prev + 1)
    }, 3000)
    return () => clearInterval(timer)
  }, [isCarouselActive, isLoading])

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
          {isCarouselActive && (
            <>
              <button 
                onClick={goToPrev} 
                className="absolute top-1/2 -translate-y-1/2 -left-4 z-20 w-12 h-12 bg-white/70 backdrop-blur-sm border border-[#DADADA] rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6 text-[#222222]" />
              </button>
              <button 
                onClick={goToNext} 
                className="absolute top-1/2 -translate-y-1/2 -right-4 z-20 w-12 h-12 bg-white/70 backdrop-blur-sm border border-[#DADADA] rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6 text-[#222222]" />
              </button>
            </>
          )}
          
          <div className="overflow-hidden px-2 py-8">
            
            {isLoading ? (
              <div className="text-center py-20">
                 <p className="text-lg text-[#444444]">Loading Collection...</p>
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
                      <div className="h-full bg-white rounded-3xl overflow-hidden border border-[#DADADA] shadow-lg hover:shadow-2xl transition-all duration-500">
                        <div className="relative h-80 overflow-hidden bg-[#F8F8F8]">
                          <img 
                            src={product.images[0] || '/placeholder.jpg'} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute top-6 right-6">
                            <motion.span 
                              initial={{ opacity: 0, y: 10 }}
                              animate={isInView ? { opacity: 1, y: 0 } : {}}
                              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                              className="px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full text-sm font-semibold text-[#222222] shadow-md"
                            >
                              {product.tag}
                            </motion.span>
                          </div>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileHover={{ opacity: 1, y: 0 }}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300"
                          >
                            <Button
                              size="sm"
                              className="bg-white text-[#222222] hover:bg-[#F8F8F8] rounded-full px-6 shadow-lg"
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
                              <span className="text-3xl font-bold text-[#222222]">${product.price.toFixed(2)}</span>
                            </div>
                            <Button 
                              size="icon" 
                              className="w-12 h-12 bg-[#1C1C1C] text-white hover:bg-[#222222] rounded-full shadow-lg group-hover:scale-110 transition-transform"
                            >
                              <ShoppingBag className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <motion.div 
                        animate={{
                          scale: [1, 1.03, 1],
                          opacity: [0, 0.15, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 0.5 + index * 0.2
                        }}
                        className="absolute inset-0 bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl -z-10 blur-xl pointer-events-none" 
                      />
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

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

        {products.length > 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-16"
          >
            {/* --- 3. UPDATED BUTTON --- */}
            <Button
              size="lg"
              className="bg-[#1C1C1C] text-[#F8F8F8] hover:bg-[#222222] rounded-2xl px-10 py-7 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              onClick={() => {
                setIsRouting(true); // Set loading state
                router.push("/products");
              }}
              disabled={isRouting} // Disable button when routing
            >
              {isRouting ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  View All Products
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
            {/* --- END UPDATED BUTTON --- */}
          </motion.div>
        )}
      </div>
    </section>
  )
}