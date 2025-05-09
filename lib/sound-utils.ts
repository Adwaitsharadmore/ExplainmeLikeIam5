// Sound utility functions

// Speak text using browser's speech synthesis
export function speakText(text: string, rate = 0.9, pitch = 1.1): void {
  if ("speechSynthesis" in window) {
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.pitch = pitch
      window.speechSynthesis.speak(utterance)
    } catch (error) {
      console.error("Error using browser speech synthesis:", error)
    }
  }
}

// Stop any ongoing speech
export function stopSpeech(): void {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel()
  }
}

// Play a sound
export function playSound(src: string, volume = 1, loop = false): HTMLAudioElement | null {
  try {
    const audio = new Audio(src)
    audio.volume = volume
    audio.loop = loop
    audio.play().catch((error) => console.error("Error playing sound:", error))
    return audio
  } catch (error) {
    console.error("Error creating or playing sound:", error)
    return null
  }
}

// Stop a sound
export function stopSound(audio: HTMLAudioElement | null): void {
  if (audio) {
    audio.pause()
    audio.currentTime = 0
  }
}

// Stop all sounds
export function stopAllSounds(): void {
  stopSpeech()
}

// Preload common sounds
export function preloadCommonSounds(): void {
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
}

// Create fallback sound
export function createFallbackSound(): void {
  // Do nothing
}
