import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizes = {
    sm: { width: 40, height: 40, textSize: "text-lg" },
    md: { width: 60, height: 60, textSize: "text-xl" },
    lg: { width: 100, height: 100, textSize: "text-3xl" },
  }

  const { width, height, textSize } = sizes[size]

  return (
    <Link href="/mission-hub" className={`flex items-center gap-2 ${className}`}>
      <div className="relative rounded-full overflow-hidden" style={{ width, height }}>
        <Image
          src="/images/dino-logo.png"
          alt="HealthQuest Kingdom Logo"
          fill
          className="object-cover"
          priority
        />
      </div>
      {showText && (
        <div className={`font-bold ${textSize} text-green-700 tracking-tight`}>
          HealthQuest<span className="text-orange-500">Kingdom</span>
        </div>
      )}
    </Link>
  )
}
