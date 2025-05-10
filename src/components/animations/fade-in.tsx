"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  duration?: number
  threshold?: number
}

export function FadeIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.5,
  threshold = 0.2,
}: FadeInProps) {
  const { ref, isInView } = useScrollAnimation(threshold)

  // Set initial and animate values based on direction
  const getInitialAndAnimate = () => {
    const initial = { opacity: 0 }

    switch (direction) {
      case "up":
        initial.y = 40
        break
      case "down":
        initial.y = -40
        break
      case "left":
        initial.x = 40
        break
      case "right":
        initial.x = -40
        break
      case "none":
      default:
        break
    }

    return {
      initial,
      animate: isInView ? { opacity: 1, x: 0, y: 0 } : initial,
    }
  }

  const { initial, animate } = getInitialAndAnimate()

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1], // Custom ease curve similar to Apple's
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
