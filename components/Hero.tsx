"use client"

import { motion } from "framer-motion"
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { Button } from "@/components/ui/button"
import { Sparkles, Gift } from "lucide-react"

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const bottleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bottleRef.current) {
      gsap.to(bottleRef.current, {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      })
    }
  }, [])

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F8F8F8] via-[#F2F2F2] to-[#F8F8F8]" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(28,28,28,0.03),transparent_50%)]"
      />

      <div className="container mx-auto max-w-7xl grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 xl:gap-20 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6 sm:space-y-8 order-2 lg:order-1"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#F2F2F2] rounded-full border border-[#DADADA] shadow-sm"
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#444444]" />
            <span className="text-xs sm:text-sm text-[#444444] font-medium">Premium Gift Hampers</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl font-bold text-[#222222] leading-[1.1]"
          >
            The Bottle
            <span className="block text-[#444444]">Stories</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-[#444444] max-w-xl leading-relaxed"
          >
            Crafting unforgettable moments with luxury perfume gift hampers. Every bottle tells a story, every fragrance creates a memory.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2"
          >
            <Button
              size="lg"
              className="bg-[#1C1C1C] text-[#F8F8F8] hover:bg-[#222222] rounded-2xl px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
            >
              <Gift className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
              Explore Hampers
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-[#DADADA] text-[#222222] hover:bg-[#F2F2F2] rounded-2xl px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base lg:text-lg shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto"
            >
              Our Story
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-4 sm:pt-6"
          >
            <div>
              <p className="text-2xl sm:text-3xl lg:text-3xl font-bold text-[#222222]">5000+</p>
              <p className="text-xs sm:text-sm text-[#444444] mt-0.5 sm:mt-1">Happy Customers</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl lg:text-3xl font-bold text-[#222222]">50+</p>
              <p className="text-xs sm:text-sm text-[#444444] mt-0.5 sm:mt-1">Unique Hampers</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl lg:text-3xl font-bold text-[#222222]">4.9/5</p>
              <p className="text-xs sm:text-sm text-[#444444] mt-0.5 sm:mt-1">Rating</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          ref={bottleRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative order-1 lg:order-2"
        >
          <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[380px] md:max-w-[420px] lg:max-w-lg mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F2F2F2] to-[#DADADA] rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl" />
            <div className="absolute inset-3 sm:inset-4 bg-gradient-to-br from-[#F8F8F8] via-[#FFFFFF] to-[#F2F2F2] rounded-[1.7rem] sm:rounded-[2.2rem] lg:rounded-[2.5rem] flex items-center justify-center overflow-hidden border border-[#DADADA]/30">
              {/* Perfume bottle illustration */}
              <div className="relative w-28 h-40 sm:w-36 sm:h-52 md:w-44 md:h-60 lg:w-48 lg:h-64">
                {/* Bottle body */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[62%] bg-gradient-to-b from-[#DADADA]/30 to-[#DADADA]/10 rounded-t-2xl sm:rounded-t-3xl border-2 border-[#DADADA]/40 backdrop-blur-sm">
                  {/* Liquid */}
                  <motion.div
                    animate={{
                      height: ["60%", "65%", "60%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#DADADA]/40 to-[#DADADA]/20 rounded-t-2xl sm:rounded-t-3xl"
                  />
                  {/* Highlight */}
                  <div className="absolute left-[15%] top-[15%] w-[3%] h-[30%] bg-white/50 rounded-full" />
                </div>
                {/* Bottle cap */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[25%] bg-gradient-to-b from-[#444444] to-[#222222] rounded-t-xl">
                  <div className="absolute top-[6%] left-1/2 -translate-x-1/2 w-[70%] h-[65%] bg-[#333333] rounded-t-lg" />
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50%] h-[20%] bg-[#222222] rounded-t" />
                </div>
                {/* Spray nozzle */}
                <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[28%] h-[6%] bg-[#333333] rounded-full" />
                
                {/* Gift Ribbon - Vertical band */}
                <div className="absolute top-[6%] left-1/2 -translate-x-1/2 w-[20%] h-[75%] bg-gradient-to-r from-[#C4A076] via-[#D4AF7A] to-[#C4A076] z-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
                
                {/* Ribbon Bow */}
                <motion.div
                  animate={{
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-[3%] left-1/2 -translate-x-1/2 z-20 w-full h-full"
                >
                  {/* Left bow loop */}
                  <div className="absolute left-[20%] top-0 w-[28%] h-[15%] bg-gradient-to-br from-[#D4AF7A] to-[#C4A076] rounded-full transform -rotate-45 shadow-lg">
                    <div className="absolute inset-[10%] bg-gradient-to-br from-[#E5C89F] to-transparent rounded-full" />
                  </div>
                  {/* Right bow loop */}
                  <div className="absolute right-[20%] top-0 w-[28%] h-[15%] bg-gradient-to-bl from-[#D4AF7A] to-[#C4A076] rounded-full transform rotate-45 shadow-lg">
                    <div className="absolute inset-[10%] bg-gradient-to-bl from-[#E5C89F] to-transparent rounded-full" />
                  </div>
                  {/* Center knot */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-[3%] w-[18%] h-[8%] bg-gradient-to-br from-[#D4AF7A] to-[#B8956A] rounded-full shadow-md">
                    <div className="absolute inset-[10%] bg-gradient-to-br from-[#E5C89F] to-transparent rounded-full" />
                  </div>
                  {/* Ribbon tails */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-[9%] w-[7%] h-[12%] bg-gradient-to-b from-[#C4A076] to-[#B8956A] transform -rotate-12 shadow-md rounded-b" />
                  <div className="absolute left-1/2 -translate-x-1/2 top-[9%] w-[7%] h-[12%] bg-gradient-to-b from-[#C4A076] to-[#B8956A] transform rotate-12 shadow-md rounded-b" />
                </motion.div>
              </div>
              
              {/* Decorative sparkles */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0
                }}
                className="absolute top-[15%] right-[15%]"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#DADADA]" />
              </motion.div>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute bottom-[20%] left-[15%]"
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-[#DADADA]" />
              </motion.div>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute top-[35%] left-[20%]"
              >
                <Sparkles className="w-3 h-3 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-[#DADADA]" />
              </motion.div>
            </div>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-[#DADADA] to-transparent rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[3rem] blur-2xl"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}