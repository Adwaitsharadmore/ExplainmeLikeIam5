"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Star, Trophy, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAvatarContext } from "@/contexts/avatar-context"
import { awardBadge, recordMissionProgress } from "@/lib/db-utils"
import { playSound, speakText, stopAllSounds } from "@/lib/sound-utils"
import { MissionLayout } from "@/components/mission-layout"

// Mystery challenges
const CHALLENGES = [
  {
    id: "challenge1",
    title: "Wellness Wisdom",
    description: "Test your knowledge about all health zones!",
    icon: "🧠",
    color: "purple",
    path: "/mission/mystery/wisdom-challenge",
  },
  {
    id: "challenge2",
    title: "Super Powers",
    description: "Combine powers from all zones to solve puzzles!",
    icon: "⚡",
    color: "yellow",
    path: "/mission/mystery/super-powers",
  },
  {
    id: "challenge3",
    title: "Treasure Hunt",
    description: "Find hidden treasures across all realms!",
    icon: "🗝️",
    color: "amber",
    path: "/mission/mystery/treasure-hunt",
  },
]

export default function MysteryZonePage() {
  const router = useRouter()
  const { triggerReaction, showSpeech } = useAvatarContext()
  const [showIntro, setShowIntro] = useState(true)
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(true)
  const [heroLevel, setHeroLevel] = useState(1)

  useEffect(() => {
    // Calculate hero level from points
    const points = Number.parseInt(localStorage.getItem("points") || "0")
    setHeroLevel(Math.floor(points / 100) + 1)

    // Show welcome message
    showSpeech("Welcome to the Mystery Zone! Special challenges await!")
    triggerReaction("celebrate")
    speakText("Welcome to the Mystery Zone! Special challenges await!")

    // Clean up on unmount
    return () => {
      stopAllSounds()
    }
  }, [showSpeech, triggerReaction])

  const handleChallengeSelect = (challengeId: string) => {
    setSelectedChallenge(challengeId)
    playSound("/sounds/click.mp3", 0.4)

    // Find the challenge
    const challenge = CHALLENGES.find((c) => c.id === challengeId)
    if (challenge) {
      showSpeech(`You selected ${challenge.title}! Get ready for a challenge!`)
      speakText(`You selected ${challenge.title}! Get ready for a challenge!`)
    }
  }

  const handleStartChallenge = () => {
    // Find the challenge
    const challenge = CHALLENGES.find((c) => c.id === selectedChallenge)
    if (challenge) {
      playSound("/sounds/click.mp3", 0.5)

      // For now, we'll just award a badge since we haven't implemented the actual challenges
      setTimeout(() => {
        awardBadge("mystery-explorer", 150)
        recordMissionProgress("mystery", challenge.id, 100, true)

        // Show completion message
        showSpeech("You've completed a Mystery Zone challenge! Amazing work!")
        triggerReaction("celebrate")

        // Return to mission hub after delay
        setTimeout(() => {
          router.push("/mission-hub")
        }, 3000)
      }, 1000)
    }
  }

  const handleCloseIntro = () => {
    setShowIntro(false)
    playSound("/sounds/click.mp3", 0.4)
  }

  return (
    <MissionLayout
      title="Special Challenges Await!"
      zoneName="Mystery Zone"
      zoneColor="yellow"
      zoneIcon={<Sparkles className="h-5 w-5 text-yellow-500" />}
      backgroundImage="/images/mystery-zone-bg.png"
    >
      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-10">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-5%`,
                backgroundColor: [
                  "#ff0000",
                  "#00ff00",
                  "#0000ff",
                  "#ffff00",
                  "#ff00ff",
                  "#00ffff",
                  "#ff8000",
                  "#8000ff",
                ][i % 8],
              }}
              initial={{ y: -10, opacity: 1 }}
              animate={{
                y: `${100 + Math.random() * 20}vh`,
                x: Math.random() > 0.5 ? 100 : -100,
                opacity: 0,
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                ease: "easeOut",
                delay: Math.random() * 0.5,
              }}
            />
          ))}
        </div>
      )}

      {/* Mystery Guide Character */}
      <div className="fixed bottom-20 left-4 z-20 max-w-[250px]">
        <div className="relative">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            className="relative"
          >
            <Image
              src="/images/mystery-guide.png"
              alt="Mystery Guide"
              width={100}
              height={120}
              onError={(e) => {
                e.currentTarget.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='120' viewBox='0 0 100 120'%3E%3Crect width='100' height='120' fill='%23FFF8E1'/%3E%3Ctext x='50' y='60' fontFamily='Arial' fontSize='50' textAnchor='middle' dominantBaseline='middle'%3E🧙‍♂️%3C/text%3E%3C/svg%3E"
              }}
            />
          </motion.div>
          <AnimatePresence>
            {showIntro && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-32 -right-4 bg-white rounded-lg p-3 shadow-lg max-w-[220px]"
              >
                <div className="text-sm text-amber-700">
                  Welcome to the Mystery Zone! This special area unlocks unique challenges that combine powers from all
                  realms. Choose a challenge to test your wellness hero skills!
                </div>
                <div className="absolute bottom-0 right-8 w-4 h-4 bg-white transform rotate-45 translate-y-1/2"></div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-0 right-0 h-6 w-6 p-0 rounded-full"
                  onClick={handleCloseIntro}
                >
                  ×
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Card className="bg-white/90 backdrop-blur-sm border-amber-200 shadow-xl mb-6">
        <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 border-b border-amber-200">
          <CardTitle className="text-center text-amber-800 flex items-center justify-center gap-2">
            <Star className="h-5 w-5 text-amber-500" /> Mystery Zone Challenges
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="inline-block bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 text-white px-4 py-2 rounded-full font-medium">
              Hero Level: {heroLevel}
            </div>
            <p className="mt-2 text-gray-600">Complete challenges to earn special badges and boost your hero level!</p>
          </div>

          <div className="grid gap-4">
            {CHALLENGES.map((challenge) => (
              <motion.div
                key={challenge.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedChallenge === challenge.id
                    ? `bg-${challenge.color}-100 border-${challenge.color}-400`
                    : `bg-white border-${challenge.color}-200 hover:bg-${challenge.color}-50`
                }`}
                onClick={() => handleChallengeSelect(challenge.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full bg-${challenge.color}-100 flex items-center justify-center text-2xl`}
                  >
                    {challenge.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{challenge.title}</h3>
                    <p className="text-sm text-gray-600">{challenge.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t border-amber-200 pt-4">
          <Button
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
            disabled={!selectedChallenge}
            onClick={handleStartChallenge}
          >
            <Gift className="h-4 w-4 mr-2" /> Start Challenge
          </Button>
        </CardFooter>
      </Card>

      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-amber-200 mb-6">
        <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" /> Mystery Zone Rewards
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">🏆</div>
            <span className="text-xs font-medium">Mystery Explorer</span>
          </div>
          <div className="bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">🌟</div>
            <span className="text-xs font-medium">Realm Master</span>
          </div>
          <div className="bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">👑</div>
            <span className="text-xs font-medium">Wellness Champion</span>
          </div>
        </div>
      </div>
    </MissionLayout>
  )
}
