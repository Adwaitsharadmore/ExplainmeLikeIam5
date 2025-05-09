// Nutrition Kingdom Game – Immersive Edition with Nuri Popups

"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Apple, ArrowLeft, VolumeIcon as VolumeUp, Trophy, Map } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { generateAIResponse } from "@/lib/ai-service"

const FOOD_GROUPS = [
  {
    name: "Fruitopia",
    color: "#F87171",
    foods: [
      { id: "apple", name: "Apple", image: "/images/apple.jpg" },
      { id: "banana", name: "Banana", image: "/images/banana.jpg" },
      { id: "orange", name: "Orange", image: "/images/orange.jpg" },
      { id: "strawberry", name: "Strawberry", image: "/images/strawberry.jpg" },
    ],
  },
  {
    name: "Veggie Valley",
    color: "#34D399",
    foods: [
      { id: "broccoli", name: "Broccoli", image: "/images/brocoli.jpg" },
      { id: "carrot", name: "Carrot", image: "/images/carrot.jpg" },
      { id: "spinach", name: "Spinach", image: "/images/spinach.jpg" },
      { id: "tomato", name: "Tomato", image: "/images/tamato.jpg" },
    ],
  },
  {
    name: "Grain Grotto",
    color: "#FBBF24",
    foods: [
      { id: "bread", name: "Bread", image: "/images/bread.jpg" },
      { id: "rice", name: "Rice", image: "/images/rice.jpg" },
      { id: "pasta", name: "Pasta", image: "/images/pasta.jpg" },
      { id: "oats", name: "Oats", image: "/images/otas.jpg" },
    ],
  },
  {
    name: "Protein Peaks",
    color: "#60A5FA",
    foods: [
      { id: "chicken", name: "Chicken", image: "/images/chicken.jpg" },
      { id: "beans", name: "Beans", image: "/images/beans.jpeg" },
      { id: "eggs", name: "Eggs", image: "/images/eggs.jpg" },
      { id: "fish", name: "Fish", image: "/images/fish.jpg" },
    ],
  },
]

const FOOD_MESSAGES = {
  apple: "Apples are great for your heart and give you fiber power!",
  banana: "Bananas help with energy and keep your tummy happy!",
  orange: "Oranges are full of vitamin C to help you fight colds!",
  strawberry: "Strawberries are sweet and help your skin glow!",
  broccoli: "Broccoli makes your bones strong and healthy!",
  carrot: "Carrots help you see better in the dark!",
  spinach: "Spinach gives you super strength like Popeye!",
  tomato: "Tomatoes keep your heart healthy!",
  bread: "Bread gives you energy to run and play!",
  rice: "Rice fills your tummy and keeps you active!",
  pasta: "Pasta powers your brain for school!",
  oats: "Oats are perfect for breakfast fuel!",
  chicken: "Chicken helps build strong muscles!",
  beans: "Beans are full of plant power protein!",
  eggs: "Eggs make your brain super smart!",
  fish: "Fish helps your brain and eyes grow sharp!"
}
function NuriPopup({ message, onClose }) {
  return (
    <motion.div
      initial={{ scale: 0.3, opacity: 0 }}
      animate={{ scale: 1.1, opacity: 1 }}
      exit={{ scale: 0.3, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="fixed inset-0 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-xl shadow-2xl border-4 border-green-400 p-6 max-w-md text-center">
        <div className="flex justify-center mb-3 rounded-full">
          <Image src="/images/nutri.png" alt="Nuri" width={80} height={80} className="rounded-full"/>
        </div>
        <p className="text-lg font-bold text-green-800 leading-snug mb-3">{message}</p>
        <Button
          variant="default"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full"
          onClick={onClose}
        >
          Got it, Nuri!
        </Button>
      </div>
    </motion.div>
  )
}

export default function NutritionKingdomGame() {
  const router = useRouter()
  const [heroProfile, setHeroProfile] = useState(null)
  const [nutritionLevel, setNutritionLevel] = useState(0)
  const [currentRealm, setCurrentRealm] = useState(0)
  const [selectedFoods, setSelectedFoods] = useState([])
  const [showCompletion, setShowCompletion] = useState(false)
  const [aiResponse, setAIResponse] = useState("")
  const [nuriMessage, setNuriMessage] = useState("")
  const [showNuriPopup, setShowNuriPopup] = useState(false)

  const showNuri = (text) => {
    setNuriMessage(text)
    setShowNuriPopup(true)
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.1
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleFoodClick = (foodId) => {
    if (selectedFoods.includes(foodId)) return
    setSelectedFoods((prev) => [...prev, foodId])
    setNutritionLevel((prev) => Math.min(prev + 6.25, 100))

    const currentGroup = FOOD_GROUPS[currentRealm]
    const allFoodsSelected = currentGroup.foods.every(f => selectedFoods.includes(f.id) || f.id === foodId)

    const message = FOOD_MESSAGES[foodId] || `Yay! ${foodId} is super healthy! 🌟`
    showNuri(message)

    if (allFoodsSelected) {
      setTimeout(() => {
        if (currentRealm < FOOD_GROUPS.length - 1) {
          setCurrentRealm((prev) => prev + 1)
          showNuri(`You've conquered ${currentGroup.name}! Onward to the next realm!`)
        } else {
          setShowCompletion(true)
          fetchAIResponse()
        }
      }, 800)
    }
  }

  const fetchAIResponse = async () => {
    try {
      const response = await generateAIResponse(heroProfile, "nutrition", "food group explorer")
      setAIResponse(response.text)
    } catch (e) {
      setAIResponse("Great job! You explored every realm and unlocked all food powers!")
    }
  }

 return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between mb-4 items-center">
          <Button variant="ghost" onClick={() => router.push("/mission-hub")}>🔙 Back</Button>
          <div className="flex gap-2 items-center">
            <Apple className="text-red-400" />
            <h1 className="text-xl font-bold text-rose-600">Nutrition Kingdom</h1>
          </div>
        </div>

        <AnimatePresence>
          {showNuriPopup && (
            <NuriPopup message={nuriMessage} onClose={() => setShowNuriPopup(false)} />
          )}
        </AnimatePresence>

        {showCompletion ? (
          <Card>
            <CardHeader className="bg-green-50">
              <CardTitle className="text-center">🎉 Mission Complete!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-4">{aiResponse}</p>
              <div className="flex justify-center">
                <Trophy className="text-yellow-500 w-8 h-8" />
                <span className="ml-2 text-green-700">You earned: Food Explorer Badge!</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => router.push("/mission-hub")}>Back to Mission Hub</Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-center">{FOOD_GROUPS[currentRealm].name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={nutritionLevel} className="mb-3 h-4" />
              <div className="grid grid-cols-2 gap-3">
                {FOOD_GROUPS[currentRealm].foods.map(food => (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    key={food.id}
                    className={`p-3 rounded-lg text-center cursor-pointer bg-white border ${selectedFoods.includes(food.id) ? 'border-green-400' : 'hover:bg-yellow-50'}`}
                    onClick={() => handleFoodClick(food.id)}
                  >
                    <Image src={food.image} alt={food.name} width={60} height={60} className="mx-auto mb-1" />
                    <p className="text-sm font-medium">{food.name}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
