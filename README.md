# ExplainmeLikeIam5
This is a web app made for kids to understand and learn about healthy life through a gamified experience



# Prompts used

1. export const generateStoryWithExercises = async (params: {
  childAge: number
  interests: string[]
  difficulty: "easy" | "medium" | "hard"
}): Promise<StoryWithExercises> => {
  const { childAge, interests, difficulty } = params

  // For development or if API call fails, return a fallback story
  const fallbackStory = {
    storyPages: [
      "Once upon a time, there was a brave explorer in the jungle.",
      "The explorer found a tiger! Can you roar and move like a tiger?",
      "Next, the explorer had to cross a river by jumping on stones.",
      "Finally, the explorer found a treasure and did a happy dance!",
      "The end! You did amazing exercises just like a real explorer!",
    ],
    exercisePrompts: [
      "Roar and move like a tiger!",
      "Jump 5 times like crossing a river!",
      "Do a happy dance!",
      "Take a big stretch to celebrate!",
    ],
  }

  try {
    console.log("🚀 Generating story with exercises via proxy")

    const prompt = `
      Create a 5-page interactive story for a ${childAge}-year-old who loves ${interests.join(", ")}.
      The story should get the child moving with ${difficulty} exercises appropriate for their age.
      
      Format your response as JSON with these properties:
      - storyPages: An array of 5 short paragraphs (one per page)
      - exercisePrompts: An array of 4 simple physical activities tied to the story
      
      Keep each page 1-2 sentences. Make exercises fun, simple, and tied to story events.
      For example: "jump like a frog", "stretch tall like a tree", "tiptoe quietly".
      
      The story should have a beginning, middle challenge, and happy ending.
      Use language appropriate for ${childAge} years old.
    `

    // Use the proxy server to avoid CORS issues
    const response = await fetch("/api/claude-proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: ANTHROPIC_API_KEY,
        prompt,
        model: "claude-3-haiku-20240307",
        maxTokens: 500,
        responseFormat: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      throw new Error(`API proxy request failed with status ${response.status}`)
    }

    const result = await response.json()
    console.log("✅ Received story response from proxy:", result)

    try {
      // Try to parse the JSON response
      let parsedResponse

      if (typeof result.text === "string") {
        try {
          parsedResponse = JSON.parse(result.text)
        } catch (parseError) {
          console.error("Error parsing JSON string:", parseError)
          console.log("Raw text response:", result.text)

          // Try to extract JSON from the text if it contains JSON-like content
          const jsonMatch = result.text.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            try {
              parsedResponse = JSON.parse(jsonMatch[0])
            } catch (e) {
              console.error("Failed to extract JSON from text:", e)
              return fallbackStory
            }
          } else {
            return fallbackStory
          }
        }
      } else if (typeof result.text === "object") {
        // If it's already an object, use it directly
        parsedResponse = result.text
      } else {
        console.error("Unexpected response format:", result)
        return fallbackStory
      }

      // Validate the parsed response has the expected structure
      if (parsedResponse && Array.isArray(parsedResponse.storyPages) && Array.isArray(parsedResponse.exercisePrompts)) {
        return {
          storyPages: parsedResponse.storyPages,
          exercisePrompts: parsedResponse.exercisePrompts,
        }
      } else {
        console.error("Invalid response structure:", parsedResponse)
        return fallbackStory
      }
    } catch (parseError) {
      console.error("Error processing response:", parseError)
      console.log("Raw response:", result)
      return fallbackStory
    }
  } catch (error) {
    console.error("Error generating story with exercises:", error)
    return fallbackStory
  }
}


2. export async function generateAIResponse(
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


3.  const generateAvatarResponse = async (childInput?: string): Promise<string> => {
    setIsProcessing(true)

    try {
      // Add child message to history if provided
      if (childInput) {
        addChildMessage(childInput)
      }

      // Get hero profile from localStorage
      let profile = { heroName: "Hero", age: "8", interests: ["health"] }
      if (typeof window !== "undefined") {
        const profileData = localStorage.getItem("heroProfile")
        if (profileData) {
          try {
            profile = JSON.parse(profileData)
          } catch (error) {
            console.error("Error parsing hero profile:", error)
          }
        }
      }

      // Build contextual prompt for Claude
      const recentExchanges = history
        .slice(-6)
        .map((h) => `${h.role === "avatar" ? "You" : profile.heroName}: ${h.content}`)
        .join("\n")

      const prompt = `
        You are a friendly health guide for a ${profile.age}-year-old child named ${profile.heroName} 
        who loves ${profile.interests.join(", ")}. You're currently in the ${currentContext} activity.
        
        Your personality is: friendly, encouraging, and slightly silly. You use simple language 
        appropriate for a ${profile.age}-year-old. You ask engaging questions and respond 
        with excitement. Keep responses under 2 sentences unless telling a brief story.
        
        Recent conversation:
        ${recentExchanges}
        
        ${childInput ? `${profile.heroName} just said: "${childInput}"` : "Generate a friendly greeting about " + currentContext}
        
        Respond in a way that's conversational, encourages healthy habits, and relates to their interests.
        Never mention that you're AI, just stay in character as their friendly health guide.
      `

      // Get response from Claude
      const response = await generateClaudeResponse(prompt)

      // Add to history
      addAvatarMessage(response)

      return response
    } catch (error) {
      console.error("Error generating avatar response:", error)
      const fallbackResponse = "I'm excited to continue our adventure! What would you like to do next?"
      addAvatarMessage(fallbackResponse)
      return fallbackResponse
    } finally {
      setIsProcessing(false)
    }
  }
