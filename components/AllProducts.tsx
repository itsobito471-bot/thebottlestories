"use client"

import { motion } from "framer-motion"
import { useState, useMemo } from "react"
import { Search, X, SlidersHorizontal, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const allProducts = [
  {
    id: "1",
    name: "Elegant Evening",
    description: "A sophisticated collection of evening fragrances with luxury packaging",
    price: "$199",
    originalPrice: "$249",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80",
    tag: "Best Seller",
    category: "Evening"
  },
  {
    id: "2",
    name: "Romance Collection",
    description: "Perfect for anniversaries with rose-infused perfumes and chocolates",
    price: "$249",
    originalPrice: "$299",
    image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80",
    tag: "Premium",
    category: "Romance"
  },
  {
    id: "3",
    name: "Corporate Elite",
    description: "Professional gift hampers with timeless scents for business occasions",
    price: "$299",
    originalPrice: "$349",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80",
    tag: "Corporate",
    category: "Business"
  },
  {
    id: "4",
    name: "Celebration Special",
    description: "Festive hampers with champagne notes and sparkling accents",
    price: "$349",
    originalPrice: "$399",
    image: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&q=80",
    tag: "Limited Edition",
    category: "Celebration"
  },
  {
    id: "5",
    name: "Luxury Voyage",
    description: "Travel-sized luxury perfumes in premium leather case",
    price: "$179",
    originalPrice: "$229",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=80",
    tag: "Travel Set",
    category: "Travel"
  },
  {
    id: "6",
    name: "Signature Series",
    description: "Our most exclusive collection with rare and exotic fragrances",
    price: "$499",
    originalPrice: "$599",
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=80",
    tag: "Exclusive",
    category: "Luxury"
  }
]

const categories = ["All", "Evening", "Romance", "Business", "Celebration", "Travel", "Luxury"]

export default function AllProducts() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.tag.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  return (
    <section className="pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F8F8F8] via-white to-[#F8F8F8] relative overflow-hidden">
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
        className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-br from-pink-100/40 to-transparent rounded-full blur-3xl pointer-events-none"
      />

      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/60 backdrop-blur-sm rounded-full border border-white/40 shadow-lg mb-6"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#444444]" />
            <span className="text-sm sm:text-base text-[#444444] font-medium">Discover Our Collection</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#222222] mb-4 sm:mb-6">
            All Products
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-[#444444] max-w-2xl mx-auto">
            Explore our curated collection of luxury perfume hampers
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 sm:mb-12"
        >
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/40 shadow-xl p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-[#444444]" />
                <input
                  type="text"
                  placeholder="Search products, tags, or descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 sm:pl-16 pr-12 sm:pr-14 py-3 sm:py-4 lg:py-5 rounded-xl sm:rounded-2xl border-2 border-white/60 bg-white/80 backdrop-blur-sm text-[#222222] placeholder:text-[#444444] focus:outline-none focus:border-[#222222] transition-all duration-300 text-sm sm:text-base"
                />
                {searchQuery && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-[#F2F2F2] hover:bg-[#DADADA] rounded-full flex items-center justify-center transition-all duration-300"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-[#222222]" />
                  </motion.button>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="lg:hidden flex items-center justify-center gap-2 px-6 py-3 sm:py-4 bg-[#1C1C1C] text-white rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 hover:bg-[#222222]"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </motion.button>
            </div>

            <div className={`overflow-hidden lg:block ${isFilterOpen ? 'block' : 'hidden'}`}>
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-white/40">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 text-sm sm:text-base ${
                      selectedCategory === category
                        ? "bg-[#1C1C1C] text-white shadow-lg"
                        : "bg-white/80 text-[#444444] hover:bg-white border border-white/60"
                    }`}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 sm:mt-6 flex items-center justify-between text-sm sm:text-base text-[#444444]"
          >
            <span>
              Showing <span className="font-bold text-[#222222]">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'product' : 'products'}
            </span>
            {searchQuery && (
              <span>
                Results for <span className="font-bold text-[#222222]">&quot;{searchQuery}&quot;</span>
              </span>
            )}
          </motion.div>
        </motion.div>

        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 sm:py-20 lg:py-24"
          >
            <div className="max-w-md mx-auto bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 shadow-xl p-8 sm:p-12">
              <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-[#DADADA] mx-auto mb-4 sm:mb-6" />
              <h3 className="text-2xl sm:text-3xl font-bold text-[#222222] mb-3 sm:mb-4">No products found</h3>
              <p className="text-base sm:text-lg text-[#444444] mb-6 sm:mb-8">
                Try adjusting your search or filters
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("All")
                }}
                className="bg-[#1C1C1C] text-white hover:bg-[#222222] rounded-full px-6 sm:px-8 py-3 sm:py-4"
              >
                Clear All Filters
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/product/${product.id}`}>
                  <motion.div
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="group bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="absolute top-4 right-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#222222] text-white text-xs sm:text-sm font-bold rounded-full shadow-lg"
                      >
                        {product.tag}
                      </motion.div>

                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: index * 0.2
                        }}
                        className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      >
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg" />
                      </motion.div>
                    </div>

                    <div className="p-5 sm:p-6 lg:p-8">
                      <h3 className="text-xl sm:text-2xl font-bold text-[#222222] mb-2 sm:mb-3 group-hover:text-[#444444] transition-colors duration-300">
                        {product.name}
                      </h3>

                      <p className="text-sm sm:text-base text-[#444444] mb-4 sm:mb-6 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-2xl sm:text-3xl font-bold text-[#222222]">
                            {product.price}
                          </span>
                          <span className="text-sm sm:text-base text-[#444444] line-through">
                            {product.originalPrice}
                          </span>
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1C1C1C] rounded-full flex items-center justify-center group-hover:bg-[#222222] transition-colors duration-300 shadow-lg"
                        >
                          <span className="text-white text-lg sm:text-xl font-bold">→</span>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
