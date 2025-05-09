"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Droplet, ArrowLeft, VolumeIcon as VolumeUp, Trophy } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { generateAIResponse } from "@/lib/ai-service"
import { useAvatarContext } from "@/contexts/avatar-context"

export default function WaterTrackerMissionPage() {
  const router = useRouter()
  const { avatarState, triggerReaction, showSpeech } = useAvatarContext()
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

    // Cleanup function
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

    // Trigger avatar drinking animation
    triggerReaction("drinking")
    showSpeech("Mmm, refreshing water!")

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

          // Trigger celebration animation
          triggerReaction("celebrate")
          showSpeech("Woohoo! I'm fully hydrated!")
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
          speakWithBrowserTTS(response.text)
        }
      } else {
        // Use browser TTS as fallback
        speakWithBrowserTTS(response.text)
      }
    } catch (error) {
      console.error("Error in fetchAIResponse:", error)
      // Set a default response even if everything fails
      const fallbackText =
        "Great job staying hydrated! Water helps your body work at its best. Try to drink water throughout the day to keep your energy up!"
      setAIResponse(fallbackText)
      speakWithBrowserTTS(fallbackText)
    } finally {
      setIsLoadingAI(false)
    }
  }

  const generateVoice = async (text: string) => {
    // This would normally call the ElevenLabs API
    // For now, we'll just return a placeholder
    return "/sample-voice.mp3"
  }

  const speakWithBrowserTTS = (text: string) => {
    if ("speechSynthesis" in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.pitch = 1.1
        window.speechSynthesis.speak(utterance)
      } catch (error) {
        console.error("Error using browser speech synthesis:", error)
      }
    }
  }

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
    } else if (aiResponse) {
      speakWithBrowserTTS(aiResponse)
    }
  }

  const handleBackToHub = () => {
    // Save progress
    const currentProgress = localStorage.getItem("hydrationProgress") || "0"
    const newProgress = Math.max(Number.parseInt(currentProgress), 1)
    localStorage.setItem("hydrationProgress", newProgress.toString())

    // Add water badge to avatar accessories if not already there
    const avatarData = localStorage.getItem("heroAvatar")
    if (avatarData) {
      const avatar = JSON.parse(avatarData)
      if (!avatar.accessories.includes("water-badge")) {
        avatar.accessories.push("water-badge")
        localStorage.setItem("heroAvatar", JSON.stringify(avatar))
      }
    }

    // Navigate back to mission hub
    router.push("/mission-hub")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50 p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => router.push("/mission-hub")}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Hub
          </Button>
          <div className="flex items-center gap-2">
            <Droplet className="h-5 w-5 text-blue-500" />
            <h1 className="text-xl font-bold text-blue-700">Water Tracker Adventure</h1>
          </div>
        </div>

        {showCompletion ? (
          <Card className="border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <CardTitle className="text-center text-blue-700 flex items-center justify-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Mission Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Image
                    src="/placeholder.svg?height=120&width=120"
                    alt="Hydration Hero"
                    width={120}
                    height={120}
                    className="rounded-full bg-blue-100 p-2"
                  />
                </motion.div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6 relative">
                {isLoadingAI ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-blue-800 text-center">{aiResponse}</p>
                    <button
                      onClick={handlePlayAudio}
                      className="absolute top-2 right-2 p-1 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                    >
                      <VolumeUp className="h-4 w-4 text-blue-600" />
                    </button>
                    {audioUrl && <audio ref={audioRef} src={audioUrl} />}
                  </>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-yellow-800 mb-2">Did you know?</h3>
                <p className="text-sm text-yellow-700">
                  Your body is about 60% water! Your brain and heart are 73% water, and your lungs are about 83% water.
                  That's why staying hydrated is super important for your body to work properly.
                </p>
              </div>

              <div className="flex justify-center">
                <div className="bg-blue-600 text-white rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  You earned: Water Tracker Badge!
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-blue-100 pt-4">
              <Button className="w-full bg-blue-500 hover:bg-blue-600" onClick={handleBackToHub}>
                Back to Mission Hub
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border-blue-200 shadow-lg">
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <CardTitle className="text-center text-blue-700">Water Tracker Adventure</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <p>Collect water droplets to fill your power meter!</p>
              </div>

              <div className="flex items-center justify-center mb-6">
                <div className="w-20 mr-4">
                  <Image
                    src="/placeholder.svg?height=80&width=80"
                    alt="Hero Avatar"
                    width={80}
                    height={80}
                    className="rounded-full bg-gradient-to-r from-blue-100 to-cyan-100"
                  />
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
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="#60A5FA" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
                          strokeWidth="2"
                          stroke="#2563EB"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
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
        )}
      </div>
    </div>
  )
}
