"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Flame, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useAvatarContext } from "@/contexts/avatar-context"
import { createClient } from "@/lib/supabase/client"

const QUESTIONS = [
  {
    question: "Why is water important for your body?",
    options: [
      "To make your hair grow faster",
      "To help your body stay cool and work well",
      "To change your eye color",
      "To help you jump higher",
    ],
    answer: 1,
    explanation: "Water helps your body stay at the right temperature and makes sure all your organs work properly!",
  },
  {
    question: "When should you drink water?",
    options: [
      "Only when you're running",
      "Only before bed",
      "Throughout the day, even if you're not thirsty",
      "Only with meals",
    ],
    answer: 2,
    explanation:
      "It's best to drink water throughout the day, not just when you feel thirsty. This keeps your body hydrated all day long!",
  },
  {
    question: "Which of these drinks is the best for hydration?",
    options: ["Soda", "Juice", "Water", "Milkshake"],
    answer: 2,
    explanation:
      "Water is the best choice for hydration because it has no sugar or caffeine. It's exactly what your body needs!",
  },
  {
    question: "How much water should kids drink each day?",
    options: [
      "1 small cup",
      "5-7 cups depending on age and activity",
      "As much as possible",
      "Only when feeling thirsty",
    ],
    answer: 1,
    explanation: "Kids should drink about 5-7 cups of water each day, depending on their age and how active they are!",
  },
]

// Desert guide character dialogue
const GUIDE_DIALOGUE = [
  "Welcome to the Desert Quest! I'm Sandy, your guide through this challenge!",
  "We need to test your hydration knowledge to cross the desert safely!",
  "Great job! You're learning the secrets of water wisdom!",
  "Amazing! You're becoming a true Hydration Hero!",
  "You've completed the Desert Quest! Your knowledge will help keep our realm healthy!",
]

export default function DesertQuestPage() {
  const router = useRouter()
  const { triggerReaction, showSpeech } = useAvatarContext()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [narrationText, setNarrationText] = useState(GUIDE_DIALOGUE[0])
  const [showGuide, setShowGuide] = useState(true)
  const [guideDialogue, setGuideDialogue] = useState(0)
  const [showHeatEffect, setShowHeatEffect] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    speakText(narrationText)

    // Show second dialogue after a delay
    setTimeout(() => {
      setGuideDialogue(1)
      setNarrationText(GUIDE_DIALOGUE[1])
      speakText(GUIDE_DIALOGUE[1])
    }, 4000)

    // Play desert ambient sound
    const ambientSound = new Audio("/sounds/desert-ambient.mp3")
    ambientSound.volume = 0.2
    ambientSound.loop = true
    ambientSound.play().catch((err) => console.error("Error playing ambient sound:", err))

    return () => {
      ambientSound.pause()
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.pitch = 1.1
        window.speechSynthesis.speak(utterance)
      } catch (error) {
        console.error("Error using browser speech synthesis:", error)
      }
    }
  }

  const handleAnswer = (index: number) => {
    if (answered) return

    setSelectedAnswer(index)
    setAnswered(true)

    const isCorrect = index === QUESTIONS[currentQuestion].answer

    // Play sound effect
    const sound = new Audio(isCorrect ? "/sounds/correct-answer.mp3" : "/sounds/wrong-answer.mp3")
    sound.volume = 0.5
    sound.play().catch((err) => console.error("Error playing sound:", err))

    if (isCorrect) {
      setScore((prev) => prev + 1)
      triggerReaction("celebrate")
    } else {
      triggerReaction("encourage")
    }

    // Show explanation
    setShowExplanation(true)
    speakText(QUESTIONS[currentQuestion].explanation)

    // Proceed to next question after delay
    setTimeout(() => {
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion((prev) => prev + 1)
        setAnswered(false)
        setSelectedAnswer(null)
        setShowExplanation(false)

        // Update guide dialogue based on progress
        if (currentQuestion === 1) {
          setGuideDialogue(2)
          setNarrationText(GUIDE_DIALOGUE[2])
          speakText(GUIDE_DIALOGUE[2])
        } else if (currentQuestion === 2) {
          setGuideDialogue(3)
          setNarrationText(GUIDE_DIALOGUE[3])
          speakText(GUIDE_DIALOGUE[3])
        }
      } else {
        setShowResult(true)
        setGuideDialogue(4)
        setNarrationText(GUIDE_DIALOGUE[4])
        speakText(GUIDE_DIALOGUE[4])

        // Award badge and points based on score
        const badges = JSON.parse(localStorage.getItem("badges") || "[]")
        let badgeAwarded = ""
        let pointsAwarded = 0

        if (score >= 3) {
          badgeAwarded = "hydration-expert"
          pointsAwarded = 100
        } else if (score >= 2) {
          badgeAwarded = "hydration-scholar"
          pointsAwarded = 75
        } else {
          badgeAwarded = "hydration-apprentice"
          pointsAwarded = 50
        }

        if (!badges.includes(badgeAwarded)) {
          badges.push(badgeAwarded)
          localStorage.setItem("badges", JSON.stringify(badges))

          // Update points
          const currentPoints = Number.parseInt(localStorage.getItem("points") || "0")
          localStorage.setItem("points", (currentPoints + pointsAwarded).toString())

          // Sync with database
          syncProgress(badgeAwarded, pointsAwarded)
        }
      }
    }, 3000)
  }

  const syncProgress = async (badge: string, points: number) => {
    try {
      const profileData = localStorage.getItem("heroProfile")
      if (!profileData) return

      const profile = JSON.parse(profileData)

      // Check if user exists
      const { data: existingUser } = await supabase
        .from("hero_profiles")
        .select("id, badges, points")
        .eq("hero_name", profile.heroName)
        .single()

      if (existingUser) {
        // Update existing user
        const badges = existingUser.badges || []
        if (!badges.includes(badge)) {
          badges.push(badge)
        }

        await supabase
          .from("hero_profiles")
          .update({
            badges: badges,
            points: (existingUser.points || 0) + points,
          })
          .eq("id", existingUser.id)
      }
    } catch (error) {
      console.error("Error syncing progress:", error)
      // Continue without database sync - app works offline
    }
  }

  const resetGame = () => {
    setCurrentQuestion(0)
    setScore(0)
    setAnswered(false)
    setSelectedAnswer(null)
    setShowResult(false)
    setShowExplanation(false)
    setNarrationText("Let's play again! Ready for a new challenge?")
    speakText("Let's play again! Ready for a new challenge?")
  }

  const getRewardBadge = (score: number) => {
    if (score === QUESTIONS.length) return "🏆 Hydration Expert Badge"
    if (score >= QUESTIONS.length * 0.75) return "🎖️ Hydration Scholar Badge"
    return "✨ Hydration Apprentice Badge"
  }

  const handleBackToHub = () => {
    // Cancel any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    router.push("/mission-hub")
  }

  const handleNextLevel = () => {
    // Cancel any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    // This would navigate to the next level if it existed
    router.push("/mission-hub")
  }

  return (
    <div className="min-h-screen bg-[url('/images/desert-bg.jpg')] bg-cover bg-center p-4">
      {/* Heat shimmer effect */}
      {showHeatEffect && (
        <div className="fixed inset-0 pointer-events-none z-10">
          <div
            className="absolute inset-0 bg-[url('/images/heat-shimmer.png')] bg-repeat opacity-20"
            style={{
              animation: "shimmer 2s infinite alternate",
              backgroundSize: "200% 200%",
            }}
          />
        </div>
      )}

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateY(0) scale(1.01);
          }
          100% {
            transform: translateY(-5px) scale(1);
          }
        }
      `}</style>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBackToHub} className="bg-white/80 hover:bg-white/90">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="flex items-center gap-2 bg-white/80 px-3 py-1 rounded-full">
            <Flame className="text-orange-500" />
            <h1 className="text-xl font-bold text-orange-700">Desert Quest</h1>
          </div>
        </div>

        {/* Desert Guide Character */}
        <AnimatePresence>
          {showGuide && (
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="fixed bottom-20 left-4 z-20 max-w-[250px]"
            >
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                  className="relative"
                >
                  <Image
                    src="/images/desert-guide.png"
                    alt="Sandy Guide"
                    width={100}
                    height={120}
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=120&width=100"
                    }}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-16 -right-4 bg-white rounded-lg p-2 shadow-lg max-w-[200px]"
                >
                  <div className="text-sm text-orange-700">{GUIDE_DIALOGUE[guideDialogue]}</div>
                  <div className="absolute bottom-0 right-8 w-4 h-4 bg-white transform rotate-45 translate-y-1/2"></div>
                </motion.div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-0 right-0 h-6 w-6 p-0 rounded-full bg-white/80"
                  onClick={() => setShowGuide(false)}
                >
                  ×
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center bg-white/90 backdrop-blur-sm border border-orange-300 rounded-xl py-4 px-6 shadow-md text-orange-800 font-medium">
          {narrationText}
        </div>

        {showResult ? (
          <Card className="shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-orange-50 text-center">
              <CardTitle className="text-xl text-orange-700">🌟 Quest Complete!</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{
                  scale: { duration: 0.5 },
                  rotate: { delay: 0.5, duration: 0.5 },
                }}
              >
                <Image
                  src="/images/desert-trophy.png"
                  alt="Desert Trophy"
                  width={120}
                  height={120}
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=120&width=120"
                  }}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <p className="text-lg text-green-700">
                  You got {score} out of {QUESTIONS.length} questions right!
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-r from-yellow-100 to-amber-100 p-3 rounded-lg border border-yellow-300"
              >
                <p className="text-lg font-semibold text-amber-700">{getRewardBadge(score)}</p>
              </motion.div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button className="w-full" onClick={resetGame}>
                🔁 Try Again
              </Button>
              <Button variant="outline" className="w-full" onClick={handleBackToHub}>
                🏠 Back to Hub
              </Button>
              <Button className="w-full bg-blue-500 text-white hover:bg-blue-600" onClick={handleNextLevel}>
                🌊 Continue Adventure
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-orange-50 text-center">
              <CardTitle className="text-xl text-orange-700">Hydration Challenge</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex justify-center">
                <Image
                  src="/images/water-bottle.png"
                  alt="Water Bottle"
                  width={80}
                  height={80}
                  className="mx-auto"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=80&width=80"
                  }}
                />
              </div>

              <p className="text-center text-lg font-medium text-orange-800">{QUESTIONS[currentQuestion].question}</p>

              <div className="grid gap-3">
                {QUESTIONS[currentQuestion].options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full px-4 py-3 rounded-lg text-left text-base font-medium transition ${
                      answered && idx === QUESTIONS[currentQuestion].answer
                        ? "bg-green-100 border-2 border-green-600 text-green-800"
                        : answered && idx === selectedAnswer && idx !== QUESTIONS[currentQuestion].answer
                          ? "bg-red-100 border-2 border-red-400 text-red-700"
                          : answered
                            ? "bg-white/70 border border-yellow-200 text-gray-500"
                            : "bg-white border border-yellow-200 hover:bg-yellow-50 text-gray-800"
                    }`}
                    onClick={() => handleAnswer(idx)}
                    disabled={answered}
                  >
                    {option}

                    {answered && idx === QUESTIONS[currentQuestion].answer && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-2 inline-block">
                        ✅
                      </motion.span>
                    )}

                    {answered && idx === selectedAnswer && idx !== QUESTIONS[currentQuestion].answer && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-2 inline-block">
                        ❌
                      </motion.span>
                    )}
                  </motion.button>
                ))}
              </div>

              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800"
                  >
                    <p>{QUESTIONS[currentQuestion].explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-2">
                <Progress className="h-3" value={((currentQuestion + 1) / QUESTIONS.length) * 100} />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>
                    Question {currentQuestion + 1} of {QUESTIONS.length}
                  </span>
                  <span>{Math.round(((currentQuestion + 1) / QUESTIONS.length) * 100)}% Complete</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
