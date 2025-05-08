import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials')
}

// Garantizar singleton incluso en hot reload/desarrollo
const globalForSupabase = typeof window !== 'undefined' ? (window as any) : globalThis;

if (!globalForSupabase.__cotfact_supabase) {
  globalForSupabase.__cotfact_supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'cotfact-auth',
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      },
      debug: false // Deshabilitar los registros de depuración de realtime
    },
    logger: {
      level: 'error' // Solo mostrar errores, no información ni advertencias
    }
  });
}

export const supabase = globalForSupabase.__cotfact_supabase;

if (!globalForSupabase.__cotfact_supabaseAdmin) {
  globalForSupabase.__cotfact_supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      storageKey: 'cotfact-auth-admin'
    }
  });
}

export const supabaseAdmin = globalForSupabase.__cotfact_supabaseAdmin;