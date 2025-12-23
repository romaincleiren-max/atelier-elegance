import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Mode démo : client Supabase désactivé si pas de config
export const supabase = (supabaseUrl && supabaseUrl !== 'your_supabase_url_here')
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
