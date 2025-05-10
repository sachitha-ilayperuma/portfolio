"use client"

import { useRef } from "react"
import { useInView } from "framer-motion"

export function useScrollAnimation(threshold = 0.2, once = true) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, amount: threshold })

  return { ref, isInView }
}
