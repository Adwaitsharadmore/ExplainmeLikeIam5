"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface BounceProps {
  children: ReactNode
  delay?: number
}

export function Bounce({ children, delay = 0 }: BounceProps) {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}
