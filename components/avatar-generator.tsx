interface AvatarGeneratorProps {
  baseCharacter: string
  hairstyle: string
  skinTone: string
  outfit: string
  accessories: string[]
  size?: number
  className?: string
}

export function AvatarGenerator({
  baseCharacter,
  hairstyle,
  skinTone,
  outfit,
  accessories,
  size = 160,
  className = "",
}: AvatarGeneratorProps) {
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

  // Get hair emoji
  const getHairEmoji = (id: string) => {
    return "💇"
  }

  // Get outfit emoji
  const getOutfitEmoji = (id: string) => {
    const emojis: Record<string, string> = {
      outfit1: "🦸",
      outfit2: "🧥",
      outfit3: "🥼",
      outfit4: "🏃",
      outfit5: "👕",
      outfit6: "👔",
    }
    return emojis[id] || "👕"
  }

  // Get accessory emoji
  const getAccessoryEmoji = (id: string) => {
    const emojis: Record<string, string> = {
      acc1: "👓",
      acc2: "🧢",
      acc3: "🦸",
      acc4: "🎒",
      acc5: "⌚",
      acc6: "👑",
    }
    return emojis[id] || "🎁"
  }

  return (
    <div
      className={`relative rounded-full overflow-hidden flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: skinTone || "#FFE0BD",
        border: "4px solid white",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Character base */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          backgroundColor: getCharacterColor(baseCharacter),
          opacity: 0.2,
        }}
      />

      {/* Character emoji */}
      <div className="text-4xl z-10">{getCharacterEmoji(baseCharacter)}</div>

      {/* Accessories (small emojis in corners) */}
      {accessories.length > 0 && (
        <div className="absolute top-2 right-2 text-xl">
          {accessories.slice(0, 1).map((acc) => getAccessoryEmoji(acc))}
        </div>
      )}

      {/* Hair indicator */}
      {hairstyle && (
        <div className="absolute top-0 left-0 w-full h-8 flex items-center justify-center">
          <div
            className="w-1/2 h-2 rounded-t-full"
            style={{
              backgroundColor: "#333",
              opacity: 0.7,
            }}
          />
        </div>
      )}

      {/* Outfit indicator */}
      {outfit && (
        <div className="absolute bottom-0 left-0 w-full h-1/3 flex items-center justify-center">
          <div
            className="w-full h-full"
            style={{
              backgroundColor: getCharacterColor(outfit),
              opacity: 0.3,
            }}
          />
        </div>
      )}

      {/* Age badge - if needed */}
    </div>
  )
}
