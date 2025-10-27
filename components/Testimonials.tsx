"use client"

import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Star, Quote, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"

export default function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)
  const [isMobile, setIsMobile] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // Define all hooks unconditionally at the top level
  const y = useTransform(scrollYProgress, [0, 1], [150, -150])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])
  const yReverse = useTransform(scrollYProgress, [0, 1], [-150, 150])
  const yUp = useTransform(scrollYProgress, [0, 1], [0, -100])
  const yDown = useTransform(scrollYProgress, [0, 1], [0, 100])

  const testimonials = [
    {
      name: "Sarah Williams",
      role: "Corporate Client",
      content: "The Bottle Stories transformed our corporate gifting experience. The quality and presentation exceeded all expectations.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80"
    },
    {
      name: "Michael Chen",
      role: "Anniversary Gift",
      content: "I ordered the Romance Collection for our 10th anniversary. My wife was moved to tears by the thoughtful curation.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
    },
    {
      name: "Emily Rodriguez",
      role: "Wedding Planner",
      content: "As a wedding planner, I've recommended The Bottle Stories to countless clients. Their attention to detail is unmatched.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80"
    },
    {
      name: "James Patterson",
      role: "Business Executive",
      content: "The Corporate Elite hamper was perfect for our international clients. Sophisticated, elegant, and memorable.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80"
    },
    {
      name: "Aisha Patel",
      role: "Happy Customer",
      content: "Ordered the Celebration Special for my mother's birthday. The fragrances were exquisite and the packaging was museum-quality.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&q=80"
    },
    {
      name: "David Thompson",
      role: "Regular Customer",
      content: "I've purchased from The Bottle Stories multiple times now. Each experience has been flawless—from ordering to delivery.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&q=80"
    }
  ]

  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials]

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
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
    }, 4000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (currentIndex >= testimonials.length * 2) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex(testimonials.length)
        setIsTransitioning(false)
      }, 50)
    } else if (currentIndex <= 0) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex(testimonials.length)
        setIsTransitioning(false)
      }, 50)
    }
  }, [currentIndex, testimonials.length])

  const goToNext = () => {
    setCurrentIndex((prev) => prev + 1)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => prev - 1)
  }

  return (
    <section ref={ref} className="py-32 px-4 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Parallax Background Elements - Disabled on mobile */}
      {!isMobile && (
        <>
          <motion.div
            style={{ y, opacity }}
            className="absolute top-20 left-0 w-[500px] h-[500px] bg-gradient-to-br from-pink-100/30 to-transparent rounded-full blur-3xl pointer-events-none"
          />
          <motion.div
            style={{ y: yReverse }}
            className="absolute bottom-20 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-rose-100/30 to-transparent rounded-full blur-3xl pointer-events-none"
          />

          {/* Floating Quote Icons */}
          <motion.div
            style={{ y: yUp }}
            className="absolute top-32 right-20 text-gray-300 opacity-20"
          >
            <Quote className="w-24 h-24" />
          </motion.div>
          <motion.div
            style={{ y: yDown }}
            className="absolute bottom-32 left-20 text-gray-300 opacity-20"
          >
            <Quote className="w-24 h-24" />
          </motion.div>

          {/* Floating Sparkles */}
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-40 left-1/4 text-pink-200"
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
            className="absolute bottom-40 right-1/4 text-rose-200"
          >
            <Sparkles className="w-6 h-6" />
          </motion.div>
        </>
      )}

      {/* Static background elements for mobile */}
      {isMobile && (
        <>
          <div className="absolute top-20 left-0 w-[300px] h-[300px] bg-gradient-to-br from-pink-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 right-0 w-[300px] h-[300px] bg-gradient-to-tl from-rose-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 mb-6 px-6 py-3 bg-white rounded-full border border-gray-300 shadow-lg"
          >
            <Star className="w-4 h-4 fill-gray-700" />
            TESTIMONIALS
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight"
          >
            What Our Customers
            <span className="block">Say</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Don't just take our word for it—hear from those who've experienced the magic of our perfume gift hampers.
          </motion.p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-white/90 backdrop-blur-sm hover:bg-white p-4 rounded-full shadow-xl border border-gray-300 transition-all duration-300 hover:scale-110"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-white/90 backdrop-blur-sm hover:bg-white p-4 rounded-full shadow-xl border border-gray-300 transition-all duration-300 hover:scale-110"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 text-gray-900" />
          </button>

          {/* Testimonials Carousel */}
          <div className="overflow-hidden px-2">
            <motion.div
              animate={{ x: `-${(currentIndex / duplicatedTestimonials.length) * 100}%` }}
              transition={{ 
                type: "tween",
                ease: "easeOut",
                duration: isTransitioning ? 0 : 0.5
              }}
              className="flex"
              style={{ 
                width: `${duplicatedTestimonials.length * (100 / itemsPerView)}%`,
                willChange: 'transform'
              }}
            >
              {duplicatedTestimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="px-3"
                  style={{ width: `${100 / duplicatedTestimonials.length}%` }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.1 * (index % 6) }}
                    whileHover={!isMobile ? { y: -15, transition: { duration: 0.3 } } : {}}
                    className="group relative h-full"
                  >
                    <div className="h-full bg-white rounded-3xl overflow-hidden border border-gray-300 shadow-xl hover:shadow-2xl transition-all duration-500">
                      {/* Image Section with Overlay */}
                      <div className="relative h-80 overflow-hidden">
                        <img 
                          src={testimonial.image} 
                          alt={testimonial.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />
                        
                        {/* Quote Icon */}
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          whileInView={{ scale: 1, rotate: 0 }}
                          transition={{ duration: 0.5 }}
                          className="absolute top-6 right-6 w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20"
                        >
                          <Quote className="w-8 h-8 text-white" />
                        </motion.div>

                        {/* Stars Rating */}
                        <div className="absolute top-6 left-6 flex gap-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 * i }}
                            >
                              <Star className="w-5 h-5 fill-white text-white drop-shadow-lg" />
                            </motion.div>
                          ))}
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-white text-lg leading-relaxed mb-6 line-clamp-3 drop-shadow-lg"
                          >
                            "{testimonial.content}"
                          </motion.p>
                          
                          {/* Author Info */}
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 overflow-hidden">
                              <img 
                                src={testimonial.image} 
                                alt={testimonial.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-lg drop-shadow-lg">
                                {testimonial.name}
                              </h4>
                              <p className="text-white/80 text-sm drop-shadow-lg">
                                {testimonial.role}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Sparkle Effect - Disabled on mobile */}
                        {!isMobile && (
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: (index % 6) * 0.3
                            }}
                            className="absolute bottom-8 right-8"
                          >
                            <Sparkles className="w-6 h-6 text-white drop-shadow-lg" />
                          </motion.div>
                        )}
                        {isMobile && (
                          <div className="absolute bottom-8 right-8">
                            <Sparkles className="w-6 h-6 text-white drop-shadow-lg opacity-60" />
                          </div>
                        )}
                      </div>

                      {/* Decorative Bottom Accent */}
                      <div className="h-2 bg-gradient-to-r from-pink-100 via-rose-100 to-pink-100" />
                    </div>

                    {/* Glow Effect - Disabled on mobile */}
                    {!isMobile && (
                      <motion.div
                        animate={{
                          scale: [1, 1.02, 1],
                          opacity: [0, 0.15, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: (index % 6) * 0.3
                        }}
                        className="absolute inset-0 bg-gradient-to-br from-pink-200 to-rose-200 rounded-3xl pointer-events-none"
                      />
                    )}
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(testimonials.length + index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  Math.floor((currentIndex % testimonials.length)) === index
                    ? 'w-8 bg-gray-900'
                    : 'w-2 bg-gray-300 hover:bg-gray-600'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}