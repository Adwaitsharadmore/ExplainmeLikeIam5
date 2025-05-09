"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Brain, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAvatarContext } from "@/contexts/avatar-context"
import { awardBadge, recordMissionProgress } from "@/lib/db-utils"
import { playSound, speakText, stopAllSounds } from "@/lib/sound-utils"
import { MissionLayout } from "@/components/mission-layout"
import { MissionComplete } from "@/components/mission-complete"
import { generateAIResponse } from "@/lib/ai-service"

// Quiz questions
const QUESTIONS = [
  {
    id: "q1",
    question: "Which of these helps your body stay hydrated?",
    options: [
      { id: "a", text: "Water", isCorrect: true },
      { id: "b", text: "Soda", isCorrect: false },
      { id: "c", text: "Candy", isCorrect: false },
    ],
    zone: "hydration",
  },
  {
    id: "q2",
    question: "Which food group gives you energy to move and play?",
    options: [
      { id: "a", text: "Candy", isCorrect: false },
      { id: "b", text: "Fruits and vegetables", isCorrect: true },
      { id: "c", text: "Ice cream", isCorrect: false },
    ],
    zone: "nutrition",
  },
  {
    id: "q3",
    question: "What helps your muscles grow stronger?",
    options: [
      { id: "a", text: "Watching TV", isCorrect: false },
      { id: "b", text: "Playing video games", isCorrect: false },
      { id: "c", text: "Exercise and movement", isCorrect: true },
    ],
    zone: "movement",
  },
  {
    id: "q4",
    question: "What can help you feel calm when you're upset?",
    options: [
      { id: "a", text: "Taking deep breaths", isCorrect: true },
      { id: "b", text: "Yelling", isCorrect: false },
      { id: "c", text: "Eating candy", isCorrect: false },
    ],
    zone: "mindfulness",
  },
  {
    id: "q5",
    question: "What's the best way to stay healthy?",
    options: [
      { id: "a", text: "Only drinking water", isCorrect: false },
      { id: "b", text: "Only exercising", isCorrect: false },
      { id: "c", text: "Balancing all wellness zones", isCorrect: true },
    ],
    zone: "mystery",
  },
]

export default function WisdomChallengePage() {
  const router = useRouter()
  const { triggerReaction, showSpeech } = useAvatarContext()
  const [heroProfile, setHeroProfile] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [showCompletion, setShowCompletion] = useState(false)
  const [aiResponse, setAIResponse] = useState("")

  useEffect(() => {
    // Load hero profile from localStorage
    const profileData = localStorage.getItem("heroProfile")
    if (profileData) {
      setHeroProfile(JSON.parse(profileData))
    }

    // Play mystery ambient sound
    const music = playSound("/sounds/mystery-ambient.mp3", 0.3, true)

    // Show welcome message
    showSpeech("Welcome to the Wellness Wisdom Challenge! Test your knowledge about all health zones!")
    speakText("Welcome to the Wellness Wisdom Challenge! Test your knowledge about all health zones!")

    // Clean up on unmount
    return () => {
      if (music) music.pause()
      stopAllSounds()
    }
  }, [showSpeech])

  const handleOptionSelect = (optionId: string) => {
    if (isAnswered) return

    setSelectedOption(optionId)
    setIsAnswered(true)

    const currentQ = QUESTIONS[currentQuestion]
    const selectedOpt = currentQ.options.find((opt) => opt.id === optionId)

    if (selectedOpt?.isCorrect) {
      // Correct answer
      playSound("/sounds/correct-answer.mp3", 0.5)
      setScore((prev) => prev + 20)
      showSpeech("Correct! Great job!")
      triggerReaction("celebrate")
    } else {
      // Wrong answer
      playSound("/sounds/wrong-answer.mp3", 0.5)
      showSpeech("Not quite right. Let's try the next one!")
      triggerReaction("thinking")
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion((prev) => prev + 1)
        setSelectedOption(null)
        setIsAnswered(false)
      } else {
        // Quiz completed
        completeChallenge()
      }
    }, 2000)
  }

  const completeChallenge = async () => {
    // Award badge based on score
    if (score >= 60) {
      awardBadge("wisdom-master", 150)
      recordMissionProgress("mystery", "wisdom-challenge", score, true)

      // Get AI response
      try {
        const response = await generateAIResponse(heroProfile, "mystery", "wisdom challenge")
        setAIResponse(response.text)
      } catch (error) {
        console.error("Error getting AI response:", error)
        setAIResponse(
          `Great job, ${heroProfile?.heroName || "hero"}! You've shown amazing knowledge about wellness. Keep learning and growing stronger in all areas of health!`,
        )
      }

      // Show completion screen
      setShowCompletion(true)
    } else {
      // Not enough correct answers
      showSpeech("You need at least 3 correct answers to earn the badge. Let's try again!")
      triggerReaction("sad")

      // Reset quiz after delay
      setTimeout(() => {
        setCurrentQuestion(0)
        setSelectedOption(null)
        setIsAnswered(false)
        setScore(0)
      }, 3000)
    }
  }

  if (showCompletion) {
    return (
      <MissionLayout
        title="Wellness Wisdom Challenge"
        zoneName="Mystery Zone"
        zoneColor="yellow"
        zoneIcon={<Brain className="h-5 w-5 text-yellow-500" />}
        backgroundImage="/images/mystery-zone-bg.png"
        ambientSound="/sounds/mystery-ambient.mp3"
      >
        <MissionComplete
          zoneName="Mystery Zone"
          zoneColor="yellow"
          missionType="mystery"
          missionName="wisdom-challenge"
          badgeId="wisdom-master"
          badgeName="Wisdom Master Badge"
          score={score}
          maxScore={100}
          aiResponse={aiResponse}
          factTitle="Amazing Achievement!"
          factText="By mastering knowledge from all wellness zones, you're becoming a true Wellness Champion! The wisest heroes know that balance is the key to health and happiness."
          imageUrl="/images/mystery-badge.png"
          pointsAwarded={150}
          nextMissionPath="/mission-hub"
          nextMissionName="Mission Hub"
        />
      </MissionLayout>
    )
  }

  return (
    <MissionLayout
      title="Wellness Wisdom Challenge"
      zoneName="Mystery Zone"
      zoneColor="yellow"
      zoneIcon={<Brain className="h-5 w-5 text-yellow-500" />}
      backgroundImage="/images/mystery-zone-bg.png"
      ambientSound="/sounds/mystery-ambient.mp3"
    >
      <Card className="bg-white/90 backdrop-blur-sm border-amber-200 shadow-xl mb-6">
        <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 border-b border-amber-200">
          <CardTitle className="text-center text-amber-800 flex items-center justify-center gap-2">
            <Brain className="h-5 w-5 text-amber-500" /> Question {currentQuestion + 1} of {QUESTIONS.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-center mb-6">
            <div className="bg-amber-50 rounded-full p-2 w-16 h-16 flex items-center justify-center">
              <Image
                src={`/images/${QUESTIONS[currentQuestion].zone}-icon.png`}
                alt={QUESTIONS[currentQuestion].zone}
                width={40}
                height={40}
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                }}
              />
            </div>
          </div>

          <h3 className="text-lg font-medium text-center mb-6">{QUESTIONS[currentQuestion].question}</h3>

          <div className="space-y-3">
            {QUESTIONS[currentQuestion].options.map((option) => (
              <motion.div
                key={option.id}
                whileHover={{ scale: isAnswered ? 1 : 1.02 }}
                whileTap={{ scale: isAnswered ? 1 : 0.98 }}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  isAnswered
                    ? option.isCorrect
                      ? "bg-green-100 border-green-400"
                      : selectedOption === option.id
                        ? "bg-red-100 border-red-400"
                        : "bg-white border-gray-200"
                    : "bg-white border-amber-200 hover:bg-amber-50"
                }`}
                onClick={() => handleOptionSelect(option.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-lg font-medium w-8">{option.id.toUpperCase()}.</div>
                  <div className="flex-1">{option.text}</div>
                  {isAnswered && (
                    <div className="ml-auto">
                      {option.isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        selectedOption === option.id && <XCircle className="h-6 w-6 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t border-amber-200 pt-4">
          <div className="w-full flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Score: {score}/{QUESTIONS.length * 20}
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/mission/mystery")}
              className="border-amber-300 text-amber-700"
            >
              Back to Mystery Zone
            </Button>
          </div>
        </CardFooter>
      </Card>
    </MissionLayout>
  )
}
