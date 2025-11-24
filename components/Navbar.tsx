"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, ShoppingBag } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import Logo from '@/public/logo.png'
import { useCart } from "../app/context/CartContext" // <-- 1. Import Cart Hook

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()
  const router = useRouter()
  const pathname = usePathname()
  
  // --- 2. Get cartCount from Context ---
  const { cartCount } = useCart(); 

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
    { name: "Home", href: "#", section: null },
    { name: "About", href: "#about", section: "about" },
    { name: "Products", href: "#products", section: "products" },
    { name: "Testimonials", href: "#testimonials", section: "testimonials" },
    { name: "Contact", href: "#contact", section: "contact" }
  ]

  const handleNavClick = (e: any, link: any) => {
    e.preventDefault()
    setIsOpen(false)

    const isOnLandingPage = pathname === "/"

    if (link.section === null) {
      router.push("/")
    } else if (isOnLandingPage) {
      const element = document.getElementById(link.section)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    } else {
      router.push(`/${link.href}`)
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`mx-auto max-w-7xl rounded-2xl sm:rounded-3xl transition-all duration-500 ${
          isScrolled
            ? "bg-white/70 backdrop-blur-xl shadow-2xl border border-white/20"
            : "bg-white/40 backdrop-blur-md shadow-lg border border-white/30"
        }`}
        style={{
          boxShadow: isScrolled
            ? "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)"
            : "0 4px 24px 0 rgba(31, 38, 135, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)"
        }}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <motion.a
              href="/"
              onClick={(e) => {
                e.preventDefault()
                router.push("/")
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer"
            >
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-md">
                <Image
                  src={Logo}
                  alt="The Bottle Stories"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.a>

            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link)}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="text-[#444444] hover:text-[#222222] font-medium transition-all duration-300 relative group px-2 py-1 cursor-pointer"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#222222] to-[#444444] group-hover:w-full transition-all duration-300 rounded-full" />
                </motion.a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3 lg:gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/cart")}
                  className="rounded-full border-2 border-white/40 hover:bg-white/60 text-[#222222] backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105"
                >
                  <ShoppingBag className="w-4 h-4 lg:mr-2" />
                  {/* --- 3. Use dynamic cartCount --- */}
                  <span className="hidden lg:inline">
                    Cart ({cartCount})
                  </span>
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Button
                  size="sm"
                  className="bg-[#1C1C1C] text-[#F8F8F8] hover:bg-[#222222] rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105"
                  onClick={() => router.push("/products")}
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
              className="md:hidden lg:hidden w-10 h-10 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-white/40 hover:bg-white/80 transition-all duration-300 hover:scale-105"
            >
              {isOpen ? (
                <X className="w-5 h-5 text-[#222222]" />
              ) : (
                <Menu className="w-5 h-5 text-[#222222]" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isOpen ? "auto" : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden lg:hidden overflow-hidden mx-auto max-w-7xl mt-2 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl"
        style={{
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)"
        }}
      >
        <div className="px-4 py-6 space-y-2">
          {navLinks.map((link, index) => (
            <motion.a
              key={index}
              href={link.href}
              onClick={(e) => handleNavClick(e, link)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="block text-[#444444] hover:text-[#222222] font-medium py-3 px-4 hover:bg-white/60 rounded-xl transition-all duration-300 cursor-pointer"
            >
              {link.name}
            </motion.a>
          ))}
          <div className="flex flex-col gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => router.push("/cart")}
              className="w-full rounded-full border-2 border-white/40 hover:bg-white/60 text-[#222222] backdrop-blur-sm transition-all duration-300"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              {/* --- 4. Use dynamic cartCount on Mobile too --- */}
              Cart ({cartCount})
            </Button>
            <Button
              size="sm"
              className="bg-[#1C1C1C] text-[#F8F8F8] hover:bg-[#222222] rounded-full transition-all duration-300 hover:shadow-lg hover:scale-105"
              onClick={() => router.push("/products")}
            >
              Shop Now
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}