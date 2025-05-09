"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Droplet,
  ArrowLeft,
  VolumeIcon as VolumeUp,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { generateAIResponse } from "@/lib/ai-service";
import { useAvatarContext } from "@/contexts/avatar-context";
import { createClient } from "@/lib/supabase/client";

// Character dialogue for Droplet Guide
const DROPLET_DIALOGUE = [
  "Welcome to the Hydration Realm! I'm Droplet, your guide!",
  "Our realm is drying up! Can you help collect the magical Aqua Sprites?",
  "Each Aqua Sprite you collect helps restore our Water Crystal!",
  "Great job! Keep collecting those sprites!",
  "You're doing amazing! The Water Crystal is starting to glow!",
  "Almost there! Just a few more sprites to restore our realm!",
];

export default function HydrationRealmPage() {
  const router = useRouter();
  const { avatarState, triggerReaction, showSpeech } = useAvatarContext();
  const [heroProfile, setHeroProfile] = useState<any>(null);
  const [hydrationLevel, setHydrationLevel] = useState(0);
  const [waterDrops, setWaterDrops] = useState<
    { id: number; x: number; y: number }[]
  >([]);
  const [isDropping, setIsDropping] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [aiResponse, setAIResponse] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [showGuide, setShowGuide] = useState(true);
  const [guideDialogue, setGuideDialogue] = useState(0);
  const [showParticles, setShowParticles] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const profileData = localStorage.getItem("heroProfile");
    if (profileData) {
      setHeroProfile(JSON.parse(profileData));
    }
    generateWaterDrops();

    // Play welcome narration
    setTimeout(() => {
      speakWithBrowserTTS(DROPLET_DIALOGUE[0]);
      setTimeout(() => {
        speakWithBrowserTTS(DROPLET_DIALOGUE[1]);
      }, 4000);
    }, 1000);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const generateWaterDrops = () => {
    const newDrops = [];
    for (let i = 0; i < 8; i++) {
      newDrops.push({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
      });
    }
    setWaterDrops(newDrops);
  };

  const handleDropClick = (id: number) => {
    if (isDropping || hydrationLevel >= 100) return;
    setIsDropping(true);
    triggerReaction("drinking");
    showSpeech("Yay! A magic drop!");

    // Show particle effect
    setShowParticles((prev) => [...prev, id]);

    // Play water collection sound
    const audio = new Audio("/sounds/water-collect.mp3");
    audio.volume = 0.5;
    audio.play().catch((err) => console.error("Error playing sound:", err));

    setWaterDrops((prev) => prev.filter((drop) => drop.id !== id));
    setHydrationLevel((prev) => {
      const newLevel = Math.min(prev + 12.5, 100);

      // Show guide dialogue based on progress
      if (newLevel >= 25 && newLevel < 50) {
        setGuideDialogue(3);
        speakWithBrowserTTS(DROPLET_DIALOGUE[3]);
      } else if (newLevel >= 50 && newLevel < 75) {
        setGuideDialogue(4);
        speakWithBrowserTTS(DROPLET_DIALOGUE[4]);
      } else if (newLevel >= 75 && newLevel < 100) {
        setGuideDialogue(5);
        speakWithBrowserTTS(DROPLET_DIALOGUE[5]);
      }

      if (newLevel >= 100) {
        setTimeout(() => {
          setShowCompletion(true);
          triggerReaction("celebrate");
          showSpeech("The Water Crystal is glowing!");
          fetchAIResponse();

          // Award badge and points
          const badges = JSON.parse(localStorage.getItem("badges") || "[]");
          if (!badges.includes("hydration-master")) {
            badges.push("hydration-master");
            localStorage.setItem("badges", JSON.stringify(badges));

            // Update points
            const currentPoints = Number.parseInt(
              localStorage.getItem("points") || "0"
            );
            localStorage.setItem("points", (currentPoints + 100).toString());

            // Sync with database
            syncProgress("hydration-master", 100);
          }
        }, 1000);
      }
      return newLevel;
    });

    // Remove particles after animation
    setTimeout(() => {
      setShowParticles((prev) =>
        prev.filter((particleId) => particleId !== id)
      );
    }, 1000);

    setTimeout(() => {
      setIsDropping(false);
    }, 500);
  };

  const syncProgress = async (badge: string, points: number) => {
    try {
      const profileData = localStorage.getItem("heroProfile");
      if (!profileData) return;

      const profile = JSON.parse(profileData);

      // Check if user exists
      const { data: existingUser } = await supabase
        .from("hero_profiles")
        .select("id, badges, points")
        .eq("hero_name", profile.heroName)
        .single();

      if (existingUser) {
        // Update existing user
        const badges = existingUser.badges || [];
        if (!badges.includes(badge)) {
          badges.push(badge);
        }

        await supabase
          .from("hero_profiles")
          .update({
            badges: badges,
            points: (existingUser.points || 0) + points,
          })
          .eq("id", existingUser.id);
      }
    } catch (error) {
      console.error("Error syncing progress:", error);
      // Continue without database sync - app works offline
    }
  };

  const fetchAIResponse = async () => {
    setIsLoadingAI(true);
    try {
      const response = await generateAIResponse(
        heroProfile,
        "hydration",
        "hydration realm"
      );
      setAIResponse(response.text);
      const elevenLabsKey = localStorage.getItem("elevenLabsApiKey");
      if (elevenLabsKey) {
        try {
          const voiceUrl = await generateVoice(response.text);
          setAudioUrl(voiceUrl);
          setTimeout(() => {
            if (audioRef.current)
              audioRef.current
                .play()
                .catch((err) => console.error("Error playing audio:", err));
          }, 500);
        } catch (error) {
          console.error("Error generating voice:", error);
          speakWithBrowserTTS(response.text);
        }
      } else {
        speakWithBrowserTTS(response.text);
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const fallback =
        "Amazing! You've restored balance to the Hydration Realm! The Water Crystal is now fully charged, bringing life back to our world. Remember to drink water in your world too!";
      setAIResponse(fallback);
      speakWithBrowserTTS(fallback);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const generateVoice = async (text: string) => {
    // This would normally call the ElevenLabs API
    return "/sample-voice.mp3";
  };

  const speakWithBrowserTTS = (text: string) => {
    if ("speechSynthesis" in window) {
      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("Error using browser speech synthesis:", error);
      }
    }
  };

  const handleBackToHub = () => {
    // Cancel any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const currentProgress = localStorage.getItem("hydrationProgress") || "0";
    const newProgress = Math.max(Number.parseInt(currentProgress), 1);
    localStorage.setItem("hydrationProgress", newProgress.toString());

    // Add badge if not already present
    const badges = JSON.parse(localStorage.getItem("badges") || "[]");
    if (!badges.includes("hydration-novice")) {
      badges.push("hydration-novice");
      localStorage.setItem("badges", JSON.stringify(badges));

      // Update points
      const currentPoints = Number.parseInt(
        localStorage.getItem("points") || "0"
      );
      localStorage.setItem("points", (currentPoints + 50).toString());

      // Sync with database
      syncProgress("hydration-novice", 50);
    }

    router.push("/mission-hub");
  };

  const handleNextLevel = () => {
    // Cancel any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    router.push("/mission/hydration/desertquest");
  };

  return (
    <div className="min-h-screen bg-[url('/images/water.jpg')] bg-cover bg-center p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 bg-white/80 hover:bg-white/90"
            onClick={handleBackToHub}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Hub
          </Button>
          <div className="flex items-center gap-2 bg-white/80 px-3 py-1 rounded-full">
            <Droplet className="h-5 w-5 text-blue-500" />
            <h1 className="text-xl font-bold text-blue-700">Hydration Realm</h1>
          </div>
        </div>

        {/* Droplet Guide Character */}
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
                    src="/images/dinowater.png"
                    alt="Dino Water Guide"
                    width={100}
                    height={120}
                    onError={(e) => {
                      e.currentTarget.src =
                        "/placeholder.svg?height=120&width=100";
                    }}
                    className="rounded-full"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-16 -right-4 bg-white rounded-lg p-2 shadow-lg max-w-[200px]"
                >
                  <div className="text-sm text-blue-800">
                    {DROPLET_DIALOGUE[guideDialogue]}
                  </div>
                  <div className="absolute bottom-0 right-8 w-4 h-4 bg-white transform rotate-45 translate-y-1/2"></div>
                </motion.div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-0 right-0 h-6 w-6 p-0 rounded-full "
                  onClick={() => setShowGuide(false)}
                >
                  ×
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showCompletion ? (
          <Card className="border-blue-200 shadow-lg bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <CardTitle className="text-center text-blue-700 flex items-center justify-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" /> Mission Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center mb-4"
              >
                <div className="relative">
                  <Image
                    src="/images/dinowater.png"
                    alt="Water Crystal"
                    width={120}
                    height={120}
                    className="rounded-full"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/placeholder.svg?height=120&width=120";
                    }}
                  />
                  <motion.div
                    animate={{
                      opacity: [0.5, 1, 0.5],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                    className="absolute inset-0 rounded-full bg-blue-400/30"
                  />
                </div>
              </motion.div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6 relative">
                {isLoadingAI ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin h-8 w-8 border-2 border-b-0 rounded-full border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-blue-800 text-center">{aiResponse}</p>
                    <button
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current
                            .play()
                            .catch((err) =>
                              console.error("Error playing audio:", err)
                            );
                        } else {
                          speakWithBrowserTTS(aiResponse);
                        }
                      }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-blue-100 hover:bg-blue-200"
                    >
                      <VolumeUp className="h-4 w-4 text-blue-600" />
                    </button>
                    {audioUrl && <audio ref={audioRef} src={audioUrl} />}
                  </>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-yellow-800 mb-2">Realm Fact</h3>
                <p className="text-sm text-yellow-700">
                  The Water Crystal feeds the realm's life! Just like water
                  helps your body work properly. Your body is about 60% water,
                  and your brain is 73% water!
                </p>
              </div>

              <motion.div
                className="flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <div className="bg-blue-600 text-white rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4" /> You earned: Hydration Master
                  Badge!
                </div>
              </motion.div>
            </CardContent>
            <CardFooter className="border-t border-blue-100 pt-4 flex flex-col sm:flex-row gap-2">
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600"
                onClick={handleBackToHub}
              >
                Return to Mission Hub
              </Button>
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600"
                onClick={handleNextLevel}
              >
                Continue to Desert Quest
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border-blue-200 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <CardTitle className="text-center text-blue-700">
                Gather the Aqua Sprites
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 mr-4">
                  <Image
                    src="/images/dinowater.png"
                    alt="Water Crystal"
                    width={80}
                    height={80}
                    className="rounded-full"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/placeholder.svg?height=80&width=80";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium mb-1">Crystal Power</h3>
                  <Progress
                    value={hydrationLevel}
                    className="h-4 bg-blue-100"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Empty</span>
                    <span>Full</span>
                  </div>
                </div>
              </div>

              <p className="text-center mb-4">
                Find the glowing Aqua Sprites to awaken the Hydration Crystal!
              </p>

              <div
                ref={containerRef}
                className="relative bg-gradient-to-b from-blue-100 to-cyan-100 rounded-lg h-64 mb-4 overflow-hidden"
              >
                {/* Background water ripples */}
                <div className="absolute inset-0 bg-[url('/images/water-bg.png')] bg-cover opacity-30"></div>

                {waterDrops.map((drop) => (
                  <motion.div
                    key={drop.id}
                    className="absolute cursor-pointer"
                    style={{
                      left: `${drop.x}%`,
                      top: `${drop.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    animate={{ y: [0, 10, 0], rotate: [0, 5, -5, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "mirror",
                      delay: drop.id * 0.2,
                    }}
                    onClick={() => handleDropClick(drop.id)}
                    whileHover={{ scale: 1.2 }}
                  >
                    <Image
                      src="/images/droplet.png"
                      alt="Aqua Sprite"
                      width={48}
                      height={48}
                      onError={(e) => {
                        e.currentTarget.src =
                          "/placeholder.svg?height=48&width=48";
                      }}
                    />

                    {/* Glow effect */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-blue-400/50"
                      animate={{
                        opacity: [0.3, 0.7, 0.3],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    />
                  </motion.div>
                ))}

                {/* Particle effects when collecting sprites */}
                {showParticles.map((id) => {
                  const drop = waterDrops.find((d) => d.id === id);
                  if (!drop) return null;

                  return (
                    <motion.div
                      key={`particle-${id}`}
                      className="absolute"
                      style={{ left: `${drop.x}%`, top: `${drop.y}%` }}
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0, scale: 2 }}
                      transition={{ duration: 1 }}
                    >
                      {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-blue-400 rounded-full"
                          initial={{ x: 0, y: 0 }}
                          animate={{
                            x: Math.cos((i * Math.PI) / 4) * 30,
                            y: Math.sin((i * Math.PI) / 4) * 30,
                            opacity: 0,
                          }}
                          transition={{ duration: 1 }}
                        />
                      ))}
                    </motion.div>
                  );
                })}

                {hydrationLevel >= 100 && (
                  <motion.div
                    className="absolute inset-0 bg-blue-500/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}

                {/* Water Crystal in the center */}
                {hydrationLevel > 0 && (
                  <motion.div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    initial={{ scale: 0 }}
                    animate={{ scale: hydrationLevel / 100 }}
                  >
                    <motion.div
                      animate={{
                        opacity: [0.5, 1, 0.5],
                        rotate: [0, 360],
                      }}
                      transition={{
                        opacity: {
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                        },
                        rotate: {
                          duration: 20,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        },
                      }}
                    >
                      <Image
                        src="/images/water-crystal.png"
                        alt="Water Crystal"
                        width={80}
                        height={80}
                        className="opacity-70"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/placeholder.svg?height=80&width=80";
                        }}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </div>

              <div className="text-center text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
                {hydrationLevel < 25
                  ? "The Aqua Sprites are awakening… can you find more?"
                  : hydrationLevel < 50
                  ? "Great! The Water Crystal is starting to glow!"
                  : hydrationLevel < 75
                  ? "You're bringing life back to the realm!"
                  : hydrationLevel < 100
                  ? "Almost there, hero! The magic is nearly restored!"
                  : "You've done it! The Water Crystal shines bright again!"}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
