"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Trophy, VolumeIcon as VolumeUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { awardBadge, recordMissionProgress } from "@/lib/db-utils"
import { speakText } from "@/lib/sound-utils"

interface MissionCompleteProps {
  zoneName: string
  zoneColor: string
  missionType: string
  missionName: string
  badgeId: string
  badgeName: string
  score: number
  maxScore?: number
  aiResponse?: string
  factTitle?: string
  factText: string
  imageUrl?: string
  audioUrl?: string
  nextMissionPath?: string
  nextMissionName?: string
  pointsAwarded: number
  onPlayAudio?: () => void
}

export function MissionComplete({
  zoneName,
  zoneColor,
  missionType,
  missionName,
  badgeId,
  badgeName,
  score,
  maxScore = 100,
  aiResponse = "",
  factTitle = "Did you know?",
  factText,
  imageUrl,
  audioUrl,
  nextMissionPath,
  nextMissionName = "Next Mission",
  pointsAwarded,
  onPlayAudio,
}: MissionCompleteProps) {
  const router = useRouter()
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [showConfetti, setShowConfetti] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Determine background and text colors based on zone color
  const bgColorClass =
    zoneColor === "blue"
      ? "bg-blue-50"
      : zoneColor === "green"
        ? "bg-green-50"
        : zoneColor === "orange"
          ? "bg-orange-50"
          : zoneColor === "purple"
            ? "bg-purple-50"
            : "bg-gray-50"

  const textColorClass =
    zoneColor === "blue"
      ? "text-blue-800"
      : zoneColor === "green"
        ? "text-green-800"
        : zoneColor === "orange"
          ? "text-orange-800"
          : zoneColor === "purple"
            ? "text-purple-800"
            : "text-gray-800"

  const buttonColorClass =
    zoneColor === "blue"
      ? "bg-blue-500 hover:bg-blue-600"
      : zoneColor === "green"
        ? "bg-green-500 hover:bg-green-600"
        : zoneColor === "orange"
          ? "bg-orange-500 hover:bg-orange-600"
          : zoneColor === "purple"
            ? "bg-purple-500 hover:bg-purple-600"
            : "bg-gray-500 hover:bg-gray-600"

  const badgeColorClass =
    zoneColor === "blue"
      ? "bg-blue-600"
      : zoneColor === "green"
        ? "bg-green-600"
        : zoneColor === "orange"
          ? "bg-orange-600"
          : zoneColor === "purple"
            ? "bg-purple-600"
            : "bg-gray-600"

  useEffect(() => {
    // Award badge and record progress
    awardBadge(badgeId, pointsAwarded)
    recordMissionProgress(missionType, missionName, score, true)

    // Speak AI response if available
    if (aiResponse && !audioUrl) {
      speakText(aiResponse)
    }

    // Clean up confetti after a delay
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)

    return () => {
      clearTimeout(timer)
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [aiResponse, audioUrl, badgeId, missionName, missionType, pointsAwarded, score])

  const handlePlayAudio = () => {
    if (onPlayAudio) {
      onPlayAudio()
    } else if (audioRef.current) {
      audioRef.current.play().catch((err) => console.error("Error playing audio:", err))
    } else if (aiResponse) {
      speakText(aiResponse)
    }
  }

  const handleBackToHub = () => {
    router.push("/mission-hub")
  }

  const handleNextMission = () => {
    if (nextMissionPath) {
      router.push(nextMissionPath)
    } else {
      router.push("/mission-hub")
    }
  }

  return (
    <Card className="border-gray-200 shadow-lg bg-white/95 backdrop-blur-sm">
      <CardHeader className={`${bgColorClass} border-b border-gray-200`}>
        <CardTitle className={`text-center ${textColorClass} flex items-center justify-center gap-2`}>
          <Trophy className="h-5 w-5 text-yellow-500" /> Mission Complete!
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
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

        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={imageUrl || "/placeholder.svg?height=120&width=120"}
              alt={`${zoneName} Completion`}
              width={120}
              height={120}
              className="rounded-full bg-gray-100 p-2"
            />
          </motion.div>
        </div>

        <div className={`${bgColorClass} rounded-lg p-4 mb-6 relative`}>
          {isLoadingAI ? (
            <div className="flex items-center justify-center py-4">
              <div className={`animate-spin h-8 w-8 border-2 border-b-0 rounded-full border-${zoneColor}-500`}></div>
            </div>
          ) : (
            <>
              <p className={`text-center ${textColorClass}`}>{aiResponse}</p>
              <button
                onClick={handlePlayAudio}
                className={`absolute top-2 right-2 p-1 rounded-full bg-${zoneColor}-100 hover:bg-${zoneColor}-200 transition-colors`}
              >
                <VolumeUp className={`h-4 w-4 text-${zoneColor}-600`} />
              </button>
              {audioUrl && <audio ref={audioRef} src={audioUrl} />}
            </>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-yellow-800 mb-2">{factTitle}</h3>
          <p className="text-sm text-yellow-700">{factText}</p>
        </div>

        <motion.div
          className="flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <div
            className={`${badgeColorClass} text-white rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2`}
          >
            <Trophy className="h-4 w-4" /> You earned: {badgeName}!
          </div>
        </motion.div>
      </CardContent>

      <CardFooter className={`border-t border-gray-200 pt-4 flex flex-col sm:flex-row gap-2`}>
        <Button className="w-full" variant="outline" onClick={handleBackToHub}>
          Return to Mission Hub
        </Button>

        {nextMissionPath && (
          <Button className={`w-full ${buttonColorClass} text-white`} onClick={handleNextMission}>
            Continue to {nextMissionName}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
