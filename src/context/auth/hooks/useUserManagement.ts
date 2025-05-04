import { AuthState } from "../types";
import { Dispatch, SetStateAction } from "react";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { toast } from "sonner";
import { User, UserRole } from "@/types/auth";

interface UseUserManagementProps {
  authState: AuthState;
  setAuthState: Dispatch<SetStateAction<AuthState>>;
}

export const useUserManagement = ({ authState, setAuthState }: UseUserManagementProps) => {
  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'twoFactorEnabled' | 'twoFactorSecret'>): Promise<boolean> => {
    try {
      console.log("[DEBUG] Iniciando creación de usuario...", userData.email);
      console.log("[DEBUG] Rol del usuario actual:", authState.currentUser?.role);
      
      // Solo usuarios root y admin pueden crear usuarios
      if (authState.currentUser?.role !== 'root' && authState.currentUser?.role !== 'admin') {
        console.log("[DEBUG] Error de permisos: Usuario sin rol adecuado");
        toast.error("No tienes permisos para crear usuarios");
        return false;
      }

      // Validar que los usuarios admin no puedan crear usuarios root
      if (authState.currentUser?.role === 'admin' && userData.role === 'root') {
        console.log("[DEBUG] Error de permisos: Admin intentando crear usuario root");
        toast.error("Solo usuarios root pueden crear otros usuarios root");
        return false;
      }

      console.log("[DEBUG] Intentando registrar usuario en Auth...");
      
      // Crear el usuario en Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password!,
        options: {
          data: {
            username: userData.username,
            full_name: userData.fullName,
            role: userData.role
          }
        }
      });

      if (signUpError) {
        console.error('[DEBUG] Error en signUp:', signUpError);
        console.error('[DEBUG] Código de error:', signUpError.code);
        console.error('[DEBUG] Mensaje de error:', signUpError.message);
        throw new Error(signUpError.message);
      }

      if (!data.user) {
        console.error('[DEBUG] No hay datos de usuario después del signUp');
        throw new Error('No se pudo crear el usuario en Auth');
      }

      console.log("[DEBUG] Usuario creado en Auth correctamente con ID:", data.user.id);
      console.log("[DEBUG] Creando perfil del usuario...");

      // Crear el perfil del usuario
      const profileData = {
        id: data.user.id,
        username: userData.username,
        full_name: userData.fullName,
        email: userData.email,
        role: userData.role,
        created_at: new Date().toISOString(),
        two_factor_enabled: false,
        // Campos adicionales
        nombre: userData.nombre || userData.fullName.split(' ')[0],
        apellido: userData.apellido || userData.fullName.split(' ').slice(1).join(' '),
        activo: true,
        fecha_creacion: new Date().toISOString(),
        creado_por: authState.currentUser?.id
      };
      
      console.log("[DEBUG] Datos de perfil a insertar:", profileData);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData);

      if (profileError) {
        console.error('[DEBUG] Error creando perfil:', profileError);
        console.error('[DEBUG] Código de error perfil:', profileError.code);
        console.error('[DEBUG] Mensaje de error perfil:', profileError.message);
        console.error('[DEBUG] Detalles del error perfil:', profileError.details);
        
        // Si falla la creación del perfil, intentar eliminar el usuario de Auth
        console.log('[DEBUG] Intentando eliminar usuario de Auth debido a error en creación de perfil');
        try {
          await supabaseAdmin.auth.admin.deleteUser(data.user.id);
          console.log('[DEBUG] Usuario eliminado correctamente de Auth');
        } catch (deleteError) {
          console.error('[DEBUG] Error al eliminar usuario de Auth:', deleteError);
        }
        
        throw new Error(`Error al crear el perfil del usuario: ${profileError.message}`);
      }

      console.log('[DEBUG] Usuario creado exitosamente:', userData.username);
      toast.success("Usuario creado con éxito");
      return true;

    } catch (error) {
      console.error('[DEBUG] Error completo creating user:', error);
      const message = error instanceof Error ? error.message : "Error desconocido al crear el usuario";
      console.error('[DEBUG] Mensaje de error final:', message);
      toast.error(message);
      return false;
    }
  };

  const updateUser = async (id: string, userData: Partial<User>): Promise<boolean> => {
    try {
      // Verificar permisos básicos (solo admin y root pueden actualizar)
      if (authState.currentUser?.role !== 'admin' && authState.currentUser?.role !== 'root' && authState.currentUser?.id !== id) {
        toast.error("No tienes permisos para actualizar este usuario");
        return false;
      }
      
      // Obtener el usuario a actualizar para verificar su rol actual
      const { data: userToUpdate, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
        
      if (userError || !userToUpdate) {
        toast.error("Usuario no encontrado");
        return false;
      }
      
      // Restricciones según el rol
      if (userToUpdate.role === 'root' && authState.currentUser?.role !== 'root') {
        toast.error("Solo usuarios root pueden modificar usuarios root");
        return false;
      }
      
      // Admin no puede cambiar a otro admin a rol root
      if (authState.currentUser?.role === 'admin' && 
          userToUpdate.role === 'admin' && 
          userData.role === 'root') {
        toast.error("Solo usuarios root pueden asignar rol root");
        return false;
      }

      // Admin no puede modificar a otros admin
      if (authState.currentUser?.role === 'admin' && 
          userToUpdate.role === 'admin' && 
          id !== authState.currentUser.id) {
        toast.error("Solo puedes modificar tu propio perfil o usuarios audit");
        return false;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: userData.username,
          full_name: userData.fullName,
          email: userData.email,
          role: userData.role,
          nombre: userData.nombre,
          apellido: userData.apellido,
          activo: userData.activo,
          ultima_modificacion: new Date().toISOString(),
          modificado_por: authState.currentUser?.id
        })
        .eq('id', id);

      if (profileError) throw profileError;

      if (id === authState.currentUser?.id) {
        setAuthState(prev => ({
          ...prev,
          currentUser: { ...prev.currentUser!, ...userData }
        }));
      }

      toast.success("Usuario actualizado con éxito");
      return true;

    } catch (error) {
      console.error('Error updating user:', error);
      toast.error("Error al actualizar el usuario");
      return false;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      // Verificar si el usuario actual tiene permisos (debe ser root o admin)
      if (authState.currentUser?.role !== 'root' && authState.currentUser?.role !== 'admin') {
        toast.error("No tienes permisos para eliminar usuarios");
        return false;
      }

      // Obtener el usuario a eliminar
      const { data: userToDelete, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      // Verificar si el usuario existe
      if (userError || !userToDelete) {
        toast.error("Usuario no encontrado");
        return false;
      }

      // No permitir eliminar usuarios root bajo ninguna circunstancia
      if (userToDelete.role === 'root') {
        toast.error("No se puede eliminar un usuario root");
        return false;
      }

      // Los admin solo pueden eliminar usuarios audit, no otros admin
      if (authState.currentUser?.role === 'admin' && userToDelete.role === 'admin') {
        toast.error("Los administradores no pueden eliminar otros administradores");
        return false;
      }

      // Nadie puede eliminar su propia cuenta
      if (id === authState.currentUser.id) {
        toast.error("No puedes eliminar tu propia cuenta");
        return false;
      }

      // Primero, desactivar el usuario (soft delete)
      const { error: deactivateError } = await supabase
        .from('profiles')
        .update({
          activo: false,
          ultima_modificacion: new Date().toISOString(),
          modificado_por: authState.currentUser?.id
        })
        .eq('id', id);
        
      if (deactivateError) {
        console.error('Error deactivating user:', deactivateError);
        throw new Error('Error al desactivar el usuario: ' + deactivateError.message);
      }

      // Eliminar el perfil usando el cliente admin (hard delete opcional)
      if (authState.currentUser?.role === 'root') {
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('id', id);

        if (profileError) {
          console.error('Error deleting profile:', profileError);
          throw new Error('Error al eliminar el perfil del usuario: ' + profileError.message);
        }

        // Eliminar el usuario de auth usando el cliente admin
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
        
        if (authError) {
          console.error('Error deleting auth user:', authError);
          
          // Intentar restaurar el perfil si la eliminación del usuario falla
          try {
            await supabaseAdmin.from('profiles').upsert({
              id,
              created_at: new Date().toISOString(),
              role: userToDelete.role,
              activo: false
            });
          } catch (restoreError) {
            console.error('Error restoring profile:', restoreError);
          }
          
          throw new Error('Error al eliminar el usuario: ' + authError.message);
        }
      }

      toast.success("Usuario eliminado con éxito");
      return true;

    } catch (error) {
      console.error('Error deleting user:', error);
      const message = error instanceof Error ? error.message : "Error al eliminar el usuario";
      toast.error(message);
      return false;
    }
  };

  const getUserList = async (): Promise<User[]> => {
    // Verificar que el usuario tiene algún tipo de permiso para gestionar usuarios
    // (aún mantenemos esta restricción básica para seguridad)
    if (authState.currentUser?.role !== 'admin' && authState.currentUser?.role !== 'root') {
      return [];
    }

    try {
      // Obtenemos todos los usuarios de la base de datos sin filtros adicionales
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      // Convertimos todos los perfiles a objetos de tipo User
      return profiles.map(profile => {
        // Verificar todos los roles posibles
        const userRole: UserRole = (profile.role === 'root' || profile.role === 'admin' || profile.role === 'audit')
          ? profile.role as UserRole
          : 'audit';  // Rol predeterminado si no tiene uno válido

        return {
          id: profile.id,
          username: profile.username,
          fullName: profile.full_name,
          email: profile.email,
          role: userRole,
          createdAt: profile.created_at,
          lastLogin: profile.last_login || undefined,
          twoFactorEnabled: profile.two_factor_enabled,
          twoFactorSecret: profile.two_factor_secret,
          // Agregar campos faltantes para completar la interfaz User
          nombre: profile.nombre || profile.full_name?.split(' ')[0] || '',
          apellido: profile.apellido || (profile.full_name?.split(' ').slice(1).join(' ') || ''),
          tfa_habilitado: profile.tfa_habilitado ?? profile.two_factor_enabled ?? false,
          tfa_metodo: profile.tfa_metodo ?? 'app',
          fecha_creacion: profile.created_at,
          ultimo_acceso: profile.last_login,
          activo: profile.activo !== undefined ? profile.activo : true,
          intentos_fallidos: profile.intentos_fallidos || 0,
        };
      });

    } catch (error) {
      console.error('Error fetching users:', error);
      // En caso de error, mostrar mensaje y devolver array vacío
      toast.error('Error al obtener la lista de usuarios');
      return [];
    }
  };

  const seedTestUsers = async () => {
    const testUsers = [
      {
        email: 'usuario1@ejemplo.com',
        password: 'TestUser123!',
        userData: {
          username: 'usuario1',
          fullName: 'Usuario Ejemplo 1',
          role: 'user' as UserRole
        }
      },
      {
        email: 'usuario2@ejemplo.com',
        password: 'TestUser456!',
        userData: {
          username: 'usuario2',
          fullName: 'Usuario Ejemplo 2',
          role: 'user' as UserRole
        }
      },
      {
        email: 'usuario3@ejemplo.com',
        password: 'TestAdmin789!',
        userData: {
          username: 'usuario3',
          fullName: 'Usuario Ejemplo 3',
          role: 'admin' as UserRole
        }
      }
    ];

    try {
      for (const user of testUsers) {
        const { data, error } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              username: user.userData.username,
              full_name: user.userData.fullName,
              role: user.userData.role
            }
          }
        });

        if (error) {
          console.error(`Error creating user ${user.email}:`, error);
          toast.error(`Error creando usuario ${user.email}`);
        } else {
          toast.success(`Usuario ${user.email} creado exitosamente`);
        }
      }
    } catch (error) {
      console.error('Error seeding test users:', error);
      toast.error('Error al crear usuarios de prueba');
    }
  };

  return {
    createUser,
    updateUser,
    deleteUser,
    getUserList,
    seedTestUsers,
  };
};
