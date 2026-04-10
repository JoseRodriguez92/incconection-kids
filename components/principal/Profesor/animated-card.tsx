"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right"
  hover?: boolean
}

export function AnimatedCard({
  children,
  className = "",
  delay = 0,
  direction = "up",
  hover = true,
}: AnimatedCardProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { y: 30, x: 0 }
      case "down":
        return { y: -30, x: 0 }
      case "left":
        return { x: 30, y: 0 }
      case "right":
        return { x: -30, y: 0 }
      default:
        return { y: 30, x: 0 }
    }
  }

  const cardVariants = {
    hidden: {
      opacity: 0,
      ...getInitialPosition(),
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.3,
      },
    },
  }

  const hoverVariants = hover
    ? {
        scale: 1.02,
        y: -5,
        transition: {
          duration: 0.2,
          ease: "easeOut",
        },
      }
    : {}

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={hoverVariants}
      className={className}
    >
      <Card className="h-full transition-shadow duration-300 hover:shadow-lg">{children}</Card>
    </motion.div>
  )
}
