"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image"; 
import {
  Trophy,
  Calendar,
  User,
  Map,
  VolumeIcon as VolumeUp,
  VolumeX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAvatarContext } from "@/contexts/avatar-context";
import { getOrCreateHeroProfile, updateStreak } from "@/lib/db-utils";
import { playSound, stopAllSounds, speakText } from "@/lib/sound-utils";
import { FallbackImage } from "@/components/fallback-image";
import { ZonePortal } from "@/components/zone-portal";
import { createClient } from "@/lib/supabase-client";

// Zone definitions with enhanced details
const ZONES = [
  {
    id: "hydration",
    name: "Hydration Realm",
    description:
      "A magical water world where you'll learn the power of staying hydrated!",
    icon: "/images/hydration-icon.png",
    fallbackIcon: "💧",
    color: "rgba(59, 130, 246, 0.8)",
    position: { top: "20%", left: "15%" },
    animation: { y: [0, -5, 0], duration: 2, delay: 1.5 },
    glow: { scale: [1, 1.2, 1], duration: 3, delay: 1.5 },
    tooltip: "💧 Step into the Hydration Realm!",
    path: "/mission/HydrationRealmPage",
    unlockRequirement: 0,
    missions: [
      {
        id: "water-tracker",
        name: "Aqua Sprites",
        path: "/mission/HydrationRealmPage",
      },
      {
        id: "desert-quest",
        name: "Desert Quest",
        path: "/mission/hydration/desertquest",
      },
    ],
  },
  {
    id: "nutrition",
    name: "Nutrition Kingdom",
    description:
      "Explore the colorful world of healthy foods and discover their super powers!",
    icon: "/images/nutrition-icon.png",
    fallbackIcon: "🍎",
    color: "rgba(34, 197, 94, 0.8)",
    position: { top: "30%", right: "20%" },
    animation: { y: [0, -5, 0], duration: 2, delay: 0.5 },
    glow: { scale: [1, 1.2, 1], duration: 3, delay: 0.5 },
    tooltip: "🍎 Explore the Nutrition Kingdom!",
    path: "/mission/nutrition",
    unlockRequirement: 0,
    missions: [
      {
        id: "food-explorer",
        name: "Food Explorer",
        path: "/mission/nutrition",
      },
    ],
  },
  {
    id: "movement",
    name: "Movement Galaxy",
    description:
      "Blast off into a universe of fun physical activities that keep your body strong!",
    icon: "/images/movement-icon.png",
    fallbackIcon: "🏃",
    color: "rgba(249, 115, 22, 0.8)",
    position: { bottom: "25%", left: "25%" },
    animation: { y: [0, -5, 0], duration: 2, delay: 1 },
    glow: { scale: [1, 1.2, 1], duration: 3, delay: 1 },
    tooltip: "🏃 Journey through the Movement Galaxy!",
    path: "/mission/movement",
    unlockRequirement: 0,
    missions: [
      { id: "animal-moves", name: "Animal Moves", path: "/mission/movement" },
      {
        id: "story-exercise",
        name: "Story Adventure",
        path: "/mission/movement/story-exercise",
      },
    ],
  },
  {
    id: "mindfulness",
    name: "Mind Garden",
    description:
      "A peaceful sanctuary where you'll learn to calm your thoughts and grow your mind!",
    icon: "/images/mindfulness-icon.png",
    fallbackIcon: "🧠",
    color: "rgba(168, 85, 247, 0.8)",
    position: { bottom: "20%", right: "25%" },
    animation: { y: [0, -5, 0], duration: 2, delay: 1.5 },
    glow: { scale: [1, 1.2, 1], duration: 3, delay: 1.5 },
    tooltip: "🧠 Find peace in the Mind Garden!",
    path: "/mission/mindfulness",
    unlockRequirement: 0,
    missions: [
      {
        id: "breathing-bubbles",
        name: "Breathing Bubbles",
        path: "/mission/mindfulness",
      },
    ],
  },
];

// Badge definitions with details
const BADGES = {
  "hydration-novice": {
    name: "Water Novice",
    icon: "💧",
    description: "Completed your first hydration mission",
  },
  "hydration-master": {
    name: "Hydration Master",
    icon: "💧",
    description: "Mastered the Hydration Realm",
  },
  "hydration-expert": {
    name: "Hydration Expert",
    icon: "💧",
    description: "Aced the Desert Quest challenge",
  },
  "hydration-scholar": {
    name: "Hydration Scholar",
    icon: "💧",
    description: "Learned the secrets of water wisdom",
  },
  "hydration-apprentice": {
    name: "Hydration Apprentice",
    icon: "💧",
    description: "Started your hydration journey",
  },
  "nutrition-explorer": {
    name: "Food Explorer",
    icon: "🍎",
    description: "Discovered the power of healthy foods",
  },
  "movement-hero": {
    name: "Movement Hero",
    icon: "🏃",
    description: "Completed movement challenges",
  },
  "mindful-wizard": {
    name: "Mind Wizard",
    icon: "🧠",
    description: "Mastered mindfulness techniques",
  },
  "mystery-explorer": {
    name: "Mystery Explorer",
    icon: "✨",
    description: "Completed a Mystery Zone challenge",
  },
  "realm-master": {
    name: "Realm Master",
    icon: "🌟",
    description: "Mastered all four wellness realms",
  },
  "wellness-champion": {
    name: "Wellness Champion",
    icon: "👑",
    description: "Achieved the highest level of wellness mastery",
  },
};

export default function MissionHubPage() {
  const router = useRouter();
  const { triggerReaction, showSpeech } = useAvatarContext();
  const supabase = createClient();
  const [heroProfile, setHeroProfile] = useState<any>(null);
  const [streak, setStreak] = useState(1);
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showMissionPanel, setShowMissionPanel] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showBadgeDetails, setShowBadgeDetails] = useState<string | null>(null);
  const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null);
  const [isMusicPaused, setIsMusicPaused] = useState(false);
  const [bgMusic, setBgMusic] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load hero profile and sync with database
    loadProfileAndSync();

    // Play ambient music
    if (soundEnabled && !bgMusic) {
      const music = new Audio("/sounds/hub-music.mp3");
      music.loop = true;
      music.volume = 0.3;
      music.play();
      setBgMusic(music);

      return () => {
        music.pause();
        music.currentTime = 0;
        setBgMusic(null);
      };
    }
  }, [soundEnabled]);

  const loadProfileAndSync = async () => {
    setIsLoading(true);

    try {
      // Load hero profile from localStorage
      const profileData = localStorage.getItem("heroProfile");
      if (profileData) {
        const localProfile = JSON.parse(profileData);
        setHeroProfile(localProfile);
      }

      // Load badges and points
      const storedBadges = localStorage.getItem("badges");
      if (storedBadges) {
        setBadges(JSON.parse(storedBadges));
      } else {
        // Default badges if none exist
        const defaultBadges = ["hydration-novice"];
        localStorage.setItem("badges", JSON.stringify(defaultBadges));
        setBadges(defaultBadges);
      }

      const storedPoints = localStorage.getItem("points");
      if (storedPoints) {
        setPoints(Number.parseInt(storedPoints));
      } else {
        // Default points
        localStorage.setItem("points", "50");
        setPoints(50);
      }

      // Update streak
      const newStreak = await updateStreak();
      setStreak(newStreak);

      // Sync with database
      await getOrCreateHeroProfile();

      // Welcome speech
      setTimeout(() => {
        showSpeech(
          "Welcome to HealthQuest Kingdom! Choose a realm to explore!"
        );
        triggerReaction("celebrate");

        if (soundEnabled) {
          speakText(
            "Welcome to HealthQuest Kingdom! Choose a realm to explore!"
          );
        }
      }, 1000);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncWithDatabase = async () => {
    try {
      const profileData = localStorage.getItem("heroProfile");
      if (!profileData) return;

      const profile = JSON.parse(profileData);

      // Check if user exists
      const { data: existingUser } = await supabase
        .from("hero_profiles")
        .select("id")
        .eq("hero_name", profile.heroName)
        .single();

      if (existingUser) {
        // Update existing user
        await supabase
          .from("hero_profiles")
          .update({
            age: profile.age,
            points: points,
            streak: streak,
            last_check_in: lastCheckIn,
            badges: badges,
          })
          .eq("id", existingUser.id);
      } else {
        // Create new user
        await supabase.from("hero_profiles").insert({
          hero_name: profile.heroName,
          age: profile.age,
          points: points,
          streak: streak,
          last_check_in: lastCheckIn,
          badges: badges,
        });
      }
    } catch (error) {
      console.error("Error syncing with database:", error);
      // Continue without database sync - app works offline
    }
  };

  const navigateToZone = (zone: string) => {
    // Find the zone data
    const zoneData = ZONES.find((z) => z.id === zone);
    if (!zoneData) return;

    // Check if zone is locked
    if (zoneData.unlockRequirement > badges.length) {
      showSpeech(
        `You need ${zoneData.unlockRequirement} badges to unlock this zone!`
      );
      if (soundEnabled) {
        speakText(
          `You need ${zoneData.unlockRequirement} badges to unlock this zone!`
        );
        playSound("", 0.5);
      }
      return;
    }

    // If zone has multiple missions, show mission panel instead of navigating
    if (zoneData.missions && zoneData.missions.length > 1) {
      setShowMissionPanel(zone);
      return;
    }

    // Show zone-specific speech before navigation
    const speeches = {
      hydration: "Let's dive into the Hydration Realm! 💧",
      nutrition: "Welcome to the Nutrition Kingdom! 🍎",
      movement: "Time to explore the Movement Galaxy! 🏃",
      mindfulness: "Enter the peaceful Mind Garden... 🧠",
      mystery: "Unlocking the Mystery Zone... What secrets await? ✨",
    };

    showSpeech(speeches[zone as keyof typeof speeches] || "Let's explore!");
    triggerReaction("encourage");

    if (soundEnabled) {
      speakText(speeches[zone as keyof typeof speeches] || "Let's explore!");
      playSound("/sounds/portal-enter.mp3", 0.5);
    }

    // Navigate after a short delay for the speech
    setTimeout(() => {
      router.push(zoneData.path);
    }, 1000);
  };

  const navigateToMission = (path: string) => {
    if (soundEnabled) {
      playSound("/sounds/click.mp3", 0.4);
    }

    setShowMissionPanel(null);

    // Navigate after a short delay
    setTimeout(() => {
      router.push(path);
    }, 300);
  };

  const handleZoneHover = (zone: string) => {
    setHoveredZone(zone);
    setShowTooltip(true);

    if (soundEnabled) {
      playSound("/sounds/hover.mp3", 0.2);
    }
  };

  const handleZoneLeave = () => {
    setShowTooltip(false);
  };

  const getTooltipText = (zone: string) => {
    const zoneData = ZONES.find((z) => z.id === zone);
    return zoneData?.tooltip || "Explore this zone!";
  };

  const getBadgeIcon = (badge: string) => {
    return BADGES[badge as keyof typeof BADGES]?.icon || "🏆";
  };

  const getBadgeName = (badge: string) => {
    return (
      BADGES[badge as keyof typeof BADGES]?.name ||
      badge
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (bgMusic) {
      bgMusic.pause();
      bgMusic.currentTime = 0;
      setBgMusic(null);
    }
  };

  const toggleMusic = () => {
    if (!bgMusic) return;

    setIsMusicPaused(!isMusicPaused);
    if (isMusicPaused) {
      bgMusic.play();
    } else {
      bgMusic.pause();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-xl font-bold text-purple-700">
            Loading HealthQuest Kingdom...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[url('/images/kingdom-map-bg.png')] bg-cover bg-center">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 text-white shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src="/images/dino-logo.png"
                alt="Hero Avatar"
                width={50}
                height={50}
                className="rounded-full p-1"
              />
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                {heroProfile?.age || "?"}
              </div>
            </div>
            <div>
              <h1 className="font-bold text-lg">
                {heroProfile?.heroName || "Wellness Hero"}
              </h1>
              <div className="flex items-center text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Day {streak} Streak</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white/20 text-white">
              <Trophy className="h-3 w-3 mr-1" /> {points} Points
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white hover:bg-white/20 bg-purple-400"
            >
              <User className="h-3 w-3 mr-1" /> Profile
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative w-full h-[500px] md:h-[600px] mb-8">
            {/* Map Background */}
            <div
              className="absolute inset-0 rounded-xl overflow-hidden border-4 border-amber-800 shadow-2xl backdrop-blur-sm"
              style={{
                backgroundImage: 'url("/images/jungle.jpg")',
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundColor: "rgba(0, 0, 0, 0.2)",
              }}
            >
              {/* Add a gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/10 via-green-100/10 to-purple-100/10" />

              {/* Add map compass */}
              <motion.div
                className="absolute bottom-4 right-4 bg-white/80 rounded-full p-2 shadow-lg"
                whileHover={{ scale: 1.1, rotate: [0, 10, -10, 0] }}
                transition={{ rotate: { repeat: 1, duration: 0.5 } }}
              >
                <Map className="h-8 w-8 text-amber-800" />
              </motion.div>

              {/* Music control button */}
              <motion.div
                className="absolute bottom-4 left-4 bg-white/80 rounded-full p-2 shadow-lg cursor-pointer"
                whileHover={{ scale: 1.1 }}
                onClick={toggleMusic}
              >
                {isMusicPaused ? (
                  <VolumeX className="h-8 w-8 text-amber-800" />
                ) : (
                  <VolumeUp className="h-8 w-8 text-amber-800" />
                )}
              </motion.div>
            </div>

            {/* Render each zone */}
            {ZONES.map((zone) => {
              // Check if zone should be visible based on badge requirement
              const isUnlocked = badges.length >= zone.unlockRequirement;

              if (!isUnlocked && zone.id === "mystery") return null;

              return (
                <ZonePortal
                  key={zone.id}
                  id={zone.id}
                  name={zone.name}
                  description={zone.description}
                  icon={zone.icon}
                  fallbackIcon={zone.fallbackIcon}
                  color={zone.color}
                  position={zone.position}
                  animation={zone.animation}
                  glow={zone.glow}
                  tooltip={zone.tooltip}
                  unlockRequirement={zone.unlockRequirement}
                  badges={badges}
                  onClick={() => navigateToZone(zone.id)}
                  onHoverStart={() => handleZoneHover(zone.id)}
                  onHoverEnd={handleZoneLeave}
                  soundEnabled={soundEnabled}
                />
              );
            })}
          </div>

          {/* Progress and Badges Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Progress Card */}
            <Card className="bg-white/90 backdrop-blur-sm border-none shadow-xl">
              <div className="p-4">
                <h2 className="text-xl font-bold mb-4 flex items-center text-purple-700">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Your Quest Progress
                </h2>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Hydration Mastery</span>
                      <span>
                        {Math.min(
                          badges.filter((b) => b.includes("hydration")).length *
                            25,
                          100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={Math.min(
                        badges.filter((b) => b.includes("hydration")).length *
                          25,
                        100
                      )}
                      className="h-2 bg-blue-100"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Nutrition Knowledge</span>
                      <span>
                        {Math.min(
                          badges.filter((b) => b.includes("nutrition")).length *
                            25,
                          100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={Math.min(
                        badges.filter((b) => b.includes("nutrition")).length *
                          25,
                        100
                      )}
                      className="h-2 bg-green-100"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Movement Skills</span>
                      <span>
                        {Math.min(
                          badges.filter((b) => b.includes("movement")).length *
                            25,
                          100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={Math.min(
                        badges.filter((b) => b.includes("movement")).length *
                          25,
                        100
                      )}
                      className="h-2 bg-orange-100"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Mind Powers</span>
                      <span>
                        {Math.min(
                          badges.filter((b) => b.includes("mindfulness"))
                            .length * 25,
                          100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={Math.min(
                        badges.filter((b) => b.includes("mindfulness")).length *
                          25,
                        100
                      )}
                      className="h-2 bg-purple-100"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Hero Level:</span>
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-purple-600">
                        {Math.floor(points / 100) + 1}
                      </span>
                      <div className="ml-2 w-24 bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-purple-600 h-2.5 rounded-full"
                          style={{ width: `${points % 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Badges Card */}
            <Card className="bg-white/90 backdrop-blur-sm border-none shadow-xl">
              <div className="p-4">
                <h2 className="text-xl font-bold mb-4 flex items-center text-purple-700">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Your Badges
                </h2>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {badges.map((badge, index) => (
                    <motion.div
                      key={badge}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-b from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-2 text-center cursor-pointer"
                      onClick={() => setShowBadgeDetails(badge)}
                    >
                      <motion.div
                        className="text-2xl mb-1"
                        whileHover={{ scale: 1.2, rotate: [0, 10, -10, 0] }}
                        transition={{ rotate: { repeat: 1, duration: 0.5 } }}
                      >
                        {getBadgeIcon(badge)}
                      </motion.div>
                      <span className="text-xs font-medium">
                        {getBadgeName(badge)}
                      </span>
                    </motion.div>
                  ))}

                  {/* Empty badge slots */}
                  {Array.from({ length: Math.max(0, 8 - badges.length) }).map(
                    (_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="bg-gray-100 border border-gray-200 rounded-lg p-2 text-center opacity-40"
                      >
                        <div className="text-2xl mb-1">🔒</div>
                        <span className="text-xs font-medium">Locked</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Mission Selection Panel */}
      <AnimatePresence>
        {showMissionPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowMissionPanel(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const zone = ZONES.find((z) => z.id === showMissionPanel);
                if (!zone) return null;

                return (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-12 h-12 rounded-full bg-${zone.color}-100 flex items-center justify-center`}
                      >
                        <FallbackImage
                          src={zone.icon}
                          alt={zone.name}
                          width={40}
                          height={40}
                          fallbackEmoji={zone.fallbackIcon}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {zone.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {zone.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <h4 className="font-medium text-gray-700">
                        Choose Your Mission:
                      </h4>
                      {zone.missions.map((mission) => (
                        <motion.button
                          key={mission.id}
                          className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigateToMission(mission.path)}
                        >
                          <div
                            className={`w-10 h-10 rounded-full bg-${zone.color}-100 flex items-center justify-center`}
                          >
                            <span className="text-xl">
                              {getBadgeIcon(mission.id)}
                            </span>
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{mission.name}</div>
                            <div className="text-xs text-gray-500">
                              {badges.includes(
                                `${zone.id}-${mission.id.split("-")[0]}`
                              )
                                ? "Completed ✓"
                                : "Not completed yet"}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setShowMissionPanel(null)}
                      >
                        Close
                      </Button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge Details Modal */}
      <AnimatePresence>
        {showBadgeDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBadgeDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const badge = BADGES[showBadgeDetails as keyof typeof BADGES];
                if (!badge) return null;

                return (
                  <>
                    <div className="flex flex-col items-center mb-4">
                      <motion.div
                        className="text-5xl mb-3"
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "reverse",
                        }}
                      >
                        {badge.icon}
                      </motion.div>
                      <h3 className="text-xl font-bold text-center">
                        {badge.name}
                      </h3>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <p className="text-center">{badge.description}</p>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setShowBadgeDetails(null)}
                      >
                        Close
                      </Button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
