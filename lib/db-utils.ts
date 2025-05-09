import { createClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"

// Types based on the database schema
export interface HeroProfile {
  id?: string
  hero_name: string
  age: string
  grade?: string
  interests: string[]
  badges: string[]
  points: number
  streak: number
  last_check_in: string
  created_at?: string
  updated_at?: string
}

export interface Achievement {
  id?: string
  hero_id: string
  badge_id: string
  earned_at: string
}

export interface MissionProgress {
  id?: string
  hero_id: string
  mission_type: string
  mission_name: string
  score: number
  completed: boolean
  created_at?: string
  updated_at?: string
}

// Get or create hero profile
export async function getOrCreateHeroProfile(): Promise<HeroProfile | null> {
  try {
    const supabase = createClient()

    // Try to get profile from localStorage first
    const profileData = localStorage.getItem("heroProfile")
    if (!profileData) return null

    const localProfile = JSON.parse(profileData)

    // Check if profile exists in database
    const { data: existingProfile } = await supabase
      .from("hero_profiles")
      .select("*")
      .eq("hero_name", localProfile.heroName)
      .single()

    if (existingProfile) {
      // Update local storage with any additional data from database
      const mergedProfile = {
        ...localProfile,
        badges: existingProfile.badges || [],
        points: existingProfile.points || 0,
        streak: existingProfile.streak || 1,
        last_check_in: existingProfile.last_check_in || new Date().toISOString(),
      }
      localStorage.setItem("heroProfile", JSON.stringify(mergedProfile))

      // Also update badges and points in localStorage for legacy support
      localStorage.setItem("badges", JSON.stringify(existingProfile.badges || []))
      localStorage.setItem("points", (existingProfile.points || 0).toString())

      return existingProfile as HeroProfile
    } else {
      // Create new profile in database
      const badges = JSON.parse(localStorage.getItem("badges") || "[]")
      const points = Number.parseInt(localStorage.getItem("points") || "0")
      const streak = Number.parseInt(localStorage.getItem("streak") || "1")
      const lastCheckIn = localStorage.getItem("lastCheckIn") || new Date().toISOString()

      const newProfile: HeroProfile = {
        hero_name: localProfile.heroName,
        age: localProfile.age,
        grade: localProfile.grade || "",
        interests: localProfile.interests || [],
        badges: badges,
        points: points,
        streak: streak,
        last_check_in: lastCheckIn,
      }

      const { data, error } = await supabase.from("hero_profiles").insert(newProfile).select()

      if (error) {
        console.error("Error creating profile:", error)
        return null
      }

      return data[0] as HeroProfile
    }
  } catch (error) {
    console.error("Error in getOrCreateHeroProfile:", error)
    return null
  }
}

// Award a badge to the hero
export async function awardBadge(badgeId: string, points: number): Promise<boolean> {
  try {
    // Update local storage first for immediate feedback
    const badges = JSON.parse(localStorage.getItem("badges") || "[]")
    if (!badges.includes(badgeId)) {
      badges.push(badgeId)
      localStorage.setItem("badges", JSON.stringify(badges))

      // Update points
      const currentPoints = Number.parseInt(localStorage.getItem("points") || "0")
      localStorage.setItem("points", (currentPoints + points).toString())
    }

    // Then update database if possible
    const supabase = createClient()
    const profileData = localStorage.getItem("heroProfile")
    if (!profileData) return false

    const localProfile = JSON.parse(profileData)

    // Get profile from database
    const { data: existingProfile } = await supabase
      .from("hero_profiles")
      .select("id, badges, points")
      .eq("hero_name", localProfile.heroName)
      .single()

    if (existingProfile) {
      // Update profile badges and points
      const updatedBadges = existingProfile.badges || []
      if (!updatedBadges.includes(badgeId)) {
        updatedBadges.push(badgeId)

        await supabase
          .from("hero_profiles")
          .update({
            badges: updatedBadges,
            points: (existingProfile.points || 0) + points,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingProfile.id)

        // Also record in achievements table
        await supabase.from("achievements").insert({
          id: uuidv4(),
          hero_id: existingProfile.id,
          badge_id: badgeId,
          earned_at: new Date().toISOString(),
        })
      }

      return true
    }

    return false
  } catch (error) {
    console.error("Error in awardBadge:", error)
    return false
  }
}

// Record mission progress
export async function recordMissionProgress(
  missionType: string,
  missionName: string,
  score: number,
  completed: boolean,
): Promise<boolean> {
  try {
    const supabase = createClient()
    const profileData = localStorage.getItem("heroProfile")
    if (!profileData) return false

    const localProfile = JSON.parse(profileData)

    // Get profile from database
    const { data: existingProfile } = await supabase
      .from("hero_profiles")
      .select("id")
      .eq("hero_name", localProfile.heroName)
      .single()

    if (existingProfile) {
      // Check if mission progress already exists
      const { data: existingProgress } = await supabase
        .from("mission_progress")
        .select("id, score")
        .eq("hero_id", existingProfile.id)
        .eq("mission_type", missionType)
        .eq("mission_name", missionName)
        .single()

      if (existingProgress) {
        // Only update if new score is higher or mission is now completed
        if (score > existingProgress.score || completed) {
          await supabase
            .from("mission_progress")
            .update({
              score: Math.max(score, existingProgress.score),
              completed: completed || existingProgress.completed,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingProgress.id)
        }
      } else {
        // Create new mission progress
        await supabase.from("mission_progress").insert({
          id: uuidv4(),
          hero_id: existingProfile.id,
          mission_type: missionType,
          mission_name: missionName,
          score: score,
          completed: completed,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }

      return true
    }

    return false
  } catch (error) {
    console.error("Error in recordMissionProgress:", error)
    return false
  }
}

// Update streak and check-in
export async function updateStreak(): Promise<number> {
  try {
    // Get current streak from localStorage
    const storedStreak = localStorage.getItem("streak") || "0"
    const storedLastCheckIn = localStorage.getItem("lastCheckIn")

    // Check if this is a new day
    const today = new Date().toDateString()
    let newStreak = Number.parseInt(storedStreak)

    if (storedLastCheckIn !== today) {
      // Update streak and last check-in
      newStreak = Number.parseInt(storedStreak) + 1
      localStorage.setItem("streak", newStreak.toString())
      localStorage.setItem("lastCheckIn", today)

      // Update database if possible
      const supabase = createClient()
      const profileData = localStorage.getItem("heroProfile")

      if (profileData) {
        const localProfile = JSON.parse(profileData)

        // Get profile from database
        const { data: existingProfile } = await supabase
          .from("hero_profiles")
          .select("id")
          .eq("hero_name", localProfile.heroName)
          .single()

        if (existingProfile) {
          await supabase
            .from("hero_profiles")
            .update({
              streak: newStreak,
              last_check_in: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingProfile.id)
        }
      }
    }

    return newStreak
  } catch (error) {
    console.error("Error in updateStreak:", error)
    return Number.parseInt(localStorage.getItem("streak") || "1")
  }
}

// Get all mission progress for a hero
export async function getHeroMissionProgress(): Promise<MissionProgress[]> {
  try {
    const supabase = createClient()
    const profileData = localStorage.getItem("heroProfile")
    if (!profileData) return []

    const localProfile = JSON.parse(profileData)

    // Get profile from database
    const { data: existingProfile } = await supabase
      .from("hero_profiles")
      .select("id")
      .eq("hero_name", localProfile.heroName)
      .single()

    if (existingProfile) {
      const { data } = await supabase.from("mission_progress").select("*").eq("hero_id", existingProfile.id)

      return data as MissionProgress[]
    }

    return []
  } catch (error) {
    console.error("Error in getHeroMissionProgress:", error)
    return []
  }
}
