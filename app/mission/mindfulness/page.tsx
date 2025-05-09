"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Moon, ArrowLeft, VolumeIcon as VolumeUp, Trophy } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { generateAIResponse } from "@/lib/ai-service"

export default function MindfulnessMissionPage() {
  const router = useRouter()
  const [heroProfile, setHeroProfile] = useState<any>(null)
  const [calmLevel, setCalmLevel] = useState(0)
  const [breathCount, setBreathCount] = useState(0)
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("rest")
  const [bubbleSize, setBubbleSize] = useState(100)
  const [showCompletion, setShowCompletion] = useState(false)
  const [aiResponse, setAIResponse] = useState("")
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [audioUrl, setAudioUrl] = useState("")
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Load hero profile from localStorage
    const profileData = localStorage.getItem("heroProfile")
    if (profileData) {
      setHeroProfile(JSON.parse(profileData))
    }

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }
  }, [])

  const startBreathingExercise = () => {
    // Start with inhale
    setBreathPhase("inhale")

    // Inhale animation (4 seconds)
    setBubbleSize(100)
    const inhaleAnimation = () => {
      setBubbleSize((prev) => Math.min(prev + 5, 200))
    }
    const inhaleInterval = setInterval(inhaleAnimation, 100)

    // After 4 seconds, hold breath
    setTimeout(() => {
      clearInterval(inhaleInterval)
      setBreathPhase("hold")

      // After 4 seconds, exhale
      setTimeout(() => {
        setBreathPhase("exhale")

        // Exhale animation (6 seconds)
        const exhaleAnimation = () => {
          setBubbleSize((prev) => Math.max(prev - 4, 100))
        }
        const exhaleInterval = setInterval(exhaleAnimation, 100)

        // After 6 seconds, rest and prepare for next breath
        setTimeout(() => {
          clearInterval(exhaleInterval)
          setBreathPhase("rest")

          // Increase breath count and calm level
          setBreathCount((prev) => {
            const newCount = prev + 1

            // Update calm level (20% per breath)
            setCalmLevel((prev) => {
              const newLevel = Math.min(prev + 20, 100)

              // If we've reached 100%, show completion after a delay
              if (newLevel >= 100 && newCount >= 5) {
                animationRef.current = setTimeout(() => {
                  setShowCompletion(true)
                  fetchAIResponse()
                }, 1000)
              } else if (newCount < 5) {
                // Start next breath after a short rest
                animationRef.current = setTimeout(startBreathingExercise, 2000)
              }

              return newLevel
            })

            return newCount
          })
        }, 6000)
      }, 4000)
    }, 4000)
  }

  const fetchAIResponse = async () => {
    setIsLoadingAI(true)
    try {
      // Get the AI response
      const response = await generateAIResponse(heroProfile, "mindfulness", "breathing bubbles")
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
        "Great job with your breathing practice! Taking deep breaths helps your body and mind feel calm and peaceful. You can use this anytime you feel worried or need to relax."
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
    const currentProgress = localStorage.getItem("mindfulnessProgress") || "0"
    const newProgress = Math.max(Number.parseInt(currentProgress), 1)
    localStorage.setItem("mindfulnessProgress", newProgress.toString())

    // Navigate back to mission hub
    router.push("/mission-hub")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-indigo-50 p-4">
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
            <Moon className="h-5 w-5 text-purple-500" />
            <h1 className="text-xl font-bold text-purple-700">Rest & Mindful Island</h1>
          </div>
        </div>

        {showCompletion ? (
          <Card className="border-purple-200 shadow-lg">
            <CardHeader className="bg-purple-50 border-b border-purple-100">
              <CardTitle className="text-center text-purple-700 flex items-center justify-center gap-2">
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
                    alt="Mindfulness Hero"
                    width={120}
                    height={120}
                    className="rounded-full bg-purple-100 p-2"
                  />
                </motion.div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 mb-6 relative">
                {isLoadingAI ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-purple-800 text-center">{aiResponse}</p>
                    <button
                      onClick={handlePlayAudio}
                      className="absolute top-2 right-2 p-1 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors"
                    >
                      <VolumeUp className="h-4 w-4 text-purple-600" />
                    </button>
                    {audioUrl && <audio ref={audioRef} src={audioUrl} />}
                  </>
                )}
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-indigo-800 mb-2">Did you know?</h3>
                <p className="text-sm text-indigo-700">
                  Deep breathing sends a message to your brain to calm down and relax. When you breathe deeply, it helps
                  lower your heart rate, blood pressure, and helps you feel more peaceful. It's like a superpower you
                  can use anytime!
                </p>
              </div>

              <div className="flex justify-center">
                <div className="bg-purple-600 text-white rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  You earned: Breathing Bubbles Badge!
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-purple-100 pt-4">
              <Button className="w-full bg-purple-500 hover:bg-purple-600" onClick={handleBackToHub}>
                Back to Mission Hub
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border-purple-200 shadow-lg">
            <CardHeader className="bg-purple-50 border-b border-purple-100">
              <CardTitle className="text-center text-purple-700">Breathing Bubbles</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <p>Follow the bubble to practice calm breathing!</p>
              </div>

              <div className="flex items-center justify-center mb-6">
                <div className="w-20 mr-4">
                  <Image
                    src="/placeholder.svg?height=80&width=80"
                    alt="Hero Avatar"
                    width={80}
                    height={80}
                    className="rounded-full bg-gradient-to-r from-purple-100 to-indigo-100"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium mb-1">Calm Power</h3>
                  <Progress value={calmLevel} className="h-4" />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Busy Mind</span>
                    <span>Peaceful</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="bg-indigo-50 rounded-lg p-4 mb-4 flex flex-col items-center justify-center min-h-[300px]">
                  {breathPhase === "rest" && breathCount === 0 ? (
                    <div className="text-center">
                      <p className="mb-4 text-indigo-700">Ready to start your breathing practice?</p>
                      <Button onClick={startBreathingExercise} className="bg-purple-500 hover:bg-purple-600">
                        Begin Breathing
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 text-center">
                        <h3 className="font-medium text-indigo-700">
                          {breathPhase === "inhale"
                            ? "Breathe In..."
                            : breathPhase === "hold"
                              ? "Hold..."
                              : breathPhase === "exhale"
                                ? "Breathe Out..."
                                : "Get Ready..."}
                        </h3>
                        <p className="text-sm text-indigo-600 mt-1">Breath {breathCount + 1} of 5</p>
                      </div>

                      <motion.div
                        animate={{
                          scale: breathPhase === "rest" ? 1 : undefined,
                        }}
                        className="relative flex items-center justify-center"
                        style={{
                          width: `${bubbleSize}px`,
                          height: `${bubbleSize}px`,
                          transition: "width 0.1s, height 0.1s",
                        }}
                      >
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background:
                              "radial-gradient(circle, rgba(167,139,250,0.5) 0%, rgba(139,92,246,0.3) 70%, rgba(124,58,237,0.1) 100%)",
                            boxShadow: "0 0 20px rgba(167,139,250,0.3)",
                          }}
                        ></div>
                        <div className="text-purple-700 font-medium">
                          {breathPhase === "inhale"
                            ? "In"
                            : breathPhase === "hold"
                              ? "Hold"
                              : breathPhase === "exhale"
                                ? "Out"
                                : ""}
                        </div>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-3 text-sm text-purple-700">
                <p className="text-center">
                  {breathPhase === "rest" && breathCount === 0
                    ? "Click 'Begin Breathing' to start your mindfulness practice!"
                    : breathCount < 2
                      ? "Great start! Follow the bubble as it grows and shrinks."
                      : breathCount < 4
                        ? "You're doing wonderfully! Keep breathing with the bubble."
                        : "Almost there! One more deep breath to complete your practice."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
