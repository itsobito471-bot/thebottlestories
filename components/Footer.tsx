"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Heart, Facebook, Instagram, Twitter, Linkedin, Mail } from "lucide-react"
import { getGeneralStoreSettings } from "@/lib/appService" // Use the PUBLIC api call
import { StoreSettings } from "@/lib/types"

export default function Footer() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    getGeneralStoreSettings()
      .then(data => setSettings(data))
      .catch(err => console.error("Failed to load footer settings", err));
  }, []);

  const footerLinks = {
    company: [
      { name: "About Us", href: "#about" },
      { name: "Our Story", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Press", href: "#" }
    ],
    products: [
      { name: "All Products", href: "/products" },
      { name: "Gift Hampers", href: "/products?category=hampers" },
      { name: "Corporate Gifts", href: "#" },
      { name: "Custom Orders", href: "#" }
    ],
    support: [
      { name: "Contact Us", href: "#contact" },
      { name: "FAQs", href: "#" },
      { name: "Shipping Info", href: "#" },
      // { name: "Returns", href: "#" }
    ],
    legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      // { name: "Cookie Policy", href: "#" },
      // { name: "Disclaimer", href: "#" }
    ]
  }

  // --- Helper to build social links dynamically ---
  const getSocialLinks = () => {
    const links = [];
    if (settings?.socialLinks?.facebook) links.push({ icon: Facebook, href: settings.socialLinks.facebook, label: "Facebook" });
    if (settings?.socialLinks?.instagram) links.push({ icon: Instagram, href: settings.socialLinks.instagram, label: "Instagram" });
    if (settings?.socialLinks?.twitter) links.push({ icon: Twitter, href: settings.socialLinks.twitter, label: "Twitter" });
    if (settings?.socialLinks?.linkedin) links.push({ icon: Linkedin, href: settings.socialLinks.linkedin, label: "LinkedIn" });
    return links;
  };

  const socialLinks = getSocialLinks();

  return (
    <footer className="bg-gradient-to-br from-[#222222] to-[#1C1C1C] text-[#F8F8F8] relative overflow-hidden">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-96 h-96 bg-[#444444] rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          
          {/* Brand & Contact */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold mb-4">The Bottle Stories</h3>
              <p className="text-[#DADADA] mb-6 leading-relaxed">
                Crafting unforgettable moments with luxury perfume gift hampers. Every bottle tells a story, every fragrance creates a memory.
              </p>
              
              {/* Dynamic Email */}
              {settings?.contact_email && (
                <div className="flex items-center gap-2 mb-6">
                  <Mail className="w-5 h-5 text-[#DADADA]" />
                  <a href={`mailto:${settings.contact_email}`} className="text-[#DADADA] hover:text-[#F8F8F8] transition-colors">
                    {settings.contact_email}
                  </a>
                </div>
              )}

              {/* Dynamic Social Icons */}
              <div className="flex gap-4">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon
                  return (
                    <motion.a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 bg-[#444444] rounded-xl flex items-center justify-center hover:bg-[#F8F8F8] hover:text-[#222222] transition-all duration-300"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.a>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Links Columns */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }}>
            <h4 className="text-lg font-bold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}><a href={link.href} className="text-[#DADADA] hover:text-[#F8F8F8] transition-colors inline-block hover:translate-x-2 duration-300">{link.name}</a></li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}>
            <h4 className="text-lg font-bold mb-4">Products</h4>
            <ul className="space-y-3">
              {footerLinks.products.map((link, index) => (
                <li key={index}><a href={link.href} className="text-[#DADADA] hover:text-[#F8F8F8] transition-colors inline-block hover:translate-x-2 duration-300">{link.name}</a></li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} viewport={{ once: true }}>
            <h4 className="text-lg font-bold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}><a href={link.href} className="text-[#DADADA] hover:text-[#F8F8F8] transition-colors inline-block hover:translate-x-2 duration-300">{link.name}</a></li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} viewport={{ once: true }}>
            <h4 className="text-lg font-bold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}><a href={link.href} className="text-[#DADADA] hover:text-[#F8F8F8] transition-colors inline-block hover:translate-x-2 duration-300">{link.name}</a></li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="border-t border-[#444444] pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#DADADA] text-sm text-center md:text-left">
              © 2025 The Bottle Stories. All rights reserved.
            </p>
            <p className="text-[#DADADA] text-sm flex items-center gap-2">
              Made with <Heart className="w-4 h-4 text-red-400 fill-red-400" /> for perfume lovers
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}