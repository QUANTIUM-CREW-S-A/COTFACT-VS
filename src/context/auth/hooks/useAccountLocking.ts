import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Hook para manejar el bloqueo de cuentas por intentos fallidos de inicio de sesión
 */
export const useAccountLocking = () => {
  // Número máximo de intentos fallidos antes de bloquear la cuenta
  const MAX_LOGIN_ATTEMPTS = 5;
  // Duración del bloqueo en minutos
  const LOCK_DURATION_MINUTES = 15;

  /**
   * Verifica si la cuenta está bloqueada
   */
  const isAccountLocked = async (email: string): Promise<{ locked: boolean; remainingMinutes: number }> => {
    try {
      // Buscar el perfil por email
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('bloqueado_hasta')
        .eq('email', email)
        .single();

      if (error) {
        console.error("Error verificando estado de bloqueo:", error);
        return { locked: false, remainingMinutes: 0 };
      }

      if (!profile || !profile.bloqueado_hasta) {
        return { locked: false, remainingMinutes: 0 };
      }

      const lockExpiry = new Date(profile.bloqueado_hasta);
      const now = new Date();

      // Si la fecha de bloqueo ya pasó, la cuenta ya no está bloqueada
      if (lockExpiry <= now) {
        // Resetear el bloqueo y los intentos
        await resetLockStatus(email);
        return { locked: false, remainingMinutes: 0 };
      }

      // Calcular minutos restantes de bloqueo
      const remainingMilliseconds = lockExpiry.getTime() - now.getTime();
      const remainingMinutes = Math.ceil(remainingMilliseconds / (1000 * 60));

      return { 
        locked: true, 
        remainingMinutes 
      };
    } catch (error) {
      console.error("Error al verificar bloqueo de cuenta:", error);
      // Por defecto, considerar que no está bloqueada en caso de error
      return { locked: false, remainingMinutes: 0 };
    }
  };

  /**
   * Incrementa el contador de intentos fallidos
   */
  const incrementFailedAttempts = async (email: string): Promise<{ blocked: boolean; attemptsRemaining: number }> => {
    try {
      // Buscar el perfil por email
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('intentos_fallidos, bloqueado_hasta')
        .eq('email', email)
        .single();

      if (error) {
        console.error("Error obteniendo intentos fallidos:", error);
        return { blocked: false, attemptsRemaining: MAX_LOGIN_ATTEMPTS };
      }

      // Si no se encuentra el perfil
      if (!profile) {
        return { blocked: false, attemptsRemaining: MAX_LOGIN_ATTEMPTS };
      }

      // Verificar si la cuenta ya está bloqueada
      if (profile.bloqueado_hasta) {
        const lockExpiry = new Date(profile.bloqueado_hasta);
        const now = new Date();
        
        // Si aún está en período de bloqueo
        if (lockExpiry > now) {
          const remainingMinutes = Math.ceil((lockExpiry.getTime() - now.getTime()) / (1000 * 60));
          return { blocked: true, attemptsRemaining: 0 };
        }
      }

      // Incrementar el contador de intentos
      const currentAttempts = profile.intentos_fallidos || 0;
      const newAttempts = currentAttempts + 1;
      
      // Determinar si se debe bloquear la cuenta
      const shouldBlock = newAttempts >= MAX_LOGIN_ATTEMPTS;
      
      // Calcular fecha de bloqueo si es necesario
      const lockUntil = shouldBlock 
        ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000).toISOString() 
        : null;

      // Actualizar la base de datos
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          intentos_fallidos: shouldBlock ? 0 : newAttempts,  // Reset attempts if account is blocked
          bloqueado_hasta: lockUntil
        })
        .eq('email', email);

      if (updateError) {
        console.error("Error actualizando intentos fallidos:", updateError);
      }

      return {
        blocked: shouldBlock,
        attemptsRemaining: shouldBlock ? 0 : MAX_LOGIN_ATTEMPTS - newAttempts
      };
    } catch (error) {
      console.error("Error al incrementar intentos fallidos:", error);
      return { blocked: false, attemptsRemaining: MAX_LOGIN_ATTEMPTS };
    }
  };

  /**
   * Resetea el estado de bloqueo y los intentos fallidos
   */
  const resetLockStatus = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          intentos_fallidos: 0, 
          bloqueado_hasta: null 
        })
        .eq('email', email);

      if (error) {
        console.error("Error reseteando estado de bloqueo:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error al resetear estado de bloqueo:", error);
      return false;
    }
  };

  return {
    isAccountLocked,
    incrementFailedAttempts,
    resetLockStatus,
    MAX_LOGIN_ATTEMPTS,
    LOCK_DURATION_MINUTES
  };
};