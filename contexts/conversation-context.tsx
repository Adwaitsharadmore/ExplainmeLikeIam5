"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { generateClaudeResponse } from "@/lib/ai-helpers"

interface ConversationHistory {
  role: "avatar" | "child"
  content: string
  timestamp: number
}

interface ConversationContextType {
  history: ConversationHistory[]
  addChildMessage: (message: string) => void
  generateAvatarResponse: (childInput?: string) => Promise<string>
  isProcessing: boolean
  currentQuestion: string
  suggestNewQuestion: () => void
  clearHistory: () => void
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined)

export const ConversationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<ConversationHistory[]>([])
  const [currentContext, setCurrentContext] = useState<string>("wellness")
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<string>("")

  // Load conversation history from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHistory = localStorage.getItem("conversationHistory")
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory)
          // Only keep the last 20 messages to avoid too much context
          setHistory(parsedHistory.slice(-20))
        } catch (error) {
          console.error("Error parsing conversation history:", error)
        }
      }

      // Set initial question
      suggestNewQuestion()
    }
  }, [])

  // Save conversation history to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("conversationHistory", JSON.stringify(history))
    }
  }, [history])

  const addChildMessage = (message: string) => {
    setHistory((prev) => [
      ...prev,
      {
        role: "child",
        content: message,
        timestamp: Date.now(),
      },
    ])
  }

  const addAvatarMessage = (message: string) => {
    setHistory((prev) => [
      ...prev,
      {
        role: "avatar",
        content: message,
        timestamp: Date.now(),
      },
    ])
  }

  const generateAvatarResponse = async (childInput?: string): Promise<string> => {
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

  const suggestNewQuestion = () => {
    const questions = [
      "What's your favorite way to exercise?",
      "Did you drink water today?",
      "What's your favorite healthy snack?",
      "How do you feel right now?",
      "Did you try any new foods lately?",
      "What makes you feel happy?",
      "How did you sleep last night?",
      "What's your favorite fruit?",
      "Do you like to play outside?",
      "What's your favorite vegetable?",
    ]

    const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
    setCurrentQuestion(randomQuestion)
  }

  const clearHistory = () => {
    setHistory([])
    if (typeof window !== "undefined") {
      localStorage.removeItem("conversationHistory")
    }
  }

  return (
    <ConversationContext.Provider
      value={{
        history,
        addChildMessage,
        generateAvatarResponse,
        isProcessing,
        currentQuestion,
        suggestNewQuestion,
        clearHistory,
      }}
    >
      {children}
    </ConversationContext.Provider>
  )
}

export const useConversation = () => {
  const context = useContext(ConversationContext)
  if (context === undefined) {
    throw new Error("useConversation must be used within a ConversationProvider")
  }
  return context
}
