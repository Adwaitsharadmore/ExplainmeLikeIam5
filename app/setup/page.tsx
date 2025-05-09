"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { VolumeIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export default function SetupPage() {
  const router = useRouter()
  const [dailyLimit, setDailyLimit] = useState(30)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Store settings
      localStorage.setItem("dailyLimit", dailyLimit.toString())
      localStorage.setItem("setupComplete", "true")

      // Navigate to profile creation
      router.push("/create-profile")
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const playVoiceSample = () => {
    // This would normally fetch a sample from ElevenLabs
    const audio = new Audio("/sample-voice.mp3")
    audio.play()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-2xl shadow-lg border-2 border-blue-100">
        <CardHeader className="bg-blue-50 border-b border-blue-100">
          <CardTitle className="text-2xl text-blue-700">Parent Zone</CardTitle>
          <CardDescription>Please set up the adventure for your child</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-sm mb-4">
              <p className="font-medium text-green-800">API Keys Configured!</p>
              <p className="text-green-700">
                The app is already configured with API keys for AI features. You can proceed directly to creating your
                child's profile.
              </p>
            </div>

            <div className="space-y-2 pt-4">
              <Label htmlFor="daily-limit" className="text-lg font-medium">
                Adventure Settings
              </Label>
              <div className="flex items-center justify-between">
                <span>Daily time limit</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{dailyLimit} minutes</span>
                  <Input
                    id="daily-limit"
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(Number.parseInt(e.target.value))}
                    className="w-32"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span>Enable voice narration</span>
                <Switch defaultChecked />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm">
              <p className="font-medium text-blue-800">Voice Preview:</p>
              <div className="flex items-center gap-2 mt-2">
                <Button type="button" variant="outline" onClick={playVoiceSample} className="text-blue-600">
                  <VolumeIcon className="h-4 w-4 mr-2" />
                  Preview Voice
                </Button>
                <p className="text-blue-700 text-sm">Click to hear how the AI voice will sound during the adventure.</p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-blue-100 pt-4">
            <Button variant="outline" type="button" onClick={() => router.push("/")}>
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? "Saving..." : "Continue to Profile Creation"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
