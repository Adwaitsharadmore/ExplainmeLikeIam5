"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAvatarContext } from "@/contexts/avatar-context"
import { useConversation } from "@/contexts/conversation-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { generateVoice } from "@/lib/ai-helpers"

export const ConversationalAvatar: React.FC = () => {
  const { avatarState, triggerReaction } = useAvatarContext()
  const { history, generateAvatarResponse, isProcessing, currentQuestion, suggestNewQuestion } = useConversation()
  const [userInput, setUserInput] = useState("")
  const [showChat, setShowChat] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [audioUrl, setAudioUrl] = useState("")
  const [initialGreetingAttempted, setInitialGreetingAttempted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Generate initial greeting if no conversation history
  useEffect(() => {
    const shouldGreet = history.length === 0 && !initialGreetingAttempted

    if (shouldGreet) {
      setInitialGreetingAttempted(true)
      handleInitialGreeting()
    }
  }, [history, initialGreetingAttempted])

  const handleInitialGreeting = async () => {
    try {
      const greeting = await generateAvatarResponse()
      playAvatarVoice(greeting)
    } catch (error) {
      console.error("Error generating initial greeting:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim() || isProcessing) return

    const input = userInput
    setUserInput("")

    // Trigger thinking animation
    triggerReaction("mindful")

    try {
      // Generate response
      const response = await generateAvatarResponse(input)

      // Play voice and trigger celebration
      playAvatarVoice(response)
      triggerReaction("celebrate")
    } catch (error) {
      console.error("Error handling submission:", error)
    }
  }

  const handleQuestionClick = () => {
    // Expand chat when question is clicked
    setIsExpanded(true)
    setShowChat(true)

    // Focus input field
    setTimeout(() => {
      inputRef.current?.focus()
    }, 300)
  }

  const playAvatarVoice = async (text: string) => {
    try {
      const url = await generateVoice(text)
      setAudioUrl(url)

      if (url && audioRef.current) {
        audioRef.current.play().catch((err) => console.error("Error playing audio:", err))
      }
    } catch (error) {
      console.error("Error generating voice:", error)
    }
  }

  const toggleChat = () => {
    setShowChat(!showChat)
    setIsExpanded(!isExpanded)

    // If opening chat, suggest a new question
    if (!showChat) {
      suggestNewQuestion()
    }
  }

  return (
    <>
      <div className={`fixed bottom-4 right-4 z-50 flex flex-col items-end ${isExpanded ? "w-80" : "w-auto"}`}>
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 20, height: 0 }}
              className="bg-white rounded-lg shadow-lg p-4 mb-2 w-full max-h-80 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm">Chat with your Hero</h3>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={toggleChat}>
                  ×
                </Button>
              </div>

              <div className="space-y-3 mb-3">
                {history.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === "avatar" ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-2 text-sm ${
                        msg.role === "avatar" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-blue-100 text-blue-800 rounded-lg p-2 text-sm">
                      <span className="animate-pulse">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 h-8 text-sm"
                  disabled={isProcessing}
                />
                <Button type="submit" size="sm" className="h-8 px-2" disabled={isProcessing || !userInput.trim()}>
                  Send
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {!showChat && history.length > 0 && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="bg-white rounded-lg p-2 mb-2 text-sm max-w-[200px] shadow-md cursor-pointer"
              onClick={handleQuestionClick}
            >
              {currentQuestion}
            </motion.div>
          </AnimatePresence>
        )}

        <motion.div
          className="avatar-container relative w-16 h-16 cursor-pointer bg-white rounded-full shadow-md flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          onClick={toggleChat}
        >
          <div className="text-2xl">
            {avatarState.baseCharacter === "char1"
              ? "🧭"
              : avatarState.baseCharacter === "char2"
                ? "🏃"
                : avatarState.baseCharacter === "char3"
                  ? "🔬"
                  : avatarState.baseCharacter === "char4"
                    ? "🦸"
                    : avatarState.baseCharacter === "char5"
                      ? "🥷"
                      : avatarState.baseCharacter === "char6"
                        ? "🧙"
                        : avatarState.baseCharacter === "char7"
                          ? "👨‍🚀"
                          : "👨‍🍳"}
          </div>

          {/* Notification dot when there's a new message */}
          {!showChat && history.length > 0 && (
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></div>
          )}
        </motion.div>
      </div>

      {/* Audio element for voice */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} />}
    </>
  )
}
