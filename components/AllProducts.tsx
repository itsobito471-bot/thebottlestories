"use client"

import { motion } from "framer-motion"
import { useState, useEffect, useRef, useCallback } from "react"
import { Search, X, SlidersHorizontal, Sparkles, ArrowLeft, Loader2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation" 
import Swal from "sweetalert2" 

// --- Imports from your project ---
import { filterProducts, getAllTags } from "@/lib/appService"
import { Product, Tag } from "@/lib/types"
import { useCart } from "../app/context/CartContext" 

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
  const { addToCart } = useCart(); 
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  
  // --- Updated: State for Dynamic Tags ---
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTagId, setSelectedTagId] = useState<string>("all")
  
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // --- 1. Fetch Tags on Mount ---
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const fetchedTags = await getAllTags();
        setTags(fetchedTags);
      } catch (err) {
        console.error("Failed to load tags:", err);
      }
    };
    fetchTags();
  }, []);

  // --- Debounce Search ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // --- Reset when Filters Change ---
  useEffect(() => {
    setProducts([])
    setPage(1)
    setHasMore(true)
    setError(null)
  }, [debouncedSearchQuery, selectedTagId])

  // --- Fetch Products ---
  useEffect(() => {
    // Guard: Prevent fetching if we've reached the end or haven't reset for new filters yet
    // Note: We check if page > 1 to allow the initial load even if hasMore is potentially stale
    if (!hasMore && page > 1) return;

    const fetchApiData = async () => {
      if (page === 1) setIsLoading(true)
      else setIsLoadingMore(true)
      setError(null)

      try {
        // Only send tag ID if it's not "all"
        const apiTag = selectedTagId === "all" ? undefined : selectedTagId
        
        const data = await filterProducts({
          search: debouncedSearchQuery,
          tag: apiTag,
          page: page,
          limit: 10
        })

        if (page === 1) {
          setProducts(data.products)
        } else {
          // Prevent duplicates
          setProducts((prev) => {
            const newIds = new Set(data.products.map(p => p._id));
            return [...prev, ...data.products.filter(p => !newIds.has(p._id))];
          })
        }
        
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
  }, [debouncedSearchQuery, selectedTagId, page, hasMore])

  // --- Infinite Scroll Observer ---
  const observer = useRef<IntersectionObserver>()
  const lastProductElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading || isLoadingMore) return
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1)
      }
    })

    if (node) observer.current.observe(node)
  }, [isLoading, isLoadingMore, hasMore])
  
  // --- Add to Cart Handler ---
  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    
    addToCart(product); 

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })

    Toast.fire({
      icon: 'success',
      title: 'Added to Cart'
    })
  };

  const handleQuickView = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/product/${productId}`);
  };

  return (
    <section className="pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F8F8F8] via-white to-[#F8F8F8] relative overflow-hidden min-h-screen">
      <motion.div className="absolute top-20 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-pink-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/70 backdrop-blur-xl rounded-full border border-[#DADADA] shadow-lg hover:shadow-xl hover:bg-white/90 transition-all duration-300 group"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#222222] group-hover:-translate-x-1 transition-transform duration-300" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4"
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

        {/* Filter & Search */}
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
                  className="w-full pl-12 sm:pl-16 pr-16 sm:pr-20 py-3 sm:py-4 lg:py-5 rounded-xl sm:rounded-2xl border-2 border-white/60 bg-white/80 backdrop-blur-sm text-[#222222] placeholder:text-[#444444] focus:outline-none focus:border-[#222222] transition-all duration-300 text-sm sm:text-base"
                />
                {searchQuery && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-[#F2F2F2] hover:bg-[#DADADA] rounded-full flex items-center justify-center transition-all duration-300"
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
                {/* --- Static "All" Option --- */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTagId("all")}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 text-sm sm:text-base ${
                    selectedTagId === "all"
                      ? "bg-[#1C1C1C] text-white shadow-lg"
                      : "bg-white/80 text-[#444444] hover:bg-white border border-white/60"
                  }`}
                >
                  All
                </motion.button>

                {/* --- Dynamic Tags --- */}
                {tags.map((tag) => (
                  <motion.button
                    key={tag._id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTagId(tag._id)}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 text-sm sm:text-base ${
                      selectedTagId === tag._id
                        ? "bg-[#1C1C1C] text-white shadow-lg"
                        : "bg-white/80 text-[#444444] hover:bg-white border border-white/60"
                    }`}
                  >
                    {tag.name}
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

        {/* Product Grid */}
        {isLoading && page === 1 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : error ? (
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
                  setSelectedTagId("all")
                }}
                className="bg-[#1C1C1C] text-white hover:bg-[#222222] rounded-full px-6 sm:px-8 py-3 sm:py-4"
              >
                Clear All Filters
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {products.map((product, index) => (
              <motion.div
                ref={products.length === index + 1 ? lastProductElementRef : null}
                key={product._id} 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (index % 10) * 0.05 }}
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
                        src={product.images[0] || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {product.tags && product.tags.length > 0 && (
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.2 + (index % 10) * 0.05 }}
                          className="absolute top-4 right-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#222222] text-white text-xs sm:text-sm font-bold rounded-full shadow-lg"
                        >
                          {/* Access tag name safely since we populated it */}
                          {typeof product.tags[0] === 'object' ? product.tags[0].name : 'Tag'}
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
                      >
                        <Button
                          size="sm"
                          className="bg-white text-[#222222] hover:bg-[#F8F8F8] rounded-full px-6 shadow-lg font-semibold"
                          onClick={(e) => handleQuickView(e, product._id)}
                        >
                          Quick View
                        </Button>
                      </motion.div>

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
                            ₹{product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm sm:text-base text-[#444444] line-through">
                              ₹{product.originalPrice}
                            </span>
                          )}
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleAddToCart(e, product)} 
                          className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1C1C1C] rounded-full flex items-center justify-center group-hover:bg-[#222222] transition-colors duration-300 shadow-lg z-20 relative"
                        >
                          <ShoppingBag className="text-white w-5 h-5" />
                        </motion.button>
                        
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {isLoadingMore && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-8 h-8 text-[#444444] animate-spin" />
            <span className="ml-3 text-lg text-[#444444]">Loading more...</span>
          </div>
        )}

        {!hasMore && !isLoading && products.length > 0 && (
          <div className="text-center py-10 text-[#444444]">
            You've reached the end of the collection.
          </div>
        )}

      </div>
    </section>
  )
}