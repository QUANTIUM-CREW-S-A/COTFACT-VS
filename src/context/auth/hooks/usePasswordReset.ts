import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const usePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Verificar si el email existe en el sistema
      const { count, error: profileError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('email', email.trim().toLowerCase());
      
      if (profileError) throw profileError;
      
      if (count === 0) {
        throw new Error("No existe una cuenta con este correo electrónico");
      }
      
      // Enviar correo de recuperación usando Supabase Auth
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al solicitar el restablecimiento de contraseña";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success("Contraseña actualizada correctamente");
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar la contraseña";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    requestPasswordReset,
    updatePassword
  };
};