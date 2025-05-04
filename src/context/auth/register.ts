import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Registra un nuevo usuario en Supabase y crea su perfil
 * El primer usuario automáticamente tendrá rol de root
 */
export async function registerUser(
  email: string, 
  password: string, 
  metadata?: { 
    full_name?: string;
    nombre?: string;
    apellido?: string;
  }
) {
  try {
    console.log("Iniciando registro de nuevo usuario:", email);
    
    // 0. Verificar si hay usuarios existentes
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error("Error al verificar usuarios existentes:", countError);
      toast.error(`Error al verificar usuarios: ${countError.message}`);
      return null;
    }

    const isFirstUser = count === 0;
    console.log(`Es el primer usuario: ${isFirstUser ? 'Sí' : 'No'}`);

    // Datos del perfil
    const userRole = isFirstUser ? 'root' : 'user';
    const fullName = metadata?.full_name || `${metadata?.nombre || ''} ${metadata?.apellido || ''}`.trim() || email;
    const username = email.split('@')[0];
    
    // 1. Crear el usuario en auth.users usando signUp
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
          role: userRole
        }
      }
    });

    if (error) {
      console.error("Error en registro:", error);
      toast.error(`Error al crear usuario: ${error.message}`);
      return null;
    }

    if (!data.user) {
      toast.error("No se pudo crear el usuario");
      return null;
    }

    const userId = data.user.id;
    console.log("Usuario creado en auth con ID:", userId);

    // 2. Crear explícitamente el perfil para asegurar que funcione
    try {
      const profileData = {
        id: userId,
        email,
        username,
        full_name: fullName,
        role: userRole,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };
      
      console.log("Creando perfil con datos:", profileData);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (profileError) {
        console.error("Error al crear perfil:", profileError);
        toast.warning(`Usuario creado pero hubo un problema con el perfil: ${profileError.message}`);
      } else {
        console.log("Perfil creado correctamente");
      }
    } catch (profileError) {
      console.error("Error inesperado al crear perfil:", profileError);
    }

    // 3. Iniciar sesión automáticamente
    console.log("Intentando iniciar sesión automáticamente");
    const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      console.error("Error en login automático:", loginError);
      toast.warning(`Cuenta creada pero no se pudo iniciar sesión automáticamente. Por favor inicia sesión manualmente.`);
    } else {
      console.log("Inicio de sesión automático exitoso");
      toast.success(`¡Bienvenido${isFirstUser ? ', Administrador' : ''}!`);
    }

    // 4. Devolver los datos del usuario (aunque no se haya podido iniciar sesión)
    return {
      user: data.user,
      session: sessionData?.session || null
    };
  } catch (error) {
    console.error("Error inesperado durante el registro:", error);
    toast.error("Error inesperado durante el registro. Por favor, intenta de nuevo.");
    return null;
  }
}