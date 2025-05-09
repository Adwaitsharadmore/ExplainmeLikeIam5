// AI service for generating personalized responses

interface HeroProfile {
  name: string
  age: number
  grade: string
  interests: string[]
  heroType?: string
  favoriteColor?: string
}

interface AIResponse {
  text: string
}

export async function generateAIResponse(
  profile: HeroProfile | null,
  missionType: string,
  missionName: string,
): Promise<AIResponse> {
  // Default profile if none provided
  const defaultProfile: HeroProfile = {
    name: "Wellness Hero",
    age: 8,
    grade: "3rd grade",
    interests: ["adventures", "games"],
    heroType: "explorer",
    favoriteColor: "blue",
  }

  const heroProfile = profile || defaultProfile

  try {
    // Build a prompt that includes the child's profile details
    const prompt = `
      You are a friendly, enthusiastic guide for a children's health app called HealthQuest Kingdom.
      
      The child you're talking to is named ${heroProfile.name}, who is ${heroProfile.age} years old and in ${
        heroProfile.grade
      }. 
      They like ${heroProfile.interests.join(", ")}.
      Their hero type is: ${heroProfile.heroType || "explorer"}.
      
      They just completed the "${missionName}" mission in the ${missionType} zone.
      
      Give them a SHORT, encouraging message (max 3 sentences) about their achievement.
      Use simple language appropriate for a ${heroProfile.age}-year-old.
      Be VERY enthusiastic and playful - use a tone that kids would love!
      Include a fun fact about ${missionType} that's easy for them to understand.
      Address them by name and reference their hero type.
      
      Make your response sound like you're talking to a friend, not teaching a lesson.
      Use exclamation points, simple words, and a playful tone!
    `

    // For development or if API call fails, return a fallback response
    return {
      text: getFallbackResponse(heroProfile, missionType, missionName),
    }
  } catch (error) {
    console.error("Error generating AI response:", error)
    return {
      text: getFallbackResponse(heroProfile, missionType, missionName),
    }
  }
}

// Fallback responses for when API calls fail - kid-friendly tone
const getFallbackResponse = (profile: HeroProfile, missionType: string, missionName: string): string => {
  const { name, heroType = "explorer", age } = profile
  const exclamation = age < 8 ? "Wow!" : "Awesome job!"

  // Extract topic from mission type
  const lowercaseMissionType = missionType.toLowerCase()

  if (lowercaseMissionType.includes("hydration") || lowercaseMissionType.includes("water")) {
    return `${exclamation} ${name} the ${heroType}, you're a super hydration hero! Your body LOVES water - it helps your brain think better and gives you energy to play! Keep drinking water throughout the day for super powers! 💧`
  } else if (lowercaseMissionType.includes("nutrition") || lowercaseMissionType.includes("food")) {
    return `${exclamation} ${name} the ${heroType}, you're a nutrition champion! Colorful fruits and veggies give your body super powers! Try eating a rainbow of foods each day for maximum energy! 🍎🥦🍊`
  } else if (lowercaseMissionType.includes("movement") || lowercaseMissionType.includes("exercise")) {
    return `${exclamation} ${name} the ${heroType}, you're a movement master! Moving your body makes your heart super strong and your body happy! Did you know jumping helps your bones grow stronger? Keep bouncing! 🏃‍♂️`
  } else if (lowercaseMissionType.includes("mindfulness") || lowercaseMissionType.includes("mental")) {
    return `${exclamation} ${name} the ${heroType}, you're a mindfulness wizard! Taking deep breaths helps your body and mind feel calm and happy! Your brain loves when you take time to relax! 🧘‍♂️`
  } else if (lowercaseMissionType.includes("mystery")) {
    return `${exclamation} ${name} the ${heroType}, you solved the mystery challenge! Your brain is super powerful when you use all your wellness knowledge together! You're becoming a true Wellness Master! ✨`
  } else {
    return `${exclamation} ${name} the ${heroType}, you're doing AMAZING on your wellness journey! Keep up the awesome work and you'll be the greatest wellness hero ever! You rock! 🌟`
  }
}
