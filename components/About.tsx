"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Heart, Award, Sparkles, Gift, Star, Users } from "lucide-react"

export default function About() {
  const ref = useRef(null)
  const statsRef = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const statsInView = useInView(statsRef, { once: true, margin: "-50px" })
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

  const features = [
    {
      icon: Heart,
      title: "Crafted with Love",
      description: "Each hamper is thoughtfully curated with premium perfumes and elegant packaging to create an unforgettable gifting experience.",
      color: "from-pink-50 to-rose-50"
    },
    {
      icon: Award,
      title: "Premium Quality",
      description: "We partner with world-renowned perfume brands to bring you authentic, luxury fragrances that last.",
      color: "from-pink-50 to-rose-50"
    },
    {
      icon: Sparkles,
      title: "Personalized Touch",
      description: "Customize your hampers with personal messages, special packaging, and unique combinations tailored to your loved ones.",
      color: "from-pink-50 to-rose-50"
    }
  ]

  const stats = [
    { icon: Users, value: "5000+", label: "Happy Customers" },
    { icon: Gift, value: "50+", label: "Unique Hampers" },
    { icon: Star, value: "4.9/5", label: "Customer Rating" }
  ]

  return (
    <section ref={ref} className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-[#F8F8F8] to-white relative overflow-hidden">
      {/* Animated Background Elements - Hidden on mobile for performance */}
      <motion.div
        style={{ y, opacity }}
        className="hidden md:block absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#DADADA]/20 to-transparent rounded-full blur-3xl pointer-events-none will-change-transform"
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [-100, 100]) }}
        className="hidden md:block absolute bottom-20 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#DADADA]/20 to-transparent rounded-full blur-3xl pointer-events-none will-change-transform"
      />

      {/* Floating Sparkles - Simplified on mobile */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="hidden lg:block absolute top-32 left-20 text-[#DADADA]"
      >
        <Sparkles className="w-8 h-8" />
      </motion.div>
      <motion.div
        animate={{
          y: [0, -15, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="hidden lg:block absolute top-64 right-32 text-[#DADADA]"
      >
        <Sparkles className="w-6 h-6" />
      </motion.div>
      <motion.div
        animate={{
          y: [0, -25, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="hidden lg:block absolute bottom-40 left-1/3 text-[#DADADA]"
      >
        <Sparkles className="w-7 h-7" />
      </motion.div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#444444] mb-4 sm:mb-6 px-4 sm:px-6 py-2 sm:py-3 bg-white rounded-full border border-[#DADADA] shadow-lg"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            ABOUT US
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-[#222222] mb-4 sm:mb-6 lg:mb-8 leading-tight px-4"
          >
            Every Bottle Has
            <span className="block bg-gradient-to-r from-[#222222] via-[#444444] to-[#222222] bg-clip-text text-transparent">
              a Story
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-[#444444] max-w-3xl mx-auto leading-relaxed px-4"
          >
            At The Bottle Stories, we believe that fragrance is more than just a scent—it's a memory, an emotion, a story waiting to be told. We specialize in creating luxurious perfume gift hampers that transform special moments into lasting memories.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 lg:mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -8 }}
                className="relative group"
              >
                <div className="h-full bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#DADADA] shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                  {/* Gradient Background on Hover - Desktop only */}
                  <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-pink-50 to-rose-50 opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
                  
                  {/* Icon Container */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#222222] to-[#444444] rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg"
                  >
                    <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                    
                    {/* Glow Effect - Desktop only */}
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0, 0.3]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.5
                      }}
                      className="hidden md:block absolute inset-0 bg-gradient-to-br from-pink-200 to-rose-200 rounded-2xl blur-xl"
                    />
                  </motion.div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-[#222222] mb-3 sm:mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#444444] leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Floating Particles - Desktop only */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0, 0.5, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.5
                  }}
                  className="hidden md:block absolute -top-2 -right-2 w-4 h-4 bg-[#DADADA] rounded-full blur-sm"
                />
              </motion.div>
            )
          })}
        </div>

        {/* Stats Section */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 30 }}
          animate={statsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="bg-gradient-to-br from-[#1C1C1C] via-[#222222] to-[#1C1C1C] rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl overflow-hidden">
            {/* Animated Background Pattern - Desktop only */}
            <motion.div
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear"
              }}
              className="hidden md:block absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle, #FFFFFF 1px, transparent 1px)",
                backgroundSize: "50px 50px"
              }}
            />

            <div className="relative z-10 grid sm:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={statsInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className="text-center group"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                      className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl mb-3 sm:mb-4 group-hover:bg-white/20 transition-colors duration-300"
                    >
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </motion.div>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={statsInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-1 sm:mb-2"
                    >
                      {stat.value}
                    </motion.p>
                    <p className="text-white/70 text-sm sm:text-base lg:text-lg">{stat.label}</p>
                  </motion.div>
                )
              })}
            </div>

            {/* Decorative Elements - Desktop only */}
            <div className="hidden md:block absolute -bottom-12 -left-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
            <div className="hidden md:block absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}