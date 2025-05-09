"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Wand2 } from "lucide-react"

const INTERESTS = [
  { id: "animals", label: "Animals" },
  { id: "space", label: "Space" },
  { id: "dinosaurs", label: "Dinosaurs" },
  { id: "sports", label: "Sports" },
  { id: "magic", label: "Magic" },
  { id: "robots", label: "Robots" },
  { id: "music", label: "Music" },
  { id: "art", label: "Art" },
  { id: "superheroes", label: "Superheroes" },
  { id: "minecraft", label: "Minecraft" },
]

const RANDOM_NAMES = [
  "Sparkle Runner",
  "Zoom Blast",
  "Captain Veggie",
  "Aqua Warrior",
  "Mighty Mover",
  "Energy Flash",
  "Nutrition Ninja",
  "Hydration Hero",
  "Sleep Master",
  "Mindful Marvel",
  "Fruit Force",
  "Veggie Voyager",
]

export default function CreateProfilePage() {
  const router = useRouter()
  const [heroName, setHeroName] = useState("")
  const [age, setAge] = useState("")
  const [grade, setGrade] = useState("")
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const generateRandomName = () => {
    const randomIndex = Math.floor(Math.random() * RANDOM_NAMES.length)
    setHeroName(RANDOM_NAMES[randomIndex])
  }

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId) ? prev.filter((id) => id !== interestId) : [...prev, interestId],
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Save profile data to localStorage
      const profileData = {
        heroName,
        age,
        grade,
        interests: selectedInterests,
        createdAt: new Date().toISOString(),
      }

      localStorage.setItem("heroProfile", JSON.stringify(profileData))

      // Navigate to avatar customization
      router.push("/customize-avatar")
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-2xl shadow-lg border-2 border-green-100">
        <CardHeader className="bg-green-50 border-b border-green-100">
          <CardTitle className="text-2xl text-green-700">Create Your Hero Profile</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="hero-name" className="text-lg font-medium">
                Hero Name
              </Label>
              <div className="flex gap-2">
                <Input
                  id="hero-name"
                  placeholder="Your awesome hero name"
                  value={heroName}
                  onChange={(e) => setHeroName(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateRandomName}
                  className="flex gap-2 items-center"
                >
                  <Wand2 className="h-4 w-4" />
                  Random
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-lg font-medium">
                  Age
                </Label>
                <Select value={age} onValueChange={setAge} required>
                  <SelectTrigger id="age">
                    <SelectValue placeholder="Select your age" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 3).map((age) => (
                      <SelectItem key={age} value={age.toString()}>
                        {age} years old
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade" className="text-lg font-medium">
                  Grade
                </Label>
                <Select value={grade} onValueChange={setGrade} required>
                  <SelectTrigger id="grade">
                    <SelectValue placeholder="Select your grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preschool">Preschool</SelectItem>
                    <SelectItem value="kindergarten">Kindergarten</SelectItem>
                    {Array.from({ length: 6 }, (_, i) => i + 1).map((grade) => (
                      <SelectItem key={grade} value={grade.toString()}>
                        {grade}
                        {getOrdinalSuffix(grade)} Grade
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-medium">What do you love? (Choose at least one)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INTERESTS.map((interest) => (
                  <div key={interest.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest.id}
                      checked={selectedInterests.includes(interest.id)}
                      onCheckedChange={() => toggleInterest(interest.id)}
                    />
                    <Label htmlFor={interest.id} className="cursor-pointer">
                      {interest.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-green-100 pt-4">
            <Button variant="outline" type="button" onClick={() => router.push("/setup")}>
              Back
            </Button>
            <Button
              type="submit"
              disabled={!heroName || !age || !grade || selectedInterests.length === 0 || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Creating..." : "Create Hero"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

function getOrdinalSuffix(num: number): string {
  const j = num % 10
  const k = num % 100

  if (j === 1 && k !== 11) {
    return "st"
  }
  if (j === 2 && k !== 12) {
    return "nd"
  }
  if (j === 3 && k !== 13) {
    return "rd"
  }
  return "th"
}
