"use client"

import { useEffect } from "react"
import { preloadCommonSounds, createFallbackSound } from "@/lib/sound-utils"

export function SoundInitializer() {
  useEffect(() => {
    // Initialize sound system
    preloadCommonSounds()
    createFallbackSound()
  }, [])

  return null
}
