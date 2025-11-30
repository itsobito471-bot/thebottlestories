"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react"
// Import API services
import { getStoreSettings, submitEnquiry} from "@/lib/appService"
import { StoreSettings } from "@/lib/types"

export default function Contact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  // --- State ---
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // --- Fetch Store Settings (Address, Phone, Email) ---
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getStoreSettings();
        // @ts-ignore - Handle potential response wrapper
        setSettings(data.result || data); 
      } catch (error) {
        console.error("Failed to load contact info");
      } finally {
        setLoadingSettings(false);
      }
    };
    loadSettings();
  }, []);

  // --- Handle Form Input ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Handle Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitEnquiry(formData);
      setSuccess(true);
      setFormData({ firstName: "", lastName: "", email: "", phone: "", message: "" });
      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      alert("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Prepare Dynamic Contact Info
  // If settings are loading or missing, fall back to placeholders or empty strings
  const displayContactInfo = [
    {
      icon: Phone,
      title: "Phone",
      content: settings?.contact_phone || "Loading...",
      link: `tel:${settings?.contact_phone}`
    },
    {
      icon: Mail,
      title: "Email",
      content: settings?.contact_email || "Loading...",
      link: `mailto:${settings?.contact_email}`
    },
    {
      icon: MapPin,
      title: "Address",
      content: settings?.address 
        ? `${settings.address.street}, ${settings.address.city}, ${settings.address.state} ${settings.address.zip}` 
        : "Loading location...",
      link: "#"
    }
  ];

  return (
    <section id="contact" ref={ref} className="py-24 px-4 bg-[#F8F8F8] relative overflow-hidden">
      {/* Background Blobs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#DADADA] rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#DADADA] rounded-full blur-3xl"
      />

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-sm font-semibold text-[#444444] mb-4 px-4 py-2 bg-[#F2F2F2] rounded-full border border-[#DADADA]">
            CONTACT US
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-[#222222] mb-6">
            Let's Start a Conversation
          </h2>
          <p className="text-lg md:text-xl text-[#444444] max-w-3xl mx-auto">
            Have questions about our gift hampers? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Left Side: Contact Info (Dynamic) */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-8"
          >
            <div className="bg-[#F2F2F2] rounded-3xl p-8 border-2 border-[#DADADA] shadow-lg">
              <h3 className="text-2xl font-bold text-[#222222] mb-6">Get in Touch</h3>
              <div className="space-y-6">
                {displayContactInfo.map((info, index) => {
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
                        {loadingSettings ? (
                           <div className="h-4 w-32 bg-slate-200 animate-pulse rounded"></div>
                        ) : (
                           <p className="text-[#444444]">{info.content}</p>
                        )}
                      </div>
                    </motion.a>
                  )
                })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#222222] to-[#1C1C1C] rounded-3xl p-8 text-[#F8F8F8] shadow-xl">
              <h3 className="text-2xl font-bold mb-4">Business Hours</h3>
              <div className="space-y-2 text-[#DADADA]">
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 4:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Contact Form (Functional) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-[#F2F2F2] rounded-3xl p-8 border-2 border-[#DADADA] shadow-lg h-full">
              <h3 className="text-2xl font-bold text-[#222222] mb-6">Send us a Message</h3>
              
              {success ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-[#222222]">Message Sent!</h4>
                  <p className="text-[#444444]">Thank you for reaching out. We will get back to you shortly.</p>
                  <Button variant="outline" onClick={() => setSuccess(false)}>Send another</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-[#444444] mb-2 block">First Name</label>
                      <Input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="John"
                        required
                        className="bg-[#F8F8F8] border-[#DADADA] rounded-2xl h-12 focus:border-[#222222] focus:ring-[#222222]"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#444444] mb-2 block">Last Name</label>
                      <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Doe"
                        required
                        className="bg-[#F8F8F8] border-[#DADADA] rounded-2xl h-12 focus:border-[#222222] focus:ring-[#222222]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#444444] mb-2 block">Email</label>
                    <Input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      type="email"
                      placeholder="john@example.com"
                      required
                      className="bg-[#F8F8F8] border-[#DADADA] rounded-2xl h-12 focus:border-[#222222] focus:ring-[#222222]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#444444] mb-2 block">Phone Number</label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="bg-[#F8F8F8] border-[#DADADA] rounded-2xl h-12 focus:border-[#222222] focus:ring-[#222222]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#444444] mb-2 block">Message</label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your requirements..."
                      rows={6}
                      required
                      className="bg-[#F8F8F8] border-[#DADADA] rounded-2xl focus:border-[#222222] focus:ring-[#222222] resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    className="w-full bg-[#1C1C1C] text-[#F8F8F8] hover:bg-[#222222] rounded-2xl h-14 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                      <>
                        <Send className="mr-2 w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}