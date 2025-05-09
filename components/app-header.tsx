"use client"

import { Logo } from "./logo"
import { Button } from "./ui/button"
import { Home, Settings, VolumeX, Volume2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface AppHeaderProps {
  points?: number
  streak?: number
}

export function AppHeader({ points = 0, streak = 1 }: AppHeaderProps) {
  const [isMuted, setIsMuted] = useState(false)

  const toggleMute = () => {
    setIsMuted(!isMuted)
    // Sound toggle functionality would go here if we had sound
  }

  return (
    <header className="bg-gradient-to-r from-green-500 to-teal-500 p-3 shadow-md flex items-center justify-between">
      <div className="flex items-center">
        <Logo size="sm" />
      </div>

      <div className="flex items-center gap-2">
        <div className="bg-white rounded-full px-4 py-1 flex items-center gap-1 shadow-sm">
          <span className="text-yellow-500">⭐</span>
          <span className="font-bold text-green-700">{points} Points</span>
        </div>

        <div className="bg-white rounded-full px-4 py-1 flex items-center gap-1 shadow-sm">
          <span className="text-orange-500">🔥</span>
          <span className="font-bold text-green-700">Day {streak} Streak</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20">
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </Button>

        <Link href="/mission-hub">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <Home size={20} />
          </Button>
        </Link>

        <Link href="/settings">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <Settings size={20} />
          </Button>
        </Link>
      </div>
    </header>
  )
}
