'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export function LoadingScreen({ isLoading }: { isLoading: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isLoading ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 flex items-center justify-center bg-background z-50"
      style={{ pointerEvents: isLoading ? 'auto' : 'none' }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: isLoading ? Infinity : 0,
            ease: 'easeInOut',
          }}
          className="relative h-24 w-24"
        >
          <Image
            src="/logo.png"
            alt="DesignLens"
            fill
            className="object-contain"
            priority
          />
        </motion.div>

        {/* Loading Text */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: isLoading ? Infinity : 0,
          }}
          className="text-center"
        >
          <h2 className="text-xl font-semibold text-foreground mb-2">DesignLens</h2>
          <p className="text-sm text-muted-foreground">Loading your design canvas...</p>
        </motion.div>

        {/* Animated Dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.6,
                repeat: isLoading ? Infinity : 0,
                delay: i * 0.1,
              }}
              className="h-2 w-2 rounded-full bg-primary"
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
