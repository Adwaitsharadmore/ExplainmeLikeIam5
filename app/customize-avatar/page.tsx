"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { AvatarGenerator } from "@/components/avatar-generator"

// Avatar customization options
const BASE_CHARACTERS = [
  { id: "char1", name: "Explorer", image: "/assets/avatars/explorer.png" },
  { id: "char2", name: "Athlete", image: "/assets/avatars/athlete.png" },
  { id: "char3", name: "Scientist", image: "/assets/avatars/scientist.png" },
  { id: "char4", name: "Superhero", image: "/assets/avatars/superhero.png" },
  { id: "char5", name: "Ninja", image: "/assets/avatars/ninja.png" },
  { id: "char6", name: "Wizard", image: "/assets/avatars/wizard.png" },
  { id: "char7", name: "Astronaut", image: "/assets/avatars/astronaut.png" },
  { id: "char8", name: "Chef", image: "/assets/avatars/chef.png" },
]

const HAIRSTYLES = [
  { id: "hair1", name: "Short", image: "/assets/avatars/hair-short.png" },
  { id: "hair2", name: "Long", image: "/assets/avatars/hair-long.png" },
  { id: "hair3", name: "Curly", image: "/assets/avatars/hair-curly.png" },
  { id: "hair4", name: "Wavy", image: "/assets/avatars/hair-wavy.png" },
  { id: "hair5", name: "Spiky", image: "/assets/avatars/hair-spiky.png" },
  { id: "hair6", name: "Braids", image: "/assets/avatars/hair-braids.png" },
  { id: "hair7", name: "Afro", image: "/assets/avatars/hair-afro.png" },
  { id: "hair8", name: "Bun", image: "/assets/avatars/hair-bun.png" },
  { id: "hair9", name: "Ponytail", image: "/assets/avatars/hair-ponytail.png" },
  { id: "hair10", name: "Bald", image: "/assets/avatars/hair-bald.png" },
]

const SKIN_TONES = [
  { id: "skin1", name: "Tone 1", color: "#FFF5E1" },
  { id: "skin2", name: "Tone 2", color: "#FFE0BD" },
  { id: "skin3", name: "Tone 3", color: "#F1C27D" },
  { id: "skin4", name: "Tone 4", color: "#E0AC69" },
  { id: "skin5", name: "Tone 5", color: "#C68642" },
  { id: "skin6", name: "Tone 6", color: "#8D5524" },
  { id: "skin7", name: "Tone 7", color: "#5C3836" },
  { id: "skin8", name: "Tone 8", color: "#3A2A28" },
]

const OUTFITS = [
  { id: "outfit1", name: "Superhero", image: "/assets/avatars/outfit-superhero.png" },
  { id: "outfit2", name: "Explorer", image: "/assets/avatars/outfit-explorer.png" },
  { id: "outfit3", name: "Scientist", image: "/assets/avatars/outfit-scientist.png" },
  { id: "outfit4", name: "Athlete", image: "/assets/avatars/outfit-athlete.png" },
  { id: "outfit5", name: "Casual", image: "/assets/avatars/outfit-casual.png" },
  { id: "outfit6", name: "Formal", image: "/assets/avatars/outfit-formal.png" },
]

const ACCESSORIES = [
  { id: "acc1", name: "Glasses", image: "/assets/avatars/acc-glasses.png" },
  { id: "acc2", name: "Hat", image: "/assets/avatars/acc-hat.png" },
  { id: "acc3", name: "Cape", image: "/assets/avatars/acc-cape.png" },
  { id: "acc4", name: "Backpack", image: "/assets/avatars/acc-backpack.png" },
  { id: "acc5", name: "Watch", image: "/assets/avatars/acc-watch.png" },
  { id: "acc6", name: "Headband", image: "/assets/avatars/acc-headband.png" },
]

// Fallback function for image loading errors
const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = "/placeholder.svg?height=60&width=60"
}

export default function CustomizeAvatarPage() {
  const router = useRouter()
  const [heroProfile, setHeroProfile] = useState<any>(null)
  const [selectedBase, setSelectedBase] = useState(BASE_CHARACTERS[0].id)
  const [selectedHair, setSelectedHair] = useState(HAIRSTYLES[0].id)
  const [selectedSkin, setSelectedSkin] = useState(SKIN_TONES[0].id)
  const [selectedOutfit, setSelectedOutfit] = useState(OUTFITS[0].id)
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    // Load hero profile from localStorage
    const profileData = localStorage.getItem("heroProfile")
    if (profileData) {
      setHeroProfile(JSON.parse(profileData))
    }
  }, [])

  const toggleAccessory = (accessoryId: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(accessoryId) ? prev.filter((id) => id !== accessoryId) : [...prev, accessoryId],
    )
  }

  const handleSubmit = () => {
    setIsSubmitting(true)

    try {
      // Save avatar customization to localStorage
      const avatarData = {
        baseCharacter: selectedBase,
        hairstyle: selectedHair,
        skinTone: SKIN_TONES.find((skin) => skin.id === selectedSkin)?.color || SKIN_TONES[0].color,
        outfit: selectedOutfit,
        accessories: selectedAccessories,
      }

      localStorage.setItem("heroAvatar", JSON.stringify(avatarData))

      // Show celebration animation
      setShowCelebration(true)

      // Navigate to mission hub after a delay
      setTimeout(() => {
        router.push("/mission-hub")
      }, 3000)
    } catch (error) {
      console.error("Error saving avatar:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50 p-4">
      {showCelebration ? (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-b from-purple-500 to-pink-500">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
              }}
              className="mb-8"
            >
              <AvatarGenerator
                baseCharacter={selectedBase}
                hairstyle={selectedHair}
                skinTone={SKIN_TONES.find((skin) => skin.id === selectedSkin)?.color || SKIN_TONES[0].color}
                outfit={selectedOutfit}
                accessories={selectedAccessories}
                size={200}
                className="mx-auto bg-white p-2 shadow-lg rounded-full"
              />
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-4">This is your Wellness Hero!</h1>
            <p className="text-xl text-white mb-8">Get ready for an amazing adventure!</p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              <p className="text-white text-lg">Loading your mission hub...</p>
            </motion.div>
          </motion.div>
        </div>
      ) : (
        <Card className="w-full max-w-4xl shadow-lg border-2 border-purple-100">
          <CardHeader className="bg-purple-50 border-b border-purple-100">
            <CardTitle className="text-2xl text-purple-700">Customize Your Wellness Hero</CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="order-2 md:order-1">
                <Tabs defaultValue="base">
                  <TabsList className="grid grid-cols-5 mb-4">
                    <TabsTrigger value="base">Base</TabsTrigger>
                    <TabsTrigger value="hair">Hair</TabsTrigger>
                    <TabsTrigger value="skin">Skin</TabsTrigger>
                    <TabsTrigger value="outfit">Outfit</TabsTrigger>
                    <TabsTrigger value="accessories">Extras</TabsTrigger>
                  </TabsList>

                  <TabsContent value="base" className="space-y-4">
                    <h3 className="font-medium">Choose your character</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {BASE_CHARACTERS.map((character) => (
                        <div
                          key={character.id}
                          onClick={() => setSelectedBase(character.id)}
                          className={`cursor-pointer rounded-lg p-2 text-center transition-all ${
                            selectedBase === character.id
                              ? "bg-purple-100 border-2 border-purple-400"
                              : "border border-gray-200 hover:bg-purple-50"
                          }`}
                        >
                          <div
                            className="w-16 h-16 mx-auto mb-1 flex items-center justify-center rounded-full"
                            style={{
                              backgroundColor:
                                character.id === "char1"
                                  ? "#4F46E5"
                                  : character.id === "char2"
                                    ? "#10B981"
                                    : character.id === "char3"
                                      ? "#EF4444"
                                      : character.id === "char4"
                                        ? "#F59E0B"
                                        : character.id === "char5"
                                          ? "#8B5CF6"
                                          : character.id === "char6"
                                            ? "#EC4899"
                                            : character.id === "char7"
                                              ? "#06B6D4"
                                              : "#F97316",
                            }}
                          >
                            <span className="text-2xl">
                              {character.id === "char1"
                                ? "🧭"
                                : character.id === "char2"
                                  ? "🏃"
                                  : character.id === "char3"
                                    ? "🔬"
                                    : character.id === "char4"
                                      ? "🦸"
                                      : character.id === "char5"
                                        ? "🥷"
                                        : character.id === "char6"
                                          ? "🧙"
                                          : character.id === "char7"
                                            ? "👨‍🚀"
                                            : "👨‍🍳"}
                            </span>
                          </div>
                          <span className="text-xs">{character.name}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="hair" className="space-y-4">
                    <h3 className="font-medium">Choose a hairstyle</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {HAIRSTYLES.map((hairstyle) => (
                        <div
                          key={hairstyle.id}
                          onClick={() => setSelectedHair(hairstyle.id)}
                          className={`cursor-pointer rounded-lg p-2 text-center transition-all ${
                            selectedHair === hairstyle.id
                              ? "bg-purple-100 border-2 border-purple-400"
                              : "border border-gray-200 hover:bg-purple-50"
                          }`}
                        >
                          <div className="w-10 h-10 mx-auto mb-1 flex items-center justify-center rounded-full bg-gray-200">
                            <span className="text-sm">💇</span>
                          </div>
                          <span className="text-xs">{hairstyle.name}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="skin" className="space-y-4">
                    <h3 className="font-medium">Choose a skin tone</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {SKIN_TONES.map((skin) => (
                        <div
                          key={skin.id}
                          onClick={() => setSelectedSkin(skin.id)}
                          className={`cursor-pointer rounded-lg p-2 text-center transition-all ${
                            selectedSkin === skin.id
                              ? "bg-purple-100 border-2 border-purple-400"
                              : "border border-gray-200 hover:bg-purple-50"
                          }`}
                        >
                          <div
                            className="w-10 h-10 rounded-full mx-auto mb-1"
                            style={{ backgroundColor: skin.color }}
                          ></div>
                          <span className="text-xs">{skin.name}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="outfit" className="space-y-4">
                    <h3 className="font-medium">Choose an outfit</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {OUTFITS.map((outfit) => (
                        <div
                          key={outfit.id}
                          onClick={() => setSelectedOutfit(outfit.id)}
                          className={`cursor-pointer rounded-lg p-2 text-center transition-all ${
                            selectedOutfit === outfit.id
                              ? "bg-purple-100 border-2 border-purple-400"
                              : "border border-gray-200 hover:bg-purple-50"
                          }`}
                        >
                          <div
                            className="w-12 h-12 mx-auto mb-1 flex items-center justify-center rounded-full"
                            style={{
                              backgroundColor:
                                outfit.id === "outfit1"
                                  ? "#4F46E5"
                                  : outfit.id === "outfit2"
                                    ? "#10B981"
                                    : outfit.id === "outfit3"
                                      ? "#EF4444"
                                      : outfit.id === "outfit4"
                                        ? "#F59E0B"
                                        : outfit.id === "outfit5"
                                          ? "#8B5CF6"
                                          : "#EC4899",
                            }}
                          >
                            <span className="text-xl">
                              {outfit.id === "outfit1"
                                ? "🦸"
                                : outfit.id === "outfit2"
                                  ? "🧥"
                                  : outfit.id === "outfit3"
                                    ? "🥼"
                                    : outfit.id === "outfit4"
                                      ? "🏃"
                                      : outfit.id === "outfit5"
                                        ? "👕"
                                        : "👔"}
                            </span>
                          </div>
                          <span className="text-xs">{outfit.name}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="accessories" className="space-y-4">
                    <h3 className="font-medium">Choose accessories (optional)</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {ACCESSORIES.map((accessory) => (
                        <div
                          key={accessory.id}
                          onClick={() => toggleAccessory(accessory.id)}
                          className={`cursor-pointer rounded-lg p-2 text-center transition-all ${
                            selectedAccessories.includes(accessory.id)
                              ? "bg-purple-100 border-2 border-purple-400"
                              : "border border-gray-200 hover:bg-purple-50"
                          }`}
                        >
                          <div className="w-12 h-12 mx-auto mb-1 flex items-center justify-center rounded-full bg-gray-200">
                            <span className="text-xl">
                              {accessory.id === "acc1"
                                ? "👓"
                                : accessory.id === "acc2"
                                  ? "🧢"
                                  : accessory.id === "acc3"
                                    ? "🦸"
                                    : accessory.id === "acc4"
                                      ? "🎒"
                                      : accessory.id === "acc5"
                                        ? "⌚"
                                        : "👑"}
                            </span>
                          </div>
                          <span className="text-xs">{accessory.name}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="order-1 md:order-2 flex flex-col items-center justify-center">
                <div className="bg-white rounded-lg p-4 shadow-md mb-4 w-full max-w-xs">
                  <h3 className="text-center font-medium mb-4">{heroProfile?.heroName || "Your Hero"}</h3>
                  <div className="relative w-40 h-40 mx-auto">
                    <AvatarGenerator
                      baseCharacter={selectedBase}
                      hairstyle={selectedHair}
                      skinTone={SKIN_TONES.find((skin) => skin.id === selectedSkin)?.color || SKIN_TONES[0].color}
                      outfit={selectedOutfit}
                      accessories={selectedAccessories}
                      size={160}
                      className="rounded-full bg-gradient-to-r from-purple-100 to-pink-100 p-2"
                    />
                    <motion.div
                      animate={{
                        y: [0, -5, 0],
                        rotate: [0, 2, 0, -2, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "loop",
                      }}
                      className="absolute bottom-0 right-0"
                    >
                      <div className="bg-yellow-400 text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center border-2 border-white shadow-md">
                        {heroProfile?.age || "?"}
                      </div>
                    </motion.div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-3 text-sm text-purple-700 max-w-xs">
                  <p className="text-center">Preview your hero doing healthy activities!</p>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-purple-100 pt-4">
            <Button variant="outline" type="button" onClick={() => router.push("/create-profile")}>
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? "Saving..." : "Complete Your Hero"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
