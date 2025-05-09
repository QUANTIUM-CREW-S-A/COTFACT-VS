import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials')
}

// Garantizar singleton incluso en hot reload/desarrollo
const globalForSupabase = typeof window !== 'undefined' ? window : globalThis;

// Crear un ID único para esta instancia de Supabase para evitar problemas de hot-reloading
const SUPABASE_INSTANCE_ID = 'cotfact_supabase_instance_v1';

// Check if we already have an instance with this specific ID
if (!globalForSupabase[SUPABASE_INSTANCE_ID]) {
  globalForSupabase[SUPABASE_INSTANCE_ID] = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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

// Export the singleton instance
export const supabase = globalForSupabase[SUPABASE_INSTANCE_ID];

// Admin client (only used in specific contexts)
const ADMIN_INSTANCE_ID = 'cotfact_supabase_admin_v1';

if (!globalForSupabase[ADMIN_INSTANCE_ID] && supabaseServiceKey) {
  globalForSupabase[ADMIN_INSTANCE_ID] = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      storageKey: 'cotfact-auth-admin'
    }
  });
}

export const supabaseAdmin = globalForSupabase[ADMIN_INSTANCE_ID];