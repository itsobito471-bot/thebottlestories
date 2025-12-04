"use client"

import { motion } from "framer-motion"
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { Button } from "@/components/ui/button"
import { Sparkles, Gift } from "lucide-react"
import Logo from '@/public/logo.png'

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
    <section id="home" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8">
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
            {/* Crafting unforgettable moments with luxury perfume gift hampers. Every bottle tells a story, every fragrance creates a memory. */}
            The Story is Inside.
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
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 1.2, 
            delay: 0.3,
            ease: [0.25, 0.1, 0.25, 1]
          }}
          className="relative order-1 lg:order-2"
        >
          <div className="relative w-full aspect-square max-w-[280px] sm:max-w-[380px] md:max-w-[420px] lg:max-w-lg mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F2F2F2] to-[#DADADA] rounded-[2rem] sm:rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl" />
            <div className="absolute inset-3 sm:inset-4 bg-gradient-to-br from-[#F8F8F8] via-[#FFFFFF] to-[#F2F2F2] rounded-[1.7rem] sm:rounded-[2.2rem] lg:rounded-[2.5rem] flex items-center justify-center overflow-hidden border border-[#DADADA]/30">
              {/* Logo */}
              <motion.img 
                src={Logo.src}
                alt="The Bottle Stories Logo" 
                className="w-[70%] h-[70%] object-contain"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.6,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
              />
              
              {/* Decorative sparkles */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.6, 0.3, 0.6, 0.3],
                  scale: [0, 1.2, 1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  delay: 1,
                  times: [0, 0.2, 0.5, 0.7, 1],
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-[15%] right-[15%]"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#DADADA]" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.6, 0.3, 0.6, 0.3],
                  scale: [0, 1.2, 1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  delay: 1.3,
                  times: [0, 0.2, 0.5, 0.7, 1],
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute bottom-[20%] left-[15%]"
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-[#DADADA]" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 0.6, 0.3, 0.6, 0.3],
                  scale: [0, 1.2, 1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  delay: 1.6,
                  times: [0, 0.2, 0.5, 0.7, 1],
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-[35%] left-[20%]"
              >
                <Sparkles className="w-3 h-3 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-[#DADADA]" />
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0, 0.5, 0.3, 0.5, 0.3],
                scale: [0.8, 1.2, 1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                delay: 0.8,
                times: [0, 0.2, 0.5, 0.7, 1],
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