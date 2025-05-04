-- Función para crear la tabla de perfiles si no existe
CREATE OR REPLACE FUNCTION public.create_profiles_if_not_exists()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecutada con los privilegios del creador
AS $$
DECLARE
  table_exists boolean;
BEGIN
  -- Verificar si la tabla ya existe
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
  ) INTO table_exists;

  -- Si la tabla no existe, crearla
  IF NOT table_exists THEN
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      username TEXT,
      full_name TEXT,
      email TEXT,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP WITH TIME ZONE,
      intentos_fallidos INTEGER DEFAULT 0,
      bloqueado_hasta TIMESTAMP WITH TIME ZONE
    );

    -- Establecer permisos para la tabla
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Crear política para permitir a usuarios autenticados leer sus propios perfiles
    CREATE POLICY "Users can view their own profile" 
      ON public.profiles FOR SELECT 
      USING (auth.uid() = id);
    
    -- Crear política para permitir a usuarios autenticados actualizar sus propios perfiles
    CREATE POLICY "Users can update their own profile" 
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id);
    
    -- Asegurar que el usuario del servicio Supabase pueda gestionar todos los perfiles
    GRANT ALL ON public.profiles TO postgres, service_role;
    
    -- Asegurar que los usuarios autenticados puedan leer perfiles
    GRANT SELECT ON public.profiles TO authenticated;
    
    -- Crear trigger para insertar automáticamente un nuevo perfil cuando se crea un usuario
    CREATE OR REPLACE FUNCTION public.handle_new_user() 
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (id, username, full_name, email, role)
      VALUES (
        NEW.id, 
        NEW.raw_user_meta_data->>'username', 
        NEW.raw_user_meta_data->>'full_name', 
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
      );
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    -- Crear trigger para los nuevos usuarios
    CREATE OR REPLACE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    
    RETURN TRUE; -- Tabla creada exitosamente
  ELSE
    RETURN FALSE; -- La tabla ya existía
  END IF;
END;
$$;