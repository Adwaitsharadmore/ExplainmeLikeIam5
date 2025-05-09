"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface MissionLayoutProps {
  children: ReactNode
  title: string
  zoneName: string
  zoneColor: string
  zoneIcon: ReactNode
  backgroundImage?: string
}

export function MissionLayout({ children, title, zoneName, zoneColor, zoneIcon, backgroundImage }: MissionLayoutProps) {
  const router = useRouter()

  const getColorClasses = () => {
    switch (zoneColor) {
      case "blue":
        return {
          bg: "bg-gradient-to-b from-blue-50 to-cyan-50",
          header: "text-blue-700",
          icon: "text-blue-500",
        }
      case "green":
        return {
          bg: "bg-gradient-to-b from-green-50 to-emerald-50",
          header: "text-green-700",
          icon: "text-green-500",
        }
      case "orange":
        return {
          bg: "bg-gradient-to-b from-orange-50 to-yellow-50",
          header: "text-orange-700",
          icon: "text-orange-500",
        }
      case "purple":
        return {
          bg: "bg-gradient-to-b from-purple-50 to-violet-50",
          header: "text-purple-700",
          icon: "text-purple-500",
        }
      case "yellow":
        return {
          bg: "bg-gradient-to-b from-amber-50 to-yellow-50",
          header: "text-amber-800",
          icon: "text-amber-500",
        }
      default:
        return {
          bg: "bg-gradient-to-b from-gray-50 to-slate-50",
          header: "text-gray-700",
          icon: "text-gray-500",
        }
    }
  }

  const colorClasses = getColorClasses()

  const handleBackClick = () => {
    router.push("/mission-hub")
  }

  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {}

  return (
    <div className={`min-h-screen ${colorClasses.bg} p-4`} style={backgroundStyle}>
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-sm">
          <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={handleBackClick}>
            <ArrowLeft className="h-4 w-4" /> Back to Hub
          </Button>
          <div className="flex items-center gap-2">
            {zoneIcon}
            <h1 className={`text-xl font-bold ${colorClasses.header}`}>{zoneName}</h1>
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  )
}
