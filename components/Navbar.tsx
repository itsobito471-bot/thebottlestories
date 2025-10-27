"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, ShoppingBag } from "lucide-react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(248, 248, 248, 0)", "rgba(248, 248, 248, 0.95)"]
  )

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "About", href: "#about" },
    { name: "Products", href: "#products" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Contact", href: "#contact" }
  ]

  return (
    <motion.nav
      style={{ backgroundColor }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "shadow-lg backdrop-blur-md border-b-2 border-[#DADADA]" : ""
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <motion.a
            href="#"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#222222] to-[#444444] rounded-xl flex items-center justify-center">
              <span className="text-[#F8F8F8] font-bold text-lg">TBS</span>
            </div>
            <span className="text-xl font-bold text-[#222222]">The Bottle Stories</span>
          </motion.a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="text-[#444444] hover:text-[#222222] font-medium transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#222222] group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-2 border-[#DADADA] hover:bg-[#F2F2F2] text-[#222222]"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Cart (0)
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button
                size="sm"
                className="bg-[#1C1C1C] text-[#F8F8F8] hover:bg-[#222222] rounded-full"
              >
                Shop Now
              </Button>
            </motion.div>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-10 h-10 bg-[#F2F2F2] rounded-xl flex items-center justify-center border-2 border-[#DADADA]"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-[#222222]" />
            ) : (
              <Menu className="w-6 h-6 text-[#222222]" />
            )}
          </motion.button>
        </div>
      </div>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden bg-[#F8F8F8] border-t-2 border-[#DADADA]"
      >
        <div className="container mx-auto px-4 py-6 space-y-4">
          {navLinks.map((link, index) => (
            <motion.a
              key={index}
              href={link.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              onClick={() => setIsOpen(false)}
              className="block text-[#444444] hover:text-[#222222] font-medium py-2 px-4 hover:bg-[#F2F2F2] rounded-xl transition-all"
            >
              {link.name}
            </motion.a>
          ))}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              variant="outline"
              className="w-full rounded-full border-2 border-[#DADADA] hover:bg-[#F2F2F2] text-[#222222]"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Cart (0)
            </Button>
            <Button
              className="w-full bg-[#1C1C1C] text-[#F8F8F8] hover:bg-[#222222] rounded-full"
            >
              Shop Now
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  )
}
