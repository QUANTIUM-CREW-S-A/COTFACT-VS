// filepath: /home/dark/Documentos/QUANTIUM CREW S.A/Repositorios/COTFACT-VS/src/integrations/supabase/client.ts
// Import and re-export the singleton Supabase client instance
// instead of creating a new one which causes the "Multiple GoTrueClient instances" warning
import { supabase as supabaseInstance } from '@/lib/supabase';

// Re-export the singleton instance
export const supabase = supabaseInstance;

// Add a warning to prevent direct imports from @supabase/supabase-js
// This helps developers to use our singleton instead
if (process.env.NODE_ENV === 'development') {
  console.warn(
    'IMPORTANTE: Siempre importa el cliente Supabase desde @/integrations/supabase/client o @/lib/supabase para evitar múltiples instancias'
  );
}
