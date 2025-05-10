"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

interface ScaleInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  threshold?: number
  initialScale?: number
}

export function ScaleIn({
  children,
  className = "",
  delay = 0,
  duration = 0.7,
  threshold = 0.2,
  initialScale = 0.95,
}: ScaleInProps) {
  const { ref, isInView } = useScrollAnimation(threshold)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: initialScale }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: initialScale }}
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
