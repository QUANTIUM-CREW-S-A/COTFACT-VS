import React, { createContext, useState, ReactNode, useEffect } from "react";
import { UserRole } from "@/types/auth";
import { AuthState, AuthContextType } from "./types";
import { useAuthStorage } from "./useAuthStorage";
import { useAuthActions } from "./useAuthActions";
import { use2FAActions } from "./use2FAActions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from '@/integrations/supabase/types';
import { useLoading } from "../loading/LoadingContext";

// Definir y exportar AuthContext aquí
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Type guard para validar que profileData es un perfil
function isProfile(obj: unknown): obj is Profile {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Profile).id === 'string' &&
    typeof (obj as Profile).email === 'string'
  );
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { startLoading, stopLoading } = useLoading();
  const [authState, setAuthState] = useState<AuthState>({
    currentUser: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    verifying2FA: false
  });

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      startLoading("Verificando sesión de usuario", "AuthProvider");
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (session?.user && mounted) {
          // Verificar si es el primer inicio de sesión y es el usuario admin
          const { count, error: countError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

          if (countError) throw countError;

          // Verificar que count sea un número y compararlo con 0
          const isFirstLogin = typeof count === 'number' && count === 0;

          // Obtener el perfil del usuario
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error("Error fetching profile:", profileError);
            throw new Error("Error al obtener el perfil del usuario");
          }

          if (isProfile(profileData) && mounted) {
            // Establecer el rol de usuario predeterminado
            let userRole: UserRole = 'user';

            // Si es el primer login y el usuario es admin@example.com, asignar rol root
            if (isFirstLogin && session.user.email === 'admin@example.com') {
              userRole = 'root';
              
              const updateData: ProfileUpdate = {
                role: userRole
              };

              const { error: updateError } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', session.user.id);

              if (updateError) {
                console.error("Error updating admin role:", updateError);
                toast.error("Error al actualizar el rol del administrador.");
              }
            } 
            // Si el perfil ya tiene un rol válido, usarlo
            else if (profileData.role && ['root', 'admin', 'user'].includes(profileData.role)) {
              userRole = profileData.role as UserRole;
            }

            // Asegurar que el usuario especial admin-1 siempre tenga rol root
            if (profileData.id === 'admin-1' && userRole !== 'root') {
              userRole = 'root';
            }

            setAuthState({
              currentUser: {
                id: profileData.id,
                username: profileData.username || '',
                fullName: profileData.full_name || '',
                email: profileData.email || '',
                role: userRole,
                createdAt: profileData.created_at || '',
                lastLogin: profileData.last_login || undefined,
                twoFactorEnabled: profileData.two_factor_enabled || false,
                twoFactorSecret: profileData.two_factor_secret || undefined
              },
              isAuthenticated: true,
              isLoading: false,
              error: null,
              verifying2FA: false
            });
            stopLoading("AuthProvider");
          } else if (!profileData && mounted) {
            // Manejar caso donde el usuario está autenticado pero no tiene perfil
            setAuthState(prev => ({
              ...prev,
              isLoading: false,
              isAuthenticated: false,
              error: "Perfil de usuario no encontrado."
            }));
            stopLoading("AuthProvider");
          }
        } else if (mounted) {
          // No hay sesión activa
          setAuthState(prev => ({
            ...prev,
            isLoading: false
          }));
          stopLoading("AuthProvider");
        }
      } catch (error: unknown) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : "Error desconocido al iniciar sesión"
          }));
          stopLoading("AuthProvider");
        }
      }
    };

    initializeAuth();

    // Configurar listener para cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      startLoading("Cambiando estado de autenticación", "AuthProvider");
      console.log("Auth state changed:", event, session?.user?.id);

      if (session?.user && mounted) {
        try {
          // Obtener perfil del usuario cuando cambia el estado de autenticación
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error("Error fetching profile on auth change:", profileError);
            setAuthState(prev => ({
              ...prev,
              isAuthenticated: false,
              currentUser: null,
              isLoading: false,
              error: "Error al actualizar el estado del perfil."
            }));
            stopLoading("AuthProvider");
            return;
          }

          if (isProfile(profileData) && mounted) {
            // Establecer rol de usuario por defecto
            let userRole: UserRole = 'user';

            // Si el perfil ya tiene un rol válido, usarlo
            if (profileData.role && ['root', 'admin', 'user'].includes(profileData.role)) {
              userRole = profileData.role as UserRole;
            }

            // Asegurar que admin-1 siempre tenga rol root
            if (profileData.id === 'admin-1' && userRole !== 'root') {
              userRole = 'root';
            }

            setAuthState({
              currentUser: {
                id: profileData.id,
                username: profileData.username || '',
                fullName: profileData.full_name || '',
                email: profileData.email || '',
                role: userRole,
                createdAt: profileData.created_at || '',
                lastLogin: profileData.last_login || undefined,
                twoFactorEnabled: profileData.two_factor_enabled || false,
                twoFactorSecret: profileData.two_factor_secret || undefined
              },
              isAuthenticated: true,
              isLoading: false,
              error: null,
              verifying2FA: false
            });
            stopLoading("AuthProvider");
          } else if (!profileData && mounted) {
            // Perfil no encontrado después de un cambio de autenticación
            setAuthState({
              currentUser: null,
              isAuthenticated: false,
              isLoading: false,
              error: "Perfil de usuario no encontrado tras cambio de autenticación.",
              verifying2FA: false
            });
            stopLoading("AuthProvider");
          }
        } catch (error: unknown) {
          console.error("Error updating auth state:", error);
          if (mounted) {
            setAuthState(prev => ({
              ...prev,
              isLoading: false,
              error: error instanceof Error ? error.message : "Error desconocido al actualizar estado"
            }));
            stopLoading("AuthProvider");
          }
        }
      } else if (mounted) {
        // Usuario ha cerrado sesión o la sesión ha expirado
        setAuthState({
          currentUser: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          verifying2FA: false
        });
        stopLoading("AuthProvider");
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const { users, setUsers } = useAuthStorage();
  const { login, logout, createUser, updateUser, deleteUser, getUserList, seedTestUsers } =
    useAuthActions({ users, setUsers, authState, setAuthState });

  const { verify2FACode, generate2FASecret, enable2FA, disable2FA } =
    use2FAActions({ users, setUsers, authState, setAuthState });

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        logout,
        createUser,
        updateUser,
        deleteUser,
        getUserList,
        verify2FACode,
        generate2FASecret,
        enable2FA,
        disable2FA,
        seedTestUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
