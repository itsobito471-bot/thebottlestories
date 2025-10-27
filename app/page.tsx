"use client";

export const dynamic = 'force-static';  // ✅ Force static rendering

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Achievements from "@/components/Achievements";
import Products from "@/components/Products";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      {/* <Achievements /> */}
      <Products />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}
