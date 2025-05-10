"use client"

import React from "react"

import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

interface StaggerInProps {
  children: React.ReactNode
  className?: string
  delayIncrement?: number
  initialDelay?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  staggerChildren?: boolean
  duration?: number
  threshold?: number
}

export function StaggerIn({
  children,
  className = "",
  delayIncrement = 0.1,
  initialDelay = 0,
  direction = "up",
  staggerChildren = true,
  duration = 0.5,
  threshold = 0.2,
}: StaggerInProps) {
  const { ref, isInView } = useScrollAnimation(threshold)

  // Set initial and animate values based on direction
  const getVariants = () => {
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
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          staggerChildren: staggerChildren ? delayIncrement : 0,
          delayChildren: initialDelay,
          ease: [0.22, 1, 0.36, 1], // Custom ease curve similar to Apple's
        },
      },
      item: {
        hidden: initial,
        show: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            duration,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      },
    }
  }

  const variants = getVariants()

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={variants.item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
