"use client"

import { motion } from "framer-motion"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import type { ReactNode } from "react"

interface SlideInTabsProps {
  defaultValue: string
  children: ReactNode
  className?: string
}

export function SlideInTabs({ defaultValue, children, className = "" }: SlideInTabsProps) {
  const tabContentVariants = {
    hidden: {
      opacity: 0,
      x: 20,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      x: -20,
      scale: 0.98,
      transition: {
        duration: 0.2,
      },
    },
  }

  return (
    <Tabs defaultValue={defaultValue} className={className}>
      {children}
    </Tabs>
  )
}

export function AnimatedTabsContent({ value, children }: { value: string; children: ReactNode }) {
  return (
    <TabsContent value={value} className="mt-0">
      <motion.div
        key={value}
        initial={{ opacity: 0, x: 20, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -20, scale: 0.98 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </TabsContent>
  )
}
