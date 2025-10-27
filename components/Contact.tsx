"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Send } from "lucide-react"

export default function Contact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      content: "+1 (555) 123-4567",
      link: "tel:+15551234567"
    },
    {
      icon: Mail,
      title: "Email",
      content: "hello@thebottlestories.com",
      link: "mailto:hello@thebottlestories.com"
    },
    {
      icon: MapPin,
      title: "Address",
      content: "123 Luxury Lane, Perfume District, NY 10001",
      link: "#"
    }
  ]

  return (
    <section ref={ref} className="py-24 px-4 bg-[#F8F8F8] relative overflow-hidden">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#DADADA] rounded-full blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#DADADA] rounded-full blur-3xl"
      />

      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block text-sm font-semibold text-[#444444] mb-4 px-4 py-2 bg-[#F2F2F2] rounded-full border border-[#DADADA]"
          >
            CONTACT US
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-bold text-[#222222] mb-6">
            Let's Start a Conversation
          </h2>
          <p className="text-lg md:text-xl text-[#444444] max-w-3xl mx-auto">
            Have questions about our gift hampers? Want to create a custom order? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-8"
          >
            <div className="bg-[#F2F2F2] rounded-3xl p-8 border-2 border-[#DADADA] shadow-lg">
              <h3 className="text-2xl font-bold text-[#222222] mb-6">Get in Touch</h3>
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon
                  return (
                    <motion.a
                      key={index}
                      href={info.link}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                      whileHover={{ x: 8, transition: { duration: 0.2 } }}
                      className="flex items-start gap-4 group cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-[#222222] to-[#444444] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-[#F8F8F8]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#222222] mb-1">{info.title}</p>
                        <p className="text-[#444444]">{info.content}</p>
                      </div>
                    </motion.a>
                  )
                })}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-gradient-to-br from-[#222222] to-[#1C1C1C] rounded-3xl p-8 text-[#F8F8F8] shadow-xl"
            >
              <h3 className="text-2xl font-bold mb-4">Business Hours</h3>
              <div className="space-y-2 text-[#DADADA]">
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 4:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-[#F2F2F2] rounded-3xl p-8 border-2 border-[#DADADA] shadow-lg h-full">
              <h3 className="text-2xl font-bold text-[#222222] mb-6">Send us a Message</h3>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#444444] mb-2 block">
                      First Name
                    </label>
                    <Input
                      placeholder="John"
                      className="bg-[#F8F8F8] border-[#DADADA] rounded-2xl h-12 focus:border-[#222222] focus:ring-[#222222]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#444444] mb-2 block">
                      Last Name
                    </label>
                    <Input
                      placeholder="Doe"
                      className="bg-[#F8F8F8] border-[#DADADA] rounded-2xl h-12 focus:border-[#222222] focus:ring-[#222222]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#444444] mb-2 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    className="bg-[#F8F8F8] border-[#DADADA] rounded-2xl h-12 focus:border-[#222222] focus:ring-[#222222]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#444444] mb-2 block">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="bg-[#F8F8F8] border-[#DADADA] rounded-2xl h-12 focus:border-[#222222] focus:ring-[#222222]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#444444] mb-2 block">
                    Message
                  </label>
                  <Textarea
                    placeholder="Tell us about your requirements..."
                    rows={6}
                    className="bg-[#F8F8F8] border-[#DADADA] rounded-2xl focus:border-[#222222] focus:ring-[#222222] resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-[#1C1C1C] text-[#F8F8F8] hover:bg-[#222222] rounded-2xl h-14 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Send className="mr-2 w-5 h-5" />
                  Send Message
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
