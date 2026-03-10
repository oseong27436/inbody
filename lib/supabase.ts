import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type InbodyRecord = {
  id: string
  date: string
  weight: number | null
  muscle: number | null
  fat: number | null
  fat_rate: number | null
  visceral_fat: number | null
  bmr: number | null
  created_at: string
}
