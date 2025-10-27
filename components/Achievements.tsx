"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { Trophy, Users, Star, Gift } from "lucide-react"

export default function Achievements() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const achievements = [
    {
      icon: Users,
      value: 5000,
      suffix: "+",
      label: "Happy Customers",
      color: "from-[#222222] to-[#444444]"
    },
    {
      icon: Gift,
      value: 50,
      suffix: "+",
      label: "Unique Hampers",
      color: "from-[#444444] to-[#222222]"
    },
    {
      icon: Star,
      value: 4.9,
      suffix: "/5",
      label: "Average Rating",
      color: "from-[#222222] to-[#444444]"
    },
    {
      icon: Trophy,
      value: 15,
      suffix: "+",
      label: "Awards Won",
      color: "from-[#444444] to-[#222222]"
    }
  ]

  return (
    <section ref={ref} className="py-24 px-4 bg-gradient-to-br from-[#222222] to-[#1C1C1C] relative overflow-hidden">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 right-0 w-96 h-96 bg-[#444444] rounded-full blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-0 left-0 w-96 h-96 bg-[#444444] rounded-full blur-3xl"
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
            className="inline-block text-sm font-semibold text-[#DADADA] mb-4 px-4 py-2 bg-[#444444] rounded-full"
          >
            OUR ACHIEVEMENTS
          </motion.span>
          <h2 className="text-4xl md:text-6xl font-bold text-[#F8F8F8] mb-6">
            Milestones We're Proud Of
          </h2>
          <p className="text-lg md:text-xl text-[#DADADA] max-w-3xl mx-auto">
            Our commitment to excellence has been recognized by thousands of satisfied customers and industry experts alike.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon
            return (
              <AchievementCard
                key={index}
                achievement={achievement}
                Icon={Icon}
                index={index}
                isInView={isInView}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

function AchievementCard({ achievement, Icon, index, isInView }: any) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (isInView) {
      const duration = 2000
      const steps = 60
      const increment = achievement.value / steps
      let current = 0

      const timer = setInterval(() => {
        current += increment
        if (current >= achievement.value) {
          setCount(achievement.value)
          clearInterval(timer)
        } else {
          setCount(Math.floor(current))
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }
  }, [isInView, achievement.value])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
      className="relative group"
    >
      <div className="bg-[#F2F2F2] rounded-3xl p-8 border-2 border-[#DADADA] shadow-xl hover:shadow-2xl transition-all duration-300 text-center">
        <div className={`w-16 h-16 bg-gradient-to-br ${achievement.color} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-[#F8F8F8]" />
        </div>
        <div className="text-4xl md:text-5xl font-bold text-[#222222] mb-2">
          {achievement.suffix === "/5" ? count.toFixed(1) : count}
          {achievement.suffix}
        </div>
        <p className="text-[#444444] font-medium">{achievement.label}</p>
      </div>
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0, 0.1, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: index * 0.2
        }}
        className="absolute inset-0 bg-gradient-to-br from-[#F8F8F8] to-transparent rounded-3xl"
      />
    </motion.div>
  )
}
