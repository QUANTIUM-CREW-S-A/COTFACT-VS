
import { User } from "@/types/auth";
import { AuthState } from "./types";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import * as OTPAuth from "otpauth";

interface TwoFAActionsProps {
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  authState: AuthState;
  setAuthState: Dispatch<SetStateAction<AuthState>>;
}

export const use2FAActions = ({ users, setUsers, authState, setAuthState }: TwoFAActionsProps) => {
  // Verify 2FA code
  const verify2FACode = (code: string): boolean => {
    // Input validation
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      setAuthState(prev => ({
        ...prev,
        error: "El código debe ser de 6 dígitos numéricos."
      }));
      toast.error("Código inválido: debe ser de 6 dígitos");
      return false;
    }

    if (!authState.pendingUser) {
      setAuthState(prev => ({
        ...prev,
        error: "No hay usuario pendiente de verificación"
      }));
      toast.error("Error de verificación: No hay usuario pendiente");
      return false;
    }

    const user = users.find(u => u.id === authState.pendingUser?.id);
    
    if (!user) {
      setAuthState(prev => ({
        ...prev,
        error: "Usuario no encontrado"
      }));
      toast.error("Error de verificación: Usuario no encontrado");
      return false;
    }
    
    if (!user.twoFactorSecret) {
      setAuthState(prev => ({
        ...prev,
        error: "Error de configuración 2FA. Contacte al administrador."
      }));
      toast.error("Error de verificación: Configuración 2FA incompleta");
      return false;
    }

    try {
      // Verify OTP code
      const totp = new OTPAuth.TOTP({
        secret: user.twoFactorSecret,
        digits: 6,
        period: 30,
        algorithm: "SHA1"
      });

      // Use a window of 1 to allow for slight time drifts (±30 seconds)
      const isValid = totp.validate({ token: code, window: 1 }) !== null;
      
      if (isValid) {
        // Update last login time
        const updatedUser = { 
          ...user, 
          lastLogin: new Date().toISOString() 
        };
        
        // Update user in users array
        setUsers(prev => 
          prev.map(u => u.id === user.id ? updatedUser : u)
        );

        // Set successful auth state
        setAuthState({
          currentUser: updatedUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          verifying2FA: false,
          pendingUser: undefined
        });

        toast.success(`Verificación completada. Bienvenido, ${user.fullName}`);
        return true;
      } else {
        setAuthState(prev => ({
          ...prev,
          error: "Código inválido o expirado. Por favor, intenta de nuevo."
        }));
        
        toast.error("Código inválido o expirado");
        return false;
      }
    } catch (error) {
      console.error("Error al verificar código 2FA:", error);
      setAuthState(prev => ({
        ...prev,
        error: "Error en la verificación. Por favor, intenta de nuevo."
      }));
      
      toast.error("Error en la verificación");
      return false;
    }
  };

  // Generate 2FA secret
  const generate2FASecret = (userId: string) => {
    if (!userId) {
      throw new Error("ID de usuario no válido");
    }

    const user = users.find(u => u.id === userId);
    
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    try {
      // Generate a new secret
      const secret = new OTPAuth.Secret().base32;
      
      // Create the OTP auth URL
      const totp = new OTPAuth.TOTP({
        issuer: "VIANG",
        label: user.email || user.username,
        secret,
        digits: 6,
        period: 30,
        algorithm: "SHA1"
      });

      const otpauth = totp.toString();
      
      // Update user with secret but don't enable 2FA yet
      const updatedUser = {
        ...user,
        twoFactorSecret: secret
      };
      
      // Update users array
      setUsers(prev => 
        prev.map(u => u.id === user.id ? updatedUser : u)
      );
      
      // If this is the current user, update auth state
      if (authState.currentUser?.id === userId) {
        setAuthState(prev => ({
          ...prev,
          currentUser: updatedUser
        }));
      }
      
      return { 
        secret,
        url: otpauth
      };
    } catch (error) {
      console.error("Error al generar secreto 2FA:", error);
      throw new Error("Error al generar secreto 2FA");
    }
  };

  // Enable 2FA for a user
  const enable2FA = (userId: string, code: string): boolean => {
    // Input validation
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      toast.error("Código inválido: debe ser de 6 dígitos");
      return false;
    }

    if (!userId) {
      toast.error("ID de usuario no válido");
      return false;
    }

    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      toast.error("Usuario no encontrado");
      return false;
    }

    const user = users[userIndex];
    
    if (!user.twoFactorSecret) {
      toast.error("Primero debes generar un secreto 2FA");
      return false;
    }

    try {
      // Verify the code
      const totp = new OTPAuth.TOTP({
        secret: user.twoFactorSecret,
        digits: 6,
        period: 30,
        algorithm: "SHA1"
      });

      const isValid = totp.validate({ token: code, window: 1 }) !== null;
      
      if (isValid) {
        // Enable 2FA for the user
        const updatedUser = {
          ...user,
          twoFactorEnabled: true
        };

        // Update users array
        const updatedUsers = [...users];
        updatedUsers[userIndex] = updatedUser;
        setUsers(updatedUsers);

        // If this is the current user, update auth state
        if (authState.currentUser?.id === userId) {
          setAuthState(prev => ({
            ...prev,
            currentUser: updatedUser
          }));
        }

        toast.success("Autenticación de dos factores activada con éxito");
        return true;
      } else {
        toast.error("Código inválido. No se pudo activar 2FA.");
        return false;
      }
    } catch (error) {
      console.error("Error al verificar código para activar 2FA:", error);
      toast.error("Error al activar 2FA");
      return false;
    }
  };

  // Disable 2FA for a user
  const disable2FA = (userId: string): boolean => {
    if (!userId) {
      toast.error("ID de usuario no válido");
      return false;
    }

    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      toast.error("Usuario no encontrado");
      return false;
    }

    try {
      // Disable 2FA for the user
      const updatedUser = {
        ...users[userIndex],
        twoFactorEnabled: false,
        twoFactorSecret: undefined
      };

      // Update users array
      const updatedUsers = [...users];
      updatedUsers[userIndex] = updatedUser;
      setUsers(updatedUsers);

      // If this is the current user, update auth state
      if (authState.currentUser?.id === userId) {
        setAuthState(prev => ({
          ...prev,
          currentUser: updatedUser
        }));
      }

      toast.success("Autenticación de dos factores desactivada");
      return true;
    } catch (error) {
      console.error("Error al desactivar 2FA:", error);
      toast.error("Error al desactivar 2FA");
      return false;
    }
  };

  return {
    verify2FACode,
    generate2FASecret,
    enable2FA,
    disable2FA
  };
};
