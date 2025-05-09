"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Play, Pause } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { generateAIResponse } from "@/lib/ai-service";
import { MissionLayout } from "@/components/mission-layout";
import { MissionComplete } from "@/components/mission-complete";
import { playSound, speakText, stopAllSounds } from "@/lib/sound-utils";

// Animal moves for the game
const ANIMAL_MOVES = [
  {
    id: "frog",
    name: "Frog Jumps",
    image: "/images/frog.png",
    instructions: "Squat down and jump forward like a frog!",
    duration: 15,
  },
  {
    id: "crab",
    name: "Crab Walk",
    image: "/images/crab.jpg",
    instructions:
      "Sit down, put your hands behind you, lift your hips and walk like a crab!",
    duration: 15,
  },
];

export default function MovementMissionPage() {
  const router = useRouter();
  const [heroProfile, setHeroProfile] = useState<any>(null);
  const [energyLevel, setEnergyLevel] = useState(0);
  const [currentMove, setCurrentMove] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ANIMAL_MOVES[0].duration);
  const [showCompletion, setShowCompletion] = useState(false);
  const [aiResponse, setAIResponse] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load hero profile from localStorage
    const profileData = localStorage.getItem("heroProfile");
    if (profileData) {
      setHeroProfile(JSON.parse(profileData));
    }

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopAllSounds();
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Move is complete
            clearInterval(timerRef.current!);
            setIsPlaying(false);

            // Play completion sound
            playSound("/sounds/correct-answer.mp3", 0.4);

            // Increase energy level
            setEnergyLevel((prev) => {
              const newLevel = Math.min(prev + 25, 100);
              return newLevel;
            });

            // Check if all moves are complete
            if (currentMove < ANIMAL_MOVES.length - 1) {
              // Move to next animal move after a delay
              setTimeout(() => {
                setCurrentMove((prev) => prev + 1);
                setTimeLeft(ANIMAL_MOVES[currentMove + 1].duration);
              }, 1000);
            } else {
              // All moves completed
              setTimeout(() => {
                setShowCompletion(true);
                fetchAIResponse();
              }, 1000);
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [isPlaying, currentMove]);

  const togglePlay = () => {
    setIsPlaying((prev) => {
      if (!prev) {
        // Play start sound when starting
        playSound("/sounds/click.mp3", 0.4);
      }
      return !prev;
    });
  };

  const fetchAIResponse = async () => {
    setIsLoadingAI(true);
    try {
      // Get the AI response
      const response = await generateAIResponse(
        heroProfile,
        "physical activity",
        "animal moves"
      );
      setAIResponse(response.text);

      // Generate voice if ElevenLabs API key is available
      const elevenLabsKey = localStorage.getItem("elevenLabsApiKey");
      if (elevenLabsKey) {
        try {
          const voiceUrl = await generateVoice(response.text);
          setAudioUrl(voiceUrl);

          // Play audio after a short delay
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current
                .play()
                .catch((err) => console.error("Error playing audio:", err));
            }
          }, 500);
        } catch (error) {
          console.error("Error generating voice:", error);
          // Fallback to browser TTS
          speakText(response.text);
        }
      } else {
        // Use browser TTS as fallback
        speakText(response.text);
      }
    } catch (error) {
      console.error("Error in fetchAIResponse:", error);
      // Set a default response even if everything fails
      const fallbackText =
        "Great job moving your body like different animals! Moving in different ways helps your muscles grow strong and keeps your heart healthy.";
      setAIResponse(fallbackText);
      speakText(fallbackText);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const generateVoice = async (text: string) => {
    // This would normally call the ElevenLabs API
    // For now, we'll just return a placeholder
    return "/sample-voice.mp3";
  };

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
    } else if (aiResponse) {
      speakText(aiResponse);
    }
  };

  const handleBackToHub = () => {
    // Save progress
    const currentProgress = localStorage.getItem("movementProgress") || "0";
    const newProgress = Math.max(Number.parseInt(currentProgress), 1);
    localStorage.setItem("movementProgress", newProgress.toString());

    // Navigate back to mission hub
    router.push("/mission-hub");
  };

  // Add a type guard before accessing currentMove
  const currentMoveData = ANIMAL_MOVES[currentMove] || ANIMAL_MOVES[0];

  if (showCompletion) {
    return (
      <MissionLayout
        title="Movement Galaxy"
        zoneName="Movement Galaxy"
        zoneColor="orange"
        zoneIcon={<Activity className="h-5 w-5 text-orange-500" />}
        backgroundImage="/images/movement-bg.png"
      >
        <MissionComplete
          zoneName="Movement Galaxy"
          zoneColor="orange"
          missionType="movement"
          missionName="animal-moves"
          badgeId="animal-moves"
          badgeName="Animal Moves Badge"
          score={100}
          aiResponse={aiResponse}
          factTitle="Did you know?"
          factText="Moving like animals is not just fun - it helps develop different muscles in your body! Frog jumps build leg strength, bear crawls work your arms and core, crab walks strengthen your shoulders, and elephant stomps improve balance."
          imageUrl="/images/movement-badge.png"
          audioUrl={audioUrl}
          pointsAwarded={50}
          onPlayAudio={handlePlayAudio}
        />
      </MissionLayout>
    );
  }

  return (
    <MissionLayout
      title="Movement Galaxy"
      zoneName="Movement Galaxy"
      zoneColor="orange"
      zoneIcon={<Activity className="h-5 w-5 text-orange-500" />}
      backgroundImage="/images/movement-bg.png"
    >
      <Card className="border-orange-200 shadow-lg bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-orange-50 border-b border-orange-100">
          <CardTitle className="text-center text-orange-700">
            Animal Moves
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <p>Mimic animal movements to boost your energy!</p>
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="w-20 mr-4">
              <Image
                src="/images/hero-avatar.png"
                alt="Hero Avatar"
                width={80}
                height={80}
                className="rounded-full bg-gradient-to-r from-orange-100 to-yellow-100"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=80&width=80";
                }}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium mb-1">Energy Level</h3>
              <Progress value={energyLevel} className="h-4" />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="bg-orange-100 rounded-lg p-4 mb-4">
              <div className="flex flex-col items-center">
                <h3 className="font-medium text-center mb-3 text-orange-700">
                  {currentMoveData.name}
                </h3>

                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, 0, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                  }}
                  className="mb-4"
                >
                  <Image
                    src={currentMoveData.image || "/placeholder.svg"}
                    alt={currentMoveData.name}
                    width={100}
                    height={100}
                    className="rounded-full bg-white p-2 border-2 border-orange-200"
                    onError={(e) => {
                      // Fallback to emoji if image fails to load
                      const animalEmojis: Record<string, string> = {
                        frog: "🐸",
                        bear: "🐻",
                        crab: "🦀",
                        elephant: "🐘",
                      };
                      const emoji = animalEmojis[currentMoveData.id] || "🐾";
                      e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23FFF8E1'/%3E%3Ctext x='50' y='50' fontFamily='Arial' fontSize='50' textAnchor='middle' dominantBaseline='middle'%3E${emoji}%3C/text%3E%3C/svg%3E`;
                    }}
                  />
                </motion.div>

                <p className="text-center mb-4">
                  {currentMoveData.instructions}
                </p>

                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold mb-4 text-orange-600">
                    {timeLeft}
                  </div>

                  <Button
                    onClick={togglePlay}
                    className={`rounded-full w-16 h-16 ${
                      isPlaying
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8 ml-1" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-3 text-sm text-orange-700">
            <p className="text-center">
              {!isPlaying
                ? "Press play when you're ready to start the animal move!"
                : "Keep going! You're doing great!"}
            </p>
          </div>
        </CardContent>
      </Card>
    </MissionLayout>
  );
}
