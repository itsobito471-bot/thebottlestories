"use client"

import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Star, Quote, ChevronLeft, ChevronRight, Sparkles, X, Upload, Send } from "lucide-react"
import { getApprovedTestimonials, submitTestimonial } from "@/lib/appService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Testimonial } from "@/lib/types"

// --- Fallback Data ---
const fallbackTestimonials: Testimonial[] = [
  {
    _id: "1",
    name: "Sarah Williams",
    role: "Corporate Client",
    content: "The Bottle Stories transformed our corporate gifting experience. The quality and presentation exceeded all expectations.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80",
    isApproved: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: "2",
    name: "Michael Chen",
    role: "Verified Buyer",
    content: "I ordered the Romance Collection for our 10th anniversary. My wife was moved to tears by the thoughtful curation.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    isApproved: true,
    createdAt: new Date().toISOString()
  }
];

export default function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  // -- Data State --
  const [dbTestimonials, setDbTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  // -- Carousel State --
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)
  const [isMobile, setIsMobile] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // -- Modal / Form State --
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    role: "Customer",
    content: "",
    rating: 5,
    image: null as File | null
  })

  // -- Animation Hooks --
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [150, -150])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])
  const yReverse = useTransform(scrollYProgress, [0, 1], [-150, 150])
  const yUp = useTransform(scrollYProgress, [0, 1], [0, -100])
  const yDown = useTransform(scrollYProgress, [0, 1], [0, 100])

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch only 10 to keep it light
        const data = await getApprovedTestimonials(10);
        if (data && data.length > 0) {
          setDbTestimonials(data);
        } else {
          setDbTestimonials(fallbackTestimonials);
        }
      } catch (error) {
        console.error("Failed to fetch testimonials", error);
        setDbTestimonials(fallbackTestimonials);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- DISPLAY LOGIC ---
  const shouldCarousel = dbTestimonials.length > itemsPerView;

  const displayItems = shouldCarousel
    ? [...dbTestimonials, ...dbTestimonials, ...dbTestimonials]
    : dbTestimonials;

  // --- RESIZE HANDLER ---
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setItemsPerView(1)
      else if (window.innerWidth < 1024) setItemsPerView(2)
      else setItemsPerView(3)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // --- AUTO SCROLL ---
  useEffect(() => {
    if (!shouldCarousel) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => prev + 1)
    }, 4000)
    return () => clearInterval(timer)
  }, [shouldCarousel, displayItems.length])

  // --- INFINITE LOOP RESET ---
  useEffect(() => {
    if (!shouldCarousel) return;
    const realLength = displayItems.length / 3;

    if (currentIndex >= realLength * 2) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex(realLength)
        setIsTransitioning(false)
      }, 50)
    } else if (currentIndex <= 0) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex(realLength)
        setIsTransitioning(false)
      }, 50)
    }
  }, [currentIndex, shouldCarousel, displayItems.length])

  const goToNext = () => {
    if (shouldCarousel) setCurrentIndex((prev) => prev + 1)
  }
  const goToPrev = () => {
    if (shouldCarousel) setCurrentIndex((prev) => prev - 1)
  }

  // --- FORM HANDLERS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('role', formData.role);
    payload.append('content', formData.content);
    payload.append('rating', formData.rating.toString());
    if (formData.image) {
      payload.append('image', formData.image);
    }

    try {
      await submitTestimonial(payload);
      setFormSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess(false);
        setFormData({ name: "", role: "Customer", content: "", rating: 5, image: null });
      }, 3000);
    } catch (error) {
      console.error("Submission failed", error);
      alert("Failed to submit testimonial. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <section id="testimonials" ref={ref} className="py-32 px-4 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">

      {/* --- BACKGROUND EFFECTS --- */}
      {!isMobile && (
        <>
          <motion.div style={{ y, opacity }} className="absolute top-20 left-0 w-[500px] h-[500px] bg-gradient-to-br from-pink-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
          <motion.div style={{ y: yReverse }} className="absolute bottom-20 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-rose-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
          <motion.div style={{ y: yUp }} className="absolute top-32 right-20 text-gray-300 opacity-20"><Quote className="w-24 h-24" /></motion.div>
          <motion.div style={{ y: yDown }} className="absolute bottom-32 left-20 text-gray-300 opacity-20"><Quote className="w-24 h-24" /></motion.div>
        </>
      )}

      <div className="container mx-auto relative z-10">

        {/* --- HEADER --- */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 mb-6 px-6 py-3 bg-white rounded-full border border-gray-300 shadow-lg">
            <Star className="w-4 h-4 fill-gray-700" /> TESTIMONIALS
          </div>

          <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            What Our Customers <span className="block">Say</span>
          </h2>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Don't just take our word for it—hear from those who've experienced the magic of our perfume inspired perfumes.
          </p>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-8 py-6 text-lg shadow-xl transition-all hover:scale-105"
          >
            Write a Review
          </Button>
        </motion.div>

        {/* --- CONTENT AREA --- */}
        <div className="relative">

          {/* Navigation Buttons */}
          {shouldCarousel && (
            <>
              <button onClick={goToPrev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-white/90 hover:bg-white p-4 rounded-full shadow-xl border border-gray-300 transition-all hover:scale-110">
                <ChevronLeft className="w-6 h-6 text-gray-900" />
              </button>

              <button onClick={goToNext} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-white/90 hover:bg-white p-4 rounded-full shadow-xl border border-gray-300 transition-all hover:scale-110">
                <ChevronRight className="w-6 h-6 text-gray-900" />
              </button>
            </>
          )}

          <div className="overflow-hidden px-2">
            <motion.div
              animate={shouldCarousel ? { x: `-${(currentIndex / displayItems.length) * 100}%` } : { x: 0 }}
              transition={{ type: "tween", ease: "easeOut", duration: isTransitioning ? 0 : 0.5 }}
              className={`flex ${!shouldCarousel ? 'justify-center flex-wrap' : ''}`}
              style={{
                width: shouldCarousel ? `${displayItems.length * (100 / itemsPerView)}%` : '100%'
              }}
            >
              {displayItems.map((testimonial, index) => (
                <div
                  key={`${testimonial._id}-${index}`}
                  className="px-3 mb-6"
                  style={{
                    width: shouldCarousel ? `${100 / displayItems.length}%` : isMobile ? '100%' : `${100 / itemsPerView}%`
                  }}
                >
                  <div className="group relative h-full">
                    <div className="h-full bg-white rounded-3xl overflow-hidden border border-gray-300 shadow-xl hover:shadow-2xl transition-all duration-500">
                      <div className="relative h-80 overflow-hidden bg-gray-100">
                        {testimonial.image ? (
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-4xl font-bold text-gray-400">{testimonial.name.charAt(0)}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80" />

                        {/* Rating Stars - UPDATED TO GOLDEN */}
                        <div className="absolute top-6 left-6 flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-amber-400/30'} drop-shadow-lg`} />
                          ))}
                        </div>

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <p className="text-white text-lg leading-relaxed mb-6 line-clamp-3 drop-shadow-lg">"{testimonial.content}"</p>
                          <div className="flex items-center gap-3">
                            <div>
                              <h4 className="font-bold text-white text-lg drop-shadow-lg">{testimonial.name}</h4>
                              <p className="text-white/80 text-sm drop-shadow-lg">{testimonial.role}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-gradient-to-r from-pink-100 via-rose-100 to-pink-100" />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* --- SUBMISSION MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative"
            >
              {!formSuccess ? (
                <>
                  <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-900">Share Your Experience</h3>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" required value={formData.name} onChange={handleInputChange} placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role (Optional)</Label>
                        <Input id="role" name="role" value={formData.role} onChange={handleInputChange} placeholder="Customer" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Rating</Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button type="button" key={star} onClick={() => setFormData({ ...formData, rating: star })}>
                            <Star className={`w-8 h-8 transition-colors ${star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Your Review</Label>
                      <Textarea id="content" name="content" required value={formData.content} onChange={handleInputChange} placeholder="Tell us about your experience..." className="min-h-[100px]" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image">Add a Photo (Optional)</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                        <Input id="image" type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                          <Upload className="w-6 h-6" />
                          <span className="text-sm">{formData.image ? formData.image.name : "Click to upload image"}</span>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" disabled={formLoading} className="w-full bg-gray-900 text-white py-6 rounded-xl text-lg mt-4">
                      {formLoading ? "Submitting..." : <><Send className="w-4 h-4 mr-2" /> Submit Review</>}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="p-12 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                  <p className="text-gray-600">Your review has been submitted successfully and will be visible once approved by our team.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}