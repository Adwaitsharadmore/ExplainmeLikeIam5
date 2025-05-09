"use client"

import { useState } from "react"
import Image from "next/image"

interface FallbackImageProps {
  src: string
  alt: string
  width: number
  height: number
  fallbackSrc?: string
  fallbackEmoji?: string
  className?: string
}

export function FallbackImage({
  src,
  alt,
  width,
  height,
  fallbackSrc = "/placeholder.svg",
  fallbackEmoji,
  className = "",
}: FallbackImageProps) {
  const [error, setError] = useState(false)

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {error ? (
        <div className="flex items-center justify-center bg-gray-100 rounded-md" style={{ width, height }}>
          {fallbackEmoji ? (
            <span className="text-3xl">{fallbackEmoji}</span>
          ) : (
            <Image src={`${fallbackSrc}?height=${height}&width=${width}`} alt={alt} width={width} height={height} />
          )}
        </div>
      ) : (
        <Image src={src || "/placeholder.svg"} alt={alt} width={width} height={height} onError={() => setError(true)} />
      )}
    </div>
  )
}
