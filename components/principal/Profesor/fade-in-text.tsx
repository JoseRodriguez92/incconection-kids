"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface FadeInTextProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function FadeInText({ children, delay = 0, className = "" }: FadeInTextProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
