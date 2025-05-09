import { createClient as createSupabaseClient } from "@supabase/supabase-js"

let supabase: ReturnType<typeof createSupabaseClient> | null = null

export const createClient = () => {
  if (supabase) return supabase

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials not found, running in offline mode")
    // Return a mock client that doesn't throw errors when methods are called
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    } as any
  }

  supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)
  return supabase
}
