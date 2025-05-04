import { AuthState } from "../types";
import { Dispatch, SetStateAction } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { User, UserRole } from "@/types/auth";
import { useAccountLocking } from "./useAccountLocking";
import { useActivityLog } from "./useActivityLog";

interface UseAuthLoginProps {
  authState: AuthState;
  setAuthState: Dispatch<SetStateAction<AuthState>>;
}

export const useAuthLogin = ({ authState, setAuthState }: UseAuthLoginProps) => {
  // Usar el hook de bloqueo de cuentas
  const { isAccountLocked, incrementFailedAttempts, resetLockStatus } = useAccountLocking();
  // Usar el hook de registro de actividades pasando el estado de autenticación como parámetro
  const { logActivity } = useActivityLog({ authState });

  const createInitialProfile = async (userId: string) => {
    try {
      const profile = {
        id: userId,
        username: "admin",
        email: "admin@example.com",
        full_name: "Administrator",
        role: "root",
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        two_factor_enabled: false,
        two_factor_secret: null,
        // Campos para bloqueo de cuenta
        intentos_fallidos: 0,
        bloqueado_hasta: null
      };

      // Enable Supabase realtime for profiles
      await supabase.rpc('enable_realtime_for_table', { table_name: 'profiles' });

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'id' });

      if (profileError) throw profileError;

      // Registrar la creación del usuario administrador
      await logActivity(
        'user_created',
        'Usuario administrador inicial creado',
        'info',
        { username: 'admin', role: 'root' }
      );

      return profile;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const email = username === 'admin' ? 'admin@example.com' : username.includes('@') ? username : `${username}@example.com`;

      // Verificar si es el primer inicio de sesión
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const isFirstLogin = count === 0;

      // Primera vez que se ejecuta la aplicación - crear usuario administrador
      if (isFirstLogin && username === 'admin' && password === 'admin123') {
        console.log("First time setup - creating root user");

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: "admin",
              full_name: "Administrator",
              role: "root"
            }
          }
        });

        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error('No se pudo crear el usuario');

        await createInitialProfile(authData.user.id);

        setAuthState({
          currentUser: {
            id: authData.user.id,
            username: "admin",
            fullName: "Administrator",
            email: authData.user.email!,
            role: "root",
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            twoFactorEnabled: false,
            intentos_fallidos: 0,
            bloqueado_hasta: null
          } as User,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          verifying2FA: false
        });

        toast.success('Bienvenido, Administrador');
        return true;
      }

      // Si no es el primer inicio, o si no es admin/admin123, intento normal de login
      
      // Verificar si la cuenta está bloqueada
      const { locked, remainingMinutes } = await isAccountLocked(email);
      
      if (locked) {
        const errorMessage = `Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intenta nuevamente en ${remainingMinutes} minutos.`;
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage
        }));
        toast.error(errorMessage);
        
        // Registrar intento de acceso a cuenta bloqueada
        await logActivity(
          'failed_login',
          `Intento de acceso a cuenta bloqueada: ${email}`,
          'warning',
          { email, reason: 'account_locked', remainingMinutes }
        );
        
        return false;
      }

      // Intento de login normal
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      // Si hay error de autenticación, incrementar contador de intentos fallidos
      if (signInError) {
        // Si el error es "User already registered", intentar iniciar sesión directamente
        // Este error ocurre cuando se usa admin/admin123 y el usuario ya existe
        if (signInError.message?.includes('already registered') && username === 'admin' && password === 'admin123') {
          console.log("Usuario ya registrado, intentando iniciar sesión directamente");
          return await login('admin@example.com', password);
        }
        
        const { blocked, attemptsRemaining } = await incrementFailedAttempts(email);
        
        if (blocked) {
          const errorMessage = "Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intenta nuevamente más tarde.";
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: errorMessage
          }));
          toast.error(errorMessage);
          
          // Registrar bloqueo de cuenta
          await logActivity(
            'account_locked',
            `Cuenta bloqueada por exceder límite de intentos: ${email}`,
            'critical',
            { email, reason: 'max_attempts_exceeded' }
          );
        } else {
          const errorMessage = `Credenciales incorrectas. Te quedan ${attemptsRemaining} intento(s) antes del bloqueo temporal.`;
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: errorMessage
          }));
          toast.error(errorMessage);
          
          // Registrar intento fallido
          await logActivity(
            'failed_login',
            `Intento fallido para: ${email}`,
            'warning',
            { email, attemptsRemaining }
          );
        }
        
        return false;
      }

      // Si hay usuario autenticado
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;
        if (!profile) throw new Error('Perfil no encontrado');

        const userRole: UserRole = (profile.role === 'root' || profile.role === 'admin' || profile.role === 'audit')
          ? profile.role as UserRole
          : 'audit';  // Rol predeterminado si no tiene uno válido

        // Resetear intentos fallidos y estado de bloqueo al iniciar sesión con éxito
        await resetLockStatus(email);

        // Actualizar último inicio de sesión
        await supabase
          .from('profiles')
          .update({ 
            last_login: new Date().toISOString(),
            intentos_fallidos: 0,
            bloqueado_hasta: null 
          })
          .eq('id', data.user.id);

        setAuthState({
          currentUser: {
            id: profile.id,
            username: profile.username,
            fullName: profile.full_name,
            email: profile.email,
            role: userRole,
            createdAt: profile.created_at,
            lastLogin: new Date().toISOString(),
            twoFactorEnabled: profile.two_factor_enabled,
            twoFactorSecret: profile.two_factor_secret,
            // Añadir datos de bloqueo
            intentos_fallidos: 0,
            bloqueado_hasta: null
          } as User,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          verifying2FA: false
        });

        // Registrar inicio de sesión exitoso
        await logActivity(
          'login',
          `Inicio de sesión exitoso: ${profile.username}`,
          'info',
          { username: profile.username, role: userRole }
        );

        toast.success(`Bienvenido, ${profile.full_name}`);
        return true;
      }

      throw new Error('No se pudo autenticar el usuario');

    } catch (error) {
      console.error("Error during login:", error);
      const message = error instanceof Error ? error.message : "Error desconocido";
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: message
      }));
      toast.error(message);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Registrar cierre de sesión antes de cerrar la sesión
      if (authState.currentUser) {
        await logActivity(
          'logout',
          `Cierre de sesión: ${authState.currentUser.username}`,
          'info'
        );
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error during logout:", error);
        throw error;
      }
      
      setAuthState({
        currentUser: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        verifying2FA: false
      });
      
      toast.success("Sesión cerrada con éxito");
    } catch (error) {
      console.error("Exception during logout:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  return {
    login,
    logout
  };
};
