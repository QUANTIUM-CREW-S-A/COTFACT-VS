import React, { useState, ReactNode, useEffect } from "react";
import { UserRole } from "@/types/auth";
import { AuthState, AuthContextType } from "./types";
import { AuthContext } from "./AuthContext"; // Importar AuthContext desde el archivo correcto
import { useAuthStorage } from "./useAuthStorage";
import { useAuthActions } from "./useAuthActions";
import { use2FAActions } from "./use2FAActions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from '@/integrations/supabase/types';
import { useLoading } from "../loading/LoadingContext";

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

// Type guard para validar que profileData es un perfil
function isProfile(obj: unknown): obj is Profile {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Profile).id === 'string'
  );
}

// Clave para guardar la información del perfil en localStorage
const USER_PROFILE_STORAGE_KEY = 'cotfact_user_profile';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { startLoading, stopLoading } = useLoading();
  const [authState, setAuthState] = useState<AuthState>({
    currentUser: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    verifying2FA: false
  });

  // Función para guardar el perfil del usuario en localStorage
  const saveProfileToLocalStorage = (profile: any, role: UserRole) => {
    try {
      const userProfile = {
        id: profile.id,
        username: profile.username || '',
        fullName: profile.full_name || '',
        email: profile.email || '',
        role: role,
        createdAt: profile.created_at || '',
        lastLogin: new Date().toISOString(),
        twoFactorEnabled: profile.two_factor_enabled || false
      };
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(userProfile));
    } catch (error) {
      console.error("Error guardando perfil en localStorage:", error);
    }
  };

  // Función para obtener el perfil del usuario desde localStorage
  const getProfileFromLocalStorage = () => {
    try {
      const storedProfile = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
      return storedProfile ? JSON.parse(storedProfile) : null;
    } catch (error) {
      console.error("Error obteniendo perfil desde localStorage:", error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      startLoading("Verificando sesión de usuario", "AuthProvider");
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (session?.user && mounted) {
          console.log("Sesión activa encontrada:", session.user.email);
          
          // Intentar obtener el perfil del localStorage primero para una carga rápida
          const cachedProfile = getProfileFromLocalStorage();
          
          if (cachedProfile && cachedProfile.id === session.user.id) {
            console.log("Usando perfil en caché para inicio rápido");
            // Usar el perfil en caché para un inicio rápido
            setAuthState({
              currentUser: cachedProfile,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              verifying2FA: false
            });
          }
          
          // De todas formas intentamos obtener el perfil actualizado de la base de datos
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (profileError) {
              console.warn("Error obteniendo perfil, usando datos de sesión:", profileError);
              
              // Incluso con error, si tenemos una sesión válida, mantenemos al usuario autenticado
              if (!cachedProfile) {
                // Crear un perfil básico usando los datos de la sesión
                const basicProfile = {
                  id: session.user.id,
                  username: session.user.email?.split('@')[0] || '',
                  fullName: session.user.user_metadata?.full_name || '',
                  email: session.user.email || '',
                  role: 'user' as UserRole,
                };
                
                setAuthState({
                  currentUser: basicProfile,
                  isAuthenticated: true,
                  isLoading: false,
                  error: null,
                  verifying2FA: false
                });
                
                // Guardar este perfil básico en localStorage para futuros usos
                saveProfileToLocalStorage(basicProfile, 'user');
              }
            } 
            else if (isProfile(profileData) && mounted) {
              // Establecer el rol de usuario predeterminado
              let userRole: UserRole = 'user';

              // Si el perfil ya tiene un rol válido, usarlo
              if (profileData.role && ['root', 'admin', 'user'].includes(profileData.role)) {
                userRole = profileData.role as UserRole;
              }

              // Asegurar que el usuario especial admin-1 siempre tenga rol root
              if (profileData.id === 'admin-1' || profileData.email === 'admin@example.com') {
                userRole = 'root';
              }

              const userProfile = {
                id: profileData.id,
                username: profileData.username || '',
                fullName: profileData.full_name || '',
                email: profileData.email || '',
                role: userRole,
                createdAt: profileData.created_at || '',
                lastLogin: profileData.last_login || new Date().toISOString(),
                twoFactorEnabled: profileData.two_factor_enabled || false,
                twoFactorSecret: profileData.two_factor_secret || undefined
              };
              
              setAuthState({
                currentUser: userProfile,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                verifying2FA: false
              });
              
              // Actualizar el perfil en localStorage
              saveProfileToLocalStorage(profileData, userRole);
            } 
            else if (!profileData && !cachedProfile && mounted) {
              // Si no hay perfil en DB ni en caché, pero hay sesión, intentar crear un perfil básico
              console.log("Sesión válida pero sin perfil, creando perfil básico");
              
              const basicProfile = {
                id: session.user.id,
                username: session.user.email?.split('@')[0] || '',
                fullName: session.user.user_metadata?.full_name || '',
                email: session.user.email || '',
                role: 'user' as UserRole,
              };
              
              // Intentar crear un perfil básico en la base de datos
              try {
                await supabase.from('profiles').insert({
                  id: session.user.id,
                  username: session.user.email?.split('@')[0] || '',
                  full_name: session.user.user_metadata?.full_name || '',
                  email: session.user.email || '',
                  role: 'user'
                });
              } catch (insertError) {
                console.warn("No se pudo crear perfil automáticamente:", insertError);
              }
              
              setAuthState({
                currentUser: basicProfile,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                verifying2FA: false
              });
              
              saveProfileToLocalStorage(basicProfile, 'user');
            }
          } catch (profileFetchError) {
            console.error("Error grave al obtener perfil:", profileFetchError);
            
            // Si hay un error pero teníamos perfil en caché, seguimos con ese
            if (cachedProfile) {
              console.log("Manteniendo sesión con perfil en caché debido a error");
            } else {
              setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: "Error al obtener el perfil de usuario, pero la sesión sigue activa."
              }));
            }
          }
          
        } else if (mounted) {
          // No hay sesión activa
          console.log("No hay sesión activa");
          localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
          setAuthState(prev => ({
            ...prev,
            isLoading: false
          }));
        }
      } catch (error: unknown) {
        console.error("Error inicializando auth:", error);
        if (mounted) {
          // Verificar si hay perfil en caché para mantener sesión en caso de error de conectividad
          const cachedProfile = getProfileFromLocalStorage();
          if (cachedProfile) {
            console.log("Error de conectividad, usando perfil en caché");
            setAuthState({
              currentUser: cachedProfile,
              isAuthenticated: true,
              isLoading: false,
              error: "Error de conectividad, usando datos en caché",
              verifying2FA: false
            });
          } else {
            setAuthState(prev => ({
              ...prev,
              isLoading: false,
              error: error instanceof Error ? error.message : "Error desconocido al iniciar sesión"
            }));
          }
        }
      } finally {
        stopLoading("AuthProvider");
      }
    };

    initializeAuth();

    // Configurar listener para cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        startLoading("Iniciando sesión", "AuthProvider");
        try {
          // Cuando el usuario inicia sesión, obtener su perfil
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.warn("Error al obtener perfil durante cambio de auth:", profileError);
            // Aún así, mantener la sesión con datos básicos
            const basicProfile = {
              id: session.user.id,
              username: session.user.email?.split('@')[0] || '',
              fullName: session.user.user_metadata?.full_name || '',
              email: session.user.email || '',
              role: 'user' as UserRole,
            };
            
            setAuthState({
              currentUser: basicProfile,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              verifying2FA: false
            });
            
            saveProfileToLocalStorage(basicProfile, 'user');
          } else if (isProfile(profileData) && mounted) {
            // Actualizar estado con el perfil obtenido
            let userRole: UserRole = profileData.role as UserRole || 'user';
            
            // Asegurar que admin-1 siempre tenga rol root
            if (profileData.id === 'admin-1' || profileData.email === 'admin@example.com') {
              userRole = 'root';
            }
            
            const userProfile = {
              id: profileData.id,
              username: profileData.username || '',
              fullName: profileData.full_name || '',
              email: profileData.email || '',
              role: userRole,
              createdAt: profileData.created_at || '',
              lastLogin: new Date().toISOString(),
              twoFactorEnabled: profileData.two_factor_enabled || false,
              twoFactorSecret: profileData.two_factor_secret || undefined
            };

            setAuthState({
              currentUser: userProfile,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              verifying2FA: false
            });
            
            // Guardar en localStorage
            saveProfileToLocalStorage(profileData, userRole);
            
            // Actualizar último inicio de sesión en la base de datos
            await supabase
              .from('profiles')
              .update({ last_login: new Date().toISOString() })
              .eq('id', profileData.id);
          }
        } catch (error) {
          console.error("Error actualizando estado de auth:", error);
        } finally {
          stopLoading("AuthProvider");
        }
      } 
      else if (event === 'SIGNED_OUT') {
        // Cuando el usuario cierra sesión, limpiar todo
        localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
        setAuthState({
          currentUser: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          verifying2FA: false
        });
      }
      // Para TOKEN_REFRESHED no hacemos nada especial, se mantiene la sesión
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [startLoading, stopLoading]);

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
