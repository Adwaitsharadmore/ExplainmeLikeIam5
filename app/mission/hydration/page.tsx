"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Droplet } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { generateAIResponse } from "@/lib/ai-service"
import { MissionLayout } from "@/components/mission-layout"
import { MissionComplete } from "@/components/mission-complete"
import { speakText } from "@/lib/sound-utils"

export default function HydrationMissionPage() {
  const router = useRouter()
  const [heroProfile, setHeroProfile] = useState<any>(null)
  const [hydrationLevel, setHydrationLevel] = useState(0)
  const [waterDrops, setWaterDrops] = useState<{ id: number; x: number; y: number }[]>([])
  const [isDropping, setIsDropping] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [aiResponse, setAIResponse] = useState("")
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [audioUrl, setAudioUrl] = useState("")
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load hero profile from localStorage
    const profileData = localStorage.getItem("heroProfile")
    if (profileData) {
      setHeroProfile(JSON.parse(profileData))
    }

    // Generate water drops
    generateWaterDrops()

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  const generateWaterDrops = () => {
    const newDrops = []
    for (let i = 0; i < 8; i++) {
      newDrops.push({
        id: i,
        x: Math.random() * 80 + 10, // 10% to 90% of container width
        y: Math.random() * 80 + 10, // 10% to 90% of container height
      })
    }
    setWaterDrops(newDrops)
  }

  const handleDropClick = (id: number) => {
    if (isDropping || hydrationLevel >= 100) return

    setIsDropping(true)

    // Remove the clicked drop
    setWaterDrops((prev) => prev.filter((drop) => drop.id !== id))

    // Increase hydration level
    setHydrationLevel((prev) => {
      const newLevel = Math.min(prev + 12.5, 100)

      // If we've reached 100%, show completion after a delay
      if (newLevel >= 100) {
        setTimeout(() => {
          setShowCompletion(true)
          fetchAIResponse()
        }, 1000)
      }

      return newLevel
    })

    // Allow clicking again after animation
    setTimeout(() => {
      setIsDropping(false)
    }, 500)
  }

  const fetchAIResponse = async () => {
    setIsLoadingAI(true)
    try {
      // Get the AI response
      const response = await generateAIResponse(heroProfile, "hydration", "water tracker")
      setAIResponse(response.text)

      // Generate voice if ElevenLabs API key is available
      const elevenLabsKey = localStorage.getItem("elevenLabsApiKey")
      if (elevenLabsKey) {
        try {
          const voiceUrl = await generateVoice(response.text)
          setAudioUrl(voiceUrl)

          // Play audio after a short delay
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.play().catch((err) => console.error("Error playing audio:", err))
            }
          }, 500)
        } catch (error) {
          console.error("Error generating voice:", error)
          // Fallback to browser TTS
          speakText(response.text)
        }
      } else {
        // Use browser TTS as fallback
        speakText(response.text)
      }
    } catch (error) {
      console.error("Error in fetchAIResponse:", error)
      // Set a default response even if everything fails
      const fallbackText =
        "Great job staying hydrated! Water helps your body work at its best. Try to drink water throughout the day to keep your energy up!"
      setAIResponse(fallbackText)
      speakText(fallbackText)
    } finally {
      setIsLoadingAI(false)
    }
  }

  const generateVoice = async (text: string) => {
    // This would normally call the ElevenLabs API
    // For now, we'll just return a placeholder
    return "/sample-voice.mp3"
  }

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
    } else if (aiResponse) {
      speakText(aiResponse)
    }
  }

  const handleBackToHub = () => {
    // Save progress
    const currentProgress = localStorage.getItem("hydrationProgress") || "0"
    const newProgress = Math.max(Number.parseInt(currentProgress), 1)
    localStorage.setItem("hydrationProgress", newProgress.toString())

    // Navigate back to mission hub
    router.push("/mission-hub")
  }

  if (showCompletion) {
    return (
      <MissionLayout
        title="Hydration Station"
        zoneName="Hydration Realm"
        zoneColor="blue"
        zoneIcon={<Droplet className="h-5 w-5 text-blue-500" />}
      >
        <MissionComplete
          zoneName="Hydration Realm"
          zoneColor="blue"
          missionType="hydration"
          missionName="water-tracker"
          badgeId="water-tracker"
          badgeName="Water Tracker Badge"
          score={100}
          aiResponse={aiResponse}
          factTitle="Did you know?"
          factText="Your body is about 60% water! Your brain and heart are 73% water, and your lungs are about 83% water. That's why staying hydrated is super important for your body to work properly."
          audioUrl={audioUrl}
          pointsAwarded={50}
          onPlayAudio={handlePlayAudio}
        />
      </MissionLayout>
    )
  }

  return (
    <MissionLayout
      title="Hydration Station"
      zoneName="Hydration Realm"
      zoneColor="blue"
      zoneIcon={<Droplet className="h-5 w-5 text-blue-500" />}
    >
      <Card className="border-blue-200 shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-blue-50 border-b border-blue-100">
          <CardTitle className="text-center text-blue-700">Water Tracker Adventure</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <p>Collect water droplets to fill your power meter!</p>
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="w-20 mr-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
                <Droplet className="h-10 w-10 text-blue-500" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium mb-1">Hydration Level</h3>
              <Progress value={hydrationLevel} className="h-4" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Empty</span>
                <span>Full</span>
              </div>
            </div>
          </div>

          <div
            ref={containerRef}
            className="relative bg-gradient-to-b from-blue-100 to-cyan-100 rounded-lg h-64 mb-4 overflow-hidden"
          >
            {waterDrops.map((drop) => (
              <motion.div
                key={drop.id}
                className="absolute cursor-pointer"
                style={{
                  left: `${drop.x}%`,
                  top: `${drop.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                whileHover={{ scale: 1.2 }}
                onClick={() => handleDropClick(drop.id)}
                animate={{
                  y: [0, 5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  delay: drop.id * 0.2,
                }}
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <Image
                    src="/images/water-droplet.png"
                    alt="Water Droplet"
                    width={40}
                    height={40}
                    onError={(e) => {
                      // Fallback to SVG if image fails to load
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='%2360A5FA' stroke='%232563EB' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'%3E%3Cpath d='M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z'/%3E%3C/svg%3E"
                    }}
                  />
                </div>
              </motion.div>
            ))}

            {hydrationLevel >= 100 && (
              <motion.div
                className="absolute inset-0 bg-blue-500/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
            <p className="text-center">
              {hydrationLevel < 25
                ? "Start collecting water drops to power up your hero!"
                : hydrationLevel < 50
                  ? "Good start! Your hero is beginning to feel hydrated."
                  : hydrationLevel < 75
                    ? "You're doing great! Keep going to reach full hydration."
                    : hydrationLevel < 100
                      ? "Almost there! Just a few more drops to complete your mission."
                      : "Amazing! You've fully hydrated your hero!"}
            </p>
          </div>
        </CardContent>
      </Card>
    </MissionLayout>
  )
}
