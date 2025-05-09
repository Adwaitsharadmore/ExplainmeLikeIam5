"use client"

import { useEffect } from "react"

// List of all assets to preload
const ASSETS_TO_PRELOAD = [
  // Zone icons
  "/images/hydration-icon.png",
  "/images/nutrition-icon.png",
  "/images/movement-icon.png",
  "/images/mindfulness-icon.png",
  "/images/mystery-icon.png",

  // Backgrounds
  "/images/kingdom-map-bg.png",
  "/images/hydration-realm-bg.png",
  "/images/desert-bg.png",
  "/images/nutrition-kingdom-bg.png",
  "/images/movement-galaxy-bg.png",
  "/images/mindfulness-garden-bg.png",
  "/images/mystery-zone-bg.png",

  // Characters
  "/images/droplet-guide.png",
  "/images/desert-guide.png",
  "/images/nutrition-guide.png",
  "/images/movement-guide.png",
  "/images/mindfulness-guide.png",
  "/images/mystery-guide.png",

  // Items
  "/images/water-crystal.png",
  "/images/aqua-sprite.png",
  "/images/water-bottle.png",
  "/images/desert-trophy.png",
  "/images/frog.png",
  "/images/bear.png",
  "/images/crab.png",
  "/images/elephant.png",

  // Decorative elements
  "/images/cloud1.png",
  "/images/cloud2.png",
  "/images/heat-shimmer.png",
  "/images/water-bg.png",
]

export function AssetPreloader() {
  useEffect(() => {
    // Preload all images
    ASSETS_TO_PRELOAD.forEach((src) => {
      const img = new Image()
      img.src = src
    })

    // Preload sounds
    const soundsToPreload = [
      "/sounds/hub-music.mp3",
      "/sounds/water-collect.mp3",
      "/sounds/correct-answer.mp3",
      "/sounds/wrong-answer.mp3",
      "/sounds/level-complete.mp3",
      "/sounds/badge-earned.mp3",
      "/sounds/click.mp3",
      "/sounds/hover.mp3",
      "/sounds/locked.mp3",
      "/sounds/portal-enter.mp3",
      "/sounds/desert-ambient.mp3",
      "/sounds/mystery-ambient.mp3",
    ]

    soundsToPreload.forEach((src) => {
      const audio = new Audio()
      audio.src = src
    })
  }, [])

  return null
}
