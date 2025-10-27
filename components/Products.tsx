"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingBag, ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import { useRouter } from 'next/navigation'

export default function Products() {
  const router = useRouter()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)

  const products = [
    {
      name: "Elegant Evening",
      description: "A sophisticated collection of evening fragrances with luxury packaging",
      price: "$199",
      image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80",
      tag: "Best Seller"
    },
    {
      name: "Romance Collection",
      description: "Perfect for anniversaries with rose-infused perfumes and chocolates",
      price: "$249",
      image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80",
      tag: "Premium"
    },
    {
      name: "Corporate Elite",
      description: "Professional gift hampers with timeless scents for business occasions",
      price: "$299",
      image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80",
      tag: "Corporate"
    },
    {
      name: "Celebration Special",
      description: "Festive hampers with champagne notes and sparkling accents",
      price: "$349",
      image: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80",
      tag: "Limited Edition"
    },
    {
      name: "Luxury Voyage",
      description: "Travel-sized luxury perfumes in premium leather case",
      price: "$179",
      image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=80",
      tag: "Travel Set"
    },
    {
      name: "Signature Series",
      description: "Our most exclusive collection with rare and exotic fragrances",
      price: "$499",
      image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80",
      tag: "Exclusive"
    }
  ]

  // Duplicate products for infinite loop effect
  const duplicatedProducts = [...products, ...products, ...products]

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => prev + 1)
    }, 3000)

    return () => clearInterval(timer)
  }, [])

  // Reset to middle set when reaching end or start
  useEffect(() => {
    if (currentIndex >= products.length * 2) {
      setTimeout(() => {
        setCurrentIndex(products.length)
      }, 50)
    } else if (currentIndex <= 0) {
      setTimeout(() => {
        setCurrentIndex(products.length)
      }, 50)
    }
  }, [currentIndex, products.length])

  const goToNext = () => {
    setCurrentIndex((prev) => prev + 1)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => prev - 1)
  }

  return (
    <section ref={ref} className="py-24 px-4 bg-gradient-to-b from-[#F8F8F8] to-[#FFFFFF] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#DADADA]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#DADADA]/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
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

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-white/90 backdrop-blur-sm hover:bg-white p-4 rounded-full shadow-xl border border-[#DADADA] transition-all duration-300 hover:scale-110"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 text-[#222222]" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-white/90 backdrop-blur-sm hover:bg-white p-4 rounded-full shadow-xl border border-[#DADADA] transition-all duration-300 hover:scale-110"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 text-[#222222]" />
          </button>

          {/* Products Carousel */}
          <div className="overflow-hidden px-2">
            <motion.div
              animate={{ x: `-${(currentIndex / duplicatedProducts.length) * 100}%` }}
              transition={{ 
                type: "tween",
                ease: "linear",
                duration: 0.5
              }}
              className="flex"
              style={{ width: `${duplicatedProducts.length * (100 / itemsPerView)}%` }}
            >
              {duplicatedProducts.map((product, index) => (
                <div
                  key={index}
                  className="px-3"
                  style={{ width: `${100 / duplicatedProducts.length}%` }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    whileHover={{ y: -15, transition: { duration: 0.3 } }}
                    className="group relative h-full"
                  >
                    <div className="h-full bg-white rounded-3xl overflow-hidden border border-[#DADADA] shadow-lg hover:shadow-2xl transition-all duration-500">
                      {/* Product Image */}
                      <div className="relative h-80 overflow-hidden bg-[#F8F8F8]">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Tag */}
                        <div className="absolute top-6 right-6">
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            className="px-4 py-2 bg-[#222222]/90 backdrop-blur-sm text-[#F8F8F8] text-xs font-semibold rounded-full shadow-lg"
                          >
                            {product.tag}
                          </motion.span>
                        </div>

                        {/* Sparkle Effect */}
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.3
                          }}
                          className="absolute top-8 left-8"
                        >
                          <Sparkles className="w-5 h-5 text-white" />
                        </motion.div>

                        {/* Quick View Button */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <Button
                            size="sm"
                            className="bg-white text-[#222222] hover:bg-[#F8F8F8] rounded-full px-6 shadow-lg"
                          >
                            Quick View
                          </Button>
                        </motion.div>
                      </div>

                      {/* Product Info */}
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
                            <span className="text-3xl font-bold text-[#222222]">{product.price}</span>
                          </div>
                          <Button
                            size="sm"
                            className="bg-[#1C1C1C] text-[#F8F8F8] hover:bg-[#222222] rounded-full px-6 py-5 group-hover:px-8 transition-all duration-300 shadow-md"
                          >
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Glow Effect */}
                    <motion.div
                      animate={{
                        scale: [1, 1.02, 1],
                        opacity: [0, 0.15, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.3
                      }}
                      className="absolute inset-0 bg-gradient-to-br from-[#1C1C1C] to-transparent rounded-3xl pointer-events-none"
                    />
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {products.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(products.length + index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  Math.floor((currentIndex % products.length)) === index
                    ? 'w-8 bg-[#222222]'
                    : 'w-2 bg-[#DADADA] hover:bg-[#444444]'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <Button
            size="lg"
            className="bg-[#1C1C1C] text-[#F8F8F8] hover:bg-[#222222] rounded-2xl px-10 py-7 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            View All Products
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}