// AI integration helpers for Claude and ElevenLabs

interface ClaudeResponse {
  text: string
}

interface StoryWithExercises {
  storyPages: string[]
  exercisePrompts: string[]
}

// Hardcoded API keys
const ANTHROPIC_API_KEY =
  "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"
const ELEVENLABS_API_KEY = "sk_6693dc751b629371fda82e3b588af4ff080d337d39717046"

// Helper function for browser TTS
const useBrowserTTS = (text: string): Promise<string> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9 // Slightly slower for children
        utterance.pitch = 1.2 // Slightly higher pitch
        window.speechSynthesis.speak(utterance)
      } catch (error) {
        console.error("Error using browser speech synthesis:", error)
      }
    }
    resolve("") // Return empty string as we're using browser TTS
  })
}

export const generateClaudeResponse = async (prompt: string): Promise<string> => {
  try {
    console.log("🚀 Making Anthropic API call via proxy")

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
        maxTokens: 150,
      }),
    })

    if (!response.ok) {
      console.error("❌ API proxy request failed with status", response.status)
      const errorText = await response.text()
      console.error("Error details:", errorText)
      throw new Error(`API request failed with status ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log("✅ Received AI response from proxy:", data)
    return data.text
  } catch (error) {
    console.error("Error calling Claude API:", error)
    return getFallbackResponse(prompt)
  }
}

export const generateStoryWithExercises = async (params: {
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

export const generateVoice = async (text: string): Promise<string> => {
  // Initialize browser TTS for fallback
  const browserTTSPromise = useBrowserTTS(text)

  try {
    console.log("🎤 Generating voice with ElevenLabs API via proxy")

    const response = await fetch("/api/elevenlabs-proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: ELEVENLABS_API_KEY,
        text,
        voiceId: "pNInz6obpgDQGcFmaJgB", // Child-friendly voice
      }),
    })

    if (!response.ok) {
      console.error("❌ ElevenLabs proxy request failed with status", response.status)
      throw new Error("ElevenLabs API error")
    }

    console.log("✅ Voice generated successfully")
    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error("❌ Error generating voice:", error)
    return browserTTSPromise
  }
}

// Fallback responses for when API calls fail
const getFallbackResponse = (prompt: string): string => {
  // Extract topic from prompt if possible
  const lowercasePrompt = prompt.toLowerCase()

  if (lowercasePrompt.includes("hydration") || lowercasePrompt.includes("water")) {
    return "Drinking water helps your body work at its best! Try to drink water throughout the day to keep your energy up!"
  } else if (
    lowercasePrompt.includes("nutrition") ||
    lowercasePrompt.includes("food") ||
    lowercasePrompt.includes("eat")
  ) {
    return "Colorful fruits and vegetables give your body super powers! Try to eat a rainbow of colors each day!"
  } else if (lowercasePrompt.includes("movement") || lowercasePrompt.includes("exercise")) {
    return "Moving your body is so important! Exercise makes your heart strong and your body happy. Try to move and play for at least 60 minutes every day!"
  } else if (
    lowercasePrompt.includes("mindfulness") ||
    lowercasePrompt.includes("sleep") ||
    lowercasePrompt.includes("rest")
  ) {
    return "Taking deep breaths helps your body and mind feel calm. Rest is important to recharge your super powers!"
  } else if (
    lowercasePrompt.includes("greeting") ||
    lowercasePrompt.includes("hello") ||
    lowercasePrompt.includes("hi")
  ) {
    return "Hi there, Wellness Hero! I'm excited to join you on your health adventure today! What would you like to explore?"
  } else {
    return "You're doing a great job learning about health! Keep up the good work on your wellness journey!"
  }
}
