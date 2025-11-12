"use client"

import { motion } from "framer-motion"
import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { Search, X, SlidersHorizontal, Sparkles, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
// NEW: Import API function and Product interface
import { filterProducts } from "@/lib/appService"
import { Product } from "@/lib/types" // Using the interface from appService

// --- REMOVED STATIC allProducts ARRAY ---

const categories = ["All", "Evening", "Romance", "Business", "Celebration", "Travel", "Luxury"]

// NEW: Skeleton loader component
const ProductSkeleton = () => (
  <div className="bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/40 shadow-xl overflow-hidden">
    <div className="relative aspect-square bg-[#F0F0F0] animate-pulse" />
    <div className="p-5 sm:p-6 lg:p-8">
      <div className="h-6 bg-[#F0F0F0] rounded w-3/4 mb-3 animate-pulse" />
      <div className="h-4 bg-[#F0F0F0] rounded w-full mb-6 animate-pulse" />
      <div className="h-4 bg-[#F0F0F0] rounded w-1/2 mb-6 animate-pulse" />
      <div className="flex items-center justify-between">
        <div className="h-8 bg-[#F0F0F0] rounded w-1/3 animate-pulse" />
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F0F0F0] rounded-full animate-pulse" />
      </div>
    </div>
  </div>
)

export default function AllProducts() {
  const [searchQuery, setSearchQuery] = useState("")
  // NEW: Debounced search query for API
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // NEW: State for API data
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true) // Are there more pages to load?
  const [isLoading, setIsLoading] = useState(true) // Initial page load
  const [isLoadingMore, setIsLoadingMore] = useState(false) // Subsequent page loads
  const [error, setError] = useState<string | null>(null)

  // --- NEW: Debounce search query ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500) // 500ms delay

    return () => {
      clearTimeout(handler)
    }
  }, [searchQuery])

  // --- NEW: Reset products when filters change ---
  useEffect(() => {
    setProducts([]) // Clear products
    setPage(1)       // Reset to page 1
    setHasMore(true) // Assume there is more data
    setError(null)
  }, [debouncedSearchQuery, selectedCategory]) // Trigger on debounced search

  // --- NEW: Fetch data from API ---
  useEffect(() => {
    // Don't fetch if there are no more pages
    if (!hasMore) {
      setIsLoading(false)
      setIsLoadingMore(false)
      return
    }

    const fetchApiData = async () => {
      if (page === 1) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }
      setError(null)

      try {
        const apiTag = selectedCategory === "All" ? undefined : selectedCategory
        const data = await filterProducts({
          search: debouncedSearchQuery,
          tag: apiTag,
          page: page,
          limit: 10 // Fetch 10 products per page
        })

        if (page === 1) {
          setProducts(data.products) // Set new list
        } else {
          setProducts((prev) => [...prev, ...data.products]) // Append to list
        }
        
        // Update pagination status
        setHasMore(data.currentPage < data.totalPages)

      } catch (err) {
        console.error("Failed to fetch products:", err)
        setError("Failed to load products. Please try again later.")
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    }

    fetchApiData()
  }, [debouncedSearchQuery, selectedCategory, page, hasMore]) // Re-run on filter or page change

  // --- NEW: Infinite Scroll Logic ---
  const observer = useRef<IntersectionObserver>()
  const lastProductElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading || isLoadingMore) return
    if (observer.current) observer.current.disconnect() // Disconnect old observer

    observer.current = new IntersectionObserver(entries => {
      // If the last element is visible and we have more pages
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1) // Load next page
      }
    })

    if (node) observer.current.observe(node) // Observe new last element
  }, [isLoading, isLoadingMore, hasMore])
  
  // --- REMOVED useMemo ---
  // The API now handles filtering
  
  return (
    <section className="pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F8F8F8] via-white to-[#F8F8F8] relative overflow-hidden min-h-screen">
      {/* ... (decorative elements) ... */}
      <motion.div /* ... */ />

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* ... (Back button) ... */}
        <motion.div /* ... */ >
          <Link href="/">
            <motion.button /* ... */ >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#222222] group-hover:-translate-x-1 transition-transform duration-300" />
            </motion.button>
          </Link>
        </motion.div>

        {/* ... (Header text) ... */}
        <motion.div /* ... */ className="text-center mb-12 sm:mb-16">
          <motion.div /* ... */ >
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

        {/* --- Filter & Search Section (Unchanged logic, just state-driven) --- */}
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

          {!isLoading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 sm:mt-6 flex items-center justify-between text-sm sm:text-base text-[#444444]"
            >
              <span>
                Showing <span className="font-bold text-[#222222]">{products.length}</span> {products.length === 1 ? 'product' : 'products'}
              </span>
              {debouncedSearchQuery && (
                <span>
                  Results for <span className="font-bold text-[#222222]">&quot;{debouncedSearchQuery}&quot;</span>
                </span>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* --- NEW: Loading, Error, and Product Grid Logic --- */}
        {isLoading ? (
          // Initial Loading State (Skeleton)
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : error ? (
          // Error State
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto bg-white/70 backdrop-blur-xl rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-red-600 mb-4">Error</h3>
              <p className="text-lg text-[#444444]">{error}</p>
            </div>
          </motion.div>
        ) : products.length === 0 ? (
          // No Products Found State
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
          // Products Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {products.map((product, index) => (
              <motion.div
                // NEW: Attach ref to the last element for infinite scroll
                ref={products.length === index + 1 ? lastProductElementRef : null}
                key={product._id} // Use _id from MongoDB
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (index % 10) * 0.05 }} // Stagger new items
              >
                <Link href={`/product/${product._id}`}>
                  <motion.div
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="group bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer h-full flex flex-col"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        src={product.images[0] || '/placeholder.jpg'} // Use first image
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {/* ... (Gradient overlay) ... */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {product.tag && (
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.2 + (index % 10) * 0.05 }}
                          className="absolute top-4 right-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#222222] text-white text-xs sm:text-sm font-bold rounded-full shadow-lg"
                        >
                          {product.tag}
                        </motion.div>
                      )}
                      {/* ... (Sparkles effect) ... */}
                    </div>

                    <div className="p-5 sm:p-6 lg:p-8 flex-grow flex flex-col">
                      <h3 className="text-xl sm:text-2xl font-bold text-[#222222] mb-2 sm:mb-3 group-hover:text-[#444444] transition-colors duration-300">
                        {product.name}
                      </h3>

                      <p className="text-sm sm:text-base text-[#444444] mb-4 sm:mb-6 line-clamp-2 flex-grow">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-2xl sm:text-3xl font-bold text-[#222222]">
                            ${product.price} {/* Format number as currency */}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm sm:text-base text-[#444444] line-through">
                              ${product.originalPrice}
                            </span>
                          )}
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

        {/* --- NEW: Loading More Spinner --- */}
        {isLoadingMore && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 text-[#444444] animate-spin" />
            <span className="ml-3 text-lg text-[#444444]">Loading more...</span>
          </div>
        )}

        {/* --- NEW: End of List Message --- */}
        {!hasMore && !isLoading && products.length > 0 && (
          <div className="text-center py-10 text-[#444444]">
            You've reached the end of the collection.
          </div>
        )}

      </div>
    </section>
  )
}