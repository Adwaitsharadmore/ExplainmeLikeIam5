"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAvatarContext } from "@/contexts/avatar-context"

export const PersistentAvatar: React.FC = () => {
  const { avatarState, triggerReaction } = useAvatarContext()
  const {
    baseCharacter,
    skinTone,
    accessories,
    currentZone,
    isAnimating,
    reactionType,
    showSpeechBubble,
    speechMessage,
  } = avatarState

  // Map reactions to animation variants
  const animations = {
    celebrate: {
      scale: [1, 1.2, 1],
      rotate: [0, 10, -10, 0],
      transition: { duration: 1, repeat: 1 },
    },
    encourage: {
      y: [0, -10, 0],
      transition: { duration: 0.5, repeat: 2 },
    },
    drinking: {
      rotate: [0, 20, 0],
      transition: { duration: 1.5 },
    },
    exercise: {
      y: [0, -20, 0],
      transition: { duration: 0.7, repeat: 3 },
    },
    mindful: {
      scale: [1, 1.1, 1],
      transition: { duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
    },
  }

  // Generate a consistent color based on the character ID
  const getCharacterColor = (id: string) => {
    const colors = [
      "#4F46E5", // indigo
      "#10B981", // emerald
      "#EF4444", // red
      "#F59E0B", // amber
      "#8B5CF6", // violet
      "#EC4899", // pink
      "#06B6D4", // cyan
      "#F97316", // orange
    ]

    // Extract number from id if possible
    const num = Number.parseInt(id.replace(/\D/g, "")) || 0
    return colors[num % colors.length]
  }

  // Get character emoji based on type
  const getCharacterEmoji = (id: string) => {
    const emojis: Record<string, string> = {
      char1: "🧭", // explorer
      char2: "🏃", // athlete
      char3: "🔬", // scientist
      char4: "🦸", // superhero
      char5: "🥷", // ninja
      char6: "🧙", // wizard
      char7: "👨‍🚀", // astronaut
      char8: "👨‍🍳", // chef
    }
    return emojis[id] || "😃"
  }

  // Zone-specific effects
  const getZoneEffect = () => {
    switch (currentZone) {
      case "hydration":
        return (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: "#60A5FA", opacity: 0.2 }}
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        )
      case "nutrition":
        return (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: "#34D399", opacity: 0.2 }}
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        )
      case "movement":
        return (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: "#F97316", opacity: 0.2 }}
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        )
      case "mindfulness":
        return (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: "#8B5CF6", opacity: 0.2 }}
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="persistent-avatar-container fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {showSpeechBubble && (
          <motion.div
            className="speech-bubble bg-white rounded-lg p-2 mb-2 text-sm max-w-[150px] relative shadow-md"
            initial={{ opacity: 0, scale: 0, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute bottom-0 right-4 w-4 h-4 bg-white transform rotate-45 translate-y-1/2" />
            {speechMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="avatar-container relative w-16 h-16 cursor-pointer"
        animate={isAnimating ? animations[reactionType] : {}}
        onClick={() => triggerReaction("encourage")}
        whileHover={{ scale: 1.05 }}
      >
        {getZoneEffect()}

        <div
          className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center"
          style={{
            backgroundColor: skinTone || "#FFE0BD",
            border: "3px solid white",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Character base with background color */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              backgroundColor: getCharacterColor(baseCharacter),
              opacity: 0.2,
            }}
          />

          {/* Character emoji */}
          <div className="text-2xl z-10">{getCharacterEmoji(baseCharacter)}</div>

          {/* Accessories (small indicators) */}
          {accessories.length > 0 && (
            <div className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-[8px] font-bold">
              {accessories.length}
            </div>
          )}

          {/* Zone-specific animations */}
          {currentZone === "hydration" && reactionType === "drinking" && (
            <motion.div
              className="absolute top-0 right-0 text-xs"
              animate={{ rotate: [0, 30, 0] }}
              transition={{ duration: 1, repeat: 1 }}
            >
              💧
            </motion.div>
          )}

          {currentZone === "movement" && reactionType === "exercise" && (
            <motion.div
              className="absolute bottom-0 w-full text-center text-xs"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.5, repeat: 3 }}
            >
              💪
            </motion.div>
          )}

          {currentZone === "mindfulness" && reactionType === "mindful" && (
            <motion.div
              className="absolute top-0 w-full text-center text-xs"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              ✨
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
