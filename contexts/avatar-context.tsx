"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { usePathname } from "next/navigation"

// Define the avatar state interface
export interface AvatarState {
  baseCharacter: string
  hairstyle: string
  skinTone: string
  outfit: string
  accessories: string[]
  currentZone: "hydration" | "nutrition" | "movement" | "mindfulness" | "hub"
  isAnimating: boolean
  reactionType: "celebrate" | "encourage" | "drinking" | "exercise" | "mindful"
  showSpeechBubble: boolean
  speechMessage: string
}

// Define the context interface
interface AvatarContextType {
  avatarState: AvatarState
  updateAvatar: (updates: Partial<AvatarState>) => void
  triggerReaction: (reactionType: AvatarState["reactionType"]) => void
  showSpeech: (message: string) => void
}

// Create the context with undefined initial value
const AvatarContext = createContext<AvatarContextType | undefined>(undefined)

// Provider component
export const AvatarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or defaults
  const [avatarState, setAvatarState] = useState<AvatarState>(() => {
    // Only run in browser
    if (typeof window !== "undefined") {
      const savedAvatar = localStorage.getItem("heroAvatar")
      const savedProfile = localStorage.getItem("heroProfile")

      if (savedAvatar && savedProfile) {
        const avatarData = JSON.parse(savedAvatar)
        return {
          baseCharacter: avatarData.baseCharacter || "char1",
          hairstyle: avatarData.hairstyle || "hair1",
          skinTone: avatarData.skinTone || "#FFE0BD",
          outfit: avatarData.outfit || "outfit1",
          accessories: avatarData.accessories || [],
          currentZone: "hub",
          isAnimating: false,
          reactionType: "encourage",
          showSpeechBubble: false,
          speechMessage: "",
        }
      }
    }

    // Default state if no saved data
    return {
      baseCharacter: "char1",
      hairstyle: "hair1",
      skinTone: "#FFE0BD",
      outfit: "outfit1",
      accessories: [],
      currentZone: "hub",
      isAnimating: false,
      reactionType: "encourage",
      showSpeechBubble: false,
      speechMessage: "",
    }
  })

  const pathname = usePathname()

  // Update zone based on current route
  useEffect(() => {
    if (!pathname) return

    let currentZone: AvatarState["currentZone"] = "hub"

    if (pathname.includes("hydration")) currentZone = "hydration"
    else if (pathname.includes("nutrition")) currentZone = "nutrition"
    else if (pathname.includes("movement")) currentZone = "movement"
    else if (pathname.includes("mindfulness")) currentZone = "mindfulness"
    else if (pathname.includes("mission-hub")) currentZone = "hub"

    setAvatarState((prev) => ({
      ...prev,
      currentZone,
    }))
  }, [pathname])

  // Update avatar state
  const updateAvatar = (updates: Partial<AvatarState>) => {
    setAvatarState((prev) => ({
      ...prev,
      ...updates,
    }))
  }

  // Trigger avatar reaction with auto-reset
  const triggerReaction = (reactionType: AvatarState["reactionType"]) => {
    setAvatarState((prev) => ({
      ...prev,
      isAnimating: true,
      reactionType,
    }))

    // Reset animation after a delay
    setTimeout(() => {
      setAvatarState((prev) => ({
        ...prev,
        isAnimating: false,
      }))
    }, 2000)
  }

  // Show speech bubble with auto-hide
  const showSpeech = (message: string) => {
    setAvatarState((prev) => ({
      ...prev,
      showSpeechBubble: true,
      speechMessage: message,
    }))

    // Hide speech bubble after a delay
    setTimeout(() => {
      setAvatarState((prev) => ({
        ...prev,
        showSpeechBubble: false,
      }))
    }, 4000)
  }

  // Randomly show encouragement messages
  useEffect(() => {
    if (avatarState.currentZone === "hub") return

    const encouragementMessages = {
      hydration: ["Stay hydrated, hero!", "Water gives you super powers!", "Great job drinking water!"],
      nutrition: ["Yummy healthy foods!", "Fruits and veggies make you strong!", "Eating a rainbow is fun!"],
      movement: ["Let's get moving!", "You're super active!", "Moving makes your body happy!"],
      mindfulness: ["Take a deep breath...", "Feeling calm and focused!", "Your mind is getting stronger!"],
    }

    const randomEncouragement = () => {
      // 20% chance to show encouragement if not already animating
      if (Math.random() < 0.2 && !avatarState.isAnimating && !avatarState.showSpeechBubble) {
        const messages = encouragementMessages[avatarState.currentZone]
        const randomMessage = messages[Math.floor(Math.random() * messages.length)]
        showSpeech(randomMessage)
      }
    }

    // Set up interval for random encouragement
    const intervalId = setInterval(randomEncouragement, 15000)

    return () => clearInterval(intervalId)
  }, [avatarState.currentZone, avatarState.isAnimating, avatarState.showSpeechBubble])

  return (
    <AvatarContext.Provider value={{ avatarState, updateAvatar, triggerReaction, showSpeech }}>
      {children}
    </AvatarContext.Provider>
  )
}

// Custom hook to use the avatar context
export const useAvatarContext = () => {
  const context = useContext(AvatarContext)
  if (context === undefined) {
    throw new Error("useAvatarContext must be used within an AvatarProvider")
  }
  return context
}
