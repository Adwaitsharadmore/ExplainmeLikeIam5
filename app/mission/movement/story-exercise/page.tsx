"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, VolumeIcon as VolumeUp, Trophy } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useAvatarContext } from "@/contexts/avatar-context"
import { generateStoryWithExercises, generateVoice } from "@/lib/ai-helpers"

export default function StoryExerciseMissionPage() {
  const router = useRouter()
  const { triggerReaction, showSpeech } = useAvatarContext()
  const [heroProfile, setHeroProfile] = useState<any>(null)
  const [story, setStory] = useState<string[]>([])
  const [exercises, setExercises] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [audioUrls, setAudioUrls] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCompletion, setShowCompletion] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Load hero profile from localStorage
    const profileData = localStorage.getItem("heroProfile")
    if (profileData) {
      setHeroProfile(JSON.parse(profileData))
      generateMissionStory(JSON.parse(profileData))
    } else {
      generateMissionStory(null)
    }

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  const generateMissionStory = async (profile: any) => {
    setIsLoading(true)
    try {
      // Generate a 5-part story with exercise prompts
      const { storyPages, exercisePrompts } = await generateStoryWithExercises({
        childAge: profile?.age ? Number(profile.age) : 8,
        interests: profile?.interests || ["adventure"],
        difficulty: "easy",
      })

      setStory(storyPages)
      setExercises(exercisePrompts)

      // Generate audio for first page
      if (storyPages.length > 0) {
        const audioUrl = await generateVoice(storyPages[0])
        const urls = [audioUrl]
        setAudioUrls(urls)

        // Play audio after a short delay
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play().catch((err) => console.error("Error playing audio:", err))
          }
        }, 500)
      }
    } catch (error) {
      console.error("Error generating story:", error)
      // Fallback story
      setStory([
        "Once upon a time, there was a brave explorer in the jungle.",
        "The explorer found a tiger! Can you roar and move like a tiger?",
        "Next, the explorer had to cross a river by jumping on stones.",
        "Finally, the explorer found a treasure and did a happy dance!",
        "The end! You did amazing exercises just like a real explorer!",
      ])
      setExercises([
        "Roar and move like a tiger!",
        "Jump 5 times like crossing a river!",
        "Do a happy dance!",
        "Take a big stretch to celebrate!",
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleNextPage = async () => {
    if (currentPage < story.length - 1) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)

      // If this page has an exercise, show the avatar doing it
      if (exercises[currentPage]) {
        triggerReaction("exercise")
        showSpeech(exercises[currentPage])
      }

      // Generate audio for this page if not already generated
      if (!audioUrls[nextPage] && story[nextPage]) {
        try {
          const audioUrl = await generateVoice(story[nextPage])
          setAudioUrls((prev) => {
            const newUrls = [...prev]
            newUrls[nextPage] = audioUrl
            return newUrls
          })

          // Play audio after a short delay
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.play().catch((err) => console.error("Error playing audio:", err))
            }
          }, 500)
        } catch (error) {
          console.error("Error generating audio:", error)
        }
      } else if (audioUrls[nextPage]) {
        // Play existing audio
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play().catch((err) => console.error("Error playing audio:", err))
          }
        }, 500)
      }
    } else {
      // Story completed
      setShowCompletion(true)
      triggerReaction("celebrate")
      showSpeech("We did it! Great job with all the exercises!")

      // Save progress
      const currentProgress = localStorage.getItem("movementProgress") || "0"
      const newProgress = Math.max(Number.parseInt(currentProgress), 1)
      localStorage.setItem("movementProgress", newProgress.toString())

      // Add story exercise badge to avatar accessories if not already there
      const avatarData = localStorage.getItem("heroAvatar")
      if (avatarData) {
        const avatar = JSON.parse(avatarData)
        if (!avatar.accessories.includes("story-exercise-badge")) {
          avatar.accessories.push("story-exercise-badge")
          localStorage.setItem("heroAvatar", JSON.stringify(avatar))
        }
      }
    }
  }

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => console.error("Error playing audio:", err))
    }
  }

  const handleBackToHub = () => {
    router.push("/mission-hub")
  }

  const handleNewAdventure = () => {
    setCurrentPage(0)
    setShowCompletion(false)
    setAudioUrls([])
    generateMissionStory(heroProfile)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4 text-orange-700">Creating your adventure story...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50 p-4">
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
            <h1 className="text-xl font-bold text-orange-700">Story Exercise Adventure</h1>
          </div>
        </div>

        {showCompletion ? (
          <Card className="border-orange-200 shadow-lg">
            <CardHeader className="bg-orange-50 border-b border-orange-100">
              <CardTitle className="text-center text-orange-700 flex items-center justify-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Adventure Complete!
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
                    alt="Story Exercise Hero"
                    width={120}
                    height={120}
                    className="rounded-full bg-orange-100 p-2"
                  />
                </motion.div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 mb-6">
                <p className="text-orange-800 text-center">
                  You did all the exercises in the story! You're amazing! Your body got stronger and you had fun at the
                  same time.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-yellow-800 mb-2">Did you know?</h3>
                <p className="text-sm text-yellow-700">
                  Moving your body in different ways helps different muscles grow strong. When you pretend to be animals
                  or characters, you're exercising in fun ways that help your body and imagination!
                </p>
              </div>

              <div className="flex justify-center">
                <div className="bg-orange-600 text-white rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  You earned: Story Adventurer Badge!
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-orange-100 pt-4 flex gap-2">
              <Button className="flex-1 bg-orange-500 hover:bg-orange-600" onClick={handleNewAdventure}>
                New Adventure
              </Button>
              <Button className="flex-1 bg-orange-500 hover:bg-orange-600" onClick={handleBackToHub}>
                Back to Mission Hub
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border-orange-200 shadow-lg">
            <CardHeader className="bg-orange-50 border-b border-orange-100">
              <CardTitle className="text-center text-orange-700">Story Exercise Adventure</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6">
                <div className="bg-orange-100 rounded-lg p-6">
                  <div className="story-content mb-4">
                    <p className="text-lg text-center mb-4">{story[currentPage]}</p>

                    {exercises[currentPage] && (
                      <motion.div
                        className="exercise-prompt bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-center my-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <span className="font-bold">Let's move!</span> {exercises[currentPage]}
                      </motion.div>
                    )}
                  </div>

                  <div className="flex justify-center mb-4">
                    <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handlePlayAudio}>
                      <VolumeUp className="h-4 w-4" /> Listen Again
                    </Button>
                    {audioUrls[currentPage] && <audio ref={audioRef} src={audioUrls[currentPage]} />}
                  </div>

                  <div className="story-progress flex justify-center gap-2 mb-4">
                    {story.map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                          index === currentPage
                            ? "bg-orange-500"
                            : index < currentPage
                              ? "bg-orange-300"
                              : "bg-orange-100 border border-orange-300"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex justify-center">
                    <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleNextPage}>
                      {currentPage < story.length - 1 ? "Next Page" : "Finish Story"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-3 text-sm text-orange-700">
                <p className="text-center">
                  Follow along with the story and do the exercises when they appear. Have fun moving your body!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
